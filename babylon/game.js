let canvas = document.getElementById('c');
let engine = new BABYLON.Engine(canvas, true);

let bonesOffset = [];
let actualBones = [];
let farCamera;
let CoT;
let nearCamera;
let ground;
let boy;
let messageContainer;
let panel;
let rect2;
let text1;
let mapImage;
let startButton;
let pos1;
let pos2;
let godrays;
let dirLight;
let widthGround;
let heightGround;

let createScene = function () {
    let scene = new BABYLON.Scene(engine);
    scene.shadowsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, GRAVITY, 0);
    scene.collisionsEnabled = true;

    CoT = new BABYLON.TransformNode("root");

    farCamera = new BABYLON.FreeCamera("farCamera", new BABYLON.Vector3.Zero(), scene);
    farCamera.rotation.x = farCamera.rotation.x - Math.PI
    farCamera.checkCollisions = true;
    farCamera.applyGravity = true;
    farCamera.collisionRadius = new BABYLON.Vector3(2, 2, 2)
    farCamera.parent = CoT;
    CoT.position = FAR_CAM_POS;

    nearCamera = new BABYLON.ArcRotateCamera("nearCamera", 0, 0, 0, FAR_CAM_POS, scene);
    nearCamera.lowerRadiusLimit = 0;
    nearCamera.upperRadiusLimit = 50;
    nearCamera.wheelDeltaPercentage = 0.01;
    nearCamera.checkCollisions = true;
    nearCamera.applyGravity = true;
    nearCamera.collisionRadius = new BABYLON.Vector3(2, 1, 2)

    let hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 100, -200), scene);
    hemiLight.intensity = 0.2;
    hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
    hemiLight.specular = new BABYLON.Color3(0.6, 0.6, 0.5);
    hemiLight.groundColor = new BABYLON.Color3(0, 0, 0);

    dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 2), scene);
    dirLight.intensity = 0.8;
    dirLight.diffuse = new BABYLON.Color3(1, 1, 1);
    dirLight.specular = new BABYLON.Color3(1, 1, 1);
    dirLight.ambient = new BABYLON.Color3(1, 1, 1);
    dirLight.groundColor = new BABYLON.Color3(0, 0, 0);
    dirLight.shadowMaxZ = 3000;
    dirLight.shadowMinZ = 1;

    godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, farCamera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
    godrays.mesh.material.diffuseTexture = new BABYLON.Texture('../images/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    godrays.mesh.position = new BABYLON.Vector3(0, 100, -200);
    godrays.mesh.scaling = new BABYLON.Vector3(5, 5, 5);
    dirLight.position = godrays.mesh.position;

    // Shadows
    let shadowGenerator = new BABYLON.ShadowGenerator(5000, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 1;
    shadowGenerator.forceBackFacesOnly = true;
    shadowGenerator.bias = 0.00001;

    // Skybox
    let skybox = BABYLON.Mesh.CreateBox("galaxy", 500.0, scene);
    let skyboxMaterial = new BABYLON.StandardMaterial("galaxyMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.Texture(SKY_PATH, scene, true);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    if (EARTH) {
        let earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 10 }, scene);
        earth.position = new BABYLON.Vector3(200, 100, -100);
        earth.rotation = new BABYLON.Vector3(0, 0, 23.5);
        let earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
        earthMaterial.reflectionTexture = new BABYLON.Texture("../images/earth.jpg", scene, true);
        earthMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
        earth.material = earthMaterial;
    }

    BABYLON.SceneLoader.ImportMesh("Map", "../models/", MAP_PATH, scene, function (newMeshes, particleSystems, skeletons) {
        ground = scene.getMeshByName(newMeshes[0].name);
        ground.position = new BABYLON.Vector3(0, 0, 0);
        ground.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
        shadowGenerator.addShadowCaster(ground);
        shadowGenerator.getShadowMap().renderList.push(ground);
        ground.receiveShadows = true;
        ground.checkCollisions = true;
    });


    BABYLON.SceneLoader.Append("../models/", OBJ_PATH_1, scene, function (newMeshes) {
        let nav = scene.getMeshByName("MMSEV");
        nav.position = OBJ_POS_1;
        nav.scaling = new BABYLON.Vector3(2, 2, 2);
        shadowGenerator.addShadowCaster(nav);
        shadowGenerator.getShadowMap().renderList.push(nav);
        nav.receiveShadows = true;
        nav.checkCollisions = true;
    });

    BABYLON.SceneLoader.ImportMesh("Boy", "../models/", BOY_PATH, scene, function (newMeshes, particleSystems, skeletons) {
        boy = scene.getMeshByName(newMeshes[0].name);
        boy.position = START_POS;
        shadowGenerator.addShadowCaster(boy);
        shadowGenerator.getShadowMap().renderList.push(boy);
        boy.checkCollisions = true;
        boy.applyGravity = true;
        boy.ellipsoid = new BABYLON.Vector3(.6, 1.14, .6);
        boy.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);
        actualBones = {
            "root": skeletons[0].bones.filter((val) => { return val.id == 'root' })[0],
            "trunk": skeletons[0].bones.filter((val) => { return val.id == 'trunk' })[0],
            "leftUpperArm": skeletons[0].bones.filter((val) => { return val.id == 'upperArm.L' })[0],
            "leftLowerArm": skeletons[0].bones.filter((val) => { return val.id == 'lowerArm.L' })[0],
            "leftHand": skeletons[0].bones.filter((val) => { return val.id == 'hand.L' })[0],
            "rightUpperArm": skeletons[0].bones.filter((val) => { return val.id == 'upperArm.R' })[0],
            "rightLowerArm": skeletons[0].bones.filter((val) => { return val.id == 'lowerArm.R' })[0],
            "rightHand": skeletons[0].bones.filter((val) => { return val.id == 'hand.R' })[0],
            "leftUpperLeg": skeletons[0].bones.filter((val) => { return val.id == 'upperLeg.L' })[0],
            "leftLowerLeg": skeletons[0].bones.filter((val) => { return val.id == 'lowerLeg.L' })[0],
            "leftUpperFoot": skeletons[0].bones.filter((val) => { return val.id == 'upperFoot.L' })[0],
            "leftLowerFoot": skeletons[0].bones.filter((val) => { return val.id == 'lowerFoot.L' })[0],
            "rightUpperLeg": skeletons[0].bones.filter((val) => { return val.id == 'upperLeg.R' })[0],
            "rightLowerLeg": skeletons[0].bones.filter((val) => { return val.id == 'lowerLeg.R' })[0],
            "rightUpperFoot": skeletons[0].bones.filter((val) => { return val.id == 'upperFoot.R' })[0],
            "rightLowerFoot": skeletons[0].bones.filter((val) => { return val.id == 'lowerFoot.R' })[0],
            "head": skeletons[0].bones.filter((val) => { return val.id == 'head' })[0],
        }

        bonesOffset = {};
        for (let key in actualBones) {
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
                "id": actualBones[key].id
            };
        }

        // make change of animation smooter
        skeletons[0].animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        skeletons[0].animationPropertiesOverride.enableBlending = true;
        skeletons[0].animationPropertiesOverride.blendingSpeed = 0.05;
        skeletons[0].animationPropertiesOverride.loopMode = 1;

        document.addEventListener('keydown', function (event) {
            if (event.keyCode == 49) { //1 key
                jumpAnimation(actualBones).stop();
                standAnimation(actualBones).stop();
                walkAnimation(actualBones).play(true); //loop
            }
            else if (event.keyCode == 50) { //2 key
                standAnimation(actualBones).stop();
                walkAnimation(actualBones).stop();
                let jump = jumpAnimation(actualBones)
                jump.speedRatio = 0.5; // we can set velocity according to time of flight
                jump.play();

            }
            else if (event.keyCode == 51) { //3 key
                walkAnimation(actualBones).stop();
                jumpAnimation(actualBones).stop();
                standAnimation(actualBones).play();

            }
        });

    });
    scene.shadowsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -1.62, 0);
    scene.collisionsEnabled = true;
    farCamera.checkCollisions = true;
    farCamera.applyGravity = true;
    farCamera.collisionRadius = new BABYLON.Vector3(2, 2, 2);
    return scene;
};

let scene = createScene();

scene.executeWhenReady(function () {
    showGUI();
})

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener('resize', function () {
    engine.resize();
});

function walkAnimation(parts) {
    let walkGroup = new BABYLON.AnimationGroup("Walk");
    let root = new BABYLON.Animation("root", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let trunk = new BABYLON.Animation("trunk", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperArm = new BABYLON.Animation("upperArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerArm = new BABYLON.Animation("lowerArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftHand = new BABYLON.Animation("hand.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperArm = new BABYLON.Animation("upperArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerArm = new BABYLON.Animation("lowerArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightHand = new BABYLON.Animation("hand.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperLeg = new BABYLON.Animation("upperLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerLeg = new BABYLON.Animation("lowerLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperFoot = new BABYLON.Animation("upperFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerFoot = new BABYLON.Animation("lowerFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperLeg = new BABYLON.Animation("upperLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerLeg = new BABYLON.Animation("lowerLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperFoot = new BABYLON.Animation("upperFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerFoot = new BABYLON.Animation("lowerFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let head = new BABYLON.Animation("head", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    let rootKeys = [];
    let trunkKeys = [];
    let leftUpperArmKeys = [];
    let leftLowerArmKeys = [];
    let leftHandKeys = [];
    let rightUpperArmKeys = [];
    let rightLowerArmKeys = [];
    let rightHandKeys = [];
    let leftUpperLegKeys = [];
    let leftLowerLegKeys = [];
    let leftUpperFootKeys = [];
    let leftLowerFootKeys = [];
    let rightUpperLegKeys = [];
    let rightLowerLegKeys = [];
    let rightUpperFootKeys = [];
    let rightLowerFootKeys = [];
    let headKeys = [];

    // root keys
    {
        let y = bonesOffset["root"].position.y;
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
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(4), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(4), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        let x = bonesOffset["leftUpperArm"].rotation.x;
        let y = bonesOffset["leftUpperArm"].rotation.y;
        let z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z + BABYLON.Tool.ToRadians(- 3)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(- 5), y, z + BABYLON.Tool.ToRadians(3)) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArm.setKeys(leftUpperArmKeys);
    }
    // leftLowerArm keys
    {
        let x = bonesOffset["leftLowerArm"].rotation.x;
        let y = bonesOffset["leftLowerArm"].rotation.y;
        let z = bonesOffset["leftLowerArm"].rotation.z;
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArm.setKeys(leftLowerArmKeys);
    }
    // leftHand keys
    {
        let x = bonesOffset["leftHand"].rotation.x;
        let y = bonesOffset["leftHand"].rotation.y;
        let z = bonesOffset["leftHand"].rotation.z;
        leftHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftHand.setKeys(leftHandKeys);
    }
    // rightUpperArm keys
    {
        let x = bonesOffset["rightUpperArm"].rotation.x;
        let y = bonesOffset["rightUpperArm"].rotation.y;
        let z = bonesOffset["rightUpperArm"].rotation.z;
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(- 5), y, z + BABYLON.Tool.ToRadians(3)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z + BABYLON.Tool.ToRadians(-3)) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArm.setKeys(rightUpperArmKeys);
    }
    // rightLowerArm keys
    {
        let x = bonesOffset["rightLowerArm"].rotation.x;
        let y = bonesOffset["rightLowerArm"].rotation.y;
        let z = bonesOffset["rightLowerArm"].rotation.z;
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArm.setKeys(rightLowerArmKeys);
    }
    // rightHand keys
    {
        let x = bonesOffset["rightHand"].rotation.x;
        let y = bonesOffset["rightHand"].rotation.y;
        let z = bonesOffset["rightHand"].rotation.z;
        rightHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightHand.setKeys(rightHandKeys);
    }
    // leftUpperLeg keys
    {
        let x = bonesOffset["leftUpperLeg"].rotation.x;
        let y = bonesOffset["leftUpperLeg"].rotation.y;
        let z = bonesOffset["leftUpperLeg"].rotation.z;
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-7), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-12), y, z) });
        leftUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-8), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(11), y, z) });
        leftUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(23), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        leftUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(13), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        let x = bonesOffset["leftLowerLeg"].rotation.x;
        let y = bonesOffset["leftLowerLeg"].rotation.y;
        let z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(3), y, z) });
        leftLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(19), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(35), y, z) });
        leftLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(27), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-1), y, z) });
        leftLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(13), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        let x = bonesOffset["leftUpperFoot"].rotation.x;
        let y = bonesOffset["leftUpperFoot"].rotation.y;
        let z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(2), y, z) });
        leftUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(14), y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(24), y, z) });
        leftUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(4), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        leftUpperFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        let x = bonesOffset["leftLowerFoot"].rotation.x;
        let y = bonesOffset["leftLowerFoot"].rotation.y;
        let z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        let x = bonesOffset["rightUpperLeg"].rotation.x;
        let y = bonesOffset["rightUpperLeg"].rotation.y;
        let z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(11), y, z) });
        rightUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(23), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        rightUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(13), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-1), y, z) });
        rightUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-7), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-12), y, z) });
        rightUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(-8), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(11), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        let x = bonesOffset["rightLowerLeg"].rotation.x;
        let y = bonesOffset["rightLowerLeg"].rotation.y;
        let z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(35), y, z) });
        rightLowerLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(27), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(0), y, z) });
        rightLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(13), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(0), y, z) });
        rightLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(0), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(3), y, z) });
        rightLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(19), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(35), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        let x = bonesOffset["rightUpperFoot"].rotation.x;
        let y = bonesOffset["rightUpperFoot"].rotation.y;
        let z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(24), y, z) });
        rightUpperFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(4), y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        rightUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(2), y, z) });
        rightUpperFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(14), y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(24), y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        let x = bonesOffset["rightLowerFoot"].rotation.x;
        let y = bonesOffset["rightLowerFoot"].rotation.y;
        let z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        rightLowerFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFoot.setKeys(rightLowerFootKeys);
    }
    // head keys
    {
        let x = bonesOffset["head"].rotation.x;
        let y = bonesOffset["head"].rotation.y;
        let z = bonesOffset["head"].rotation.z;
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
    let jumpGroup = new BABYLON.AnimationGroup("Jump");
    let root = new BABYLON.Animation("root", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let trunk = new BABYLON.Animation("trunk", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperArm = new BABYLON.Animation("upperArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerArm = new BABYLON.Animation("lowerArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftHand = new BABYLON.Animation("hand.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperArm = new BABYLON.Animation("upperArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerArm = new BABYLON.Animation("lowerArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightHand = new BABYLON.Animation("hand.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperLeg = new BABYLON.Animation("upperLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerLeg = new BABYLON.Animation("lowerLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperFoot = new BABYLON.Animation("upperFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerFoot = new BABYLON.Animation("lowerFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperLeg = new BABYLON.Animation("upperLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerLeg = new BABYLON.Animation("lowerLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperFoot = new BABYLON.Animation("upperFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerFoot = new BABYLON.Animation("lowerFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let head = new BABYLON.Animation("head", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    let rootKeys = [];
    let trunkKeys = [];
    let leftUpperArmKeys = [];
    let leftLowerArmKeys = [];
    let leftHandKeys = [];
    let rightUpperArmKeys = [];
    let rightLowerArmKeys = [];
    let rightHandKeys = [];
    let leftUpperLegKeys = [];
    let leftLowerLegKeys = [];
    let leftUpperFootKeys = [];
    let leftLowerFootKeys = [];
    let rightUpperLegKeys = [];
    let rightLowerLegKeys = [];
    let rightUpperFootKeys = [];
    let rightLowerFootKeys = [];
    let headKeys = [];

    // root startingPosition
    // root keys
    {
        let y = bonesOffset["root"].position.y;
        rootKeys.push({ frame: 0, value: y - 0.08 });
        rootKeys.push({ frame: 40, value: y });
        rootKeys.push({ frame: 80, value: y - 0.08 });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(7), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(7), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(7), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(7), y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        let x = bonesOffset["leftUpperArm"].rotation.x;
        let y = bonesOffset["leftUpperArm"].rotation.y;
        let z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z + BABYLON.Tool.ToRadians(4)) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(- 8), y, z + BABYLON.Tool.ToRadians(- 1)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(- 8), y, z + BABYLON.Tool.ToRadians(- 1)) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z + BABYLON.Tool.ToRadians(4)) });
        leftUpperArm.setKeys(leftUpperArmKeys);
    }
    // leftLowerArm keys
    {
        let x = bonesOffset["leftLowerArm"].rotation.x;
        let y = bonesOffset["leftLowerArm"].rotation.y;
        let z = bonesOffset["leftLowerArm"].rotation.z;
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArm.setKeys(leftLowerArmKeys);
    }
    // leftHand keys
    {
        let x = bonesOffset["leftHand"].rotation.x;
        let y = bonesOffset["leftHand"].rotation.y;
        let z = bonesOffset["leftHand"].rotation.z;
        leftHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftHand.setKeys(leftHandKeys);
    }
    // rightUpperArm keys
    {
        let x = bonesOffset["rightUpperArm"].rotation.x;
        let y = bonesOffset["rightUpperArm"].rotation.y;
        let z = bonesOffset["rightUpperArm"].rotation.z;
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z + BABYLON.Tool.ToRadians(4)) });
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(- 8), y, z + BABYLON.Tool.ToRadians(- 1)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(- 8), y, z + BABYLON.Tool.ToRadians(- 1)) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z + BABYLON.Tool.ToRadians(4)) });
        rightUpperArm.setKeys(rightUpperArmKeys);
    }
    // rightLowerArm keys
    {
        let x = bonesOffset["rightLowerArm"].rotation.x;
        let y = bonesOffset["rightLowerArm"].rotation.y;
        let z = bonesOffset["rightLowerArm"].rotation.z;
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArm.setKeys(rightLowerArmKeys);
    }
    // rightHand keys
    {
        let x = bonesOffset["rightHand"].rotation.x;
        let y = bonesOffset["rightHand"].rotation.y;
        let z = bonesOffset["rightHand"].rotation.z;
        rightHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightHand.setKeys(rightHandKeys);
    }
    // leftUpperLeg keys
    {
        let x = bonesOffset["leftUpperLeg"].rotation.x;
        let y = bonesOffset["leftUpperLeg"].rotation.y;
        let z = bonesOffset["leftUpperLeg"].rotation.z;
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(14), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(14), y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        let x = bonesOffset["leftLowerLeg"].rotation.x;
        let y = bonesOffset["leftLowerLeg"].rotation.y;
        let z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(34), y, z) });
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(23), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(15), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(23), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(34), y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        let x = bonesOffset["leftUpperFoot"].rotation.x;
        let y = bonesOffset["leftUpperFoot"].rotation.y;
        let z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        let x = bonesOffset["leftLowerFoot"].rotation.x;
        let y = bonesOffset["leftLowerFoot"].rotation.y;
        let z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z) });
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(8), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(8), y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        let x = bonesOffset["rightUpperLeg"].rotation.x;
        let y = bonesOffset["rightUpperLeg"].rotation.y;
        let z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(14), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(5), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(10), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(14), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        let x = bonesOffset["rightLowerLeg"].rotation.x;
        let y = bonesOffset["rightLowerLeg"].rotation.y;
        let z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(34), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(23), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(15), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(23), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(34), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        let x = bonesOffset["rightUpperFoot"].rotation.x;
        let y = bonesOffset["rightUpperFoot"].rotation.y;
        let z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        let x = bonesOffset["rightLowerFoot"].rotation.x;
        let y = bonesOffset["rightLowerFoot"].rotation.y;
        let z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z) });
        rightLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(8), y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(27), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(8), y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tool.ToRadians(12), y, z) });
        rightLowerFoot.setKeys(rightLowerFootKeys);
    }
    // head keys
    {
        let x = bonesOffset["head"].rotation.x;
        let y = bonesOffset["head"].rotation.y;
        let z = bonesOffset["head"].rotation.z;
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
    let standGroup = new BABYLON.AnimationGroup("Stand");
    let root = new BABYLON.Animation("root", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let trunk = new BABYLON.Animation("trunk", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperArm = new BABYLON.Animation("upperArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerArm = new BABYLON.Animation("lowerArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftHand = new BABYLON.Animation("hand.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperArm = new BABYLON.Animation("upperArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerArm = new BABYLON.Animation("lowerArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightHand = new BABYLON.Animation("hand.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperLeg = new BABYLON.Animation("upperLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerLeg = new BABYLON.Animation("lowerLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftUpperFoot = new BABYLON.Animation("upperFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let leftLowerFoot = new BABYLON.Animation("lowerFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperLeg = new BABYLON.Animation("upperLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerLeg = new BABYLON.Animation("lowerLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightUpperFoot = new BABYLON.Animation("upperFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let rightLowerFoot = new BABYLON.Animation("lowerFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    let head = new BABYLON.Animation("head", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    let rootKeys = [];
    let trunkKeys = [];
    let leftUpperArmKeys = [];
    let leftLowerArmKeys = [];
    let leftHandKeys = [];
    let rightUpperArmKeys = [];
    let rightLowerArmKeys = [];
    let rightHandKeys = [];
    let leftUpperLegKeys = [];
    let leftLowerLegKeys = [];
    let leftUpperFootKeys = [];
    let leftLowerFootKeys = [];
    let rightUpperLegKeys = [];
    let rightLowerLegKeys = [];
    let rightUpperFootKeys = [];
    let rightLowerFootKeys = [];
    let headKeys = [];

    // root startingPosition
    // root keys
    {
        let y = bonesOffset["root"].position.y;
        rootKeys.push({ frame: 0, value: y });
        rootKeys.push({ frame: 80, value: y });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        let x = bonesOffset["leftUpperArm"].rotation.x;
        let y = bonesOffset["leftUpperArm"].rotation.y;
        let z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArm.setKeys(leftUpperArmKeys);
    }
    // leftLowerArm keys
    {
        let x = bonesOffset["leftLowerArm"].rotation.x;
        let y = bonesOffset["leftLowerArm"].rotation.y;
        let z = bonesOffset["leftLowerArm"].rotation.z;
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerArm.setKeys(leftLowerArmKeys);
    }
    // leftHand keys
    {
        let x = bonesOffset["leftHand"].rotation.x;
        let y = bonesOffset["leftHand"].rotation.y;
        let z = bonesOffset["leftHand"].rotation.z;
        leftHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftHand.setKeys(leftHandKeys);
    }
    // rightUpperArm keys
    {
        let x = bonesOffset["rightUpperArm"].rotation.x;
        let y = bonesOffset["rightUpperArm"].rotation.y;
        let z = bonesOffset["rightUpperArm"].rotation.z;
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArm.setKeys(rightUpperArmKeys);
    }
    // rightLowerArm keys
    {
        let x = bonesOffset["rightLowerArm"].rotation.x;
        let y = bonesOffset["rightLowerArm"].rotation.y;
        let z = bonesOffset["rightLowerArm"].rotation.z;
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerArm.setKeys(rightLowerArmKeys);
    }
    // rightHand keys
    {
        let x = bonesOffset["rightHand"].rotation.x;
        let y = bonesOffset["rightHand"].rotation.y;
        let z = bonesOffset["rightHand"].rotation.z;
        rightHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightHand.setKeys(rightHandKeys);
    }
    // leftUpperLeg keys
    {
        let x = bonesOffset["leftUpperLeg"].rotation.x;
        let y = bonesOffset["leftUpperLeg"].rotation.y;
        let z = bonesOffset["leftUpperLeg"].rotation.z;
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        let x = bonesOffset["leftLowerLeg"].rotation.x;
        let y = bonesOffset["leftLowerLeg"].rotation.y;
        let z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        let x = bonesOffset["leftUpperFoot"].rotation.x;
        let y = bonesOffset["leftUpperFoot"].rotation.y;
        let z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        let x = bonesOffset["leftLowerFoot"].rotation.x;
        let y = bonesOffset["leftLowerFoot"].rotation.y;
        let z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        let x = bonesOffset["rightUpperLeg"].rotation.x;
        let y = bonesOffset["rightUpperLeg"].rotation.y;
        let z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        let x = bonesOffset["rightLowerLeg"].rotation.x;
        let y = bonesOffset["rightLowerLeg"].rotation.y;
        let z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        let x = bonesOffset["rightUpperFoot"].rotation.x;
        let y = bonesOffset["rightUpperFoot"].rotation.y;
        let z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        let x = bonesOffset["rightLowerFoot"].rotation.x;
        let y = bonesOffset["rightLowerFoot"].rotation.y;
        let z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFoot.setKeys(rightLowerFootKeys);
    }
    // head keys
    {
        let x = bonesOffset["head"].rotation.x;
        let y = bonesOffset["head"].rotation.y;
        let z = bonesOffset["head"].rotation.z;
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

function slowZoom() {

    //for farCamera move forward
    let movein = new BABYLON.Animation(
        "movein",
        "position",
        20,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    let movein_keys = [];

    movein_keys.push({
        frame: 0,
        value: FAR_CAM_POS.clone()
    });
    movein_keys.push({
        frame: 400,
        value: FAR_CAM_POS.clone().add(new BABYLON.Vector3(0, 0, -40))
    });

    movein.setKeys(movein_keys);

    CoT.animations = [];
    CoT.animations.push(movein);

    scene.beginAnimation(CoT, 0, 400, false, 1);
}

function fastZoom() {

    //for farCamera move forward
    let movein = new BABYLON.Animation(
        "movein",
        "position",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    let movein_keys = [];

    movein_keys.push({
        frame: 0,
        value: CoT.position.clone()
    });
    movein_keys.push({
        frame: 180,
        value: START_POS.clone().add(new BABYLON.Vector3(0, 2, 6))
    });
    movein_keys.push({
        frame: 200,
        value: START_POS.clone().add(new BABYLON.Vector3(0, 2, 4))
    });

    movein.setKeys(movein_keys);
    CoT.animations = [];
    CoT.animations.push(movein);

    scene.beginAnimation(CoT, 0, 200, false, 1, function () {
        fading(rect2, 30, 0, 1);
        nearCamera.position = CoT.position;
        nearCamera.target = boy.position.clone().add(new BABYLON.Vector3(0, 2, 0))
        nearCamera.attachControl(canvas, true);
        scene.activeCamera = nearCamera;
        godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, nearCamera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
        godrays.mesh.material.diffuseTexture = new BABYLON.Texture('../images/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
        godrays.mesh.material.diffuseTexture.hasAlpha = true;
        godrays.mesh.position = new BABYLON.Vector3(0, 100, -200);
        godrays.mesh.scaling = new BABYLON.Vector3(5, 5, 5);
        dirLight.position = godrays.mesh.position;
        farCamera.dispose();
        CoT.dispose();
        messageContainer.dispose();
        panel.dispose();
    });
}

function fading(container, speed, start, end, callback) {

    container.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    container.animationPropertiesOverride.enableBlending = true;
    container.animationPropertiesOverride.blendingSpeed = 0.05;
    container.animationPropertiesOverride.loopMode = 0;


    let animationBox = new BABYLON.Animation("fading", "alpha", speed, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // An array with all animation keys
    let keys = [];

    //At the animation key 0, the value of scaling is "1"
    keys.push({
        frame: 0,
        value: start
    });

    //At the animation key 100, the value of scaling is "1"
    keys.push({
        frame: 100,
        value: end
    });

    animationBox.setKeys(keys);
    container.animations = [];
    container.animations.push(animationBox);
    scene.beginAnimation(container, 0, 100, false, 1, function () {
        if (callback && typeof (callback) === "function") {
            callback();
        }
    });

}

let i = 0;

function typeWriter(callback) {
    if (i < TXT_TASK.length) {
        text1.text += TXT_TASK.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
    } else if (i >= TXT_TASK.length) {
        if (callback && typeof (callback) === "function") {
            callback();
        }
    }
}

function showGUI() {

    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    messageContainer = new BABYLON.GUI.Rectangle();
    messageContainer.height = 0.3;
    messageContainer.width = 0.7;
    messageContainer.cornerRadius = 20;
    messageContainer.color = "Orange";
    advancedTexture.addControl(messageContainer);

    panel = new BABYLON.GUI.StackPanel();
    messageContainer.addControl(panel);

    text1 = new BABYLON.GUI.TextBlock();
    text1.height = "80px";
    text1.width = 1;
    text1.color = "Orange";
    text1.fontSize = 24;
    panel.addControl(text1);

    startButton = BABYLON.GUI.Button.CreateImageWithCenterTextButton("startButton", "START");
    startButton.width = 0.3;
    startButton.height = "40px";
    startButton.cornerRadius = 20;
    startButton.color = "Orange";
    startButton.fontSize = 24;
    startButton.alpha = 0;
    panel.addControl(startButton);

    rect2 = new BABYLON.GUI.Rectangle();
    rect2.height = 0.25;
    rect2.width = 0.1;
    rect2.cornerRadius = 30;
    rect2.color = "Orange";
    rect2.left = '40%';
    rect2.top = '30%';
    rect2.alpha = 0;
    advancedTexture.addControl(rect2);

    mapImage = new BABYLON.GUI.Image("", MINI_MAP_PATH);
    mapImage.width = 1.1;
    mapImage.height = 1.1;
    mapImage.alpha = 0.5;
    rect2.addControl(mapImage);

    pos1 = new BABYLON.GUI.Rectangle();
    pos1.height = "10px";
    pos1.width = "10px";
    pos1.background = "Orange";
    rect2.addControl(pos1);

    pos2 = new BABYLON.GUI.Rectangle();
    pos2.height = "10px";
    pos2.width = "10px";
    pos2.background = "Green";
    rect2.addControl(pos2);

    let rect3 = new BABYLON.GUI.Rectangle();
    rect3.height = 0.20;
    rect3.width = 0.85;
    rect3.cornerRadius = 30;
    rect3.background = "Gray";
    rect3.color = "Orange";
    rect3.top = '-35%';
    rect2.addControl(rect3);

    let panel2 = new BABYLON.GUI.StackPanel();
    rect3.addControl(panel2);

    let text2 = new BABYLON.GUI.TextBlock();
    text2.text = "you: x: y:";
    text2.height = "15px";
    text2.width = 1;
    text2.color = "Orange";
    text2.fontSize = 12;
    panel2.addControl(text2);

    let text3 = new BABYLON.GUI.TextBlock();
    text3.text = "target: x: y:";
    text3.height = "15px";
    text3.width = 1;
    text3.color = "Green";
    text3.fontSize = 12;
    panel2.addControl(text3);

    mapImage.onImageLoadedObservable.addOnce(function () {
        widthGround = ground.getBoundingInfo().boundingBox.extendSize.x * 2
        heightGround = ground.getBoundingInfo().boundingBox.extendSize.z * 2

        pos1.left = boy.position.x / widthGround * mapImage.widthInPixels / 4
        pos1.top = boy.position.z / heightGround * mapImage.heightInPixels / 4

        pos2.left = TARGET_POS.x / widthGround * mapImage.widthInPixels / 4
        pos2.top = TARGET_POS.z / heightGround * mapImage.heightInPixels / 4
    })

    fading(messageContainer, 30, 0, 1,
        typeWriter(
            fading(startButton, 40, 0, 1,
                function () {
                    startButton.onPointerUpObservable.addOnce(function () {
                        fading(panel, 40, 1, 0);
                        fading(messageContainer, 40, 1, 0, fastZoom);
                    });
                }
            )
        )
    )
    slowZoom();
}