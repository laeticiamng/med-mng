import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { AlertTriangle, ArrowLeft, CheckCircle, Eye, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';

const DeclarationAccessibilite = () => {
  return (
    <PremiumPageLayout gradient="default" showOrbs={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={ROUTE_PATHS.home} className="flex items-center space-x-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-3xl font-bold text-foreground">Déclaration d'Accessibilité</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* CONSTAT (audit du 07.10.2026, MM-A05) : cette page annonçait « totalement
              conforme RGAA 4.1 (100 %) », « 106/106 critères », des tests manuels au lecteur
              d'écran et un plan d'action daté, sans qu'aucun audit RGAA n'ait été conduit.
              Seul un audit automatisé axe-core a été réalisé : l'état déclaré est donc
              « partiellement conforme », avec la méthode et les limites réelles. */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Eye className="h-8 w-8" aria-hidden="true" />
                <h2 className="text-2xl font-bold">Med MNG - Accessibilité Numérique</h2>
              </div>
              <p className="text-sm opacity-90">Référentiel visé : RGAA 4.1 (critères WCAG 2.1 niveau AA)</p>
              <p className="text-sm opacity-90">Dernière évaluation : 7 octobre 2026</p>
            </div>
          </Card>

          {/* État de conformité */}
          <Alert className="bg-warning/10 border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
            <AlertDescription>
              <p className="font-semibold text-lg mb-2">État de conformité</p>
              <p className="text-sm">
                Med MNG est <strong>partiellement conforme</strong> au RGAA 4.1. Aucun audit RGAA manuel
                complet n&apos;a encore été réalisé : le taux de conformité aux critères du RGAA n&apos;est
                donc pas connu et nous ne l&apos;affichons pas.
              </p>
            </AlertDescription>
          </Alert>

          {/* 1. Engagement */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-foreground">1. NOTRE ENGAGEMENT</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                EmotionsCare s&apos;engage à rendre Med MNG accessible à toutes et tous. La présente déclaration
                décrit ce qui a réellement été vérifié, ce qui ne l&apos;a pas été et comment nous signaler une
                difficulté.
              </p>
            </div>
          </Card>

          {/* 2. Méthode */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-foreground">2. MÉTHODE D&apos;ÉVALUATION</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <ul className="text-sm space-y-2">
                <li>
                  • <strong>Audit automatisé</strong> avec axe-core (Deque), règles WCAG 2.1 niveaux A et AA,
                  le 7 octobre 2026.
                </li>
                <li>• <strong>13 pages publiques</strong>, chacune testée en thèmes clair et sombre.</li>
                <li>
                  • <strong>Pas d&apos;audit RGAA manuel complet</strong> : pas de vérification critère par
                  critère des 106 critères, pas de test au lecteur d&apos;écran ni de tests utilisateurs.
                </li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6 mb-3">Pages évaluées</h4>
              <div className="bg-card p-4 rounded-lg">
                <ul className="text-sm space-y-1 grid sm:grid-cols-2 gap-x-6">
                  <li>• Accueil</li>
                  <li>• Connexion</li>
                  <li>• Inscription</li>
                  <li>• Tarifs</li>
                  <li>• Catalogue des items EDN</li>
                  <li>• Bibliothèque musicale EDN (retirée depuis)</li>
                  <li>• Situations ECOS</li>
                  <li>• Méthode MNG</li>
                  <li>• FAQ</li>
                  <li>• Mentions légales</li>
                  <li>• Conditions générales d&apos;utilisation</li>
                  <li>• Politique de confidentialité</li>
                  <li>• Déclaration d&apos;accessibilité (cette page)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 3. Non-conformités et limites connues */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-foreground">3. NON-CONFORMITÉS ET LIMITES CONNUES</h3>
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>
                • Un audit automatisé ne détecte qu&apos;une partie des défauts d&apos;accessibilité : la
                pertinence des alternatives textuelles, l&apos;ordre de lecture, la compréhension des
                contenus et l&apos;usage avec un lecteur d&apos;écran n&apos;ont pas été vérifiés.
              </li>
              <li>
                • Les pages réservées aux comptes connectés (fiches d&apos;item, quiz, déroulé d&apos;une
                situation ECOS, création de chansons, bibliothèque personnelle, profil, abonnement)
                n&apos;ont pas été évaluées.
              </li>
              <li>
                • Les morceaux audio générés n&apos;ont pas fait l&apos;objet d&apos;une évaluation de leurs
                alternatives (transcription des paroles, contrôles du lecteur).
              </li>
            </ul>
          </Card>

          {/* 4. Dérogations */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-foreground">4. DÉROGATIONS</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Aucune dérogation pour charge disproportionnée n&apos;est invoquée. Les limites ci-dessus sont des
              vérifications restant à faire, pas des exemptions.
            </p>
          </Card>

          {/* 5. Retour d'information et contact */}
          <Card className="p-6 bg-primary/10">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">5. SIGNALER UN PROBLÈME D'ACCESSIBILITÉ</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Si vous rencontrez un problème d'accessibilité sur Med MNG (contenu inaccessible, difficulté de navigation, etc.), 
                merci de nous le signaler :
              </p>
              <div className="bg-card p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">📧 Contact accessibilité :</p>
                <ul className="text-sm space-y-1">
                   <li>• Email de contact : <a href="mailto:contact@emotionscare.com" className="text-primary underline underline-offset-2 hover:decoration-2"><strong>contact@emotionscare.com</strong></a> (objet : "Accessibilité")</li>
                </ul>
                <p className="text-sm mt-3 italic">
                  Nous nous engageons à vous répondre sous <strong>5 jours ouvrés</strong> et à apporter une solution 
                  ou alternative accessible dans un délai raisonnable (généralement sous 1 mois).
                </p>
              </div>
            </div>
          </Card>

          {/* 6. Voies de recours */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">6. VOIES DE RECOURS</h3>
            </div>
            <div className="text-muted-foreground">
              <p className="mb-3">
                Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité, 
                que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse satisfaisante, vous pouvez :
              </p>
              <div className="bg-card p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">📞 Défenseur des droits</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Formulaire de contact : https://formulaire.defenseurdesdroits.fr/</li>
                    <li>• Liste des délégués : https://www.defenseurdesdroits.fr/saisir/delegues</li>
                    <li>• Téléphone : 09 69 39 00 00 (coût d'un appel local)</li>
                    <li>• Adresse postale : Le Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Date de publication */}
          <Card className="p-4 bg-card text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Première publication :</strong> 4 novembre 2025
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Dernière révision le :</strong> 7 octobre 2026
            </p>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to={ROUTE_PATHS.home}>
              <Button className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumPageLayout>
  );
};

export default DeclarationAccessibilite;
