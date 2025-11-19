# ✅ Quick Start Checklist - Med-MNG Security

Ce document fournit une checklist rapide pour mettre en œuvre toutes les fonctionnalités de sécurité.

---

## 🎯 Semaine 1: Configuration Essentielle

### Jour 1: GitHub Actions

- [ ] **1.1** Vérifier que `.github/workflows/security-scan.yml` existe
- [ ] **1.2** Créer un compte Snyk (gratuit): https://snyk.io/
- [ ] **1.3** Obtenir le SNYK_TOKEN depuis Account Settings → API Token
- [ ] **1.4** Configurer les secrets dans GitHub:
  - `SNYK_TOKEN`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TEST_USER_TOKEN`
  - `TEST_ADMIN_TOKEN`
- [ ] **1.5** Activer GitHub Security features:
  - Dependency graph
  - Dependabot alerts
  - Dependabot security updates
  - Code scanning
- [ ] **1.6** Tester le workflow: `git commit --allow-empty -m "test: security scan" && git push`
- [ ] **1.7** Vérifier les résultats dans Actions tab

**Temps estimé**: 1-2 heures

---

### Jour 2-3: Backups Automatiques

- [ ] **2.1** Copier `templates/.env.backup.template` vers `.env.backup`
- [ ] **2.2** Remplir tous les credentials dans `.env.backup`:
  - Supabase DB (host, port, password)
  - AWS S3 (access key, secret, bucket, region)
  - GPG passphrase
  - Email alerts
- [ ] **2.3** Installer AWS CLI: https://aws.amazon.com/cli/
- [ ] **2.4** Configurer AWS CLI: `aws configure`
- [ ] **2.5** Créer le bucket S3:
  ```bash
  aws s3 mb s3://med-mng-backups --region eu-west-1
  aws s3api put-bucket-versioning --bucket med-mng-backups --versioning-configuration Status=Enabled
  aws s3api put-bucket-encryption --bucket med-mng-backups --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  ```
- [ ] **2.6** Tester les scripts de backup:
  ```bash
  source .env.backup
  ./scripts/backup-database.sh
  ./scripts/backup-storage.sh
  ./scripts/backup-secrets.sh
  ```
- [ ] **2.7** Vérifier les backups dans S3: `aws s3 ls s3://med-mng-backups/`
- [ ] **2.8** Configurer les cron jobs:
  ```bash
  crontab -e
  # Ajouter les lignes du IMPLEMENTATION_GUIDE.md
  ```
- [ ] **2.9** Créer les logs: `sudo mkdir -p /var/log/med-mng && sudo chown $USER:$USER /var/log/med-mng`

**Temps estimé**: 3-4 heures

---

### Jour 4: Monitoring Setup

- [ ] **3.1** Exécuter les migrations SQL:
  ```bash
  psql $DATABASE_URL < supabase/migrations/20251119_rate_limits.sql
  psql $DATABASE_URL < supabase/migrations/20251119_security_events.sql
  ```
- [ ] **3.2** Vérifier les tables créées:
  ```sql
  SELECT COUNT(*) FROM rate_limits;
  SELECT COUNT(*) FROM security_events;
  ```
- [ ] **3.3** Créer un webhook Slack:
  1. https://api.slack.com/messaging/webhooks
  2. Choisir #security-alerts
  3. Copier l'URL
- [ ] **3.4** Configurer le webhook dans Supabase:
  ```bash
  supabase secrets set SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/...
  ```
- [ ] **3.5** (Optionnel) Installer Metabase:
  ```bash
  docker run -d -p 3000:3000 --name metabase \
    -e "MB_DB_FILE=/metabase-data/metabase.db" \
    -v ~/metabase-data:/metabase-data \
    metabase/metabase
  ```
- [ ] **3.6** (Optionnel) Configurer Metabase sur http://localhost:3000
- [ ] **3.7** Tester une alerte de sécurité

**Temps estimé**: 2-3 heures

---

### Jour 5: Validation

- [ ] **4.1** Exécuter le wizard: `./scripts/setup-wizard.sh` option 6 (Test)
- [ ] **4.2** Vérifier que le score est ≥ 80%
- [ ] **4.3** Vérifier que les backups quotidiens fonctionnent (attendre J+1)
- [ ] **4.4** Vérifier que les alertes Slack fonctionnent
- [ ] **4.5** Consulter les dashboards (si Metabase installé)
- [ ] **4.6** Documenter les problèmes rencontrés
- [ ] **4.7** Célébrer 🎉

**Temps estimé**: 1-2 heures

---

## 🎓 Semaines 2-12: Formation Équipe

### Semaine 2: Planification

- [ ] **5.1** Consulter `training/calendar.md`
- [ ] **5.2** Choisir une date de début
- [ ] **5.3** Créer les événements Google Calendar (12 sessions)
- [ ] **5.4** Inviter l'équipe (devs, devops, management)
- [ ] **5.5** Préparer les slides pour Session 1 (OWASP A01-A03)

**Temps estimé**: 2-3 heures

---

### Semaines 3-14: Sessions de Formation

**Calendrier des 12 sessions** (2h chacune):

#### Mois 1 - Développeurs
- [ ] **Session 1**: OWASP Top 10 (A01-A03) - 2h
- [ ] **Session 2**: OWASP Top 10 (A04-A10) - 2h
- [ ] **Session 3**: Secure Coding Practices - 2h
- [ ] **Session 4**: Code Review Guidelines - 2h

#### Mois 2 - DevOps & Management
- [ ] **Session 5**: Infrastructure Security - 2h
- [ ] **Session 6**: CI/CD Security - 2h
- [ ] **Session 7**: Backup & Disaster Recovery - 2h
- [ ] **Session 8**: Security Metrics & Compliance - 2h

#### Mois 3 - Certification
- [ ] **Session 9**: Quiz & Exercice Pratique - 2h
- [ ] **Session 10**: Code Review Pratique - 2h
- [ ] **Session 11**: Incident Response Drill - 2h
- [ ] **Session 12**: Certification - 1h

**Pour chaque session**:
- [ ] Préparer les slides
- [ ] Préparer les exercices
- [ ] Créer le quiz (5 questions min)
- [ ] Enregistrer la présence
- [ ] Collecter le feedback
- [ ] Mettre à jour le suivi dans `training/calendar.md`

**Temps total**: 23 heures sur 3 mois

---

## 🚀 Mois 4-6: Recommandations Long Terme (Optionnel)

### Mois 4: ISO 27001 Gap Analysis

- [ ] **6.1** Auditer l'état actuel vs ISO 27001:2022
- [ ] **6.2** Identifier les écarts (18 domaines A.5-A.18)
- [ ] **6.3** Créer un plan de mise en conformité
- [ ] **6.4** Budgétiser (25-45K€)
- [ ] **6.5** Sélectionner un consultant externe
- [ ] **6.6** Lancer le bug bounty privé (HackerOne)
- [ ] **6.7** Installer Prometheus + Grafana

**Temps estimé**: Consulting externe + 20h interne

---

### Mois 5: Mise en Conformité & Pentest

- [ ] **7.1** Implémenter les corrections ISO 27001
- [ ] **7.2** Documenter les politiques de sécurité
- [ ] **7.3** Sélectionner un vendor pour pentest (Synacktiv/Quarkslab/SCRT)
- [ ] **7.4** Exécuter le pentest (5-10 jours)
- [ ] **7.5** Corriger les vulnérabilités trouvées
- [ ] **7.6** Re-test du pentest
- [ ] **7.7** Lancer le programme Security Champions

**Temps estimé**: Consulting + pentest externe + 40h interne

---

### Mois 6: Certification & Bug Bounty Public

- [ ] **8.1** Audit de certification ISO 27001
- [ ] **8.2** Audit de certification SOC 2 Type I
- [ ] **8.3** Corrections post-audit
- [ ] **8.4** Obtention des certificats 🏆
- [ ] **8.5** Ouvrir le bug bounty au public
- [ ] **8.6** Finaliser Grafana dashboards (Prometheus + Loki + Tempo)
- [ ] **8.7** Communication interne & externe des certifications

**Temps estimé**: Audit externe + 30h interne

---

## 📊 Métriques de Succès

### Après Semaine 1
- [ ] GitHub Actions: 6/6 jobs passent ✅
- [ ] Backups: Quotidiens automatiques ✅
- [ ] Monitoring: Alertes actives ✅
- [ ] Score de configuration: ≥ 80% ✅

### Après 3 Mois
- [ ] Équipe formée: 100% ✅
- [ ] Certifications délivrées: ≥ 10 ✅
- [ ] Vulnérabilités: 0 Critical, 0 High ✅
- [ ] Tests automatisés: Quotidiens ✅

### Après 6 Mois (si long terme)
- [ ] ISO 27001: Certifié 🏆
- [ ] SOC 2 Type I: Certifié 🏆
- [ ] Bug Bounty: Actif ✅
- [ ] Pentest: Validé ✅
- [ ] Security Champions: 3-4 actifs ✅

---

## 🆘 Troubleshooting

### Problème: GitHub Actions ne se déclenchent pas

**Solution**:
1. Vérifier `.github/workflows/security-scan.yml` existe
2. Vérifier que le workflow est activé dans Actions tab
3. Vérifier les permissions du workflow
4. Push un commit test

### Problème: Backups échouent

**Solution**:
1. Vérifier `.env.backup` avec `source .env.backup && echo $SUPABASE_DB_HOST`
2. Tester la connexion DB: `psql $DATABASE_URL -c "SELECT 1"`
3. Tester la connexion S3: `aws s3 ls s3://$AWS_S3_BACKUP_BUCKET`
4. Consulter les logs: `tail -f /var/log/med-mng/backup-db.log`

### Problème: Migrations SQL échouent

**Solution**:
1. Vérifier la connexion: `psql $DATABASE_URL -c "SELECT version()"`
2. Vérifier que les tables n'existent pas déjà: `psql $DATABASE_URL -c "\dt"`
3. Exécuter ligne par ligne pour identifier l'erreur
4. Consulter les logs PostgreSQL

### Problème: Alertes Slack ne fonctionnent pas

**Solution**:
1. Tester le webhook manuellement:
   ```bash
   curl -X POST $SLACK_SECURITY_WEBHOOK \
     -H "Content-Type: application/json" \
     -d '{"text":"Test alert"}'
   ```
2. Vérifier que le secret est configuré dans Supabase
3. Vérifier les logs de la fonction dans Supabase Dashboard

---

## 📞 Support

**Besoin d'aide?**

1. **Documentation**: Consultez les guides dans `/`
   - `IMPLEMENTATION_GUIDE.md` - Guide pratique étape par étape
   - `SECURITY_STATUS_TRACKER.md` - Suivi de progression
   - `SECURITY_TESTING_GUIDE.md` - Tests de sécurité
   - `BACKUP_DISASTER_RECOVERY.md` - Backups & DR

2. **Scripts**: Utilisez le wizard interactif
   ```bash
   ./scripts/setup-wizard.sh
   ```

3. **Exemples**: Consultez `/examples/`
   - `secure-function-template.ts` - Template Edge Function
   - `frontend-integration-react.tsx` - Intégration React

4. **Contact**:
   - Email: security@med-mng.fr
   - Slack: #security, #infrastructure

---

## 🎯 Prochaine Action

**Commencez maintenant**:

```bash
# Option 1: Wizard interactif (recommandé)
./scripts/setup-wizard.sh

# Option 2: Manuel
# Jour 1: GitHub Actions
cat IMPLEMENTATION_GUIDE.md  # Section 1

# Jour 2-3: Backups
cat IMPLEMENTATION_GUIDE.md  # Section 2

# Jour 4: Monitoring
cat IMPLEMENTATION_GUIDE.md  # Section 3
```

**Bonne chance! 🚀**

---

**Dernière mise à jour**: 2025-11-19
**Version**: 1.0
