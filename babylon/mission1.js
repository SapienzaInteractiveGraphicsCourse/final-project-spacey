var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);

var pl;
var loaded = false;
var bonesOffset = [];
var actualBones = [];
var currentPosition = new BABYLON.Vector3(-10, -22, -10);
var targetPosition = new BABYLON.Vector3(20, -22, 150);
var cameraPosition = new BABYLON.Vector3(0, 50, 0);
var camera;
var ground;
var boy;
var rect1;
var panel;
var rect2;
var text1;
var img;
var button;

function radians(deg) { return deg * Math.PI / 180; }

var createScene = function () {

    //engine.enableOfflineSupport = false;

    var scene = new BABYLON.Scene(engine);
    camera = new BABYLON.FreeCamera("camera1", cameraPosition, scene);
    //camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 3, cameraPosition, scene);
    camera.rotation.x = camera.rotation.x - Math.PI
    var hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 100, -200), scene);
    hemiLight.intensity = 0.2;
    hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
    hemiLight.specular = new BABYLON.Color3(0.6, 0.6, 0.5);
    hemiLight.groundColor = new BABYLON.Color3(0, 0, 0);

    var dirLight = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0, -1, 2), scene);
    dirLight.intensity = 0.8;
    dirLight.diffuse = new BABYLON.Color3(1, 1, 1);
    dirLight.specular = new BABYLON.Color3(1, 1, 1);
    dirLight.ambient = new BABYLON.Color3(1, 1, 1);
    dirLight.groundColor = new BABYLON.Color3(0, 0, 0);
    dirLight.shadowMaxZ = 3000;
    dirLight.shadowMinZ = 1;

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");


    rect1 = new BABYLON.GUI.Rectangle();
    rect1.height = 0.3;
    rect1.width = 0.7;
    rect1.cornerRadius = 20;
    rect1.color = "Orange";
    advancedTexture.addControl(rect1);

    panel = new BABYLON.GUI.StackPanel();
    rect1.addControl(panel);

    text1 = new BABYLON.GUI.TextBlock();
    text1.text = "MISSION 1: Hurry up! Your partner needs you, oxigen is running out!";
    text1.height = "80px";
    text1.width = 1;
    text1.color = "Orange";
    text1.fontSize = 24;
    panel.addControl(text1);

    button = BABYLON.GUI.Button.CreateImageWithCenterTextButton("button", "START");
    button.width = 0.3;
    button.height = "40px";
    button.cornerRadius = 20;
    button.color = "Orange";
    button.fontSize = 24;
    button.alpha = 0;
    panel.addControl(button);

    button.onPointerUpObservable.add(function () {
        fading(rect1, 1, 0);
        fading(button, 1, 0);
        zoomIn();
    });

    rect2 = new BABYLON.GUI.Rectangle();
    rect2.height = 0.25;
    rect2.width = 0.1;
    rect2.cornerRadius = 30;
    rect2.color = "Orange";
    rect2.left = '40%';
    rect2.top = '30%';
    rect2.alpha = 0;
    advancedTexture.addControl(rect2);


    img = new BABYLON.GUI.Image("", "../images/heightmap.png");
    img.width = 1.1;
    img.height = 1.1;
    img.alpha = 0.5;
    rect2.addControl(img);

    var pos1 = new BABYLON.GUI.Rectangle();
    pos1.height = "10px";
    pos1.width = "10px";
    pos1.background = "Orange";
    rect2.addControl(pos1);

    var pos2 = new BABYLON.GUI.Rectangle();
    pos2.height = "10px";
    pos2.width = "10px";
    pos2.background = "Green";
    rect2.addControl(pos2);

    var rect3 = new BABYLON.GUI.Rectangle();
    rect3.height = 0.20;
    rect3.width = 0.85;
    rect3.cornerRadius = 30;
    rect3.background = "Gray";
    rect3.color = "Orange";
    rect3.top = '-35%';
    rect2.addControl(rect3);

    var panel2 = new BABYLON.GUI.StackPanel();
    rect3.addControl(panel2);

    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "you: x: y:";
    text2.height = "15px";
    text2.width = 1;
    text2.color = "Orange";
    text2.fontSize = 12;
    panel2.addControl(text2);

    var text3 = new BABYLON.GUI.TextBlock();
    text3.text = "target: x: y:";
    text3.height = "15px";
    text3.width = 1;
    text3.color = "Green";
    text3.fontSize = 12;
    panel2.addControl(text3);
    //targetPosition

    // var pointLight = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 100, -200), scene);
    // pointLight.intensity = 0.5;
    // pointLight.diffuse = new BABYLON.Color3(1, 1, 1);
    // //pointLight.specular = new BABYLON.Color3(1, 1, 1);
    // pointLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    // pointLight.shadowMaxZ = 1000;
    // pointLight.shadowMinZ = 0.1;
    var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
    godrays.mesh.material.diffuseTexture = new BABYLON.Texture('../images/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    godrays.mesh.position = new BABYLON.Vector3(0, 100, -200);
    godrays.mesh.scaling = new BABYLON.Vector3(5, 5, 5);
    dirLight.position = godrays.mesh.position;
    //camera.setTarget(scene.getMeshByName("godrays"));
    //camera.target = dirLight.position;

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(5000, dirLight);
    //shadowGenerator.useBlurCloseExponentialShadowMap = true;
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 1;
    shadowGenerator.forceBackFacesOnly = true;
    shadowGenerator.bias = 0.00001;
    //shadowGenerator.useBlurExponentialShadowMap = true;
    //shadowGenerator.blurScale = 10;
    //shadowGenerator.setDarkness(0.5);
    //shadowGenerator.blurBoxOffset = 5.0;
    //shadowGenerator.forceBackFacesOnly = true;
    //shadowGenerator.blurKernel = 32;
    //shadowGenerator.useKernelBlur = true;
    //shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_LOW;
    //shadowGenerator.bias = 0.01;
    //shadowGenerator.useContactHardeningShadow = true;
    //shadowGenerator.setDarkness(0.4);

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("galaxy", 500.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("galaxyMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.Texture("../images/galaxy.png", scene, true);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;


    var earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 10 }, scene);
    earth.position = new BABYLON.Vector3(200, 100, -100);
    earth.rotation = new BABYLON.Vector3(0, 0, 23.5);
    var earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
    //earthMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    //earthMaterial.ambientColor = new BABYLON.Color3(1, 1, 1);
    earthMaterial.specularColor = new BABYLON.Color3(135 / 255, 206 / 255, 250 / 255);
    earth.material = earthMaterial;
    earth.material.diffuseTexture = new BABYLON.Texture("../images/earth.png", scene);


    BABYLON.SceneLoader.Append("../models/", "l1_new_big.glb", scene, function (newMeshes) {
        ground = scene.getMeshByName("Gale Crater");
        ground.position = new BABYLON.Vector3(0, 0, 0);
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        ground.material = groundMaterial;
        shadowGenerator.addShadowCaster(ground);
        shadowGenerator.getShadowMap().renderList.push(ground);
        ground.receiveShadows = true;
        //finally, say which mesh will be collisionable
        ground.checkCollisions = true;

        var widthGround = ground.getBoundingInfo().boundingBox.extendSize.x * 2
        var heightGround = ground.getBoundingInfo().boundingBox.extendSize.z * 2

        pos1.left = boy.position.x / widthGround * img.widthInPixels / 4
        pos1.top = boy.position.z / heightGround * img.heightInPixels / 4

        pos2.left = targetPosition.x / widthGround * img.widthInPixels / 4
        pos2.top = targetPosition.z / heightGround * img.heightInPixels / 4

        fading(rect1, 0, 1);
        hello();

        var txt = text1.text;
        text1.text = ''
        var speed = 50;
        var i = 0;
        function typeWriter() {
            if (i < txt.length) {
                text1.text += txt.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                fading(button, 0, 1);
            }
        }
        typeWriter()
    });

    BABYLON.SceneLoader.Append("../models/", "nav.glb", scene, function (newMeshes) {
        var nav = scene.getMeshByName("MMSEV");
        nav.position = new BABYLON.Vector3(-5, -18, -20);
        nav.scaling = new BABYLON.Vector3(2, 2, 2);
        shadowGenerator.addShadowCaster(nav);
        shadowGenerator.getShadowMap().renderList.push(nav);
        nav.receiveShadows = true;
        nav.checkCollisions = true;

    });

    BABYLON.SceneLoader.ImportMesh("Z2", "../models/", "boy_new.babylon", scene, function (newMeshes, particleSystems, skeletons) {

        boy = scene.getMeshByName("Z2");
        boy.position = currentPosition;
        //camera.setTarget(boy)
        shadowGenerator.addShadowCaster(boy);
        shadowGenerator.getShadowMap().renderList.push(boy);
        boy.checkCollisions = true;
        boy.applyGravity = true;
        //boy.receiveShadows = true;
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
                var jump = jumpAnimation(actualBones)
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
    // var gravityVector = new BABYLON.Vector3(0, -1.62, 0); // moon gravity
    // var physicsPlugin = new BABYLON.CannonJSPlugin();
    // scene.enablePhysics(gravityVector, physicsPlugin);
    scene.shadowsEnabled = true;

    scene.gravity = new BABYLON.Vector3(0, -1.62, 0);

    // Enable Collisions
    scene.collisionsEnabled = true;

    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.applyGravity = true;

    //Set the ellipsoid around the camera (e.g. your player's size)
    //camera.ellipsoid = new BABYLON.Vector3(1, 5, 1);
    camera.collisionRadius = new BABYLON.Vector3(2, 2, 2)


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
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(4), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(4), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        var x = bonesOffset["leftUpperArm"].rotation.x;
        var y = bonesOffset["leftUpperArm"].rotation.y;
        var z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(5), y, z + radians(- 3)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(- 5), y, z + radians(3)) });
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
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(- 5), y, z + radians(3)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(5), y, z + radians(-3)) });
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
        leftUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + radians(-7), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(-12), y, z) });
        leftUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + radians(-8), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(11), y, z) });
        leftUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + radians(23), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(10), y, z) });
        leftUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + radians(13), y, z) });
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
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(3), y, z) });
        leftLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + radians(19), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(35), y, z) });
        leftLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + radians(27), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(-1), y, z) });
        leftLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + radians(13), y, z) });
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
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(2), y, z) });
        leftUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + radians(14), y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(24), y, z) });
        leftUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + radians(4), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(5), y, z) });
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
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + radians(5), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(10), y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        var x = bonesOffset["rightUpperLeg"].rotation.x;
        var y = bonesOffset["rightUpperLeg"].rotation.y;
        var z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(11), y, z) });
        rightUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + radians(23), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(10), y, z) });
        rightUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + radians(13), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(-1), y, z) });
        rightUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + radians(-7), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(-12), y, z) });
        rightUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + radians(-8), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(11), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        var x = bonesOffset["rightLowerLeg"].rotation.x;
        var y = bonesOffset["rightLowerLeg"].rotation.y;
        var z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(35), y, z) });
        rightLowerLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + radians(27), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(0), y, z) });
        rightLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + radians(13), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(0), y, z) });
        rightLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + radians(0), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(3), y, z) });
        rightLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + radians(19), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(35), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        var x = bonesOffset["rightUpperFoot"].rotation.x;
        var y = bonesOffset["rightUpperFoot"].rotation.y;
        var z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(24), y, z) });
        rightUpperFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + radians(4), y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(5), y, z) });
        rightUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(2), y, z) });
        rightUpperFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x + radians(14), y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(24), y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        var x = bonesOffset["rightLowerFoot"].rotation.x;
        var y = bonesOffset["rightLowerFoot"].rotation.y;
        var z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + radians(5), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(10), y, z) });
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
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(7), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(7), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(7), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(7), y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        var x = bonesOffset["leftUpperArm"].rotation.x;
        var y = bonesOffset["leftUpperArm"].rotation.y;
        var z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(12), y, z + radians(4)) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(- 8), y, z + radians(- 1)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(5), y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(- 8), y, z + radians(- 1)) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(12), y, z + radians(4)) });
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
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(12), y, z + radians(4)) });
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(- 8), y, z + radians(- 1)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(5), y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(- 8), y, z + radians(- 1)) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(12), y, z + radians(4)) });
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
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(14), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(10), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(5), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(10), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(14), y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        var x = bonesOffset["leftLowerLeg"].rotation.x;
        var y = bonesOffset["leftLowerLeg"].rotation.y;
        var z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(34), y, z) });
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(23), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(15), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(23), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(34), y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        var x = bonesOffset["leftUpperFoot"].rotation.x;
        var y = bonesOffset["leftUpperFoot"].rotation.y;
        var z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(12), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        var x = bonesOffset["leftLowerFoot"].rotation.x;
        var y = bonesOffset["leftLowerFoot"].rotation.y;
        var z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(12), y, z) });
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + radians(8), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + radians(8), y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(12), y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        var x = bonesOffset["rightUpperLeg"].rotation.x;
        var y = bonesOffset["rightUpperLeg"].rotation.y;
        var z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(14), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(10), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(5), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(10), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(14), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        var x = bonesOffset["rightLowerLeg"].rotation.x;
        var y = bonesOffset["rightLowerLeg"].rotation.y;
        var z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(34), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(23), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(15), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(23), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(34), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        var x = bonesOffset["rightUpperFoot"].rotation.x;
        var y = bonesOffset["rightUpperFoot"].rotation.y;
        var z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(12), y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        var x = bonesOffset["rightLowerFoot"].rotation.x;
        var y = bonesOffset["rightLowerFoot"].rotation.y;
        var z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + radians(12), y, z) });
        rightLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + radians(8), y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + radians(27), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + radians(8), y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + radians(12), y, z) });
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

function hello() {

    //for camera move forward
    var movein = new BABYLON.Animation(
        "movein",
        "position",
        20,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    var movein_keys = [];

    movein_keys.push({
        frame: 0,
        value: cameraPosition.clone().add(new BABYLON.Vector3(-100, -25, 200))
    });
    movein_keys.push({
        frame: 500,
        value: cameraPosition.clone().add(new BABYLON.Vector3(-100, -25, 160))
    });

    movein.setKeys(movein_keys);

    camera.animations = [];
    camera.animations.push(movein);

    scene.beginAnimation(camera, 0, 500, false, 1, function () {
    });
}
function zoomIn() {

    //for camera move forward
    var movein = new BABYLON.Animation(
        "movein",
        "position",
        20,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    var movein_keys = [];

    movein_keys.push({
        frame: 0,
        value: cameraPosition.clone().add(new BABYLON.Vector3(-100, -25, 160))
    });
    movein_keys.push({
        frame: 180,
        value: currentPosition.clone().add(new BABYLON.Vector3(0, 2, 6))
    });
    movein_keys.push({
        frame: 200,
        value: currentPosition.clone().add(new BABYLON.Vector3(0, 2, 4))
    });

    movein.setKeys(movein_keys);

    // //for camera to sweep round
    // var rotate = new BABYLON.Animation(
    //     "rotate",
    //     "rotation.y",
    //     20,
    //     BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    //     BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    // );

    // var rotate_keys = [];

    // rotate_keys.push({
    //     frame: 0,
    //     value: camera.rotation.y
    // });
    // rotate_keys.push({
    //     frame: 20,
    //     value: camera.rotation.y
    // });
    // rotate_keys.push({
    //     frame: 180,
    //     value: camera.rotation.y - Math.PI * 2
    // });
    // rotate_keys.push({
    //     frame: 200,
    //     value: camera.rotation.y - Math.PI * 2
    // });
    // rotate.setKeys(rotate_keys);

    camera.animations = [];
    //camera.animations.push(rotate);
    camera.animations.push(movein);

    scene.beginAnimation(camera, 0, 200, false, 1, function () {

        camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, camera.position, scene);
        camera.attachControl(canvas, true);
        camera.target = boy.position.clone().add(new BABYLON.Vector3(0, 2, 0))
        camera.lowerRadiusLimit = 0;
        camera.upperRadiusLimit = 50;
        camera.wheelDeltaPercentage = 0.01;
        scene.activeCamera = camera;
        //Then apply collisions and gravity to the active camera
        camera.checkCollisions = true;
        camera.applyGravity = true;

        rect1.dispose();
        //Set the ellipsoid around the camera (e.g. your player's size)
        //camera.ellipsoid = new BABYLON.Vector3(1, 5, 1);
        camera.collisionRadius = new BABYLON.Vector3(2, 1, 2)
        fading(rect2, 0, 1);

    });
}

function fading(container, start, end) {

    var animationBox = new BABYLON.Animation("fading", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // An array with all animation keys
    var keys = [];

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
    scene.beginAnimation(container, 0, 100);
}