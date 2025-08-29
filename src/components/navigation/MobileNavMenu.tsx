import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Home, 
  Music, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Shield,
  Activity,
  HeadphonesIcon,
  Sparkles,
  X
} from 'lucide-react';

export const MobileNavMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Accueil', icon: Home, description: 'Page d\'accueil principale' },
    { path: '/generator', label: 'Générateur IA', icon: Music, badge: 'AI', description: 'Créer des musiques éducatives' },
    { path: '/edn', label: 'Items EDN', icon: BookOpen, badge: '367', description: 'Base complète IC-1 à IC-367' },
    { path: '/ecos', label: 'ECOS', icon: MessageSquare, description: 'Simulations d\'examens cliniques' },
    { path: '/chat', label: 'Assistant IA', icon: MessageSquare, badge: 'Beta', description: 'Chat médical intelligent' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, description: 'Statistiques et performances' },
    { path: '/monitoring', label: 'Monitoring', icon: Activity, description: 'Surveillance système' },
    { path: '/support', label: 'Support', icon: HeadphonesIcon, description: 'Aide et documentation' },
    { path: '/admin', label: 'Administration', icon: Shield, description: 'Gestion et supervision' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/80 hover:text-white md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-black/95 backdrop-blur-xl border-white/10">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            MED MNG
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link key={item.path} to={item.path} onClick={handleNavigation}>
                <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  active 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}>
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-white/10 border-white/20 text-white/70"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-white/60">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center">
            <p className="text-sm text-white/80 mb-2">MED MNG Platform</p>
            <p className="text-xs text-white/60">Apprentissage médical révolutionnaire</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};