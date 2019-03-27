//Merging between csv's was no problem with this assignment but the cartogram was tough. It took a lot to understand the components of the enter exit update pattern and on top of that I had file issues with it not refreshing, etc.
//I was able to fix many of the countries that didn't look up correctly due to leading 0s. The remaining ones are not in the geography data.

const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);


//Import all data via parallel promises
Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	]).then(([migration, countryCode, metadata]) => {

    //DATA MANIPULATION

    //Convert metadata to a metadata map
    const metadata_tmp = metadata.map(d => {
            return [d.iso_num, d]
        });
    const metadataMap = new Map(metadata_tmp);

    //Let's pick a year, say 2000, and filter the migration data
    const migration_2000 = migration.filter(d => d.year === 2000);
    //console.log(migration_2000);

    //YOUR CODE HERE
    //Nest/group migration_2000 by origin_country
    //Then sum up the total value, using either nest.rollup or array.map
    let migration_origin_by_country = d3.nest()
        .key(d => d.origin_name)
        .entries(migration_2000)
        .map( d=>{
            return{
                origin_name: d.key,
                total: d3.sum(d.values, e => e.value)
        }
    });
    //console.log(migration_origin_by_country);
    //COMPLETE HERE

    //YOUR CODE HERE
    //Then, join the transformed migration data to the lngLat values in the metadata
    
    //fix leading 0s for countryCode
     countryCode.forEach(function(v, key, map){
        if(v.length == 2){
            countryCode.set(key,'0' + v);
        }
         if(v.length ==1){
             countryCode.set(key,'00' + v);
         }
        //console.log(v);
    })
    
    //console.log(metadataMap);
    //console.log(countryCode);
    const migration_origin_by_country_aug = migration_origin_by_country.map(d =>{
        const origin_code = countryCode.get(d.origin_name);

        d.origin_code = origin_code;

        const origin_metadata = metadataMap.get(origin_code);
        if(!origin_metadata){
        console.log(`lookup failed for ` + d.origin_name + ' ' + d.origin_code);
        };

        if(origin_metadata){
            d.origin_lngLat = origin_metadata.lngLat;
        };

        return d;
    });
    console.log(migration_origin_by_country_aug);


    //REPRESENT
    drawCartogram(d3.select('.cartogram').node(), migration_origin_by_country_aug);

	})

//YOUR CODE HERE
//Complete the drawCartogram function
//Some of the functions related to geographic representation have already been implemented, so feel free to use them
function drawCartogram(rootDom, data){

	//measure the width and height of the rootDom element
	const w = rootDom.clientWidth;
	const h = rootDom.clientHeight;

	//projection function: takes [lng, lat] pair and returns [x, y] coordinates
	const projection = d3.geoMercator() //sets up the projection
		.translate([w/2, h/2]);

	//Scaling function for the size of the cartogram symbols
	//Assuming the symbols are circles, we use a square root scale
	const scaleSize = d3.scaleSqrt().domain([0,1000000]).range([5,50]);

	//Complete the rest of the code here
	//Build the DOM structure using enter / exit / update
    
    const plot = d3.select(rootDom)
        .append('svg') //adds svg element in main then full-width-catogram
        .attr('width', w) //attributes of svg element
        .attr('height', h)
        .append('g'); //adds g element in svg
    
    const nodes = plot.selectAll('.node') //creates nodes to represent all nodes at this point
        .data(data,d => d.key); //references all of the elements in data
    const nodesEnter = nodes.enter().append ('g')
        .attr('class','node'); //now there's a g node for each origin country
    nodesEnter.append('circle');
    nodesEnter.append('text').attr('text-anchor','middle');
    //now each node has circle and text elements
    
    nodes.merge(nodesEnter)
		.filter(d => d.origin_lngLat) //grabs the elements in nodes and nodesEnter with origin geo coordinates
		.attr('transform', d => {
			const xy = projection(d.origin_lngLat); //applies projection to each lngLat pair
			return `translate(${xy[0]}, ${xy[1]})`;
		})
    //console.log(nodes.merge(nodesEnter));
    nodes.merge(nodesEnter)
		.select('circle')
		.attr('r', d => scaleSize(d.total)) //sets the circle radius to represent a scaled version of the number of emigrants
		.style('fill-opacity', .03)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2) //gives the circle visual elements
    nodes.merge(nodesEnter)
		.select('text')
		.filter(d => d.total > 1000000) //labels just those with at least 1000000 emigrants
		.text(d => d.origin_name)
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')

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
		d.Code
	]
}

function parseMigrationData(d){
	if(+d.Code >= 900) return;

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	const year = +d.Year
	
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