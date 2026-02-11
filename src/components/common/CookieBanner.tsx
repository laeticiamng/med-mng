import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ROUTE_PATHS } from '@/config/routes';

const COOKIE_CONSENT_KEY = 'medmng_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'medmng_cookie_preferences';

interface CookiePreferences {
  essential: boolean; // Toujours true, non désactivable
  functional: boolean;
  analytics: boolean;
}

export const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    if (!consent) {
      // Affichage immédiat (obligation CNIL : recueil du consentement avant tout dépôt de cookie non essentiel)
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
    setShowSettings(false);

    // Tracking activé selon les préférences utilisateur
    // Les intégrations analytics (Plausible, etc.) sont gérées côté configuration
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptEssentialOnly = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
    };
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Bannière principale */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_30px_rgba(0,0,0,0.1)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Cookie className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground truncate sm:whitespace-normal">
              Nous utilisons des cookies essentiels.{' '}
              <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">
                En savoir plus
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              onClick={acceptEssentialOnly} 
              variant="outline" 
              size="sm"
            >
              Essentiels
            </Button>
            <Button 
              onClick={() => setShowSettings(true)} 
              variant="ghost" 
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              onClick={acceptAll} 
              size="sm"
            >
              Accepter tout
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de paramètres détaillés */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Paramètres des cookies
            </DialogTitle>
            <DialogDescription>
              Choisissez les cookies que vous souhaitez autoriser. Les cookies essentiels 
              sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Cookies essentiels */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">🔒 Cookies essentiels</h4>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Obligatoires
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ces cookies sont nécessaires au fonctionnement du site. Ils permettent 
                    l'authentification, la sécurité et les fonctionnalités de base.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>• <strong>Session utilisateur</strong> : Conservation de votre connexion</p>
                    <p>• <strong>Sécurité CSRF</strong> : Protection contre les attaques</p>
                    <p>• <strong>Préférences d'interface</strong> : Mode sombre/clair, langue</p>
                    <p>• <strong>Durée</strong> : Session ou 30 jours maximum</p>
                  </div>
                </div>
                <Switch checked={true} disabled className="ml-4" />
              </div>
            </div>

            {/* Cookies fonctionnels */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">⚙️ Cookies fonctionnels</h4>
                  <p className="text-sm text-muted-foreground">
                    Ces cookies permettent d'améliorer l'expérience utilisateur avec des 
                    fonctionnalités avancées (sauvegarde automatique, suggestions personnalisées).
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>• <strong>Sauvegarde automatique</strong> : Vos brouillons de génération musicale</p>
                    <p>• <strong>Recommandations</strong> : Suggestions basées sur vos items préférés</p>
                    <p>• <strong>Lecteur audio</strong> : Mémorisation de la dernière position d'écoute</p>
                    <p>• <strong>Durée</strong> : 90 jours maximum</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.functional} 
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, functional: checked })
                  }
                  className="ml-4"
                />
              </div>
            </div>

            {/* Cookies analytiques */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">📊 Cookies analytiques</h4>
                  <p className="text-sm text-muted-foreground">
                    Ces cookies nous aident à comprendre comment vous utilisez MED MNG pour 
                    améliorer nos services. Toutes les données sont anonymisées.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p>• <strong>Pages visitées</strong> : Analyse des sections les plus utilisées</p>
                    <p>• <strong>Temps de génération</strong> : Optimisation des performances IA</p>
                    <p>• <strong>Taux d'échec</strong> : Identification des bugs techniques</p>
                    <p>• <strong>Outil</strong> : Plausible Analytics (conforme RGPD, sans IP)</p>
                    <p>• <strong>Durée</strong> : 13 mois maximum</p>
                  </div>
                </div>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  className="ml-4"
                />
              </div>
            </div>

            {/* Aucun cookie tiers */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">✅ Ce que nous ne faisons PAS :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>❌ Aucun cookie de publicité tierce (Google Ads, Facebook Pixel, etc.)</li>
                <li>❌ Aucun cookie de réseaux sociaux (trackers Facebook, Twitter, etc.)</li>
                <li>❌ Aucune revente de vos données à des tiers</li>
                <li>❌ Aucun tracking cross-site (fingerprinting, canvas tracking, etc.)</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={() => savePreferences(preferences)} className="flex-1">
              Enregistrer mes préférences
            </Button>
            <Button onClick={acceptAll} variant="outline" className="flex-1">
              Tout accepter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
