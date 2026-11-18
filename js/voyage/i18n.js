// Langues du voyage 3D : français, anglais, arabe. Le visiteur choisit avec les boutons FR / EN / ع ;
// par défaut, la langue de l'audioguide ou de la réservation (la derja utilise l'arabe).
const KEY = 'doorbina:v2';

function lireEtat() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }

export const LANGUES = { fr: 'FR', en: 'EN', ar: 'ع' };
export const lang = (() => {
  const p = new URLSearchParams(location.search).get('lang');
  if (p && LANGUES[p]) return p;
  const S = lireEtat();
  const lg = S.langueAudio || (S.reservation && S.reservation.langue) || 'fr';
  return lg === 'tn' ? 'ar' : LANGUES[lg] ? lg : 'fr';
})();
export const rtl = lang === 'ar';

/** Change de langue : mémorisée avec l'audioguide de l'application, puis la page se recharge */
export function choisirLangue(lg) {
  const S = lireEtat();
  S.langueAudio = lg;
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ }
  const u = new URL(location.href);
  u.searchParams.delete('lang');
  location.href = u.toString();
}

const T = {
  fr: {
    sous: '· le voyage', maPosition: 'Ma position', gpsOn: 'Activer le GPS', gpsSearch: 'GPS : recherche…', gpsRefuse: 'GPS refusé',
    suivi: 'Suivi GPS ✓', meSuivre: 'Me suivre', classique: 'Version classique', hint: 'Faites défiler pour pédaler', loader: 'On gonfle les pneus…',
    gpsLive: 'GPS en direct', surPlace: 'sur place', duProchain: '{d} du prochain arrêt',
    vousYEtes: 'Vous y êtes : {nom} !', ouvrezEtape: 'Ouvrez l’étape dans le jeu : l’audio et la question vous attendent.',
    rendezVelos: 'Rendez vos vélos et montrez votre QR de score.', ouvrirJeu: 'Ouvrir le jeu →', agence: 'l’agence Door Bina',
    vousEtesIci: 'Vous êtes ici', ICI: 'VOUS ÊTES ICI', vousCourt: 'Vous', allerA: 'Aller à : {nom}', arrets: 'Arrêts du parcours',
    depart: 'Point de départ', pause: 'Pause thé', a: 'À {x}', vers: 'En route vers {x}', estA: 'Vous êtes à {x}', leRetour: 'le retour', lAgence: 'l’agence',
    etapeSur: 'Étape {i} sur {n}', done: '✓ Étape validée', next: 'Prochaine étape', locked: 'À venir', lienLieu: 'Le lieu à travers le temps →',
    pauseEyebrow: 'Pause · environ 20 minutes', departEyebrow: 'Départ', departTitre: 'Faisons le tour ensemble', departSous: 'Carthage à vélo, sans guide',
    departTexte: 'Récupérez vos vélos à l’agence Door Bina, puis pédalez d’étape en étape : huit lieux, huit indices, un code à ouvrir.',
    departHint: 'Faites défiler pour avancer sur la route. Les points à droite vous emmènent directement à un lieu.', reserver: 'Réserver mes vélos →',
    arrivee: 'Arrivée', score: 'Voir mon score →', fin: 'Le mot de la fin', passeport: 'Mon passeport', recommencer: 'Recommencer le voyage', photo: 'Photo',
    fermeRehab: 'Fermé, en réhabilitation', fermeAuj: 'Fermé aujourd’hui', ouvreA: 'Ouvre à {h}', fermeDepuis: 'Fermé depuis {h}', ouvertJusqua: 'Ouvert jusqu’à {h}',
    agenceNom: 'Agence Door Bina', departCourt: 'Départ', retourCourt: 'Retour des vélos',
    sEtape: 'ÉTAPE {i} · {e}', sPause: 'PAUSE · 20 MIN', sDepart: 'DÉPART', sArrivee: 'ARRIVÉE', sPauseSous: 'Thé à la menthe face à la mer', sVelos: 'Vélos · Door Bina',
    sDone: '✓ ÉTAPE VALIDÉE', sNext: 'PROCHAINE ÉTAPE', sLocked: 'À VENIR', sFin: 'LE MOT DE LA FIN',
    fallbackTitre: 'Le voyage 3D ne peut pas s’ouvrir ici', fallbackTexte: 'Votre navigateur ne permet pas l’affichage en 3D. Le parcours reste disponible dans la version classique.', fallbackBtn: 'Voir le parcours',
  },
  en: {
    sous: '· the journey', maPosition: 'My position', gpsOn: 'Turn on GPS', gpsSearch: 'GPS: searching…', gpsRefuse: 'GPS denied',
    suivi: 'Following ✓', meSuivre: 'Follow me', classique: 'Classic version', hint: 'Scroll to ride', loader: 'Pumping up the tyres…',
    gpsLive: 'Live GPS', surPlace: 'you are there', duProchain: '{d} to the next stop',
    vousYEtes: 'You made it: {nom}!', ouvrezEtape: 'Open the stage in the game: the audio and the question are waiting for you.',
    rendezVelos: 'Return your bikes and show your score QR code.', ouvrirJeu: 'Open the game →', agence: 'the Door Bina agency',
    vousEtesIci: 'You are here', ICI: 'YOU ARE HERE', vousCourt: 'You', allerA: 'Go to: {nom}', arrets: 'Stops on the route',
    depart: 'Starting point', pause: 'Tea break', a: 'At {x}', vers: 'On the way to {x}', estA: 'You are at {x}', leRetour: 'the return point', lAgence: 'the agency',
    etapeSur: 'Stage {i} of {n}', done: '✓ Stage completed', next: 'Next stage', locked: 'Coming up', lienLieu: 'The place through time →',
    pauseEyebrow: 'Break · about 20 minutes', departEyebrow: 'Start', departTitre: 'Let’s ride around together', departSous: 'Carthage by bike, without a guide',
    departTexte: 'Pick up your bikes at the Door Bina agency, then ride from stage to stage: eight places, eight clues, one code to unlock.',
    departHint: 'Scroll to move along the road. The dots on the right take you straight to a place.', reserver: 'Book my bikes →',
    arrivee: 'Finish', score: 'See my score →', fin: 'The final word', passeport: 'My passport', recommencer: 'Start the journey again', photo: 'Photo',
    fermeRehab: 'Closed for renovation', fermeAuj: 'Closed today', ouvreA: 'Opens at {h}', fermeDepuis: 'Closed since {h}', ouvertJusqua: 'Open until {h}',
    agenceNom: 'Door Bina agency', departCourt: 'Start', retourCourt: 'Bike return',
    sEtape: 'STAGE {i} · {e}', sPause: 'BREAK · 20 MIN', sDepart: 'START', sArrivee: 'FINISH', sPauseSous: 'Mint tea facing the sea', sVelos: 'Bikes · Door Bina',
    sDone: '✓ STAGE COMPLETED', sNext: 'NEXT STAGE', sLocked: 'COMING UP', sFin: 'THE FINAL WORD',
    fallbackTitre: 'The 3D journey cannot open here', fallbackTexte: 'Your browser cannot display 3D. The route is still available in the classic version.', fallbackBtn: 'See the route',
  },
  ar: {
    sous: '· الرحلة', maPosition: 'موقعي', gpsOn: 'تشغيل GPS', gpsSearch: 'GPS: جارٍ البحث…', gpsRefuse: 'GPS مرفوض',
    suivi: 'التتبّع ✓', meSuivre: 'تتبّعني', classique: 'النسخة الكلاسيكية', hint: 'مرّروا الشاشة لتقودوا الدراجة', loader: 'ننفخ العجلات…',
    gpsLive: 'GPS مباشر', surPlace: 'في المكان', duProchain: '{d} عن المحطة التالية',
    vousYEtes: 'وصلتم: {nom}!', ouvrezEtape: 'افتحوا المرحلة في اللعبة: التسجيل والسؤال بانتظاركم.',
    rendezVelos: 'أعيدوا دراجاتكم وأظهروا رمز QR لنتيجتكم.', ouvrirJeu: 'افتحوا اللعبة ←', agence: 'وكالة دوربينا',
    vousEtesIci: 'أنتم هنا', ICI: 'أنتم هنا', vousCourt: 'أنتم', allerA: 'اذهبوا إلى: {nom}', arrets: 'محطات المسار',
    depart: 'نقطة الانطلاق', pause: 'استراحة الشاي', a: 'في {x}', vers: 'في الطريق إلى {x}', estA: 'أنتم في {x}', leRetour: 'نقطة الإرجاع', lAgence: 'الوكالة',
    etapeSur: 'المرحلة {i} من {n}', done: '✓ مرحلة مكتملة', next: 'المرحلة التالية', locked: 'قادمة', lienLieu: 'المكان عبر الزمن ←',
    pauseEyebrow: 'استراحة · نحو 20 دقيقة', departEyebrow: 'الانطلاق', departTitre: 'لنتجوّل معًا', departSous: 'قرطاج بالدراجة، دون مرشد',
    departTexte: 'استلموا دراجاتكم من وكالة دوربينا، ثم انتقلوا من مرحلة إلى أخرى: ثمانية أماكن، ثمانية أدلة، ورمز واحد لفتحه.',
    departHint: 'مرّروا الشاشة للتقدّم على الطريق. النقاط على الجانب تأخذكم مباشرة إلى أيّ مكان.', reserver: 'احجزوا دراجاتكم ←',
    arrivee: 'الوصول', score: 'اطّلعوا على نتيجتكم ←', fin: 'الكلمة الأخيرة', passeport: 'جواز سفري', recommencer: 'إعادة الرحلة', photo: 'صورة',
    fermeRehab: 'مغلق للترميم', fermeAuj: 'مغلق اليوم', ouvreA: 'يفتح على الساعة {h}', fermeDepuis: 'مغلق منذ الساعة {h}', ouvertJusqua: 'مفتوح حتى الساعة {h}',
    agenceNom: 'وكالة دوربينا', departCourt: 'الانطلاق', retourCourt: 'إرجاع الدراجات',
    sEtape: 'المرحلة {i} · {e}', sPause: 'استراحة · 20 دقيقة', sDepart: 'الانطلاق', sArrivee: 'الوصول', sPauseSous: 'شاي بالنعناع قبالة البحر', sVelos: 'دراجات · دوربينا',
    sDone: '✓ مرحلة مكتملة', sNext: 'المرحلة التالية', sLocked: 'قادمة', sFin: 'الكلمة الأخيرة',
    fallbackTitre: 'لا يمكن فتح الرحلة ثلاثية الأبعاد هنا', fallbackTexte: 'متصفّحكم لا يدعم العرض ثلاثي الأبعاد. المسار متاح في النسخة الكلاسيكية.', fallbackBtn: 'عرض المسار',
  },
};

/** Texte traduit, avec ses valeurs : t('etapeSur', { i: 2, n: 8 }) */
export function t(cle, v = {}) {
  const s = T[lang][cle] != null ? T[lang][cle] : T.fr[cle] != null ? T.fr[cle] : cle;
  return s.replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? v[k] : ''));
}

/* ---------- Contenus traduits (js/data.js) ---------- */
const AUDIO = window.DOORBINA_AUDIO || {};
const JEU = window.DOORBINA_JEU || {};
const TRAD = window.DOORBINA_TRAD || {};

/** Un lieu dans la langue choisie : nom, époque, thème, fiche */
export function lieuTraduit(l) {
  if (lang === 'fr') return l;
  const a = AUDIO[lang] && AUDIO[lang][l.id], j = JEU[lang] && JEU[lang][l.id], f = TRAD[lang] && TRAD[lang].fiche;
  return Object.assign({}, l, j || {}, { nom: a ? a.nom : l.nom, court: a ? a.nom : l.court, fiche: f && f[l.id] ? f[l.id] : l.fiche });
}
export function pauseTraduite(p) {
  if (lang === 'fr') return p;
  const a = AUDIO[lang] && AUDIO[lang][p.id], f = TRAD[lang] && TRAD[lang].fiche;
  return Object.assign({}, p, { nom: a ? a.nom : p.nom, court: a ? a.nom : p.court, fiche: f && f[p.id] ? f[p.id] : p.fiche });
}
export function retourTraduit(r) {
  return lang !== 'fr' && TRAD[lang] && TRAD[lang].retour ? Object.assign({}, r, TRAD[lang].retour) : r;
}
export function finTraduite() {
  return lang !== 'fr' && TRAD[lang] && TRAD[lang].fin ? TRAD[lang].fin : (window.DOORBINA_FIN || { titre: '', texte: '', merci: '' });
}
