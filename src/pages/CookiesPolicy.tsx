import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cookie, Shield, Settings, Eye, BarChart3, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';
import { SEOHead } from '@/components/seo/SEOHead';

const CookiesPolicy = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_cookies_policy' } });
  }, []);

  return (
    <>
    <SEOHead
      title="Politique de Cookies - MED MNG"
      description="Politique de cookies de MED MNG. Cookies essentiels, fonctionnels et analytiques. Conforme RGPD et directive ePrivacy."
      keywords="cookies, RGPD, confidentialité, MED MNG"
      canonical="/legal/cookies"
    />
    <PremiumPageLayout gradient="default" showOrbs={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={ROUTE_PATHS.home} className="flex items-center space-x-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-3xl font-bold text-foreground">Politique de Cookies</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tete */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Cookie className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Politique de Cookies</h2>
              </div>
              <p className="text-sm opacity-90">Derniere mise a jour : 11 fevrier 2026</p>
              <p className="text-sm opacity-90">Conforme au RGPD (UE 2016/679) et a la directive ePrivacy</p>
            </div>
          </Card>

          {/* 1. Qu'est-ce qu'un cookie */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Cookie className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">1. QU'EST-CE QU'UN COOKIE ?</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Un cookie est un petit fichier texte depose sur votre terminal (ordinateur, tablette, smartphone)
                lors de votre visite sur MED MNG. Il permet de stocker des informations relatives a votre
                navigation et de vous offrir une experience personnalisee.
              </p>
              <p className="text-sm">
                Les cookies ne contiennent pas d'informations personnelles identifiables directement et ne
                peuvent pas endommager votre appareil.
              </p>
            </div>
          </Card>

          {/* 2. Cookies utilises */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">2. COOKIES UTILISES SUR MED MNG</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              {/* Cookies strictement necessaires */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Cookies strictement necessaires</h4>
                <p className="text-sm mb-2">
                  Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas etre desactives.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-foreground">Cookie</th>
                        <th className="text-left p-2 text-foreground">Finalite</th>
                        <th className="text-left p-2 text-foreground">Duree</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">sb-*-auth-token</td>
                        <td className="p-2">Authentification Supabase (session utilisateur)</td>
                        <td className="p-2">Session</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">med-mng-ui-theme</td>
                        <td className="p-2">Preference de theme (clair/sombre)</td>
                        <td className="p-2">1 an</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">cookie-consent</td>
                        <td className="p-2">Enregistrement du choix cookies</td>
                        <td className="p-2">13 mois</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-xs">med-mng-lang</td>
                        <td className="p-2">Preference de langue</td>
                        <td className="p-2">1 an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cookies de performance */}
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Cookies de performance et analytique</h4>
                <p className="text-sm mb-2">
                  Ces cookies permettent de mesurer l'audience et d'ameliorer nos services. Ils sont soumis a votre consentement.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-foreground">Cookie</th>
                        <th className="text-left p-2 text-foreground">Finalite</th>
                        <th className="text-left p-2 text-foreground">Duree</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">sentry-*</td>
                        <td className="p-2">Suivi des erreurs techniques (Sentry)</td>
                        <td className="p-2">Session</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-xs">pwa-metrics</td>
                        <td className="p-2">Metriques d'utilisation PWA</td>
                        <td className="p-2">30 jours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cookies fonctionnels */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Cookies fonctionnels</h4>
                <p className="text-sm mb-2">
                  Ces cookies ameliorent votre experience mais ne sont pas indispensables.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-foreground">Stockage</th>
                        <th className="text-left p-2 text-foreground">Finalite</th>
                        <th className="text-left p-2 text-foreground">Duree</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">edn-items-cache</td>
                        <td className="p-2">Cache local des items EDN (chargement rapide)</td>
                        <td className="p-2">7 jours</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">audio-preferences</td>
                        <td className="p-2">Preferences du lecteur audio (volume, lecture automatique)</td>
                        <td className="p-2">1 an</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-xs">offline-data</td>
                        <td className="p-2">Donnees hors connexion (PWA)</td>
                        <td className="p-2">30 jours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-sm italic">
                MED MNG n'utilise <strong>aucun cookie publicitaire</strong> ni de traceur marketing tiers.
              </p>
            </div>
          </Card>

          {/* 3. Gestion des cookies */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">3. GESTION DE VOS COOKIES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <h4 className="font-semibold text-foreground">3.1 Banniere de consentement</h4>
              <p className="text-sm">
                Lors de votre premiere visite, une banniere de consentement vous permet d'accepter ou de
                refuser les cookies non essentiels. Votre choix est conserve pendant 13 mois.
              </p>

              <h4 className="font-semibold text-foreground mt-4">3.2 Parametres du navigateur</h4>
              <p className="text-sm">
                Vous pouvez egalement configurer votre navigateur pour accepter ou refuser les cookies :
              </p>
              <ul className="text-sm space-y-1">
                <li>- <strong>Chrome</strong> : Parametres &gt; Confidentialite et securite &gt; Cookies</li>
                <li>- <strong>Firefox</strong> : Parametres &gt; Vie privee et securite &gt; Cookies</li>
                <li>- <strong>Safari</strong> : Preferences &gt; Confidentialite &gt; Cookies</li>
                <li>- <strong>Edge</strong> : Parametres &gt; Confidentialite &gt; Cookies</li>
              </ul>

              <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive mt-4">
                <p className="text-sm text-destructive font-semibold">
                  Attention : La desactivation des cookies strictement necessaires peut empecher
                  le fonctionnement normal de MED MNG (connexion, sauvegarde des preferences).
                </p>
              </div>
            </div>
          </Card>

          {/* 4. LocalStorage et technologies similaires */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">4. LOCALSTORAGE ET TECHNOLOGIES SIMILAIRES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="text-sm">
                En complement des cookies, MED MNG utilise le <strong>localStorage</strong> de votre navigateur
                pour stocker des donnees localement afin d'ameliorer les performances (cache des items EDN,
                preferences utilisateur, donnees hors ligne pour la PWA).
              </p>
              <p className="text-sm">
                Ces donnees restent sur votre appareil et ne sont pas transmises a nos serveurs.
                Vous pouvez les supprimer a tout moment via les outils de developpement de votre navigateur
                ou en vidant les donnees du site.
              </p>
            </div>
          </Card>

          {/* 5. Transfert de donnees */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">5. SECURITE ET TRANSFERT DE DONNEES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="text-sm">
                Les donnees collectees via les cookies sont traitees conformement a notre{' '}
                <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">Politique de Confidentialite</Link>.
                Elles sont hebergees sur les serveurs de <strong>Supabase</strong> (infrastructure AWS, region EU).
              </p>
              <p className="text-sm">
                Aucune donnee de cookie n'est vendue ou partagee avec des tiers a des fins commerciales.
              </p>
            </div>
          </Card>

          {/* 6. Vos droits */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">6. VOS DROITS</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="text-sm">
                Conformement au RGPD, vous disposez des droits suivants concernant vos donnees de cookies :
              </p>
              <ul className="text-sm space-y-1">
                <li>- <strong>Droit d'acces</strong> : connaitre les donnees collectees</li>
                <li>- <strong>Droit de rectification</strong> : modifier vos preferences</li>
                <li>- <strong>Droit de suppression</strong> : supprimer vos cookies</li>
                <li>- <strong>Droit d'opposition</strong> : refuser les cookies non essentiels</li>
                <li>- <strong>Droit a la portabilite</strong> : exporter vos donnees</li>
              </ul>
              <p className="text-sm mt-2">
                Pour exercer ces droits : <strong>contact@emotionscare.com</strong>
              </p>
              <p className="text-sm">
                Vous pouvez egalement adresser une reclamation a la <strong>CNIL</strong> (www.cnil.fr).
              </p>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-3">NOUS CONTACTER</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>EmotionsCare SASU</strong></p>
              <p>5 rue Caudron, 80000 Amiens, France</p>
              <p>Email : contact@emotionscare.com</p>
              <p>SIRET : 944 505 445 00011</p>
            </div>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to={ROUTE_PATHS.home}>
              <Button className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour a l'accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumPageLayout>
    </>
  );
};

export default CookiesPolicy;
