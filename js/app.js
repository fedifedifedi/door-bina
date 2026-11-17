/* Door Bina — application (réservation, carte GPS, audioguide, jeu de piste, code final) */
(function () {
  'use strict';

  const LIEUX = window.DOORBINA_LIEUX;
  const PAUSE = window.DOORBINA_PAUSE;
  const CODE = window.DOORBINA_CODE;
  const RETOUR = window.DOORBINA_RETOUR;
  const PHOTOS = window.DOORBINA_PHOTOS || {};
  const STAFF = window.DOORBINA_STAFF || { pin: '2026', sel: 'door-bina' };

  // Photo d'un lieu, toujours avec son crédit (obligatoire pour les licences Creative Commons)
  function photo(id, cls = '') {
    const p = PHOTOS[id], x = trouver(id);
    if (!p) return '';
    return `<figure class="photo ${cls}">
      <img src="${p.src}" alt="${x ? x.nom : ''}" loading="lazy">
      <figcaption>Photo : ${p.auteur} · <a href="${p.url}" target="_blank" rel="noopener">${p.licence}</a></figcaption>
    </figure>`;
  }
  const MAP = window.DOORBINA_MAP;
  const TARIFS = window.DOORBINA_TARIFS;
  const N = LIEUX.length;
  const KEY = 'doorbina:v2';
  const RAYON_VALIDATION = 250; // mètres autour du lieu pour valider la présence
  const CARTHAGE = { lat: 36.8545, lng: 10.3290 };
  const VITESSE_VELO = 12; // km/h
  const ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const VELOS = { confort: 'Vélo confort', electrique: 'Vélo électrique' };
  const LANGUES = { fr: 'Français', en: 'English', ar: 'العربية', tn: 'تونسي (دارجة)' };
  const FORMULES = {
    journee: 'Journée complète · 8 lieux',
    demi: 'Demi-journée · rythme soutenu',
    adapte: 'Parcours adapté · pauses fréquentes'
  };
  const POINTS = { etape: 100, erreur: 10, aide: 10 };

  /* ---------- État (sauvegardé dans le navigateur) ---------- */
  function neuf() {
    return { reservation: null, stamps: [], stage: 'start', avatar: null, ecoutes: {}, qok: {}, qfaux: {},
      erreurs: 0, aides: 0, pauseFaite: false, codeOuvert: false, tFin: null, equipe: '', souvenir: '' };
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  let S = Object.assign(neuf(), load());
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ }
  }
  let geoMsg = '';

  /* ---------- Utilitaires ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const f1 = (n) => Math.round(n * 10) / 10;
  const virgule = (n) => String(n).replace('.', ',');
  const pad = (n) => String(n).padStart(2, '0');
  const heure = (t) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateCourte = (d) => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const dateLongue = (t) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtH = (h) => `${Math.floor(h)}h${h % 1 ? pad(Math.round((h % 1) * 60)) : ''}`;
  const fmtMin = (m) => `${Math.floor(m / 60) % 24}h${pad(m % 60)}`;
  const trouver = (id) => (id === PAUSE.id ? PAUSE : LIEUX.find((x) => x.id === id));

  function distance(a, b) { // haversine, en mètres
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function fmtDist(m) { return m >= 1000 ? `${virgule(f1(m / 1000))} km` : `${Math.round(m / 10) * 10} m`; }
  function minutesVelo(m) { return Math.max(1, Math.round((m * 1.3 / 1000) / VITESSE_VELO * 60)); }
  function smooth(p) {
    let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return d;
  }
  function etat(i) {
    const done = S.stamps.length;
    return i < done ? 'done' : i === done ? 'next' : 'locked';
  }
  function codeAleatoire() {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = 'DB-';
    for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)];
    return s;
  }
  // Destination actuelle sur la carte : le prochain lieu, puis le point de retour des vélos
  function retourActif() { return !!S.codeOuvert; }
  function cible() { return LIEUX[S.stamps.length] || (retourActif() ? RETOUR : null); }

  // Score signé : l'équipe Door Bina peut vérifier qu'un score n'a pas été inventé
  function signer(code, pts) {
    let h = 5381;
    for (const ch of `${STAFF.sel}|${code}|${pts}`) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
    return h.toString(36).toUpperCase().slice(-4).padStart(4, '0');
  }
  function codeResa() { return S.reservation ? S.reservation.code : 'DB-0000'; }
  function codeScore() { const c = codeResa(), s = score(); return `${c}-${s}-${signer(c, s)}`; }
  function qrScore() {
    const c = codeResa(), s = score();
    return 'DOORBINA-SCORE:' + JSON.stringify({ c, e: S.equipe || (S.reservation && S.reservation.nom) || '', s, n: S.stamps.length, t: S.tFin, k: signer(c, s) });
  }
  function score() { return Math.max(0, S.stamps.length * POINTS.etape - S.erreurs * POINTS.erreur - S.aides * POINTS.aide); }

  /* ---------- Horaires et programme ---------- */
  function statut(l, d = new Date()) {
    const h = l.horaires;
    if (!h) return null;
    if (h.ferme) return { etat: 'ferme', txt: h.ferme, journee: true };
    const j = h.jours[d.getDay()];
    if (!j) return { etat: 'ferme', txt: 'Fermé aujourd’hui', journee: true };
    const now = d.getHours() + d.getMinutes() / 60;
    if (now < j[0]) return { etat: 'bientot', txt: `Ouvre à ${fmtH(j[0])}` };
    if (now >= j[1]) return { etat: 'ferme', txt: `Fermé depuis ${fmtH(j[1])}` };
    return { etat: 'ouvert', txt: `Ouvert jusqu’à ${fmtH(j[1])}` };
  }
  function puceStatut(l) {
    const s = statut(l);
    return s ? `<span class="statut ${s.etat}">${s.txt}</span>` : '';
  }
  function departMin() {
    const h = S.reservation && S.reservation.heure;
    if (!h) return 600; // 10h00 par défaut, comme dans le programme
    const [a, b] = h.split(':').map(Number);
    return a * 60 + b;
  }
  function creneau(x) { const d = departMin(); return `${fmtMin(d + x.prog[0])}–${fmtMin(d + x.prog[1])}`; }

  /* ---------- Logo (lettrage Door Bina) ---------- */
  function spokes(cx, cy) {
    let s = '';
    for (let k = 0; k < 5; k++) {
      const a = (-90 + k * 72) * Math.PI / 180;
      s += `<line x1="${cx}" y1="${cy}" x2="${f1(cx + 44 * Math.cos(a))}" y2="${f1(cy + 44 * Math.sin(a))}"/>`;
    }
    return s;
  }
  function bikeGroup() {
    return `<g class="lg-w">
      <circle cx="214" cy="104" r="56" stroke-width="22"/>
      <circle cx="346" cy="104" r="56" stroke-width="22"/>
      <g stroke-width="4">${spokes(214, 104)}${spokes(346, 104)}</g>
      <g stroke-width="7"><path d="M214 104 H346 M214 104 L246 56 H330 L346 104 M246 56 L240 46 M228 44 L256 42 M330 56 L334 42 M322 40 L350 34"/></g>
      <circle class="hub" cx="214" cy="104" r="6"/><circle class="hub" cx="346" cy="104" r="6"/>
    </g>`;
  }
  function logo(label = 'Door Bina') {
    return `<svg class="logo" viewBox="0 0 530 400" role="img" aria-label="${label}">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g class="lg-l" stroke-width="24">
        <path d="M44 34 L40 164"/>
        <path d="M44 32 C116 26 142 66 138 102 C134 146 100 166 40 166"/>
        <path d="M438 34 L434 166"/>
        <path d="M440 34 C502 26 512 96 446 102"/>
        <path d="M452 102 L500 160"/>
        <path d="M58 230 L52 370"/>
        <path d="M60 230 C120 224 122 288 64 294"/>
        <path d="M64 294 C146 290 142 368 52 372"/>
        <path d="M196 228 L192 370"/>
        <path d="M252 370 L256 228 L330 368 L334 226"/>
        <path d="M384 370 L430 248 L476 370"/>
        <path d="M374 300 L390 324 L470 324 L486 300"/>
      </g>
      ${bikeGroup()}
      <circle class="lg-h" cx="430" cy="206" r="13" stroke-width="10"/>
    </g></svg>`;
  }
  function bikeSymbol() {
    return `<svg class="logo" viewBox="140 24 280 156" role="img" aria-label="Door Bina">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">${bikeGroup()}</g></svg>`;
  }
  function tanit(x, y, s) {
    return `<g class="st-tanit" transform="translate(${x} ${y}) scale(${s})">
      <circle cx="0" cy="-21" r="4.5"/><path d="M-14 22 L0 -10 L14 22 M-19 3 L-14 11 H14 L19 3"/></g>`;
  }

  /* ---------- Tampon ---------- */
  function stamp(lieu, t, locked) {
    const pid = 'arc' + lieu.id + Math.random().toString(36).slice(2, 7);
    if (locked) {
      return `<svg class="stamp locked" viewBox="0 0 120 120" role="img" aria-label="Tampon verrouillé : ${lieu.nom}">
        <circle class="st-o" cx="60" cy="60" r="56"/><circle class="st-i" cx="60" cy="60" r="47"/>
        <text class="st-q" x="60" y="70" text-anchor="middle">${ROMAINS[lieu.id - 1]}</text></svg>`;
    }
    return `<svg class="stamp" viewBox="0 0 120 120" role="img" aria-label="Tampon ${lieu.nom}, validé à ${heure(t)}">
      <defs><path id="${pid}" d="M20 60 A40 40 0 0 1 100 60"/></defs>
      <circle class="st-o" cx="60" cy="60" r="56"/><circle class="st-i" cx="60" cy="60" r="47"/>
      <text class="st-t"><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${lieu.court}</textPath></text>
      ${tanit(60, 60, 0.85)}
      <text class="st-h" x="60" y="94" text-anchor="middle">${heure(t)}</text></svg>`;
  }

  /* ---------- Petite ligne de parcours ---------- */
  function progressPath() {
    const W = 320, H = 70;
    const pts = LIEUX.map((_, i) => [16 + i * (W - 32) / (N - 1), H / 2 + Math.sin(i * 1.15) * 18]);
    const dots = pts.map((p, i) => {
      const e = etat(i);
      if (e === 'done') return `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="6.5" fill="var(--pourpre)"/>`;
      if (e === 'next') return `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="6.5" fill="var(--ivoire)" stroke="var(--pourpre)" stroke-width="3.5"/>`;
      return `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="5.5" fill="var(--ivoire)" stroke="var(--gris)" stroke-width="1.2" stroke-dasharray="2 2"/>`;
    }).join('');
    return `<svg class="progress" viewBox="0 0 ${W} ${H}" role="img" aria-label="${S.stamps.length} étapes validées sur ${N}">
      <path class="route" d="${smooth(pts)}"/>${dots}</svg>`;
  }

  /* ---------- Carte stylisée (hors connexion) ---------- */
  function projeter(l) {
    const kx = Math.cos(((MAP.minLat + MAP.maxLat) / 2) * Math.PI / 180);
    const size = Math.max((MAP.maxLng - MAP.minLng) * kx, MAP.maxLat - MAP.minLat);
    return [((l.lng - MAP.minLng) * kx / size) * 400, ((MAP.maxLat - l.lat) / size) * 400];
  }
  function carte() {
    const pts = LIEUX.map(projeter);
    const marks = LIEUX.map((l, i) => {
      const [x, y] = pts[i], e = etat(i);
      const gauche = i === 1 || i === 6; // évite les chevauchements d'étiquettes
      // Byrsa, cathédrale et musée sont à ~100 m : une seule étiquette pour les trois
      const etiquette = i === 1 ? 'Byrsa · Cathédrale · Musée' : (i === 2 || i === 3) ? '' : l.court;
      const circle = e === 'done'
        ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="11" fill="var(--pourpre)"/><text x="${f1(x)}" y="${f1(y)}" fill="var(--pierre)">${i + 1}</text>`
        : e === 'next'
          ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="11" fill="var(--ivoire)" stroke="var(--pourpre)" stroke-width="4"/><text x="${f1(x)}" y="${f1(y)}" fill="var(--pourpre)">${i + 1}</text>`
          : `<circle cx="${f1(x)}" cy="${f1(y)}" r="10" fill="var(--ivoire)" stroke="var(--gris)" stroke-width="1.5" stroke-dasharray="3 3"/><text x="${f1(x)}" y="${f1(y)}" fill="var(--gris)">${i + 1}</text>`;
      return `<g class="pt" data-action="scroll" data-target="lieu-${l.id}" tabindex="0" role="button" aria-label="Étape ${i + 1} : ${l.nom}">
        <title>${l.nom}</title>${circle}
        <text class="pt-label" x="${f1(gauche ? x - 16 : x + 16)}" y="${f1(y)}" style="text-anchor:${gauche ? 'end' : 'start'}">${etiquette}</text></g>`;
    }).join('');
    return `<svg class="map" viewBox="0 0 400 400" role="img" aria-label="Carte du parcours Door Bina à Carthage">
      <path class="sea" d="M150 400 C160 370 180 290 207 235 S230 140 235 118 S260 30 273 0 H400 V400 Z"/>
      <text class="sea-label" x="320" y="330" text-anchor="middle">Golfe de Tunis</text>
      <path class="route" d="${smooth(pts)}"/>
      ${marks}
      <g transform="translate(30 30)"><path d="M0 14 L0 -12 M-5 -6 L0 -14 L5 -6" stroke="var(--gris)" stroke-width="1.5" fill="none"/><text class="compass" x="0" y="28" text-anchor="middle">N</text></g>
    </svg>`;
  }

  /* ---------- Avatar cycliste (homme / femme) ---------- */
  function avatarSvg(g) {
    const femme = g === 'femme';
    const haut = femme ? '#CA823C' : '#1E5A87';
    const cheveux = femme
      ? '<path d="M37 7 C35.5 1.5 44 -0.5 46.2 4.6 C43.5 3.2 40.5 3.6 38 7.5 Z" fill="#3a2418"/><path d="M37.6 5 C31.5 4.6 30 10.5 32.4 15 C33.2 11.6 35.2 9.2 38 8.2 Z" fill="#3a2418"/>'
      : '<path d="M36.2 6.4 C35.8 1.4 45 -0.4 46.2 4.8 C43.4 3.4 40 3.6 36.2 6.4 Z" fill="#231F20"/>';
    return `<svg viewBox="0 0 64 58" class="avatar-svg" aria-hidden="true">
      <ellipse cx="32" cy="54" rx="24" ry="2.6" fill="rgba(35,31,32,.28)"/>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="14" cy="42" r="10" stroke="#231F20" stroke-width="3"/>
        <circle cx="50" cy="42" r="10" stroke="#231F20" stroke-width="3"/>
        <path d="M14 42 H30 L25 27 M30 42 L45 27 H25 M45 27 L50 42 M45 27 L46 21 L51 20 M21 25 H29" stroke="#611335" stroke-width="3"/>
        <path d="M26 24 L36 32 L30 42" stroke="#231F20" stroke-width="4"/>
        <path d="M26 24 L37 12" stroke="${haut}" stroke-width="7"/>
        <path d="M37 13 L47 20" stroke="${haut}" stroke-width="3.5"/>
      </g>
      <circle cx="41" cy="7" r="5" fill="#C98D63"/>${cheveux}</svg>`;
  }
  function choixAvatar(titre) {
    return `<div class="etape">
      <p class="label">Votre avatar</p>
      <h2>${titre || 'Qui roule ?'}</h2>
      <p>Choisissez le cycliste qui vous représentera sur la carte pendant le parcours.</p>
      <div class="avatar-pick">
        <button class="avatar-opt" data-action="avatar" data-v="homme">${avatarSvg('homme')}<span>Homme</span></button>
        <button class="avatar-opt" data-action="avatar" data-v="femme">${avatarSvg('femme')}<span>Femme</span></button>
      </div>
    </div>`;
  }

  /* ---------- Audioguide (MP3 ou voix de synthèse) ---------- */
  const Voix = { id: null, state: 'idle', chunks: [], i: 0, el: null, token: 0 };
  const TTS = 'speechSynthesis' in window;

  function audioDebloque(id) {
    if (id === PAUSE.id) return S.pauseFaite || S.stage === 'pause';
    const i = LIEUX.findIndex((x) => x.id === id);
    return i < S.stamps.length || (i === S.stamps.length && S.stage === 'lieu');
  }
  /* Langue de l'audioguide : celle choisie dans le lecteur, sinon celle de la réservation */
  const TRAD = window.DOORBINA_AUDIO || {};
  // tn = derja tunisienne (dialecte), lue par les voix tunisiennes
  const LANG_TTS = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-TN', tn: 'ar-TN' };
  const LANG_COURT = { fr: 'FR', en: 'EN', ar: 'عربي', tn: 'تونسي' };
  const LANG_HTML = { fr: 'fr', en: 'en', ar: 'ar', tn: 'ar-TN' };
  const arabe = (lg) => lg === 'ar' || lg === 'tn';
  // Les deux voix tunisiennes des versions arabes enregistrées
  const VOIX_AR = { h: 'هادي · homme', f: 'ريم · femme' };
  const genreVoix = () => (S.genreVoix === 'f' ? 'f' : 'h');
  function langueAudio() {
    const lg = S.langueAudio || (S.reservation && S.reservation.langue) || 'fr';
    return LANGUES[lg] ? lg : 'fr';
  }
  /** Nom et récit d'un lieu dans une langue (le français sert de secours).
      « lecture » : texte vocalisé destiné à la voix (arabe), différent du texte affiché. */
  function texte(x, lg = langueAudio()) {
    const t = TRAD[lg] && TRAD[lg][x.id];
    return t ? { nom: t.nom, recit: t.recit, lecture: t.lecture, lg } : { nom: x.nom, recit: x.recit, lg: 'fr' };
  }
  /** Fichier MP3 enregistré : indiqué dans le lieu, sinon audio/<langue>/<id>.mp3
      (voix de femme en arabe : audio/<langue>/<id>-f.mp3) */
  const MP3 = window.DOORBINA_MP3;
  const mp3Absents = new Set(); // fichiers introuvables : on passe à la voix du téléphone
  function fichierAudio(x, lg) {
    let f = null;
    if (x.audio && typeof x.audio === 'object') f = x.audio[lg] || null;
    else if (x.audio && lg === 'fr') f = x.audio;
    else if (MP3) f = `${MP3}/${lg}/${x.id}${arabe(lg) && genreVoix() === 'f' ? '-f' : ''}.mp3`;
    return f && !mp3Absents.has(f) ? f : null;
  }
  function dureeRecit(x) { return Math.max(1, Math.round(texte(x).recit.split(/\s+/).length / 150)); }
  function lecteur(x, compact) {
    const ecoute = S.ecoutes[x.id];
    const lg = langueAudio(), t = texte(x, lg);
    const dir = arabe(t.lg) ? ' dir="rtl"' : '';
    const mp3 = fichierAudio(x, lg);
    return `<div class="audio${compact ? ' compact' : ''}" data-id="${x.id}" data-state="idle">
      <button class="audio-btn" data-action="audio" data-id="${x.id}" aria-label="Écouter le récit : ${x.nom}">
        <svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        <svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
      </button>
      <div class="audio-meta">
        <strong>${compact ? x.nom : 'Écouter le lieu'}${ecoute ? ' <span class="ok">✓</span>' : ''}</strong>
        <span class="audio-status">≈ ${dureeRecit(x)} min · ${LANGUES[lg]}</span>
        <div class="audio-bar"><i></i></div>
      </div>
      <button class="audio-stop" data-action="audio-stop" aria-label="Arrêter l’audio"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10H7z"/></svg></button>
    </div>
    <div class="audio-opts">
      <div class="audio-langs" role="group" aria-label="Langue de l’audio">
        ${Object.keys(LANGUES).map((k) => `<button type="button" class="${k === lg ? 'on' : ''}" data-action="audio-lang" data-lg="${k}" aria-pressed="${k === lg}" lang="${LANG_HTML[k]}">${LANG_COURT[k]}</button>`).join('')}
      </div>
      ${mp3 && arabe(lg) ? `<div class="audio-langs audio-genre" role="group" aria-label="Voix">
        ${Object.keys(VOIX_AR).map((g) => `<button type="button" class="${g === genreVoix() ? 'on' : ''}" data-action="audio-genre" data-g="${g}" aria-pressed="${g === genreVoix()}">${VOIX_AR[g]}</button>`).join('')}
      </div>` : ''}
      ${mp3 ? '' : TTS && !compact ? `<label class="audio-voix-l">Voix <select class="audio-voix" data-lg="${lg}" aria-label="Choisir la voix"></select></label>` : ''}
    </div>
    <p class="audio-msg" hidden></p>
    ${compact ? '' : `<details class="transcript"${TTS || x.audio ? '' : ' open'}>
      <summary>Lire le texte</summary>
      <p lang="${LANG_HTML[t.lg]}"${dir}>${t.recit}</p>
      ${ecoute ? '' : `<button class="btn-link" data-action="lu" data-id="${x.id}">J’ai lu le texte en entier</button>`}
    </details>`}`;
  }
  /* ---------- Voix de synthèse ----------
     Le téléphone fournit les voix. On prend la plus naturelle pour la langue,
     ou celle que le visiteur a choisie dans le menu « Voix ». */
  function voixDe(lg) {
    if (!TTS) return [];
    const pref = { fr: /^fr/i, en: /^en/i, ar: /^ar/i, tn: /^ar/i }[lg];
    return speechSynthesis.getVoices().filter((v) => pref.test(v.lang));
  }
  function noteVoix(v, lg) {
    let n = 0;
    if (/natural|neural|online|premium|enhanced|wavenet/i.test(v.name)) n += 4; // voix « naturelles », plus claires
    if (/google/i.test(v.name)) n += 2;
    if (v.lang.replace('_', '-').toLowerCase() === LANG_TTS[lg].toLowerCase()) n += 1;
    if (lg === 'en' && /en-US/i.test(v.lang)) n += 0.5;
    if (arabe(lg) && /ar-TN/i.test(v.lang)) n += 1.5; // accent tunisien en priorité
    else if (arabe(lg) && /ar-(SA|EG)/i.test(v.lang)) n += 0.5;
    if (v.localService) n += 0.2;
    return n;
  }
  function voixPour(lg) {
    const liste = voixDe(lg);
    if (!liste.length) return null;
    const choisie = S.voix && S.voix[lg] && liste.find((v) => v.voiceURI === S.voix[lg]);
    return choisie || liste.slice().sort((a, b) => noteVoix(b, lg) - noteVoix(a, lg))[0];
  }
  /** Remplit les menus « Voix » avec les voix de la langue choisie */
  function remplirVoix() {
    document.querySelectorAll('.audio-voix').forEach((sel) => {
      const lg = sel.dataset.lg, liste = voixDe(lg), cur = voixPour(lg);
      sel.innerHTML = liste.length
        ? liste.slice().sort((a, b) => noteVoix(b, lg) - noteVoix(a, lg))
          .map((v) => `<option value="${esc(v.voiceURI)}"${cur && v.voiceURI === cur.voiceURI ? ' selected' : ''}>${esc(v.name.replace(/^Microsoft |^Google /, '').replace(/ Online \(Natural\)/, '').replace(/ Multilingual/, ''))}</option>`).join('')
        : '<option value="">Aucune voix sur cet appareil</option>';
      sel.disabled = !liste.length;
    });
  }
  function audioProgres() {
    if (Voix.el && Voix.el.duration) return Voix.el.currentTime / Voix.el.duration;
    return Voix.chunks.length ? Voix.i / Voix.chunks.length : 0;
  }
  function syncAudioUI() {
    document.querySelectorAll('.audio[data-id]').forEach((box) => {
      const actif = +box.dataset.id === Voix.id;
      const st = actif ? Voix.state : 'idle';
      box.dataset.state = st;
      const x = trouver(+box.dataset.id);
      const s = box.querySelector('.audio-status');
      if (s) s.textContent = st === 'playing' ? 'Lecture en cours…' : st === 'paused' ? 'En pause' : `≈ ${dureeRecit(x)} min · ${LANGUES[langueAudio()]}`;
      const bar = box.querySelector('.audio-bar i');
      if (bar) bar.style.width = actif ? Math.round(audioProgres() * 100) + '%' : (S.ecoutes[x.id] ? '100%' : '0%');
    });
  }
  function audioStop() {
    Voix.token++;
    if (Voix.el) { Voix.el.pause(); Voix.el = null; }
    if (TTS) speechSynthesis.cancel();
    Object.assign(Voix, { id: null, state: 'idle', chunks: [], i: 0 });
    syncAudioUI();
  }
  function audioFini(id) {
    Object.assign(Voix, { id: null, state: 'idle', chunks: [], i: 0, el: null });
    marquerEcoute(id);
  }
  function marquerEcoute(id) {
    const neuve = !S.ecoutes[id];
    S.ecoutes[id] = true;
    save();
    if (neuve && route() === 'jeu' && S.stage === 'lieu') render(); // débloque la question
    else syncAudioUI();
  }
  /** Message sous le lecteur (ex. : pas de voix arabe sur ce téléphone) */
  function messageAudio(id, html) {
    document.querySelectorAll(`.audio[data-id="${id}"]`).forEach((box) => {
      // ordre dans le lecteur : .audio, .audio-opts, .audio-msg, .transcript
      const m = box.nextElementSibling && box.nextElementSibling.nextElementSibling;
      if (!m || !m.classList.contains('audio-msg')) return;
      m.innerHTML = html;
      m.hidden = !html;
      const tr = m.nextElementSibling;
      if (tr && tr.classList.contains('transcript') && html) tr.open = true;
    });
  }
  function parler(x) {
    if (!TTS) { alert('La lecture audio n’est pas disponible sur ce navigateur : touchez « Lire le texte ».'); audioStop(); return; }
    const lg = langueAudio(), t = texte(x, lg);
    const voix = voixPour(t.lg);
    // Sans voix de cette langue, le téléphone lirait le texte avec un accent faux : on l'explique plutôt
    if (!voix && speechSynthesis.getVoices().length) {
      const id = x.id;
      audioStop();
      messageAudio(id, `Aucune voix ${{ fr: 'française', en: 'anglaise', ar: 'arabe', tn: 'arabe' }[t.lg]} n’est installée sur ce téléphone. Lisez le texte ci-dessous, ou ajoutez la voix dans les réglages du téléphone (Synthèse vocale).`);
      return;
    }
    messageAudio(x.id, '');
    const tok = ++Voix.token;
    const aLire = t.lecture || `${t.nom}. ${t.recit}`; // texte vocalisé s'il existe : meilleure prononciation
    Voix.chunks = aLire.match(/[^.!?…؟]+[.!?…؟]+|[^.!?…؟]+$/g) || [aLire];
    Voix.i = 0; Voix.state = 'playing';
    const suivant = () => {
      if (tok !== Voix.token) return;
      if (Voix.i >= Voix.chunks.length) { audioFini(x.id); return; }
      const u = new SpeechSynthesisUtterance(Voix.chunks[Voix.i].trim());
      u.lang = voix ? voix.lang : LANG_TTS[t.lg];
      u.rate = t.lg === 'ar' ? 0.88 : 0.92; // un peu plus lent : plus clair dehors, avec le vent
      u.pitch = 1;
      if (voix) u.voice = voix;
      u.onend = () => { if (tok !== Voix.token) return; Voix.i++; syncAudioUI(); suivant(); };
      speechSynthesis.speak(u);
    };
    suivant();
    syncAudioUI();
  }
  function audioToggle(id) {
    const x = trouver(id);
    if (Voix.id === id && Voix.state === 'playing') {
      if (Voix.el) Voix.el.pause(); else speechSynthesis.pause();
      Voix.state = 'paused'; syncAudioUI(); return;
    }
    if (Voix.id === id && Voix.state === 'paused') {
      if (Voix.el) Voix.el.play(); else speechSynthesis.resume();
      Voix.state = 'playing'; syncAudioUI(); return;
    }
    audioStop();
    Voix.id = id;
    const mp3 = fichierAudio(x, langueAudio());
    if (mp3) {
      const a = new Audio(mp3);
      Voix.el = a; Voix.state = 'playing';
      a.ontimeupdate = syncAudioUI;
      a.onended = () => audioFini(id);
      // Fichier introuvable ou illisible : la voix du téléphone prend le relais
      const secours = () => { if (Voix.el !== a) return; mp3Absents.add(mp3); Voix.el = null; parler(x); };
      a.onerror = secours;
      a.play().catch((e) => { if (e && e.name === 'NotAllowedError') { Voix.el = null; Voix.state = 'idle'; syncAudioUI(); } else secours(); });
      syncAudioUI();
      return;
    }
    parler(x);
  }
  if (TTS) {
    speechSynthesis.getVoices();
    // Les voix arrivent parfois après le chargement de la page
    speechSynthesis.addEventListener('voiceschanged', remplirVoix);
  }

  /* ---------- Carte en direct (Leaflet + GPS) ---------- */
  const Live = { map: null, watch: null, me: null, acc: null, line: null, pos: null,
    follow: true, centered: false, demo: false, raf: null, status: '', far: false, vibre: false };

  function stopLive() {
    if (Live.watch != null && navigator.geolocation) navigator.geolocation.clearWatch(Live.watch);
    if (Live.raf) cancelAnimationFrame(Live.raf);
    if (Live.map) Live.map.remove();
    Object.assign(Live, { map: null, watch: null, me: null, acc: null, line: null, raf: null, centered: false, follow: true });
  }
  function iconeLieu(i) {
    const e = etat(i);
    return window.L.divIcon({ className: 'mk', html: `<span class="lm ${e}">${e === 'done' ? '✓' : i + 1}</span>`, iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14] });
  }
  function popupLieu(l, i) {
    const e = etat(i);
    return `<div class="pop">
      ${photo(l.id, 'pop-photo')}
      <p class="label">Étape ${i + 1} sur ${N}${e === 'done' ? ' · validée' : e === 'next' ? ' · prochaine' : ' · verrouillée'}</p>
      <h3>${l.nom}</h3>
      <p class="muted">${l.epoque} · ${l.theme}</p>
      <p>${puceStatut(l)}</p>
      <p class="muted">Créneau conseillé : ${creneau(l)}</p>
      ${audioDebloque(l.id) ? lecteur(l, true) : '<p class="note">L’audio s’ouvre en arrivant sur place.</p>'}
      <p style="margin-top:8px"><a href="#/lieu/${l.id}">Le lieu à travers le temps →</a></p>
    </div>`;
  }
  function initLiveMap() {
    const el = $('#live-map');
    if (!el) return;
    stopLive();
    if (!window.L) {
      el.classList.add('fallback');
      el.innerHTML = carte();
      Live.status = 'Carte détaillée indisponible hors connexion.';
      majPanneau();
      return;
    }
    const map = window.L.map(el, { zoomControl: true, scrollWheelZoom: false }).setView([CARTHAGE.lat, CARTHAGE.lng], 14);
    // Fond de carte : OpenStreetMap quand le site est hébergé (http/https) ;
    // Esri quand l'app est ouverte en fichier local (OpenStreetMap et CARTO la bloquent).
    const local = location.protocol === 'file:';
    window.L.tileLayer(local
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: local ? 'Tiles &copy; Esri' : '&copy; contributeurs OpenStreetMap'
    }).addTo(map);
    const pts = LIEUX.map((l) => [l.lat, l.lng]);
    const done = S.stamps.length;
    if (done > 0) window.L.polyline(pts.slice(0, done + 1), { color: '#611335', weight: 4 }).addTo(map);
    window.L.polyline(pts.slice(Math.max(0, done)), { color: '#5E5550', weight: 3, dashArray: '2 9', lineCap: 'round' }).addTo(map);
    LIEUX.forEach((l, i) => {
      window.L.marker([l.lat, l.lng], { icon: iconeLieu(i), title: l.nom, keyboard: true })
        .addTo(map)
        .bindPopup(() => popupLieu(l, i), { maxWidth: 280 })
        .on('popupopen', syncAudioUI);
    });
    window.L.marker([RETOUR.lat, RETOUR.lng], {
      icon: window.L.divIcon({ className: 'mk', html: '<span class="lm retour">🏁</span>', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14] }),
      title: RETOUR.nom
    }).addTo(map).bindPopup(`<div class="pop"><p class="label">Arrivée</p><h3>${RETOUR.nom}</h3><p>${RETOUR.texte}</p></div>`);
    map.fitBounds(retourActif() ? pts.concat([[RETOUR.lat, RETOUR.lng]]) : pts, { padding: [30, 30] });
    map.on('dragstart', () => { Live.follow = false; });
    Live.map = map;
    if (Live.pos) placerAvatar(Live.pos.lat, Live.pos.lng, Live.pos.acc);
    if (!Live.demo) suivreGPS();
    majPanneau();
  }
  function suivreGPS() {
    if (!navigator.geolocation) { Live.status = 'La géolocalisation n’est pas disponible sur cet appareil.'; majPanneau(); return; }
    Live.status = 'Recherche de votre position…';
    Live.watch = navigator.geolocation.watchPosition(
      (p) => { if (!Live.demo) placerAvatar(p.coords.latitude, p.coords.longitude, p.coords.accuracy); },
      (err) => {
        Live.status = err.code === 1
          ? 'Vous avez refusé la localisation. Autorisez-la dans votre navigateur pour vous voir sur la carte.'
          : 'Position introuvable pour le moment.';
        majPanneau();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  }
  function placerAvatar(lat, lng, acc) {
    const prev = Live.pos;
    Live.pos = { lat, lng, acc };
    Live.far = distance(Live.pos, CARTHAGE) > 6000;
    const map = Live.map;
    if (map && window.L) {
      const ouest = prev && lng < prev.lng - 0.00001;
      const est = prev && lng > prev.lng + 0.00001;
      if (!Live.me) {
        Live.me = window.L.marker([lat, lng], {
          icon: window.L.divIcon({ className: 'mk', html: `<div class="avatar-mk"><span class="pulse"></span>${avatarSvg(S.avatar || 'homme')}</div>`, iconSize: [64, 58], iconAnchor: [32, 54] }),
          zIndexOffset: 1000, title: 'Vous êtes ici'
        }).addTo(map);
      } else Live.me.setLatLng([lat, lng]);
      const node = Live.me.getElement() && Live.me.getElement().querySelector('.avatar-mk');
      if (node && (ouest || est)) node.classList.toggle('ouest', !!ouest);
      if (acc && acc < 500) {
        if (!Live.acc) Live.acc = window.L.circle([lat, lng], { radius: acc, color: '#1E5A87', weight: 1, fillOpacity: 0.08 }).addTo(map);
        else Live.acc.setLatLng([lat, lng]).setRadius(acc);
      }
      const next = cible();
      if (next) {
        const pts = [[lat, lng], [next.lat, next.lng]];
        if (!Live.line) Live.line = window.L.polyline(pts, { color: '#CA823C', weight: 4, dashArray: '6 8' }).addTo(map);
        else Live.line.setLatLngs(pts);
      }
      if (!Live.far && (Live.follow || !Live.centered)) {
        if (!Live.centered) map.setView([lat, lng], 16); else map.panTo([lat, lng], { animate: !Live.demo });
        Live.centered = true;
      }
    }
    majPanneau();
    majRail();
  }
  function majPanneau() {
    const p = $('#map-panel');
    if (!p) return;
    const i = S.stamps.length, next = cible();
    const retour = next === RETOUR;
    let h = '<div class="panel-row">';
    if (S.avatar) h += `<div class="panel-avatar">${avatarSvg(S.avatar)}</div>`;
    h += '<div>';
    if (Live.pos) {
      let proche = null;
      LIEUX.forEach((l) => { const d = distance(Live.pos, l); if (!proche || d < proche.d) proche = { l, d }; });
      h += `<p class="label">Vous êtes ici${Live.demo ? ' · mode démo' : ''}</p>`;
      h += Live.far
        ? '<p>Vous semblez loin de Carthage.</p>'
        : `<p>${proche.d <= RAYON_VALIDATION ? `Vous êtes à <strong>${proche.l.nom}</strong>.` : `À ${fmtDist(proche.d)} de ${proche.l.nom}.`}</p>`;
    } else {
      h += `<p class="label">Votre position</p><p>${Live.status || 'Recherche de votre position…'}</p>`;
    }
    h += '</div></div>';

    if (next) {
      const d = Live.pos ? distance(Live.pos, next) : null;
      h += `<div class="panel-next">
        <p class="label">${retour ? 'Fin du parcours · retour des vélos' : `Prochaine étape · ${i + 1} sur ${N}`}</p>
        <h3>${next.nom}</h3>
        ${retour ? '<p class="muted">Montrez votre QR de score à l’équipe Door Bina.</p>'
          : `<p>${puceStatut(next)} <span class="muted">· ${creneau(next)}</span></p>`}
        ${d != null && !Live.far ? `<p><strong>${fmtDist(d)}</strong> · ≈ ${minutesVelo(d)} min à vélo</p>` : ''}
        <a class="btn btn-block" target="_blank" rel="noopener"
          href="https://www.google.com/maps/dir/?api=1${Live.pos && !Live.far && !Live.demo ? `&origin=${Live.pos.lat},${Live.pos.lng}` : ''}&destination=${next.lat},${next.lng}&travelmode=bicycling">Itinéraire</a>
      </div>`;
      const enJeu = S.reservation && !retour && (S.stage === 'start' || S.stage === 'route');
      if (d != null && d <= RAYON_VALIDATION && enJeu) {
        h += `<div class="panel-arrive" role="status">
              <p><strong>Vous êtes arrivé !</strong> L’audio du lieu démarre dès que vous ouvrez l’étape.</p>
              <button class="btn btn-ocre" data-action="force">Ouvrir l’étape ${next.court}</button></div>`;
        if (!Live.vibre && navigator.vibrate) { navigator.vibrate([150, 80, 150]); Live.vibre = true; }
      } else Live.vibre = false;
    } else {
      h += '<div class="panel-next"><p class="label">Parcours terminé</p><h3>Bravo, explorateurs !</h3></div>';
    }
    h += `<div class="panel-actions">
      <button class="btn-link" data-action="center">Centrer sur moi</button>
      ${next ? '<button class="btn-link" data-action="demo">Simuler le trajet (démo)</button>' : ''}
      <button class="btn-link" data-action="avatar-reset">Changer d’avatar</button>
    </div>`;
    p.innerHTML = h;
  }
  function demoTrajet() {
    const i = S.stamps.length, next = cible();
    if (!next) return;
    if (Live.watch != null && navigator.geolocation) { navigator.geolocation.clearWatch(Live.watch); Live.watch = null; }
    Live.demo = true; Live.follow = true; Live.centered = true;
    const from = i > 0 ? LIEUX[i - 1] : { lat: LIEUX[0].lat - 0.004, lng: LIEUX[0].lng - 0.003 };
    if (next === RETOUR) Live.follow = false; // trajet long : on garde la vue d'ensemble
    const t0 = performance.now(), D = 9000;
    if (Live.raf) cancelAnimationFrame(Live.raf);
    if (Live.map) Live.map.setView([from.lat, from.lng], 16);
    const step = (t) => {
      const k = Math.min(1, (t - t0) / D);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const wob = Math.sin(k * Math.PI * 3) * 0.00025 * (1 - k);
      placerAvatar(from.lat + (next.lat - from.lat) * e + wob, from.lng + (next.lng - from.lng) * e, 12);
      if (k < 1) Live.raf = requestAnimationFrame(step); else Live.raf = null;
    };
    Live.raf = requestAnimationFrame(step);
  }
  /* ---------- Rail de progression (à droite de l'écran) ----------
     Comme le menu d'étapes d'un site à défilement : chaque arrêt est un point,
     et l'avatar du visiteur glisse le long du rail selon sa position GPS. */
  const Rail = { el: null, cle: '' };
  function arrets() {
    const a = [{ type: 'depart', nom: 'Départ · agence Door Bina', court: 'Départ', lat: RETOUR.lat, lng: RETOUR.lng }];
    LIEUX.forEach((l, i) => {
      a.push(Object.assign({ type: 'lieu', i }, l));
      if (l.pause) a.push({ type: 'pause', nom: PAUSE.nom, court: PAUSE.court, lat: l.lat, lng: l.lng });
    });
    a.push({ type: 'retour', nom: RETOUR.nom, court: 'Retour des vélos', lat: RETOUR.lat, lng: RETOUR.lng });
    return a;
  }
  function positionRail(A) {
    const done = S.stamps.length;
    const iLieu = (k) => A.findIndex((a) => a.type === 'lieu' && a.i === k);
    if (S.stage === 'pause') return { pos: A.findIndex((a) => a.type === 'pause'), ici: 'Pause thé' };
    if (S.stage === 'lieu' && done < N) return { pos: iLieu(done), ici: `À ${LIEUX[done].court}` };
    if (S.stage === 'stamp' && done > 0) return { pos: iLieu(done - 1), ici: `À ${LIEUX[done - 1].court}` };
    const next = cible();
    if (!next) return { pos: iLieu(N - 1), ici: `À ${LIEUX[N - 1].court}` };
    if (!S.reservation && done === 0) return { pos: 0, ici: 'Au départ' };
    const to = next === RETOUR ? A.length - 1 : iLieu(done), from = to - 1;
    let f = 0, d = null;
    if (Live.pos && !Live.far) {
      d = distance(Live.pos, A[to]);
      const tot = distance(A[from], A[to]);
      f = tot > 1 ? Math.min(0.95, Math.max(0, 1 - d / tot)) : 0;
    }
    return { pos: from + f, ici: `Vers ${next === RETOUR ? 'le retour' : next.court}${d != null ? ` · ${fmtDist(d)}` : ''}` };
  }
  function majRail() {
    if (!Rail.el) {
      Rail.el = document.createElement('nav');
      Rail.el.className = 'rail';
      Rail.el.setAttribute('aria-label', 'Votre progression sur le parcours');
      document.body.appendChild(Rail.el);
    }
    const r = route();
    const visible = r === 'carte' || r === 'jeu' || (!!S.reservation && r !== 'equipe');
    document.body.classList.toggle('has-rail', visible);
    Rail.el.hidden = !visible;
    if (!visible) return;
    const A = arrets(), P = positionRail(A), n = A.length - 1;
    const top = (k) => `${f1((k / n) * 100)}%`;
    const etatArret = (k) => (k === P.pos ? 'ici' : k < P.pos ? 'done' : k === Math.ceil(P.pos) ? 'next' : 'locked');
    const cle = A.map((_, k) => etatArret(k)).join() + (S.avatar || '');
    if (cle !== Rail.cle) {
      Rail.cle = cle;
      Rail.el.innerHTML = `<span class="rail-track"><span class="rail-fill"></span></span>
        ${A.map((a, k) => {
          const e = etatArret(k);
          const href = a.type === 'lieu' ? `#/lieu/${a.id}` : '#/carte';
          const num = a.type === 'lieu' ? `${a.i + 1}. ` : '';
          const txt = { done: 'passé', ici: 'vous êtes ici', next: 'prochain arrêt', locked: 'à venir' }[e];
          return `<a class="rail-stop ${e} rs-${a.type}" href="${href}" style="top:${top(k)}" aria-label="${num}${a.nom} (${txt})"><span class="rail-label">${num}${a.court}</span></a>`;
        }).join('')}
        <div class="rail-me" aria-hidden="true"><span class="rail-bulle"></span>${avatarSvg(S.avatar || 'homme')}</div>`;
    }
    Rail.el.querySelector('.rail-fill').style.height = top(P.pos);
    const me = Rail.el.querySelector('.rail-me');
    me.style.top = top(P.pos);
    me.querySelector('.rail-bulle').textContent = P.ici;
  }

  function blocCarte() {
    return `<div class="map-shell">
      <div id="live-map" class="live-map" aria-label="Carte en direct"></div>
      <div id="map-panel" class="map-panel" aria-live="polite"></div>
    </div>`;
  }

  /* ================= VUES ================= */

  function vueAccueil() {
    return `
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <p class="label">Carthage à vélo</p>
          <h1>Faisons le tour ensemble</h1>
          <p class="lead">Un jeu de piste à vélo, sans guide, à travers huit lieux. L’histoire se découvre en pédalant.</p>
          <a class="btn btn-ocre" href="#/reserver">Réserver un vélo</a>
          <a class="btn btn-outline" href="voyage.html">Le voyage en 3D</a>
          <hr class="rule">
          <p class="ar" lang="ar" dir="rtl">دوربينا</p>
        </div>
        <div class="hero-logo">${logo()}</div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="label">Le constat</p>
        <h2>Carthage est riche, mais difficile à lire</h2>
        <p class="lead">Des monuments sans leur époque, des lieux dispersés, peu de médiation. Door Bina relie huit lieux en un parcours cohérent, que chacun comprend et vit à son rythme.</p>
        <div class="grid3">
          <div class="card"><h3>Héritage</h3><p>Huit lieux, huit époques : de la cité punique de Byrsa au cimetière américain.</p></div>
          <div class="card"><h3>Liberté</h3><p>Un parcours sans guide : la carte vous suit et l’audio raconte chaque lieu.</p></div>
          <div class="card"><h3>Ensemble</h3><p>Bina veut dire « avec nous » : familles, amis et équipes roulent et jouent ensemble.</p></div>
        </div>
      </div>
    </section>

    <section class="section tight">
      <div class="wrap">
        <p class="label">Le parcours</p>
        <h2>Huit lieux, huit époques</h2>
        <div class="galerie">${LIEUX.map((l, i) => `
          <a class="galerie-item" href="#/lieu/${l.id}">
            <img src="${PHOTOS[l.id] ? PHOTOS[l.id].src : ''}" alt="${l.nom}" loading="lazy">
            <span><b>${ROMAINS[i]}</b> ${l.nom}<small>${l.epoque}</small></span>
          </a>`).join('')}</div>
        <p class="note">Photos : Wikimedia Commons, crédits sur la page de chaque lieu.</p>
      </div>
    </section>

    <section class="section alt">
      <div class="wrap">
        <p class="label">Comment ça marche</p>
        <h2>Quatre gestes pour partir</h2>
        <div class="step-list four">
          <div><span class="roman">I</span><h3>Réserver</h3><p>Date, heure, nombre de personnes et langue. Vous recevez un QR code.</p></div>
          <div><span class="roman">II</span><h3>Retirer</h3><p>À Tunis, scannez le QR code pour débloquer le vélo et fixez le téléphone sur son support.</p></div>
          <div><span class="roman">III</span><h3>Rouler</h3><p>La carte vous suit. À l’arrivée, un audio raconte l’histoire du lieu.</p></div>
          <div><span class="roman">IV</span><h3>Jouer</h3><p>Répondez au défi, trouvez l’indice caché, gagnez le tampon. Huit indices ouvrent le code de Carthage.</p></div>
        </div>
        <p style="margin-top:28px"><a class="btn btn-outline" href="#/parcours">Voir le parcours</a></p>
      </div>
    </section>`;
  }

  function vueParcours() {
    const km = LIEUX.reduce((s, l) => s + (l.versSuivant ? l.versSuivant.km : 0), 0);
    const mn = LIEUX.reduce((s, l) => s + (l.versSuivant ? l.versSuivant.min : 0), 0);
    let items = '';
    LIEUX.forEach((l, i) => {
      const e = etat(i);
      const chip = e === 'done' ? '<span class="chip done">Validé</span>' : (e === 'next' && S.reservation) ? '<span class="chip next">Prochaine</span>' : '';
      items += `<li class="lieu ${e}" id="lieu-${l.id}">
        <span class="roman">${ROMAINS[i]}</span>
        ${photo(l.id, 'mini')}
        <p class="label">${creneau(l)}${chip}</p>
        <h3>${l.nom}</h3>
        <p class="muted">${l.epoque} · ${l.theme}</p>
        <p class="horaires">${puceStatut(l)} <span>${l.horaires.texte}</span></p>
        <p><a href="#/lieu/${l.id}">Le lieu à travers le temps →</a></p>
        ${audioDebloque(l.id) ? `<div class="lieu-audio">${lecteur(l, true)}</div>` : ''}
      </li>`;
      if (l.pause) {
        items += `<li class="trajet pause-row"><span>☕</span> <strong>Pause thé</strong> · ${creneau(PAUSE)} · face à la mer, avec une courte histoire</li>`;
      }
      if (l.versSuivant) {
        items += `<li class="trajet"><span aria-hidden="true">🚲</span> ${virgule(l.versSuivant.km)} km · ${l.versSuivant.min} min jusqu’à ${LIEUX[i + 1].court}</li>`;
      }
    });
    return `
    <div class="wrap page-head">
      <p class="label">Le parcours</p>
      <h1>Huit lieux, huit époques</h1>
      <p>Du sud au nord, de la mer à la mémoire : un parcours que chacun vit à son rythme. Horaires calculés pour un départ à ${fmtMin(departMin())}.</p>
      <div class="stats">
        <div><strong>≈ ${virgule(f1(km))} km</strong><span>de vélo, du sud au nord</span></div>
        <div><strong>≈ ${mn} min</strong><span>de roulage</span></div>
        <div><strong>${N} tampons</strong><span>pour un seul code final</span></div>
      </div>
    </div>
    <section class="section tight">
      <div class="wrap parcours-grid">
        <div class="map-wrap">${carte()}<p class="note" style="padding:0 14px 12px">Schéma du parcours. La carte GPS détaillée est dans l’onglet <a href="#/carte">Carte</a>.</p></div>
        <ol class="lieux">${items}</ol>
      </div>
    </section>
    <section class="section alt">
      <div class="wrap">
        <p class="label">Le calendrier</p>
        <h2>Trois variantes</h2>
        <div class="grid3">
          <div class="card"><h3>Lundi</h3><p>Dar El Hout est fermé : le parcours commence à Byrsa, l’indice H vous est offert.</p></div>
          <div class="card"><h3>Week-end</h3><p>Beït al-Hikma est fermé : l’indice est placé à l’entrée.</p></div>
          <div class="card"><h3>Hiver</h3><p>Le théâtre ferme à 17 h : départ conseillé avant 10 h.</p></div>
        </div>
        <p class="note">Distances estimées à vélo et horaires relevés en ligne : à confirmer avant le lancement.</p>
      </div>
    </section>`;
  }

  function vueLieu(id) {
    const i = LIEUX.findIndex((x) => x.id === +id);
    if (i < 0) return vueParcours();
    const l = LIEUX[i];
    return `
    <div class="wrap page-head">
      <p class="label">Devant le lieu · Étape ${i + 1} sur ${N}</p>
      <h1>${l.nom}</h1>
      <p class="muted">${l.epoque} · ${l.theme}</p>
      <p class="horaires">${puceStatut(l)} <span>${l.horaires.texte}</span></p>
    </div>
    <section class="section tight"><div class="wrap game">
      <div class="etape">
        ${photo(l.id, 'large')}
        <p class="label">Le lieu à travers le temps</p>
        ${frise(l)}
        <div class="bloc"><p class="label">En bref</p><p>${l.fiche}</p></div>
        <div class="bloc">
          <p class="label">L’audioguide</p>
          ${audioDebloque(l.id) ? lecteur(l) : `<p>L’audio s’ouvre quand le GPS confirme votre présence, dans le jeu.</p><a class="btn" href="#/jeu">Aller au jeu</a>`}
        </div>
      </div>
      <p class="note"><a href="#/parcours">← Tout le parcours</a></p>
    </div></section>`;
  }

  function frise(l) {
    return `<ol class="frise">${l.frise.map(([d, t]) => `<li><span class="frise-date">${d}</span><span>${t}</span></li>`).join('')}</ol>`;
  }

  function prix(f) {
    return (+f.adultes || 0) * (TARIFS[f.velo] || 0) + (+f.enfants || 0) * TARIFS.enfant + (+f.petits || 0) * TARIFS.siege;
  }
  function estHiver(d) { const m = new Date(d + 'T12:00:00').getMonth(); return m === 10 || m === 11 || m <= 1; }

  function programme() {
    const rows = [];
    LIEUX.forEach((l, i) => {
      rows.push(`<li><span>${creneau(l)}</span><span>${i + 1}. ${l.nom}</span></li>`);
      if (l.pause) rows.push(`<li class="pause-row"><span>${creneau(PAUSE)}</span><span>Pause thé</span></li>`);
    });
    return `<ol class="programme">${rows.join('')}</ol>`;
  }

  function vueReserver() {
    const r = S.reservation;
    if (r) {
      const details = r.fromCode ? '' : `
        <ul class="recap">
          <li><span>Date</span><strong>${dateCourte(r.date)} · ${r.heure}</strong></li>
          <li><span>Groupe</span><strong>${r.adultes} adulte${r.adultes > 1 ? 's' : ''}${r.enfants ? ` · ${r.enfants} enfant${r.enfants > 1 ? 's' : ''}` : ''}${r.petits ? ` · ${r.petits} siège${r.petits > 1 ? 's' : ''}` : ''}</strong></li>
          <li><span>Vélos</span><strong>${VELOS[r.velo]}</strong></li>
          <li><span>Formule</span><strong>${FORMULES[r.formule]}</strong></li>
          <li><span>Langue</span><strong>${LANGUES[r.langue]}</strong></li>
          <li><span>Total</span><strong>${r.total} DT</strong></li>
        </ul>`;
      return `
      <div class="wrap page-head"><p class="label">Réserver</p><h1>C’est réservé</h1></div>
      <section class="section tight"><div class="wrap resa-layout">
        <div class="card pourpre">
          <p class="label">Votre QR code</p>
          <div class="qr-box"><div id="qr" data-code="${r.code}"></div></div>
          <span class="code">${r.code}</span>
          <p>${r.nom ? `Merci ${r.nom}. ` : ''}À Tunis, scannez ce QR code au point de départ pour débloquer vos vélos, puis fixez le téléphone sur son support.</p>
          ${r.langue && r.langue !== 'fr' ? `<p class="muted" style="color:rgba(246,236,209,.8)">Audioguide : ${LANGUES[r.langue]}. Vous pourrez changer de langue et de voix dans le lecteur.</p>` : ''}
          ${details}
          <a class="btn btn-ocre" href="#/jeu">Commencer le jeu</a>
        </div>
        <aside class="card">
          <h3>Votre programme</h3>
          ${programme()}
          <p><button class="btn-link" data-action="cancel-resa">Annuler la réservation</button></p>
        </aside>
      </div></section>`;
    }

    const today = new Date().toISOString().slice(0, 10);
    const heures = [];
    for (let h = 8; h <= 12; h++) { heures.push(`${pad(h)}:00`); if (h < 12) heures.push(`${pad(h)}:30`); }
    const num = (max, sel, min = 0) => Array.from({ length: max - min + 1 }, (_, k) => k + min)
      .map((n) => `<option ${n === sel ? 'selected' : ''}>${n}</option>`).join('');
    const radios = (name, obj, def, extra = {}) => Object.keys(obj).map((k) => `
      <input type="radio" id="${name}-${k}" name="${name}" value="${k}" ${k === def ? 'checked' : ''}>
      <label class="opt" for="${name}-${k}">${obj[k]}${extra[k] ? `<small>${extra[k]}</small>` : ''}</label>`).join('');

    return `
    <div class="wrap page-head">
      <p class="label">Réserver</p>
      <h1>Réserver un vélo</h1>
      <p>Depuis chez vous, avant de venir. Vos vélos vous attendent à Tunis, avec un support pour le téléphone.</p>
    </div>
    <section class="section tight"><div class="wrap">
      <form id="resa-form" class="resa-layout" novalidate>
        <div class="form-grid">
          <div class="field"><label for="f-date">Date</label><input id="f-date" name="date" type="date" min="${today}" value="${today}" required></div>
          <div class="field"><label for="f-heure">Heure de départ</label><select id="f-heure" name="heure">${heures.map((h) => `<option ${h === '10:00' ? 'selected' : ''}>${h}</option>`).join('')}</select></div>
          <p class="note full" id="resa-info" hidden></p>
          <div class="field"><label for="f-adultes">Adultes</label><select id="f-adultes" name="adultes">${num(10, 2, 1)}</select></div>
          <div class="field"><label for="f-langue">Langue de l’audio</label><select id="f-langue" name="langue">${Object.keys(LANGUES).map((k) => `<option value="${k}">${LANGUES[k]}</option>`).join('')}</select></div>
          <div class="field"><label for="f-enfants">Enfants · vélo enfant</label><select id="f-enfants" name="enfants">${num(8, 0)}</select></div>
          <div class="field"><label for="f-petits">Petits · siège ou remorque</label><select id="f-petits" name="petits">${num(4, 0)}</select></div>
          <fieldset class="field full">
            <legend>Vélos adultes</legend>
            <div class="radio-row">${radios('velo', VELOS, 'electrique', {
              electrique: `Aide dans les montées, comme Byrsa · ${TARIFS.electrique} DT`,
              confort: `Selle large, position droite, cadre bas · ${TARIFS.confort} DT`
            })}</div>
          </fieldset>
          <fieldset class="field full">
            <legend>Formule</legend>
            <div class="radio-row three">${radios('formule', FORMULES, 'journee')}</div>
          </fieldset>
          <fieldset class="field full">
            <legend>Votre avatar sur la carte</legend>
            <div class="radio-row">
              <input type="radio" id="a-h" name="avatar" value="homme" ${S.avatar !== 'femme' ? 'checked' : ''}><label class="opt opt-avatar" for="a-h">${avatarSvg('homme')}Homme</label>
              <input type="radio" id="a-f" name="avatar" value="femme" ${S.avatar === 'femme' ? 'checked' : ''}><label class="opt opt-avatar" for="a-f">${avatarSvg('femme')}Femme</label>
            </div>
          </fieldset>
          <div class="field"><label for="f-nom">Nom</label><input id="f-nom" name="nom" autocomplete="name" required placeholder="Votre nom"></div>
          <div class="field"><label for="f-tel">Téléphone</label><input id="f-tel" name="tel" type="tel" autocomplete="tel" required placeholder="+216 …"></div>
          <p class="error full" id="resa-err" role="alert" hidden></p>
        </div>
        <aside class="card pourpre">
          <p class="label">Votre balade</p>
          <div class="total"><span id="total">0</span> DT</div>
          <p class="muted" style="color:rgba(246,236,209,.8);font-size:14px">Tarifs indicatifs. Casques, support téléphone et numéro d’assistance inclus.</p>
          <ul class="recap" id="recap"></ul>
          <button class="btn btn-ocre btn-block" type="submit">Réserver un vélo</button>
        </aside>
      </form>
    </div></section>`;
  }

  function majRecap() {
    const form = $('#resa-form');
    if (!form) return;
    const d = Object.fromEntries(new FormData(form));
    $('#total').textContent = prix(d);
    $('#recap').innerHTML = `
      <li><span>Date</span><strong>${d.date ? dateCourte(d.date) : '—'} · ${d.heure}</strong></li>
      <li><span>Groupe</span><strong>${d.adultes} adulte${+d.adultes > 1 ? 's' : ''}${+d.enfants ? ` · ${d.enfants} enfant${+d.enfants > 1 ? 's' : ''}` : ''}${+d.petits ? ` · ${d.petits} siège${+d.petits > 1 ? 's' : ''}` : ''}</strong></li>
      <li><span>Vélos</span><strong>${VELOS[d.velo]}</strong></li>
      <li><span>Langue</span><strong>${LANGUES[d.langue]}</strong></li>`;
    const info = [];
    if (d.date) {
      const jour = new Date(d.date + 'T12:00:00').getDay();
      if (jour === 1) info.push('Lundi : Dar El Hout est fermé, le parcours commence à Byrsa.');
      if (jour === 0 || jour === 6) info.push('Week-end : Beït al-Hikma est fermé, son indice est placé à l’entrée.');
      if (estHiver(d.date) && d.heure > '10:00') info.push('Hiver : le théâtre ferme à 17 h, un départ avant 10 h est conseillé.');
    }
    const el = $('#resa-info');
    el.hidden = !info.length;
    el.innerHTML = info.join('<br>');
  }

  function vueJeu() {
    if (!S.reservation) {
      return `
      <div class="wrap page-head"><p class="label">Le jeu</p><h1>Prêts à partir ?</h1></div>
      <section class="section tight"><div class="wrap game">
        <div class="etape">
          <h2>Il vous faut un code de jeu</h2>
          <p>Le code vous est donné à la réservation, avec votre QR code. Il débloque les huit étapes du parcours.</p>
          <a class="btn" href="#/reserver">Réserver un vélo</a>
          <form id="code-form" class="bloc" novalidate>
            <p class="label">J’ai déjà un code</p>
            <div class="field"><label for="f-code" class="sr">Code de jeu</label><input id="f-code" name="code" placeholder="DB-XXXX" autocomplete="off" style="text-transform:uppercase"></div>
            <p class="error" id="code-err" role="alert" hidden></p>
            <p style="margin-top:12px"><button class="btn btn-outline" type="submit">Activer le code</button></p>
          </form>
        </div>
      </div></section>`;
    }
    if (!S.avatar) {
      return `<div class="wrap page-head"><p class="label">Le jeu</p><h1>Avant de partir</h1></div>
      <section class="section tight"><div class="wrap game">${choixAvatar()}</div></section>`;
    }

    const done = S.stamps.length;

    if (S.stage === 'stamp' && done > 0) {
      const last = LIEUX[done - 1], s = S.stamps[done - 1];
      const suite = done >= N ? 'Ouvrir le code de Carthage'
        : (last.pause && !S.pauseFaite) ? 'C’est l’heure de la pause thé'
          : `Lieu suivant : ${LIEUX[done].nom}`;
      return `
      <div class="wrap page-head center"><p class="label">Étape ${done} sur ${N} validée</p><h1>Tampon !</h1></div>
      <section class="section tight"><div class="wrap game center">
        <div class="stamp-win">${stamp(last, s.t, false)}</div>
        <p>Le tampon <strong>${last.nom}</strong> rejoint votre passeport.</p>
        ${s.faux ? `<p class="faux">✗ Mauvaise lettre : −${POINTS.erreur} points. Voici la bonne :</p>` : ''}
        ${s.aide ? `<p class="faux">Indice révélé : −${POINTS.erreur} points. Le voici :</p>` : ''}
        <p class="indice-lettre">Indice ${done} : <strong>${s.lettre}</strong></p>
        <p class="muted">Score : ${score()} points</p>
        <button class="btn" data-action="next">${suite}</button>
      </div></section>`;
    }

    if (done >= N) return vueFinal();

    if (S.stage === 'pause') {
      return `
      <div class="wrap page-head"><p class="label">Au milieu du parcours</p><h1>Pause thé</h1></div>
      <section class="section tight"><div class="wrap game">
        <div class="etape">
          <p class="label">≈ 20 minutes · face à la mer</p>
          <h2>Une pause qui fait partie de Carthage</h2>
          ${photo(PAUSE.id)}
          <p>${PAUSE.fiche}</p>
          <div class="bloc"><p class="label">L’histoire</p>${lecteur(PAUSE)}</div>
          <div class="bloc">
            <p class="label">Le souvenir</p>
            <div class="field"><label for="f-souvenir">Une phrase pour votre passeport</label>
              <textarea id="f-souvenir" rows="3" placeholder="Ce que vous retiendrez de cette matinée…">${S.souvenir || ''}</textarea></div>
          </div>
          <div class="bloc"><button class="btn" data-action="pause-fin">Reprendre la route : ${LIEUX[done].nom}</button></div>
        </div>
      </div></section>`;
    }

    const l = LIEUX[done];
    const st = statut(l);
    let corps = '';

    if (S.stage === 'start') {
      const fermeJour = st && st.journee && !l.horaires.ferme;
      corps = `
        <p>${puceStatut(l)} <span class="muted">Créneau conseillé : ${creneau(l)}</span></p>
        ${fermeJour && l.sautable ? `
          <div class="geo-msg">${l.nom} est fermé aujourd’hui. Le parcours commence à l’étape suivante, et l’indice <strong>${l.lettre}</strong> vous est offert.
          <br><button class="btn-link" data-action="skip">Passer à ${LIEUX[done + 1].nom}</button></div>` : ''}
        ${st && st.etat !== 'ouvert' && !(fermeJour && l.sautable) ? `<p class="note">Si le lieu est fermé, l’indice est placé à l’entrée.</p>` : ''}
        <div class="bloc"><button class="btn" data-action="route">Itinéraire</button></div>`;
    } else if (S.stage === 'route') {
      corps = `
        <div class="bloc">
          <p class="label">Direction</p>
          <p class="indice">« ${l.direction} »</p>
          <p class="note" style="margin:0 0 14px">Suivez votre cycliste sur la carte : l’app vous prévient à l’arrivée et lance l’audio.</p>
        </div>
        <div class="map-in-card">${blocCarte()}</div>
        <div class="bloc">
          <button class="btn" data-action="arrive">Je suis sur place</button>
          ${geoMsg ? `<div class="geo-msg" role="status">${geoMsg}</div>` : ''}
        </div>`;
    } else if (S.stage === 'lieu') {
      const ecoute = !!S.ecoutes[l.id];
      const qok = !!S.qok[l.id];
      const rot = (l.id * 2) % l.choix.length;
      const ordre = l.choix.map((_, k) => k);
      const choix = ordre.slice(rot).concat(ordre.slice(0, rot));
      corps = `
        <ol class="etapes-lieu">
          <li class="fait"><span>Présence</span></li>
          <li class="${ecoute ? 'fait' : 'encours'}"><span>Écoute</span></li>
          <li class="${qok ? 'fait' : ecoute ? 'encours' : ''}"><span>Observation</span></li>
          <li class="${qok ? 'encours' : ''}"><span>Indice</span></li>
        </ol>
        <div class="bloc">
          <p class="label">Le lieu à travers le temps</p>
          ${frise(l)}
        </div>
        <div class="bloc">
          <p class="label">L’audioguide</p>
          ${lecteur(l)}
          ${ecoute ? '' : '<p class="note">Écoutez l’audio en entier pour débloquer le défi : la réponse s’y cache.</p>'}
        </div>
        <div class="bloc ${ecoute ? '' : 'verrou'}">
          <p class="label">Le défi</p>
          <h3>${l.question}</h3>
          ${!ecoute ? '<p class="muted">🔒 Disponible après l’écoute.</p>'
            : qok ? (S.qfaux[l.id]
              ? `<p class="faux">✗ Mauvaise réponse : −${POINTS.erreur} points.</p><p>La bonne réponse était : <strong>${l.choix[l.reponse]}</strong>.</p>`
              : `<p class="bonne">✓ Bonne réponse : ${l.choix[l.reponse]}</p>`)
              : `<p class="note" style="margin:0 0 6px">Une seule chance : une mauvaise réponse coûte ${POINTS.erreur} points.</p>
                 <div class="choices">${choix.map((k) => `<button class="choice" data-action="answer" data-k="${k}">${l.choix[k]}</button>`).join('')}</div>`}
        </div>
        <div class="bloc ${qok ? '' : 'verrou'}" id="bloc-indice">
          <p class="label">Trouver l’indice</p>
          ${qok ? `
            <p>Une lettre est cachée <strong>${l.cacheIndice}</strong>. Explorez tous les coins, puis saisissez-la.</p>
            <p class="note" style="margin:0">Une seule chance : une mauvaise lettre coûte ${POINTS.erreur} points.</p>
            <form id="lettre-form" class="lettre-row" novalidate>
              <label for="f-lettre" class="sr">Lettre trouvée</label>
              <input id="f-lettre" name="lettre" maxlength="1" autocomplete="off" autocapitalize="characters" placeholder="?">
              <button class="btn" type="submit">Valider</button>
            </form>
            <p class="error" id="lettre-err" role="alert" hidden></p>
            <p><button class="btn-link" data-action="aide">Je ne trouve pas l’indice (−${POINTS.erreur} points)</button></p>`
            : '<p class="muted">🔒 Disponible après le défi.</p>'}
        </div>`;
    }

    return `
    <div class="wrap page-head"><p class="label">Le jeu · ${score()} points</p><h1>${S.stage === 'lieu' ? 'Vous êtes arrivé' : 'En route'}</h1></div>
    <section class="section tight"><div class="wrap game">
      <div class="etape">
        <p class="label">Étape ${done + 1} sur ${N}</p>
        <h2>${l.nom}</h2>
        <p class="muted">${l.epoque} · ${l.theme}</p>
        ${photo(l.id)}
        ${progressPath()}
        ${corps}
      </div>
      <p class="note">Code ${S.reservation.code} · <a href="#/carnet">Mon passeport (${done}/${N})</a> · <a href="#/carte">Carte</a></p>
    </div></section>`;
  }

  function vueFinal() {
    const lettres = S.stamps.map((s) => s.lettre);
    if (!S.codeOuvert) {
      return `
      <div class="wrap page-head"><p class="label">Le jeu</p><h1>Le code de Carthage</h1></div>
      <section class="section tight"><div class="wrap game">
        <div class="diplome">
          <p class="label">Huit lieux, huit indices</p>
          <h2>Ouvrez le secret</h2>
          <div class="slots">${lettres.map((c, i) => `<span><b>${c}</b><small>${LIEUX[i].court}</small></span>`).join('')}</div>
          <p>Saisissez les ${N} indices, dans l’ordre du parcours.</p>
          <form id="final-form" class="lettre-row center-row" novalidate>
            <label for="f-final" class="sr">Code final</label>
            <input id="f-final" name="code" maxlength="${N + 4}" autocomplete="off" autocapitalize="characters" placeholder="${'·'.repeat(N)}" class="final-input">
            <button class="btn btn-ocre" type="submit">Ouvrir</button>
          </form>
          <p class="error" id="final-err" role="alert" hidden style="color:#f3c4a0"></p>
        </div>
      </div></section>`;
    }
    const nomSecret = CODE.mot.charAt(0) + CODE.mot.slice(1).toLowerCase();
    const equipe = (S.equipe || (S.reservation && S.reservation.nom) || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const aides = S.stamps.filter((s) => s.aide).length;
    return `
    <section class="section tight"><div class="wrap game">
      <div class="diplome">
        <p class="label">Le secret de Carthage</p>
        <h1 style="text-transform:none">${nomSecret}</h1>
        <hr class="rule">
        <p>${CODE.secret}</p>
      </div>

      <div class="course resultat">
        <p class="label">🏆 Votre résultat</p>
        <h2>${S.stamps.length} tampons, ${score()} points</h2>
        <ul class="recap-score">
          <li><span>Étapes validées</span><strong>${S.stamps.length} × ${POINTS.etape}</strong></li>
          <li><span>Erreurs</span><strong>${S.erreurs - aides > 0 ? `${S.erreurs - aides} × −${POINTS.erreur}` : '0'}</strong></li>
          <li><span>Indices révélés</span><strong>${aides ? `${aides} × −${POINTS.aide}` : '0'}</strong></li>
          <li class="total-score"><span>Score</span><strong>${score()} points</strong></li>
        </ul>
        <div class="field"><label for="f-equipe">Nom de votre équipe</label>
          <input id="f-equipe" value="${equipe}" placeholder="Ex. Les Puniques" autocomplete="off"></div>
        <div class="qr-score">
          <div class="qr-box"><div data-qr="${encodeURIComponent(qrScore())}"></div></div>
          <p class="muted">Code manuel : <strong class="code-manuel">${codeScore()}</strong></p>
        </div>
        <p class="cadeau">🎁 ${CODE.cadeau}</p>
      </div>

      <div class="bloc">
        <p class="label">Retour des vélos</p>
        <div class="map-in-card" style="margin:8px 0 0">${blocCarte()}</div>
      </div>
      <p class="center" style="margin-top:24px"><a class="btn" href="#/carnet">Voir mon passeport</a></p>
      <p class="center"><button class="btn-link" data-action="reset">Recommencer le jeu</button></p>
    </div></section>`;
  }

  /* ---------- Espace équipe Door Bina : classement de tous les groupes ---------- */
  const STAFF_KEY = 'doorbina:staff';
  let staffMsg = '', staffTout = false, scanner = null;
  function staffLoad() { try { return JSON.parse(localStorage.getItem(STAFF_KEY)) || { groupes: [] }; } catch (e) { return { groupes: [] }; } }
  function staffSave(d) { try { localStorage.setItem(STAFF_KEY, JSON.stringify(d)); } catch (e) { /* stockage indisponible */ } }
  function staffOuvert() { try { return sessionStorage.getItem('doorbina:staff-ok') === '1'; } catch (e) { return false; } }
  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function memeJour(t) { return new Date(t).toDateString() === new Date().toDateString(); }

  function ajouterGroupe(g) {
    if (signer(g.c, g.s) !== g.k) return '✗ Code invalide : ce score n’a pas été produit par l’app.';
    const d = staffLoad();
    const i = d.groupes.findIndex((x) => x.c === g.c);
    const entree = { c: g.c, e: (g.e || 'Équipe sans nom').slice(0, 40), s: g.s, n: g.n || null, t: g.t || Date.now(), ajout: Date.now() };
    if (i >= 0) d.groupes[i] = entree; else d.groupes.push(entree);
    staffSave(d);
    return `✓ ${entree.e} : ${entree.s} points ${i >= 0 ? '(mis à jour)' : 'ajouté au classement'}.`;
  }
  function ajouterDepuisTexte(txt) {
    if (txt.startsWith('DOORBINA-SCORE:')) {
      try { return ajouterGroupe(JSON.parse(txt.slice(15))); } catch (e) { return '✗ QR illisible.'; }
    }
    if (txt.startsWith('DOORBINA:')) return '✗ C’est le QR de réservation. Demandez le QR de score, sur l’écran final du jeu.';
    return '✗ Ce QR code ne vient pas de Door Bina.';
  }
  function classement() {
    const d = staffLoad();
    return d.groupes
      .filter((g) => staffTout || memeJour(g.ajout))
      .sort((a, b) => b.s - a.s || a.t - b.t); // égalité : le premier à avoir fini passe devant
  }
  function chargerScanner() {
    return new Promise((ok, ko) => {
      if (window.Html5Qrcode) return ok();
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      s.onload = ok; s.onerror = ko;
      document.head.appendChild(s);
    });
  }
  async function scanStop() {
    if (!scanner) return;
    const sc = scanner; scanner = null;
    try { await sc.stop(); } catch (e) { /* déjà arrêté */ }
    try { sc.clear(); } catch (e) { /* rien */ }
  }
  async function scanStart() {
    try { await chargerScanner(); } catch (e) { staffMsg = '✗ Scanner indisponible hors connexion : utilisez le code manuel.'; render(); return; }
    const box = $('#reader-box'); if (box) box.hidden = false;
    scanner = new window.Html5Qrcode('reader');
    try {
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 230 }, async (txt) => {
        staffMsg = ajouterDepuisTexte(txt);
        if (navigator.vibrate) navigator.vibrate(120);
        await scanStop(); render();
      });
    } catch (e) {
      scanner = null;
      staffMsg = '✗ Caméra inaccessible. Autorisez la caméra ou utilisez le code manuel.';
      render();
    }
  }

  function vueEquipe() {
    if (!staffOuvert()) {
      return `
      <div class="wrap page-head"><p class="label">Espace équipe</p><h1>Door Bina</h1></div>
      <section class="section tight"><div class="wrap game">
        <form id="pin-form" class="etape" novalidate>
          <h2>Accès réservé à l’équipe</h2>
          <div class="field"><label for="f-pin">Code PIN</label><input id="f-pin" type="password" inputmode="numeric" autocomplete="off"></div>
          <p class="error" id="pin-err" role="alert" hidden></p>
          <p style="margin-top:14px"><button class="btn" type="submit">Entrer</button></p>
        </form>
      </div></section>`;
    }
    const liste = classement();
    const lignes = liste.map((g, i) => `
      <tr class="${i === 0 ? 'premier' : ''}">
        <td class="rang">${i === 0 ? '🎁 1' : i + 1}</td>
        <td><strong>${esc(g.e)}</strong><br><small class="muted">${esc(g.c)}${staffTout ? ` · ${new Date(g.ajout).toLocaleDateString('fr-FR')}` : ''}</small></td>
        <td class="pts">${g.s}</td>
        <td><small>${g.t ? heure(g.t) : '—'}</small></td>
        <td><button class="btn-link" data-action="staff-suppr" data-c="${esc(g.c)}" aria-label="Retirer ${esc(g.e)}">✕</button></td>
      </tr>`).join('');
    return `
    <div class="wrap page-head">
      <p class="label">Espace équipe Door Bina</p>
      <h1>Classement</h1>
      <p>Scannez le QR de score de chaque groupe à son retour. À la fin de la journée, le premier du classement gagne le cadeau.</p>
    </div>
    <section class="section tight"><div class="wrap game">
      <div class="etape">
        <div class="actions">
          <button class="btn" data-action="staff-scan">📷 Scanner un QR de score</button>
          <button class="btn-link" data-action="staff-scan-stop">Arrêter la caméra</button>
        </div>
        <div id="reader-box" hidden><div id="reader"></div></div>
        ${staffMsg ? `<p class="staff-msg ${staffMsg.startsWith('✓') ? 'ok' : 'ko'}" role="status">${staffMsg}</p>` : ''}
        <form id="saisie-form" class="bloc" novalidate>
          <p class="label">Ou saisir le code manuel</p>
          <div class="form-grid">
            <div class="field"><label for="f-s-equipe">Équipe</label><input id="f-s-equipe" autocomplete="off" placeholder="Les Puniques"></div>
            <div class="field"><label for="f-s-code">Code de score</label><input id="f-s-code" autocomplete="off" placeholder="DB-XXXX-790-XXXX" style="text-transform:uppercase"></div>
          </div>
          <p style="margin-top:12px"><button class="btn btn-outline" type="submit">Ajouter</button></p>
        </form>
      </div>

      <div class="bloc">
        <div class="classement-tete">
          <h2>${staffTout ? 'Tous les groupes' : 'Aujourd’hui'} · ${liste.length} groupe${liste.length > 1 ? 's' : ''}</h2>
          <button class="btn-link" data-action="staff-filtre">${staffTout ? 'Voir aujourd’hui' : 'Voir tout l’historique'}</button>
        </div>
        ${liste.length ? `
          ${liste[0] ? `<p class="gagnant">🎁 En tête : <strong>${esc(liste[0].e)}</strong> avec ${liste[0].s} points</p>` : ''}
          <table class="classement">
            <thead><tr><th>Rang</th><th>Équipe</th><th>Points</th><th>Fin</th><th></th></tr></thead>
            <tbody>${lignes}</tbody>
          </table>
          <p class="note">À égalité de points, le groupe qui a fini le jeu en premier passe devant.</p>`
          : '<p class="muted">Aucun groupe pour le moment.</p>'}
      </div>
      <div class="actions" style="margin-top:24px">
        <button class="btn-link" data-action="staff-reset">Effacer le classement</button>
        <button class="btn-link" data-action="staff-sortir">Se déconnecter</button>
      </div>
      <p class="note">Le classement est enregistré sur ce téléphone. Utilisez toujours le même téléphone pour scanner les groupes.</p>
    </div></section>`;
  }

  function vueCarnet() {
    const figs = LIEUX.map((l, i) => {
      const s = S.stamps[i];
      return `<figure>${stamp(l, s && s.t, !s)}<figcaption>${s ? `${l.nom}<br><strong class="lettre">${s.lettre}</strong>${s.saute ? ' · offert' : ''}` : `Étape ${i + 1}`}</figcaption></figure>`;
    }).join('');
    const audios = LIEUX.filter((l) => audioDebloque(l.id)).map((l) => lecteur(l, true));
    if (S.pauseFaite) audios.splice(4, 0, lecteur(PAUSE, true));
    return `
    <div class="wrap page-head">
      <p class="label">Passeport · ${score()} points</p>
      <h1>Mes tampons</h1>
      <p>${S.stamps.length} tampon${S.stamps.length > 1 ? 's' : ''} sur ${N}. Chaque lieu validé laisse sa marque, l’heure de votre passage et un indice du code final.</p>
    </div>
    <section class="section tight"><div class="wrap">
      <div class="carnet">${figs}</div>
      ${S.souvenir ? `<blockquote class="souvenir">« ${S.souvenir.replace(/</g, '&lt;')} »<cite>Mon souvenir de la pause thé</cite></blockquote>` : ''}
      <h2 style="margin-top:48px">Mes audioguides</h2>
      <p class="muted">Réécoutez les lieux visités, quand vous voulez, sans guide.</p>
      ${audios.length ? `<div class="audio-list">${audios.join('')}</div>` : '<p>Votre premier audioguide s’ouvre en arrivant à la première étape.</p>'}
      <div class="actions" style="margin-top:36px">
        ${S.stamps.length < N ? `<a class="btn" href="#/jeu">${S.stamps.length ? 'Continuer le jeu' : 'Commencer le jeu'}</a>` : ''}
        ${S.stamps.length ? '<button class="btn-link" data-action="reset">Effacer mon passeport</button>' : ''}
      </div>
    </div></section>`;
  }

  function vueCarte() {
    return `
    <div class="wrap page-head">
      <p class="label">La carte</p>
      <h1>Où suis-je ?</h1>
      <p>Le vélo, c’est vous : il avance avec le GPS. ✓ étape validée, anneau : prochaine étape, pointillés : étape verrouillée. Touchez un lieu pour voir ses horaires et son audio.</p>
      <p><a class="btn btn-outline" href="voyage.html">Me voir dans le voyage 3D</a></p>
    </div>
    <section class="section tight"><div class="wrap">
      ${S.avatar ? blocCarte() : `<div class="game">${choixAvatar('Choisissez votre cycliste')}</div>`}
    </div></section>`;
  }

  /* ---------- Routage ---------- */
  const ROUTES = { '': vueAccueil, parcours: vueParcours, carte: vueCarte, reserver: vueReserver, jeu: vueJeu, carnet: vueCarnet, lieu: vueLieu, equipe: vueEquipe };
  const TITRES = { '': 'Carthage à vélo', parcours: 'Le parcours', carte: 'La carte', reserver: 'Réserver', jeu: 'Le jeu', carnet: 'Mon passeport', lieu: 'Le lieu', equipe: 'Espace équipe' };
  function parts() { return location.hash.replace(/^#\/?/, '').split('/'); }
  function route() { return parts()[0] || ''; }

  function render(focus) {
    const r = ROUTES[route()] ? route() : '';
    stopLive();
    scanStop();
    $('#app').innerHTML = ROUTES[r](parts()[1]);
    if ($('#live-map')) initLiveMap();
    const qr = $('#qr');
    if (qr && window.QRCode) {
      new window.QRCode(qr, { text: `DOORBINA:${qr.dataset.code}`, width: 168, height: 168, colorDark: '#611335', colorLight: '#FAF5E8' });
    }
    document.querySelectorAll('[data-qr]').forEach((n) => {
      if (window.QRCode) new window.QRCode(n, { text: decodeURIComponent(n.dataset.qr), width: 200, height: 200, colorDark: '#231F20', colorLight: '#FAF5E8', correctLevel: window.QRCode.CorrectLevel.M });
      else n.textContent = 'QR indisponible hors connexion : donnez le code manuel.';
    });
    syncAudioUI();
    remplirVoix();
    majRail();
    document.title = `Door Bina · ${TITRES[r]}`;
    const navKey = r === 'lieu' ? 'parcours' : (r || 'home');
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === navKey));
    if (r === 'reserver') majRecap();
    if (focus) { window.scrollTo(0, 0); $('#app').focus({ preventScroll: true }); }
  }

  /* ---------- Actions ---------- */
  function verifierPosition(lieu) {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ ok: false, raison: 'La géolocalisation n’est pas disponible sur cet appareil.' });
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const d = distance({ lat: p.coords.latitude, lng: p.coords.longitude }, lieu);
          resolve({ ok: d <= RAYON_VALIDATION, d });
        },
        () => resolve({ ok: false, raison: 'Position introuvable ou refusée.' }),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    });
  }
  function ouvrirLieu(lieu) { // présence confirmée : l'étape s'ouvre et l'audio démarre
    S.stage = 'lieu'; geoMsg = ''; Live.demo = false; save();
    if (route() !== 'jeu') location.hash = '#/jeu'; else render(true);
    if (!S.ecoutes[lieu.id]) audioToggle(lieu.id);
  }
  function valider(lieu, faux, aide) {
    if (faux) S.erreurs++;
    S.stamps.push({ id: lieu.id, t: Date.now(), lettre: lieu.lettre, faux: !!faux, aide: !!aide });
    S.stage = 'stamp';
    save(); render(true);
  }

  document.addEventListener('click', async (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;
    const lieu = LIEUX[S.stamps.length];

    if (a === 'route') { S.stage = 'route'; geoMsg = ''; save(); render(); }

    else if (a === 'arrive') {
      if (Live.pos && distance(Live.pos, lieu) <= RAYON_VALIDATION) { ouvrirLieu(lieu); return; }
      el.disabled = true; el.textContent = 'Vérification de votre position…';
      const res = await verifierPosition(lieu);
      if (res.ok) { ouvrirLieu(lieu); return; }
      const loin = res.d != null ? `Vous semblez être à ${fmtDist(res.d)} du lieu.` : res.raison;
      geoMsg = `${loin} Continuez à pédaler en suivant la carte. <br><button class="btn-link" data-action="force">Je suis bien arrivé, valider sans GPS</button>`;
      render();
    }

    else if (a === 'force') { if (lieu) ouvrirLieu(lieu); }

    else if (a === 'staff-scan') { staffMsg = ''; scanStart(); }
    else if (a === 'staff-scan-stop') { scanStop().then(() => { const b = $('#reader-box'); if (b) b.hidden = true; }); }
    else if (a === 'staff-filtre') { staffTout = !staffTout; render(); }
    else if (a === 'staff-suppr') {
      const d = staffLoad();
      if (confirm('Retirer ce groupe du classement ?')) { d.groupes = d.groupes.filter((g) => g.c !== el.dataset.c); staffSave(d); staffMsg = ''; render(); }
    }
    else if (a === 'staff-reset') {
      if (confirm('Effacer tout le classement de ce téléphone ?')) { staffSave({ groupes: [] }); staffMsg = ''; render(); }
    }
    else if (a === 'staff-sortir') { try { sessionStorage.removeItem('doorbina:staff-ok'); } catch (e) { /* rien */ } render(true); }

    else if (a === 'answer') {
      if (S.qok[lieu.id]) return; // une seule chance
      if (+el.dataset.k !== lieu.reponse) { S.erreurs++; S.qfaux[lieu.id] = true; }
      S.qok[lieu.id] = true; // bonne ou mauvaise, on passe à l'indice
      save(); render();
      const b = $('#bloc-indice'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    else if (a === 'aide') {
      if (confirm(`Révéler l’indice de ${lieu.nom} ? (−${POINTS.erreur} points)`)) { S.aides++; valider(lieu, false, true); }
    }

    else if (a === 'skip') {
      S.stamps.push({ id: lieu.id, t: Date.now(), lettre: lieu.lettre, saute: true });
      S.stage = 'start'; save(); render(true);
    }

    else if (a === 'next') {
      const last = LIEUX[S.stamps.length - 1];
      S.stage = (last && last.pause && !S.pauseFaite) ? 'pause' : 'start';
      save(); render(true);
    }

    else if (a === 'pause-fin') {
      const t = $('#f-souvenir'); if (t) S.souvenir = t.value.trim();
      S.pauseFaite = true; S.stage = 'start'; audioStop(); save(); render(true);
    }

    else if (a === 'lu') { marquerEcoute(+el.dataset.id); }

    else if (a === 'reset') {
      if (confirm('Effacer tous vos tampons et recommencer le jeu ?')) {
        const keep = { reservation: S.reservation, avatar: S.avatar };
        audioStop(); S = Object.assign(neuf(), keep); save(); render(true);
      }
    }

    else if (a === 'cancel-resa') {
      if (confirm('Annuler la réservation ? Votre progression sera aussi effacée.')) { audioStop(); S = neuf(); save(); render(true); }
    }

    else if (a === 'scroll') {
      const t = document.getElementById(el.dataset.target);
      if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash'); }
    }

    else if (a === 'avatar') { S.avatar = el.dataset.v; save(); render(true); }
    else if (a === 'avatar-reset') { S.avatar = null; Live.me = null; save(); render(true); }
    else if (a === 'audio') { audioToggle(+el.dataset.id); }
    else if (a === 'audio-lang') { audioStop(); S.langueAudio = el.dataset.lg; save(); render(); }
    else if (a === 'audio-genre') { audioStop(); S.genreVoix = el.dataset.g; save(); render(); }
    else if (a === 'audio-stop') { audioStop(); }

    else if (a === 'center') {
      Live.follow = true;
      if (Live.demo) { Live.demo = false; Live.pos = null; if (Live.raf) cancelAnimationFrame(Live.raf); initLiveMap(); return; }
      if (Live.pos && Live.map && !Live.far) Live.map.setView([Live.pos.lat, Live.pos.lng], 17);
      else if (Live.far) alert('Vous êtes loin de Carthage : utilisez « Simuler le trajet » pour essayer.');
    }

    else if (a === 'demo') { demoTrajet(); }
  });

  document.addEventListener('keydown', (ev) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.pt[data-action]')) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  document.addEventListener('input', (ev) => {
    if (ev.target.closest('#resa-form')) majRecap();
    if (ev.target.id === 'f-souvenir') { S.souvenir = ev.target.value; save(); }
    if (ev.target.id === 'f-equipe') { S.equipe = ev.target.value; save(); }
  });
  document.addEventListener('change', (ev) => {
    if (ev.target.matches('.audio-voix')) { // voix choisie par le visiteur, gardée pour cette langue
      S.voix = Object.assign({}, S.voix, { [ev.target.dataset.lg]: ev.target.value });
      save(); audioStop();
    }
    if (ev.target.closest('#resa-form')) majRecap();
    if (ev.target.id === 'f-equipe') { S.equipe = ev.target.value.trim(); save(); render(); } // le QR reprend le nom
  });

  document.addEventListener('submit', (ev) => {
    const f = ev.target;
    if (f.id === 'resa-form') {
      ev.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      const err = $('#resa-err');
      const manque = [];
      if (!d.date) manque.push('la date');
      if (!d.nom.trim()) manque.push('votre nom');
      if (!/^[+\d][\d\s.-]{6,}$/.test(d.tel.trim())) manque.push('un numéro de téléphone valide');
      if (manque.length) { err.hidden = false; err.textContent = `Merci d’indiquer ${manque.join(', ')}.`; return; }
      S.reservation = {
        code: codeAleatoire(), date: d.date, heure: d.heure,
        adultes: +d.adultes, enfants: +d.enfants, petits: +d.petits, velo: d.velo,
        formule: d.formule, langue: d.langue,
        nom: d.nom.trim(), tel: d.tel.trim(), total: prix(d), creeLe: Date.now()
      };
      S.langueAudio = null; // l'audioguide suit la langue de cette nouvelle réservation
      S.avatar = d.avatar || 'homme';
      S.stamps = []; S.stage = 'start';
      save(); render(true);
    }
    if (f.id === 'code-form') {
      ev.preventDefault();
      const code = (new FormData(f).get('code') || '').toString().trim().toUpperCase();
      if (!/^DB-[A-Z2-9]{4}$/.test(code)) { const e = $('#code-err'); e.hidden = false; e.textContent = 'Le code a la forme DB-XXXX.'; return; }
      S.reservation = { code, fromCode: true, creeLe: Date.now() };
      S.stamps = []; S.stage = 'start';
      save(); render(true);
    }
    if (f.id === 'lettre-form') {
      ev.preventDefault();
      const lieu = LIEUX[S.stamps.length];
      const v = ($('#f-lettre').value || '').trim().toUpperCase();
      if (!v) { const e = $('#lettre-err'); e.hidden = false; e.textContent = 'Saisissez la lettre trouvée.'; return; }
      // une seule chance : si la lettre est fausse, −10 points et la bonne lettre est donnée
      valider(lieu, v !== lieu.lettre);
    }
    if (f.id === 'pin-form') {
      ev.preventDefault();
      if (($('#f-pin').value || '').trim() === String(STAFF.pin)) {
        try { sessionStorage.setItem('doorbina:staff-ok', '1'); } catch (e) { /* rien */ }
        staffMsg = ''; render(true);
      } else { const e = $('#pin-err'); e.hidden = false; e.textContent = 'Code PIN incorrect.'; }
    }
    if (f.id === 'saisie-form') {
      ev.preventDefault();
      const code = ($('#f-s-code').value || '').trim().toUpperCase();
      const m = code.match(/^(DB-[A-Z2-9]{4})-(\d{1,4})-([0-9A-Z]{4})$/);
      staffMsg = m
        ? ajouterGroupe({ c: m[1], s: +m[2], k: m[3], e: ($('#f-s-equipe').value || '').trim(), t: Date.now() })
        : '✗ Format attendu : DB-XXXX-points-XXXX (ex. DB-K7QM-790-AB12).';
      render();
    }
    if (f.id === 'final-form') {
      ev.preventDefault();
      const v = ($('#f-final').value || '').toUpperCase().replace(/[^A-Z]/g, '');
      if (v === CODE.mot) { S.codeOuvert = true; S.tFin = Date.now(); save(); render(true); return; }
      const e = $('#final-err'); e.hidden = false; e.textContent = 'Le code ne s’ouvre pas. Reprenez les indices dans l’ordre du parcours.';
    }
  });

  /* ---------- Démarrage ---------- */
  document.querySelectorAll('[data-logo="full"]').forEach((n) => { n.innerHTML = logo(); });
  document.querySelectorAll('[data-logo="bike"]').forEach((n) => { n.innerHTML = bikeSymbol(); });
  window.addEventListener('hashchange', () => render(true));
  render();
})();
