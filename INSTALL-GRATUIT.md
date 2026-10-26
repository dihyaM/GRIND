# Installer Le Carnet sur iPhone gratuitement

Sans compte développeur payant. Il te faut :
- ton iPhone et son câble ;
- un ordinateur Windows ou Mac, **une seule fois**, pour la mise en place ;
- ton identifiant Apple habituel (gratuit) ;
- un compte GitHub (gratuit).

Le principe : GitHub fabrique l'appli gratuitement dans le cloud (un fichier `.ipa`), puis **SideStore** l'installe sur ton iPhone avec ton identifiant Apple gratuit. Apple limite ces installations à 7 jours : SideStore les renouvelle depuis ton iPhone, sans ordinateur, en un tap par semaine.

---

## Partie 1 — Fabriquer l'appli avec GitHub (≈ 30 min, dont 20 d'attente)

1. Crée un compte sur https://github.com/signup.
2. En haut à droite : **+** > **New repository**. Nom : `le-carnet`. Coche **Private**. **Create repository**.
3. Clique sur **uploading an existing file**. Dézippe `le-carnet.zip` sur l'ordinateur, puis glisse **le contenu** du dossier (App.js, app.json, package.json, eas.json, index.js et les dossiers `src` et `assets`). **Commit changes**.
4. Le dossier caché `.github` ne passe pas par glisser-déposer. Crée-le à la main :
   - **Add file** > **Create new file**.
   - Nom du fichier : tape exactement `.github/workflows/ipa.yml`
   - Ouvre le fichier `ipa.yml` du zip (dans `.github/workflows`, affiche les fichiers cachés si besoin) avec le Bloc-notes, copie tout, colle-le dans GitHub. **Commit changes**.
5. Onglet **Actions** > à gauche **Fabriquer l'appli iPhone (IPA)** > bouton **Run workflow** > **Run workflow**.
6. Attends 15 à 25 min. Quand la pastille devient verte, clique sur l'exécution, puis en bas dans **Artifacts** sur **LeCarnet-ipa** : tu télécharges un zip qui contient `LeCarnet.ipa`.
7. Dézippe-le et mets `LeCarnet.ipa` dans **iCloud Drive** (ou envoie-le-toi par mail / AirDrop) pour le retrouver dans l'app **Fichiers** de l'iPhone.

Si la pastille devient rouge : clique dessus, fais une capture de l'étape en rouge et envoie-la à Claude.

---

## Partie 2 — Installer SideStore sur l'iPhone (≈ 30 min, une seule fois)

Suis le guide pas à pas d'iPhoneSoft (en français, à jour pour iOS 26) :
https://iphonesoft.fr/2026/03/11/guide-ios-26-installer-sidestore-livecontainer-sideloader-apps-jailbreak

En résumé :
1. Sur l'iPhone : définis un code d'accès, puis active **Réglages > Confidentialité et sécurité > Mode développeur** (l'iPhone redémarre).
2. Sur l'ordinateur, installe **iLoader**, branche l'iPhone en USB et installe **SideStore** avec ton identifiant Apple.
3. Sur l'iPhone : **Réglages > Général > VPN et gestion de l'appareil** > fais confiance à ton identifiant Apple.
4. Installe le VPN local indiqué dans le guide (LocalDevVPN ou StikDebug) : c'est lui qui permet de renouveler les applis sans ordinateur.

---

## Partie 3 — Installer Le Carnet

1. Ouvre **SideStore** > onglet **Mes apps** (My Apps) > **+** en haut à gauche.
2. Choisis `LeCarnet.ipa` dans Fichiers.
3. Le Carnet apparaît sur ton écran d'accueil. Ouvre-le, active les rappels dans Réglages (roue en haut à droite).

---

## Chaque semaine (1 min)

Ouvre SideStore, active le VPN local si demandé, touche **Refresh All**. Sans ça, l'appli ne s'ouvre plus au bout de 7 jours (tes données restent là, il suffit de rafraîchir).

## Limites à connaître

- Identifiant Apple gratuit : 3 applis installées par SideStore en même temps (SideStore en compte une).
- Si tu modifies l'appli, relance le workflow GitHub et réinstalle le nouveau `.ipa` par-dessus : tes données sont conservées.
- Exporte tes données de temps en temps (Réglages > Sauvegarde dans l'appli).
