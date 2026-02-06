import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Download, Heart, Smartphone, Wifi, Zap, Bell, Shield, Monitor, Apple } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MVPFooter } from '@/components/layout/MVPFooter';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA: React.FC = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [_user, setUser] = useState<any>(null);
  
  const { stats: _gamificationStats, loadStats } = useGamification();
  const { logActivity } = useActivityTracking();

  // Load user and gamification stats
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadStats(user.id);
        await logActivity({ activity_type: 'study', metadata: { action: 'install_pwa_viewed' } });
      }
    };
    init();
  }, [loadStats, logActivity]);

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
      if (import.meta.env.DEV) console.log('User accepted the install prompt');
    } else {
      if (import.meta.env.DEV) console.log('User dismissed the install prompt');
    }

    // Réinitialiser le prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const features = [
    {
      icon: Wifi,
      title: "Fonctionne hors ligne",
      description: "Accédez à vos outils même sans connexion internet",
      color: "text-primary"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Recevez des rappels pour vos séances de révision",
      color: "text-warning"
    },
    {
      icon: Zap,
      title: "Accès rapide",
      description: "Lancez l'app directement depuis votre écran d'accueil",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Données sécurisées",
      description: "Vos données restent protégées et chiffrées",
      color: "text-success"
    }
  ];

  const faqItems = [
    {
      question: "Qu'est-ce qu'une PWA ?",
      answer: "Une Progressive Web App (PWA) est une application web qui fonctionne comme une application native. Elle s'installe sur votre appareil, fonctionne hors ligne et offre une expérience rapide."
    },
    {
      question: "L'installation est-elle gratuite ?",
      answer: "Oui, l'installation est entièrement gratuite. Il n'y a aucun passage par l'App Store ou le Play Store."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Vos données sont chiffrées et stockées de manière sécurisée. L'application respecte le RGPD et vos données personnelles ne sont jamais partagées."
    },
    {
      question: "Puis-je désinstaller l'application ?",
      answer: "Oui, vous pouvez la désinstaller à tout moment comme n'importe quelle autre application sur votre appareil."
    },
    {
      question: "L'app se met-elle à jour automatiquement ?",
      answer: "Oui, la PWA se met à jour automatiquement en arrière-plan. Vous bénéficiez toujours de la dernière version sans action de votre part."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Installer MED-MNG - Application Mobile"
        description="Installez MED-MNG sur votre téléphone pour un accès rapide, mode offline et notifications. Disponible pour iOS et Android."
        keywords="installer app, PWA, application mobile, offline, médecine mobile"
      />

      <main className="flex-1 p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-4 sm:mb-6 shadow-xl">
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Installez MED-MNG
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
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
                  onClick={() => navigate(ROUTE_PATHS.home)} 
                  className="w-full bg-success hover:bg-success/90"
                >
                  Ouvrir l'application
                </Button>
              </CardContent>
            </Card>
          ) : isInstallable ? (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Installation en un clic</CardTitle>
                <CardDescription>
                  Votre navigateur supporte l'installation directe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleInstallClick} 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Installer maintenant
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-4">
                <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Installation Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Instructions d'installation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ios" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="ios" className="text-xs sm:text-sm">
                    <Apple className="w-4 h-4 mr-1 sm:mr-2" />
                    iPhone / iPad
                  </TabsTrigger>
                  <TabsTrigger value="android" className="text-xs sm:text-sm">
                    <Smartphone className="w-4 h-4 mr-1 sm:mr-2" />
                    Android
                  </TabsTrigger>
                  <TabsTrigger value="desktop" className="text-xs sm:text-sm">
                    <Monitor className="w-4 h-4 mr-1 sm:mr-2" />
                    Ordinateur
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ios" className="space-y-4">
                  <h3 className="font-semibold text-lg">Installation sur iPhone / iPad</h3>
                  <p className="text-sm text-muted-foreground">Utilisez Safari pour une meilleure expérience</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium">Ouvrez Safari</p>
                        <p className="text-sm text-muted-foreground">Chrome et Firefox ne supportent pas l'installation sur iOS</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium">Appuyez sur le bouton Partager</p>
                        <p className="text-sm text-muted-foreground">L'icône carrée avec une flèche vers le haut (⬆️) en bas de l'écran</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium">Sélectionnez « Sur l'écran d'accueil »</p>
                        <p className="text-sm text-muted-foreground">Faites défiler les options si nécessaire</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <div>
                        <p className="font-medium">Appuyez sur « Ajouter »</p>
                        <p className="text-sm text-muted-foreground">L'icône MED-MNG apparaîtra sur votre écran d'accueil</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="android" className="space-y-4">
                  <h3 className="font-semibold text-lg">Installation sur Android</h3>
                  <p className="text-sm text-muted-foreground">Chrome est recommandé pour la meilleure expérience</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium">Ouvrez Chrome</p>
                        <p className="text-sm text-muted-foreground">Ou un autre navigateur compatible (Edge, Samsung Internet)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium">Appuyez sur le menu (⋮)</p>
                        <p className="text-sm text-muted-foreground">Les trois points verticaux en haut à droite</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium">Sélectionnez « Installer l'application »</p>
                        <p className="text-sm text-muted-foreground">Ou « Ajouter à l'écran d'accueil »</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">4</Badge>
                      <div>
                        <p className="font-medium">Confirmez l'installation</p>
                        <p className="text-sm text-muted-foreground">L'app sera disponible dans votre liste d'applications</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="desktop" className="space-y-4">
                  <h3 className="font-semibold text-lg">Installation sur ordinateur</h3>
                  <p className="text-sm text-muted-foreground">Chrome, Edge ou Brave sont recommandés</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium">Ouvrez Chrome, Edge ou Brave</p>
                        <p className="text-sm text-muted-foreground">Firefox ne supporte pas encore l'installation PWA sur desktop</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium">Cherchez l'icône d'installation</p>
                        <p className="text-sm text-muted-foreground">Dans la barre d'adresse, à droite, cliquez sur l'icône ⊕ ou 📥</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium">Cliquez sur « Installer »</p>
                        <p className="text-sm text-muted-foreground">L'application s'ouvrira dans sa propre fenêtre</p>
                      </div>
                    </div>
                  </div>
                  
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <p className="text-sm">
                        <span className="font-medium">⌨️ Raccourci Chrome/Edge :</span>{' '}
                        <span className="text-muted-foreground">
                          Menu (⋮) → « Installer MED-MNG... » ou « Plus d'outils » → « Créer un raccourci »
                        </span>
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Questions fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* CTA Final */}
          <div className="text-center mb-8">
            <Button 
              onClick={() => navigate(ROUTE_PATHS.home)} 
              variant="outline"
              size="lg"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </main>

      <MVPFooter />
    </div>
  );
};

export default InstallPWA;
