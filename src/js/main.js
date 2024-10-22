"use strict";

/* Get or create the application global variable */
var App = App || {};

/* IIFE to initialize the main entry of the application*/
(function() {

    // setup the pointer to the scope 'this' variable
    var self = this;

    /* Entry point of the application */
    App.start = function(filepath)
    {
        // create a new scene
        if(!App.scene){
            App.scene = new Scene({
                container:"scene",
                polarAngle: {min: 0, max: 2*Math.PI},
                cameraPosition: {x: 5, y: 5, z: 20}
            });
        }

        // initialize the particle system
        if(App.particleSystem){ //remove old data
            App.scene.removeObject(App.particleSystem.getParticleSystems());
            delete App.particleSystem;
        }
        App.particleSystem = new ParticleSystem();
        console.time("opTimer");
        // App.particleSystem.initialize('data/095.csv')
        App.particleSystem.initialize(filepath)
            .then(function(){
                //add the particle system to the scene
                App.scene.addObject( App.particleSystem.getParticleSystems());

                // render the scene
                App.scene.render();

                //create graph
                App.graph = new ParticleGraph();
                var data = App.particleSystem.getDataAtSlice();
                console.log("Finished getting data");
                return App.graph.draw(data, App.particleSystem.getColorScale(), App.particleSystem.getDataScales())
                    .then(function(){
                       console.log("Done drawing");
                       console.timeEnd("opTimer");
                    });
                
            });


    };

    App.moveSlice = function(percentage){
        console.time("opTimer");
        App.particleSystem.moveSlice(percentage);
        
        //redraw graph
        var data = App.particleSystem.getDataAtSlice();
        console.log("Finished getting data");
        return App.graph.draw(data, App.particleSystem.getColorScale(), App.particleSystem.getDataScales())
            .then(function () {
                console.log("Done drawing");
                console.timeEnd("opTimer");
            });
    };

    App.setTolerance = function(tolerance){
        console.time("opTimer");
        App.particleSystem.setTolerance(tolerance);
        var data = App.particleSystem.getDataAtSlice();
        console.log("Finished getting data");
        return App.graph.draw(data, App.particleSystem.getColorScale(), App.particleSystem.getDataScales())
            .then(function () {
                console.log("Done drawing");
                console.timeEnd("opTimer");
            });
    };

    App.setRotation = function(degrees){
        console.time("opTimer");
        App.particleSystem.rotateY(degrees);
        var data = App.particleSystem.getDataAtSlice();
        console.log("Finished getting data");
        return App.graph.draw(data, App.particleSystem.getColorScale(), App.particleSystem.getDataScales())
            .then(function () {
                console.log("Done drawing");
                console.timeEnd("opTimer");
            });
    };

}) ();