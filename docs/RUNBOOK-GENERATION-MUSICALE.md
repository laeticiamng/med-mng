# 🧭 Runbook – Génération Musicale Item → Chanson

## 🎯 Objectif
Garantir qu'un étudiant peut générer une chanson pour un item (modes A/B/AB) avec un style personnalisé et récupérer une piste finalisée avec paroles synchronisées.

## 📦 Périmètre
- **Services** : `musicOrchestrator`, `itemPromptService`, edge function `lyrics-aligner`, Supabase `generated_music_tracks` et `lyrics_segments`.
- **Données** : tables `items`, `generated_music_tracks`, `lyrics_segments`, métadonnées de track (`metadata.lyrics`).
- **Intégrations** : OpenAI (prompting), Suno (génération musicale), Supabase (RLS), analytics (`generate_*`).

## ✅ Checklist Go / No-Go
1. **Clés d'API valides** : `OPENAI_API_KEY`, `SUNO_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` présents et validés (`pnpm env:check`).
2. **Suno** : quota disponible (`curl -H "Authorization: Bearer $SUNO_API_KEY" https://api.suno.ai/v1/me`).
3. **OpenAI** : latence < 3s (`curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`).
4. **Supabase** : health OK (`curl https://<project>.supabase.co/rest/v1/?apikey=$SUPABASE_SERVICE_ROLE_KEY`).
5. **Rate-limit** : consulter métriques Redis/Upstash ou dashboard Supabase (`generated_music_tracks.rate_limit_remaining`).

## 🔎 Monitoring & Alerting
| Signal | Source | Seuil | Action |
| --- | --- | --- | --- |
| `generate_fail` (Suno) | Supabase `analytics-tracker` | > 3/min | Activer circuit breaker (flag `ENABLE_MUSIC_GENERATION=false`) |
| `generate_retry` | Logs orchestrator (Datadog) | p95 retries > 2 | Inspecter quotas Suno/OpenAI |
| Durée génération | Dashboard analytics | p95 > 90s | Vérifier latence OpenAI puis Suno |
| `lyrics_timecode_done` absence | Edge logs | Aucun event 10 min | Forcer fallback `metadata.lyrics` |

## 🛠️ Procédures Courantes
### 1. Incident Suno (HTTP 429/5xx)
1. Vérifier quota via `curl -H "Authorization: Bearer $SUNO_API_KEY" https://api.suno.ai/v1/me` (champ `quota_remaining`).
2. Mettre à jour message UX via `RateLimitNotice` si saturation > 10 min.
3. Activer circuit breaker : `supabase secrets set ENABLE_MUSIC_GENERATION false`.
4. Plan de reprise : rouvrir file `generated_music_tracks` (champ `status='queued'`) et relancer via dashboard admin.

### 2. Échec OpenAI (timeout ou 5xx)
1. Confirmer statut via `curl` OpenAI (`200 OK`).
2. Basculer sur prompts fallback : `itemPromptService.generateFallbackLyrics()`.
3. Réémettre jobs Suno depuis la page item (action « Rejouer ») ou via insertion manuelle `status='queued'`.

### 3. RLS / Écriture Supabase bloquée
1. Vérifier utilisateur via `select * from auth.users where id = '<uuid>';`.
2. Contrôler les politiques : `select policyname from pg_policies where tablename='generated_music_tracks';`.
3. En cas d'urgence, utiliser fonction `admin_finalize_track` (limiter l'accès, log obligatoire).

## 🔁 Reprise après annulation / crash
1. Inspecter les runs actifs : `select * from generated_music_tracks where status='processing';`.
2. Vérifier `activeRunRef` côté client (DevTools `localStorage.med-mng-active-run`).
3. Si l'utilisateur souhaite reprendre : déclencher `resume` via dashboard admin (`/admin/music-runs`) ou mise à jour API.

## 📤 Export & Communication
- **Status page** : publier incident `Suno latency` si > 30 min.
- **Support** : message type « Votre génération est mise en file, réessayez dans 10 minutes ».
- **Post-mortem** : documenter dans `docs/incidents/YYYY-MM-DD-suno.md`.

## 📚 Références
- [README – Parcours Item → Musique](../README.md#-parcours--item--musique-)
- [docs/ENVIRONMENT-VARIABLES.md](./ENVIRONMENT-VARIABLES.md)
- Source orchestrateur : `src/services/musicOrchestrator.ts`
