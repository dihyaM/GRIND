import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { add, fmt, mon, today, isoWeek, yearOf, weeksOfYear } from '../dates';
import { weekStats, details, verdict, weakest, GAGES, coachPayload } from '../stats';
import { askCoach } from '../coach';
import { Card, H2, Eyebrow, Mono, Muted, Btn, Row, T, Bar, Ring } from '../ui';

export default function Bilan({ week, setWeek, openSettings }) {
  const { D, update } = useStore();
  const { width } = useWindowDimensions();
  const [year, setYear] = useState(yearOf(week));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const s = weekStats(D, week);
  const v = verdict(week, s.score);
  const d = details(D, week);
  const cur = week === mon(today());
  const coach = (D.coach || {})[week];
  const toneCol = v.t === 'good' ? C.ok : v.t === 'mid' ? C.warn : C.bad;

  const runCoach = async () => {
    setBusy(true);
    setErr('');
    try {
      const txt = await askCoach(coachPayload(D, week));
      update((X) => ((X.coach = X.coach || {})[week] = txt));
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  const hist = [];
  for (let i = 5; i >= 0; i--) {
    const ww = add(mon(today()), -7 * i);
    hist.push({ ww, x: weekStats(D, ww) });
  }

  const weeks = weeksOfYear(year);
  let ses = 0, pros = 0, nvs = 0, sum = 0, cnt = 0;
  weeks.forEach((ww) => {
    const x = weekStats(D, ww);
    ses += x.sDone;
    pros += x.pro + x.orga;
    nvs += x.nvDone ? 1 : 0;
    if (x.has && ww <= mon(today())) {
      sum += x.score;
      cnt++;
    }
  });
  const cell = Math.floor((width - 32 - 34 - 12 * 4) / 13);

  return (
    <View style={{ gap: 14 }}>
      <Card>
        <Eyebrow>{cur ? 'Bilan provisoire · se clôt dimanche soir' : `Bilan · semaine ${isoWeek(week)}`}</Eyebrow>
        <Row style={{ gap: 16 }}>
          <Ring score={s.score} tone={v.t} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[sx.verdict, { color: toneCol }]}>{v.name}</Text>
            <T style={{ fontSize: 14.5 }}>{v.txt}</T>
          </View>
        </Row>
      </Card>

      <Card>
        <H2 style={{ fontSize: 19 }}>Détail</H2>
        <Line l="Sport" pct={s.c.sport} v={`${s.sDone}/${s.planned}`} />
        <Line l="Prospection" pct={s.c.pro} v={`${s.pro}/${s.proT}`} />
        <Line l="Orga RH/CSE" pct={s.c.orga} v={`${s.orga}/${s.orgaT}`} />
        <Line l="Nouveauté" pct={s.c.nv} v={s.nvDone ? '1/1' : '0/1'} />
        <Muted style={{ fontSize: 12 }}>Poids : sport 35 %, prospection 30 %, orga 20 %, nouveauté 15 %.</Muted>
      </Card>

      <Card>
        <H2 style={{ fontSize: 18 }}>Ce que tu as fait</H2>
        {d.done.length ? d.done.map((x, i) => <Li key={i} c={C.ok} t={x} />) : <Muted>Rien pour l'instant.</Muted>}
        <View style={{ height: 1, backgroundColor: C.line }} />
        <H2 style={{ fontSize: 18 }}>Ce que tu as manqué</H2>
        {d.miss.length ? (
          d.miss.slice(0, 10).map((x, i) => <Li key={i} c={C.bad} t={x} />)
        ) : (
          <Muted>Rien. Impeccable.</Muted>
        )}
        {d.miss.length > 10 && <Muted>et {d.miss.length - 10} autres…</Muted>}
      </Card>

      {s.score < 70 ? (
        <Card tone="bad">
          <H2 style={{ fontSize: 19, color: C.bad }}>Ton gage pour la semaine prochaine</H2>
          <T>{GAGES[weakest(s)]}</T>
        </Card>
      ) : s.score >= 85 ? (
        <Card tone="gold">
          <H2 style={{ fontSize: 19, color: C.gold }}>Récompense méritée</H2>
          <T>Offre-toi un vrai moment off ce week-end, sans culpabiliser.</T>
        </Card>
      ) : null}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 19 }}>Le mot du coach</H2>
          <Btn small variant="primary" disabled={busy} title={busy ? 'Claude réfléchit…' : coach ? 'Refaire' : 'Demander à Claude'} onPress={runCoach} />
        </Row>
        {coach ? (
          <T style={{ lineHeight: 23 }}>{coach}</T>
        ) : (
          <Muted>Claude lit tes chiffres de la semaine et te fait un retour franc : félicitations ou recadrage, et 3 objectifs pour la suite.</Muted>
        )}
        {!!err && (
          <Pressable onPress={openSettings}>
            <T style={{ color: C.bad, fontSize: 14 }}>{err}</T>
          </Pressable>
        )}
      </Card>

      <Card>
        <H2 style={{ fontSize: 19 }}>6 dernières semaines</H2>
        <View style={sx.bars}>
          {hist.map(({ ww, x }) => (
            <Pressable key={ww} style={sx.hb} onPress={() => setWeek(ww)}>
              <Mono style={{ fontSize: 12, fontFamily: F.monoB }}>{x.has ? x.score : '–'}</Mono>
              <View
                style={{
                  width: '80%',
                  height: x.has ? Math.max(4, x.score * 0.8) : 3,
                  borderRadius: 7,
                  backgroundColor: !x.has ? C.surface2 : x.score >= 70 ? C.ok : x.score >= 50 ? C.warn : C.bad,
                }}
              />
              <Text style={sx.hbL}>{fmt(ww)}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 19 }}>Mon année {year}</H2>
          <Row style={{ gap: 6 }}>
            <Btn small title="‹" onPress={() => setYear(year - 1)} />
            <Btn small title="›" onPress={() => setYear(year + 1)} />
          </Row>
        </Row>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Kpi v={ses} k="séances" />
          <Kpi v={pros} k="prospects" />
          <Kpi v={nvs} k="nouveautés" />
          <Kpi v={cnt ? Math.round(sum / cnt) : '–'} k="score moyen" />
        </View>
        <View style={sx.grid}>
          {weeks.map((ww) => {
            const x = weekStats(D, ww);
            const fut = ww > mon(today());
            const bg = !x.has ? C.surface2 : x.score >= 70 ? C.ok : x.score >= 50 ? C.warn : C.bad;
            return (
              <Pressable
                key={ww}
                onPress={() => setWeek(ww)}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 6,
                  backgroundColor: bg,
                  opacity: fut ? 0.4 : 1,
                  borderWidth: ww === mon(today()) || ww === week ? 2 : 0,
                  borderColor: ww === week ? C.ink : C.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cell >= 22 && <Text style={{ fontFamily: F.mono, fontSize: 9, color: x.has ? C.accentInk : C.faint }}>{isoWeek(ww)}</Text>}
              </Pressable>
            );
          })}
        </View>
        <Muted style={{ fontSize: 12 }}>Chaque case est une semaine : vert ≥ 70, orange ≥ 50, rouge en dessous. Touche une case pour l'ouvrir.</Muted>
      </Card>
    </View>
  );
}

const Line = ({ l, pct, v }) => (
  <Row>
    <T style={{ width: 98, fontSize: 14 }}>{l}</T>
    <Bar pct={pct} h={9} style={{ flex: 1 }} />
    <Mono style={{ width: 58, textAlign: 'right', color: C.muted, fontSize: 13 }}>{v}</Mono>
  </Row>
);
const Li = ({ c, t }) => (
  <Row style={{ alignItems: 'flex-start', gap: 9 }}>
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c, marginTop: 7 }} />
    <T style={{ flex: 1, fontSize: 14.5 }}>{t}</T>
  </Row>
);
const Kpi = ({ v, k }) => (
  <View style={{ flex: 1, backgroundColor: C.surface2, borderRadius: 12, padding: 10 }}>
    <Text style={{ color: C.ink, fontFamily: F.display, fontSize: 22 }}>{String(v)}</Text>
    <Text style={{ color: C.muted, fontFamily: F.medium, fontSize: 11 }}>{k}</Text>
  </View>
);

const sx = StyleSheet.create({
  verdict: { fontFamily: F.display, fontSize: 30, lineHeight: 31, letterSpacing: -0.6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 130 },
  hb: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 5, height: '100%' },
  hbL: { color: C.muted, fontFamily: F.medium, fontSize: 10.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
