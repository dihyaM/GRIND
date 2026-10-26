import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { DNL, fmt, wd } from '../dates';
import { RES, RES_POS, ORGA_TYPES } from '../program';
import { rowsR, rowsW, treated, settings, dueList, dayDot, blankRow } from '../stats';
import { Card, H2, Eyebrow, Mono, Muted, Btn, DayStrip, Input, Row, Toggle, Bar, Picker } from '../ui';

export default function Prospects({ list, week, day, setDay }) {
  const { D, update } = useStore();
  const [pick, setPick] = useState(null); // { i, field }
  const isOrga = list === 'orga';
  const rows = rowsR(D, day, list);
  const t = settings(D)[list];
  const n = rows.filter(treated).length;
  const due = dueList(D, list, day);

  const setF = (i, f, v) => update((X) => (rowsW(X, day, list)[i][f] = v));

  return (
    <View style={{ gap: 14 }}>
      <DayStrip week={week} selected={day} onSelect={setDay} dotFor={(k) => dayDot(D, k, isOrga ? 'orga' : 'pro')} />

      <Card>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Eyebrow>
              {DNL[wd(day)]} {fmt(day)}
            </Eyebrow>
            <H2>{isOrga ? "Ma boîte d'orga" : 'Prospection staffing'}</H2>
          </View>
          <Text style={[sx.big, n >= t && { color: C.ok }]}>
            {n}
            <Text style={{ color: C.muted, fontSize: 18 }}>/{t}</Text>
          </Text>
        </Row>
        <Bar pct={n / t} h={8} />
        <Muted style={{ fontSize: 13 }}>
          {isOrga ? 'Cibles : RH, CSE, office managers. ' : ''}Un prospect compte quand il a un nom et au moins une action.
        </Muted>
      </Card>

      {due.length > 0 && (
        <Card tone="gold">
          <Row style={{ justifyContent: 'space-between' }}>
            <H2 style={{ fontSize: 19, color: C.gold }}>Relances en attente</H2>
            <Mono style={{ color: C.gold }}>{due.length}</Mono>
          </Row>
          {due.slice(0, 8).map((d) => (
            <Row key={d.k + d.i} style={sx.due}>
              <View style={{ flex: 1 }}>
                <Text style={sx.dueN} numberOfLines={1}>
                  {d.r.nom}
                </Text>
                <Text style={sx.dueS} numberOfLines={1}>
                  {d.r.res} · {fmt(d.k)}
                  {d.r.contact ? ' · ' + d.r.contact : ''}
                </Text>
              </View>
              <Btn small title="Relancé ✓" onPress={() => update((X) => (X['d-' + d.k][list][d.i].relance = true))} />
            </Row>
          ))}
        </Card>
      )}

      {rows.map((r, i) => {
        const done = treated(r);
        const rc = RES_POS.includes(r.res) ? C.ok : r.res === 'Pas intéressé' ? C.bad : C.ink;
        return (
          <View key={i} style={[sx.row, done && { borderColor: C.ok }]}>
            <Row style={{ gap: 8 }}>
              <Mono style={[sx.num, done && { color: C.ok }]}>{String(i + 1).padStart(2, '0')}</Mono>
              <Input
                style={{ flex: 1 }}
                value={r.nom}
                placeholder={isOrga ? 'Entreprise' : 'Entreprise / traiteur'}
                onChangeText={(v) => setF(i, 'nom', v)}
              />
            </Row>
            <Input style={{ fontSize: 14 }} value={r.contact} placeholder="Contact, tél., mail" onChangeText={(v) => setF(i, 'contact', v)} />
            <View style={sx.wrap}>
              <Toggle label="Appel" on={r.appel} onPress={() => setF(i, 'appel', !r.appel)} />
              <Toggle label="Mail" on={r.mail} onPress={() => setF(i, 'mail', !r.mail)} />
              <Toggle label="Relance" on={r.relance} onPress={() => setF(i, 'relance', !r.relance)} />
              {isOrga && (
                <Pressable style={sx.sel} onPress={() => setPick({ i, f: 'type' })}>
                  <Text style={sx.selT}>{r.type || 'Type'} ▾</Text>
                </Pressable>
              )}
              <Pressable style={sx.sel} onPress={() => setPick({ i, f: 'res' })}>
                <Text style={[sx.selT, { color: rc }]}>{r.res === '—' ? 'Résultat' : r.res} ▾</Text>
              </Pressable>
            </View>
            <Input style={{ fontSize: 13.5 }} value={r.note} placeholder="Note (besoin, date de rappel…)" onChangeText={(v) => setF(i, 'note', v)} />
          </View>
        );
      })}
      <Btn variant="ghost" title="+ Ligne supplémentaire" onPress={() => update((X) => rowsW(X, day, list).push(blankRow()))} />

      <Picker
        visible={!!pick}
        title={pick?.f === 'type' ? 'Type de cible' : 'Résultat'}
        options={pick?.f === 'type' ? ORGA_TYPES : RES}
        value={pick ? rows[pick.i]?.[pick.f] : null}
        onPick={(o) => pick && setF(pick.i, pick.f, o)}
        onClose={() => setPick(null)}
      />
    </View>
  );
}

const sx = StyleSheet.create({
  big: { color: C.ink, fontFamily: F.display, fontSize: 34, lineHeight: 36 },
  row: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 12, gap: 8 },
  num: { width: 26, color: C.muted, fontSize: 13, textAlign: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sel: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  selT: { color: C.ink, fontFamily: F.semi, fontSize: 13 },
  due: { backgroundColor: C.surface, borderRadius: 12, padding: 10 },
  dueN: { color: C.ink, fontFamily: F.bold, fontSize: 15 },
  dueS: { color: C.muted, fontFamily: F.medium, fontSize: 12.5, marginTop: 1 },
});
