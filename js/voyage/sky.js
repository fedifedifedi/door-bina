// Ciel en dégradé (fin d'après-midi sur le golfe de Tunis) et soleil bas sur la mer
import * as THREE from 'three';

export const COULEURS_CIEL = { top: '#5c2443', horizon: '#f6cf9f', bottom: '#eab98a', fog: '#efd3b0' };

export function createSky() {
  const group = new THREE.Group();
  const c = (hex) => new THREE.Color(hex);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: { top: { value: c(COULEURS_CIEL.top) }, horizon: { value: c(COULEURS_CIEL.horizon) }, bottom: { value: c(COULEURS_CIEL.bottom) } },
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
        uniform vec3 top, horizon, bottom;
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 col = h > 0.0 ? mix(horizon, top, pow(smoothstep(0.0, 0.8, h), 0.75))
                             : mix(horizon, bottom, smoothstep(0.0, -0.3, h));
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

  return {
    group,
    sunDir,
    update(camera) { group.position.copy(camera.position); },
  };
}
