# 🔒 Guide de Sécurité - Best Practices MED-MNG

## ✅ Document de Référence Sécurité

Ce guide définit les meilleures pratiques de sécurité pour la plateforme MED-MNG, couvrant la gestion des credentials, les procédures post-incident, et l'onboarding sécurisé des développeurs.

---

## 📋 Table des Matières

1. [Gestion des Credentials](#1-gestion-des-credentials)
2. [Rotation des Clés API](#2-rotation-des-clés-api)
3. [Procédures Post-Leak](#3-procédures-post-leak)
4. [Onboarding/Offboarding Développeurs](#4-onboardingoffboarding-développeurs)
5. [Monitoring et Alertes](#5-monitoring-et-alertes)
6. [Checklist Sécurité](#6-checklist-sécurité)

---

## 1. Gestion des Credentials

### 🔐 Stockage Sécurisé

**❌ À NE JAMAIS FAIRE:**
```javascript
// DANGEREUX - Credentials hardcodés
const API_KEY = "sk-1234567890abcdef";
const DATABASE_URL = "postgresql://user:password@host/db";
```

**✅ BONNE PRATIQUE:**
```javascript
// Utilisation des variables d'environnement Supabase
const apiKey = Deno.env.get('OPENAI_API_KEY');
const dbUrl = Deno.env.get('DATABASE_URL');
```

### 📦 Organisation des Secrets

```bash
# Structure recommandée dans Supabase Secrets
OPENAI_API_KEY=sk-...           # API externe
SUNO_API_KEY=...               # Service musical
CAS_USERNAME=...               # Authentification CAS
CAS_PASSWORD=...               # Mot de passe CAS
STRIPE_SECRET_KEY=sk_...       # Paiements
RESEND_API_KEY=re_...          # Emails
```

### 🛡️ Validation Automatique

```javascript
// Script de validation automatique
const requiredSecrets = [
  'OPENAI_API_KEY',
  'SUNO_API_KEY', 
  'CAS_USERNAME',
  'CAS_PASSWORD'
];

function validateSecrets() {
  const missing = requiredSecrets.filter(secret => !Deno.env.get(secret));
  if (missing.length > 0) {
    throw new Error(`Secrets manquants: ${missing.join(', ')}`);
  }
}
```

---

## 2. Rotation des Clés API

### 📅 Calendrier de Rotation

| Type de Clé | Fréquence | Responsable | Procédure |
|--------------|-----------|-------------|-----------|
| OpenAI API | 3 mois | DevOps | Rotation automatique |
| Suno API | 6 mois | Admin | Rotation manuelle |
| Stripe | 6 mois | Finance + DevOps | Coordination |
| Supabase | 12 mois | Admin Système | Planification |

### 🔄 Procédure de Rotation

1. **Préparation (J-7)**
   ```bash
   # Créer nouvelle clé dans le service
   # Tester en environnement staging
   npm run test:api-rotation
   ```

2. **Basculement (J-0)**
   ```bash
   # Mise à jour dans Supabase Secrets
   # Déploiement coordonné
   # Vérification fonctionnelle
   ```

3. **Nettoyage (J+1)**
   ```bash
   # Révocation ancienne clé
   # Validation logs
   # Documentation mise à jour
   ```

---

## 3. Procédures Post-Leak

### 🚨 Réaction Immédiate (< 1h)

1. **Isolement**
   ```bash
   # Révoquer immédiatement la clé compromise
   # Bloquer l'accès depuis les IPs suspectes
   # Alerter l'équipe via Slack/Discord
   ```

2. **Évaluation**
   ```bash
   # Identifier l'étendue de la compromission
   # Vérifier les logs d'accès
   # Cartographier les services impactés
   ```

3. **Mitigation**
   ```bash
   # Générer nouvelles clés
   # Mettre à jour les secrets
   # Redéployer les services critiques
   ```

### 📋 Checklist Post-Incident

- [ ] Clé compromise révoquée
- [ ] Nouvelles clés générées et déployées
- [ ] Logs analysés (accès non autorisés)
- [ ] Services fonctionnels validés
- [ ] Équipe informée
- [ ] Documentation incident rédigée
- [ ] Mesures préventives identifiées

### 📊 Rapport d'Incident

```markdown
# Incident Sécurité - [DATE]

## Résumé
- **Type**: Fuite de credential
- **Gravité**: Critique/Élevée/Moyenne/Faible
- **Durée**: [début] - [fin]
- **Services impactés**: [liste]

## Chronologie
- [heure] Détection initiale
- [heure] Isolation
- [heure] Mitigation
- [heure] Résolution

## Actions correctives
1. [action 1]
2. [action 2]

## Leçons apprises
- [amélioration 1]
- [amélioration 2]
```

---

## 4. Onboarding/Offboarding Développeurs

### 👨‍💻 Onboarding Sécurisé

#### Jour 1 - Accès de Base
```bash
# Création compte Supabase (lecture seule)
# Accès repository (branch feature uniquement)
# Formation sécurité obligatoire
```

#### Semaine 1 - Accès Étendu
```bash
# Accès développement
# Clés API dev/staging
# Configuration environnement local
```

#### Mois 1 - Accès Production (si besoin)
```bash
# Validation par manager
# Formation sécurité avancée
# Accès production supervisé
```

### 👋 Offboarding Sécurisé

#### Immédiat (J-0)
```bash
# Révocation accès Supabase
# Suppression clés SSH/GPG
# Désactivation comptes services
```

#### 48h (J+2)
```bash
# Audit accès résiduels
# Rotation clés partagées si nécessaire
# Archive documentation personnelle
```

#### 1 semaine (J+7)
```bash
# Validation complète révocation
# Nettoyage final
# Documentation transfert connaissances
```

---

## 5. Monitoring et Alertes

### 📊 Métriques de Sécurité

```javascript
// Alertes configurées dans Supabase
const securityAlerts = {
  // Connexions suspectes
  suspicious_logins: {
    threshold: 5, // tentatives en 10min
    action: 'block_ip'
  },
  
  // Utilisation API anormale
  api_abuse: {
    threshold: 1000, // requêtes/min
    action: 'rate_limit'
  },
  
  // Erreurs d'authentification
  auth_failures: {
    threshold: 10, // échecs/min
    action: 'alert_admin'
  }
};
```

### 🔔 Canaux d'Alerte

1. **Critique**: Slack + Email + SMS
2. **Élevée**: Slack + Email
3. **Moyenne**: Email
4. **Info**: Dashboard uniquement

### 📈 Dashboard Sécurité

- Tentatives d'authentification
- Utilisation des APIs
- Géolocalisation des connexions
- Patterns d'usage anormaux

---

## 6. Checklist Sécurité

### 🔍 Audit Mensuel

- [ ] Rotation clés planifiée
- [ ] Logs de sécurité analysés
- [ ] Accès utilisateurs validés
- [ ] Vulnérabilités dependencies scannées
- [ ] Backup sécurité testés

### 🚀 Pre-Deployment

- [ ] Scan secrets automatique passé
- [ ] Tests sécurité E2E validés
- [ ] Credentials production à jour
- [ ] Monitoring alertes configuré
- [ ] Rollback plan documenté

### 📋 Incident Response

- [ ] Équipe incident formée
- [ ] Procédures documentées
- [ ] Contacts urgence à jour
- [ ] Outils réponse incident testés
- [ ] Communication crise préparée

---

## 📞 Contacts Urgence

```bash
# En cas d'incident de sécurité critique
Équipe DevOps: devops@med-mng.fr
Admin Sécurité: security@med-mng.fr
Management: admin@med-mng.fr

# Slack Channels
#security-alerts (alertes automatiques)
#incident-response (coordination)
#dev-team (communication équipe)
```

---

## 📚 Ressources Complémentaires

- [OWASP Security Guidelines](https://owasp.org/)
- [Supabase Security Documentation](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**📅 Dernière mise à jour**: 2025-01-26  
**🔄 Prochaine révision**: 2025-04-26  
**📝 Responsable**: Équipe DevOps MED-MNG