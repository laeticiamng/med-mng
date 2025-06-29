
export interface MusicStyle {
  value: string;
  label: string;
  description: string;
  voiceType?: 'male' | 'female' | 'both';
  energy?: 'low' | 'medium' | 'high';
  genre: string;
}

export const musicStyles: MusicStyle[] = [
  // Styles classiques et académiques
  { value: 'classical-piano', label: 'Piano Classique', description: 'Élégant et raffiné', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  { value: 'classical-orchestral', label: 'Orchestral Classique', description: 'Grandiose et majestueux', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  { value: 'baroque', label: 'Baroque', description: 'Sophistiqué et structuré', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  
  // Jazz et ses variantes
  { value: 'jazz-smooth', label: 'Jazz Doux', description: 'Relaxant et sophistiqué', voiceType: 'both', energy: 'low', genre: 'Jazz' },
  { value: 'jazz-swing', label: 'Jazz Swing', description: 'Rythmé et entraînant', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'jazz-moderne', label: 'Jazz Moderne', description: 'Contemporain et créatif', voiceType: 'both', energy: 'medium', genre: 'Jazz' },
  { value: 'bossa-nova', label: 'Bossa Nova', description: 'Brésilien et chaleureux', voiceType: 'both', energy: 'low', genre: 'Jazz' },
  
  // Lo-fi et Chill
  { value: 'lofi-piano', label: 'Lo-fi Piano Doux', description: 'Relaxant et contemplatif', voiceType: 'both', energy: 'low', genre: 'Lo-fi' },
  { value: 'lofi-hip-hop', label: 'Lo-fi Hip-Hop', description: 'Moderne et décontracté', voiceType: 'both', energy: 'low', genre: 'Lo-fi' },
  { value: 'chillhop', label: 'Chillhop', description: 'Mélodieux et apaisant', voiceType: 'both', energy: 'low', genre: 'Chill' },
  { value: 'ambient-chill', label: 'Ambient Chill', description: 'Atmosphérique et méditatif', voiceType: 'both', energy: 'low', genre: 'Ambient' },
  
  // Électronique
  { value: 'electro-chill', label: 'Electro Chill', description: 'Moderne et atmosphérique', voiceType: 'both', energy: 'medium', genre: 'Électronique' },
  { value: 'synthwave', label: 'Synthwave', description: 'Rétro-futuriste et énergique', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'downtempo', label: 'Downtempo', description: 'Électronique relaxant', voiceType: 'both', energy: 'low', genre: 'Électronique' },
  { value: 'deep-house', label: 'Deep House', description: 'Profond et hypnotique', voiceType: 'both', energy: 'medium', genre: 'Électronique' },
  
  // Soul, R&B et variantes
  { value: 'soul-rnb', label: 'Soul R&B', description: 'Émouvant et expressif', voiceType: 'both', energy: 'medium', genre: 'Soul' },
  { value: 'neo-soul', label: 'Neo-Soul', description: 'Moderne et soulful', voiceType: 'both', energy: 'medium', genre: 'Soul' },
  { value: 'gospel', label: 'Gospel', description: 'Spirituel et puissant', voiceType: 'both', energy: 'high', genre: 'Gospel' },
  { value: 'blues', label: 'Blues', description: 'Authentique et émotionnel', voiceType: 'both', energy: 'medium', genre: 'Blues' },
  
  // Hip-Hop et Rap
  { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient', description: 'Engagé et rythmé', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'rap-pedagogique', label: 'Rap Pédagogique', description: 'Éducatif et moderne', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'trap-melodic', label: 'Trap Mélodique', description: 'Moderne et accrocheur', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  
  // World Music
  { value: 'afrobeat', label: 'Afrobeat Énergique', description: 'Africain et dynamique', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'reggae', label: 'Reggae', description: 'Jamaïcain et décontracté', voiceType: 'both', energy: 'medium', genre: 'World' },
  { value: 'latin-jazz', label: 'Jazz Latin', description: 'Tropical et rythmé', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'flamenco', label: 'Flamenco', description: 'Espagnol et passionné', voiceType: 'both', energy: 'high', genre: 'World' },
  
  // Folk et Acoustique
  { value: 'folk-acoustic', label: 'Folk Acoustique', description: 'Naturel et authentique', voiceType: 'both', energy: 'low', genre: 'Folk' },
  { value: 'indie-folk', label: 'Indie Folk', description: 'Moderne et intimiste', voiceType: 'both', energy: 'medium', genre: 'Folk' },
  { value: 'country', label: 'Country', description: 'Américain et narratif', voiceType: 'both', energy: 'medium', genre: 'Country' },
  
  // Pop et variantes
  { value: 'pop-melodic', label: 'Pop Mélodique', description: 'Accrocheur et accessible', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  { value: 'indie-pop', label: 'Indie Pop', description: 'Alternatif et créatif', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  { value: 'synthpop', label: 'Synthpop', description: 'Électronique et pop', voiceType: 'both', energy: 'high', genre: 'Pop' },
  
  // Rock et variantes
  { value: 'soft-rock', label: 'Soft Rock', description: 'Doux et mélodique', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  { value: 'indie-rock', label: 'Indie Rock', description: 'Alternatif et énergique', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'alternative', label: 'Alternative', description: 'Non-conventionnel et créatif', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  
  // Styles spécifiques par voix
  { value: 'ballad-female', label: 'Ballade (Voix Féminine)', description: 'Émouvante et expressive', voiceType: 'female', energy: 'low', genre: 'Ballade' },
  { value: 'ballad-male', label: 'Ballade (Voix Masculine)', description: 'Profonde et touchante', voiceType: 'male', energy: 'low', genre: 'Ballade' },
  { value: 'opera-female', label: 'Opéra (Soprano)', description: 'Dramatique et puissant', voiceType: 'female', energy: 'high', genre: 'Classique' },
  { value: 'opera-male', label: 'Opéra (Baryton)', description: 'Noble et imposant', voiceType: 'male', energy: 'high', genre: 'Classique' }
];

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
