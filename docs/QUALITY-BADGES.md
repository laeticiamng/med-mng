# 📊 Badges de Qualité - Guide Complet

## 🎯 Badges Configurés

### Tests & CI/CD

```markdown
[![Build Status](https://github.com/username/medmng-platform/workflows/Tests%20CI/badge.svg)](https://github.com/username/medmng-platform/actions/workflows/tests.yml)
```

### Performance Lighthouse

```markdown
[![Lighthouse Performance](https://img.shields.io/badge/lighthouse-90%2B-success)](https://github.com/username/medmng-platform/actions/workflows/lighthouse.yml)
```

### SonarQube Quality Gate

```markdown
[![SonarQube Quality Gate](https://img.shields.io/sonar/quality_gate/medmng-platform?server=https%3A%2F%2Fsonarcloud.io)](https://sonarcloud.io/dashboard?id=medmng-platform)
```

### Code Coverage

```markdown
[![Coverage](https://img.shields.io/codecov/c/github/username/medmng-platform)](https://codecov.io/gh/username/medmng-platform)
```

### Visual Tests (Chromatic)

```markdown
[![Visual Tests](https://img.shields.io/badge/chromatic-passing-brightgreen)](https://www.chromatic.com/)
```

### Security Rating

```markdown
[![Security Rating](https://img.shields.io/sonar/security_rating/medmng-platform?server=https%3A%2F%2Fsonarcloud.io)](https://sonarcloud.io/dashboard?id=medmng-platform)
```

### Maintainability

```markdown
[![Maintainability](https://img.shields.io/sonar/maintainability_rating/medmng-platform?server=https%3A%2F%2Fsonarcloud.io)](https://sonarcloud.io/dashboard?id=medmng-platform)
```

### Bugs

```markdown
[![Bugs](https://img.shields.io/sonar/bugs/medmng-platform?server=https%3A%2F%2Fsonarcloud.io)](https://sonarcloud.io/dashboard?id=medmng-platform)
```

### Code Smells

```markdown
[![Code Smells](https://img.shields.io/sonar/code_smells/medmng-platform?server=https%3A%2F%2Fsonarcloud.io)](https://sonarcloud.io/dashboard?id=medmng-platform)
```

### Duplications

```markdown
[![Duplicated Lines](https://img.shields.io/sonar/duplicated_lines_density/medmng-platform?server=https%3A%2F%2Fsonarcloud.io)](https://sonarcloud.io/dashboard?id=medmng-platform)
```

### Storybook

```markdown
[![Storybook](https://raw.githubusercontent.com/storybookjs/brand/master/badge/badge-storybook.svg)](https://your-storybook-url.chromatic.com)
```

## 🔧 Configuration des Badges

### 1. GitHub Actions Badge

Automatique une fois le workflow configuré.

Format :
```
https://github.com/OWNER/REPO/workflows/WORKFLOW_NAME/badge.svg
```

### 2. Shields.io Badges

#### SonarQube

```
https://img.shields.io/sonar/METRIC/PROJECT_KEY?server=SERVER_URL
```

**Métriques disponibles :**
- `quality_gate` : Quality Gate status
- `coverage` : Code coverage %
- `bugs` : Number of bugs
- `vulnerabilities` : Security vulnerabilities
- `code_smells` : Code smells count
- `security_rating` : Security rating (A-E)
- `maintainability_rating` : Maintainability (A-E)
- `reliability_rating` : Reliability (A-E)
- `duplicated_lines_density` : Duplication %

#### Codecov

```
https://img.shields.io/codecov/c/github/OWNER/REPO
```

Options :
- `/branch/BRANCH_NAME` : Badge pour une branche
- `?token=TOKEN` : Badge privé

### 3. Badges Personnalisés

#### Badge Statique

```markdown
[![Custom](https://img.shields.io/badge/Label-Value-Color)]()
```

**Couleurs disponibles :**
- `brightgreen` : Vert clair
- `green` : Vert
- `yellowgreen` : Jaune-vert
- `yellow` : Jaune
- `orange` : Orange
- `red` : Rouge
- `blue` : Bleu
- `lightgrey` : Gris clair

#### Badge Dynamique

```markdown
[![Dynamic](https://img.shields.io/badge/dynamic/json?url=URL&query=QUERY&label=LABEL&color=COLOR)]()
```

## 📝 Personnalisation

### Modifier le Projet

Remplacer `medmng-platform` par votre project key :

```markdown
[![Quality Gate](https://img.shields.io/sonar/quality_gate/YOUR_PROJECT_KEY?server=https%3A%2F%2Fsonarcloud.io)]()
```

### Modifier l'Owner/Repo

```markdown
[![Badge](URL/OWNER/REPO/PATH)](LINK)
```

### Modifier le Style

Ajouter `?style=STYLE` :

```markdown
?style=flat
?style=flat-square
?style=for-the-badge
?style=plastic
?style=social
```

Exemple :
```markdown
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=for-the-badge)]()
```

## 🎨 Badges Additionnels

### Technologies

```markdown
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)]()
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)]()
```

### License

```markdown
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
```

### Version

```markdown
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
```

### Node Version

```markdown
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)]()
```

## 🔄 Mise à Jour Automatique

Les badges se mettent à jour automatiquement quand :

- ✅ **GitHub Actions** : À chaque run
- ✅ **SonarQube** : À chaque scan
- ✅ **Codecov** : À chaque upload coverage
- ✅ **Chromatic** : À chaque build

## 📊 Dashboard HTML

Créer un dashboard HTML avec tous les badges :

```html
<!DOCTYPE html>
<html>
<head>
  <title>MedMng Platform - Quality Dashboard</title>
</head>
<body>
  <h1>Quality Metrics Dashboard</h1>
  
  <h2>Build & Tests</h2>
  <img src="https://github.com/.../workflows/Tests%20CI/badge.svg" />
  
  <h2>Code Quality</h2>
  <img src="https://img.shields.io/sonar/quality_gate/..." />
  
  <h2>Security</h2>
  <img src="https://img.shields.io/sonar/security_rating/..." />
</body>
</html>
```

## 🔗 Ressources

- [Shields.io](https://shields.io/) : Générateur de badges
- [Simple Icons](https://simpleicons.org/) : Logos pour badges
- [SonarQube Badges](https://docs.sonarqube.org/latest/user-guide/project-page/)
- [GitHub Badges](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge)

## ✅ Checklist Setup

- [ ] Project key SonarQube configuré
- [ ] GitHub repo owner/name mis à jour
- [ ] Codecov token configuré (si privé)
- [ ] Chromatic project URL configuré
- [ ] Tous les badges testés et fonctionnels
- [ ] README.md mis à jour
- [ ] Badges affichés correctement

---

**🎯 Objectif : Transparence et qualité visible**
