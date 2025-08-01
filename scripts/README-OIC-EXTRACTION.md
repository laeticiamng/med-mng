# 🤖 Extraction OIC Autonome

Système d'extraction automatisée des 4,872 compétences OIC depuis l'API LiSA UNESS vers Supabase.

## 🎯 Vue d'ensemble

- **Objectif** : Maintenir à jour la table `backup_oic_competences` automatiquement
- **Fréquence** : Hebdomadaire (lundis 3h UTC) via GitHub Actions
- **Méthode** : Node.js + Puppeteer avec authentification CAS
- **Cible** : 4,872 compétences OIC complètes

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ GitHub Actions  │ -> │ Puppeteer + CAS  │ -> │ Supabase Table  │
│ (Cron Weekly)   │    │ Authentication   │    │ backup_oic_     │
└─────────────────┘    └──────────────────┘    │ competences     │
                                               └─────────────────┘
```

## 📁 Structure des fichiers

```
.github/workflows/
└── oic-extraction-autonome.yml    # Workflow GitHub Actions

scripts/
├── extract-oic-competences.cjs    # Script principal d'extraction
└── test-oic-connection.cjs        # Script de test de connexion

reports/                            # Rapports d'extraction générés
└── oic_extraction_report.json

logs/                              # Logs détaillés
└── extraction-YYYY-MM-DD.log
```

## 🔧 Configuration

### Variables d'environnement

```bash
CAS_USERNAME=laeticia.moto-ngane@etud.u-picardie.fr
CAS_PASSWORD=Aiciteal1!
SUPABASE_URL=https://yaincoxihiqdksxgrsrk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=*** (Secret GitHub) ***
```

### Programmation automatique

```yaml
schedule:
  - cron: '0 3 * * 1'  # Tous les lundis à 3h UTC
```

## 🚀 Utilisation

### Extraction automatique
L'extraction se lance automatiquement chaque lundi. Aucune intervention manuelle requise.

### Extraction manuelle
```bash
# Via GitHub Actions UI
# -> Actions -> OIC Extraction Autonome -> Run workflow

# En local (développement)
npm install
node scripts/extract-oic-competences.cjs
```

### Test de connexion
```bash
node scripts/test-oic-connection.cjs
```

## 📊 Fonctionnement

### 1. Authentification CAS
- Connexion automatique avec Puppeteer
- Gestion des redirections CAS UNESS
- Session maintenue pour toute l'extraction

### 2. Récupération des données
- API MediaWiki : `categorymembers` pour lister les OIC
- Traitement par lots de 50 pages
- Parsing du contenu MediaWiki pour extraire :
  - `objectif_id` (clé primaire)
  - `intitule` (titre)
  - `item_parent` (IC-001 à IC-367)
  - `rang` (A ou B)
  - `rubrique` (catégorie)
  - `description` (contenu principal)

### 3. Sauvegarde Supabase
- UPSERT sécurisé dans `backup_oic_competences`
- Mise à jour uniquement si contenu modifié (hash)
- Préservation des données existantes

## 📋 Rapport d'extraction

Chaque extraction génère un rapport JSON :

```json
{
  "total_expected": 4872,
  "total_found": 4872,
  "updated": 321,
  "inserted": 9,
  "unchanged": 4542,
  "errors": 0,
  "missing": [],
  "start_time": "2025-08-01T03:00:00Z",
  "end_time": "2025-08-01T03:12:34Z"
}
```

## 🔍 Monitoring

### GitHub Actions
- Logs disponibles dans l'onglet Actions
- Artifacts de rapport téléchargeables
- Notifications en cas d'échec

### Supabase
- Table `backup_oic_competences` mise à jour
- Logs des Edge Functions si nécessaire
- Monitoring des performances

## 🛠️ Maintenance

### Mise à jour des credentials
Les credentials CAS sont configurés dans les variables du workflow. Pour les modifier :
1. Actions -> Secrets -> Repository secrets
2. Modifier `SUPABASE_SERVICE_ROLE_KEY` si nécessaire

### Debugging
1. Vérifier les logs GitHub Actions
2. Télécharger le rapport d'extraction
3. Examiner la table Supabase directement
4. Lancer le script de test local si nécessaire

### Performance
- Extraction complète : ~10-15 minutes
- Traitement par lots de 50 pages
- Pause de 2s entre les lots
- Retry automatique sur erreur

## ✅ Critères de succès

- ✅ 4,872 compétences dans `backup_oic_competences`
- ✅ Toutes les colonnes remplies (intitule, rubrique, description)
- ✅ Extraction hebdomadaire automatique
- ✅ Rapports de complétion générés
- ✅ 0 intervention manuelle requise

## 🆘 Support

- **Logs** : GitHub Actions -> Workflows -> OIC Extraction
- **Base** : [Supabase Dashboard](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk)
- **Code** : Repository GitHub connecté à Lovable
- **Contact** : @Laeticia via Slack

---

🤖 **Système entièrement autonome** - Aucune intervention manuelle requise