
export interface SceneImmersiveProps {
  data: {
    description?: string;
    mots_cles?: string[];
    effet?: string;
    setting?: string;
    characters?: Array<{
      name: string;
      role: string;
      description: string;
    }>;
    scenario?: string;
  };
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
