"use strict";

/* Get or create the application global variable */
var App = App || {};

/* Create the scene class */
var Scene = function(options) {

    // setup the pointer to the scope 'this' variable
    var self = this;

    // scale the width and height to the screen size
    var width = d3.select('.particleDiv').node().clientWidth;
    var height = width * 0.85;

    // create the scene
    self.scene = new THREE.Scene();

    // setup the camera
    // self.camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
    self.camera = interactiveCameraConstructor();

    self.camera.lookAt(0,0,0);
    if(options.cameraPosition){
        self.camera.position.set(options.cameraPosition.x, options.cameraPosition.y, options.cameraPosition.z);
    }else{
        self.camera.position.set(0,2,20);
    }

    // if(options.upVector){
    //     self.camera.up = options.upVector;
    // }

    // self.camera.lookAt(scene.position)

    // Add a directional light to show off the objects
    var light = new THREE.DirectionalLight( 0xffffff, 1.5);
    // Position the light out from the scene, pointing at the origin
    light.position.set(0,2,20);
    light.lookAt(0,0,0);

    // add the light to the camera and the camera to the scene
    self.camera.add(light);
    self.scene.add(self.camera);

    // create the renderer
    self.renderer = new THREE.WebGLRenderer();

    // set the size and append it to the document
    self.renderer.setSize( width, height );
    document.getElementById(options.container).appendChild( self.renderer.domElement );


    self.controls = self.camera.controlConstructor(self.renderer,function(){
        console.log(self.camera.position,self.camera.rotation);
        self.renderer.render(self.scene, self.camera);
    });

    if (options.polarAngle) {
        console.log(options.polarAngle);
        self.controls.minPolarAngle = options.polarAngle.min;
        self.controls.maxPolarAngle = options.polarAngle.max;
    }

    // if (options.azimuthAngle) {
    //     console.log(options.azimuthAngle);
    //     self.controls.minAzimuthAngle = options.azimuthAngle.min;
    //     self.controls.maxAzimuthAngle = options.azimuthAngle.max;
    // }

    /* add the checkboard floor to the scene */

    self.public =  {

        resize: function() {

        },

        addObject: function(obj) {
            self.scene.add( obj );
        },

        removeObject: function(name){
            var object = self.scene.getObjectByName(name);
            self.scene.remove(object);
        },

        render: function (updateFn) {
            function update_render() {
                updateFn();
                requestAnimationFrame(update_render);
                self.renderer.render(self.scene, self.camera);
            }

            function regular_render() {
                requestAnimationFrame(regular_render);
                self.renderer.render(self.scene, self.camera);
            }

            if (updateFn && typeof updateFn === "function") {
                update_render();
            } else {
                regular_render();
            }
        }

    };

    return self.public;
};