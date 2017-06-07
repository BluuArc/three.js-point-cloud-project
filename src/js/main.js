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
        App.scene = new Scene({container:"scene"});

        // initialize the particle system
        App.particleSystem = new ParticleSystem();
        App.particleSystem.initialize('data/058.csv')
            .then(function(){
                App.scene.addObject( App.particleSystem.getParticleSystems());

                // render the scene
                App.scene.render();

                //create graph
                App.graph = new ParticleGraph();
                App.graph.draw(App.particleSystem.getDataAt(0,0.1));
                
            });

        //add the particle system to the scene

    };

}) ();