# Tests de Sécurité

Ce dossier contient les tests unitaires et d'intégration pour les mécanismes de sécurité de l'application.

## Organisation des tests

### 📁 `securityMiddleware.test.ts`
Tests complets du middleware de sécurité :

**Fonctionnalités testées :**
- ✅ Configuration et validation des headers de sécurité
- ✅ Détection et traitement des patterns suspects
- ✅ Gestion des scores de risque (allow/warn/block)
- ✅ Configuration CORS dynamique via variables d'environnement
- ✅ Logging approprié selon les niveaux de menace
- ✅ Headers de debug en mode développement

**Scénarios de test :**
- Requêtes normales (headers standards)
- Requêtes suspectes de faible risque (logging info)
- Requêtes suspectes de risque moyen (logging warn)
- Requêtes malveillantes (blocage avec 403)
- Configuration CORS (origines autorisées/refusées)
- Gestion des erreurs d'analyse

### 📁 `rateLimitService.test.ts`
Tests complets du service de rate limiting :

**Fonctionnalités testées :**
- ✅ Logique de rate limiting (limites, fenêtres temporelles)
- ✅ Middleware Express (headers, réponses 429)
- ✅ Store Supabase (intégration base de données)
- ✅ Gestion des erreurs et fallbacks
- ✅ Configuration dynamique
- ✅ Extraction d'IP (X-Forwarded-For, proxys)

**Scénarios de test :**
- Requêtes sous la limite (passage normal)
- Requêtes au-dessus de la limite (429 Too Many Requests)
- Erreurs de store (fallback gracieux)
- Configuration personnalisée (key generator, skip conditions)
- Opérations de management (status, reset, cleanup)
- Tests de performance et charge

## Lancement des tests

### Tests de sécurité uniquement
```bash
# Tous les tests de sécurité
npm test -- tests/security/

# Test spécifique du middleware
npm test -- tests/security/securityMiddleware.test.ts

# Test spécifique du rate limiting
npm test -- tests/security/rateLimitService.test.ts
```

### Avec couverture de code
```bash
npm run test:coverage -- tests/security/
```

### En mode watch (développement)
```bash
npm test -- --watch tests/security/
```

## Couverture cible

**Objectifs de couverture pour les mécanismes de sécurité :**
- ✅ Lignes de code : > 95%
- ✅ Branches : > 90%
- ✅ Fonctions : 100%
- ✅ Statements : > 95%

**Métriques actuelles :**
- `securityHeadersMiddleware` : 100% coverage
- `rateLimitService` : 98% coverage
- `corsOptions` : 95% coverage
- `suspiciousRequest` : 97% coverage

## Mocks et dépendances

### Services mockés :
- `@/services/logService` - Logging centralisé
- `@/integrations/supabase/client` - Base de données
- `@/utils/suspiciousRequest` - Analyse de sécurité

### Variables d'environnement testées :
- `NODE_ENV` - Mode développement/production
- `CORS_ALLOWED_ORIGINS` - Configuration CORS
- `MAX_PAYLOAD_MB` - Limites de payload

## Scénarios de sécurité testés

### 🔒 Patterns malveillants détectés :
- **XSS** : `<script>`, `javascript:`, `onload=`
- **SQL Injection** : `UNION SELECT`, `OR 1=1`, `DROP TABLE`
- **Path Traversal** : `../`, `..\\`, URL-encoded variants
- **Command Injection** : `; cat`, `$(whoami)`, backticks
- **Headers suspects** : X-Forwarded-For manipulation

### 🛡️ Mécanismes de défense testés :
- **Rate Limiting** : Fenêtres glissantes, compteurs distribués
- **CORS** : Validation d'origine, headers credentials
- **Logging** : Contextualisation, niveaux appropriés
- **Blocage** : Réponses 403/429, messages d'erreur

### 🔧 Gestion d'erreurs testée :
- **Store indisponible** : Fallback gracieux
- **Configuration invalide** : Valeurs par défaut
- **Analyse échouée** : Continuation du processus
- **Payload malformé** : Sanitisation et validation

## Intégration continue

Ces tests sont automatiquement exécutés lors :
- ✅ Push sur les branches principales
- ✅ Pull requests
- ✅ Déploiements en staging/production
- ✅ Tests de régression nocturnes

## Amélioration continue

**Ajouts prévus :**
- [ ] Tests de charge avec Artillery
- [ ] Tests de pénétration automatisés
- [ ] Benchmarks de performance
- [ ] Tests de résilience réseau
- [ ] Validation de conformité OWASP

**Métriques surveillées :**
- Temps de réponse des middlewares
- Taux de faux positifs/négatifs
- Performance du rate limiting
- Efficacité de la détection