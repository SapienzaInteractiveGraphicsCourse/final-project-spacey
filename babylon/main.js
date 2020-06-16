var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);

var pl;
var loaded = false;

class Player {
    constructor(mesh) {
        this._mesh = mesh;
    }
    update(pos) {
        this._mesh.position = pos;
    }
    getPosX() {
        return this._mesh.position.x;
    }
}

var createScene = function () {

    engine.enableOfflineSupport = false;

    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 3, new BABYLON.Vector3(5, 5, 0), scene);
    camera.attachControl(canvas, true);

    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 50;
    camera.wheelDeltaPercentage = 0.01;

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 50, -200), scene);
    light.intensity = 0.6;
    light.specular = BABYLON.Color3.White();

    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 50, -200), scene);
    var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
    godrays.mesh.material.diffuseTexture = new BABYLON.Texture('../images/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    godrays.mesh.position = new BABYLON.Vector3(0, 50, -200);
    godrays.mesh.scaling = new BABYLON.Vector3(5, 5, 5);
    light.position = godrays.mesh.position;

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.useVarianceShadowMap = true;
    shadowGenerator.usePoissonSampling = true;
    shadowGenerator.bias = 0.01;

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("galaxy", 500.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("galaxyMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.Texture("../images/galaxy.png", scene, true);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;


    var earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 12 }, scene);
    earth.position = new BABYLON.Vector3(100, 50, -200);
    earth.rotation = new BABYLON.Vector3(0, 0, 23.5);
    var earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
    earthMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    earthMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
    earth.material = earthMaterial;
    earth.material.diffuseTexture = new BABYLON.Texture("../images/earth.png", scene);

    // integrate ground with map1
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    BABYLON.SceneLoader.Append("../models/", "map1.glb", scene, function (newMeshes) {
        var map = scene.getMeshByName("Gale Crater");
        map.position = new BABYLON.Vector3(0, 0, 0);
        shadowGenerator.getShadowMap().renderList.push(map);
    });

    BABYLON.SceneLoader.Append("../models/", "nav.glb", scene, function (newMeshes) {
        var nav = scene.getMeshByName("MMSEV");
        nav.position = new BABYLON.Vector3(0, 5, 0);
        shadowGenerator.getShadowMap().renderList.push(nav);
    });

    BABYLON.SceneLoader.ImportMesh("Z2", "../models/", "boy.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        // for (var i = 0; i < scene.meshes.length; i++) {
        //     console.log(scene.meshes[i].name)
        //     console.log(scene.meshes[i].id)
        // }
        var boy = scene.getMeshByName("Z2");
        shadowGenerator.getShadowMap().renderList.push(boy);
        pl = new Player(boy);
        loaded = true;
        var skeleton = skeletons[0];

        // ROBOT
        skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        skeleton.animationPropertiesOverride.enableBlending = true;
        skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
        skeleton.animationPropertiesOverride.loopMode = 1;

        var animation = skeleton.getAnimationRange("Walk");

        document.addEventListener('keydown', function (event) {
            skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
            skeleton.animationPropertiesOverride.enableBlending = true;
            skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
            skeleton.animationPropertiesOverride.loopMode = 1;
            if (event.keyCode == 49) {
                animation = skeleton.getAnimationRange("Walk");
            }
            else if (event.keyCode == 50) {
                animation = skeleton.getAnimationRange("Jump");
            }
            else if (event.keyCode == 51) {
                animation = skeleton.getAnimationRange("Stand");
            }
            scene.beginAnimation(skeleton, animation.from, animation.to, true);

        });

        // IDLE
        if (animation) scene.beginAnimation(skeleton, animation.from, animation.to, true);

    });
    var gravityVector = new BABYLON.Vector3(0, -1.62, 0); // moon gravity
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    return scene;
};
var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
    if (loaded) {
        pl.update(new BABYLON.Vector3(5, 4, 0))
    }

});

window.addEventListener('resize', function () {
    engine.resize();
});


