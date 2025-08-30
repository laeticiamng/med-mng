import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Globe, BarChart3, BookOpen, Stethoscope, Brain, Users, Settings,
  Music, Heart, Shield, Activity, HelpCircle, FileText, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MasterNavigationHub: React.FC = () => {
  const navigate = useNavigate();

  const mainRoutes = [
    { path: '/', label: 'Accueil', icon: Home, desc: 'Page d\'accueil' },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, desc: 'Tableau de bord' },
    { path: '/edn', label: 'Items EDN', icon: BookOpen, desc: '367 items EDN' },
    { path: '/generator', label: 'Générateur IA', icon: Music, desc: 'Créer des musiques' },
    { path: '/chat', label: 'Assistant IA', icon: Brain, desc: 'Chat médical IA' },
    { path: '/community', label: 'Communauté', icon: Users, desc: 'Espace communautaire' }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Navigation Master</CardTitle>
        <CardDescription className="text-white/70">
          Accès rapide à toutes les fonctionnalités
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainRoutes.map((route) => (
            <Button
              key={route.path}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              onClick={() => navigate(route.path)}
            >
              <route.icon className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">{route.label}</p>
                <p className="text-xs text-white/60">{route.desc}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};