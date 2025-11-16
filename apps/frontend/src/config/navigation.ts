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
} from 'lucide-react';

import { ROUTE_PATHS } from './routes';

export interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { path: ROUTE_PATHS.home, label: 'Accueil', icon: Home },
  { path: ROUTE_PATHS.dashboard, label: 'Dashboard', icon: BarChart3 },
  { path: ROUTE_PATHS.ednComplete, label: 'Items EDN', icon: BookOpen },
  { path: ROUTE_PATHS.generator, label: 'Générateur', icon: Music },
  { path: ROUTE_PATHS.store, label: 'Store', icon: ShoppingBag },
  { path: ROUTE_PATHS.medMngLibrary, label: 'Bibliothèque', icon: Library },
  { path: ROUTE_PATHS.ecosIndex, label: 'ECOS', icon: Users },
  { path: ROUTE_PATHS.chat, label: 'Assistant IA', icon: MessageSquare },
];
