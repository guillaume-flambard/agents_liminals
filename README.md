# Agents Liminals - Next.js 15

## 🌟 Observatoire des États Intérieurs

Plateforme de consultations spirituelles et psychologiques avec des agents IA spécialisés dans différents territoires émotionnels.

**✅ Migration Complete : Node.js/EJS → Next.js 15**

## ✨ Fonctionnalités

### 🎯 Fonctionnalités Principales
- **Observatoire des États Intérieurs** - Page d'accueil avec carte interactive des territoires
- **5 Agents Liminals** - Chaque agent avec son design unique et ses rituels
- **Consultations IA** - Intégration directe avec les webhooks n8n
- **Limites quotidiennes** - Système de limitation à 3 consultations par jour
- **Historique local** - Sauvegarde des consultations dans localStorage
- **Diagnostic d'état** - Modal interactif pour guider les utilisateurs

### 👥 Agents Disponibles
1. **L'Accordeur de Sens** (Territoire du Flou) - 🎵
2. **Le Peseur d'Ambigus** (Territoire du Doute) - ⚖️
3. **Le Dénoueur** (Territoire de la Tension) - ⚡
4. **L'Évideur** (Territoire de la Révélation) - 🕳️
5. **L'Habitant du Creux** (Territoire du Vide) - ◯

## 🛠️ Technologies

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **Framer Motion** - Animations fluides
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation des données
- **Lucide React** - Icônes

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start
```

## 🎨 Design Original Conservé

Le design a été fidèlement reproduit avec :
- **Couleurs spécifiques** par agent
- **Animations originales** (twinkle des étoiles, oscillation des balances, etc.)
- **Layouts responsives** identiques
- **Typographie** Crimson Text
- **Effets visuels** (backdrop-blur, gradients, shadows)

## 🔗 Intégrations

### Webhooks n8n
- Accordeur: `https://n8n.memoapp.eu/webhook/accordeur`
- Peseur: `https://n8n.memoapp.eu/webhook/peseur`
- Dénoueur: `https://n8n.memoapp.eu/webhook/denoueur`
- Évideur: `https://n8n.memoapp.eu/webhook/evideur`
- Habitant: `https://n8n.memoapp.eu/webhook/habitant`

### Authentification
- Système JWT conservé
- Pages protégées par middleware
- Gestion des sessions

## 📱 Responsivité

Le design s'adapte parfaitement à tous les écrans :
- **Desktop** - Grille 3x2 pour les territoires
- **Tablet** - Grille 2x3 adaptée
- **Mobile** - Colonne unique avec espacement optimisé

## 🔄 Fonctionnalités Avancées

### Consultation History
- Stockage local des 10 dernières consultations
- Affichage avec timestamp et extrait
- Possibilité de télécharger en .txt

### Limite Quotidienne
- 3 consultations par jour par agent
- Compteur visuel avec changement de couleur
- Reset automatique à minuit

### Diagnostic d'État
- Modal interactif avec 5 options
- Redirection automatique vers l'agent approprié
- UX fluide avec animations

## 🚀 Déploiement

### Production
```bash
npm run build
npm start
```

### Variables d'environnement
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

## 📋 Structure du Projet

```
frontend/
├── src/
│   ├── app/                 # App Router Next.js 15
│   │   ├── agents/[name]/   # Pages dynamiques des agents
│   │   ├── auth/           # Authentification
│   │   ├── layout.tsx      # Layout global
│   │   └── page.tsx        # Page d'accueil
│   ├── components/         # Composants React
│   │   ├── agent-consultation-original.tsx
│   │   ├── observatoire-hub.tsx
│   │   └── ui/            # Composants UI
│   ├── lib/               # Utilitaires
│   │   ├── auth/          # Gestion auth
│   │   └── utils.ts       # Helpers
│   └── types/             # Types TypeScript
├── public/                # Assets statiques
├── next.config.js         # Configuration Next.js
├── tailwind.config.js     # Configuration Tailwind
└── package.json           # Dépendances
```

## 🔍 Différences avec l'Original

### Améliorations
- **TypeScript** - Meilleure maintenabilité
- **Composants React** - Réutilisabilité accrue
- **App Router** - Routing moderne Next.js 15
- **Optimisations** - Images, fonts, et performances
- **SEO** - Metadata et structure optimisée

### Fonctionnalités Conservées
- **Design pixel-perfect** - Couleurs, animations, layouts
- **Logique métier** - Consultations, limites, historique
- **Intégrations** - Webhooks n8n inchangés
- **UX** - Parcours utilisateur identique

## 🎯 Prochaines Étapes

1. **Tests E2E** - Cypress ou Playwright
2. **Monitoring** - Sentry pour les erreurs
3. **Analytics** - Google Analytics ou Plausible
4. **PWA** - Service Worker pour offline
5. **Optimisations** - Bundle analysis et performance

## 📞 Support

Pour toute question sur la migration ou le déploiement, consultez la documentation Next.js 15 ou contactez l'équipe de développement.

---

**Version:** 3.0.0  
**Migration terminée:** ✅  
**Status:** Production Ready  
**Compatibilité:** Node.js 18+