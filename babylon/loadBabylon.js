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
        scene.meshes[0].position.x = -10;
        scene.meshes[0].position.y = 3;
        scene.meshes[0].position.z = -10;
        var alpha = 0;
        var beta = Math.PI/2;
        var gamma =  0;
        scene.meshes[0].rotate(BABYLON.Axis.Z, gamma, BABYLON.Space.WORLD);
        scene.meshes[0].rotate(BABYLON.Axis.X, alpha, BABYLON.Space.WORLD);
        scene.meshes[0].rotate(BABYLON.Axis.Y, beta, BABYLON.Space.WORLD);
        scene.meshes[0].scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);

        //scene.registerBeforeRender(function () {scene.meshes[0].rotation.x =  Math.PI / 3;});

        scene.meshes[1].physicsImpostor = new BABYLON.PhysicsImpostor(scene.meshes[1], 
                                BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.6 }, scene);
        scene.meshes[1].position.x = 20;
        scene.meshes[1].position.y = 10;
        scene.meshes[1].position.z = 20;

        //scene.meshes[1].checkCollisions = true;
        //scene.meshes[1].setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 4 });        
        //camera.target = mymesh;

        var ground = BABYLON.Mesh.CreateGround("ground1", 50, 50, 2, scene);
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, 
                                BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    });	
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function() {
    scene.render();
});