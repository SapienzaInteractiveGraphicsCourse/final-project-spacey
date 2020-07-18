let canvas = document.getElementById('c');
let engine = new BABYLON.Engine(canvas, true);

let createScene = function () {
    let scene = new BABYLON.Scene(engine);
    scene.shadowsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, 0, 0);
    scene.collisionsEnabled = true;
    scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI, Math.PI / 2, 10, new BABYLON.Vector3(0, 0, 4), scene);
    camera.lowerRadiusLimit = 0;
    camera.upperRadiusLimit = 300;
    camera.wheelDeltaPercentage = 0.01;
    camera.cameraAcceleration = 0.05
    camera.maxCameraSpeed = 10
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = 5; //5 units to the top
    camera.orthoBottom = -1; //5 units to the bottom
    camera.orthoLeft = -6;  //5 units to the left
    camera.orthoRight = 6; //5 units to the right
    camera.attachControl(canvas, true);

    let hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 1;
    hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
    hemiLight.specular = new BABYLON.Color3(1, 1, 1);
    hemiLight.ambient = new BABYLON.Color3(1, 1, 1);
    hemiLight.groundColor = new BABYLON.Color3(0, 0, 0);

    BABYLON.SceneLoader.ImportMesh("Boy", "../models/", "boy_new_clean.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        var boy = scene.getMeshByName(newMeshes[0].name);
        boy.position = new BABYLON.Vector3.Zero();
        boy.receiveShadows = true;
        boy.checkCollisions = true;
        boy.applyGravity = true;
        boy.material.freeze();
        boy.alwaysSelectAsActiveMesh = true
        var actualBones = {
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


        var bonesOffset = {};
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

        let walking = walkAnimation(actualBones, bonesOffset);
        walking.play();
        walking.goToFrame(0)
        walking.pause();

        // let jumping = jumpAnimation(actualBones, bonesOffset);
        // let standing = standAnimation(actualBones, bonesOffset);
        // let grabbing = grabAnimation(actualBones, bonesOffset);
        // let struggle = struggleAnimation(actualBones, bonesOffset);
        // let repair = repairAnimation(actualBones, bonesOffset);

        for (var index = 0; index < 8; index++) {
            var newInstance = boy.clone("i" + index);
            newInstance.position = new BABYLON.Vector3(0, 0, index + 1)
            newInstance.skeleton = boy.skeleton.clone("sk" + index);
            var actualBones = {
                "root": newInstance.skeleton.bones.filter((val) => { return val.id == 'root' })[0],
                "trunk": newInstance.skeleton.bones.filter((val) => { return val.id == 'trunk' })[0],
                "leftUpperArm": newInstance.skeleton.bones.filter((val) => { return val.id == 'upperArm.L' })[0],
                "leftLowerArm": newInstance.skeleton.bones.filter((val) => { return val.id == 'lowerArm.L' })[0],
                "leftHand": newInstance.skeleton.bones.filter((val) => { return val.id == 'hand.L' })[0],
                "rightUpperArm": newInstance.skeleton.bones.filter((val) => { return val.id == 'upperArm.R' })[0],
                "rightLowerArm": newInstance.skeleton.bones.filter((val) => { return val.id == 'lowerArm.R' })[0],
                "rightHand": newInstance.skeleton.bones.filter((val) => { return val.id == 'hand.R' })[0],
                "leftUpperLeg": newInstance.skeleton.bones.filter((val) => { return val.id == 'upperLeg.L' })[0],
                "leftLowerLeg": newInstance.skeleton.bones.filter((val) => { return val.id == 'lowerLeg.L' })[0],
                "leftUpperFoot": newInstance.skeleton.bones.filter((val) => { return val.id == 'upperFoot.L' })[0],
                "leftLowerFoot": newInstance.skeleton.bones.filter((val) => { return val.id == 'lowerFoot.L' })[0],
                "rightUpperLeg": newInstance.skeleton.bones.filter((val) => { return val.id == 'upperLeg.R' })[0],
                "rightLowerLeg": newInstance.skeleton.bones.filter((val) => { return val.id == 'lowerLeg.R' })[0],
                "rightUpperFoot": newInstance.skeleton.bones.filter((val) => { return val.id == 'upperFoot.R' })[0],
                "rightLowerFoot": newInstance.skeleton.bones.filter((val) => { return val.id == 'lowerFoot.R' })[0],
                "head": newInstance.skeleton.bones.filter((val) => { return val.id == 'head' })[0],
            }
            var skeletonViewer = new BABYLON.Debug.SkeletonViewer(newInstance.skeleton, newInstance, scene);
            skeletonViewer.isEnabled = true; // Enable it
            var pick = [BABYLON.Color3.White(), BABYLON.Color3.Yellow(), BABYLON.Color3.Red(), BABYLON.Color3.Green(), BABYLON.Color3.Blue(), BABYLON.Color3.Purple(), BABYLON.Color3.Gray(), BABYLON.Color3.Yellow()]
            skeletonViewer.color = BABYLON.Color3.Random(); // Change default color from white to red
            newInstance.setEnabled(false)
            let walking = walkAnimation(actualBones, bonesOffset);
            walking.play();

            walking.goToFrame((index + 1) * 10)
            walking.pause();

        }
    });
    scene.clearColor = new BABYLON.Color3(0, 0, 0);


    return scene;
};


var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});


window.addEventListener('resize', function () {
    engine.resize();
});

function walkAnimation(parts, bonesOffset) {
    let walkGroup = new BABYLON.AnimationGroup("Walk");
    let root = new BABYLON.Animation("root", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
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
        let x = bonesOffset["root"].position.x;
        let y = bonesOffset["root"].position.y;
        let z = bonesOffset["root"].position.z;
        rootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rootKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y, z) });
        rootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y - 0.04, z) });
        rootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y - 0.04, z) });
        rootKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rootKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y, z) });
        rootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y - 0.04, z) });
        rootKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y - 0.04, z) });
        rootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x - BABYLON.Tools.ToRadians(5), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x - BABYLON.Tools.ToRadians(5), y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x - BABYLON.Tools.ToRadians(5), y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        let x = bonesOffset["leftUpperArm"].rotation.x;
        let y = bonesOffset["leftUpperArm"].rotation.y;
        let z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(15), y, z + BABYLON.Tools.ToRadians(10)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-10), y, z + BABYLON.Tools.ToRadians(-10)) });
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
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(- 10), y, z + BABYLON.Tools.ToRadians(10)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(15), y, z + BABYLON.Tools.ToRadians(- 13)) });
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
        leftUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-7 - 5), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-12 - 5), y, z) });
        leftUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-8 - 5), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(11 + 5), y, z) });
        leftUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(23 + 5), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10 + 5), y, z) });
        leftUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14 + 5), y, z) });
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
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(3 + 20), y, z) });
        leftLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(19 + 20), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(35 + 20), y, z) });
        leftLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(27 + 20), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(0), y, z) });
        leftLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(13 + 20), y, z) });
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
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(2), y, z) });
        leftUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14), y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(24), y, z) });
        leftUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(4), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
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
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        let x = bonesOffset["rightUpperLeg"].rotation.x;
        let y = bonesOffset["rightUpperLeg"].rotation.y;
        let z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(11 + 5), y, z) });
        rightUpperLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(23 + 5), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10 + 5), y, z) });
        rightUpperLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14 + 5), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightUpperLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-7 - 5), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-12 - 5), y, z) });
        rightUpperLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-8 - 5), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(11 + 5), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        let x = bonesOffset["rightLowerLeg"].rotation.x;
        let y = bonesOffset["rightLowerLeg"].rotation.y;
        let z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(35 + 20), y, z) });
        rightLowerLegKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(27 + 20), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(0), y, z) });
        rightLowerLegKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(13 + 20), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(0), y, z) });
        rightLowerLegKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(0), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(3 + 20), y, z) });
        rightLowerLegKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(19 + 20), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(35 + 20), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        let x = bonesOffset["rightUpperFoot"].rotation.x;
        let y = bonesOffset["rightUpperFoot"].rotation.y;
        let z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(24), y, z) });
        rightUpperFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(4), y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
        rightUpperFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(2), y, z) });
        rightUpperFootKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14), y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(24), y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        let x = bonesOffset["rightLowerFoot"].rotation.x;
        let y = bonesOffset["rightLowerFoot"].rotation.y;
        let z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightLowerFootKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
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

function jumpAnimation(parts, bonesOffset) {
    let jumpGroup = new BABYLON.AnimationGroup("Jump");
    let root = new BABYLON.Animation("root", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
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
        let x = bonesOffset["root"].position.x;
        let y = bonesOffset["root"].position.y;
        let z = bonesOffset["root"].position.z;
        rootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y - 0.08, z) });
        rootKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y - 0.08, z) });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(7), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(7), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(7), y, z) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(7), y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        let x = bonesOffset["leftUpperArm"].rotation.x;
        let y = bonesOffset["leftUpperArm"].rotation.y;
        let z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z + BABYLON.Tools.ToRadians(4)) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(- 8), y, z + BABYLON.Tools.ToRadians(- 1)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(- 8), y, z + BABYLON.Tools.ToRadians(- 1)) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z + BABYLON.Tools.ToRadians(4)) });
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
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z + BABYLON.Tools.ToRadians(4)) });
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(- 8), y, z + BABYLON.Tools.ToRadians(- 1)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(- 8), y, z + BABYLON.Tools.ToRadians(- 1)) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z + BABYLON.Tools.ToRadians(4)) });
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
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14), y, z) });
        leftUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        leftUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
        leftUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14), y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        let x = bonesOffset["leftLowerLeg"].rotation.x;
        let y = bonesOffset["leftLowerLeg"].rotation.y;
        let z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(34), y, z) });
        leftLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(23), y, z) });
        leftLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(15), y, z) });
        leftLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(23), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(34), y, z) });
        leftLowerLeg.setKeys(leftLowerLegKeys);
    }
    // leftUpperFoot keys
    {
        let x = bonesOffset["leftUpperFoot"].rotation.x;
        let y = bonesOffset["leftUpperFoot"].rotation.y;
        let z = bonesOffset["leftUpperFoot"].rotation.z;
        leftUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z) });
        leftUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperFoot.setKeys(leftUpperFootKeys);
    }
    // leftLowerFoot keys
    {
        let x = bonesOffset["leftLowerFoot"].rotation.x;
        let y = bonesOffset["leftLowerFoot"].rotation.y;
        let z = bonesOffset["leftLowerFoot"].rotation.z;
        leftLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z) });
        leftLowerFootKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(8), y, z) });
        leftLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftLowerFootKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(8), y, z) });
        leftLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z) });
        leftLowerFoot.setKeys(leftLowerFootKeys);
    }
    // rightUpperLeg keys
    {
        let x = bonesOffset["rightUpperLeg"].rotation.x;
        let y = bonesOffset["rightUpperLeg"].rotation.y;
        let z = bonesOffset["rightUpperLeg"].rotation.z;
        rightUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14), y, z) });
        rightUpperLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        rightUpperLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z) });
        rightUpperLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        rightUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(14), y, z) });
        rightUpperLeg.setKeys(rightUpperLegKeys);
    }
    // rightLowerLeg keys
    {
        let x = bonesOffset["rightLowerLeg"].rotation.x;
        let y = bonesOffset["rightLowerLeg"].rotation.y;
        let z = bonesOffset["rightLowerLeg"].rotation.z;
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(34), y, z) });
        rightLowerLegKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(23), y, z) });
        rightLowerLegKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(15), y, z) });
        rightLowerLegKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(23), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(34), y, z) });
        rightLowerLeg.setKeys(rightLowerLegKeys);
    }
    // rightUpperFoot keys
    {
        let x = bonesOffset["rightUpperFoot"].rotation.x;
        let y = bonesOffset["rightUpperFoot"].rotation.y;
        let z = bonesOffset["rightUpperFoot"].rotation.z;
        rightUpperFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z) });
        rightUpperFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperFoot.setKeys(rightUpperFootKeys);
    }
    // rightLowerFoot keys
    {
        let x = bonesOffset["rightLowerFoot"].rotation.x;
        let y = bonesOffset["rightLowerFoot"].rotation.y;
        let z = bonesOffset["rightLowerFoot"].rotation.z;
        rightLowerFootKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z) });
        rightLowerFootKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(8), y, z) });
        rightLowerFootKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(27), y, z) });
        rightLowerFootKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(8), y, z) });
        rightLowerFootKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(12), y, z) });
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

function standAnimation(parts, bonesOffset) {
    let standGroup = new BABYLON.AnimationGroup("Stand");
    let root = new BABYLON.Animation("root", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
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
        let x = bonesOffset["root"].position.x;
        let y = bonesOffset["root"].position.y;
        let z = bonesOffset["root"].position.z;

        rootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
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

function struggleAnimation(parts, bonesOffset) {
    let struggleGroup = new BABYLON.AnimationGroup("Struggle");
    let root = new BABYLON.Animation("root", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
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
        let x = bonesOffset["root"].position.x;
        let y = bonesOffset["root"].position.y;
        let z = bonesOffset["root"].position.z;
        rootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y - 0.5, z) });
        rootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y - 0.5, z) });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(21), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-25), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(15), y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(21), y, z) });
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
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-25), y + BABYLON.Tools.ToRadians(-25), z + BABYLON.Tools.ToRadians(-95)) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-25), y + BABYLON.Tools.ToRadians(-25), z + BABYLON.Tools.ToRadians(-95)) });
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
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-45), y + BABYLON.Tools.ToRadians(25), z + BABYLON.Tools.ToRadians(105)) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-45), y + BABYLON.Tools.ToRadians(25), z + BABYLON.Tools.ToRadians(105)) });
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
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
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
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
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

    struggleGroup.addTargetedAnimation(root, parts["root"]);
    struggleGroup.addTargetedAnimation(trunk, parts["trunk"]);
    struggleGroup.addTargetedAnimation(leftUpperArm, parts["leftUpperArm"]);
    struggleGroup.addTargetedAnimation(leftLowerArm, parts["leftLowerArm"]);
    struggleGroup.addTargetedAnimation(leftHand, parts["leftHand"]);
    struggleGroup.addTargetedAnimation(rightUpperArm, parts["rightUpperArm"]);
    struggleGroup.addTargetedAnimation(rightLowerArm, parts["rightLowerArm"]);
    struggleGroup.addTargetedAnimation(rightHand, parts["rightHand"]);
    struggleGroup.addTargetedAnimation(leftUpperLeg, parts["leftUpperLeg"]);
    struggleGroup.addTargetedAnimation(leftLowerLeg, parts["leftLowerLeg"]);
    struggleGroup.addTargetedAnimation(leftUpperFoot, parts["leftUpperFoot"]);
    struggleGroup.addTargetedAnimation(leftLowerFoot, parts["leftLowerFoot"]);
    struggleGroup.addTargetedAnimation(rightUpperLeg, parts["rightUpperLeg"]);
    struggleGroup.addTargetedAnimation(rightLowerLeg, parts["rightLowerLeg"]);
    struggleGroup.addTargetedAnimation(rightUpperFoot, parts["rightUpperFoot"]);
    struggleGroup.addTargetedAnimation(rightLowerFoot, parts["rightLowerFoot"]);
    struggleGroup.addTargetedAnimation(head, parts["head"]);
    struggleGroup.normalize(0, 80);

    return struggleGroup;
}

function repairAnimation(parts, bonesOffset) {
    let repairGroup = new BABYLON.AnimationGroup("Repair");
    let root = new BABYLON.Animation("root", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
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
        let x = bonesOffset["root"].position.x;
        let y = bonesOffset["root"].position.y;
        let z = bonesOffset["root"].position.z;
        rootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y - 0.5, z) });
        rootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y - 0.5, z) });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(20), y - BABYLON.Tools.ToRadians(10), z - BABYLON.Tools.ToRadians(10)) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(20), y + BABYLON.Tools.ToRadians(10), z + BABYLON.Tools.ToRadians(10)) });
        trunkKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        trunk.setKeys(trunkKeys);
    }
    // leftUpperArm keys
    {
        let x = bonesOffset["leftUpperArm"].rotation.x;
        let y = bonesOffset["leftUpperArm"].rotation.y;
        let z = bonesOffset["leftUpperArm"].rotation.z;
        leftUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z + BABYLON.Tools.ToRadians(- 3)) });
        leftUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(- 5), y, z + BABYLON.Tools.ToRadians(3)) });
        leftUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftUpperArm.setKeys(leftUpperArmKeys);
    }
    // leftLowerArm keys
    {
        let x = bonesOffset["leftLowerArm"].rotation.x;
        let y = bonesOffset["leftLowerArm"].rotation.y;
        let z = bonesOffset["leftLowerArm"].rotation.z;
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-55), z + BABYLON.Tools.ToRadians(-35)) });
        leftLowerArmKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-55), z + BABYLON.Tools.ToRadians(-35)) });
        leftLowerArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-55), z + BABYLON.Tools.ToRadians(-55)) });
        leftLowerArmKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-55), z + BABYLON.Tools.ToRadians(-65)) });
        leftLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-55), z + BABYLON.Tools.ToRadians(-35)) });
        leftLowerArm.setKeys(leftLowerArmKeys);
    }
    // leftHand keys
    {
        let x = bonesOffset["leftHand"].rotation.x;
        let y = bonesOffset["leftHand"].rotation.y;
        let z = bonesOffset["leftHand"].rotation.z;
        leftHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-5), y, z + BABYLON.Tools.ToRadians(-10)) });
        leftHandKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(30), y, z) });
        leftHandKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-5), y, z + BABYLON.Tools.ToRadians(-10)) });
        leftHandKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        leftHandKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(30), y, z) });
        leftHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        leftHand.setKeys(leftHandKeys);
    }
    // rightUpperArm keys
    {
        let x = bonesOffset["rightUpperArm"].rotation.x;
        let y = bonesOffset["rightUpperArm"].rotation.y;
        let z = bonesOffset["rightUpperArm"].rotation.z;
        rightUpperArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(- 5), y, z + BABYLON.Tools.ToRadians(3)) });
        rightUpperArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(5), y, z + BABYLON.Tools.ToRadians(-3)) });
        rightUpperArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightUpperArm.setKeys(rightUpperArmKeys);
    }
    // rightLowerArm keys
    {
        let x = bonesOffset["rightLowerArm"].rotation.x;
        let y = bonesOffset["rightLowerArm"].rotation.y;
        let z = bonesOffset["rightLowerArm"].rotation.z;
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(55), z + BABYLON.Tools.ToRadians(35)) });
        rightLowerArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(55), z + BABYLON.Tools.ToRadians(35)) });
        rightLowerArmKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(55), z + BABYLON.Tools.ToRadians(55)) });
        rightLowerArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(55), z + BABYLON.Tools.ToRadians(35)) });
        rightLowerArmKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(55), z + BABYLON.Tools.ToRadians(35)) });
        rightLowerArm.setKeys(rightLowerArmKeys);
    }
    // rightHand keys
    {
        let x = bonesOffset["rightHand"].rotation.x;
        let y = bonesOffset["rightHand"].rotation.y;
        let z = bonesOffset["rightHand"].rotation.z;
        rightHandKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(30), y, z + BABYLON.Tools.ToRadians(10)) });
        rightHandKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-5), y, z) });
        rightHandKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(30), y, z + BABYLON.Tools.ToRadians(10)) });
        rightHandKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y, z) });
        rightHandKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-5), y, z) });
        rightHandKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y, z) });
        rightHand.setKeys(rightHandKeys);
    }
    // leftUpperLeg keys
    {
        let x = bonesOffset["leftUpperLeg"].rotation.x;
        let y = bonesOffset["leftUpperLeg"].rotation.y;
        let z = bonesOffset["leftUpperLeg"].rotation.z;
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        let x = bonesOffset["leftLowerLeg"].rotation.x;
        let y = bonesOffset["leftLowerLeg"].rotation.y;
        let z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
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
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
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

    repairGroup.addTargetedAnimation(root, parts["root"]);
    repairGroup.addTargetedAnimation(trunk, parts["trunk"]);
    repairGroup.addTargetedAnimation(leftUpperArm, parts["leftUpperArm"]);
    repairGroup.addTargetedAnimation(leftLowerArm, parts["leftLowerArm"]);
    repairGroup.addTargetedAnimation(leftHand, parts["leftHand"]);
    repairGroup.addTargetedAnimation(rightUpperArm, parts["rightUpperArm"]);
    repairGroup.addTargetedAnimation(rightLowerArm, parts["rightLowerArm"]);
    repairGroup.addTargetedAnimation(rightHand, parts["rightHand"]);
    repairGroup.addTargetedAnimation(leftUpperLeg, parts["leftUpperLeg"]);
    repairGroup.addTargetedAnimation(leftLowerLeg, parts["leftLowerLeg"]);
    repairGroup.addTargetedAnimation(leftUpperFoot, parts["leftUpperFoot"]);
    repairGroup.addTargetedAnimation(leftLowerFoot, parts["leftLowerFoot"]);
    repairGroup.addTargetedAnimation(rightUpperLeg, parts["rightUpperLeg"]);
    repairGroup.addTargetedAnimation(rightLowerLeg, parts["rightLowerLeg"]);
    repairGroup.addTargetedAnimation(rightUpperFoot, parts["rightUpperFoot"]);
    repairGroup.addTargetedAnimation(rightLowerFoot, parts["rightLowerFoot"]);
    repairGroup.addTargetedAnimation(head, parts["head"]);
    repairGroup.normalize(0, 80);

    return repairGroup;
}

function grabAnimation(parts, bonesOffset) {
    var grabGroup = new BABYLON.AnimationGroup("Grab");
    var root = new BABYLON.Animation("root", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var trunk = new BABYLON.Animation("trunk", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var leftUpperArm = new BABYLON.Animation("upperArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var leftLowerArm = new BABYLON.Animation("lowerArm.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var leftHand = new BABYLON.Animation("hand.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var rightUpperArm = new BABYLON.Animation("upperArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var rightLowerArm = new BABYLON.Animation("lowerArm.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var rightHand = new BABYLON.Animation("hand.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var leftUpperLeg = new BABYLON.Animation("upperLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var leftLowerLeg = new BABYLON.Animation("lowerLeg.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var leftUpperFoot = new BABYLON.Animation("upperFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var leftLowerFoot = new BABYLON.Animation("lowerFoot.L", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var rightUpperLeg = new BABYLON.Animation("upperLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var rightLowerLeg = new BABYLON.Animation("lowerLeg.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var rightUpperFoot = new BABYLON.Animation("upperFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var rightLowerFoot = new BABYLON.Animation("lowerFoot.R", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var head = new BABYLON.Animation("head", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

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
        trunkKeys.push({ frame: 10, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(20), y, z) });
        trunkKeys.push({ frame: 30, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(40), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(60), y, z) });
        trunkKeys.push({ frame: 50, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(40), y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(20), y, z) });
        trunkKeys.push({ frame: 70, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(10), y, z) });
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
        leftLowerArmKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-10), z) });
        leftLowerArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-30), z) });
        leftLowerArmKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-50), z) });
        leftLowerArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-70), z) });
        leftLowerArmKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-50), z) });
        leftLowerArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-30), z) });
        leftLowerArmKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(-10), z) });
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
        rightLowerArmKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(10), z) });
        rightLowerArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(30), z) });
        rightLowerArmKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(50), z) });
        rightLowerArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(70), z) });
        rightLowerArmKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(50), z) });
        rightLowerArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(30), z) });
        rightLowerArmKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y + BABYLON.Tools.ToRadians(10), z) });
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

    grabGroup.addTargetedAnimation(root, parts["root"]);
    grabGroup.addTargetedAnimation(trunk, parts["trunk"]);
    grabGroup.addTargetedAnimation(leftUpperArm, parts["leftUpperArm"]);
    grabGroup.addTargetedAnimation(leftLowerArm, parts["leftLowerArm"]);
    grabGroup.addTargetedAnimation(leftHand, parts["leftHand"]);
    grabGroup.addTargetedAnimation(rightUpperArm, parts["rightUpperArm"]);
    grabGroup.addTargetedAnimation(rightLowerArm, parts["rightLowerArm"]);
    grabGroup.addTargetedAnimation(rightHand, parts["rightHand"]);
    grabGroup.addTargetedAnimation(leftUpperLeg, parts["leftUpperLeg"]);
    grabGroup.addTargetedAnimation(leftLowerLeg, parts["leftLowerLeg"]);
    grabGroup.addTargetedAnimation(leftUpperFoot, parts["leftUpperFoot"]);
    grabGroup.addTargetedAnimation(leftLowerFoot, parts["leftLowerFoot"]);
    grabGroup.addTargetedAnimation(rightUpperLeg, parts["rightUpperLeg"]);
    grabGroup.addTargetedAnimation(rightLowerLeg, parts["rightLowerLeg"]);
    grabGroup.addTargetedAnimation(rightUpperFoot, parts["rightUpperFoot"]);
    grabGroup.addTargetedAnimation(rightLowerFoot, parts["rightLowerFoot"]);
    grabGroup.addTargetedAnimation(head, parts["head"]);
    grabGroup.normalize(0, 80);

    return grabGroup;
}

function aliveAnimation(parts, bonesOffset) {
    let aliveGroup = new BABYLON.AnimationGroup("alive");
    let root = new BABYLON.Animation("root", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
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
        let x = bonesOffset["root"].position.x;
        let y = bonesOffset["root"].position.y;
        let z = bonesOffset["root"].position.z;
        rootKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y - 0.5, z) });
        rootKeys.push({ frame: 80, value: new BABYLON.Vector3(x, y - 0.5, z) });
        root.setKeys(rootKeys);
    }
    // trunk keys
    {
        let x = bonesOffset["trunk"].rotation.x;
        let y = bonesOffset["trunk"].rotation.y;
        let z = bonesOffset["trunk"].rotation.z;
        trunkKeys.push({ frame: 0, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(4), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(4), y, z) });
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
        leftLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(-25), y + BABYLON.Tools.ToRadians(-25), z + BABYLON.Tools.ToRadians(-95)) });
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
        rightLowerArmKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(25), y + BABYLON.Tools.ToRadians(25), z + BABYLON.Tools.ToRadians(95)) });
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
        leftUpperLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
        leftUpperLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
        leftUpperLeg.setKeys(leftUpperLegKeys);
    }
    // leftLowerLeg keys
    {
        let x = bonesOffset["leftLowerLeg"].rotation.x;
        let y = bonesOffset["leftLowerLeg"].rotation.y;
        let z = bonesOffset["leftLowerLeg"].rotation.z;
        leftLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
        leftLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(90), y, z) });
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
        rightLowerLegKeys.push({ frame: 0, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
        rightLowerLegKeys.push({ frame: 80, value: new BABYLON.Vector3(x + BABYLON.Tools.ToRadians(105), y, z) });
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

    aliveGroup.addTargetedAnimation(root, parts["root"]);
    aliveGroup.addTargetedAnimation(trunk, parts["trunk"]);
    aliveGroup.addTargetedAnimation(leftUpperArm, parts["leftUpperArm"]);
    aliveGroup.addTargetedAnimation(leftLowerArm, parts["leftLowerArm"]);
    aliveGroup.addTargetedAnimation(leftHand, parts["leftHand"]);
    aliveGroup.addTargetedAnimation(rightUpperArm, parts["rightUpperArm"]);
    aliveGroup.addTargetedAnimation(rightLowerArm, parts["rightLowerArm"]);
    aliveGroup.addTargetedAnimation(rightHand, parts["rightHand"]);
    aliveGroup.addTargetedAnimation(leftUpperLeg, parts["leftUpperLeg"]);
    aliveGroup.addTargetedAnimation(leftLowerLeg, parts["leftLowerLeg"]);
    aliveGroup.addTargetedAnimation(leftUpperFoot, parts["leftUpperFoot"]);
    aliveGroup.addTargetedAnimation(leftLowerFoot, parts["leftLowerFoot"]);
    aliveGroup.addTargetedAnimation(rightUpperLeg, parts["rightUpperLeg"]);
    aliveGroup.addTargetedAnimation(rightLowerLeg, parts["rightLowerLeg"]);
    aliveGroup.addTargetedAnimation(rightUpperFoot, parts["rightUpperFoot"]);
    aliveGroup.addTargetedAnimation(rightLowerFoot, parts["rightLowerFoot"]);
    aliveGroup.addTargetedAnimation(head, parts["head"]);
    aliveGroup.normalize(0, 80);

    return aliveGroup;
}

