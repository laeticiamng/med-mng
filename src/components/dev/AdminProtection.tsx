import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AdminProtectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export const AdminProtection = ({ 
  children, 
  fallback, 
  showMessage = true 
}: AdminProtectionProps) => {
  // En mode développement, bloquer l'accès aux modules admin
  const isDevelopment = window.location.hostname.includes('lovable') || 
                       window.location.hostname === 'localhost' ||
                       process.env.NODE_ENV === 'development';

  const isAdminPath = window.location.pathname.includes('/admin/') ||
                     window.location.pathname.includes('/test-subscriptions') ||
                     window.location.pathname.includes('/med-mng/subscribe');

  if (isDevelopment && isAdminPath) {
    if (fallback) return <>{fallback}</>;
    
    if (!showMessage) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">
              Module Protégé
            </CardTitle>
            <CardDescription>
              Ce module est réservé aux administrateurs et n'est pas accessible en mode développement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <Shield className="h-4 w-4" />
                Environnement sécurisé
              </div>
              <p className="text-sm text-red-700">
                Les fonctionnalités administratives, de paiement et de configuration 
                sont protégées pour garantir la sécurité de l'environnement de développement.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link to="/dev-workspace" className="flex-1">
                <Button className="w-full">
                  Aller à l'espace Dev
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Retour Accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};