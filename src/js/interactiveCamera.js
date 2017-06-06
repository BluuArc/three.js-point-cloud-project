//camera is based off of https://stackoverflow.com/questions/23450588/isometric-camera-with-three-js
var interactiveCameraConstructor = function(aspect){
    // var aspect = window.innerWidth / window.innerHeight;
    var distance = 20;
    var camera = new THREE.OrthographicCamera(
        -distance*aspect, 
        distance*aspect, 
        distance,
        -distance, 
        1, 
        1000);

    camera.position.set(20,20,20);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = - Math.PI / 4;
    camera.rotation.x = Math.atan(-1 / Math.sqrt(2));

    var controlConstructor = function(renderer, renderFn){
        var controls =  new THREE.OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', renderFn);
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.maxPolarAngle = Math.PI / 2;
        return controls;
    }

    camera.controlConstructor = controlConstructor;
    return camera;
};