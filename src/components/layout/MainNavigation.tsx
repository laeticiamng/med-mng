import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Shield,
  Music,
  BarChart3,
  Palette,
  Accessibility,
  Target,
  CalendarCheck,
  Users,
  Award,
  Star,
  SlidersHorizontal,
  ShieldCheck,
  DownloadCloud,
  Activity,
  ChevronDown,
  Map,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ShareNotificationsPanel } from '@/components/notifications/ShareNotificationsPanel';
import { RealtimeNotificationBell } from '@/components/security/RealtimeNotificationBell';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useState } from 'react';
import { MAIN_NAV_ITEMS } from '@/config/navigation';
import { ROUTE_PATHS } from '@/config/routes';

export const MainNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, isSecurityAnalyst } = useUserRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainNavItems = MAIN_NAV_ITEMS;

  const toolNavItems = [
    { path: ROUTE_PATHS.sitemap, label: 'Plan du site', icon: Map },
    { path: ROUTE_PATHS.statistics, label: 'Statistiques', icon: BarChart3 },
    { path: ROUTE_PATHS.designSystem, label: 'Design System', icon: Palette },
    {
      path: ROUTE_PATHS.accessibilityDashboard,
      label: 'Accessibilité',
      icon: Accessibility,
    },
    {
      path: ROUTE_PATHS.effectivenessDashboard,
      label: 'Efficacité',
      icon: Target,
    },
    {
      path: ROUTE_PATHS.studyPlanner,
      label: "Planificateur d'études",
      icon: CalendarCheck,
    },
    { path: ROUTE_PATHS.community, label: 'Communauté', icon: Users },
    { path: ROUTE_PATHS.achievements, label: 'Succès', icon: Award },
    { path: ROUTE_PATHS.favorites, label: 'Favoris', icon: Star },
    { path: ROUTE_PATHS.settings, label: 'Réglages', icon: SlidersHorizontal },
    {
      path: ROUTE_PATHS.mesDonneesRgpd,
      label: 'Mes données RGPD',
      icon: ShieldCheck,
    },
    { path: ROUTE_PATHS.installPwa, label: "Installer l'app", icon: DownloadCloud },
    {
      path: ROUTE_PATHS.pwaAnalytics,
      label: 'Analytics PWA',
      icon: Activity,
    },
  ] as const;

  const isActive = (path: string) => {
    if (path === ROUTE_PATHS.home) return location.pathname === ROUTE_PATHS.home;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTE_PATHS.home);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTE_PATHS.home} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              MED MNG
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    toolNavItems.some((tool) => isActive(tool.path))
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Outils
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {toolNavItems.map((tool) => (
                  <DropdownMenuItem
                    key={tool.path}
                    onClick={() => navigate(tool.path)}
                    className="flex items-center"
                  >
                    <tool.icon className="w-4 h-4 mr-2" />
                    {tool.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-3">
            {/* Toggle thème */}
            <ThemeToggle />
            
            {/* Notifications de partage en temps réel */}
            <ShareNotificationsPanel />

            {/* Alertes de sécurité en temps réel (admin et security_analyst seulement) */}
            {(isAdmin || isSecurityAnalyst) && <RealtimeNotificationBell />}

            {/* Profil utilisateur */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.medMngProfile)}>
                    <User className="w-4 h-4 mr-2" />
                    Mon Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}>
                    <Music className="w-4 h-4 mr-2" />
                    Ma Bibliothèque
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.platformSettings)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.rlsDocumentation)}>
                    <Shield className="w-4 w-4 mr-2" />
                    Documentation RLS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.securityMonitoring)}>
                    <Shield className="w-4 h-4 mr-2" />
                    Monitoring Sécurité
                  </DropdownMenuItem>
                  
                  {(isAdmin || isSecurityAnalyst) && (
                    <>
                      <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.auditSecurity)}>
                        <Shield className="w-4 h-4 mr-2" />
                        Audit Sécurité
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.sharedTemplates)}>
                        <Star className="w-4 h-4 mr-2" />
                        Templates Partagés
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTE_PATHS.medMngLogin)}>
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate(ROUTE_PATHS.medMngSignup)}>
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50">
            <div className="flex flex-col space-y-2">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-200/60">
                <p className="px-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Outils
                </p>
                {toolNavItems.map((tool) => (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(tool.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tool.icon className="w-4 h-4 mr-3" />
                    {tool.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};