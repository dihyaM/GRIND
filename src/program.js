// Programme par défaut : 2 séances fessiers, 2 tractions, 1 souplesse. Modifiable dans l'appli.
let n = 0;
const E = (name, scheme) => ({ id: `def-${++n}`, name, scheme });

export const DEFAULT_PROG = {
  days: {
    0: {
      name: 'Fessiers & ischios',
      rest: false,
      ex: [
        E('Hip thrust', '4 × 10'),
        E('Soulevé de terre roumain', '4 × 10'),
        E('Fentes bulgares', '3 × 12 / jambe'),
        E('Leg curl', '3 × 12'),
        E('Abduction machine', '3 × 15'),
      ],
    },
    1: {
      name: 'Tractions & explosivité',
      rest: false,
      ex: [
        E('Suspension active à la barre', '3 × 30 s · 1 min'),
        E('Tractions négatives (descente 5 s)', '4 × 5 · 2 min'),
        E('Tractions avec élastique', '4 × 6 · 2 min'),
        E('Rowing australien (barre basse)', '3 × 10 · 90 s'),
        E('Box jumps', '4 × 5 · 90 s'),
        E('Kettlebell swing', '4 × 15 · 1 min'),
        E('Hollow hold (gainage creux)', '3 × 30 s'),
      ],
    },
    2: {
      name: 'Souplesse : grand écart & hanches',
      rest: false,
      ex: [
        E('Échauffement cardio + rotations hanches', '8 min'),
        E('Fente basse (psoas)', '3 × 45 s / côté'),
        E('Demi-grand écart (ischios)', '3 × 45 s / côté'),
        E('Grand écart facial progressif', '3 × 60 s / côté'),
        E('Pigeon (rotation externe)', '3 × 60 s / côté'),
        E('Berceau de jambe (pied vers épaule)', '3 × 45 s / côté'),
        E('Pancake (assise jambes écartées)', '3 × 60 s'),
        E('Grand écart latéral (straddle)', '3 × 60 s'),
        E('Levés de jambe tendue actifs', '3 × 10 / côté'),
      ],
    },
    3: {
      name: 'Fessiers volume',
      rest: false,
      ex: [
        E('Hip thrust lourd', '5 × 6 · 2 min 30'),
        E('Squat sumo profond (haltère)', '4 × 10 · 2 min'),
        E('Fentes arrière en déficit', '3 × 12 / jambe · 90 s'),
        E('Abduction machine buste penché', '4 × 20 · 1 min'),
        E('Kickback poulie', '3 × 15 / jambe · 45 s'),
        E('Frog pumps (finisher)', '2 × 30'),
      ],
    },
    4: {
      name: 'Tractions & cardio doux',
      rest: false,
      ex: [
        E('Tractions (élastique ou négatives)', '5 × 4 · 2 min'),
        E('Menton au-dessus de la barre, tenue', '3 × max s'),
        E('Pompes', '3 × 10 · 1 min'),
        E('Rameur', '4 × 250 m · 1 min'),
        E('Marche inclinée tapis', '20 min'),
        E('Étirements grand écart + pigeon', '10 min'),
      ],
    },
    5: { name: 'Repos', rest: true, ex: [] },
    6: { name: 'Repos', rest: true, ex: [] },
  },
};

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
