import * as d3 from 'd3';

d3.csv('data/wine.csv', (error, data) => {
  console.log(error);
  console.log(data);
})
