`use strict`;

var ParticleGraph = function(){
    var self = this;
    var w = window.innerWidth*0.475, h = window.innerHeight*0.5;
    var padding = 30;
    var svg = d3.select('#two-dim-vis').append('svg').attr('width',w).attr('height',h);

    self.draw = function(dataset, colorScale, dataScales){
        self.scales = dataScales;
        console.log("Received",dataset.length,"data points");
        var xScale = dataScales.xScale.range([padding, w - padding * 2]).nice(); //add padding to not go outside bounds
        var yScale = dataScales.yScale.range([h - padding, padding]).nice(); //[h,0] makes it so that smaller numbers are lower; add padding to not go outside bounds

        //create and remove circles as necessary
        var circles = svg.selectAll('circle')
            .data(dataset);
        circles.exit().remove(); //remove excess as necessary
        circles.enter() //create as necessary
            .append('circle');
        
        //plot data
        circles = svg.selectAll('circle').data(dataset)
            .attr('cx', function(d){return xScale(d.X);})
            .attr('cy', function(d){return yScale(d.Y);})
            .attr('r', 1)
            .style('fill', function(d){return colorScale(d.concentration);});
        
        var xAxis = d3.axisBottom(xScale);
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (h - padding) + ')') //move x-axis to bottom of image
            .call(xAxis);

        var yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + padding + ',0)') //move y-axis right to have readable labels
            .call(yAxis);
    }
}