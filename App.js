import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Bricolage from '@expo-google-fonts/bricolage-grotesque';
import * as Figtree from '@expo-google-fonts/figtree';
import * as JetBrains from '@expo-google-fonts/jetbrains-mono';

import { StoreProvider, useStore } from './src/store';
import { C, F } from './src/theme';
import { add, fmt, mon, today, wd, isoWeek } from './src/dates';
import { weekStats } from './src/stats';
import { Bar, tap } from './src/ui';
import Sport from './src/screens/Sport';
import Prospects from './src/screens/Prospects';
import Nouveau from './src/screens/Nouveau';
import Bilan from './src/screens/Bilan';
import Reglages from './src/screens/Reglages';
import './src/notifications';

const pick = (ns, names) => Object.fromEntries(names.filter((n) => ns[n]).map((n) => [n, ns[n]]));
const FONTS = {
  ...pick(Bricolage, ['BricolageGrotesque_700Bold', 'BricolageGrotesque_800ExtraBold']),
  ...pick(Figtree, ['Figtree_400Regular', 'Figtree_500Medium', 'Figtree_600SemiBold', 'Figtree_700Bold']),
  ...pick(JetBrains, ['JetBrainsMono_500Medium', 'JetBrainsMono_700Bold']),
};

export default function App() {
  const [loaded, error] = useFonts(FONTS);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <StoreProvider>{loaded || error ? <Main /> : <Splash />}</StoreProvider>
    </SafeAreaProvider>
  );
}

const Splash = () => (
  <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator color={C.accent} />
  </View>
);

const TABS = [
  { id: 'sport', label: 'Sport', d: 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12' },
  { id: 'pro', label: 'Prospection', d: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2' },
  { id: 'orga', label: 'Orga', d: 'M4 20V9l8-5 8 5v11M9 20v-6h6v6' },
  { id: 'nouveau', label: 'Nouveauté', d: 'M12 3l2.6 5.6L20 9.5l-4 4 1 5.5-5-2.8-5 2.8 1-5.5-4-4 5.4-.9z' },
  { id: 'bilan', label: 'Bilan', d: 'M4 20h16M7 16v-5M12 16V7M17 16v-8' },
];

function Main() {
  const { D, ready } = useStore();
  const ins = useSafeAreaInsets();
  const scroll = useRef(null);
  const [tab, setTab] = useState('sport');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [week, setWeekRaw] = useState(mon(today()));
  const [day, setDay] = useState(today());

  if (!ready) return <Splash />;

  const setWeek = (w) => {
    setWeekRaw(w);
    setDay(w === mon(today()) ? today() : add(w, wd(day)));
  };
  const go = (t) => {
    tap();
    setTab(t);
    setSettingsOpen(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const s = weekStats(D, week);
  const thisWeek = week === mon(today());
  const props = { week, day, setDay, setWeek, openSettings: () => setSettingsOpen(true) };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingTop: ins.top + 14, paddingBottom: 110 + ins.bottom, paddingHorizontal: 16, gap: 16 }}
        >
          {settingsOpen ? (
            <Reglages onClose={() => setSettingsOpen(false)} />
          ) : (
            <>
              <View style={{ gap: 14 }}>
                <View style={st.top}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.eyebrow}>{thisWeek ? 'Cette semaine' : `Semaine ${isoWeek(week)}`} · {fmt(week)} → {fmt(add(week, 6))}</Text>
                    <Text style={st.title}>
                      Le Carnet <Text style={{ color: C.accent }}>de Dy</Text>
                    </Text>
                  </View>
                  <Pressable onPress={() => { tap(); setSettingsOpen(true); }} style={st.round} hitSlop={6} accessibilityLabel="Réglages">
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Circle cx={12} cy={12} r={3} stroke={C.ink} strokeWidth={1.8} fill="none" />
                      <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
                    </Svg>
                  </Pressable>
                </View>
                <View style={st.weeknav}>
                  <Pressable style={st.round} onPress={() => { tap(); setWeek(add(week, -7)); }} accessibilityLabel="Semaine précédente">
                    <Text style={st.arrow}>‹</Text>
                  </Pressable>
                  {thisWeek ? (
                    <Text style={st.wkLbl}>Semaine {isoWeek(week)}</Text>
                  ) : (
                    <Pressable onPress={() => { tap(); setWeek(mon(today())); }} style={st.todayBtn}>
                      <Text style={{ color: C.accentInk, fontFamily: F.bold, fontSize: 13 }}>Revenir à aujourd'hui</Text>
                    </Pressable>
                  )}
                  <Pressable style={st.round} onPress={() => { tap(); setWeek(add(week, 7)); }} accessibilityLabel="Semaine suivante">
                    <Text style={st.arrow}>›</Text>
                  </Pressable>
                </View>
                <View style={st.strip}>
                  <Meter k="Séances" v={s.sDone} t={`/${s.planned}`} pct={s.c.sport} />
                  <Meter k="Prospection" v={s.pro} t={`/${s.proT}`} pct={s.c.pro} />
                  <Meter k="Orga RH/CSE" v={s.orga} t={`/${s.orgaT}`} pct={s.c.orga} />
                  <Meter k="Nouveauté" v={s.nvDone ? 'Faite' : 'À faire'} t="" pct={s.c.nv} />
                </View>
              </View>

              {tab === 'sport' && <Sport {...props} />}
              {tab === 'pro' && <Prospects key="pro" list="pro" {...props} />}
              {tab === 'orga' && <Prospects key="orga" list="orga" {...props} />}
              {tab === 'nouveau' && <Nouveau {...props} />}
              {tab === 'bilan' && <Bilan {...props} />}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[st.tabs, { paddingBottom: Math.max(ins.bottom, 10) }]}>
        {TABS.map((t) => {
          const on = tab === t.id && !settingsOpen;
          const col = on ? C.accent : C.muted;
          return (
            <Pressable key={t.id} style={st.tab} onPress={() => go(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Svg width={23} height={23} viewBox="0 0 24 24">
                <Path d={t.d} stroke={col} strokeWidth={on ? 2.3 : 1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[st.tabT, { color: col }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const Meter = ({ k, v, t, pct }) => (
  <View style={st.meter}>
    <Text style={st.mK} numberOfLines={1}>{k}</Text>
    <Text style={st.mV}>
      {String(v)}
      <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.mono }}>{t}</Text>
    </Text>
    <Bar pct={pct} h={5} />
  </View>
);

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  eyebrow: { color: C.muted, fontFamily: F.bold, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 6 },
  title: { color: C.ink, fontFamily: F.display, fontSize: 40, lineHeight: 40, letterSpacing: -1 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  arrow: { color: C.ink, fontSize: 24, lineHeight: 26, fontFamily: F.semi },
  weeknav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  wkLbl: { color: C.ink, fontFamily: F.displayB, fontSize: 17 },
  todayBtn: { backgroundColor: C.accent, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meter: { width: '48.5%', flexGrow: 1, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 11, gap: 6 },
  mK: { color: C.muted, fontFamily: F.bold, fontSize: 10.5, letterSpacing: 0.9, textTransform: 'uppercase' },
  mV: { color: C.ink, fontFamily: F.monoB, fontSize: 19 },
  tabs: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderColor: C.line, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  tabT: { fontFamily: F.semi, fontSize: 10.5 },
});
