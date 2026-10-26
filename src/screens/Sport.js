import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { DN, DNL, fmt, mon, today, wd } from '../dates';
import { DEFAULT_PROG } from '../program';
import { sessFor, dayDoc, ensureSport, prevLoad, totalSessions, weekStats, streak, dayDot, clone, prog } from '../stats';
import { Card, H2, Eyebrow, Mono, Muted, Btn, Check, DayStrip, Input, Row, T, Toggle, tap } from '../ui';

export default function Sport({ week, day, setDay }) {
  const { D, update } = useStore();
  const [edit, setEdit] = useState(false);
  if (edit) return <ProgEditor onDone={() => setEdit(false)} />;

  const se = sessFor(D, day);
  const sp = dayDoc(D, day).sport || {};
  const ws = weekStats(D, week);
  const nd = se.ex.filter((e) => sp.ex?.[e.id]?.done).length;

  const toggleEx = (id) =>
    update((X) => {
      const S = ensureSport(X, day);
      const x = (S.ex[id] = S.ex[id] || {});
      x.done = !x.done;
      if (S.snap.ex.length && S.snap.ex.every((e) => S.ex[e.id]?.done)) {
        if (!S.done) tap('success');
        S.done = true;
      }
    });
  const setLoad = (id, v) =>
    update((X) => {
      const S = ensureSport(X, day);
      const x = (S.ex[id] = S.ex[id] || {});
      x.charge = v.replace(',', '.');
    });
  const toggleValid = () =>
    update((X) => {
      const S = ensureSport(X, day);
      S.done = !S.done;
      if (S.done) tap('success');
    });

  return (
    <View style={{ gap: 14 }}>
      <DayStrip week={week} selected={day} onSelect={setDay} dotFor={(k) => dayDot(D, k, 'sport')} />

      {se.rest ? (
        <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
          <Eyebrow>
            {DNL[wd(day)]} {fmt(day)}
          </Eyebrow>
          <H2>Jour de repos</H2>
          <Muted style={{ textAlign: 'center' }}>
            Récupération, marche et 10 min d'étirements grand écart. Les fessiers grossissent aussi les jours off.
          </Muted>
        </Card>
      ) : (
        <Card>
          <View style={{ gap: 4 }}>
            <Eyebrow>
              {DNL[wd(day)]} {fmt(day)} · {nd}/{se.ex.length} exercices
            </Eyebrow>
            <H2>{se.name}</H2>
          </View>
          <Btn title={sp.done ? '✓  Séance validée' : 'Valider la séance'} variant={sp.done ? 'ok' : 'primary'} onPress={toggleValid} />
          <View>
            {se.ex.map((e, i) => {
              const st = sp.ex?.[e.id] || {};
              const pv = prevLoad(D, day, e.name);
              const up = pv && st.charge && parseFloat(st.charge) > parseFloat(pv.v);
              return (
                <View key={e.id} style={[st2.ex, i === 0 && { borderTopWidth: 0 }]}>
                  <Check checked={!!st.done} onToggle={() => toggleEx(e.id)} />
                  <Pressable style={{ flex: 1 }} onPress={() => toggleEx(e.id)}>
                    <Text style={[st2.nm, st.done && st2.nmDone]}>{e.name}</Text>
                    <Mono style={{ color: C.muted, fontSize: 12.5, marginTop: 2 }}>{e.scheme}</Mono>
                  </Pressable>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Row style={{ gap: 5 }}>
                      <Input
                        value={st.charge || ''}
                        onChangeText={(v) => setLoad(e.id, v)}
                        keyboardType="decimal-pad"
                        placeholder="—"
                        style={st2.load}
                      />
                      <Mono style={{ color: C.muted, fontSize: 12 }}>kg</Mono>
                    </Row>
                    <Text style={[st2.prev, up && { color: C.gold, fontFamily: F.bold }]}>
                      {pv ? `${up ? '▲ record · ' : ''}dernière ${pv.v} kg` : '1re fois'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      )}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 20 }}>Compteur</H2>
          <Btn small variant="ghost" title="Modifier le programme" onPress={() => setEdit(true)} />
        </Row>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Kpi v={totalSessions(D)} k="séances au total" gold />
          <Kpi v={`${ws.sDone}/${ws.planned}`} k="cette semaine" />
          <Kpi v={streak(D)} k="semaines parfaites d'affilée" />
        </View>
      </Card>

      <Card>
        <H2 style={{ fontSize: 20 }}>Ta semaine</H2>
        {[0, 1, 2, 3, 4, 5, 6].map((d) => {
          const x = prog(D).days[d];
          return (
            <Row key={d} style={{ justifyContent: 'space-between' }}>
              <Mono style={{ color: C.muted, width: 40 }}>{DN[d]}</Mono>
              <T style={{ flex: 1, color: x.rest ? C.faint : C.ink }}>{x.name}</T>
            </Row>
          );
        })}
      </Card>
    </View>
  );
}

const Kpi = ({ v, k, gold }) => (
  <View style={[st2.kpi, gold && { backgroundColor: C.goldSoft }]}>
    <Text style={[st2.kpiV, gold && { color: C.gold }]}>{String(v)}</Text>
    <Text style={st2.kpiK}>{k}</Text>
  </View>
);

function ProgEditor({ onDone }) {
  const { D, update } = useStore();
  const p = prog(D);
  const mut = (fn) =>
    update((X) => {
      if (!X.programme) X.programme = clone(DEFAULT_PROG);
      fn(X.programme);
    });
  const uid = () => 'u' + Math.random().toString(36).slice(2, 9);
  return (
    <View style={{ gap: 12 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <H2>Mon programme</H2>
        <Btn title="Terminé" variant="primary" small onPress={onDone} />
      </Row>
      <Muted>Les changements s'appliquent aux séances pas encore commencées. Les séances passées gardent leur contenu.</Muted>
      {[0, 1, 2, 3, 4, 5, 6].map((d) => {
        const x = p.days[d];
        return (
          <Card key={d} style={{ gap: 8 }}>
            <Row>
              <Text style={{ color: C.accent, fontFamily: F.display, fontSize: 16, width: 38 }}>{DN[d]}</Text>
              <Input
                style={{ flex: 1 }}
                editable={!x.rest}
                value={x.name}
                onChangeText={(v) => mut((P) => (P.days[d].name = v))}
              />
              <Toggle
                label="Repos"
                on={x.rest}
                onPress={() =>
                  mut((P) => {
                    const dd = P.days[d];
                    dd.rest = !dd.rest;
                    dd.name = dd.rest ? 'Repos' : 'Nouvelle séance';
                    if (!dd.rest && !dd.ex.length) dd.ex.push({ id: uid(), name: 'Exercice', scheme: '3 × 12' });
                  })
                }
              />
            </Row>
            {!x.rest &&
              x.ex.map((e, i) => (
                <Row key={e.id} style={{ gap: 6 }}>
                  <Input
                    style={{ flex: 1, fontSize: 14 }}
                    value={e.name}
                    placeholder="Exercice"
                    onChangeText={(v) => mut((P) => (P.days[d].ex[i].name = v))}
                  />
                  <Input
                    style={{ width: 104, fontSize: 13, fontFamily: F.mono }}
                    value={e.scheme}
                    placeholder="3 × 12"
                    onChangeText={(v) => mut((P) => (P.days[d].ex[i].scheme = v))}
                  />
                  <Pressable onPress={() => mut((P) => P.days[d].ex.splice(i, 1))} style={st2.del} hitSlop={6}>
                    <Text style={{ color: C.bad, fontFamily: F.bold, fontSize: 18 }}>×</Text>
                  </Pressable>
                </Row>
              ))}
            {!x.rest && (
              <Btn
                small
                variant="ghost"
                title="+ Ajouter un exercice"
                style={{ alignSelf: 'flex-start' }}
                onPress={() => mut((P) => P.days[d].ex.push({ id: uid(), name: '', scheme: '3 × 12' }))}
              />
            )}
          </Card>
        );
      })}
      <Btn variant="ghost" title="Remettre le programme d'origine" onPress={() =>
          Alert.alert("Remettre le programme d'origine ?", 'Tes modifications du programme seront perdues. Tes séances passées ne changent pas.', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Remettre', style: 'destructive', onPress: () => update((X) => delete X.programme) },
          ])
        }
      />
    </View>
  );
}

const st2 = StyleSheet.create({
  ex: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderColor: C.line },
  nm: { color: C.ink, fontFamily: F.semi, fontSize: 15.5 },
  nmDone: { color: C.muted, textDecorationLine: 'line-through' },
  load: { width: 64, textAlign: 'right', paddingVertical: 7, fontFamily: F.monoB, fontSize: 15 },
  prev: { color: C.muted, fontFamily: F.medium, fontSize: 11 },
  kpi: { flex: 1, backgroundColor: C.surface2, borderRadius: 14, padding: 12 },
  kpiV: { color: C.ink, fontFamily: F.display, fontSize: 28, lineHeight: 30 },
  kpiK: { color: C.muted, fontFamily: F.medium, fontSize: 12, marginTop: 3 },
  del: { width: 36, height: 38, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
});
