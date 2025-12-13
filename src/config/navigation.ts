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
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

// Repositionnement sémantique : Action > Ressource
export const MAIN_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.home, label: 'Priorité', icon: Zap },
  { path: ROUTE_PATHS.progressDashboard, label: 'Ma progression', icon: Target },
  { path: ROUTE_PATHS.ednComplete, label: 'Avancer', icon: BookOpen },
  { path: ROUTE_PATHS.examMode, label: 'S\'entraîner', icon: Brain },
  { path: ROUTE_PATHS.ecosIndex, label: 'Simuler', icon: Users },
  { path: ROUTE_PATHS.chat, label: 'Demander', icon: MessageSquare },
];
