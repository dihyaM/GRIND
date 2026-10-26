import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { DN, fmt, mon, today, wd, weekDays, P } from '../dates';
import { IDEAS } from '../program';
import { Card, H2, Eyebrow, Mono, Muted, Btn, Input, Row, T, tap } from '../ui';

export default function Nouveau({ week }) {
  const { D, update } = useStore();
  const nv = D['w-' + week] || {};
  const set = (f, v) => update((X) => ((X['w-' + week] = X['w-' + week] || {})[f] = v));
  const T0 = today();
  const late = week === mon(T0) && wd(T0) >= 4 && !nv.done;
  const past = Object.keys(D)
    .filter((x) => x.startsWith('w-') && D[x].done && x !== 'w-' + week)
    .sort()
    .reverse();

  return (
    <View style={{ gap: 14 }}>
      {nv.done ? (
        <Card tone="ok">
          <Row>
            <Badge c={C.ok}>✓</Badge>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: F.bold }}>Défi de la semaine relevé.</T>
              <Muted>{nv.act}</Muted>
            </View>
          </Row>
        </Card>
      ) : (
        <Card tone={late ? 'bad' : 'accent'}>
          <Row>
            <Badge c={late ? C.bad : C.accent}>{late ? '!' : '?'}</Badge>
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: F.bold }}>
                {late ? `Plus que ${7 - wd(T0)} jour(s) pour ta nouveauté.` : 'Une chose jamais faite, au moins une fois cette semaine.'}
              </T>
              <Muted>Note-la ici, coche quand c'est fait.</Muted>
            </View>
          </Row>
        </Card>
      )}

      <Card>
        <Eyebrow>Semaine du {fmt(week)}</Eyebrow>
        <Field label="Activité jamais faite">
          <Input value={nv.act || ''} placeholder="Ex. cours de poterie samedi" onChangeText={(v) => set('act', v)} />
        </Field>
        <Field label="Quel jour">
          <View style={{ flexDirection: 'row', gap: 5 }}>
            {weekDays(week).map((k, i) => (
              <Pressable key={k} onPress={() => { tap(); set('date', nv.date === k ? '' : k); }} style={[sx.dchip, nv.date === k && sx.on]}>
                <Text style={[sx.dchipT, nv.date === k && { color: C.accentInk }]}>{DN[i]}</Text>
                <Text style={[sx.dchipD, nv.date === k && { color: C.accentInk }]}>{P(k).getDate()}</Text>
              </Pressable>
            ))}
          </View>
        </Field>
        <Field label="Avec qui / où">
          <Input value={nv.ou || ''} placeholder="Seule, entre amis…" onChangeText={(v) => set('ou', v)} />
        </Field>
        <Field label="Ressenti">
          <Row style={{ gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => { tap(); set('note', n); }} style={[sx.star, (nv.note || 0) >= n && sx.on]}>
                <Mono style={{ color: (nv.note || 0) >= n ? C.accentInk : C.muted, fontFamily: F.monoB }}>{n}</Mono>
              </Pressable>
            ))}
          </Row>
        </Field>
        <Field label="Ce que j'en retiens">
          <Input value={nv.txt || ''} multiline style={{ minHeight: 64, textAlignVertical: 'top' }} onChangeText={(v) => set('txt', v)} />
        </Field>
        <Btn
          title={nv.done ? '✓  C’est fait' : 'Marquer comme fait'}
          variant={nv.done ? 'ok' : 'primary'}
          onPress={() => {
            if (!nv.done) tap('success');
            set('done', !nv.done);
          }}
        />
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 19 }}>En panne d'idée ?</H2>
          <Btn small variant="primary" title="Tirer au sort" onPress={() => set('act', IDEAS[Math.floor(Math.random() * IDEAS.length)])} />
        </Row>
        <View style={sx.chips}>
          {IDEAS.map((x) => (
            <Pressable key={x} onPress={() => { tap(); set('act', x); }} style={sx.chip}>
              <Text style={sx.chipT}>{x}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {past.length > 0 && (
        <Card>
          <H2 style={{ fontSize: 19 }}>Déjà testé</H2>
          {past.map((x) => (
            <Row key={x} style={{ justifyContent: 'space-between', borderTopWidth: 1, borderColor: C.line, paddingTop: 10 }}>
              <T style={{ flex: 1 }}>{D[x].act}</T>
              <Mono style={{ color: C.muted, fontSize: 12.5 }}>
                {fmt(x.slice(2))}
                {D[x].note ? ` · ${D[x].note}/5` : ''}
              </Mono>
            </Row>
          ))}
        </Card>
      )}
    </View>
  );
}

const Badge = ({ c, children }) => (
  <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: C.accentInk, fontFamily: F.display, fontSize: 22 }}>{children}</Text>
  </View>
);
const Field = ({ label, children }) => (
  <View style={{ gap: 6 }}>
    <Text style={{ color: C.muted, fontFamily: F.semi, fontSize: 12.5 }}>{label}</Text>
    {children}
  </View>
);

const sx = StyleSheet.create({
  on: { backgroundColor: C.accent, borderColor: C.accent },
  dchip: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2 },
  dchipT: { color: C.muted, fontFamily: F.bold, fontSize: 10, textTransform: 'uppercase' },
  dchipD: { color: C.ink, fontFamily: F.displayB, fontSize: 16 },
  star: { width: 44, height: 40, borderRadius: 11, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderStyle: 'dashed', borderColor: C.faint, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  chipT: { color: C.ink, fontFamily: F.medium, fontSize: 13 },
});
