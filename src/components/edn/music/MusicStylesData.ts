
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
  { value: 'opera-dramatic', label: 'Opéra Dramatique', description: 'Puissant et théâtral', voiceType: 'both', energy: 'high', genre: 'Classique' },
  { value: 'chamber-music', label: 'Musique de Chambre', description: 'Intime et raffiné', voiceType: 'both', energy: 'low', genre: 'Classique' },
  { value: 'romantic-classical', label: 'Classique Romantique', description: 'Expressif et émotionnel', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  { value: 'contemporary-classical', label: 'Classique Contemporain', description: 'Moderne et innovant', voiceType: 'both', energy: 'medium', genre: 'Classique' },
  
  // Jazz et ses variantes
  { value: 'jazz-smooth', label: 'Jazz Doux', description: 'Relaxant et sophistiqué', voiceType: 'both', energy: 'low', genre: 'Jazz' },
  { value: 'jazz-swing', label: 'Jazz Swing', description: 'Rythmé et entraînant', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'jazz-moderne', label: 'Jazz Moderne', description: 'Contemporain et créatif', voiceType: 'both', energy: 'medium', genre: 'Jazz' },
  { value: 'bossa-nova', label: 'Bossa Nova', description: 'Brésilien et chaleureux', voiceType: 'both', energy: 'low', genre: 'Jazz' },
  { value: 'jazz-fusion', label: 'Jazz Fusion', description: 'Électronique et innovant', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'bebop', label: 'Bebop', description: 'Virtuose et improvisé', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'cool-jazz', label: 'Cool Jazz', description: 'Détendu et sophistiqué', voiceType: 'both', energy: 'low', genre: 'Jazz' },
  { value: 'hard-bop', label: 'Hard Bop', description: 'Énergique et blues', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'free-jazz', label: 'Free Jazz', description: 'Expérimental et avant-garde', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'latin-jazz', label: 'Jazz Latin', description: 'Tropical et rythmé', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  { value: 'gypsy-jazz', label: 'Jazz Manouche', description: 'Acoustique et virtuose', voiceType: 'both', energy: 'high', genre: 'Jazz' },
  
  // Lo-fi et Chill
  { value: 'lofi-piano', label: 'Lo-fi Piano Doux', description: 'Relaxant et contemplatif', voiceType: 'both', energy: 'low', genre: 'Lo-fi' },
  { value: 'lofi-hip-hop', label: 'Lo-fi Hip-Hop', description: 'Moderne et décontracté', voiceType: 'both', energy: 'low', genre: 'Lo-fi' },
  { value: 'chillhop', label: 'Chillhop', description: 'Mélodieux et apaisant', voiceType: 'both', energy: 'low', genre: 'Chill' },
  { value: 'ambient-chill', label: 'Ambient Chill', description: 'Atmosphérique et méditatif', voiceType: 'both', energy: 'low', genre: 'Ambient' },
  { value: 'vapor-wave', label: 'Vaporwave', description: 'Rétro et nostalgique', voiceType: 'both', energy: 'low', genre: 'Electronic' },
  { value: 'chillstep', label: 'Chillstep', description: 'Dubstep relaxant', voiceType: 'both', energy: 'low', genre: 'Chill' },
  { value: 'future-garage', label: 'Future Garage', description: 'Mélancolique et spatial', voiceType: 'both', energy: 'low', genre: 'Chill' },
  
  // Électronique
  { value: 'electro-chill', label: 'Electro Chill', description: 'Moderne et atmosphérique', voiceType: 'both', energy: 'medium', genre: 'Électronique' },
  { value: 'synthwave', label: 'Synthwave', description: 'Rétro-futuriste et énergique', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'downtempo', label: 'Downtempo', description: 'Électronique relaxant', voiceType: 'both', energy: 'low', genre: 'Électronique' },
  { value: 'deep-house', label: 'Deep House', description: 'Profond et hypnotique', voiceType: 'both', energy: 'medium', genre: 'Électronique' },
  { value: 'techno-melodique', label: 'Techno Mélodique', description: 'Rythmé et moderne', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'drum-and-bass', label: 'Drum & Bass', description: 'Rapide et énergique', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'dubstep-melodic', label: 'Dubstep Mélodique', description: 'Puissant et émotionnel', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'trance', label: 'Trance', description: 'Euphorique et hypnotique', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'progressive-house', label: 'Progressive House', description: 'Évolutif et captivant', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'minimal-techno', label: 'Minimal Techno', description: 'Épuré et répétitif', voiceType: 'both', energy: 'medium', genre: 'Électronique' },
  { value: 'acid-house', label: 'Acid House', description: 'Psychédélique et dansant', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'uk-garage', label: 'UK Garage', description: 'Syncopé et urbain', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'breakbeat', label: 'Breakbeat', description: 'Rythmé et cassé', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  { value: 'industrial', label: 'Industrial', description: 'Sombre et mécanique', voiceType: 'both', energy: 'high', genre: 'Électronique' },
  
  // Soul, R&B et variantes
  { value: 'soul-rnb', label: 'Soul R&B', description: 'Émouvant et expressif', voiceType: 'both', energy: 'medium', genre: 'Soul' },
  { value: 'neo-soul', label: 'Neo-Soul', description: 'Moderne et soulful', voiceType: 'both', energy: 'medium', genre: 'Soul' },
  { value: 'gospel', label: 'Gospel', description: 'Spirituel et puissant', voiceType: 'both', energy: 'high', genre: 'Gospel' },
  { value: 'blues', label: 'Blues', description: 'Authentique et émotionnel', voiceType: 'both', energy: 'medium', genre: 'Blues' },
  { value: 'motown', label: 'Motown', description: 'Rétro et groovy', voiceType: 'both', energy: 'high', genre: 'Soul' },
  { value: 'funk', label: 'Funk', description: 'Groove et rythmé', voiceType: 'both', energy: 'high', genre: 'Funk' },
  { value: 'disco', label: 'Disco', description: 'Dansant et festif', voiceType: 'both', energy: 'high', genre: 'Disco' },
  { value: 'contemporary-rnb', label: 'R&B Contemporain', description: 'Moderne et sophistiqué', voiceType: 'both', energy: 'medium', genre: 'R&B' },
  
  // Hip-Hop et Rap
  { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient', description: 'Engagé et rythmé', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'rap-pedagogique', label: 'Rap Pédagogique', description: 'Éducatif et moderne', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'trap-melodic', label: 'Trap Mélodique', description: 'Moderne et accrocheur', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'old-school-rap', label: 'Rap Old School', description: 'Authentique et classique', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'boom-bap', label: 'Boom Bap', description: 'Beats lourds et classiques', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'gangsta-rap', label: 'Gangsta Rap', description: 'Dur et authentique', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  { value: 'conscious-rap', label: 'Rap Conscient', description: 'Intelligent et engagé', voiceType: 'both', energy: 'medium', genre: 'Hip-Hop' },
  { value: 'mumble-rap', label: 'Mumble Rap', description: 'Moderne et mélodique', voiceType: 'both', energy: 'medium', genre: 'Hip-Hop' },
  { value: 'drill', label: 'Drill', description: 'Sombre et intense', voiceType: 'both', energy: 'high', genre: 'Hip-Hop' },
  
  // World Music
  { value: 'afrobeat', label: 'Afrobeat Énergique', description: 'Africain et dynamique', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'reggae', label: 'Reggae', description: 'Jamaïcain et décontracté', voiceType: 'both', energy: 'medium', genre: 'World' },
  { value: 'dancehall', label: 'Dancehall', description: 'Jamaïcain énergique', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'latin-jazz', label: 'Jazz Latin', description: 'Tropical et rythmé', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'flamenco', label: 'Flamenco', description: 'Espagnol et passionné', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'salsa', label: 'Salsa', description: 'Dansant et festif', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'tango', label: 'Tango', description: 'Argentin et dramatique', voiceType: 'both', energy: 'medium', genre: 'World' },
  { value: 'oriental-fusion', label: 'Oriental Fusion', description: 'Exotique et moderne', voiceType: 'both', energy: 'medium', genre: 'World' },
  { value: 'bollywood', label: 'Bollywood', description: 'Indien et coloré', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'k-pop', label: 'K-Pop', description: 'Coréen et moderne', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'j-pop', label: 'J-Pop', description: 'Japonais et mélodique', voiceType: 'both', energy: 'medium', genre: 'World' },
  { value: 'cumbia', label: 'Cumbia', description: 'Colombien et festif', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'bossa-nova', label: 'Bossa Nova', description: 'Brésilien et doux', voiceType: 'both', energy: 'low', genre: 'World' },
  { value: 'samba', label: 'Samba', description: 'Brésilien et festif', voiceType: 'both', energy: 'high', genre: 'World' },
  { value: 'fado', label: 'Fado', description: 'Portugais et mélancolique', voiceType: 'both', energy: 'low', genre: 'World' },
  { value: 'mariachi', label: 'Mariachi', description: 'Mexicain et traditionnel', voiceType: 'both', energy: 'high', genre: 'World' },
  
  // Folk et Acoustique
  { value: 'folk-acoustic', label: 'Folk Acoustique', description: 'Naturel et authentique', voiceType: 'both', energy: 'low', genre: 'Folk' },
  { value: 'indie-folk', label: 'Indie Folk', description: 'Moderne et intimiste', voiceType: 'both', energy: 'medium', genre: 'Folk' },
  { value: 'country', label: 'Country', description: 'Américain et narratif', voiceType: 'both', energy: 'medium', genre: 'Country' },
  { value: 'bluegrass', label: 'Bluegrass', description: 'Traditionnel et virtuose', voiceType: 'both', energy: 'high', genre: 'Folk' },
  { value: 'celtic', label: 'Celtique', description: 'Irlandais et mystique', voiceType: 'both', energy: 'medium', genre: 'Folk' },
  { value: 'americana', label: 'Americana', description: 'Américain authentique', voiceType: 'both', energy: 'medium', genre: 'Folk' },
  { value: 'singer-songwriter', label: 'Singer-Songwriter', description: 'Personnel et intimiste', voiceType: 'both', energy: 'low', genre: 'Folk' },
  { value: 'alt-country', label: 'Alt-Country', description: 'Country alternatif', voiceType: 'both', energy: 'medium', genre: 'Country' },
  
  // Pop et variantes
  { value: 'pop-melodic', label: 'Pop Mélodique', description: 'Accrocheur et accessible', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  { value: 'indie-pop', label: 'Indie Pop', description: 'Alternatif et créatif', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  { value: 'synthpop', label: 'Synthpop', description: 'Électronique et pop', voiceType: 'both', energy: 'high', genre: 'Pop' },
  { value: 'electropop', label: 'Electropop', description: 'Moderne et dansant', voiceType: 'both', energy: 'high', genre: 'Pop' },
  { value: 'dream-pop', label: 'Dream Pop', description: 'Éthéré et atmosphérique', voiceType: 'both', energy: 'low', genre: 'Pop' },
  { value: 'bubblegum-pop', label: 'Bubblegum Pop', description: 'Sucré et accrocheur', voiceType: 'both', energy: 'high', genre: 'Pop' },
  { value: 'teen-pop', label: 'Teen Pop', description: 'Jeune et énergique', voiceType: 'both', energy: 'high', genre: 'Pop' },
  { value: 'art-pop', label: 'Art Pop', description: 'Artistique et expérimental', voiceType: 'both', energy: 'medium', genre: 'Pop' },
  
  // Rock et variantes
  { value: 'soft-rock', label: 'Soft Rock', description: 'Doux et mélodique', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  { value: 'indie-rock', label: 'Indie Rock', description: 'Alternatif et énergique', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'alternative', label: 'Alternative', description: 'Non-conventionnel et créatif', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  { value: 'progressive-rock', label: 'Rock Progressif', description: 'Complexe et artistique', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'psychedelic', label: 'Psychédélique', description: 'Expérimental et coloré', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  { value: 'hard-rock', label: 'Hard Rock', description: 'Puissant et énergique', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'punk', label: 'Punk', description: 'Rebelle et rapide', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'grunge', label: 'Grunge', description: 'Alternatif des années 90', voiceType: 'both', energy: 'high', genre: 'Rock' },
  { value: 'post-rock', label: 'Post-Rock', description: 'Instrumental et épique', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  { value: 'shoegaze', label: 'Shoegaze', description: 'Atmosphérique et brumeux', voiceType: 'both', energy: 'medium', genre: 'Rock' },
  { value: 'garage-rock', label: 'Garage Rock', description: 'Brut et énergique', voiceType: 'both', energy: 'high', genre: 'Rock' },
  
  // Metal
  { value: 'heavy-metal', label: 'Heavy Metal', description: 'Puissant et classique', voiceType: 'both', energy: 'high', genre: 'Metal' },
  { value: 'death-metal', label: 'Death Metal', description: 'Extrême et technique', voiceType: 'male', energy: 'high', genre: 'Metal' },
  { value: 'black-metal', label: 'Black Metal', description: 'Sombre et atmosphérique', voiceType: 'male', energy: 'high', genre: 'Metal' },
  { value: 'power-metal', label: 'Power Metal', description: 'Épique et mélodique', voiceType: 'both', energy: 'high', genre: 'Metal' },
  { value: 'symphonic-metal', label: 'Metal Symphonique', description: 'Orchestral et puissant', voiceType: 'female', energy: 'high', genre: 'Metal' },
  { value: 'prog-metal', label: 'Metal Progressif', description: 'Technique et complexe', voiceType: 'both', energy: 'high', genre: 'Metal' },
  { value: 'doom-metal', label: 'Doom Metal', description: 'Lent et lourd', voiceType: 'both', energy: 'medium', genre: 'Metal' },
  
  // Styles spécifiques par voix
  { value: 'ballad-female', label: 'Ballade (Voix Féminine)', description: 'Émouvante et expressive', voiceType: 'female', energy: 'low', genre: 'Ballade' },
  { value: 'ballad-male', label: 'Ballade (Voix Masculine)', description: 'Profonde et touchante', voiceType: 'male', energy: 'low', genre: 'Ballade' },
  { value: 'chanson-francaise', label: 'Chanson Française', description: 'Poétique et classique', voiceType: 'both', energy: 'medium', genre: 'Chanson' },
  { value: 'cabaret', label: 'Cabaret', description: 'Théâtral et sophistiqué', voiceType: 'both', energy: 'medium', genre: 'Chanson' },
  
  // Nouveaux styles créatifs
  { value: 'ambient-orchestral', label: 'Orchestral Ambient', description: 'Cinématographique et épique', voiceType: 'both', energy: 'medium', genre: 'Cinematic' },
  { value: 'meditation-music', label: 'Musique de Méditation', description: 'Apaisant et spirituel', voiceType: 'both', energy: 'low', genre: 'New Age' },
  { value: 'experimental-electronic', label: 'Électronique Expérimental', description: 'Avant-garde et innovant', voiceType: 'both', energy: 'medium', genre: 'Experimental' },
  { value: 'minimal-techno', label: 'Minimal Techno', description: 'Répétitif et hypnotique', voiceType: 'both', energy: 'medium', genre: 'Electronic' },
  { value: 'acoustic-singer-songwriter', label: 'Singer-Songwriter Acoustique', description: 'Intimiste et personnel', voiceType: 'both', energy: 'low', genre: 'Acoustic' },
  
  // Styles de danse et club
  { value: 'house', label: 'House', description: 'Dansant et répétitif', voiceType: 'both', energy: 'high', genre: 'Dance' },
  { value: 'euro-dance', label: 'Euro Dance', description: 'Européen et énergique', voiceType: 'both', energy: 'high', genre: 'Dance' },
  { value: 'big-room', label: 'Big Room', description: 'Festival et massif', voiceType: 'both', energy: 'high', genre: 'Dance' },
  { value: 'future-bass', label: 'Future Bass', description: 'Moderne et émotionnel', voiceType: 'both', energy: 'high', genre: 'Dance' },
  
  // Styles relaxants et thérapeutiques
  { value: 'nature-sounds', label: 'Sons de la Nature', description: 'Naturel et apaisant', voiceType: 'both', energy: 'low', genre: 'Relaxation' },
  { value: 'spa-music', label: 'Musique Spa', description: 'Détente et bien-être', voiceType: 'both', energy: 'low', genre: 'Relaxation' },
  { value: 'yoga-music', label: 'Musique Yoga', description: 'Méditative et fluide', voiceType: 'both', energy: 'low', genre: 'Relaxation' },
  { value: 'white-noise', label: 'Bruit Blanc', description: 'Constant et neutre', voiceType: 'both', energy: 'low', genre: 'Relaxation' },
  
  // Styles vintage et rétro
  { value: 'swing', label: 'Swing', description: 'Années 40 et dansant', voiceType: 'both', energy: 'high', genre: 'Vintage' },
  { value: 'rockabilly', label: 'Rockabilly', description: 'Années 50 énergique', voiceType: 'both', energy: 'high', genre: 'Vintage' },
  { value: 'doo-wop', label: 'Doo-Wop', description: 'Années 50 harmonieux', voiceType: 'both', energy: 'medium', genre: 'Vintage' },
  { value: 'surf-rock', label: 'Surf Rock', description: 'Années 60 californien', voiceType: 'both', energy: 'high', genre: 'Vintage' },
  
  // Styles fusion et hybrides
  { value: 'nu-jazz', label: 'Nu-Jazz', description: 'Jazz moderne électronique', voiceType: 'both', energy: 'medium', genre: 'Fusion' },
  { value: 'trip-hop', label: 'Trip-Hop', description: 'Hip-hop atmosphérique', voiceType: 'both', energy: 'low', genre: 'Fusion' },
  { value: 'electro-swing', label: 'Electro Swing', description: 'Swing électronique', voiceType: 'both', energy: 'high', genre: 'Fusion' },
  { value: 'jazz-hop', label: 'Jazz-Hop', description: 'Jazz et hip-hop', voiceType: 'both', energy: 'medium', genre: 'Fusion' },
  { value: 'world-fusion', label: 'World Fusion', description: 'Mélange mondial', voiceType: 'both', energy: 'medium', genre: 'Fusion' }
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
