"use strict";

/* Get or create the application global variable */
var App = App || {};

var ParticleSystem = function() {

    // setup the pointer to the scope 'this' variable
    var self = this;

    // data container
    var data = [];

    // scene graph group for the particle system
    var sceneObject = new THREE.Group();

    // bounds of the data
    var bounds = {};

    // create the containment box.
    // This cylinder is only to guide development.
    // TODO: Remove after the data has been rendered
    self.drawContainment = function() {

        // get the radius and height based on the data bounds
        var radius = (bounds.maxX - bounds.minX)/2.0 + 1;
        var height = (bounds.maxY - bounds.minY) + 1;

        // create a cylinder to contain the particle system
        var geometry = new THREE.CylinderGeometry( radius, radius, height, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true} );
        var cylinder = new THREE.Mesh( geometry, material );
        cylinder.name = "containment";

        // add the containment to the scene
        sceneObject.add(cylinder);
    };

    self.drawSlice = function(){
        var width = Math.max(bounds.maxX, bounds.maxZ) + 2;
        var geometry = new THREE.BoxBufferGeometry(width,0.1,width);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
        var cube = new THREE.Mesh(geometry,material);
        cube.name = "slice";

        sceneObject.add(cube);
    }

    // creates the particle system
    // based off of https://github.com/mrdoob/three.js/blob/master/examples/webgl_points_billboards.html
    self.createParticleSystem = function() {

        let geometry = new THREE.Geometry();
        let material = new THREE.PointsMaterial({
            size:  0.1,
            vertexColors: THREE.VertexColors //use color of each vertex; source: https://codepen.io/antishow/post/three-js-particles
        });

        var colorScale = (function(){
            var interpolator = d3.interpolateHsl('#ffffb2', '#bd0026');
            var scale = d3.scaleLinear()
                .domain([bounds.concentrationMin,bounds.concentrationMax]) // range of data
                .range([0, 1]); // range of results
            return function(value){
                return interpolator(scale(value));
            }
        })(); 

        console.log(bounds.concentrationMin,bounds.concentrationMax);

        for(var i = 0; i < data.length; ++i){
            //get data point
            let curDataPoint = data[i];
            let [x, y, z] = [curDataPoint.X, curDataPoint.Y, curDataPoint.Z];
            let [u, v, w] = [curDataPoint.U, curDataPoint.V, curDataPoint.W];

            //set datapoint position
            geometry.vertices.push(new THREE.Vector3(x,y,z));

            var color = colorScale(curDataPoint.concentration);
            // console.log(color);
            geometry.colors.push(new THREE.Color(color));
            // geometry.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()));

        }

        let particles = new THREE.Points(geometry,material);
        sceneObject.add(particles);

    };

    // data loading function
    self.loadData = function(file, callbackFn){

        // read the csv file
        d3.csv(file)
        // iterate over the rows of the csv file
            .row(function(d) {

                // get the min bounds
                bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
                bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
                bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

                // get the max bounds
                bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
                bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
                bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points2);

                bounds.concentrationMin = Math.min(bounds.concentrationMin || Infinity, Number(d.concentration));
                bounds.concentrationMax = Math.max(bounds.concentrationMax || -Infinity, Number(d.concentration));

                // add the element to the data collection
                data.push({
                    // concentration density
                    concentration: Number(d.concentration),
                    // Position
                    X: Number(d.Points0),
                    Z: Number(d.Points1),
                    Y: Number(d.Points2),
                    // Velocity
                    U: Number(d.velocity0), //x
                    W: Number(d.velocity1), //z
                    V: Number(d.velocity2)  //w
                });
            })
            // when done loading
            .get(function() {
                // draw the containment cylinder
                // TODO: Remove after the data has been rendered
                self.drawContainment();

                // create the particle system
                self.createParticleSystem();

                //remove containment
                //based off of https://stackoverflow.com/questions/18357529/threejs-remove-object-from-scene
                sceneObject.remove(sceneObject.getObjectByName("containment"));

                self.drawSlice();
                callbackFn();
            });
    };

    // publicly available functions
    var publiclyAvailable = {

        // load the data and setup the system
        initialize: function(file){
            return new Promise(function(fulfill,reject){
                self.loadData(file,fulfill);
            });
        },

        // accessor for the particle system
        getParticleSystems : function() {
            return sceneObject;
        },

        getDataAt: function(y,tolerance){
            var min =  y - tolerance, max = y + tolerance;
            var filtered = data.filter(function(point){
                let curY = point.Y;
                return curY >= min && curY <= max;
            });

            return filtered;
        }
    };

    return publiclyAvailable;

};