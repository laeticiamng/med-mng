# Guide Rapide - Analyse par Groupes

## Démarrage Rapide en 3 Commandes

### 1. Générer la répartition

```bash
npm run distribute-pages
```

Cette commande scanne le repo et génère `pages-analysis-groups.json` avec 10 groupes équitables.

### 2. Vérifier la répartition

```bash
npm run verify-distribution
```

Affiche les statistiques et vérifie qu'il n'y a pas de doublons ni de pages oubliées.

### 3. Afficher un groupe

```bash
npm run show-group 1  # Affiche le Groupe 1
npm run show-group 5  # Affiche le Groupe 5
```

## Résultats

### Répartition Actuelle

```
📊 Total: 343 pages
   - Frontend:  178 pages (51.9%)
   - Backend:   6 pages (1.7%)
   - Functions: 159 pages (46.4%)

📦 10 groupes de ~35 pages chacun
```

### Groupes

| Groupe | Pages | Frontend | Backend | Functions |
|--------|-------|----------|---------|-----------|
| 1      | 35    | 29       | 6       | 0         |
| 2      | 35    | 35       | 0       | 0         |
| 3      | 35    | 35       | 0       | 0         |
| 4      | 35    | 35       | 0       | 0         |
| 5      | 35    | 35       | 0       | 0         |
| 6      | 35    | 9        | 0       | 26        |
| 7      | 35    | 0        | 0       | 35        |
| 8      | 35    | 0        | 0       | 35        |
| 9      | 35    | 0        | 0       | 35        |
| 10     | 28    | 0        | 0       | 28        |

## Utilisation pour l'Analyse

### Analyser un Groupe avec l'IA

```bash
# 1. Afficher le groupe
npm run show-group 1

# 2. Copier la liste des fichiers
npm run show-group 1 -- --paths-only

# 3. Demander à l'IA d'analyser ces fichiers
```

Exemple de prompt pour l'IA :

```
Analyse le Groupe 1 du fichier pages-analysis-groups.json.

Pour chaque fichier du groupe :
1. Vérifie la qualité du code
2. Détecte les problèmes de sécurité
3. Identifie les opportunités d'amélioration
4. Note les bonnes pratiques

Génère un rapport structuré par fichier.
```

### Workflow d'Équipe

```markdown
**Semaine 1**
- Alice: Groupes 1-2 (70 pages)
- Bob: Groupes 3-4 (70 pages)

**Semaine 2**
- Alice: Groupes 5-6 (70 pages)
- Bob: Groupes 7-8 (70 pages)

**Semaine 3**
- Alice: Groupes 9-10 (63 pages)
- Consolidation des rapports
```

## Modifier la Configuration

### Changer le Nombre de Groupes

Éditez `scripts/distribute-pages-analysis.js` :

```javascript
const NUMBER_OF_GROUPS = 20; // Au lieu de 10
```

Puis régénérez :

```bash
npm run distribute-pages
npm run verify-distribution
```

### Ajouter des Dossiers à Scanner

Éditez `scripts/distribute-pages-analysis.js` :

```javascript
const PATHS_TO_SCAN = [
  'apps/frontend/src/pages',
  'apps/functions',
  'apps/backend/src',
  'packages/shared/src', // Nouveau dossier
];
```

## Garanties

- ✅ **Aucun doublon**: Chaque page apparaît exactement 1 fois
- ✅ **Aucune page oubliée**: Couverture à 100%
- ✅ **Répartition équitable**: Tous les groupes ont ~le même nombre de pages
- ✅ **Déterministe**: La même génération produit toujours le même résultat

## Fichiers

- `scripts/distribute-pages-analysis.js` - Script de génération
- `scripts/show-group.js` - Affichage d'un groupe
- `scripts/verify-distribution.js` - Vérification de cohérence
- `pages-analysis-groups.json` - Fichier JSON de répartition (généré)
- `REPARTITION_GROUPES_ANALYSE.md` - Documentation complète

## Support

Pour plus de détails, consultez `REPARTITION_GROUPES_ANALYSE.md`.
