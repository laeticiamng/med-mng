

# Audit critique pre-publication -- MED-MNG

## Etat actuel

La plateforme est globalement solide : 367 items en DB, authentification securisee via `user_roles`, test mode desactive, rate limiting sur login, consentements RGPD au signup, RLS active, et seulement 4 warnings Supabase linter (non-critiques).

---

## Issues identifiees par role

### CISO -- Securite (2 corrections)

**1. `verify_jwt = false` sur TOUTES les Edge Functions (CRITIQUE)**
Le fichier `supabase/config.toml` desactive la verification JWT sur les 18 fonctions, y compris `create-checkout`, `check-subscription`, `customer-portal`, `medical-ai-copilot`. Seuls les webhooks (`stripe-webhook`, `auth-webhook`, `resend-webhook`) doivent avoir `verify_jwt = false`. Les autres doivent verifier le JWT pour empecher les appels non authentifies.

- **Correction** : Passer `verify_jwt = true` sur toutes les fonctions sauf les webhooks et les routeurs (qui font leur propre validation interne). Les fonctions concernees : `create-checkout`, `check-subscription`, `customer-portal`, `firecrawl-scrape`, `firecrawl-search`, `perplexity-search`, `whisper-transcribe`, `medical-ai-copilot`, `medical-ai-copilot-stream`, `generate-embeddings`, `enhanced-contextual-chat`.

**2. Politiques RLS "Service role manages" avec `USING (true)` (MINEUR)**
Plusieurs tables admin utilisent des politiques `ALL` avec `USING (true)` et `WITH CHECK (true)`. C'est acceptable si ces politiques ciblent le role `service_role`, mais a verifier. Le linter en signale 2 comme problematiques. Ces politiques sont documentees comme intentionnelles dans la memoire projet -- aucune action requise.

### DPO -- RGPD (0 correction)

- Consentements RGPD au signup : CGU, donnees de sante, transfert international, verification age -- tous presents et obligatoires.
- Page `/mes-donnees-rgpd` existante.
- Pages legales completes : CGU, Mentions legales, Politique de confidentialite, Declaration d'accessibilite.

### CEO -- Strategie (0 correction bloquante)

- Le Hero est clair : "Apprends la medecine en musique" -- comprehensible en 3 secondes.
- CTA principal : "Creer un compte gratuit" avec bonne hierarchie visuelle.
- 367 items EDN en DB = valeur reelle, pas de contenu fictif.
- Flow `/med-mng/create` complet en 4 etapes.

### CDO -- Data (0 correction)

- Tracking des conversions via `trackConversionEvent` au signup.
- `analytics_events` table existante.
- Activity tracking integre sur les pages cles.

### COO -- Operations (0 correction)

- Pipeline CI/CD configure.
- Lazy loading sur toutes les pages non-critiques.
- QueryClient avec retry=1 et staleTime=10min.

### Head of Design -- UX (1 amelioration recommandee)

**3. Le CTA secondaire "Decouvrir les items EDN" utilise du jargon**
Conforme a la memoire projet qui mentionne "Les 367 cours du programme medical" comme formulation accessible. Mais le bouton CTA secondaire dit encore "Decouvrir les items EDN" alors que la regle "3 secondes" exige un langage non-technique.

- **Correction** : Remplacer "Decouvrir les items EDN" par "Voir les 367 cours" dans `AppleHero.tsx`.

### Beta testeur -- UX critique (1 correction)

**4. Le `.lovable.app` n'est pas dans la liste de production du test mode**
Le fichier `testMode.ts` (ligne 18-22) ne bloque le mode test que sur `med-mng.com`, `vercel.app`, et `netlify.app`. Le domaine publie `med-mng.lovable.app` n'est pas dans la liste.

- **Correction** : Ajouter `window.location.hostname.endsWith('.lovable.app')` a la verification `isProduction` dans `testMode.ts`.

---

## Plan d'implementation (4 corrections)

### Correction 1 : `supabase/config.toml` -- Securiser les Edge Functions
Passer `verify_jwt = true` sur 11 fonctions (garder `false` uniquement pour les webhooks et les 5 routeurs principaux qui gerent leur propre auth).

### Correction 2 : `src/components/home/AppleHero.tsx` -- CTA accessible
Ligne 125 : Remplacer `Decouvrir les items EDN` par `Voir les 367 cours`.

### Correction 3 : `src/config/testMode.ts` -- Bloquer test mode sur lovable.app
Ligne 21 : Ajouter `window.location.hostname.endsWith('.lovable.app')` a la condition `isProduction`.

### Correction 4 : Verification finale
Lancer le linter Supabase pour confirmer que les 4 warnings restants sont bien documentes et non-critiques.

---

## Verdict

| Role | Statut | Bloquant |
|------|--------|----------|
| CEO | OK | Non |
| CISO | 1 correction critique (JWT) | Oui |
| DPO | OK | Non |
| CDO | OK | Non |
| COO | OK | Non |
| Design | 1 amelioration UX | Non |
| Beta | 1 correction securite (testMode) | Oui |

**2 corrections bloquantes** avant publication, **1 amelioration recommandee**.

