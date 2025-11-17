# Répartition Automatique des Pages en Groupes d'Analyse

## Vue d'ensemble

Ce système permet de répartir automatiquement **toutes les pages du repository** en groupes d'analyse équitables, garantissant :

- Aucun doublon (chaque page apparaît exactement une fois)
- Aucune page oubliée (couverture complète à 100%)
- Répartition équitable (tous les groupes ont approximativement le même nombre de pages)
- Facilité de collaboration (plusieurs personnes ou IA peuvent travailler en parallèle sans recoupement)

## Statistiques de la Répartition Actuelle

```
📊 Total de pages:       343 pages
📁 Pages frontend:       178 pages (apps/frontend/src/pages/*.tsx)
⚙️  Pages backend:        6 pages (apps/backend/src/**/*.ts)
🔧 Fonctions serverless: 159 pages (apps/functions/**/*.ts)

📦 Nombre de groupes:    10 groupes
📈 Moyenne par groupe:   35 pages/groupe

✅ Garanties:
   • Aucun doublon
   • Aucune page oubliée
   • Répartition complète et équitable
```

## Fichiers Générés

### 1. Script de Répartition

**Fichier**: `scripts/distribute-pages-analysis.js`

Script principal qui :
- Scanne automatiquement les dossiers du projet
- Détecte toutes les pages (frontend, backend, functions)
- Les répartit en N groupes égaux
- Génère le fichier JSON de répartition
- Vérifie la cohérence (pas de doublons, aucune page oubliée)

### 2. Fichier JSON de Répartition

**Fichier**: `pages-analysis-groups.json`

Contient :
- **metadata**: Informations générales (nombre total de pages, nombre de groupes, date de génération)
- **groups**: Liste des 10 groupes avec leurs pages assignées
- **summary**: Statistiques par catégorie (frontend, backend, functions)

### Structure du JSON

```json
{
  "metadata": {
    "totalPages": 343,
    "numberOfGroups": 10,
    "averagePagesPerGroup": 35,
    "generatedAt": "2025-11-17T07:10:39.781Z",
    "scanPaths": [
      "apps/frontend/src/pages",
      "apps/functions",
      "apps/backend/src"
    ]
  },
  "groups": [
    {
      "groupId": 1,
      "groupName": "Groupe 1",
      "pagesCount": 35,
      "pages": [
        {
          "path": "/home/user/med-mng/apps/backend/src/controllers/healthController.ts",
          "relativePath": "apps/backend/src/controllers/healthController.ts",
          "category": "backend",
          "name": "healthController"
        },
        // ... autres pages
      ]
    },
    // ... autres groupes
  ],
  "summary": {
    "frontendPages": 178,
    "backendPages": 6,
    "functionsPages": 159
  }
}
```

## Utilisation

### Générer/Régénérer la Répartition

Pour (re)générer la répartition des pages :

```bash
node scripts/distribute-pages-analysis.js
```

Le script va :
1. Scanner tous les dossiers configurés
2. Détecter automatiquement toutes les pages
3. Les répartir équitablement
4. Vérifier la cohérence
5. Générer `pages-analysis-groups.json`

### Modifier le Nombre de Groupes

Pour changer le nombre de groupes, éditez le fichier `scripts/distribute-pages-analysis.js` :

```javascript
// Ligne 20 du script
const NUMBER_OF_GROUPS = 10; // Changez cette valeur
```

Valeurs recommandées :
- **5 groupes** → ~69 pages/groupe (audit rapide)
- **10 groupes** → ~35 pages/groupe (par défaut, bon équilibre)
- **20 groupes** → ~18 pages/groupe (analyse très détaillée)

### Ajouter/Retirer des Chemins de Scan

Pour modifier les dossiers scannés, éditez le fichier `scripts/distribute-pages-analysis.js` :

```javascript
// Lignes 23-27 du script
const PATHS_TO_SCAN = [
  'apps/frontend/src/pages',     // Pages React frontend
  'apps/functions',               // Fonctions serverless
  'apps/backend/src',            // Routes backend
  // Ajoutez d'autres chemins ici si besoin
];
```

## Cas d'Usage

### 1. Audit de Code Parallèle

Plusieurs développeurs peuvent analyser le code en parallèle sans se marcher dessus :

```bash
# Développeur A analyse le Groupe 1
# Développeur B analyse le Groupe 2
# Développeur C analyse le Groupe 3
# ...
```

Chaque groupe est **indépendant et complet**, sans recoupement.

### 2. Analyse IA par Lots

Pour éviter de surcharger l'IA avec 343 pages d'un coup, analysez groupe par groupe :

```bash
# Prompt pour l'IA :
"Analyse le Groupe 1 du fichier pages-analysis-groups.json
et vérifie la qualité du code, la sécurité et les bonnes pratiques."
```

### 3. Revue de Code Progressive

Planifiez une revue de code progressive :

```markdown
Semaine 1: Groupes 1-2 (70 pages)
Semaine 2: Groupes 3-4 (70 pages)
Semaine 3: Groupes 5-6 (70 pages)
...
```

### 4. Tests de Couverture

Vérifiez que chaque groupe a des tests associés :

```bash
# Pour chaque groupe, vérifier si les fichiers ont des tests
node scripts/check-group-coverage.js --group 1
```

## Vérification de Cohérence

Le script effectue automatiquement les vérifications suivantes :

### ✅ Pas de Doublons
Chaque fichier apparaît exactement **une seule fois** dans un seul groupe.

### ✅ Aucune Page Oubliée
Toutes les pages détectées sont incluses dans un groupe.

### ✅ Répartition Équitable
Les groupes ont approximativement le même nombre de pages (±1-2 pages de différence).

### ✅ Tri Alphabétique
Les pages sont triées alphabétiquement pour une répartition déterministe et reproductible.

## Commandes Utiles

### Afficher les Groupes

```bash
# Afficher le nombre de pages par groupe
node -p "JSON.parse(require('fs').readFileSync('pages-analysis-groups.json')).groups.map(g => \`Groupe \${g.groupId}: \${g.pagesCount} pages\`).join('\\n')"
```

### Extraire un Groupe Spécifique

```bash
# Afficher toutes les pages du Groupe 1
node -p "JSON.parse(require('fs').readFileSync('pages-analysis-groups.json')).groups[0].pages.map(p => p.relativePath).join('\\n')"
```

### Vérifier les Statistiques

```bash
# Afficher le résumé
node -p "JSON.parse(require('fs').readFileSync('pages-analysis-groups.json')).summary"
```

## Maintenance

### Quand Régénérer ?

Régénérez la répartition quand :
- De nouvelles pages sont ajoutées au projet
- Des pages sont supprimées
- Vous voulez changer le nombre de groupes
- La structure du projet change

### Automatisation (Optionnel)

Vous pouvez automatiser la régénération via un hook Git :

```bash
# .husky/pre-commit
#!/bin/sh
node scripts/distribute-pages-analysis.js
git add pages-analysis-groups.json
```

## Résolution de Problèmes

### Erreur : "Aucune page détectée"

**Cause** : Les chemins de scan sont incorrects ou les dossiers sont vides.

**Solution** : Vérifiez que les chemins dans `PATHS_TO_SCAN` existent et contiennent des fichiers `.ts` ou `.tsx`.

### Erreur : "Doublons détectés"

**Cause** : Bug dans le script de répartition.

**Solution** : Contactez le mainteneur ou vérifiez que vous utilisez la dernière version du script.

### Groupes Déséquilibrés

**Cause** : Normal si le nombre total de pages n'est pas divisible parfaitement par le nombre de groupes.

**Solution** : Aucune action nécessaire. Le dernier groupe peut avoir quelques pages de moins.

## Exemple de Workflow d'Analyse

### Étape 1 : Générer la Répartition

```bash
node scripts/distribute-pages-analysis.js
```

### Étape 2 : Assigner les Groupes

```markdown
| Analyste       | Groupe(s)  | Statut      |
|----------------|------------|-------------|
| Alice          | 1-2        | ✅ Terminé  |
| Bob            | 3-4        | 🔄 En cours |
| Charlie        | 5-6        | ⏳ À faire  |
| IA Claude      | 7-8        | ⏳ À faire  |
| IA Claude      | 9-10       | ⏳ À faire  |
```

### Étape 3 : Analyser Chaque Groupe

Pour chaque groupe :
1. Ouvrir le fichier JSON
2. Extraire la liste des pages du groupe
3. Analyser chaque page selon les critères définis
4. Documenter les trouvailles dans un rapport

### Étape 4 : Consolider les Résultats

Fusionner tous les rapports d'analyse dans un document final.

## Structure des Groupes

### Groupe 1-2 (Backend + Frontend Initial)
- Contient principalement les fichiers backend
- Début de l'ordre alphabétique des pages frontend (A-C)

### Groupe 3-7 (Frontend Core)
- Pages frontend principales (D-P)
- Cœur de l'application

### Groupe 8-10 (Frontend + Functions)
- Fin des pages frontend (Q-W)
- Toutes les fonctions serverless

## Questions Fréquentes

### Q: Puis-je modifier manuellement le fichier JSON ?

**R**: Non recommandé. Régénérez-le avec le script pour garantir la cohérence.

### Q: Comment savoir si une nouvelle page a été ajoutée ?

**R**: Régénérez la répartition et comparez le `totalPages` dans les métadonnées.

### Q: Les groupes changent-ils à chaque génération ?

**R**: Non, grâce au tri alphabétique, la répartition est **déterministe** : même input → même output.

### Q: Puis-je avoir des groupes par catégorie (frontend, backend, functions) ?

**R**: Oui, mais vous devrez modifier le script pour grouper par catégorie avant de répartir.

## Évolutions Futures Possibles

- [ ] Script de vérification de couverture de tests par groupe
- [ ] Génération de rapports d'analyse par groupe
- [ ] Interface web pour visualiser la répartition
- [ ] Intégration CI/CD pour vérification automatique
- [ ] Export en différents formats (CSV, Markdown, etc.)

## Support

Pour toute question ou suggestion, ouvrez une issue ou contactez l'équipe de développement.

---

**Dernière mise à jour**: 2025-11-17
**Version du script**: 1.0.0
**Auteur**: Système automatisé de répartition
