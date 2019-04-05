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
    delete d.geocode_amentity;
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
    
    myProjection(d3.select('.network').node(),geodata,45000) //still need to set up network DOM dimensions
        .push({schcode: '00000',xy: [20,20]}); ///This is the out of system position
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
        d.gradeCfg_dest = md.gradeCfg;
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
        
    //console.log(enters1718);
    

    
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
    
    
    enters1718Network = enters1718.filter(d =>d.gradeCfg_dest == 'H').filter(d => d.schcode_dest!= '00000').filter(d => d.schcode_origin != '00000');
    console.log(enters1718Network);
    
    const nodesData = networkSetup(enters1718)[0];
    const linksData = networkSetup(enters1718)[1]; //doesn't seem like the most efficient way to do this, but seems to work...
    
    console.log(nodesData);
    console.log(linksData);
    
    myNetwork('.network',nodesData,linksData.filter(d => d.target.schcode != '00000').filter(d => d.source.schcode != '00000')//.filter(d => d.value != 1)
             );
    
    myNetwork('.network2',networkSetup(enters1718Network)[0],networkSetup(enters1718Network)[1]);
    
    //myNetwork('.network3',networkSetup(enters1718Network.filter(d => d.distcode_dest =='28'))[0],networkSetup(enters1718Network.filter(d => d.distcode_dest =='28'))[1]);
    
    myDistrictNetwork('.network3',enters1718,'28');
}
    
)




// okay, trying a network
// may add force layout stuff later (I think I can?) to spread stuff if needed, but it seems to not handle what I want specifically enough so trying this by scratch first.

function myNetwork(rootDom,nodesData,linksData){
    const w = rootDom.clientWidth;
    
    /*linksData.forEach(d => {  //not necessary for this version but might need to remember this format for something else
        if(d.source.xy){
            d.x = [d.source.xy[0]];
            d.y = [d.source.xy[1]];
        }else{
            d.x = [];
            d.y = [];
        };
        if(d.target.xy){
            d.x.push(d.target.xy[0]);
            d.y.push(d.target.xy[1]);
        };
    });
    
    const lineGenerator = d3.line()
		.x(d => d.x)
		.y(d => d.y)
    
    console.log(linksData);*/
    
    const plot = d3.select(rootDom)
        .append('svg')
        .attr('width',750)
        .attr('height',1000);
    
    const links = plot
        .selectAll('.link')
        .data(linksData);
    const linksEnter = links.enter().append('line').attr('class','link')
        .style('stroke-opacity',0.05)
		.style('stroke-width','1px')
		.style('stroke','black');
    
    //console.log(links.merge(linksEnter).selectAll('.link'));
    
    links.merge(linksEnter)
        .attr('x1', d=> {
            if(d.target.xy){
                return d.target.xy[0];
            }else{
                return 0;
            }
        })
        .attr('y1', d=> {
            if(d.target.xy){
                return d.target.xy[1];
            }else{
                return 0;
            }
        })
        .attr('x2', d=> {
            if(d.source.xy){
                return d.source.xy[0];
            }else{
                return 0;
            }
        })
        .attr('y2', d=> {
            if(d.source.xy){
                return d.source.xy[1];
            }else{
                return 0;
            }
        })
        //.style('stroke-width', d=>{
        //return (d.value.toString() + 'px');
        //})
        .style('stroke-opacity',d => {return (d.value * 0.05)});
    
    
    //console.log(nodesData);
    
    const nodes = plot.selectAll('.node')
        .data(nodesData);
    const nodesEnter = nodes.enter().append('g').attr('class','node');

    nodesEnter.append('circle')
        .style('fill-opacity',.1)
		.style('stroke','#333')
		.style('stroke-width','2px');

	nodes.merge(nodesEnter)
        .attr('r',d=> d.value.totalEnters)
		.attr('transform', d => `translate(${d.xy[0]}, ${d.xy[1]})`);
    
    console.log(nodes.merge(nodesEnter));
    
}


// District-specific version - in progress, not very far

function myDistrictNetwork(rootDom,data,district){
    
    //console.log(district);
    districtData = data.filter(d => d.distcode_dest === district);
    
    districtData.forEach(d => {
        delete d.xy_dest;
        delete d.xy_origin;});
    
    console.log(districtData);
    
    myProjection2(rootDom,districtData,90000); 
    
    console.log(districtData);
    
    
    //const w = rootDom.clientWidth;
    
    
    

    
    //console.log(linksData);
    
    /*const plot = d3.select(rootDom)
        .append('svg')
        .attr('width',750)
        .attr('height',1000);
    
    const links = plot
        .selectAll('.link')
        .data(linksData);
    const linksEnter = links.enter().append('line').attr('class','link')
        .style('stroke-opacity',0.05)
		.style('stroke-width','1px')
		.style('stroke','black');
    
    //console.log(links.merge(linksEnter).selectAll('.link'));
    
    links.merge(linksEnter)
        .attr('x1', d=> {
            if(d.target.xy){
                return d.target.xy[0];
            }else{
                return 0;
            }
        })
        .attr('y1', d=> {
            if(d.target.xy){
                return d.target.xy[1];
            }else{
                return 0;
            }
        })
        .attr('x2', d=> {
            if(d.source.xy){
                return d.source.xy[0];
            }else{
                return 0;
            }
        })
        .attr('y2', d=> {
            if(d.source.xy){
                return d.source.xy[1];
            }else{
                return 0;
            }
        })
        //.style('stroke-width', d=>{
        //return (d.value.toString() + 'px');
        //})
        .style('stroke-opacity',d => {return (d.value * 0.05)});
    
    
    //console.log(nodesData);
    
    const nodes = plot.selectAll('.node')
        .data(nodesData);
    const nodesEnter = nodes.enter().append('g').attr('class','node');

    nodesEnter.append('circle')
        .style('fill-opacity',.1)
		.style('stroke','#333')
		.style('stroke-width','2px');

	nodes.merge(nodesEnter)
        .attr('r',d=> d.value.totalEnters)
		.attr('transform', d => `translate(${d.xy[0]}, ${d.xy[1]})`);
    
    console.log(nodes.merge(nodesEnter));*/
    
}




// broke the prep of nodes and links out into its own function

function networkSetup(data){
    
    //console.log(data);
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

function myProjection(rootDom,data,myScale){
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
        .scale(myScale)
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

//// in progress
function myProjection2(rootDom,data,myScale){
    const w = rootDom.clientWidth;
    const h = rootDom.clientHeight;
    
    const projection_tm = d3.geoMercator()
    
    console.log(data);
    
    const minLng = d3.min(data, function(d){
        return d.lngLat_dest[0];
    })
    const maxLng = d3.max(data, function(d){
        return d.lngLat_dest[0];
    })
    const minLat = d3.min(data, function(d){
        return d.lngLat_dest[1];
    })
    const maxLat = d3.max(data, function(d){
        return d.lngLat_dest[1];
    })
    
    const projection = d3.geoMercator()
        .scale(myScale)
        .center([(maxLng+minLng)/2,(maxLat+minLat)/2+.2])
        //.center(289,127)
        .translate([w/2,h/2]);
    
    //console.log(data);
    
    data.forEach(d=>
                 {d.xy_dest = projection(d.lngLat_dest);
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
        if(d.lngLat){
            return d.lngLat[0];
        }
    })
    const maxLng = d3.max(data, function(d){
        if(d.lngLat){
            return d.lngLat[0];
        }
    })
    const minLat = d3.min(data, function(d){
        if(d.lngLat){
            return d.lngLat[1];
        }
    })
    const maxLat = d3.max(data, function(d){
        if(d.lngLat){
            return d.lngLat[1];
        }
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

