# Analytics canoniques MED-MNG

Ce document résume la nouvelle instrumentation analytics qui alimente le dashboard Supabase « analytics-engine ».

## Opt-in & confidentialité

- Les préférences sont stockées dans `user_privacy_preferences` (RLS stricte, pseudonymisation automatique).
- Les utilisateurs contrôlent l’opt-in directement depuis `Paramètres > Confidentialité` et le nouveau module `Analytics canoniques`.
- Le consentement active un identifiant de session stocké côté navigateur (localStorage) et appliqué à tous les événements.
- La durée de conservation (90/180/365 jours) est configurable par l’utilisateur et utilisée par la fonction `purge_expired_analytics_events`.

## Événements normalisés

Les types d’événements disponibles :

| Event | Description | Métadonnées clés |
| --- | --- | --- |
| `generate_start` | File d’attente orchestration musicale | `jobId`, `requestId`, `segmentCount` |
| `generate_success` | Job terminé avec mix final | `finalMixUrl`, `retryCount` |
| `generate_fail` | Job arrêté ou en erreur | `error`, `retryCount` |
| `lyrics_timecode_done` | Alignement lyrics effectué | `segment_count`, `alignment_ms` |
| `play` | Lecture dans le lecteur global | `title`, `artist`, `context` |
| `seek_segment` | Clic karaoké vers un segment | `segmentIndex`, `startMs`, `preview` |
| `study_start` | Démarrage d’une séance 8 minutes | `runId`, `itemCode` |
| `study_end` | Séance terminée (save ou timeout) | `reason`, `durationSeconds` |
| `sync_success` | Synchronisation EDN OK | `itemsProcessed`, `errors` |
| `sync_fail` | Synchronisation EDN KO | `message`, `details` |

L’edge function `analytics-tracker` valide le type d’événement avant d’appeler `log_analytics_event`.

## Instrumentation front & edge

- `AnalyticsConsentManager` écoute les évènements de l’orchestrateur musical et déclenche `generate_*`.
- `CanonicalAnalyticsTracker` centralise le contexte (user, session, opt-in) et expose `trackCanonicalEvent`.
- Instrumentations supplémentaires :
  - `syncEdnContent` → `sync_success` / `sync_fail`
  - `EightMinuteSessionBuilder` → `study_start` / `study_end`
  - `KaraokeView` → `seek_segment`
  - `GlobalMusicPlayer` → `play`
  - Edge function `lyrics-aligner` → `lyrics_timecode_done`

## Dashboard

Le composant `AdvancedAnalyticsDashboard` consomme l’edge function `analytics-engine` (RPC `get_analytics_dashboard`). Il affiche :

- Statistiques principales (totaux, taux de réussite, erreurs EDN, séances démarrées).
- Graphique en barres par type d’événement.
- Chronologie des événements majeurs (top 4).
- Top 5 frictions (échecs génération/sync) avec métadonnées échantillons.
- Top contenus performants (success, lyrics, études, lectures).

Un export JSON du payload peut être téléchargé pour audit ou partage.

## Maintenance

- Purge des événements expirés : planifier un cron Supabase sur `purge_expired_analytics_events()`.
- En cas d’évolution du schéma, régénérer les types Supabase (`src/integrations/supabase/types.ts`).
- Tests recommandés : unités sur `CanonicalAnalyticsTracker`, hooks `useAnalyticsConsent`, E2E sur parcours génération/EDN.
