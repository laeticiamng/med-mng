

# Roadmap Strategique MED-MNG : Plan d'Execution en 8 Phases

## Etat des lieux technique actuel

- **91 pages** dans App.tsx (dont ~35 utiles pour les utilisateurs)
- **120+ Edge Functions** (dont ~40 sont des fonctions test/debug/extraction)
- **~100 erreurs de build TypeScript** dans les Edge Functions, toutes du meme type
- **11 niveaux de providers** imbriques dans App.tsx
- **724 tables** Supabase (pour 12 utilisateurs beta)

---

## PHASE 1 : Correction du build (Priorite absolue)

**Duree estimee : 1 session Lovable**

Le build est casse par 3 categories d'erreurs repetees dans ~50 edge functions :

### 1.1 — `error` is of type `unknown` (~80 occurrences)

Pattern a corriger dans chaque catch block :
```typescript
// Avant
} catch (error) {
  return { error: error.message };
}

// Apres
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { error: message };
}
```

Fichiers concernes : `music-database.ts`, `suno-api-client.ts`, `activate-simulation`, `admin-export`, `admin-quick-edit`, `advanced-search`, `ai-audio`, `ai-content`, `ai-core`, `ai-recommendations`, `analytics-aggregator`, `analytics-engine`, `analytics-tracker`, `api-documentation`, `audit-edn-completeness`, `audit-system`, `auth-webhook`, `auto-extract-oic`, `cancel-ia-task`, `chat-with-ai`, `check-item-competences`, `check-performance-degradation`, `collect-diagnostic-results`, `compare-official-content`, `complete-missing-competences`, `content-ai-generator`, `content-master-api`, et environ 30 autres.

### 1.2 — Erreurs de typage specifiques

| Fichier | Erreur | Correction |
|---------|--------|------------|
| `admin-quick-edit/index.ts:44` | Index expression not type number | Caster `currentData` en `Record<string, unknown>` |
| `advanced-search/index.ts:52` | `results` implicitly `any[]` | Typer `const results: any[] = []` |
| `analytics-aggregator/index.ts:119` | Filter on `unknown[]` | Caster `Object.values(userSessions) as number[]` |
| `api-documentation/index.ts:379-391` | Push to `never[]` | Typer `validationResult` avec `warnings: string[], errors: string[]` |
| `auto-extract-oic/index.ts:93` | `EdgeRuntime` not found | Ajouter `declare const EdgeRuntime: any` |
| `complete-missing-competences/index.ts:112` | Cannot assign to const | Changer `const` en `let` |
| `content-ai-generator/index.ts:67` | Index expression type `any` | Typer `fieldMap` avec `Record<string, keyof typeof existingContent>` |

### 1.3 — Imports (deja en place correctement)

`send-scheduled-reports` utilise deja `https://esm.sh/resend@2.0.0` — pas de correction necessaire.

---

## PHASE 2 : Nettoyage strategique (Semaine 1-2)

**Objectif : Reduire la surface technique de 40%**

### 2.1 — Edge Functions a supprimer (fonctions test/debug)

Supprimer ~20 fonctions qui sont des tests ou du debug :
- `test-batch-50`, `test-cas-simple`, `test-edn-extraction`, `test-extraction-sample`, `test-insertion-directe`, `test-login`, `test-oic-curl`, `test-webhook`
- `debug-oic-extraction`, `debug-uness-auth`
- `edn-fix`, `fix-oic-data-quality` (corrections ponctuelles)
- `sync-edn-tables`, `transform-edn-sections` (migrations ponctuelles)

### 2.2 — Edge Functions a consolider

Fusionner les fonctions redundantes :
- `ai-audio` + `ai-content` + `ai-core` → une seule `ai-engine`
- `extract-edn-uness` + `extract-edn-uness-auth` + `extract-edn-uness-complete` + `extract-edn-uness-production` → une seule `extract-edn`
- `generate-content` + `generate-missing-content` → une seule
- `music-generation` + `music-generation-secure` → une seule

### 2.3 — Pages a desactiver (garder le code, retirer de la nav)

Pages non essentielles pour la beta :
- `/store`, `/product/:handle` (pas de boutique active)
- `/b2b` (pas de clients B2B)
- `/community` (pas assez d'utilisateurs)
- `/karaoke` (feature secondaire)
- `/mood-tracker` (non differentiant)
- `/pomodoro` (existe partout ailleurs)
- `/shared-music` (pas de contenu)

**Garder** : Home, EDN, ECOS, Examen, Cas Cliniques, Flashcards, Progression, Chat IA, Pricing, Auth, Legal, FAQ, About, Demo

---

## PHASE 3 : Monetisation simplifiee (Semaine 3-4)

### 3.1 — Reduire de 3 tiers a 2+1

| Plan | Prix | Contenu |
|------|------|---------|
| Gratuit | 0 EUR | 10 items EDN, 3 QCM/jour, demo ECOS |
| Pro Etudiant | 19 EUR/mois | 367 items, examen illimite, cas cliniques, musique |
| Premium | 39 EUR/mois | Tout Pro + IA avancee, planning personnalise, priorite support |

Supprimer temporairement le tier "Institution".

### 3.2 — Paywall intelligent

Ajouter un blur + compteur sur les contenus premium avec CTA "Debloquer avec Pro".

### 3.3 — Essai gratuit 7 jours

Activer le trial Stripe sur le plan Pro.

---

## PHASE 4 : SEO offensif (Semaine 4-6)

### 4.1 — Pages piliers a creer

5 pages longues (2000+ mots) ciblees SEO :
1. `/preparation-ecos-2026` — "Comment preparer les ECOS 2026"
2. `/reussir-edn` — "Guide complet pour reussir l'EDN"
3. `/fiches-ecos-interactives` — "Fiches ECOS interactives gratuites"
4. `/simulation-examen-edn` — "Simulateur d'examen EDN en ligne"
5. `/cas-cliniques-edn` — "Cas cliniques corriges pour l'EDN"

### 4.2 — Infrastructure SEO

- Sitemap dynamique auto-genere
- Schema FAQ enrichi sur chaque page pilier
- Google Search Console + Bing Webmaster
- Balises Open Graph optimisees

---

## PHASE 5 : Mode Examen focus (Semaine 6-8)

Simplifier le mode examen existant :
- 1 mode EDN Blanc (120 dossiers, timer strict, pas de pause)
- 1 mode ECOS (10 stations)
- Score + percentile simule
- Feedback structure apres examen uniquement

---

## PHASE 6 : Cas cliniques premium (Semaine 8-10)

- Creer 10-20 cas ultra qualitatifs
- Images medicales
- Score detaille par competence ECOS
- Badge "Cas expert valide"

---

## PHASE 7 : Performance (Semaine 10-11)

- Audit Lighthouse sur 5 pages cles
- Lazy loading images
- Bundle splitting
- Objectif : LCP < 2.5s, Lighthouse > 90

---

## PHASE 8 : Cockpit CEO (Semaine 12)

Dashboard admin avec metriques reelles :
- DAU / WAU / MAU
- Funnel inscription → activation → paiement
- Taux de completion examen
- ARPU
- Churn rate

---

## Prochaine etape immediate

**Corriger les ~100 erreurs de build** (Phase 1) pour debloquer le deploiement. C'est la priorite absolue avant toute autre action strategique.

Voulez-vous que je commence par la Phase 1 (correction build) ?

