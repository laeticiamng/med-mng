# Script de migration des couleurs

Script automatique pour détecter et remplacer les couleurs hardcodées par des tokens sémantiques du design system.

## 🚀 Installation

```bash
# Installation de la dépendance glob (si nécessaire)
npm install glob
```

## 📖 Utilisation

### Commandes de base

```bash
# Afficher les stats sans modifier les fichiers
node scripts/migrate-colors.js --stats

# Prévisualiser les changements (dry-run)
node scripts/migrate-colors.js --dry-run

# Migrer tout le dossier src/
node scripts/migrate-colors.js

# Migrer un dossier spécifique
node scripts/migrate-colors.js --path src/components/ui/

# Migrer un fichier unique
node scripts/migrate-colors.js --path src/components/MyComponent.tsx
```

## ⚙️ Options disponibles

| Option | Description |
|--------|-------------|
| `--dry-run` | Affiche les changements sans les appliquer |
| `--stats` | Affiche uniquement les statistiques finales |
| `--path <path>` | Spécifie un chemin personnalisé (défaut: `src/`) |
| `--interactive` | Mode interactif pour confirmer chaque changement (à venir) |

## 📊 Exemple de sortie

```
🎨 Migration des couleurs hardcodées vers tokens sémantiques

🔍 Scanning 246 fichiers dans src/...

📝 src/components/MyComponent.tsx
   Ligne 15: bg-blue-50 → bg-primary/10
   Ligne 22: text-green-600 → text-success
   Ligne 35: border-red-200 → border-destructive/20
   ✅ Fichier mis à jour

============================================================
📊 STATISTIQUES DE MIGRATION
============================================================

📁 Fichiers analysés:     246
✏️  Fichiers modifiés:     89
🔄 Total remplacements:   324

📈 Top 10 couleurs remplacées:
   1. bg-blue-50           → 45 fois
   2. text-gray-600        → 38 fois
   3. text-green-600       → 29 fois
   4. bg-amber-50          → 27 fois
   5. text-red-600         → 23 fois
   ...

============================================================
```

## 🎨 Mappings de couleurs

### Backgrounds

| Hardcodé | Token sémantique |
|----------|------------------|
| `bg-blue-50`, `bg-blue-100` | `bg-primary/10`, `bg-primary/20` |
| `bg-green-50`, `bg-green-100` | `bg-success/10`, `bg-success/20` |
| `bg-red-50`, `bg-red-100` | `bg-destructive/10`, `bg-destructive/20` |
| `bg-amber-50`, `bg-amber-100` | `bg-warning/10`, `bg-warning/20` |
| `bg-gray-50`, `bg-gray-100` | `bg-muted` |

### Text

| Hardcodé | Token sémantique |
|----------|------------------|
| `text-blue-600` | `text-primary` |
| `text-green-600` | `text-success` |
| `text-red-600` | `text-destructive` |
| `text-amber-600` | `text-warning` |
| `text-gray-600` | `text-muted-foreground` |

### Borders

| Hardcodé | Token sémantique |
|----------|------------------|
| `border-blue-200` | `border-primary/20` |
| `border-green-200` | `border-success/20` |
| `border-red-200` | `border-destructive/20` |
| `border-gray-200` | `border-border` |

Pour la liste complète des mappings, voir le fichier `migrate-colors.js`.

## 🔍 Patterns détectés

Le script détecte automatiquement:

- ✅ Couleurs Tailwind directes (`text-blue-500`, `bg-red-100`)
- ✅ Variantes dark mode (`dark:bg-blue-500`, `dark:text-green-400`)
- ✅ Classes utilitaires (`border-*`, `from-*`, `to-*`, `ring-*`)
- ✅ Opacités (`bg-blue-500/50`, `text-red-600/80`)

## 📚 Documentation

- [Guide ESLint personnalisé](../docs/ESLINT_CUSTOM_RULE_GUIDE.md)
- [Rapport migration UI](../docs/UI_COMPONENTS_MIGRATION_REPORT.md)
- [Guide Design System](../docs/DESIGN_SYSTEM_GUIDE.md)

## ⚠️ Avertissements

- **Toujours commit vos changements** avant d'exécuter le script
- **Testez visuellement** après migration (light + dark mode)
- **Vérifiez les contrastes** pour l'accessibilité
- Le script **ne peut pas** détecter les couleurs dans:
  - Styles inline (`style={{ color: '#blue' }}`)
  - Props de composants (`<Component color="blue" />`)
  - Fichiers CSS/SCSS purs

## 🐛 Problèmes connus

1. **Faux positifs possibles**: Le script peut suggérer des remplacements pour des noms de variables contenant "blue", "green", etc.
2. **Classes complexes**: Les expressions template literals complexes peuvent ne pas être détectées
3. **Mode interactif**: Pas encore implémenté

## 🤝 Contribution

Pour améliorer le script:

1. Ajouter de nouveaux mappings dans `COLOR_MAPPINGS`
2. Améliorer les regex de détection
3. Implémenter le mode interactif
4. Ajouter des tests unitaires

---

**Auteur**: Équipe Design System  
**Version**: 1.0.0  
**Dernière mise à jour**: 2025-01-25
