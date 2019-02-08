import * as d3 from 'd3';

//Drawing line chart based on serial x-y data
//Function "signature": what arguments are expected, how many, and what they should look like
function lineChart(data, rootDOM){

	//data
	//[{}, {}, {}...]x7

	const W = rootDOM.clientWidth;
	const H = rootDOM.clientHeight;
	const margin = {t:32, r:32, b:64, l:64};
	const innerWidth = W - margin.l - margin.r;
	const innerHeight = H - margin.t - margin.b;

	const scaleX = d3.scaleLinear().domain([1985,2020]).range([0, innerWidth]);
	const scaleY = d3.scaleLinear().domain([0, 250000]).range([innerHeight, 0]);

	//take array of xy values, and produce a shape attribute for <path> element
	const lineGenerator = d3.line()
		.x(d => scaleX(+d.key))
		.y(d => scaleY(d.value)); //function
	const areaGenerator = d3.area()
		.x(d => scaleX(+d.key))
		.y0(innerHeight)
		.y1(d => scaleY(d.value));

	const axisX = d3.axisBottom()
		.scale(scaleX)
		.tickFormat(function(value){ return "'"+String(value).slice(-2)})

	const axisY = d3.axisLeft()
		.scale(scaleY)
		.tickSize(-innerWidth)
		.ticks(3)

	const svg = d3.select(rootDOM)
		.append('svg')
		.attr('width', W)
		.attr('height', H);
	const plot = svg.append('g')
		.attr('class','plot')
		.attr('transform', `translate(${margin.l}, ${margin.t})`);

	plot.append('path')
		.attr('class','line')
		.datum(data)
		//some visual shape i.e. geometry, "d"
		.attr('d', data => lineGenerator(data))
		.style('fill','none')
		.style('stroke','#333')
		.style('stroke-width','2px')

	plot.append('path')
		.attr('class','area')
		.datum(data)
		.attr('d', data => areaGenerator(data))
		.style('fill-opacity',0.03)

	plot.append('g')
		.attr('class','axis axis-x')
		.attr('transform',`translate(0, ${innerHeight})`)
		.call(axisX)

	plot.append('g')
		.attr('class','axis axis-y')
		.call(axisY);

}

export default lineChart;
