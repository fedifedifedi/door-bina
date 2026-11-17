// Le voyage 3D : on fait défiler la page pour pédaler à travers Carthage.
// La caméra suit le cycliste ; une balise montre où se trouve vraiment le visiteur (jeu + GPS).
import * as THREE from 'three';
import { createPath } from './path.js';
import { createSky, COULEURS_CIEL } from './sky.js';
import { createWorld, createBeacon } from './world.js';
import { createRider } from './rider.js';
import { createUI } from './ui.js';
import { buildStops, readState, etatArret, maPosition, aCommence } from './stops.js';

const CHAR_AHEAD = 6;   // distance caméra → cycliste
const LOOK_AHEAD = 9;   // la caméra regarde un peu plus loin
const CAM_HEIGHT = 2.9;

const $ = (id) => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

async function start() {
  if (!webglOk() || !window.DOORBINA_LIEUX) throw new Error('WebGL indisponible');
  const isMobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const quality = isMobile ? 0.6 : 1;

  // Les panneaux sont dessinés avec les polices du site
  await Promise.race([
    Promise.all(['600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', '700 40px "Open Sans"', '700 40px Amiri'].map((f) => document.fonts.load(f))),
    new Promise((r) => setTimeout(r, 2500)),
  ]).catch(() => {});

  const S = readState();
  const stops = buildStops();
  const etats = stops.map((st) => etatArret(st, S));

  // ---------- Rendu ----------
  const canvas = $('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COULEURS_CIEL.fog, 28, 150);
  const camera = new THREE.PerspectiveCamera(isMobile ? 66 : 56, innerWidth / innerHeight, 0.1, 900);

  const sky = createSky();
  scene.add(sky.group);
  scene.add(new THREE.HemisphereLight('#fff1dc', '#b08a6a', 1.8));
  const sun = new THREE.DirectionalLight('#ffd6a8', 2.2);
  sun.position.set(sky.sunDir.x * 100, 70, sky.sunDir.z * 100);
  scene.add(sun, sun.target);

  const path = createPath(stops.length);
  const world = createWorld(path, stops, etats, { quality });
  scene.add(world.group);
  const rider = createRider(S.avatar || 'homme');
  scene.add(rider.root);

  // ---------- Défilement → position sur la route ----------
  const travel = path.length - CHAR_AHEAD - LOOK_AHEAD;
  $('scroll-track').style.height = `${stops.length * 130}vh`;
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  let target = 0, progress = 0;
  const readScroll = () => { target = Math.min(1, Math.max(0, scrollY / maxScroll())); };
  addEventListener('scroll', readScroll, { passive: true });
  /** Amène le cycliste à la distance charS sur la route */
  const goTo = (charS, instant = false) => {
    const camS = Math.min(travel, Math.max(0, charS - CHAR_AHEAD));
    scrollTo({ top: (camS / travel) * maxScroll(), behavior: instant || reduce ? 'auto' : 'smooth' });
  };

  // Arrivée sur un arrêt : le cycliste s'arrête un peu avant, pour voir le panneau et le monument
  const APPROCHE = 12;
  const ui = createUI({ stops, stopS: path.stopS, S, onJump: (k) => goTo(path.stopS[k] - APPROCHE) });

  // ---------- « Vous êtes ici » ----------
  const beacon = createBeacon();
  scene.add(beacon.group);
  let gps = null, meS = 0;
  function placeMe() {
    const started = aCommence(S);
    beacon.group.visible = started;
    $('btn-me').hidden = !started;
    if (!started) { ui.setMe(null); return; }
    const P = maPosition(stops, S, gps);
    const a = Math.floor(P.pos), b = Math.min(stops.length - 1, a + 1), f = P.pos - a;
    meS = path.stopS[a] + (path.stopS[b] - path.stopS[a]) * f;
    path.pointAt(meS, beacon.group.position);
    beacon.setLabel(P.ici);
    ui.setMe(P.pos);
  }
  placeMe();
  $('btn-me').addEventListener('click', () => goTo(meS - APPROCHE));

  // GPS : proposé par un bouton, activé d'office si le visiteur l'a déjà autorisé
  let watch = null;
  function startGps() {
    if (!navigator.geolocation || watch != null) return;
    $('btn-gps').textContent = 'GPS : recherche…';
    watch = navigator.geolocation.watchPosition(
      (p) => { gps = { lat: p.coords.latitude, lng: p.coords.longitude }; $('btn-gps').hidden = true; placeMe(); },
      () => { $('btn-gps').textContent = 'GPS refusé'; watch = null; },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }
  if (aCommence(S) && navigator.geolocation) {
    $('btn-gps').hidden = false;
    $('btn-gps').addEventListener('click', startGps);
    navigator.permissions?.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') startGps(); }).catch(() => {});
  }

  // Point de départ : ?etape=3 dans l'adresse, sinon là où se trouve le visiteur
  const params = new URLSearchParams(location.search);
  if (params.has('etape')) goTo(path.stopS[Math.min(stops.length - 1, Math.max(0, Number(params.get('etape')) || 0))] - APPROCHE, true);
  else if (aCommence(S) && meS > 1) goTo(meS - APPROCHE, true);
  readScroll();
  progress = target;

  // ---------- Caméra et boucle ----------
  const camPos = new THREE.Vector3(), lookPos = new THREE.Vector3(), smoothLook = new THREE.Vector3();
  let first = true;
  const clock = new THREE.Clock();
  let prevCharS = null;

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    progress += (target - progress) * Math.min(1, dt * 4);
    if (Math.abs(target - progress) < 1e-5) progress = target;
    const camS = progress * travel;

    path.pointAt(camS, camPos);
    camPos.y += CAM_HEIGHT;
    path.pointAt(camS + CHAR_AHEAD + LOOK_AHEAD, lookPos);
    lookPos.y += 1.4;
    camera.position.copy(camPos);
    if (first) { smoothLook.copy(lookPos); first = false; }
    smoothLook.lerp(lookPos, 0.2);
    camera.lookAt(smoothLook);

    sky.update(camera);
    world.update(t);
    beacon.update(t);
    const charS = camS + CHAR_AHEAD;
    const speed = prevCharS === null ? 0 : Math.abs(charS - prevCharS) / Math.max(dt, 1e-4);
    prevCharS = charS;
    rider.update(path, charS, speed, t, dt);
    ui.update(charS, progress);
    renderer.render(scene, camera);
  }
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });
  tick();
  renderer.setAnimationLoop(tick);
}

start()
  .then(() => $('loader').classList.add('is-done'))
  .catch((err) => {
    console.error('Le voyage 3D n’a pas pu démarrer :', err);
    $('loader').classList.add('is-done');
    $('fallback').hidden = false;
  });
