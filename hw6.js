// Stores the CSV data
var dataset;

// Dimensions for the svg space
var width = 1400;
var height = 512;

// Radius of the data points
var radius = 3;

// Scale used to increase the space between data points
var scaleX = 12.5;

// Scale used to increase the height of the data points
var scaleY = 5;
var offset = 25;

var color = "rgb(19,117,255)";



d3.csv("hw6_data.csv", function(error, data) {
    if (error) {
        console.log(error);
    }
    else{
        console.log(data);  //DEBUG: delete this later...
        dataset = data;
        generateSpeedGraph();

    }
});

function generateSpeedGraph(){
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var circles = svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle");

    // Only plot points that have data for speed should be visible
    circles.attr("cx", function(d, i) {
        return (i * scaleX) + offset;
        })
        .attr("cy", function(d) {
            if (d.average_speed != "0"){
                var circleHeight = d.average_speed * scaleY;
                return height - circleHeight;
            }
            else{
                return -10;
            }

        })
        .attr("r", radius)
        .attr("fill", function(d) {
            return color;
        })
        .on("mouseover", function() {
            d3.select(this)
                .attr("fill", "orange");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(300)
                .attr("fill", color);
    });


    var currX;
    var lines = svg.selectAll("line")
        .data(dataset)
        .enter()
        .append("line");


    lines.attr("x1", function(d, i) {
            if (i < dataset.length - 1){
                if (dataset[i + 1].average_speed != "0" && d.average_speed != "0"){
                    return (i * scaleX) + offset;
                }
            }
            return -10;
        })
        .attr("y1", function(d, i) {
            if (i < dataset.length - 1){
                if (d.average_speed != "0" && d.average_speed != "0"){
                    var y1 = d.average_speed * scaleY;
                    return height - y1;
                }
            }
            return -10;
        })
        .attr("x2", function(d, i){
            if (i < dataset.length - 1) {
                if (dataset[i + 1].average_speed != "0" && d.average_speed != "0"){
                   return ((i + 1) * scaleX + offset);
                }
            }
            return -10;
        })
        .attr("y2", function(d, i){
            if (i < dataset.length - 1) {
                if (dataset[i + 1].average_speed != "0" && d.average_speed != "0"){
                    var y2 = dataset[i + 1].average_speed * scaleY;
                    return height - y2;
                }
            }
            return -10;
        })
        .attr("stroke", color);
}




