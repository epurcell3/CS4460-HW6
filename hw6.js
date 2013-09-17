// Stores the CSV data
var dataset;

// Dimensions for the svg space
var width = 1400;
var height = 512;

// Radius of the data points
var radius = 3;

// Offset used to space out components
var offset = 25;

// Coordinate used to hide points/lines that don't need to be displayed
var hiddenCoordinate = -10;

// Blue color for the svg lines and circles
var color = "rgb(19,117,255)";

// Indicates the graph's current mode (e.g., stages, distance, or average speed)
var indCurrValue = 2;
var yValues = ["stages", "distance", "average_speed"];

// Flag keeps track of whether or not table is displayed
var isDisplayed = false;

// Table used to display Tour de France winners
var table;

var svg;

start();

function generateGraph(x_axes, y_axes, data) {
    svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

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
        .call(xAxis)
        .append("text")
        .attr("x", width / 2 + offset)
        .attr("y", 20)
        .attr("dy","1em")
        .style("text-anchor","end")
        .style("font-size", 16)
        .style("font-weight", "bold")
        .text("Year");
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 50 + ", 0)")
        .call(yAxis)
        .append("text")
        .attr("transform","rotate(-90)")
        .attr("y",-50)
        .attr("x", -(height / 3) + determineCurrentLabel().length)
        .attr("dy",".75em")
        .style("text-anchor","end")
        .style("text-anchor","end")
        .style("font-size", 16)
        .style("font-weight", "bold")
        .text(determineCurrentLabel());

    // If a mode is switched and a table is displayed, it should be removed
    d3.select("div")
        .on("click", function() {
            if (isDisplayed){
                table.remove();
                isDisplayed = false;
            }
        });

    var lines = svg.selectAll("line")
        .data(dataset)
        .enter()
        .append("line");

    lines.attr("x1", function(d, i){
        if (i < dataset.length - 1) {
            if (dataset[i + 1][yValues[indCurrValue]] != "0" && d[yValues[indCurrValue]] != "0"){
                return xscale(d.year);
            }
        }
        return xscale(hiddenCoordinate);
        })
        .attr("y1", function(d, i){
            if (i < dataset.length - 1) {
                if (dataset[i+1][yValues[indCurrValue]] != "0" && d[yValues[indCurrValue]] != "0"){
                    //lastHeight = d[yValues[indCurrValue]];
                    return yscale(d[yValues[indCurrValue]]);
                }
            }
            else {
                return yscale(hiddenCoordinate);
            }
        })
        .attr("x2", function(d, i){
            if (i < dataset.length - 1) {
                if (dataset[i+1][yValues[indCurrValue]] != "0" && d[yValues[indCurrValue]] != "0"){
                    return xscale(dataset[i+1].year);
                }
            }
            return xscale(hiddenCoordinate);
        })
        .attr("y2", function(d, i) {
            if (i < dataset.length - 1) {
                if (dataset[i + 1][yValues[indCurrValue]] != "0" && d[yValues[indCurrValue]] != "0"){
                    return yscale(dataset[i+1][yValues[indCurrValue]]);
                }
            }
            return yscale(hiddenCoordinate);
        });

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
        .attr("display", function(d) {if (d[yValues[indCurrValue]] != "0") {return "default"} return "none"})
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
            if (isDisplayed){
                table.remove();
            }
        })
        .append("title")
        .text(function(d) {
            if (indCurrValue == 2){
                text = "\nAverage Speed: " + d.average_speed + " km/h";
            }
            else if (indCurrValue == 1){
                text = "\nDistance: " + d.distance + " km";
            }
            else{
                text = "\nNumber of Stages: " + d.stages;
            }
            return "Year: " + d.year + text;
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

/*
 * Determines what the y-axis label should display.
 */
function determineCurrentLabel(){
    if (indCurrValue == 2){
        return "Average Speed (km/h)";
    }
    else if (indCurrValue == 1){
        return "Distance (km)";
    }
    else{
        return "Number of Stages";
    }
}

/*
 * Gets the value of whichever button is clicked and changes
 * the mode accordingly.
 */
function changeMode(value){
    // Make buttons inactive
    removeClass("left");
    removeClass("middle");
    removeClass("right");
    
    if (value == "Speeds"){
        indCurrValue = 2;
        document.getElementById("left").className += "active";
    }
    else if (value == "Distances"){
        indCurrValue = 1;
        document.getElementById("middle").className += "active";
    }
    else{
        indCurrValue = 0;
        document.getElementById("right").className += "active";
    }
    svg.remove();
    start();
}

/*
 * Initializes the visualization.
 */
function start(){
    d3.csv("hw_6.csv", function(error, data) {
        if (error) {
            console.log(error);
        }
        else{
            console.log(data);  //DEBUG: delete this later...
            dataset = data;
            var x_axes = [1900, 2010];
            var y_axes = [30, 0];
            var d = [4, 5];

            generateGraph(x_axes, y_axes, d);

        }
    });
}

/*
 * Removes a class from an element.
 */
function removeClass(className){
    document.getElementById(className).className =
        document.getElementById(className).className.replace
            ("active", '');
}





