import { add, mon, today, wd, weekDays, hash, DN, fmt } from './dates';
import { DEFAULT_PROG, RES_POS, RES_DUE, PTS, COUNTS, LEVELS, STAGES } from './program';

export const clone = (x) => JSON.parse(JSON.stringify(x));
export const settings = (D) => ({ pro: 10, orga: 10, pas: 10000, ca: 3000, notif: false, ...(D.settings || {}) });
export const prog = (D) => D.programme || DEFAULT_PROG;
export const dayDoc = (D, k) => D['d-' + k] || {};
export const sessFor = (D, k) => dayDoc(D, k).sport?.snap || prog(D).days[wd(k)];
export const sportDone = (D, k) => !!dayDoc(D, k).sport?.done;

export function ensureSport(D, k) {
  const d = (D['d-' + k] = D['d-' + k] || {});
  d.sport = d.sport || {};
  d.sport.ex = d.sport.ex || {};
  d.sport.snap = d.sport.snap || clone(prog(D).days[wd(k)]);
  return d.sport;
}

export const blankRow = () => ({ nom: '', contact: '', appel: false, mail: false, relance: false, res: '—', note: '', type: '' });
export function rowsR(D, k, list) {
  const t = settings(D)[list];
  const r = dayDoc(D, k)[list] || [];
  return r.length >= t ? r : r.concat(Array.from({ length: t - r.length }, blankRow));
}
export function rowsW(D, k, list) {
  const d = (D['d-' + k] = D['d-' + k] || {});
  d[list] = rowsR(D, k, list).map((x) => ({ ...x }));
  return d[list];
}
export const treated = (r) => !!(r.nom && r.nom.trim() && (r.appel || r.mail || r.relance));
export const nbTreated = (D, k, list) => (dayDoc(D, k)[list] || []).filter(treated).length;

export function weekStats(D, w) {
  const ds = weekDays(w);
  const st = settings(D);
  const p = prog(D);
  const planned = ds.filter((k) => !p.days[wd(k)].rest).length;
  const sDone = ds.filter((k) => sportDone(D, k)).length;
  const pro = ds.reduce((a, k) => a + dayCount(D, k), 0);
  const proT = st.pro * 5;
  const pasSum = ds.reduce((a, k) => a + (Number(dayDoc(D, k).pas) || 0), 0);
  const pasDays = ds.filter((k) => Number(dayDoc(D, k).pas) > 0).length;
  const pasAvg = pasDays ? Math.round(pasSum / pasDays) : 0;
  const nv = D['w-' + w] || {};
  const nvDone = !!nv.done;
  const rdv = ds.reduce((a, k) => a + (D.acts?.[k] || []).filter((x) => x.a === 'rdv' || x.a === 'devis' || x.a === 'mission').length, 0);
  const pts = ds.reduce((a, k) => a + dayPoints(D, k), 0);
  const c = {
    sport: planned ? Math.min(1, sDone / planned) : 1,
    pro: proT ? Math.min(1, pro / proT) : 1,
    pas: Math.min(1, pasSum / (7 * st.pas)),
    nv: nvDone ? 1 : 0,
  };
  const score = Math.round(100 * (0.35 * c.sport + 0.35 * c.pro + 0.15 * c.pas + 0.15 * c.nv));
  const has = ds.some((k) => D['d-' + k] || D.acts?.[k]) || !!D['w-' + w];
  return { planned, sDone, pro, proT, pasSum, pasAvg, nv, nvDone, rdv, pts, c, score, has, orga: 0 };
}

// ——— Chasse ———
// Prospects distincts touchés ce jour-là (mail, appel ou relance).
export const dayCount = (D, k) => new Set((D.acts?.[k] || []).filter((x) => COUNTS.includes(x.a)).map((x) => x.p)).size;
export const dayPoints = (D, k) => (D.acts?.[k] || []).reduce((a, x) => a + (PTS[x.a] || 0), 0);
export const totalPoints = (D) => Object.keys(D.acts || {}).reduce((a, k) => a + dayPoints(D, k), 0);
export function level(D) {
  const p = totalPoints(D);
  let i = 0;
  LEVELS.forEach((l, j) => {
    if (p >= l.p) i = j;
  });
  const next = LEVELS[i + 1];
  return { ...LEVELS[i], i, pts: p, next, pct: next ? (p - LEVELS[i].p) / (next.p - LEVELS[i].p) : 1 };
}
// Flamme : jours ouvrés d'affilée avec l'objectif atteint (aujourd'hui compte s'il est déjà atteint).
export function flame(D) {
  const goal = settings(D).pro;
  let k = today();
  let n = 0;
  if (dayCount(D, k) >= goal) n++;
  k = add(k, -1);
  for (let i = 0; i < 400; i++) {
    if (wd(k) < 5) {
      if (dayCount(D, k) >= goal) n++;
      else break;
    }
    k = add(k, -1);
  }
  return n;
}
export const daysSince = (k) => (k ? Math.round((new Date(today()) - new Date(k)) / 864e5) : 99);
export function dueRelances(D) {
  return Object.values(D.prospects || {})
    .map((p) => {
      const n = daysSince(p.last);
      const wait = p.stage === 'Contacté' ? 3 : p.stage === 'Relancé' ? 4 : p.stage === 'Devis envoyé' ? 5 : null;
      return wait != null && n >= wait ? { p, n } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.n - a.n);
}
export const monthKey = (k) => k.slice(0, 7);
export const caMonth = (D, m) =>
  Object.values(D.missions || {}).filter((x) => x.date && x.date.slice(0, 7) === m).reduce((a, x) => a + (Number(x.montant) || 0), 0);
export const byStage = (D) => STAGES.map((s) => ({ s, list: Object.values(D.prospects || {}).filter((p) => p.stage === s) }));
export function trophies(D) {
  const P = Object.values(D.prospects || {});
  const acts = Object.values(D.acts || {}).flat();
  const missions = Object.values(D.missions || {});
  const m = monthKey(today());
  const won = (t) => P.filter((p) => p.type === t && ['Mission', 'Client fidèle'].includes(p.stage)).length;
  return [
    { n: 'Premier mail', d: 'Envoyer ton premier mail de chasse', ok: acts.some((x) => x.a === 'mail') },
    { n: 'Flamme de 5', d: '5 jours ouvrés d’affilée à 10 prospects', ok: flame(D) >= 5 },
    { n: 'Flamme de 20', d: '20 jours ouvrés d’affilée', ok: flame(D) >= 20 },
    { n: 'Première salle signée', d: 'Une salle passe en Mission', ok: won('Salle') >= 1 },
    { n: 'Première agence signée', d: 'Une agence passe en Mission', ok: won('Agence') >= 1 },
    { n: '5 traiteurs en discussion', d: '5 traiteurs en discussion ou plus loin', ok: P.filter((p) => p.type === 'Traiteur' && ['En discussion', 'Devis envoyé', 'Mission', 'Client fidèle'].includes(p.stage)).length >= 5 },
    { n: '3 missions dans le mois', d: '3 missions ce mois-ci dans l’onglet Équipe', ok: missions.filter((x) => x.date?.slice(0, 7) === m).length >= 3 },
    { n: '100 prospects', d: '100 prospects contactés au total', ok: new Set(acts.filter((x) => COUNTS.includes(x.a)).map((x) => x.p)).size >= 100 },
    { n: 'Objectif CA', d: 'Atteindre ton objectif de CA du mois', ok: caMonth(D, m) >= settings(D).ca },
  ];
}

export const totalSessions = (D) => Object.keys(D).filter((k) => k.startsWith('d-') && D[k].sport?.done).length;

export function prevLoad(D, k, name) {
  const keys = Object.keys(D).filter((x) => x.startsWith('d-') && x.slice(2) < k).sort().reverse();
  const nm = name.trim().toLowerCase();
  for (const x of keys) {
    const sp = D[x].sport;
    if (!sp?.ex || !sp.snap) continue;
    const e = sp.snap.ex.find((e) => e.name.trim().toLowerCase() === nm);
    if (e && sp.ex[e.id]?.charge) return { v: sp.ex[e.id].charge, k: x.slice(2) };
  }
  return null;
}

export function streak(D) {
  let n = 0;
  let w = mon(today());
  const cur = weekStats(D, w);
  if (cur.planned && cur.sDone >= cur.planned) n++;
  w = add(w, -7);
  for (let i = 0; i < 104; i++) {
    const s = weekStats(D, w);
    if (s.planned && s.sDone >= s.planned) {
      n++;
      w = add(w, -7);
    } else break;
  }
  return n;
}

export function dueList(D, list, before) {
  const out = [];
  Object.keys(D)
    .filter((x) => x.startsWith('d-') && x.slice(2) < before)
    .sort()
    .forEach((x) => {
      (D[x][list] || []).forEach((r, i) => {
        if (r.nom && r.nom.trim() && RES_DUE.includes(r.res) && !r.relance) out.push({ k: x.slice(2), i, r });
      });
    });
  return out;
}

export function details(D, w) {
  const s = weekStats(D, w);
  const ds = weekDays(w);
  const p = prog(D);
  const st = settings(D);
  const done = [];
  const miss = [];
  const T = today();
  const lim = w === mon(T) ? T : '9999';
  ds.forEach((k) => {
    const se = sessFor(D, k);
    if (sportDone(D, k)) done.push(`Séance ${se.name} (${DN[wd(k)]})`);
    else if (!p.days[wd(k)].rest && k < lim) miss.push(`Séance ${se.name} sautée (${DN[wd(k)]})`);
    if (wd(k) < 5 && k < lim) {
      const a = dayCount(D, k);
      if (a < st.pro) miss.push(`${DN[wd(k)]} : ${a}/${st.pro} prospects`);
    }
  });
  if (s.pro) done.push(`${s.pro} prospect${s.pro > 1 ? 's' : ''} touché${s.pro > 1 ? 's' : ''} · ${s.pts} points`);
  if (s.rdv) done.push(`${s.rdv} avancée${s.rdv > 1 ? 's' : ''} (RDV, devis, mission)`);
  if (s.pasAvg) (s.pasAvg >= st.pas ? done : miss).push(`${s.pasAvg.toLocaleString('fr-FR')} pas par jour en moyenne`);
  if (s.nvDone) done.push(`Nouveauté : ${s.nv.act || 'faite'}`);
  else if (w < mon(T) || wd(T) === 6) miss.push('Aucune nouveauté cette semaine');
  return { done, miss };
}

const PRAISE = [
  "Tu as tenu tes engagements. C'est exactement comme ça qu'on construit une boîte et un corps.",
  "Semaine propre. Tu n'as rien laissé au hasard, sois fière et garde ce rythme.",
  'Rien à redire. La régularité, c’est ton avantage sur tout le monde.',
];
const MID = [
  'Correct, mais tu sais que tu peux faire mieux. Les trous dans la semaine, ce sont des clients et des résultats en moins.',
  "Pas mal, pas assez. Ce qui manque n'est pas compliqué, c'est juste pas fait.",
];
const SCOLD = [
  "Non. Tu t'es laissée aller cette semaine et les chiffres ne mentent pas. Personne ne viendra faire tes appels à ta place.",
  'Semaine de flemme. Tu veux une boîte qui tourne et des fessiers qui changent ? Alors arrête de négocier avec toi-même.',
  "On ne va pas se mentir : c'est en dessous de ce que tu vaux. Lundi, on repart et on rattrape.",
];
export const GAGES = {
  sport: 'Une séance HIIT de rattrapage samedi, et 20 min de marche inclinée après chaque séance.',
  pro: '12 prospects par jour au lieu de 10 la semaine prochaine, et les 5 premiers appels avant 10 h.',
  pas: '12 000 pas par jour la semaine prochaine, et une marche de 30 min après chaque repas du soir.',
  nv: "Ta nouveauté de la semaine prochaine doit être réservée avant mercredi, capture d'écran à l'appui.",
};
export function verdict(w, score) {
  if (score >= 85) return { t: 'good', name: 'Machine de guerre', txt: PRAISE[hash(w) % PRAISE.length] };
  if (score >= 70) return { t: 'good', name: 'Solide', txt: 'Bonne semaine. Encore un petit effort sur ton point faible et tu passes au niveau au-dessus.' };
  if (score >= 50) return { t: 'mid', name: 'Peut mieux faire', txt: MID[hash(w) % MID.length] };
  return { t: 'bad', name: 'Flemmarde', txt: SCOLD[hash(w) % SCOLD.length] };
}
export const weakest = (s) => Object.entries(s.c).sort((a, b) => a[1] - b[1])[0][0];

export function dayDot(D, k, tab) {
  const T = today();
  const past = k < T;
  if (tab === 'sport') {
    if (sportDone(D, k)) return 'ok';
    if (sessFor(D, k).rest) return '';
    return past ? 'miss' : 'plan';
  }
  const n = dayCount(D, k);
  const t = settings(D).pro;
  if (n >= t) return 'ok';
  if (n > 0) return 'part';
  if (past && wd(k) < 5) return 'miss';
  return '';
}

export function coachPayload(D, w) {
  const s = weekStats(D, w);
  const d = details(D, w);
  const v = verdict(w, s.score);
  return {
    semaine: `du ${fmt(w)} au ${fmt(add(w, 6))}`,
    en_cours: w === mon(today()),
    score_sur_100: s.score,
    verdict: v.name,
    sport: `${s.sDone}/${s.planned} séances`,
    prospection_traiteurs_salles_agences: `${s.pro}/${s.proT}`,
    points_chasse_semaine: s.pts,
    niveau: level(D).n,
    flamme_jours: flame(D),
    avancees_rdv_devis_missions: s.rdv,
    pas_moyenne_jour: s.pasAvg,
    nouveaute: s.nvDone ? s.nv.act || 'faite' : 'non faite',
    fait: d.done,
    manque: d.miss,
  };
}
