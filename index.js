import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { registerRootComponent } from 'expo';

// Filet de sécurité : au lieu de fermer l'appli, une erreur s'affiche à l'écran.
let lastErr = null;
const subs = new Set();
const show = (e) => {
  lastErr = String((e && (e.stack || e.message)) || e);
  subs.forEach((f) => f(lastErr));
};
if (global.ErrorUtils && global.ErrorUtils.setGlobalHandler) {
  global.ErrorUtils.setGlobalHandler((e) => show(e));
}

let App = null;
try {
  App = require('./App').default;
} catch (e) {
  show(e);
}

class Root extends React.Component {
  state = { err: lastErr };
  static getDerivedStateFromError(e) {
    return { err: String((e && (e.stack || e.message)) || e) };
  }
  componentDidMount() {
    this.f = (err) => this.setState({ err });
    subs.add(this.f);
  }
  componentWillUnmount() {
    subs.delete(this.f);
  }
  render() {
    if (this.state.err || !App) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0F0D12', paddingTop: 70, paddingHorizontal: 20 }}>
          <Text style={{ color: '#FF6FA8', fontSize: 22, fontWeight: '800', marginBottom: 10 }}>Le Carnet a rencontré une erreur</Text>
          <Text style={{ color: '#F6F1F8', fontSize: 15, marginBottom: 14 }}>Fais une capture d'écran de cette page et envoie-la à Claude.</Text>
          <ScrollView style={{ flex: 1 }}>
            <Text selectable style={{ color: '#9D94A9', fontSize: 12, fontFamily: 'Courier' }}>
              {this.state.err || 'Chargement impossible'}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return <App />;
  }
}

registerRootComponent(Root);
