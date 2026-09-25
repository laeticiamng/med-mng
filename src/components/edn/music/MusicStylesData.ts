import { STYLES_MUSICAUX, type StyleMusical } from '@/config/stylesMusicaux';

/**
 * Styles musicaux (onglet Musique d'un item, sélecteurs historiques).
 * Dérivés du catalogue unique src/config/stylesMusicaux.ts (partagé avec le
 * serveur mm-generate-music) : même liste que le générateur /med-mng/create.
 */
export interface MusicStyle {
  value: string;
  label: string;
  description: string;
  voiceType?: 'male' | 'female' | 'both';
  energy?: 'low' | 'medium' | 'high';
  genre: string;
}

const ENERGIE: Record<StyleMusical['energie'], MusicStyle['energy']> = {
  calme: 'low',
  moyenne: 'medium',
  haute: 'high',
};

const GENRES: Record<string, string> = {
  'rap-francais': 'Hip-Hop',
  'slam': 'Hip-Hop',
  'pop': 'Pop',
  'electro': 'Pop',
  'lofi': 'Lo-fi',
  'chanson-francaise': 'Chanson',
  'acoustique': 'Chanson',
  'afrobeat': 'World',
  'reggae': 'World',
  'rock': 'Rock',
  'jazz': 'Jazz',
  'rnb': 'R&B',
  'comptine': 'Mnémotechnique',
};

export const musicStyles: MusicStyle[] = STYLES_MUSICAUX.map((style) => ({
  value: style.slug,
  label: style.libelle,
  description: style.description,
  voiceType: 'both',
  energy: ENERGIE[style.energie],
  genre: GENRES[style.slug] ?? 'Autres',
}));

export const getStylesByGenre = () => {
  const genres = Array.from(new Set(musicStyles.map(style => style.genre)));
  return genres.reduce((acc, genre) => {
    acc[genre] = musicStyles.filter(style => style.genre === genre);
    return acc;
  }, {} as Record<string, MusicStyle[]>);
};

export const getStylesByVoice = (voiceType: 'male' | 'female' | 'both') => {
  return musicStyles.filter(style =>
    style.voiceType === voiceType || style.voiceType === 'both'
  );
};

export const getStylesByEnergy = (energy: 'low' | 'medium' | 'high') => {
  return musicStyles.filter(style => style.energy === energy);
};
