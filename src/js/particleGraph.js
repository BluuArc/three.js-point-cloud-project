`use strict`;

var ParticleGraph = function(){
    var self = this;
    var w = window.innerWidth*0.5, h = window.innerHeight*0.5;
    var padding = 30;
    var svg = d3.select('#two-dim-vis').append('svg').attr('width',w).attr('height',h);

    self.draw = function(dataset){
        console.log(dataset);
        var xScale = d3.scaleLinear()
            .domain([d3.min(dataset,function(d){return d.X}), d3.max(dataset,function(d){return d.X;})])
            .range([padding, w - padding * 2]); //add padding to not go outside bounds
        var zScale = d3.scaleLinear()
            .domain([d3.min(dataset, function (d) { return d.Z }), d3.max(dataset, function (d) { return d.Z; })])
            .range([h - padding, padding]); //[h,0] makes it so that smaller numbers are lower; add padding to not go outside bounds
        

        var circles = svg.selectAll('circle')
            .data(dataset).enter()
            .append('circle')
            .attr('cx', function(d){return xScale(d.X);})
            .attr('cy', function(d){return zScale(d.Z);})
            .attr('r', 1);
    }
}