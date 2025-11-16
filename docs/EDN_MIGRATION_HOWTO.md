# Guide d'Application de la Migration EDN

## 📍 Contexte

La migration `20251116220000_add_complete_edn_features.sql` est **CRITIQUE** pour activer les fonctionnalités complètes EDN demandées :

- Paroles séparées par rang (A, B, AB)
- Liens Suno vers items EDN
- Liens Bandes Dessinées vers items EDN

**Sans cette migration, la plateforme reste à ~35-40% de complétude.**

---

## 🚀 Méthode Recommandée: Interface Web

### Étape 1: Accéder à la page de migration

```
http://localhost:5173/edn-test
```

OU en production:
```
https://[votre-domaine]/edn-test
```

### Étape 2: Onglet "Migration Base de Données"

1. Cliquer sur l'onglet **🔧 Migration Base de Données**
2. Vérifier le statut actuel (badge rouge = non appliquée)
3. Cliquer sur **📋 Copier le SQL**

### Étape 3: Dashboard Supabase

1. Ouvrir le [Dashboard Supabase SQL Editor](https://supabase.com/dashboard/project/yaincoxihiqdksxgrsrk/sql/new)
2. Coller le SQL copié
3. Cliquer sur **Run**
4. Attendre la confirmation (devrait prendre 5-10 secondes)

### Étape 4: Vérification

1. Retourner sur `http://localhost:5173/edn-test`
2. Cliquer sur **🔄 Vérifier l'État**
3. Le badge devrait maintenant afficher **✅ Migration Appliquée**
4. Passer à l'onglet **📊 Vérification Complétude**
5. Le rapport devrait afficher les nouvelles statistiques avec paroles séparées

---

## 🔧 Méthode Alternative 1: CLI Supabase

### Prérequis
- Supabase CLI installé: `npm install -g supabase`
- Token d'accès Supabase configuré

### Commandes

```bash
cd /home/user/med-mng

# Lier le projet (une seule fois)
npx supabase link --project-ref yaincoxihiqdksxgrsrk

# Appliquer toutes les migrations en attente
npx supabase db push

# OU appliquer une migration spécifique
npx supabase migration up 20251116220000_add_complete_edn_features
```

### Vérification

```bash
# Vérifier les colonnes
npx supabase db execute --sql "SELECT column_name FROM information_schema.columns WHERE table_name = 'edn_items_complete' AND column_name LIKE 'paroles_rang%';"

# Devrait retourner:
# paroles_rang_a
# paroles_rang_b
# paroles_rang_ab
```

---

## 🗄️ Méthode Alternative 2: psql Direct

### Prérequis
- `psql` installé
- Connection string de la base de données

### Commandes

```bash
# Obtenir la connection string depuis le Dashboard Supabase:
# Settings > Database > Connection String > URI

# Exécuter la migration
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres" \
  -f supabase/migrations/20251116220000_add_complete_edn_features.sql
```

---

## ✅ Vérification Post-Migration

### 1. Via l'Interface Web

1. Accéder à `http://localhost:5173/edn-test`
2. Onglet **Vérification Complétude**
3. Vérifier que le rapport affiche :

```
✅ Migration appliquée - Colonnes séparées détectées

Paroles Séparées (Nouvelle Structure):
- Paroles Rang A: X items (Y%)
- Paroles Rang B: X items (Y%)
- Paroles Rang A+B: X items (Y%)
```

### 2. Via SQL Direct

```sql
-- Vérifier l'existence des colonnes
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'edn_items_complete'
  AND column_name IN ('paroles_rang_a', 'paroles_rang_b', 'paroles_rang_ab');

-- Vérifier les contraintes sur med_mng_songs
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'med_mng_songs';

-- Tester la fonction de vérification
SELECT check_edn_item_completeness('IC-001');
```

### 3. Via Code TypeScript

```typescript
import { supabase } from '@/integrations/supabase/client';

// Vérifier qu'on peut sélectionner les nouvelles colonnes
const { data, error } = await supabase
  .from('edn_items_complete')
  .select('paroles_rang_a, paroles_rang_b, paroles_rang_ab')
  .limit(1);

if (!error) {
  console.log('✅ Migration appliquée avec succès !');
} else {
  console.error('❌ Migration non appliquée:', error);
}
```

---

## 🔍 Résolution de Problèmes

### Erreur: "relation already exists"

C'est normal si vous réexécutez la migration. Le script utilise `IF NOT EXISTS` pour éviter les doublons.

**Solution:** Ignorer l'avertissement ou utiliser:
```sql
DROP INDEX IF EXISTS idx_edn_paroles_rang_a;
-- puis réexécuter
```

### Erreur: "permission denied"

Vous devez être connecté avec un rôle qui a les permissions `ALTER TABLE`.

**Solution:**
- Utiliser le Dashboard Supabase (recommandé)
- OU se connecter avec le `service_role_key`

### Migration semble appliquée mais le composant dit "Non Appliquée"

**Solution:**
1. Rafraîchir la page (`Ctrl+F5`)
2. Vider le cache du navigateur
3. Redémarrer le serveur frontend

### Erreur: "foreign key constraint"

Une contrainte de clé étrangère échoue si des données invalides existent déjà.

**Solution:**
```sql
-- Identifier les données problématiques
SELECT * FROM med_mng_songs
WHERE item_code IS NOT NULL
  AND item_code NOT IN (SELECT item_code FROM edn_items_complete);

-- Nettoyer ou corriger
UPDATE med_mng_songs
SET item_code = NULL
WHERE item_code NOT IN (SELECT item_code FROM edn_items_complete);

-- Puis réessayer la migration
```

---

## 📊 Prochaines Étapes Après Migration

Une fois la migration appliquée avec succès :

### 1. Vérifier la Complétude Actuelle
- Accéder à `/edn-test` > **Vérification Complétude**
- Noter le % de complétude global
- Identifier les items incomplets

### 2. Planifier la Génération de Contenu

**Phase 2.1: Paroles (Priority: HIGH)**
- Générer paroles pour Rang A: ~367 items
- Générer paroles pour Rang B: ~367 items
- Générer paroles pour Rang A+B: ~367 items
- **Total:** ~1,101 ensembles de paroles

**Phase 2.2: Chansons Suno (Priority: HIGH)**
- Générer via API Suno
- Lier avec `item_code` + `rang_type`
- **Total:** ~1,101 chansons audio

**Phase 2.3: Quiz (Priority: MEDIUM)**
- Utiliser `generate_quiz_from_oic_competences()`
- Compléter les ~100-150 items manquants

**Phase 2.4: Bandes Dessinées (Priority: LOW)**
- Peut être différé
- Générer progressivement

### 3. Mettre à Jour le Frontend

Voir `docs/EDN_IMPLEMENTATION_PLAN.md` - Phase 3 pour les détails.

---

## 📁 Fichiers Liés

- **Migration SQL:** `supabase/migrations/20251116220000_add_complete_edn_features.sql`
- **Composant UI:** `apps/frontend/src/components/test/MigrationApplier.tsx`
- **Page Test:** `apps/frontend/src/pages/EdnTest.tsx`
- **Diagnostic:** `docs/EDN_COMPLETE_FEATURES_DIAGNOSTIC.md`
- **Plan Complet:** `docs/EDN_IMPLEMENTATION_PLAN.md`

---

## 🆘 Support

En cas de problème:

1. Consulter `/edn-test` pour les détails d'erreur
2. Vérifier les logs Supabase Dashboard
3. Consulter `docs/EDN_COMPLETE_FEATURES_DIAGNOSTIC.md`
4. Créer une issue GitHub avec les détails

---

**Dernière mise à jour:** 2025-11-16
**Version Migration:** 20251116220000
