import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Lazy load EDN components for better performance
const EdnIndex = lazy(() => import('@/pages/EcosIndex'));
const EdnItem = lazy(() => import('@/pages/EdnItem'));  
const EdnImmersive = lazy(() => import('@/pages/EdnImmersive'));
const EdnSearch = lazy(() => import('@/pages/EcosIndex')); // Fallback
const EdnCategories = lazy(() => import('@/pages/EcosIndex')); // Fallback

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class EdnErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('EDN Router Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <EdnErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Error Fallback Component
const EdnErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="container mx-auto px-4 py-8">
    <Alert className="max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <h3 className="font-semibold">Erreur lors du chargement</h3>
          <p className="text-sm">
            Une erreur est survenue lors du chargement du contenu EDN.
          </p>
          {error && (
            <details className="text-xs">
              <summary>Détails techniques</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.reload()}
              size="sm"
            >
              Recharger la page
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              size="sm"
            >
              Retour
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  </div>
);

// Loading Component
const EdnLoadingFallback: React.FC<{ message?: string }> = ({ 
  message = "Chargement du contenu EDN..." 
}) => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  </div>
);

// Route Validator Component
const EdnRouteValidator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { itemCode } = useParams();
  const [isValidating, setIsValidating] = useState(!!itemCode);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (!itemCode) {
      setIsValidating(false);
      return;
    }

    // Validate item code format (IC-XXX)
    const itemCodeRegex = /^IC-\d+$/;
    const isValidFormat = itemCodeRegex.test(itemCode);

    if (!isValidFormat) {
      setIsValid(false);
      setIsValidating(false);
      return;
    }

    // Additional validation could be added here
    // For now, we assume all IC-XXX codes are valid
    setIsValid(true);
    setIsValidating(false);
  }, [itemCode]);

  if (isValidating) {
    return <EdnLoadingFallback message="Validation du code item..." />;
  }

  if (!isValid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <h3 className="font-semibold">Code item invalide</h3>
              <p className="text-sm">
                Le code item "{itemCode}" n'est pas valide. Les codes items doivent 
                suivre le format IC-XXX (ex: IC-221).
              </p>
              <Button 
                onClick={() => window.history.back()}
                size="sm"
              >
                Retour
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

// Analytics Hook for route tracking
const useEdnRouteAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track EDN route navigation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'EDN Content',
        page_location: location.pathname,
        content_group1: 'EDN',
        content_group2: location.pathname.split('/')[2] || 'index'
      });
    }

    // Custom analytics for EDN usage
    const pathSegments = location.pathname.split('/');
    if (pathSegments[1] === 'edn' && pathSegments[2]) {
      const eventData = {
        item_code: pathSegments[2],
        route_type: pathSegments[3] || 'default',
        timestamp: new Date().toISOString()
      };

      // Store analytics data locally if needed
      try {
        const analyticsData = JSON.parse(localStorage.getItem('edn_analytics') || '[]');
        analyticsData.push(eventData);
        
        // Keep only last 100 entries
        if (analyticsData.length > 100) {
          analyticsData.splice(0, analyticsData.length - 100);
        }
        
        localStorage.setItem('edn_analytics', JSON.stringify(analyticsData));
      } catch (error) {
        console.warn('Analytics storage error:', error);
      }
    }
  }, [location]);
};

// Main Optimized EDN Router Component
export const OptimizedEdnRouter: React.FC = () => {
  useEdnRouteAnalytics();

  return (
    <EdnErrorBoundary>
      <Suspense fallback={<EdnLoadingFallback />}>
        <Routes>
          {/* EDN Index */}
          <Route path="/" element={<EdnIndex />} />
          
          {/* EDN Search */}
          <Route path="/search" element={<EdnSearch />} />
          
          {/* EDN Categories */}
          <Route path="/categories" element={<EdnCategories />} />
          <Route path="/categories/:category" element={<EdnCategories />} />
          
          {/* EDN Item Routes with validation */}
          <Route 
            path="/:itemCode" 
            element={
              <EdnRouteValidator>
                <EdnItem />
              </EdnRouteValidator>
            } 
          />
          
          <Route 
            path="/:itemCode/immersive" 
            element={
              <EdnRouteValidator>
                <EdnImmersive />
              </EdnRouteValidator>
            } 
          />
          
          {/* Redirect legacy routes */}
          <Route path="/item/:itemCode" element={<Navigate to="/:itemCode" replace />} />
          <Route path="/immersive/:itemCode" element={<Navigate to="/:itemCode/immersive" replace />} />
          
          {/* Catch all - redirect to EDN index */}
          <Route path="*" element={<Navigate to="/edn" replace />} />
        </Routes>
      </Suspense>
    </EdnErrorBoundary>
  );
};

export default OptimizedEdnRouter;
