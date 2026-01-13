import type { ComponentType } from 'react';
import {
  BarChart3,
  BookOpen,
  Home,
  Library,
  MessageSquare,
  Music,
  ShoppingBag,
  Users,
  Zap,
  Brain,
  Target,
  Trophy,
  Sparkles,
  Calendar,
  Settings,
  HeartPulse,
  GraduationCap,
  Layers,
  FileText,
  LayoutDashboard,
} from 'lucide-react';

import { ROUTE_PATHS } from './routes';

export interface NavItem {
  path: string;
  label: string;
  shortLabel?: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
}

// Navigation principale simplifiée (6 items max visibles)
export const MAIN_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.home, label: 'Accueil', shortLabel: 'Accueil', icon: Home },
  { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', shortLabel: 'EDN', icon: BookOpen },
  { path: ROUTE_PATHS.examMode, label: 'Entraînement', shortLabel: 'QCM', icon: Brain },
  { path: ROUTE_PATHS.ecosIndex, label: 'ECOS', shortLabel: 'ECOS', icon: Users },
  { path: ROUTE_PATHS.progressDashboard, label: 'Progression', shortLabel: 'Stats', icon: Target },
  { path: ROUTE_PATHS.chat, label: 'Chat IA', shortLabel: 'Chat', icon: MessageSquare },
];

// Navigation secondaire (menu "Plus")
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.flashcards, label: 'Flashcards', icon: Layers },
  { path: ROUTE_PATHS.srsReview, label: 'Révision espacée', icon: Calendar },
  { path: ROUTE_PATHS.clinicalCases, label: 'Cas cliniques', icon: HeartPulse },
  { path: ROUTE_PATHS.achievements, label: 'Succès', icon: Trophy },
  { path: ROUTE_PATHS.generator, label: 'Musique médicale', icon: Music },
  { path: ROUTE_PATHS.smartStudyPlanner, label: 'Planning', icon: Calendar },
  { path: ROUTE_PATHS.community, label: 'Communauté', icon: Users },
  { path: ROUTE_PATHS.library, label: 'Bibliothèque', icon: Library },
  { path: ROUTE_PATHS.store, label: 'Boutique', icon: ShoppingBag },
];

// Navigation utilisateur (menu profil)
export const USER_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.medMngProfile, label: 'Mon profil', icon: Users },
  { path: ROUTE_PATHS.medMngLibrary, label: 'Ma bibliothèque', icon: Music },
  { path: ROUTE_PATHS.medMngFavorites, label: 'Mes favoris', icon: Sparkles },
  { path: ROUTE_PATHS.medMngProgress, label: 'Ma progression', icon: BarChart3 },
  { path: ROUTE_PATHS.settings, label: 'Paramètres', icon: Settings },
];

// Navigation admin
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.adminPanel, label: 'Panneau Admin', icon: LayoutDashboard },
  { path: ROUTE_PATHS.adminImport, label: 'Import données', icon: FileText },
  { path: ROUTE_PATHS.audit, label: 'Audit', icon: BarChart3 },
  { path: ROUTE_PATHS.monitoring, label: 'Monitoring', icon: Target },
  { path: ROUTE_PATHS.securityMonitoring, label: 'Sécurité', icon: Settings },
];

// Toutes les pages accessibles (pour sitemap/recherche)
export const ALL_ACCESSIBLE_PAGES = [
  // Principales
  { path: ROUTE_PATHS.home, label: 'Accueil', category: 'Principal' },
  { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', category: 'Apprentissage' },
  { path: ROUTE_PATHS.examMode, label: 'Mode examen', category: 'Entraînement' },
  { path: ROUTE_PATHS.ecosIndex, label: 'Simulations ECOS', category: 'Entraînement' },
  { path: ROUTE_PATHS.chat, label: 'Chat IA', category: 'Outils' },
  
  // Apprentissage
  { path: ROUTE_PATHS.flashcards, label: 'Flashcards', category: 'Apprentissage' },
  { path: ROUTE_PATHS.srsReview, label: 'Révision espacée', category: 'Apprentissage' },
  { path: ROUTE_PATHS.clinicalCases, label: 'Cas cliniques', category: 'Apprentissage' },
  { path: ROUTE_PATHS.generator, label: 'Générateur de musique', category: 'Outils' },
  
  // Progression
  { path: ROUTE_PATHS.progressDashboard, label: 'Ma progression', category: 'Suivi' },
  { path: ROUTE_PATHS.achievements, label: 'Succès & Badges', category: 'Suivi' },
  { path: ROUTE_PATHS.smartStudyPlanner, label: 'Planning intelligent', category: 'Suivi' },
  { path: ROUTE_PATHS.statistics, label: 'Statistiques', category: 'Suivi' },
  
  // Communauté
  { path: ROUTE_PATHS.community, label: 'Communauté', category: 'Social' },
  { path: ROUTE_PATHS.library, label: 'Bibliothèque', category: 'Ressources' },
  { path: ROUTE_PATHS.store, label: 'Boutique', category: 'Ressources' },
  
  // Légal
  { path: ROUTE_PATHS.mentionsLegales, label: 'Mentions légales', category: 'Légal' },
  { path: ROUTE_PATHS.politiqueConfidentialite, label: 'Confidentialité', category: 'Légal' },
  { path: ROUTE_PATHS.cgu, label: 'CGU', category: 'Légal' },
  { path: ROUTE_PATHS.declarationAccessibilite, label: 'Accessibilité', category: 'Légal' },
  { path: ROUTE_PATHS.mesDonneesRgpd, label: 'Mes données RGPD', category: 'Légal' },
];
