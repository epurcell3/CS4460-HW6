// Stores the CSV data
var dataset;

// Dimensions for the svg space
var width = 1400;
var height = 512;

// Radius of the data points
var radius = 3;

d3.csv("tour_de_france.csv", function(error, data) {
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
        // Only plot points that have data for speed
        if (function(d){return d.average_speed;} != "0"){
            circles.attr("cx", function(d, i) {
            return (i * 12.5) + 25;
            })
            .attr("cy", function(d) {
                var circleHeight = d.average_speed * 5;
                return height - circleHeight;
            })
            .attr("r", radius);

        }
}



