let canvas = document.getElementById('c');
let engine = new BABYLON.Engine(canvas, true);

// let farCamera;
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
let widthGround = 1000;
let heightGround = 1000;
let optimizer;
let nav;
let target;
let text2;
let textEnd;
let click;
let rect5;
var innerWidth = window.innerWidth;
var innerHeight = window.innerHeight;
var blinkE;
var textE;


let createScene = function () {
    engine.setHardwareScalingLevel(1);
    let scene = new BABYLON.Scene(engine);

    var result = new BABYLON.SceneOptimizerOptions(60, 2000);
    var priority = 0;
    result.optimizations.push(new BABYLON.ShadowsOptimization(priority));
    result.optimizations.push(new BABYLON.LensFlaresOptimization(priority));
    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.PostProcessesOptimization(priority));
    result.optimizations.push(new BABYLON.ParticlesOptimization(priority));
    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.TextureOptimization(priority, 256));
    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.RenderTargetsOptimization(priority));
    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.HardwareScalingOptimization(priority, 1));
    optimizer = new BABYLON.SceneOptimizer(scene, result);

    scene.shadowsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, GRAVITY, 0);
    scene.collisionsEnabled = true;
    scene.autoClear = false; // Color buffer
    scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously

    // CoT = new BABYLON.TransformNode("CoTCamera");

    // farCamera = new BABYLON.FreeCamera("farCamera", new BABYLON.Vector3.Zero(), scene);
    // farCamera.rotation.x = farCamera.rotation.x - Math.PI
    // farCamera.checkCollisions = true;
    // farCamera.applyGravity = true;
    // farCamera.collisionRadius = new BABYLON.Vector3(2, 2, 2)
    // farCamera.parent = CoT;
    // CoT.position = FAR_CAM_POS;

    nearCamera = new BABYLON.ArcRotateCamera("nearCamera", 0, 0, 300, FAR_CAM_POS, scene);
    nearCamera.lowerRadiusLimit = 0;
    nearCamera.upperRadiusLimit = 300;
    nearCamera.wheelDeltaPercentage = 0.01;
    nearCamera.cameraAcceleration = 0.05
    nearCamera.maxCameraSpeed = 10
    nearCamera.checkCollisions = true;
    nearCamera.applyGravity = true;
    nearCamera.collisionRadius = new BABYLON.Vector3(2, 1, 2)
    nearCamera.attachControl(canvas, true);

    // var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 100, -200), scene);
    // light.intensity = 0.8;
    // light.diffuse = new BABYLON.Color3(1, 1, 1);
    // light.specular = new BABYLON.Color3(1, 1, 1);
    // light.ambient = new BABYLON.Color3(1, 1, 1);
    // light.groundColor = new BABYLON.Color3(0, 0, 0);

    let hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, -1, 0), scene);
    hemiLight.intensity = 0.01;
    hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
    hemiLight.specular = new BABYLON.Color3(1, 1, 1);
    hemiLight.ambient = new BABYLON.Color3(1, 1, 1);
    hemiLight.groundColor = new BABYLON.Color3(0, 0, 0);

    dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 2), scene);
    dirLight.intensity = 2;
    dirLight.diffuse = new BABYLON.Color3(1, 1, 1);
    dirLight.specular = new BABYLON.Color3(1, 1, 1);
    dirLight.ambient = new BABYLON.Color3(1, 1, 1);
    dirLight.groundColor = new BABYLON.Color3(0, 0, 0);
    // dirLight.shadowMaxZ = 2000;
    // dirLight.shadowMinZ = 200;

    godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, nearCamera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
    godrays.mesh.material.diffuseTexture = new BABYLON.Texture('../images/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    if (MOON) {
        godrays.mesh.position = new BABYLON.Vector3(0, 150, -450);
        dirLight.position = godrays.mesh.position;
        dirLight.direction = BABYLON.Vector3.Normalize(new BABYLON.Vector3(0, -150, 450))
        godrays.mesh.scaling = new BABYLON.Vector3(5, 5, 5);
    } else {
        godrays.mesh.position = new BABYLON.Vector3(0, 100, -450);
        dirLight.position = godrays.mesh.position;
        dirLight.direction = BABYLON.Vector3.Normalize(new BABYLON.Vector3(0, -100, 450))
        godrays.mesh.scaling = new BABYLON.Vector3(4, 4, 4);
    }
    //godrays.mesh.material.freeze();
    //godrays.mesh.freezeWorldMatrix();
    //godrays.mesh.doNotSyncBoundingInfo = true;
    //godrays.mesh.convertToUnIndexedMesh();

    click = new BABYLON.Sound("click", "../sounds/click.mp3", scene, null, {
        loop: false,
        autoplay: false,
        volume: 1
    });

    // Shadows
    let shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
    shadowGenerator.usePercentageCloserFiltering = true;
    //shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_LOW; // otherwise requires too much memory

    // Skybox
    let skybox = BABYLON.Mesh.CreateSphere("galaxy", 10, 1000.0, scene);
    let skyboxMaterial = new BABYLON.StandardMaterial("galaxyMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.Texture(SKY_PATH, scene, true);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.material.freeze();
    skybox.freezeWorldMatrix();
    skybox.doNotSyncBoundingInfo = true;
    skybox.convertToUnIndexedMesh();

    if (MOON) {
        let earth = BABYLON.MeshBuilder.CreateSphere("earth", { diameter: 10 }, scene);
        earth.position = new BABYLON.Vector3(50, 100, 200);
        earth.rotation = new BABYLON.Vector3(0, 0, 23.5);
        let earthMaterial = new BABYLON.StandardMaterial("earthMaterial", scene);
        earthMaterial.diffuseTexture = new BABYLON.Texture("../images/earth.jpg", scene, true);
        earthMaterial.diffuseTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
        earthMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
        earthMaterial.ambientColor = new BABYLON.Color3(1, 1, 1)

        earth.material = earthMaterial;
        // shadowGenerator.addShadowCaster(earth);
        // shadowGenerator.getShadowMap().renderList.push(earth);
        // earth.receiveShadows = true;
        // earth.material.freeze();
        // earth.freezeWorldMatrix();
        // earth.doNotSyncBoundingInfo = true;
        // earth.convertToUnIndexedMesh();

        //Oxygen cylinder
        var createHemisphere = function (segments, diameter, light) {
            var sphere = BABYLON.MeshBuilder.CreateSphere("spotReflector", { slice: 0.5, diameter: diameter, segments: segments }, scene)
            var disc = BABYLON.Mesh.CreateDisc("disc", diameter / 2, (segments * 3) + (4 - segments), scene);
            disc.rotation.x = -Math.PI / 2
            disc.parent = sphere;
            if (light == "hemisphereLight") {
                sphere.position.y = -0.15;
            }
            return sphere;
        }

        var oxy_cylinder = BABYLON.MeshBuilder.CreateCylinder("oxy_cylinder", { diameterTop: 0.5, diameterBottom: 0.5, height: 1, tessellation: 96 }, scene);

        var cylinder2 = BABYLON.MeshBuilder.CreateCylinder("cylinder2", { diameterTop: 0.1, diameterBottom: 0.1, height: 0.2, tessellation: 96 }, scene);
        cylinder2.position = new BABYLON.Vector3(0, 0.8, 0);
        cylinder2.parent = oxy_cylinder;
        var cylMaterial = new BABYLON.StandardMaterial("cylMaterial", scene);
        cylMaterial.diffuseTexture = new BABYLON.Texture("../images/oxy_2.jpg", scene);
        cylinder2.material = cylMaterial;

        var hemisphere_B = createHemisphere(100, 0.5, scene);
        hemisphere_B.position = new BABYLON.Vector3(0, -0.5, 0);
        hemisphere_B.rotate(BABYLON.Axis.X, Math.PI, BABYLON.Space.WORLD);
        hemisphere_B.parent = oxy_cylinder;
        hemisphere_B.material = cylMaterial;

        var hemisphere_T = createHemisphere(100, 0.5, scene);
        hemisphere_T.position = new BABYLON.Vector3(0, 0.5, 0);
        hemisphere_T.parent = oxy_cylinder;
        hemisphere_T.material = cylMaterial;

        var box = BABYLON.MeshBuilder.CreateBox("box", { height: 0.05, width: 0.25, depth: 0.1 }, scene);
        box.position = new BABYLON.Vector3(0, 0.9, 0);
        box.parent = oxy_cylinder;
        var boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
        boxMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        box.material = boxMaterial;

        oxy_cylinder.position = OXYGEN_POS;
        oxy_cylinder.rotate(BABYLON.Axis.Z, -Math.PI / 2, BABYLON.Space.WORLD);
        oxy_cylinder.rotate(BABYLON.Axis.Y, Math.PI / 4, BABYLON.Space.WORLD);
        //oxy_cylinder.scaling = new BABYLON.Vector3(3, 3, 3)
        shadowGenerator.addShadowCaster(oxy_cylinder);
        shadowGenerator.getShadowMap().renderList.push(oxy_cylinder);
        oxy_cylinder.receiveShadows = true;
        oxy_cylinder.checkCollisions = true;
        oxy_cylinder.applyGravity = true;
        var oxyMaterial = new BABYLON.StandardMaterial("oxyMaterial", scene);

        oxyMaterial.diffuseTexture = new BABYLON.Texture("../images/oxy_1.jpg", scene);
        oxy_cylinder.material = oxyMaterial;
    }


    var step = new BABYLON.Sound("step0", "../sounds/step.wav", scene, null, {
        loop: false,
        autoplay: false,
        volume: 0.5
    });

    var step1 = new BABYLON.Sound("step1", "../sounds/step1.wav", scene, null, {
        loop: false,
        autoplay: false,
        volume: 0.5
    });

    var step2 = new BABYLON.Sound("step2", "../sounds/step2.wav", scene, null, {
        loop: false,
        autoplay: false,
        volume: 0.5
    });

    var steps = [step, step1, step2];


    // var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    // groundMat.diffuseTexture = new BABYLON.Texture("../images/" + MAP_TEXT, scene);
    // var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "../images/" + MINI_MAP_PATH, widthGround, heightGround, widthGround, 0, 10, scene, false, function () {
    //     ground.optimize(128);
    // });
    // groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    // ground.material = groundMat;
    // ground.position = new BABYLON.Vector3(0, 0, 0);
    // ground.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    // ground.scaling = new BABYLON.Vector3(1, 3, 1); // make it bigger
    // shadowGenerator.addShadowCaster(ground);
    // shadowGenerator.getShadowMap().renderList.push(ground);
    // ground.receiveShadows = true;
    // ground.checkCollisions = true;
    // ground.material.freeze();
    // ground.freezeWorldMatrix();

    // BABYLON.SceneLoader.ImportMesh("Map", "../models/", MAP_PATH, scene, function (newMeshes, particleSystems, skeletons) {
    //     ground = scene.getMeshByName(newMeshes[0].name);
    //     ground.position = new BABYLON.Vector3(0, 0, 0);
    //     ground.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
    //     shadowGenerator.addShadowCaster(ground);
    //     shadowGenerator.getShadowMap().renderList.push(ground);
    //     ground.receiveShadows = true;
    //     ground.checkCollisions = true;
    //     ground.material.freeze();
    //     ground.freezeWorldMatrix();
    //     ground.specularColor = new BABYLON.Color3(0, 0, 0);
    //     //ground.isPickable = true;
    //     // scene.onPointerDown = function (evt, pickResult) {
    //     //     // if the click hits the ground object, we change the impact position
    //     //     if (pickResult.hit) {
    //     //         console.log("pick-hit: " + pickResult.pickedPoint);
    //     //     }
    //     // }
    // }, function (loading) {
    //     var ld = Math.floor(loading.loaded / loading.total * 100.0)
    //     LOADING.subtitle.text = 'loading galaxy: ' + ld + '%'
    // });

    BABYLON.SceneLoader.ImportMesh("Nav", "../models/", OBJ_PATH_1, scene, function (newMeshes, particleSystems, skeletons) {
        nav = scene.getMeshByName(newMeshes[0].name);
        nav.position = OBJ_POS_1;
        nav.scaling = new BABYLON.Vector3(3, 3, 3)
        if (!MOON) {
            nav.scaling = new BABYLON.Vector3(7, 7, 7)
        }
        shadowGenerator.addShadowCaster(nav);
        shadowGenerator.getShadowMap().renderList.push(nav);
        nav.receiveShadows = true;
        nav.checkCollisions = true;
        nav.material.freeze();
        nav.freezeWorldMatrix();
    }, function (loading) {
        var ld = Math.floor(loading.loaded / loading.total * 100.0)
        LOADING.subtitle.text = 'loading galaxy: ' + ld + '%'
    });


    BABYLON.SceneLoader.ImportMesh("Target", "../models/", OBJ_PATH_2, scene, function (newMeshes, particleSystems, skeletons) {
        target = scene.getMeshByName(newMeshes[0].name);
        target.position = TARGET_POS;
        target.scaling = SCALE_HERO;
        if (MOON) {
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
            target.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0);
            target.ellipsoid = new BABYLON.Vector3(1.25, 1.5, 1.5);
            // target.showEllipsoid(scene);

            let struggle = struggleAnimation(actualBones, bonesOffset);
            struggle.play(true);
        } else {
            target.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        }
        //glowing hoop around target
        hoopTarget = BABYLON.MeshBuilder.CreateTorus("hoopTarget", { diameter: 10, thickness: 0.1, tessellation: 64 }, scene);
        hoopTarget.position = target.position;
        var hoopMaterial = new BABYLON.StandardMaterial("hoopMaterial", scene);
        hoopMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        hoopTarget.material = hoopMaterial;

        hlTarget_1 = new BABYLON.HighlightLayer("hlTarget_1", scene);
        hlTarget_1.addMesh(hoopTarget, BABYLON.Color3.Red());
        //target.rotation = new BABYLON.Vector3(0, 0, 0)
        shadowGenerator.addShadowCaster(target);
        shadowGenerator.getShadowMap().renderList.push(target);
        target.receiveShadows = true;
        target.checkCollisions = true;
        target.material.freeze();
        target.freezeWorldMatrix();
    }, function (loading) {
        var ld = Math.floor(loading.loaded / loading.total * 100.0)
        LOADING.subtitle.text = 'loading galaxy: ' + ld + '%'
    });

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
            //console.log("barrel.ellipsoid: ", this.ellipsoid)
            var sbb = sphere.getBoundingInfo().boundingBox;
            //console.log("barrel sphere bb.maximum.scale(2): ", sbb.maximum.scale(2));
        }

        sphere.visibility = .1;
    }

    // var mix = new BABYLON.MixMaterial("mix", scene);

    // // Setup mix texture 1
    // mix.mixTexture1 = new BABYLON.Texture("textures/mixMap.png", scene);
    // mix.diffuseTexture1 = new BABYLON.Texture("textures/rock.png", scene);
    // mix.diffuseTexture2 = new BABYLON.Texture("textures/rock.png", scene);
    // mix.diffuseTexture3 = new BABYLON.Texture("textures/grass.png", scene);
    // mix.diffuseTexture4 = new BABYLON.Texture("textures/floor.png", scene);

    // mix.diffuseTexture1.uScale = mix.diffuseTexture1.vScale = 10;
    // mix.diffuseTexture2.uScale = mix.diffuseTexture2.vScale = 10;
    // mix.diffuseTexture3.uScale = mix.diffuseTexture3.vScale = 10;
    // mix.diffuseTexture4.uScale = mix.diffuseTexture4.vScale = 10;

    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseTexture = new BABYLON.Texture("../images/" + MAP_TEXT, scene);
    // groundMat.diffuseTexture.level = 1;
    // groundMat.diffuseTexture.uScale = 1;
    // groundMat.diffuseTexture.vScale = 1;
    groundMat.bumpTexture = new BABYLON.Texture("../images/bump_ground.png", scene);
    groundMat.bumpTexture.level = 1.5;
    if (!MOON) {
        groundMat.bumpTexture.level = 3;
    }
    groundMat.bumpTexture.uScale = 20;
    groundMat.bumpTexture.vScale = 20;
    groundMat.useParallax = true;
    groundMat.useParallaxOcclusion = true;
    groundMat.parallaxScaleBias = 0.1;
    //groundMat.opacityTexture = new BABYLON.Texture("../images/" + MAP_TEXT, scene);
    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "../images/" + MINI_MAP_PATH, widthGround, heightGround, widthGround, 0, 10, scene, false, function () {
        ground.optimize(128);
        groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = groundMat;
        ground.position = new BABYLON.Vector3(0, 0, 0);
        //ground.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
        ground.scaling = new BABYLON.Vector3(1, 3, 1); // make it bigger
        // shadowGenerator.addShadowCaster(ground);
        // shadowGenerator.getShadowMap().renderList.push(ground);
        ground.receiveShadows = true;
        ground.checkCollisions = true;

        // ground.material.freeze();
        // ground.freezeWorldMatrix();
    });


    BABYLON.SceneLoader.ImportMesh("Boy", "../models/", BOY_PATH, scene, function (newMeshes, particleSystems, skeletons) {
        boy = scene.getMeshByName(newMeshes[0].name);
        boy.position = START_POS;
        boy.scaling = SCALE_HERO;
        shadowGenerator.addShadowCaster(boy);
        shadowGenerator.getShadowMap().renderList.push(boy);
        boy.receiveShadows = true;
        boy.checkCollisions = true;
        boy.applyGravity = true;
        boy.material.freeze();
        boy.alwaysSelectAsActiveMesh = true
        var vectorsWorld = boy.getBoundingInfo().boundingBox.vectorsWorld;
        boy.height = vectorsWorld[1].y - vectorsWorld[0].y;
        var HERO_HEIGHT = 2.0;//meters
        var SCALE_FACTOR = boy.height / HERO_HEIGHT;
        SPEED_MODULE = SPEED_MODULE * SCALE_FACTOR;
        GRAVITY_ = GRAVITY_ * SCALE_FACTOR;
        //boy.doNotSyncBoundingInfo = true; //uncomment only if not use physics
        boy.ellipsoidOffset = new BABYLON.Vector3(0, 1.8, 0);
        boy.ellipsoid = new BABYLON.Vector3(1.25, 2.0, 1.5);
        //boy.showEllipsoid(scene);

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
        var offset = new BABYLON.Vector3(0, 2, 0);
        var focusTarget = new BABYLON.TransformNode("offset");
        focusTarget.parent = boy;
        focusTarget.position = offset;
        nearCamera.lockedTarget = focusTarget;

        // make change of animation smooter
        skeletons[0].animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        skeletons[0].animationPropertiesOverride.enableBlending = true;
        skeletons[0].animationPropertiesOverride.blendingSpeed = 0.05;
        skeletons[0].animationPropertiesOverride.loopMode = 1;

        let walking = walkAnimation(actualBones, bonesOffset);
        let jumping = jumpAnimation(actualBones, bonesOffset);
        let standing = standAnimation(actualBones, bonesOffset);
        let grabbing = grabAnimation(actualBones, bonesOffset);
        let struggle = struggleAnimation(actualBones, bonesOffset);
        let repair = repairAnimation(actualBones, bonesOffset);

        boy.speed = new BABYLON.Vector3(0, 0, 0);
        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        sphere.material = myMaterial;

        /******************* START PHYSIC *****************/
        // BOY = { x0: boy.position.x, y0: boy.position.y, z0: boy.position.z, v0x: 0.0, v0y: 0.0, v0z: 0.0 }
        // var move = false;
        var hl1 = new BABYLON.HighlightLayer("hl1", scene);
        var hl2 = new BABYLON.HighlightLayer("hl2", scene);
        var flagQ = 0;
        var flagE = 0;
        var flagGb = 0;
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        case "w":
                        case "W":
                            flagImp = 1;
                            activatePhysics = 1;
                            jumping.stop();
                            standing.stop();
                            struggle.stop();
                            repair.stop();
                            walking.play(true); //loop

                            // move = true;
                            // moveWithPhysics();
                            break
                        case "s":
                        case "S":
                            flagImp = 0;
                            walking.stop();
                            jumping.stop();
                            struggle.stop();
                            repair.stop();
                            standing.play();
                            break
                        case "a":
                        case "A":
                            boy.rotation.y += -turnboi
                            //boy.rotate(BABYLON.Axis.Y, -turnboi, BABYLON.Space.WORLD);
                            SPEED_DIR_ANGLE -= turnboi;
                            // boy.rotation.y = SPEED_DIR_ANGLE
                            break
                        case "d":
                        case "D":
                            boy.rotation.y += turnboi
                            //boy.rotate(BABYLON.Axis.Y, turnboi, BABYLON.Space.WORLD);
                            SPEED_DIR_ANGLE += turnboi;
                            // boy.rotation.y = SPEED_DIR_ANGLE
                            break
                        case " ":
                            walking.stop();
                            standing.stop();
                            struggle.stop();
                            repair.stop();
                            jumping.play();
                            break;
                        case "q":
                        case "Q":
                            flagQ = 1;
                            // walking.stop();
                            // jumping.stop();
                            // standing.stop();
                            // repair.stop();
                            // struggle.play(true);
                            break;
                        case "e":
                        case "E":
                            flagE = 1;
                            // walking.stop();
                            // jumping.stop();
                            // standing.stop();
                            // struggle.stop();
                            // repair.play(true);
                            break;
                        default:
                            walking.stop();
                            jumping.stop();
                            standing.stop();
                            struggle.stop();
                            repair.stop();
                            break
                    }
                    break;
                // case BABYLON.KeyboardEventTypes.KEYUP:
                //     move = false;
                //     walking.pause();
                //     jumping.pause();
                //     standing.play(false);
                //     break;
            }
        });

        scene.registerBeforeRender(function () {
            updateRadar();

            // if (!move && getContactGround()) {
            //     TIME = 0;
            //     GRAVITY_ = 0;
            //     BOY.v0x = 0.0;
            //     BOY.v0y = 0.0;
            //     BOY.v0z = 0.0;
            //     BOY.x0 = boy.position.x
            //     BOY.y0 = boy.position.y
            //     BOY.z0 = boy.position.z
            // }

            // boy.position.x = BOY.x0 + BOY.v0x * TIME;
            // boy.position.y = BOY.y0 + BOY.v0y * TIME + 1 / 2 * GRAVITY_ * Math.pow(TIME, 2);
            // boy.position.z = BOY.z0 + BOY.v0z * TIME;
            if (activatePhysics) {

                callPhysics();

                boy.moveWithCollisions(boy.speed);
                //boy.ellipsoidMesh.position = boy.position.add(boy.ellipsoidOffset);
            }
            if (MOON && !MISSION_STATUS) {
                //console.log("Dist", boy.position.subtract(oxy_cylinder.position).length());
                //console.log("FGB", flagGb);
                if (flagGb) {
                    flagQ = 0;
                    hl2.addMesh(oxy_cylinder, BABYLON.Color3.Green());

                    if (boy.position.subtract(target.position).length() < 5) {
                        textE.text = 'press E to drop'
                        blinkE.restart()
                        flagImp = 0;
                        walking.stop();
                        standing.play();
                        var target_local = Math.atan2(target.position.z, target.position.x);
                        oxy_cylinder.position.x = target.position.x + Math.sin(target_local);
                        oxy_cylinder.position.y = target.position.y + 2;
                        oxy_cylinder.position.z = target.position.z + Math.cos(target_local);

                        var hlTarget_2 = new BABYLON.HighlightLayer("hlTarget_2", scene);
                        hlTarget_2.addMesh(hoopTarget, BABYLON.Color3.Green());
                        hlTarget_1.removeMesh(oxy_cylinder);

                        congoMSg()
                        showEndGUI()
                        MISSION_STATUS = 1;
                        blinkE.stop()
                    }
                    else {

                        oxy_cylinder.position.x = boy.position.x - Math.sin(SPEED_DIR_ANGLE);
                        oxy_cylinder.position.y = boy.position.y + 2;
                        oxy_cylinder.position.z = boy.position.z - Math.cos(SPEED_DIR_ANGLE);

                        if (flagE) {
                            flagE = 0;
                            flagGb = 0;
                            flagImp = 0;
                            walking.stop();
                            standing.play();
                            oxy_cylinder.position.x = boy.position.x - 3; //To throw away the oxy cylinder
                            oxy_cylinder.position.y = boy.position.y;
                            oxy_cylinder.position.z = boy.position.z;
                            oxy_cylinder.rotation = new BABYLON.Vector3(0, Math.PI / 4, -Math.PI / 2);
                            oxy_cylinder.checkCollisions = true;
                            instructionMsg("Don't throw away the cylinder\n Your partner needs help");
                        }
                    }
                }

                else {
                    flagE = 0;
                    if ((boy.position.subtract(oxy_cylinder.position).length()) < 5) {
                        //textE.text = 'press Q to grab'

                        //console.log("Glow")
                        hl1.addMesh(oxy_cylinder, BABYLON.Color3.Red());
                        hl2.removeMesh(oxy_cylinder); //For !flagGb
                        // oxy_cylinder.position.y = 1; //For !flagGb
                        if (flagQ) {
                            //blinkE.stop()
                            //blinkE.play(false)
                            flagImp = 0;
                            grab();
                            oxy_cylinder.checkCollisions = false; //So that Hero does not collide with it while carrying
                            flagQ = 0;
                        }
                    }
                    else {
                        // blinkE.stop()
                        // blinkE.play(false)
                        textE.alpha = 0;
                        flagQ = 0; //to keep q|Q deactivated untill oxy cylinder glows
                        hl1.removeMesh(oxy_cylinder);
                    }
                }

                // if ( (boy.position.subtract(oxy_cylinder.position).length()) <5 && !flagGb ) {
                //     //console.log("Glow")
                //     flagE = 0;
                //     hl1.addMesh(oxy_cylinder, BABYLON.Color3.Red());
                //     hl2.removeMesh(oxy_cylinder); //For !flagGb
                //     // oxy_cylinder.position.y = 1; //For !flagGb
                //     if (flagQ) {
                //         flagImp = 0;
                //         grab()
                //         oxy_cylinder.rotation = new BABYLON.Vector3(0, 0, 0);
                //         oxy_cylinder.checkCollisions = false; //So that Hero does not collide with it while carrying
                //         flagQ = 0;
                //     }
                // }
                // else{
                //     flagE = 0;
                //     flagQ = 0; //to keep q|Q deactivated untill oxy cylinder glows
                //     hl1.removeMesh(oxy_cylinder);
                // }

            }

            if (!MOON && !MISSION_STATUS) {

                if (boy.position.subtract(target.position).length() < 5) {
                    blinkE.play(true)
                    //approachToPoint(target)
                    if (flagE) {
                        flagImp = 0;
                        walking.stop();
                        standing.play();
                        blinkE.stop()
                        blinkE.play(false)
                        repair.play(true);

                        var difference_angle = Math.atan2(boy.position.x - target.position.x, boy.position.z - target.position.z);

                        boy.rotation.y += (difference_angle - SPEED_DIR_ANGLE);
                        SPEED_DIR_ANGLE += (difference_angle - SPEED_DIR_ANGLE);

                        var hlTarget_2 = new BABYLON.HighlightLayer("hlTarget_2", scene);
                        hlTarget_2.addMesh(hoopTarget, BABYLON.Color3.Green());

                        congoMSg()
                        showEndGUI()

                        MISSION_STATUS = 1;
                    }
                }
            }
        });

        var grab = function () {
            // boy.nextspeed.x = 0;
            // boy.nextspeed.z = 0;
            // boy.speed = BABYLON.Vector3.Lerp(boy.speed, boy.nextspeed, 1);
            walking.stop();
            standing.play();
            grabbing.play();
            var difference_angle = Math.atan2(boy.position.x - oxy_cylinder.position.x, boy.position.z - oxy_cylinder.position.z);

            boy.rotation.y += (difference_angle - SPEED_DIR_ANGLE);
            SPEED_DIR_ANGLE += (difference_angle - SPEED_DIR_ANGLE);
            oxy_cylinder.rotation = new BABYLON.Vector3(0, 0, 0);
            setTimeout(function () {
                flagGb = 1;
                hl1.removeMesh(oxy_cylinder);
                instructionMsg("Nice job!!! \n Carry the cylinder to your partner");
            }, 2000);
        }
        // function approachToPoint(mesh) {
        //     if (boy.position.subtract(mesh.position).length() < 5) {
        //         var dirTarget = mesh.position.subtract(boy.position)
        //         var dirBoy = new BABYLON.Vector3.Zero().subtract(boy.forward)
        //         var angle = boy.rotation.y + dot2(dirTarget, dirBoy) / (abs2(dirTarget) * abs2(dirBoy))
        //         activatePhysics = 0;
        //         moveto().play()
        //         rotateto(angle).play()
        //         walking.play()
        //         if (boy.position.subtract(mesh.position).length() < 2) {

        //         }

        //     }
        // }

        // function moveWithPhysics() {
        //     if (getContactGround()) {
        //         // if (strideExpired) {
        //         TIME = 0;
        //         BOY.x0 = boy.position.x;
        //         BOY.y0 = boy.position.y;
        //         BOY.z0 = boy.position.z;
        //         BOY.v0x = -(SPEED_MODULE * Math.cos(SPEED_ANGLE) * Math.sin(SPEED_DIR_ANGLE));
        //         BOY.v0y = SPEED_MODULE * Math.sin(SPEED_ANGLE);
        //         BOY.v0z = -(SPEED_MODULE * Math.cos(SPEED_ANGLE) * Math.cos(SPEED_DIR_ANGLE));
        //         GRAVITY_ = GRAVITY * SCALE_FACTOR;
        //         //strideExpired = false;
        //         var steps = [step, step1, step2];
        //         var randStep = steps[Math.floor(Math.random() * steps.length)];

        //         randStep.play()

        //         // } else {
        //         //     BOY.x0 = boy.position.x;
        //         //     BOY.y0 = boy.position.y;
        //         //     BOY.z0 = boy.position.z;
        //         //     BOY.v0x = 0.0;
        //         //     BOY.v0y = 0.0;
        //         //     BOY.v0z = 0.0;
        //         //     GRAVITY_ = 0.0;
        //         //     strideExpired = true;
        //         // }
        //     }
        // }
        boy.isPickable = false;

        function callPhysics() {

            //Vertical ray
            var rayY = new BABYLON.Ray();
            var rayHelperY = new BABYLON.RayHelper(rayY);

            var localMeshDirectionY = new BABYLON.Vector3(0, -1, 0);

            var localMeshOriginY = globalToLocal(boy.position, boy);
            var length = 20;

            rayHelperY.attachToMesh(boy, localMeshDirectionY, localMeshOriginY, length);
            rayHelperY.show(scene);
            var hitInfoY = rayY.intersectsMeshes([ground]);

            if (hitInfoY.length) {
                sphere.setEnabled(true);
                sphere.position.copyFrom(hitInfoY[0].pickedPoint);

                //console.log("Boy Y", ( boy.position.y));
                //console.log("Grnd Y", (hitInfoY[0].pickedPoint.y)  );
                var sy = boy.position.subtract(hitInfoY[0].pickedPoint).length();
                //console.log("sy", sy);
                //console.log("sm", SPEED_MODULE);
                //console.log("gra", GRAVITY_);
                //console.log("sa", SPEED_ANGLE);
                // console.log("sp", boy.speed);
                var t_delta = (scene.getEngine().getDeltaTime() / 1000);
                if (sy > Y_THRESH) {
                    // console.log("111")
                    boy.speed.x = - SPEED_MODULE * Math.sin(SPEED_DIR_ANGLE) * Math.cos(SPEED_ANGLE);
                    boy.speed.y = boy.speed.y + GRAVITY_ * t_delta;
                    boy.speed.z = - SPEED_MODULE * Math.cos(SPEED_DIR_ANGLE) * Math.cos(SPEED_ANGLE);
                }
                else {
                    // console.log("222")
                    if (flagImp) {
                        // console.log("2-1")
                        boy.speed.x = - SPEED_MODULE * Math.sin(SPEED_DIR_ANGLE) * Math.cos(SPEED_ANGLE);
                        boy.speed.y = SPEED_MODULE * Math.sin(SPEED_ANGLE);
                        boy.speed.z = - SPEED_MODULE * Math.cos(SPEED_DIR_ANGLE) * Math.cos(SPEED_ANGLE);
                        walking.speedRatio = getSpeedRatio()//oppure 1 / DELTA_FALLING
                        // generatePoints();
                    }
                    else {
                        activatePhysics = 0;
                        // console.log("2-2")
                    }
                }
            }
            else {
                sphere.setEnabled(false);
            }
        }
        /******************* END PHYSIC *****************/
        var sphereH = BABYLON.MeshBuilder.CreateSphere("sphereH", {}, scene);
        var myMaterialH = new BABYLON.StandardMaterial("myMaterialH", scene);

        myMaterialH.diffuseColor = new BABYLON.Color3(1, 0, 0);
        sphereH.material = myMaterialH;
        function generatePoints() {
            var point = new BABYLON.Vector3();

            var hor_range = Math.pow(SPEED_MODULE, 2) * Math.sin(2 * SPEED_ANGLE) / (-GRAVITY_);
            var tof = 2 * SPEED_MODULE * Math.sin(SPEED_ANGLE) / (-GRAVITY_);
            var t_small = (scene.getEngine().getDeltaTime() / 1000);
            console.log("Hor", hor_range)
            console.log("Tof", tof)
            //Horizontal ray
            for (var i = 0; i < 5; i++) {

                var ti = (1 / (5 - i)) * tof;

                point.x = boy.position.x + boy.speed.x * ti;
                point.y = boy.position.y + boy.speed.y * ti + 0.5 * GRAVITY_ * Math.pow(ti, 2);
                point.z = boy.position.z + boy.speed.z * ti;

                var rayY = new BABYLON.Ray();
                var rayHelperY = new BABYLON.RayHelper(rayY);

                var localMeshDirectionY = new BABYLON.Vector3(0, 0, -1);

                var localMeshOriginY = globalToLocal(point, boy);
                var length = 5;

                rayHelperY.attachToMesh(boy, localMeshDirectionY, localMeshOriginY, length);
                rayHelperY.show(scene);
                var hitInfoY = rayY.intersectsMeshes([ground]);

                if (hitInfoY.length) {
                    sphereH.setEnabled(true);
                    sphereH.position.copyFrom(hitInfoY[0].pickedPoint);

                    //console.log("Boy Y", ( boy.position.y));
                    //console.log("Grnd Y", (hitInfoY[0].pickedPoint.y)  );
                    var pt1 = boy.position.subtract(point); //from boy at ground to source point on traj
                    var pt2 = point.subtract(hitInfoY[0].pickedPoint); //from source point on traj to intersecting point
                    var sh = point.subtract(hitInfoY[0].pickedPoint).length();
                    //console.log("Horizontal", sh);

                    if ((Math.sqrt(Math.pow(pt1.x, 2) + Math.pow(pt1.z, 2)) + Math.sqrt(Math.pow(pt2.x, 2) + Math.pow(pt2.z, 2))) < hor_range) {
                        console.log("Hitting point found at ", point);
                        break;
                    }
                }
                else {
                    sphereH.setEnabled(false);
                }
            }

        }


        function getSpeedRatio() {
            var [x0, y0, z0] = [boy.position.x, boy.position.y, boy.position.z];
            var [vx0, vy0, vz0] = [boy.speed.x, boy.speed.y, boy.speed.z];
            var precision = 4;
            var depth = 4;
            var strangePhysics = 15;
            // var halfFPS = 4;
            //var stepsPerAnimation = 2;
            var delta_steps = strangePhysics * DELTA_FALLING / precision;
            var t_n, t_n_1, length, point_n, point_n_1, direction, origin, ray, hit;
            var rayHelperY;
            for (let n = 0; n < (precision + depth); n++) {
                t_n = n * delta_steps;
                t_n_1 = (n + 1) * delta_steps;
                point_n = new BABYLON.Vector3((x0 + vx0 * t_n), (y0 + vy0 * t_n + 1 / strangePhysics * 1 / 2 * GRAVITY_ * Math.pow(t_n, 2)), (z0 + vz0 * t_n))
                point_n_1 = new BABYLON.Vector3((x0 + vx0 * t_n_1), (y0 + vy0 * t_n_1 + 1 / strangePhysics * 1 / 2 * GRAVITY_ * Math.pow(t_n_1, 2)), (z0 + vz0 * t_n_1))
                direction = BABYLON.Vector3.Normalize(point_n_1.subtract(point_n));
                origin = point_n;
                length = (point_n_1.subtract(point_n)).length();
                //var star = new BABYLON.Mesh.CreateSphere('star', 16, .2, scene);
                //star.position = point_n
                ray = new BABYLON.Ray(origin, direction, length);
                rayHelperY = new BABYLON.RayHelper(ray)
                rayHelperY.show(scene);
                hit = ray.intersectsMeshes([ground]);
                if (hit.length) {
                    var randStep = steps[Math.floor(Math.random() * steps.length)];
                    randStep.play()
                    // var customMesh = new BABYLON.Mesh("custom", scene);
                    // var point = hit[0].pickedPoint
                    // var ofx = 0.2
                    // var ofz = 0.3
                    // //Set arrays for positions and indices
                    // var positions = [point.x - ofx, point.y, point.z - ofz, point.x - ofx, point.y, point.z + ofz, point.x + ofx, point.y, point.z + ofz, point.x + ofx, point.y, point.z - ofz];
                    // var indices = [0, 1, 2, 3];

                    // //Empty array to contain calculated values
                    // var normals = [];

                    // var vertexData = new BABYLON.VertexData();
                    // BABYLON.VertexData.ComputeNormals(positions, indices, normals);

                    // //Assign positions, indices and normals to vertexData
                    // vertexData.positions = positions;
                    // vertexData.indices = indices;
                    // vertexData.normals = normals;

                    // //Apply vertexData to custom mesh
                    // vertexData.applyToMesh(customMesh);

                    // /******Display custom mesh in wireframe view to show its creation****************/
                    // var mat = new BABYLON.StandardMaterial("mat", scene);
                    // mat.diffuseTexture = new BABYLON.Texture("../images/foot.png", scene);
                    // mat.bumpTexture = new BABYLON.Texture("../images/foot_bump.png", scene);
                    // //mat.wireframe = true;
                    // mat.backFaceCulling = false;

                    // customMesh.material = mat;
                    //var star = new BABYLON.Mesh.CreateSphere('star', 16, .2, scene);
                    //star.position = hit[0].pickedPoint
                    var mean = (t_n + t_n_1) / 2
                    //console.log('1/MEAN: ' + 1 / mean * strangePhysics)
                    return 1 / mean * strangePhysics;
                }
            }
            //console.log('DELTA_FALLING_ :' + DELTA_FALLING_)

            return 1 / DELTA_FALLING;
        }

    }, function (loading) {
        var ld = Math.floor(loading.loaded / loading.total * 100.0)
        LOADING.subtitle.text = 'landing: ' + ld + '%'
    });
    scene.shadowsEnabled = true;
    //scene.gravity = new BABYLON.Vector3(0, -1.62, 0);
    scene.collisionsEnabled = true;
    scene.blockMaterialDirtyMechanism = true;
    // farCamera.checkCollisions = true;
    // farCamera.applyGravity = true;
    // farCamera.collisionRadius = new BABYLON.Vector3(2, 2, 2);
    optimizer.start();
    return scene;
};

/******************* START PHYSIC *****************/

//var TIME = 0;
//var BOY;
var SPEED_ANGLE = BABYLON.Tools.ToRadians(45.0);
var SPEED_DIR_ANGLE = BABYLON.Tools.ToRadians(0);
var SPEED_MODULE = SPEED;
var GRAVITY_ = GRAVITY;
var Y_THRESH = 0.3;
var turnboi = BABYLON.Tools.ToRadians(15);
var flagImp = 0;
var activatePhysics = 1;
var MISSION_STATUS = 0;

/******************* END PHYSIC *****************/



const LOADING = createLoading();
var scene = createScene();

engine.runRenderLoop(function () {
    // scene.render();
    // TIME += scene.getEngine().getDeltaTime() / 1000;
    if (scene.isReady() && LOADING.timeout) {
        if (LOADING.scene.isReady()) {
            LOADING.scene.dispose();
            slowZoomIn();
            showGUI();
        }
        scene.render();
        // TIME += scene.getEngine().getDeltaTime() / 1000;
    } else if (LOADING.scene.isReady()) {
        LOADING.scene.render();
    }
});

/******************* START PHYSIC *****************/

// var strideExpired = false;

function globalToLocal(vector, mesh) {
    var m = new BABYLON.Matrix();
    mesh.getWorldMatrix().invertToRef(m);
    var v = BABYLON.Vector3.TransformCoordinates(vector, m);
    return v;
}

// function getContactGround() {
//     var rayY = new BABYLON.Ray();
//     var rayHelperY = new BABYLON.RayHelper(rayY);
//     var localMeshDirectionY = new BABYLON.Vector3(0, -1, 0);
//     var localMeshOriginY = globalToLocal(boy.position, boy);
//     var length = 50;
//     rayHelperY.attachToMesh(boy, localMeshDirectionY, localMeshOriginY, length);
//     var hitInfoY = rayY.intersectsMeshes([ground]);
//     var offset = 0.2
//     if (hitInfoY.length) {
//         var sy = boy.height / 2 - offset + boy.position.subtract(hitInfoY[0].pickedPoint).length();
//         if (sy > boy.height / 2) return false;
//         else return true;
//     } else return true;
// }

/******************* END PHYSIC *****************/

// scene.executeWhenReady(function () {
//     target.position = setToGround(target);
//     nav.position = setToGround(nav);
// })

function instructionMsg(TXT_INS) {
    var panel = new BABYLON.GUI.StackPanel();
    panel.top = '-40%';
    var advancedTexture;
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.addControl(panel);

    var textIN = new BABYLON.GUI.TextBlock();
    textIN.text = TXT_INS
    textIN.height = "80px";
    textIN.width = 1;
    textIN.color = "Orange";
    textIN.fontSize = 20;
    panel.addControl(textIN);
    setTimeout(function () {
        advancedTexture.dispose();
    }, 3000);
}

function congoMSg() {
    var font_type = "Arial";//verdana

    var congratsPlane = BABYLON.MeshBuilder.CreatePlane("congratsPlane", { width: 10, height: 3 }, scene);
    congratsPlane.rotate(BABYLON.Axis.Y, 7 * Math.PI / 6, BABYLON.Space.WORLD);
    var DTWidth = 10 * 60;
    var DTHeight = 3 * 60;

    // var TXT_FINISH = "Congrats, you saved your partner!!!";

    var congratsTexture = new BABYLON.DynamicTexture("congratsTexture", { width: DTWidth, height: DTHeight }, scene);

    //Check width of text for given font type at any size of font
    var ctx = congratsTexture.getContext();
    var size = 12; //any value will work
    ctx.font = size + "px " + font_type;
    var textWidth = ctx.measureText(TXT_FINISH).width;

    var ratio = textWidth / size;

    //set font to be actually used to write text on dynamic texture
    var font_size = Math.floor(DTWidth / (ratio * 1)); //size of multiplier (1) can be adjusted, increase for smaller text
    var font = font_size + "px " + font_type;

    //Draw text
    congratsTexture.drawText("", null, null, font, "#DAA520", "transparent");
    congratsTexture.hasAlpha = true;

    var congratsMat = new BABYLON.StandardMaterial("congratsMat", scene);
    congratsMat.specularColor = new BABYLON.Color3(0, 0, 0);
    congratsMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    congratsMat.diffuseTexture = congratsTexture;

    congratsPlane.material = congratsMat;

    congratsPlane.position.x = target.position.x;
    congratsPlane.position.y = target.position.y + 5;
    congratsPlane.position.z = target.position.z;
    congratsTexture.drawText(TXT_FINISH, null, null, font, "#DAA520", "transparent");
}

function updateRadar() {

    pos1.left = -(boy.position.x / widthGround * mapImage.widthInPixels / 4)
    pos1.top = boy.position.z / heightGround * mapImage.heightInPixels / 4
    text2.text = "you: x: " + Math.round(boy.position.x) + " y: " + Math.round(boy.position.z);
    //rect5.left = (pos1.left + mapImage.widthInPixels / 2) / mapImage.widthInPixels * rect2.widthInPixels
    //rect5.top = pos1.top / mapImage.heightInPixels * rect2.heightInPixels
    pos1.rotation = boy.rotation.y
    // rect5.rotation = -boy.rotation.y


}
function setToGround(mesh) {
    var rayY = new BABYLON.Ray();
    var rayHelperY = new BABYLON.RayHelper(rayY);
    var localMeshDirectionY = new BABYLON.Vector3(0, -1, 0);
    var localMeshOriginY = globalToLocal(mesh.position, mesh);
    var length = 20;
    rayHelperY.attachToMesh(mesh, localMeshDirectionY, localMeshOriginY, length);
    var hitInfoY = rayY.intersectsMeshes([ground]);
    if (hitInfoY.length) {
        return hitInfoY[0].pickedPoint;
    }
    else return mesh.position;
}

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


function slowZoomIn() {

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

    nearCamera.animations = [];
    nearCamera.animations.push(movein);

    scene.beginAnimation(nearCamera, 0, 400, false, 1);
}

function fastZoomIn() {

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
        value: nearCamera.position.clone()
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
    nearCamera.animations = [];
    nearCamera.animations.push(movein);

    scene.beginAnimation(nearCamera, 0, 200, false, 1, function () {
        fading(rect2, 30, 0, 1);
        fading(rect5, 30, 0, 1);
        // godrays2 = new BABYLON.VolumetricLightScatteringPostProcess('godrays2', 1.0, nearCamera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
        // godrays2.mesh.material.diffuseTexture = new BABYLON.Texture('../images/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
        // godrays2.mesh.material.diffuseTexture.hasAlpha = true;
        // godrays2.mesh.material.freeze();
        // godrays2.mesh.position = new BABYLON.Vector3(0, 100, -200);
        // godrays2.mesh.scaling = new BABYLON.Vector3(5, 5, 5);
        // dirLight.position = godrays2.mesh.position;
        // godrays2.mesh.freezeWorldMatrix();
        // godrays2.mesh.doNotSyncBoundingInfo = true;
        // nearCamera.position = CoT.position;
        // nearCamera.attachControl(canvas, true);
        // scene.activeCamera = nearCamera;
        //godrays.dispose(farCamera);
        //farCamera.dispose();
        //CoT.dispose();
        nearCamera.upperRadiusLimit = 50;
        messageContainer.dispose();
        panel.dispose();
    });
    setTimeout(function () {
        if (MOON) instructionMsg("Go near the oxygen cylinder and \n press 'Q' to pick");
        else instructionMsg("Go to the rover to repair it");
    }, 7000);
}


function slowZoomOut() {

    //for farCamera move forward
    let moveout = new BABYLON.Animation(
        "moveout",
        "position",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    let moveout_keys = [];

    moveout_keys.push({
        frame: 0,
        value: nearCamera.position.clone()
    });
    moveout_keys.push({
        frame: 3000,
        value: FAR_CAM_POS.clone()
    });

    moveout.setKeys(moveout_keys);
    nearCamera.animations = [];
    nearCamera.animations.push(moveout);

    scene.beginAnimation(nearCamera, 0, 3000, false, 1);
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
    return scene.beginAnimation(container, 0, 100, false, 1);

}

function blinking(container, speed, start, end) {

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
        value: end
    });

    //At the animation key 100, the value of scaling is "1"
    keys.push({
        frame: 50,
        value: start
    });

    keys.push({
        frame: 100,
        value: end
    });

    animationBox.setKeys(keys);

    var animationGroup = new BABYLON.AnimationGroup("my group");
    animationGroup.addTargetedAnimation(animationBox, container);

    // Make sure to normalize animations to the same timeline
    animationGroup.normalize(0, 100);

    return animationGroup;

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

let j = 0;
function typeWriterEnd(callback) {
    if (j < TXT_GOAL.length) {
        textEnd.text += TXT_GOAL.charAt(j);
        j++;
        setTimeout(typeWriterEnd, 50);
    } else if (j >= TXT_GOAL.length) {
        if (callback && typeof (callback) === "function") {
            callback();
        }
    }
}

function showGUI() {

    var music = new BABYLON.Sound("task", "../sounds/" + TASK_SOUND, scene, null, {
        loop: false,
        autoplay: true,
        volume: 0.75
    });

    var music2 = new BABYLON.Sound("back", "../sounds/" + BACK_SOUND, scene, null, {
        loop: true,
        autoplay: true,
        volume: 0.15
    });

    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var panelE = new BABYLON.GUI.StackPanel();
    panelE.top = '-35%';
    advancedTexture.addControl(panelE);

    textE = new BABYLON.GUI.TextBlock();
    textE.text = 'press E to repair'
    textE.height = "80px";
    textE.width = 1;
    textE.color = "Orange";
    textE.fontSize = 24;
    textE.alpha = 0;
    panelE.addControl(textE);

    blinkE = blinking(textE, 30, 1, 0)

    blinkE.pause();

    messageContainer = new BABYLON.GUI.Rectangle();
    messageContainer.height = 0.3;
    messageContainer.width = 0.7;
    messageContainer.cornerRadius = 20;
    messageContainer.color = "Orange";
    messageContainer.alpha = 0;
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
    panel.addControl(startButton);

    rect2 = new BABYLON.GUI.Rectangle();
    rect2.height = 0.3;
    rect2.width = 0.15;
    rect2.cornerRadius = 30;
    rect2.color = "Orange";
    rect2.left = '40%';
    rect2.top = '30%';
    rect2.alpha = 0;
    advancedTexture.addControl(rect2);

    rect5 = new BABYLON.GUI.Rectangle();
    rect5.height = 6;
    rect5.width = 6;
    rect5.alpha = 0;
    rect2.addControl(rect5);

    mapImage = new BABYLON.GUI.Image("", MINI_MAP_PATH);
    mapImage.width = 1;
    mapImage.height = 1;
    mapImage.alpha = 0.5;
    rect5.addControl(mapImage);

    pos1 = new BABYLON.GUI.Rectangle();
    pos1.height = "10px";
    pos1.width = "10px";
    pos1.background = "Orange";
    rect5.addControl(pos1);

    pos2 = new BABYLON.GUI.Rectangle();
    pos2.height = "10px";
    pos2.width = "10px";
    pos2.background = "Green";
    rect5.addControl(pos2);


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

    text2 = new BABYLON.GUI.TextBlock();
    text2.text = "you: x: " + Math.round(boy.position.x) + " y: " + Math.round(boy.position.z);
    text2.height = "15px";
    text2.width = 1;
    text2.color = "Orange";
    text2.fontSize = 12;
    panel2.addControl(text2);

    let text3 = new BABYLON.GUI.TextBlock();
    text3.text = "target: x: " + Math.round(target.position.x) + ", y: " + Math.round(target.position.z);
    text3.height = "15px";
    text3.width = 1;
    text3.color = "Green";
    text3.fontSize = 12;
    panel2.addControl(text3);

    mapImage.onImageLoadedObservable.addOnce(function () {

        pos1.left = -(boy.position.x / widthGround * mapImage.widthInPixels / 4)
        pos1.top = boy.position.z / heightGround * mapImage.heightInPixels / 4

        pos2.left = -(TARGET_POS.x / widthGround * mapImage.widthInPixels / 4)
        pos2.top = TARGET_POS.z / heightGround * mapImage.heightInPixels / 4
    })

    setTimeout(async () => {
        var anim = fading(messageContainer, 30, 0, 1)
        typeWriter();
        await anim.waitAsync();
        startButton.onPointerUpObservable.addOnce(function () {
            click.play();
            setTimeout(async () => {
                anim = fading(panel, 40, 1, 0);
                anim = fading(messageContainer, 40, 1, 0);
                await anim.waitAsync();
                fastZoomIn()
            });
        });
    });
}


function showEndGUI() {
    scene.onKeyboardObservable.clear();
    nearCamera.upperRadiusLimit = 300;
    nearCamera.detachControl(canvas);

    slowZoomOut()
    fading(rect2, 30, 1, 0)
    fading(rect5, 30, 1, 0);

    var music = new BABYLON.Sound("end", "../sounds/" + GOAL_SOUND, scene, null, {
        loop: false,
        autoplay: true,
        volume: 0.75
    });

    setTimeout(function () {
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var messageContainer = new BABYLON.GUI.Rectangle();
        messageContainer.height = 0.3;
        messageContainer.width = 0.7;
        messageContainer.cornerRadius = 20;
        messageContainer.color = "Orange";
        messageContainer.alpha = 0;
        advancedTexture.addControl(messageContainer);

        var panel = new BABYLON.GUI.StackPanel();
        messageContainer.addControl(panel);

        textEnd = new BABYLON.GUI.TextBlock();
        textEnd.height = "80px";
        textEnd.width = 1;
        textEnd.color = "Orange";
        textEnd.fontSize = 24;
        panel.addControl(textEnd);

        var endButton = BABYLON.GUI.Button.CreateImageWithCenterTextButton("endButton", "NEXT MISSION");
        endButton.width = 0.35;
        endButton.height = "40px";
        endButton.cornerRadius = 20;
        endButton.color = "Orange";
        endButton.fontSize = 24;
        panel.addControl(endButton);

        setTimeout(async () => {
            var anim = fading(messageContainer, 30, 0, 1)
            typeWriterEnd();
            endButton.onPointerUpObservable.addOnce(function () {
                click.play();
                setTimeout(async () => {
                    anim = fading(panel, 40, 1, 0);
                    anim = fading(messageContainer, 40, 1, 0);
                    await anim.waitAsync();
                    if (MOON) {
                        window.location.href = "mission2.html";
                    } else {
                        window.location.href = "index.html";
                    }
                });
            });
        });
    }, 10000)

}

// function moveto() {

//     boy.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
//     boy.animationPropertiesOverride.enableBlending = true;
//     boy.animationPropertiesOverride.blendingSpeed = 0.05;
//     boy.animationPropertiesOverride.loopMode = 0;


//     let animationBox = new BABYLON.Animation("moving", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

//     // An array with all animation keys
//     let keys = [];

//     //At the animation key 0, the value of scaling is "1"
//     keys.push({
//         frame: 0,
//         value: boy.position
//     });

//     //At the animation key 100, the value of scaling is "1"

//     keys.push({
//         frame: 100,
//         value: target.position
//     });

//     animationBox.setKeys(keys);

//     var animationGroup = new BABYLON.AnimationGroup("moveGroup");
//     animationGroup.addTargetedAnimation(animationBox, boy);

//     // Make sure to normalize animations to the same timeline
//     animationGroup.normalize(0, 100);

//     return animationGroup;

// }

// function rotateto(angle) {

//     boy.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
//     boy.animationPropertiesOverride.enableBlending = true;
//     boy.animationPropertiesOverride.blendingSpeed = 0.05;
//     boy.animationPropertiesOverride.loopMode = 0;


//     let animationBox = new BABYLON.Animation("moving", "rotation", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

//     // An array with all animation keys
//     let keys = [];

//     //At the animation key 0, the value of scaling is "1"
//     keys.push({
//         frame: 0,
//         value: boy.rotation
//     });

//     //At the animation key 100, the value of scaling is "1"

//     keys.push({
//         frame: 100,
//         value: new BABYLON.Vector3(boy.rotation.x, angle, boy.rotation.z)
//     });

//     animationBox.setKeys(keys);

//     var animationGroup = new BABYLON.AnimationGroup("moveGroup");
//     animationGroup.addTargetedAnimation(animationBox, boy);

//     // Make sure to normalize animations to the same timeline
//     animationGroup.normalize(0, 100);

//     return animationGroup;

// }

// function dot2(vec1, vec2) {
//     return vec1.x * vec2.x + vec1.z * vec2.z;
// }
// function abs2(vec) {
//     return Math.sqrt(vec.x * vec.x + vec.z * vec.z)
// }