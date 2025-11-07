# 📧 Envoi Automatique des Rapports d'Accessibilité

## 🎯 Vue d'ensemble

Le système d'envoi automatique permet d'envoyer les rapports d'accessibilité par email à votre équipe selon une récurrence configurable (hebdomadaire ou mensuelle).

---

## ⚙️ Configuration Initiale

### 1. Prérequis

Avant de commencer, vous devez avoir :
- ✅ Un compte Resend pour l'envoi d'emails
- ✅ Un domaine validé sur Resend
- ✅ Une clé API Resend
- ✅ Un token GitHub avec permissions `repo` et `read:org`

### 2. Créer un compte Resend

1. Allez sur https://resend.com
2. Créez un compte gratuit (100 emails/jour inclus)
3. Validez votre domaine : https://resend.com/domains
   - Ajoutez les enregistrements DNS fournis
   - Attendez la validation (quelques minutes à quelques heures)

### 3. Obtenir la clé API Resend

1. Allez sur https://resend.com/api-keys
2. Cliquez sur "Create API Key"
3. Donnez-lui un nom : "MED-MNG Accessibility Reports"
4. Copiez la clé (vous ne pourrez plus la voir après)

### 4. Configurer dans l'application

1. Accédez au dashboard : `/accessibility-dashboard`
2. La section "Envoi Automatique des Rapports" apparaît en premier
3. Complétez les informations :
   - **Token GitHub** : Votre token personnel avec permissions requises
   - **Fréquence** : Hebdomadaire ou Mensuel
   - **Jour d'envoi** : 1-31 pour mensuel, 1-7 pour hebdomadaire (1=Lundi)
   - **Heure** : 0-23 (format 24h)
   - **Destinataires** : Ajoutez les adresses email une par une

4. Cliquez sur "Enregistrer"

---

## 📨 Ajouter des Destinataires

### Ajouter un destinataire

1. Dans le champ "Destinataires", saisissez une adresse email
2. Cliquez sur le bouton "+" ou appuyez sur Entrée
3. L'email est ajouté à la liste

### Supprimer un destinataire

1. Cliquez sur l'icône de corbeille à côté de l'email
2. L'email est immédiatement retiré de la liste

### Validation des emails

- ✅ Format email valide requis (`email@exemple.com`)
- ✅ Pas de doublons autorisés
- ✅ Maximum recommandé : 20 destinataires par envoi

---

## 🧪 Tester l'Envoi

Avant d'activer l'envoi automatique, testez la configuration :

1. Configurez au moins un destinataire
2. Cliquez sur le bouton **"Test"**
3. Un rapport est généré et envoyé immédiatement
4. Vérifiez votre boîte de réception
5. Consultez l'historique des envois pour confirmation

**Note** : L'envoi test utilise les données actuelles de GitHub. Assurez-vous d'avoir actualisé les métriques récemment.

---

## 🔄 Activer l'Envoi Automatique

Une fois les tests réussis :

1. Activez le switch **"Activer l'envoi automatique"**
2. Cliquez sur "Enregistrer"
3. Les rapports seront envoyés automatiquement selon la configuration

### Fréquences disponibles

#### Hebdomadaire
- Envoi chaque semaine
- Jour : 1 (Lundi) à 7 (Dimanche)
- Exemple : Tous les lundis à 9h00

#### Mensuel
- Envoi chaque mois
- Jour : 1 à 31
- Exemple : Le 1er de chaque mois à 9h00

**Important** : Pour les mois avec moins de 31 jours, l'envoi se fera le dernier jour du mois si le jour configuré n'existe pas.

---

## 📊 Contenu du Rapport Email

Le rapport envoyé par email contient :

### 1. Synthèse Globale
- **Taux de conformité** avec indicateur visuel coloré
  - 🟢 Vert : ≥ 80% (Excellent)
  - 🟡 Jaune : 60-79% (Acceptable)
  - 🔴 Rouge : < 60% (À améliorer)
- Nombre de PRs conformes
- Nombre de PRs bloquées

### 2. Top Violations Détectées
- 5 types de violations les plus fréquents
- Nombre d'occurrences pour chaque type
- Niveau de sévérité (Sérieux / Modéré)
- Coloré selon la gravité

### 3. Top Contributeurs
- 5 développeurs avec les meilleurs taux de conformité
- Taux de conformité individuel
- Nombre de PRs par développeur
- Badge 🏆 pour les meilleurs contributeurs (≥90%)

### 4. Recommandations Automatiques
Générées dynamiquement selon les métriques :
- Formation WCAG/RGAA si conformité < 80%
- Revue urgente si > 5 PRs bloquées
- Focus sur les violations fréquentes
- Félicitations si tout va bien

### 5. Lien vers le Dashboard
Accès direct au dashboard complet pour plus de détails

---

## 📈 Historique des Envois

L'historique affiche les 10 derniers envois avec :
- ✅ **Statut** : Succès / Échec
- 📅 **Date et heure** d'envoi
- 👥 **Nombre de destinataires**
- ❌ **Message d'erreur** (si échec)

Utilisez l'historique pour :
- Vérifier que les envois se font correctement
- Diagnostiquer les problèmes d'envoi
- Suivre la fréquence réelle des rapports

---

## ⏰ Configuration du Cron Job Automatique

Pour que les rapports soient envoyés automatiquement selon la récurrence configurée, vous devez créer un cron job dans Supabase.

### Option 1 : Via SQL Editor (Recommandé)

1. Allez sur https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/sql/new
2. Exécutez ce SQL :

```sql
-- Activer l'extension pg_cron si pas déjà fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Créer le cron job (tous les jours à 9h UTC)
SELECT cron.schedule(
  'send-accessibility-report-daily',
  '0 9 * * *', -- Chaque jour à 9h UTC
  $$
  SELECT
    net.http_post(
        url:='https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-accessibility-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Option 2 : Modifier la Fréquence

Pour changer la fréquence du cron job :

```sql
-- Supprimer l'ancien job
SELECT cron.unschedule('send-accessibility-report-daily');

-- Créer un nouveau job avec une fréquence différente

-- Toutes les heures
SELECT cron.schedule('send-accessibility-report-hourly', '0 * * * *', $$...(même contenu)...$$);

-- Tous les lundis à 9h
SELECT cron.schedule('send-accessibility-report-weekly', '0 9 * * 1', $$...(même contenu)...$$);

-- Le 1er de chaque mois à 9h
SELECT cron.schedule('send-accessibility-report-monthly', '0 9 1 * *', $$...(même contenu)...$$);
```

### Syntaxe Cron

Format : `minute heure jour mois jour_semaine`

Exemples :
- `0 9 * * *` - Tous les jours à 9h00
- `0 9 * * 1` - Tous les lundis à 9h00
- `0 9 1 * *` - Le 1er de chaque mois à 9h00
- `0 */6 * * *` - Toutes les 6 heures
- `0 0 * * 0` - Tous les dimanches à minuit

### Vérifier les Cron Jobs

```sql
-- Lister tous les cron jobs
SELECT * FROM cron.job;

-- Voir l'historique d'exécution
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 🐛 Dépannage

### Problème : Aucun email reçu

**Solutions** :
1. Vérifiez le dossier spam/courrier indésirable
2. Confirmez que le domaine Resend est validé
3. Consultez l'historique des envois pour le statut
4. Vérifiez les logs de l'edge function
5. Testez avec le bouton "Test" du dashboard

### Problème : Erreur "GitHub token not configured"

**Solutions** :
1. Cliquez sur "Modifier" dans la section Token GitHub
2. Saisissez un token valide avec les bonnes permissions
3. Enregistrez la configuration
4. Testez à nouveau

### Problème : Erreur "No recipients configured"

**Solutions** :
1. Ajoutez au moins un destinataire valide
2. Vérifiez que les emails sont au bon format
3. Enregistrez la configuration

### Problème : Cron job ne s'exécute pas

**Solutions** :
1. Vérifiez que pg_cron et pg_net sont activés
2. Consultez `cron.job_run_details` pour les erreurs
3. Vérifiez que l'URL de l'edge function est correcte
4. Assurez-vous que l'anon key est valide

### Voir les logs de l'edge function

1. Allez sur https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/functions/send-accessibility-report/logs
2. Consultez les logs récents
3. Recherchez les erreurs ou warnings

---

## 💰 Coûts et Limites

### Resend (Email)

**Plan Gratuit** :
- ✅ 100 emails/jour
- ✅ 3,000 emails/mois
- ✅ Domaine personnalisé

**Plan Pro** (20$/mois) :
- ✅ 50,000 emails/mois
- ✅ Emails illimités dans l'équipe
- ✅ Support prioritaire

### Supabase (Cron Jobs)

Les cron jobs sont inclus dans tous les plans Supabase :
- ✅ Plan gratuit : Inclus
- ✅ Pas de limite sur le nombre de cron jobs
- ✅ Consommation d'edge function normale

---

## 📋 Checklist de Mise en Production

Avant de lancer les envois automatiques en production :

- [ ] Compte Resend créé et configuré
- [ ] Domaine validé sur Resend
- [ ] Clé API Resend configurée dans les secrets
- [ ] Token GitHub configuré avec les bonnes permissions
- [ ] Au moins 1 destinataire ajouté
- [ ] Test d'envoi effectué avec succès
- [ ] Email de test reçu et vérifié
- [ ] Fréquence d'envoi configurée
- [ ] Jour et heure d'envoi définis
- [ ] Cron job créé dans Supabase
- [ ] Cron job testé manuellement
- [ ] Envoi automatique activé
- [ ] Historique des envois surveillé

---

## 🔒 Sécurité

### Stockage des Secrets

- ✅ Token GitHub stocké chiffré dans Supabase
- ✅ Clé API Resend dans les secrets d'edge function
- ✅ Pas de données sensibles dans les logs
- ✅ RLS activé sur les tables de configuration

### Permissions

- ✅ Seuls les utilisateurs authentifiés peuvent configurer les envois
- ✅ Token GitHub utilisé uniquement côté serveur
- ✅ Emails validés avant ajout

### Recommandations

1. **Rotation régulière** du token GitHub (tous les 3 mois)
2. **Surveillance** de l'historique des envois
3. **Limitation** du nombre de destinataires (max 20)
4. **Validation** des domaines d'emails si possible

---

## 📚 Ressources

### Documentation Externe

- [Resend Documentation](https://resend.com/docs)
- [Resend Email Best Practices](https://resend.com/docs/send-with-nextjs)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)

### Documentation Projet

- [Dashboard Accessibilité](./DASHBOARD-ACCESSIBILITE-GITHUB.md)
- [Tests Accessibilité CI/CD](./TESTS-ACCESSIBILITE-CI-CD.md)
- [Branch Protection Rules](./GITHUB-BRANCH-PROTECTION.md)

### Support

Pour toute question ou problème :
1. Consultez cette documentation
2. Vérifiez les logs de l'edge function
3. Consultez l'historique des envois
4. Créez une issue GitHub avec le label `email-reports`

---

**Dernière mise à jour** : 2025-11-07  
**Version** : 1.0.0  
**Auteur** : EmotionsCare DevOps Team
