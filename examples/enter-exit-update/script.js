const w = d3.select('.plot').node().clientWidth;
const h = d3.select('.plot').node().clientHeight;

//Prepare <svg> canvases
const plot1 = d3.select('#plot-1').append('svg').attr('width',w).attr('height',h);
const plot2 = d3.select('#plot-2').append('svg').attr('width',w).attr('height',h);
const plot3 = d3.select('#plot-3').append('svg').attr('width',w).attr('height',h);
const plot4 = d3.select('#plot-4').append('svg').attr('width',w).attr('height',h);

updatePlot1(generateSimpleData());
updatePlot3(generateNestedData());

//Event listeners
d3.select('#generate-simple-data-btn')
	.on('click', () => {

		console.group('Update simple data');
		
		const data = generateSimpleData();
		console.log(data);
		updatePlot1(data);
		updatePlot2(data); //YOU NEED TO COMPLETE THIS FUNCTION

		console.groupEnd();

	});

d3.select('#generate-nested-data-btn')
	.on('click', () => {

		console.group('Update nested data');

		const data = generateSimpleData();
		updatePlot3(data);
		updatePlot4(data); //YOU NEED TO COMPLETE THIS FUNCTION

		console.groupEnd();

	});

function updatePlot1(data){

	//UPDATE SELECTION
	const nodes = plot1.selectAll('.node')
		.data(data, d => d.name);
	nodes.select('circle')
		//.transition()
		.style('fill','green'); //circles in the UPDATE selection are black; note the use of .transition

	//ENTER SELECTION
	const nodesEnter = nodes.enter()
		.append('g').attr('class', 'node');
	nodesEnter.append('circle')
		.style('fill', 'yellow'); //circles in the ENTER selection are colored differently
	nodesEnter.append('text')
		.attr('text-anchor', 'middle');

	//UPDATE + ENTER
	//Both of their 'transform' attributes are the set the same way
	//so we merge them
	nodes.merge(nodesEnter)
		.transition()
		.attr('transform', d => `translate(${d.x}, ${d.y})`);
	nodes.merge(nodesEnter)
		.select('text')
		.text(d => d.name);
	nodes.merge(nodesEnter)
		.select('circle')
		.transition()
		.attr('r', d => d.value);

	//EXIT SELECTION
	//nodes.exit().remove();
	nodes.exit()
		.select('circle')
		.style('fill','red');
}

function updatePlot2(data){

	console.group('Update plot 2');
	//YOUR CODE HERE
	const nodes = plot2.selectAll('.node') //selection of size of 0
		.data(data, d => d.name); //update selection

	const nodesEnter = nodes.enter()
		.append('g')
		.attr('class','node');

	const nodesCombined = nodes.merge(nodesEnter);

	const nodesExit = nodes.exit();

	//nodes selection size?
	nodes.select('circle')
		.attr('fill', 'green');

	nodesExit.select('circle')
		.attr('fill', 'red');

	nodesEnter
		.append('circle')
		.attr('fill','yellow');
	nodes.merge(nodesEnter)
		.select('circle')
		.transition()
		.attr('r', d => d.value)

	nodesEnter
		.append('text')
		.attr('text-anchor', 'middle')
	nodes.merge(nodesEnter)
		.select('text')
		.text(d => d.name)

	nodes.merge(nodesEnter)
		.transition()
		.attr('transform', d => `translate(${d.x}, ${d.y})`);


	console.groupEnd();

}

function updatePlot3(data){
}

function updatePlot4(data){
	//YOUR CODE HERE
}


//Functions for generating updated data
//You don't need to know this, 
//but do make sure you understand what the output of these functions look like
function generateSimpleData(){
	const entities = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
	let subset = new Set();

	//Randomly shuffle a subset of the entities
	for(let i = 0; i < entities.length; i++){
		subset.add(entities[Math.floor(Math.random()*entities.length)]);
	}

	return Array.from(subset)
		.map(d => ({
			name: d,
			x: Math.random()*w,
			y: Math.random()*h,
			value: Math.random()*20+5
		}))
}

function generateNestedData(){
	return [
		{
			id: 'team-1',
			values: generateSimpleData()
		},
		{
			id: 'team-2',
			values: generateSimpleData()
		}
	]
}

