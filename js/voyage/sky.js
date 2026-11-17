// Ciel : fin d'après-midi sur le golfe de Tunis au sol, puis crépuscule étoilé quand on s'envole.
// Au-dessus des nuages flotte le mot de la fin sur Carthage.
import * as THREE from 'three';
import { rng, canvasTexture, roundRect, text } from './utils.js';

export const MOODS = {
  sol: { top: '#5c2443', horizon: '#f6cf9f', bottom: '#eab98a', fog: '#efd3b0' },
  ciel: { top: '#140a2e', horizon: '#f2a46a', bottom: '#f6d2b8', fog: '#e9b6a6' },
};
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = '"Open Sans", system-ui, sans-serif';

/** Petite texture ronde et douce (étoiles, paillettes) */
let dot = null;
function dotTexture() {
  if (dot) return dot;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  dot = new THREE.CanvasTexture(c);
  return dot;
}

export function createSky() {
  const group = new THREE.Group();
  const c = (hex) => new THREE.Color(hex);
  const uniforms = {
    top1: { value: c(MOODS.sol.top) }, horizon1: { value: c(MOODS.sol.horizon) }, bottom1: { value: c(MOODS.sol.bottom) },
    top2: { value: c(MOODS.ciel.top) }, horizon2: { value: c(MOODS.ciel.horizon) }, bottom2: { value: c(MOODS.ciel.bottom) },
    mood: { value: 0 },
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 16),
    new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 top1, horizon1, bottom1, top2, horizon2, bottom2;
        uniform float mood;
        varying vec3 vDir;
        vec3 grad(vec3 top, vec3 horizon, vec3 bottom, float h) {
          return h > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.8, h), 0.75))
                         : mix(horizon, bottom, smoothstep(0.0, -0.3, h));
        }
        void main() {
          vec3 col = mix(grad(top1, horizon1, bottom1, vDir.y), grad(top2, horizon2, bottom2, vDir.y), mood);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    })
  );
  dome.renderOrder = -10;
  group.add(dome);

  // Soleil au-dessus de la mer, devant et à droite
  const sunDir = new THREE.Vector3(0.38, 0.09, -1).normalize();
  const sun = new THREE.Mesh(new THREE.CircleGeometry(22, 40), new THREE.MeshBasicMaterial({ color: '#fff3dc', fog: false, depthWrite: false }));
  const glow = new THREE.Mesh(new THREE.CircleGeometry(55, 40), new THREE.MeshBasicMaterial({ color: '#ffd9a8', transparent: true, opacity: 0.45, fog: false, depthWrite: false }));
  for (const [m, d] of [[glow, 395], [sun, 390]]) {
    m.position.copy(sunDir).multiplyScalar(d);
    m.lookAt(0, 0, 0);
    m.renderOrder = -9;
    group.add(m);
  }

  // Étoiles (visibles seulement là-haut)
  const r = rng(5);
  const N = 900;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = r() * Math.PI * 2, y = 0.12 + r() * 0.88, rr = Math.sqrt(1 - y * y);
    pos.set([Math.cos(a) * rr * 380, y * 380, Math.sin(a) * rr * 380], i * 3);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#fff4e0', map: dotTexture(), size: 2.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  stars.renderOrder = -8;
  group.add(stars);

  return {
    group,
    sunDir,
    update(camera, mood, t) {
      group.position.copy(camera.position);
      uniforms.mood.value = mood;
      stars.material.opacity = THREE.MathUtils.smoothstep(mood, 0.35, 1) * (0.8 + Math.sin(t * 1.7) * 0.2);
      stars.visible = mood > 0.3;
      sun.material.color.set('#fff3dc').lerp(new THREE.Color('#ffb070'), mood);
    },
  };
}

/** Nuages, paillettes dorées et panneau du mot de la fin, autour de la fin de la route */
export function createHeaven(path, sFin, fin) {
  const group = new THREE.Group();
  const r = rng(21);
  const puffs = [];
  const tooClose = (x, y, z, rad) => {
    const p = new THREE.Vector3(x, y, z);
    for (const s of path.samples) if (s.distanceTo(p) < rad + 7) return true; // la caméra passe au-dessus et derrière le vélo
    return false;
  };
  const cloud = (x, y, z, size) => {
    const n = 3 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const rad = size * (0.5 + r() * 0.6);
      const px = x + (i - n / 2) * size * 0.7, py = y + r() * size * 0.35, pz = z + (r() - 0.5) * size;
      if (!tooClose(px, py, pz, rad)) puffs.push({ x: px, y: py, z: pz, r: rad });
    }
  };
  const fin3 = path.pointAt(sFin);
  // Mer de nuages que l'on traverse en montant, puis qui s'étend sous le mot de la fin
  for (let i = 0; i < 90; i++) cloud(-90 + r() * 180, 22 + r() * 8, fin3.z + 90 - r() * 230, 4 + r() * 6);
  for (let i = 0; i < 26; i++) cloud((r() < 0.5 ? -1 : 1) * (14 + r() * 50), 42 + r() * 22, fin3.z + 40 - r() * 120, 2 + r() * 4);
  const mesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshLambertMaterial({ flatShading: true, emissive: '#f4c3b0', emissiveIntensity: 0.55 }),
    puffs.length
  );
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  const CLOUDS = ['#fff6ee', '#fbe0d0', '#f6cdbd', '#ffe9da', '#f3d6e6'];
  puffs.forEach((p, i) => {
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(r() * 3, r() * 3, r() * 3);
    dummy.scale.set(p.r, p.r * 0.7, p.r);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, col.set(CLOUDS[Math.floor(r() * CLOUDS.length)]));
  });
  group.add(mesh);

  // Paillettes dorées
  const N = 420;
  const sp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) sp.set([-40 + r() * 80, 30 + r() * 36, fin3.z + 60 - r() * 150], i * 3);
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const sparkles = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffd98a', map: dotTexture(), size: 0.4, transparent: true, opacity: 0.8, depthWrite: false }));
  group.add(sparkles);

  // Le mot de la fin, sur un grand panneau flottant
  const W = 10, H = 5.6;
  const tex = canvasTexture(2000, 1120, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 70);
    ctx.fillStyle = 'rgba(97, 19, 53, 0.92)';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#CA823C';
    roundRect(ctx, 30, 30, w - 60, h - 60, 50);
    ctx.stroke();
    text(ctx, 'LE MOT DE LA FIN', w / 2, 150, { font: `700 44px ${SANS}`, color: '#CA823C', spacing: 14 });
    text(ctx, 'قرطاج', w / 2, 330, { font: `700 170px Amiri, serif`, color: '#F6ECD1' });
    text(ctx, fin.titre, w / 2, 450, { font: `italic 600 76px ${SERIF}`, color: '#f3c08a', maxWidth: w - 200 });
    // Texte sur plusieurs lignes
    ctx.font = `500 60px ${SERIF}`;
    const words = fin.texte.split(' ');
    const lines = [];
    let line = '';
    for (const wd of words) {
      const test = line ? line + ' ' + wd : wd;
      if (ctx.measureText(test).width > w - 300 && line) { lines.push(line); line = wd; } else line = test;
    }
    if (line) lines.push(line);
    lines.slice(0, 5).forEach((l, i) => text(ctx, l, w / 2, 580 + i * 82, { font: `500 60px ${SERIF}`, color: '#F6ECD1' }));
    text(ctx, fin.merci.toUpperCase(), w / 2, h - 110, { font: `700 40px ${SANS}`, color: '#CA823C', spacing: 6, maxWidth: w - 200 });
  });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, fog: false }));
  const ahead = path.tangentAt(sFin);
  board.position.copy(fin3).addScaledVector(ahead, 25); // au-delà de la dernière position de la caméra
  board.position.y += 3.2;
  board.lookAt(path.pointAt(sFin - 10).add(new THREE.Vector3(0, 3, 0)));
  group.add(board);
  const baseY = board.position.y;

  return {
    group,
    update(t, camera) {
      // Apparition en fondu quand on approche de la fin (évite de les voir surgir)
      const near = camera.position.z < fin3.z + 200;
      group.visible = near;
      sparkles.material.opacity = 0.5 + Math.sin(t * 2.2) * 0.3;
      sparkles.position.y = Math.sin(t * 0.4) * 0.6;
      board.position.y = baseY + Math.sin(t * 0.9) * 0.2;
      // Le panneau tient toujours dans la largeur de l'écran (téléphone en portrait)
      if (near) {
        const d = camera.position.distanceTo(board.position);
        const visible = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
        board.scale.setScalar(Math.min(1, (visible * 0.94) / W));
      }
    },
  };
}
