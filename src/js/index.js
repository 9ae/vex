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

function makeHistogram(data, col) {
  const WIDTH = 1200
  const HEIGHT = 500
  const VMARGINS = 100
  const HMARGINS = 50
  const INNER_PADDING = 5
  const countryMap = countMap(data, 'country')
  delete countryMap['US']
  const fildata = map2array(countryMap).filter(d => d.value > 100)

  const x = d3.scaleBand()
    .range([0, WIDTH])
    .paddingInner(INNER_PADDING)
    .paddingOuter(VMARGINS)
    .domain(fildata.map(d => d.name))
  const y = d3.scaleLinear()
    .range([0, HEIGHT])
    .domain([0, d3.max(fildata, d => d.value)])

    const svg = d3.select("svg")
    svg.attr('width', WIDTH)
    svg.attr('height', HEIGHT + HMARGINS)

  const histogram = d3.histogram()
    .domain(x.domain())
  const bins = histogram(fildata)
  const barWidth = x(bins[0].x1) - x(bins[0].x0)

  const g = svg.append("g")
    .attr("class", "chart")

  const bar = g.selectAll(".bar")
  .data(fildata)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", (d) => `translate(${x(d.name)},${HEIGHT - y(d.value)})`);

  bar.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", barWidth)
    .attr("height", (d) => y(d.value) );

  bar.append("text")
    .text((d) => d.value)
    .attr('transform', 'rotate(90)')
  /*
  svg.append("g")
    .attr('transform', `translate(${barWidth},0)`)
    .call(d3.axisLeft(y))
  */
  svg.append("g")
    .attr("class", "country-labels")
    .attr('transform', `translate(${barWidth}, ${HEIGHT})`)
    .call(d3.axisBottom(x))

}

function makeBubbles(data) {
  const WIDTH = window.innerWidth
  const HEIGHT = window.innerHeight
  const MIN_RADIUS = 5
  const MAX_RADIUS = 20
  const byVariety = map2array(countMap(data, 'variety'))
  const quantize = d3.scaleBand()
    .range([0, 1])
    .domain(byVariety.map(d => d.name))

  const color = wineType => d3.interpolateRainbow(quantize(wineType))
  const radius = d3.scaleLinear()
    .range([MIN_RADIUS, MAX_RADIUS])
    .domain([d3.min(byVariety, d => d.value), d3.max(byVariety, d => d.value)])

  const force = d3.forceSimulation(byVariety)
    .force('collide', d3.forceCollide(MAX_RADIUS))

  const px = d3.scaleLinear()
    .range([MAX_RADIUS, WIDTH - MAX_RADIUS])
    .domain([d3.min(byVariety, d => d.x), d3.max(byVariety, d => d.x)])

  const py = d3.scaleLinear()
    .range([MAX_RADIUS, HEIGHT - MAX_RADIUS])
    .domain([d3.min(byVariety, d => d.y), d3.max(byVariety, d=> d.y)])

  //draw

  const svg = d3.select('svg')
  svg.attr('width', WIDTH)
  svg.attr('height', HEIGHT)

  const node = svg.selectAll('.node')
    .data(byVariety)
    .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${px(d.x)}, ${py(d.y)})`);
  node.append('circle')
    .style('fill', d => color(d.name))
    .attr('r', d => radius(d.value))

}

d3.csv('data/wine.csv', (error, data) => {
  makeBubbles(data)
})
