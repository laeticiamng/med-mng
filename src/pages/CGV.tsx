import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, CreditCard, RefreshCw, Scale, Ban, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';
import { SEOHead } from '@/components/seo/SEOHead';

const CGV = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_cgv' } });
  }, []);

  return (
    <>
    <SEOHead
      title="Conditions Générales de Vente - MED MNG"
      description="CGV de MED MNG par EmotionsCare SASU. Tarifs, abonnements, droit de rétractation, garanties légales et modalités de paiement."
      keywords="CGV, conditions générales de vente, abonnement, tarifs, MED MNG"
      canonical="/legal/cgv"
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
            <h1 className="text-3xl font-bold text-foreground">Conditions Générales de Vente</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG - CGV</h2>
              </div>
              <p className="text-sm opacity-90">Dernière mise à jour : 11 février 2026</p>
              <p className="text-sm opacity-90">Version 1.0 - Conforme au droit français de la consommation</p>
            </div>
          </Card>

          {/* 1. Objet */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">1. OBJET</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre :
              </p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm"><strong>Le vendeur :</strong> EmotionsCare SASU</p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>Capital social : 100 euros</li>
                  <li>Siège social : Appartement 1, 5 rue Caudron, 80000 Amiens, France</li>
                  <li>RCS Amiens : 944 505 445 (inscrit le 21/05/2025)</li>
                  <li>SIRET : 944 505 445 00014</li>
                  <li>TVA intracommunautaire : FR89944505445</li>
                  <li>Email : contact@emotionscare.com</li>
                  <li>Présidente : Laeticia Motongane</li>
                </ul>
              </div>
              <p className="text-sm">
                Et tout utilisateur souhaitant souscrire à un abonnement payant sur la plateforme MED MNG
                (ci-après "le Client").
              </p>
              <p className="text-sm font-semibold text-foreground">
                Toute souscription à un abonnement implique l'acceptation sans réserve des présentes CGV,
                des <Link to={ROUTE_PATHS.cgu} className="text-primary hover:underline">CGU</Link> et de
                la <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">Politique de confidentialité</Link>.
              </p>
            </div>
          </Card>

          {/* 2. Services proposés */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">2. SERVICES PROPOSÉS</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>MED MNG propose des abonnements donnant accès à :</p>
              <ul className="space-y-1 text-sm">
                <li>- Génération de l'audio de chansons pédagogiques par IA (paroles : OpenAI ; audio : Suno AI), selon le quota de la formule</li>
                <li>- Les contenus accessibles gratuitement restent inclus : 367 items EDN (fiche, compétences rang A et rang B, quiz, paroles), situations ECOS</li>
                <li>- Bibliothèque personnelle des chansons générées</li>
              </ul>
              <p className="text-sm italic">
                Les contenus sont générés par intelligence artificielle et ne constituent en aucun cas un avis médical.
              </p>
            </div>
          </Card>

          {/* 3. Tarifs et formules */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">3. TARIFS ET FORMULES D'ABONNEMENT</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Formules disponibles :</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Gratuit</strong> : 3 générations audio offertes - 0 euro</li>
                  <li><strong>Standard</strong> : 30 générations audio par mois - 19 euros/mois</li>
                  <li><strong>Pro</strong> : 300 générations audio par mois - 29 euros/mois</li>
                  <li><strong>Premium</strong> : 3 000 générations audio par mois - 39 euros/mois</li>
                </ul>
              </div>
              <p className="text-sm">
                Les prix sont indiqués en euros TTC. EmotionsCare se réserve le droit de modifier ses tarifs
                à tout moment. Les modifications tarifaires prendront effet au prochain renouvellement de l'abonnement
                et seront notifiées <strong>30 jours</strong> à l'avance par email.
              </p>
              <p className="text-sm">
                Consultez la page <Link to={ROUTE_PATHS.medMngPricing} className="text-primary hover:underline font-semibold">Tarifs</Link> pour
                les tarifs en vigueur.
              </p>
            </div>
          </Card>

          {/* 4. Commande et paiement */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">4. COMMANDE ET PAIEMENT</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <h4 className="font-semibold text-foreground">4.1 Processus de commande</h4>
              <ol className="text-sm space-y-1">
                <li>1. Création d'un compte sur MED MNG</li>
                <li>2. Sélection de la formule d'abonnement</li>
                <li>3. Acceptation des CGV et CGU</li>
                <li>4. Paiement sécurisé via Stripe</li>
                <li>5. Confirmation par email</li>
              </ol>

              <h4 className="font-semibold text-foreground mt-4">4.2 Moyens de paiement</h4>
              <p className="text-sm">
                Les paiements sont sécurisés par <strong>Stripe</strong>. EmotionsCare ne conserve aucune donnée
                bancaire. Les moyens acceptés sont : carte bancaire (Visa, Mastercard, American Express).
              </p>

              <h4 className="font-semibold text-foreground mt-4">4.3 Renouvellement automatique</h4>
              <p className="text-sm">
                Les abonnements sont renouvelés automatiquement chaque mois à la date anniversaire de
                souscription. Le Client peut désactiver le renouvellement automatique à tout moment depuis
                son espace Profil &gt; Gérer l'abonnement.
              </p>
            </div>
          </Card>

          {/* 5. Droit de rétractation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">5. DROIT DE RÉTRACTATION</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm">
                  Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de
                  <strong> 14 jours calendaires</strong> à compter de la souscription pour exercer votre droit
                  de rétractation, sans avoir à justifier de motifs.
                </p>
              </div>

              <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                <h4 className="font-semibold text-destructive mb-2">Exception importante :</h4>
                <p className="text-sm">
                  Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut
                  être exercé si vous avez utilisé vos crédits de génération (génération audio de chansons).
                  L'utilisation de ces crédits vaut renonciation expresse au droit de rétractation pour la prestation
                  de service pleinement exécutée.
                </p>
              </div>

              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Formulaire de rétractation :</h4>
                <p className="text-sm">
                  Pour exercer votre droit de rétractation, envoyez un email à <strong>contact@emotionscare.com</strong> avec
                  l'objet "Rétractation - [Votre nom] - [Numéro de commande]" contenant :
                </p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>- Votre nom et prénom</li>
                  <li>- L'email associé à votre compte</li>
                  <li>- La date de souscription</li>
                  <li>- La formule concernée</li>
                </ul>
                <p className="text-sm mt-2">
                  Le remboursement sera effectué sous <strong>14 jours</strong> par le même moyen de paiement.
                </p>
              </div>
            </div>
          </Card>

          {/* 6. Garanties légales */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">6. GARANTIES LÉGALES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-semibold text-foreground">
                Conformément aux articles L217-4 et suivants du Code de la consommation :
              </p>
              <div className="bg-primary/10 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Garantie légale de conformité (2 ans)</h4>
                  <p className="text-sm">
                    Le contenu numérique et les services numériques doivent être conformes au contrat.
                    En cas de défaut de conformité, vous avez droit à la mise en conformité ou, à défaut,
                    à une réduction du prix ou à la résolution du contrat.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Garantie des vices cachés</h4>
                  <p className="text-sm">
                    Vous pouvez invoquer la garantie des vices cachés (Articles 1641 et suivants du Code civil)
                    dans un délai de 2 ans à compter de la découverte du vice.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 7. Limitation de responsabilité */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">7. LIMITATION DE RESPONSABILITÉ</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="text-sm">
                La responsabilité d'EmotionsCare est limitée au montant de l'abonnement payé par le Client
                au cours des 12 derniers mois. EmotionsCare ne saurait être tenue responsable :
              </p>
              <ul className="text-sm space-y-1">
                <li>- Des erreurs factuelles dans les contenus générés par IA</li>
                <li>- Des échecs à un examen médical</li>
                <li>- Des interruptions de service dues à des cas de force majeure</li>
                <li>- Des dommages indirects ou consécutifs</li>
              </ul>
            </div>
          </Card>

          {/* 8. Résiliation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Ban className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">8. RÉSILIATION</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Par le Client :</h4>
                  <p className="text-sm">
                    Vous pouvez résilier votre abonnement à tout moment depuis votre espace Profil.
                    La résiliation prend effet à la fin de la période en cours. Aucun remboursement
                    au prorata n'est effectué.
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Par EmotionsCare :</h4>
                  <p className="text-sm">
                    En cas de violation des CGU/CGV, d'usage frauduleux ou d'impayé, EmotionsCare
                    peut suspendre ou résilier l'abonnement sans préavis ni remboursement.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 9. Loi applicable */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">9. LOI APPLICABLE ET LITIGES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Les présentes CGV sont régies par le <strong>droit français</strong>.</p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">En cas de litige :</h4>
                <ol className="text-sm space-y-2">
                  <li>
                    <strong>1. Médiation :</strong> Médiateur de la consommation : en cours de désignation ;
                    contactez-nous à contact@emotionscare.com en cas de litige.
                  </li>
                  <li>
                    <strong>2. Juridiction compétente :</strong> À défaut d'accord amiable, les tribunaux
                    du ressort de la <strong>Cour d'Appel d'Amiens</strong> sont compétents.
                  </li>
                </ol>
              </div>
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
                <span>Retour à l'accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumPageLayout>
    </>
  );
};

export default CGV;
