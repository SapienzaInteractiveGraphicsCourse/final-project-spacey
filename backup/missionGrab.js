var canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true, { stencil: true });

var bonesOffset = [];
var actualBones = [];

function toRad(deg) { return deg * Math.PI / 180; }

function rotateVector(vect, rot) {
    var matr = new BABYLON.Matrix();
    var quat = BABYLON.Quaternion.FromEulerAngles(0, rot, 0);
    quat.toRotationMatrix(matr);
    var rotatedvect = BABYLON.Vector3.TransformCoordinates(vect, matr);
    return rotatedvect;
}

BABYLON.Mesh.prototype.ellipsoidMesh = undefined;
BABYLON.Mesh.prototype.showEllipsoid = function (scene) {

    if (!this.isEnabled()) return;

    this.refreshBoundingInfo();

    var sphere = BABYLON.MeshBuilder.CreateSphere("elli", {
        diameterX: this.ellipsoid.x * 2,
        diameterZ: this.ellipsoid.z * 2,
        diameterY: this.ellipsoid.y * 2
    },
        scene);

    //    sphere.position = this.position.add(this.ellipsoidOffset);
    sphere.position = this.getAbsolutePosition().add(this.ellipsoidOffset);

    this.ellipsoidMesh = sphere;
    // sphere.showBoundingBox = true;
    sphere.material = new BABYLON.StandardMaterial("collider", scene);
    sphere.material.wireframe = true;
    sphere.material.diffuseColor = BABYLON.Color3.Yellow();

    // special barrel ellipsoid checks
    if (this.name == "barrel" || this.name == "barrel2") {
        sphere.material.diffuseColor = BABYLON.Color3.Green();
        console.log("barrel.ellipsoid: ", this.ellipsoid)
        var sbb = sphere.getBoundingInfo().boundingBox;
        console.log("barrel sphere bb.maximum.scale(2): ", sbb.maximum.scale(2));
    }

    sphere.visibility = .1;
}

BABYLON.Mesh.prototype.setEllipsoidPerBoundingBox = function (scene) {

    var bi = this.getBoundingInfo();
    // console.log("bi: ", bi);

    var bb = bi.boundingBox;
    // console.log("bb: ", bb);

    // this.ellipsoid = bb.extendSizeWorld.scale(2);
    // this.ellipsoid = bb.extendSize.scale(2);
    this.ellipsoid = bb.maximumWorld.subtract(bb.minimumWorld).scale(0.5);

    // this.ellipsoidOffset = new BABYLON.Vector3(0, bbxscaled.y/2, 0);
    // this.ellipsoidOffset = bbxscaled;
}



var createScene = function () {

    engine.enableOfflineSupport = false;

    var scene = new BABYLON.Scene(engine);

    scene.gravity = new BABYLON.Vector3(0, -9.8, 0);
    scene.collisionsEnabled = true;

    var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 3, Math.PI / 4, 3, new BABYLON.Vector3(30, 30, 30), scene);
    //var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(20, 20, 20), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var ground;
    var boy;
    var light = new BABYLON.HemisphericLight("Hemi", new BABYLON.Vector3(0, 1, 0), scene);

    //var shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

    BABYLON.SceneLoader.ImportMesh("MMSEV", "../models/babylonFiles/", "nav.babylon", scene, function (newMeshes) {
        var nav = scene.getMeshByName("MMSEV");
        //nav.position = new BABYLON.Vector3(0, 5, 0);
        nav.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
        //shadowGenerator.getShadowMap().renderList.push(nav);
        nav.applyGravity = true;
        nav.checkCollisions = true;
        nav.showBoundingBox = true;
        nav.ellipsoidOffset = new BABYLON.Vector3(0, 0, -0.5);
        nav.ellipsoid = new BABYLON.Vector3(1.5, 3, 1.5);
        nav.setEllipsoidPerBoundingBox(scene);
        nav.showEllipsoid(scene);
        nav.visibility = .99;

        //Create Path for Path following
        var points = [];
        var n = 600;
        var r = 40; //radius
        for (var i = 0; i < 2 * n + 1; i++) {
            points.push(new BABYLON.Vector3((r) * Math.cos(i * Math.PI / n), 0, (r) * Math.sin(i * Math.PI / n)));
        }

        /*        var track = BABYLON.MeshBuilder.CreateLines('track', {points: points}, scene);
                track.color = new BABYLON.Color3(0, 0, 0);*/

        nav.position.y = 2;
        nav.position.z = r;
        nav.ellipsoidMesh.position = nav.position.add(nav.ellipsoidOffset);
        var path3d = new BABYLON.Path3D(points);
        var normals = path3d.getNormals();
        var theta = Math.acos(BABYLON.Vector3.Dot(BABYLON.Axis.Z, normals[0]));
        nav.rotate(BABYLON.Axis.Y, theta, BABYLON.Space.WORLD);

        /*        var i=0;
                scene.registerAfterRender(function() {
                nav.position.x = points[i].x;
                nav.position.z = points[i].z;


                theta = Math.acos(BABYLON.Vector3.Dot(normals[i],normals[i+1]));
                var dir = BABYLON.Vector3.Cross(normals[i],normals[i+1]).y;
                var dir = dir/Math.abs(dir);
                nav.rotate(BABYLON.Axis.Y, dir * theta, BABYLON.Space.WORLD);
                nav.ellipsoidMesh.position = nav.position.add(nav.ellipsoidOffset);
                nav.ellipsoidMesh.rotation = nav.rotation;
                i = (i + 1) % (2*n-1);
                }); */
        //camera.lockedTarget = nav;
    });


    BABYLON.SceneLoader.ImportMesh("Boy", "../models/", "boy_new.babylon", scene, function (newMeshes, particleSystems, skeletons) {

        boy = scene.getMeshByName("Boy");
        //boy.position = new BABYLON.Vector3(-20, 3, 10);
        boy.scaling = new BABYLON.Vector3(3, 3, 3);
        boy.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD); //so that object launches aligned with conventional world axis
        //shadowGenerator.getShadowMap().renderList.push(boy);
        boy.applyGravity = true;
        boy.checkCollisions = true;
        //boy.showBoundingBox = true;
        boy.ellipsoidOffset = new BABYLON.Vector3(0, 2.5, 0);
        boy.ellipsoid = new BABYLON.Vector3(1.5, 3, 1.5);
        boy.setEllipsoidPerBoundingBox(scene);
        boy.showEllipsoid(scene);
        //boy.visibility = .99;

        boy.speed = new BABYLON.Vector3(0, 0, 0.08);
        boy.nextspeed = new BABYLON.Vector3(0, 0, 1);

        camera.lockedTarget = boy;
        // Ground (using a box not a plane)
        ground = BABYLON.MeshBuilder.CreateBox("Ground", { width: 200, height: 0.1, depth: 200 }, scene);

        var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        //groundMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        //groundMat.backFaceCulling = true;
        groundMat.diffuseTexture = new BABYLON.Texture("../images/moon1.jpg", scene);
        ground.material = groundMat;
        ground.receiveShadows = true;
        ground.checkCollisions = true;

        //Stone
        var stone = BABYLON.MeshBuilder.CreateSphere("Stone", { diameter: 2, diameterY: 3 }, scene);
        stone.position = new BABYLON.Vector3(5, 1, 10);
        var stoneMat = new BABYLON.StandardMaterial("stoneMat", scene);
        stoneMat.diffuseTexture = new BABYLON.Texture("../images/stone1.jpeg", scene);
        stone.material = stoneMat;
        stone.receiveShadows = true;
        //stone.checkCollisions = true;
        //console.log("Dist", boy.position.subtract(stone.position).length());

        var hl = new BABYLON.HighlightLayer("hl1", scene);
        var h2 = new BABYLON.HighlightLayer("hl2", scene)

        var turnboi = toRad(15);
        var flagImp = 0;
        var flagQ = 0;
        var flagGb = 0;
        var flagDp = 0; //flag to detect drop
        //Astronaut rotation by keyboard
        var impulseDirection = new BABYLON.Vector3(0, 0, 1);
        var v = 0.04;

        var observer_dir = scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        //Rotate Left by an amgle specified by turnboi
                        case "a":
                        case "A":
                            boy.rotate(BABYLON.Axis.Y, -turnboi, BABYLON.Space.WORLD);
                            impulseDirection = rotateVector(impulseDirection, -turnboi);
                            boy.nextspeed = rotateVector(boy.nextspeed, -turnboi);
                            boy.speed = BABYLON.Vector3.Lerp(boy.speed, boy.nextspeed, 1);
                            break

                        //Rotate Right by an amgle specified by turnboi
                        case "d":
                        case "D":
                            boy.rotate(BABYLON.Axis.Y, turnboi, BABYLON.Space.WORLD);
                            impulseDirection = rotateVector(impulseDirection, turnboi);;
                            boy.nextspeed = rotateVector(boy.nextspeed, turnboi);
                            boy.speed = BABYLON.Vector3.Lerp(boy.speed, boy.nextspeed, 1);
                            break

                        //Apply impulse
                        case "w":
                        case "W":
                            flagImp = 1;
                            console.log("Velocity applied!!!");
                            boy.nextspeed.x = v * impulseDirection.x;
                            boy.nextspeed.z = v * impulseDirection.z;

                            boy.speed = BABYLON.Vector3.Lerp(boy.speed, boy.nextspeed, 1);
                            //boy.moveWithCollisions(boy.speed);
                            walkAnimation(actualBones).play(true);
                            break

                        //Stop || Remove impulse
                        case "s":
                        case "S":
                            flagImp = 0;
                            boy.nextspeed.x = 0;
                            boy.nextspeed.z = 0;
                            console.log("Key S|s pressed.....Stop!");
                            standAnimation(actualBones).play(true);
                            break

                        //Grab
                        case "q":
                        case "Q":
                            flagQ = 1;
                            //Grab()
                            //grabAnimation(actualBones).play(true);
                            console.log("Key Q|q pressed.....Grab!");
                            break

                        //Drop
                        /*                        case "e":
                                                case "E":
                                                    //flagQ = 1;
                                                    console.log("Key E|e pressed.....Drop!");
                                                break*/
                    }
                    break;
            }
        });

        scene.registerAfterRender(function () {
            if (flagImp) {
                boy.moveWithCollisions(boy.speed);
                boy.ellipsoidMesh.position = boy.position.add(boy.ellipsoidOffset);
            }

            if (flagGb) {

                h2.addMesh(stone, BABYLON.Color3.Red());
                stone.position.x = boy.position.x - 0.25;
                stone.position.y = boy.position.y + 3;
                stone.position.z = boy.position.z + 1.75;
                stone.rotation = boy.rotation;
            }

            if ((boy.position.subtract(stone.position).length()) < 5 && !flagGb) {
                hl.addMesh(stone, BABYLON.Color3.Green());
                if (flagQ) {
                    Grab()
                    flagQ = 0;
                }
            }
            else {
                hl.removeMesh(stone);
            }

        });

        var Grab = function () {
            boy.nextspeed.x = 0;
            boy.nextspeed.z = 0;
            boy.speed = BABYLON.Vector3.Lerp(boy.speed, boy.nextspeed, 1);
            standAnimation(actualBones).play(true);
            grabAnimation(actualBones).play(true);
            setTimeout(function () {
                standAnimation(actualBones).play(true);
                flagGb = 1;
                hl.removeMesh(stone);
            }, 1000);
        }

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
            };
        }

        // make change of animation smooter
        skeletons[0].animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        skeletons[0].animationPropertiesOverride.enableBlending = true;
        skeletons[0].animationPropertiesOverride.blendingSpeed = 0.05;
        skeletons[0].animationPropertiesOverride.loopMode = 1;

    });
    return scene;
};
var scene = createScene();
engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener('resize', function () {
    engine.resize();
});

function grabAnimation(parts) {
    console.log("G called")
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
        trunkKeys.push({ frame: 10, value: new BABYLON.Vector3(x + toRad(5), y, z) });
        trunkKeys.push({ frame: 20, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        trunkKeys.push({ frame: 30, value: new BABYLON.Vector3(x + toRad(20), y, z) });
        trunkKeys.push({ frame: 40, value: new BABYLON.Vector3(x + toRad(30), y, z) });
        trunkKeys.push({ frame: 50, value: new BABYLON.Vector3(x + toRad(20), y, z) });
        trunkKeys.push({ frame: 60, value: new BABYLON.Vector3(x + toRad(10), y, z) });
        trunkKeys.push({ frame: 70, value: new BABYLON.Vector3(x + toRad(5), y, z) });
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
        leftLowerArmKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y + toRad(-10), z) });
        leftLowerArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y + toRad(-30), z) });
        leftLowerArmKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y + toRad(-50), z) });
        leftLowerArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y + toRad(-70), z) });
        leftLowerArmKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y + toRad(-50), z) });
        leftLowerArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y + toRad(-30), z) });
        leftLowerArmKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y + toRad(-10), z) });
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
        rightLowerArmKeys.push({ frame: 10, value: new BABYLON.Vector3(x, y + toRad(10), z) });
        rightLowerArmKeys.push({ frame: 20, value: new BABYLON.Vector3(x, y + toRad(30), z) });
        rightLowerArmKeys.push({ frame: 30, value: new BABYLON.Vector3(x, y + toRad(50), z) });
        rightLowerArmKeys.push({ frame: 40, value: new BABYLON.Vector3(x, y + toRad(70), z) });
        rightLowerArmKeys.push({ frame: 50, value: new BABYLON.Vector3(x, y + toRad(50), z) });
        rightLowerArmKeys.push({ frame: 60, value: new BABYLON.Vector3(x, y + toRad(30), z) });
        rightLowerArmKeys.push({ frame: 70, value: new BABYLON.Vector3(x, y + toRad(10), z) });
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