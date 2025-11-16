# Guide de Démarrage Rapide - Génération EDN Complète

## 🎯 Objectif

Atteindre **100% de complétude** de la plateforme EDN en générant automatiquement les paroles pour les 367 items dans les 3 rangs (A, B, AB).

---

## ⚡ Démarrage en 3 Étapes

### Étape 1: Appliquer la Migration (5 minutes)

**Action:**
```
1. Ouvrir http://localhost:5173/edn-test
2. Aller sur l'onglet "🔧 Migration"
3. Cliquer sur "📋 Copier le SQL"
4. Ouvrir le Dashboard Supabase SQL Editor
5. Coller et cliquer "Run"
6. Retourner sur /edn-test et vérifier le badge vert ✅
```

**Lien Supabase SQL Editor:**
```
https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/sql/new
```

**Vérification:**
Le badge doit afficher "✅ Migration Appliquée"

---

### Étape 2: Lancer la Génération Complète (1-2 heures)

**Méthode A: Interface Graphique (Recommandé)**

```
1. Ouvrir http://localhost:5173/edn-test
2. Aller sur l'onglet "🚀 Génération Batch"
3. Cliquer sur "Lancer la Génération Complète"
4. Suivre la progression en temps réel
5. Attendre la fin (1-2 heures)
```

**Méthode B: Console Navigateur (Avancé)**

```typescript
// Ouvrir la console du navigateur (F12)
// Importer et lancer
import { runCompleteGeneration } from '@/utils/runCompleteGeneration';

const result = await runCompleteGeneration({
  batchSize: 10,           // Nombre d'items en parallèle
  pauseBetweenBatches: 1000, // Pause en ms entre batches
  onProgress: (prog) => {
    console.log(`${prog.processedItems}/${prog.totalItems} - ${prog.currentItem}`);
  }
});

console.log('Résultat:', result);
```

**Que se passe-t-il pendant la génération ?**

```
Pour chaque item EDN (IC-001 à IC-367):
  1. Récupère les données de l'item
  2. Récupère les compétences OIC
  3. Génère paroles Rang A (style Nekfeu)
  4. Génère paroles Rang B (style Nekfeu)
  5. Génère paroles Rang AB (style Nekfeu)
  6. Sauvegarde dans edn_items_complete

Total: 367 items × 3 rangs = 1,101 générations
Durée: ~2 secondes par génération = ~37 minutes
Avec pauses et batches: ~1-2 heures
```

---

### Étape 3: Vérifier la Complétude (1 minute)

**Action:**
```
1. Ouvrir http://localhost:5173/edn-test
2. Aller sur l'onglet "📊 Complétude"
3. Cliquer sur "🔄 Vérifier l'État"
4. Vérifier les statistiques
```

**Résultat Attendu:**

```
Paroles Séparées (Nouvelle Structure):
✅ Paroles Rang A: 367/367 items (100%)
✅ Paroles Rang B: 367/367 items (100%)
✅ Paroles Rang A+B: 367/367 items (100%)

Total Complétude: ~85-90% ✅
```

---

## 🔧 Génération Item par Item (Alternative)

Si vous préférez générer progressivement:

**Méthode 1: Interface Graphique**
```
1. /edn-test > Onglet "🚀 Génération Batch"
2. Section "Génération Item Unique"
3. Entrer le code (ex: IC-042)
4. Cliquer sur le bouton Play
```

**Méthode 2: Console**
```typescript
import { generateSingleItem } from '@/utils/runCompleteGeneration';

await generateSingleItem('IC-001');
await generateSingleItem('IC-002');
// etc.
```

---

## 🔄 Reprendre une Génération Interrompue

Si la génération batch a été interrompue:

**Méthode 1: Interface**
```
1. /edn-test > "🚀 Génération Batch"
2. Section "Reprendre la Génération"
3. Entrer le code du dernier item traité (ex: IC-042)
4. Cliquer sur "Reprendre"
```

**Méthode 2: Console**
```typescript
import { resumeGeneration } from '@/utils/runCompleteGeneration';

// Reprendre depuis IC-042
await resumeGeneration('IC-042');
```

---

## 📊 Suivi de la Progression

### Pendant la Génération

**Interface Graphique:**
- Barre de progression en temps réel
- Statistiques: Succès / Échecs
- Temps restant estimé
- Item en cours
- Logs détaillés

**Console Navigateur:**
```
🎵 IC-001 - Relations entre professionnels...
   Spécialité: Éthique et déontologie
   Génération Rang A... ✓
   Génération Rang B... ✓
   Génération Rang AB... ✓
   ✅ IC-001 - Paroles générées et sauvegardées
      Rang A: 42 lignes
      Rang B: 38 lignes
      Rang AB: 56 lignes

🎵 IC-002 - Valeurs professionnelles...
   ...
```

### Télécharger les Logs

Sur l'interface `/edn-test > Génération Batch`:
- Cliquer sur "📥 Télécharger" dans la section Logs
- Fichier: `edn-generation-logs-[timestamp].txt`

---

## ⚠️ Résolution de Problèmes

### Erreur: "Migration non appliquée"

**Cause:** Les colonnes `paroles_rang_a/b/ab` n'existent pas.

**Solution:**
1. Retourner à l'Étape 1
2. Appliquer la migration via Supabase Dashboard

### Erreur: "Item XXX non trouvé"

**Cause:** L'item n'existe pas dans `edn_items_complete`.

**Solution:** Vérifier que les 367 items sont bien présents:
```sql
SELECT COUNT(*) FROM edn_items_complete;
-- Devrait retourner 367
```

### Génération très lente

**Cause:** Génération des paroles prend du temps (appels OIC, construction structure).

**Solutions:**
- Augmenter le `batchSize` (mais risque de surcharge)
- Réduire le `pauseBetweenBatches`
- Laisser tourner en arrière-plan

**Configuration optimale:**
```typescript
runCompleteGeneration({
  batchSize: 15,          // 15 items en parallèle
  pauseBetweenBatches: 500 // 500ms de pause
});
```

### Erreurs aléatoires pendant la génération

**Cause:** Timeout Supabase, connexion perdue, etc.

**Solution:** Utiliser la reprise:
```typescript
// Noter le dernier item traité (ex: IC-042)
// Puis reprendre
await resumeGeneration('IC-043');
```

---

## 📈 Après la Génération Complète

### Tester le Workflow Utilisateur

```
1. Ouvrir /generator
2. Sélectionner un item EDN (ex: IC-001)
3. Choisir Rang A
4. Choisir style "Rap éducatif"
5. Cliquer "Générer"
6. Vérifier que la chanson est créée
7. Vérifier la sauvegarde dans la bibliothèque
```

### Vérifier les Données

**SQL:**
```sql
-- Vérifier qu'on a bien les paroles pour tous les items
SELECT
  COUNT(*) as total,
  COUNT(paroles_rang_a) FILTER (WHERE array_length(paroles_rang_a, 1) > 0) as with_rang_a,
  COUNT(paroles_rang_b) FILTER (WHERE array_length(paroles_rang_b, 1) > 0) as with_rang_b,
  COUNT(paroles_rang_ab) FILTER (WHERE array_length(paroles_rang_ab, 1) > 0) as with_rang_ab
FROM edn_items_complete;

-- Résultat attendu:
-- total: 367
-- with_rang_a: 367
-- with_rang_b: 367
-- with_rang_ab: 367
```

### Tester un Exemple Concret

**Console:**
```typescript
// Récupérer les paroles d'un item
const { data } = await supabase
  .from('edn_items_complete')
  .select('item_code, title, paroles_rang_a, paroles_rang_b, paroles_rang_ab')
  .eq('item_code', 'IC-001')
  .single();

console.log('Item:', data.title);
console.log('Paroles Rang A:', data.paroles_rang_a.slice(0, 10));
console.log('Paroles Rang B:', data.paroles_rang_b.slice(0, 10));
console.log('Paroles Rang AB:', data.paroles_rang_ab.slice(0, 10));
```

---

## 🎉 Résultat Final

Après avoir suivi ces 3 étapes, vous devriez avoir:

✅ **Infrastructure Complète (100%)**
- Migration appliquée
- Colonnes séparées disponibles
- Scripts de génération fonctionnels

✅ **Contenu Paroles (100%)**
- 367 items avec Rang A
- 367 items avec Rang B
- 367 items avec Rang AB
- **Total: 1,101 ensembles de paroles**

✅ **Workflow Utilisateur (100%)**
- Générateur fonctionnel
- Sauvegarde BDD active
- Bibliothèque personnelle
- Interface complète

🔄 **Reste à Compléter (~30%)**
- Compétences OIC manquantes (~100-150 items)
- Quiz manquants (~100-150 items)
- Bandes dessinées (optionnel)

---

## 📞 Support

### Logs et Debugging

**Console navigateur:**
```javascript
// Activer logs détaillés
localStorage.setItem('debug', 'edn:*');

// Logs de génération
import { setProgressCallback } from '@/utils/runCompleteGeneration';

setProgressCallback((progress) => {
  console.log('Progress:', progress);
});
```

**Fichiers de logs:**
- Interface: Télécharger depuis `/edn-test`
- Console: Copier depuis DevTools

### Problèmes Connus

| Problème | Solution |
|----------|----------|
| Migration échoue | Vérifier permissions Supabase (admin requis) |
| Génération lente | Normal, 1-2h pour 367 items |
| Erreurs aléatoires | Utiliser la reprise depuis dernier item OK |
| Quota Supabase | Vérifier limites plan (batches plus petits) |

---

## 🚀 Commandes Rapides

### Check Migration
```typescript
const { data } = await supabase
  .from('edn_items_complete')
  .select('paroles_rang_a')
  .limit(1);

console.log('Migration OK:', !!data);
```

### Génération Complète
```typescript
import { runCompleteGeneration } from '@/utils/runCompleteGeneration';
await runCompleteGeneration();
```

### Génération Single
```typescript
import { generateSingleItem } from '@/utils/runCompleteGeneration';
await generateSingleItem('IC-001');
```

### Reprise
```typescript
import { resumeGeneration } from '@/utils/runCompleteGeneration';
await resumeGeneration('IC-042');
```

---

**Dernière mise à jour:** 2025-11-16
**Version:** 1.0
**Durée estimée totale:** 1-2 heures de génération + 10 minutes de setup
