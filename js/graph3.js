//tooltip adapted from https://bl.ocks.org/pstuffa/26363646c478b2028d36e7274cedefa6

//create tooltip elements
var averageTooltip = d3.select('#average')
  .append('div')
  .attr('class', 'averageTooltip');

averageTooltip.append('div')
  .attr('class', 'label');

averageTooltip.append('div')
  .attr('class', 'count');

averageTooltip.append('div')
  .attr('class', 'percent');


// load the data
d3.json("data/graph3square.json", function(data) {

  // 2. Use the margin convention practice 
  var margin = {top: 50, right: 50, bottom: 50, left: 50},
    fullWidth = 1000,
    legendWidth = 268,
    width = fullWidth - legendWidth - margin.left - margin.right, 
    height = 500 - margin.top - margin.bottom; // Use the window's height

  //size of the legend
  var legendRectSize = 18;
  var legendSpacing = 4;

  //keys for legend/lines
  var lineNames = d3.keys(data[0]).filter(function (key) {
    return key !== "Year";
  });

  //calculate min year
  var minDate = d3.min(data, function(d){
    return d.Year;
  });

  //calcualte max year
  var maxDate = d3.max(data, function(d){
    return d.Year;
  });

  //calcualte max value
  var maxVal = d3.max(data, function(d){
    return d.TotalCompUse;
  });

  var color = d3.scaleOrdinal(d3.schemeCategory20);
  color.domain(lineNames);

  // 5. X scale will use the index of our data
  var xScale = d3.scaleLinear()
      .domain([minDate, maxDate]) // input
      .range([0, width]); // output

  // 6. Y scale will use the randomly generate number 
  var yScale = d3.scaleLinear()
      .domain([0, maxVal]) // input 
      .range([height, 0]); // output 

  // 7. d3's line generator
  var line = function (key) {
    return d3.line()
      .x(function(d, i) { return xScale(parseInt(d.Year)); }) // set the x values for the line generator
      .y(function(d) { return yScale(d[key]); }) // set the y values for the line generator 
      .curve(d3.curveMonotoneX); // apply smoothing to the line
  }

  // 1. Add the SVG to the page and employ #2
  var svg = d3.select('#average').append("svg")
      .attr("width", fullWidth)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // 3. Call the x axis in a group tag
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

//add text label for the x axis
  svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Year");

  // 4. Call the y axis in a group tag
  svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
  
  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Average mins per day per respondent"); 

  // 9. Append the path, bind the data, and call the line generator
  lineNames.forEach(function (name) {
    svg.append("path")
      .datum(data) // 10. Binds data to the line 
      .attr("class", "line") // Assign a class for styling 
      .attr("d", line(name)) // 11. Calls the line generator
      .attr('stroke', function(d) {
        return color(name);
      }); 
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
