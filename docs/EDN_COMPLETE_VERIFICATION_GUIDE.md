# Guide de Vérification Complète EDN

## 🎯 Objectif

Ce guide explique comment utiliser le nouveau système de vérification complète item par item pour s'assurer que **chaque item EDN est 100% complet avec toutes ses compétences OIC**.

---

## 🔍 Système de Vérification Complète

### Accès

```
URL: http://localhost:5173/edn-test
Onglet: 🔍 Vérif Complète (premier onglet)
```

### Ce qui est vérifié pour chaque item

Le système analyse **7 éléments critiques** pour chaque item:

1. **Compétences OIC Rang A** (20% du score)
   - Nombre de compétences disponibles
   - Présence de compétences valides

2. **Compétences OIC Rang B** (20% du score)
   - Nombre de compétences disponibles
   - Présence de compétences valides

3. **Paroles Rang A** (15% du score)
   - Présence de paroles générées
   - Nombre de lignes

4. **Paroles Rang B** (15% du score)
   - Présence de paroles générées
   - Nombre de lignes

5. **Paroles Rang A+B** (15% du score)
   - Présence de paroles combinées
   - Nombre de lignes

6. **Quiz** (10% du score)
   - Présence d'un quiz
   - Nombre de questions

7. **Bande Dessinée** (5% du score - optionnel)
   - Présence de panneaux
   - Nombre de panneaux

### Score de Complétude

**Total: 100%**
- ≥85%: Item considéré comme **complet** ✅
- 60-84%: Item **partiellement complet** ⚠️
- <60%: Item **incomplet** ❌

**Note:** Un item peut être considéré complet (≥85%) même sans bande dessinée.

---

## 📋 Comment Utiliser

### Étape 1: Lancer la Vérification

```
1. Ouvrir http://localhost:5173/edn-test
2. Onglet "🔍 Vérif Complète"
3. Cliquer "🔍 Lancer la Vérification Complète"
4. Attendre (~10-30 secondes pour 367 items)
```

### Étape 2: Analyser les Résultats

Le rapport affiche:

**Statistiques Globales:**
- Total items (367)
- Items complets (≥85%)
- Items incomplets
- Score moyen

**Statistiques Détaillées:**
- % items avec compétences OIC Rang A
- % items avec compétences OIC Rang B
- % items avec paroles Rang A
- % items avec paroles Rang B
- % items avec paroles Rang AB
- % items avec quiz
- % items avec bandes dessinées

**Liste Détaillée:**
- Chaque item avec son score
- Détails des éléments présents/manquants
- Vue expandable pour voir tous les détails

### Étape 3: Filtrer les Résultats

**Option "Incomplets uniquement"**
- Cocher pour afficher seulement les items <85%
- Utile pour identifier rapidement ce qui manque

### Étape 4: Exporter le Rapport

```
1. Cliquer "📥 Export CSV"
2. Fichier téléchargé: edn-completeness-report-[date].csv
3. Ouvrir dans Excel/Google Sheets pour analyse avancée
```

---

## 📊 Interprétation des Résultats

### Exemple de Rapport Type

```
Total items: 367
Items complets (≥85%): 220 (60%)
Items incomplets: 147 (40%)
Score moyen: 72.3%

Détail par élément:
  Compétences OIC Rang A: 250/367 (68.1%)
  Compétences OIC Rang B: 230/367 (62.7%)
  Paroles Rang A: 0/367 (0.0%)      ← À générer!
  Paroles Rang B: 0/367 (0.0%)      ← À générer!
  Paroles Rang AB: 0/367 (0.0%)     ← À générer!
  Quiz: 240/367 (65.4%)
  Bandes dessinées: 80/367 (21.8%)
```

### Analyse

**Points Forts:**
- Compétences OIC: ~60-70% des items
- Quiz: ~65% des items

**Points Faibles:**
- **PRIORITÉ CRITIQUE:** Paroles 0% (mais script de génération prêt!)
- Bandes dessinées: 22% (optionnel, priorité basse)

### Actions Prioritaires

**1. URGENT - Générer les Paroles (1-2h)**
```
Impact: +45% sur le score moyen
Méthode: Génération batch automatique
Durée: 1-2 heures
Résultat: Score passe de ~72% à ~90%+
```

**2. IMPORTANT - Compléter Compétences OIC (~30%)**
```
Impact: +12% sur le score moyen
Items concernés: ~100-150 items
Durée: 2-3 jours
```

**3. IMPORTANT - Compléter Quiz (~35%)**
```
Impact: +3.5% sur le score moyen
Items concernés: ~120-150 items
Durée: 1-2 jours
```

**4. OPTIONNEL - Bandes Dessinées**
```
Impact: Faible (5% max)
Priorité: Basse
```

---

## 🎯 Plan d'Action Recommandé

### Phase 1: Génération Paroles (PRIORITÉ MAX) ⏱️ 1-2h

**Objectif:** Passer de 0% à 100% sur les paroles

**Étapes:**
```
1. Vérifier migration appliquée (/edn-test > Migration)
2. Lancer batch génération (/edn-test > Batch)
3. Attendre 1-2h (automatique)
4. Re-vérifier complétude
```

**Résultat Attendu:**
- Paroles Rang A: 0% → 100%
- Paroles Rang B: 0% → 100%
- Paroles Rang AB: 0% → 100%
- **Score moyen: 72% → 90%+** 🚀

---

### Phase 2: Identifier Items Sans Compétences OIC ⏱️ 30 min

**Utiliser le CSV Export:**

```sql
-- Ouvrir le CSV et filtrer
Filtre: "OIC A Count" = 0 OU "OIC B Count" = 0
```

**Actions:**
1. Lister les items sans OIC
2. Vérifier si compétences UNESS disponibles
3. Planifier import ou création manuelle

---

### Phase 3: Compléter Compétences OIC ⏱️ 2-3 jours

**Option A: Import UNESS (si disponible)**
```sql
-- Utiliser fonction existante
SELECT enrich_edn_item_with_oic('IC-XXX');
```

**Option B: Création Manuelle**
- Via interface admin
- Ou import CSV bulk

---

### Phase 4: Générer Quiz Manquants ⏱️ 1-2 jours

**Utiliser fonction SQL existante:**

```sql
-- Quiz depuis compétences OIC
SELECT generate_quiz_from_oic_competences('IC-XXX');

-- Batch pour tous les items sans quiz
DO $$
DECLARE
  item_record RECORD;
BEGIN
  FOR item_record IN
    SELECT item_code
    FROM edn_items_complete
    WHERE quiz_data IS NULL OR quiz_data = '{}'::jsonb
  LOOP
    PERFORM generate_quiz_from_oic_competences(item_record.item_code);
  END LOOP;
END $$;
```

---

## 📈 Suivi de Progression

### Re-vérifier Après Chaque Phase

**Après Génération Paroles:**
```
1. /edn-test > Vérif Complète
2. Vérifier score moyen ~90%+
3. Vérifier paroles 100%
```

**Après Compétences OIC:**
```
1. Re-vérifier
2. Vérifier OIC A et B ~100%
3. Score moyen devrait être ~95%+
```

**Après Quiz:**
```
1. Re-vérifier
2. Vérifier quiz ~100%
3. Score moyen devrait être ~97-98%
```

---

## 🔧 Utilisation Avancée

### Script Console pour Items Spécifiques

```typescript
import { verifyCompleteEDNCompleteness } from '@/utils/verifyCompleteCompleteness';

// Lancer vérification
const report = await verifyCompleteEDNCompleteness();

// Items sans OIC Rang A
const noOicA = report.items_details.filter(
  item => item.oic_competences_rang_a.count === 0
);
console.log('Items sans OIC A:', noOicA.map(i => i.item_code));

// Items sans OIC Rang B
const noOicB = report.items_details.filter(
  item => item.oic_competences_rang_b.count === 0
);
console.log('Items sans OIC B:', noOicB.map(i => i.item_code));

// Items sans paroles
const noParoles = report.items_details.filter(
  item => !item.has_paroles_rang_a || !item.has_paroles_rang_b
);
console.log('Items sans paroles:', noParoles.map(i => i.item_code));

// Items sans quiz
const noQuiz = report.items_details.filter(
  item => !item.has_quiz
);
console.log('Items sans quiz:', noQuiz.map(i => i.item_code));
```

### Export Personnalisé

```typescript
import { exportCompletenessReportToCSV } from '@/utils/verifyCompleteCompleteness';

const csv = exportCompletenessReportToCSV(report);

// Sauvegarder
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'rapport-personnalise.csv';
a.click();
```

---

## ⚠️ Points d'Attention

### Compétences OIC

**Problème:** Certains items n'ont pas de compétences OIC dans la base UNESS

**Solutions:**
1. Vérifier si item existe dans UNESS
2. Si non: créer manuellement les compétences
3. Si oui: importer depuis UNESS

### Paroles

**Problème:** Génération peut échouer pour certains items

**Solutions:**
1. Vérifier logs de génération batch
2. Re-générer items échoués individuellement
3. Utiliser fonction `generateSingleItem('IC-XXX')`

### Quiz

**Problème:** Quiz auto-généré peut être de qualité variable

**Solutions:**
1. Vérifier manuellement quiz générés
2. Améliorer si nécessaire
3. Utiliser comme base, peaufiner manuellement

---

## 📊 Objectifs de Complétude

### Objectif Minimum (Plateforme Fonctionnelle)

```
✅ Compétences OIC Rang A: ≥80%
✅ Compétences OIC Rang B: ≥80%
✅ Paroles Rang A: 100%
✅ Paroles Rang B: 100%
✅ Paroles Rang AB: 100%
✅ Quiz: ≥70%
⚠️ Bandes dessinées: ≥20% (optionnel)

Score Moyen Cible: ≥85%
```

### Objectif Optimal (Plateforme Complète)

```
✅ Compétences OIC Rang A: 100%
✅ Compétences OIC Rang B: 100%
✅ Paroles Rang A: 100%
✅ Paroles Rang B: 100%
✅ Paroles Rang AB: 100%
✅ Quiz: 100%
✅ Bandes dessinées: ≥50%

Score Moyen Cible: ≥95%
```

---

## 🚀 Quick Start

**Pour vérifier MAINTENANT la complétude:**

```bash
1. http://localhost:5173/edn-test
2. Cliquer "🔍 Vérif Complète"
3. Cliquer "🔍 Lancer la Vérification Complète"
4. Analyser les résultats
5. Exporter CSV si besoin d'analyse approfondie
```

**Pour atteindre 90%+ rapidement:**

```bash
1. Vérifier complétude actuelle
2. Appliquer migration (si pas fait)
3. Lancer génération batch paroles (1-2h)
4. Re-vérifier → Score ~90%+ atteint! 🎉
```

---

**Dernière mise à jour:** 2025-11-16
**Version:** 1.0
**Outil:** CompleteCompletenessVerification.tsx + verifyCompleteCompleteness.ts
