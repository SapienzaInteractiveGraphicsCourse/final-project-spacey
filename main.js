import * as THREE from './three.js-master/build/three.module.js';

import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';

import { DRACOLoader } from './three.js-master/examples/jsm/loaders/DRACOLoader.js'

import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

function main() {
    var mixer;

    const canvas = document.getElementById('c');
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 100;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 0);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 10, -5);
    controls.update();



    var model;

    const color = 0xFFFFFF;
    const intensity = 1;
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 1.0);

    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 200, 0);
    scene.add(hemiLight);
    scene.add(light);

    aggSfondoStellato();
    aggOggetto(0, 500, 0, 20)

    var clock = new THREE.Clock();

    // Instantiate a loader
    var loader = new GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./three.js-master/examples/models/draco');
    loader.setDRACOLoader(dracoLoader);

    // // Load a glTF resource
    loader.load(
        // resource URL
        'models/l1.glb',
        // called when the resource is loaded
        function (gltf) {

            model = gltf.scene;
            //model.visible = true;
            model.position.set(0, 0, 0);

            model.visible = true;

            scene.add(model);

            model.traverse(function (object) {

                if (object.isMesh) object.castShadow = true;

            });


            //

            // createPanel();


            //


            mixer = new THREE.AnimationMixer(model);

            mixer.clipAction(gltf.animations[0]).play();
            // walkAction = mixer.clipAction(animations[3]);
            // runAction = mixer.clipAction(animations[1]);

            // actions = [idleAction, walkAction, runAction];

            // activateAllActions();

            // animate();

            console.log('Added');

            // gltf.animations; // Array<THREE.AnimationClip>
            // gltf.scene; // THREE.Group
            // gltf.scenes; // Array<THREE.Group>
            // gltf.cameras; // Array<THREE.Camera>
            // gltf.asset; // Object

        },
        // called while loading is progressing
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );


    // const boxWidth = 1;
    // const boxHeight = 1;
    // const boxDepth = 1;
    // const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // function makeInstance(geometry, color, x) {
    //     const material = new THREE.MeshPhongMaterial({ color });

    //     const cube = new THREE.Mesh(geometry, material);
    //     scene.add(cube);

    //     cube.position.x = x;

    //     return cube;
    // }

    // const cubes = [
    //     makeInstance(geometry, 0x44aa88, 0),
    //     makeInstance(geometry, 0x8844aa, -2),
    //     makeInstance(geometry, 0xaa8844, 2),
    // ];

    function render(time) {
        time *= 0.001;  // convert time to seconds
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        if (mixer) mixer.update(clock.getDelta());


        // cubes.forEach((cube, ndx) => {
        //     const speed = 1 + ndx * .1;
        //     const rot = time * speed;
        //     cube.rotation.x = rot;
        //     cube.rotation.y = rot;
        // });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    renderer.render(scene, camera);

    requestAnimationFrame(render);

}

main();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function aggSfondoStellato() {

    var geometria = new THREE.Geometry();
    var minDist = 100;

    for (var i = 0; i < 10000; i++) {

        var star = new THREE.Vector3();
        star.x = minDist + THREE.Math.randFloatSpread(2000);
        star.y = minDist + THREE.Math.randFloatSpread(2000);
        star.z = minDist + THREE.Math.randFloatSpread(2000);

        geometria.vertices.push(star);

    }

    var materiale = new THREE.PointsMaterial({ color: 0xffffff });

    var campo = new THREE.Points(geometria, materiale);

    scene.add(campo);

}
function aggOggetto(x, y, z, dimensione) {

    var geometry, material, mesh;

    geometry = new THREE.SphereGeometry(dimensione, 50, 50);
    material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("/images/8k_sun.jpg"),
        shininess: 1
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.set(x, y, z);
    mesh.rotation.x = 0.5 * Math.PI;

}