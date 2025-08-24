import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  TestTube, 
  BarChart3, 
  Shield,
  Database,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DevTools: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const devRoutes = [
    {
      path: '/test-subscriptions',
      title: 'Test Abonnements',
      description: 'Testeur de fonctionnalités d\'abonnement',
      icon: TestTube,
      badge: 'Test'
    },
    {
      path: '/validation-ux',
      title: 'Validation UX',
      description: 'Dashboard de validation expérience utilisateur',
      icon: BarChart3,
      badge: 'UX'
    },
    {
      path: '/test-extraction',
      title: 'Test Extraction',
      description: 'Outils de test pour l\'extraction de données',
      icon: Database,
      badge: 'Dev'
    },
    {
      path: '/content-quality',
      title: 'Qualité Contenu',
      description: 'Dashboard qualité des contenus',
      icon: Shield,
      badge: 'Audit'
    }
  ];

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="bg-background/95 backdrop-blur-sm border shadow-lg"
        >
          <Settings className="h-4 w-4 mr-1" />
          Dev Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Outils de développement</CardTitle>
              <CardDescription className="text-xs">
                Accès rapide aux outils de test et validation
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-2">
          {devRoutes.map((route) => {
            const IconComponent = route.icon;
            return (
              <Button
                key={route.path}
                asChild
                variant="ghost"
                size="sm"
                className="w-full justify-start h-auto p-2"
              >
                <Link to={route.path} className="block">
                  <div className="flex items-center gap-2 w-full">
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{route.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {route.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {route.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Outils visibles en mode développement uniquement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};