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
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const START_POSITION = {x: 3, y: 3, z: 8};
const PLAY_POSITION = {x: 0, y: 1.5, z: 1.3};
let lStick;
let toastTimeout;
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

let stats;

const button = document.createElement('button')
button.style.cursor = 'pointer'
button.style.position = "absolute"
button.innerText = "Stats for Nerds"
button.style.zIndex = 5
button.addEventListener("click", event => toggleStats());
document.body.appendChild(button)

function toggleStats() {
    const container = document.getElementById( 'stats' );
    console.log(container.style.visibility)
    if (container.style.visibility != "") {
        container.style.visibility = container.style.visibility === "hidden" ? "visible" : "hidden";
        return;
    }
    stats = new Stats();
    const dom = stats.dom;
    dom.style.top = '35px'
    dom.style.left = '8px'
    container.appendChild( dom );
    
    const [ver, face] = statsVF();
    const st = document.createElement('div');
    st.innerHTML = `Vertices: ${ver} <br/> Faces: ${face}`;
    st.style.position = 'absolute'
    st.style.top = '85px'
    st.style.left = '8px'
    st.style.zIndex = 5;
    container.appendChild(st);
    container.style.visibility = "visible";
}

const tgroup = new TWEEN.Group();
const scene = new THREE.Scene();

// CSS renderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(cssRenderer.domElement);

// glRenderer
const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setClearColor(0x000000, 0);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = 0;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight);
cssRenderer.domElement.appendChild( renderer.domElement );


// BG
const pmremGenerator = new THREE.PMREMGenerator( renderer );
scene.background = new THREE.Color( 0xbfe3dd );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, .1, 100 );
camera.position.set(...Object.values(START_POSITION));

// Interactive
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
    console.log("animation", gltf.animations)
    scene.add(cabinet);
    console.log("cabinet", cabinet.position)

    lStick = cabinet.children.find(el => el.name === "LJoystickstick002")
    console.log("lstick2", cabinet)
    
    addWebsite(gltf.scene.children[5]);
})

function addWebsite(screen) {
    // div & iframe
    const width = 1000
    const height = 700

    const element = document.createElement('div');
    element.style.width = width + 'px';
    element.style.height = height + 'px';
    element.style.backgroundColor = 'red';
    element.classList.add('transparent-backside')

    const holder = new THREE.Group();
    holder.scale.set(.7,.7,1)
    console.log(screen)
    holder.position.setY(1.25)
    holder.position.setZ(0.01)
    holder.rotateX(degToRad(-30.2));

    const css3DObject = new CSS3DObject(element);

    holder.add(css3DObject);

    const ratio = height / width;
    css3DObject.scale.set(1/width, 1/height * ratio, 1);
    css3DObject.position.setY(0.01);
    const imgGeo = new THREE.PlaneGeometry(1, ratio);
    const imgMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x000000),
        blending: THREE.NoBlending,
        side: THREE.FrontSide,
    });

    const plane = new THREE.Mesh(imgGeo, imgMat);
    plane.name = "Screen"
    holder.add(plane);
    scene.add(holder);

    setTimeout(() => {
        plane.material.opacity = 0
        const iframe = document.createElement('iframe');
        iframe.src = 'https://mikqmas.github.io/porfolioV1/'; // Replace with your desired URL
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        css3DObject.element.append(iframe);
        iframe.addEventListener('load', () => {
            console.log('iframe loaded');
            let returnStick;
            iframe.contentWindow.document.addEventListener("wheel", event => {
                if (lStick) {
                    console.log(event.deltaY)
                    if (event.deltaY > 0 && lStick.rotation.y <= degToRad(event.deltaY/2)) {
                        lStick.rotation.y = (Math.min(degToRad(event.deltaY/2),  45));
                    }else if (event.deltaY < 0 && lStick.rotation.y >= degToRad(event.deltaY/5)) {
                        lStick.rotation.y = (Math.min(degToRad(event.deltaY/5),  -45));
                    }
                    if (returnStick) {
                        clearTimeout(returnStick)
                    }
                    returnStick = setTimeout(() => {
                        lStick.rotation.y = 0
                    },1000) 
                }
            })
        });
    }, 2000)
    
    addArrow();
    addButton();
    addText();
}

function addArrow() {
    // Create the arrow shaft (cylinder)
    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6);
    const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0x004400 });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);

    // Position the shaft
    shaft.position.y = 2.15;

    // Create the arrowhead (cone)
    const headGeometry = new THREE.ConeGeometry(0.15, 0.15, 6);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0x004400 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotateX(degToRad(180));

    // Position the head
    head.position.y = 2;

    // Combine the parts
    const arrow = new THREE.Group();
    arrow.add(shaft);
    arrow.add(head);

    // Add the arrow to the scene
    scene.add(arrow);
    const endPosition = {x: arrow.position.x, y: 1, z: arrow.position.z}

    const move = new TWEEN.Tween(arrow.position)
        .to({y: arrow.position.y + arrow.position <= 0 ? -0.25 : 0.25}, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .repeat(Infinity)
        .yoyo(true)
        .delay(100)
        .onRepeat(() => {
            console.log(arrow.position.y)
            arrow.position.set(0, arrow.position.y, 0); // Ensure it reverses smoothly
        })
        .start();

    tgroup.add(move);

    return arrow;
}

function addText() {
    // Load the font and create the text
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometry = new TextGeometry('play', {
            font: font,
            size: 0.125,
            depth: 0.05,
            curveSegments: 2
        });
        textGeometry.center();

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text in the scene
        textMesh.position.y = 3;

        const anim = new TWEEN.Tween(textMesh.rotation)
            .to({y: degToRad(-359)}, 6000)
            .easing(TWEEN.Easing.Linear.InOut)
            .repeat(Infinity)
            .start()

        tgroup.add(anim);

        // Add the text to the scene
        scene.add(textMesh);
    });
}

function startGame() {
    event.stopPropagation();
    let toast = "Press 'Esc' Key to Return";
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
        mobileEscape();
        toast = "Press 'Back Home' at Top Right";
    }
    showToast(toast);
    cssRenderer.domElement.style.pointerEvents = 'none';
    const tween = new TWEEN.Tween(camera.position)
        .to(PLAY_POSITION, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    tgroup.add(tween);
}


// Esc to Home
document.addEventListener("keydown", event => {
    console.log(camera.position === new THREE.Vector3(START_POSITION), camera.position, new THREE.Vector3(START_POSITION))
    if (event.key === "Escape" && camera.position.distanceTo(START_POSITION) > 1) {
        console.log("HRE")
        cameraToHome(scene.getObjectByName("stopMesh"));
    }
})

function addButton() {
    const group = new THREE.Group();
    
    const geo = new THREE.BoxGeometry(0.5,0.5,0.5);
    const mat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.5});
    const cube = new THREE.Mesh(geo, mat);
    cube.position.setY(3)

    const matOutline = new THREE.MeshBasicMaterial({color: 0x004400, side: THREE.BackSide});
    const cubeOutline = new THREE.Mesh(geo, matOutline);
    cubeOutline.position.setY(3)
    cubeOutline.scale.multiplyScalar(1.05);

    cube.addEventListener("click", (event) => {
        startGame();
    });


    addCursor(cube);

    group.add(cube)
    group.add(cubeOutline)

    const anim = new TWEEN.Tween(group.rotation)
        .to({y: degToRad(90)}, 3000)
        .easing(TWEEN.Easing.Linear.InOut)
        .repeat(Infinity)
        .start();

    tgroup.add(anim);

    scene.add(group)
    
    interactionManager.add(cube);
}

function statsVF() {
    let totalVer = 0;
    let totalFace = 0;

    scene.traverse(object => {
        if (object.isMesh) {
            const verts = object.geometry.attributes.position.count;
            totalVer += verts;
            totalFace += object.geometry.index ? object.geometry.index.count / 3 : verts/3;  
        }
    });

    return [totalVer, totalFace];
}

function cameraToHome(stopMesh) {
    cssRenderer.domElement.style.pointerEvents = 'auto';
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    const toast = document.getElementById('toast');
    toast.className = 'toast';
    const reverse = new TWEEN.Tween(camera.position)
        .to(START_POSITION, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {console.log(stopMesh); scene.remove(stopMesh)})
        .start();
    tgroup.add(reverse);
}

function returnHome() {
    const geo = new THREE.CylinderGeometry(0.03,0.04,0.01,8,2);
    const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
    const stopMesh = new THREE.Mesh(geo, mat);
    stopMesh.name = "stopMesh";
    stopMesh.position.set(0,1,.42);
    stopMesh.rotateX(degToRad(45))

    stopMesh.addEventListener("click", event => {
        cameraToHome(stopMesh);
    })
    scene.add(stopMesh)
    interactionManager.add(stopMesh)
}

// Add a plane in front of cabinet to click
const geo = new THREE.PlaneGeometry(.7,.7);
const mat = new THREE.MeshBasicMaterial({opacity: 0, transparent: true});
const playPlane = new THREE.Mesh(geo, mat);
playPlane.position.set(0,1.2,.3);
playPlane.rotateX(degToRad(-30))

playPlane.addEventListener("click", event => {
    startGame();
})
addCursor(playPlane);
scene.add(playPlane)
interactionManager.add(playPlane)

function addCursor(mesh) {
    mesh.addEventListener("mouseover", event => {
        document.body.style.cursor = 'pointer';
    })

    mesh.addEventListener("mouseout", event => {
        document.body.style.cursor = 'auto';
    })
}

function showToast(text) {
    const toast = document.getElementById('toast');
    toast.className = 'toast show';
    toast.innerText = text;
    toastTimeout = setTimeout(() => { toast.className = 'toast'; }, 8900);
}

function mobileEscape() {
    const button = document.getElementById("mobileEscape");
    button.style.display = "block";
    button.addEventListener("click", cameraToHome);
}

// Run
window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
};

function animate(time) {
    if (stats) {
        stats.update();
    }
    controls.update();
    cssRenderer.render(scene, camera);
    renderer.render( scene, camera );
    interactionManager.update();
    tgroup.update(time);
    if (mixer != null) {
        mixer.update(time);
    }
}

renderer.setAnimationLoop(animate);