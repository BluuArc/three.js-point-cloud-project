"use strict";

/* Get or create the application global variable */
var App = App || {};

/* IIFE to initialize the main entry of the application*/
(function() {

    // setup the pointer to the scope 'this' variable
    var self = this;

    /* Entry point of the application */
    App.start = function()
    {
        // create a new scene
        App.scene = new Scene({
            container:"scene",
            polarAngle: {min: 0, max: 2*Math.PI},
            cameraPosition: {x: 5, y: 5, z: 20}
        });

        // initialize the particle system
        App.particleSystem = new ParticleSystem();
        App.particleSystem.initialize('data/058.csv')
            .then(function(){
                //add the particle system to the scene
                App.scene.addObject( App.particleSystem.getParticleSystems());

                // render the scene
                App.scene.render();

                //create graph
                App.graph = new ParticleGraph();
                App.graph.draw(App.particleSystem.getDataAtSlice(), App.particleSystem.getColorScale(), App.particleSystem.getDataScales());
                
            });


    };

    App.moveSlice = function(percentage){
        App.particleSystem.moveSlice(percentage);
        
        //redraw graph
        App.graph.draw(App.particleSystem.getDataAtSlice(), App.particleSystem.getColorScale(), App.particleSystem.getDataScales());
    };

    App.setTolerance = function(tolerance){
        App.particleSystem.setTolerance(tolerance);
        App.graph.draw(App.particleSystem.getDataAtSlice(), App.particleSystem.getColorScale(), App.particleSystem.getDataScales());
    }

}) ();