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
} from 'lucide-react';

import { ROUTE_PATHS } from './routes';

export interface NavItem {
  path: string;
  label: string;
  shortLabel?: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

// Repositionnement sémantique : Action > Ressource
export const MAIN_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.home, label: 'Priorité', shortLabel: 'Priorité', icon: Zap },
  { path: ROUTE_PATHS.progressDashboard, label: 'Ma progression', shortLabel: 'Progression', icon: Target },
  { path: ROUTE_PATHS.ednComplete, label: 'Avancer', shortLabel: 'Avancer', icon: BookOpen },
  { path: ROUTE_PATHS.examMode, label: 'S\'entraîner', shortLabel: 'Entraîner', icon: Brain },
  { path: ROUTE_PATHS.ecosIndex, label: 'Simuler', shortLabel: 'Simuler', icon: Users },
  { path: ROUTE_PATHS.chat, label: 'Demander', shortLabel: 'Demander', icon: MessageSquare },
];
