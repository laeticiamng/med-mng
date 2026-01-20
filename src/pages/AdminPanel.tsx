import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useActivityTracking } from '@/hooks/useActivityTracking';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    // Vérification des droits d'administration
    if (!user) {
      toast.error('Accès non autorisé - Connexion requise');
      navigate(ROUTE_PATHS.medMngLogin);
      return;
    }

    // Vérifier le rôle admin dans les métadonnées utilisateur
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin' ||
                   user.email?.endsWith('@med-mng.com') ||
                   user.email?.endsWith('@admin.med-mng.com');

    if (!isAdmin) {
      toast.error('Accès non autorisé - Droits administrateur requis');
      navigate(ROUTE_PATHS.home);
      return;
    }

    // Log admin access
    logActivity({ activity_type: 'study', metadata: { action: 'admin_panel_access' } });
    console.log('🔐 Accès panel admin autorisé pour:', user.email);
  }, [user, navigate, logActivity]);

  // Vérification du rôle admin
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
  const isAdmin = user && (
    userRole === 'admin' ||
    userRole === 'super_admin' ||
    user.email?.endsWith('@med-mng.com') ||
    user.email?.endsWith('@admin.med-mng.com')
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            {!user
              ? 'Vous devez être connecté pour accéder au panel d\'administration'
              : 'Vous n\'avez pas les droits administrateur nécessaires'
            }
          </p>
          <Button onClick={() => navigate(!user ? ROUTE_PATHS.medMngLogin : ROUTE_PATHS.home)}>
            {!user ? 'Se connecter' : 'Retour à l\'accueil'}
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
                onClick={() => navigate(ROUTE_PATHS.medMngProfile)}
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