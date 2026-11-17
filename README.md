# Door Bina · Carthage à vélo

Un jeu de piste à vélo, sans guide, à travers huit lieux de Carthage.
La carte suit le visiteur, un audioguide raconte chaque lieu, et huit indices ouvrent le code de Carthage.

**Site :** https://fedifedifedi.github.io/door-bina/

## Contenu

- `index.html` : la page de l'application
- `css/style.css` : le style, d'après la charte graphique Door Bina
- `js/data.js` : les lieux, horaires, audioguides, questions et indices (à modifier ici)
- `js/app.js` : la logique (réservation, carte GPS, jeu, passeport)
- `audio/fr`, `audio/en`, `audio/ar`, `audio/tn` : l'audioguide enregistré (un MP3 par lieu, `99` = pause thé),
  voix de synthèse neuronales Henri (fr), Ryan (en), et pour l'arabe classique (`ar`) et la derja
  tunisienne (`tn`) deux voix tunisiennes : Hédi (`1.mp3`) et Rim (`1-f.mp3`). L'arabe classique est
  enregistré à partir du texte vocalisé (`lecture` dans `js/data.js`), pour une bonne prononciation. Si un texte change dans
  `js/data.js`, il faut régénérer le MP3 correspondant ; sinon l'app lit avec la voix du téléphone.
- `voyage.html`, `css/voyage.css`, `js/voyage/` : le voyage 3D (Three.js). On fait défiler la page pour pédaler
  d'un lieu à l'autre ; une balise « Vous êtes ici » montre la position du visiteur (progression du jeu + GPS).
  `voyage.html?etape=3` ouvre directement un arrêt. En local, servir le dossier (ex. `python -m http.server`) :
  les modules JavaScript ne s'ouvrent pas en double-cliquant le fichier.

Prototype : les réservations sont gardées sur le téléphone du visiteur, sans serveur ni paiement.
Coordonnées GPS, horaires et textes historiques à vérifier sur le terrain avant le lancement.
