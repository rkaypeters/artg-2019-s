import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import {select, max} from 'd3';

import {
	migrationDataPromise,
	countryCodePromise,
	metadataPromise
} from './data';
import {
	groupBySubregionByYear
} from './utils';
import LineChart from './viewModules/lineChart';

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
	
	//Migration from the US (840) to any other place in the world
	//filter the larger migration dataset to only the subset coming from the US
	const data = groupBySubregionByYear("840", migrationAugmented);

	//Render the charts
	render(data);

	//Build UI for <select> menu
	const countryList = Array.from(countryCode.entries());
	const menu = select('.nav')
		.append('select')
        .attr('class','form-control form-control-sm')
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

		const data = groupBySubregionByYear(code, migrationAugmented);
		render(data);

	});


});

function render(data){
	
    //find max value in data
    console.log(data);
    
    //data.map(d => d3.max(d.values, d => d.value))
    const maxValue = max(data.map(subregion => max(subregion.values, d => d.value)))
    console.log(maxValue);
    
    //const lineChart = LineChart(maxValue);
    
    const lineChart = LineChart()
        .maxY(maxValue);
    
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