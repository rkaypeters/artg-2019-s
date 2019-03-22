console.log('in class slider');

function RangeSlider(){
    
    //default values, per factory
    let color = '#ccc';
    let sliderValues = [];
    let W = 600;
    let H = 100;
    let margin = {l:20,r:20};
    const internalDispatch = d3.dispatch('slide'); //largest scope possible, accessible in any child scopes
    
    function exports(container){
        //build the DOM elements corresponding to the slider
        //append track, circle, axis to the root dom element
        
        //drag behavior
        const dragBehavior = d3.drag()
            .on('start',function(){
                handle.attr('fill','red');
            })
            .on('end',function(){
                handle.attr('fill',color);
            })
            .on('drag',function(){
                let currentX = d3.event.x;
                if(currentX < 0){
                    currentX = 0
                }else if (currentX > w){
                    currentX = w
                }
                handle.attr('cx',currentX);
                
                const sliderValue = scaleX.invert(currentX);
                internalDispatch.call('slide',null,sliderValue);
                
                });
        
        container.style('width',`${W}px`);
        container.style('height',`${H}px`);
        const w = W - margin.l - margin.r;
        
        //axis
        const scaleX = d3.scaleLinear()
            .range([0,w])
            .domain(d3.extent(sliderValues));
        const axisX = d3.axisBottom()
            .scale(scaleX)
            .tickValues(sliderValues);
        
        
        let svg = container.selectAll('svg')
            .data([1]); //hack to ensure that there is only ever one svg element
        let svgEnter = svg.enter()
            .append('svg');
        
        //from the enter selection, append all necessary DOM elements
        let sliderInner = svgEnter.append('g')
            .attr('class','range-slider-inner');
        sliderInner.append('line').attr('class','track-outer');
        sliderInner.append('line').attr('class','track-inner');
        sliderInner.append('circle').attr('class','drag-handle');
        sliderInner.append('g').attr('class','ticks');
        
        //update
        svg.merge(svgEnter)
            .attr('width',W)
            .attr('height',H);
        sliderInner = svg.merge(svgEnter)
            .select('.range-slider-inner')
            .attr('transform',`translate(${margin.l},${H/2})`);
        sliderInner.select('.track-outer')
            .attr('x1',w)
            .attr('stroke',color)
            .attr('stroke-width','8px');
        sliderInner.select('.track-inner')
            .attr('x1',w)
            .attr('stroke','white')
            .attr('stroke-width','2px')
            .attr('stroke-linecap','round');
        const handle = sliderInner.select('.drag-handle')
            .attr('r',8)
            .attr('fill',color)
            .attr('stroke','white')
            .attr('stroke-width','2px')
            .call(dragBehavior);
        sliderInner.select('ticks');
        
        
    }
    
    //Getter/setter function
    exports.color = function(_){
        if (!_){
            return color; //get - same function can handle both options
        }
        color=_; //set
        return this;
    }
    
    exports.values = function(_){
        if(!_){
            return sliderValues; //get
        }
        sliderValues = _; //set
        return this;
    }
    
    exports.on = function(event,callback){
        //internalDispatch.on('slide',function(slideValue){
            //console.log(slideValue)
        //})
        internalDispatch.on(event,callback);
        return this;
    }
    
    return exports;
    
}

const slider1 = RangeSlider();
slider1.color('#333')
    .values([1,2,3,4,5])
    .on('slide', //event type
        value => console.log(value));//callback function; this is where you hook everything up
//console.log(slider1);

slider1(d3.select('.slider-container'));

//d3.select('.slider-container')

const slider2 = RangeSlider();

//slider1 and slider2 are not equivalent - they are a copy of the inner function in their own scope, unimpacted by the other
