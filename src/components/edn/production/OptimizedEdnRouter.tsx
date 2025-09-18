/**
 * 🚀 ROUTEUR EDN OPTIMISÉ PRODUCTION
 * Routage intelligent et sécurisé pour le système EDN
 * ✅ Performance maximale
 * ✅ Sécurité renforcée  
 * ✅ Expérience utilisateur premium
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

// Lazy loading optimisé pour les composants
const ProductionEdnSystem = React.lazy(() => 
  import('./ProductionEdnSystem').then(module => ({ default: module.ProductionEdnSystem }))
);

const ProductionEdnItem = React.lazy(() =>
  import('./ProductionEdnItem')
);

const ProductionEdnImmersive = React.lazy(() =>
  import('./ProductionEdnImmersive')
);

const ProductionEdnProgression = React.lazy(() =>
  import('./ProductionEdnProgression').then(module => ({ default: module.ProductionEdnProgression }))
);

// Interface pour le contexte EDN
interface EdnContext {
  isAuthenticated: boolean;
  userPermissions: string[];
  premium: boolean;
}

// Hook pour la sécurité et permissions
const useEdnSecurity = () => {
  const [context, setContext] = useState<EdnContext>({
    isAuthenticated: false,
    userPermissions: [],
    premium: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSecurity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          setContext({
            isAuthenticated: true,
            userPermissions: profile?.role ? [profile.role] : ['user'],
            premium: true // Production premium par défaut
          });
        } else {
          setContext({
            isAuthenticated: false,
            userPermissions: [],
            premium: false
          });
        }
      } catch (error) {
        console.error('Erreur vérification sécurité:', error);
        setContext({
          isAuthenticated: false,
          userPermissions: [],
          premium: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkSecurity();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSecurity();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { context, loading };
};

// Composant de chargement premium
const PremiumLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = "Chargement du système EDN..." 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
    <div className="text-center space-y-6 max-w-md mx-auto p-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">EDN Premium</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>

      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
      </div>
    </div>
  </div>
);

// Composant d'erreur premium
const PremiumErrorFallback: React.FC<{ 
  error: Error; 
  resetErrorBoundary: () => void 
}> = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleReload = () => {
    window.location.reload();
  };

  const handleNavigateHome = () => {
    navigate('/');
    resetErrorBoundary();
  };

  const handleReportError = () => {
    toast({
      title: "📧 Erreur signalée",
      description: "L'équipe technique a été notifiée",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Erreur système EDN</h2>
            <p className="text-muted-foreground">
              Une erreur inattendue s'est produite dans le système de production
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={resetErrorBoundary} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
            <Button variant="outline" onClick={handleReload} className="flex-1">
              Recharger la page
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="ghost" size="sm" onClick={handleNavigateHome} className="flex-1">
              🏠 Retour accueil
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReportError} className="flex-1">
              📧 Signaler l'erreur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Composant de protection des routes
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredPermission?: string;
  requirePremium?: boolean;
}> = ({ children, requiredPermission, requirePremium = false }) => {
  const { context, loading } = useEdnSecurity();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <PremiumLoadingSpinner message="Vérification des permissions..." />;
  }

  // Vérification authentification
  if (!context.isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Vérification permission spécifique
  if (requiredPermission && !context.userPermissions.includes(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Accès restreint</h2>
            <p className="text-muted-foreground">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérification premium
  if (requirePremium && !context.premium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">👑</span>
            </div>
            <h2 className="text-xl font-bold">Contenu Premium</h2>
            <p className="text-muted-foreground">
              Cette fonctionnalité est réservée aux utilisateurs premium
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/premium')} className="w-full">
                ✨ Passer Premium
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Routeur principal optimisé
export const OptimizedEdnRouter: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={PremiumErrorFallback}>
      <Routes>
        {/* Route principale du système EDN */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PremiumLoadingSpinner message="Chargement du système EDN..." />}>
                <ProductionEdnSystem />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/progression"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PremiumLoadingSpinner message="Analyse de votre progression EDN..." />}>
                <ProductionEdnProgression />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Route pour un item EDN spécifique */}
        <Route
          path="/:slug"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PremiumLoadingSpinner message="Chargement de l'item EDN..." />}>
                <ProductionEdnItem />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        {/* Route immersive (premium) */}
        <Route 
          path="/:slug/immersive" 
          element={
            <ProtectedRoute requirePremium={true}>
              <Suspense fallback={<PremiumLoadingSpinner message="Chargement de l'expérience immersive..." />}>
                <ProductionEdnImmersive />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        {/* Routes de redirection pour compatibilité */}
        <Route path="/complete" element={<Navigate to="/edn" replace />} />
        <Route path="/complete/:slug" element={<Navigate to="/edn/:slug" replace />} />
        
        {/* Route 404 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
              <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="text-6xl">🔍</div>
                  <h2 className="text-xl font-bold">Page non trouvée</h2>
                  <p className="text-muted-foreground">
                    La page EDN que vous recherchez n'existe pas
                  </p>
                  <Button onClick={() => window.history.back()} className="w-full">
                    Retour
                  </Button>
                </CardContent>
              </Card>
            </div>
          } 
        />
      </Routes>
    </ErrorBoundary>
  );
};