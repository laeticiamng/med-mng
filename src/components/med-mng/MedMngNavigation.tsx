
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, Library, CreditCard, User, Plus, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';

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
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MED-MNG</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/med-mng/library') ? 'default' : 'ghost'}
              onClick={() => navigate('/med-mng/library')}
              className="flex items-center gap-2"
            >
              <Library className="h-4 w-4" />
              Bibliothèque
            </Button>

            <Button
              variant={isActive('/med-mng/create') ? 'default' : 'ghost'}
              onClick={() => navigate('/med-mng/create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Créer
            </Button>

            <Button
              variant={isActive('/med-mng/pricing') ? 'default' : 'ghost'}
              onClick={() => navigate('/med-mng/pricing')}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Abonnements
            </Button>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
