var createLoading = function () {
    const SOUND_ENABLED = 'sound_enabled_label'

    engine.setHardwareScalingLevel(1);
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 3, 30, new BABYLON.Vector3(0, -1, 5), scene);

    var sat;
    BABYLON.SceneLoader.ImportMesh("_root", "../models/", "loading.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        sat = scene.getMeshByName(newMeshes[0].name);
        sat.position = new BABYLON.Vector3(0, 0, 0);
        sat.freezeWorldMatrix();
    });

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var messageContainer = new BABYLON.GUI.Rectangle();
    messageContainer.top = "10%"
    messageContainer.height = 0.1;
    messageContainer.width = 0.15;
    messageContainer.cornerRadius = 20;
    messageContainer.thickness = 0;
    messageContainer.color = "Orange";
    advancedTexture.addControl(messageContainer);

    var panel = new BABYLON.GUI.StackPanel();
    messageContainer.addControl(panel);

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = 'loading'
    text1.height = "40px";
    text1.width = 1;
    text1.color = "Orange";
    text1.fontSize = 36;
    panel.addControl(text1);
    var text2 = new BABYLON.GUI.TextBlock();
    text2.top = "20%"
    text2.text = 'loading all meshes'
    text2.height = "20px";
    text2.width = 1;
    text2.color = "Orange";
    text2.fontSize = 15;
    advancedTexture.addControl(text2);
    var CoT = new BABYLON.TransformNode("CoTLoading");
    camera.parent = CoT;


    scene.clearColor = new BABYLON.Color3(0, 0, 0);
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    scene.registerBeforeRender(() => {
        CoT.rotation.y += 0.01;
    })
    var loading = { scene: scene, title: text1, subtitle: text2, timeout: false }
    scene.executeWhenReady(function () {
        var music = new BABYLON.Sound("beep", "../sounds/beep.wav", scene, null, {
            loop: false,
            autoplay: true,
            volume: 0.1
        });
        BABYLON.Engine.audioEngine.setGlobalVolume(1);
        fading(text1, 30, 1, 0)
        setTimeout(function () {
            music.dispose()
            loading.timeout = true
        }, 10000)
    })
    function fading(container, speed, start, end) {
        container.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        container.animationPropertiesOverride.enableBlending = true;
        container.animationPropertiesOverride.blendingSpeed = 0.05;
        container.animationPropertiesOverride.loopMode = 0;
        let animationBox = new BABYLON.Animation("fading", "alpha", speed, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let keys = [];
        keys.push({
            frame: 0,
            value: start
        });
        keys.push({
            frame: 50,
            value: end
        });
        keys.push({
            frame: 100,
            value: start
        });
        animationBox.setKeys(keys);
        container.animations = [];
        container.animations.push(animationBox);
        scene.beginAnimation(container, 0, 100, true);

    }
    return loading;
};
