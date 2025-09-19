# 🧭 Runbook – Synchronisation des Paroles

## 🎯 Objectif
Assurer que chaque piste générée dispose de paroles synchronisées fiables avec un décalage p95 < 150 ms et un fallback propre lorsque l'alignement échoue.

## 📦 Périmètre
- Edge function `lyrics-aligner`
- Table `lyrics_segments`
- Player `SynchronizedLyricsPlayer`
- RPC `replace_lyrics_segments`
- Analytics `lyrics_timecode_done`, `seek_segment`

## ✅ Pré-vol
1. **Santé edge function** : `supabase functions list | grep lyrics-aligner` doit retourner `ACTIVE`.
2. **Latence alignement** : dashboard > 150 ms => ouvrir incident.
3. **Accès Supabase** : `select count(*) from lyrics_segments where track_id = '<id>'`.
4. **Logs disponibles** : `supabase functions logs lyrics-aligner --tail` opérationnel.

## 🔎 Indicateurs clés
| Signal | Source | Seuil | Action |
| --- | --- | --- | --- |
| Durée alignement | Logs edge `duration_ms` | p95 > 15s | Inspecter charge Suno, vérifier taille paroles |
| Confiance moyenne | Logs edge `confidence` | < 0.7 | Passer en fallback manuel + alerter produit |
| Absence segments | Dashboard analytics | item sans segments > 30 min | Lancer resync manuel |

## 🛠️ Procédures
### 1. Alignement échoué
1. Vérifier logs : `supabase functions logs lyrics-aligner --tail`.
2. Si erreur Suno timing, mettre à jour le track `update generated_music_tracks set status='queued' where id='<id>';` puis relancer la génération.
3. Forcer fallback : `update generated_music_tracks set metadata = jsonb_set(metadata, '{lyricsSource}', '"metadata"') where id = '<id>';`.
4. Informer support via template « Paroles non synchronisées – fallback activé ».

### 2. Décalage > 150 ms (retours utilisateurs)
1. Rejouer piste via interface admin (« Prévisualiser ») et mesurer le décalage.
2. Ajuster heuristique : mettre à jour `lyrics_segments` (`start_ms += offset`) ou relancer alignement avec paramètre ajusté.
3. Valider via test Playwright `pnpm test:e2e:cypress --spec tests/e2e/music/music-generation.spec.ts` (scénario seek).

### 3. RPC `replace_lyrics_segments` en erreur
1. Vérifier payload : segments triés, `idx` et `start_ms` croissants.
2. Utiliser tests automatisés `pnpm test -- --filter replace_lyrics_segments` en local si disponibles.
3. Si `track_id` invalide, vérifier RLS `generated_music_tracks` (propriété utilisateur).

## 🔁 Backfill / Re-synchronisation massive
1. Exporter tracks : `select id from generated_music_tracks where status='ready' and not exists (select 1 from lyrics_segments where track_id=id);`.
2. Relancer alignement en lot via `supabase functions invoke lyrics-aligner --payload '{"track_id":"<id>"}'`.
3. Contrôle qualité : échantillon manuel 10% via interface admin.

## 📤 Communication
- **Alerting** : Slack `#incidents-learning` si > 10 items impactés.
- **Status page** : « Karaoke degraded » si alignement indisponible.
- **Documentation** : mettre à jour `docs/lyrics-segmentation.md` avec le ticket incident.

## 📚 Références
- [docs/lyrics-segmentation.md](./lyrics-segmentation.md)
- Player : `src/components/music/SynchronizedLyricsPlayer.tsx`
- Hook : `src/hooks/useSynchronizedLyrics.ts`
