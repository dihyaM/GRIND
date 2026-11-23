import { PROG_VERSION } from './program';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// Prospects trouvés dans Gmail (nov. 2026) : traiteurs, salles et agences.
const GMAIL = [
  ['Saisons Traiteur', 'Traiteur', 'Eva Audebert', 'Madame Audebert', 'contact@saisons-traiteur.com', '06 71 87 03 43', 'À contacter', 'Factures réglées en déc. 2025, très bonne relation.'],
  ['Alto Café', 'Traiteur', 'Mikael Durrens', 'Mikael', 'mikael@altocafe.com', '', 'À contacter', 'T’a formée barista en 2025. Proposer baristas en renfort + bar cocktails.'],
  ['Le Vélo du Soir', 'Traiteur', 'Ludovic Kriticos', 'Monsieur Kriticos', 'ludovic@levelodusoir.com', '', 'À contacter', 'Missions maître d’hôtel en 2025.'],
  ['Zest Planche', 'Traiteur', 'Albane de Broca', 'Albane', 'albane@zestplanche.com', '', 'À contacter', '« Merci pour tes prestations de juin. »'],
  ['César Catering', 'Traiteur', '', '', 'cuisine@cesarcatering.com', '', 'À contacter', 'Facturé en 2024-2025.'],
  ['Colle Braise', 'Traiteur', '', '', 'hello@collebraise.com', '', 'À contacter', ''],
  ['Dom Traiteur IDF', 'Traiteur', '', '', 'domtraiteuridf@gmail.com', '', 'À contacter', 'Facturé en 2024.'],
  ['Declerck', 'Traiteur', 'Jean-Michel Buisson', 'Monsieur Buisson', 'jean-michel@declerck.fr', '', 'À contacter', 'Échange en nov. 2024.'],
  ['UMAI / Guru World', 'Traiteur', 'Valéry Bensegueni', 'Valéry', 'valery.bensegueni@umai.group', '', 'À contacter', 'Mettre Jean-Charles Lechevalier en copie.'],
  ['Clichy Hall', 'Salle', 'Mathieu Moreira', 'Mathieu', 'Mathieu.moreira@clichyhall.com', '', 'Devis envoyé', 'Devis DV-2026-003 transmis à Laeticia : relancer.'],
  ['JC Event', 'Agence', '', '', 'contact@jc-event.fr', '', 'Contacté', 'Proposition envoyée en sept. 2025, jamais de réponse.'],
  ['Mylie Event', 'Agence', '', '', 'mylie.event@gmail.com', '', 'Contacté', ''],
  ['Agence Impact', 'Agence', '', '', '', '', 'À contacter', 'Trouver un contact direct.'],
  ['Tout&Bon', 'Traiteur', 'Victor Surin', 'Victor', 'vsurin@toutetbon.fr', '', 'Client fidèle', 'Tutoiement.'],
  ['ESAT Berthier', 'Traiteur', 'David Lesage', 'David', 'david.lesage@esat-berthier.fr', '', 'Client fidèle', 'Missions régulières.'],
];

export function gmailProspects(D) {
  const have = new Set(Object.values(D.prospects || {}).map((p) => p.nom.trim().toLowerCase()));
  let n = 0;
  D.prospects = D.prospects || {};
  GMAIL.forEach(([nom, type, contact, salut, email, tel, stage, note]) => {
    if (have.has(nom.toLowerCase())) return;
    const id = uid() + n++;
    D.prospects[id] = { id, nom, type, contact, salut, email, tel, stage, note, last: '' };
  });
  return n;
}

// Mise à niveau des données à l'ouverture.
export function migrate(D) {
  if ((D.progV || 1) < PROG_VERSION) {
    // Nouveau programme : l'ancien (modifié ou non) est remplacé. Les séances passées gardent leur contenu.
    delete D.programme;
    D.progV = PROG_VERSION;
  }
  if (!D.prospects) {
    D.prospects = {};
    D.acts = D.acts || {};
    // Reprend les anciennes lignes de prospection staffing dans la nouvelle Chasse.
    const byName = {};
    Object.keys(D)
      .filter((k) => k.startsWith('d-'))
      .sort()
      .forEach((k) => {
        const day = k.slice(2);
        (D[k].pro || []).forEach((r) => {
          const nom = (r.nom || '').trim();
          if (!nom || !(r.appel || r.mail || r.relance)) return;
          const key = nom.toLowerCase();
          let p = byName[key];
          if (!p) {
            const id = uid() + Object.keys(byName).length;
            p = byName[key] = { id, nom, type: 'Traiteur', contact: r.contact || '', salut: '', email: '', tel: '', stage: 'Contacté', note: r.note || '', last: day };
            D.prospects[id] = p;
          }
          p.last = day;
          if (r.relance) p.stage = 'Relancé';
          if (['Intéressé', 'RDV obtenu'].includes(r.res)) p.stage = 'En discussion';
          if (r.res === 'Devis envoyé') p.stage = 'Devis envoyé';
          if (r.res === 'Pas intéressé') p.stage = 'Perdu';
          const a = (D.acts[day] = D.acts[day] || []);
          if (r.mail) a.push({ p: p.id, a: 'mail' });
          if (r.appel) a.push({ p: p.id, a: 'appel' });
          if (r.relance) a.push({ p: p.id, a: 'relance' });
        });
      });
    gmailProspects(D);
  }
  D.acts = D.acts || {};
  D.team = D.team || {};
  D.missions = D.missions || {};
  D.body = D.body || {};
  return D;
}
