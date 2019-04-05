console.log("Week-1 part-4: function");

//Making sure that the d3 library has been imported
console.log(d3);

//Use d3.csv to import data (via a Promise)
d3.csv('../../data/world-bank/cb704cf4-fe8f-4f1b-ae0c-2a51c26f295f_Data.csv', parse)
	.then(transform)
	.then(function(rows){
		console.log(rows);

		//Exercise starts here

		//Define a function that takes three arguments
		// - rows: the "rows" variable from above
		// - three letter country code, such as "AUT"
		// - series name, such as "Population, total"
		//And return small array of values, sorted by year
		function filterByCountrySeries(rows, country, series){
			//YOUR CODE HERE
            
            return rows.filter(d => d.countryCode == country).filter(d=> d.series = series);
		}

		//Now test this function
		console.log(filterByCountrySeries(rows, "BHR", "Population, total"));

		//Can the function definition live somewhere else?
	});

//You don't have to do anything here, but try to understand what these functions are doing
function parse(d){
	return {
		countryName: d['Country Name'],
		countryCode: d['Country Code'],
		series: d['Series Name'],
		"1990": d['1990 [YR1990]']==='..'?undefined:+d['1990 [YR1990]'],
		"1995": d['1995 [YR1995]']==='..'?undefined:+d['1995 [YR1995]'],
		"2000": d['2000 [YR2000]']==='..'?undefined:+d['2000 [YR2000]'],
		"2005": d['2005 [YR2005]']==='..'?undefined:+d['2005 [YR2005]'],
		"2010": d['2010 [YR2010]']==='..'?undefined:+d['2010 [YR2010]'],
		"2015": d['2015 [YR2015]']==='..'?undefined:+d['2015 [YR2015]'],
		"2017": d['2017 [YR2017]']==='..'?undefined:+d['2017 [YR2017]']
	}
}

function transform(data){
	return data.map(function(d){
		const years = [];

		const {countryName, countryCode, series} = d;
		delete d.countryName;
		delete d.countryCode;
		delete d.series;

		for(key in d){
			years.push({
				countryName,
				countryCode,
				series,
				year: +key,
				value: d[key]
			})
		}

		return years;
	}).reduce(function(acc,val){
		return acc.concat(val);
	}, [])
}
