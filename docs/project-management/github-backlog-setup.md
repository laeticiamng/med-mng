# MMG-PM-01 · Configuration du backlog GitHub

Ce guide décrit comment utiliser la configuration fournie dans `project-management/backlog-config.json` pour créer en une seule fois les labels, milestones et 17 issues du backlog prioritaire.

## 1. Pré-requis

- GitHub CLI (`gh`) installé et authentifié (`gh auth login`).
- Accès en écriture au dépôt GitHub cible.
- Node.js ≥ 18 pour exécuter les scripts.
- Variables d'environnement définies pour les assignations :
  - `DEFAULT_ASSIGNEE`
  - `ASSIGNEE_SECURITY`
  - `ASSIGNEE_OBSERVABILITY`
  - `ASSIGNEE_CI`
  - `ASSIGNEE_ACCESSIBILITY`
  - `ASSIGNEE_PRODUCT`
  - `ASSIGNEE_FRONTEND`

> Astuce : définissez `DEFAULT_ASSIGNEE` sur le PM du projet afin de garantir au moins un responsable par issue. Les autres variables peuvent pointer vers les leads techniques (ex: `export ASSIGNEE_CI=devops-lead`).

## 2. Lancer la création automatique

Depuis la racine du dépôt :

```bash
# 1. Vérifier les dépendances Node si nécessaire
npm install

# 2. Exporter les variables d'environnement (exemple)
export DEFAULT_ASSIGNEE=pm-lead
export ASSIGNEE_SECURITY=security-lead
export ASSIGNEE_OBSERVABILITY=monitoring-lead
export ASSIGNEE_CI=devops-lead
export ASSIGNEE_ACCESSIBILITY=frontend-a11y
export ASSIGNEE_PRODUCT=product-owner
export ASSIGNEE_FRONTEND=frontend-lead

# 3. Exécuter le script
node scripts/github/setup-backlog.mjs
```

Le script effectue les actions suivantes :

1. Création/actualisation des 12 labels (`P0`, `P1`, `P2`, `frontend`, `db`, `ci`, `seo`, `product`, `security`, `observability`, `pm`, `docs`).
2. Création des 4 milestones (`MVP Items`, `ECOS 8’`, `Karaoké`, `Infra`).
3. Ouverture des 17 issues configurées avec labels, milestone et assignations (au moins 80 % si les variables sont définies).

Un résumé du taux d'assignation est affiché à la fin. Si le ratio < 80 %, le script signale les variables manquantes.

## 3. Vérifications rapides

- **Labels** : `gh label list` doit afficher les 12 labels avec couleurs & description.
- **Milestones** : `gh milestone list` doit contenir les 4 jalons.
- **Issues** : `gh issue list --state open --limit 30` doit lister les 17 issues avec la colonne Milestone remplie.

## 4. Mettre en place le board projet

1. Créez un projet GitHub (Projects → New project → Board).
2. Ajoutez la vue « Backlog Priorités » filtrée sur `repo:med-mng`.
3. Configurez les colonnes ou swimlanes par milestone (`Group by → Milestone`).
4. Ajoutez un tri secondaire par label de priorité (`Filter → label:P0`, `label:P1`, etc.).
5. Enregistrez un aperçu « 🔥 Urgent (P0) » filtré sur `label:P0` + `sort:created-asc`.

> L'objectif d'acceptation demande un board lisible par priorité et milestone : vérifiez que les colonnes affichent `Infra`, `MVP Items`, `ECOS 8’`, `Karaoké`, puis utilisez les filtres de labels pour P0/P1/P2.

## 5. Mise à jour ultérieure

- Ajoutez/modifiez des issues dans `project-management/backlog-config.json` puis relancez le script. Les issues déjà existantes (même titre) sont ignorées.
- Pour régénérer les labels/milestones sans créer d'issues, commentez temporairement la section `issues` dans le JSON.
- Pensez à mettre à jour les assignations en ajustant les variables d'environnement.

## 6. Checklist finale

- [ ] Labels présents avec les couleurs attendues.
- [ ] Milestones visibles et assignés aux issues.
- [ ] ≥ 80 % des issues possèdent un assignee.
- [ ] Projet GitHub configuré avec vue par priorité/milestone.

Une fois ces étapes validées, le backlog MMG-PM-01 est prêt à être suivi depuis GitHub.
