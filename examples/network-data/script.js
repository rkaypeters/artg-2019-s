//Prepare DOM canvas
const w = d3.select('.plot').node().clientWidth;
const h = d3.select('.plot').node().clientHeight;
const plot1 = d3.select('#plot-1').append('svg').attr('width',w).attr('height',h);

//Import data
const migrationDataPromise = d3.csv('../../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));

//Parse data into network structure
//with nodes and links
migrationDataPromise
	.then(data => { return generateNetwork(data, 1990); })
	.then(({nodesData, linksData}) => {

		//Initially position nodes
		nodesData.forEach(d => {
			d.x = w/2;
			d.y = h/2;
		});

		//Some basic data discovery
		const maxLinkValue = d3.max(linksData, d => d.value);
		const distScale = d3.scaleLog().domain([maxLinkValue, 1]).range([3,300]);

		//Draw nodes
		let nodes = plot1.selectAll('.node')
			.data(nodesData, d => d.name);
		let nodesEnter = nodes.enter()
			.append('g')
			.attr('class', 'node');
		nodesEnter.append('circle').attr('r', 5)
			.style('stroke', '#333')
			.style('stroke-width', '2px')
			.style('fill-opacity', 0.1);
		nodesEnter.append('text')
			.attr('text-anchor', 'middle')
			.style('font-family', 'sans-serif')
			.style('font-size', '8px');
		nodes = nodes.merge(nodesEnter);
		nodes
			.on('mouseenter', function(d){
				d3.select(this).select('text').text(d.name);
				d3.select(this).select('circle').style('fill-opacity', 1).style('fill', 'yellow');
			})
			.on('mouseleave', function(d){
				d3.select(this).select('text').text('');
				d3.select(this).select('circle').style('fill-opacity', 0.1).style('fill', null);
			});

		//Force simulation
		const simulation = d3.forceSimulation();

		//forces
		const forceXDefault = d3.forceX().x(d => w/2);
		const forceX = d3.forceX().x(d => {
			if(d.in > d.out){
				return w/4
			}else{
				return w*3/4;
			}
		});
		const forceY = d3.forceY().y(d => h/2);
		const forceManyBody = d3.forceManyBody()
			.strength(-1);
		const forceLink = d3.forceLink()
			.distance(d => distScale(d.value))
			.links(linksData);
		const forceCollide = d3.forceCollide()
			.radius(8);

		//Add forces to simulation
		simulation
			.force('x', forceX)
			.force('y', forceY)
			.force('manyBody', forceManyBody)
			.force('link', forceLink)
			.force('collide', forceCollide)
			.nodes(nodesData)
			.on('tick', () => {
				console.log(simulation.alpha())
				nodes
					.attr('transform', d => `translate(${d.x}, ${d.y})`)
			});

		dispatch.on('update:force', params => {

			//Update forces based on incoming parameters
			if(params.useForceX){
				simulation.force('x', forceX)
			}else{
				simulation.force('x', forceXDefault);
			}

			if(params.useForceY){
				simulation.force('y', forceY);
			}else{
				simulation.force('y', null);
			}

			if(params.useForceManyBody){
				forceManyBody.strength(params.forceManyBodyStrength);
				simulation.force('manyBody', forceManyBody);
			}else{
				simulation.force('manyBody', null);
			}

			if(params.useForceCollide){
				forceCollide.radius(params.forceCollideRadius);
				simulation.force('collide', forceCollide);
			}else{
				simulation.force('collide', null);
			}

			if(params.useForceLink){
				simulation.force('link', forceLink);
			}else{
				simulation.force('link', null);
			}

			simulation
				.alpha(1)
				.restart();

		});

	});

//Converts origin destination flows to nodes and links
function generateNetwork(data, year){
		//Filter for a specific year
		let flowsByYear = data.filter(d => d.year === year);

		const nodes = new Map();
		const links = [];
		//Iterate through flowsByYear
		//for each flow, look up the origin and destination nodes from the map
		flowsByYear.forEach(flow => {
			const {origin_name, dest_name, value} = flow;
			const link = {};

			let originNode = nodes.get(origin_name);
			if(originNode){
				//if that node already exists...
				originNode.out += value;
				originNode.outFlows.push(link);
				link.source = originNode;
			}
			else{
				//if that node doesn't exist, create the node, and add it to the map
				originNode = {
					name: origin_name,
					out: value,
					outFlows: [link],
					in: 0,
					inFlows: []
				};
				nodes.set(origin_name, originNode);
				link.source = originNode;
			}

			let destNode = nodes.get(dest_name);
			if(destNode){
				destNode.in += value;
				destNode.inFlows.push(link);
				link.target = destNode;
			}else{
				destNode = {
					name: dest_name,
					out: 0,
					outFlows: [],
					in: value,
					inFlows: [link]
				};
				nodes.set(dest_name, destNode);
				link.target = destNode;
			}

			link.value = value;
			links.push(link);
		});

		return {
			nodesData: Array.from(nodes.values()),
			linksData: links
		}
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
