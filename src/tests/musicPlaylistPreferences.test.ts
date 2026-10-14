import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Non-régression D5 (QA 14.10.2026) : la playlist interrogeait la table
// EmotionsCare user_music_preferences avec 5 colonnes inexistantes (HTTP 400).
const source = readFileSync('src/components/edn/music/MusicPlaylist.tsx', 'utf8');

describe('MusicPlaylist – préférences de lecture', () => {
  it("n'interroge plus la table EmotionsCare user_music_preferences", () => {
    expect(source).not.toContain('user_music_preferences');
  });

  it('utilise la table dédiée med_mng_player_preferences (lecture et écriture)', () => {
    expect(source.match(/med_mng_player_preferences/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('tolère un utilisateur sans préférences enregistrées (maybeSingle)', () => {
    expect(source).toContain('.maybeSingle()');
    expect(source).not.toMatch(/med_mng_player_preferences[\s\S]{0,200}\.single\(\)/);
  });
});
