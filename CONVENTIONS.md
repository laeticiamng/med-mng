# Conventions du Projet MedMng

## 📋 Règles de Code Communes

### Style et Formatage
- **Indentation** : 2 espaces (pas de tabs)
- **Guillemets** : Single quotes `'` pour strings, double quotes `"` pour JSX
- **Point-virgule** : Obligatoire à la fin des statements
- **Ligne vide** : Une seule ligne vide en fin de fichier
- **Espaces** : Aucun espace en fin de ligne
- **Longueur** : Maximum 100 caractères par ligne

### TypeScript
- **Types strict** : Interdiction du type `any` (utiliser `unknown` si nécessaire)
- **Interfaces** : Préférées aux types pour les objets
- **Naming** : PascalCase pour interfaces, camelCase pour variables
- **Imports** : Utiliser les alias `@/` pour les chemins absolus

### Logging et Debug
- **Console.log interdits** : Utiliser le système `logger` du projet
- **Niveaux** : `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()`
- **Format** : Toujours inclure `component` et `action` dans le contexte
- **Production** : Seuls les logs error/warn en production

### React et Composants
- **Hooks** : Toujours au début du composant, jamais conditionnels
- **Props** : Interfaces typées avec JSDoc si nécessaire
- **Export** : Named exports préférés, default export pour les pages
- **Keys** : Obligatoires et uniques pour les listes

### Gestion d'Erreurs
- **Try/catch** : Toujours typer `error: unknown`
- **Vérification** : `error instanceof Error` avant d'accéder aux propriétés
- **Logging** : Logger les erreurs avec contexte approprié
- **User feedback** : Toast ou UI appropriée pour l'utilisateur

### Fichiers et Structure
- **Naming** : kebab-case pour fichiers, PascalCase pour composants
- **Organisation** : Un composant = un fichier
- **Index files** : Pour réexporter depuis les dossiers
- **Tests** : À côté du fichier testé avec `.test.ts/.tsx`

## 🚫 Interdictions Strictes

- ❌ `console.log`, `console.error`, etc.
- ❌ Type `any` sauf cas exceptionnels documentés
- ❌ `eslint-disable` sans justification
- ❌ Variables `var` (utiliser `const`/`let`)
- ❌ Espaces en fin de ligne
- ❌ Plusieurs lignes vides consécutives
- ❌ Imports non utilisés

## ✅ Bonnes Pratiques

- ✅ Utiliser le design system (tokens CSS)
- ✅ Composants réutilisables et focalisés
- ✅ Tests pour la logique critique
- ✅ Documentation inline pour code complexe
- ✅ Gestion d'erreur robuste
- ✅ Accessibilité (aria-labels, semantic HTML)

## 🔧 Outils d'Automatisation

- **Prettier** : Formatage automatique
- **ESLint** : Règles de qualité
- **TypeScript** : Vérification de types
- **Vitest** : Tests unitaires
- **Pre-commit hooks** : Vérifications automatiques

## 📝 Workflow

1. **Avant commit** : Prettier + ESLint passent automatiquement
2. **CI/CD** : Tests et build doivent passer
3. **Review** : Code review obligatoire pour les changements importants
4. **Documentation** : Mise à jour si API publique change

---

**Dernière mise à jour** : 2025-01-09  
**Révision suivante** : Mensuelle (première semaine du mois)

> 💡 **Principe** : Ces règles évitent les différences entre développeurs et maintiennent la qualité du code automatiquement.