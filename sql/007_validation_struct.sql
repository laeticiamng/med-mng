-- Items présents ?
SELECT COUNT(*) AS total_items FROM public.items;

-- Items sans compétences ?
SELECT i.id, i.slug
FROM public.items i
LEFT JOIN public.item_competences c ON c.item_id = i.id
GROUP BY i.id
HAVING COUNT(c.id) = 0;

-- Compteurs A/B par item (détecter manques)
SELECT i.id, i.slug,
  SUM((c.rang = 'A')::int) AS a_count,
  SUM((c.rang = 'B')::int) AS b_count
FROM public.items i
LEFT JOIN public.item_competences c ON c.item_id = i.id
GROUP BY i.id;

-- Tracks incomplets
SELECT * FROM public.generated_music_tracks
WHERE owner_id IS NULL OR item_id IS NULL OR mode IS NULL OR style IS NULL;

-- Segments invalides (timecodes)
SELECT * FROM public.lyrics_segments WHERE end_ms <= start_ms;

-- Doublons d'idx sur un track
SELECT track_id, idx, COUNT(*)
FROM public.lyrics_segments
GROUP BY track_id, idx
HAVING COUNT(*) > 1;
