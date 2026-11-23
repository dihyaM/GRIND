// Programme par défaut : 2 séances fessiers, 3 séances qui brûlent un max. Modifiable dans l'appli.
let n = 0;
const E = (name, scheme) => ({ id: `def-${++n}`, name, scheme });

export const PROG_VERSION = 2;

export const DEFAULT_PROG = {
  days: {
    0: {
      name: 'Fessiers lourds + finisher',
      rest: false,
      ex: [
        E('Échauffement vélo + activation fessiers', '8 min'),
        E('Hip thrust', '4 × 8 · 2 min'),
        E('Soulevé de terre roumain', '4 × 10 · 90 s'),
        E('Fentes bulgares', '3 × 10 / jambe · 90 s'),
        E('Leg curl', '3 × 12 · 1 min'),
        E('Abduction machine', '3 × 20 · 45 s'),
        E('Finisher rameur ou vélo', '10 × (30 s fort / 30 s lent)'),
      ],
    },
    1: {
      name: 'Full body circuit brûle-graisse',
      rest: false,
      ex: [
        E('Échauffement rameur', '5 min'),
        E('Thruster haltères (squat + développé)', '4 tours × 12'),
        E('Soulevé de terre haltères', '4 tours × 12'),
        E('Rowing haltère', '4 tours × 12 / bras'),
        E('Fentes marchées', '4 tours × 20 pas'),
        E('Pompes (genoux si besoin)', '4 tours × 10'),
        E('Mountain climbers', '4 tours × 30 s'),
        E('Marche inclinée tapis', '15 min'),
      ],
    },
    2: {
      name: 'HIIT + gainage',
      rest: false,
      ex: [
        E('Échauffement vélo', '5 min'),
        E('Rameur ou vélo en intervalles', '20 × (30 s à fond / 30 s lent)'),
        E('Planche', '3 × 45 s'),
        E('Dead bug', '3 × 12'),
        E('Russian twist', '3 × 20'),
        E('Étirements hanches et ischios', '10 min'),
      ],
    },
    3: {
      name: 'Fessiers volume (neuneu)',
      rest: false,
      ex: [
        E('Hip thrust lourd', '5 × 6 · 2 min 30'),
        E('Squat sumo profond (haltère)', '4 × 10 · 2 min'),
        E('Fentes arrière en déficit', '3 × 12 / jambe · 90 s'),
        E('Abduction machine buste penché', '4 × 20 · 1 min'),
        E('Kickback poulie', '3 × 15 / jambe · 45 s'),
        E('Finisher corde à sauter', '10 × (40 s / 20 s)'),
      ],
    },
    4: {
      name: 'Full body style Hyrox',
      rest: false,
      ex: [
        E('Échauffement', '5 min'),
        E('EMOM min. 1 : kettlebell swings', '6 tours × 15'),
        E('EMOM min. 2 : burpees', '6 tours × 10'),
        E('EMOM min. 3 : wall balls ou thrusters', '6 tours × 12'),
        E('EMOM min. 4 : montées de marches ou sled', '6 tours × 40 s'),
        E('EMOM min. 5 : rameur', '6 tours × 200 m'),
        E('Marche inclinée tapis', '15 min'),
      ],
    },
    5: { name: 'Repos actif', rest: true, ex: [] },
    6: { name: 'Repos actif', rest: true, ex: [] },
  },
};

// ——— Chasse (prospection traiteurs, salles, agences) ———
export const TYPES = ['Traiteur', 'Salle', 'Agence'];
export const STAGES = ['À contacter', 'Contacté', 'Relancé', 'En discussion', 'Devis envoyé', 'Mission', 'Client fidèle', 'Perdu'];
export const STAGE_ACT = { 'En discussion': 'rdv', 'Devis envoyé': 'devis', Mission: 'mission' };
export const PTS = { mail: 1, relance: 2, appel: 3, devis: 5, rdv: 10, mission: 25 };
export const COUNTS = ['mail', 'appel', 'relance']; // actions qui comptent dans les 10 par jour
export const LEVELS = [
  { n: 'Commis', p: 0 },
  { n: 'Chef de rang', p: 150 },
  { n: "Maître d'hôtel", p: 400 },
  { n: 'Directrice de salle', p: 900 },
  { n: 'Maison Róa', p: 2000 },
];
export const SEASON = [
  'Vœux et galettes : les entreprises reçoivent, les traiteurs cherchent du monde. Fonce.', // janv.
  'Séminaires et salons qui se préparent : relance les agences.',
  'Séminaires et salons : les agences bouclent leurs équipes, propose du renfort.',
  'Les mariages approchent : vise les salles de réception.',
  'Pleine saison des mariages : les salles ont besoin de service et d’accueil.',
  'Mariages, galas et fins d’année scolaire : tout le monde manque de bras.',
  'Été : prépare la rentrée, les agences montent leurs équipes de septembre.',
  'Fin d’été : place-toi maintenant pour les séminaires de septembre.',
  'Rentrée : séminaires, lancements et salons reprennent. Relance tout le monde.',
  'Octobre : les traiteurs commencent à staffer les fêtes de fin d’année.',
  'Fêtes de fin d’année : traiteurs et salles sont débordés, c’est LE moment de proposer du renfort.',
  'Dernière ligne droite des fêtes : propose des équipes de dernière minute.',
];

const SIG = "\n\nBien cordialement,\nDihya Menoun\nRóa · Maison de réceptions\n06 58 13 17 60 · www.maisonroa.fr";
const hi = (p) => `Bonjour${p ? ' ' + p : ''},\n\n`;
export const TEMPLATES = {
  Traiteur: {
    subject: 'Personnel et bar pour vos événements · Róa',
    body: (p) =>
      hi(p) +
      "Je me permets de vous écrire pour vous présenter Róa, la maison de réceptions que j'ai lancée à Paris. Nous mettons à disposition des traiteurs du personnel formé : maîtres d'hôtel, chefs de rang, serveurs et hôtesses d'accueil, en renfort ponctuel ou régulier, à Paris et en Île-de-France.\n\nNous proposons aussi une prestation bar : bar à cocktails et bar café avec barista, que vous pouvez ajouter à vos offres.\n\nAuriez-vous des besoins en personnel dans les semaines à venir ? Je serais ravie d'en parler avec vous." +
      SIG,
  },
  Salle: {
    subject: "Équipes d'accueil et de service pour vos réceptions · Róa",
    body: (p) =>
      hi(p) +
      "Je me permets de vous écrire pour vous présenter Róa, la maison de réceptions que j'ai lancée à Paris. Nous fournissons des équipes d'accueil et de service pour les événements organisés dans vos salons : hôtesses, maîtres d'hôtel, serveurs, barmen et baristas, en renfort ponctuel ou régulier.\n\nNos équipes connaissent les codes des réceptions haut de gamme : accueil des invités, vestiaire, service à table et cocktails.\n\nSi vos clients vous demandent du personnel, ou si vous avez besoin de renfort pour vos prochaines dates, je serais ravie d'en parler avec vous." +
      SIG,
  },
  Agence: {
    subject: "Renfort de personnel d'accueil et de service · Róa",
    body: (p) =>
      hi(p) +
      "Je me permets de vous écrire pour vous présenter Róa, une maison de réceptions basée à Paris. Nous mettons à disposition des agences du personnel d'accueil et de service : hôtesses, maîtres d'hôtel, chefs de rang, serveurs, barmen et baristas, sur des missions ponctuelles ou récurrentes en Île-de-France.\n\nNous pouvons intervenir en renfort sur vos événements, y compris à la dernière minute.\n\nAuriez-vous des besoins sur vos prochains événements ? Je serais ravie d'en parler avec vous." +
      SIG,
  },
  Relance: {
    subject: 'Suite à mon message · Róa',
    body: (p) =>
      hi(p) +
      "Je me permets de revenir vers vous suite à mon précédent message. Avez-vous des événements à venir pour lesquels un renfort de personnel (service, accueil ou bar) pourrait vous aider ?\n\nJe reste disponible pour un appel rapide quand cela vous arrange." +
      SIG,
  },
};

// ——— Équipe ———
export const ROLES = ["Maître d'hôtel", 'Chef de rang', 'Serveur·se', 'Hôtesse', 'Barman·aid', 'Barista'];

export const RES = ['—', 'Pas de réponse', 'À rappeler', 'Intéressé', 'RDV obtenu', 'Devis envoyé', 'Pas intéressé'];
export const RES_POS = ['Intéressé', 'RDV obtenu', 'Devis envoyé'];
export const RES_DUE = ['Pas de réponse', 'À rappeler', 'Intéressé', 'Devis envoyé'];
export const ORGA_TYPES = ['RH', 'CSE', 'Office manager', 'Agence', 'Autre'];
export const IDEAS = [
  'Cours de poterie', 'Escalade en salle', 'Atelier cocktails', 'Cours de danse (salsa, heels…)',
  'Paddle ou kayak', "Une cuisine que tu n'as jamais goûtée", 'Atelier parfum', "Tir à l'arc",
  'Randonnée à Fontainebleau', 'Musée jamais visité', 'Cours de boxe', 'Bain nordique / spa',
  'Stand-up ou impro', "Bénévolat d'un jour", 'Atelier céramique ou bougie', 'Cours de pole dance',
];
