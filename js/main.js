var scene, camera, renderer;
var geometry, material, mesh;


init();
animate();

function init() {

    window.scene = new THREE.Scene();


    window.scene.add(new THREE.AmbientLight(0x888888));

    //var ambientLight = new THREE.AmbientLight(0xBBBBBB);
    //window.scene.add(ambientLight);


    /*
    var pointLight = new THREE.PointLight(0xFFffff);
    pointLight.position = new THREE.Vector3(-20, 10, 100);
    pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    window.scene.add(pointLight);
    */



    window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    window.camera.position.fromArray([0, 160, 400]);
    window.camera.lookAt(new THREE.Vector3(0, 0, 0));

    window.scene.add(camera);

    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );


    window.renderer = new THREE.WebGLRenderer( {alpha: true} );

    window.renderer.setClearColor(0x000000, 0);
    window.renderer.setSize(window.innerWidth, window.innerHeight);

    window.renderer.domElement.style.position = 'fixed';
    window.renderer.domElement.style.top = 0;
    window.renderer.domElement.style.left = 0;
    window.renderer.domElement.style.width = '100%';
    window.renderer.domElement.style.height = '100%';

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    // texture


    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        //Debug
        console.log( item, loaded, total );
    };

    var texture = new THREE.Texture();



    //Textures
    var imageLoader = new THREE.ImageLoader( manager );
    imageLoader.load( 'obj/RifleObj/M1Rifle.jpg', function ( image ) {

        texture.image = image;
        texture.needsUpdate = true;

    } );

    // model

    window.rifle = {};

    //THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    var loader = new THREE.OBJMTLLoader();
    loader.load( 'obj/m16.obj', 'obj/m16.mtl', function ( object ) {

        window.rifle = object; //Make this globally available so we can get it in the right position
        object.position.y = 0;
        scene.add( object );
        console.log("Added m16.obj: "  + window.rifle);

    }, onProgress, onError );

    /*
    var objLoader = new THREE.OBJLoader( manager );
    objLoader.load( 'obj/RifleObj/RifleObj.obj', function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.material.map = texture;

            }

        } );

        object.position.z = 250;

        // My initial model was too small, so I scaled it upwards.
        object.scale = new THREE.Vector3( 25, 25, 25 );

        window.rifle = object; //Make this globally available so we can get it in the right position

        window.scene.add( object );

    }, onProgress, onError );

    */

    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);

    }, false);


    document.body.appendChild( renderer.domElement );

}

function animate() {

    window.camera.lookAt(window.scene.position);
    

}


Leap.loop({enableGestures:true}, function(frame) {
    //console.log(frame);
})

    // note that transform must be _before_ rigged hand
    .use('transform', {
        quaternion: new THREE.Quaternion,
        position: new THREE.Vector3,
        scale: 0.3
    })
    .use('playback', {recording: 'finger-tap-54fps.json.lz'})
    .use('riggedHand', {
        dotsMode: false,
        parent: window.scene,
        renderFn: function(){
            animate()
            renderer.render(window.scene, window.camera);
        }

    })

    .connect();

//window.transformPlugin = Leap.loopController.plugins.transform;