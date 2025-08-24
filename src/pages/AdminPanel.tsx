import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Vérification des droits d'administration
    // Note: Dans un vrai système, vous devriez vérifier les rôles utilisateur
    if (!user) {
      toast.error('Accès non autorisé - Connexion requise');
      navigate('/med-mng/login');
      return;
    }

    // Pour la démo, on peut accéder si on est connecté
    // Dans la production, ajouter une vérification de rôle admin
    console.log('🔐 Accès panel admin autorisé pour:', user.email);
  }, [user, navigate]);

  if (!user) {
    return (
      <ConsistentBackground variant="secondary">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Accès restreint</h2>
            <p className="text-muted-foreground mb-4">Vous devez être connecté pour accéder au panel d'administration</p>
            <Button onClick={() => navigate('/med-mng/login')}>
              Se connecter
            </Button>
          </div>
        </div>
      </ConsistentBackground>
    );
  }

  return (
    <ConsistentBackground variant="secondary">
      <PageHeader
        title="Administration"
        subtitle="Panel d'administration MED-MNG"
        icon={Shield}
        showBackButton
        backTo="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </ConsistentBackground>
  );
};