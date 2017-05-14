$(document).foundation()
// tooltips from http://stackoverflow.com/questions/10805184/show-data-on-mouseover-of-circle

// set the dimensions of the canvas
var margin = {top: 20, right: 20, bottom: 70, left: 40};
var width = 1000;
var height = 700;

// load the data
// modify the below line to data.json or data-02.json for selecting the data sets.
d3.json("data-02.json", function(data) {
 
  // add the SVG element
  var svg = d3.select("svg#two");

  // Draw links
  svg.append("g")
  	.selectAll("g")
    .data(data.links)
    .enter()
    .append("line")
    .attr("x1", function (d) {
      return data.nodes.reduce(function (memo, node) {
        return (node.id == d.node01) ? node.x : memo;
      }, null);
    })
    .attr("x2", function (d) {
      return data.nodes.reduce(function (memo, node) {
        return (node.id == d.node02) ? node.x : memo;
      }, null);
    })
    .attr("y1", function (d) {
      return data.nodes.reduce(function (memo, node) {
        return (node.id == d.node01) ? node.y : memo;
      }, null);
    })
    .attr("y2", function (d) {
      return data.nodes.reduce(function (memo, node) {
        return (node.id == d.node02) ? node.y : memo;
      }, null);
    })
    .attr("stroke", "orange")
    .attr("stroke-width", function (d) {
      return d.amount / 50;
    })
    .append("svg:title")
    .text( function (d) {
      return "From: " +
        d.node01 +
        "\nTo: " +
        d.node02 +
        "\nTrade Amount: " +
        d.amount
    });

  //Draw nodes
  svg.append("g")
  	.selectAll("g")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    })
    .attr("r", function (d) {
      let transactionTotal = data.links.reduce( function (total, link) {
        if (d.id == link.node01 || d.id == link.node02) {
          total += link.amount;
        }
        return total;
      
      // set circle area = transactionTotal
      }, 0);
      d.transactionTotal = transactionTotal
      return Math.sqrt(transactionTotal / Math.PI);
    })
    .append("svg:title")
    .text( function (d) {
      console.log(d);
        return "Node: " +
          d.id +
          "\nTotal Trading Amount: " +
          d.transactionTotal;
    });

});
