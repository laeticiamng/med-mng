

# Plan: Tickets restants — Trial/Subscription + Stripe Webhook + Nettoyage final

## Etat des lieux apres diagnostic

### Deja fait (sessions precedentes)
- Tickets 1, 2, 3 (P0) : COMPLETS. Tous les appels front vers les 36 fonctions fantomes sont desactives ou migres.
- Documentation (`supabase-functions-flow.md`) : a jour.
- `create-subscription-checkout` : zero reference restante.
- `useMusicGenerationStatus` et `secureApiClient` : migres vers `ai-audio`.

### Problemes restants identifies (3 bugs reels + nettoyage)

---

## Bug 1 (CRITIQUE) : `check-subscription` ignore les users en trial

**Fichier** : `supabase/functions/check-subscription/index.ts` (ligne 69-72)

Le code actuel ne cherche que `status: "active"`. Or, `create-checkout` cree un abonnement avec `trial_period_days: 7`, ce qui donne un statut Stripe `trialing` — pas `active`.

**Resultat** : un utilisateur qui vient de s'abonner avec trial 7 jours est vu comme "non abonne" par le front.

**Correction** :
- Modifier la requete Stripe pour inclure `trialing` : `status: "all"` puis filtrer `active` + `trialing`
- Retourner un champ `is_trialing: true/false` dans la reponse
- Ajouter le status `trialing` dans `normalizeStatus` cote front (`useSubscription.ts`)

---

## Bug 2 (CRITIQUE) : `stripe-webhook` desynchronise avec `create-checkout`

**Fichier** : `supabase/functions/stripe-webhook/index.ts`

3 problemes :
1. **Version Stripe SDK** : utilise `stripe@14.21.0` + `apiVersion: "2023-10-16"` alors que tout le reste est sur `stripe@18.5.0` + `2025-08-27.basil`
2. **Metadata mismatch** : le webhook lit `session.metadata?.plan_id` (ligne 43) mais `create-checkout` envoie `metadata.plan` (pas `plan_id`)
3. **Version Supabase** : utilise `@supabase/supabase-js@2.45.0` alors que le standard est `@2.57.2`

**Resultat** : quand un checkout Stripe se termine, le webhook ne trouve pas le plan_id → la subscription BDD n'est pas creee correctement.

**Correction** :
- Aligner versions Stripe SDK et Supabase SDK
- Lire `session.metadata?.plan` (au lieu de `plan_id`)
- Ajouter le support `trialing` dans les status geres

---

## Bug 3 (MINEUR) : `music-status` existe encore comme Edge Function standalone

**Fichier** : `supabase/functions/music-status/index.ts`

Cette fonction existe toujours alors que le front appelle desormais `ai-audio` avec `action: 'get_status'`. La fonction standalone est un doublon qui peut creer de la confusion.

**Correction** : Pas de suppression (pas possible dans Lovable), mais ajouter un commentaire `@deprecated` et documenter dans `supabase-functions-flow.md`.

---

## Plan d'execution

### Etape 1 : Fix `check-subscription` (support trialing)

Modifier `supabase/functions/check-subscription/index.ts` :
- Remplacer `status: "active"` par recherche des subscriptions `active` ET `trialing`
- Ajouter `is_trialing` dans la reponse JSON
- Deployer

### Etape 2 : Fix `stripe-webhook` (versions + metadata)

Modifier `supabase/functions/stripe-webhook/index.ts` :
- Mettre a jour imports : `stripe@18.5.0`, `@supabase/supabase-js@2.57.2`, `apiVersion: "2025-08-27.basil"`
- Corriger `session.metadata?.plan_id` en `session.metadata?.plan`
- Gerer le statut `trialing` en plus de `active`

### Etape 3 : Adapter le front (useSubscription)

Modifier `src/hooks/useSubscription.ts` :
- Ajouter `trialing` dans `normalizeStatus` et les types `SubscriptionPlan['status']`
- Afficher un badge "Essai en cours" si `is_trialing === true`

### Etape 4 : Marquer `music-status` comme deprecated

Ajouter un commentaire `@deprecated` en haut de `supabase/functions/music-status/index.ts`

### Etape 5 : Smoke tests

- Tester `check-subscription` (curl) : verifier qu'il retourne `is_trialing` 
- Tester `create-checkout` : verifier que le flow Stripe fonctionne
- Executer les tests Deno existants (10/10)

## Estimation

- Etape 1 : 15 min
- Etape 2 : 20 min  
- Etape 3 : 15 min
- Etape 4 : 5 min
- Etape 5 : 15 min
- **Total : ~1h**

## Ce qui n'est PAS couvert (et pourquoi)

- **Tickets 5-6-7-8** : les smoke tests formels, le nettoyage cron/secrets, la doc runbook et l'observabilite sont des taches P1/P2 qui peuvent etre faites apres la stabilisation des 3 bugs critiques ci-dessus
- **Suppression de `music-status`** : la fonction reste deployee mais n'est plus appelee par le front — pas de risque

