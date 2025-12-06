import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, BookOpen, Music, BarChart3, MessageSquare, Settings, 
  User, LogOut, Sparkles, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/med-mng/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const MainNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil', exact: true },
    { path: '/edn-complete', icon: BookOpen, label: 'EDN', badge: '367' },
    { path: '/generator', icon: Music, label: 'Générateur' },
    { path: '/learning-dashboard', icon: BarChart3, label: 'Analytics', isNew: true },
    { path: '/chat', icon: MessageSquare, label: 'Chat IA' },
    { path: '/med-mng/library', icon: Music, label: 'Bibliothèque', authRequired: true },
  ];

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-lg shadow-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent">
                MED MNG
              </span>
              <div className="text-xs text-muted-foreground font-medium">Platform</div>
            </div>
          </Link>

          {/* Navigation principale - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.authRequired && !user) return null;
              
              const isItemActive = item.exact 
                ? location.pathname === item.path
                : isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isItemActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-1 h-5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.isNew && (
                    <Badge className="ml-1 h-5 text-xs bg-success text-success-foreground">
                      Nouveau
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground">
                      {user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Utilisateur connecté</p>
                  </div>
                  
                  <DropdownMenuItem onClick={() => navigate('/med-mng/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Mon Profil
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/learning-dashboard')}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/med-mng/library')}>
                    <Music className="w-4 h-4 mr-2" />
                    Ma Bibliothèque
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate('/platform-settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/med-mng/login')}
                >
                  Connexion
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/med-mng/signup')}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  S'inscrire
                </Button>
              </div>
            )}

            {/* Navigation mobile */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navItems.map((item) => {
                    if (item.authRequired && !user) return null;
                    
                    return (
                      <DropdownMenuItem 
                        key={item.path}
                        onClick={() => navigate(item.path)}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto h-5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge className="ml-auto h-5 text-xs bg-success text-success-foreground">
                            New
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                  
                  {!user && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/med-mng/login')}>
                        Connexion
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/med-mng/signup')}>
                        S'inscrire
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
