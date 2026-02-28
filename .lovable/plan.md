
# Plan d'Execution : Feuille de Route 90 Jours — De "Plateforme" a "Produit Payant"

## Diagnostic actuel

- **~110 Edge Functions** restantes (14 test/debug deja supprimees)
- **11 niveaux de providers** dans App.tsx
- **~90 pages** dont beaucoup non essentielles (Store, B2B, Karaoke, MoodTracker, Pomodoro, SharedMusic, Community)
- **Pricing** : 3 tiers en place mais `PricingPlans.tsx` appelle `create-subscription-checkout` (qui n'existe pas) au lieu de `create-checkout` (qui existe)
- **create-checkout** : prix Standard 19EUR/Pro 29EUR/Premium 39EUR — **ne correspond pas** aux tiers affiches (Gratuit/Pro 19EUR/Premium 39EUR)
- **Pas d'essai 7 jours** configure dans le checkout Stripe (`subscription_data.trial_period_days` absent)
- **Pas de preuve sociale** (compteur d'inscrits)

---

## ETAPE 1 — Reduction de Surface Technique (Semaine 1-2)

### 1.1 — Supprimer ~25 Edge Functions inutilisees ou redondantes

Fonctions a supprimer (non referencees ou doublons) :
- `activate-simulation` (non reference cote frontend actif)
- `create-subscription-checkout` (doublon de `create-checkout`)
- `ecos-enrich-ai` (non reference)
- `extract-edn-objectifs` (migration ponctuelle)
- `extract-edn-uness-auth`, `extract-edn-uness-complete`, `extract-edn-uness-production` (doublons de `extract-edn-uness`)
- `generate-cas-cookie` (non reference)
- `generate-missing-content` (doublon de `generate-content`)
- `google-sheets-webhook` (non reference)
- `openai-image` (doublon de `generate-image`)
- `process-ab-tests` (non reference)
- `send-weekly-alerts-report` (non reference)
- `shopify-webhook` (pas de boutique active)
- `spotify-medical-docs` (non reference)
- `suno-audio-processing` (doublon dans ai-audio)
- `suno-extend-music`, `suno-generate-lyrics`, `suno-upload-cover` (consolider dans ai-audio)
- `unified-alerts` (doublon de monitoring-alerts)
- `get-vapid-key`, `get-rls-policies` (utilitaires ponctuels)

**Resultat** : de ~110 a ~85 Edge Functions (reduction 23%)

### 1.2 — Desactiver les pages non essentielles

Retirer des routes (garder le code) :
- `/store`, `/product/:handle` — pas de boutique
- `/b2b` — pas de clients B2B
- `/karaoke` — feature secondaire
- `/mood-tracker` — non differentiant
- `/pomodoro` — existe partout
- `/shared-music`, `/shared-music/:id` — pas de contenu
- `/community` — pas assez d'utilisateurs

**Fichier modifie** : `src/App.tsx` — commenter les routes, supprimer les imports lazy correspondants

### 1.3 — Reduire les providers imbriques

Fusionner ou supprimer les providers peu utilises :
- `InternationalizationProvider` + `LanguageProvider` → garder un seul
- `PerformanceProvider` → supprimer (metriques dans hooks)
- `ViewportProvider` → supprimer si media queries CSS suffisent

**De 11 a 7-8 niveaux**

---

## ETAPE 2 — Clarification Monetisation (Semaine 3)

### 2.1 — Corriger le flux de paiement

Le bug critique : `PricingPlans.tsx` appelle `create-subscription-checkout` qui n'existe pas. Corriger pour appeler `create-checkout`.

**Fichier** : `src/components/med-mng/PricingPlans.tsx`
- Changer l'appel de `create-subscription-checkout` vers `create-checkout`
- Mapper les planIds correctement : `pro` → `standard` (19EUR), `premium` → `premium` (39EUR)

### 2.2 — Ajouter l'essai gratuit 7 jours Stripe

**Fichier** : `supabase/functions/create-checkout/index.ts`
- Ajouter `subscription_data: { trial_period_days: 7 }` dans la session checkout pour le plan Pro/Standard

### 2.3 — Synchroniser les tiers affiches avec Stripe

Mettre a jour `create-checkout` pour avoir 2 plans payants :
- `pro` : 19EUR (price_id existant du standard)
- `premium` : 39EUR (price_id existant du premium)
- Supprimer le tier "Pro" a 29EUR qui n'est plus affiche

### 2.4 — Ajouter preuve sociale

**Fichier** : `src/components/med-mng/PricingPlans.tsx`
- Ajouter un compteur "37+ etudiants inscrits" au-dessus des cards
- Query Supabase sur `profiles` count pour un nombre reel (ou semi-statique)

### 2.5 — Ajouter comparaison Pro vs Premium

**Fichier** : `src/pages/MedMngPricing.tsx`
- Ajouter un tableau comparatif sous les cards pricing avec checkmarks par feature

---

## ETAPE 3 — SEO Offensif (Semaine 4-5)

### 3.1 — Creer 4 articles SEO supplementaires

Nouveaux fichiers dans `src/pages/seo/` :
1. `ErreursFrquentesEcos.tsx` — "Erreurs frequentes aux ECOS"
2. `ClassementEdnExplique.tsx` — "Comment fonctionne le classement EDN"
3. `RangAvsRangB.tsx` — "Rang A vs Rang B : comprendre la difference"
4. `TravaillerCasCliniques.tsx` — "Comment travailler les cas cliniques efficacement"

Chaque page : 2000+ mots, JSON-LD FAQ, maillage interne vers les 5 pages piliers existantes.

### 3.2 — Renforcer le maillage interne

Ajouter des liens croises entre les 9 pages SEO (5 existantes + 4 nouvelles) dans les sections "Articles lies".

### 3.3 — Ajouter 10 FAQ longues

Enrichir `PricingFAQ.tsx` avec 10 questions supplementaires orientees conversion et SEO longue traine.

---

## ETAPE 4 — Examen = Produit Coeur (Semaine 6)

### 4.1 — Historique des scores enrichi

**Fichier** : `src/components/exam/ExamHistory.tsx`
- Ajouter un graphique de progression des scores sur 30 jours
- Afficher la tendance du percentile

### 4.2 — Faiblesse par specialite

**Fichier** : `src/components/exam/ExamCompetencyRadar.tsx`
- Identifier automatiquement les 3 specialites les plus faibles
- Afficher "Recommandation : revisez Cardiologie et Neurologie"

### 4.3 — Recommandation automatique de revision

Apres examen, generer un mini-plan de revision base sur les faiblesses detectees. Lien vers les items EDN correspondants.

---

## ETAPE 5 — Cas Cliniques Premium (Semaine 7-8)

### 5.1 — Page publique "Exemple cas clinique"

Creer `src/pages/seo/ExempleCasClinique.tsx` :
- 1 cas clinique complet visible publiquement (teaser)
- CTA "Debloquer les 20 cas premium"
- Schema JSON-LD Article

### 5.2 — Score comparatif et grille ECOS

Enrichir la page resultats des cas cliniques avec :
- Score par competence UNESS
- Comparaison avec la moyenne des autres utilisateurs

---

## ETAPE 6 — Performance & Experience (Semaine 9)

### 6.1 — Audit et optimisations

- Verifier `React.memo` sur `ExamPercentile`, `ExamCompetencyRadar`, `ExamRanking`
- Ajouter `loading="lazy"` sur les images dans les cas cliniques
- Verifier le code splitting avec les imports lazy (deja en place)

### 6.2 — Mobile intensif

- Tester toutes les pages critiques en viewport 375px
- Corriger les debordements eventuels

---

## Resume des fichiers impactes

### A creer (7 fichiers)
1. `src/pages/seo/ErreursFrquentesEcos.tsx`
2. `src/pages/seo/ClassementEdnExplique.tsx`
3. `src/pages/seo/RangAvsRangB.tsx`
4. `src/pages/seo/TravaillerCasCliniques.tsx`
5. `src/pages/seo/ExempleCasClinique.tsx`

### A modifier (8 fichiers)
1. `src/App.tsx` — retirer routes inutiles, reduire providers
2. `src/components/med-mng/PricingPlans.tsx` — fix appel checkout, preuve sociale
3. `src/pages/MedMngPricing.tsx` — tableau comparatif Pro vs Premium
4. `supabase/functions/create-checkout/index.ts` — trial 7j, sync tiers
5. `src/components/pricing/PricingFAQ.tsx` — +10 FAQ
6. `src/components/exam/ExamCompetencyRadar.tsx` — recommandations faiblesses
7. `src/config/routes.ts` — nouvelles routes SEO

### A supprimer (~25 Edge Functions)
Liste detaillee dans l'etape 1.1

### Ordre d'execution
1. **Etape 1** (surface technique) — prerequis stabilite
2. **Etape 2** (monetisation) — bug critique checkout a corriger
3. **Etape 3** (SEO) — contenu pour acquisition
4. **Etape 4** (examen) — retention
5. **Etape 5** (cas cliniques) — differenciation
6. **Etape 6** (performance) — polish final
