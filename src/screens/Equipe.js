import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking, Alert, Share } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { add, today, wd, DN, DNL, fmt, P } from '../dates';
import { ROLES } from '../program';
import { uid } from '../seed';
import { Card, H2, Eyebrow, Mono, Muted, Btn, Input, Row, T, tap } from '../ui';

const label = (k) => `${DNL[wd(k)]} ${fmt(k)}`;
const ini = (n) => (n || '?').split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
const need = (m) => Object.values(m.besoin || {}).reduce((a, n) => a + n, 0);

export default function Equipe() {
  const { D, update } = useStore();
  const [view, setView] = useState('missions');
  const [open, setOpen] = useState(null);
  const [showPast, setShowPast] = useState(false);
  const T0 = today();
  const team = D.team || {};
  const missions = Object.values(D.missions || {}).sort((a, b) => (a.date + (a.heure || '')).localeCompare(b.date + (b.heure || '')));
  const upcoming = missions.filter((m) => m.date >= T0);
  const past = missions.filter((m) => m.date < T0).reverse();

  const newMission = () => {
    const id = uid();
    update((X) => (X.missions[id] = { id, date: T0, client: '', lieu: '', heure: '', montant: '', note: '', besoin: {}, staff: [] }));
    setView('missions');
    setOpen(id);
  };
  const newPerson = () => {
    const id = uid();
    update((X) => (X.team[id] = { id, nom: '', tel: '', roles: [], note: '' }));
    setView('team');
    setOpen(id);
  };

  // Qui est déjà pris ce jour-là, et sur quoi.
  const bookedOn = (date, exceptId) => {
    const out = {};
    missions.forEach((m) => {
      if (m.date === date && m.id !== exceptId) (m.staff || []).forEach((s) => (out[s.t] = m.client || 'une autre mission'));
    });
    return out;
  };

  const days = Array.from({ length: 14 }, (_, i) => add(T0, i));

  return (
    <View style={{ gap: 14 }}>
      <Row style={{ gap: 8 }}>
        <Seg on={view === 'missions'} label={`Missions · ${upcoming.length}`} onPress={() => { setView('missions'); setOpen(null); }} />
        <Seg on={view === 'team'} label={`Mon équipe · ${Object.keys(team).length}`} onPress={() => { setView('team'); setOpen(null); }} />
      </Row>

      {view === 'missions' ? (
        <>
          <Card style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <H2 style={{ fontSize: 19 }}>Les 14 prochains jours</H2>
              <Btn small variant="primary" title="+ Mission" onPress={newMission} />
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {days.map((k) => {
                const ms = missions.filter((m) => m.date === k);
                const full = ms.length && ms.every((m) => (m.staff || []).length >= need(m));
                return (
                  <View key={k} style={[sx.day, ms.length && { borderColor: full ? C.ok : C.warn, backgroundColor: C.surface2 }, k === T0 && { borderColor: C.accent }]}>
                    <Text style={sx.dayN}>{DN[wd(k)]}</Text>
                    <Text style={sx.dayD}>{P(k).getDate()}</Text>
                    <Text style={[sx.dayC, { color: ms.length ? (full ? C.ok : C.warn) : C.faint }]}>
                      {ms.length ? `${ms.reduce((a, m) => a + (m.staff || []).length, 0)} p.` : '–'}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
            <Muted style={{ fontSize: 12 }}>Vert : mission complète. Orange : il manque du monde. Le chiffre, c’est le nombre de personnes bookées.</Muted>
          </Card>

          {upcoming.length === 0 && (
            <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
              <H2 style={{ fontSize: 19 }}>Aucune mission à venir</H2>
              <Muted style={{ textAlign: 'center' }}>Ajoute ta prochaine mission, puis booke ton équipe dessus. Tu verras ici qui est sur quoi.</Muted>
            </Card>
          )}

          {upcoming.map((m) => (
            <MissionCard key={m.id} m={m} team={team} open={open === m.id} onToggle={() => setOpen(open === m.id ? null : m.id)} booked={bookedOn(m.date, m.id)} />
          ))}

          {past.length > 0 && (
            <Btn variant="ghost" title={showPast ? 'Masquer les missions passées' : `Missions passées (${past.length})`} onPress={() => setShowPast(!showPast)} />
          )}
          {showPast &&
            past.slice(0, 20).map((m) => (
              <MissionCard key={m.id} m={m} team={team} past open={open === m.id} onToggle={() => setOpen(open === m.id ? null : m.id)} booked={bookedOn(m.date, m.id)} />
            ))}
        </>
      ) : (
        <>
          <Row style={{ justifyContent: 'space-between' }}>
            <H2 style={{ fontSize: 22 }}>Mon équipe</H2>
            <Btn small variant="primary" title="+ Personne" onPress={newPerson} />
          </Row>
          {Object.keys(team).length === 0 && (
            <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
              <H2 style={{ fontSize: 19 }}>Ton équipe est vide</H2>
              <Muted style={{ textAlign: 'center' }}>Ajoute tes maîtres d’hôtel, serveurs, hôtesses et barmen avec leur numéro et leurs postes.</Muted>
            </Card>
          )}
          {Object.values(team)
            .sort((a, b) => (a.nom || '').localeCompare(b.nom || ''))
            .map((t) => (
              <PersonCard key={t.id} t={t} missions={missions} open={open === t.id} onToggle={() => setOpen(open === t.id ? null : t.id)} />
            ))}
        </>
      )}
    </View>
  );
}

function MissionCard({ m, team, open, onToggle, booked, past }) {
  const { update } = useStore();
  const n = need(m);
  const got = (m.staff || []).length;
  const full = n > 0 && got >= n;
  const set = (f, v) => update((X) => (X.missions[m.id][f] = v));
  const mut = (fn) => update((X) => fn(X.missions[m.id]));
  const people = Object.values(team).sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));

  const toggleStaff = (tid, role) =>
    mut((M) => {
      M.staff = M.staff || [];
      const i = M.staff.findIndex((s) => s.t === tid && s.role === role);
      if (i >= 0) M.staff.splice(i, 1);
      else {
        M.staff = M.staff.filter((s) => s.t !== tid);
        M.staff.push({ t: tid, role });
      }
    });

  const brief = () => {
    const lines = [
      `${m.client || 'Mission'} · ${label(m.date)}${m.heure ? ' · ' + m.heure : ''}`,
      m.lieu ? `Lieu : ${m.lieu}` : '',
      '',
      ...ROLES.filter((r) => (m.staff || []).some((s) => s.role === r)).map(
        (r) => `${r} : ${(m.staff || []).filter((s) => s.role === r).map((s) => (team[s.t]?.nom || '?') + (team[s.t]?.tel ? ' (' + team[s.t].tel + ')' : '')).join(', ')}`
      ),
      m.note ? `\n${m.note}` : '',
    ].filter((x, i) => x !== '' || i === 2);
    Share.share({ message: lines.join('\n') });
  };

  return (
    <View style={[sx.card, !past && n > 0 && { borderColor: full ? C.ok : C.warn }, past && { opacity: 0.75 }]}>
      <Pressable onPress={() => { tap(); onToggle(); }} style={{ gap: 8 }}>
        <Row>
          <View style={{ flex: 1 }}>
            <Eyebrow>{label(m.date)}{m.heure ? ` · ${m.heure}` : ''}</Eyebrow>
            <Text style={sx.nm} numberOfLines={1}>{m.client || 'Nouvelle mission'}</Text>
            {!!m.lieu && <Text style={sx.sub} numberOfLines={1}>{m.lieu}</Text>}
          </View>
          <View style={[sx.badge, { backgroundColor: n === 0 ? C.surface2 : full ? C.okSoft : C.warnSoft }]}>
            <Text style={[sx.badgeT, { color: n === 0 ? C.muted : full ? C.ok : C.warn }]}>
              {got}/{n || '?'}
            </Text>
          </View>
        </Row>
        {got > 0 && (
          <View style={sx.wrap}>
            {(m.staff || []).map((s) => (
              <View key={s.t + s.role} style={sx.pill}>
                <View style={sx.av}><Text style={sx.avT}>{ini(team[s.t]?.nom)}</Text></View>
                <Text style={sx.pillT} numberOfLines={1}>{team[s.t]?.nom || 'Supprimé'} · {s.role}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>

      {open && (
        <View style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Btn small title="‹ −1 j" onPress={() => set('date', add(m.date, -1))} />
            <Text style={{ color: C.ink, fontFamily: F.bold, fontSize: 15 }}>{label(m.date)}</Text>
            <Btn small title="+1 j ›" onPress={() => set('date', add(m.date, 1))} />
          </Row>
          <Row style={{ gap: 6, justifyContent: 'center' }}>
            <Btn small variant="ghost" title="−7 j" onPress={() => set('date', add(m.date, -7))} />
            <Btn small variant="ghost" title="Aujourd’hui" onPress={() => set('date', today())} />
            <Btn small variant="ghost" title="+7 j" onPress={() => set('date', add(m.date, 7))} />
          </Row>
          <Input value={m.client} placeholder="Client (traiteur, salle, agence)" onChangeText={(v) => set('client', v)} />
          <Input value={m.lieu} placeholder="Lieu, adresse" onChangeText={(v) => set('lieu', v)} />
          <Row style={{ gap: 6 }}>
            <Input style={{ flex: 1 }} value={m.heure} placeholder="Horaires (16h-23h)" onChangeText={(v) => set('heure', v)} />
            <Input style={{ width: 110 }} value={String(m.montant || '')} placeholder="Montant €" keyboardType="decimal-pad" onChangeText={(v) => set('montant', v.replace(',', '.'))} />
          </Row>

          <Eyebrow style={{ marginTop: 4 }}>Besoins et équipe bookée</Eyebrow>
          {ROLES.map((r) => {
            const nb = m.besoin?.[r] || 0;
            const on = (m.staff || []).filter((s) => s.role === r);
            const cand = people.filter((p) => !(p.roles || []).length || (p.roles || []).includes(r));
            return (
              <View key={r} style={[sx.role, nb > 0 && { borderColor: on.length >= nb ? C.ok : C.warn }]}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T style={{ flex: 1, fontFamily: F.semi }}>{r}</T>
                  <Mono style={{ color: C.muted }}>{on.length}/</Mono>
                  <Step v={nb} onMinus={() => mut((M) => (M.besoin = { ...(M.besoin || {}), [r]: Math.max(0, nb - 1) }))} onPlus={() => mut((M) => (M.besoin = { ...(M.besoin || {}), [r]: nb + 1 }))} />
                </Row>
                {nb > 0 && (
                  <View style={sx.wrap}>
                    {cand.length === 0 && <Muted style={{ fontSize: 12.5 }}>Personne avec ce poste dans ton équipe.</Muted>}
                    {cand.map((p) => {
                      const sel = on.some((s) => s.t === p.id);
                      const busy = booked[p.id];
                      return (
                        <Pressable key={p.id} onPress={() => { tap(); toggleStaff(p.id, r); }} style={[sx.cand, sel && { backgroundColor: C.accent, borderColor: C.accent }, !sel && busy && { borderColor: C.bad }]}>
                          <Text style={[sx.candT, sel && { color: C.accentInk }]} numberOfLines={1}>
                            {p.nom || 'Sans nom'}{!sel && busy ? ` · pris (${busy})` : ''}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
          <Input value={m.note} placeholder="Infos pour l’équipe (tenue, contact sur place…)" multiline style={{ minHeight: 60, textAlignVertical: 'top' }} onChangeText={(v) => set('note', v)} />
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            <Btn small variant="primary" title="Partager le brief" onPress={brief} />
            <Btn
              small
              variant="ghost"
              title="Supprimer"
              onPress={() =>
                Alert.alert('Supprimer cette mission ?', m.client || label(m.date), [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => update((X) => delete X.missions[m.id]) },
                ])
              }
            />
          </Row>
        </View>
      )}
    </View>
  );
}

function PersonCard({ t, missions, open, onToggle }) {
  const { update } = useStore();
  const T0 = today();
  const mine = missions.filter((m) => (m.staff || []).some((s) => s.t === t.id));
  const next = mine.filter((m) => m.date >= T0);
  const done = mine.length - next.length;
  const set = (f, v) => update((X) => (X.team[t.id][f] = v));
  const toggleRole = (r) =>
    update((X) => {
      const R = (X.team[t.id].roles = X.team[t.id].roles || []);
      const i = R.indexOf(r);
      if (i >= 0) R.splice(i, 1);
      else R.push(r);
    });

  return (
    <View style={sx.card}>
      <Pressable onPress={() => { tap(); onToggle(); }}>
        <Row>
          <View style={[sx.av, { width: 40, height: 40, borderRadius: 20 }]}>
            <Text style={[sx.avT, { fontSize: 15 }]}>{ini(t.nom)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={sx.nm} numberOfLines={1}>{t.nom || 'Nouvelle personne'}</Text>
            <Text style={sx.sub} numberOfLines={1}>{(t.roles || []).join(' · ') || 'Postes à préciser'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Mono style={{ fontFamily: F.monoB }}>{done}</Mono>
            <Text style={sx.sub}>missions</Text>
          </View>
        </Row>
      </Pressable>
      {next.length > 0 ? (
        <View style={{ gap: 4 }}>
          {next.slice(0, 3).map((m) => (
            <Text key={m.id} style={sx.book} numberOfLines={1}>
              {label(m.date)} · {m.client || 'Mission'} · {(m.staff || []).find((s) => s.t === t.id)?.role}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={[sx.sub, { color: C.ok }]}>Disponible : rien de booké à venir</Text>
      )}
      <Row style={{ gap: 6 }}>
        {!!t.tel && <Btn small title="Appeler" onPress={() => Linking.openURL(`tel:${t.tel.replace(/[^\d+]/g, '')}`).catch(() => {})} />}
        {!!t.tel && <Btn small variant="ghost" title="SMS" onPress={() => Linking.openURL(`sms:${t.tel.replace(/[^\d+]/g, '')}`).catch(() => {})} />}
      </Row>
      {open && (
        <View style={{ gap: 8 }}>
          <Input value={t.nom} placeholder="Prénom et nom" onChangeText={(v) => set('nom', v)} />
          <Input value={t.tel} placeholder="Téléphone" keyboardType="phone-pad" onChangeText={(v) => set('tel', v)} />
          <View style={sx.wrap}>
            {ROLES.map((r) => {
              const on = (t.roles || []).includes(r);
              return (
                <Pressable key={r} onPress={() => { tap(); toggleRole(r); }} style={[sx.cand, on && { backgroundColor: C.accent, borderColor: C.accent }]}>
                  <Text style={[sx.candT, on && { color: C.accentInk }]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>
          <Input value={t.note} placeholder="Note (taille de tenue, véhiculée, langues, fiabilité…)" multiline style={{ minHeight: 60, textAlignVertical: 'top' }} onChangeText={(v) => set('note', v)} />
          <Btn
            small
            variant="ghost"
            style={{ alignSelf: 'flex-start' }}
            title="Retirer de l’équipe"
            onPress={() =>
              Alert.alert('Retirer de l’équipe ?', t.nom || 'Sans nom', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Retirer',
                  style: 'destructive',
                  onPress: () =>
                    update((X) => {
                      delete X.team[t.id];
                      Object.values(X.missions || {}).forEach((m) => (m.staff = (m.staff || []).filter((s) => s.t !== t.id)));
                    }),
                },
              ])
            }
          />
        </View>
      )}
    </View>
  );
}

const Seg = ({ on, label: l, onPress }) => (
  <Pressable onPress={() => { tap(); onPress(); }} style={[sx.seg, on && { backgroundColor: C.accent, borderColor: C.accent }]}>
    <Text style={[sx.segT, on && { color: C.accentInk }]}>{l}</Text>
  </Pressable>
);
const Step = ({ v, onMinus, onPlus }) => (
  <Row style={{ gap: 6 }}>
    <Pressable onPress={onMinus} style={sx.st} hitSlop={6}><Text style={sx.stT}>−</Text></Pressable>
    <Text style={{ color: C.ink, fontFamily: F.monoB, fontSize: 15, width: 20, textAlign: 'center' }}>{v}</Text>
    <Pressable onPress={onPlus} style={sx.st} hitSlop={6}><Text style={sx.stT}>+</Text></Pressable>
  </Row>
);

const sx = StyleSheet.create({
  seg: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, borderRadius: 999, paddingVertical: 10 },
  segT: { color: C.muted, fontFamily: F.bold, fontSize: 14 },
  day: { width: 52, alignItems: 'center', paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  dayN: { color: C.muted, fontFamily: F.bold, fontSize: 10.5, textTransform: 'uppercase' },
  dayD: { color: C.ink, fontFamily: F.displayB, fontSize: 18 },
  dayC: { fontFamily: F.monoB, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 12, gap: 10 },
  nm: { color: C.ink, fontFamily: F.bold, fontSize: 16, marginTop: 2 },
  sub: { color: C.muted, fontFamily: F.medium, fontSize: 12.5, marginTop: 1 },
  badge: { borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  badgeT: { fontFamily: F.monoB, fontSize: 17 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.surface2, borderRadius: 999, paddingVertical: 4, paddingLeft: 4, paddingRight: 10, maxWidth: '100%' },
  pillT: { color: C.ink, fontFamily: F.semi, fontSize: 12.5, flexShrink: 1 },
  av: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avT: { color: C.accent, fontFamily: F.bold, fontSize: 10.5 },
  role: { borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 10, gap: 8 },
  cand: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, maxWidth: '100%' },
  candT: { color: C.ink, fontFamily: F.semi, fontSize: 13 },
  st: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  stT: { color: C.ink, fontFamily: F.bold, fontSize: 18 },
  book: { color: C.ink, fontFamily: F.medium, fontSize: 13, backgroundColor: C.surface2, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, overflow: 'hidden' },
});
