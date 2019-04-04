/// Promises for csv's

const mobstabdataPromise = d3.csv('/school-mobility/data/mobstab18/school.csv',parseMobstab);
const metadataPromise = d3.csv('/school-mobility/data/sch_metadata.csv',parseMetadata);
const geodataPromise = d3.csv('/school-mobility/data/RI_Schools_coordinates_Mar2019.csv',parseGeodata);
const schEntersPromise = d3.csv('/school-mobility/data/sch_enters_data_0809_1718.csv',parseEnterdata);



//// Parse functions

function parseEnterdata(d){
    return{
        reportID: d.reportID,
        schcode_origin: d.schcode_origin_enter,
        schcode_dest: d.schcode_dest_enter,
        enters: +d.enters
    }
}

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



//// The bulk of it - after the promises

Promise.all([
    mobstabdataPromise,metadataPromise,geodataPromise,schEntersPromise]).then(([mobstab,metadataSch,geodata,entersdata]) => {
                                              
    //console.log(metadataSch);
    //console.log(mobstab);
    //console.log(geodata);
    //console.log(entersdata);
    
    const meta_tmp = metadataSch.map(d => {
				return [d.schcode, d]
			});
    const metaMap = new Map(meta_tmp);
    //console.log(metaMap);
    
    myProjection(d3.select('.network').node(),geodata); //still need to set up network DOM dimentions
    //console.log(geodata);
    
    const geo_tmp = geodata.map(d => {
        return[d.schcode,d]
    });
    const geoMap = new Map(geo_tmp);
    //console.log(geoMap);
    
    //console.log(entersdata);
    
    const enters1718 = entersdata.filter(d => d.reportID ==77)
        .filter(d => d.schcode_dest != ' ')
        .filter(d => d.schcode_origin != d.schcode_dest)
        .map(d => {
        const md = metaMap.get(d.schcode_dest);
        d.adminSite_dest = md.adminSite;
        d.distcode_dest = md.distcode;
        d.schname30_dest = md.schname30;
        return d;
    })
        .filter(d => d.adminSite_dest == 'N')
        .map(d => {
            const gd = geoMap.get(d.schcode_dest);
            if(gd){
                d.lngLat_dest = gd.lngLat;
                d.xy_dest = gd.xy;
            }
            const go = geoMap.get(d.schcode_origin);
            if(go){
                d.lngLat_origin = go.lngLat;
                d.xy_origin = go.xy;
            }
            return d;
            });
        
    console.log(enters1718);
    

    
    const mobstab_sch = mobstab
        .filter(d => d.schname != '')
        .map(d => {
        const md = metaMap.get(d.schcode);
        d.adminSite = md.adminSite;
        
        return d;
    })
        .filter(d => d.adminSite == 'N');
    
    //console.log(mobstab_sch);
    drawBarChart(d3.select('.overview').node(), mobstab_sch);
    drawMap(d3.select('.map').node(),geodata);
    
    const nodesData = networkSetup(enters1718)[0];
    const linksData = networkSetup(enters1718)[1]; //doesn't seem like the most efficient way to do this, but seems to work...
    
    console.log(nodesData);
    console.log(linksData);
    
    
}
    
)


// broke the prep of nodes and links out into its own function

function networkSetup(data){
    
    const nodesData = new Map();
    const linksData = [];
    
    data.forEach(d => {
        const newLink = {
            value: d.enters
        };
        
        if(!nodesData.get(d.schcode_dest)){
            const newNode = {
                schcode: d.schcode_dest,
                xy: d.xy_dest,
                totalEnters: newLink.value
            };
            nodesData.set(d.schcode_dest,newNode);
            newLink.target = newNode;
        }else{
            const existingNode = nodesData.get(d.schcode_dest);
            existingNode.totalEnters += newLink.value;
            newLink.target = existingNode;
        };
        
        if(!nodesData.get(d.schcode_origin)){
            const newNode = {
                schcode: d.schcode_origin,
                xy: d.xy_origin,
                totalEnters: 0
            };
            nodesData.set(d.shcode_origin,newNode);
            newLink.source = newNode;
        }else{
            const existingNode = nodesData.get(d.schcode_origin);
            newLink.source = existingNode;
        }
        linksData.push(newLink);  
    })
    
    //console.log(nodesData);
    //console.log(linksData);
    
    return[nodesData,linksData];
    
}





//This isn't actually the bar chart; it's just the dots to practicing displaying this for now.

function drawBarChart(rootDom,data){
    
    const w = rootDom.clientWidth;
    //const h = rootDom.clientHeight;
    
    const plot = d3.select(rootDom)
        .append('svg')
        .attr('width', w)
        .attr('height', 100)
        .append('g'); //adds g element in svg
    
    const nodes = plot.selectAll('.node')
        .data(data,d => d.key); //what is this
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


// returns xy, added to the objects for an array data, with ojbect property lndLat, baed on rootDom specifications

function myProjection(rootDom,data){
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
    
    const projection = d3.geoMercator()
        .scale(45000)
        .center([(maxLng+minLng)/2,(maxLat+minLat)/2+.2])
        //.center(289,127)
        .translate([w/2,h/2]);
    
    //console.log(data);
    
    data.forEach(d=>
                 {d.xy = projection(d.lngLat);
                 }
    );
    //console.log(data);
    return(data);
    
}




///First map - just locations

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
    
    const projection = d3.geoMercator()
        .scale(45000)
        .center([(maxLng+minLng)/2,(maxLat+minLat)/2+.2])
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





//// original nodes and links work - it was in the main promise section

    /*enters1718.forEach(d => {
        const newLink ={
            value:d.enters
        }
        
        if(!nodesData18.get(d.schcode_dest)){ //undefined is false
            const newNode = {
                schcode: d.schcode_dest
                //incoming: [newLink],
                //incomingTotal: newLink.value
            };
            
            nodesData18.set(d.schcode_dest, newNode); //add it to the map
            newLink.dest = newNode
            ;
        }else{
            const existingNode = nodesData18.get(d.schcode_dest);
            //existingNode.schcode = d.schcode_dest,
            //existingNode.incoming.push(newLink);
            //existingNode.incomingTotal += newLink.value;
            newLink.dest = existingNode;
        }
        
        if(!nodesData18.get(d.schcode_origin)){
            const newNode = {
                schcode: d.schcode_origin
            };
            
            nodesData18.set(d.schcode_origin, newNode);
            newLink.origin = newNode;
        }else{
            const existingNode = nodesData18.get(d.schcode_origin);
            //existingNode.schcode = 
            newLink.origin = existingNode;
        }
        
        
        linksData18.push(newLink);
        
        //if present, then modify the existing node
        //if not present, create a new node
    })*/
    
    //console.log(nodesData18);
    //console.log(linksData18);

