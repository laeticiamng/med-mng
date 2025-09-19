# Lyrics Segmentation & Karaoke Flow

Cette note résume l'implémentation des paroles synchronisées côté MED-MNG.

## Tables & données

- `public.lyrics_segments`
  - Clef primaire composite `(track_id, idx)`.
  - Champs temps en millisecondes (`start_ms`, `end_ms`) et rôle optionnel (`intro`, `verse`, `chorus`, `marker`, etc.).
  - Référence directe à la piste (`track_id`) **et** à l'item canonique (`item_id`).
  - RLS stricte : seuls les propriétaires d'une piste (`generated_music_tracks.user_id`) ou le `service_role` peuvent lire/écrire.
- `public.lyrics_alignment_logs`
  - Historique des alignements (durée, méthode, confiance, métadonnées heuristiques).
  - RLS lecture/écriture propriétaire.
- Fonction `public.replace_lyrics_segments(track_id uuid, segments jsonb, log jsonb)`
  - Supprime les segments existants puis insère le lot fourni dans une transaction.
  - Persiste un log optionnel pour l'historique QA.

## Edge Function `lyrics-aligner`

- Entrée `{ action: 'align', trackId, lyrics? }`.
- Vérifie le propriétaire via le JWT (Authorization header).
- Normalise les paroles (texte, rôles, timestamps éventuels).
- Infère la durée via les métadonnées piste ou heuristique mots.
- Calcul des segments `start_ms` / `end_ms` pondérés par nombre de mots (≥ 800 ms par segment).
- Enregistre via `replace_lyrics_segments` avec un log (méthode `heuristic_v1`, confiance selon présence de timestamps).
- Réponse `{ success, segments, meta }` avec `confidence` et durée d’alignement.

## Hook `useSynchronizedLyrics`

- Charge les segments + dernier log pour un `songId` donné.
- `alignFromSource` invoque l'edge function et rafraîchit les données (avec quota IA).
- `saveSynchronizedLyrics` convertit les `LyricsLine` en segments et appelle `replace_lyrics_segments` (utilisé par l’éditeur).
- Fournit `exportLyrics` (LRC, SRT, TXT, JSON, Markdown) et `searchInLyrics`.
- Gestion temps : `LyricsLine.startMs` / `endMs` en ms, `LyricsLine.time` en secondes pour rétro-compatibilité UI.

## UI

- `KaraokeView` : liste scrollable, auto-scroll via `IntersectionObserver`, clic segment → `onSeek(startMs/1000)`.
- `KaraokePlayer` : barre de recherche, export multi-format, bouton de réalignement, affichage confiance log.
- `LyricsEditor` : import/export timestamps `[mm:ss]`, sauvegarde via `saveSynchronizedLyrics` (4 s par défaut si durée absente).

## Contrats & API rapides

```ts
// Edge function
POST /functions/v1/lyrics-aligner
{
  action: 'align',
  trackId: string,
  lyrics?: string | Array<{ text: string; role?: string; start_ms?: number; end_ms?: number }>
}

// Hook
const {
  lyricsData,
  alignmentLog,
  alignFromSource,
  saveSynchronizedLyrics,
  exportLyrics,
  searchInLyrics,
} = useSynchronizedLyrics(trackId);
```

## Notes QA

- Les segments sont garantis triés et non chevauchants via `replace_lyrics_segments`.
- Tolérance UI sur la recherche/scroll ±150 ms.
- Export JSON conforme à la structure `lyrics_segments` (start/end ms, rôle, texte).
- Logs disponibles pour audits (`run_at`, `duration_ms`, `confidence`, `metadata.total_words`, etc.).
