import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { InteractionManager } from 'three.interactive';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { degToRad } from 'three/src/math/MathUtils.js';

let action;
const PLAY_POSITION = {x: 0, y: 1.5, z: 1.3};
const manager = new THREE.LoadingManager();
let mixer;
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onLoad = function ( ) {
	console.log( 'Loading complete!');
};

manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};

manager.onError = function ( url ) {
	console.log( 'There was an error loading ' + url );
};

const container = document.getElementById( 'container' );
const stats = new Stats();
container.appendChild( stats.dom );


const group = new TWEEN.Group();
const scene = new THREE.Scene();

// CSS renderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
// cssRenderer.domElement.style.top = 0;
// cssRenderer.domElement.style.position = 'absolute';
document.body.appendChild(cssRenderer.domElement);

// glRenderer
const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setClearColor(0x000000, 0);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = 0;
renderer.domElement.style.zIndex = 1;
// renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight);
cssRenderer.domElement.appendChild( renderer.domElement );


// BG
// const pmremGenerator = new THREE.PMREMGenerator( renderer );
// scene.background = new THREE.Color( 0xbfe3dd );
// scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

// Light
const light = createLight();
scene.add(light);

const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, .1, 100 );
camera.position.set( 3, 3, 8 );

const interactionManager = new InteractionManager(
    renderer, 
    camera,
    renderer.domElement
);

// Orbit Controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 1.2, 0 );
controls.enablePan = false;
controls.enableDamping = true;

// GLB Model loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'jsm/libs/draco/gltf/' );
const loader = new GLTFLoader(manager);
loader.setDRACOLoader( dracoLoader );
let cabinet;
loader.load( 'models/arcade_cabinet.glb', function(gltf) {
    cabinet = gltf.scene;
    console.log(gltf)
    mixer = new THREE.AnimationMixer(cabinet);
    console.log("animation", gltf.animations)
    action = mixer.clipAction(gltf.animations[1]);
    action.setLoop(THREE.LoopOnce);
    // action.play();
    scene.add(cabinet);
    console.log("cabinet", cabinet.position)
    
    addWebsite(gltf.scene.children[5]);
})
// Add a light to the scene
const light3 = new THREE.SpotLight(0xffffff, 1, 1);

light3.position.set(5, 5, 5);
scene.add(light3);

// Button
// const cube = addCube();
const geo = new THREE.BoxGeometry(2,2,2);
const mat = new THREE.MeshPhongMaterial({emissive: 0xfffff33, emissiveIntensity: 100});
const cube = new THREE.Mesh(geo, mat);
// cube.rotateX(90)
cube.position.setY(4)
cube.addEventListener("click", (event) => {
    event.stopPropagation();
    controls.enabled = false;
    cssRenderer.domElement.style.pointerEvents = 'none';
    const tween = new TWEEN.Tween(camera.position)
        .to(PLAY_POSITION, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        // .onUpdate(() =>
        //   camera.position.set(coords.x, coords.y, camera.position.z)
        // )
        .onComplete(() => {controls.enabled = true;})
        .start();
    group.add(tween);
});

scene.add(cube)
// Button2
// const cube = addCube();
const geo2 = new THREE.BoxGeometry(1,1,1);
const mat2= new THREE.MeshBasicMaterial({color: 0xff0000});
const cube2 = new THREE.Mesh(geo2, mat2);
// cube.rotateX(90)
cube2.position.setY(2)
cube2.addEventListener("click", (event) => {
    event.stopPropagation();
    console.log("click", action)
    // action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;

    action.play();
    // controls.enabled = false;
    // cssRenderer.domElement.style.pointerEvents = 'none';
    // const tween = new TWEEN.Tween(camera.position)
    //     .to(PLAY_POSITION, 1500)
    //     .easing(TWEEN.Easing.Quadratic.InOut)
    //     // .onUpdate(() =>
    //     //   camera.position.set(coords.x, coords.y, camera.position.z)
    //     // )
    //     .onComplete(() => {controls.enabled = true;})
    //     .start();
    // group.add(tween);
});

// scene.add(cube2)

interactionManager.add(cube);
interactionManager.add(cube2);
// scene.add(cube);

renderer.setAnimationLoop(animate);

window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
};

function animate(time) {
    stats.update();
    controls.update();
    cssRenderer.render(scene, camera);
    renderer.render( scene, camera );
    interactionManager.update();
    group.update(time);
    if (mixer != null) {
        mixer.update(time);
    }
}

function addCube() {
    // geometry
    const geo = new THREE.BoxGeometry(1,1,1);
    // material
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    // mesh
    return new THREE.Mesh(geo, material);
}


function createLight() {
    const light = new THREE.PointLight(0xffffff, 100, 1000);
    light.position.set(4,4,4);
    return light;
}

function addScreen() {
    // div & iframe
    const width = 1000
    const height = 700

    const element = document.createElement('div');
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    element.style.backgroundColor = 'red';
    element.classList.add('transparent-backside')

    const holder = new THREE.Group();
    // holder.position.setY(1.25);
    // holder.scale.setX(.75)
    holder.scale.set(.7,.7,1)
    console.log(screen)
    holder.position.setY(1.25)
    holder.position.setZ(0.01)
    holder.rotateX(degToRad(-30.2));

    const css3DObject = new CSS3DObject(element);

    holder.add(css3DObject);

    const ratio = height / width;
    css3DObject.scale.set(1/width, 1/height * ratio, 1);
    css3DObject.position.setY(0.01)
    // css3DObject.position.setZ(0.1)
    // css3DObject.scale.set(1.02*.75/(width),(1.22*.75/(height)) * ratio, 1);
    const imgGeo = new THREE.PlaneGeometry(1, ratio);
    const imgMat = new THREE.MeshBasicMaterial({
        // opacity: 0,
        color: new THREE.Color(0x000000),
        blending: THREE.NoBlending,
        // side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(imgGeo, imgMat);
    plane.scale.set(1,1,1)
    // plane.position.setY(-0.03)
    // plane.rotateZ(degToRad(50))
    // plane.scale.setZ(60)
    // plane.position.setY(0.5)
    // plane.scale.set(new THREE.Vector3(5,5,5))
    holder.add(plane);
    scene.add(holder)
}

function addWebsite(screen) {
    // div & iframe
    const width = 1000
    const height = 700

    const element = document.createElement('div');
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    element.style.backgroundColor = 'red';
    element.classList.add('transparent-backside')

    // const iframe = document.createElement('iframe');
    // iframe.src = 'https://mikqmas.github.io/'; // Replace with your desired URL
    // iframe.style.width = '100%';
    // iframe.style.height = '100%';
    // iframe.style.border = 'none';
    // iframe.style.backgroundColor = 'blue';
    // element.append(iframe);

    const holder = new THREE.Group();
    // holder.position.setY(1.25);
    // holder.scale.setX(.75)
    holder.scale.set(.7,.7,1)
    console.log(screen)
    holder.position.setY(1.25)
    holder.position.setZ(0.01)
    holder.rotateX(degToRad(-30.2));

    const css3DObject = new CSS3DObject(element);

    holder.add(css3DObject);

    const ratio = height / width;
    css3DObject.scale.set(1/width, 1/height * ratio, 1);
    css3DObject.position.setY(0.01)
    // css3DObject.position.setZ(0.1)
    // css3DObject.scale.set(1.02*.75/(width),(1.22*.75/(height)) * ratio, 1);
    const imgGeo = new THREE.PlaneGeometry(1, ratio);
    const imgMat = new THREE.MeshBasicMaterial({
        // opacity: 0,
        color: new THREE.Color(0x000000),
        blending: THREE.NoBlending,
        // side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(imgGeo, imgMat);
    plane.name = "Screen"
    plane.scale.set(1,1,1)
    // plane.position.setY(-0.03)
    // plane.rotateZ(degToRad(50))
    // plane.scale.setZ(60)
    // plane.position.setY(0.5)
    // plane.scale.set(new THREE.Vector3(5,5,5))
    holder.add(plane);
    scene.add(holder)

    console.log("holder", holder.children.find((el) => el.isCSS3DObject))

    const el = holder.children.find((el) => el.isCSS3DObject)
    const plane2 = holder.children[1]
    console.log(plane2)

    setTimeout(() => {
        plane2.material.opacity = 0
        const iframe = document.createElement('iframe');
        iframe.src = 'https://mikqmas.github.io/porfolioV1/'; // Replace with your desired URL
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        // iframe.style.backgroundColor = 'blue';
        el.element.append(iframe);
    }, 2000)
    


    // console.log("screen", screen)
    // const webMesh = new THREE.Mesh(imgGeo, imgMat);
    // const webMesh = screen;
    // webMesh.material = new THREE.MeshStandardMaterial({ color: 'red', depthTest: false })
    // p.add(css3DObject);
    // webMesh.scale.set(1,1,1);
    // webMesh.position.set(0,1,0);
    // scene.add(webMesh);
}