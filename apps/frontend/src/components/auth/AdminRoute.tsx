import logger from '@/lib/logger';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Composant de protection pour les routes administrateur
 * 
 * Vérifie que :
 * 1. L'utilisateur est authentifié
 * 2. L'utilisateur a le rôle 'admin' dans la table user_roles
 * 
 * SÉCURITÉ: Utilise une vérification côté serveur via RLS policies
 * Jamais de vérification client-side (localStorage) pour éviter les attaques
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Vérification sécurisée via la table user_roles avec RLS
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          logger.error('Erreur vérification rôle admin:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        logger.error('Erreur lors de la vérification admin:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  // Chargement en cours
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Non authentifié → Redirection vers login
  if (!user) {
    return <Navigate to="/med-mng/login" replace />;
  }

  // Authentifié mais pas admin → Page d'accès refusé
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="border-destructive/50">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Accès Refusé</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
              <p className="text-sm">
                Cette section est réservée aux administrateurs de la plateforme.
              </p>
              <div className="mt-4">
                <a
                  href="/"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                >
                  Retour à l'accueil
                </a>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Admin confirmé → Afficher la page
  return <>{children}</>;
};
