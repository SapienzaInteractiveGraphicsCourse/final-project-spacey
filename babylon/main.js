var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {

    // Model by Mixamo

    engine.enableOfflineSupport = false;

    // This is really important to tell Babylon.js to use decomposeLerp and matrix interpolation
    //BABYLON.Animation.AllowMatricesInterpolation = true;

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 3, new BABYLON.Vector3(0, 10, 0), scene);
    camera.attachControl(canvas, true);

    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 50;
    camera.wheelDeltaPercentage = 0.01;

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.6;
    light.specular = BABYLON.Color3.White();

    // var light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
    // light2.position = new BABYLON.Vector3(0, 250, 0);
    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 200, 100), scene);

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("galaxy", 500.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("galaxyMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.Texture("../images/galaxy.png", scene, true);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    // var sun = BABYLON.MeshBuilder.CreateSphere("sun", { diameter: 5 }, scene);
    // sun.position = new BABYLON.Vector3(0, 250, 0);
    // var sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene);
    // sunMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
    // sunMaterial.specularColor = new BABYLON.Color3(1, 1, 0);
    // sunMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
    // sunMaterial.ambientColor = new BABYLON.Color3(1, 1, 0);
    // sun.material = sunMaterial;
    // sun.material.diffuseTexture = new BABYLON.Texture("../images/sun.jpg", scene);

    var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);

    // By default it uses a billboard to render the sun, just apply the desired texture
    // position and scale
    godrays.mesh.material.diffuseTexture = new BABYLON.Texture('../images/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    godrays.mesh.position = new BABYLON.Vector3(0, 50, -200);
    godrays.mesh.scaling = new BABYLON.Vector3(5, 5, 5);
    light.position = godrays.mesh.position;

    var earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 12 }, scene);
    earth.position = new BABYLON.Vector3(100, 50, -200);
    earth.rotation = new BABYLON.Vector3(0, 0, 23.5);
    var earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
    earthMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    earthMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
    earth.material = earthMaterial;
    earth.material.diffuseTexture = new BABYLON.Texture("../images/earth.png", scene);

    BABYLON.SceneLoader.Append("../models/", "map1.glb", scene, function (newMeshes) {
        //shadowGenerator.getShadowMap().renderList.push(newMeshes.meshes[1]);
        var map = scene.getMeshByName("Gale Crater");
        map.position = new BABYLON.Vector3(0, 0, 0);
    });

    BABYLON.SceneLoader.Append("../models/", "nav.glb", scene, function (newMeshes) {
        var nav = scene.getMeshByName("MMSEV");
        nav.position = new BABYLON.Vector3(0, 5, 0);
        //shadowGenerator.getShadowMap().renderList.push(newMeshes.meshes[0]);
    });

    BABYLON.SceneLoader.Append("../models/", "boy.glb", scene, function (newMeshes) {
        var boy = scene.getMeshByName("Z2");
        boy.position = new BABYLON.Vector3(5, 5, 0);
        //shadowGenerator.getShadowMap().renderList.push(newMeshes.meshes[0]);
    });
    // for (var i = 0; i < scene.meshes.length; i++) {
    //     console.log(scene.meshes[i].name)
    //     console.log(scene.meshes[i].id)
    // }
    return scene;
};
var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();

});

window.addEventListener('resize', function () {
    engine.resize();
});
