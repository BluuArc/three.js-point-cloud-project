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

    var rotationAmount = 0;

    self.colorScale = {};

    function rad_to_deg(radians){
        return radians * 180 / Math.PI;
    }

    function deg_to_rad(degrees){
        return degrees * Math.PI / 180;
    }

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

    self.drawSlice = function(tolerance){
        // var width = Math.max(bounds.maxX, bounds.maxZ) + 2;
        self.tolerance = tolerance;

        //remove old object if redrawing
        var slice = sceneObject.getObjectByName('slice');
        if(slice){
            console.log("Deleting old slice")
            sceneObject.remove(slice);
        }

        var geometry = new THREE.BoxBufferGeometry(bounds.maxX+10,bounds.maxY+10,self.tolerance*2);
        var material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
        var cube = new THREE.Mesh(geometry,material);
        cube.position.set(0,bounds.maxY/2 + 2.5,0);
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

        self.colorScale = (function(){
            var interpolator = d3.interpolateCubehelix('#ffffb2', '#bd0026');
            var scale = self.scales.concentrationScale;
            return function(value){
                return interpolator(scale(value));
            }
        })(); 

        self.grayScale = (function () {
            var interpolator = d3.interpolateCubehelix('#252525','#bdbdbd');
            var scale = self.scales.concentrationScale;
            return function (value) {
                return interpolator(scale(value));
            }
        })(); 

        // console.log(bounds.concentrationMin,bounds.concentrationMax);

        for(var i = 0; i < data.length; ++i){
            //get data point
            let curDataPoint = data[i];
            let [x, y, z] = [curDataPoint.X, curDataPoint.Y, curDataPoint.Z];
            let [u, v, w] = [curDataPoint.U, curDataPoint.V, curDataPoint.W];

            //set datapoint position
            geometry.vertices.push(new THREE.Vector3(x,y,z));

            var color = self.colorScale(curDataPoint.concentration);
            // console.log(color);
            geometry.colors.push(new THREE.Color(color));
            // geometry.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()));

        }

        let particles = new THREE.Points(geometry,material);
        particles.name = "particleSystem";
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
                bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points1);
                bounds.minY = Math.min(bounds.minY || Infinity, d.Points2);

                // get the max bounds
                bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
                bounds.maxZ = Math.max(bounds.maxZ || -Infinity, d.Points1);
                bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points2);

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

                self.scales = {
                    concentrationScale: d3.scaleLinear()
                        .domain([bounds.concentrationMin, bounds.concentrationMax]) // range of data
                        .range([0, 1]), // range of results
                    xScale: d3.scaleLinear()
                        .domain([bounds.minX, bounds.maxX]) // range of data
                        .range([0, 1]), // range of results
                    yScale: d3.scaleLinear()
                        .domain([bounds.minY, bounds.maxY]) // range of data
                        .range([0, 1]), // range of results
                    zScale: d3.scaleLinear()
                        .domain([bounds.minZ, bounds.maxZ]) // range of data
                        .range([0, 1]) // range of results
                }

                // create the particle system
                self.createParticleSystem();

                //remove containment
                //based off of https://stackoverflow.com/questions/18357529/threejs-remove-object-from-scene
                sceneObject.remove(sceneObject.getObjectByName("containment"));

                self.drawSlice(0.1); //default tolerance
                callbackFn();
            });
    };

    function getDataAt(z, tolerance) {
        var particleSystem = sceneObject.getObjectByName("particleSystem");
        var min = z - tolerance, max = z + tolerance;
        let index = 0;
        //formula based on https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm
        var cosFactor = Math.cos(rotationAmount), sinFactor = Math.sin(rotationAmount);
        var filtered = data.filter(function (point) {
            let curZ = point.Z * cosFactor - point.X*sinFactor;
            // color code based off of https://stackoverflow.com/questions/29909192/dynamically-change-point-color-in-three-js-pointclouod
            if (curZ >= min && curZ <= max){
                particleSystem.geometry.colors[index++].set(self.colorScale(point.concentration));
                return true;
            }else{
                particleSystem.geometry.colors[index++].set(self.grayScale(point.concentration));
                return false;
            }
        });

        if(rotationAmount !== 0){
            console.log("Rotating data points");
            filtered = filtered.map(function(d){
                let [x,y,z] = [d.X,d.Y,d.Z];
                let newPoint = {
                    concentration: d.concentration,
                    X: z * sinFactor + x * cosFactor,
                    Y: y,
                    Z: z * cosFactor - x * sinFactor  
                };
                // d.X = z*sinFactor + x*cosFactor;
                // d.Z = z*cosFactor - x*sinFactor;
                return newPoint;
            });
        }

        particleSystem.geometry.colorsNeedUpdate = true; 

        return filtered;
    }

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

        getDataAt: getDataAt,

        getDataAtSlice: function(tolerance){
            if(!tolerance){
                tolerance = self.tolerance;
            }
            var slice = sceneObject.getObjectByName('slice');
            console.log("Getting data with tolerance",tolerance,"and z position", slice.position.z, "and rotation",rotationAmount);
            return getDataAt(slice.position.z,tolerance);
        },

        moveSlice: function(percentage){
            var range_length = (bounds.maxZ - bounds.minZ)*1.15;
            // console.log("bounds and range_length",bounds,range_length);
            var slice = sceneObject.getObjectByName('slice');
            var newZ = bounds.minZ*1.15 + (range_length * percentage);// - range_length / 2;
            // console.log("newZ",newZ);
            slice.position.set(0, bounds.maxY / 2 + 2.5, newZ);
        },

        setTolerance: function(tolerance){
            // self.tolerance = tolerance;
            // var slice = sceneObject.getObjectByName('slice');
            // console.log(slice);
            // console.log("tolerance:",tolerance);
            self.drawSlice(tolerance);
        },

        getColorScale: function(){
            return self.colorScale;
        },

        getDataScales: function(){
            return self.scales;
        },

        rotateY: function(degrees){
            var radians = deg_to_rad(degrees);
            var particleSystem = sceneObject.getObjectByName('particleSystem');
            if(particleSystem){
                rotationAmount += radians;
                particleSystem.rotateY(radians);
                self.drawSlice(self.tolerance);
            }
            return rad_to_deg(rotationAmount);
        }
    };

    return publiclyAvailable;

};