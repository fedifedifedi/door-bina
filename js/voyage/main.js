// Le voyage 3D : on fait défiler la page pour pédaler à travers Carthage, puis on s'envole
// au-dessus des nuages pour le mot de la fin. Une balise montre où se trouve vraiment le visiteur :
// avec le GPS, elle avance en direct et la vue la suit ; à l'arrivée sur un lieu, c'est la fête.
import * as THREE from 'three';
import { createPath } from './path.js';
import { createSky, createHeaven, MOODS } from './sky.js';
import { createWorld, createBeacon } from './world.js';
import { createRider } from './rider.js';
import { createUI } from './ui.js';
import { buildStops, readState, etatArret, maPosition, aCommence, fmtDist } from './stops.js';

const CHAR_AHEAD = 6;   // distance caméra → cycliste
const LOOK_AHEAD = 9;   // la caméra regarde un peu plus loin
const CAM_HEIGHT = 2.9;
const APPROCHE = 12;    // en arrivant sur un arrêt, le cycliste s'arrête un peu avant le panneau

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
    Promise.all(['600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', 'italic 600 40px "Cormorant Garamond"', '700 40px "Open Sans"', '700 40px Amiri'].map((f) => document.fonts.load(f))),
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
  scene.fog = new THREE.Fog(MOODS.sol.fog, 28, 150);
  const fogSol = new THREE.Color(MOODS.sol.fog), fogCiel = new THREE.Color(MOODS.ciel.fog);
  const camera = new THREE.PerspectiveCamera(isMobile ? 66 : 56, innerWidth / innerHeight, 0.3, 900);

  const sky = createSky();
  scene.add(sky.group);
  const hemi = new THREE.HemisphereLight('#fff1dc', '#b08a6a', 1.8);
  const sun = new THREE.DirectionalLight('#ffd6a8', 2.2);
  sun.position.set(sky.sunDir.x * 100, 70, sky.sunDir.z * 100);
  scene.add(hemi, sun, sun.target);

  const path = createPath(stops);
  const world = createWorld(path, stops, etats, { quality });
  scene.add(world.group);
  const iFin = stops.findIndex((s) => s.type === 'ciel');
  const heaven = iFin >= 0 ? createHeaven(path, path.stopS[iFin], window.DOORBINA_FIN || { titre: '', texte: '', merci: '' }) : null;
  if (heaven) scene.add(heaven.group);
  const rider = createRider(S.avatar || 'homme');
  scene.add(rider.root, ...rider.extras);

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

  const ui = createUI({
    stops, stopS: path.stopS, S,
    onJump: (k) => { stopFollow(); goTo(path.stopS[k] - APPROCHE); },
    onRestart: () => { stopFollow(); goTo(0); },
  });

  // ---------- « Vous êtes ici » ----------
  const beacon = createBeacon();
  scene.add(beacon.group);
  let gps = null, meS = 0, follow = false;
  const fete = new Set(); // arrêts déjà fêtés (une seule fois chacun)
  const toast = $('toast');
  let toastTimer = null;
  function showToast(html) {
    toast.innerHTML = html;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 9000);
  }

  function placeMe() {
    const started = aCommence(S);
    beacon.group.visible = started;
    $('btn-me').hidden = !started;
    if (!started) { ui.setMe(null); return; }
    const P = maPosition(stops, S, gps);
    const a = Math.floor(P.pos), b = Math.min(stops.length - 1, a + 1), f = P.pos - a;
    meS = path.stopS[a] + (path.stopS[b] - path.stopS[a]) * f;
    beacon.moveTo(path.pointAt(meS));
    beacon.setLabel(P.ici, !!gps);
    ui.setMe(P.pos);
    // Arrivée sur un lieu grâce au GPS : confettis et message
    if (P.arrive != null && !fete.has(P.arrive)) {
      fete.add(P.arrive);
      const st = stops[P.arrive];
      world.celebrate(P.arrive);
      showToast(`<strong>Vous y êtes : ${st.type === 'retour' ? 'l’agence Door Bina' : st.nom} !</strong>
        ${st.type === 'retour' ? 'Rendez vos vélos et montrez votre QR de score.' : 'Ouvrez l’étape dans le jeu : l’audio et la question vous attendent.'}
        <a href="index.html#/jeu">Ouvrir le jeu →</a>`);
      if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
    }
    // La vue suit le visiteur
    if (follow && gps) goTo(meS - APPROCHE);
    majStatut(P);
  }
  $('btn-me').addEventListener('click', () => { if (gps) startFollow(); goTo(meS - APPROCHE); });

  // ---------- GPS en direct ----------
  let watch = null, precision = null;
  const btnGps = $('btn-gps');
  let dernierP = null;
  function majStatut(P = dernierP) {
    dernierP = P;
    const st = $('gps-status');
    if (!gps) { st.hidden = true; return; }
    st.hidden = false;
    st.innerHTML = `<span class="live-dot"></span>GPS en direct${precision ? ` · ± ${Math.round(precision)} m` : ''}${P && P.arrive != null ? ' · sur place' : P && P.d != null ? ` · ${fmtDist(P.d)} du prochain arrêt` : ''}`;
    btnGps.hidden = false;
    btnGps.textContent = follow ? 'Suivi GPS ✓' : 'Me suivre';
    btnGps.setAttribute('aria-pressed', String(follow));
  }
  function startFollow() { follow = true; majStatut(); }
  function stopFollow() { if (follow) { follow = false; majStatut(); } }
  function startGps() {
    if (!navigator.geolocation || watch != null) return;
    btnGps.textContent = 'GPS : recherche…';
    watch = navigator.geolocation.watchPosition(
      (p) => {
        const premier = !gps;
        gps = { lat: p.coords.latitude, lng: p.coords.longitude };
        precision = p.coords.accuracy;
        if (premier) follow = true; // à la première position, la vue va vers le visiteur
        placeMe();
      },
      () => { btnGps.textContent = 'GPS refusé'; watch = null; },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 20000 }
    );
  }
  btnGps.addEventListener('click', () => {
    if (!gps) startGps();
    else if (follow) stopFollow();
    else { startFollow(); goTo(meS - APPROCHE); }
  });
  // Si le visiteur fait défiler lui-même, la vue ne le suit plus (il peut explorer)
  for (const ev of ['wheel', 'touchmove']) addEventListener(ev, stopFollow, { passive: true });
  addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) stopFollow(); });

  if (aCommence(S) && navigator.geolocation) {
    btnGps.hidden = false;
    navigator.permissions?.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') startGps(); }).catch(() => {});
  }
  placeMe();

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

    // Ambiance : du soleil de l'après-midi au crépuscule étoilé en prenant de l'altitude
    const mood = THREE.MathUtils.smoothstep(camera.position.y, 6, 34);
    sky.update(camera, mood, t);
    scene.fog.color.copy(fogSol).lerp(fogCiel, mood);
    scene.fog.near = 28 + mood * 40;
    scene.fog.far = 150 + mood * 200;
    hemi.intensity = 1.8 - mood * 0.5;

    const charS = camS + CHAR_AHEAD;
    world.update(t, dt, camS);
    if (heaven) heaven.update(t, camera);
    beacon.update(t, dt);
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
