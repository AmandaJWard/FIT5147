//inspired by https://apps.npr.org/dailygraphics/graphics/time-industry-night/child.html?initialWidth=678&childId=responsive-embed-time-industry-night

//tooltip adapted from https://bl.ocks.org/pstuffa/26363646c478b2028d36e7274cedefa6

// load the data
d3.csv("data/fourthgraph.csv", function(data) {
 
  var keys = d3.keys(data[0]).filter(function (key) {
    return key !== "Time";
  });

  //dropdown menu
  //adapted from https://stackoverflow.com/questions/6601952/programmatically-create-select-list
  var genders = [
    {val : "", text: "- gender -"},
    {val : "F", text: "Female"},
    {val : "M", text: "Male"}
  ];

  var genderSelector = $('<select>').appendTo('.when .gender');
  $(genders).each(function() {
   genderSelector.append($("<option>").attr('value',this.val).text(this.text));
  });

  // F <=15,F 15-25,F 25-35,F 35-45,F 45-55,F 55-65,F 65+

  var ages = [
    {val : "", text: "- age -"},
    {val : "<=15", text: "Under 15"},
    {val : "15-25", text: "15-25"},
    {val : "25-35", text: "25-35"},
    {val : "35-45", text: "35-45"},
    {val : "45-55", text: "45-55"},
    {val : "55-65", text: "55-65"},
    {val : "65+", text: "Over 65"},
  ];

  var ageSelector = $('<select>').appendTo('.when .age');

  $(ages).each(function() {
   ageSelector.append($("<option>").attr('value',this.val).text(this.text));
  });

  //adapted from https://learn.jquery.com/using-jquery-core/faq/how-do-i-get-the-text-value-of-a-selected-option/
  genderSelector.on("change", function () {
    draw();
  });

  ageSelector.on("change", function () {
    draw();
  });

  // draw the d3 graph
  function draw() {

    // reset #when because this graph can be redrawn
    $("#when").html("");

    //create tooltip elements
    var whenTooltip = d3.select('#when')
      .append('div')
      .attr('class', 'whenTooltip');

    whenTooltip.append('div')
      .attr('class', 'label');

    whenTooltip.append('div')
      .attr('class', 'count');

    whenTooltip.append('div')
      .attr('class', 'percent');

    //get graph type from select box
    var gender = $(".when .gender select option:selected").val();
    var age = $(".when .age select option:selected").val();

    var colorNames = [
      "Average", "Selected"
    ];

    //custom color function based on d3 tutorial
    function col(name) {
      //split age and gender by space
      var nameParts = name.split(" ");
      var averageColour = "#000";
      var selectedColour = "rgb(31, 119, 180)"; //copied from d3 colours
      var fadedColour = "rgba(100, 100, 100, 0.2)"
      var colour = fadedColour;

      //if the line or legend is 'average' make black
      if (name == "Average") {
        colour = averageColour;
      } else if (name == "Selected") {
        colour = selectedColour;
      }

      if (gender !== "" && gender == nameParts[0]) {
        if (age == "" || age !== "" && age == nameParts[1]) {
          colour = selectedColour;
        }
      }

      if (age !== "" && age == nameParts[1]) {
        if (gender == "" || gender !== "" && gender == nameParts[0]) {
          colour = selectedColour;
        }
      }

      return colour;
    }
 
    var margin = {top: 50, right: 50, bottom: 50, left: 50},
      fullWidth = 1000,
      legendWidth = 100,
      width = fullWidth - legendWidth - margin.left - margin.right, 
      height = 500 - margin.top - margin.bottom; // Use the window's height

    //size of the legend
    var legendRectSize = 18;
    var legendSpacing = 4;

      //calcualte max value in data set
      var max = 0;
      var maxVal = d3.max(data, function(d){
        for (var p in d) {
          if (d[p] > max && p !== "Time") max = parseFloat(d[p]);
        }
        return max;
      });

    var color = d3.scaleOrdinal(d3.schemeCategory20);
    color.domain(keys);

     // 5. X scale will use the index of our data
      var xScale = d3.scaleLinear()
          .domain([0, 23]) // input
          .range([0, width]); // output

      // 6. Y scale will use the randomly generate number 
      var yScale = d3.scaleLinear()
          .domain([0, maxVal]) // input 
          .range([height, 0]); // output 

      var line = function (key) {
        return d3.line()
          .x(function(d, i) { return xScale(parseInt(d.Time)); }) // set the x values for the line generator
          .y(function(d) { return yScale(d[key]); }) // set the y values for the line generator 
          .curve(d3.curveMonotoneX); // apply smoothing to the line
      }

    var svg = d3.select('#when').append("svg")
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
        .text("Hour of the day (0 = Midnight)");

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
            .text("% of Recreational Computer Users Currently Using");   

      // 9. Append the path, bind the data, and call the line generator
      keys.forEach(function (name) {
        var path = svg.append("path")
          .datum(data) // 10. Binds data to the line 
          .attr("class", "line") // Assign a class for styling 
          .attr("d", line(name)) // 11. Calls the line generator
          .attr('stroke', function(d) {
            var pathColor = col(name);

            return pathColor;
          }); 

        //add a function to display tooltip for mouseover events of the chart
        path.on('mouseover', function(d) {
          var fullName = "";

          //expand label text so it looks nice
          if (name == "Average") {
            fullName = "Everyone";
          } else {
            var nameParts = name.split(" ");
            if (nameParts[0] == "F") fullName = "Female";
            else fullName = "Male";

            //add age part
            ages.forEach(function (age) {
              if (nameParts[1] == age.val) {
                fullName = fullName + " " + age.text;
              }
            });
          }
          whenTooltip.select('.label').html(fullName);
          whenTooltip.style('display', 'block');
        });

        //create an event to hide the tooltip when the mouse is not over the chart
        path.on('mouseout', function() {
          whenTooltip.style('display', 'none');
        });

        //have the tooltip follow the mouse
        path.on('mousemove', function(d) {
          whenTooltip.style('top', (d3.event.offsetY + 10) + 'px')
            .style('left', (d3.event.layerX + 10) + 'px');
        });
      });

    //draw a legend container
    var legend = svg.selectAll('.legend')                 
      .data(colorNames)
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
      .style('fill', col)
      .style('stroke', col);

    //draw legend labels
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d) { return d; });

  }

  //draw "all" graph
  draw();

});
