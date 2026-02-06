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
  Sparkles,
  Settings,
  FileText,
  LayoutDashboard,
  Target,
  Headphones,
} from 'lucide-react';

import { ROUTE_PATHS } from './routes';

export interface NavItem {
  path: string;
  label: string;
  shortLabel?: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavItem[];
  description?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: NavItem[];
}

// Navigation principale MVP (7 liens uniquement)
export const MAIN_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.home, label: 'Accueil', shortLabel: 'Accueil', icon: Home },
  { path: ROUTE_PATHS.ednComplete, label: 'EDN', shortLabel: 'EDN', icon: BookOpen },
  { path: ROUTE_PATHS.ecosIndex, label: 'ECOS', shortLabel: 'ECOS', icon: Target },
  { path: ROUTE_PATHS.chat, label: 'Chat IA', shortLabel: 'Chat', icon: MessageSquare },
  { path: ROUTE_PATHS.medMngPricing, label: 'Tarifs', shortLabel: 'Tarifs', icon: ShoppingBag },
];

// Navigation secondaire pour utilisateurs connectés uniquement
export const SECONDARY_NAV_GROUPS: NavGroup[] = [
  {
    id: 'creation',
    label: '🎵 Création',
    icon: Music,
    items: [
      { path: ROUTE_PATHS.medMngCreate, label: 'Créer', icon: Music, description: 'Générer une chanson' },
      { path: ROUTE_PATHS.medMngMusicLibrary, label: 'Bibliothèque', icon: Headphones, description: 'Mes créations' },
    ],
  },
];

// Flatten pour compatibilité avec l'ancien système
export const SECONDARY_NAV_ITEMS: NavItem[] = SECONDARY_NAV_GROUPS.flatMap(group => group.items);

// Navigation utilisateur (menu profil)
export const USER_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.medMngProfile, label: 'Mon profil', icon: Users },
  { path: ROUTE_PATHS.medMngMusicLibrary, label: 'Ma bibliothèque', icon: Music },
  { path: ROUTE_PATHS.medMngPlaylists, label: 'Mes playlists', icon: Music },
  { path: ROUTE_PATHS.medMngFavorites, label: 'Mes favoris', icon: Sparkles },
  { path: ROUTE_PATHS.medMngProgress, label: 'Ma progression', icon: BarChart3 },
  { path: ROUTE_PATHS.medMngAnalytics, label: 'Mes analytics', icon: BarChart3 },
  { path: ROUTE_PATHS.settings, label: 'Paramètres', icon: Settings },
];

// Navigation admin (toutes les pages admin)
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.adminPanel, label: 'Panneau Admin', icon: LayoutDashboard },
  { path: ROUTE_PATHS.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTE_PATHS.modularDashboard, label: 'Dashboard Modulaire', icon: LayoutDashboard },
  { path: ROUTE_PATHS.adminImport, label: 'Import données', icon: FileText },
  { path: ROUTE_PATHS.adminExtractEdn, label: 'Extraction EDN', icon: FileText },
  { path: ROUTE_PATHS.adminExtractEcos, label: 'Extraction ECOS', icon: FileText },
  { path: ROUTE_PATHS.adminExtractObjectifs, label: 'Extraction Objectifs', icon: FileText },
  { path: ROUTE_PATHS.adminOicQuality, label: 'Qualité OIC', icon: Target },
  { path: ROUTE_PATHS.adminExtractionQuality, label: 'Qualité Extraction', icon: Target },
  { path: ROUTE_PATHS.adminComplete, label: 'Process Complet', icon: LayoutDashboard },
  { path: ROUTE_PATHS.adminAudit, label: 'Audit Admin', icon: BarChart3 },
  { path: ROUTE_PATHS.audit, label: 'Audit Global', icon: BarChart3 },
  { path: ROUTE_PATHS.auditCompleteness, label: 'Audit Complétude', icon: BarChart3 },
  { path: ROUTE_PATHS.ednAudit, label: 'Audit EDN', icon: BarChart3 },
  { path: ROUTE_PATHS.monitoring, label: 'Monitoring', icon: Target },
  { path: ROUTE_PATHS.securityMonitoring, label: 'Sécurité', icon: Settings },
  { path: ROUTE_PATHS.rlsDocumentation, label: 'Doc RLS', icon: FileText },
  { path: ROUTE_PATHS.diagnostics, label: 'Diagnostics', icon: Settings },
  { path: ROUTE_PATHS.migrationDashboard, label: 'Migrations', icon: LayoutDashboard },
  { path: ROUTE_PATHS.platformStatus, label: 'Status Plateforme', icon: Target },
  { path: ROUTE_PATHS.systemManagement, label: 'Gestion Système', icon: Settings },
  { path: ROUTE_PATHS.platformSettings, label: 'Config Plateforme', icon: Settings },
  { path: ROUTE_PATHS.accessibilityDashboard, label: 'Accessibilité', icon: Target },
  { path: ROUTE_PATHS.effectivenessDashboard, label: 'Efficacité', icon: BarChart3 },
  { path: ROUTE_PATHS.pwaAnalytics, label: 'PWA Analytics', icon: BarChart3 },
  { path: ROUTE_PATHS.designSystem, label: 'Design System', icon: Sparkles },
];

// Pages publiques
export const PUBLIC_PAGES: NavItem[] = [
  { path: ROUTE_PATHS.home, label: 'Accueil', icon: Home },
  { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', icon: BookOpen },
  { path: ROUTE_PATHS.chat, label: 'Chat IA', icon: MessageSquare },
  { path: ROUTE_PATHS.generator, label: 'Générateur Musique', icon: Music },
  { path: ROUTE_PATHS.ednMusicLibrary, label: 'Musiques EDN', icon: Music },
  { path: ROUTE_PATHS.medMngPricing, label: 'Tarifs', icon: ShoppingBag },
  { path: ROUTE_PATHS.medMngSignup, label: 'Créer un compte', icon: Users },
];

// Pages légales
export const LEGAL_PAGES: NavItem[] = [
  { path: ROUTE_PATHS.mentionsLegales, label: 'Mentions légales', icon: FileText },
  { path: ROUTE_PATHS.politiqueConfidentialite, label: 'Confidentialité', icon: FileText },
  { path: ROUTE_PATHS.cgu, label: 'CGU', icon: FileText },
  { path: ROUTE_PATHS.declarationAccessibilite, label: 'Accessibilité', icon: FileText },
  { path: ROUTE_PATHS.mesDonneesRgpd, label: 'Mes données RGPD', icon: FileText },
];

// Toutes les pages (pour sitemap/recherche)
export const ALL_ACCESSIBLE_PAGES = [
  { path: ROUTE_PATHS.home, label: 'Accueil', category: 'Principal' },
  { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', category: 'Apprentissage' },
  { path: ROUTE_PATHS.chat, label: 'Chat IA', category: 'Outils' },
  { path: ROUTE_PATHS.generator, label: 'Générateur de musique', category: 'Musique' },
  { path: ROUTE_PATHS.ednMusicLibrary, label: 'Musiques EDN', category: 'Musique' },
  { path: ROUTE_PATHS.medMngPricing, label: 'Tarifs', category: 'Ressources' },
  { path: ROUTE_PATHS.medMngSignup, label: 'Créer un compte', category: 'Compte' },
  { path: ROUTE_PATHS.mentionsLegales, label: 'Mentions légales', category: 'Légal' },
  { path: ROUTE_PATHS.politiqueConfidentialite, label: 'Confidentialité', category: 'Légal' },
  { path: ROUTE_PATHS.cgu, label: 'CGU', category: 'Légal' },
  { path: ROUTE_PATHS.declarationAccessibilite, label: 'Accessibilité', category: 'Légal' },
  { path: ROUTE_PATHS.mesDonneesRgpd, label: 'Mes données RGPD', category: 'Légal' },
];
