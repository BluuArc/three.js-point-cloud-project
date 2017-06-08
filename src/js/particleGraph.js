`use strict`;

var ParticleGraph = function(){
    var self = this;
    var w = window.innerWidth*0.475, h = window.innerHeight*0.5;
    var padding = 30;
    var svg = d3.select('#two-dim-vis').append('svg').attr('width',w).attr('height',h);

    self.draw = function(dataset, colorScale, dataScales){
        self.scales = dataScales;
        console.log("Received",dataset.length,"data points");
        return new Promise(function(fulfill,reject){
            var xScale = dataScales.xScale.range([padding, w - padding * 2]).nice(); //add padding to not go outside bounds
            var yScale = dataScales.yScale.range([h - padding, padding]).nice(); //[h,0] makes it so that smaller numbers are lower; add padding to not go outside bounds

            //create and remove circles as necessary
            var circles = svg.selectAll('circle')
                .data(dataset);
            circles.exit().remove(); //remove excess as necessary

            //update current selection
            circles.attr('cx', function (d) { return xScale(d.X); })
                    .attr('cy', function (d) { return yScale(d.Y); })
                    // .attr('r', 1)
                    .style('fill', function (d) { return colorScale(d.concentration); });

            //create new as necessary
            circles.enter() 
                .append('circle')
                .attr('cx', function(d){return xScale(d.X);})
                .attr('cy', function(d){return yScale(d.Y);})
                .attr('r', 1)
                .style('fill', function(d){return colorScale(d.concentration);});
            
            //create axes
            if(d3.selectAll('.axis').empty()){//prevent redraw
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

            //label axes
            //based off of http://bl.ocks.org/phoebebright/3061203
            if (d3.selectAll('.axis-label').empty()) {//prevent redraw
                svg.append("text") //x axis label
                    .classed('axis-label', true)
                    .attr("text-anchor", "middle")
                    .attr("transform", `translate(${w/2 - padding/2},${h})`)
                    .text("X (Red Axis) Values");
                svg.append("text") //y axis label
                    .classed('axis-label',true)
                    .attr("text-anchor","middle")
                    .attr("transform", `translate(${padding*0.75/2},${h/2})rotate(-90)`)
                    .text("Y (Green Axis) Values");
            }
            fulfill(); //done
        });
    }
}