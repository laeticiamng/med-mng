import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Vérification des droits d'administration
    // Note: Dans un vrai système, vous devriez vérifier les rôles utilisateur
    if (!user) {
      toast.error('Accès non autorisé - Connexion requise');
      navigate(ROUTE_PATHS.medMngLogin);
      return;
    }

    // Pour la démo, on peut accéder si on est connecté
    // Dans la production, ajouter une vérification de rôle admin
    console.log('🔐 Accès panel admin autorisé pour:', user.email);
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">Vous devez être connecté pour accéder au panel d'administration</p>
          <Button onClick={() => navigate(ROUTE_PATHS.medMngLogin)}>
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixe */}
      <div className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTE_PATHS.home)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Administration</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Connecté en tant que <span className="font-medium">{user.email}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/med-mng/profile')}
              >
                Profil
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard />
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Panel d'administration MED-MNG • Version 2.0 • 
            <span className="ml-1">Système de gestion intégré</span>
          </div>
        </div>
      </footer>
    </div>
  );
};