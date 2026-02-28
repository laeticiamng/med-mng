

# Plan: Nettoyage complet Edge Functions + Monetisation (8 tickets)

## Diagnostic complet

### Etat actuel des Edge Functions

**97 dossiers** existent dans `supabase/functions/` (incluant `_shared` et `lib`).

### Fonctions fantomes (listees dans docs mais N'EXISTENT PAS comme dossiers)

En comparant `docs/supabase-functions-flow.md` avec le contenu reel de `supabase/functions/`, ces fonctions sont documentees mais **n'existent plus** :

1. `activate-simulation`
2. `create-subscription-checkout`
3. `ecos-enrich-ai`
4. `generate-cas-cookie`
5. `debug-oic-extraction`
6. `debug-uness-auth`
7. `edn-fix`
8. `shopify-webhook`
9. `test-batch-50`
10. `test-cas-simple`
11. `test-edn-extraction`
12. `test-extraction-sample`
13. `test-insertion-directe`
14. `test-login`
15. `test-oic-curl`
16. `test-webhook`
17. `extract-edn-objectifs`
18. `extract-edn-uness-auth`
19. `extract-edn-uness-complete`
20. `extract-edn-uness-production`
21. `unified-alerts`
22. `send-weekly-alerts-report`
23. `process-ab-tests`
24. `get-rls-policies`
25. `openai-image`
26. `generate-missing-content`
27. `sync-edn-tables`
28. `update-edn-unique-content`
29. `fix-oic-data-quality`
30. `google-sheets-webhook`
31. `music-status`
32. `suno-extend-music`
33. `suno-generate-lyrics`
34. `suno-audio-processing`
35. `spotify-medical-docs`
36. `suno-upload-cover`

Soit **36 fonctions fantomes** (pas 22). Certaines sont consolidees dans les routeurs (`ai-audio`, `ai-core`, `ai-content`, `webhooks`, `system`), d'autres sont simplement supprimees.

### Appels front ACTIFS vers des fonctions inexistantes (les vrais bugs)

| Fichier front | Fonction appelee | Statut |
|---|---|---|
| `src/pages/MedMngSubscribe.tsx:68` | `create-subscription-checkout` | BUG - doit etre `create-checkout` |
| `src/lib/api-client.ts:288` | `create-subscription-checkout` | BUG - doit etre `create-checkout` |
| `src/components/audit/SyncTablesPanel.tsx:32` | `sync-edn-tables` | BUG - fonction n'existe plus |
| `src/components/audit/SyncTablesPanel.tsx:86` | `update-edn-unique-content` | BUG - fonction n'existe plus |
| `src/pages/OicDataQualityManager.tsx:61,85` | `fix-oic-data-quality` | BUG - fonction n'existe plus |
| `src/utils/oicFixLauncher.ts:7` | `fix-oic-data-quality` | BUG - fonction n'existe plus |
| `src/utils/generateAllLyrics.ts:27,52` | `update-edn-unique-content` | BUG - fonction n'existe plus |
| `src/components/admin/AdminDashboard.tsx:163` | `extract-edn-uness-production` | BUG - fonction n'existe plus |
| `src/hooks/useMusicGenerationStatus.ts:61` | `music-status` | Migre vers `ai-audio` action `get_status` |
| `src/lib/secureApiClient.ts:200` | `suno-upload-cover` | Migre vers `ai-audio` action `upload_cover` |
| `src/components/accessibility/WebhookManager.tsx:102` | `test-webhook` | BUG - fonction n'existe plus |
| `src/scripts/direct-extraction-launch.ts` | `extract-edn-objectifs` | BUG - fonction n'existe plus |
| `src/scripts/launch-edn-objectifs-extraction.ts` | `extract-edn-objectifs` | BUG - fonction n'existe plus |
| `supabase/functions/auto-extract-oic/index.ts:15,45,61` | `extract-edn-objectifs` (via fetch) | BUG - fonction n'existe plus |

---

## Plan d'execution (4 blocs, priorite decroissante)

### Bloc 1 (P0) : Fix appels front critiques (monetisation)

**Objectif** : Le flow checkout Stripe doit fonctionner.

**Fichiers a modifier** :
- `src/pages/MedMngSubscribe.tsx` : remplacer `create-subscription-checkout` par `create-checkout` et adapter le payload (`planId` vers `plan`)
- `src/lib/api-client.ts` : remplacer `/create-subscription-checkout` par `/create-checkout`

### Bloc 2 (P0) : Fix appels front vers EF supprimees

**Objectif** : Eliminer les 404 silencieux.

**Fichiers a modifier** :

| Fichier | Action |
|---|---|
| `src/hooks/useMusicGenerationStatus.ts` | Remplacer `music-status` par appel a `ai-audio` avec `action: "get_status"` |
| `src/lib/secureApiClient.ts` | Remplacer `suno-upload-cover` par appel a `ai-audio` avec `action: "upload_cover"` |
| `src/components/audit/SyncTablesPanel.tsx` | Desactiver/retirer les appels `sync-edn-tables` et `update-edn-unique-content` (ajouter TODO ou message "fonctionnalite en cours de migration") |
| `src/pages/OicDataQualityManager.tsx` | Desactiver les appels `fix-oic-data-quality` |
| `src/utils/oicFixLauncher.ts` | Desactiver l'appel `fix-oic-data-quality` |
| `src/utils/generateAllLyrics.ts` | Desactiver les appels `update-edn-unique-content` |
| `src/components/admin/AdminDashboard.tsx` | Desactiver l'appel `extract-edn-uness-production` |
| `src/components/accessibility/WebhookManager.tsx` | Desactiver l'appel `test-webhook` |

### Bloc 3 (P1) : Nettoyage scripts morts + references back-to-back

**Fichiers a modifier** :
- `src/scripts/direct-extraction-launch.ts` : supprimer (appelle `extract-edn-objectifs` qui n'existe plus)
- `src/scripts/launch-edn-objectifs-extraction.ts` : supprimer
- `supabase/functions/auto-extract-oic/index.ts` : retirer les appels fetch vers `extract-edn-objectifs` ou desactiver la fonction entiere

### Bloc 4 (P1) : Mise a jour documentation

**Fichiers a modifier** :
- `docs/supabase-functions-flow.md` : retirer les 36 fonctions supprimees, ajouter section "Fonctions consolidees" indiquant les mappings (ex: `music-status` est maintenant dans `ai-audio` action `get_status`)

---

## Tests de non-regression

1. **TypeScript** : `tsc --noEmit` doit passer
2. **Vitest** : ~700 tests doivent rester verts
3. **Edge Functions** : 10/10 tests Deno existants
4. **Verification manuelle** : flow Pricing -> Checkout (create-checkout) fonctionne
5. **Smoke** : aucun `Failed to fetch /functions/v1/` dans la console

## Estimation totale

- Bloc 1 : 30 min
- Bloc 2 : 1-2h
- Bloc 3 : 30 min
- Bloc 4 : 30 min
- **Total : 2.5-3.5h**

