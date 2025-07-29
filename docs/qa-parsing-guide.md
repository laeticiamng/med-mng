# 📚 Guide QA - Tests des Parseurs Critiques

> **Point 2.3 du ticket global** : Documentation QA parsing

## 🎯 Vue d'ensemble

Ce guide détaille comment écrire, maintenir et exécuter les tests pour tous les parseurs critiques de MED-MNG. Chaque parseur a des responsabilités spécifiques et doit être testé de manière exhaustive.

## 📋 Parseurs Critiques Couverts

### 1. 🧬 EDN Item Parser (`src/parsers/ednItemParser.ts`)

**Responsabilité** : Transformation des items EDN v1/v2 vers format UI unifié

**Tests** : `test/parsers/ednItemParser.test.ts`

```typescript
// Exemple de test
test('✅ Parse correctement un item v2 complet', () => {
  const result = EDNItemParser.parseItemV2(validItemV2, 'test-id');
  expect(result.tableau_rang_a.lignes).toHaveLength(1);
  expect(result.paroles_musicales).toHaveLength(2);
});
```

**Cas critiques à tester** :
- ✅ Détection format v1 vs v2
- ✅ Parsing complet v2 avec toutes sections
- ✅ Rétrocompatibilité v1
- ✅ Gestion erreurs et données malformées
- ✅ Performance sur gros items (>100 compétences)
- ✅ Generation quiz et scène immersive

### 2. 🎵 Synchronized Lyrics Parser (`src/hooks/music/useSynchronizedLyrics.ts`)

**Responsabilité** : Parse et synchronise les paroles avec timestamps

**Tests** : `test/parsers/synchronizedLyrics.test.ts`

```typescript
// Exemple de test
test('✅ Parse correctement une chaîne avec timestamps [mm:ss]', () => {
  const { result } = renderHook(() => useSynchronizedLyrics(mockStringLyrics, 0));
  expect(result.current.lyrics[0]).toEqual({ timestamp: 0, text: 'Premier vers' });
});
```

**Cas critiques à tester** :
- ✅ Formats multiples (array, string, timestamps variés)
- ✅ Synchronisation temporelle précise
- ✅ Gestion caractères spéciaux et émojis
- ✅ Performance avec beaucoup de paroles (>1000 lignes)
- ✅ Transitions entre items EDN

### 3. 🔐 Security Credentials Scanner (`scripts/security-audit.ts`)

**Responsabilité** : Détection automatique de credentials dans le code

**Tests** : `test/security/credentialsScanner.test.ts`

```typescript
// Exemple de test
test('🚨 Détecte les fallbacks avec credentials', () => {
  const violations = auditor.scanContent(testContent, 'test.ts');
  expect(violations[0].pattern).toBe('Hardcoded Credential Fallback');
  expect(violations[0].severity).toBe('CRITICAL');
});
```

**Cas critiques à tester** :
- ✅ Détection fallbacks `|| "hardcoded"`
- ✅ API keys spécifiques (OpenAI, Stripe, AWS)
- ✅ Logs de credentials
- ✅ Faux positifs (commentaires, masquage)
- ✅ Performance sur gros fichiers

### 4. 📄 OIC Content Parser (`supabase/functions/extract-edn-objectifs/oic-parser.ts`)

**Responsabilité** : Parse le contenu MediaWiki des pages OIC

**Tests** : `test/oicParser.test.ts` (existant)

```typescript
// Exemple de test
test('parses a valid OIC page', () => {
  const result = parseOICContent(page);
  expect(result!.objectif_id).toBe('OIC-001-05-A-01');
  expect(result!.rubrique).toBe('Pharmacologie');
});
```

## 🚀 Comment Lancer les Tests

### Tests Individuels par Parseur

```bash
# Test du parser EDN
pnpm test test/parsers/ednItemParser.test.ts

# Test du parser de paroles
pnpm test test/parsers/synchronizedLyrics.test.ts

# Test du scanner sécurité
pnpm test test/security/credentialsScanner.test.ts

# Test du parser OIC
pnpm test test/oicParser.test.ts
```

### Tests Complets avec Couverture

```bash
# Tous les tests parseurs avec couverture
pnpm test:parsers --coverage

# Génération rapport détaillé
pnpm test:parsers --coverage --coverageReporters=html
```

### Tests de Performance

```bash
# Tests de performance uniquement
pnpm test --testNamePattern="performance|Performance" --verbose
```

## ✍️ Comment Écrire un Test pour un Parseur

### 1. 📋 Structure Standard

```typescript
describe('🔍 MonParser - Tests critiques', () => {
  
  describe('🎯 Cas standard', () => {
    test('✅ Parse correctement des données valides', () => {
      // Arrange - préparer données test
      const validInput = createValidTestData();
      
      // Act - exécuter le parsing
      const result = MonParser.parse(validInput);
      
      // Assert - vérifier résultats
      expect(result).toBeDefined();
      expect(result.field).toBe('expected_value');
    });
  });
  
  describe('🛡️ Cas d\'erreur', () => {
    test('❌ Gère gracieusement les données malformées', () => {
      const malformedInput = {};
      expect(() => MonParser.parse(malformedInput)).not.toThrow();
    });
  });
  
  describe('📊 Performance', () => {
    test('⚡ Parse rapidement un gros dataset', () => {
      const bigData = generateBigTestData(10000);
      const start = performance.now();
      const result = MonParser.parse(bigData);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Moins de 100ms
    });
  });
});
```

### 2. 🎭 Données de Test Réalistes

```typescript
// Créer des données qui reflètent la réalité
const realWorldTestData = {
  // Basé sur de vraies données MED-MNG
  medical_content: "Anamnèse et examen clinique",
  special_chars: "Caractères spéciaux: éàù, émojis 🎵",
  edge_cases: [null, undefined, "", {}, []]
};
```

### 3. 🔍 Tests d'Edge Cases Obligatoires

Chaque test de parseur DOIT couvrir :

- ✅ **Données nulles/vides** : `null`, `undefined`, `""`
- ✅ **Formats incorrects** : objets malformés, types incorrects
- ✅ **Caractères spéciaux** : accents, émojis, caractères unicode
- ✅ **Performance** : gros datasets, mesure du temps
- ✅ **Rétrocompatibilité** : anciens formats supportés
- ✅ **Cas métier spécifiques** : terminologie médicale, formats MED-MNG

## 🔧 Intégration CI/CD

Les tests sont automatiquement exécutés via GitHub Actions (`.github/workflows/tests-ci.yml`) :

### 🚫 Blocage Automatique

Le CI bloque automatiquement si :

- ❌ Un test de parseur critique échoue
- ❌ La couverture de code < 80%
- ❌ Un test de performance dépasse 100ms
- ❌ Le scanner de sécurité détecte des violations CRITICAL

### 📊 Rapports Générés

- **Couverture** : Rapport HTML détaillé
- **Performance** : Métriques de timing
- **Sécurité** : Rapport d'audit complet
- **Qualité** : Quality Gate avec status

## 📈 Métriques de Qualité

### Objectifs Minimums

| Métrique | Objectif | Status |
|----------|----------|---------|
| Couverture globale | ≥ 80% | ✅ |
| Couverture parseurs | ≥ 95% | ✅ |
| Performance parsing | < 100ms | ✅ |
| Tests edge cases | 100% | ✅ |
| Détection sécurité | 0 CRITICAL | ✅ |

### Surveillance Continue

```bash
# Vérifier la qualité avant commit
npm run test:quality-check

# Audit complet pré-release
npm run test:full-audit
```

## 🔄 Maintenance et Évolution

### Quand Ajouter de Nouveaux Tests

- ➕ **Nouveau parseur créé** → Créer suite complète
- 🐛 **Bug découvert** → Ajouter test de régression
- 🔄 **Format modifié** → Tester rétrocompatibilité
- ⚡ **Performance dégradée** → Ajouter benchmark

### Refactoring de Tests

```typescript
// ✅ Bon - tests indépendants et isolés
describe('Parser', () => {
  let parser;
  beforeEach(() => {
    parser = new MonParser();
  });
});

// ❌ Éviter - tests dépendants
describe('Parser', () => {
  const sharedState = {}; // Dangereux
});
```

## 🎯 Checklist Release

Avant chaque release, vérifier :

- [ ] 🧪 Tous les tests parseurs passent
- [ ] 📊 Couverture ≥ 80%
- [ ] ⚡ Performance < 100ms
- [ ] 🔐 Audit sécurité clean
- [ ] 📄 Documentation à jour
- [ ] 🔄 Tests de régression OK

## 📞 Support et Questions

- 📚 **Documentation** : `docs/` 
- 🐛 **Bugs** : Créer issue avec test de reproduction
- 💡 **Améliorations** : Proposer avec tests

---

**Point 2 du ticket global : TERMINÉ ✅**

**Prochaine étape** : Point 3 - QA Backend (Tests d'intégration APIs)