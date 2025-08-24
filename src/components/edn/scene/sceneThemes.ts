
import { SceneTheme } from './sceneTypes';

export const getUniqueSpectacularTheme = (code: string): SceneTheme => {
  const themes = {
    'IC1': {
      primary: 'from-primary via-primary/80 to-accent',
      secondary: 'from-primary/10 via-primary/5 to-accent/10',
      accent: 'text-primary',
      particle: '💊',
      gradientOverlay: 'radial-gradient(circle at 30% 40%, hsl(var(--primary) / 0.4) 0%, transparent 70%), radial-gradient(circle at 70% 60%, hsl(var(--accent) / 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-premium',
      uniqueElement: '🔬',
      name: 'Laboratoire Quantique'
    },
    'IC2': {
      primary: 'from-accent via-success to-accent/80',
      secondary: 'from-success/10 via-accent/5 to-success/5',
      accent: 'text-success',
      particle: '⚕️',
      gradientOverlay: 'radial-gradient(circle at 25% 25%, hsl(var(--success) / 0.4) 0%, transparent 70%), radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-premium-lg',
      uniqueElement: '🏥',
      name: 'Centre Médical Futuriste'
    },
    'IC3': {
      primary: 'from-primary via-primary/70 to-primary-muted',
      secondary: 'from-primary/5 via-muted to-primary/10',
      accent: 'text-primary',
      particle: '🧬',
      gradientOverlay: 'radial-gradient(circle at 40% 20%, hsl(var(--primary) / 0.5) 0%, transparent 70%), radial-gradient(circle at 60% 80%, hsl(var(--primary-muted) / 0.4) 0%, transparent 70%)',
      glowColor: 'shadow-medical-lg',
      uniqueElement: '🔬',
      name: 'Laboratoire de Génétique'
    },
    'IC4': {
      primary: 'from-destructive/80 via-warning to-destructive/60',
      secondary: 'from-destructive/5 via-warning/10 to-destructive/5',
      accent: 'text-destructive',
      particle: '❤️',
      gradientOverlay: 'radial-gradient(circle at 20% 60%, hsl(var(--destructive) / 0.4) 0%, transparent 70%), radial-gradient(circle at 80% 40%, hsl(var(--warning) / 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-premium',
      uniqueElement: '🫀',
      name: 'Unité Cardiologique'
    },
    'default': {
      primary: 'from-primary via-accent to-success',
      secondary: 'from-muted via-background to-secondary',
      accent: 'text-foreground',
      particle: '🔬',
      gradientOverlay: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-medical',
      uniqueElement: '⚗️',
      name: 'Station Médicale'
    }
  };
  
  return themes[code as keyof typeof themes] || themes.default;
};
