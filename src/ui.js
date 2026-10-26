import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Modal } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { C, F, R } from './theme';
import { DN, weekDays, today, P } from './dates';

export const tap = (kind = 'light') => {
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {}
};

export const T = ({ style, ...p }) => <Text style={[s.t, style]} {...p} />;
export const H1 = ({ style, ...p }) => <Text style={[s.h1, style]} {...p} />;
export const H2 = ({ style, ...p }) => <Text style={[s.h2, style]} {...p} />;
export const Eyebrow = ({ style, ...p }) => <Text style={[s.eyebrow, style]} {...p} />;
export const Mono = ({ style, ...p }) => <Text style={[s.mono, style]} {...p} />;
export const Muted = ({ style, ...p }) => <Text style={[s.t, { color: C.muted, fontSize: 14 }, style]} {...p} />;

export const Card = ({ style, children, tone }) => (
  <View
    style={[
      s.card,
      tone === 'ok' && { backgroundColor: C.okSoft, borderColor: C.okSoft },
      tone === 'bad' && { backgroundColor: C.badSoft, borderColor: C.bad },
      tone === 'accent' && { backgroundColor: C.accentSoft, borderColor: C.accentSoft },
      tone === 'gold' && { backgroundColor: C.goldSoft, borderColor: C.goldSoft },
      style,
    ]}
  >
    {children}
  </View>
);

export function Btn({ title, onPress, variant = 'default', small, style, disabled }) {
  const bg = { primary: C.accent, ok: C.ok, ghost: 'transparent', default: C.surface2 }[variant];
  const fg = variant === 'primary' || variant === 'ok' ? C.accentInk : C.ink;
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        tap();
        onPress && onPress();
      }}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSm,
        { backgroundColor: bg, borderColor: variant === 'ghost' ? C.line : bg, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <Text style={[s.btnT, small && { fontSize: 13 }, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Check({ checked, onToggle, size = 30 }) {
  return (
    <Pressable
      hitSlop={8}
      onPress={() => {
        tap(checked ? 'light' : 'medium');
        onToggle();
      }}
      style={[
        s.check,
        { width: size, height: size, borderRadius: size / 3.2 },
        checked && { backgroundColor: C.ok, borderColor: C.ok },
      ]}
    >
      {checked ? (
        <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
          <Path d="M4 12.5l5 5L20 6.5" stroke={C.accentInk} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : null}
    </Pressable>
  );
}

export function Toggle({ label, on, onPress }) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={[s.tog, on && { backgroundColor: C.accentSoft, borderColor: C.accent }]}
    >
      <View style={[s.togDot, on && { backgroundColor: C.accent, borderColor: C.accent }]} />
      <Text style={[s.togT, on && { color: C.ink }]}>{label}</Text>
    </Pressable>
  );
}

export const Bar = ({ pct, h = 6, style }) => (
  <View style={[s.bar, { height: h }, style]}>
    <View style={{ width: `${Math.max(0, Math.min(100, pct * 100))}%`, height: '100%', borderRadius: 9, backgroundColor: pct >= 1 ? C.ok : C.accent }} />
  </View>
);

export function Ring({ score, tone, size = 124 }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const col = tone === 'good' ? C.ok : tone === 'mid' ? C.warn : C.bad;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.surface2} strokeWidth={12} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={col}
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(c * score) / 100} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <SvgText x={size / 2} y={size / 2 + 8} textAnchor="middle" fontSize={34} fontFamily={F.display} fill={C.ink}>
        {String(score)}
      </SvgText>
      <SvgText x={size / 2} y={size / 2 + 28} textAnchor="middle" fontSize={11} fontFamily={F.semi} fill={C.muted}>
        / 100
      </SvgText>
    </Svg>
  );
}

const DOT = { ok: C.ok, part: C.warn, miss: C.bad };
export function DayStrip({ week, selected, onSelect, dotFor }) {
  const T0 = today();
  return (
    <View style={s.days}>
      {weekDays(week).map((k, i) => {
        const on = k === selected;
        const d = dotFor(k);
        return (
          <Pressable
            key={k}
            onPress={() => {
              tap();
              onSelect(k);
            }}
            style={[s.day, on && { backgroundColor: C.accent, borderColor: C.accent }, !on && k === T0 && { borderColor: C.accent }]}
          >
            <Text style={[s.dayN, on && { color: C.accentInk }]}>{DN[i]}</Text>
            <Text style={[s.dayD, on && { color: C.accentInk }]}>{P(k).getDate()}</Text>
            <View
              style={[
                s.dot,
                DOT[d] && { backgroundColor: on ? C.accentInk : DOT[d] },
                d === 'plan' && { borderWidth: 1.5, borderColor: on ? C.accentInk : C.muted },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export const Input = React.forwardRef(({ style, ...p }, ref) => (
  <TextInput ref={ref} placeholderTextColor={C.faint} selectionColor={C.accent} style={[s.input, style]} {...p} />
));

export function Picker({ visible, title, options, value, onPick, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.grab} />
        <H2 style={{ fontSize: 20, marginBottom: 10 }}>{title}</H2>
        {options.map((o) => (
          <Pressable
            key={o}
            onPress={() => {
              tap();
              onPick(o);
              onClose();
            }}
            style={({ pressed }) => [s.opt, o === value && { backgroundColor: C.accentSoft }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[s.optT, o === value && { color: C.accent }]}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

export const Row = ({ style, ...p }) => <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]} {...p} />;

export const s = StyleSheet.create({
  t: { color: C.ink, fontFamily: F.body, fontSize: 15, lineHeight: 21 },
  h1: { color: C.ink, fontFamily: F.display, fontSize: 38, lineHeight: 38, letterSpacing: -0.8 },
  h2: { color: C.ink, fontFamily: F.display, fontSize: 24, lineHeight: 27, letterSpacing: -0.4 },
  eyebrow: { color: C.muted, fontFamily: F.bold, fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase' },
  mono: { color: C.ink, fontFamily: F.mono, fontSize: 14, fontVariant: ['tabular-nums'] },
  card: { backgroundColor: C.surface, borderRadius: R, borderWidth: 1, borderColor: C.line, padding: 16, gap: 12 },
  btn: { borderRadius: 999, borderWidth: 1, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  btnSm: { paddingVertical: 7, paddingHorizontal: 12 },
  btnT: { fontFamily: F.bold, fontSize: 15 },
  check: { borderWidth: 2, borderColor: C.line, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  tog: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, borderRadius: 999, paddingVertical: 7, paddingLeft: 8, paddingRight: 12 },
  togDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: C.muted },
  togT: { color: C.muted, fontFamily: F.semi, fontSize: 13 },
  bar: { backgroundColor: C.surface2, borderRadius: 9, overflow: 'hidden' },
  days: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 9, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  dayN: { color: C.muted, fontFamily: F.bold, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.6 },
  dayD: { color: C.ink, fontFamily: F.displayB, fontSize: 19, marginTop: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  input: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9, color: C.ink, fontFamily: F.medium, fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(5,3,8,0.6)' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 38, borderTopWidth: 1, borderColor: C.line },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 14 },
  opt: { paddingVertical: 13, paddingHorizontal: 12, borderRadius: 12 },
  optT: { color: C.ink, fontFamily: F.semi, fontSize: 16 },
});
