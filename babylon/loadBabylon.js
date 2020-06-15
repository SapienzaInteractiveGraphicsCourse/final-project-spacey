var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {

    engine.enableOfflineSupport = false;

    // This is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
    //BABYLON.Animation.AllowMatricesInterpolation = true;

    var scene = new BABYLON.Scene(engine);
    
    var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    var physicsPlugin = new BABYLON.OimoJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 3, new BABYLON.Vector3(0, 10, 0), scene);
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("Hemi", new BABYLON.Vector3(0, 1, 0), scene);
    BABYLON.SceneLoader.ImportMesh("", "../models/babylonFiles/", "nav.babylon", scene, function (newMeshes) {
        var mymesh = newMeshes[0];
        camera.target = mymesh;

        var decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);
        var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 300, height:15}, scene);
        ground.material = decalMaterial;	
    });	
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function() {
    scene.render();
});