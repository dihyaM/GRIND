import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { today, P, fmt } from '../dates';
import { TYPES, STAGES, STAGE_ACT, TEMPLATES, SEASON, PTS } from '../program';
import { settings, dayCount, level, flame, dueRelances, caMonth, monthKey, trophies, daysSince } from '../stats';
import { scheduleRelance, cancelRelance } from '../notifications';
import { uid } from '../seed';
import { Card, H2, Eyebrow, Mono, Muted, Btn, Input, Row, T, Bar, Picker, tap } from '../ui';

const STAGE_COL = {
  'À contacter': C.muted,
  Contacté: C.accent,
  Relancé: C.warn,
  'En discussion': C.gold,
  'Devis envoyé': C.gold,
  Mission: C.ok,
  'Client fidèle': C.ok,
  Perdu: C.faint,
};
const NEXT = { 'À contacter': 'Contacté', Contacté: 'En discussion', Relancé: 'En discussion', 'En discussion': 'Devis envoyé', 'Devis envoyé': 'Mission', Mission: 'Client fidèle' };
const euro = (n) => `${Math.round(n).toLocaleString('fr-FR')} €`;

export default function Chasse() {
  const { D, update } = useStore();
  const [stage, setStage] = useState('À contacter');
  const [type, setType] = useState('Tous');
  const [open, setOpen] = useState(null);
  const [pick, setPick] = useState(null);
  const st = settings(D);
  const T0 = today();
  const n = dayCount(D, T0);
  const lv = level(D);
  const fl = flame(D);
  const due = dueRelances(D);
  const ca = caMonth(D, monthKey(T0));
  const all = Object.values(D.prospects || {});
  const counts = Object.fromEntries(STAGES.map((s) => [s, all.filter((p) => p.stage === s && (type === 'Tous' || p.type === type)).length]));
  const list = all
    .filter((p) => p.stage === stage && (type === 'Tous' || p.type === type))
    .sort((a, b) => (a.last || '').localeCompare(b.last || '') || a.nom.localeCompare(b.nom));
  const tro = trophies(D);

  const log = (id, a) =>
    update((X) => {
      const p = X.prospects[id];
      if (!p) return;
      const L = (X.acts[T0] = X.acts[T0] || []);
      const before = dayCount(X, T0);
      if (!L.some((x) => x.p === id && x.a === a)) L.push({ p: id, a });
      p.last = T0;
      if ((a === 'mail' || a === 'appel') && p.stage === 'À contacter') p.stage = 'Contacté';
      if (a === 'relance' && ['Contacté', 'Relancé', 'À contacter'].includes(p.stage)) p.stage = 'Relancé';
      const after = dayCount(X, T0);
      if (before < st.pro && after >= st.pro) {
        tap('success');
        setTimeout(() => Alert.alert('Objectif du jour atteint', `${st.pro} prospects. Ta flamme tient, bravo.`), 300);
      }
      if (st.notif && ['Contacté', 'Relancé'].includes(p.stage)) scheduleRelance(p);
    });

  const setStageOf = (id, s) =>
    update((X) => {
      const p = X.prospects[id];
      if (!p || p.stage === s) return;
      p.stage = s;
      p.last = T0;
      const a = STAGE_ACT[s];
      if (a) {
        const L = (X.acts[T0] = X.acts[T0] || []);
        if (!L.some((x) => x.p === id && x.a === a)) L.push({ p: id, a });
        tap('success');
      }
      if (!['Contacté', 'Relancé'].includes(s)) cancelRelance(id);
    });

  const mail = (p, relance) => {
    if (!p.email) {
      Alert.alert('Pas d’adresse mail', 'Ajoute son adresse dans la fiche, puis réessaie.');
      return;
    }
    const tpl = relance ? TEMPLATES.Relance : TEMPLATES[p.type] || TEMPLATES.Traiteur;
    const url = `mailto:${p.email}?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body(p.salut))}`;
    Linking.openURL(url).catch(() => Alert.alert('Impossible d’ouvrir Mail', 'Vérifie qu’une appli de mail est configurée sur ton iPhone.'));
    log(p.id, relance ? 'relance' : 'mail');
  };
  const call = (p) => {
    if (!p.tel) {
      Alert.alert('Pas de numéro', 'Ajoute son numéro dans la fiche.');
      return;
    }
    Linking.openURL(`tel:${p.tel.replace(/[^\d+]/g, '')}`).catch(() => {});
    log(p.id, 'appel');
  };

  const addProspect = () => {
    const id = uid();
    update((X) => (X.prospects[id] = { id, nom: '', type: type === 'Tous' ? 'Traiteur' : type, contact: '', salut: '', email: '', tel: '', stage: 'À contacter', note: '', last: '' }));
    setStage('À contacter');
    setOpen(id);
  };
  const setF = (id, f, v) => update((X) => X.prospects[id] && (X.prospects[id][f] = v));

  return (
    <View style={{ gap: 14 }}>
      <Card>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Eyebrow>Chasse du jour · traiteurs, salles, agences</Eyebrow>
            <H2>{n >= st.pro ? 'Objectif atteint' : `Encore ${st.pro - n}`}</H2>
          </View>
          <Text style={[sx.big, n >= st.pro && { color: C.ok }]}>
            {n}
            <Text style={{ color: C.muted, fontSize: 18 }}>/{st.pro}</Text>
          </Text>
        </Row>
        <Bar pct={n / st.pro} h={9} />
        <Row style={{ gap: 8 }}>
          <View style={[sx.kpi, { backgroundColor: fl ? C.goldSoft : C.surface2 }]}>
            <Text style={[sx.kpiV, fl && { color: C.gold }]}>{fl ? `🔥 ${fl}` : '0'}</Text>
            <Text style={sx.kpiK}>{fl ? `jour${fl > 1 ? 's' : ''} d’affilée` : 'flamme éteinte'}</Text>
          </View>
          <View style={sx.kpi}>
            <Text style={sx.kpiV}>{lv.pts}</Text>
            <Text style={sx.kpiK}>points</Text>
          </View>
          <View style={sx.kpi}>
            <Text style={[sx.kpiV, { fontSize: 17, lineHeight: 22 }]} numberOfLines={2}>{lv.n}</Text>
            <Text style={sx.kpiK}>ton niveau</Text>
          </View>
        </Row>
        {lv.next ? (
          <View style={{ gap: 5 }}>
            <Bar pct={lv.pct} h={5} />
            <Muted style={{ fontSize: 12.5 }}>
              {lv.next.p - lv.pts} points avant « {lv.next.n} ». Mail {PTS.mail} · relance {PTS.relance} · appel {PTS.appel} · devis {PTS.devis} · RDV {PTS.rdv} · mission {PTS.mission}
            </Muted>
          </View>
        ) : (
          <Muted style={{ fontSize: 12.5, color: C.gold }}>Niveau maximum. La maison, c’est toi.</Muted>
        )}
      </Card>

      <Card tone="gold" style={{ gap: 6 }}>
        <Eyebrow style={{ color: C.gold }}>Le moment de la saison</Eyebrow>
        <T style={{ fontSize: 14.5 }}>{SEASON[P(T0).getMonth()]}</T>
      </Card>

      <Card style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 19 }}>CA du mois</H2>
          <Mono style={{ fontFamily: F.monoB, color: ca >= st.ca ? C.ok : C.ink }}>
            {euro(ca)} <Text style={{ color: C.muted }}>/ {euro(st.ca)}</Text>
          </Mono>
        </Row>
        <Bar pct={ca / st.ca} h={8} />
        <Muted style={{ fontSize: 12.5 }}>Additionne les montants de tes missions du mois (onglet Équipe).</Muted>
      </Card>

      {due.length > 0 && (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <H2 style={{ fontSize: 19 }}>À relancer</H2>
            <Mono style={{ color: C.warn }}>{due.length}</Mono>
          </Row>
          {due.slice(0, 6).map(({ p, n: d }) => (
            <Row key={p.id} style={sx.due}>
              <Pressable style={{ flex: 1 }} onPress={() => { setStage(p.stage); setType('Tous'); setOpen(p.id); }}>
                <Text style={sx.dueN} numberOfLines={1}>{p.nom || 'Sans nom'}</Text>
                <Text style={sx.dueS} numberOfLines={1}>
                  {p.stage} · {d >= 99 ? 'jamais relancé' : `il y a ${d} j`}
                </Text>
              </Pressable>
              <Btn small variant="primary" title="Relancer" onPress={() => mail(p, true)} />
            </Row>
          ))}
        </Card>
      )}

      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 22 }}>Mon parcours</H2>
          <Btn small variant="primary" title="+ Prospect" onPress={addProspect} />
        </Row>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {['Tous', ...TYPES].map((t) => (
            <Chip key={t} on={type === t} label={t} onPress={() => setType(t)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {STAGES.map((s) => (
            <Pressable key={s} onPress={() => { tap(); setStage(s); setOpen(null); }} style={[sx.col, stage === s && { borderColor: STAGE_COL[s], backgroundColor: C.surface2 }]}>
              <Text style={[sx.colN, { color: STAGE_COL[s] }]}>{counts[s]}</Text>
              <Text style={[sx.colT, stage === s && { color: C.ink }]} numberOfLines={1}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {list.length === 0 && <Muted style={{ textAlign: 'center', paddingVertical: 16 }}>Personne dans « {stage} » pour l’instant.</Muted>}

        {list.map((p) => {
          const isOpen = open === p.id;
          const touched = (D.acts?.[T0] || []).some((x) => x.p === p.id);
          return (
            <View key={p.id} style={[sx.card, touched && { borderColor: C.ok }]}>
              <Pressable onPress={() => { tap(); setOpen(isOpen ? null : p.id); }}>
                <Row>
                  <View style={[sx.tag, { borderColor: STAGE_COL[p.stage] }]}>
                    <Text style={[sx.tagT, { color: STAGE_COL[p.stage] }]}>{p.type?.[0] || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={sx.nm} numberOfLines={1}>{p.nom || 'Nouveau prospect'}</Text>
                    <Text style={sx.sub} numberOfLines={1}>
                      {[p.contact, p.last ? `dernier contact ${daysSince(p.last) === 0 ? "aujourd'hui" : fmt(p.last)}` : 'jamais contacté'].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  {touched && <Text style={{ color: C.ok, fontFamily: F.bold }}>✓</Text>}
                </Row>
              </Pressable>

              <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                <Btn small variant="primary" title="Mail" onPress={() => mail(p, ['Contacté', 'Relancé'].includes(p.stage))} />
                <Btn small title="Appel" onPress={() => call(p)} />
                <Btn small title="Relancé" onPress={() => log(p.id, 'relance')} />
                {NEXT[p.stage] && <Btn small variant="ghost" title={`→ ${NEXT[p.stage]}`} onPress={() => setStageOf(p.id, NEXT[p.stage])} />}
              </Row>

              {isOpen && (
                <View style={{ gap: 8 }}>
                  <Input value={p.nom} placeholder="Nom (traiteur, salle, agence)" onChangeText={(v) => setF(p.id, 'nom', v)} />
                  <Row style={{ gap: 6 }}>
                    {TYPES.map((t) => (
                      <Chip key={t} on={p.type === t} label={t} onPress={() => setF(p.id, 'type', t)} />
                    ))}
                  </Row>
                  <Input value={p.contact} placeholder="Contact (prénom nom)" onChangeText={(v) => setF(p.id, 'contact', v)} />
                  <Input value={p.salut} placeholder="Formule du mail : « Madame Audebert », « Mikael »…" onChangeText={(v) => setF(p.id, 'salut', v)} />
                  <Input value={p.email} placeholder="Adresse mail" autoCapitalize="none" keyboardType="email-address" onChangeText={(v) => setF(p.id, 'email', v)} />
                  <Input value={p.tel} placeholder="Téléphone" keyboardType="phone-pad" onChangeText={(v) => setF(p.id, 'tel', v)} />
                  <Input value={p.note} placeholder="Note (besoin, période, qui décide…)" multiline style={{ minHeight: 60, textAlignVertical: 'top' }} onChangeText={(v) => setF(p.id, 'note', v)} />
                  <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                    <Btn small variant="ghost" title={`Étape : ${p.stage} ▾`} onPress={() => setPick(p.id)} />
                    <Btn
                      small
                      variant="ghost"
                      title="Supprimer"
                      onPress={() =>
                        Alert.alert('Supprimer ce prospect ?', p.nom || 'Sans nom', [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'Supprimer', style: 'destructive', onPress: () => { cancelRelance(p.id); update((X) => delete X.prospects[p.id]); } },
                        ])
                      }
                    />
                  </Row>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 19 }}>Trophées</H2>
          <Mono style={{ color: C.gold }}>
            {tro.filter((t) => t.ok).length}/{tro.length}
          </Mono>
        </Row>
        <View style={sx.grid}>
          {tro.map((t) => (
            <View key={t.n} style={[sx.tro, t.ok && { backgroundColor: C.goldSoft, borderColor: C.gold }]}>
              <Text style={[sx.troN, t.ok && { color: C.gold }]}>{t.ok ? '★ ' : ''}{t.n}</Text>
              <Text style={sx.troD}>{t.d}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Picker
        visible={!!pick}
        title="Étape du parcours"
        options={STAGES}
        value={pick ? D.prospects?.[pick]?.stage : null}
        onPick={(o) => {
          if (pick) {
            setStageOf(pick, o);
            setStage(o);
          }
        }}
        onClose={() => setPick(null)}
      />
    </View>
  );
}

const Chip = ({ on, label, onPress }) => (
  <Pressable onPress={() => { tap(); onPress(); }} style={[sx.chip, on && { backgroundColor: C.accent, borderColor: C.accent }]}>
    <Text style={[sx.chipT, on && { color: C.accentInk }]}>{label}</Text>
  </Pressable>
);

const sx = StyleSheet.create({
  big: { color: C.ink, fontFamily: F.display, fontSize: 34, lineHeight: 36 },
  kpi: { flex: 1, backgroundColor: C.surface2, borderRadius: 14, padding: 11, minHeight: 66, justifyContent: 'space-between' },
  kpiV: { color: C.ink, fontFamily: F.display, fontSize: 22, lineHeight: 26 },
  kpiK: { color: C.muted, fontFamily: F.medium, fontSize: 11.5, marginTop: 2 },
  due: { backgroundColor: C.surface2, borderRadius: 12, padding: 10 },
  dueN: { color: C.ink, fontFamily: F.bold, fontSize: 15 },
  dueS: { color: C.muted, fontFamily: F.medium, fontSize: 12.5, marginTop: 1 },
  chip: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13 },
  chipT: { color: C.muted, fontFamily: F.semi, fontSize: 13 },
  col: { width: 92, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, borderRadius: 14, padding: 10, gap: 2 },
  colN: { fontFamily: F.display, fontSize: 22 },
  colT: { color: C.muted, fontFamily: F.semi, fontSize: 11.5 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 12, gap: 10 },
  tag: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tagT: { fontFamily: F.display, fontSize: 15 },
  nm: { color: C.ink, fontFamily: F.bold, fontSize: 16 },
  sub: { color: C.muted, fontFamily: F.medium, fontSize: 12.5, marginTop: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tro: { width: '48%', flexGrow: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, borderRadius: 12, padding: 10, gap: 3 },
  troN: { color: C.ink, fontFamily: F.bold, fontSize: 13.5 },
  troD: { color: C.muted, fontFamily: F.medium, fontSize: 11.5 },
});
