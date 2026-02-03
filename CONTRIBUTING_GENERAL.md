# Contributing to MED-MNG

Merci de votre intérêt pour contribuer à MED-MNG, la plateforme de révision médicale révolutionnaire ! 🎓🎵

## 📋 Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Architecture du projet](#architecture-du-projet)
- [Standards de code](#standards-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Types de contributions](#types-de-contributions)

---

## Code de conduite

Ce projet adhère au [Contributor Covenant](https://www.contributor-covenant.org/). En participant, vous vous engagez à respecter ce code. Les comportements inacceptables peuvent être signalés à dev@med-mng.fr.

---

## Comment contribuer

### 🐛 Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/med-mng/med-mng/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Captures d'écran si pertinent
   - Version du navigateur et OS

### 💡 Proposer une fonctionnalité

1. Ouvrez une issue avec le template "Feature Request"
2. Décrivez :
   - Le problème que vous souhaitez résoudre
   - La solution proposée
   - Les alternatives considérées
   - L'impact sur les utilisateurs

### 🔧 Soumettre du code

1. Fork le repository
2. Créez une branche depuis `main` : `git checkout -b feature/ma-fonctionnalite`
3. Faites vos modifications
4. Testez localement
5. Soumettez une Pull Request

---

## Configuration de l'environnement

### Prérequis

- Node.js 18+ ou Bun
- Git
- Compte Supabase (pour le développement backend)

### Installation

```bash
# Cloner le repository
git clone https://github.com/med-mng/med-mng.git
cd med-mng

# Installer les dépendances
npm install
# ou
bun install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer en développement
npm run dev
```

### Variables d'environnement requises

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Architecture du projet

```
med-mng/
├── src/
│   ├── components/        # Composants React organisés par domaine
│   │   ├── edn/          # Items EDN, tableaux, quiz
│   │   ├── ecos/         # Simulations ECOS UNESS
│   │   ├── music/        # Générateur musical
│   │   ├── ai/           # Chat IA, Copilot médical
│   │   ├── gamification/ # XP, badges, streaks
│   │   ├── workflow/     # Moteur de run/approbation
│   │   ├── multitenancy/ # Gestion institutions
│   │   └── connectors/   # Intégrations externes
│   │
│   ├── hooks/            # Hooks React personnalisés
│   │   ├── learning/     # SRS, flashcards, exams
│   │   ├── audio/        # Lecture audio, playlists
│   │   ├── gamification/ # XP, achievements
│   │   └── data/         # Fetching, mutations
│   │
│   ├── pages/            # Routes de l'application
│   ├── types/            # Types TypeScript
│   ├── lib/              # Utilitaires, API client
│   └── integrations/     # Supabase, services externes
│
├── supabase/
│   ├── functions/        # Edge Functions Deno
│   └── migrations/       # Migrations SQL
│
├── docs/                 # Documentation
└── tests/                # Tests automatisés
```

### Conventions de nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `MusicPlayer.tsx` |
| Hooks | camelCase avec `use` | `useMusicPlayer.ts` |
| Types | PascalCase | `MusicTrack.ts` |
| Fonctions | camelCase | `formatDuration()` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_CREDITS` |
| Fichiers CSS | kebab-case | `music-player.css` |

---

## Standards de code

### TypeScript

- Utiliser TypeScript strict (`strict: true`)
- Typer explicitement les paramètres et retours de fonctions
- Éviter `any`, préférer `unknown` si nécessaire
- Utiliser les interfaces pour les objets, types pour les unions

```typescript
// ✅ Bon
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<UserProfile> {
  // ...
}

// ❌ Mauvais
function getUser(id: any): any {
  // ...
}
```

### React

- Composants fonctionnels uniquement
- Hooks personnalisés pour la logique réutilisable
- Props typées avec interfaces
- Éviter les props spreading non contrôlés

```tsx
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`)} onClick={onClick}>
      {label}
    </button>
  );
}
```

### Styling

- Utiliser Tailwind CSS avec les tokens du design system
- **JAMAIS** de couleurs hardcodées dans les composants
- Toujours utiliser les tokens sémantiques : `bg-primary`, `text-foreground`, etc.

```tsx
// ✅ Bon
<div className="bg-background text-foreground border-border">

// ❌ Mauvais
<div className="bg-white text-black border-gray-200">
```

### Accessibilité

- Toujours inclure les attributs ARIA appropriés
- Tester avec un lecteur d'écran
- Assurer le contraste suffisant (WCAG AA)
- Navigation au clavier fonctionnelle

### Sécurité

- **JAMAIS** de secrets dans le code
- Utiliser Supabase RLS pour les données sensibles
- Valider toutes les entrées utilisateur
- Suivre le principe du moindre privilège

---

## Processus de Pull Request

### Avant de soumettre

1. **Tests** : Assurez-vous que tous les tests passent
   ```bash
   npm run test
   ```

2. **Lint** : Vérifiez le formatage
   ```bash
   npm run lint
   ```

3. **Types** : Vérifiez la compilation TypeScript
   ```bash
   npm run type-check
   ```

### Structure de la PR

```markdown
## Description
[Description claire des changements]

## Type de changement
- [ ] 🐛 Bug fix
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 📝 Documentation
- [ ] ♻️ Refactoring
- [ ] 🔧 Configuration

## Tests
[Comment avez-vous testé ces changements ?]

## Captures d'écran (si applicable)
[Ajoutez des captures d'écran]

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai testé mes changements localement
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Mes changements ne cassent pas les fonctionnalités existantes
```

### Review process

1. Un mainteneur review votre PR
2. Corrections demandées si nécessaire
3. Approbation et merge dans `main`
4. Déploiement automatique sur l'environnement de staging

---

## Types de contributions

### 📚 Items EDN

Voir [CONTRIBUTING_ITEMS.md](./CONTRIBUTING.md) pour le guide spécifique aux items EDN.

### 🎵 Contenu musical

- Proposer des paroles pour les items existants
- Améliorer les prompts de génération Suno
- Tester et valider les chansons générées

### 🧠 Cas cliniques

- Créer des scénarios cliniques réalistes
- Valider médicalement les contenus existants
- Améliorer les grilles d'évaluation ECOS

### 🌍 Traductions

- Ajouter des traductions pour de nouvelles langues
- Améliorer les traductions existantes
- Maintenir la cohérence terminologique médicale

### 🧪 Tests

- Écrire des tests unitaires pour les hooks
- Ajouter des tests d'intégration
- Tests E2E avec Playwright

### 📖 Documentation

- Améliorer la documentation utilisateur
- Documenter les APIs et hooks
- Créer des tutoriels et guides

---

## Ressources utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React](https://react.dev)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Questions ?

- 💬 Ouvrez une issue avec le label `question`
- 📧 Contactez l'équipe : dev@med-mng.fr
- 📚 Consultez la [documentation](./docs/)

---

Merci de contribuer à rendre l'apprentissage médical plus accessible et engageant ! 🎓✨
