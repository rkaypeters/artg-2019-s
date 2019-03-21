//Prepare DOM canvas
const w = d3.select('.plot').node().clientWidth;
const h = d3.select('.plot').node().clientHeight;
const plot1 = d3.select('#plot-1')
	.style('position','relative')
	.append('svg').attr('width',w).attr('height',h);
const plot1Canvas = d3.select('#plot-1')
	.append('canvas').attr('width',w).attr('height',h)
	.style('position','absolute')
	.style('top',0)
	.style('left',0);
const plot2 = d3.select('#plot-2')
	.style('position','relative')
	.append('svg').attr('width',w).attr('height',h);
const plot2Canvas = d3.select('#plot-2')
	.append('canvas').attr('width',w).attr('height',h)
	.style('position','absolute')
	.style('top',0)
	.style('left',0);

//Dummy data
const NUM_NODES = 1000;
const nodesData = Array.from({length:NUM_NODES}).map(d => {
	return {
		x: Math.random()*w,
		y: Math.random()*h,
		vx: (Math.random()-.5)*.9,
		vy: (Math.random()-.5)*.9,
		r: 3,
		color: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`
	}
});

//EXERCISE 1: Draw basic shapes
//Access the drawing context of the canvas element; "drawing context" == "pen"
const ctx1 = plot1Canvas.node().getContext('2d');

//Drawing shapes 
//Rect
ctx1.fillStyle = 'rgb(255,0,0)';
ctx1.fillRect(0,0,w/2,h/2);
ctx1.fillStyle = 'white';
ctx1.fillRect(0,0,w,h);
ctx1.strokeStyle = 'black';
ctx1.strokeRect(0,0,w/2,h/2);
console.log(ctx1);

//Path
//ctx.beginPath()
ctx1.beginPath();

//path methods
//ctx.moveTo()
//ctx.lineTo()
//ctx.arc()
//ctx.quadraticCurveTo()
//ctx.bezierCurveTo()
ctx1.moveTo(w/2,h/2);
ctx1.lineTo(w,h/2);
ctx1.lineTo(w/2,h);

//ctx.closePath()
ctx1.closePath();
ctx1.fillStyle = 'yellow';
ctx1.fill();

ctx1.beginPath();
ctx1.moveTo(w/2+50,h/2);
ctx1.arc(w/2,h/2,50,0,Math.PI*2);
ctx1.closePath();
ctx1.fillStyle = 'green';
ctx1.fill();
ctx1.strokeStyle = 'red';
ctx1.stroke();

//Arbitrary shape
ctx1.beginPath();
ctx1.moveTo(0,h);
ctx1.quadraticCurveTo(w/2,h/2,w,h);
ctx1.closePath();
ctx1.fillStyle = 'purple';
ctx1.fill();

nodesData.forEach(d => {
    ctx1.beginPath();
    
    ctx1.moveTo(d.x,d.y);
    ctx1.arc(d.x,d.y,d.r,0,Math.PI*2);
    ctx1.closePath();
    ctx1.fillStyle = d.color;
    ctx1.fill();
})


//ctx.stroke()
//ctx.fill()

//EXERCISE 2: use d3.path() to render path commands to <svg>

//EXERCISE 3: animation and performance
renderFrame();

function renderFrame(){
    
    //update nodesData slightly
    nodesData.forEach(d =>{
        d.x += d.vx;
        d.y += d.vy;
        
    if(d.x < 0){
        d.x = w;
    }
    if(d.x > w){
        d.x = 0;
    }
    if(d.y < 0){
        d.y = h;
    }
    if(d.y > h){
        d.y = 0;
    }
    
    ctx1.beginPath();
    
    ctx1.moveTo(d.x,d.y);
    ctx1.arc(d.x,d.y,d.r,0,Math.PI*2);
    ctx1.closePath();
    ctx1.fillStyle = d.color;
    ctx1.fill();     
        
    });
    
    
    requestAnimationFrame(renderFrame);
        

}



