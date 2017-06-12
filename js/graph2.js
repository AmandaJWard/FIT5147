// load the data
//adapted from https://bl.ocks.org/lorenzopub/0b09968e3d4970d845a5f45ed25595bb

//create tooltip elements
var employmentTooltip = d3.select('#employment')
  .append('div')
  .attr('class', 'employmentTooltip');

employmentTooltip.append('div')
  .attr('class', 'label');

employmentTooltip.append('div')
  .attr('class', 'count');

employmentTooltip.append('div')
  .attr('class', 'percent');


d3.json("data/jobsummary.json", function(data) {

  // add the SVG element
  var svg = d3.select("#employment").append("svg");

  var margin = {top: 20, right: 60, bottom: 30, left: 30},
      fullWidth = 1000,
      legendWidth = 268,
      width = fullWidth - legendWidth - margin.left - margin.right, 
      height = 500 - margin.top - margin.bottom;

  //size of the legend
  var legendRectSize = 18;
  var legendSpacing = 4;

  var parseDate = d3.timeParse('%Y');

  var formatSi = d3.format(".3s");

  var formatNumber = d3.format(".1f"),
      formatBillion = function(x) { return formatNumber(x / 1e9); };

  var x = d3.scaleTime()
      .range([40, width]);

  var y = d3.scaleLinear()
      .range([0, height]);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var xAxis = d3.axisBottom()
      .scale(x);

  var yAxis = d3.axisRight()
      .scale(y)

  var area = d3.area()
      .x(function(d) { 
        return x(d.data.Year); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); });

  var stack = d3.stack();

  svg.attr('width', fullWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var keys = d3.keys(data[0]).filter(function(key) { return key !== 'Year'; })
  color.domain(keys);

  data.forEach(function(d) {
    d.Year = parseDate(d.Year); 
  });

  var maxDateVal = d3.max(data, function(d){
    var vals = d3.keys(d).map(function(key){ return key !== 'Year' ? d[key] : 0 });
    return d3.sum(vals);
  });
  
  // Set domains for axes
  x.domain(d3.extent(data, function(d) { return d.Year; }));
  y.domain([maxDateVal, 0])

  stack.keys(keys);

  stack.order(d3.stackOrderNone);
  stack.offset(d3.stackOffsetNone);

  var browser = svg.selectAll('.browser')
      .data(stack(data))
      .enter().append('g')
      .attr('class', function(d){ return 'browser ' + d.key; })
      .attr('fill-opacity', 0.5);

  var path = browser.append('path')
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', function(d) { return color(d.key); });

    //add a function to display tooltip for mouseover events of the chart
    path.on('mouseover', function(d) {
      employmentTooltip.select('.label').html(d.key);
      employmentTooltip.style('display', 'block');
    });

    //create an event to hide the tooltip when the mouse is not over the chart
    path.on('mouseout', function() {
      employmentTooltip.style('display', 'none');
    });

    //have the tooltip follow the mouse
    path.on('mousemove', function(d) {
      employmentTooltip.style('top', (d3.event.offsetY + 10) + 'px')
        .style('left', (d3.event.layerX + 10) + 'px');
    });

  //add the x axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

  //add text label for the x axis
  svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Year");

  //add the y axis
  svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("% of Respondents");   

  //draw a legend container
  var legend = svg.selectAll('.legend')                 
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * color.domain().length / 2;
      var horz = width + 10;
      var vert = i * height;
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
