import {nest, hierarchy, treemap, select} from 'd3';

export default function Composition(rootDOM, data){

    let year = 2017;
    
    //exportFunction(rootDOM, data){

        //Internal variables
        const W = rootDOM.clientWidth;
        const H = 500;
        const margin = {t:64, r:64, b:64, l:64};
        const w = W - margin.l - margin.r;
        const h = H - margin.t - margin.b;
        //const YEAR = 2017;

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
            values:dataByYear.get(year)
        };
        //-- Convert to hierarchy structure
        treemapData = hierarchy(treemapData, d => d.values);
        treemapData.sum(d => d.value);
        //-- Layout using treemap
        layout(treemapData);

        //Build DOM
        //Append new <svg> only once with enter/exit/update hack
        const svg = select(rootDOM)
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
            .data(treemapData.descendants().filter(d => d.height < 2), d => d.data.key || d.data.dest_name);

        nodes.exit().remove();

        const nodesEnter = nodes.enter()
            .append('g').attr('class','node');
        nodesEnter.append('rect');
        nodesEnter.append('text');
        const nodesCombined = nodes.merge(nodesEnter);
        nodesCombined
            .transition()
            .attr('transform', d => `translate(${d.x0}, ${d.y0})`);
        nodesCombined
            .select('rect')
            .transition()
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0);
        nodesCombined
            .select('text')
            .attr('transform', d => `translate(${(d.x1-d.x0)/2}, ${(d.y1-d.y0)/2})`)
            .attr('text-anchor','middle')
            .filter(d => (d.x1-d.x0)>30 && d.depth===2)
            .text(d => d.data.key || d.data.dest_name);
        nodesCombined.filter(d => d.depth ===1 )
            .select('rect')
            .style('fill','none')
            .style('stroke','none')
            //.style('stroke','#ccc')
            //.style('stroke-width','1px');
        nodesCombined.filter(d => d.depth ===2 )
            .select('rect')
            .style('fill-opacity', .2)
	
    //}
    //exportFunction.year = function(_){
        //year = _;
        //return this;
    //}
    
    //return exportFunction;
}