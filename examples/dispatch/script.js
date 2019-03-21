const redSquare = d3.select('.main')
	.append('div')
	.attr('class','square')
	.style('background','red')
	.datum({key:4})

redSquare
	.on('click', function(d){
		//"event listener"
		console.log('Red square is clicked');
		console.log(this); //"this" --> context of the function --> "owner" of the function
		console.log(d);
		console.log(d3.event);
	});

//Create a dispatch object
//it's going to handle the "change color" event
const dispatch = d3.dispatch("change:color", "update:position")

for(let i = 0; i < 10; i++){
	const randomColor = `rgb(${255*Math.random()}, ${255*Math.random()}, ${255*Math.random()})`

	const square = d3.select('.main')
		.append('div')
		.attr('class','square')
		.style('background', randomColor)
		.on('click', () => dispatch.call("change:color", null, randomColor));

	dispatch.on('change:color.'+i, function(color){
		console.log('change color');
		square.style('background', color);
	});
}

dispatch.on('change:color', function(color){
	console.log(color);
})

//Second example, demonstrating the necessity of the dispatch pattern
const svg = d3.select('.main')
	.append('svg')
	.attr('width',960)
	.attr('height',600)
	.style('padding',0)
	.style('margin',0);

const btn = d3.select('.main')
	.insert('button','svg')
	.on('click', () => generateNewShape(svg))
	.html('Add new shape');

function generateNewShape(rootDOM){
	const color = `rgb(${255*Math.random()}, ${255*Math.random()}, ${255*Math.random()})`;
	const x = Math.random()*960;
	const y = Math.random()*600;
	let el;

	if(Math.random()>.5){
		el = rootDOM.append('circle')
			.attr('r',10)
			.style('fill',color);
	}else{
		el = rootDOM.append('rect')
			.attr('width',20)
			.attr('height',20)
			.style('fill',color);
	}
	el.attr('transform', `translate(${x},${y})`)
		.on('click', () => dispatch.call("change:color",null,color));
	dispatch.on('change:color.'+Math.floor(Math.random()*10000), color => el.style('fill', color));

}