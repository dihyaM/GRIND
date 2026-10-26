import * as SecureStore from 'expo-secure-store';

const KEY = 'anthropic-api-key';
export const getKey = async () => {
  try {
    return (await SecureStore.getItemAsync(KEY)) || '';
  } catch (e) {
    return '';
  }
};
export const setKey = async (v) => {
  try {
    if (v) await SecureStore.setItemAsync(KEY, v.trim());
    else await SecureStore.deleteItemAsync(KEY);
  } catch (e) {}
};

export async function askCoach(payload) {
  const key = await getKey();
  if (!key) throw new Error('Ajoute ta clé Claude dans Réglages pour activer le coach.');
  const prompt = `Tu es le coach personnel de Dy, 32 ans, entrepreneuse à Paris (staffing événementiel et lancement d'une agence d'organisation d'événements qui démarche RH et CSE). Son objectif sport numéro 1 : faire grossir ses fessiers au maximum, puis progresser en tractions, explosivité et souplesse (grand écart). Elle suit aussi sa prospection et une activité nouvelle par semaine. Voici son bilan de semaine en JSON :
${JSON.stringify(payload)}

Écris-lui un retour en français, en la tutoyant, 120 à 170 mots, texte brut sans markdown ni emoji. Si le score est ≥ 70, félicite-la sincèrement en citant ce qu'elle a réussi. S'il est < 70, gronde-la franchement, comme un coach exigeant qui croit en elle : nomme précisément ce qui a manqué, pas d'excuses acceptées, jamais insultant. Termine par exactement 3 objectifs concrets pour la semaine prochaine, une ligne chacun, commençant par "→ ". Si la semaine est en cours, parle de ce qu'il lui reste à faire d'ici dimanche.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 700, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new Error('Clé Claude refusée. Vérifie-la dans Réglages.');
    if (res.status === 429) throw new Error('Trop de demandes. Réessaie dans quelques minutes.');
    throw new Error(data?.error?.message || "Claude n'a pas pu répondre. Réessaie plus tard.");
  }
  return (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
}
