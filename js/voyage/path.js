// La route du voyage : une courbe que suivent le cycliste et la caméra.
// Chaque arrêt (départ, lieux, pause, retour) est un point de passage de la courbe.
// Après le retour des vélos, la route s'envole vers le ciel pour le mot de la fin.
import * as THREE from 'three';

// Positions (x, z) des arrêts au sol, environ 40 unités entre deux arrêts. La mer est à droite (x > 24).
const BASE = [[0, 0], [6, -42], [-3, -84], [-7, -118], [-3, -150], [6, -186], [9, -226], [1, -266], [-6, -302], [-2, -342], [4, -386]];
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function createPath(stops) {
  const n = stops.length;
  const ciel = stops[n - 1].type === 'ciel';
  const nSol = ciel ? n - 1 : n;
  const xz = nSol === BASE.length ? BASE : Array.from({ length: nSol }, (_, k) => [Math.sin(k * 1.3) * 7, -k * 40]);
  const stopPts = xz.map(([x, z]) => V(x, 0, z));
  const last = stopPts[nSol - 1];
  const ctrl = [V(0, 0, 26), ...stopPts];
  if (ciel) {
    // Envol : la route décolle doucement, traverse les nuages, puis plane au-dessus
    ctrl.push(V(last.x, 0, last.z - 24), V(last.x - 1, 2.5, last.z - 44), V(0, 13, last.z - 64), V(-2, 27, last.z - 86), V(0, 38, last.z - 108));
    const haut = V(0, 42, last.z - 134);
    stopPts.push(haut);
    ctrl.push(haut, V(0, 42, last.z - 160));
  } else {
    ctrl.push(V(last.x, 0, last.z - 32));
  }
  const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');
  curve.arcLengthDivisions = 5000;
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
    /** Distance horizontale entre un point et la partie de la route posée au sol */
    groundDistance(x, z) {
      let best = Infinity;
      for (const p of samples) {
        if (p.y > 1) continue;
        const d = (p.x - x) ** 2 + (p.z - z) ** 2;
        if (d < best) best = d;
      }
      return Math.sqrt(best);
    },
  };
  path.stopS = stopPts.map((p) => path.nearestS(p));
  // Fin de la partie au sol (là où le vélo décolle)
  path.groundEndS = length;
  for (let s = path.stopS[nSol - 1]; s < length; s += 0.5) {
    if (path.pointAt(s).y > 0.25) { path.groundEndS = s; break; }
  }
  return path;
}
