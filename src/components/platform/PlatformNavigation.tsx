import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, Music, Brain, BarChart3, Settings, 
  Users, MessageSquare, Stethoscope, Trophy, Calendar,
  FileText, Target, Zap, Shield, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
  subItems?: NavigationItem[];
  description?: string;
}

const navigationData: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de Bord',
    icon: Home,
    path: '/',
    description: 'Vue d\'ensemble de votre progression'
  },
  {
    id: 'edn',
    label: 'EDN - Items',
    icon: BookOpen,
    path: '/edn',
    badge: '365',
    description: 'Items de connaissances EDN complets',
    subItems: [
      { id: 'edn-immersive', label: 'Mode Immersif', icon: Brain, path: '/edn?mode=immersive' },
      { id: 'edn-revision', label: 'Révisions', icon: Target, path: '/edn?tab=revision' },
      { id: 'edn-quiz', label: 'Quiz Interactifs', icon: Trophy, path: '/edn?tab=quiz' }
    ]
  },
  {
    id: 'generator',
    label: 'Générateur Musical',
    icon: Music,
    path: '/generator',
    badge: 'IA',
    description: 'Créez des musiques pédagogiques avec l\'IA',
    subItems: [
      { id: 'gen-edn', label: 'Musique EDN', icon: Stethoscope, path: '/generator?type=edn' },
      { id: 'gen-ecos', label: 'Musique ECOS', icon: Users, path: '/generator?type=ecos' },
      { id: 'gen-custom', label: 'Création Libre', icon: Zap, path: '/generator?type=custom' }
    ]
  },
  {
    id: 'ecos',
    label: 'ECOS',
    icon: Users,
    path: '/ecos',
    description: 'Examens Cliniques Objectifs Structurés',
    subItems: [
      { id: 'ecos-scenarios', label: 'Scénarios', icon: FileText, path: '/ecos' },
      { id: 'ecos-practice', label: 'Entraînement', icon: Target, path: '/ecos?mode=practice' }
    ]
  },
  {
    id: 'chat',
    label: 'Assistant IA',
    icon: MessageSquare,
    path: '/chat',
    badge: 'Beta',
    description: 'Chat médical avec intelligence artificielle'
  },
  {
    id: 'library',
    label: 'Bibliothèque',
    icon: Music,
    path: '/med-mng/library',
    description: 'Vos créations et favoris musicaux'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    description: 'Statistiques et suivi de progression'
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    path: '/admin',
    description: 'Gestion avancée de la plateforme',
    subItems: [
      { id: 'admin-audit', label: 'Audit', icon: Shield, path: '/audit' },
      { id: 'admin-import', label: 'Import', icon: FileText, path: '/admin/import' },
      { id: 'admin-health', label: 'Santé Système', icon: BarChart3, path: '/system-health' }
    ]
  }
];

export const PlatformNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (item: NavigationItem) => {
    navigate(item.path);
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border-r border-border/50 w-64 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">MED-MNG</h2>
            <p className="text-xs text-muted-foreground">Plateforme Médicale</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {navigationData.map((item) => (
          <div key={item.id}>
            <Button
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-3 text-left",
                isActive(item.path) && "bg-primary/10 text-primary border-primary/20"
              )}
              onClick={() => handleNavigation(item)}
            >
              <div className="flex items-center gap-3 w-full">
                <item.icon className="w-5 h-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </Button>

            {/* Sub-items */}
            {item.subItems && isActive(item.path) && (
              <div className="ml-8 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <Button
                    key={subItem.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(subItem.path)}
                  >
                    <subItem.icon className="w-4 h-4 mr-2" />
                    {subItem.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border/50 space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => navigate('/support')}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Support
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => navigate('/med-mng/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Paramètres
        </Button>
      </div>
    </div>
  );
};