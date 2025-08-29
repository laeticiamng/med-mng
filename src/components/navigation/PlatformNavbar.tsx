import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Music, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Shield,
  Activity,
  HeadphonesIcon,
  Sparkles
} from 'lucide-react';

export const PlatformNavbar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/generator', label: 'Générateur IA', icon: Music, badge: 'AI' },
    { path: '/edn', label: 'Items EDN', icon: BookOpen, badge: '367' },
    { path: '/ecos', label: 'ECOS', icon: MessageSquare },
    { path: '/chat', label: 'Assistant', icon: MessageSquare, badge: 'Beta' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/monitoring', label: 'Monitoring', icon: Activity },
    { path: '/support', label: 'Support', icon: HeadphonesIcon },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">MED MNG</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={`relative text-white/80 hover:text-white hover:bg-white/10 ${
                      active ? 'bg-white/20 text-white' : ''
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.badge && (
                      <Badge 
                        variant="outline" 
                        className="ml-2 text-xs bg-white/10 border-white/20 text-white/70"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};