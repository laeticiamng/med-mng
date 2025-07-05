# 🚨 TICKET CRITIQUE - Problèmes de qualité des données OIC

## 📋 **RÉSUMÉ**
Les compétences OIC affichées dans les tableaux des items EDN présentent de graves problèmes de qualité de données qui impactent l'expérience utilisateur et la fiabilité pédagogique.

## 🔍 **DIAGNOSTIC DÉTAILLÉ**

### **Analyse quantitative (sur 4,872 compétences totales):**
- ❌ **15 descriptions vides** (0.3%)
- ⚠️ **832 descriptions trop courtes** (17.1%) - moins de 50 caractères
- 🔧 **469 avec balises HTML corrompues** (9.6%)
- 📝 **1,003 fragments incomplets** (20.6%) - commencent par "-" ou "*"
- 💥 **237 intitulés corrompus** (4.9%) - contiennent des balises MediaWiki

### **Exemples concrets de problèmes:**

#### 1. **Descriptions tronquées/fragmentées**
```
- description: "- antécédent de SAF/syndrome malformatif dans la progéniture (risque de récurrence très élevé) ;"
- description: "- Le médecin doit donc sans cesse évaluer le rapport bénéfices/risques..."
- description: "- performance dans la démarche diagnostique"
```

#### 2. **Balises HTML mal converties**
```
- description: "&lt;br /&gt;"
- description: "bactériurie ≥ 10&lt;sup&gt;5&lt;/sup&gt; UFC/mL"
- description: "* &lt;u&gt;Erreur aléatoire&lt;/u&gt;, due à la fluctuation d'échantillonnage"
```

#### 3. **Tables MediaWiki non converties**
```
- description: "{| class=\"wikitable\"\n|Fièvres hémorragiques virales\n|Virus Ebola, Virus Marburg..."
```

#### 4. **Intitulés corrompus**
```
- intitule: "293. [[Consultation de suivi addictologie SD-293|Consultation de suivi addictologie]]"
```

#### 5. **Références internes non résolues**
```
- description: "Voir ITEM 74"
- intitule: "a priori."
- intitule: "deux sources d'erreur"
```

## 🎯 **IMPACT UTILISATEUR**
- **Expérience dégradée** : Les étudiants voient des contenus incomplets/corrompus
- **Perte de crédibilité** : La plateforme semble non professionnelle
- **Inefficacité pédagogique** : Les compétences ne sont pas compréhensibles
- **Charge cognitive** : L'utilisateur doit deviner le sens des fragments

## 🛠️ **SOLUTIONS TEMPORAIRES IMPLÉMENTÉES**
- Détection intelligente des types de corruption
- Indicateurs visuels pour signaler les problèmes de données
- Nettoyage amélioré des balises HTML
- Gestion gracieuse des descriptions vides

## 🚀 **ACTIONS REQUISES CÔTÉ BACKEND**

### **PRIORITÉ 1 - CORRECTION DE L'EXTRACTION**
1. **Revoir le processus d'extraction OIC** 
   - Analyser les sources originales sur le site OIC
   - Corriger le parsing des tables MediaWiki
   - Gérer correctement les listes et sous-sections

2. **Améliorer la conversion HTML**
   - Décoder correctement les entités HTML (`&lt;`, `&gt;`, `&nbsp;`)
   - Convertir les tables MediaWiki en HTML standard
   - Résoudre les liens internes `[[...]]`

3. **Validation des données**
   - Implémenter des checks de qualité post-extraction
   - Rejeter les descriptions < 20 caractères
   - Valider la cohérence intitulé/description

### **PRIORITÉ 2 - NETTOYAGE DES DONNÉES EXISTANTES**
1. **Script de nettoyage en masse**
   ```sql
   -- Identifier et corriger les descriptions problématiques
   UPDATE oic_competences 
   SET description = [version_nettoyée]
   WHERE description LIKE '%&lt;%' OR LENGTH(description) < 30;
   ```

2. **Re-extraction ciblée**
   - Re-extraire les 1,003 compétences fragmentaires
   - Re-extraire les 469 compétences avec HTML corrompu
   - Re-extraire les 237 intitulés corrompus

### **PRIORITÉ 3 - MONITORING CONTINU**
1. **Métriques de qualité**
   - Dashboard de suivi de la qualité des données
   - Alertes sur les nouvelles extractions défaillantes

2. **Tests automatisés**
   - Tests de régression sur la qualité des données
   - Validation automatique post-extraction

## 📊 **REQUÊTES UTILES POUR LE DEBUG**

### **Identifier les compétences problématiques**
```sql
-- Compétences avec HTML corrompu
SELECT item_parent, intitule, description 
FROM oic_competences 
WHERE description LIKE '%&lt;%' OR description LIKE '%&gt;%'
LIMIT 20;

-- Fragments incomplets
SELECT item_parent, intitule, description 
FROM oic_competences 
WHERE description LIKE '-%' OR description LIKE '*%' 
LIMIT 20;

-- Intitulés corrompus
SELECT item_parent, intitule 
FROM oic_competences 
WHERE intitule LIKE '%[[%]]%'
LIMIT 20;
```

### **Statistiques globales**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN description IS NULL OR TRIM(description) = '' THEN 1 END) as vides,
  COUNT(CASE WHEN LENGTH(TRIM(description)) < 50 THEN 1 END) as courtes,
  COUNT(CASE WHEN description LIKE '%&lt;%' THEN 1 END) as html_corrompu
FROM oic_competences;
```

## ⏰ **TIMELINE SUGGÉRÉE**
- **Semaine 1** : Analyse et correction du processus d'extraction
- **Semaine 2** : Script de nettoyage et re-extraction
- **Semaine 3** : Tests et validation
- **Semaine 4** : Déploiement et monitoring

## 👥 **RESPONSABLES SUGGÉRÉS**
- **Dev Backend** : Correction extraction + scripts nettoyage
- **Data Engineer** : Validation qualité + monitoring
- **QA** : Tests de régression

---

**Créé le :** $(date)  
**Priorité :** 🔴 CRITIQUE  
**Affecte :** 4,872 compétences (82% ont des problèmes)  
**Impact utilisateur :** ÉLEVÉ