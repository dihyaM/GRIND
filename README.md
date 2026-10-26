# Le Carnet — guide d'installation sur iPhone

Ton appli de suivi : Sport, Prospection, Orga, Nouveauté et Bilan hebdo.
Il te faut un ordinateur (Mac ou PC Windows, peu importe) et ton iPhone.

---

## Étape 1 — Préparer l'ordinateur (10 min, une seule fois)

1. Installe **Node.js** (version « LTS ») depuis https://nodejs.org puis redémarre l'ordinateur.
2. Dézippe le dossier `le-carnet` sur ton bureau.
3. Ouvre un terminal **dans ce dossier** :
   - Mac : clic droit sur le dossier > Services > « Nouveau terminal au dossier ».
   - Windows : ouvre le dossier, clique dans la barre d'adresse, tape `cmd`, Entrée.
4. Tape ces deux commandes, l'une après l'autre (chacune prend 1 à 3 min) :

```
npm install
npm run setup
```

---

## Étape 2 — Tester l'appli tout de suite (gratuit, 5 min)

1. Sur ton iPhone, installe l'appli **Expo Go** depuis l'App Store.
2. Sur l'ordinateur, dans le terminal : `npx expo start`
3. Un QR code s'affiche. Scanne-le avec l'appareil photo de l'iPhone : Le Carnet s'ouvre dans Expo Go.

Ton téléphone et ton ordinateur doivent être sur le même Wi-Fi. C'est la version test : elle ne marche que quand l'ordinateur est allumé avec cette commande lancée. L'étape 3 te donne la vraie appli.

---

## Étape 3 — La vraie appli sur ton iPhone

### 3a. Créer tes comptes (une seule fois)

- **Compte développeur Apple** : https://developer.apple.com/programs → « Enroll », avec ton identifiant Apple habituel. 99 € par an. Apple valide en général sous 24 à 48 h.
- **Compte Expo** (gratuit) : https://expo.dev/signup. C'est le service qui fabrique l'appli dans le cloud, sans Mac.

### 3b. Fabriquer et envoyer l'appli à Apple

Dans le terminal, dans le dossier `le-carnet` :

```
npx eas-cli@latest login
npx eas-cli@latest init
npm run build:ios
```

Pendant la dernière commande, réponds aux questions :
- Connexion à ton compte Apple : oui, avec ton identifiant Apple développeur (et le code reçu sur ton iPhone).
- Générer les certificats / le profil : **oui à tout**, Expo s'en occupe.
- Si on te dit que l'identifiant `com.dy.lecarnet` est déjà pris, ouvre `app.json`, remplace-le par exemple par `com.dymenoun.lecarnet` (aux deux endroits) et relance `npm run build:ios`.

La fabrication prend environ 15 à 25 min dans le cloud. L'appli est ensuite envoyée automatiquement sur **App Store Connect**. Apple la traite en 10 à 30 min de plus.

### 3c. L'installer avec TestFlight

1. Va sur https://appstoreconnect.apple.com > Apps > **Le Carnet** > onglet **TestFlight**.
2. Dans « Tests internes », crée un groupe et ajoute-toi (ton adresse Apple).
3. Sur l'iPhone, installe l'appli **TestFlight** depuis l'App Store, ouvre l'invitation reçue par mail, puis **Installer**.

Le Carnet apparaît sur ton écran d'accueil comme n'importe quelle appli. Active les rappels dans Réglages (roue en haut à droite).

**À savoir :** une version TestFlight dure 90 jours. Avant l'échéance, relance simplement `npm run build:ios` puis installe la nouvelle version depuis TestFlight. Tes données sont conservées.

---

## Le coach Claude (optionnel)

Le bilan automatique (note, verdict, gage) marche sans rien. Pour le « mot du coach » rédigé par Claude :
1. Crée une clé sur https://console.anthropic.com > API Keys, et ajoute quelques euros de crédit.
2. Dans l'appli : Réglages > Coach Claude > colle la clé > Enregistrer.

## Tes données

Tout est enregistré sur ton téléphone. Dans Réglages > Sauvegarde, exporte tes données de temps en temps (dans Notes ou par mail). Pour les récupérer sur un nouveau téléphone, colle le texte dans le champ prévu et touche « Restaurer ».

## Modifier l'appli plus tard

Change ce que tu veux dans le code, puis relance `npm run build:ios`. La nouvelle version arrive dans TestFlight.
