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
    cadeau: 'Montrez cet écran au point de retour des vélos : un cadeau local vous attend.'
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

  /* Cadre de la carte stylisée hors ligne (le trait de côte est dessiné pour ce cadre). */
  window.DOORBINA_MAP = { minLat: 36.836, maxLat: 36.870, minLng: 10.312, maxLng: 10.346 };

  /* Tarifs indicatifs, en dinars. */
  window.DOORBINA_TARIFS = { confort: 20, electrique: 30, enfant: 10, siege: 5 };
})();
