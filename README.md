# Cell - Navigateur Web Cyberpunk 🌐

Version web du navigateur mobile **Cell** avec design cyberpunk et IA intégrée.

## 🎨 Design

- **Thème Cyberpunk**: Noir mat (#0a0a0a) avec néon cyan (#00ffff)
- **Effets**: Ombres néon, bordures lumineuses, texte avec glow
- **Interface**: 100% fidèle à la version mobile React Native

## ✨ Fonctionnalités

### 🌐 Navigation
- Multi-onglets avec gestion complète
- Barre d'adresse intelligente (URL ou recherche Google)
- Boutons: Retour, Avant, Rafraîchir
- Navigation par iframe

### ⭐ Gestion
- **Favoris**: Ajout/suppression, menu déroulant
- **Historique**: Historique de navigation, bouton effacer
- **Téléchargements**: Historique des téléchargements
- **Traduction**: Menu avec 10 langues (Google Translate)

### 🤖 Fred - Assistant IA
- Chat intelligent intégré
- Résumé de pages web
- Recherche boostée avec mots-clés
- Commandes vocales:
  - "Recherche [sujet]"
  - "Résume cette page"
  - "Nouvel onglet"
  - "Retour" / "Avant" / "Rafraîchir"
- Synthèse vocale des réponses

### 🎯 Actions rapides
- Boutons de suggestions dans le chat
- Navigation intuitive
- Design responsive

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes

1. **Installer les dépendances**
```bash
cd navigateur-web
npm install
```

2. **Lancer en développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

3. **Build pour production**
```bash
npm run build
```

Les fichiers statiques seront dans le dossier `out/`

## 📦 Déploiement sur Vercel

### Option 1: Via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
cd navigateur-web
vercel
```

### Option 2: Via GitHub

1. Pushez le projet sur GitHub
2. Allez sur [vercel.com](https://vercel.com)
3. Cliquez sur "New Project"
4. Importez votre repo GitHub
5. Vercel détecte automatiquement Next.js
6. Cliquez sur "Deploy"

### Configuration Vercel

Le projet est configuré pour l'export statique (`output: 'export'`), donc:
- ✅ Compatible avec tous les hébergements statiques
- ✅ Pas besoin de serveur Node.js
- ✅ Déploiement gratuit sur Vercel, Netlify, GitHub Pages, etc.

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React avec Material-UI Icons
- **Styling**: CSS-in-JS (inline styles)
- **IA**: Fred AI (assistant intelligent)

## 📂 Structure du projet

```
navigateur-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout principal
│   │   ├── page.tsx          # Page d'accueil
│   │   └── globals.css       # Styles globaux
│   ├── components/
│   │   ├── Browser.tsx       # Composant principal
│   │   ├── TabManager.tsx    # Gestion des onglets
│   │   └── FredChat.tsx      # Chat IA
│   └── utils/
│       └── FredAI.ts         # Logique IA
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🎨 Thème Cyberpunk

### Couleurs
- `#0a0a0a` - Noir mat (fond)
- `#1a1a1a` - Noir légèrement plus clair (cartes)
- `#00ffff` - Cyan néon (accents)
- `#00ffff80` - Cyan semi-transparent
- `#ffff00` - Jaune (favoris actifs)

### Effets
- Box-shadow avec glow cyan
- Text-shadow pour effets néon
- Bordures lumineuses
- Transitions douces

## 🔧 Personnalisation

### Changer les couleurs
Modifiez les valeurs dans `src/app/globals.css` et les styles inline des composants.

### Ajouter des fonctionnalités Fred
Éditez `src/utils/FredAI.ts` pour ajouter de nouvelles commandes.

### Modifier le design
Les styles sont définis en inline dans chaque composant (`styles` object).

## 📝 Notes importantes

### Limitations iframe
- Certains sites bloquent l'affichage en iframe (X-Frame-Options)
- Solutions: proxy CORS ou affichage en nouvelle fenêtre

### Permissions
- Synthèse vocale: Fonctionne nativement dans les navigateurs modernes
- Reconnaissance vocale: Nécessite permissions microphone

## 🆚 Différences avec la version mobile

| Fonctionnalité | Mobile (React Native) | Web (Next.js) |
|----------------|----------------------|---------------|
| Rendu pages | WebView | iframe |
| Mode VR | ✅ Compatible | ❌ Non disponible |
| Navigation | Native | iframe limitations |
| Synthèse vocale | expo-speech | Web Speech API |
| Performance | Native | Dépend du navigateur |

## 🐛 Problèmes connus

1. **Iframe bloquée**: Certains sites refusent d'être affichés en iframe
2. **Navigation limitée**: history.back() pas toujours disponible
3. **Contenu de page**: Impossible d'extraire le contenu cross-origin

## 📄 Licence

Projet Cell - Tous droits réservés

---

**Développé avec ❤️ et du code cyberpunk** ⚡
