
import { SceneTheme } from './sceneTypes';

export const getUniqueSpectacularTheme = (code: string): SceneTheme => {
  const themes = {
    'IC1': {
      primary: 'from-blue-600 via-cyan-500 to-teal-400',
      secondary: 'from-blue-100 via-cyan-50 to-teal-50',
      accent: 'text-blue-800',
      particle: '💊',
      gradientOverlay: 'radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 70%), radial-gradient(circle at 70% 60%, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-blue-500/50',
      uniqueElement: '🔬',
      name: 'Laboratoire Quantique'
    },
    'IC2': {
      primary: 'from-emerald-600 via-teal-500 to-green-400',
      secondary: 'from-emerald-100 via-teal-50 to-green-50',
      accent: 'text-emerald-800',
      particle: '⚕️',
      gradientOverlay: 'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.3) 0%, transparent 70%), radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-emerald-500/50',
      uniqueElement: '🏥',
      name: 'Centre Médical Futuriste'
    },
    'IC3': {
      primary: 'from-purple-600 via-indigo-500 to-violet-400',
      secondary: 'from-purple-100 via-indigo-50 to-violet-50',
      accent: 'text-purple-800',
      particle: '🧬',
      gradientOverlay: 'radial-gradient(circle at 40% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 70%), radial-gradient(circle at 60% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-purple-500/50',
      uniqueElement: '🔬',
      name: 'Laboratoire de Génétique'
    },
    'IC4': {
      primary: 'from-rose-600 via-pink-500 to-red-400',
      secondary: 'from-rose-100 via-pink-50 to-red-50',
      accent: 'text-rose-800',
      particle: '❤️',
      gradientOverlay: 'radial-gradient(circle at 20% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 70%), radial-gradient(circle at 80% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-rose-500/50',
      uniqueElement: '🫀',
      name: 'Unité Cardiologique'
    },
    'default': {
      primary: 'from-amber-600 via-orange-500 to-yellow-400',
      secondary: 'from-amber-100 via-orange-50 to-yellow-50',
      accent: 'text-amber-800',
      particle: '🔬',
      gradientOverlay: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
      glowColor: 'shadow-amber-500/50',
      uniqueElement: '⚗️',
      name: 'Station Médicale'
    }
  };
  
  return themes[code as keyof typeof themes] || themes.default;
};
