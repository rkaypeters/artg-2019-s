const redSquare = d3.select('.main')
    .append('div')
    .attr('class','square')
    .style('background','red')
    .datum({key:3});

redSquare
    .on('click',function(d){
        //'event listener'
        console.log('Red square is clicked');
        console.log(this); //'this' -> context of the function -> 'owner'
        console.log(d);
        console.log(d3.event);
        //d3.select(this).transition().style('background','blue')//generally not encouraged
});

/*const blueSquare = d3.select('.main')
    .append('div')
    .attr('class','square')
    .style('background','blue')
    .on('click',function(d){
        console.log('Blue square is clicked');
        console.log(this);
    });

const yellowSquare = redSquare
    .append('div','square')
    .attr('class','square')
    .style('background','yellow')
    .on('click',function(d){
        d3.event.stopPropagation();
        console.log('Yellow square is clicked');
        console.log(this);
        console.log(d3.event);
    })*/

//create a dispatch object that hanles the 'change color' event
const dispatch = d3.dispatch("change:color")//naming is up to you and this can also hand additional events, separated by a comma


for (i=0;i<10;i++){
    const randomColor = `rgb(${255*Math.random()},${255*Math.random()},${255*Math.random()})`
    
    const square = d3.select('.main')
        .append('div')
        .attr('class','square')
        .style('background',randomColor)
        //.on('click',function(){
           //dispatch.call("change:color", randomColor) 
        //});
        .on('click',() => dispatch.call("change:color",null,randomColor));
    
    dispatch.on("change:color." + i,function(color){
        console.log("change color");
        square.style('background',color);
    })
}

dispatch.on("change:color",function(color){
    console.log(color);
    
})



