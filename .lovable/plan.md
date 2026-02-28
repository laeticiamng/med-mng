

# Plan: 8 Tickets Nettoyage + Monetisation (P0-P2)

## Etat des lieux (ce qui est DEJA fait)

Apres les sessions precedentes, l'essentiel du travail critique est deja realise :

- **36 fonctions fantomes documentees** dans `docs/supabase-functions-flow.md` (section 2)
- **Appels front desactives** : tous les composants/hooks/utils qui appelaient des EF supprimees sont soit desactives avec warnings, soit migres vers les routeurs unifies (`ai-audio`, `ai-core`)
- **Monetisation** : `create-checkout` fonctionne, `check-subscription` supporte `trialing`, `stripe-webhook` lit `metadata.plan` avec fallback `plan_id`
- **Zero reference active** vers `create-subscription-checkout`, `music-status`, `suno-*` dans le front
- **`auto-extract-oic`** retourne 410 Gone
- **`music-status`** marque `@deprecated`

## Ce qui RESTE a faire (par ticket)

---

### Ticket 1 (P0) -- Canonical registry

**Deja fait a 90%.** La section 2 de `docs/supabase-functions-flow.md` liste les 36 fonctions supprimees avec raisons/remplacements.

**Restant** :
- Ajouter un fichier `supabase/functions/_shared/deleted-functions.ts` exportant la liste des noms supprimes (utile pour les tests du Ticket 3)
- Verifier que `config.toml` ne contient aucune entree pour les EF supprimees (verification : OK, aucune entree orpheline trouvee)

**Fichiers a creer/modifier** :
- `supabase/functions/_shared/deleted-functions.ts` (nouveau)
- Aucune modification necessaire sur `config.toml` (propre)

**Estimation** : 20 min

---

### Ticket 2 (P0) -- Purge front des references

**Deja fait a 95%.** Toutes les references sont desactivees avec `console.warn` et messages "desactive".

**Restant** :
- `src/components/notifications/DataQualityMonitor.tsx:145` mentionne encore `extract-edn-objectifs` dans un texte `suggested_fix` -- mettre a jour le texte
- Nettoyer les stubs inutiles : `src/scripts/test-edn-extraction.ts`, `src/scripts/launch-complete-extraction.ts` sont des fichiers morts qui pourraient etre supprimes
- `src/utils/oicFixLauncher.ts` et `src/utils/generateAllLyrics.ts` : fonctions desactivees, mais les fichiers restent -- les conserver comme stubs (pas de risque)

**Fichiers a modifier** :
- `src/components/notifications/DataQualityMonitor.tsx` (texte uniquement)

**Fichiers candidats a suppression** (optionnel, aucun impact runtime) :
- `src/scripts/test-edn-extraction.ts`
- `src/scripts/launch-complete-extraction.ts`

**Estimation** : 30 min

---

### Ticket 3 (P0) -- Tests Edge "deleted EF" (404/410)

**Pas encore fait.** C'est le ticket avec le plus de travail nouveau.

**A creer** :
- `supabase/functions/system/deleted-functions_test.ts` : test Deno qui appelle les endpoints supprimes et verifie 404
- Importer la liste depuis `_shared/deleted-functions.ts` pour iterer
- Tester `auto-extract-oic` retourne 410 (deja en place)
- Tester que `music-status` repond encore (deprecated mais actif)

**Fichiers a creer** :
- `supabase/functions/_shared/deleted-functions.ts`
- Un test Deno pour valider les endpoints supprimes

**Estimation** : 1-2h

---

### Ticket 4 (P1) -- Stripe checkout consolidation + guardrails

**Deja fait a 85%.** `create-checkout` et `stripe-webhook` sont alignes.

**Restant** :
- Le webhook `checkout.session.completed` (ligne 58-59) utilise des dates calculees (`Date.now() + 30 jours`) au lieu des vraies dates de la subscription Stripe -- devrait utiliser `subscription.current_period_start/end` comme le fait `customer.subscription.updated`
- Ajouter un guard : si `planId` n'est pas dans la liste des plans connus, log une erreur au lieu de creer silencieusement

**Fichiers a modifier** :
- `supabase/functions/stripe-webhook/index.ts` : ameliorer le bloc `checkout.session.completed` pour recuperer les vraies dates de subscription via l'API Stripe, et valider `planId`

**Estimation** : 45 min

---

### Ticket 5 (P1) -- Paywall + entitlements trialing/active/canceled

**Deja fait a 90%.** `useSubscription.ts` gere `trialing` + `active` + `canceled` + `past_due` + `unpaid` avec affichage correct.

**Restant** :
- `isSubscriptionActive()` retourne `true` pour `trialing` et `active` (OK)
- Verifier qu'il y a un composant paywall qui utilise `isSubscriptionActive()` pour bloquer l'acces
- Ajouter un test unitaire pour `normalizeStatus` et `isSubscriptionActive`

**Fichiers a verifier/modifier** :
- `src/hooks/useSubscription.ts` (OK tel quel)
- Potentiellement `src/components/paywall/*` (a verifier s'il existe)

**Estimation** : 30 min (surtout verification)

---

### Ticket 6 (P1) -- Supabase cleanup: cron/secrets/DB orphelins

**Necessite investigation.**

**A verifier** :
- Y a-t-il des cron jobs dans les migrations qui appellent des EF supprimees ?
- Secrets inutiles dans le dashboard (ex: cles liees a des services retires)
- Triggers DB qui appellent des fonctions supprimees

**Fichiers a verifier** :
- `supabase/migrations/*` (recherche de references aux EF supprimees)
- Dashboard Supabase (secrets, cron jobs)

**Estimation** : 1-2h (variable)

---

### Ticket 7 (P2) -- Docs + Runbook "Edge Functions lifecycle"

**Partiellement fait.** `docs/supabase-functions-flow.md` couvre l'inventaire mais pas le processus.

**A creer** :
- Section dans `docs/supabase-functions-flow.md` ou fichier dedie `docs/edge-functions-lifecycle.md` avec :
  - Checklist pour ajouter une nouvelle EF
  - Checklist pour deprecier (410) vs supprimer (404)
  - Obligation de mettre a jour `_shared/deleted-functions.ts` + docs

**Estimation** : 30-45 min

---

### Ticket 8 (P2) -- Observabilite monetisation

**Partiellement fait.** `create-checkout` a deja des `logStep()` structures. `stripe-webhook` log les evenements.

**Restant** :
- Ajouter validation de payload avec status 400 (pas 500) si `plan` invalide dans `create-checkout`
- Ajouter un compteur d'erreurs simple (log structure `[CHECKOUT_ERROR]` exploitable par requete analytics Supabase)
- Optionnel : remonter un KPI dans le dashboard admin

**Fichiers a modifier** :
- `supabase/functions/create-checkout/index.ts` (validation renforcee)
- Optionnel : composant dashboard

**Estimation** : 45 min

---

## Ordre d'execution recommande

1. **Ticket 1** : Creer `_shared/deleted-functions.ts` (prerequis pour Ticket 3)
2. **Ticket 2** : Fix texte `DataQualityMonitor.tsx`
3. **Ticket 3** : Creer les tests "deleted EF"
4. **Ticket 4** : Fix `stripe-webhook` dates + validation planId
5. **Ticket 8** : Renforcer validation `create-checkout`
6. **Ticket 5** : Verification paywall (minimal)
7. **Ticket 6** : Audit cron/secrets
8. **Ticket 7** : Doc lifecycle

## Estimation totale

**~5-7h** pour les 8 tickets (vs ~16-30h estime dans les tickets originaux, car 80%+ est deja fait).

## Deploiements Edge Functions necessaires

- `stripe-webhook` (Ticket 4)
- `create-checkout` (Ticket 8)

