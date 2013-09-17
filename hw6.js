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

var indCurrValue = 2;
var yValues = ["stages", "distance", "average_speed"]

// Flag keeps track of whether or not table is displayed
var isDisplayed = false;

// Table used to display Tour de France winners
var table;


d3.csv("hw6_data.csv", function(error, data) {
    if (error) {
        console.log(error);
    }
    else{
        console.log(data);  //DEBUG: delete this later...
        dataset = data;
        var x_axes = [1903, 2010];
        var y_axes = [30, 0];
        var d = [4, 5];

        generateGraph(x_axes, y_axes, d);
        //generateSpeedGraph();
    }
});

function generateGraph(x_axes, y_axes, data)
{
    var svg = d3.select("svg");
    var xscale = d3.scale.linear()
        .domain(x_axes)
        .range([50, width-50]);
    var m = d3.max(dataset, function(d) {
        return parseInt(d[yValues[indCurrValue]]);
    });
    var yscale = d3.scale.linear()
        .domain([d3.max(dataset, function(d){return parseInt(d[yValues[indCurrValue]]);}),
                d3.min(dataset, function(d) {return d[yValues[indCurrValue]];})])
        .range([50, height-50]);
    var xAxis = d3.svg.axis()
        .scale(xscale)
        .orient("bottom")
        .tickFormat(d3.format("f"));
    var yAxis = d3.svg.axis()
        .scale(yscale)
        .orient("left");
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - 50) + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 50 + ", 0)")
        .call(yAxis);

    //add data points
    var circles = svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle");
    var lastPoint = new Array();
    circles.attr("cx", function(d, i) {
            if (d[yValues[indCurrValue]] != "0")
            {
                lastPoint.push([d.year, d[yValues[indCurrValue]]]);
                return xscale(d.year);
            }
            lastPoint.push(lastPoint[i - 1]);
            return xscale(lastPoint[i][0]);
        })
        .attr("cy", function(d, i){
            if (d[yValues[indCurrValue]] != "0")
            {
                return yscale(d[yValues[indCurrValue]]);
            }
            return yscale(lastPoint[i][1]);
        })
        .attr("r", radius)
        .attr("fill", color)
        .attr("display", function(d) {if (d[yValues[indCurrValue]] != "0") {return "default"} return "none"});

    var lines = svg.selectAll("line")
        .data(dataset)
        .enter()
        .append("line");
    lines.attr("x1", function(d, i){
            if (i < dataset.length - 1)
            {
                return xscale(d.year);
            }
            return xscale(hiddenCoordinate);
        })
        .attr("y1", function(d, i){
            if (i < dataset.length - 1)
            {
                lastHeight = d[yValues[indCurrValue]];
                return yscale(d[yValues[indCurrValue]]);
            }
            else
            {
                return yscale(hiddenCoordinate);
            }
        })
        .attr("x2", function(d, i){
            if (i < dataset.length - 1)
            {
                return xscale(dataset[i+1].year);
            }
            return xscale(hiddenCoordinate);
        })
        .attr("y2", function(d, i) {
            if (i < dataset.length - 1)
            {
                return yscale(dataset[i+1][yValues[indCurrValue]]);
            }
            return yscale(hiddenCoordinate);
        })
        .attr("stroke", color);
}

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
