
export interface SceneCharacter {
  name: string;
  role: string;
  description: string;
}

export interface SceneData {
  description?: string;
  mots_cles?: string[];
  effet?: string;
  setting?: string;
  characters?: SceneCharacter[];
  scenario?: string;
  keywords?: string[];
  lieu?: string;
  personnages?: SceneCharacter[];
  objective?: string;
  objectif?: string;
  context?: string;
  contexte?: string;
  conclusion?: string;
  resolution?: string;
  effect?: string;
}

export interface SceneImmersiveProps {
  data: SceneData;
  itemCode?: string;
}

export interface SceneTheme {
  primary: string;
  secondary: string;
  accent: string;
  particle: string;
  gradientOverlay: string;
  glowColor: string;
  uniqueElement: string;
  name: string;
}
