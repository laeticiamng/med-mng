import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle, Zap, Wifi, Heart } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Afficher le prompt d'installation
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Réinitialiser le prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <>
      <SEOHead
        title="Installer MED-MNG - Application Mobile"
        description="Installez MED-MNG sur votre téléphone pour un accès rapide, mode offline et notifications. Disponible pour iOS et Android."
        keywords="installer app, PWA, application mobile, offline, médecine mobile"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/20 p-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-6 shadow-xl">
              <Smartphone className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Installez MED-MNG
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transformez votre apprentissage médical avec notre application installable
            </p>
          </div>

          {/* Status Card */}
          {isInstalled ? (
            <Card className="mb-8 border-success/20 bg-success/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-success" />
                  <div>
                    <CardTitle className="text-success">Application installée !</CardTitle>
                    <CardDescription className="text-success/80">
                      MED-MNG est prêt à l'emploi sur votre appareil
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full bg-success hover:bg-success/90"
                >
                  Ouvrir l'application
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Installation rapide</CardTitle>
                <CardDescription>
                  Installez MED-MNG en un clic pour une expérience optimale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isInstallable ? (
                  <Button 
                    onClick={handleInstallClick} 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Installer maintenant
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium mb-2">
                        📱 Installation manuelle
                      </p>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p><strong>Sur iPhone/iPad :</strong></p>
                        <ol className="list-decimal list-inside ml-2 space-y-1">
                          <li>Appuyez sur le bouton Partager (icône carré avec flèche)</li>
                          <li>Sélectionnez "Sur l'écran d'accueil"</li>
                          <li>Appuyez sur "Ajouter"</li>
                        </ol>
                        
                        <p className="mt-3"><strong>Sur Android :</strong></p>
                        <ol className="list-decimal list-inside ml-2 space-y-1">
                          <li>Ouvrez le menu Chrome (⋮)</li>
                          <li>Sélectionnez "Installer l'application"</li>
                          <li>Confirmez l'installation</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fonctionnalités */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Wifi className="w-10 h-10 text-primary mb-3" />
                <CardTitle>Mode Offline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Accédez aux items EDN et contenus même sans connexion internet. Parfait pour réviser n'importe où.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-warning mb-3" />
                <CardTitle>Chargement Rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Lancement instantané grâce au cache intelligent. Plus besoin d'attendre le chargement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="w-10 h-10 text-destructive mb-3" />
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Recevez des rappels pour vos sessions de révision et alertes importantes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="w-10 h-10 text-primary mb-3" />
                <CardTitle>Expérience Native</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface optimisée pour mobile avec gestes intuitifs et navigation fluide.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Avantages */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pourquoi installer MED-MNG ?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">
                    <strong>Accès instantané :</strong> Lancez l'app depuis votre écran d'accueil comme une vraie application
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">
                    <strong>Performance optimale :</strong> Cache intelligent pour un chargement ultra-rapide
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">
                    <strong>Mode plein écran :</strong> Profitez d'un affichage immersif sans barre de navigation
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">
                    <strong>Mises à jour automatiques :</strong> Bénéficiez toujours de la dernière version
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA Final */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              size="lg"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallPWA;
