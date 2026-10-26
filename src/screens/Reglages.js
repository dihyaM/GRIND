import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Share, Alert, StyleSheet } from 'react-native';
import { useStore } from '../store';
import { C, F } from '../theme';
import { settings } from '../stats';
import { getKey, setKey } from '../coach';
import { enableReminders, disableReminders } from '../notifications';
import { Card, H2, Muted, Btn, Input, Row, T, Toggle } from '../ui';

export default function Reglages({ onClose }) {
  const { D, update, replaceAll } = useStore();
  const st = settings(D);
  const [key, setK] = useState('');
  const [saved, setSaved] = useState(false);
  const [imp, setImp] = useState('');

  useEffect(() => {
    getKey().then(setK);
  }, []);

  const step = (f, d) => update((X) => (X.settings = { ...settings(X), [f]: Math.max(1, Math.min(40, settings(X)[f] + d)) }));

  const toggleNotif = async () => {
    if (st.notif) {
      await disableReminders();
      update((X) => (X.settings = { ...settings(X), notif: false }));
    } else {
      const ok = await enableReminders().catch(() => false);
      if (!ok) {
        Alert.alert('Notifications refusées', 'Autorise les notifications pour Le Carnet dans Réglages iPhone > Notifications.');
        return;
      }
      update((X) => (X.settings = { ...settings(X), notif: true }));
    }
  };

  const doImport = () => {
    let data;
    try {
      data = JSON.parse(imp);
      if (!data || typeof data !== 'object') throw new Error();
    } catch (e) {
      Alert.alert('Sauvegarde illisible', 'Colle le texte complet de la sauvegarde, sans le modifier.');
      return;
    }
    Alert.alert('Remplacer tes données ?', 'Toutes les données actuelles de l’appli seront remplacées par la sauvegarde.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Remplacer',
        style: 'destructive',
        onPress: () => {
          replaceAll(data);
          setImp('');
          Alert.alert('Sauvegarde restaurée');
        },
      },
    ]);
  };

  return (
    <View style={{ gap: 14 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <H2>Réglages</H2>
        <Btn small variant="primary" title="Fermer" onPress={onClose} />
      </Row>

      <Card>
        <H2 style={{ fontSize: 19 }}>Mes objectifs par jour</H2>
        <Stepper label="Prospects staffing" v={st.pro} onMinus={() => step('pro', -1)} onPlus={() => step('pro', 1)} />
        <Stepper label="Prospects RH / CSE" v={st.orga} onMinus={() => step('orga', -1)} onPlus={() => step('orga', 1)} />
        <Muted style={{ fontSize: 12.5 }}>Comptés sur 5 jours ouvrés. Le nombre de séances suit ton programme.</Muted>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2 style={{ fontSize: 19 }}>Rappels</H2>
          <Toggle label={st.notif ? 'Activés' : 'Désactivés'} on={st.notif} onPress={toggleNotif} />
        </Row>
        <Muted style={{ fontSize: 13.5 }}>
          Du lundi au vendredi : prospection à 9 h et séance à 18 h. Jeudi midi : ta nouveauté. Dimanche 19 h : ton bilan.
        </Muted>
      </Card>

      <Card>
        <H2 style={{ fontSize: 19 }}>Coach Claude</H2>
        <Muted style={{ fontSize: 13.5 }}>
          Pour le « mot du coach » du bilan, colle ta clé API Anthropic (console.anthropic.com > API Keys). Elle reste sur ton téléphone, dans le trousseau sécurisé. Chaque bilan coûte environ 1 centime.
        </Muted>
        <Input value={key} onChangeText={(v) => { setK(v); setSaved(false); }} placeholder="sk-ant-…" autoCapitalize="none" autoCorrect={false} secureTextEntry />
        <Row>
          <Btn
            small
            variant="primary"
            title={saved ? 'Enregistrée ✓' : 'Enregistrer la clé'}
            onPress={async () => {
              await setKey(key);
              setSaved(true);
            }}
          />
          {!!key && <Btn small variant="ghost" title="Supprimer" onPress={async () => { await setKey(''); setK(''); }} />}
        </Row>
      </Card>

      <Card>
        <H2 style={{ fontSize: 19 }}>Sauvegarde</H2>
        <Muted style={{ fontSize: 13.5 }}>
          Tes données sont sur ton téléphone. Exporte-les de temps en temps (dans Notes ou par mail) pour ne rien perdre si tu changes de téléphone.
        </Muted>
        <Btn title="Exporter mes données" onPress={() => Share.share({ message: JSON.stringify(D) })} />
        <Input value={imp} onChangeText={setImp} placeholder="Colle ici une sauvegarde pour la restaurer" multiline style={{ minHeight: 70, textAlignVertical: 'top', fontSize: 13 }} />
        {!!imp && <Btn variant="ghost" title="Restaurer cette sauvegarde" onPress={doImport} />}
      </Card>
    </View>
  );
}

const Stepper = ({ label, v, onMinus, onPlus }) => (
  <Row style={{ justifyContent: 'space-between' }}>
    <T style={{ flex: 1 }}>{label}</T>
    <Row style={{ gap: 8 }}>
      <Pressable onPress={onMinus} style={sx.st} hitSlop={6}>
        <Text style={sx.stT}>−</Text>
      </Pressable>
      <Text style={sx.v}>{v}</Text>
      <Pressable onPress={onPlus} style={sx.st} hitSlop={6}>
        <Text style={sx.stT}>+</Text>
      </Pressable>
    </Row>
  </Row>
);

const sx = StyleSheet.create({
  st: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  stT: { color: C.ink, fontFamily: F.bold, fontSize: 20 },
  v: { color: C.ink, fontFamily: F.monoB, fontSize: 18, width: 30, textAlign: 'center' },
});
