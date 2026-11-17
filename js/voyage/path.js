// La route du voyage : une courbe que suivent le cycliste et la caméra.
// Chaque arrêt (départ, lieux, pause, retour) est un point de passage de la courbe.
import * as THREE from 'three';

// Positions (x, z) des arrêts, environ 40 unités entre deux arrêts. La mer est à droite (x > 24).
const BASE = [[0, 0], [6, -42], [-3, -84], [-7, -118], [-3, -150], [6, -186], [9, -226], [1, -266], [-6, -302], [-2, -342], [4, -386]];

export function createPath(n) {
  const xz = n === BASE.length ? BASE : Array.from({ length: n }, (_, k) => [Math.sin(k * 1.3) * 7, -k * 40]);
  const stopPts = xz.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const last = stopPts[n - 1];
  const ctrl = [new THREE.Vector3(0, 0, 26), ...stopPts, new THREE.Vector3(last.x, 0, last.z - 32)];
  const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
  curve.arcLengthDivisions = 4000;
  const length = curve.getLength();
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  const samples = curve.getSpacedPoints(Math.ceil(length * 2));

  const path = {
    length,
    samples,
    pointAt: (s, target = new THREE.Vector3()) => curve.getPointAt(clamp01(s / length), target),
    tangentAt: (s, target = new THREE.Vector3()) => curve.getTangentAt(clamp01(s / length), target),
    /** Vecteur horizontal perpendiculaire à la route (vers la droite du cycliste) */
    sideAt(s, target = new THREE.Vector3()) {
      const t = path.tangentAt(s);
      return target.set(-t.z, 0, t.x).normalize();
    },
    nearestS(pos) {
      let best = Infinity, bestI = 0;
      for (let i = 0; i < samples.length; i++) {
        const d = samples[i].distanceToSquared(pos);
        if (d < best) { best = d; bestI = i; }
      }
      return (bestI / (samples.length - 1)) * length;
    },
    groundDistance(x, z) {
      let best = Infinity;
      for (const p of samples) {
        const d = (p.x - x) ** 2 + (p.z - z) ** 2;
        if (d < best) best = d;
      }
      return Math.sqrt(best);
    },
  };
  path.stopS = stopPts.map((p) => path.nearestS(p));
  return path;
}
