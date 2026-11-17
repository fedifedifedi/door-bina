// Interface HTML par-dessus la 3D : points des arrêts à droite, fiche du lieu, barre de progression.
import { etatArret, statut, N } from './stops.js';

const PHOTOS = window.DOORBINA_PHOTOS || {};
const PAUSE = window.DOORBINA_PAUSE;
const RETOUR = window.DOORBINA_RETOUR;
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BADGE = { done: '✓ Étape validée', next: 'Prochaine étape', locked: 'À venir' };

function photo(id) {
  const p = PHOTOS[id];
  if (!p) return '';
  return `<figure class="card__photo"><img src="${esc(p.src)}" alt="" loading="lazy">
    <figcaption>Photo : ${esc(p.auteur)} · <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.licence)}</a></figcaption></figure>`;
}

function cardHTML(stop, S, ici) {
  const etat = etatArret(stop, S);
  const vous = ici ? '<p class="card__me">Vous êtes ici</p>' : '';
  const badge = `<span class="badge badge--${etat}">${BADGE[etat]}</span>`;
  if (stop.type === 'lieu') {
    const l = stop.lieu, st = statut(l);
    return `${vous}<p class="eyebrow">Étape ${stop.i + 1} sur ${N} · ${esc(l.epoque)}</p>
      <h2>${esc(l.nom)}</h2>
      <p class="card__theme">${esc(l.theme)}</p>
      <p class="card__meta">${badge}${st ? `<span class="statut statut--${st.etat}">${esc(st.txt)}</span>` : ''}</p>
      ${photo(l.id)}
      <p>${esc(l.fiche)}</p>
      <a class="card__link" href="index.html#/lieu/${l.id}">Le lieu à travers le temps →</a>`;
  }
  if (stop.type === 'pause') {
    return `${vous}<p class="eyebrow">Pause · environ 20 minutes</p>
      <h2>${esc(PAUSE.nom)}</h2>
      <p class="card__meta">${badge}</p>
      ${photo(PAUSE.id)}
      <p>${esc(PAUSE.fiche)}</p>`;
  }
  if (stop.type === 'depart') {
    return `${vous}<p class="eyebrow">Départ</p>
      <h2>Faisons le tour ensemble</h2>
      <p class="card__theme">Carthage à vélo, sans guide</p>
      <p>Récupérez vos vélos à l’agence Door Bina, puis pédalez d’étape en étape : huit lieux, huit indices, un code à ouvrir.</p>
      <p class="card__hint">Faites défiler pour avancer sur la route. Les points à droite vous emmènent directement à un lieu.</p>
      ${S.reservation ? '' : '<a class="card__link" href="index.html#/reserver">Réserver mes vélos →</a>'}`;
  }
  if (stop.type === 'ciel') {
    const fin = window.DOORBINA_FIN || { titre: '', texte: '', merci: '' };
    return `<p class="eyebrow">Le mot de la fin</p>
      <h2 class="card__ar" lang="ar" dir="rtl">قرطاج</h2>
      <p class="card__theme">${esc(fin.titre)}</p>
      <p class="sr-only">${esc(fin.texte)} ${esc(fin.merci)}</p>
      <p class="card__actions"><a class="card__btn" href="index.html#/carnet">Mon passeport</a>
        <button type="button" class="card__btn card__btn--ghost" data-restart>Recommencer le voyage</button></p>`;
  }
  return `${vous}<p class="eyebrow">Arrivée</p>
    <h2>${esc(RETOUR.nom)}</h2>
    <p class="card__meta">${badge}</p>
    <p>${esc(RETOUR.texte)}</p>
    <a class="card__link" href="index.html#/jeu">Voir mon score →</a>`;
}

export function createUI({ stops, stopS, S, onJump, onRestart }) {
  const nav = document.getElementById('stages');
  const card = document.getElementById('card');
  const fill = document.getElementById('progress-fill');
  const hint = document.getElementById('hint');

  nav.innerHTML = stops.map((st, k) => {
    const num = st.type === 'lieu' ? `${st.i + 1}. ` : '';
    return `<button type="button" class="stage stage--${etatArret(st, S)}" data-k="${k}"
      aria-label="Aller à : ${esc(num + st.nom)}"><span>${esc(num + st.court)}</span></button>`;
  }).join('');
  const btns = [...nav.querySelectorAll('button')];
  btns.forEach((b) => b.addEventListener('click', () => onJump(Number(b.dataset.k))));
  card.addEventListener('click', (e) => { if (e.target.closest('[data-restart]')) onRestart(); });
  const last = stops.length - 1;

  let shown = -2, active = -1, me = -1;
  return {
    update(charS, progress) {
      // Arrêt actif : le dernier dont on a atteint l'approche
      let k = 0;
      stopS.forEach((s, i) => { if (charS >= s - 22) k = i; });
      if (k !== active) {
        active = k;
        btns.forEach((b, i) => b.classList.toggle('is-active', i === k));
      }
      const fin = k === last && stops[k].type === 'ciel';
      const visible = charS >= stopS[k] - (fin ? 8 : 22) && (fin || charS <= stopS[k] + 12) ? k : -1;
      if (visible !== shown) {
        shown = visible;
        if (visible >= 0) {
          card.innerHTML = cardHTML(stops[visible], S, visible === me);
          // la fiche se place du côté opposé au monument ; au ciel, en bas pour laisser voir le mot de la fin
          card.dataset.side = fin ? 'bottom' : stops[visible].side < 0 ? 'right' : 'left';
          card.scrollTop = 0;
        }
        card.classList.toggle('is-visible', visible >= 0);
        card.inert = visible < 0;
      }
      fill.style.width = (progress * 100).toFixed(2) + '%';
      hint.classList.toggle('is-hidden', progress > 0.01);
    },
    /** Indique sur les points l'arrêt où se trouve le visiteur */
    setMe(pos) {
      me = pos == null ? -1 : Math.round(pos);
      btns.forEach((b, i) => b.classList.toggle('is-me', i === me));
      shown = -2; // redessine la fiche (mention « Vous êtes ici »)
    },
  };
}
