/*

PART ONE

import './style.css';

//import {testFunction, var1 as var2} from './testModule'

import * as d3 from 'd3';
// import {function1,function2,function3} from 'd3';
//import {csv} from 'd3';

console.log('index.js');
console.log();

const var1 = 10;

//console.log(testFunction);
console.log(var1);
//console.log(var2);
console.log(d3);*/

import './style.css';
import * as d3 from 'd3';

import {migrationDataPromise,
countryCodePromise,
metadataPromise} from './data';
import lineChart from './viewModules/lineChart';



Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	])
	.then(([migration, countryCode, metadataMap]) => {

		const migrationAugmented = migration.map(d => {

			const origin_code = countryCode.get(d.origin_name);
			const dest_code = countryCode.get(d.dest_name);

			d.origin_code = origin_code;
			d.dest_code = dest_code;

			//Take the 3-digit code, get metadata record
			const origin_metadata = metadataMap.get(origin_code);
			const dest_metadata = metadataMap.get(dest_code);

			if(origin_metadata){
				d.origin_subregion = origin_metadata.subregion;
			}
			if(dest_metadata){
				d.dest_subregion = dest_metadata.subregion;
			}

			return d;
		});
		
        const data = transform("840",migrationAugmented);

		render(data);
    
    //Build UI for <select> menu
    //console.log(countryCode);
    //making an array out of a map
    const countryList = Array.from(countryCode.entries());
    //console.log(countryList);
    
    const menu = d3.select('.nav')
        .append('select')
    
    menu.selectAll('option')
        .data(countryList)
        .enter()
        .append('option')
        .attr('value', d=> d[1])
        .html(d => d[0])
    
    //Define behavior for <select> menu
    menu.on('change',function(){
        //console.log(this.value);
        //console.log(this.selectedIndex);
        
        const code = this.value;
        const idx = this.selectedIndex;
        const display = this.options[idx].innerHTML;
        
        const data = transform(code,migrationAugmented);
        render(data);
        //console.log(data);
        //console.log(display);
    })


});


function transform(code, migration){
    const filteredData = migration.filter(d => d.origin_code === code);

    //group by subregion
    const subregionsData = d3.nest()
        .key(d => d.dest_subregion)
        .key(d => d.year)
        .rollup(values => d3.sum(values, d => d.value))
		.entries(filteredData);
    
    return subregionsData;
}

function render(data){
    
    const charts = d3.select('.chart-container')
        .selectAll('.chart')
        .data(data)//
    const chartsEnter = charts.enter()
        .append('div')
        .attr('class','chart')
    charts.exit().remove();
    
    charts.merge(chartsEnter)
        .each(function(d){
            lineChart(
                d.values,
                this
            );
    });
    
    d3.select('.main')
        .selectAll('.chart') //0 
	   .data(data)
	   .enter()
	   .append('div')
	   .attr('class','chart')
	   .each(function(d){
		  //console.group()
		  //console.log(this);
		  //console.log(d);
		  //console.groupEnd();

		lineChart(
			d.values, //array of 7
			this
		);
	});
    
}


