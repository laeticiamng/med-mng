import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cookie, Shield, Settings, Eye, BarChart3, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { effacerChoixCookies } from '@/lib/consentementCookies';

const CookiesPolicy = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_cookies_policy' } });
  }, []);

  return (
    <>
    <SEOHead
      title="Politique cookies"
      description="Politique de cookies de Med MNG : cookies essentiels, statistiques de l'hébergeur et mesure d'audience optionnelle."
      keywords="cookies, RGPD, confidentialité, Med MNG"
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
              <p className="text-sm opacity-90">Dernière mise à jour : 4 octobre 2026</p>
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
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone)
                lors de votre visite sur Med MNG. Il permet de stocker des informations relatives à votre
                navigation et de vous offrir une expérience personnalisée.
              </p>
              <p className="text-sm">
                La session de connexion contient l'identifiant et l'adresse e-mail de votre compte (elle vous
                authentifie) ; les autres traceurs ci-dessous n'identifient pas directement une personne. Aucun
                ne peut endommager votre appareil.
              </p>
            </div>
          </Card>

          {/* 2. Cookies utilises — inventaire relevé en production le 04.10.2026 (cookies,
              stockage local, stockage de session, IndexedDB, cache de l'application). */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">2. COOKIES ET TRACEURS UTILISÉS SUR Med MNG</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              {/* Essentiels */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Essentiels (toujours actifs)</h4>
                <p className="text-sm mb-2">
                  Indispensables au fonctionnement du site et de votre compte ; ils ne peuvent pas être désactivés.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-foreground">Nom</th>
                        <th className="text-left p-2 text-foreground">Où</th>
                        <th className="text-left p-2 text-foreground">Finalité</th>
                        <th className="text-left p-2 text-foreground">Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">sb-…-auth-token</td>
                        <td className="p-2">Navigateur (stockage local)</td>
                        <td className="p-2">Session de connexion (Supabase)</td>
                        <td className="p-2">Jusqu'à la déconnexion</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">medmng_cookie_consent, medmng_cookie_preferences</td>
                        <td className="p-2">Navigateur (stockage local)</td>
                        <td className="p-2">Votre choix dans le bandeau cookies</td>
                        <td className="p-2">Jusqu'à modification</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">med-mng-ui-theme</td>
                        <td className="p-2">Navigateur (stockage local)</td>
                        <td className="p-2">Thème clair ou sombre</td>
                        <td className="p-2">Jusqu'à modification</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">auth_rate_limit_*</td>
                        <td className="p-2">Navigateur (stockage local)</td>
                        <td className="p-2">Limite des tentatives de connexion répétées (sécurité)</td>
                        <td className="p-2">Fenêtre de 15 minutes ; blocage de 30 minutes au plus</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">edn_items_cache_v4</td>
                        <td className="p-2">Navigateur (stockage local)</td>
                        <td className="p-2">Liste des items (chargement rapide)</td>
                        <td className="p-2">Renouvelée à chaque mise à jour</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">med_mng_offline_db, medmng_offline, cache de l'application</td>
                        <td className="p-2">Navigateur (IndexedDB, cache)</td>
                        <td className="p-2">Application installable et fiches lisibles hors connexion</td>
                        <td className="p-2">Jusqu'à effacement des données du site</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">__cf_bm</td>
                        <td className="p-2">Cookie (Cloudflare, réseau de l'hébergeur)</td>
                        <td className="p-2">Distinguer les visiteurs des robots (sécurité)</td>
                        <td className="p-2">30 minutes</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-xs">__dpl</td>
                        <td className="p-2">Cookie (Lovable, hébergeur)</td>
                        <td className="p-2">Version du site servie</td>
                        <td className="p-2">7 jours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statistiques de l'hébergeur */}
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Statistiques de l'hébergeur (toujours actives)</h4>
                <p className="text-sm mb-2">
                  Lovable, qui sert le site, compte les pages vues : à chaque page, il reçoit la page visitée, le site
                  d'origine, le navigateur, la langue et le pays déduit du fuseau horaire, avec un identifiant de
                  visite aléatoire. Ni publicité, ni profil. Ces statistiques ne dépendent pas du bandeau.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-foreground">Nom</th>
                        <th className="text-left p-2 text-foreground">Où</th>
                        <th className="text-left p-2 text-foreground">Finalité</th>
                        <th className="text-left p-2 text-foreground">Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 font-mono text-xs">session-id</td>
                        <td className="p-2">Cookie (Lovable, hébergeur)</td>
                        <td className="p-2">Identifiant de visite des statistiques de l'hébergeur</td>
                        <td className="p-2">30 minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mesure d'audience Med MNG */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Mesure d'audience Med MNG (optionnelle, avec votre accord)</h4>
                <p className="text-sm mb-2">
                  Avant la connexion, et seulement si vous l'acceptez dans le bandeau, la visite de la page Tarifs est
                  enregistrée dans la base de Med MNG (Supabase, Francfort) avec un identifiant aléatoire propre à
                  l'onglet, sans nom ni e-mail. Sans accord, rien n'est enregistré avant la connexion. Une fois
                  connecté·e, l'utilisation du service (révisions, inscription, paiement, mesures techniques de la
                  session) est enregistrée avec votre compte pour le faire fonctionner et l'améliorer.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-foreground">Nom</th>
                        <th className="text-left p-2 text-foreground">Où</th>
                        <th className="text-left p-2 text-foreground">Finalité</th>
                        <th className="text-left p-2 text-foreground">Durée</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-2 font-mono text-xs">conversion_session</td>
                        <td className="p-2">Navigateur (stockage de session)</td>
                        <td className="p-2">Identifiant aléatoire de la visite (page Tarifs, inscription, paiement)</td>
                        <td className="p-2">Jusqu'à la fermeture de l'onglet ou au retrait de votre accord</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono text-xs">analytics_session</td>
                        <td className="p-2">Navigateur (stockage de session)</td>
                        <td className="p-2">Identifiant de session des statistiques d'utilisation (compte connecté)</td>
                        <td className="p-2">Jusqu'à la fermeture de l'onglet</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-sm italic">
                Med MNG n'utilise <strong>aucun cookie publicitaire</strong> ni traceur de réseau social.
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
              <h4 className="font-semibold text-foreground">3.1 Bannière de consentement</h4>
              <p className="text-sm">
                Lors de votre première visite, une bannière vous permet d'accepter ou de refuser la mesure
                d'audience de Med MNG. Votre choix est conservé dans votre navigateur jusqu'à ce que vous le
                modifiiez ; la bannière est reproposée si son contenu change. Les cookies essentiels et les
                statistiques de l'hébergeur ne dépendent pas de ce choix.
              </p>
              <Button variant="outline" size="sm" onClick={() => { effacerChoixCookies(); window.location.reload(); }}>
                Modifier mon choix
              </Button>

              <h4 className="font-semibold text-foreground mt-4">3.2 Paramètres du navigateur</h4>
              <p className="text-sm">
                Vous pouvez également configurer votre navigateur pour accepter ou refuser les cookies :
              </p>
              <ul className="text-sm space-y-1">
                <li>- <strong>Chrome</strong> : Paramètres &gt; Confidentialité et sécurité &gt; Cookies</li>
                <li>- <strong>Firefox</strong> : Paramètres &gt; Vie privée et sécurité &gt; Cookies</li>
                <li>- <strong>Safari</strong> : Préférences &gt; Confidentialité &gt; Cookies</li>
                <li>- <strong>Edge</strong> : Paramètres &gt; Confidentialité &gt; Cookies</li>
              </ul>

              <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive mt-4">
                <p className="text-sm text-destructive font-semibold">
                  Attention : La désactivation des cookies strictement nécessaires peut empêcher
                  le fonctionnement normal de Med MNG (connexion, sauvegarde des préférences).
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
                En complément des cookies, Med MNG utilise le <strong>localStorage</strong> de votre navigateur
                pour stocker des données localement afin d'améliorer les performances (cache des items EDN,
                préférences utilisateur, données hors ligne pour la PWA).
              </p>
              <p className="text-sm">
                Ces données restent sur votre appareil et ne sont pas transmises a nos serveurs.
                Vous pouvez les supprimer a tout moment via les outils de développement de votre navigateur
                ou en vidant les données du site.
              </p>
            </div>
          </Card>

          {/* 5. Transfert de donnees */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">5. SÉCURITÉ ET TRANSFERT DE DONNÉES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="text-sm">
                Les données collectées via les cookies sont traitées conformément à notre{' '}
                <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">Politique de Confidentialité</Link>.
                Les statistiques de l'hébergeur sont traitées par <strong>Lovable</strong> (États-Unis), qui sert le
                site ; la mesure d'audience de Med MNG est enregistrée chez <strong>Supabase</strong> (Union
                européenne, Francfort).
              </p>
              <p className="text-sm">
                Aucune donnée de cookie n'est vendue ou partagée avec des tiers a des fins commerciales.
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
                Conformément au RGPD, vous disposez des droits suivants concernant vos données de cookies :
              </p>
              <ul className="text-sm space-y-1">
                <li>- <strong>Droit d'accès</strong> : connaître les données collectées</li>
                <li>- <strong>Droit de rectification</strong> : modifier vos préférences</li>
                <li>- <strong>Droit de suppression</strong> : supprimer vos cookies</li>
                <li>- <strong>Droit d'opposition</strong> : refuser les cookies non essentiels</li>
                <li>- <strong>Droit à la portabilité</strong> : exporter vos données</li>
              </ul>
              <p className="text-sm mt-2">
                Pour exercer ces droits : <strong>contact@emotionscare.com</strong>
              </p>
              <p className="text-sm">
                Vous pouvez également adresser une réclamation à la <strong>CNIL</strong> (www.cnil.fr).
              </p>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-3">NOUS CONTACTER</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>EmotionsCare SASU</strong></p>
              <p>Appartement 1, 5 rue Caudron, 80000 Amiens, France</p>
              <p>Email : contact@emotionscare.com</p>
              <p>SIRET : 944 505 445 00014</p>
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
