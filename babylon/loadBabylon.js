var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {

    engine.enableOfflineSupport = false;

    var scene = new BABYLON.Scene(engine);
    
    var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    var physicsPlugin = new BABYLON.OimoJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 3, Math.PI / 4, 3, new BABYLON.Vector3(50, 50, 50), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("Hemi", new BABYLON.Vector3(0, 1, 0), scene);
    var meshesColliderList = [];

    BABYLON.SceneLoader.ImportMesh("", "../models/babylonFiles/bus_nav/", "bus_nav.babylon", scene, function (newMeshes) {
        console.log("Mesh Length: ",scene.meshes.length);
        for (var i = 0; i < scene.meshes.length; i++) {
            console.log(scene.meshes[i].name)
            console.log(scene.meshes[i].id)
        }
        
/*        scene.meshes[0].isVisible = true;
        //scene.meshes[0].checkCollisions = true;
        for (var i = 0; i < scene.meshes.length; i++) {
            if (scene.meshes[i].checkCollisions && scene.meshes[i].isVisible === false) {
                console.log("Enter for i:", i);
                scene.meshes[i].setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0, 
                                                friction: 0.5, restitution: 0.7 });
         
                meshesColliderList.push(scene.meshes[i]);
         
            }       
        }*/

        scene.meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(scene.meshes[0], 
                                BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.6 }, scene);
/*        scene.meshes[0].position.x = -10;
        scene.meshes[0].position.y = 3;
        scene.meshes[0].position.z = -10;
        var alpha = 0;
        var beta = 5*Math.PI/4;
        var gamma =  0;
        scene.meshes[0].rotate(BABYLON.Axis.Z, gamma, BABYLON.Space.WORLD);
        scene.meshes[0].rotate(BABYLON.Axis.X, alpha, BABYLON.Space.WORLD);
        scene.meshes[0].rotate(BABYLON.Axis.Y, beta, BABYLON.Space.WORLD);*/
        scene.meshes[0].rotate(BABYLON.Axis.Y, Math.PI/2, BABYLON.Space.WORLD);
        scene.meshes[0].scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);

        //scene.registerBeforeRender(function () {scene.meshes[0].rotation.x =  Math.PI / 3;});

        scene.meshes[1].physicsImpostor = new BABYLON.PhysicsImpostor(scene.meshes[1], 
                                BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.6 }, scene);
        scene.meshes[1].position.x = 20;
        scene.meshes[1].position.y = 10;
        scene.meshes[1].position.z = 20;

        //scene.meshes[1].checkCollisions = false;
        //scene.meshes[1].showBoundingBox = true;
        //scene.meshes[1].setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 4 });        
        //camera.target = mymesh;

/*        var animationBox = new BABYLON.Animation("navAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3
                        , BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        // Animation keys
        var keys = [];

        keys.push({
            frame: 0,
            value: scene.meshes[0].position.add(new BABYLON.Vector3(-10, 3, -10))
        });

        keys.push({
            frame: 100,
            value: scene.meshes[0].position.add(new BABYLON.Vector3(-10, 3, -10))
        });

        animationBox.setKeys(keys);
        scene.meshes[0].animations = [];
        scene.meshes[0].animations.push(animationBox);
        scene.beginAnimation(scene.meshes[0], 0, 100, true);*/

        //Create Path for Path following
        var points = [];
        var n = 600; 
        var r = 40; //radius
        for (var i = 0; i < 2*n + 1; i++) {
            points.push( new BABYLON.Vector3( (r)*Math.cos(i*Math.PI/n), 0, (r)*Math.sin(i*Math.PI/n)));
        }    

        var track = BABYLON.MeshBuilder.CreateLines('track', {points: points}, scene);
        track.color = new BABYLON.Color3(0, 0, 0);

        scene.meshes[0].position.y = 5;
        scene.meshes[0].position.z = r;
        var path3d = new BABYLON.Path3D(points);
        var normals = path3d.getNormals();
        var theta = Math.acos(BABYLON.Vector3.Dot(BABYLON.Axis.Z,normals[0]));
        scene.meshes[0].rotate(BABYLON.Axis.Y, theta, BABYLON.Space.WORLD);

        var ground = BABYLON.Mesh.CreateGround("ground1", 100, 100, 2, scene);
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, 
                                BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    
        var i=0;
        scene.registerAfterRender(function() {
        scene.meshes[0].position.x = points[i].x;
        scene.meshes[0].position.z = points[i].z;

         
        theta = Math.acos(BABYLON.Vector3.Dot(normals[i],normals[i+1]));
        var dir = BABYLON.Vector3.Cross(normals[i],normals[i+1]).y;
        var dir = dir/Math.abs(dir);
        scene.meshes[0].rotate(BABYLON.Axis.Y, dir * theta, BABYLON.Space.WORLD);
         
        i = (i + 1) % (2*n-1);  
        });  
    });	
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function() {
    scene.render();
});