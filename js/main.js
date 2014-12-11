var scene, camera, renderer;
var geometry, moveMaterial, focalMaterial, mesh;

var debugGeo, moveGeo, focalLine, moveLine;

var moveDir, currDir;

var bullets = [];
var sphereMaterial;
var sphereGeo;

var debugCounter = 0;

var speed = 25;

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

    //Setup bullets
    sphereMaterial = new THREE.MeshBasicMaterial({color: 0xD4AF37})

    sphereGeo = new THREE.SphereGeometry(2, 3, 3);


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
    focalMaterial = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

    //Debug lines
    moveMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff
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

        currDir.lerp(moveDir, 0.5);
    }


    //Check bullet collision
    for (var i = bullets.length-1; i >= 0; i--) {
        var b = bullets[i], p = b.position, d = b.ray.direction;
        if (checkCollision(p)) {
            bullets.splice(i, 1);
            scene.remove(b);
            continue;
        }
        else
        {
            //No hit, so update speed
            b.translateX(speed * d.x);
            b.translateY(speed * d.y);
            b.translateZ(speed * d.z);
        }
    }
}

function checkCollision(p)
{
    if (p.z < -500) {
        return true;
    }
}


function createBullet(rifle, dir) {

    var sphere = new THREE.Mesh( sphereGeo, sphereMaterial);

    sphere.position.set(rifle.position.x, rifle.position.y, rifle.position.z);

    sphere.ray = new THREE.Ray(sphere.position, dir.normalize());

    sphere.owner = rifle;

    bullets.push(sphere);
    scene.add(sphere);

    return sphere;
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


        //create a point to lookAt
        var movePoint = new THREE.Vector3(
                moveDir.x + window.rifle.position.x,
                moveDir.y + window.rifle.position.y,
                moveDir.z + window.rifle.position.z
        );

        //Erase the old geometry for the line if it was initialized
        if (window.debugGeo != null)
        {
            delete window.debugGeo;
        }

        if (window.moveGeo != null)
        {
            delete window.moveGeo;
        }

        //Erase the old line
        if (window.focalLine != null)
        {
            window.scene.remove(window.focalLine)
            delete window.focalLine;
        }

        if (window.moveLine != null)
        {
            window.scene.remove(window.moveLine)
            delete window.moveLine;
        }


        //Initiate the debugLines to show where gun is pointed
        window.debugGeo = new THREE.Geometry();
        window.moveGeo = new THREE.Geometry();

        //This is the line that is the gun interpolating towards the controller
        window.moveGeo.vertices.push(new THREE.Vector3(window.rifle.position.x, window.rifle.position.y - 20, window.rifle.position.z - 20));
        window.moveGeo.vertices.push(new THREE.Vector3(focalPoint.x, focalPoint.y, focalPoint.z));

        //This is the line to show the most recent spot the leap controller is telling the gun to look at
        window.debugGeo.vertices.push(new THREE.Vector3(window.rifle.position.x, window.rifle.position.y - 20, window.rifle.position.z - 20));
        window.debugGeo.vertices.push(new THREE.Vector3(movePoint.x, movePoint.y, movePoint.z));


        window.focalLine = new THREE.Line(debugGeo, focalMaterial);
        window.moveLine = new THREE.Line(moveGeo, moveMaterial);

        window.scene.add(focalLine);
        window.scene.add(moveLine);

        window.rifle.lookAt(focalPoint);

        //Correct for rifle models original orientation
        window.rifle.rotation.y -= Math.PI /2;
        window.rifle.rotation.z = Math.PI;

        if (debugCounter == 50)
        {
            //Fire the gun
            var a = new THREE.Vector3();
            a.subVectors(focalPoint, window.rifle.position);

            createBullet(window.rifle, a);
        }
        else if (debugCounter > 50)
        {
            debugCounter = 0;
        }

        debugCounter++;


    }
}).connect();


