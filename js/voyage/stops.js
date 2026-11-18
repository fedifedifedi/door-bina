// Les arrêts du voyage (départ, 8 lieux, pause thé, retour, ciel) et la position réelle du visiteur.
// Les données viennent de js/data.js (traduites selon la langue choisie) ; la progression, de l'application.
import { t, lang, lieuTraduit, pauseTraduite, retourTraduit } from './i18n.js';

const LIEUX = window.DOORBINA_LIEUX;
const PAUSE = window.DOORBINA_PAUSE;
const RETOUR = window.DOORBINA_RETOUR;
export const N = LIEUX.length;
export const RAYON_ARRIVEE = 250; // mètres : même rayon que la validation dans le jeu

// Côté de la route où se dresse chaque monument : 1 = droite (côté mer), -1 = gauche
const COTE = { 1: 1, 2: -1, 3: -1, 4: 1, 5: 1, 6: -1, 7: 1, 8: -1 };

export function buildStops({ ciel = true } = {}) {
  const pause = pauseTraduite(PAUSE), retour = retourTraduit(RETOUR);
  const a = [{ type: 'depart', key: 'depart', nom: t('agenceNom'), court: t('departCourt'), lat: RETOUR.lat, lng: RETOUR.lng, side: -1 }];
  LIEUX.forEach((l0, i) => {
    const l = lieuTraduit(l0);
    a.push({ type: 'lieu', key: `lieu-${l.id}`, i, lieu: l, nom: l.nom, court: l.court, lat: l.lat, lng: l.lng, side: COTE[l.id] || (i % 2 ? -1 : 1) });
    if (l.pause) a.push({ type: 'pause', key: 'pause', pause, nom: pause.nom, court: pause.court, lat: l.lat, lng: l.lng, side: 1 });
  });
  a.push({ type: 'retour', key: 'retour', retour, nom: retour.nom, court: t('retourCourt'), lat: RETOUR.lat, lng: RETOUR.lng, side: -1 });
  // Fin du voyage : on s'envole au-dessus des nuages pour le mot de la fin
  if (ciel) a.push({ type: 'ciel', key: 'ciel', nom: t('fin'), court: t('fin'), side: 1 });
  return a;
}

/** Progression enregistrée par l'application */
export function readState() {
  const base = { reservation: null, stamps: [], stage: 'start', avatar: null, pauseFaite: false, codeOuvert: false };
  try { return Object.assign(base, JSON.parse(localStorage.getItem('doorbina:v2')) || {}); } catch (e) { return base; }
}
export const aCommence = (S) => !!S.reservation || S.stamps.length > 0;

/** État d'un arrêt pour ce visiteur : done (passé), next (prochain), locked (à venir) */
export function etatArret(stop, S) {
  const done = S.stamps.length;
  if (stop.type === 'ciel') return 'ciel';
  if (stop.type === 'depart') return aCommence(S) ? 'done' : 'next';
  if (stop.type === 'lieu') return stop.i < done ? 'done' : stop.i === done ? 'next' : 'locked';
  if (stop.type === 'pause') {
    if (S.pauseFaite) return 'done';
    const musee = LIEUX.findIndex((l) => l.pause);
    return S.stage === 'pause' || done === musee + 1 ? 'next' : 'locked';
  }
  return S.codeOuvert ? 'next' : 'locked';
}

export function distance(a, b) { // haversine, en mètres
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const fmtDist = (m) => (m >= 1000 ? `${String(Math.round(m / 100) / 10).replace('.', ',')} km` : `${Math.round(m / 10) * 10} m`);

/**
 * Où est le visiteur sur le parcours ?
 * pos : indice (décimal) dans la liste des arrêts ; ici : petite phrase pour l'étiquette.
 * gps : { lat, lng } ou null.
 */
export function maPosition(A, S, gps) {
  const done = S.stamps.length;
  const iLieu = (k) => A.findIndex((a) => a.type === 'lieu' && a.i === k);
  const court = (k) => A[iLieu(k)].court;
  if (!aCommence(S)) return { pos: 0, ici: t('depart') };
  if (S.stage === 'pause') return { pos: A.findIndex((a) => a.type === 'pause'), ici: t('pause') };
  if (S.stage === 'lieu' && done < N) return { pos: iLieu(done), ici: t('a', { x: court(done) }) };
  if (S.stage === 'stamp' && done > 0) return { pos: iLieu(done - 1), ici: t('a', { x: court(done - 1) }) };
  const versRetour = done >= N && S.codeOuvert;
  if (done >= N && !versRetour) return { pos: iLieu(N - 1), ici: t('a', { x: court(N - 1) }) };
  const to = versRetour ? A.findIndex((a) => a.type === 'retour') : iLieu(done);
  const from = to - 1;
  let f = 0, d = null;
  if (gps && distance(gps, { lat: 36.8545, lng: 10.329 }) < 6000) {
    d = distance(gps, A[to]);
    // Arrivé : le GPS est dans le rayon du lieu
    if (d <= RAYON_ARRIVEE) return { pos: to, ici: t('estA', { x: versRetour ? t('lAgence') : A[to].court }), arrive: to, d };
    const tot = distance(A[from], A[to]);
    f = tot > 1 ? Math.min(0.95, Math.max(0, 1 - d / tot)) : 0;
  }
  return { pos: from + f, ici: `${t('vers', { x: versRetour ? t('leRetour') : A[to].court })}${d != null ? ` · ${fmtDist(d)}` : ''}`, d };
}

/** Horaires du jour (même règle que l'application) */
export function statut(l, d = new Date()) {
  const h = l.horaires;
  if (!h) return null;
  const mn = (x) => String(Math.round((x % 1) * 60)).padStart(2, '0');
  // 18h30 en français, 18:30 en anglais et en arabe
  const fmtH = (x) => (lang === 'fr' ? `${Math.floor(x)}h${x % 1 ? mn(x) : ''}` : `${Math.floor(x)}:${mn(x)}`);
  if (h.ferme) return { etat: 'ferme', txt: lang === 'fr' ? h.ferme : t('fermeRehab') };
  const j = h.jours[d.getDay()];
  if (!j) return { etat: 'ferme', txt: t('fermeAuj') };
  const now = d.getHours() + d.getMinutes() / 60;
  if (now < j[0]) return { etat: 'bientot', txt: t('ouvreA', { h: fmtH(j[0]) }) };
  if (now >= j[1]) return { etat: 'ferme', txt: t('fermeDepuis', { h: fmtH(j[1]) }) };
  return { etat: 'ouvert', txt: t('ouvertJusqua', { h: fmtH(j[1]) }) };
}
