# MediSync — Disponibilités Médecin (Angular 20)

Une application Angular 20 de gestion des disponibilités médicales avec interface moderne et responsive.

## 📋 Structure du projet

```
src/
├── app/
│   ├── features/disponibilites/
│   │   ├── calendar/          # Vue calendrier mensuel
│   │   ├── recurrences/       # Gestion des règles de récurrence
│   │   ├── creneaux/          # Vue semaine des créneaux
│   │   ├── stats/             # Statistiques et graphiques
│   │   ├── shared/            # Composants partagés
│   │   │   ├── sidebar/
│   │   │   └── modal/
│   │   ├── models/            # Types TypeScript
│   │   └── data/              # Mock data
│   ├── app.component.*        # Composant principal
│   ├── app.config.ts          # Configuration Angular
│   └── app.routes.ts          # Routes
├── main.ts                    # Point d'entrée
├── index.html
└── styles.css                 # Styles globaux
```

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- Angular CLI 20+

### 1. Cloner et installer les dépendances
```bash
cd medisync-disponibilites
npm install
```

### 2. Démarrer le serveur de développement
```bash
npm start
```

L'application s'ouvrira automatiquement sur `http://localhost:4200`

### 3. Build pour la production
```bash
npm run build
```

## 📱 Fonctionnalités actuelles (Mock)

- ✅ **Calendrier mensuel** — vue globale avec stats
- ✅ **Récurrences** — création/modification de règles hebdomadaires
- ✅ **Créneaux** — vue semaine avec gestion des créneaux
- ✅ **Statistiques** — taux de remplissage par jour
- ✅ **Modales** — ajout, édition de créneaux

## 🎨 Design & Palette

- **Primaire** : #1971c2 (Bleu santé)
- **Succès** : #2f9e44 (Vert)
- **Attention** : #f59f00 (Orange)
- **Danger** : #c92a2a (Rouge)
- **Icônes** : Tabler Icons (CDN)

## 📝 Prochaines étapes

1. Intégrer un service REST pour les disponibilités
2. Ajouter l'authentification utilisateur
3. Implémenter la validation côté serveur
4. Ajouter les notifications en temps réel
5. Optimiser les performances pour mobile

## 🛠️ Technologies

- **Framework** : Angular 20 (standalone)
- **Langage** : TypeScript 5.6
- **Styles** : CSS vanilla (pas de framework)
- **State** : Angular signals
- **Icons** : Tabler Icons

## 📦 Notes

- **Sans services** : Les composants utilisent des mock data
- **Standalone** : Aucun NgModule, architecture modulaire
- **TypeScript strict** : Configuration stricte activée

Bon développement ! 🎉
