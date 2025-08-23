
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, Library, CreditCard, User, Plus, LogOut, Home } from 'lucide-react';
import { useAuth } from '../med-mng/SimpleAuthProvider';
import { SimpleTranslatedText } from '@/components/SimpleTranslatedText';

export const MedMngNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/med-mng/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              <SimpleTranslatedText text="MED-MNG" />
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100"
            >
              <Home className="h-4 w-4" />
              <SimpleTranslatedText text="Accueil" />
            </Button>

            <Button
              variant={isActive('/med-mng/library') ? 'default' : 'ghost'}
              onClick={() => navigate('/med-mng/library')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100"
            >
              <Library className="h-4 w-4" />
              <SimpleTranslatedText text="Bibliothèque" />
            </Button>

            <Button
              variant={isActive('/med-mng/create') ? 'default' : 'ghost'}
              onClick={() => navigate('/med-mng/create')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
              <SimpleTranslatedText text="Créer" />
            </Button>

            <Button
              variant={isActive('/med-mng/pricing') ? 'default' : 'ghost'}
              onClick={() => navigate('/med-mng/pricing')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100"
            >
              <CreditCard className="h-4 w-4" />
              <SimpleTranslatedText text="Abonnements" />
            </Button>

            <Button
              variant={isActive('/med-mng/profile') ? 'default' : 'ghost'}
              onClick={() => navigate('/med-mng/profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100"
            >
              <User className="h-4 w-4" />
              <SimpleTranslatedText text="Profil" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <SimpleTranslatedText text="Déconnexion" />
            </Button>
          </div>

          {/* Mobile Navigation - Simplified header */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <Home className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
