var scene, camera, renderer;
var geometry, material, mesh;

var debugLine, line;

var moveDir, currDir;

init();
animate();

function init() {

    window.scene = new THREE.Scene();


    window.scene.add(new THREE.AmbientLight(0x888888));

    window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    window.camera.position.fromArray([0, 160, 400]);
    window.camera.lookAt(new THREE.Vector3(0, 0, 0));

    window.scene.add(camera);

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

    // model

    window.rifle = {};

    var loader = new THREE.OBJMTLLoader();
    loader.load( 'obj/m16.obj', 'obj/m16.mtl', function ( object ) {

        window.rifle = object; //Make this globally available so we can get it in the right position

        //Init position
        object.position.x = 0;
        object.position.y = 110;
        object.position.z = 350;

        //Orient barrel outward
        object.rotation.y = -1.55;

        scene.add( object );
        console.log("Added m16.obj: "  + window.rifle);

    }, onProgress, onError );


    window.addEventListener('resize', function () {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);

    }, false);

    //Debug lines
    material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

    document.body.appendChild( renderer.domElement );

    window.currDir = new THREE.Vector3(0, 0, -1);


}

function animate() {

    requestAnimationFrame( animate );
    window.camera.lookAt(window.scene.position);
    renderer.render(window.scene, window.camera);

}

function update(frame) {

    if (frame.fingers.length != 0) {

        window.moveDir = new THREE.Vector3(frame.fingers[1].direction[0],
            frame.fingers[1].direction[1],
            frame.fingers[1].direction[2]);

        if (moveDir != undefined) {

            moveDir.multiplyScalar(300);

            if (moveDir.x <= -160) {
                moveDir.x = -160;
            }
            else if (moveDir.x >= 160) {
                moveDir.x = 160;
            }

            if (moveDir.y <= -120) {
                moveDir.y = -120;
            }
            else if (moveDir.y >= 60) {
                moveDir.y = 60;
            }

            moveDir.z = -260;

        }

        currDir.lerp(moveDir, 0.1);
    }
}

function getCosAngles(dir)
{
    var alpha = Math.acos((dir.x) / dir.length());
    var beta =  Math.acos((dir.y) / dir.length());
    var gamma = Math.acos((dir.z) / dir.length());

    return {
        alpha: alpha,
        beta: beta,
        gamma: gamma
    }
}

function getVecFromAngles(alpha, beta, gamma)
{
    var x = Math.cos(angToRad(alpha));
    var y =  Math.sin(angToRad(beta));
    var z = Math.cos(angToRad(gamma));

    var orig = new THREE.Vector3(x, y, z);
    return orig;
}

function radToAng(rad)
{
    return (rad * (180/ Math.PI));
}

function angToRad(ang)
{
    return (ang * (Math.PI / 180));
}

Leap.loop({enableGestures:true}, function(frame) {
    window.lastFrame = frame;

    if (frame.fingers.length != 0 && window.rifle != undefined) {
        console.log(frame.fingers[1].direction)

        update(frame);

        console.log("Direction Vector: ", currDir.x, currDir.y, currDir.z);

        window.rifle.position.x = 0;
        window.rifle.position.y = 110;
        window.rifle.position.z = 350;



                //create a point to lookAt
        var focalPoint = new THREE.Vector3(
                    currDir.x + window.rifle.position.x,
                    currDir.y + window.rifle.position.y,
                    currDir.z + window.rifle.position.z
            );


        window.debugLine = new THREE.Geometry();
        window.debugLine.vertices.push(new THREE.Vector3(window.rifle.position.x, window.rifle.position.y, window.rifle.position.z));
        window.debugLine.vertices.push(new THREE.Vector3(focalPoint.x, focalPoint.y, focalPoint.z));

        window.line = new THREE.Line(debugLine, material);

        window.scene.add(line);

        window.rifle.lookAt(focalPoint);
        window.rifle.rotation.y -= Math.PI /2;
        window.rifle.rotation.z = Math.PI;

    }
}).connect();


