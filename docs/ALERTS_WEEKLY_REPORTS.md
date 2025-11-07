# 📧 Rapports Hebdomadaires Automatiques - Alertes Unifiées

## Vue d'ensemble

Le système envoie automatiquement un rapport hebdomadaire complet des alertes unifiées à tous les administrateurs chaque **lundi à 9h00 UTC**.

## 🎯 Fonctionnalités

### Rapport Automatique

**Contenu du rapport:**
- 📊 Statistiques des 7 derniers jours
- 🔥 Nombre d'alertes critiques et élevées
- 📈 Score moyen unifié
- 📉 Distribution par sévérité
- 🎯 Top 10 des alertes prioritaires
- 🔗 Lien direct vers le dashboard analytics

### Export Manuel

**Formats disponibles dans le dashboard:**
- **Excel (.xlsx)** - Tableau complet avec toutes les colonnes
- **CSV** - Format universel pour analyse
- **PDF** - Rapport graphique avec tous les charts intégrés

## 🚀 Configuration

### 1. Secrets Supabase Requis

Le système nécessite la clé API **Resend** pour l'envoi d'emails:

```bash
# Via Supabase Dashboard
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Via CLI
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2. Configuration des Destinataires

Les rapports sont envoyés aux utilisateurs avec le flag `is_admin = true` dans la table `profiles`.

**Ajouter un administrateur:**
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

### 3. Planification Cron

Le cron job est configuré automatiquement via la migration:

```sql
-- Exécution: Chaque lundi à 9h00 UTC
SELECT cron.schedule(
  'weekly-alerts-report',
  '0 9 * * 1',
  $$ ... $$
);
```

**Modifier la fréquence:**
```sql
-- Désactiver l'ancien job
SELECT cron.unschedule('weekly-alerts-report');

-- Créer un nouveau job (exemple: tous les jours à 8h)
SELECT cron.schedule(
  'daily-alerts-report',
  '0 8 * * *',
  $$ ... $$
);
```

## 📊 Dashboard Analytics

### Filtres de Période

Le dashboard propose 3 périodes d'analyse:

| Période | Description | Cas d'usage |
|---------|-------------|-------------|
| **7 jours** | Vue hebdomadaire | Suivi quotidien |
| **30 jours** | Vue mensuelle | Tendances moyen terme |
| **90 jours** | Vue trimestrielle | Analyse stratégique |

### Comparaison Période vs Période

Chaque métrique affiche automatiquement:
- ✅ **Valeur actuelle** de la période sélectionnée
- 📊 **Variation en %** par rapport à la période précédente
- ↗️ **Flèche rouge** = augmentation (négatif pour la sécurité)
- ↘️ **Flèche verte** = diminution (positif pour la sécurité)

**Exemples:**
```
Total Alertes: 45 ↗️ +15.5% (vs 39 période précédente)
Score Moyen: 7.2 ↘️ -8.3% (amélioration!)
Alertes Critiques: 3 ↘️ -40% (excellente amélioration!)
```

## 🎨 Structure du Rapport Email

### Header
- 🎨 Dégradé violet professionnel
- 📊 Titre et période
- 🚨 Badge rouge si alertes critiques

### Statistiques Principales
- Total alertes
- Score moyen
- Alertes critiques
- Alertes élevées

### Distribution par Sévérité
- Badges de couleur par niveau
- Compteur pour chaque catégorie

### Top 10 Alertes
- Titre et description
- Source et score
- Badge de sévérité
- Bordure colorée selon priorité

### Footer
- Lien vers le dashboard
- Informations système

## 🔧 Utilisation

### Envoi Manuel

Tester l'envoi via l'Edge Function:

```bash
curl -X POST \
  'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/send-weekly-alerts-report' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Export PDF depuis le Dashboard

1. Aller sur l'onglet **Analytics**
2. Sélectionner la période souhaitée
3. Cliquer sur **PDF** dans la barre d'actions
4. Le PDF est téléchargé avec tous les graphiques

**Contenu du PDF:**
- En-tête avec titre et période
- Cartes de comparaison
- Graphique d'évolution temporelle
- Distribution par sévérité (pie chart)
- Évolution des scores par facteur
- Multi-pages si nécessaire

## 📈 Graphiques Disponibles

### 1. Évolution Temporelle
- **Type:** Line Chart
- **Axes Y doubles:**
  - Gauche: Nombre d'alertes
  - Droite: Score moyen
- **Permet de:** Corréler volume et criticité

### 2. Distribution par Sévérité
- **Type:** Pie Chart
- **Couleurs:**
  - 🔴 Critique: #ef4444
  - 🟠 Élevée: #f97316
  - 🟡 Moyenne: #eab308
  - 🔵 Faible: #3b82f6

### 3. Évolution des Scores
- **Type:** Line Chart multi-séries
- **Décomposition:**
  - Score unifié (violet)
  - Facteur PagerDuty (rouge)
  - Facteur CVSS (bleu)

## 🔐 Sécurité

### RLS Policies

La table `email_logs` est protégée:
```sql
-- Seul le service_role peut accéder
CREATE POLICY "Service role can manage email logs"
  ON public.email_logs
  FOR ALL TO service_role
  USING (true);
```

### Secrets Management

- ✅ **RESEND_API_KEY** stocké dans Supabase Vault
- ✅ Jamais exposé au client
- ✅ Utilisé uniquement dans Edge Functions
- ✅ Accessible uniquement avec service_role

## 📊 Monitoring

### Logs d'Envoi

Tous les envois sont enregistrés dans `email_logs`:

```sql
SELECT 
  type,
  recipients,
  sent_at,
  resend_id,
  report_data->>'totalAlerts' as total_alerts
FROM email_logs
WHERE type = 'weekly_alerts_report'
ORDER BY sent_at DESC
LIMIT 10;
```

### Statistiques d'Envoi

```sql
-- Taux d'envoi par semaine
SELECT 
  date_trunc('week', sent_at) as week,
  COUNT(*) as emails_sent,
  array_length(recipients, 1) as total_recipients
FROM email_logs
WHERE type = 'weekly_alerts_report'
GROUP BY week
ORDER BY week DESC;
```

## 🎯 Best Practices

### Pour les Administrateurs

1. **Vérifier régulièrement** les rapports hebdomadaires
2. **Comparer les périodes** pour identifier les tendances
3. **Exporter en PDF** pour les réunions/présentations
4. **Analyser les pics** de criticité dans les graphiques

### Pour les Développeurs

1. **Tester l'envoi manuel** avant le déploiement
2. **Vérifier les logs** dans `email_logs`
3. **Monitorer les erreurs** dans les Edge Function logs
4. **Maintenir à jour** RESEND_API_KEY si rotation

## 🚨 Troubleshooting

### Rapport non reçu

1. Vérifier que `RESEND_API_KEY` est configuré
2. Vérifier le flag `is_admin` dans profiles
3. Consulter les logs Edge Function:
   ```bash
   supabase functions logs send-weekly-alerts-report
   ```

### Graphiques manquants dans le PDF

1. Attendre le chargement complet du dashboard
2. Vérifier que les données sont présentes
3. Consulter la console pour les erreurs html2canvas

### Erreur d'envoi Resend

1. Vérifier la validité de l'API key
2. Vérifier les limites de quota Resend
3. Vérifier le format des emails destinataires

## 📚 Ressources

- [Resend API Documentation](https://resend.com/docs)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [html2canvas](https://html2canvas.hertzen.com/)

---

**Note:** Le système est entièrement automatisé. Une fois configuré, aucune intervention manuelle n'est requise pour les rapports hebdomadaires.
