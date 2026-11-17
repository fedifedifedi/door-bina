// Décor low-poly de Carthage : route, maisons blanches aux portes bleues, palmiers, lanternes,
// corniche et golfe de Tunis, et un monument pour chaque arrêt du parcours.
import * as THREE from 'three';
import { rng, mergeColored, flatMat, part, canvasTexture, roundRect, text } from './utils.js';

const C = {
  pourpre: '#611335', pierre: '#F6ECD1', ivoire: '#FAF5E8', ocre: '#CA823C', bleu: '#1E5A87', noir: '#231F20',
  blanc: '#fbf6ea', calcaire: '#e9d9b2', ruine: '#d2b685', sombre: '#3a2a24', vert: '#7fa35a', verre: '#5f9fc6',
};
const WALLS = ['#fbf6ea', '#f6efe0', '#f3e6cc', '#fff8ec', '#efe1c6'];
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = '"Open Sans", system-ui, sans-serif';
const SEA_X = 24; // au-delà : la mer

/* ================= Monuments (repère local : la façade regarde +z, vers la route) ================= */
const MONUMENTS = {
  agence() {
    const p = [
      part.box(7, 3.6, 5, C.blanc, 0, 0, 0),
      part.box(7.3, 0.3, 5.3, C.calcaire, 0, 3.6, 0),
      part.box(1.4, 2.3, 0.2, C.bleu, -1.6, 0, 2.55),
      part.box(2.4, 1.4, 0.2, C.verre, 1.5, 0.9, 2.55),
      part.box(7, 0.18, 1.8, C.ocre, 0, 2.6, 3.2, new THREE.Euler(0.28, 0, 0)), // auvent
      part.box(4.6, 0.9, 0.25, C.pourpre, 0, 3.75, 2.6),                          // enseigne
    ];
    // Vélos garés devant l'agence
    for (const x of [-2.4, -0.6, 1.2, 3]) {
      const ry = new THREE.Euler(0, Math.PI / 2, 0);
      for (const dz of [-0.55, 0.55]) p.push(part.geo(new THREE.TorusGeometry(0.36, 0.05, 4, 12), C.noir, x, 0.4, 4.3 + dz, ry));
      p.push(part.box(0.08, 0.08, 1.1, C.pourpre, x, 0.62, 4.3), part.box(0.08, 0.5, 0.08, C.pourpre, x, 0.45, 4.1));
    }
    return { geo: mergeColored(p), dist: 7.5 };
  },

  // 1. Dar El Hout : la « maison du poisson » au bord de l'eau
  1() {
    const p = [
      part.box(10, 4.6, 6, C.blanc, 0, 0, 0),
      part.box(10.2, 0.35, 6.2, C.bleu, 0, 4.6, 0),
      part.box(1.4, 2.3, 0.2, C.bleu, -2.5, 0, 3.05),
      part.box(3.2, 1.7, 0.2, C.verre, 2.2, 0.8, 3.05), // vitre de l'aquarium
      part.box(0.9, 0.9, 0.2, C.bleu, -4, 2.9, 3.05), part.box(0.9, 0.9, 0.2, C.bleu, -1, 2.9, 3.05),
      part.box(0.9, 0.9, 0.2, C.bleu, 2, 2.9, 3.05), part.box(0.9, 0.9, 0.2, C.bleu, 4, 2.9, 3.05),
      part.cyl(0.12, 0.12, 1.3, 5, C.sombre, 0, 4.95, 0),
      // le poisson sur le toit
      part.geo(new THREE.SphereGeometry(1, 10, 6), C.ocre, 0, 6.8, 0, null, new THREE.Vector3(1.7, 0.85, 0.45)),
      part.geo(new THREE.ConeGeometry(0.8, 1.3, 4), C.ocre, 2.1, 6.8, 0, new THREE.Euler(0, 0, -Math.PI / 2)),
      part.geo(new THREE.SphereGeometry(0.16, 6, 4), C.noir, -1.05, 7.05, 0.38),
    ];
    return { geo: mergeColored(p), dist: 8 };
  },

  // 2. Byrsa : quartier punique en ruine, colonnes brisées
  2() {
    const r = rng(42);
    const p = [part.box(13, 0.16, 10, '#cdb07c', 0, 0, 0)];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const x = -4.5 + i * 3, z = -3 + j * 3;
        if (r() < 0.8) p.push(part.box(2.8, 0.4 + r() * 1, 0.35, C.ruine, x, 0.16, z - 1.4));
        if (r() < 0.7) p.push(part.box(0.35, 0.4 + r() * 1.1, 2.8, C.ruine, x - 1.4, 0.16, z));
      }
    }
    for (const [x, z, h] of [[-5, 4, 3.2], [-3, 4.2, 2.1], [3.5, 4, 3.4], [5.4, 3.8, 1.4], [0.4, -4, 2.6]]) {
      p.push(part.cyl(0.3, 0.34, h, 8, C.calcaire, x, 0.16, z));
      if (h > 3) p.push(part.box(0.9, 0.3, 0.9, C.calcaire, x, 0.16 + h, z));
    }
    p.push(part.cyl(1.2, 1.2, 0.5, 10, C.ruine, 3, 0.16, -2.5)); // citerne
    return { geo: mergeColored(p), dist: 9.5 };
  },

  // 3. Cathédrale Saint-Louis : deux tours carrées, coupole centrale
  3() {
    const ry = new THREE.Euler(Math.PI / 2, 0, 0);
    const p = [
      part.box(6, 6.5, 12, C.pierre, 0, 0, -1),
      part.box(11, 5.5, 3.2, C.pierre, 0, 0, -2.5),
      part.cyl(2.3, 2.3, 2.2, 14, C.pierre, 0, 6.5, -2),
      part.dome(2.3, '#e2c79c', 0, 8.7, -2, 14),
      part.cyl(0.08, 0.08, 1.2, 4, C.ocre, 0, 10.9, -2),
      part.geo(new THREE.CylinderGeometry(1, 1, 0.2, 16), C.bleu, 0, 4.4, 5.05, ry), // rosace
      part.box(1.8, 2.8, 0.2, C.sombre, 0, 0, 5.05),
    ];
    for (const x of [-2.9, 2.9]) {
      p.push(part.box(2.2, 9.5, 2.2, C.pierre, x, 0, 4));
      p.push(part.box(2.5, 0.3, 2.5, C.ocre, x, 9.5, 4));
      p.push(part.cyl(0.8, 0.8, 0.9, 8, C.pierre, x, 9.8, 4));
      p.push(part.dome(0.8, '#e2c79c', x, 10.7, 4, 8));
      p.push(part.box(0.5, 1.3, 0.2, C.sombre, x, 6.5, 5.15));
    }
    return { geo: mergeColored(p), dist: 10 };
  },

  // 4. Musée national : portique à colonnes, échafaudage (réhabilitation)
  4() {
    const pediment = new THREE.CylinderGeometry(1.1, 1.1, 9.2, 3).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2);
    const p = [
      part.box(9, 4.2, 6, '#efe2c2', 0, 0, 0),
      part.box(9.4, 0.3, 2, C.calcaire, 0, 0, 3.6),
      part.box(9.4, 0.55, 2.1, C.calcaire, 0, 3.7, 3.6),
      part.geo(pediment, C.calcaire, 0, 4.25, 3.6, null, new THREE.Vector3(1, 0.7, 1)),
      part.box(1.4, 2.4, 0.2, C.sombre, 0, 0, 3.05),
    ];
    for (let x = -3.6; x <= 3.7; x += 2.4) p.push(part.cyl(0.24, 0.26, 3.4, 8, C.blanc, x, 0.3, 4.3));
    // échafaudage et barrière de chantier
    for (const x of [-4.8, -3.2]) for (const z of [-2.5, 1]) p.push(part.box(0.08, 5, 0.08, '#8a8580', x, 0, z));
    for (const y of [1.6, 3.2, 4.8]) p.push(part.box(1.8, 0.08, 3.6, '#8a8580', -4, y, -0.75));
    for (let x = -4; x <= 4; x += 2) p.push(part.box(1.6, 0.25, 0.08, x % 4 ? C.ocre : C.blanc, x, 0.7, 5.4));
    return { geo: mergeColored(p), dist: 8.5 };
  },

  // Pause thé : terrasse face à la mer, parasols
  pause() {
    const p = [part.box(7, 0.2, 5.5, '#e8d3a8', 0, 0, 0), part.box(3, 2.6, 2.2, C.blanc, -2, 0.2, -1.6),
      part.box(3.3, 0.15, 1.2, C.bleu, -2, 2.4, -0.2, new THREE.Euler(0.3, 0, 0))];
    for (const [x, z] of [[0.8, 1], [2.6, -1.2]]) {
      p.push(part.cyl(0.55, 0.55, 0.07, 10, C.blanc, x, 0.95, z), part.cyl(0.05, 0.05, 0.75, 5, C.sombre, x, 0.2, z));
      p.push(part.cyl(0.04, 0.04, 2.3, 4, C.sombre, x, 1, z), part.geo(new THREE.ConeGeometry(1.5, 0.6, 8), C.ocre, x, 3.5, z));
      p.push(part.box(0.45, 0.5, 0.45, C.pourpre, x - 0.8, 0.2, z), part.box(0.45, 0.5, 0.45, C.pourpre, x + 0.8, 0.2, z));
      p.push(part.geo(new THREE.SphereGeometry(0.14, 6, 4), '#c9ccd1', x, 1.12, z), part.cyl(0.05, 0.04, 0.14, 6, '#7fb48a', x + 0.25, 1.02, z + 0.1));
    }
    return { geo: mergeColored(p), dist: 6.5 };
  },

  // 5. Beït al-Hikma : palais blanc à arcades, volets bleus
  5() {
    const p = [
      part.box(14, 5.2, 7, C.blanc, 0, 0, 0),
      part.box(14.4, 0.3, 7.4, C.calcaire, 0, 5.2, 0),
      part.box(14, 0.25, 2, C.calcaire, 0, 0, 4.3),
      part.box(14, 0.7, 1.6, C.blanc, 0, 3, 4.3),
      part.box(1.6, 2.6, 0.2, C.bleu, 0, 0.25, 3.55),
    ];
    for (let x = -6.6; x <= 6.7; x += 2.2) p.push(part.cyl(0.18, 0.2, 2.75, 8, C.blanc, x, 0.25, 4.9));
    for (let x = -5.5; x <= 5.6; x += 2.2) p.push(part.box(1, 1.1, 0.2, C.bleu, x, 3.85, 3.55));
    p.push(part.dome(1.4, C.blanc, -4, 5.5, -1.5, 10), part.dome(1.4, C.blanc, 4, 5.5, -1.5, 10));
    return { geo: mergeColored(p), dist: 9 };
  },

  // 6. Théâtre romain : gradins en demi-cercle et scène
  6() {
    const p = [part.cyl(3.4, 3.4, 0.12, 20, '#e2cfa6', 0, 0, 0, null, Math.PI / 2, Math.PI)];
    for (let i = 5; i >= 0; i--) {
      const r = 3.6 + i * 1.05;
      p.push(part.cyl(r, r, 0.45 + i * 0.5, 24, i % 2 ? C.ruine : C.calcaire, 0, 0, 0, null, Math.PI / 2, Math.PI));
    }
    p.push(part.box(9, 1, 2.4, '#bfa175', 0, 0, 1.6));
    for (let x = -3.6; x <= 3.7; x += 1.8) p.push(part.cyl(0.2, 0.22, x === 0 ? 2 : 3.2, 8, C.blanc, x, 1, 2.5));
    return { geo: mergeColored(p), dist: 7.5 };
  },

  // 7. Mosquée Mâlik ibn Anas : grande cour, minaret carré
  7() {
    const p = [
      part.box(12, 3, 0.5, C.blanc, 0, 0, -5.75), part.box(0.5, 3, 12, C.blanc, -5.75, 0, 0), part.box(0.5, 3, 12, C.blanc, 5.75, 0, 0),
      part.box(4.5, 3, 0.5, C.blanc, -3.75, 0, 5.75), part.box(4.5, 3, 0.5, C.blanc, 3.75, 0, 5.75),
      part.box(3, 3.8, 0.7, C.calcaire, 0, 0, 5.75), part.box(1.8, 2.6, 0.2, C.sombre, 0, 0, 6.15),
      part.box(11, 4.2, 4.5, C.blanc, 0, 0, -3.3),
      part.dome(1.8, '#e9dcc0', 0, 4.2, -3.3, 12), part.dome(1, '#e9dcc0', -3.5, 4.2, -3.3, 8), part.dome(1, '#e9dcc0', 3.5, 4.2, -3.3, 8),
      // minaret
      part.box(2.4, 13, 2.4, C.blanc, 4.2, 0, 4.2), part.box(2.8, 0.4, 2.8, C.calcaire, 4.2, 11, 4.2),
      part.box(1.7, 2, 1.7, C.blanc, 4.2, 13, 4.2), part.dome(0.85, '#7fa35a', 4.2, 15, 4.2, 8),
      part.box(0.5, 1.2, 0.2, C.sombre, 4.2, 8.5, 5.45), part.box(0.5, 1.2, 0.2, C.sombre, 4.2, 5.5, 5.45),
    ];
    for (let x = -4.5; x <= 4.6; x += 1.5) p.push(part.box(0.7, 1.6, 0.2, C.sombre, x, 0.4, -0.95));
    return { geo: mergeColored(p), dist: 11 };
  },

  // 8. Cimetière américain : pelouse, rangées de croix blanches, mémorial
  8() {
    const p = [part.box(16, 0.1, 12, C.vert, 0, 0, 0), part.box(10, 3, 1, '#ece6d8', 0, 0, -5.4), part.cyl(0.07, 0.07, 9, 5, '#d8d8d8', 5.8, 0, -5)];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 9; col++) {
        const x = -6.4 + col * 1.6, z = -3 + row * 1.7;
        p.push(part.box(0.12, 0.9, 0.1, '#ffffff', x, 0.1, z), part.box(0.52, 0.12, 0.1, '#ffffff', x, 0.62, z));
      }
    }
    return { geo: mergeColored(p), dist: 10 };
  },
};

/* ================= Panneau 3D de chaque arrêt ================= */
const ETATS = { done: '✓ ÉTAPE VALIDÉE', next: 'PROCHAINE ÉTAPE', locked: 'À VENIR' };
function makeSign(stop, k, etat) {
  const W = 4.8, H = 2.6;
  const tex = canvasTexture(960, 520, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 34);
    ctx.fillStyle = C.pourpre;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = C.ocre;
    roundRect(ctx, 18, 18, w - 36, h - 36, 22);
    ctx.stroke();
    const pad = 64;
    const eyebrow = stop.type === 'lieu' ? `ÉTAPE ${stop.i + 1} · ${stop.lieu.epoque.toUpperCase()}` : stop.type === 'pause' ? 'PAUSE · 20 MIN' : stop.type === 'depart' ? 'DÉPART' : 'ARRIVÉE';
    text(ctx, eyebrow, pad, 110, { font: `700 30px ${SANS}`, color: C.ocre, align: 'left', spacing: 6, maxWidth: w - pad * 2 });
    text(ctx, stop.nom, pad, 215, { font: `600 84px ${SERIF}`, color: C.pierre, align: 'left', maxWidth: w - pad * 2 });
    const sous = stop.type === 'lieu' ? stop.lieu.theme : stop.type === 'pause' ? 'Thé à la menthe face à la mer' : 'Vélos · Door Bina';
    text(ctx, sous, pad, 290, { font: `italic 500 44px ${SERIF}`, color: C.pierre, align: 'left', maxWidth: w - pad * 2 });
    ctx.fillStyle = 'rgba(246,236,209,.25)';
    ctx.fillRect(pad, 340, w - pad * 2, 2);
    if (etat) text(ctx, ETATS[etat], pad, 420, { font: `700 34px ${SANS}`, color: etat === 'locked' ? 'rgba(246,236,209,.6)' : C.ocre, align: 'left', spacing: 4 });
    text(ctx, 'دوربينا', w - pad, 430, { font: `700 48px Amiri, serif`, color: 'rgba(246,236,209,.55)', align: 'right' });
  });
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  board.position.y = 2.9;
  g.add(board);
  const postMat = flatMat({ color: '#2b1520' });
  for (const x of [-W * 0.38, W * 0.38]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.7, 6), postMat);
    post.position.set(x, 0.85, -0.05);
    g.add(post);
  }
  return g;
}

/* ================= Le monde ================= */
export function createWorld(path, stops, etats, { quality = 1 } = {}) {
  const group = new THREE.Group();
  const rand = rng(11);
  const updaters = [];
  const end = path.length;
  const base = new THREE.Vector3(), tan = new THREE.Vector3(), sideV = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  // Zones réservées aux monuments (pas de maisons de ce côté-là)
  const exclusions = stops.map((st, k) => ({ from: path.stopS[k] - 13, to: path.stopS[k] + 15, side: st.side }));
  const isExcluded = (s, side) => exclusions.some((e) => s > e.from && s < e.to && e.side === side);

  // ---------- Sol, route et mer ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(190, 520).rotateX(-Math.PI / 2), flatMat({ color: '#ead8ae' }));
  ground.position.set(SEA_X - 95, 0, -200);
  group.add(ground);
  {
    const pos = [];
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c2 = new THREE.Vector3(), d = new THREE.Vector3();
    const edge = (s, w, out) => { path.pointAt(s, base); path.sideAt(s, sideV); return out.copy(base).addScaledVector(sideV, w); };
    const strip = (w0, w1, y, arr, step = 1, dash = 0) => {
      for (let s = 0; s < end - 0.5; s += step) {
        const s2 = Math.min(end, s + (dash || step));
        edge(s, w0, a); edge(s, w1, b); edge(s2, w0, c2); edge(s2, w1, d);
        arr.push(a.x, y, a.z, c2.x, y, c2.z, b.x, y, b.z, b.x, y, b.z, c2.x, y, c2.z, d.x, y, d.z);
      }
    };
    strip(-2.1, 2.1, 0.03, pos);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    group.add(new THREE.Mesh(g, flatMat({ color: '#c9a877', side: THREE.DoubleSide })));
    // ligne pointillée au centre
    const dashes = [];
    strip(-0.08, 0.08, 0.05, dashes, 3, 1.4);
    const gd = new THREE.BufferGeometry();
    gd.setAttribute('position', new THREE.Float32BufferAttribute(dashes, 3));
    gd.computeVertexNormals();
    group.add(new THREE.Mesh(gd, new THREE.MeshBasicMaterial({ color: C.pierre, side: THREE.DoubleSide })));
  }
  // Corniche (muret) et mer animée
  const corniche = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 520), flatMat({ color: C.calcaire }));
  corniche.position.set(SEA_X - 0.3, 0.35, -200);
  group.add(corniche);
  const seaGeo = new THREE.PlaneGeometry(420, 600, quality < 1 ? 30 : 48, quality < 1 ? 40 : 64).rotateX(-Math.PI / 2);
  const seaBase = seaGeo.attributes.position.array.slice();
  const sea = new THREE.Mesh(seaGeo, flatMat({ color: '#3f86b5' }));
  sea.position.set(SEA_X + 205, -0.6, -200);
  group.add(sea);
  updaters.push((t) => {
    const arr = seaGeo.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] = Math.sin(seaBase[i] * 0.09 + t * 0.9) * 0.25 + Math.cos(seaBase[i + 2] * 0.07 + t * 0.7) * 0.25;
    }
    seaGeo.attributes.position.needsUpdate = true;
    seaGeo.computeVertexNormals();
  });
  // Collines au loin (Byrsa, Sidi Bou Saïd)
  {
    const p = [];
    for (let i = 0; i < 9; i++) {
      const r = 20 + rand() * 25;
      p.push(part.geo(new THREE.ConeGeometry(r, 8 + rand() * 10, 7), i % 2 ? '#d9b98a' : '#cfae80', -70 - rand() * 50, 0, 20 - i * 60, null, new THREE.Vector3(1, 1, 1)));
    }
    group.add(new THREE.Mesh(mergeColored(p), flatMat({ vertexColors: true })));
  }

  // ---------- Maisons blanches (instanciées) ----------
  const houses = [];
  for (const row of quality < 1 ? [7] : [7, 14.5]) {
    for (let s = 6; s < end - 4; s += 4.4 + rand() * 1.6) {
      for (const side of [-1, 1]) {
        if (isExcluded(s, side) && row < 10) continue;
        if (isExcluded(s, side) && row > 10 && rand() < 0.5) continue;
        const w = 3.4 + rand() * 2, d = 4 + rand() * 2;
        const h = row > 10 ? 4.5 + rand() * 4 : 3 + rand() * 3;
        path.pointAt(s, base); path.tangentAt(s, tan); path.sideAt(s, sideV);
        const center = base.clone().addScaledVector(sideV, side * (row + d / 2 + rand() * 0.8));
        if (center.x + d / 2 > SEA_X - 1.5) continue;
        if (path.groundDistance(center.x, center.z) < d / 2 + 3.4) continue;
        houses.push({ center, w, d, h, yaw: Math.atan2(tan.x, tan.z), side, dome: rand() < 0.2, front: row < 10 });
      }
    }
  }
  for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
    houses.push({ center: new THREE.Vector3(side * (8 + rand() * 3), 0, 30 + i * 5), w: 4, d: 5, h: 3 + rand() * 3, yaw: 0, side, dome: false, front: false });
  }
  const box = new THREE.BoxGeometry(1, 1, 1);
  const walls = new THREE.InstancedMesh(box, flatMat(), houses.length);
  const domes = houses.filter((h) => h.dome);
  const domeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), flatMat({ color: '#fffaf0' }), Math.max(1, domes.length));
  const fronts = houses.filter((h) => h.front);
  const doors = new THREE.InstancedMesh(box, flatMat({ color: C.bleu }), fronts.length);
  const wins = new THREE.InstancedMesh(box, flatMat({ color: '#2c6e9e' }), fronts.length * 2);
  const col = new THREE.Color();
  houses.forEach((h, i) => {
    dummy.position.set(h.center.x, h.h / 2, h.center.z);
    dummy.rotation.set(0, h.yaw, 0);
    dummy.scale.set(h.d, h.h, h.w);
    dummy.updateMatrix();
    walls.setMatrixAt(i, dummy.matrix);
    walls.setColorAt(i, col.set(WALLS[Math.floor(rand() * WALLS.length)]));
  });
  domes.forEach((h, i) => {
    const r = Math.min(h.w, h.d) * 0.34;
    dummy.position.set(h.center.x, h.h, h.center.z);
    dummy.rotation.set(0, h.yaw, 0);
    dummy.scale.set(r, r * 0.9, r);
    dummy.updateMatrix();
    domeMesh.setMatrixAt(i, dummy.matrix);
  });
  const local = new THREE.Vector3();
  fronts.forEach((h, i) => {
    const place = (mesh, idx, along, y, sx, sy) => {
      // axe X local = côté gauche de la route : la façade regarde la rue
      local.set(h.side * (h.d / 2 + 0.05), 0, along).applyAxisAngle(THREE.Object3D.DEFAULT_UP, h.yaw);
      dummy.position.set(h.center.x + local.x, y, h.center.z + local.z);
      dummy.rotation.set(0, h.yaw, 0);
      dummy.scale.set(0.16, sy, sx);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    };
    place(doors, i, (rand() - 0.5) * (h.w - 1.6), 1.05, 1.1, 2.1);
    const win = h.h > 4 ? h.h - 1.2 : -5;
    place(wins, i * 2, -h.w * 0.27, win, 0.7, 0.9);
    place(wins, i * 2 + 1, h.w * 0.27, win, 0.7, 0.9);
  });
  group.add(walls, domeMesh, doors, wins);

  // ---------- Palmiers ----------
  const palmGeo = (() => {
    const p = [];
    let y = 0, x = 0;
    for (let i = 0; i < 5; i++) {
      p.push({ geo: new THREE.CylinderGeometry(0.17 - i * 0.015, 0.22 - i * 0.015, 1.25, 6), color: i % 2 ? '#7d5236' : '#936242', position: new THREE.Vector3(x, y + 0.62, 0), rotation: new THREE.Euler(0, 0, -0.06 * i) });
      y += 1.2; x += 0.08 * i;
    }
    for (let i = 0; i < 7; i++) {
      const leaf = new THREE.ConeGeometry(0.42, 3, 4).rotateX(Math.PI / 2).translate(0, 0, 1.5);
      leaf.scale(1, 0.25, 1);
      p.push({ geo: leaf, color: i % 2 ? '#5f8f45' : '#79a956', position: new THREE.Vector3(x, y, 0), rotation: new THREE.Euler(0.45, (i / 7) * Math.PI * 2, 0, 'YXZ') });
    }
    return mergeColored(p);
  })();
  const palms = [];
  for (let s = 10; s < end - 4; s += 8 + rand() * 6) {
    const side = rand() < 0.5 ? -1 : 1;
    if (isExcluded(s, side)) continue;
    path.pointAt(s, base); path.sideAt(s, sideV);
    const p = base.clone().addScaledVector(sideV, side * (3.5 + rand() * 1.2));
    if (path.groundDistance(p.x, p.z) > 2.8) palms.push(p);
  }
  for (let z = 10; z > -440; z -= 9 + rand() * 8) palms.push(new THREE.Vector3(SEA_X - 2 - rand() * 1.5, 0, z)); // palmiers de la corniche
  const palmMesh = new THREE.InstancedMesh(palmGeo, flatMat({ vertexColors: true }), palms.length);
  palms.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.rotation.set(0, rand() * Math.PI * 2, 0);
    dummy.scale.setScalar(0.85 + rand() * 0.5);
    dummy.updateMatrix();
    palmMesh.setMatrixAt(i, dummy.matrix);
  });
  group.add(palmMesh);

  // ---------- Lanternes ----------
  const lamps = [];
  for (let s = 36, k = 0; s < end - 4; s += 12, k++) {
    const side = k % 2 ? 1 : -1;
    if (isExcluded(s, side)) continue;
    path.pointAt(s, base); path.sideAt(s, sideV);
    lamps.push(base.clone().addScaledVector(sideV, side * 2.6));
  }
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06, 0.08, 2.8, 5), flatMat({ color: '#2b1520' }), lamps.length);
  const bulbs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.24, 0), new THREE.MeshBasicMaterial({ color: '#ffd98a' }), lamps.length);
  lamps.forEach((p, i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.position.set(p.x, 1.4, p.z);
    dummy.updateMatrix();
    posts.setMatrixAt(i, dummy.matrix);
    dummy.position.set(p.x, 2.95, p.z);
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
  });
  group.add(posts, bulbs);

  // ---------- Monuments et panneaux ----------
  const monMat = flatMat({ vertexColors: true, side: THREE.DoubleSide });
  stops.forEach((st, k) => {
    const key = st.type === 'lieu' ? st.lieu.id : st.type === 'pause' ? 'pause' : 'agence';
    const build = MONUMENTS[key];
    const sStop = path.stopS[k];
    if (build) {
      const { geo, dist } = build();
      const m = new THREE.Mesh(geo, monMat);
      const s = sStop + 4;
      path.pointAt(s, base); path.sideAt(s, sideV);
      m.position.copy(base).addScaledVector(sideV, st.side * dist);
      m.lookAt(base.x, 0, base.z);
      group.add(m);
    }
    const sign = makeSign(st, k, etats[k]);
    const s = sStop - 3;
    path.pointAt(s, base); path.sideAt(s, sideV);
    sign.position.copy(base).addScaledVector(sideV, st.side * 3.3);
    const back = path.pointAt(Math.max(0, s - 14));
    sign.lookAt(back.x, 0, back.z);
    group.add(sign);
  });

  return {
    group,
    update(t) { for (const u of updaters) u(t); },
  };
}

/* ================= Balise « Vous êtes ici » ================= */
export function createBeacon() {
  const group = new THREE.Group();
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 16, 24, 1, true).translate(0, 8, 0),
    new THREE.MeshBasicMaterial({ color: C.ocre, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, fog: false })
  );
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.55, 40).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: C.pourpre, transparent: true, opacity: 0.9, depthWrite: false })
  );
  ring.position.y = 0.08;
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  label.scale.set(4.2, 1.31, 1);
  label.position.y = 4.6;
  label.renderOrder = 5;
  group.add(column, ring, label);

  return {
    group,
    setLabel(sous) {
      ctx.clearRect(0, 0, 640, 200);
      roundRect(ctx, 10, 10, 620, 150, 75);
      ctx.fillStyle = C.pourpre;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(300, 158); ctx.lineTo(340, 158); ctx.lineTo(320, 195); ctx.closePath();
      ctx.fill();
      text(ctx, 'VOUS ÊTES ICI', 320, 78, { font: `700 46px ${SANS}`, color: C.pierre, spacing: 6 });
      text(ctx, sous, 320, 130, { font: `italic 600 38px ${SERIF}`, color: '#f3c08a', maxWidth: 560 });
      tex.needsUpdate = true;
    },
    update(t) {
      const k = (t * 0.6) % 1;
      ring.scale.setScalar(1 + k * 1.6);
      ring.material.opacity = 0.9 * (1 - k);
      column.material.opacity = 0.22 + Math.sin(t * 2.4) * 0.06;
      label.position.y = 4.6 + Math.sin(t * 1.6) * 0.15;
    },
  };
}
