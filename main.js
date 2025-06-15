import * as THREE from 'https://unpkg.com/three@0.156.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.156.0/examples/jsm/controls/OrbitControls.js';

// --- 基本場景設定 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(200, 200, 200); // 初始 2.5D 視角

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// --- 建立台灣形狀 ---
const taiwanShape = new THREE.Shape();
const coords = [
  [121.8, 25.3],
  [122.0, 24.5],
  [121.9, 23.5],
  [121.3, 22.6],
  [120.8, 21.9],
  [120.2, 22.2],
  [120.3, 23.2],
  [120.5, 24.1],
  [121.1, 24.9],
];
const scale = 50;
const offsetX = -121.3 * scale;
const offsetY = -23.5 * scale;
coords.forEach((pt, idx) => {
  const x = pt[0] * scale + offsetX;
  const y = pt[1] * scale + offsetY;
  if (idx === 0) taiwanShape.moveTo(x, y);
  else taiwanShape.lineTo(x, y);
});
const extrudeSettings = { depth: 2, bevelEnabled: false };
const taiwanGeometry = new THREE.ExtrudeGeometry(taiwanShape, extrudeSettings);
const taiwanMaterial = new THREE.MeshLambertMaterial({ color: 0x96c8a2 });
const taiwanMesh = new THREE.Mesh(taiwanGeometry, taiwanMaterial);
taiwanMesh.rotation.x = -Math.PI / 2; // 使其水平放置
scene.add(taiwanMesh);

// --- 主要光源 ---
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(100, 200, 100);
scene.add(light);
scene.add(new THREE.AmbientLight(0x666666));

// --- 錐形標記點設定 ---
const points = [
  { name: 'Taipei', position: [121.5, 25.05] },
  { name: 'Taichung', position: [120.65, 24.15] },
  { name: 'Tainan', position: [120.2, 23.0] },
];
const markers = [];
points.forEach((pt) => {
  const [lon, lat] = pt.position;
  const x = lon * scale + offsetX;
  const z = lat * scale + offsetY;
  const coneGeometry = new THREE.ConeGeometry(1, 5, 16);
  const coneMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.set(x, 1, z);
  cone.userData = { name: pt.name };
  scene.add(cone);
  markers.push(cone);
});

// --- 射線投射與相機動畫 ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);
  if (intersects.length > 0) {
    const target = intersects[0].object;
    zoomToTarget(target);
  }
}
window.addEventListener('click', onMouseClick, false);

function zoomToTarget(target) {
  const duration = 1000; // ms
  const startTime = performance.now();
  const startPos = camera.position.clone();
  const targetPos = new THREE.Vector3(
    target.position.x,
    target.position.y + 50,
    target.position.z
  );

  function animate() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    camera.position.lerpVectors(startPos, targetPos, t);
    camera.lookAt(target.position);
    if (t < 1) requestAnimationFrame(animate);
  }
  animate();
}

// --- 視窗大小改變處理 ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- 渲染迴圈 ---
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
render();
