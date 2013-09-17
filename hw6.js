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

// Offset used to space out components
var offset = 25;

// Coordinate used to hide points/lines that don't need to be displayed
var hiddenCoordinate = -10;

// Blue color for the svg lines and circles
var color = "rgb(19,117,255)";

// Flag keeps track of whether or not table is displayed
var isDisplayed = false;

// Table used to display Tour de France winners
var table;


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

    var lines = svg.selectAll("line")
        .data(dataset)
        .enter()
        .append("line");

    d3.select("div")
        .on("click", function() {
            if (isDisplayed){
                table.remove();
                isDisplayed = false;
            }
        });

    lines.attr("x1", function(d, i) {
        if (i < dataset.length - 1){
            if (dataset[i + 1].average_speed != "0" && d.average_speed != "0"){
                return (i * scaleX) + offset;
            }
        }
        return hiddenCoordinate;
    })
        .attr("y1", function(d, i) {
            if (i < dataset.length - 1){
                if (d.average_speed != "0" && d.average_speed != "0"){
                    var y1 = d.average_speed * scaleY;
                    return height - y1;
                }
            }
            return hiddenCoordinate;
        })
        .attr("x2", function(d, i){
            if (i < dataset.length - 1) {
                if (dataset[i + 1].average_speed != "0" && d.average_speed != "0"){
                    return ((i + 1) * scaleX + offset);
                }
            }
            return hiddenCoordinate;
        })
        .attr("y2", function(d, i){
            if (i < dataset.length - 1) {
                if (dataset[i + 1].average_speed != "0" && d.average_speed != "0"){
                    var y2 = dataset[i + 1].average_speed * scaleY;
                    return height - y2;
                }
            }
            return hiddenCoordinate;
        })
        .attr("stroke", color);


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
            return hiddenCoordinate;
        })
        .attr("r", radius)
        .attr("fill", function(d) {
            return color;
        })
        .on("click", function(d) {
            if (isDisplayed){
                table.remove();
            }

                var stats = [
                    {rank: "1st", name: d.first_place, country: d.first_country},
                    {rank: "2nd", name: d.second_place, country: d.second_country},
                    {rank: "3rd", name: d.third_place, country: d.third_country}
                ];

                statsTable = tabulate(stats, ["rank", "name", "country"]);
                statsTable.selectAll("thead th")
                    .text(function(column) {
                        return column.charAt(0).toUpperCase() + column.substr(1);
                    });
                isDisplayed = true;

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
        })
        .append("title")
        .text(function(d) {
            return "Year: " + d.year + "\nAverage Speed: " + d.average_speed + " km/h";
        });



}

/*
 * The following code was taken from http://jsfiddle.net/7WQjr/
 * It's used to create the table when a point gets clicked.
 */
function tabulate(data, columns) {
    table = d3.select("#table_container").append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function(d) { return d.value; });
    return table;
}
