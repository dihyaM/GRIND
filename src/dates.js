const pad = (n) => String(n).padStart(2, '0');

export const K = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const P = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const add = (k, n) => {
  const d = P(k);
  d.setDate(d.getDate() + n);
  return K(d);
};
export const wd = (k) => (P(k).getDay() + 6) % 7; // 0 = lundi
export const mon = (k) => add(k, -wd(k));
export const today = () => K(new Date());
export const weekDays = (w) => Array.from({ length: 7 }, (_, i) => add(w, i));

export const DN = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const DNL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const fmt = (k) => {
  const d = P(k);
  return `${d.getDate()} ${MO[d.getMonth()]}`;
};

export function isoWeek(k) {
  const d = P(k);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const y = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - y) / 864e5 - 3 + ((y.getDay() + 6) % 7)) / 7);
}
export const yearOf = (w) => P(add(w, 3)).getFullYear();
export function weeksOfYear(Y) {
  const out = [];
  let w = mon(`${Y}-01-04`);
  while (yearOf(w) === Y) {
    out.push(w);
    w = add(w, 7);
  }
  return out;
}
export const hash = (s) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
};
