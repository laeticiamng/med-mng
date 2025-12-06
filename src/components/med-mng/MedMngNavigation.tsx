import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, Library, CreditCard, User, Plus, LogOut, Home } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { TranslatedText } from '@/components/TranslatedText';
import { ROUTE_PATHS } from '@/config/routes';

export const MedMngNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTE_PATHS.medMngLogin);
  };

  return (
    <nav id="main-navigation" className="bg-card shadow-sm border-b sticky top-0 z-40" role="navigation" aria-label="Navigation principale">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold text-foreground">
              <TranslatedText text="MED-MNG" />
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTE_PATHS.home)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            >
              <Home className="h-4 w-4" />
              <TranslatedText text="Accueil" />
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngLibrary) ? 'default' : 'ghost'}
              onClick={() => navigate(ROUTE_PATHS.medMngLibrary)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            >
              <Library className="h-4 w-4" />
              <TranslatedText text="Bibliothèque" />
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngCreate) ? 'default' : 'ghost'}
              onClick={() => navigate(ROUTE_PATHS.medMngCreate)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            >
              <Plus className="h-4 w-4" />
              <TranslatedText text="Créer" />
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngPricing) ? 'default' : 'ghost'}
              onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            >
              <CreditCard className="h-4 w-4" />
              <TranslatedText text="Abonnements" />
            </Button>

            <Button
              variant={isActive(ROUTE_PATHS.medMngProfile) ? 'default' : 'ghost'}
              onClick={() => navigate(ROUTE_PATHS.medMngProfile)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            >
              <User className="h-4 w-4" />
              <TranslatedText text="Profil" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <TranslatedText text="Déconnexion" />
            </Button>
          </div>

          {/* Mobile Navigation - Simplified header */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTE_PATHS.home)}
              className="p-2"
            >
              <Home className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
