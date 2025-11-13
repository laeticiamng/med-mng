# 🔍 Configuration SonarQube

## 📦 Introduction

SonarQube analyse automatiquement la qualité du code, détecte les bugs, les vulnérabilités de sécurité et la dette technique.

## 🚀 Setup SonarCloud (Recommandé)

### Étape 1: Créer un Compte

1. Aller sur [SonarCloud.io](https://sonarcloud.io)
2. Se connecter avec GitHub
3. Autoriser l'accès au repository

### Étape 2: Créer un Projet

1. Cliquer sur "Analyze new project"
2. Sélectionner votre repository `medmng-platform`
3. Choisir "GitHub Actions" comme CI
4. Copier le token généré

### Étape 3: Configurer GitHub Secrets

Dans GitHub Settings → Secrets → Actions, ajouter :

```bash
SONAR_TOKEN=your-sonarcloud-token
SONAR_HOST_URL=https://sonarcloud.io
```

### Étape 4: Premier Scan

```bash
# Push vers GitHub
git push origin main

# Le workflow .github/workflows/sonarqube.yml s'exécute automatiquement
```

## ⚙️ Configuration

### Fichier `sonar-project.properties`

Le projet est configuré avec :

```properties
# Identification
sonar.projectKey=medmng-platform
sonar.projectName=MedMng Platform
sonar.projectVersion=1.0

# Sources
sonar.sources=src
sonar.tests=src/tests,test

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,...

# Coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### Personnaliser la Configuration

Modifiez `sonar-project.properties` pour :

```properties
# Changer le project key
sonar.projectKey=your-project-key

# Ajouter des exclusions
sonar.exclusions=\
  **/generated/**,\
  **/legacy/**

# Configurer les seuils
sonar.coverage.exclusions=**/*.stories.tsx
```

## 📊 Métriques Analysées

### Quality Gate (Porte de Qualité)

Par défaut, SonarCloud exige :

| Condition | Seuil | Description |
|-----------|-------|-------------|
| **Coverage** | ≥ 80% | Couverture de tests |
| **Duplications** | ≤ 3% | Code dupliqué |
| **Maintainability Rating** | ≥ A | Dette technique |
| **Reliability Rating** | ≥ A | Bugs |
| **Security Rating** | ≥ A | Vulnérabilités |
| **Security Hotspots** | Reviewed | Points sensibles |

### Types d'Issues

#### 🐛 Bugs
- Code qui ne fonctionne pas correctement
- Erreurs potentielles à l'exécution
- **Priorité**: CRITICAL → MAJOR → MINOR

#### 🔒 Vulnerabilities
- Failles de sécurité
- Exposition de données sensibles
- Injection SQL/XSS
- **Priorité**: BLOCKER → CRITICAL → MAJOR

#### 💡 Code Smells
- Mauvaises pratiques
- Code difficile à maintenir
- Complexité excessive
- **Impact**: HIGH → MEDIUM → LOW

#### 🔥 Security Hotspots
- Code sensible nécessitant review
- Cryptographie
- Gestion des sessions
- Validation des entrées

### Ratings

- **A** : Excellent (0-5% dette)
- **B** : Bon (6-10% dette)
- **C** : Moyen (11-20% dette)
- **D** : Faible (21-50% dette)
- **E** : Mauvais (>50% dette)

## 🔍 Interpréter les Résultats

### Dashboard SonarCloud

Accéder au dashboard : `https://sonarcloud.io/dashboard?id=medmng-platform`

#### Vue d'ensemble

```
Reliability      ████████░░  80%  (16 bugs)
Security         █████████░  90%  (2 vulns)
Maintainability  ██████████  100% (450 code smells)
Coverage         ████████░░  85%
Duplications     ████████░░  2.3%
```

#### Bugs Critiques

1. **Null pointer dereference**
   - Fichier: `src/hooks/useTemplate.ts:45`
   - Solution: Ajouter null check

2. **Unhandled promise rejection**
   - Fichier: `src/api/templates.ts:120`
   - Solution: Ajouter try/catch

### Comment Fixer

```typescript
// ❌ Avant (Bug)
const user = await getUser();
console.log(user.name); // Potential null pointer

// ✅ Après
const user = await getUser();
if (user) {
  console.log(user.name);
}
```

## 🤖 GitHub Actions Integration

### Workflow Automatique

Le workflow `.github/workflows/sonarqube.yml` :

1. **Checkout code**
2. **Install dependencies**
3. **Run tests with coverage**
4. **Run ESLint**
5. **SonarQube scan**
6. **Quality Gate check**
7. **Comment on PR**

### Commentaire Automatique sur PR

```markdown
## 🔍 SonarQube Analysis Results

✅ **Quality Gate: PASSED**

[View detailed report on SonarQube](...)

### Metrics
- Code Coverage: 85%
- Code Smells: 12
- Bugs: 0
- Security Hotspots: 1
- Duplications: 2.3%
```

## 🎯 Améliorer les Scores

### Coverage < 80%

```bash
# Identifier les fichiers non couverts
npm run test -- --coverage

# Ajouter des tests
# src/components/Button.test.tsx
```

### Code Smells Élevés

```typescript
// ❌ Éviter
function doEverything(a, b, c, d, e, f, g) {
  // 500 lines of code
}

// ✅ Préférer
function doOneThing(param) {
  // 20 lines focused code
}
```

### Duplications > 3%

```typescript
// ❌ Code dupliqué
const userCard1 = <div>{user.name}</div>;
const userCard2 = <div>{user.name}</div>;

// ✅ Composant réutilisable
const UserCard = ({ user }) => <div>{user.name}</div>;
```

### Complexité Cyclomatique

```typescript
// ❌ Complexité: 15
function validate(data) {
  if (data.a && data.b || data.c) {
    if (data.d && !data.e) {
      // ... 20 more conditions
    }
  }
}

// ✅ Complexité: 3
function validate(data) {
  return isValidA(data) && isValidB(data);
}
```

## 📈 Monitoring Continu

### Trends

SonarCloud track les tendances :

```
Coverage:  80% → 82% → 85% ✅ Amélioration
Bugs:      15  → 10  → 5   ✅ Réduction
Debt:      2d  → 1d  → 8h  ✅ Diminution
```

### New Code

Focus sur le nouveau code :

- **Coverage nouveau code**: ≥ 80%
- **0 bugs** dans nouveau code
- **0 vulnérabilités** dans nouveau code
- **≤ 5% duplications** dans nouveau code

## 🔧 Customiser Quality Gate

### Créer un Quality Gate Personnalisé

1. SonarCloud → Quality Gates → Create
2. Définir les conditions :

```
Coverage on New Code ≥ 85%
Maintainability Rating = A
Security Rating = A
Bugs = 0
```

3. Assigner au projet

## 📚 Ressources

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Quality Gate Documentation](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
- [Metric Definitions](https://docs.sonarqube.org/latest/user-guide/metric-definitions/)
- [Clean Code](https://www.sonarsource.com/resources/white-papers/clean-code/)

## 🆘 Troubleshooting

### Scan Échoue

```bash
# Vérifier les logs
cat .scannerwork/report-task.txt

# Vérifier le token
echo $SONAR_TOKEN

# Tester localement
npm run test -- --coverage
```

### Quality Gate Échoue

1. Identifier les issues bloquantes
2. Fixer les issues critiques d'abord
3. Ignorer les faux positifs si nécessaire
4. Re-run le scan

### Token Expiré

1. SonarCloud → My Account → Security
2. Générer nouveau token
3. Mettre à jour GitHub Secret

## ✅ Checklist Pré-Merge

- [ ] Quality Gate: PASSED
- [ ] Coverage ≥ 80%
- [ ] 0 bugs critiques
- [ ] 0 vulnérabilités
- [ ] Rating Maintainability ≥ A
- [ ] Rating Security ≥ A
- [ ] Duplications ≤ 3%
- [ ] Code Smells reviewed

---

**🎯 Objectif : Code de qualité, maintenable et sécurisé**
