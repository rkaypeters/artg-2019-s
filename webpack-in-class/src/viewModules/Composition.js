import {nest, hierarchy, treemap, select} from 'd3';

export default function Composition(rootDOM, data){

	//Internal variables
	const W = rootDOM.clientWidth;
	const H = 500;
	const margin = {t:64, r:64, b:64, l:64};
	const w = W - margin.l - margin.r;
	const h = H - margin.t - margin.b;
	const YEAR = 2017;

	//Set up a treemap
	const layout = treemap().size([w,h])
		.paddingInner(1)
		.paddingOuter(10)

	//Perform additional data transformation
	//-- Nest by year (and by subregion)
	//-- Convert to a Map so we can easily switch between years
	let dataByYear = nest()
		.key(d => d.year)
		.key(d => d.dest_subregion)
		.entries(data)
		.map(d => [+d.key, d.values]);
	dataByYear = new Map(dataByYear);
	//-- Convert to a treemap structure
	let treemapData = {
		key:'root',
		values:dataByYear.get(YEAR)
	};
	//-- Convert to hierarchy structure
	treemapData = hierarchy(treemapData, d => d.values);
	treemapData.sum(d => d.value);
	//-- Layout using treemap
	layout(treemapData);

	console.log(treemapData);

	//Build DOM
	const svg = select(rootDOM)
		.append('svg')
		.attr('width', W)
		.attr('height', H);
	const plot = svg
		.append('g')
		.attr('transform', `translate(${margin.l}, ${margin.t})`);
	const nodes = plot.selectAll('.node')
		.data(treemapData.descendants().filter(d => d.height < 2), d => d.data.key);
	const nodesEnter = nodes.enter()
		.append('g').attr('class','node');
	nodesEnter.append('rect');
	nodesEnter.append('text');
	const nodesCombined = nodes.merge(nodesEnter);
	nodesCombined
		.attr('transform', d => `translate(${d.x0}, ${d.y0})`)
		.select('rect')
		.attr('width', d => d.x1 - d.x0)
		.attr('height', d => d.y1 - d.y0);
	nodesCombined
		.select('text')
		.text(d => d.data.key);
	nodesCombined.filter(d => d.depth ===1 )
		.select('rect')
		.style('fill','none')
		.style('stroke','#ccc')
		.style('stroke-width','1px')
}