import * as d3 from 'd3';

function countMap(data, col) {
  var map = {}
  for(var e of data){
    const colValue = e[col]
    if(colValue in map){
      map[colValue]++
    } else {
      map[colValue] = 1
    }
  }
  return map
}

function map2array(map){
  var arr = []
  for(var key of Object.keys(map)){
    if (key === '') continue
    arr.push({name: key, value: map[key]})
  }
  return arr
}

const WIDTH = 1200
const HEIGHT = 500
const VMARGINS = 100
const HMARGINS = 50
const INNER_PADDING = 5

function makeHistogram(data, col) {
  const fildata = map2array(countMap(data, 'country'))

  const x = d3.scaleBand()
    .range([0, WIDTH])
    .paddingInner(INNER_PADDING)
    .paddingOuter(VMARGINS)
    .domain(fildata.map(d => d.name))
  const y = d3.scaleLinear()
    .range([HEIGHT, 0])
    .domain([0, d3.max(fildata, d => d.value)])

  console.log('LOL min '+ d3.min(fildata, d => d.value))

  const histogram = d3.histogram()
    .domain(x.domain())
  const bins = histogram(fildata)
  const barWidth = x(bins[0].x1) - x(bins[0].x0)

  const svg = d3.select("svg")
  svg.attr('width', WIDTH)
  svg.attr('height', HEIGHT + HMARGINS)
  const g = svg.append("g")
    .attr("class", "chart")

  const bar = g.selectAll(".bar")
  .data(fildata)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", (d) => `translate(${x(d.name)})`);

  bar.append("rect")
    .attr("x", 0)
    .attr("y", (d) => HEIGHT - y(d.value))
    .attr("width", barWidth)
    .attr("height", (d) => y(d.value) );

  svg.append("g")
    .attr('transform', `translate(${VMARGINS/2},0)`)
    .call(d3.axisLeft(y))

  svg.append("g")
    .attr("class", "country-labels")
    .attr('transform', `translate(${VMARGINS/2}, ${HEIGHT})`)
    .call(d3.axisBottom(x))

}

d3.csv('data/wine.csv', (error, data) => {
  makeHistogram(data,'country')
})
