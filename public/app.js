import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

const scene = new THREE.Scene();
// Using a slightly lighter background to distinguish unlit objects from empty space
scene.background = new THREE.Color(0x111111); 
scene.fog = new THREE.FogExp2(0x111111, 0.0005);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
// Pull camera back significantly to see the whole biome
camera.position.set(1200, 800, 1500); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// POWERFUL LIGHTING
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(500, 1000, 500);
scene.add(sun);

// 1. LOADING YOUR MODELS FROM /public/models/
const mtlLoader = new MTLLoader();
mtlLoader.load("models/mount.blend1.mtl", (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load("models/mount.blend1.obj", (object) => {
        // Adjust scale based on your Blender export
        object.scale.set(10, 10, 10); 
        object.position.set(0, 0, 0);
        scene.add(object);
        console.log("Mountain loaded successfully.");
    }, 
    (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
    (err) => console.error("Error loading OBJ", err));
});

// 2. REPO FOREST
async function initForest() {
    try {
        const res = await fetch("/api/repos");
        const repos = await res.json();
        document.getElementById("count").innerText = `${repos.length} Repos Planted`;

        repos.forEach((repo, i) => {
            const tree = new THREE.Group();
            const x = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            tree.position.set(x, 0, z);

            const h = 20 + Math.sqrt(repo.size) / 2;
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(2, 4, h, 8),
                new THREE.MeshStandardMaterial({ color: 0x2b1d0e })
            );
            trunk.position.y = h / 2;
            tree.add(trunk);

            const leafColor = repo.isGolden ? 0xffd700 : 0x0b3d1d;
            const leaves = new THREE.Mesh(
                new THREE.ConeGeometry(h / 2, h * 2, 8),
                new THREE.MeshStandardMaterial({ 
                    color: leafColor, 
                    emissive: leafColor, 
                    emissiveIntensity: repo.isGolden ? 1.0 : 0.1 
                })
            );
            leaves.position.y = h + h;
            tree.add(leaves);

            tree.userData = repo;
            scene.add(tree);
        });
    } catch (e) { console.error("Forest Init Error", e); }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

initForest();
animate();

// CLICK INTERACTION
window.addEventListener("click", (e) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const data = intersects[0].object.parent.userData;
        if (data && data.url) window.open(data.url, "_blank");
    }
});