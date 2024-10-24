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

let playing = false;
let action;
let lStick;
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

let stats;

const button = document.createElement('button')
button.style.cursor = 'pointer'
button.style.position = "absolute"
button.innerText = "Stats for Nerds"
button.style.zIndex = 5
button.addEventListener("click", event => toggleStats());
// const statsdom = document.getElementById("stats")
document.body.appendChild(button)
{/* <button id="showstats" onclick="alert('test')">stats for nerds</button> */}
// document.getElementById("showstats").addEventListener("click", event => console.log("showStats()"));

// toggleStats()

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
    // st.innerText("Vertices: 0")
    container.appendChild(st);
    container.style.visibility = "visible";
}

const tgroup = new TWEEN.Group();
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
// renderer.domElement.style.zIndex = -1;
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

// cssRenderer.domElement.style.pointerEvents = 'none';

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
    // action = mixer.clipAction(gltf.animations[1]);
    // action.setLoop(THREE.LoopOnce);
    // action.play();
    scene.add(cabinet);
    console.log("cabinet", cabinet.position)

    lStick = cabinet.children.find(el => el.name === "LJoystickstick")
    console.log("lstick2", cabinet)
    
    addWebsite(gltf.scene.children[5]);
})
// Add a light to the scene
const light3 = new THREE.SpotLight(0xffffff, 1, 1);

light3.position.set(5, 5, 5);
scene.add(light3);


// // Button2
// // const cube = addCube();
// const geo2 = new THREE.BoxGeometry(1,1,1);
// const mat2= new THREE.MeshBasicMaterial({color: 0xff0000});
// const cube2 = new THREE.Mesh(geo2, mat2);
// // cube.rotateX(90)
// cube2.position.setY(2)
// cube2.addEventListener("click", (event) => {
//     event.stopPropagation();
//     console.log("click", action)
//     // action.loop = THREE.LoopOnce;
//     action.clampWhenFinished = true;

//     action.play();
//     // controls.enabled = false;
//     // cssRenderer.domElement.style.pointerEvents = 'none';
//     // const tween = new TWEEN.Tween(camera.position)
//     //     .to(PLAY_POSITION, 1500)
//     //     .easing(TWEEN.Easing.Quadratic.InOut)
//     //     // .onUpdate(() =>
//     //     //   camera.position.set(coords.x, coords.y, camera.position.z)
//     //     // )
//     //     .onComplete(() => {controls.enabled = true;})
//     //     .start();
//     // group.add(tween);
// });

// // scene.add(cube2)

// interactionManager.add(cube2);
// // scene.add(cube);

renderer.setAnimationLoop(animate);

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
        // iframe.addEventListener("wheel", event => {
        //     console.log("scrolling",event.deltaY);
        //     if (lStick) {
        //         lStick.rotateZ(degToRad(event.delayY));
        //     }
        // })
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
        })
        // .addEventListener("wheel", event => console.log(event))

    }, 2000)
    
    addArrow();
    addButton();
    addText();

    // console.log("screen", screen)
    // const webMesh = new THREE.Mesh(imgGeo, imgMat);
    // const webMesh = screen;
    // webMesh.material = new THREE.MeshStandardMaterial({ color: 'red', depthTest: false })
    // p.add(css3DObject);
    // webMesh.scale.set(1,1,1);
    // webMesh.position.set(0,1,0);
    // scene.add(webMesh);
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
    // // Create background plane for the button
    // const planeGeometry = new THREE.PlaneGeometry(0.5, .15);
    // const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.position.set(0, 2.45, -0.1); // Slightly behind the text
    // scene.add(plane);

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

    // return textMesh;
}

function addButton() {
    // Button
    // const cube = addCube();
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
        playing = true;
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
        tgroup.add(tween);
    });

    cube.addEventListener("mouseover", event => {
        document.body.style.cursor = 'pointer';
    })

    cube.addEventListener("mouseout", event => {
        document.body.style.cursor = 'auto';
    })

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