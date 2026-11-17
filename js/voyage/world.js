// Décor low-poly de Carthage : route, maisons colorées aux portes peintes, bougainvillées, palmiers,
// lanternes, corniche et golfe de Tunis. Chaque arrêt a son monument, sa place pavée à sa couleur
// et ses détails animés ; le monument se construit sous les yeux du visiteur quand il approche.
import * as THREE from 'three';
import { rng, mergeColored, flatMat, part, canvasTexture, roundRect, text } from './utils.js';

const C = {
  pourpre: '#611335', pierre: '#F6ECD1', ivoire: '#FAF5E8', ocre: '#CA823C', bleu: '#1E5A87', noir: '#231F20',
  blanc: '#fbf6ea', calcaire: '#e9d9b2', ruine: '#d2b685', sombre: '#3a2a24', vert: '#7fa35a', verre: '#5f9fc6',
  feuille: '#5f8f45', olive: '#7d8f4a', rose: '#c2387a',
};
// Murs : blancs, sable, rosés, ocre clair (médina tunisienne)
const WALLS = ['#fbf6ea', '#f6efe0', '#f3e2c4', '#f1d3b8', '#ead0a8', '#fff8ec', '#efd9c8', '#e6d3b3', '#f4dcc9'];
// Portes et volets peints : bleu de Sidi Bou Saïd, jaune, vert, pourpre
const DOORS = ['#1E5A87', '#2f7fb0', '#d9a441', '#3f7f5a', '#611335', '#2a6f9e'];
const SERIF = '"Cormorant Garamond", Georgia, serif';
const SANS = '"Open Sans", system-ui, sans-serif';
const SEA_X = 24; // au-delà : la mer

/* Couleurs propres à chaque lieu : sol de la place, motif, portes du quartier */
const THEMES = {
  agence: { sol: '#ecd6aa', motif: '#611335', porte: '#611335' },
  1: { sol: '#d3e6ec', motif: '#2f7fb0', porte: '#2f7fb0' },
  2: { sol: '#e6cc9e', motif: '#b5793a', porte: '#b5793a' },
  3: { sol: '#efe5cf', motif: '#c9a66b', porte: '#1E5A87' },
  4: { sol: '#ecd3b6', motif: '#b4532a', porte: '#b4532a' },
  pause: { sol: '#dcebd8', motif: '#3f8f6a', porte: '#3f8f6a' },
  5: { sol: '#f4eee2', motif: '#1E5A87', porte: '#1E5A87' },
  6: { sol: '#ecd5bb', motif: '#8e1b3a', porte: '#8e1b3a' },
  7: { sol: '#e8ecdd', motif: '#3f7f5a', porte: '#3f7f5a' },
  8: { sol: '#d4e4c4', motif: '#f4f1e8', porte: '#4f7a45' },
};
const cleDe = (st) => (st.type === 'lieu' ? st.lieu.id : st.type === 'pause' ? 'pause' : 'agence');

/* ---------- Pièces réutilisables ---------- */
/** Mur percé d'arcades (n arcs en plein cintre), centré, posé au sol, épaisseur selon z */
function arcade(n, aw, h, depth, pillar = 0.5) {
  const W = n * aw + (n + 1) * pillar;
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, 0).lineTo(W / 2, 0).lineTo(W / 2, h).lineTo(-W / 2, h).lineTo(-W / 2, 0);
  const r = aw / 2, top = Math.min(h - 0.35, h * 0.8);
  for (let i = 0; i < n; i++) {
    const cx = -W / 2 + pillar + r + i * (aw + pillar);
    const hole = new THREE.Path();
    hole.moveTo(cx - r, 0).lineTo(cx - r, top - r).absarc(cx, top - r, r, Math.PI, 0, true).lineTo(cx + r, 0).lineTo(cx - r, 0);
    shape.holes.push(hole);
  }
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 6 }).translate(0, 0, -depth / 2);
}
/** Fenêtre en arc (pleine) : petite plaque arrondie en haut */
function archWin(w, h) {
  const s = new THREE.Shape();
  const r = w / 2;
  s.moveTo(-r, 0).lineTo(-r, h - r).absarc(0, h - r, r, Math.PI, 0, true).lineTo(r, 0).lineTo(-r, 0);
  return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false, curveSegments: 6 });
}
const cypres = (x, z, h = 4) => [part.cyl(0.08, 0.1, 0.6, 5, '#6b4a30', x, 0, z), part.geo(new THREE.ConeGeometry(0.55, h, 6), '#3f6b3a', x, 0.6 + h / 2, z)];
const olivier = (x, z) => [part.cyl(0.12, 0.16, 1.2, 5, '#6b4a30', x, 0, z), part.geo(new THREE.IcosahedronGeometry(1, 0), C.olive, x, 1.9, z, null, new THREE.Vector3(1.1, 0.8, 1.1))];
const buisson = (x, y, z, r = 0.6, c = C.rose) => part.geo(new THREE.IcosahedronGeometry(r, 0), c, x, y, z);
const banc = (x, z, ry = 0) => [part.box(1.6, 0.12, 0.5, '#8a5a3c', x, 0.45, z, new THREE.Euler(0, ry, 0)), part.box(1.5, 0.45, 0.4, '#5a4a40', x, 0, z, new THREE.Euler(0, ry, 0))];

/** Drapeau tunisien dessiné : fond rouge, disque blanc, croissant et étoile rouges */
function textureTunisie() {
  return canvasTexture(600, 400, (ctx, w, h) => {
    const rouge = '#E70013';
    ctx.fillStyle = rouge;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = h / 4; // disque blanc : diamètre = moitié de la hauteur
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    // croissant : un disque rouge, entamé par un disque blanc décalé vers la droite
    ctx.fillStyle = rouge;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx + R * 0.19, cy, R * 0.6, 0, Math.PI * 2); ctx.fill();
    // étoile à cinq branches, dans l'ouverture du croissant
    const sx = cx + R * 0.23, sy = cy, ro = R * 0.45, ri = ro * 0.382;
    ctx.fillStyle = rouge;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? ri : ro;
      const a = Math.PI + (i * Math.PI) / 5; // une pointe tournée vers le croissant
      ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  });
}

/** Drapeau animé (pivote au mât) : une couleur unie, ou une image (map) */
function drapeau(color, w = 1.3, h = 0.8, map = null) {
  const g = new THREE.Group();
  const mat = flatMat({ color: '#d8d4cc' });
  const mat2 = map ? new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide }) : flatMat({ color, side: THREE.DoubleSide });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 5, 5).translate(0, 2.5, 0), mat);
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 6, 1).translate(w / 2, 0, 0), mat2);
  cloth.position.y = 4.5;
  g.add(mast, cloth);
  const base = cloth.geometry.attributes.position.array.slice();
  return {
    g,
    update(t, ph = 0) {
      const a = cloth.geometry.attributes.position.array;
      for (let i = 0; i < a.length; i += 3) a[i + 2] = Math.sin(base[i] * 3 - t * 4 + ph) * 0.12 * base[i];
      cloth.geometry.attributes.position.needsUpdate = true;
    },
  };
}

/* ================= Monuments (repère local : la façade regarde +z, vers la route) =================
   Chaque monument renvoie : geo (pièces fusionnées), dist (distance à la route), plaza [largeur, profondeur],
   et éventuellement extras (objets animés) + update(t). */
const MONUMENTS = {
  agence(th) {
    const p = [
      part.box(8, 3.8, 5.5, C.blanc, 0, 0, 0),
      part.box(8.3, 0.35, 5.8, C.calcaire, 0, 3.8, 0),
      part.geo(arcade(3, 1.6, 2.8, 0.3), C.blanc, 0, 0, 2.9),
      part.box(1.4, 2.2, 0.15, th.porte, -2.1, 0, 2.7), part.box(1.4, 2.2, 0.15, C.verre, 0, 0.1, 2.7), part.box(1.4, 2.2, 0.15, th.porte, 2.1, 0, 2.7),
      part.box(5.2, 0.9, 0.25, C.pourpre, 0, 4.25, 2.6),
      part.box(5.4, 0.12, 0.3, C.ocre, 0, 4.15, 2.62),
    ];
    // Store rayé au-dessus de l'entrée
    for (let i = 0; i < 8; i++) p.push(part.box(1, 0.1, 1.6, i % 2 ? C.pierre : C.ocre, -3.5 + i, 3.15, 3.7, new THREE.Euler(0.3, 0, 0)));
    // Vélos garés (pourpre Door Bina)
    for (const x of [-3, -1.8, -0.6, 0.6, 1.8, 3]) {
      const ry = new THREE.Euler(0, Math.PI / 2, 0);
      for (const dz of [-0.5, 0.5]) p.push(part.geo(new THREE.TorusGeometry(0.34, 0.05, 4, 12), C.noir, x, 0.38, 5 + dz, ry));
      p.push(part.box(0.08, 0.08, 1, C.pourpre, x, 0.6, 5), part.box(0.08, 0.5, 0.08, C.pourpre, x, 0.42, 4.8), part.box(0.5, 0.06, 0.06, C.noir, x, 0.98, 5.45));
    }
    p.push(part.cyl(0.35, 0.28, 0.6, 7, '#b4532a', -4.6, 0, 3.6), buisson(-4.6, 0.95, 3.6, 0.5, C.feuille));
    p.push(part.cyl(0.35, 0.28, 0.6, 7, '#b4532a', 4.6, 0, 3.6), buisson(4.6, 0.95, 3.6, 0.5, C.rose));
    const fl = drapeau('#E70013', 1.8, 1.2, textureTunisie()); // drapeau tunisien
    fl.g.position.set(-5, 0, 1);
    fl.g.scale.setScalar(1.2);
    return { geo: mergeColored(p), dist: 8.8, plaza: [14, 11], extras: [fl.g], update: (t) => fl.update(t) };
  },

  // 1. Dar El Hout : la « maison du poisson » au bord de l'eau, avec son bassin
  1(th) {
    const p = [
      part.box(11, 4.4, 6, C.blanc, 0, 0, -1),
      part.box(7, 2.6, 5, C.blanc, -2, 4.4, -1.5),
      part.box(11.2, 0.3, 6.2, th.motif, 0, 4.4, -1),
      part.box(7.2, 0.3, 5.2, th.motif, -2, 7, -1.5),
      part.box(1.6, 2.4, 0.2, th.motif, -3, 0, 2.05),
      part.box(3.6, 1.8, 0.2, C.verre, 2.4, 0.8, 2.05), // vitrine de l'aquarium
      part.box(3.9, 0.2, 0.3, th.motif, 2.4, 2.6, 2.1),
      part.cyl(0.12, 0.12, 1.4, 5, C.sombre, 3.2, 4.7, -1),
      // le poisson sur le toit
      part.geo(new THREE.SphereGeometry(1, 10, 6), C.ocre, 3.2, 6.8, -1, null, new THREE.Vector3(1.8, 0.9, 0.45)),
      part.geo(new THREE.ConeGeometry(0.8, 1.3, 4), C.ocre, 5.4, 6.8, -1, new THREE.Euler(0, 0, -Math.PI / 2)),
      part.geo(new THREE.SphereGeometry(0.16, 6, 4), C.noir, 2.1, 7.05, -0.62),
      // bassin
      part.cyl(2.3, 2.3, 0.5, 18, C.calcaire, -1.5, 0, 4.8),
      part.cyl(2, 2, 0.06, 18, '#3f8fc0', -1.5, 0.46, 4.8),
      // ancre
      part.box(0.2, 1.6, 0.2, C.sombre, 4.4, 0, 4.6), part.box(1.2, 0.2, 0.2, C.sombre, 4.4, 1.2, 4.6),
      part.geo(new THREE.TorusGeometry(0.55, 0.09, 4, 10, Math.PI), C.sombre, 4.4, 0.55, 4.6, new THREE.Euler(0, 0, Math.PI)),
    ];
    for (const x of [-4.6, -2.6, -0.6, 1.4]) p.push(part.geo(new THREE.CylinderGeometry(0.42, 0.42, 0.15, 12), th.motif, x - 0.1, 5.7, 1.05, new THREE.Euler(Math.PI / 2, 0, 0))); // hublots
    for (const x of [-4.2, -0.4]) p.push(part.geo(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 12), C.verre, x, 3, 2.05, new THREE.Euler(Math.PI / 2, 0, 0)));
    // poissons qui tournent dans le bassin
    const fish = new THREE.Group();
    fish.position.set(-1.5, 0.55, 4.8);
    const fm = flatMat({ color: '#f08a3c' });
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 4).rotateZ(-Math.PI / 2), fm);
      const a = (i / 4) * Math.PI * 2;
      f.position.set(Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2);
      f.rotation.y = -a;
      fish.add(f);
    }
    return { geo: mergeColored(p), dist: 10, plaza: [15, 13], extras: [fish], update: (t) => { fish.rotation.y = -t * 0.8; } };
  },

  // 2. Byrsa : la colline, le quartier punique en ruine, colonnes et oliviers
  2(th) {
    const r = rng(42);
    const p = [
      part.box(15, 1.2, 12, '#d8bd8c', 0, 0, -1),           // la colline (plateau)
      part.box(14, 0.15, 11, '#cdb07c', 0, 1.2, -1),
    ];
    for (let i = 0; i < 4; i++) p.push(part.box(4, 0.3, 0.7, C.calcaire, 0, i * 0.3, 5.3 - i * 0.6)); // escalier
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const x = -5 + i * 3.2, z = -4.5 + j * 3;
        if (r() < 0.85) p.push(part.box(3, 0.4 + r() * 1.2, 0.35, C.ruine, x, 1.35, z - 1.4));
        if (r() < 0.75) p.push(part.box(0.35, 0.4 + r() * 1.3, 3, C.ruine, x - 1.5, 1.35, z));
      }
    }
    for (const [x, z, h] of [[-5.5, 2.5, 3.4], [-3.6, 2.7, 2.2], [3.8, 2.5, 3.6], [5.6, 2.3, 1.5], [0.6, -5, 2.8], [2.2, -5, 3.4]]) {
      p.push(part.cyl(0.3, 0.34, h, 8, C.calcaire, x, 1.35, z));
      if (h > 3) p.push(part.box(0.9, 0.3, 0.9, C.calcaire, x, 1.35 + h, z));
    }
    p.push(part.box(4.2, 0.3, 0.9, C.calcaire, 3, 1.35 + 3.9, -5)); // architrave
    p.push(part.cyl(1.2, 1.2, 0.6, 10, C.ruine, 3, 1.35, -2.5)); // citerne
    for (const [x, z] of [[-1, -1], [1.6, 0.6], [-2.6, -3.2]]) p.push(part.geo(new THREE.SphereGeometry(0.3, 6, 4), '#b4532a', x, 1.6, z, null, new THREE.Vector3(1, 1.5, 1))); // amphores
    p.push(...olivier(-6.5, 3.5), ...olivier(6.5, 3.8), ...olivier(-6, -5.5));
    return { geo: mergeColored(p), dist: 10, plaza: [9, 5] };
  },

  // 3. Cathédrale Saint-Louis : façade à deux tours, rosace, coupole, jardin de cyprès
  3(th) {
    const ry = new THREE.Euler(Math.PI / 2, 0, 0);
    const p = [
      part.box(13, 0.8, 15, C.calcaire, 0, 0, -1.5),      // terrasse
      part.box(6.5, 0.4, 1.2, C.calcaire, 0, 0, 6.4),     // marches
      part.box(6, 6.5, 12, C.pierre, 0, 0.8, -2),
      part.box(11, 5.5, 3.2, C.pierre, 0, 0.8, -3.5),
      part.cyl(2.3, 2.3, 2.2, 14, C.pierre, 0, 7.3, -3),
      part.dome(2.3, '#e2c79c', 0, 9.5, -3, 14),
      part.cyl(0.08, 0.08, 1.2, 4, C.ocre, 0, 11.7, -3),
      part.box(0.7, 0.1, 0.1, C.ocre, 0, 12.5, -3),
      part.geo(new THREE.CylinderGeometry(1.05, 1.05, 0.2, 16), C.bleu, 0, 5.3, 4.05, ry),
      part.geo(new THREE.TorusGeometry(1.15, 0.12, 4, 16), th.motif, 0, 5.3, 4.1),
      part.geo(archWin(1.8, 3), C.sombre, 0, 0.8, 4),
      part.box(6.4, 0.3, 0.4, th.motif, 0, 7.2, 4),
    ];
    for (const x of [-2.9, 2.9]) {
      p.push(part.box(2.2, 10, 2.2, C.pierre, x, 0.8, 3));
      p.push(part.box(2.5, 0.3, 2.5, th.motif, x, 10.8, 3));
      p.push(part.cyl(0.8, 0.8, 0.9, 8, C.pierre, x, 11.1, 3));
      p.push(part.dome(0.8, '#e2c79c', x, 12, 3, 8));
      p.push(part.geo(archWin(0.6, 1.4), C.sombre, x, 7.6, 4.1), part.geo(archWin(0.6, 1.4), C.sombre, x, 4.4, 4.1));
    }
    for (const z of [-6, -3.6, -1.2]) for (const sx of [-1, 1]) p.push(part.geo(archWin(0.7, 1.8), C.sombre, sx * 3.06, 3.5, z, new THREE.Euler(0, sx * Math.PI / 2, 0)));
    p.push(...cypres(-5.6, 4.5), ...cypres(5.6, 4.5), ...cypres(-5.6, 1), ...cypres(5.6, 1));
    p.push(...banc(-4, 6.2), ...banc(4, 6.2));
    return { geo: mergeColored(p), dist: 11.5, plaza: [16, 8] };
  },

  // 4. Musée national : portique, mosaïque au sol, statues, échafaudage (réhabilitation)
  4(th) {
    const pediment = new THREE.CylinderGeometry(1.1, 1.1, 9.6, 3).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2);
    const p = [
      part.box(10, 4.4, 6, '#efe2c2', 0, 0, -1),
      part.box(10.4, 0.3, 6.4, C.calcaire, 0, 4.4, -1),
      part.box(9.8, 0.35, 2.2, C.calcaire, 0, 0, 3.1),
      part.box(9.8, 0.55, 2.3, C.calcaire, 0, 3.9, 3.1),
      part.geo(pediment, C.calcaire, 0, 4.45, 3.1, null, new THREE.Vector3(1, 0.7, 1)),
      part.box(1.4, 2.6, 0.2, C.sombre, 0, 0.35, 2.05),
      part.box(10, 0.15, 0.2, th.motif, 0, 4.25, 4.25),
    ];
    for (let x = -4; x <= 4.1; x += 2) p.push(part.cyl(0.24, 0.26, 3.55, 8, C.blanc, x, 0.35, 3.8));
    for (const x of [-3.5, 3.5]) p.push(part.geo(archWin(1, 1.8), '#7a5a40', x, 1.2, 2.05));
    // statues sur socles
    for (const x of [-6.2, 6.2]) {
      p.push(part.box(0.9, 1.1, 0.9, C.calcaire, x, 0, 4.5), part.cyl(0.22, 0.3, 1.3, 6, C.blanc, x, 1.1, 4.5), part.geo(new THREE.SphereGeometry(0.22, 6, 4), C.blanc, x, 2.6, 4.5));
    }
    // mosaïque (losanges colorés) devant le musée
    const cols = [th.motif, C.ocre, C.bleu, C.pierre];
    for (let i = -3; i <= 3; i++) for (let j = 0; j < 3; j++) p.push(part.box(0.7, 0.04, 0.7, cols[(i + j + 6) % 4], i * 1.1, 0.02, 5 + j * 0.9, new THREE.Euler(0, Math.PI / 4, 0)));
    // échafaudage et barrière de chantier
    for (const x of [-5.6, -4]) for (const z of [-3.5, 0]) p.push(part.box(0.08, 5.2, 0.08, '#8a8580', x, 0, z));
    for (const y of [1.7, 3.4, 5]) p.push(part.box(1.8, 0.08, 3.6, '#8a8580', -4.8, y, -1.75));
    for (const x of [-7.4, 7.4]) for (let z = -3; z <= 1.5; z += 1.5) p.push(part.box(0.08, 0.25, 1.4, z % 3 ? C.ocre : C.blanc, x, 0.7, z));
    return { geo: mergeColored(p), dist: 10.5, plaza: [15, 12] };
  },

  // Pause thé : terrasse face à la mer, tapis, coussins, lanternes et parasols
  pause(th) {
    const p = [
      part.box(9, 0.25, 7, '#e8d3a8', 0, 0, 0),
      part.box(3.4, 2.8, 2.4, C.blanc, -2.6, 0.25, -2.2),
      part.box(3.7, 0.15, 1.3, th.motif, -2.6, 2.6, -0.7, new THREE.Euler(0.3, 0, 0)),
      part.box(1.4, 0.3, 0.6, '#c9ccd1', -2.6, 1.1, -0.95),
    ];
    // tapis rayé et coussins
    for (let i = 0; i < 6; i++) p.push(part.box(0.5, 0.04, 2.4, [C.pourpre, C.ocre, th.motif][i % 3], 1.6 + i * 0.5, 0.26, -1.6));
    for (const [x, z, c] of [[1.8, -2.6, C.pourpre], [3.6, -2.6, C.ocre], [4.3, -1.2, th.motif]]) p.push(part.box(0.7, 0.3, 0.7, c, x, 0.3, z));
    p.push(part.cyl(0.4, 0.4, 0.3, 8, '#8a5a3c', 3, 0.3, -1.6), part.geo(new THREE.SphereGeometry(0.15, 6, 4), '#c9ccd1', 3, 0.72, -1.6));
    for (const [x, z] of [[-0.6, 1.6], [2.4, 1.8]]) {
      p.push(part.cyl(0.55, 0.55, 0.07, 10, C.blanc, x, 0.98, z), part.cyl(0.05, 0.05, 0.75, 5, C.sombre, x, 0.25, z));
      p.push(part.cyl(0.04, 0.04, 2.3, 4, C.sombre, x, 1, z));
      for (let k = 0; k < 8; k++) p.push(part.geo(new THREE.ConeGeometry(0.62, 0.6, 3, 1, false, (k / 8) * Math.PI * 2, Math.PI / 4), k % 2 ? C.pierre : th.motif, x, 3.55, z, null, new THREE.Vector3(2.4, 1, 2.4)));
      p.push(part.box(0.45, 0.5, 0.45, C.pourpre, x - 0.8, 0.25, z), part.box(0.45, 0.5, 0.45, C.pourpre, x + 0.8, 0.25, z));
      p.push(part.geo(new THREE.SphereGeometry(0.14, 6, 4), '#c9ccd1', x, 1.15, z), part.cyl(0.05, 0.04, 0.14, 6, '#7fb48a', x + 0.25, 1.05, z + 0.1));
    }
    // garde-corps face à la mer et lanternes
    p.push(part.box(9, 0.08, 0.08, C.blanc, 0, 1.1, 3.4));
    for (let x = -4.4; x <= 4.5; x += 1.1) p.push(part.box(0.08, 0.9, 0.08, C.blanc, x, 0.25, 3.4));
    for (const x of [-4.2, 4.2]) p.push(part.box(0.1, 2.2, 0.1, C.sombre, x, 0.25, 3.2), part.box(0.35, 0.45, 0.35, '#ffd98a', x, 2.45, 3.2));
    return { geo: mergeColored(p), dist: 7, plaza: [12, 10] };
  },

  // 5. Beït al-Hikma : palais blanc à arcades, coupoles, jardin, fontaine et bougainvillées
  5(th) {
    const p = [
      part.box(15, 5.4, 7, C.blanc, 0, 0, -1.5),
      part.box(15.4, 0.3, 7.4, C.calcaire, 0, 5.4, -1.5),
      part.box(15, 0.25, 2.2, C.calcaire, 0, 0, 3),
      part.geo(arcade(6, 1.7, 3.4, 0.45), C.blanc, 0, 0.25, 3.8),
      part.box(15, 0.3, 2.4, C.calcaire, 0, 3.65, 3.1),
      part.box(1.8, 2.8, 0.2, th.motif, 0, 0.25, 2.05),
      part.dome(1.5, C.blanc, -4.5, 5.7, -2, 10), part.dome(1.5, C.blanc, 4.5, 5.7, -2, 10), part.dome(2, C.blanc, 0, 5.7, -2.5, 12),
      // fontaine
      part.cyl(1.6, 1.7, 0.5, 12, C.calcaire, 0, 0, 7), part.cyl(1.4, 1.4, 0.06, 12, '#5fa8d0', 0, 0.45, 7),
      part.cyl(0.15, 0.2, 1.2, 6, C.calcaire, 0, 0.5, 7), part.cyl(0.6, 0.4, 0.2, 10, C.calcaire, 0, 1.7, 7),
    ];
    for (let x = -6; x <= 6.1; x += 2.4) p.push(part.box(1.1, 1.2, 0.2, th.motif, x, 4, 2.05), part.box(1.5, 0.1, 0.4, C.calcaire, x, 3.95, 2.15));
    for (const x of [-7.4, 7.4]) p.push(buisson(x, 1, 2.6, 1, C.rose), buisson(x, 2.4, 2.4, 0.8, '#d4569a'), buisson(x, 3.6, 2.2, 0.6, C.rose));
    p.push(...olivier(-5, 7.5), ...olivier(5, 7.5), ...banc(-2.8, 8.4), ...banc(2.8, 8.4));
    return { geo: mergeColored(p), dist: 12, plaza: [17, 14] };
  },

  // 6. Théâtre romain : gradins en demi-cercle, mur de scène à colonnes, bannières du festival
  6(th) {
    const p = [part.cyl(3.4, 3.4, 0.12, 20, '#e2cfa6', 0, 0, 0, null, Math.PI / 2, Math.PI)];
    for (let i = 5; i >= 0; i--) {
      const r = 3.6 + i * 1.05;
      p.push(part.cyl(r, r, 0.45 + i * 0.5, 26, i % 2 ? C.ruine : C.calcaire, 0, 0, 0, null, Math.PI / 2, Math.PI));
    }
    p.push(part.box(10, 1, 2.4, '#bfa175', 0, 0, 1.6));
    p.push(part.box(10, 0.35, 0.6, C.calcaire, 0, 4.2, 2.9));
    for (let x = -4.5; x <= 4.6; x += 1.5) p.push(part.cyl(0.2, 0.22, 3.2, 8, C.blanc, x, 1, 2.9), part.box(0.5, 0.2, 0.5, C.calcaire, x, 4, 2.9));
    // projecteurs du festival
    for (const x of [-6, 6]) p.push(part.box(0.15, 5, 0.15, C.sombre, x, 0, 3.4), part.box(0.5, 0.4, 0.5, C.sombre, x, 5, 3.4), part.box(0.36, 0.3, 0.1, '#ffe8a8', x, 5.05, 3.66));
    const flags = [-4.5, -1.5, 1.5, 4.5].map((x, i) => {
      const f = drapeau(i % 2 ? th.motif : C.ocre, 0.7, 1.4);
      f.g.position.set(x, 4.4, 3);
      f.g.scale.setScalar(0.6);
      return f;
    });
    return { geo: mergeColored(p), dist: 8, plaza: [13, 7], extras: flags.map((f) => f.g), update: (t) => flags.forEach((f, i) => f.update(t, i)) };
  },

  // 7. Mosquée Mâlik ibn Anas : grande cour à arcades, fontaine, minaret carré
  7(th) {
    const p = [
      part.box(13, 0.2, 13, '#efe9da', 0, 0, 0),
      part.box(13, 3.2, 0.5, C.blanc, 0, 0, -6.25), part.box(0.5, 3.2, 13, C.blanc, -6.25, 0, 0), part.box(0.5, 3.2, 13, C.blanc, 6.25, 0, 0),
      part.geo(arcade(2, 1.6, 3.2, 0.5), C.blanc, -4.1, 0, 6.25), part.geo(arcade(2, 1.6, 3.2, 0.5), C.blanc, 4.1, 0, 6.25),
      part.box(3.4, 4.2, 0.9, C.calcaire, 0, 0, 6.25), part.geo(archWin(1.8, 2.8), th.motif, 0, 0, 6.72),
      part.box(12, 4.6, 4.5, C.blanc, 0, 0, -3.8),
      part.geo(arcade(6, 1.3, 3, 0.4), C.blanc, 0, 0, -1.35),
      part.dome(2, '#e9dcc0', 0, 4.6, -3.8, 12), part.dome(1.1, '#e9dcc0', -3.8, 4.6, -3.8, 8), part.dome(1.1, '#e9dcc0', 3.8, 4.6, -3.8, 8),
      // fontaine aux ablutions et palmiers de la cour
      part.cyl(0.9, 1, 0.6, 8, C.calcaire, 0, 0.2, 2.2), part.cyl(0.75, 0.75, 0.06, 8, '#5fa8d0', 0, 0.76, 2.2),
      // minaret
      part.box(2.6, 14, 2.6, C.blanc, 4.6, 0, 4.4), part.box(3, 0.4, 3, th.motif, 4.6, 11.6, 4.4),
      part.box(1.9, 2.2, 1.9, C.blanc, 4.6, 14, 4.4), part.box(2.2, 0.25, 2.2, th.motif, 4.6, 16.2, 4.4), part.dome(0.95, th.motif, 4.6, 16.45, 4.4, 8),
      part.cyl(0.04, 0.04, 0.9, 4, C.ocre, 4.6, 17.3, 4.4),
      part.geo(new THREE.TorusGeometry(0.28, 0.06, 4, 10, Math.PI * 1.4), C.ocre, 4.6, 18.4, 4.4, new THREE.Euler(0, 0, Math.PI * 0.8)),
    ];
    for (const y of [5, 8.4]) p.push(part.geo(archWin(0.6, 1.4), C.sombre, 4.6, y, 5.72));
    p.push(part.geo(archWin(0.6, 1.2), C.sombre, 4.6, 14.4, 5.36));
    return { geo: mergeColored(p), dist: 12, plaza: [17, 16] };
  },

  // 8. Cimetière américain : pelouse, rangées de croix blanches, allée de cyprès, mémorial et drapeau
  8(th) {
    const p = [part.box(18, 0.1, 13, C.vert, 0, 0, 0), part.box(1.6, 0.12, 13, '#e8e0cc', 0, 0, 0),
      part.box(11, 3.2, 1.2, '#ece6d8', 0, 0, -6), part.geo(arcade(5, 1.2, 3.2, 1.3), '#e2dccb', 0, 0, -5.4)];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        if (col === 4 || col === 5) continue; // l'allée centrale
        const x = -7.2 + col * 1.6, z = -3.4 + row * 1.7;
        p.push(part.box(0.12, 0.9, 0.1, '#ffffff', x, 0.1, z), part.box(0.52, 0.12, 0.1, '#ffffff', x, 0.62, z));
      }
    }
    for (let z = -4; z <= 5; z += 3) p.push(...cypres(-1.3, z, 3.2), ...cypres(1.3, z, 3.2));
    const fl = drapeau('#f4f1e8');
    fl.g.position.set(7.5, 0, -5);
    return { geo: mergeColored(p), dist: 11, plaza: [6, 4], extras: [fl.g], update: (t) => fl.update(t) };
  },
};

/** Place pavée devant le monument, aux couleurs du lieu */
function plazaGeo(th, w, d) {
  const p = [part.box(w, 0.03, d, th.sol, 0, 0, 0)];
  for (const [bw, bd, x, z] of [[w, 0.3, 0, -d / 2], [w, 0.3, 0, d / 2], [0.3, d, -w / 2, 0], [0.3, d, w / 2, 0]]) p.push(part.box(bw, 0.05, bd, th.motif, x, 0, z));
  for (let x = -w / 2 + 1.2; x < w / 2 - 0.8; x += 1.6) {
    for (let z = -d / 2 + 1.2; z < d / 2 - 0.8; z += 1.6) {
      if ((Math.round(x / 1.6) + Math.round(z / 1.6)) % 2) continue;
      p.push(part.box(0.45, 0.045, 0.45, th.motif, x, 0, z, new THREE.Euler(0, Math.PI / 4, 0)));
    }
  }
  return mergeColored(p);
}

/* ================= Panneau 3D de chaque arrêt ================= */
const ETATS = { done: '✓ ÉTAPE VALIDÉE', next: 'PROCHAINE ÉTAPE', locked: 'À VENIR' };
function makeSign(stop, etat, th) {
  const W = 4.8, H = 2.6;
  const tex = canvasTexture(960, 520, (ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 34);
    ctx.fillStyle = C.pourpre;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = C.ocre;
    roundRect(ctx, 18, 18, w - 36, h - 36, 22);
    ctx.stroke();
    ctx.fillStyle = th.motif; // pastille à la couleur du lieu
    ctx.beginPath(); ctx.arc(w - 80, 92, 22, 0, Math.PI * 2); ctx.fill();
    const pad = 64;
    const eyebrow = stop.type === 'lieu' ? `ÉTAPE ${stop.i + 1} · ${stop.lieu.epoque.toUpperCase()}` : stop.type === 'pause' ? 'PAUSE · 20 MIN' : stop.type === 'depart' ? 'DÉPART' : 'ARRIVÉE';
    text(ctx, eyebrow, pad, 110, { font: `700 30px ${SANS}`, color: C.ocre, align: 'left', spacing: 6, maxWidth: w - pad * 2 - 60 });
    text(ctx, stop.nom, pad, 215, { font: `600 84px ${SERIF}`, color: C.pierre, align: 'left', maxWidth: w - pad * 2 });
    const sous = stop.type === 'lieu' ? stop.lieu.theme : stop.type === 'pause' ? 'Thé à la menthe face à la mer' : 'Vélos · Door Bina';
    text(ctx, sous, pad, 290, { font: `italic 500 44px ${SERIF}`, color: C.pierre, align: 'left', maxWidth: w - pad * 2 });
    ctx.fillStyle = 'rgba(246,236,209,.25)';
    ctx.fillRect(pad, 340, w - pad * 2, 2);
    if (ETATS[etat]) text(ctx, ETATS[etat], pad, 420, { font: `700 34px ${SANS}`, color: etat === 'locked' ? 'rgba(246,236,209,.6)' : C.ocre, align: 'left', spacing: 4 });
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

/* ================= Confettis d'arrivée ================= */
function createConfetti() {
  const COUNT = 220;
  const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3), vel = new Float32Array(COUNT * 3);
  const palette = [C.ocre, C.pourpre, C.pierre, '#2f7fb0', '#d9a441'].map((c) => new THREE.Color(c));
  for (let i = 0; i < COUNT; i++) palette[i % palette.length].toArray(col, i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, depthWrite: false }));
  pts.visible = false;
  pts.frustumCulled = false;
  let life = 0;
  return {
    obj: pts,
    burst(at) {
      for (let i = 0; i < COUNT; i++) {
        pos.set([at.x + (Math.random() - 0.5) * 3, at.y + 1 + Math.random() * 2, at.z + (Math.random() - 0.5) * 3], i * 3);
        const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 5;
        vel.set([Math.cos(a) * sp, 7 + Math.random() * 7, Math.sin(a) * sp], i * 3);
      }
      life = 4;
      pts.visible = true;
    },
    update(dt) {
      if (life <= 0) return;
      life -= dt;
      for (let i = 0; i < COUNT * 3; i += 3) {
        vel[i + 1] -= 9 * dt;
        vel[i] *= 0.99; vel[i + 2] *= 0.99;
        pos[i] += vel[i] * dt; pos[i + 1] = Math.max(0.1, pos[i + 1] + vel[i + 1] * dt); pos[i + 2] += vel[i + 2] * dt;
      }
      geo.attributes.position.needsUpdate = true;
      pts.material.opacity = Math.min(1, life);
      if (life <= 0) pts.visible = false;
    },
  };
}

/* ================= Le monde ================= */
export function createWorld(path, stops, etats, { quality = 1 } = {}) {
  const group = new THREE.Group();
  const rand = rng(11);
  const updaters = [];
  const sol = path.groundEndS; // au-delà, la route s'envole
  const ground = stops.map((st, k) => ({ st, k, s: path.stopS[k] })).filter((x) => x.st.type !== 'ciel');
  const base = new THREE.Vector3(), tan = new THREE.Vector3(), sideV = new THREE.Vector3();
  const dummy = new THREE.Object3D();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Zones réservées aux monuments (pas de maisons de ce côté-là)
  const exclusions = ground.map(({ st, s }) => ({ from: s - 14, to: s + 17, side: st.side }));
  const isExcluded = (s, side) => exclusions.some((e) => s > e.from && s < e.to && e.side === side);
  const quartier = (s) => { // thème du lieu le plus proche, si on est dans son quartier
    const g = ground.find((x) => Math.abs(x.s - s) < 24);
    return g ? THEMES[cleDe(g.st)] : null;
  };

  // ---------- Sol, route et mer ----------
  const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(190, 720).rotateX(-Math.PI / 2), flatMat({ color: '#ead8ae' }));
  groundMesh.position.set(SEA_X - 95, 0, -300);
  group.add(groundMesh);
  {
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c2 = new THREE.Vector3(), d = new THREE.Vector3();
    const edge = (s, w, out) => { path.pointAt(s, base); path.sideAt(s, sideV); return out.copy(base).addScaledVector(sideV, w); };
    const strip = (w0, w1, y, arr, step = 1, dash = 0) => {
      for (let s = 0; s < sol - 0.5; s += step) {
        const s2 = Math.min(sol, s + (dash || step));
        edge(s, w0, a); edge(s, w1, b); edge(s2, w0, c2); edge(s2, w1, d);
        arr.push(a.x, y, a.z, c2.x, y, c2.z, b.x, y, b.z, b.x, y, b.z, c2.x, y, c2.z, d.x, y, d.z);
      }
    };
    const mesh = (arr, mat) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      g.computeVertexNormals();
      group.add(new THREE.Mesh(g, mat));
    };
    const road = [], dashes = [], kerb = [];
    strip(-2.1, 2.1, 0.045, road);
    strip(-0.08, 0.08, 0.065, dashes, 3, 1.4);
    strip(-2.3, -2.1, 0.06, kerb); strip(2.1, 2.3, 0.06, kerb);
    mesh(road, flatMat({ color: '#c9a877', side: THREE.DoubleSide }));
    mesh(dashes, new THREE.MeshBasicMaterial({ color: C.pierre, side: THREE.DoubleSide }));
    mesh(kerb, flatMat({ color: '#e9dcc0', side: THREE.DoubleSide }));
  }
  // Tremplin d'envol au bout de la route
  if (sol < path.length - 1) {
    path.pointAt(sol - 1, base); path.tangentAt(sol - 1, tan);
    const arch = new THREE.Mesh(mergeColored([
      part.box(0.6, 6, 0.6, C.ocre, -3.2, 0, 0), part.box(0.6, 6, 0.6, C.ocre, 3.2, 0, 0),
      part.box(7, 0.7, 0.7, C.pourpre, 0, 6, 0),
    ]), flatMat({ vertexColors: true }));
    arch.position.copy(base);
    arch.rotation.y = Math.atan2(tan.x, tan.z);
    group.add(arch);
  }
  // Corniche (muret) et mer animée
  const corniche = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 720), flatMat({ color: C.calcaire }));
  corniche.position.set(SEA_X - 0.3, 0.35, -300);
  group.add(corniche);
  const seaGeo = new THREE.PlaneGeometry(420, 820, quality < 1 ? 30 : 46, quality < 1 ? 44 : 70).rotateX(-Math.PI / 2);
  const seaBase = seaGeo.attributes.position.array.slice();
  const sea = new THREE.Mesh(seaGeo, flatMat({ color: '#3f86b5' }));
  sea.position.set(SEA_X + 205, -0.6, -300);
  group.add(sea);
  updaters.push((t) => {
    const arr = seaGeo.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) arr[i + 1] = Math.sin(seaBase[i] * 0.09 + t * 0.9) * 0.25 + Math.cos(seaBase[i + 2] * 0.07 + t * 0.7) * 0.25;
    seaGeo.attributes.position.needsUpdate = true;
    seaGeo.computeVertexNormals();
  });
  // Collines au loin
  {
    const p = [];
    for (let i = 0; i < 12; i++) {
      const r = 20 + rand() * 25;
      p.push(part.geo(new THREE.ConeGeometry(r, 8 + rand() * 10, 7), i % 2 ? '#d9b98a' : '#cfae80', -70 - rand() * 50, 0, 20 - i * 60));
    }
    group.add(new THREE.Mesh(mergeColored(p), flatMat({ vertexColors: true })));
  }

  // ---------- Maisons colorées (instanciées) ----------
  const houses = [];
  for (const row of quality < 1 ? [7] : [7, 14.5]) {
    for (let s = 6; s < sol - 4; s += 4.4 + rand() * 1.6) {
      for (const side of [-1, 1]) {
        if (isExcluded(s, side)) continue;
        const w = 3.4 + rand() * 2, d = 4 + rand() * 2;
        const h = row > 10 ? 4.5 + rand() * 4 : 3 + rand() * 3;
        path.pointAt(s, base); path.tangentAt(s, tan); path.sideAt(s, sideV);
        const center = base.clone().addScaledVector(sideV, side * (row + d / 2 + rand() * 0.8));
        if (center.x + d / 2 > SEA_X - 1.5) continue;
        if (path.groundDistance(center.x, center.z) < d / 2 + 3.4) continue;
        const th = quartier(s);
        houses.push({ center, w, d, h, yaw: Math.atan2(tan.x, tan.z), side, dome: rand() < 0.2, front: row < 10,
          wall: WALLS[Math.floor(rand() * WALLS.length)], door: th && rand() < 0.75 ? th.porte : DOORS[Math.floor(rand() * DOORS.length)],
          fleurs: rand() < 0.3 });
      }
    }
  }
  for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
    houses.push({ center: new THREE.Vector3(side * (8 + rand() * 3), 0, 30 + i * 5), w: 4, d: 5, h: 3 + rand() * 3, yaw: 0, side, dome: false, front: false, wall: WALLS[i % WALLS.length], door: DOORS[0], fleurs: false });
  }
  const box = new THREE.BoxGeometry(1, 1, 1);
  const walls = new THREE.InstancedMesh(box, flatMat(), houses.length);
  const caps = new THREE.InstancedMesh(box, flatMat({ color: '#e9dcc0' }), houses.length); // rebord du toit-terrasse
  const domes = houses.filter((h) => h.dome);
  const domeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), flatMat({ color: '#fffaf0' }), Math.max(1, domes.length));
  const fronts = houses.filter((h) => h.front);
  const doors = new THREE.InstancedMesh(box, flatMat(), fronts.length);
  const wins = new THREE.InstancedMesh(box, flatMat(), fronts.length * 2);
  const fleurs = fronts.filter((h) => h.fleurs);
  const fleurMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), flatMat(), Math.max(1, fleurs.length * 3));
  const col = new THREE.Color();
  houses.forEach((h, i) => {
    dummy.position.set(h.center.x, h.h / 2, h.center.z);
    dummy.rotation.set(0, h.yaw, 0);
    dummy.scale.set(h.d, h.h, h.w);
    dummy.updateMatrix();
    walls.setMatrixAt(i, dummy.matrix);
    walls.setColorAt(i, col.set(h.wall));
    dummy.position.y = h.h + 0.12;
    dummy.scale.set(h.d + 0.2, 0.24, h.w + 0.2);
    dummy.updateMatrix();
    caps.setMatrixAt(i, dummy.matrix);
  });
  domes.forEach((h, i) => {
    const r = Math.min(h.w, h.d) * 0.34;
    dummy.position.set(h.center.x, h.h + 0.24, h.center.z);
    dummy.rotation.set(0, h.yaw, 0);
    dummy.scale.set(r, r * 0.9, r);
    dummy.updateMatrix();
    domeMesh.setMatrixAt(i, dummy.matrix);
  });
  const local = new THREE.Vector3();
  const place = (h, mesh, idx, along, y, sx, sy, out = 0.05, color) => {
    // axe X local = côté gauche de la route : la façade regarde la rue
    local.set(h.side * (h.d / 2 + out), 0, along).applyAxisAngle(THREE.Object3D.DEFAULT_UP, h.yaw);
    dummy.position.set(h.center.x + local.x, y, h.center.z + local.z);
    dummy.rotation.set(0, h.yaw, 0);
    dummy.scale.set(0.16, sy, sx);
    dummy.updateMatrix();
    mesh.setMatrixAt(idx, dummy.matrix);
    if (color) mesh.setColorAt(idx, col.set(color));
  };
  fronts.forEach((h, i) => {
    place(h, doors, i, (rand() - 0.5) * (h.w - 1.6), 1.05, 1.1, 2.1, 0.05, h.door);
    const win = h.h > 4 ? h.h - 1.2 : -5;
    place(h, wins, i * 2, -h.w * 0.27, win, 0.7, 0.9, 0.05, h.door);
    place(h, wins, i * 2 + 1, h.w * 0.27, win, 0.7, 0.9, 0.05, h.door);
  });
  fleurs.forEach((h, i) => { // bougainvillée qui grimpe sur un coin de façade
    for (let j = 0; j < 3; j++) {
      local.set(h.side * (h.d / 2 + 0.2), 0, h.w / 2 - 0.4).applyAxisAngle(THREE.Object3D.DEFAULT_UP, h.yaw);
      dummy.position.set(h.center.x + local.x, 0.8 + j * 1.05, h.center.z + local.z);
      dummy.rotation.set(j, j * 2, 0);
      dummy.scale.setScalar(0.7 - j * 0.12);
      dummy.updateMatrix();
      fleurMesh.setMatrixAt(i * 3 + j, dummy.matrix);
      fleurMesh.setColorAt(i * 3 + j, col.set(j === 0 ? C.feuille : j === 1 ? C.rose : '#d4569a'));
    }
  });
  group.add(walls, caps, domeMesh, doors, wins);
  if (fleurs.length) group.add(fleurMesh);

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
  for (let s = 10; s < sol - 4; s += 8 + rand() * 6) {
    const side = rand() < 0.5 ? -1 : 1;
    if (isExcluded(s, side)) continue;
    path.pointAt(s, base); path.sideAt(s, sideV);
    const p = base.clone().addScaledVector(sideV, side * (3.5 + rand() * 1.2));
    if (path.groundDistance(p.x, p.z) > 2.8) palms.push(p);
  }
  for (let z = 10; z > -620; z -= 9 + rand() * 8) palms.push(new THREE.Vector3(SEA_X - 2 - rand() * 1.5, 0, z)); // palmiers de la corniche
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
  for (let s = 36, k = 0; s < sol - 4; s += 12, k++) {
    const side = k % 2 ? 1 : -1;
    if (isExcluded(s, side)) continue;
    path.pointAt(s, base); path.sideAt(s, sideV);
    lamps.push(base.clone().addScaledVector(sideV, side * 2.7));
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

  // ---------- Monuments, places et panneaux ----------
  const monMat = flatMat({ vertexColors: true, side: THREE.DoubleSide });
  const plazaMat = flatMat({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
  const monuments = []; // { obj, s, built, anchor }
  ground.forEach(({ st, k, s: sStop }) => {
    const cle = cleDe(st);
    const th = THEMES[cle] || THEMES.agence;
    const build = MONUMENTS[cle];
    const s = sStop + 4;
    path.pointAt(s, base); path.sideAt(s, sideV);
    const { geo, dist, plaza, extras = [], update } = build(th);
    const holder = new THREE.Group();
    holder.position.copy(base).addScaledVector(sideV, st.side * dist);
    holder.lookAt(base.x, 0, base.z);
    const mon = new THREE.Group();
    mon.add(new THREE.Mesh(geo, monMat), ...extras);
    holder.add(mon);
    // La place s'étend du monument jusqu'au bord de la route
    const pl = new THREE.Mesh(plazaGeo(th, plaza[0], plaza[1]), plazaMat);
    pl.position.set(0, 0.012, dist - 2.5 - plaza[1] / 2);
    holder.add(pl);
    group.add(holder);
    if (update) updaters.push(update);
    monuments.push({ mon, s: sStop, built: reduce ? 1 : 0, anchor: holder.position.clone() });
    if (reduce) mon.scale.setScalar(1);
    else mon.scale.set(1, 0.001, 1);

    const sign = makeSign(st, etats[k], th);
    const sSign = sStop - 3;
    path.pointAt(sSign, base); path.sideAt(sSign, sideV);
    sign.position.copy(base).addScaledVector(sideV, st.side * 3.4);
    const back = path.pointAt(Math.max(0, sSign - 14));
    sign.lookAt(back.x, 0, back.z);
    group.add(sign);
  });

  const confetti = createConfetti();
  group.add(confetti.obj);
  const easeOutBack = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

  return {
    group,
    /** Fête l'arrivée du visiteur à l'arrêt k (confettis sur la place) */
    celebrate(k) {
      const m = monuments.find((x) => x.s === path.stopS[k]);
      if (m) confetti.burst(m.anchor);
    },
    update(t, dt, camS) {
      for (const u of updaters) u(t);
      confetti.update(dt);
      // Chaque monument se construit quand la caméra approche, et reste construit
      for (const m of monuments) {
        if (m.built >= 1) continue;
        const target = THREE.MathUtils.clamp((camS - (m.s - 70)) / 30, 0, 1);
        if (target > m.built) m.built = Math.min(target, m.built + dt * 1.2);
        const k = m.built;
        m.mon.scale.set(0.85 + 0.15 * k, Math.max(0.001, easeOutBack(k)), 0.85 + 0.15 * k);
      }
    },
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
  const target = new THREE.Vector3();
  let placed = false;

  return {
    group,
    /** Nouvelle position : la balise y glisse en douceur (mise à jour GPS) */
    moveTo(v) { target.copy(v); if (!placed) { group.position.copy(v); placed = true; } },
    setLabel(sous, live = false) {
      ctx.clearRect(0, 0, 640, 200);
      roundRect(ctx, 10, 10, 620, 150, 75);
      ctx.fillStyle = C.pourpre;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(300, 158); ctx.lineTo(340, 158); ctx.lineTo(320, 195); ctx.closePath();
      ctx.fill();
      if (live) { // point vert : position GPS en direct
        ctx.fillStyle = '#5fd38a';
        ctx.beginPath(); ctx.arc(70, 64, 13, 0, Math.PI * 2); ctx.fill();
      }
      text(ctx, 'VOUS ÊTES ICI', 320, 78, { font: `700 46px ${SANS}`, color: C.pierre, spacing: 6 });
      text(ctx, sous, 320, 130, { font: `italic 600 38px ${SERIF}`, color: '#f3c08a', maxWidth: 560 });
      tex.needsUpdate = true;
    },
    update(t, dt = 0.016) {
      group.position.lerp(target, Math.min(1, dt * 2.5));
      const k = (t * 0.6) % 1;
      ring.scale.setScalar(1 + k * 1.6);
      ring.material.opacity = 0.9 * (1 - k);
      column.material.opacity = 0.22 + Math.sin(t * 2.4) * 0.06;
      label.position.y = 4.6 + Math.sin(t * 1.6) * 0.15;
    },
  };
}
