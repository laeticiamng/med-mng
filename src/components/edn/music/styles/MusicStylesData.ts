
export interface MusicStyle {
  value: string;
  label: string;
  category: string;
  description: string;
  mood: string[];
  compatibility: string[];
  premium?: boolean;
}

export const musicStylesCategories = {
  classical: 'Classique & Orchestral',
  electronic: 'Électronique & Synthétique',
  world: 'Musiques du Monde',
  jazz: 'Jazz & Blues',
  rock: 'Rock & Metal',
  urban: 'Urbain & Hip-Hop',
  ambient: 'Ambient & Relaxation',
  cinematic: 'Cinématique & Épique',
  folk: 'Folk & Acoustique'
};

export const premiumMusicStyles: MusicStyle[] = [
  // Classique & Orchestral
  {
    value: 'symphonie-classique',
    label: 'Symphonie Classique',
    category: 'classical',
    description: 'Orchestration complète avec cordes, cuivres et bois',
    mood: ['noble', 'dramatique', 'élégant'],
    compatibility: ['piano-solo', 'chamber-music']
  },
  {
    value: 'piano-solo',
    label: 'Piano Solo Romantique',
    category: 'classical',
    description: 'Piano expressif style romantique du 19ème siècle',
    mood: ['mélancolique', 'passionné', 'introspectif'],
    compatibility: ['symphonie-classique', 'chamber-music']
  },
  {
    value: 'chamber-music',
    label: 'Musique de Chambre',
    category: 'classical',
    description: 'Ensemble de chambre intime et raffiné',
    mood: ['sophistiqué', 'intime', 'harmonieux'],
    compatibility: ['piano-solo', 'symphonie-classique']
  },
  {
    value: 'baroque-moderne',
    label: 'Baroque Moderne',
    category: 'classical',
    description: 'Fusion entre style baroque et sonorités contemporaines',
    mood: ['précis', 'ornemental', 'virtuose'],
    compatibility: ['neo-classical', 'chamber-music'],
    premium: true
  },

  // Électronique & Synthétique
  {
    value: 'synthwave-retro',
    label: 'Synthwave Rétro',
    category: 'electronic',
    description: 'Synthétiseurs vintage des années 80 remixés',
    mood: ['nostalgique', 'énergique', 'futuriste'],
    compatibility: ['cyberpunk', 'darkwave']
  },
  {
    value: 'deep-house',
    label: 'Deep House Sophistiqué',
    category: 'electronic',
    description: 'House profonde et mélodique avec basslines groovy',
    mood: ['hypnotique', 'sophistiqué', 'dansant'],
    compatibility: ['tech-house', 'progressive-house']
  },
  {
    value: 'ambient-techno',
    label: 'Techno Ambient',
    category: 'electronic',
    description: 'Techno atmosphérique et contemplative',
    mood: ['contemplatif', 'rythmé', 'spatial'],
    compatibility: ['minimal-techno', 'drone-ambient']
  },
  {
    value: 'cyberpunk',
    label: 'Cyberpunk Futuriste',
    category: 'electronic',
    description: 'Sonorités électroniques sombres et futuristes',
    mood: ['dystopique', 'intense', 'cybernétique'],
    compatibility: ['synthwave-retro', 'darkwave'],
    premium: true
  },

  // Musiques du Monde
  {
    value: 'flamenco-fusion',
    label: 'Flamenco Fusion',
    category: 'world',
    description: 'Guitare flamenca avec éléments modernes',
    mood: ['passionné', 'rythmé', 'ardent'],
    compatibility: ['latin-jazz', 'world-fusion']
  },
  {
    value: 'gamelan-moderne',
    label: 'Gamelan Moderne',
    category: 'world',
    description: 'Orchestres métalliques balinais revisités',
    mood: ['mystique', 'méditatif', 'exotique'],
    compatibility: ['world-fusion', 'ethnic-ambient'],
    premium: true
  },
  {
    value: 'oud-electronique',
    label: 'Oud Électronique',
    category: 'world',
    description: 'Oud traditionnel avec production électronique',
    mood: ['oriental', 'moderne', 'mélodique'],
    compatibility: ['middle-eastern', 'world-fusion'],
    premium: true
  },
  {
    value: 'taiko-epic',
    label: 'Taiko Épique',
    category: 'world',
    description: 'Tambours japonais puissants et cinématiques',
    mood: ['puissant', 'dramatique', 'tribal'],
    compatibility: ['orchestral-epic', 'world-fusion']
  },

  // Jazz & Blues
  {
    value: 'jazz-fusion-moderne',
    label: 'Jazz Fusion Moderne',
    category: 'jazz',
    description: 'Jazz contemporain avec éléments électroniques',
    mood: ['sophistiqué', 'improvisé', 'complexe'],
    compatibility: ['neo-soul', 'smooth-jazz']
  },
  {
    value: 'blues-electrique',
    label: 'Blues Électrique Intense',
    category: 'jazz',
    description: 'Guitare blues électrique avec groove puissant',
    mood: ['expressif', 'authentique', 'émotionnel'],
    compatibility: ['rock-blues', 'soul-blues']
  },
  {
    value: 'bebop-contemporain',
    label: 'Bebop Contemporain',
    category: 'jazz',
    description: 'Jazz bebop revisité avec sonorités modernes',
    mood: ['virtuose', 'rapide', 'intellectuel'],
    compatibility: ['jazz-fusion-moderne', 'cool-jazz'],
    premium: true
  },

  // Rock & Metal
  {
    value: 'prog-rock-symphonique',
    label: 'Rock Progressif Symphonique',
    category: 'rock',
    description: 'Rock progressif avec arrangements orchestraux',
    mood: ['épique', 'complexe', 'grandiose'],
    compatibility: ['symphonie-classique', 'post-rock']
  },
  {
    value: 'metal-melodique',
    label: 'Metal Mélodique',
    category: 'rock',
    description: 'Metal avec mélodies sophistiquées et harmonies',
    mood: ['puissant', 'mélodique', 'émotionnel'],
    compatibility: ['symphonic-metal', 'prog-metal']
  },
  {
    value: 'post-rock-cinematique',
    label: 'Post-Rock Cinématique',
    category: 'rock',
    description: 'Crescendos émotionnels et textures atmosphériques',
    mood: ['émotionnel', 'épique', 'contemplatif'],
    compatibility: ['ambient-rock', 'orchestral-rock'],
    premium: true
  },

  // Urbain & Hip-Hop
  {
    value: 'trap-orchestral',
    label: 'Trap Orchestral',
    category: 'urban',
    description: 'Beats trap avec arrangements orchestraux',
    mood: ['moderne', 'puissant', 'hybride'],
    compatibility: ['hip-hop-symphonique', 'urban-classical'],
    premium: true
  },
  {
    value: 'neo-soul-moderne',
    label: 'Neo-Soul Moderne',
    category: 'urban',
    description: 'Soul contemporaine avec production moderne',
    mood: ['sophistiqué', 'groovy', 'émotionnel'],
    compatibility: ['r&b-moderne', 'jazz-soul']
  },
  {
    value: 'afrobeat-fusion',
    label: 'Afrobeat Fusion',
    category: 'urban',
    description: 'Rythmes africains avec éléments modernes',
    mood: ['rythmé', 'joyeux', 'énergique'],
    compatibility: ['world-fusion', 'funk-moderne']
  },

  // Ambient & Relaxation
  {
    value: 'drone-ambient',
    label: 'Drone Ambient Profond',
    category: 'ambient',
    description: 'Nappes sonores immersives et méditatives',
    mood: ['méditatif', 'spatial', 'contemplatif'],
    compatibility: ['ambient-techno', 'dark-ambient']
  },
  {
    value: 'nature-ambient',
    label: 'Ambient Nature',
    category: 'ambient',
    description: 'Sons naturels intégrés à des textures électroniques',
    mood: ['apaisant', 'organique', 'relaxant'],
    compatibility: ['healing-sounds', 'forest-ambient'],
    premium: true
  },
  {
    value: 'space-ambient',
    label: 'Ambient Spatial',
    category: 'ambient',
    description: 'Sonorités cosmiques et atmosphères planétaires',
    mood: ['cosmique', 'mystérieux', 'infini'],
    compatibility: ['sci-fi-ambient', 'drone-ambient'],
    premium: true
  },

  // Cinématique & Épique
  {
    value: 'orchestral-epic',
    label: 'Orchestral Épique',
    category: 'cinematic',
    description: 'Orchestration puissante pour moments héroïques',
    mood: ['héroïque', 'grandiose', 'inspirant'],
    compatibility: ['trailer-music', 'adventure-score']
  },
  {
    value: 'dark-cinematic',
    label: 'Cinématique Sombre',
    category: 'cinematic',
    description: 'Atmosphères tendues et mystérieuses',
    mood: ['tendu', 'mystérieux', 'dramatique'],
    compatibility: ['horror-score', 'thriller-music'],
    premium: true
  },
  {
    value: 'adventure-score',
    label: 'Musique d\'Aventure',
    category: 'cinematic',
    description: 'Compositions dynamiques pour l\'exploration',
    mood: ['aventureux', 'dynamique', 'optimiste'],
    compatibility: ['orchestral-epic', 'world-adventure']
  },

  // Folk & Acoustique
  {
    value: 'folk-celtique-moderne',
    label: 'Folk Celtique Moderne',
    category: 'folk',
    description: 'Instruments traditionnels avec arrangements contemporains',
    mood: ['mystique', 'authentique', 'mélancolique'],
    compatibility: ['world-folk', 'acoustic-fusion']
  },
  {
    value: 'fingerstyle-virtuose',
    label: 'Guitare Fingerstyle Virtuose',
    category: 'folk',
    description: 'Technique fingerstyle complexe et mélodique',
    mood: ['virtuose', 'intime', 'technique'],
    compatibility: ['acoustic-solo', 'classical-guitar'],
    premium: true
  },
  {
    value: 'americana-moderne',
    label: 'Americana Moderne',
    category: 'folk',
    description: 'Folk américain avec production contemporaine',
    mood: ['authentique', 'narratif', 'chaleureux'],
    compatibility: ['country-fusion', 'indie-folk']
  }
];

// Styles existants mis à jour
export const existingStyles = [
  {
    value: 'lofi-piano',
    label: 'Lo-Fi Piano',
    category: 'ambient',
    description: 'Piano relaxant avec textures lo-fi',
    mood: ['relaxant', 'nostalgique', 'doux'],
    compatibility: ['chill-hop', 'ambient-piano']
  },
  {
    value: 'afrobeat',
    label: 'Afrobeat',
    category: 'world',
    description: 'Rythmes africains énergiques',
    mood: ['énergique', 'rythmé', 'joyeux'],
    compatibility: ['afrobeat-fusion', 'world-fusion']
  },
  {
    value: 'jazz-moderne',
    label: 'Jazz Moderne',
    category: 'jazz',
    description: 'Jazz contemporain sophistiqué',
    mood: ['sophistiqué', 'élégant', 'improvisé'],
    compatibility: ['jazz-fusion-moderne', 'neo-soul-moderne']
  },
  {
    value: 'hip-hop-conscient',
    label: 'Hip-Hop Conscient',
    category: 'urban',
    description: 'Hip-hop avec messages profonds',
    mood: ['réfléchi', 'authentique', 'engagé'],
    compatibility: ['neo-soul-moderne', 'spoken-word']
  },
  {
    value: 'soul-rnb',
    label: 'Soul & R&B',
    category: 'urban',
    description: 'Soul classique et R&B moderne',
    mood: ['émotionnel', 'groovy', 'passionné'],
    compatibility: ['neo-soul-moderne', 'jazz-soul']
  },
  {
    value: 'electro-chill',
    label: 'Electro Chill',
    category: 'electronic',
    description: 'Électronique relaxante et atmosphérique',
    mood: ['relaxant', 'moderne', 'fluide'],
    compatibility: ['ambient-techno', 'chill-house']
  }
];

export const allMusicStyles = [...existingStyles, ...premiumMusicStyles];

export const getStylesByCategory = (category: string) => {
  return allMusicStyles.filter(style => style.category === category);
};

export const getCompatibleStyles = (styleValue: string) => {
  const style = allMusicStyles.find(s => s.value === styleValue);
  if (!style) return [];
  
  return allMusicStyles.filter(s => 
    style.compatibility.includes(s.value) || s.compatibility.includes(styleValue)
  );
};

export const isPremiumStyle = (styleValue: string) => {
  const style = allMusicStyles.find(s => s.value === styleValue);
  return style?.premium || false;
};
