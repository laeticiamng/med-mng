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
import { enregistrerPreferencesCookies, lirePreferencesCookies } from '@/lib/consentementCookies';

/**
 * Bandeau cookies : décrit les deux niveaux réellement en place (vérifié en production le
 * 07.10.2026, voir src/lib/consentementCookies.ts) :
 *  1. essentiels (toujours actifs) ;
 *  2. mesure d'audience Med MNG avant connexion (optionnelle, seul choix réel du bandeau).
 * Les statistiques de l'hébergeur Lovable (/~flock.js, cookie « session-id ») sont désactivées
 * depuis le 07.10.2026 (« Visitor analytics » coupé dans Lovable).
 * L'ancien texte annonçait « Plausible Analytics » (jamais chargé) et des « cookies fonctionnels »
 * que rien ne lisait.
 */
export const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mesure, setMesure] = useState(false);

  useEffect(() => {
    const enregistrees = lirePreferencesCookies();
    if (enregistrees) {
      setMesure(enregistrees.analytics);
    } else {
      // Affichage immédiat (recueil du choix avant toute mesure d'audience Med MNG)
      setShowBanner(true);
    }
  }, []);

  const enregistrer = (accepte: boolean) => {
    enregistrerPreferencesCookies(accepte);
    setMesure(accepte);
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Bannière principale (masquée pendant le détail : elle recouvrait le bas de la fenêtre et son bouton) */}
      {!showSettings && (
      // Région nommée : le bandeau est rendu hors du <main> et des autres repères (règle axe « region »)
      // data-bandeau-cookies : masqué (src/index.css) pendant qu'une fenêtre modale Radix est ouverte
      // (panneau d'accessibilité, recherche, menus) — sinon, en z-[100], il recouvrait le bas de la
      // fenêtre alors que celle-ci rend le reste de la page inerte (constat du 09.10.2026).
      <section
        aria-label="Bandeau cookies"
        data-bandeau-cookies=""
        className="fixed bottom-0 left-0 right-0 z-[100] bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_30px_rgba(0,0,0,0.1)] px-4 py-3"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Cookie className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Cookies essentiels : connexion et préférences. Aucune publicité, aucune statistique de l'hébergeur. La mesure d'audience de Med MNG
              (identifiant aléatoire, sans nom ni e-mail) est optionnelle : à vous de choisir.{' '}
              <Link to={ROUTE_PATHS.cookies} className="text-primary underline underline-offset-2 hover:decoration-2">
                En savoir plus
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={() => enregistrer(false)} variant="outline" size="sm">
              Refuser la mesure
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="sm"
              aria-label="Paramètres des cookies"
              title="Paramètres des cookies"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button onClick={() => enregistrer(true)} size="sm">
              Accepter la mesure
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* Détail des deux niveaux */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Paramètres des cookies
            </DialogTitle>
            <DialogDescription>
              Seule la mesure d'audience de Med MNG dépend de votre choix. Les cookies essentiels restent actifs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">Essentiels</h4>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Toujours actifs</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enregistrés dans votre navigateur : session de connexion, votre choix dans ce bandeau, le thème
                    clair ou sombre, la limite des tentatives de connexion, la liste des items et les données de
                    l'application hors connexion. Cookies techniques de l'hébergeur : « __cf_bm » (Cloudflare,
                    protection contre les robots, 30 minutes) et « __dpl » (Lovable, version du site servie, 7 jours).
                  </p>
                </div>
                <Switch checked disabled className="ml-4" aria-label="Cookies essentiels (toujours actifs)" />
              </div>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2">Mesure d'audience Med MNG (optionnelle)</h4>
                  <p className="text-sm text-muted-foreground">
                    Avant la connexion, avec votre accord, la visite de la page Tarifs est enregistrée dans la base de
                    Med MNG (Supabase, Francfort) avec un identifiant aléatoire propre à l'onglet, sans nom ni e-mail.
                    Sans accord, rien n'est enregistré avant la connexion. Une fois connecté·e, l'utilisation du
                    service (révisions, inscription, paiement) est enregistrée avec votre compte pour le faire
                    fonctionner et l'améliorer.
                  </p>
                </div>
                <Switch
                  checked={mesure}
                  onCheckedChange={setMesure}
                  className="ml-4"
                  aria-label="Mesure d'audience Med MNG"
                />
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Ce que nous ne faisons pas</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Aucun cookie publicitaire (Google Ads, Facebook Pixel…)</li>
                <li>Aucun traceur de réseau social</li>
                <li>Aucune revente de vos données</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={() => enregistrer(mesure)} className="flex-1">
              Enregistrer mes choix
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
