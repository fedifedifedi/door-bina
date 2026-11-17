// Petits outils partagés par les modules 3D du voyage
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Générateur aléatoire déterministe : le décor est identique à chaque visite */
export function rng(seed = 1) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fusionne plusieurs géométries colorées en une seule (= un seul appel de dessin).
 * parts : [{ geo, color, position?, rotation?, scale? }]
 */
export function mergeColored(parts) {
  const geos = parts.map(({ geo, color, position, rotation, scale }) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    const m = new THREE.Matrix4().compose(
      position || new THREE.Vector3(),
      new THREE.Quaternion().setFromEuler(rotation || new THREE.Euler()),
      scale || new THREE.Vector3(1, 1, 1)
    );
    g.applyMatrix4(m);
    if (g.attributes.uv) g.deleteAttribute('uv');
    const c = new THREE.Color(color);
    const colors = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) { colors[i] = c.r; colors[i + 1] = c.g; colors[i + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  });
  const merged = mergeGeometries(geos);
  merged.computeVertexNormals();
  return merged;
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);
/** Raccourcis pour décrire un bâtiment pièce par pièce (y = bas de la pièce) */
export const part = {
  box: (w, h, d, color, x = 0, y = 0, z = 0, rotation) =>
    ({ geo: new THREE.BoxGeometry(w, h, d), color, position: V(x, y + h / 2, z), rotation }),
  cyl: (rt, rb, h, seg, color, x = 0, y = 0, z = 0, rotation, ts = 0, tl = Math.PI * 2) =>
    ({ geo: new THREE.CylinderGeometry(rt, rb, h, seg, 1, false, ts, tl), color, position: V(x, y + h / 2, z), rotation }),
  dome: (r, color, x = 0, y = 0, z = 0, seg = 10) =>
    ({ geo: new THREE.SphereGeometry(r, seg, 5, 0, Math.PI * 2, 0, Math.PI / 2), color, position: V(x, y, z) }),
  geo: (geo, color, x = 0, y = 0, z = 0, rotation, scale) => ({ geo, color, position: V(x, y, z), rotation, scale }),
};

/** Matériau low-poly mat, facettes visibles */
export const flatMat = (opts = {}) => new THREE.MeshLambertMaterial({ flatShading: true, ...opts });

/** Texture dessinée sur un canvas */
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function text(ctx, str, x, y, { font, color, align = 'center', spacing = 0, maxWidth }) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
  ctx.fillText(str, x, y, maxWidth);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}
