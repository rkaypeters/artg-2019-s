//const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	//.then(data => data.reduce((acc,v) => acc.concat(v), []));
//const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	//.then(data => new Map(data));
//const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);

const mobstabdataPromise = d3.csv('/school-mobility/data/mobstab18/school.csv',parseMobstab);
const metadataPromise = d3.csv('/school-mobility/data/sch_metadata.csv',parseMetadata);
const geodataPromise = d3.csv('/school-mobility/data/RI_Schools_coordinates_Mar2019.csv',parseGeodata);

function parseMobstab(d){
    return{
        schyear: d.schYear,
        distcode: d.distcode,
        distname: d.distname,
        schcode: d.schcode,
        schname: d.schname,
        gradelevel: d.gradelevel,
        adm: d.adm,
        tot_enrolls: d.tot_enrolls,
        enrolls: d.enrolls,
        exits: d.exits,
        enrolls_yr: d.enrolls_yr,
        mobRate: d.mobRate,
        mobRate1: d.mobRate1,
        stabRate: d.stabRate
    }
}

function parseMetadata(d){
    return{
        schcode: d.SCH_CODE,
        schname: d.SCH_NAME,
        schname30: d.SCH_NAME30,
        schname15: d.SCH_NAME15,
        city: d.sch_city,
        lowGrade: d.SCH_LOW_GRADE,
        highGrade: d.SCH_HIGH_GRADE,
        status: d.SCH_STATUS,
        charter: d.SCH_CHARTER,
        magnet: d.SCH_MAGET,
        title1: d.SCH_TITLE1,
        gradeCfg: d.GRADECFG,
        distcode: d.DISTCODE,
        pk12: d.SCH_PK12,
        stateOp: d.SCH_STATE_OPERATED,
        adminSite: d.SCH_ADMINSITE
    }
    
    delete d.SCH_ADD1;
    delete d.SCH_ADD2;
    delete d.SCH_STATE;
    delete d.SCH_ZIP;
    delete d.EFFECTIVE_START_DATE;
    delete d.EFFECTIVE_END_DATE;
    delete d.OPENDATE;
    delete d.CLOSEDATE;
    
}

function parseGeodata(d){
    return{
        schcode: d.SCH_CODE,
        schname: d.SCH_NAME,
        city: d.SCH_CITY,
        zip: d.SCH_ZIP,
        geoAmentity: d.geocode_amentity,
        //lng: d.Longitude_geocode,
        //lat: d.Latitude_geocode
        lngLat: [+d.Longitude_geocode, +d.Latitude_geocode]
    }
    
    delete d.DISTCODE;
    delete d.School_address_for_geocode;
    delete d.SCH_STATE;
    delete d.SCH_STATUS;
    delete d.SCH_LEVEL_code;
    delete d.school_level;
    delete d.School_type_code;
    delete d.School_type;
    delete d.Update;
    delete d.updated_by;
}

Promise.all([
    mobstabdataPromise,metadataPromise,geodataPromise]).then(([mobstab,metadataSch,geodata]) => {
                                              
    console.log(metadataSch);
    console.log(mobstab);
    console.log(geodata);
    
    const admin_tmp = metadataSch.map(d => {
				return [d.schcode, d]
			});
    const adminMap = new Map(admin_tmp);
    //console.log(adminMap);
    
    const mobstab_sch = mobstab
        .filter(d => d.schname != '')
        .map(d => {
        //console.log()
        //console.log(adminMap.get(d.schcode));
        const md = adminMap.get(d.schcode);
        //console.log(d.schcode);
        d.adminSite = md.adminSite;
        
        return d;
    })
        .filter(d => d.adminSite == 'N');
    
    //console.log(mobstab_sch);
    drawBarChart(d3.select('.overview').node(), mobstab_sch);
    drawMap(d3.select('.map').node(),geodata);
}
    
)

function drawBarChart(rootDom,data){
    
    const w = rootDom.clientWidth;
    //const h = rootDom.clientHeight;
    
    const plot = d3.select(rootDom)
        .append('svg')
        .attr('width', w)
        .attr('height', 100)
        .append('g'); //adds g element in svg
    
    const nodes = plot.selectAll('.node')
        .data(data,d => d.key);
    const nodesEnter = nodes.enter().append ('g')
        .attr('class','node')
    nodes.merge(nodesEnter)
		.attr('transform', d => {
			//const xy = projection(d.origin_lngLat);
			return `translate(${d.mobRate1*w/100}, 50)`;
		})//not sure what this does
    nodesEnter.append('circle');
    nodes.merge(nodesEnter)
        .attr('x', d => d.mobRate1)
        .select('circle')
		//.attr('r', d => scaleSize(d.total))
        .attr('r', 10)
		.style('fill-opacity', .03)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2) ;
    
    //console.loge(nodes);
    
}

function drawMap(rootDom,data){
    const w = rootDom.clientWidth;
    const h = rootDom.clientHeight;
    
    const projection_tm = d3.geoMercator()
    
    const minLng = d3.min(data, function(d){
        return d.lngLat[0];
    })
    const maxLng = d3.max(data, function(d){
        return d.lngLat[0];
    })
    const minLat = d3.min(data, function(d){
        return d.lngLat[1];
    })
    const maxLat = d3.max(data, function(d){
        return d.lngLat[1];
    })
    
    console.log(minLng);
    console.log(maxLng);
    
    console.log(projection_tm([minLng,minLat]));
    console.log(projection_tm([maxLng,maxLat]));
    
    const scaleX = d3.scaleLinear()
        .domain([projection_tm([minLng,minLat])[0],projection_tm([maxLng,maxLat])[0]])
        .range ([5,w-5]);
    
    console.log(scaleX(289));
    
    const projection = d3.geoMercator()
        .scale(40000)
        .center([(maxLng+minLng)/2,(maxLat+minLat)/2])
        //.center(289,127)
        .translate([w/2,h/2]);
    
    const plot = d3.select(rootDom)
        .append('svg')
        .attr('width', w)
        .attr('height', 1000)
        .append('g');
    
    const nodes = plot.selectAll('.node')
        .data(data,d => d.key);
    const nodesEnter = nodes.enter().append ('g')
        .attr('class','node');
    nodesEnter.append('circle');
    
    nodes.merge(nodesEnter)
        .filter(d => d.lngLat)
		.attr('transform', d => {
			const xy = projection(d.lngLat);
			return `translate(${xy[0]}, ${xy[1]})`;
            console.log(xy[0] + ' ' + xy[1]);
        });
    nodes.merge(nodesEnter)
        //.attr('x', d => d.mobRate1)
        .select('circle')
		//.attr('r', d => scaleSize(d.total))
        .attr('r', 10)
		.style('fill-opacity', .3)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2) ;
}





/*//Import all data via parallel promises
Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	]).then(([migration, countryCode, metadata]) => {  

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
	const projection = d3.geoMercator()
		.translate([w/2, h/2]);

	//Scaling function for the size of the cartogram symbols
	//Assuming the symbols are circles, we use a square root scale
	const scaleSize = d3.scaleSqrt().domain([0,1000000]).range([5,50]);

	//Complete the rest of the code here
	//Build the DOM structure using enter / exit / update
    
    const plot = d3.select(rootDom)
        .append('svg') //adds svg element in main then full-width-catogram
        .attr('width', w)
        .attr('height', h)
        .append('g'); //adds g element in svg
    
    const nodes = plot.selectAll('.node')
        .data(data,d => d.key); //not sure what this does
    const nodesEnter = nodes.enter().append ('g')
        .attr('class','node'); //now there's a g node for each origin country
    nodesEnter.append('circle');
    nodesEnter.append('text').attr('text-anchor','middle');
    //now each node has circle and text elements
    
    nodes.merge(nodesEnter)
		.filter(d => d.lngLat)
		.attr('transform', d => {
			const xy = projection(d.origin_lngLat);
			return `translate(${xy[0]}, ${xy[1]})`;
		})//not sure what this does
    nodes.merge(nodesEnter)
		.select('circle')
		.attr('r', d => scaleSize(d.total))
		.style('fill-opacity', .03)
		.style('stroke', '#000')
		.style('stroke-width', '1px')
		.style('stroke-opacity', .2) //gives the circle visual elements
    nodes.merge(nodesEnter)
		.select('text')
		.filter(d => d.value > 1000000)
		.text(d => d.origin_name)
		.style('font-family', 'sans-serif')
		.style('font-size', '10px')


}*/
