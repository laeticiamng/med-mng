
# Plan: Nettoyage technique Edge Functions (Build Blockers)

## Diagnostic

Apres exploration du code, voici l'etat reel des 8 tickets proposes :

| Ticket | Statut reel | Action |
|--------|-------------|--------|
| 1. axios version | Deja corrige (^1.7.9) | Aucune |
| 2. Resend npm imports | Deja corrige (esm.sh) | Aucune |
| 3. catch(error) typing | CONFIRME - ~50+ fichiers | A corriger |
| 4. Std lib versions | CONFIRME - 34 fichiers sur 0.168.0, 13 sur 0.190.0 | A corriger |
| 5. Node imports ban | 1 seul fichier (api-documentation) | Mineur |
| 6. Lockfile | Hors perimetre Lovable | Aucune |
| 7. CI pipeline | Hors perimetre Lovable | Aucune |
| 8. Smoke tests | Possible via Deno tests | Optionnel |

## Actions a implementer (3 blocs)

### Bloc A : Harmoniser std lib Deno (47 fichiers)

Migrer toutes les Edge Functions vers `std@0.190.0` (version stable Supabase).

**34 fichiers** sur `0.168.0` et **13 fichiers** sur `0.190.0` a aligner.

Fichiers concernes (0.168.0 a migrer) :
- api-documentation, monitoring-alerts, complete-missing-competences, generate-clinical-case, stripe-webhook, send-scheduled-reports, translate, study-planner, extract-edn-uness, edn-tableaux-api, spotify-ai-complete, send-security-alert, generate-exam, check-item-competences, music-generation, regenerate-oic-with-ai-check, openai-chat, secure-edn-extraction, auto-extract-oic, content-ai-generator, secure-audio-stream, et 13 autres.

Version cible : `std@0.190.0` (version utilisee par les fichiers les plus recents et compatibles Supabase).

### Bloc B : Fix catch(error) typing (~50 fichiers)

Creer un helper partage dans `supabase/functions/_shared/error-utils.ts` :

```text
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
```

Puis remplacer les `error.message` directs par `getErrorMessage(error)` dans les catch blocks des Edge Functions les plus critiques (fonctions deployees et actives).

### Bloc C : Corriger CORS headers (_shared/cors.ts)

Le fichier actuel manque les headers Supabase recommandes. Mise a jour :

```text
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}
```

### Bloc D : Nettoyer api-documentation (import path Deno)

Remplacer l'import `std@0.168.0/path/mod.ts` par `std@0.190.0/path/mod.ts` dans `api-documentation/index.ts`.

## Sequencement

1. Bloc C (CORS) - 1 fichier, impact global
2. Bloc B (error-utils) - creer helper + corriger les 15-20 fonctions les plus critiques
3. Bloc A (std lib) - migration batch des 34 fichiers
4. Bloc D (api-documentation path import) - inclus dans Bloc A

## Estimation

- Bloc A : ~30 remplacements mecaniques
- Bloc B : 1 fichier nouveau + ~20 edits
- Bloc C : 1 edit
- Bloc D : inclus dans A

Total : execution en une seule session.

## Ce qui n'est PAS fait (et pourquoi)

- **Tickets 1, 2** : deja corriges dans le code actuel
- **Tickets 6, 7** : lockfile et CI sont hors perimetre Lovable (pas de terminal)
- **Ticket 8** : smoke tests Deno possibles mais secondaires par rapport a la stabilite
