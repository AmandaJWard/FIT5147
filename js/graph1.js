$(document).foundation()
// clockTooltips from http://stackoverflow.com/questions/10805184/show-data-on-mouseover-of-circle

// set the dimensions of the canvas
var margin = {top: 20, right: 20, bottom: 70, left: 40};
var width = 1000;
var height = 700;

//define a function to sort the pie chart by activity duration length
function sortbyDuration (a,b) {
  if (a.ActivityDuration == b.ActivityDuration) 
    return 0;
  else if (a.ActivityDuration < b.ActivityDuration)
    return -1;
  else
    return 1
}

//create tooltip elements
var clockTooltip = d3.select('#clock')
  .append('div')
  .attr('class', 'clockTooltip');

clockTooltip.append('div')
  .attr('class', 'label');

clockTooltip.append('div')
  .attr('class', 'count');

clockTooltip.append('div')
  .attr('class', 'percent');

// load the data
// Point the website to the Piechart JSON created from Data Wrangling
d3.json("data/piechart.json", function(data) {
 
data.sort(sortbyDuration);

  // add the SVG element
  // Pie chart code based on http://zeroviscosity.com/d3-js-step-by-step/

  //width and height of the pie chart
  var width = 550;
  var height = 300;
  var svgPadding = 200;
  //radius of the pie chart
  var radius = Math.min(width, height) / 2;
  //size of the legend
  var legendRectSize = 18;
  var legendSpacing = 4;

  //map in a set of colors
  var color = d3.scaleOrdinal(d3.schemeCategory20b);

  //initialise d3 on svg for pie chart
  var svg = d3.select('#clock')
    .append('svg')
    .attr('width', width)
    .attr('height', height + svgPadding)
    .append('g')
    .attr('transform', 'translate(170, 305)');

  //d3 utility for drawing arcs
  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  //obtaining the size of slices from data file
  var pie = d3.pie()
    .value(function(d) { return d.ActivityDuration; })
    .sort(null); //to do look up d3 sort

  //draw pie chart
  var path = svg.selectAll('path')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d) {
      return color(d.data.ActivityClass);
    });

    //add a function to display tooltip for mouseover events of the piechart
    path.on('mouseover', function(d) {
      var total = d3.sum(data.map(function(d) {
        return d.ActivityDuration;
      }));

      var percent = Math.round(1000 * d.data.ActivityDuration / total) / 10;
      clockTooltip.select('.label').html(d.data.ActivityClass);
      clockTooltip.select('.count').html(d.data.ActivityDuration + " hours");
      clockTooltip.select('.percent').html(percent + '%');
      clockTooltip.style('display', 'block');
    });

    //create an event to hide the tooltip when the mouse is not over the chart
    path.on('mouseout', function() {
      clockTooltip.style('display', 'none');
    });

    //have the tooltip follow the mouse
    path.on('mousemove', function(d) {
      clockTooltip.style('top', (d3.event.offsetY + 10) + 'px')
        .style('left', (d3.event.layerX + 10) + 'px');
    });

  //draw a legend container
  var legend = svg.selectAll('.legend')                 
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * color.domain().length / 2;
      var horz = radius + 60;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    });

  //draw legend color boxes
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color);

  //draw legend labels
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d; });
   
});
