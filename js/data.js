/*
 * Door Bina — contenu du jeu de piste (parcours de la présentation jury).
 * Modifiez ce fichier pour changer les lieux, horaires, audioguides, questions et indices.
 *
 * À VÉRIFIER SUR LE TERRAIN avant le lancement :
 *  - les coordonnées GPS (approximatives) ;
 *  - les horaires (relevés en ligne) ;
 *  - les textes historiques (à faire relire).
 *
 * Audioguide : « recit » est lu par la voix de synthèse du téléphone.
 * Pour un vrai enregistrement, placez un MP3 dans audio/ et indiquez son chemin dans « audio ».
 *
 * Indices : chaque lieu cache une lettre (« lettre »). Les 8 lettres, dans l'ordre,
 * forment le code final (CODE_FINAL). Placez physiquement chaque lettre dans le lieu.
 *
 * Horaires : « jours » va du dimanche (0) au samedi (6) ; [ouverture, fermeture] en heures
 * décimales (9.5 = 9h30) ; null = fermé ce jour-là.
 */
(function () {
  const tous = (o, f) => [[o, f], [o, f], [o, f], [o, f], [o, f], [o, f], [o, f]];

  window.DOORBINA_LIEUX = [
    {
      id: 1,
      nom: 'Dar El Hout',
      court: 'Dar El Hout',
      epoque: '1924',
      theme: 'La mer et la science',
      lat: 36.8392, lng: 10.3247,
      prog: [0, 45],
      versSuivant: { km: 1.5, min: 8 },
      sautable: true, // fermé le lundi : le parcours peut commencer à Byrsa
      horaires: { texte: 'Mardi à dimanche 10h–18h, fermé le lundi', jours: [[10, 18], null, [10, 18], [10, 18], [10, 18], [10, 18], [10, 18]] },
      direction: 'Le départ se fait au bord de l’eau, à Salammbô : cherchez la « maison du poisson ».',
      cacheIndice: 'à l’intérieur',
      lettre: 'H',
      audio: null,
      fiche: 'Fondée en 1924, la station océanographique de Salammbô abrite aujourd’hui un institut de recherche sur la mer et son musée, Dar El Hout : aquariums, coquillages et collections marines.',
      frise: [
        ['Antiquité', 'Ce rivage borde les quartiers portuaires de Carthage.'],
        ['1924', 'Création de la station océanographique de Salammbô.'],
        ['Aujourd’hui', 'Un institut des sciences de la mer et son musée, Dar El Hout.']
      ],
      recit: 'Bienvenue à Dar El Hout, le point de départ de votre aventure. En arabe tunisien, Dar El Hout veut dire « la maison du poisson ». Ici, au bord du golfe, une station océanographique a été fondée en 1924 pour étudier la mer. Aujourd’hui encore, des chercheurs y travaillent sur les poissons, les courants et la pêche, et le musée présente aquariums et collections marines. Commencer ici n’est pas un hasard : Carthage est née de la mer. Ses fondateurs étaient des navigateurs venus de Tyr, et toute sa richesse est arrivée par bateau. Explorez le musée : l’indice de cette étape s’y cache. Ensuite, direction la colline de Byrsa, à un kilomètre et demi.',
      question: 'Que veut dire « Dar El Hout » ?',
      choix: ['La maison du poisson', 'La porte de la mer', 'La maison du roi'],
      reponse: 0
    },
    {
      id: 2,
      nom: 'Cité de Byrsa',
      court: 'Byrsa',
      epoque: 'Antiquité',
      theme: 'Vie quotidienne punique et romaine',
      lat: 36.8524, lng: 10.3237,
      prog: [55, 95],
      versSuivant: { km: 0.1, min: 1 },
      horaires: { texte: '9h–18h tous les jours', jours: tous(9, 18) },
      direction: 'Montez sur la colline de Byrsa, le cœur de Carthage. La montée est raide : le vélo électrique aide !',
      cacheIndice: 'dans le quartier punique',
      lettre: 'A',
      audio: null,
      fiche: 'La colline de Byrsa était l’acropole de Carthage. On y visite un quartier d’habitations puniques, avec ses rues, ses maisons et ses citernes.',
      frise: [
        ['VIIIe s. av. J.-C.', 'Acropole de Carthage punique, avec ses maisons.'],
        ['146 av. J.-C.', 'Destruction de la ville par Rome.'],
        ['Époque romaine', 'Reconstruction et grands espaces publics.'],
        ['1884–1890', 'Construction de la cathédrale Saint-Louis.'],
        ['Aujourd’hui', 'Site archéologique, musée en réhabilitation.']
      ],
      recit: 'Vous êtes sur la colline de Byrsa, le cœur historique de Carthage. Selon la légende, la reine Élyssa, que les Romains appelaient Didon, arriva de Tyr et demanda autant de terre que pouvait en couvrir une peau de bœuf. Elle découpa la peau en fines lanières et entoura toute la colline. Ici, les archéologues ont mis au jour un quartier d’habitations puniques, avec ses rues, ses maisons et ses citernes. En 146 avant notre ère, Rome détruisit la ville. Plus tard, les Romains arasèrent le sommet pour bâtir leur propre centre, avec de grands espaces publics. Promenez-vous dans le quartier punique : l’indice s’y cache. La cathédrale n’est qu’à cent mètres.',
      question: 'Selon la légende, quelle reine a fondé Carthage sur cette colline ?',
      choix: ['Élyssa (Didon)', 'Cléopâtre', 'Zénobie'],
      reponse: 0
    },
    {
      id: 3,
      nom: 'Cathédrale Saint-Louis',
      court: 'Cathédrale',
      epoque: '1884–1890',
      theme: 'Protectorat et patrimoine religieux',
      lat: 36.8531, lng: 10.3229,
      prog: [100, 125],
      versSuivant: { km: 0.1, min: 1 },
      horaires: { texte: '8h–18h, dimanche jusqu’à 16h (à confirmer)', jours: [[8, 16], [8, 18], [8, 18], [8, 18], [8, 18], [8, 18], [8, 18]] },
      direction: 'Au sommet de la colline, cherchez le grand édifice aux deux tours carrées.',
      cacheIndice: 'à l’intérieur',
      lettre: 'N',
      audio: null,
      fiche: 'Construite entre 1884 et 1890, pendant le protectorat français, la cathédrale est dédiée au roi Louis IX, mort devant Tunis en 1270. Elle accueille aujourd’hui concerts et expositions sous le nom d’Acropolium.',
      frise: [
        ['1270', 'Le roi de France Louis IX meurt devant Tunis, pendant une croisade.'],
        ['1884–1890', 'Construction de la cathédrale, pendant le protectorat français.'],
        ['1964', 'La cathédrale n’est plus un lieu de culte.'],
        ['Aujourd’hui', 'L’Acropolium : concerts, festivals et expositions.']
      ],
      recit: 'Devant vous se dresse la cathédrale Saint-Louis, bâtie au sommet de Byrsa entre 1884 et 1890, au début du protectorat français. Elle est dédiée au roi de France Louis IX, mort devant Tunis en 1270 alors qu’il menait une croisade. Son architecture mélange plusieurs styles : on y voit des arcs et des décors inspirés de l’art byzantin et de l’art mauresque. Depuis 1964, ce n’est plus un lieu de culte. Rebaptisée Acropolium, elle accueille aujourd’hui des concerts, des festivals et des expositions. Levez les yeux vers les décors, puis cherchez l’indice caché à l’intérieur. Le musée est juste à côté.',
      question: 'À quel roi la cathédrale est-elle dédiée ?',
      choix: ['Louis IX (Saint Louis)', 'Louis XIV', 'Charlemagne'],
      reponse: 0
    },
    {
      id: 4,
      nom: 'Musée national de Carthage',
      court: 'Musée',
      epoque: '1875',
      theme: 'Mémoire archéologique',
      lat: 36.8536, lng: 10.3241,
      prog: [130, 150],
      versSuivant: { km: 1.0, min: 5 },
      pause: true, // la pause thé suit cette étape
      horaires: { texte: 'Fermé, en réhabilitation', ferme: 'Fermé, en réhabilitation' },
      direction: 'Toujours sur la colline, à côté de la cathédrale : le bâtiment du musée.',
      cacheIndice: 'à l’entrée (musée en réhabilitation)',
      lettre: 'N',
      audio: null,
      fiche: 'Né en 1875 pour rassembler les découvertes faites à Carthage, le musée conserve stèles, mosaïques, céramiques et objets puniques et romains. Il est aujourd’hui fermé pour réhabilitation.',
      frise: [
        ['1875', 'Création d’un musée pour rassembler les découvertes de Carthage.'],
        ['XXe siècle', 'Il devient le Musée national de Carthage.'],
        ['Aujourd’hui', 'Fermé pour réhabilitation : l’indice est placé à l’entrée.']
      ],
      recit: 'Vous êtes devant le Musée national de Carthage. Depuis 1875, on y rassemble les objets découverts sur le site : stèles gravées du signe de Tanit, mosaïques, céramiques, bijoux et statues, puniques comme romains. Ces collections permettent de reconstituer la vie quotidienne d’une ville qui a été détruite, reconstruite, puis recouverte par les siècles. Le musée est actuellement fermé pour réhabilitation : c’est pourquoi l’indice de cette étape vous attend à l’entrée. Avant de repartir, profitez de la vue depuis l’esplanade : par beau temps, on voit tout le golfe de Tunis. C’est l’heure de la pause thé, face à la mer.',
      question: 'Pourquoi l’indice de cette étape est-il placé à l’entrée ?',
      choix: ['Le musée est en réhabilitation', 'L’entrée est payante', 'Il est trop tôt'],
      reponse: 0
    },
    {
      id: 5,
      nom: 'Beït al-Hikma',
      court: 'Beït al-Hikma',
      epoque: 'XIXe s. / 1983',
      theme: 'Pouvoir politique et savoir',
      lat: 36.8505, lng: 10.3340,
      prog: [195, 240],
      versSuivant: { km: 0.9, min: 5 },
      horaires: { texte: 'Lundi à vendredi 8h–15h, fermé le week-end', jours: [null, [8, 15], [8, 15], [8, 15], [8, 15], [8, 15], null] },
      direction: 'Redescendez vers la mer : un palais blanc aux arcades, face au golfe.',
      cacheIndice: 'à l’intérieur (le week-end : à l’entrée)',
      lettre: 'I',
      audio: null,
      fiche: 'Un palais du XIXe siècle au bord de la mer, devenu en 1983 le siège de l’Académie tunisienne des sciences, des lettres et des arts, Beït al-Hikma.',
      frise: [
        ['XIXe siècle', 'Construction du palais, résidence de dignitaires.'],
        ['1983', 'L’Académie tunisienne Beït al-Hikma s’y installe.'],
        ['Aujourd’hui', 'Colloques, publications et bibliothèque.']
      ],
      recit: 'Bienvenue à Beït al-Hikma, « la maison de la sagesse ». Ce palais du dix-neuvième siècle, avec ses arcades blanches et ses décors tunisiens, a d’abord été une résidence de dignitaires, liée au pouvoir politique de l’époque. Depuis 1983, il abrite l’Académie tunisienne des sciences, des lettres et des arts. Son nom reprend celui d’une institution célèbre : la Maison de la sagesse de Bagdad, où l’on traduisait et étudiait les savoirs du monde entier, il y a plus de mille ans. Ici, on organise encore des colloques et on publie des ouvrages. Respectez le calme du lieu et cherchez l’indice. Le week-end, il est placé à l’entrée.',
      question: 'Beït al-Hikma reprend le nom de quelle institution célèbre ?',
      choix: ['La Maison de la sagesse de Bagdad', 'La bibliothèque d’Alexandrie', 'L’université de la Zitouna'],
      reponse: 0
    },
    {
      id: 6,
      nom: 'Théâtre romain',
      court: 'Théâtre',
      epoque: 'IIe s. / 1964',
      theme: 'Spectacle et culture',
      lat: 36.8573, lng: 10.3290,
      prog: [245, 285],
      versSuivant: { km: 0.3, min: 2 },
      horaires: { texte: '8h–17h tous les jours', jours: tous(8, 17) },
      direction: 'Remontez vers la colline de l’Odéon : des gradins en demi-cercle vous attendent.',
      cacheIndice: 'dans les gradins',
      lettre: 'B',
      audio: null,
      fiche: 'Construit au IIe siècle et largement restauré, le théâtre accueille depuis 1964 le Festival international de Carthage.',
      frise: [
        ['IIe siècle', 'Construction du théâtre romain.'],
        ['Moyen Âge', 'Les pierres sont réutilisées, le théâtre disparaît peu à peu.'],
        ['XXe siècle', 'Fouilles et restauration.'],
        ['1964', 'Création du Festival international de Carthage.']
      ],
      recit: 'Vous voici au théâtre romain de Carthage. Construit au deuxième siècle de notre ère, il pouvait accueillir des milliers de spectateurs venus assister à des pièces, des concerts et des discours. Au fil des siècles, ses pierres ont été réutilisées ailleurs et il a presque disparu. Fouillé puis restauré au vingtième siècle, il a retrouvé sa vocation : depuis 1964, le Festival international de Carthage y accueille chaque été des artistes venus du monde entier. Asseyez-vous un instant sur les gradins et écoutez : la forme en demi-cercle porte encore la voix. L’indice se cache dans les gradins. La mosquée n’est qu’à trois cents mètres.',
      question: 'Depuis quand le Festival international de Carthage se tient-il ici ?',
      choix: ['1964', '1890', '2003'],
      reponse: 0
    },
    {
      id: 7,
      nom: 'Mosquée Mâlik ibn Anas',
      court: 'Mâlik ibn Anas',
      epoque: '2000–2003',
      theme: 'Architecture contemporaine',
      lat: 36.8598, lng: 10.3296,
      prog: [290, 315],
      versSuivant: { km: 0.8, min: 5 },
      horaires: { texte: '9h30–19h, hors heures de prière', jours: tous(9.5, 19) },
      direction: 'Cherchez le grand minaret blanc tout proche du théâtre.',
      cacheIndice: 'dans la cour',
      lettre: 'A',
      audio: null,
      fiche: 'Construite entre 2000 et 2003, elle porte le nom de l’imam Mâlik ibn Anas, fondateur de l’école malékite suivie en Tunisie.',
      frise: [
        ['VIIIe siècle', 'L’imam Mâlik ibn Anas enseigne à Médine.'],
        ['2000–2003', 'Construction de la mosquée.'],
        ['Aujourd’hui', 'Un lieu de prière et un monument contemporain.']
      ],
      recit: 'Vous voici devant la mosquée Mâlik ibn Anas, construite entre 2000 et 2003. Elle rappelle que Carthage n’est pas seulement un site antique : c’est une ville vivante. Son nom honore l’imam Mâlik ibn Anas, savant de Médine du huitième siècle, fondateur de l’école malékite, suivie en Tunisie et dans tout le Maghreb. Son architecture contemporaine s’inspire de la tradition tunisienne : grande cour, arcades et minaret carré. Habillez-vous de façon respectueuse, évitez les heures de prière et parlez à voix basse. L’indice vous attend dans la cour. Dernière étape : le cimetière américain, à huit cents mètres.',
      question: 'Quelle école de pensée a fondée l’imam Mâlik ibn Anas ?',
      choix: ['L’école malékite', 'L’école de Kairouan', 'L’école d’Athènes'],
      reponse: 0
    },
    {
      id: 8,
      nom: 'Cimetière américain',
      court: 'Cimetière',
      epoque: '1960',
      theme: 'Mémoire de la Seconde Guerre mondiale',
      lat: 36.8668, lng: 10.3290,
      prog: [320, 365],
      versSuivant: null,
      horaires: { texte: '9h–16h45 tous les jours', jours: tous(9, 16.75) },
      direction: 'Plein nord : de longues pelouses et des rangées de croix blanches.',
      cacheIndice: 'dans le mémorial',
      lettre: 'L',
      audio: null,
      fiche: 'Inauguré en 1960, le cimetière américain d’Afrique du Nord rend hommage aux soldats américains morts pendant la Seconde Guerre mondiale en Afrique du Nord.',
      frise: [
        ['1942–1943', 'Campagne d’Afrique du Nord, pendant la Seconde Guerre mondiale.'],
        ['1960', 'Inauguration du cimetière et de son mémorial.'],
        ['Aujourd’hui', 'Un lieu de mémoire entretenu, ouvert aux visiteurs.']
      ],
      recit: 'Vous arrivez au cimetière américain, la dernière étape du parcours. Inauguré en 1960, il rend hommage aux soldats américains morts pendant la Seconde Guerre mondiale, lors de la campagne d’Afrique du Nord, en 1942 et 1943. Près de trois mille d’entre eux reposent ici, sous des rangées de croix et d’étoiles de David en marbre blanc. Un long mur porte aussi les noms des disparus, dont les corps n’ont jamais été retrouvés. C’est un lieu de silence et de mémoire : marchez calmement et respectez les tombes. L’indice se cache dans le mémorial. Avec lui, vous avez les huit lettres du code de Carthage. À vous de l’ouvrir !',
      question: 'Que rappelle ce cimetière ?',
      choix: ['La Seconde Guerre mondiale', 'Les guerres puniques', 'La Première Guerre mondiale'],
      reponse: 0
    }
  ];

  /* La pause thé, entre le musée et Beït al-Hikma. */
  window.DOORBINA_PAUSE = {
    id: 99,
    nom: 'Pause thé',
    court: 'Pause thé',
    prog: [150, 195],
    audio: null,
    fiche: 'Environ 20 minutes pour souffler face à la mer, avec un thé à la menthe et aux pignons, une habitude tunisienne.',
    recit: 'C’est l’heure de souffler. Commandez un thé à la menthe, avec des pignons comme on l’aime en Tunisie, et regardez la mer. Cette mer, c’est elle qui a fait Carthage. Les Phéniciens qui ont fondé la ville venaient de Tyr, sur la côte du Liban actuel. C’étaient des navigateurs exceptionnels : ils se repéraient aux étoiles et commerçaient d’un bout à l’autre de la Méditerranée. Selon un récit antique, un Carthaginois nommé Hannon aurait même longé les côtes de l’Afrique de l’Ouest, au-delà du détroit de Gibraltar. Dans les ports de Carthage arrivaient le métal, le vin, l’huile et la précieuse teinture pourpre. Prenez votre temps, puis écrivez une phrase pour votre passeport : vous la retrouverez dans votre carnet.'
  };

  /* Les 8 lettres, dans l'ordre, forment ce code. */
  window.DOORBINA_CODE = {
    mot: 'HANNIBAL',
    secret: 'Hannibal Barca, le plus célèbre des généraux de Carthage. En 218 avant notre ère, il quitta l’Espagne avec son armée et ses éléphants, franchit les Pyrénées puis les Alpes, et battit Rome à plusieurs reprises sur son propre sol. Son nom est resté, partout dans le monde, le symbole de l’audace carthaginoise.',
    cadeau: 'Rapportez vos vélos et montrez ce QR code à l’équipe Door Bina. À la fin de la journée, le groupe en tête du classement gagne un cadeau local !'
  };

  /* Espace équipe (page #/equipe) : code PIN d'accès et « sel » qui signe les scores.
     Changez ces deux valeurs avant le lancement. */
  window.DOORBINA_STAFF = { pin: '2026', sel: 'carthage-hannibal-814' };

  /* Photos libres de droits (Wikimedia Commons). Le crédit de l'auteur et la licence
     doivent rester affichés sous chaque photo. Clé = id du lieu (99 = pause thé). */
  const cc = (fichier) => 'https://commons.wikimedia.org/wiki/File:' + fichier;
  window.DOORBINA_PHOTOS = {
    1: { src: 'img/01-dar-el-hout.jpg', auteur: 'Shoestring', licence: 'CC BY-SA 4.0', url: cc('Oceanographic_Museum_of_Carthage.jpg') },
    2: { src: 'img/02-byrsa.jpg', auteur: 'BishkekRocks', licence: 'Domaine public', url: cc('Quartier_Punique.JPG') },
    3: { src: 'img/03-cathedrale.jpg', auteur: 'Niels Elgaard Larsen', licence: 'CC BY-SA 4.0', url: cc('Acropolium.jpg') },
    4: { src: 'img/04-musee.jpg', auteur: 'Touzrimounir', licence: 'CC BY-SA 4.0', url: cc('Carthage_National_Museum_043.jpg') },
    5: { src: 'img/05-beit-al-hikma.jpg', auteur: 'Emna Mizouni', licence: 'CC BY-SA 4.0', url: cc('Beit_El_Hekma.jpg') },
    6: { src: 'img/06-theatre.jpg', auteur: 'Paul SKG', licence: 'CC BY-SA 2.0', url: cc('Roman_Theater_of_Carthage.jpg') },
    7: { src: 'img/07-mosquee.jpg', auteur: 'Asram (Wikipédia)', licence: 'CC BY-SA 2.5', url: cc('Carthage_mosquee1.jpg') },
    8: { src: 'img/08-cimetiere.jpg', auteur: 'RAFFA Ranya', licence: 'CC BY-SA 4.0', url: cc('Carthage_American_Cemetery_of_the_Second_World_War_1.jpg') },
    99: { src: 'img/pause-mer.jpg', auteur: 'LBM1948', licence: 'CC BY-SA 4.0', url: cc('Cartago_1992_01.jpg') }
  };

  /* Point de retour des vélos : la course au cadeau se termine ici.
     À REMPLACER par l'adresse réelle de l'agence (coordonnées provisoires : Salammbô). */
  window.DOORBINA_RETOUR = {
    id: 0,
    nom: 'Point de retour des vélos',
    court: 'Retour',
    lat: 36.8400, lng: 10.3236,
    texte: 'Rapportez les vélos à l’agence Door Bina. Le premier groupe arrivé gagne le cadeau du jour.'
  };

  /* Audioguides en anglais et en arabe (le français est dans chaque lieu, ci-dessus).
     Clé = id du lieu (99 = pause thé). Pour un vrai enregistrement, indiquez dans le lieu
     « audio: { fr: 'audio/1-fr.mp3', en: 'audio/1-en.mp3', ar: 'audio/1-ar.mp3' } ».
     Traductions à faire relire avant le lancement. */
  /* Audioguides enregistrés : audio/<langue>/<id>.mp3 (ex. audio/ar/1.mp3).
     Voix neuronales : Henri (fr), Ryan (en), Hédi (ar, Tunisie). Si un fichier manque,
     l'app lit le texte avec la voix du téléphone. Mettez null pour toujours utiliser le téléphone. */
  window.DOORBINA_MP3 = 'audio';

  window.DOORBINA_AUDIO = {
    en: {
      1: { nom: 'Dar El Hout', recit: 'Welcome to Dar El Hout, the starting point of your adventure. In Tunisian Arabic, Dar El Hout means “the house of the fish”. Here, on the shore of the gulf, an oceanographic station was founded in 1924 to study the sea. Researchers still work here today on fish, currents and fishing, and the museum displays aquariums and marine collections. Starting here is no accident: Carthage was born from the sea. Its founders were sailors from Tyre, and all its wealth arrived by ship. Explore the museum: this stage’s clue is hidden inside. Then head for Byrsa Hill, one and a half kilometres away.' },
      2: { nom: 'Byrsa Hill', recit: 'You are on Byrsa Hill, the historic heart of Carthage. According to legend, Queen Elissa, whom the Romans called Dido, arrived from Tyre and asked for as much land as an ox hide could cover. She cut the hide into thin strips and encircled the whole hill. Here, archaeologists uncovered a Punic residential quarter, with its streets, houses and cisterns. In 146 BC, Rome destroyed the city. Later, the Romans levelled the summit to build their own centre, with large public spaces. Stroll through the Punic quarter: the clue is hidden there. The cathedral is only a hundred metres away.' },
      3: { nom: 'Saint Louis Cathedral', recit: 'Before you stands Saint Louis Cathedral, built on top of Byrsa between 1884 and 1890, at the beginning of the French protectorate. It is dedicated to the French king Louis the Ninth, who died before Tunis in 1270 while leading a crusade. Its architecture mixes several styles: you can see arches and decorations inspired by Byzantine and Moorish art. Since 1964, it has no longer been a place of worship. Renamed the Acropolium, it now hosts concerts, festivals and exhibitions. Look up at the decorations, then find the clue hidden inside. The museum is right next door.' },
      4: { nom: 'National Museum of Carthage', recit: 'You are in front of the National Museum of Carthage. Since 1875, the objects found on the site have been gathered here: steles engraved with the sign of Tanit, mosaics, ceramics, jewellery and statues, both Punic and Roman. These collections help us picture the daily life of a city that was destroyed, rebuilt, then buried by the centuries. The museum is currently closed for renovation: that is why this stage’s clue is waiting for you at the entrance. Before you leave, enjoy the view from the esplanade: on a clear day, you can see the whole Gulf of Tunis. It is time for a tea break, facing the sea.' },
      5: { nom: 'Beit al-Hikma', recit: 'Welcome to Beit al-Hikma, “the house of wisdom”. This nineteenth-century palace, with its white arcades and Tunisian decorations, was first a residence for dignitaries, linked to the political power of the time. Since 1983, it has housed the Tunisian Academy of Sciences, Letters and Arts. Its name echoes a famous institution: the House of Wisdom in Baghdad, where the knowledge of the whole world was translated and studied more than a thousand years ago. Conferences are still held here and books are still published. Please respect the calm of the place and look for the clue. At the weekend, it is placed at the entrance.' },
      6: { nom: 'Roman Theatre', recit: 'Here you are at the Roman theatre of Carthage. Built in the second century AD, it could hold thousands of spectators who came to watch plays, concerts and speeches. Over the centuries, its stones were reused elsewhere and it almost disappeared. Excavated and then restored in the twentieth century, it found its purpose again: since 1964, the International Festival of Carthage has welcomed artists from all over the world here every summer. Sit on the steps for a moment and listen: the semicircular shape still carries the voice. The clue is hidden in the stands. The mosque is only three hundred metres away.' },
      7: { nom: 'Malik ibn Anas Mosque', recit: 'Here you are in front of the Malik ibn Anas Mosque, built between 2000 and 2003. It is a reminder that Carthage is not only an ancient site: it is a living city. Its name honours Imam Malik ibn Anas, an eighth-century scholar from Medina and the founder of the Maliki school, followed in Tunisia and throughout the Maghreb. Its contemporary architecture draws on Tunisian tradition: a large courtyard, arcades and a square minaret. Please dress respectfully, avoid prayer times and speak softly. The clue is waiting for you in the courtyard. Last stage: the American cemetery, eight hundred metres away.' },
      8: { nom: 'American Cemetery', recit: 'You have reached the American cemetery, the last stage of the route. Opened in 1960, it honours the American soldiers who died during the Second World War, in the North African campaign of 1942 and 1943. Nearly three thousand of them rest here, beneath rows of white marble crosses and Stars of David. A long wall also bears the names of the missing, whose bodies were never found. This is a place of silence and remembrance: walk calmly and respect the graves. The clue is hidden in the memorial. With it, you have all eight letters of the Carthage code. Now it is up to you to unlock it!' },
      99: { nom: 'Tea break', recit: 'Time to catch your breath. Order a mint tea, with pine nuts as we love it in Tunisia, and look at the sea. This sea is what made Carthage. The Phoenicians who founded the city came from Tyre, on the coast of present-day Lebanon. They were exceptional sailors: they found their way by the stars and traded from one end of the Mediterranean to the other. According to an ancient account, a Carthaginian named Hanno even sailed along the coasts of West Africa, beyond the Strait of Gibraltar. Metal, wine, oil and the precious purple dye arrived in the ports of Carthage. Take your time, then write a sentence for your passport: you will find it in your notebook.' }
    },
    ar: {
      1: { nom: 'دار الحوت', recit: 'مرحبًا بكم في دار الحوت، نقطة انطلاق مغامرتكم. في اللهجة التونسية، تعني «دار الحوت» بيت السمك. هنا، على شاطئ الخليج، أُسِّست سنة 1924 محطة لعلوم البحار لدراسة البحر. وما زال الباحثون يعملون فيها اليوم على الأسماك والتيارات البحرية والصيد، ويعرض المتحف أحواضًا للأسماك ومجموعات بحرية. ليس الانطلاق من هنا صدفة: فقرطاج وُلدت من البحر. كان مؤسسوها بحّارة قدموا من صور، وكل ثرائها وصلها على متن السفن. استكشفوا المتحف: فدليل هذه المرحلة مخبّأ في داخله. بعد ذلك، توجّهوا إلى هضبة بيرصا، على بعد كيلومتر ونصف.' },
      2: { nom: 'هضبة بيرصا', recit: 'أنتم على هضبة بيرصا، القلب التاريخي لقرطاج. تقول الأسطورة إن الملكة عليسة، التي سمّاها الرومان ديدون، قدمت من صور وطلبت من الأرض ما يغطيه جلد ثور. فقطّعت الجلد إلى سيور رفيعة وأحاطت بها الهضبة كلها. هنا كشف علماء الآثار عن حيّ سكني بونيقي، بشوارعه ومنازله وصهاريجه. في سنة 146 قبل الميلاد، دمّرت روما المدينة. ثم سوّى الرومان قمة الهضبة ليبنوا عليها مركزهم، بساحاته العامة الواسعة. تجوّلوا في الحيّ البونيقي: فالدليل مخبّأ هناك. الكاتدرائية لا تبعد سوى مئة متر.' },
      3: { nom: 'كاتدرائية القديس لويس', recit: 'أمامكم كاتدرائية القديس لويس، شُيّدت على قمة بيرصا بين سنتي 1884 و1890، في بداية الحماية الفرنسية. وهي مُهداة إلى ملك فرنسا لويس التاسع، الذي توفي أمام تونس سنة 1270 وهو يقود حملة صليبية. تمزج عمارتها بين عدة أساليب: فنرى فيها أقواسًا وزخارف مستوحاة من الفن البيزنطي والفن الأندلسي المغاربي. منذ سنة 1964 لم تعد مكانًا للعبادة. وقد صار اسمها «الأكروبوليوم»، وتحتضن اليوم حفلات موسيقية ومهرجانات ومعارض. ارفعوا أعينكم نحو الزخارف، ثم ابحثوا عن الدليل المخبّأ في الداخل. المتحف على مقربة منكم.' },
      4: { nom: 'المتحف الوطني بقرطاج', recit: 'أنتم أمام المتحف الوطني بقرطاج. منذ سنة 1875 تُجمع هنا القطع المكتشفة في الموقع: أنصاب منقوش عليها رمز تانيت، وفسيفساء، وخزف، وحليّ، وتماثيل، بونيقية ورومانية. تساعدنا هذه المجموعات على تصوّر الحياة اليومية لمدينة دُمّرت، ثم أُعيد بناؤها، ثم غطّتها القرون. المتحف مغلق حاليًا للترميم: لذلك ينتظركم دليل هذه المرحلة عند المدخل. قبل أن تغادروا، استمتعوا بالمنظر من الساحة: ففي الطقس الصافي يُرى خليج تونس كله. حان وقت استراحة الشاي، قبالة البحر.' },
      5: { nom: 'بيت الحكمة', recit: 'مرحبًا بكم في بيت الحكمة. كان هذا القصر، الذي يعود إلى القرن التاسع عشر بأقواسه البيضاء وزخارفه التونسية، في البداية مقرّ إقامة لكبار الشخصيات، مرتبطًا بالسلطة السياسية في ذلك العصر. ومنذ سنة 1983 يحتضن المجمع التونسي للعلوم والآداب والفنون. ويستعيد اسمه اسم مؤسسة شهيرة: بيت الحكمة في بغداد، حيث كانت معارف العالم كله تُترجم وتُدرس، منذ أكثر من ألف عام. وما زالت تُنظّم فيه الندوات وتُنشر فيه الكتب. احترموا هدوء المكان وابحثوا عن الدليل. في عطلة نهاية الأسبوع، يوضع الدليل عند المدخل.' },
      6: { nom: 'المسرح الروماني', recit: 'ها أنتم في المسرح الروماني بقرطاج. بُني في القرن الثاني الميلادي، وكان يتّسع لآلاف المتفرّجين الذين يأتون لمشاهدة المسرحيات والحفلات والخطب. وعلى مرّ القرون، أُعيد استعمال حجارته في أماكن أخرى حتى كاد يختفي. وبعد التنقيب عنه وترميمه في القرن العشرين، استعاد دوره: فمنذ سنة 1964 يستقبل فيه مهرجان قرطاج الدولي كل صيف فنانين من العالم كله. اجلسوا قليلًا على المدارج واستمعوا: فشكله نصف الدائري ما زال يحمل الصوت. الدليل مخبّأ في المدارج. الجامع لا يبعد سوى ثلاثمئة متر.' },
      7: { nom: 'جامع مالك بن أنس', recit: 'ها أنتم أمام جامع مالك بن أنس، الذي شُيّد بين سنتي 2000 و2003. وهو يذكّرنا بأن قرطاج ليست موقعًا أثريًا فحسب، بل مدينة حيّة. يحمل اسم الإمام مالك بن أنس، عالم المدينة المنورة في القرن الثامن الميلادي ومؤسس المذهب المالكي، المتّبع في تونس وفي بلدان المغرب كلها. تستلهم عمارته المعاصرة التقاليد التونسية: صحن واسع، وأروقة، وصومعة مربعة. ارتدوا لباسًا محتشمًا، وتجنّبوا أوقات الصلاة، وتحدّثوا بصوت منخفض. الدليل ينتظركم في الصحن. المرحلة الأخيرة: المقبرة الأمريكية، على بعد ثمانمئة متر.' },
      8: { nom: 'المقبرة الأمريكية', recit: 'وصلتم إلى المقبرة الأمريكية، آخر مراحل المسار. افتُتحت سنة 1960، وهي تكرّم الجنود الأمريكيين الذين لقوا حتفهم خلال الحرب العالمية الثانية، في حملة شمال إفريقيا سنتي 1942 و1943. يرقد هنا قرابة ثلاثة آلاف منهم، تحت صفوف من الصلبان ونجوم داود من الرخام الأبيض. ويحمل جدار طويل أيضًا أسماء المفقودين الذين لم يُعثر على رفاتهم قط. إنه مكان صمت وذاكرة: امشوا بهدوء واحترموا القبور. الدليل مخبّأ في النصب التذكاري. وبه تكتمل لديكم الحروف الثمانية لرمز قرطاج. والآن، حان دوركم لفتحه!' },
      99: { nom: 'استراحة الشاي', recit: 'حان وقت الاستراحة. اطلبوا شايًا بالنعناع، مع الصنوبر كما نحبّه في تونس، وتأمّلوا البحر. هذا البحر هو الذي صنع قرطاج. فالفينيقيون الذين أسّسوا المدينة قدموا من صور، على ساحل لبنان الحالي. كانوا بحّارة استثنائيين: يهتدون بالنجوم ويتاجرون من أقصى البحر الأبيض المتوسط إلى أقصاه. وتروي إحدى الروايات القديمة أن قرطاجيًا يُدعى حنّون أبحر على طول سواحل غرب إفريقيا، إلى ما وراء مضيق جبل طارق. وكانت تصل إلى موانئ قرطاج المعادن والخمر والزيت وصبغة الأرجوان الثمينة. خذوا وقتكم، ثم اكتبوا جملة لجواز سفركم: ستجدونها في دفتركم.' }
    }
  };

  /* Texte LU par la voix arabe (différent du texte affiché) : entièrement vocalisé (tachkil),
     années écrites en lettres, noms propres vocalisés. C'est ce qui corrige la prononciation.
     Si vous changez un récit arabe, changez aussi sa « lecture », puis régénérez le MP3. */
  const LECTURE_AR = {
    1: 'دارُ الحُوت. مَرْحَبًا بِكُمْ في دارِ الحُوت، نُقْطَةِ انْطِلاقِ مُغامَرَتِكُم. في اللَّهْجَةِ التّونِسِيَّة، تَعْني «دارُ الحُوت» بَيْتَ السَّمَك. هُنا، على شاطِئِ الخَليج، أُسِّسَتْ سَنَةَ أَلْفٍ وَتِسْعِمِئَةٍ وَأَرْبَعٍ وَعِشْرين مَحَطَّةٌ لِعُلومِ البِحار. وَما زالَ الباحِثونَ يَعْمَلونَ فيها اليَوْمَ على الأَسْماكِ وَالتَّيّاراتِ البَحْرِيَّةِ وَالصَّيْد، وَيَعْرِضُ المَتْحَفُ أَحْواضًا لِلأَسْماكِ وَمَجْموعاتٍ بَحْرِيَّة. لَيْسَ الانْطِلاقُ مِنْ هُنا صُدْفَة: فَقَرْطاجُ وُلِدَتْ مِنَ البَحْر. كانَ مُؤَسِّسوها بَحّارَةً قَدِموا مِنْ صُور، وَكُلُّ ثَرائِها وَصَلَها على مَتْنِ السُّفُن. اِسْتَكْشِفوا المَتْحَف: فَدَليلُ هذِهِ المَرْحَلَةِ مُخَبَّأٌ في داخِلِه. بَعْدَ ذلِك، تَوَجَّهوا إلى هَضَبَةِ بيرْصا، على بُعْدِ كيلومِتْرٍ وَنِصْف.',
    2: 'هَضَبَةُ بيرْصا. أَنْتُمْ على هَضَبَةِ بيرْصا، القَلْبِ التّاريخِيِّ لِقَرْطاج. تَقولُ الأُسْطورَةُ إِنَّ المَلِكَةَ عِلِّيسَة، الَّتي سَمّاها الرّومانُ ديدون، قَدِمَتْ مِنْ صُور، وَطَلَبَتْ مِنَ الأَرْضِ ما يُغَطّيهِ جِلْدُ ثَوْر. فَقَطَّعَتِ الجِلْدَ إلى سُيورٍ رَفيعَة، وَأَحاطَتْ بِها الهَضَبَةَ كُلَّها. هُنا كَشَفَ عُلَماءُ الآثارِ عَنْ حَيٍّ سَكَنِيٍّ بونيقِيّ، بِشَوارِعِهِ وَمَنازِلِهِ وَصَهاريجِه. في سَنَةِ مِئَةٍ وَسِتٍّ وَأَرْبَعينَ قَبْلَ الميلاد، دَمَّرَتْ روما المَدينَة. ثُمَّ سَوّى الرّومانُ قِمَّةَ الهَضَبَةِ لِيَبْنوا عَلَيْها مَرْكَزَهُم، بِساحاتِهِ العامَّةِ الواسِعَة. تَجَوَّلوا في الحَيِّ البونيقِيّ: فَالدَّليلُ مُخَبَّأٌ هُناك. الكاتِدْرائِيَّةُ لا تَبْعُدُ سِوى مِئَةِ مِتْر.',
    3: 'كاتِدْرائِيَّةُ القِدّيسِ لويس. أَمامَكُمْ كاتِدْرائِيَّةُ القِدّيسِ لويس، شُيِّدَتْ على قِمَّةِ بيرْصا بَيْنَ سَنَتَيْ أَلْفٍ وَثَمانِمِئَةٍ وَأَرْبَعٍ وَثَمانين، وَأَلْفٍ وَثَمانِمِئَةٍ وَتِسْعين، في بِدايَةِ الحِمايَةِ الفَرَنْسِيَّة. وَهِيَ مُهْداةٌ إلى مَلِكِ فَرَنْسا لويسَ التّاسِع، الَّذي تُوُفِّيَ أَمامَ تونِسَ سَنَةَ أَلْفٍ وَمِئَتَيْنِ وَسَبْعين، وَهُوَ يَقودُ حَمْلَةً صَليبِيَّة. تَمْزُجُ عِمارَتُها بَيْنَ عِدَّةِ أَساليب: فَنَرى فيها أَقْواسًا وَزَخارِفَ مُسْتَوْحاةً مِنَ الفَنِّ البيزَنْطِيِّ وَالفَنِّ الأَنْدَلُسِيِّ المَغارِبِيّ. مُنْذُ سَنَةِ أَلْفٍ وَتِسْعِمِئَةٍ وَأَرْبَعٍ وَسِتّين، لَمْ تَعُدْ مَكانًا لِلْعِبادَة. وَقَدْ صارَ اسْمُها «الأَكْروبوليوم»، وَتَحْتَضِنُ اليَوْمَ حَفَلاتٍ موسيقِيَّةً وَمَهْرَجاناتٍ وَمَعارِض. اِرْفَعوا أَعْيُنَكُمْ نَحْوَ الزَّخارِف، ثُمَّ ابْحَثوا عَنِ الدَّليلِ المُخَبَّأِ في الدّاخِل. المَتْحَفُ على مَقْرُبَةٍ مِنْكُم.',
    4: 'المَتْحَفُ الوَطَنِيُّ بِقَرْطاج. أَنْتُمْ أَمامَ المَتْحَفِ الوَطَنِيِّ بِقَرْطاج. مُنْذُ سَنَةِ أَلْفٍ وَثَمانِمِئَةٍ وَخَمْسٍ وَسَبْعين، تُجْمَعُ هُنا القِطَعُ المُكْتَشَفَةُ في المَوْقِع: أَنْصابٌ مَنْقوشٌ عَلَيْها رَمْزُ تانيت، وَفُسَيْفِساء، وَخَزَف، وَحُلِيّ، وَتَماثيل، بونيقِيَّةٌ وَرومانِيَّة. تُساعِدُنا هذِهِ المَجْموعاتُ على تَصَوُّرِ الحَياةِ اليَوْمِيَّةِ لِمَدينَةٍ دُمِّرَتْ، ثُمَّ أُعيدَ بِناؤُها، ثُمَّ غَطَّتْها القُرون. المَتْحَفُ مُغْلَقٌ حالِيًّا لِلتَّرْميم: لِذلِكَ يَنْتَظِرُكُمْ دَليلُ هذِهِ المَرْحَلَةِ عِنْدَ المَدْخَل. قَبْلَ أَنْ تُغادِروا، اِسْتَمْتِعوا بِالمَنْظَرِ مِنَ السّاحَة: فَفي الطَّقْسِ الصّافي، يُرى خَليجُ تونِسَ كُلُّه. حانَ وَقْتُ اسْتِراحَةِ الشّاي، قُبالَةَ البَحْر.',
    5: 'بَيْتُ الحِكْمَة. مَرْحَبًا بِكُمْ في بَيْتِ الحِكْمَة. كانَ هذا القَصْر، الَّذي يَعودُ إلى القَرْنِ التّاسِعَ عَشَر، بِأَقْواسِهِ البَيْضاءِ وَزَخارِفِهِ التّونِسِيَّة، في البِدايَةِ مَقَرَّ إِقامَةٍ لِكِبارِ الشَّخْصِيّات، مُرْتَبِطًا بِالسُّلْطَةِ السِّياسِيَّةِ في ذلِكَ العَصْر. وَمُنْذُ سَنَةِ أَلْفٍ وَتِسْعِمِئَةٍ وَثَلاثٍ وَثَمانين، يَحْتَضِنُ المَجْمَعَ التّونِسِيَّ لِلْعُلومِ وَالآدابِ وَالفُنون. وَيَسْتَعيدُ اسْمُهُ اسْمَ مُؤَسَّسَةٍ شَهيرَة: بَيْتُ الحِكْمَةِ في بَغْداد، حَيْثُ كانَتْ مَعارِفُ العالَمِ كُلِّهِ تُتَرْجَمُ وَتُدْرَس، مُنْذُ أَكْثَرَ مِنْ أَلْفِ عام. وَما زالَتْ تُنَظَّمُ فيهِ النَّدَواتُ وَتُنْشَرُ فيهِ الكُتُب. اِحْتَرِموا هُدوءَ المَكانِ وَابْحَثوا عَنِ الدَّليل. في عُطْلَةِ نِهايَةِ الأُسْبوع، يوضَعُ الدَّليلُ عِنْدَ المَدْخَل.',
    6: 'المَسْرَحُ الرّومانِيّ. ها أَنْتُمْ في المَسْرَحِ الرّومانِيِّ بِقَرْطاج. بُنِيَ في القَرْنِ الثّاني الميلادِيّ، وَكانَ يَتَّسِعُ لِآلافِ المُتَفَرِّجينَ الَّذينَ يَأْتونَ لِمُشاهَدَةِ المَسْرَحِيّاتِ وَالحَفَلاتِ وَالخُطَب. وَعلى مَرِّ القُرون، أُعيدَ اسْتِعْمالُ حِجارَتِهِ في أَماكِنَ أُخْرى، حَتّى كادَ يَخْتَفي. وَبَعْدَ التَّنْقيبِ عَنْهُ وَتَرْميمِهِ في القَرْنِ العِشْرين، اسْتَعادَ دَوْرَه: فَمُنْذُ سَنَةِ أَلْفٍ وَتِسْعِمِئَةٍ وَأَرْبَعٍ وَسِتّين، يَسْتَقْبِلُ فيهِ مَهْرَجانُ قَرْطاجَ الدَّوْلِيُّ كُلَّ صَيْفٍ فَنّانينَ مِنَ العالَمِ كُلِّه. اِجْلِسوا قَليلًا على المَدارِجِ وَاسْتَمِعوا: فَشَكْلُهُ نِصْفُ الدّائِرِيِّ ما زالَ يَحْمِلُ الصَّوْت. الدَّليلُ مُخَبَّأٌ في المَدارِج. الجامِعُ لا يَبْعُدُ سِوى ثَلاثِمِئَةِ مِتْر.',
    7: 'جامِعُ مالِكِ بْنِ أَنَس. ها أَنْتُمْ أَمامَ جامِعِ مالِكِ بْنِ أَنَس، الَّذي شُيِّدَ بَيْنَ سَنَتَيْ أَلْفَيْنِ وَأَلْفَيْنِ وَثَلاث. وَهُوَ يُذَكِّرُنا بِأَنَّ قَرْطاجَ لَيْسَتْ مَوْقِعًا أَثَرِيًّا فَحَسْب، بَلْ مَدينَةٌ حَيَّة. يَحْمِلُ اسْمَ الإِمامِ مالِكِ بْنِ أَنَس، عالِمِ المَدينَةِ المُنَوَّرَةِ في القَرْنِ الثّامِنِ الميلادِيّ، وَمُؤَسِّسِ المَذْهَبِ المالِكِيّ، المُتَّبَعِ في تونِسَ وَفي بُلْدانِ المَغْرِبِ كُلِّها. تَسْتَلْهِمُ عِمارَتُهُ المُعاصِرَةُ التَّقاليدَ التّونِسِيَّة: صَحْنٌ واسِع، وَأَرْوِقَة، وَصَوْمَعَةٌ مُرَبَّعَة. اِرْتَدوا لِباسًا مُحْتَشِمًا، وَتَجَنَّبوا أَوْقاتَ الصَّلاة، وَتَحَدَّثوا بِصَوْتٍ مُنْخَفِض. الدَّليلُ يَنْتَظِرُكُمْ في الصَّحْن. المَرْحَلَةُ الأَخيرَة: المَقْبَرَةُ الأَمْريكِيَّة، على بُعْدِ ثَمانِمِئَةِ مِتْر.',
    8: 'المَقْبَرَةُ الأَمْريكِيَّة. وَصَلْتُمْ إلى المَقْبَرَةِ الأَمْريكِيَّة، آخِرِ مَراحِلِ المَسار. اُفْتُتِحَتْ سَنَةَ أَلْفٍ وَتِسْعِمِئَةٍ وَسِتّين، وَهِيَ تُكَرِّمُ الجُنودَ الأَمْريكِيّينَ الَّذينَ لَقُوا حَتْفَهُمْ خِلالَ الحَرْبِ العالَمِيَّةِ الثّانِيَة، في حَمْلَةِ شَمالِ إِفْريقْيا، سَنَتَيْ أَلْفٍ وَتِسْعِمِئَةٍ وَاثْنَيْنِ وَأَرْبَعين، وَثَلاثٍ وَأَرْبَعين. يَرْقُدُ هُنا قُرابَةُ ثَلاثَةِ آلافٍ مِنْهُم، تَحْتَ صُفوفٍ مِنَ الصُّلْبانِ وَنُجومِ داوُدَ مِنَ الرُّخامِ الأَبْيَض. وَيَحْمِلُ جِدارٌ طَويلٌ أَيْضًا أَسْماءَ المَفْقودينَ الَّذينَ لَمْ يُعْثَرْ على رُفاتِهِمْ قَطّ. إِنَّهُ مَكانُ صَمْتٍ وَذاكِرَة: اِمْشوا بِهُدوءٍ وَاحْتَرِموا القُبور. الدَّليلُ مُخَبَّأٌ في النُّصُبِ التِّذْكارِيّ. وَبِهِ تَكْتَمِلُ لَدَيْكُمُ الحُروفُ الثَّمانِيَةُ لِرَمْزِ قَرْطاج. وَالآن، حانَ دَوْرُكُمْ لِفَتْحِه!',
    99: 'اِسْتِراحَةُ الشّاي. حانَ وَقْتُ الاسْتِراحَة. اُطْلُبوا شايًا بِالنَّعْناع، مَعَ الصَّنَوْبَرِ كَما نُحِبُّهُ في تونِس، وَتَأَمَّلوا البَحْر. هذا البَحْرُ هُوَ الَّذي صَنَعَ قَرْطاج. فَالفينيقِيّونَ الَّذينَ أَسَّسوا المَدينَةَ قَدِموا مِنْ صُور، على ساحِلِ لُبْنانَ الحالِيّ. كانوا بَحّارَةً اسْتِثْنائِيّين: يَهْتَدونَ بِالنُّجوم، وَيَتاجِرونَ مِنْ أَقْصى البَحْرِ الأَبْيَضِ المُتَوَسِّطِ إلى أَقْصاه. وَتَرْوي إِحْدى الرِّواياتِ القَديمَةِ أَنَّ قَرْطاجِيًّا يُدْعى حَنّون، أَبْحَرَ على طولِ سَواحِلِ غَرْبِ إِفْريقْيا، إلى ما وَراءَ مَضيقِ جَبَلِ طارِق. وَكانَتْ تَصِلُ إلى مَوانِئِ قَرْطاجَ المَعادِنُ وَالخَمْرُ وَالزَّيْتُ وَصِبْغَةُ الأُرْجُوانِ الثَّمينَة. خُذوا وَقْتَكُم، ثُمَّ اكْتُبوا جُمْلَةً لِجَوازِ سَفَرِكُم: سَتَجِدونَها في دَفْتَرِكُم.'
  };
  Object.keys(LECTURE_AR).forEach((id) => { window.DOORBINA_AUDIO.ar[id].lecture = LECTURE_AR[id]; });

  /* Audioguide en derja tunisienne (dialecte), lu par les voix tunisiennes. À faire relire. */
  window.DOORBINA_AUDIO.tn = {
    1: { nom: 'دار الحوت', recit: 'مرحبا بيكم في دار الحوت، منين تبدا المغامرة متاعكم. «دار الحوت» معناها الدار متاع الحوت. هوني، على شط البحر، تعملت في عام ألف وتسعمية وأربعة وعشرين محطة باش يدرسو البحر. لتوّا فمّا باحثين يخدمو فيها على الحوت والتيارات والصيد، والمتحف فيه أكواريومات وحاجات بحرية برشا. موش صدفة اللي نبداو من هوني: قرطاج تولدت من البحر. اللي بناوها كانو بحّارة جاو من صور، وكل الخير متاعها جاها في البابورات. دوّرو في المتحف: الدليل متاع المرحلة هاذي مخبّي لداخل. ومن بعد، امشيو لهضبة بيرصا، على كيلومتر ونص.' },
    2: { nom: 'بيرصا', recit: 'إنتوما توّا فوق هضبة بيرصا، قلب قرطاج. الحكاية تقول اللي الملكة عليسة، اللي الرومان سمّاوها ديدون، جات من صور وطلبت من الأرض قد ما تغطّي جلدة ثور. قصّت الجلدة خيوط رقاق رقاق، ودوّرت بيهم الهضبة الكل. هوني، علماء الآثار لقاو حومة بونيقية، بزناقيها وديارها ومواجلها. في عام مية وستة وأربعين قبل الميلاد، روما هدّت المدينة. ومن بعد، الرومان سوّاو راس الهضبة باش يبنيو المركز متاعهم، بساحات كبار. دوّرو في الحومة البونيقية: الدليل مخبّي غادي. والكاتدرائية ما تبعدش كان مية متر.' },
    3: { nom: 'الكاتدرائية', recit: 'قدّامكم كاتدرائية سان لويس، تبنات فوق بيرصا بين عام ألف وثمنمية وأربعة وثمانين وعام ألف وثمنمية وتسعين، في أوّل الحماية الفرنسية. سمّاوها على ملك فرنسا لويس التاسع، اللي مات قدّام تونس في عام ألف ومتين وسبعين وهو يقود في حملة صليبية. البني متاعها فيه برشا أساليب: قواس وتزويق من الفن البيزنطي والفن الأندلسي. من عام ألف وتسعمية وأربعة وستين، ما عادش فيها صلاة. توّا اسمها الأكروبوليوم، وفيها حفلات ومهرجانات ومعارض. ارفعو عينيكم للتزويق، ومن بعد لوّجو على الدليل لداخل. المتحف حذاها طول.' },
    4: { nom: 'المتحف', recit: 'إنتوما قدّام المتحف الوطني متاع قرطاج. من عام ألف وثمنمية وخمسة وسبعين، يلمّو هوني الحاجات اللي لقاوها في الموقع: حجر منقوش عليه علامة تانيت، فسيفساء، فخّار، صيغة وتماثيل، بونيقية ورومانية. الحاجات هاذي تعاوننا باش نتخيّلو حياة الناس في مدينة تهدّت، وتعاودت تبنات، ومن بعد غطّاتها السنين. المتحف مسكّر توّا للترميم: على هاذاكا الدليل يستنّى فيكم عند الباب. قبل ما تمشيو، تفرّجو في المنظر: كي يكون الطقس صافي، تشوفو خليج تونس الكل. توّا وقت التاي، قدّام البحر.' },
    5: { nom: 'بيت الحكمة', recit: 'مرحبا بيكم في بيت الحكمة. القصر هذا من القرن التسعطاش، بقواسو البيض وتزويقو التونسي، كان في الأوّل دار سكنى لناس كبار، مربوطة بالحكم في ذاك الوقت. ومن عام ألف وتسعمية وثلاثة وثمانين، ولّا فيه المجمع التونسي للعلوم والآداب والفنون. اسمو جاي من مؤسسة مشهورة: بيت الحكمة في بغداد، اللي كانو يترجمو ويقراو فيها علوم الدنيا الكل، من أكثر من ألف عام. لتوّا يعملو فيه ندوات ويطلّعو كتب. احترمو الهدوء متاع البلاصة ولوّجو على الدليل. في السبت والأحد، يكون عند الباب.' },
    6: { nom: 'المسرح الروماني', recit: 'هاكم في المسرح الروماني متاع قرطاج. تبنى في القرن الثاني بعد الميلاد، وكان ياخو آلاف الناس اللي يجيو يتفرّجو في المسرحيات والحفلات والخطب. مع السنين، الحجر متاعو هزّوه لبلايص أخرين، وقريب يتمحى. كي حفرو عليه ورمّموه في القرن العشرين، رجعلو دورو: من عام ألف وتسعمية وأربعة وستين، مهرجان قرطاج الدولي يستقبل فيه كل صيف فنانين من الدنيا الكل. اقعدو شويّة على الدروج واسمعو: الشكل متاعو نص دايرة ومازال يهزّ الصوت. الدليل مخبّي في الدروج. والجامع ما يبعدش كان ثلاثمية متر.' },
    7: { nom: 'جامع مالك بن أنس', recit: 'هاكم قدّام جامع مالك بن أنس، تبنى بين عام ألفين وعام ألفين وثلاثة. يفكّرنا اللي قرطاج موش كان آثار: هي مدينة حيّة. اسمو على الإمام مالك بن أنس، عالم من المدينة المنوّرة في القرن الثامن، ومؤسس المذهب المالكي اللي يتبعوه في تونس والمغرب العربي الكل. البني متاعو جديد أما مستلهم من التقاليد التونسية: صحن كبير، قواس، وصومعة مربّعة. البسو لبسة محترمة، تجنّبو أوقات الصلاة، واحكيو بالشويّة. الدليل يستنّى فيكم في الصحن. آخر مرحلة: المقبرة الأمريكية، على ثمنمية متر.' },
    8: { nom: 'المقبرة الأمريكية', recit: 'وصلتو للمقبرة الأمريكية، آخر مرحلة في الطريق. تحلّت في عام ألف وتسعمية وستين، وهي تكرّم الجنود الأمريكان اللي ماتو في الحرب العالمية الثانية، في حملة شمال إفريقيا، في عام ألف وتسعمية واثنين وأربعين وثلاثة وأربعين. فمّا قريب ثلاثة آلاف منهم مدفونين هوني، تحت صفوف صلبان ونجوم داوود من الرخام الأبيض. وفمّا حيط طويل مكتوب عليه أسامي المفقودين اللي عمرهم ما لقاو جثثهم. البلاصة هاذي متاع سكات وذكرى: امشيو بالشويّة واحترمو القبور. الدليل مخبّي في النصب التذكاري. بيه تكمّلو الحروف الثمانية متاع رمز قرطاج. توّا دوركم باش تحلّوه!' },
    99: { nom: 'وقت التاي', recit: 'توّا وقت الراحة. اطلبو تاي بالنعناع، بالبوفريوة كيما نحبّوه في تونس، وتفرّجو في البحر. البحر هذا هو اللي عمل قرطاج. الفينيقيين اللي بناو المدينة جاو من صور، على شط لبنان اليوم. كانو بحّارة ما كيفهمش: يتبعو النجوم ويتاجرو من راس البحر المتوسط لراسو. وفمّا حكاية قديمة تقول اللي واحد قرطاجي اسمو حنّون مشى على طول شطوط إفريقيا الغربية، لبعد مضيق جبل طارق. وفي مراسي قرطاج، كانو يوصلو المعادن والشراب والزيت والصبغة الأرجوانية الغالية. خوذو وقتكم، ومن بعد اكتبو جملة في الباسبور متاعكم: تلقاوها في الكرّاس متاعكم.' }
  };

  /* Le mot de la fin, dans le ciel, à la fin du voyage 3D (voyage.html). */
  window.DOORBINA_FIN = {
    titre: 'Qart-Hadasht, la « ville nouvelle »',
    texte: 'Fondée selon la tradition en 814 avant notre ère, détruite en 146, rebâtie par Rome, chantée par les poètes : Carthage n’a jamais cessé de renaître. Aujourd’hui, c’est vous qui la faites revivre, un coup de pédale après l’autre.',
    merci: 'Merci d’avoir pédalé avec Door Bina.'
  };

  /* Cadre de la carte stylisée hors ligne (le trait de côte est dessiné pour ce cadre). */
  window.DOORBINA_MAP = { minLat: 36.836, maxLat: 36.870, minLng: 10.312, maxLng: 10.346 };

  /* Tarifs indicatifs, en dinars. */
  window.DOORBINA_TARIFS = { confort: 20, electrique: 30, enfant: 10, siege: 5 };
})();
