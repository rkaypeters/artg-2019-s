import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import {select, max, dispatch} from 'd3';

import {
	migrationDataPromise,
	countryCodePromise,
	metadataPromise
} from './data';
import {
	groupBySubregionByYear
} from './utils';

//View modules
import Composition from './viewModules/Composition';
import LineChart from './viewModules/LineChart';
import Cartogram from './viewModules/Cartogram';

//Create global dispatch object
const globalDispatch = dispatch("change:country","change:year");

//Build UI for countryTitle component
const title = select('.country-view')
	.insert('h1', '.cartogram-container')
	.html('World');

//global variables - not sure if there's a way to do it without this
let currentYear = 2017;
let currentOriginCode = 840;
let cWidth = 800;
let cHeight = 400;

globalDispatch.on('change:country', (code, displayName, migrationData) => {
	title.html(displayName);
	renderLineCharts(groupBySubregionByYear(code, migrationData));
	renderComposition(migrationData.filter(d => d.origin_code === code),currentYear);
	renderCartogram(migrationData.filter(d => d.origin_code === code),currentYear);
    //console.log(currentYear);
    currentOriginCode = code;
});
globalDispatch.on('change:year', (year,migrationData) => {
    //renderComposition()
    //console.log('GlobalDispatch:' +year);
    currentYear = year;
    console.log('change ' + currentYear);
    renderComposition(migrationData.filter(d => d.origin_code === currentOriginCode),year);
    //renderCartogram(migrationData.filter(d => d.origin_code === currentOriginCode),year);
});
//globalDispatch.call('change:year',null,year);

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
            d.origin_lngLat = origin_metadata.lngLat;
        }
        if(dest_metadata){
            d.dest_subregion = dest_metadata.subregion;
            d.dest_lngLat = dest_metadata.lngLat;
        }

        return d;
    });

    //Render the view modules
    globalDispatch.call('change:country',null,"840","World",migrationAugmented);

    //Build UI for <select> country menu
    const countryList = Array.from(countryCode.entries());
    const menu = select('.nav')
        .append('select')
        .attr('class','form-control form-control-sm');
    menu.selectAll('option')
        .data(countryList)
        .enter()
        .append('option')
        .attr('value', d => d[1])
        .html(d => d[0]);

    //Define behavior for <select> menu
    menu.on('change', function(){
        const code = this.value; //3-digit code
        const idx = this.selectedIndex;
        const display = this.options[idx].innerHTML;

        globalDispatch.call('change:country',null,code,display,migrationAugmented);
    });

    //Build UI for <select> year menu
    //yearList should definitely not be hard-coded! I'm just starting where I can...
    const yearList = [1990,1995,2000,2005,2010,2015,2017];
    const yearMenu = select('.nav')
        .append('select')
        .attr('class','form-control form-control-sm');
    yearMenu.selectAll('option')
        .data(yearList)
        .enter()
        .append('option')
        .attr('value', d => d)
        .html(d => d);

    //Define behavior for <select> year menu
    yearMenu.on('change',function(){
        const year = this.value;
        globalDispatch.call('change:year',null,year,migrationAugmented);
    })

});

function renderLineCharts(data){
	//Find max value in data
	const maxValue = max( data.map(subregion => max(subregion.values, d => d.value)) ) //[]x18

	const lineChart = LineChart()
		.maxY(maxValue)
		//.on('year:change', year => console.log(year));
        //.onChangeYear( year => globalDispatch.call('change:year',null,year,migrationAugmented));

	const charts = select('.chart-container')
		.selectAll('.chart')
		.data(data, d => d.key);
	const chartsEnter = charts.enter()
		.append('div')
		.attr('class','chart')
	charts.exit().remove();

	charts.merge(chartsEnter)
		.each(function(d){
			lineChart(
				d.values, 
				this,
				d.key
			);
		});
}

//function renderComposition(data,year){
function renderComposition(data,year){
    //const composition = Composition()
        //.year(year);
    
	select('.composition-container')
		.each(function(){
			Composition(this, data, year);
		});
}

function renderCartogram(data, year){
	select('.cartogram-container')
		.each(function(){
			Cartogram(this, data, cWidth, cHeight, year);
		});
}