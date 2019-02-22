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

//Create clobal dispatch object
const globalDispatch = dispatch("change:country");

//Build UI for countryTitle component
const title = select('.country-view')
    .insert('h1', '.composition-container')
    .html('World');

globalDispatch.on('change:country',(code, displayName, migrationData) =>{
    title.html(displayName);
    renderLineCharts(groupBySubregionByYear(code,migrationData));
    //renderComposition(migrationData.filter(d=>d.origin_code === code));
});

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
	
	//Render the view modules
	//renderLineCharts(groupBySubregionByYear("840", migrationAugmented));
    globalDispatch.call('change:country',null,'840','World',migrationAugmented);
	//renderComposition(migrationAugmented.filter(d => d.origin_code === "840"));


	//Build UI for <select> menu
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
		
		//Update other components - removed through dispatch functionality
		//title.html(display);
		//renderLineCharts(groupBySubregionByYear(code, migrationAugmented));
	});

});

function renderLineCharts(data){

	//Find max value in data
	const maxValue = max( data.map(subregion => max(subregion.values, d => d.value)) ) //[]x18

	const lineChart = LineChart()
		.maxY(maxValue)
        .on('year:change',year => console.log(year));

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
				this
			);
		});
}

function renderComposition(data){

	select('.composition-container')
		.each(function(){
			Composition(this, data)
		});

}