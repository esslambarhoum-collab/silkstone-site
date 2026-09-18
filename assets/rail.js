/* Silkstone · the rail. A three.js showroom rail with garments on hangers.
   Falls back to photographs on phones or without WebGL. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const host = document.getElementById('rail3d');
if (host) init(host);

function init(host) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slots = JSON.parse(host.dataset.slots || '[]');
  const canvas = host.querySelector('canvas');
  const labelsBox = host.querySelector('.rail-labels');
  const hint = host.querySelector('.rail-hint');
  let gl = null;
  try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); } catch (e) {}
  if (!gl || innerWidth < 820) { host.classList.add('fallback'); return; }

  const BONE = 0xF3F1EC;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(BONE, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BONE);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0, 1.32, 3.4);
  camera.lookAt(0, 1.22, 0);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(1.6, 5.2, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -1;
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 12; key.shadow.bias = -0.0006; key.shadow.radius = 4;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d5cc, 0.45));

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.11 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), new THREE.MeshStandardMaterial({ color: 0xF6F4EF, roughness: 1, metalness: 0 }));
  wall.position.set(0, 6, -1.6); wall.receiveShadow = true; scene.add(wall);

  const steel = new THREE.MeshStandardMaterial({ color: 0xB4B2AC, metalness: 0.92, roughness: 0.34 });
  const matte = new THREE.MeshStandardMaterial({ color: 0x151513, metalness: 0.35, roughness: 0.58 });

  const SPACING = 0.62, RAIL_Y = 1.74, n = slots.length;
  const railLen = (n - 1) * SPACING + 1.4;
  const rack = new THREE.Group(); scene.add(rack);
  const railMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, railLen, 32), steel);
  railMesh.rotation.z = Math.PI / 2; railMesh.position.y = RAIL_Y; railMesh.castShadow = true; rack.add(railMesh);
  [-1, 1].forEach(s => {
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, RAIL_Y, 24), steel);
    up.position.set(s * railLen / 2, RAIL_Y / 2, 0); up.castShadow = true; rack.add(up);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.56, 24), steel);
    foot.rotation.x = Math.PI / 2; foot.position.set(s * railLen / 2, 0.02, 0); foot.castShadow = true; rack.add(foot);
  });

  /* Hanger from the logo path: hook centred on the rail, shoulders 0.44 m wide */
  const k = 0.44 / 104;
  const P = (x, y) => new THREE.Vector3((x - 52) * k, RAIL_Y - (y - 12) * k, 0);
  function hangerGeom(side) {
    const pts = [];
    if (side < 0) { for (let t = 0; t <= 1.0001; t += 0.05) { const a = Math.PI + t * Math.PI * 1.5; pts.push(P(52 + 8 * Math.cos(a), 12 + 8 * Math.sin(a))); } }
    else pts.push(P(52, 20));
    pts.push(P(52, 26));
    pts.push(P(52 + side * 44, 49)); pts.push(P(52 + side * 47, 51)); pts.push(P(52 + side * 47.5, 56));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
    return new THREE.TubeGeometry(curve, 120, 0.0075, 12, false);
  }
  const hangerL = hangerGeom(-1), hangerR = hangerGeom(1);

  const slotX = i => i * SPACING - (n - 1) * SPACING / 2;
  const garments = [], hangers = [], labels = [];
  const loader = new GLTFLoader();
  const draco = new DRACOLoader(); draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/'); loader.setDRACOLoader(draco);

  slots.forEach((slot, i) => {
    const g = new THREE.Group(); g.position.x = slotX(i); g.userData.index = i; rack.add(g);
    const hl = new THREE.Mesh(hangerL, matte), hr = new THREE.Mesh(hangerR, matte);
    hl.castShadow = hr.castShadow = true; g.add(hl, hr); hangers.push(g);
    const lab = document.createElement('div'); lab.className = 'rail-label'; lab.innerHTML = '<b>' + slot.label + '</b>' + (slot.model ? '' : '<span>To follow</span>'); labelsBox.appendChild(lab); labels.push(lab);
    if (slot.model) {
      loader.load(slot.model, gltf => {
        const obj = gltf.scene; const box = new THREE.Box3().setFromObject(obj); const size = new THREE.Vector3(); box.getSize(size);
        const s = (slot.height || 0.72) / size.y; obj.scale.setScalar(s);
        box.setFromObject(obj); const c = new THREE.Vector3(); box.getCenter(c);
        const top = RAIL_Y - (49 - 12) * k + (slot.lift || 0.06);
        obj.position.set(-c.x, top - box.max.y, -c.z + 0.01);
        obj.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = false; if (m.material) { m.material.envMapIntensity = 0.9; } } });
        const wrap = new THREE.Group(); wrap.add(obj); wrap.userData.index = i; wrap.userData.baseY = 0; g.add(wrap); garments[i] = wrap;
      }, undefined, () => { labels[i].innerHTML = '<b>' + slot.label + '</b><span>Model unavailable</span>'; });
    }
  });

  /* State and motion */
  const state = { x: reduce ? 0 : 5.5, target: 0, selected: -1, dragging: false, moved: 0, lastX: 0, vel: 0, running: true };
  const api = {
    select(keyOrIndex, fromRail) {
      const i = typeof keyOrIndex === 'number' ? keyOrIndex : slots.findIndex(s => s.key === keyOrIndex);
      if (i < 0) return;
      state.selected = i; state.target = -slotX(i);
      host.classList.add('has-selection'); if (hint) hint.hidden = true;
      labels.forEach((l, j) => l.classList.toggle('on', j === i));
      host.dispatchEvent(new CustomEvent('rail:select', { detail: { key: slots[i].key, index: i, fromRail: !!fromRail } }));
    },
    clear() { state.selected = -1; labels.forEach(l => l.classList.remove('on')); host.classList.remove('has-selection'); host.dispatchEvent(new CustomEvent('rail:clear')); }
  };
  window.silkRail = api;

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  function pick(ev) {
    const r = canvas.getBoundingClientRect();
    ptr.x = ((ev.clientX - r.left) / r.width) * 2 - 1; ptr.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObjects(hangers, true);
    if (!hits.length) return -1;
    let o = hits[0].object; while (o && o.userData.index === undefined) o = o.parent;
    return o ? o.userData.index : -1;
  }
  canvas.addEventListener('pointerdown', e => { state.dragging = true; state.moved = 0; state.lastX = e.clientX; state.vel = 0; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointermove', e => {
    if (state.dragging) { const dx = e.clientX - state.lastX; state.lastX = e.clientX; state.moved += Math.abs(dx); const f = 3.2 / canvas.clientWidth; state.target += dx * f; state.x += dx * f; state.vel = dx * f; clamp(); }
    else { canvas.style.cursor = pick(e) >= 0 ? 'pointer' : 'grab'; }
  });
  function clamp() { const lim = (n - 1) * SPACING / 2 + 0.2; state.target = Math.max(-lim, Math.min(lim, state.target)); }
  canvas.addEventListener('pointerup', e => {
    if (!state.dragging) return; state.dragging = false; canvas.style.cursor = 'grab';
    if (state.moved < 6) { const i = pick(e); if (i >= 0) api.select(i, true); else if (state.selected >= 0) api.clear(); }
    else { state.target += state.vel * 6; clamp(); snap(); }
  });
  canvas.addEventListener('pointercancel', () => { state.dragging = false; });
  function snap() { const i = Math.round(-state.target / SPACING + (n - 1) / 2); const j = Math.max(0, Math.min(n - 1, i)); state.target = -slotX(j); }
  canvas.style.cursor = 'grab';
  canvas.addEventListener('keydown', e => { if (e.key === 'ArrowRight') api.select(Math.min(n - 1, Math.max(0, state.selected + 1)), true); if (e.key === 'ArrowLeft') api.select(Math.max(0, state.selected - 1), true); if (e.key === 'Escape') api.clear(); });

  const vp = new THREE.Vector3();
  function placeLabels() {
    const r = canvas.getBoundingClientRect();
    labels.forEach((lab, i) => {
      vp.set(slotX(i) + rack.position.x, 0.56, 0).project(camera);
      const x = (vp.x + 1) / 2 * r.width, y = (1 - vp.y) / 2 * r.height;
      lab.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,0)';
      lab.style.opacity = (x < -40 || x > r.width + 40) ? 0 : 1;
    });
  }
  function resize() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();
  new IntersectionObserver(es => { state.running = es[0].isIntersecting; if (state.running) requestAnimationFrame(tick); }, { rootMargin: '100px' }).observe(host);

  let last = performance.now();
  function tick(now) {
    if (!state.running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!state.dragging) state.x += (state.target - state.x) * (1 - Math.exp(-dt * 4.2));
    rack.position.x = state.x;
    garments.forEach((w, i) => {
      if (!w) return;
      const sel = i === state.selected;
      const ty = sel ? 0.05 : 0; w.position.y += (ty - w.position.y) * (1 - Math.exp(-dt * 5));
      if (sel && !reduce) w.rotation.y += dt * 0.35; else { w.rotation.y += (0 - (w.rotation.y % (Math.PI * 2))) * (1 - Math.exp(-dt * 4)); }
    });
    placeLabels();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
