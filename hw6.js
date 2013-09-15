// Stores the CSV data
var dataset;

// Dimensions for the svg space
var width = 1400;
var height = 512;

// Radius of the data points
var radius = 3;

// Scale used to increase the height of the data points
var scale = 5;

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

    // Only plot points that have data for speed should be visible
    circles.attr("cx", function(d, i) {
        return (i * 12.5) + 25;
        })
        .attr("cy", function(d) {
            if (d.average_speed != "0"){
                var circleHeight = d.average_speed * scale;
                return height - circleHeight;
            }
            else{
                return -10;
            }

        })
        .attr("r", radius)
        .attr("fill", function(d) {
            return "rgb(19,117,255)";
        })
        .on("mouseover", function() {
            d3.select(this)
                .attr("fill", "orange");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(300)
                .attr("fill", "rgb(19,117,255)");
    });



    //var lines = svg.selectAll("line")

}




