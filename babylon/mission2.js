var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);

var pl;
var loaded = false;
var bonesOffset = [];
var actualBones = [];
var currentPosition = new BABYLON.Vector3(5, 4, 0);


function toRad(deg) { return deg * Math.PI / 180; }

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
    //var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

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

    BABYLON.SceneLoader.ImportMesh("ACES", "../models/", "ACES.babylon", scene, function (newMeshes, particleSystems, skeletons) {

        var boy = scene.getMeshByName("ACES");
        boy.position = currentPosition;
        shadowGenerator.getShadowMap().renderList.push(boy);

        actualBones = {
            "root": skeletons[0].bones[0],
            "trunk": skeletons[0].bones[1],
            "leftUpperArm": skeletons[0].bones[2],
            "leftLowerArm": skeletons[0].bones[3],
            "leftHand": skeletons[0].bones[4],
            "rightUpperArm": skeletons[0].bones[5],
            "rightLowerArm": skeletons[0].bones[6],
            "rightHand": skeletons[0].bones[7],
            "leftUpperLeg": skeletons[0].bones[8],
            "leftLowerLeg": skeletons[0].bones[9],
            "leftUpperFoot": skeletons[0].bones[10],
            "leftLowerFoot": skeletons[0].bones[11],
            "rightUpperLeg": skeletons[0].bones[12],
            "rightLowerLeg": skeletons[0].bones[13],
            "rightUpperFoot": skeletons[0].bones[14],
            "rightLowerFoot": skeletons[0].bones[15],
            "head": skeletons[0].bones[16],
        }
        bonesOffset = {};
        for (var key in actualBones) {
            bonesOffset[key] = {
                "rotation": {
                    "x": actualBones[key].rotation.x,
                    "y": actualBones[key].rotation.y,
                    "z": actualBones[key].rotation.z
                },
                "position": {
                    "x": actualBones[key].position.x,
                    "y": actualBones[key].position.y,
                    "z": actualBones[key].position.z
                },
            };
        }

        // make change of animation smooter
        skeletons[0].animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        skeletons[0].animationPropertiesOverride.enableBlending = true;
        skeletons[0].animationPropertiesOverride.blendingSpeed = 0.05;
        skeletons[0].animationPropertiesOverride.loopMode = 1;

        document.addEventListener('keydown', function (event) {
            if (event.keyCode == 49) { //1 key
                walkAnimation(actualBones).play(true);
            }
            else if (event.keyCode == 50) { //2 key
                jumpAnimation(actualBones).play(true);
            }
            else if (event.keyCode == 51) { //3 key
                standAnimation(actualBones).play(true);

            }
        });

        // IDLE
        // if (animation) {
        //     scene.beginAnimation(skeleton, animation.from, animation.to, true);
        //     console.log(scene.beginAnimation(skeleton, animation.from, animation.to, true));
        // }

    });
    // var gravityVector = new BABYLON.Vector3(0, -1.62, 0); // moon gravity
    // var physicsPlugin = new BABYLON.CannonJSPlugin();
    // scene.enablePhysics(gravityVector, physicsPlugin);
    return scene;
};
var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener('resize', function () {
    engine.resize();
});



function walkAnimation(parts) {
    var walkGroup = new BABYLON.AnimationGroup("Walk");
    var root = new BABYLON.Animation("root", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var trunk = new BABYLON.Animation("trunk", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperArm = new BABYLON.Animation("upperArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerArm = new BABYLON.Animation("lowerArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftHand = new BABYLON.Animation("hand.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperArm = new BABYLON.Animation("upperArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerArm = new BABYLON.Animation("lowerArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightHand = new BABYLON.Animation("hand.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperLeg = new BABYLON.Animation("upperLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerLeg = new BABYLON.Animation("lowerLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperFoot = new BABYLON.Animation("upperFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerFoot = new BABYLON.Animation("lowerFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperLeg = new BABYLON.Animation("upperLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerLeg = new BABYLON.Animation("lowerLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperFoot = new BABYLON.Animation("upperFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerFoot = new BABYLON.Animation("lowerFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var head = new BABYLON.Animation("head", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var rootKeys = [];
    var trunkKeys = [];
    var leftUpperArmKeys = [];
    var leftLowerArmKeys = [];
    var leftHandKeys = [];
    var rightUpperArmKeys = [];
    var rightLowerArmKeys = [];
    var rightHandKeys = [];
    var leftUpperLegKeys = [];
    var leftLowerLegKeys = [];
    var leftUpperFootKeys = [];
    var leftLowerFootKeys = [];
    var rightUpperLegKeys = [];
    var rightLowerLegKeys = [];
    var rightUpperFootKeys = [];
    var rightLowerFootKeys = [];
    var headKeys = [];

    // root keys
    {
        var y = bonesOffset["root"].position.y;
        rootKeys.push({ frame: 0, value: y });
        rootKeys.push({ frame: 10, value: y });
        rootKeys.push({ frame: 20, value: y - 0.04 });
        rootKeys.push({ frame: 30, value: y - 0.04 });
        rootKeys.push({ frame: 40, value: y });
        rootKeys.push({ frame: 50, value: y });
        rootKeys.push({ frame: 60, value: y - 0.04 });
        rootKeys.push({ frame: 70, value: y - 0.04 });
        rootKeys.push({ frame: 80, value: y });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        var x = bonesOffset["trunk"].rotation.x;
        var y = bonesOffset["trunk"].rotation.y;
        var z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(4), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(4), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        var x = bonesOffset["leftUpperArm"].rotation.x;
        var y = bonesOffset["leftUpperArm"].rotation.y;
        var z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(5), y, z + toRad(- 3)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(- 5), y, z + toRad(3)) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArm.setKeys(leftUpperArmKeys);
    }
    // leftLowerArm keys
    {
        var x = bonesOffset["leftLowerArm"].rotation.x;
        var y = bonesOffset["leftLowerArm"].rotation.y;
        var z = bonesOffset["leftLowerArm"].rotation.z;
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArm.setKeys(leftLowerArmKeys);
    }
    // leftHand keys
    {
        var x = bonesOffset["leftHand"].rotation.x;
        var y = bonesOffset["leftHand"].rotation.y;
        var z = bonesOffset["leftHand"].rotation.z;
        leftHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftHand.setKeys(leftHandKeys);
    }
    // rightUpperArm keys
    {
        var x = bonesOffset["rightUpperArm"].rotation.x;
        var y = bonesOffset["rightUpperArm"].rotation.y;
        var z = bonesOffset["rightUpperArm"].rotation.z;
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(- 5), y, z + toRad(3)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(5), y, z + toRad(-3)) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArm.setKeys(rightUpperArmKeys);
    }
    // rightLowerArm keys
    {
        var x = bonesOffset["rightLowerArm"].rotation.x;
        var y = bonesOffset["rightLowerArm"].rotation.y;
        var z = bonesOffset["rightLowerArm"].rotation.z;
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArm.setKeys(rightLowerArmKeys);
    }
    // rightHand keys
    {
        var x = bonesOffset["rightHand"].rotation.x;
        var y = bonesOffset["rightHand"].rotation.y;
        var z = bonesOffset["rightHand"].rotation.z;
        rightHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightHand.setKeys(rightHandKeys);
    }
    // leftUpperLeg keys
    {
        var x = bonesOffset["leftUpperLeg"].rotation.x;
        var y = bonesOffset["leftUpperLeg"].rotation.y;
        var z = bonesOffset["leftUpperLeg"].rotation.z;
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + toRad(-7), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(-12), y, z) });
        leftUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + toRad(-8), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(11), y, z) });
        leftUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + toRad(23), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        leftUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + toRad(13), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        var x = bonesOffset["leftLowerLeg"].rotation.x;
        var y = bonesOffset["leftLowerLeg"].rotation.y;
        var z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(3), y, z) });
        leftLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + toRad(19), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(35), y, z) });
        leftLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + toRad(27), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(-1), y, z) });
        leftLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + toRad(13), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        var x = bonesOffset["leftUpperFoot"].rotation.x;
        var y = bonesOffset["leftUpperFoot"].rotation.y;
        var z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(2), y, z) });
        leftUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + toRad(14), y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(24), y, z) });
        leftUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + toRad(4), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        leftUpperFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        var x = bonesOffset["leftLowerFoot"].rotation.x;
        var y = bonesOffset["leftLowerFoot"].rotation.y;
        var z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        var x = bonesOffset["rightUpperLeg"].rotation.x;
        var y = bonesOffset["rightUpperLeg"].rotation.y;
        var z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(11), y, z) });
        rightUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + toRad(23), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        rightUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + toRad(13), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(-1), y, z) });
        rightUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + toRad(-7), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(-12), y, z) });
        rightUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + toRad(-8), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(11), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        var x = bonesOffset["rightLowerLeg"].rotation.x;
        var y = bonesOffset["rightLowerLeg"].rotation.y;
        var z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(35), y, z) });
        rightLowerLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + toRad(27), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(0), y, z) });
        rightLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + toRad(13), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(0), y, z) });
        rightLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + toRad(0), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(3), y, z) });
        rightLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + toRad(19), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(35), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        var x = bonesOffset["rightUpperFoot"].rotation.x;
        var y = bonesOffset["rightUpperFoot"].rotation.y;
        var z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(24), y, z) });
        rightUpperFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + toRad(4), y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        rightUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(2), y, z) });
        rightUpperFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x + toRad(14), y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(24), y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        var x = bonesOffset["rightLowerFoot"].rotation.x;
        var y = bonesOffset["rightLowerFoot"].rotation.y;
        var z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        rightLowerFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFoot.setKeys(rightLowerFootKeys);
    }
    // head keys
    {
        var x = bonesOffset["head"].rotation.x;
        var y = bonesOffset["head"].rotation.y;
        var z = bonesOffset["head"].rotation.z;
        headKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        headKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        head.setKeys(headKeys);
    }

    walkGroup.addTargetedAnimation(root, parts["root"]);
    walkGroup.addTargetedAnimation(trunk, parts["trunk"]);
    walkGroup.addTargetedAnimation(leftUpperArm, parts["leftUpperArm"]);
    walkGroup.addTargetedAnimation(leftLowerArm, parts["leftLowerArm"]);
    walkGroup.addTargetedAnimation(leftHand, parts["leftHand"]);
    walkGroup.addTargetedAnimation(rightUpperArm, parts["rightUpperArm"]);
    walkGroup.addTargetedAnimation(rightLowerArm, parts["rightLowerArm"]);
    walkGroup.addTargetedAnimation(rightHand, parts["rightHand"]);
    walkGroup.addTargetedAnimation(leftUpperLeg, parts["leftUpperLeg"]);
    walkGroup.addTargetedAnimation(leftLowerLeg, parts["leftLowerLeg"]);
    walkGroup.addTargetedAnimation(leftUpperFoot, parts["leftUpperFoot"]);
    walkGroup.addTargetedAnimation(leftLowerFoot, parts["leftLowerFoot"]);
    walkGroup.addTargetedAnimation(rightUpperLeg, parts["rightUpperLeg"]);
    walkGroup.addTargetedAnimation(rightLowerLeg, parts["rightLowerLeg"]);
    walkGroup.addTargetedAnimation(rightUpperFoot, parts["rightUpperFoot"]);
    walkGroup.addTargetedAnimation(rightLowerFoot, parts["rightLowerFoot"]);
    walkGroup.addTargetedAnimation(head, parts["head"]);
    walkGroup.normalize(0, 80);

    return walkGroup;
}

function jumpAnimation(parts) {
    var jumpGroup = new BABYLON.AnimationGroup("Jump");
    var root = new BABYLON.Animation("root", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var trunk = new BABYLON.Animation("trunk", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperArm = new BABYLON.Animation("upperArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerArm = new BABYLON.Animation("lowerArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftHand = new BABYLON.Animation("hand.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperArm = new BABYLON.Animation("upperArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerArm = new BABYLON.Animation("lowerArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightHand = new BABYLON.Animation("hand.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperLeg = new BABYLON.Animation("upperLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerLeg = new BABYLON.Animation("lowerLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperFoot = new BABYLON.Animation("upperFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerFoot = new BABYLON.Animation("lowerFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperLeg = new BABYLON.Animation("upperLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerLeg = new BABYLON.Animation("lowerLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperFoot = new BABYLON.Animation("upperFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerFoot = new BABYLON.Animation("lowerFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var head = new BABYLON.Animation("head", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var rootKeys = [];
    var trunkKeys = [];
    var leftUpperArmKeys = [];
    var leftLowerArmKeys = [];
    var leftHandKeys = [];
    var rightUpperArmKeys = [];
    var rightLowerArmKeys = [];
    var rightHandKeys = [];
    var leftUpperLegKeys = [];
    var leftLowerLegKeys = [];
    var leftUpperFootKeys = [];
    var leftLowerFootKeys = [];
    var rightUpperLegKeys = [];
    var rightLowerLegKeys = [];
    var rightUpperFootKeys = [];
    var rightLowerFootKeys = [];
    var headKeys = [];

    // root currentPosition
    // root keys
    {
        var y = bonesOffset["root"].position.y;
        rootKeys.push({ frame: 0, value: y - 0.08 });
        rootKeys.push({ frame: 40, value: y });
        rootKeys.push({ frame: 80, value: y - 0.08 });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        var x = bonesOffset["trunk"].rotation.x;
        var y = bonesOffset["trunk"].rotation.y;
        var z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(7), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(7), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(7), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(7), y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        var x = bonesOffset["leftUpperArm"].rotation.x;
        var y = bonesOffset["leftUpperArm"].rotation.y;
        var z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(12), y, z + toRad(4)) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(- 8), y, z + toRad(- 1)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(- 8), y, z + toRad(- 1)) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(12), y, z + toRad(4)) });
        leftUpperArm.setKeys(leftUpperArmKeys);
    }
    // leftLowerArm keys
    {
        var x = bonesOffset["leftLowerArm"].rotation.x;
        var y = bonesOffset["leftLowerArm"].rotation.y;
        var z = bonesOffset["leftLowerArm"].rotation.z;
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArm.setKeys(leftLowerArmKeys);
    }
    // leftHand keys
    {
        var x = bonesOffset["leftHand"].rotation.x;
        var y = bonesOffset["leftHand"].rotation.y;
        var z = bonesOffset["leftHand"].rotation.z;
        leftHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftHand.setKeys(leftHandKeys);
    }
    // rightUpperArm keys
    {
        var x = bonesOffset["rightUpperArm"].rotation.x;
        var y = bonesOffset["rightUpperArm"].rotation.y;
        var z = bonesOffset["rightUpperArm"].rotation.z;
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(12), y, z + toRad(4)) });
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(- 8), y, z + toRad(- 1)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(- 8), y, z + toRad(- 1)) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(12), y, z + toRad(4)) });
        rightUpperArm.setKeys(rightUpperArmKeys);
    }
    // rightLowerArm keys
    {
        var x = bonesOffset["rightLowerArm"].rotation.x;
        var y = bonesOffset["rightLowerArm"].rotation.y;
        var z = bonesOffset["rightLowerArm"].rotation.z;
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArm.setKeys(rightLowerArmKeys);
    }
    // rightHand keys
    {
        var x = bonesOffset["rightHand"].rotation.x;
        var y = bonesOffset["rightHand"].rotation.y;
        var z = bonesOffset["rightHand"].rotation.z;
        rightHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightHand.setKeys(rightHandKeys);
    }
    // leftUpperLeg keys
    {
        var x = bonesOffset["leftUpperLeg"].rotation.x;
        var y = bonesOffset["leftUpperLeg"].rotation.y;
        var z = bonesOffset["leftUpperLeg"].rotation.z;
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(14), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(14), y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        var x = bonesOffset["leftLowerLeg"].rotation.x;
        var y = bonesOffset["leftLowerLeg"].rotation.y;
        var z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(34), y, z) });
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(23), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(15), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(23), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(34), y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        var x = bonesOffset["leftUpperFoot"].rotation.x;
        var y = bonesOffset["leftUpperFoot"].rotation.y;
        var z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(12), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        var x = bonesOffset["leftLowerFoot"].rotation.x;
        var y = bonesOffset["leftLowerFoot"].rotation.y;
        var z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(12), y, z) });
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + toRad(8), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + toRad(8), y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(12), y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        var x = bonesOffset["rightUpperLeg"].rotation.x;
        var y = bonesOffset["rightUpperLeg"].rotation.y;
        var z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(14), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(14), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        var x = bonesOffset["rightLowerLeg"].rotation.x;
        var y = bonesOffset["rightLowerLeg"].rotation.y;
        var z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(34), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(23), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(15), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(23), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(34), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        var x = bonesOffset["rightUpperFoot"].rotation.x;
        var y = bonesOffset["rightUpperFoot"].rotation.y;
        var z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(12), y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        var x = bonesOffset["rightLowerFoot"].rotation.x;
        var y = bonesOffset["rightLowerFoot"].rotation.y;
        var z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + toRad(12), y, z) });
        rightLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(8), y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(27), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(8), y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + toRad(12), y, z) });
        rightLowerFoot.setKeys(rightLowerFootKeys);
    }
    // head keys
    {
        var x = bonesOffset["head"].rotation.x;
        var y = bonesOffset["head"].rotation.y;
        var z = bonesOffset["head"].rotation.z;
        headKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        headKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        head.setKeys(headKeys);
    }

    jumpGroup.addTargetedAnimation(root, parts["root"]);
    jumpGroup.addTargetedAnimation(trunk, parts["trunk"]);
    jumpGroup.addTargetedAnimation(leftUpperArm, parts["leftUpperArm"]);
    jumpGroup.addTargetedAnimation(leftLowerArm, parts["leftLowerArm"]);
    jumpGroup.addTargetedAnimation(leftHand, parts["leftHand"]);
    jumpGroup.addTargetedAnimation(rightUpperArm, parts["rightUpperArm"]);
    jumpGroup.addTargetedAnimation(rightLowerArm, parts["rightLowerArm"]);
    jumpGroup.addTargetedAnimation(rightHand, parts["rightHand"]);
    jumpGroup.addTargetedAnimation(leftUpperLeg, parts["leftUpperLeg"]);
    jumpGroup.addTargetedAnimation(leftLowerLeg, parts["leftLowerLeg"]);
    jumpGroup.addTargetedAnimation(leftUpperFoot, parts["leftUpperFoot"]);
    jumpGroup.addTargetedAnimation(leftLowerFoot, parts["leftLowerFoot"]);
    jumpGroup.addTargetedAnimation(rightUpperLeg, parts["rightUpperLeg"]);
    jumpGroup.addTargetedAnimation(rightLowerLeg, parts["rightLowerLeg"]);
    jumpGroup.addTargetedAnimation(rightUpperFoot, parts["rightUpperFoot"]);
    jumpGroup.addTargetedAnimation(rightLowerFoot, parts["rightLowerFoot"]);
    jumpGroup.addTargetedAnimation(head, parts["head"]);
    jumpGroup.normalize(0, 80);

    return jumpGroup;
}

function standAnimation(parts) {
    var standGroup = new BABYLON.AnimationGroup("Stand");
    var root = new BABYLON.Animation("root", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var trunk = new BABYLON.Animation("trunk", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperArm = new BABYLON.Animation("upperArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerArm = new BABYLON.Animation("lowerArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftHand = new BABYLON.Animation("hand.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperArm = new BABYLON.Animation("upperArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerArm = new BABYLON.Animation("lowerArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightHand = new BABYLON.Animation("hand.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperLeg = new BABYLON.Animation("upperLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerLeg = new BABYLON.Animation("lowerLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftUpperFoot = new BABYLON.Animation("upperFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var leftLowerFoot = new BABYLON.Animation("lowerFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperLeg = new BABYLON.Animation("upperLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerLeg = new BABYLON.Animation("lowerLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightUpperFoot = new BABYLON.Animation("upperFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var rightLowerFoot = new BABYLON.Animation("lowerFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var head = new BABYLON.Animation("head", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    var rootKeys = [];
    var trunkKeys = [];
    var leftUpperArmKeys = [];
    var leftLowerArmKeys = [];
    var leftHandKeys = [];
    var rightUpperArmKeys = [];
    var rightLowerArmKeys = [];
    var rightHandKeys = [];
    var leftUpperLegKeys = [];
    var leftLowerLegKeys = [];
    var leftUpperFootKeys = [];
    var leftLowerFootKeys = [];
    var rightUpperLegKeys = [];
    var rightLowerLegKeys = [];
    var rightUpperFootKeys = [];
    var rightLowerFootKeys = [];
    var headKeys = [];

    // root currentPosition
    // root keys
    {
        var y = bonesOffset["root"].position.y;
        rootKeys.push({ frame: 0, value: y });
        rootKeys.push({ frame: 80, value: y });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        var x = bonesOffset["trunk"].rotation.x;
        var y = bonesOffset["trunk"].rotation.y;
        var z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        var x = bonesOffset["leftUpperArm"].rotation.x;
        var y = bonesOffset["leftUpperArm"].rotation.y;
        var z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArm.setKeys(leftUpperArmKeys);
    }
    // leftLowerArm keys
    {
        var x = bonesOffset["leftLowerArm"].rotation.x;
        var y = bonesOffset["leftLowerArm"].rotation.y;
        var z = bonesOffset["leftLowerArm"].rotation.z;
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArm.setKeys(leftLowerArmKeys);
    }
    // leftHand keys
    {
        var x = bonesOffset["leftHand"].rotation.x;
        var y = bonesOffset["leftHand"].rotation.y;
        var z = bonesOffset["leftHand"].rotation.z;
        leftHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftHand.setKeys(leftHandKeys);
    }
    // rightUpperArm keys
    {
        var x = bonesOffset["rightUpperArm"].rotation.x;
        var y = bonesOffset["rightUpperArm"].rotation.y;
        var z = bonesOffset["rightUpperArm"].rotation.z;
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArm.setKeys(rightUpperArmKeys);
    }
    // rightLowerArm keys
    {
        var x = bonesOffset["rightLowerArm"].rotation.x;
        var y = bonesOffset["rightLowerArm"].rotation.y;
        var z = bonesOffset["rightLowerArm"].rotation.z;
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArm.setKeys(rightLowerArmKeys);
    }
    // rightHand keys
    {
        var x = bonesOffset["rightHand"].rotation.x;
        var y = bonesOffset["rightHand"].rotation.y;
        var z = bonesOffset["rightHand"].rotation.z;
        rightHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightHand.setKeys(rightHandKeys);
    }
    // leftUpperLeg keys
    {
        var x = bonesOffset["leftUpperLeg"].rotation.x;
        var y = bonesOffset["leftUpperLeg"].rotation.y;
        var z = bonesOffset["leftUpperLeg"].rotation.z;
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        var x = bonesOffset["leftLowerLeg"].rotation.x;
        var y = bonesOffset["leftLowerLeg"].rotation.y;
        var z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        var x = bonesOffset["leftUpperFoot"].rotation.x;
        var y = bonesOffset["leftUpperFoot"].rotation.y;
        var z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        var x = bonesOffset["leftLowerFoot"].rotation.x;
        var y = bonesOffset["leftLowerFoot"].rotation.y;
        var z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        var x = bonesOffset["rightUpperLeg"].rotation.x;
        var y = bonesOffset["rightUpperLeg"].rotation.y;
        var z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        var x = bonesOffset["rightLowerLeg"].rotation.x;
        var y = bonesOffset["rightLowerLeg"].rotation.y;
        var z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        var x = bonesOffset["rightUpperFoot"].rotation.x;
        var y = bonesOffset["rightUpperFoot"].rotation.y;
        var z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        var x = bonesOffset["rightLowerFoot"].rotation.x;
        var y = bonesOffset["rightLowerFoot"].rotation.y;
        var z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFoot.setKeys(rightLowerFootKeys);
    }
    // head keys
    {
        var x = bonesOffset["head"].rotation.x;
        var y = bonesOffset["head"].rotation.y;
        var z = bonesOffset["head"].rotation.z;
        headKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        headKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        head.setKeys(headKeys);
    }

    standGroup.addTargetedAnimation(root, parts["root"]);
    standGroup.addTargetedAnimation(trunk, parts["trunk"]);
    standGroup.addTargetedAnimation(leftUpperArm, parts["leftUpperArm"]);
    standGroup.addTargetedAnimation(leftLowerArm, parts["leftLowerArm"]);
    standGroup.addTargetedAnimation(leftHand, parts["leftHand"]);
    standGroup.addTargetedAnimation(rightUpperArm, parts["rightUpperArm"]);
    standGroup.addTargetedAnimation(rightLowerArm, parts["rightLowerArm"]);
    standGroup.addTargetedAnimation(rightHand, parts["rightHand"]);
    standGroup.addTargetedAnimation(leftUpperLeg, parts["leftUpperLeg"]);
    standGroup.addTargetedAnimation(leftLowerLeg, parts["leftLowerLeg"]);
    standGroup.addTargetedAnimation(leftUpperFoot, parts["leftUpperFoot"]);
    standGroup.addTargetedAnimation(leftLowerFoot, parts["leftLowerFoot"]);
    standGroup.addTargetedAnimation(rightUpperLeg, parts["rightUpperLeg"]);
    standGroup.addTargetedAnimation(rightLowerLeg, parts["rightLowerLeg"]);
    standGroup.addTargetedAnimation(rightUpperFoot, parts["rightUpperFoot"]);
    standGroup.addTargetedAnimation(rightLowerFoot, parts["rightLowerFoot"]);
    standGroup.addTargetedAnimation(head, parts["head"]);
    standGroup.normalize(0, 80);

    return standGroup;
}

//"root" "trunk" "leftUpperArm" "leftLowerArm" "leftHand" "rightUpperArm" "rightLowerArm" "rightHand" "leftUpperLeg" "leftLowerLeg" "leftUpperFoot" "leftLowerFoot" "rightUpperLeg" "rightLowerLeg" "rightUpperFoot" "rightLowerFoot" "head" "meshSupport1" "leftMeshSupport3" "rightMeshSupport3" "meshSupport2"



// var body_parts = {
//     "root": scene.getMeshByID("root"), // 0
//     "trunk": scene.getMeshByID("trunk"), // 1
//     "leftUpperArm": scene.getMeshByID("upperArm.L"), // 2
//     "leftLowerArm": scene.getMeshByID("lowerArm.L"), // 3
//     "leftHand": scene.getMeshByID("hand.L"), // 4
//     "rightUpperArm": scene.getMeshByID("upperArm.R"), // 5
//     "rightLowerArm": scene.getMeshByID("lowerArm.R"), // 6
//     "rightHand": scene.getMeshByID("hand.R"), // 7
//     "leftUpperLeg": scene.getMeshByID("upperLeg.L"), // 8
//     "leftLowerLeg": scene.getMeshByID("lowerLeg.L"), // 9
//     "leftUpperFoot": scene.getMeshByID("upperFoot.L"), // 10
//     "leftLowerFoot": scene.getMeshByID("lowerFoot.L"), // 11
//     "rightUpperLeg": scene.getMeshByID("upperLeg.R"), //12
//     "rightLowerLeg": scene.getMeshByID("lowerLeg.R"), // 13
//     "rightUpperFoot": scene.getMeshByID("upperFoot.R"), // 14
//     "rightLowerFoot": scene.getMeshByID("lowerFoot.R"), // 15
//     "head": scene.getMeshByID("head"), // 16
//     "meshSupport1": scene.getMeshByID("meshSupport1"), // 17
//     "leftMeshSupport3": scene.getMeshByID("meshSupport3.L"), // 18
//     "rightMeshSupport3": scene.getMeshByID("meshSupport4.R"), // 19
//     "meshSupport2": scene.getMeshByID("meshSupport2") // 20
// }