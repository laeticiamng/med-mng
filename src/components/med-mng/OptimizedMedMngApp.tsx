import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider, useAuth } from './AuthProvider';
import { MusicGenerationProvider } from './MusicGenerationProvider';
import { StudySessionProvider } from './StudySessionProvider';
import { NotificationProvider } from './NotificationProvider';
import { AccessibilityProvider } from './AccessibilityProvider';
import { Loader2, Music, BarChart3, BookOpen, Settings, Sparkles, User, LogOut } from 'lucide-react';

// Lazy load components for better performance
const MusicGenerationInterface = React.lazy(() => 
  import('./MusicGenerationInterface').then(module => ({ default: module.MusicGenerationInterface }))
);
const MedicalMusicLibrary = React.lazy(() => 
  import('./MedicalMusicLibrary').then(module => ({ default: module.MedicalMusicLibrary }))
);
const AnalyticsDashboard = React.lazy(() => 
  import('./AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard }))
);

// Loading fallback component
const LoadingFallback: React.FC<{ text?: string }> = ({ text = "Chargement..." }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Header component with user info and navigation
const AppHeader: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Music className="h-8 w-8 text-blue-600" />
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MED-MNG
              </h1>
              <p className="text-sm text-muted-foreground">
                Plateforme d'apprentissage médical par la musique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {user.user_metadata?.subscription_type || 'Standard'}
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Main dashboard content
const DashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('generate');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Générer
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Bibliothèque
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <Suspense fallback={<LoadingFallback text="Chargement du générateur de musique..." />}>
              <MusicGenerationInterface />
            </Suspense>
          </TabsContent>

          <TabsContent value="library">
            <Suspense fallback={<LoadingFallback text="Chargement de votre bibliothèque..." />}>
              <MedicalMusicLibrary />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics">
            <Suspense fallback={<LoadingFallback text="Chargement des analytics..." />}>
              <AnalyticsDashboard />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Access Footer */}
      <footer className="border-t bg-white/95 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 MED-MNG</span>
              <span>•</span>
              <span>Plateforme sécurisée</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </Button>
              
              <Badge variant="outline" className="gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                En ligne
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Welcome screen for non-authenticated users
const WelcomeScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
    <div className="max-w-md w-full mx-auto p-8">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardContent className="text-center p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Music className="h-12 w-12 text-blue-600" />
            <Sparkles className="h-8 w-8 text-purple-500" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            MED-MNG
          </h1>
          
          <p className="text-muted-foreground mb-8 text-lg">
            Révolutionnez votre apprentissage médical avec l'intelligence artificielle et la musique
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-left p-3 bg-blue-50 rounded-lg">
              <Music className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm">Générez des musiques éducatives personnalisées</span>
            </div>
            
            <div className="flex items-center gap-3 text-left p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <span className="text-sm">Suivez vos progrès avec des analytics avancées</span>
            </div>
            
            <div className="flex items-center gap-3 text-left p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Constituez votre bibliothèque médicale musicale</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
            Connectez-vous pour accéder à la plateforme
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MED-MNG Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <Card className="max-w-md w-full mx-auto">
            <CardContent className="text-center p-8">
              <div className="text-red-500 mb-4">
                <Settings className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-4">Une erreur est survenue</h2>
              <p className="text-muted-foreground mb-6">
                Nous nous excusons pour cette interruption. L'équipe technique a été notifiée.
              </p>
              <Button onClick={() => window.location.reload()}>
                Recharger la page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App component with routing
export const OptimizedMedMngApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Protected dashboard routes */}
          <Route path="/med-mng/dashboard/*" element={
            <ProtectedRoute fallback="/med-mng/login">
              <DashboardContent />
            </ProtectedRoute>
          } />
          
          {/* Auth routes */}
          <Route path="/med-mng/login" element={<WelcomeScreen />} />
          <Route path="/med-mng/signup" element={<WelcomeScreen />} />
          
          {/* Default redirect */}
          <Route path="/med-mng" element={<Navigate to="/med-mng/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/med-mng/dashboard" replace />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/med-mng/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};