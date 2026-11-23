import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { DN, DNL, fmt, mon, today, wd } from '../dates';
import { DEFAULT_PROG } from '../program';
import { sessFor, dayDoc, ensureSport, prevLoad, totalSessions, weekStats, streak, dayDot, clone, prog, settings } from '../stats';
import { Bar } from '../ui';
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
            Repos actif : tes 10 000 pas (une grande marche, c’est parfait) et 10 min d’étirements. Les fessiers grossissent aussi les jours off.
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

      <Corps day={day} />

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

function Corps({ day }) {
  const { D, update } = useStore();
  const st = settings(D);
  const pas = Number(dayDoc(D, day).pas) || 0;
  const b = (D.body || {})[day] || {};
  const setPas = (v) => update((X) => ((X['d-' + day] = X['d-' + day] || {}).pas = v.replace(/\D/g, '')));
  const setB = (f, v) => update((X) => (((X.body = X.body || {})[day] = { ...(X.body[day] || {}) })[f] = v.replace(',', '.')));
  const weigh = Object.keys(D.body || {})
    .filter((k) => parseFloat(D.body[k].poids) > 0)
    .sort()
    .map((k) => ({ k, v: parseFloat(D.body[k].poids) }));
  const first = weigh[0];
  const last = weigh[weigh.length - 1];
  const diff = first && last && weigh.length > 1 ? Math.round((last.v - first.v) * 10) / 10 : null;
  const pts = weigh.slice(-8);
  const lo = Math.min(...pts.map((x) => x.v));
  const hi = Math.max(...pts.map((x) => x.v));
  const lastOf = (f) => {
    const k = Object.keys(D.body || {}).filter((x) => parseFloat(D.body[x][f]) > 0).sort().pop();
    return k ? `${D.body[k][f]} cm (${fmt(k)})` : 'pas encore mesuré';
  };
  return (
    <Card>
      <H2 style={{ fontSize: 20 }}>Mon corps</H2>
      <Row style={{ justifyContent: 'space-between' }}>
        <T style={{ flex: 1 }}>Pas du jour</T>
        <Input value={pas ? String(pas) : ''} onChangeText={setPas} keyboardType="number-pad" placeholder="0" style={{ width: 96, textAlign: 'right', fontFamily: F.monoB }} />
      </Row>
      <Bar pct={pas / st.pas} h={7} />
      <Muted style={{ fontSize: 12.5 }}>
        Objectif {st.pas.toLocaleString('fr-FR')} pas. Recopie le chiffre de l’appli Santé de ton iPhone le soir.
      </Muted>
      <View style={{ height: 1, backgroundColor: C.line }} />
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <T>Poids</T>
          <Muted style={{ fontSize: 12 }}>Une fois par semaine, le même jour, le matin à jeun.</Muted>
        </View>
        <Input value={b.poids || ''} onChangeText={(v) => setB('poids', v)} keyboardType="decimal-pad" placeholder="kg" style={{ width: 80, textAlign: 'right', fontFamily: F.monoB }} />
      </Row>
      {pts.length > 1 && (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 70 }}>
            {pts.map((x, i) => (
              <View key={x.k} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
                <Text style={{ color: i === pts.length - 1 ? C.ink : C.muted, fontFamily: F.mono, fontSize: 9.5 }}>{x.v}</Text>
                <View style={{ width: '70%', height: hi > lo ? 10 + ((x.v - lo) / (hi - lo)) * 40 : 30, borderRadius: 6, backgroundColor: i === pts.length - 1 ? C.accent : C.surface2 }} />
              </View>
            ))}
          </View>
          {diff != null && (
            <Text style={{ color: diff <= 0 ? C.ok : C.warn, fontFamily: F.bold, fontSize: 14 }}>
              {diff <= 0 ? `${Math.abs(diff)} kg de perdus` : `+${diff} kg`} depuis le {fmt(first.k)}
            </Text>
          )}
        </View>
      )}
      <View style={{ height: 1, backgroundColor: C.line }} />
      <Muted style={{ fontSize: 12.5 }}>Mensurations une fois par mois : comme tu prends des fessiers, la balance seule peut mentir.</Muted>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <T>Tour de taille</T>
          <Muted style={{ fontSize: 12 }}>Dernier : {lastOf('taille')}</Muted>
        </View>
        <Input value={b.taille || ''} onChangeText={(v) => setB('taille', v)} keyboardType="decimal-pad" placeholder="cm" style={{ width: 80, textAlign: 'right', fontFamily: F.monoB }} />
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <T>Tour de hanches</T>
          <Muted style={{ fontSize: 12 }}>Dernier : {lastOf('hanches')}</Muted>
        </View>
        <Input value={b.hanches || ''} onChangeText={(v) => setB('hanches', v)} keyboardType="decimal-pad" placeholder="cm" style={{ width: 80, textAlign: 'right', fontFamily: F.monoB }} />
      </Row>
    </Card>
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
