var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);

var bonesOffset = [];
var actualBones = [];

function toRad(deg) { return deg * Math.PI / 180; }

function rotateVector(vect, rot) {    
    var matr = new BABYLON.Matrix();
    var quat = BABYLON.Quaternion.FromEulerAngles(0, rot , 0);
    quat.toRotationMatrix(matr);
    var rotatedvect = BABYLON.Vector3.TransformCoordinates(vect, matr);
    return rotatedvect;
}

var createScene = function () {

    engine.enableOfflineSupport = false;

    var scene = new BABYLON.Scene(engine);
    
    var gravityVector = new BABYLON.Vector3(0,-9.8, 0);
    //var physicsPlugin = new BABYLON.OimoJSPlugin();
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    //var physicsPlugin = new BABYLON.AmmoJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 3, Math.PI / 4, 3, new BABYLON.Vector3(30, 30, 30), scene);
    //var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(20, 20, 20), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("Hemi", new BABYLON.Vector3(0, 1, 0), scene);

    //var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

    BABYLON.SceneLoader.ImportMesh("Z2", "../models/", "boy.babylon", scene, function (newMeshes, particleSystems, skeletons) {

        var boy = scene.getMeshByName("Z2");
        //boy.position = new BABYLON.Vector3(0, -2, 2);
        boy.scaling = new BABYLON.Vector3(3, 3, 3);
        boy.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD); //so that object launches aligned with conventional world axis
        //shadowGenerator.getShadowMap().renderList.push(boy);
        boy.physicsImpostor = new BABYLON.PhysicsImpostor(boy, BABYLON.PhysicsImpostor.MeshImpostor,
        					  { mass: 1, friction: 0.0, restitution: 0.3 }, scene);

        camera.lockedTarget = boy;
        // Ground (using a box not a plane)
        var ground = BABYLON.MeshBuilder.CreateBox("Ground", {width: 50, height: 0.01, depth: 50}, scene);

        var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        groundMat.backFaceCulling = false;
        ground.material = groundMat;
        ground.receiveShadows = true;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.PlaneImpostor,
                                 { mass: 0, friction: 0.0, restitution: 0.7 }, scene);
  
        var myTO;
        var turnboi = toRad(15);
        //Astronaut rotation by keyboard
        var impulseDirection = new BABYLON.Vector3(0, 0, 1);
        var observer_dir = scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        //Rotate Left
                        case "a":
                        case "A":
                            boy.physicsImpostor.physicsBody.linearDamping = 0.9;
                            standAnimation(actualBones).play(true);
                            //boy.physicsImpostor.physicsBody.linearDamping = 0.0;
                            //boy.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0,1,0), turnboi))
                            boy.rotate(BABYLON.Axis.Y, -turnboi, BABYLON.Space.WORLD);
                            impulseDirection = rotateVector(impulseDirection, -turnboi);
                            clearTimeout(myTO);
                        
                        //Rotate Right
                        break
                        case "d":
                        case "D":
                            boy.physicsImpostor.physicsBody.linearDamping = 0.9;
                            standAnimation(actualBones).play(true);
                            boy.rotate(BABYLON.Axis.Y, turnboi, BABYLON.Space.WORLD);
                            impulseDirection = rotateVector(impulseDirection, turnboi);
                            clearTimeout(myTO);
                        break

                        //Rotate Back
                        case "s":
                        case "S":
                            boy.physicsImpostor.physicsBody.linearDamping = 0.9;
                            standAnimation(actualBones).play(true);
                            boy.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
                            impulseDirection = rotateVector(impulseDirection, Math.PI);
                            clearTimeout(myTO);
                        break

                        //Apply Impulse
                        case "w":
                        case "W":
                            Pulse();
                        break
                    }
                break;
            }
        }); 

        //Force/Impulse section
        var impulseMagnitude = 1;
        var contactLocalRefPoint = new BABYLON.Vector3(0, 0, 0);

        console.log("Get Vel Before", boy.physicsImpostor.getLinearVelocity());
        var Pulse = function() {
            boy.physicsImpostor.physicsBody.linearDamping = 0;
            boy.physicsImpostor.applyImpulse(impulseDirection.scale(impulseMagnitude), boy.getAbsolutePosition().add(contactLocalRefPoint));
        
            walkAnimation(actualBones).play(true);
            //console.log("Get Vel", boy.physicsImpostor.getLinearVelocity());
            //console.log("Has obs", scene.onKeyboardObservable.hasObservers);
            myTO = setTimeout(function(){

                console.log("damping ON");
                scene.clearColor = BABYLON.Color3.Random();
            
                // boy.physicsImpostor.physicsBody.angularDamping = 0.9;
                boy.physicsImpostor.physicsBody.linearDamping = 0.9;
                //boy.physicsImpostor.setLinearVelocity(boy.physicsImpostor.getLinearVelocity().scale(0.95));
                //console.log("Get Vel D", boy.physicsImpostor.getLinearVelocity());
                //walkAnimation(actualBones).play(false); 
                standAnimation(actualBones).play(true);

            }, 8000);
        }
        var size = boy.getBoundingInfo().boundingSphere;
        //var myPoints = [boy.getAbsolutePosition().add(size.center),boy.getAbsolutePosition().add(impulseDirection)];
 
        //var lines = BABYLON.MeshBuilder.CreateLines("lines", {points: myPoints}, scene);

        //var size = boy.getBoundingInfo().boundingBox.extendSize;
        //var size = boy.getBoundingInfo().boundingSphere;

        //var sphereBody = new CANNON.Body({ mass: 5 });
        //sphereBody.velocity.set(0, 0.5, 0);

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

        //GUI
        var magnitude = function(value) {
            impulseMagnitude = value;
        }

/*        var frictionBox = function(value) {
            boy.physicsImpostor.friction = value;
        }

        var frictionGround = function(value) {
            ground.physicsImpostor.friction = value;
        }*/
        
        var displayMValue = function(value) {
            return Math.floor(value);
        }

        var displayFValue = function(value) {
            return Math.floor(value * 10) / 10;
        }
        
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var selectBox = new BABYLON.GUI.SelectionPanel("spi");
        selectBox.width = 0.25;
        selectBox.height = 0.25;
        selectBox.background = "#1388AF";
        selectBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        selectBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
         
        advancedTexture.addControl(selectBox);

        var impulseMGroup = new BABYLON.GUI.SliderGroup("Impulse Magnitude", "S");
        impulseMGroup.addSlider("Value", magnitude, "units", 1, 10, 1, displayMValue);

        selectBox.addGroup(impulseMGroup);

        var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Apply Impulse");
        button.width = 0.2;
        button.height = "40px";
        button.color = "white";
        button.background = "#1388AF";
        button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        button.top = "-10px";

        button.onPointerClickObservable.add(Pulse)
        advancedTexture.addControl(button);
        
/*        var selectFrictionBox = new BABYLON.GUI.SelectionPanel("spi");
        selectFrictionBox.width = 0.25;
        selectFrictionBox.height = 0.25;
        selectFrictionBox.background = "#1388AF";
        selectFrictionBox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        selectFrictionBox.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

        advancedTexture.addControl(selectFrictionBox);

        var frictionGroup = new BABYLON.GUI.SliderGroup("Friction Values", "S");
        frictionGroup.addSlider("Boy", frictionBox, "units", 0, 10, 0, displayFValue);
        frictionGroup.addSlider("Ground", frictionGround, "units", 0, 10, 0, displayFValue);

        selectFrictionBox.addGroup(frictionGroup);*/    

    });
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function() {
    scene.render();
});

window.addEventListener('resize', function () {
    engine.resize();
});

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