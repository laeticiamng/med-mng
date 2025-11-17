import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useUserRoles } from '@/hooks/useUserRoles';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Loader } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loadingMyRoles } = useUserRoles();

  useEffect(() => {
    // ✅ SÉCURISÉ: Vérification stricte des droits d'administration
    if (!user) {
      toast.error('Accès non autorisé - Connexion requise');
      navigate('/med-mng-login', { replace: true });
      return;
    }

    // Attendre le chargement des rôles avant de vérifier
    if (loadingMyRoles) {
      return;
    }

    // ✅ CRITIQUE: Vérifier que l'utilisateur a le rôle admin
    if (!isAdmin) {
      toast.error('Accès refusé - Droits administrateur requis');
      navigate('/', { replace: true });
      return;
    }
  }, [user, isAdmin, loadingMyRoles, navigate]);

  // État de chargement pendant la vérification des rôles
  if (loadingMyRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Protection: ne pas rendre si pas connecté ou pas admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès restreint</h2>
          <p className="text-gray-600 mb-4">
            {!user
              ? 'Vous devez être connecté pour accéder au panel d\'administration'
              : 'Vous n\'avez pas les droits administrateur nécessaires'}
          </p>
          <Button onClick={() => navigate(!user ? '/med-mng-login' : '/')}>
            {!user ? 'Se connecter' : 'Retour à l\'accueil'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Administration</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
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
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            Panel d'administration MED-MNG • Version 2.0 • 
            <span className="ml-1">Système de gestion intégré</span>
          </div>
        </div>
      </footer>
    </div>
  );
};