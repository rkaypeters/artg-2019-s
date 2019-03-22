# Assignment 2: Cartogram

The intent of this assignment is to help you practice with data restructuring and manipulation, particularly the concept of "joining" disparate datasets. It will also re-familiarize you with the technical pipeline for ingesting, transforming, and representing data, especially the enter/exit/update pattern.

If you run into trouble, please spend some time to go over the in-class material related to data restructuring and transformation. You might also need to consult (the abundant) online resources on the enter/exit/update pattern.

## Data restructuring 
We will visualize total migration by origin country, in the year 2000, as a cartogram (meaning that each country will be plotted on the map). Therefore, several data transformation steps are necessary.

1. Filter the migration dataset to include only year 2000 (hint: use `array.filter`)
2. Group the resulting data by origin country, and sum up the values for each country (hint: use `d3.nest...rollup` or `d3.nest` followed by `map`)
3. Join the migration data with the latitude, longitude data in the metadata (following the example in class)

## Representation
Representing this data as a cartogram is conceptually simple. Each origin country is represented by one visual symbol (e.g. a circle), with the *size* of the symbol corresponding to migration values, and *position* of the symbol corresponding to its geographic location.

## Complete code
Completed code is in the "complete" branch of the repo. You should make a good faith attempt at the assignment before referring to it.
