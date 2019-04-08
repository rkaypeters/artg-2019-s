//I'm not sure what happened with this. I remember doing the homework, but most likely I messed up with github. Or maybe I did it in the wrong folder or saved incorrectly. Anyway, here it is now.

//You'll show messages in the console using console.log
console.log("Week-1 part-3: data structures");

//Let's start with an array of objects, representing a selection of US cities
const data = [
  {"city":"seattle", "state":"WA", "population":652405, "land_area":83.9},
  {"city":"new york", "state":"NY", "population":8405837, "land_area":302.6},
  {"city":"boston", "state":"MA", "population":645966, "land_area":48.3},
  {"city":"kansas city", "state":"MO", "population":467007, "land_area":315}
];

//Complete the following exercises by following the prompts

//#1
//Using array.forEach, print out (using console.log) the names of the 4 cities, followed by their population.
//The message should have the following sample format
//"seattle, WA has a population of 652405"

console.log('#1:');

data.forEach(function(d){
	//YOUR CODE HERE
    console.log(d.city + ', ' + d.state + ' has a population of '+ d.population);
});

//#2
//Using array.forEach to sum up the populations of the 4 cities
//and print out the average population of the 4 cities

console.log('#2:');

var totPop = 0;

data.forEach(d =>
             {totPop += d.population;}
            );

console.log('average poulation: ' + totPop/data.length);

//#3
//Sort these 4 cities in terms of land area, from highest to lowest
//And print out the name of the city with the largest land area
//Hint: use array.sort

console.log('#3:');

data.sort((a,b)=>
         {return (b.land_area - a.land_area);}
         );

console.log(data[0].city);


//#4
//Using array.map, compute the population density of these 4 cities (population divided by area)
//add population density as a property to each object, and return the array

//I probably wouldn't use map for this... maybe I don't fully understand all of the uses for map; I tried and didn't see a way to use it to add a property to elements in an existing array. Possibly I could if I changed the initial const defining data above to be able to reassign it. However, it seems like map is what we use to treat the initial data as immutable and forEach is more appropriate for changing the original data.

console.log('#4:');

const density = data.map(d => d.population/d.land_area);

//console.log(density);

const density2 = data.map(d=>
    {return{city: d.city,
            state: d.state,
            population: d.population,
            land_area: d.land_area,
            density: Math.round(d.population/d.land_area)
           }
});

console.log(density2);



//#5
//Using array.filter, return a subset of the cities with a population <1 million

console.log('#5:');

const subLT1M = data.filter( d => d.population < 1000000);

console.log(subLT1M);
