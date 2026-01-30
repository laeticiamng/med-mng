import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useActivityTracking } from '@/hooks/useActivityTracking';

/**
 * AdminPanel - Page d'administration
 * 
 * SÉCURITÉ: Cette page est protégée par AdminRoute qui vérifie
 * le rôle admin via la table user_roles avec RLS.
 * 
 * Aucune vérification client-side n'est effectuée ici car:
 * 1. AdminRoute a déjà validé l'accès
 * 2. Les vérifications par email/metadata sont non sécurisées
 */
export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    // Log admin panel access (AdminRoute a déjà vérifié les droits)
    if (user) {
      logActivity({ activity_type: 'study', metadata: { action: 'admin_panel_access' } });
      console.log('🔐 Accès panel admin autorisé pour:', user.email);
    }
  }, [user, logActivity]);

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
                Connecté en tant que <span className="font-medium">{user?.email}</span>
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