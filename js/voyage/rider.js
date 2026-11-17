// Le cycliste en 3D low-poly : l'avatar choisi dans l'application (homme ou femme).
// Il pédale quand on fait défiler la page, les roues tournent, et il salue à l'arrêt.
import * as THREE from 'three';
import { flatMat } from './utils.js';

const UP = new THREE.Vector3(0, 1, 0);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const dirV = new THREE.Vector3();
const kd = new THREE.Vector3();
const toe = new THREE.Vector3();

/** Place un cylindre (hauteur 1, axe y) entre deux points */
function limb(mesh, a, b, r) {
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  dirV.subVectors(b, a);
  const len = dirV.length() || 1e-3;
  mesh.quaternion.setFromUnitVectors(UP, dirV.divideScalar(len));
  mesh.scale.set(r, len, r);
}

/** Genou : deux segments de longueur L entre la hanche et le pied, plié vers l'avant */
function knee(hip, foot, L, out) {
  const d = kd.subVectors(foot, hip);
  const dist = Math.min(d.length(), 2 * L - 0.001);
  d.normalize();
  const a = dist / 2;
  const h = Math.sqrt(Math.max(0, L * L - a * a));
  return out.copy(hip).addScaledVector(d, a).add(V(0, d.z * h, -d.y * h));
}

export function createRider(avatar = 'homme') {
  const femme = avatar === 'femme';
  const root = new THREE.Group();
  const body = new THREE.Group(); // tout sauf l'ombre (se penche dans les virages)
  root.add(body);
  const mat = (c) => flatMat({ color: c });
  const M = {
    frame: mat('#611335'), black: mat('#231F20'), steel: mat('#b9b4ad'),
    shirt: mat(femme ? '#CA823C' : '#1E5A87'), skin: mat('#C98D63'), hair: mat(femme ? '#3a2418' : '#231F20'),
    shorts: mat('#2d2a33'), shoe: mat('#f6ecd1'),
  };
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 7);
  const mk = (m) => { const o = new THREE.Mesh(cyl, m); body.add(o); return o; };

  // ---------- Vélo (repère : +z vers l'avant, y vers le haut) ----------
  const R = 0.42;
  const rear = V(0, R, -0.66), front = V(0, R, 0.66), bb = V(0, 0.4, -0.06);
  const seat = V(0, 1.02, -0.3), head = V(0, 0.98, 0.46), bar = V(0, 1.16, 0.4);
  const wheels = [rear, front].map((c) => {
    const w = new THREE.Group();
    w.position.copy(c);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(R, 0.045, 5, 18).rotateY(Math.PI / 2), M.black);
    w.add(tire);
    for (let i = 0; i < 3; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.015, 2 * R - 0.05, 0.015), M.steel);
      sp.rotation.x = (i * Math.PI) / 3;
      w.add(sp);
    }
    body.add(w);
    return w;
  });
  for (const [a, b] of [[rear, bb], [rear, seat], [bb, seat], [seat, head], [bb, head], [head, front]]) limb(mk(M.frame), a, b, 0.035);
  limb(mk(M.steel), head, bar, 0.025);
  limb(mk(M.black), V(-0.28, bar.y, bar.z), V(0.28, bar.y, bar.z), 0.03); // guidon
  limb(mk(M.black), V(0, seat.y + 0.02, seat.z - 0.12), V(0, seat.y + 0.02, seat.z + 0.12), 0.06); // selle
  const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 10).rotateZ(Math.PI / 2), M.steel);
  chainring.position.copy(bb).add(V(0.05, 0, 0));
  body.add(chainring);

  // ---------- Cycliste ----------
  const hip = V(0, 1.12, -0.3);
  const shoulder = V(0, 1.6, 0.04);
  const torso = mk(M.shirt);
  limb(torso, hip, shoulder, 0.17);
  const headMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), M.skin);
  headMesh.position.set(0, 1.83, 0.12);
  body.add(headMesh);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M.hair);
  hair.position.set(0, 1.85, 0.1);
  hair.rotation.x = -0.35;
  body.add(hair);
  if (femme) {
    const tail = mk(M.hair);
    limb(tail, V(0, 1.86, -0.04), V(0, 1.6, -0.2), 0.06);
  }
  const arms = [-1, 1].map((sx) => ({ up: mk(M.shirt), low: mk(M.skin), sx }));
  const legs = [-1, 1].map((sx) => ({ thigh: mk(M.shorts), shin: mk(M.skin), crank: mk(M.steel), shoe: mk(M.shoe), sx }));

  // Ombre
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 18).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#5a3a2a', transparent: true, opacity: 0.18, depthWrite: false }));
  shadow.scale.set(0.45, 1, 1.4);
  shadow.position.y = 0.05;
  root.add(shadow);

  // Traînée dorée quand le vélo s'envole
  const TRAIL = 60;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  const dot = document.createElement('canvas');
  dot.width = dot.height = 32;
  const dctx = dot.getContext('2d');
  const grad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  dctx.fillStyle = grad;
  dctx.fillRect(0, 0, 32, 32);
  const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color: '#ffd98a', map: new THREE.CanvasTexture(dot), size: 0.16, transparent: true, opacity: 0, depthWrite: false }));
  trail.frustumCulled = false;
  let trailInit = false;
  const tail = new THREE.Vector3();

  const tan = new THREE.Vector3();
  const pedal = new THREE.Vector3(), hipS = new THREE.Vector3(), kn = new THREE.Vector3(), sh = new THREE.Vector3(), elbow = new THREE.Vector3(), hand = new THREE.Vector3();
  let crankA = 0, prevYaw = null, lean = 0, idle = 0, wave = 0;

  function pose(t) {
    // Jambes : le pied suit la pédale
    for (const l of legs) {
      const a = crankA + (l.sx > 0 ? Math.PI : 0);
      pedal.set(l.sx * 0.13, bb.y + Math.sin(a) * 0.17, bb.z + Math.cos(a) * 0.17);
      hipS.set(l.sx * 0.1, hip.y, hip.z);
      knee(hipS, pedal, 0.47, kn);
      limb(l.thigh, hipS, kn, 0.075);
      limb(l.shin, kn, pedal, 0.055);
      limb(l.crank, V(l.sx * 0.08, bb.y, bb.z), pedal, 0.02);
      limb(l.shoe, pedal, toe.copy(pedal).add(V(0, -0.02, 0.14)), 0.05);
    }
    // Bras : mains sur le guidon (la main droite fait coucou à l'arrêt)
    for (const a of arms) {
      sh.set(a.sx * 0.19, shoulder.y - 0.04, shoulder.z);
      const w = a.sx > 0 ? wave : 0;
      hand.set(a.sx * 0.26, bar.y, bar.z).lerp(V(0.45, 2.15 + Math.sin(t * 9) * 0.06, 0.25 + Math.sin(t * 9) * 0.12), w);
      elbow.addVectors(sh, hand).multiplyScalar(0.5).add(V(a.sx * 0.08, -0.06 + w * 0.1, 0));
      limb(a.up, sh, elbow, 0.06);
      limb(a.low, elbow, hand, 0.05);
    }
  }
  pose(0);

  return {
    root,
    extras: [trail],
    update(path, s, speed, t, dt) {
      path.pointAt(s, root.position);
      path.tangentAt(s, tan);
      const yaw = Math.atan2(tan.x, tan.z);
      root.rotation.y = yaw;
      // En vol : le vélo se cabre dans la montée, l'ombre disparaît, la traînée apparaît
      const air = THREE.MathUtils.smoothstep(root.position.y, 0.3, 3);
      body.rotation.x = -Math.asin(THREE.MathUtils.clamp(tan.y, -1, 1));
      shadow.visible = root.position.y < 0.5;
      tail.copy(root.position).addScaledVector(tan, -0.7);
      tail.y += 0.1; // sous les roues, pour ne pas masquer la vue
      if (!trailInit) { for (let i = 0; i < TRAIL; i++) trailPos.set([tail.x, tail.y, tail.z], i * 3); trailInit = true; }
      trailPos.copyWithin(3, 0, (TRAIL - 1) * 3);
      trailPos.set([tail.x + (Math.random() - 0.5) * 0.4, tail.y + (Math.random() - 0.5) * 0.4, tail.z + (Math.random() - 0.5) * 0.4], 0);
      trailGeo.attributes.position.needsUpdate = true;
      trail.material.opacity = 0.9 * air;
      trail.visible = air > 0.01;
      // Penché dans les virages
      const turn = prevYaw === null ? 0 : (yaw - prevYaw) / Math.max(dt, 1e-3);
      prevYaw = yaw;
      lean += (THREE.MathUtils.clamp(-turn * 0.08, -0.25, 0.25) - lean) * Math.min(1, dt * 5);
      body.rotation.z = lean;
      // Pédalage et roues
      crankA += Math.min(speed, 14) * dt * 1.6;
      for (const w of wheels) w.rotation.x += (Math.min(speed, 14) * dt) / R;
      idle = speed < 0.3 ? idle + dt : 0;
      wave += ((idle > 1.4 ? 1 : 0) - wave) * Math.min(1, dt * 5);
      body.position.y = Math.abs(Math.sin(crankA)) * 0.02 * Math.min(1, speed / 2);
      pose(t);
    },
  };
}
