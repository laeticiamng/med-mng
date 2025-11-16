export interface MusicStyle {
  value: string;
  label: string;
  description: string;
  voiceType?: 'male' | 'female' | 'both';
  energy?: 'low' | 'medium' | 'high';
  genre: string;
}

// Styles musicaux populaires pour la génération de musique éducative
export const musicStyles: MusicStyle[] = [
  // Pop et variantes
  { value: 'pop-francaise', label: 'Pop Française', description: 'Moderne et accessible', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  { value: 'pop-melodique', label: 'Pop Mélodique', description: 'Accrocheur et commercial', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  { value: 'electropop', label: 'Electropop', description: 'Électronique et pop', voiceType: 'both', energy: 'high', genre: 'Pop' },
  { value: 'indie-pop', label: 'Indie Pop', description: 'Alternatif et créatif', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  { value: 'synthpop', label: 'Synthpop', description: 'Électronique rétro', voiceType: 'both', energy: 'high', genre: 'Pop' },
  
  // Chanson française
  { value: 'chanson-francaise', label: 'Chanson Française', description: 'Poétique et authentique', voiceType: 'both', energy: 'medium', genre: 'Chanson' },
  { value: 'chanson-moderne', label: 'Chanson Moderne', description: 'Nouvelle vague française', voiceType: 'both', energy: 'medium', genre: 'Chanson' },
  { value: 'variete-francaise', label: 'Variété Française', description: 'Grand public français', voiceType: 'both', energy: 'medium', genre: 'Variété' },
  
  // Hip-Hop/Rap
  { value: 'rap-francais', label: 'Rap Français', description: 'Urbain et authentique', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'rap-pedagogique', label: 'Rap Pédagogique', description: 'Éducatif et moderne', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'trap-francais', label: 'Trap Français', description: 'Moderne et rythmé', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'rap-conscient', label: 'Rap Conscient', description: 'Engagé et poétique', voiceType: 'both', energy: 'medium', genre: 'Hip-Hop' },
  
  // Rock
  { value: 'rock-francais', label: 'Rock Français', description: 'Puissant et hexagonal', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'rock-alternatif', label: 'Rock Alternatif', description: 'Non-conformiste', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'indie-rock', label: 'Indie Rock', description: 'Indépendant et créatif', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'soft-rock', label: 'Soft Rock', description: 'Mélodique et accessible', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  
  // Électronique
  { value: 'house-francaise', label: 'French House', description: 'Électronique à la française', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'electro-francaise', label: 'Électro Française', description: 'Touch française', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'techno', label: 'Techno', description: 'Répétitif et hypnotique', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'deep-house', label: 'Deep House', description: 'Profond et groovy', voiceType: 'both', energy: 'medium', genre: 'Électronique' },
  { value: 'synthwave', label: 'Synthwave', description: 'Rétro-futuriste', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  
  // Jazz
  { value: 'jazz-moderne', label: 'Jazz Moderne', description: 'Contemporain et créatif', voiceType: 'both', energy: 'medium', genre: 'Jazz' },
  { value: 'jazz-manouche', label: 'Jazz Manouche', description: 'Français authentique', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'smooth-jazz', label: 'Smooth Jazz', description: 'Doux et sophistiqué', voiceType: 'both', energy: 'low', genre: 'Jazz' },
  { value: 'nu-jazz', label: 'Nu-Jazz', description: 'Jazz électronique', voiceType: 'both', energy: 'medium', genre: 'Jazz' },
  { value: 'bossa-nova', label: 'Bossa Nova', description: 'Brésilien et chaleureux', voiceType: 'both', energy: 'low', genre: 'Jazz' },
  
  // Lo-fi et Chill
  { value: 'lofi-piano', label: 'Lo-fi Piano', description: 'Relaxant et contemplatif', voiceType: 'both', energy: 'low', genre: 'Lo-fi' },
  { value: 'lofi-hip-hop', label: 'Lo-fi Hip-Hop', description: 'Décontracté et moderne', voiceType: 'both', energy: 'low', genre: 'Lo-fi' },
  { value: 'chillhop', label: 'Chillhop', description: 'Mélodieux et apaisant', voiceType: 'both', energy: 'low', genre: 'Chill' },
  { value: 'chill-out', label: 'Chill Out', description: 'Relaxant et moderne', voiceType: 'both', energy: 'low', genre: 'Chill' },
  { value: 'downtempo', label: 'Downtempo', description: 'Électronique relaxant', voiceType: 'both', energy: 'low', genre: 'Électronique' },
  
  // Soul & R&B
  { value: 'rnb-francais', label: 'R&B Français', description: 'Soul à la française', voiceType: 'both', energy: 'medium', genre: 'R&B' },
  { value: 'neo-soul', label: 'Neo-Soul', description: 'Moderne et sophistiqué', voiceType: 'both', energy: 'medium', genre: 'Soul' },
  { value: 'soul-funk', label: 'Soul Funk', description: 'Groovy et rythmé', voiceType: 'both', energy: 'high', genre: 'Funk' },
  { value: 'funk', label: 'Funk', description: 'Groove et rythmé', voiceType: 'both', energy: 'high', genre: 'Funk' },
  
  // Ballades
  { value: 'ballade-francaise', label: 'Ballade Française', description: 'Romantique et touchante', voiceType: 'both', energy: 'low', genre: 'Ballade' },
  { value: 'slow', label: 'Slow', description: 'Romantique et doux', voiceType: 'both', energy: 'low', genre: 'Ballade' },
  { value: 'ballad-pop', label: 'Ballad Pop', description: 'Émotionnelle et mélodique', voiceType: 'both', energy: 'low', genre: 'Pop' },
  
  // World Music
  { value: 'reggae', label: 'Reggae', description: 'Jamaïcain décontracté', voiceType: 'both', energy: 'medium', genre: 'World' },
  { value: 'afrobeat', label: 'Afrobeat', description: 'Africain et moderne', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'dancehall', label: 'Dancehall', description: 'Jamaïcain énergique', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'salsa', label: 'Salsa', description: 'Latino dansant', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'zouk', label: 'Zouk', description: 'Antillais et sensuel', voiceType: 'both', energy: 'medium', genre: 'World' },
  
  // Folk & Country
  { value: 'folk-moderne', label: 'Folk Moderne', description: 'Acoustique et authentique', voiceType: 'both', energy: 'medium', genre: 'Folk' },
  { value: 'indie-folk', label: 'Indie Folk', description: 'Alternatif et intimiste', voiceType: 'both', energy: 'low', genre: 'Folk' },
  { value: 'country-moderne', label: 'Country Moderne', description: 'Américain accessible', voiceType: 'both', energy: 'medium', genre: 'Country' },
  { value: 'singer-songwriter', label: 'Singer-Songwriter', description: 'Personnel et intimiste', voiceType: 'both', energy: 'low', genre: 'Folk' },
  
  // Classique
  { value: 'classique-moderne', label: 'Classique Moderne', description: 'Orchestral contemporain', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  { value: 'piano-classique', label: 'Piano Classique', description: 'Élégant et raffiné', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  { value: 'classical-orchestral', label: 'Orchestral Classique', description: 'Grandiose et majestueux', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  { value: 'baroque', label: 'Baroque', description: 'Sophistiqué et structuré', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  
  // Dance
  { value: 'dance-commerciale', label: 'Dance Commerciale', description: 'Dansant et accessible', voiceType: 'both', energy: 'high', genre: 'Dance' },
  { value: 'euro-dance', label: 'Euro Dance', description: 'Européen énergique', voiceType: 'both', energy: 'high', genre: 'Dance' },
  { value: 'progressive-house', label: 'Progressive House', description: 'Évolutif et puissant', voiceType: 'both', energy: 'high', genre: 'Dance' },
  
  // Styles fusion
  { value: 'trip-hop', label: 'Trip-Hop', description: 'Hip-hop atmosphérique', voiceType: 'both', energy: 'low', genre: 'Fusion' },
  { value: 'electro-swing', label: 'Electro Swing', description: 'Swing électronique', voiceType: 'both', energy: 'high', genre: 'Fusion' },
  { value: 'jazz-fusion', label: 'Jazz Fusion', description: 'Électronique et innovant', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  
  // Styles relaxants
  { value: 'ambient-chill', label: 'Ambient Chill', description: 'Atmosphérique et méditatif', voiceType: 'both', energy: 'low', genre: 'Ambient' },
  { value: 'meditation-music', label: 'Musique de Méditation', description: 'Apaisant et spirituel', voiceType: 'both', energy: 'low', genre: 'New Age' },
  { value: 'spa-music', label: 'Musique Spa', description: 'Détente et bien-être', voiceType: 'both', energy: 'low', genre: 'Relaxation' }
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