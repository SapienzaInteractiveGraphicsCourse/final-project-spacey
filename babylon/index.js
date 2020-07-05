let canvas = document.getElementById('c');
var engine = new BABYLON.Engine(canvas, true);
var camera;
var advancedTexture;
var text2;
var text3;
var optimizer;
let boy;
var click;

let createScene = function () {
    engine.setHardwareScalingLevel(1);
    let scene = new BABYLON.Scene(engine);

    camera = new BABYLON.ArcRotateCamera("Camera", BABYLON.Tools.ToRadians(300),
        BABYLON.Tools.ToRadians(80), 60, new BABYLON.Vector3(2, 0, 85), scene);
    //camera.attachControl(canvas, true);

    var result = new BABYLON.SceneOptimizerOptions(60, 2000);
    var priority = 0;
    result.optimizations.push(new BABYLON.ShadowsOptimization(priority));
    result.optimizations.push(new BABYLON.LensFlaresOptimization(priority));
    priority++;
    result.optimizations.push(new BABYLON.PostProcessesOptimization(priority));
    result.optimizations.push(new BABYLON.ParticlesOptimization(priority));
    priority++;
    result.optimizations.push(new BABYLON.TextureOptimization(priority, 256));
    priority++;
    result.optimizations.push(new BABYLON.RenderTargetsOptimization(priority));
    priority++;
    //result.optimizations.push(new BABYLON.HardwareScalingOptimization(priority, 1));
    optimizer = new BABYLON.SceneOptimizer(scene, result);


    var play = 1;
    // Init engine

    // Init scene
    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    // Camera


    // light environment
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;
    light.groundColor = new BABYLON.Color3(0, 0, 0);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    var sun = new BABYLON.Mesh.CreateSphere('sun', 32, 69.57, scene);
    sun.orbit = {
        radius: 0,
        speed: 0.001,
        angle: 0
    };
    var sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);

    var sunLight = new BABYLON.PointLight('sunLight', new BABYLON.Vector3.Zero(), scene);
    sunMaterial.emissiveTexture = new BABYLON.Texture('../images/sun.jpg', scene);
    sunMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    sunMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    sun.material = sunMaterial;
    sunLight.intensity = 15;


    click = new BABYLON.Sound("click", "../sounds/click.mp3", scene, null, {
        loop: false,
        autoplay: false,
        volume: 1
    });

    // Planets Objects
    var planets = [];
    var mercury = {
        name: 'mercury',
        materialName: 'materialMercury',
        resolution: 32,
        size: 0.488,
        position: {
            x: 75.7,
            y: 0,
            z: 0
        },
        pathMaterial: '../images/mercury.jpg',
        speed: 0.009
    };

    var venus = {
        name: 'venus',
        materialName: 'materialVenus',
        resolution: 32,
        size: 1.21,
        position: {
            x: 80.8,
            y: 0,
            z: 0
        },
        pathMaterial: '../images/venus.jpg',
        speed: 0.007
    };

    var earth = {
        name: 'earth',
        materialName: 'materialEarth',
        resolution: 32,
        size: 1.27,
        position: {
            x: 84.9,
            y: 0,
            z: 0
        },
        moons: {
            moon: {
                name: 'moon',
                materialName: 'materialMoon',
                resolution: 32,
                size: 0.2,
                position: {
                    x: 2,
                    y: 0,
                    z: 0
                },
                pathMaterial: '../images/moon.jpg',
                speed: 0.01
            }
        },
        pathMaterial: '../images/earth.jpg',
        speed: 0.005
    };

    var mars = {
        name: 'mars',
        materialName: 'materialMars',
        resolution: 32,
        size: 0.67,
        position: {
            x: 92.7,
            y: 0,
            z: 0
        },
        pathMaterial: '../images/mars.jpg',
        speed: 0.003
    };

    var jupiter = {
        name: 'jupiter',
        materialName: 'materialJupiter',
        resolution: 32,
        size: 14.2,
        position: {
            x: 147.8,
            y: 0,
            z: 0
        },
        pathMaterial: '../images/jupiter.jpg',
        speed: 0.001
    };

    var saturn = {
        name: 'saturn',
        materialName: 'materialSaturn',
        resolution: 32,
        size: 10.8,
        position: {
            x: 212.9,
            y: 0,
            z: 0
        },
        disc: {
            createDisc: function (parentPlanet) {
                var torus = BABYLON.Mesh.CreateTorus("torus", 10.8, 6, 64, scene, false, BABYLON.Mesh.DEFAULTSIDE);
                var discMaterial = new BABYLON.StandardMaterial('discMaterial', scene);
                discMaterial.diffuseTexture = new BABYLON.Texture('../images/saturnmap.jpg', scene);
                discMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                torus.position.z = 0;
                torus.scaling.y = 0.1;
                torus.parent = parentPlanet;
                torus.material = discMaterial;
            }
        },
        pathMaterial: '../images/saturn.jpg',
        speed: 0.0009
    };

    var uranus = {
        name: 'uranus',
        materialName: 'materialUranus',
        resolution: 32,
        size: 5.1,
        position: {
            x: 350,
            y: 0,
            z: 0
        },
        pathMaterial: '../images/uranus.jpg',
        speed: 0.0007
    };

    var neptune = {
        name: 'neptune',
        materialName: 'materialNeptune',
        resolution: 32,
        size: 4.9,
        position: {
            x: 520.4,
            y: 0,
            z: 0
        },
        pathMaterial: '../images/neptune.jpg',
        speed: 0.0005
    };

    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    createPlanet(mercury);
    createPlanet(venus);
    createPlanet(earth);
    createPlanet(mars);
    createPlanet(jupiter);
    createPlanet(saturn);
    createPlanet(uranus);
    createPlanet(neptune);

    var panel2 = new BABYLON.GUI.StackPanel();
    panel2.top = '-35%';
    advancedTexture.addControl(panel2);

    text3 = new BABYLON.GUI.TextBlock();
    text3.text = 'wear headphones\nfor a better experience'
    text3.height = "80px";
    text3.width = 1;
    text3.color = "Orange";
    text3.fontSize = 24;
    panel2.addControl(text3);

    var messageContainer = new BABYLON.GUI.Rectangle();
    messageContainer.left = '30%';
    messageContainer.top = '25%';
    messageContainer.height = 0.3;
    messageContainer.width = 0.3;
    messageContainer.cornerRadius = 20;
    messageContainer.color = "Orange";
    messageContainer.thickness = 0;
    advancedTexture.addControl(messageContainer);

    var panel = new BABYLON.GUI.StackPanel();
    messageContainer.addControl(panel);

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = 'SPACE Y'
    text1.height = "60px";
    text1.width = 1;
    text1.color = "Orange";
    text1.fontSize = 60;
    panel.addControl(text1);

    text2 = new BABYLON.GUI.TextBlock();
    text2.text = '__________________'
    text2.height = "40px";
    text2.width = 1;
    text2.color = "Orange";
    text2.fontSize = 24;
    panel.addControl(text2);

    var buttonC = BABYLON.GUI.Button.CreateSimpleButton("bCommand", "commands");
    buttonC.width = 0.40;
    buttonC.height = "40px";
    buttonC.color = "orange";
    buttonC.fontSize = 20;
    buttonC.cornerRadius = 20;
    buttonC.thickness = 0;
    buttonC.onPointerUpObservable.add(function () {
        click.play()
        openCommandDialog();
    });
    panel.addControl(buttonC);

    var buttonS = BABYLON.GUI.Button.CreateSimpleButton("bStory", "story");
    buttonS.width = 0.40;
    buttonS.height = "20px";
    buttonS.color = "orange";
    buttonS.fontSize = 20;
    buttonS.cornerRadius = 20;
    buttonS.thickness = 0;
    buttonS.onPointerUpObservable.add(function () {
        click.play()
        window.location.href = "mission1.html";
    });
    panel.addControl(buttonS);

    scene.shadowsEnabled = true;

    BABYLON.SceneLoader.ImportMesh("Boy", "../models/", "ACES2.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        boy = scene.getMeshByName(newMeshes[0].name);
        boy.position = camera.position.clone().add(new BABYLON.Vector3(-1.3, -2.2, 1));
        boy.rotation.y = Math.PI
        boy.scaling = new BABYLON.Vector3(1.3, 1.2, 1.2)
        boy.material.freeze();
        boy.alwaysSelectAsActiveMesh = true
    }, function (loading) {
        var ld = Math.floor(loading.loaded / loading.total * 100.0)
        LOADING.subtitle.text = 'loading galaxy: ' + ld + '%'
    });

    // Planet Creation
    function createPlanet(planet) {
        var internalPlanet = new BABYLON.Mesh.CreateSphere(planet.name, planet.resolution, planet.size, scene);
        internalPlanet.position.x = planet.position.x;
        internalPlanet.position.y = planet.position.y;
        internalPlanet.position.z = planet.position.z;

        var internalPlanetMaterial = new BABYLON.StandardMaterial(planet.materialName, scene);
        internalPlanetMaterial.diffuseTexture = new BABYLON.Texture(planet.pathMaterial, scene);
        internalPlanetMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        internalPlanet.material = internalPlanetMaterial;
        internalPlanet.orbit = {
            radius: internalPlanet.position.x,
            speed: planet.speed / 10e6,
            angle: 0
        };

        // Discs around planets
        if (planet.disc) {
            planet.disc.createDisc(internalPlanet);
        }

        // Planet Moons
        if (planet.moons) {
            for (let prop in planet.moons) {
                var moon = planet.moons[prop];
                var planetMoon = new BABYLON.Mesh.CreateSphere(moon.name, moon.resolution, moon.size, scene);
                planetMoon.parent = internalPlanet;
                planetMoon.position.x = moon.position.x;
                planetMoon.position.y = moon.position.y;
                planetMoon.position.z = moon.position.z;
                var moonMaterial = new BABYLON.StandardMaterial(moon.materialName, scene);
                moonMaterial.diffuseTexture = new BABYLON.Texture(moon.pathMaterial, scene);
                moonMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
                planetMoon.material = moonMaterial;
                addLabel(planetMoon)

            }
        }
        addLabel(internalPlanet)
        planets.push(internalPlanet);
        return internalPlanet;
    };

    // Random Stars
    for (let counter = 0; counter <= 800; counter++) {
        var star = new BABYLON.Mesh.CreateSphere('star', 16, .2, scene);
        star.position.x = parseInt(Math.random() * 29) * 20;
        star.position.y = parseInt(Math.random() * 29) * 20;
        star.position.z = parseInt(Math.random() * 29) * 20;
    }

    for (let counter = 0; counter <= 800; counter++) {
        var star = new BABYLON.Mesh.CreateSphere('star', 16, .2, scene);
        star.position.x = parseInt(Math.random() * 29) * -20;
        star.position.y = parseInt(Math.random() * 29) * -20;
        star.position.z = parseInt(Math.random() * 29) * -20;
    }

    // Animations
    scene.beforeRender = function () {
        if (play != 0) {
            for (let counter = 0; counter <= planets.length - 1; counter++) {
                planets[counter].position.x = planets[counter].orbit.radius * Math.sin(planets[counter].orbit.angle);
                planets[counter].position.z = planets[counter].orbit.radius * Math.cos(planets[counter].orbit.angle);
                planets[counter].orbit.angle += planets[counter].orbit.speed / 10e6;
                planets[counter].rotate(BABYLON.Axis.Y, 0.002, BABYLON.Space.LOCAL);
                sun.rotate(BABYLON.Axis.Y, 0.001, BABYLON.Space.LOCAL);
            }
        }
    };
    optimizer.start();

    return scene;

}
const LOADING = createLoading();

var scene = createScene();

// Render Scene
engine.runRenderLoop(function () {
    if (scene.isReady() && LOADING.timeout) {
        if (LOADING.scene.isReady()) {
            LOADING.scene.dispose();
            fading(text3, 30, 1, 0);
        }
        scene.render();
    } else if (LOADING.scene.isReady()) {
        LOADING.scene.render();
    }

});
scene.executeWhenReady(function () {
    var music = new BABYLON.Sound("back", "../sounds/home.wav", scene, null, {
        loop: true,
        autoplay: true,
        volume: 0.25
    });
})
window.addEventListener('resize', function () {
    engine.resize();
});

function addLabel(mesh) {

    var color = 'Gray'
    var up_down = 1

    if (mesh.name == 'moon' || mesh.name == 'mars') {
        color = 'Orange'
        up_down = -1
    }

    var rect1 = new BABYLON.GUI.Button.CreateImageWithCenterTextButton(mesh.name, mesh.name);
    rect1.width = 0.1;
    rect1.height = "40px";
    rect1.cornerRadius = 20;
    rect1.color = color;
    rect1.thickness = 1;
    advancedTexture.addControl(rect1);
    rect1.linkWithMesh(mesh);
    rect1.linkOffsetY = up_down * -150;

    if (mesh.name == 'moon') {
        rect1.onPointerUpObservable.addOnce(function () {
            click.play()
            window.location.href = "mission1.html";
        });
    } else if (mesh.name == 'mars') {
        rect1.onPointerUpObservable.addOnce(function () {
            click.play()
            window.location.href = "mission2.html";
        });
    } else {
        rect1.onPointerUpObservable.addOnce(function () {
            rect1.textBlock.text = 'Locked'
        });
    }

    var target = new BABYLON.GUI.Ellipse();
    target.width = "7px";
    target.height = "7px";
    target.color = color;
    target.thickness = 1;
    target.background = color;
    advancedTexture.addControl(target);
    target.linkWithMesh(mesh);

    var line = new BABYLON.GUI.Line();
    line.lineWidth = 3;
    line.color = color;
    line.y2 = up_down * 20;
    advancedTexture.addControl(line);
    line.linkWithMesh(mesh);
    line.connectedControl = rect1;

}

function fading(container, speed, start, end) {

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

    keys.push({
        frame: 50,
        value: end
    });
    //At the animation key 100, the value of scaling is "1"
    keys.push({
        frame: 100,
        value: start
    });

    animationBox.setKeys(keys);
    container.animations = [];
    container.animations.push(animationBox);
    scene.beginAnimation(container, 0, 100, true);

}

let i = 0;
let txt = 'That\'s one small step for a man, \n one giant leap for mankind.'
function typeWriter() {
    if (i < txt.length) {
        text3.text += txt.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
    }
}

function openCommandDialog() {
    var messageContainer = new BABYLON.GUI.Rectangle();
    messageContainer.height = 0.5;
    messageContainer.width = 0.5;
    messageContainer.cornerRadius = 20;
    messageContainer.color = "Orange";
    messageContainer.background = "black"
    //    messageContainer.thickness = 0;
    advancedTexture.addControl(messageContainer);

    var panel = new BABYLON.GUI.StackPanel();
    messageContainer.addControl(panel);

    var text = new BABYLON.GUI.TextBlock();
    text.text = 'commands'
    text.height = "40px";
    text.width = 1;
    text.color = "Orange";
    text.fontSize = 30;
    panel.addControl(text);

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = 'W A S D keys to move\nQ E keys to grab objects\narrow keys and mouse to rotate'
    text1.height = "100px";
    text1.width = 1;
    text1.color = "Orange";
    text1.fontSize = 20;
    panel.addControl(text1);

    var buttonS = BABYLON.GUI.Button.CreateSimpleButton("bStory", "close");
    buttonS.width = 0.30;
    buttonS.height = "40px";
    buttonS.color = "orange";
    buttonS.fontSize = 20;
    buttonS.cornerRadius = 20;
    buttonS.onPointerUpObservable.add(function () {
        click.play()
        messageContainer.dispose()
    });
    panel.addControl(buttonS);



}