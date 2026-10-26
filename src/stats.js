import { add, mon, today, wd, weekDays, hash, DN, fmt } from './dates';
import { DEFAULT_PROG, RES_POS, RES_DUE } from './program';

export const clone = (x) => JSON.parse(JSON.stringify(x));
export const settings = (D) => ({ pro: 10, orga: 10, notif: false, ...(D.settings || {}) });
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
  const pro = ds.reduce((a, k) => a + nbTreated(D, k, 'pro'), 0);
  const orga = ds.reduce((a, k) => a + nbTreated(D, k, 'orga'), 0);
  const proT = st.pro * 5;
  const orgaT = st.orga * 5;
  const nv = D['w-' + w] || {};
  const nvDone = !!nv.done;
  const rdv = ds.reduce(
    (a, k) => a + ['pro', 'orga'].reduce((b, l) => b + (dayDoc(D, k)[l] || []).filter((r) => RES_POS.includes(r.res)).length, 0),
    0
  );
  const c = {
    sport: planned ? Math.min(1, sDone / planned) : 1,
    pro: proT ? Math.min(1, pro / proT) : 1,
    orga: orgaT ? Math.min(1, orga / orgaT) : 1,
    nv: nvDone ? 1 : 0,
  };
  const score = Math.round(100 * (0.35 * c.sport + 0.3 * c.pro + 0.2 * c.orga + 0.15 * c.nv));
  const has = ds.some((k) => D['d-' + k]) || !!D['w-' + w];
  return { planned, sDone, pro, orga, proT, orgaT, nv, nvDone, rdv, c, score, has };
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
      const a = nbTreated(D, k, 'pro');
      const b = nbTreated(D, k, 'orga');
      if (a < st.pro) miss.push(`${DN[wd(k)]} : ${a}/${st.pro} prospects staffing`);
      if (b < st.orga) miss.push(`${DN[wd(k)]} : ${b}/${st.orga} prospects RH/CSE`);
    }
  });
  if (s.pro) done.push(`${s.pro} prospect${s.pro > 1 ? 's' : ''} staffing traité${s.pro > 1 ? 's' : ''}`);
  if (s.orga) done.push(`${s.orga} prospect${s.orga > 1 ? 's' : ''} RH/CSE traité${s.orga > 1 ? 's' : ''}`);
  if (s.rdv) done.push(`${s.rdv} retour${s.rdv > 1 ? 's' : ''} positif${s.rdv > 1 ? 's' : ''} (intérêt, RDV, devis)`);
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
  sport: 'Une séance fessiers de rattrapage en plus la semaine prochaine, et 20 min de marche inclinée après chaque séance.',
  pro: '12 prospects par jour au lieu de 10 la semaine prochaine, et les 5 premiers appels avant 10 h.',
  orga: 'Lundi matin : 1 h bloquée uniquement pour les RH et CSE, téléphone en mode avion pour le reste.',
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
  const list = tab === 'pro' ? 'pro' : 'orga';
  const n = nbTreated(D, k, list);
  const t = settings(D)[list];
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
    prospection_staffing: `${s.pro}/${s.proT}`,
    prospection_rh_cse: `${s.orga}/${s.orgaT}`,
    retours_positifs: s.rdv,
    nouveaute: s.nvDone ? s.nv.act || 'faite' : 'non faite',
    fait: d.done,
    manque: d.miss,
  };
}
