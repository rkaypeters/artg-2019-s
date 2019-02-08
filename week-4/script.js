const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);

Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	])
	.then(([migration, countryCode, metadata]) => {

		//Convert metadata to a map
		const metadata_tmp = metadata.map(a => {
			return [a.iso_num, a]
		});
		const metadataMap = new Map(metadata_tmp);

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
		const migrationFiltered = migrationAugmented.filter(d => d.origin_code === "840"); //array of 1145 individual flows

		//group by subregion
		const subregionsData = d3.nest()
			.key(d => d.dest_subregion)
			.key(d => d.year)
			.rollup(values => d3.sum(values, d => d.value))
			.entries(migrationFiltered);

		d3.select('.main')
			.selectAll('.chart') //0 
			.data(subregionsData)
			.enter()
			.append('div')
			.attr('class','chart')
			.each(function(d){
				console.group()
				console.log(this);
				console.log(d);
				console.groupEnd();

				lineChart(
					d.values, //array of 7
					this
				);
			})


	})

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


//Utility functions for parsing metadata, migration data, and country code
function parseMetadata(d){
	return {
		iso_a3: d.ISO_A3,
		iso_num: d.ISO_num,
		developed_or_developing: d.developed_or_developing,
		region: d.region,
		subregion: d.subregion,
		name_formal: d.name_formal,
		name_display: d.name_display,
		lngLat: [+d.lng, +d.lat]
	}
}

function parseCountryCode(d){
	return [
		d['Region, subregion, country or area'],
		d.Code.padStart(3, '0')
	]
}

function parseMigrationData(d){

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	const year = +d.Year

	if(+d.Code >= 900 || dest_name === '') return;
	
	delete d.Year;
	delete d['Sort order'];
	delete d['Major area, region, country or area of destination'];
	delete d.Notes;
	delete d.Code;
	delete d['Type of data (a)'];
	delete d.Total;

	for(let key in d){
		const origin_name = key;
		const value = d[key];

		if(value !== '..'){
			migrationFlows.push({
				origin_name,
				dest_name,
				year,
				value: +value.replace(/,/g, '')
			})
		}
	}

	return migrationFlows;
}