import {nest, select, geoMercator, max, scaleSqrt} from 'd3';

//API reference for force layout
//https://github.com/d3/d3-force

export default function Cartogram(rootDOM, data){

	//Internal variables
	const W = rootDOM.clientWidth;
	const H = 600;
	const margin = {t:64, r:64, b:64, l:64};
	const w = W - margin.l - margin.r;
	const h = H - margin.t - margin.b;
	const YEAR = 2017;
	const scaleSize = scaleSqrt().range([3,100]);

	//Data restructuring
	let dataMap = nest()
		.key(d => d.year)
		.entries(data)
		.map(d => [+d.key, d.values]);
	dataMap = new Map(dataMap);
	let dataByYear = dataMap.get(YEAR);
	//Discover max value to set the size of circles
	const maxValue = max(dataByYear, d => d.value);
	scaleSize.domain([0, maxValue]);

	//Layout function:
	//Use geographic representation for cartogram
	const projection = geoMercator()
		.translate([w/2, h/2]);

	//Transform data again, this time giving each data point an xy coordinate
	dataByYear = dataByYear.map(d => {
		const xy = d.dest_lngLat?projection(d.dest_lngLat):[w/2,h/2];
		d.x = xy[0];
		d.y = xy[1];
		return d;
	});

	//Append DOM elements
	const svg = select(rootDOM)
		.classed('cartogram',true)
		.selectAll('svg')
		.data([1]);
	const svgEnter = svg.enter()
		.append('svg');
	svgEnter
		.append('g').attr('class','plot');

	const plot = svg.merge(svgEnter)
		.attr('width', W)
		.attr('height', H)
		.select('.plot')
		.attr('transform', `translate(${margin.l}, ${margin.t})`);

	const nodes = plot.selectAll('.node')
		.data(dataByYear, d => d.dest_code);

	nodes.exit().remove();

	const nodesEnter = nodes.enter()
		.append('g').attr('class','node')
		.attr('transform', d => `translate(${d.x}, ${d.y})`);
	nodesEnter.append('circle')
		.attr('stroke','#333')
		.attr('stroke-width','1px')
		.attr('fill-opacity',.1);
	nodesEnter.append('text')
		.attr('text-anchor','middle');
	const nodesCombined = nodes.merge(nodesEnter);
	nodesCombined
		//.transition()
		.attr('transform', d => `translate(${d.x}, ${d.y})`);
	nodesCombined
		.select('circle')
		.transition()
		.attr('r', d => scaleSize(d.value));
	nodesCombined
		.select('text')
		.filter(d => scaleSize(d.value)>30)
		.text(d => d.dest_name);

}