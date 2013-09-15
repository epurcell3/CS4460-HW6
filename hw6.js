var dataset;

d3.csv("tour_de_france.csv", function(error, data) {
    if (error) {
        console.log(error);
    }
    else{
        console.log(data);  //DEBUG: delete this later...
        dataset = data;
        var selection = d3.select("div").selectAll("p");
        selection.data(dataset).enter()
            .append("p")
            .text(function(d,i){return "item # at " + i + "	is " + d.year;});
    }
});



