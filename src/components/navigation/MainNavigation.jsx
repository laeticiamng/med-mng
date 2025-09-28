import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Music, 
  BarChart3, 
  Shield, 
  Settings, 
  Users, 
  FileText,
  Database,
  Monitor
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Navigation Principale Améliorée avec les Nouvelles Fonctionnalités
 */
export const MainNavigation = ({ isCompact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    // Navigation principale
    { 
      icon: Home, 
      label: 'Accueil', 
      path: '/', 
      badge: null,
      description: 'Page d\'accueil de la plateforme'
    },
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/dashboard', 
      badge: 'Nouveau',
      description: 'Tableau de bord avec métriques temps réel'
    },
    { 
      icon: Music, 
      label: 'Créer Musique', 
      path: '/med-mng/create', 
      badge: null,
      description: 'Génération de contenus musicaux thérapeutiques'
    },
    
    // Fonctionnalités médicales
    { 
      icon: FileText, 
      label: 'EDN Analysis', 
      path: '/edn-complete', 
      badge: null,
      description: 'Analyse et formation sur les items EDN'
    },
    { 
      icon: Shield, 
      label: 'Audit System', 
      path: '/audit', 
      badge: null,
      description: 'Audits de sécurité et conformité'
    },
    { 
      icon: Users, 
      label: 'Bibliothèque', 
      path: '/med-mng/library', 
      badge: null,
      description: 'Gestion des contenus et patients'
    },
    
    // Administration
    { 
      icon: Monitor, 
      label: 'Monitoring', 
      path: '/system-management', 
      badge: 'Nouveau',
      description: 'Surveillance système en temps réel'
    },
    { 
      icon: Database, 
      label: 'Export Données', 
      path: '/platform-settings', 
      badge: 'Nouveau',
      description: 'Sauvegarde et export des données'
    },
    { 
      icon: Settings, 
      label: 'Admin Panel', 
      path: '/admin-panel', 
      badge: null,
      description: 'Administration avancée de la plateforme'
    }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Card className="medical-card">
      <CardContent className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground mb-4">
            Navigation Principale
          </h3>
          
          <div className="grid gap-2">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className={`w-full justify-start h-auto p-3 ${
                  isActive(item.path) ? 'medical-btn-primary' : 'hover:bg-muted/50'
                } transition-all duration-200`}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center gap-3 w-full">
                  <item.icon className={`w-5 h-5 ${
                    isActive(item.path) ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`} />
                  
                  {!isCompact && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="text-xs bg-success/10 text-success">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs ${
                        isActive(item.path) 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      } mt-1`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainNavigation;