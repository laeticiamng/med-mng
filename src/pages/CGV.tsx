import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, CreditCard, RefreshCw, Scale, Ban, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';

const CGV = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_cgv' } });
  }, []);

  return (
    <PremiumPageLayout gradient="default" showOrbs={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={ROUTE_PATHS.home} className="flex items-center space-x-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-3xl font-bold text-foreground">Conditions Generales de Vente</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tete */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG - CGV</h2>
              </div>
              <p className="text-sm opacity-90">Derniere mise a jour : 11 fevrier 2026</p>
              <p className="text-sm opacity-90">Version 1.0 - Conforme au droit francais de la consommation</p>
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
                Les presentes Conditions Generales de Vente (CGV) regissent les relations contractuelles entre :
              </p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm"><strong>Le vendeur :</strong> EmotionsCare SASU</p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>Capital social : 100 euros</li>
                  <li>Siege social : 5 rue Caudron, 80000 Amiens, France</li>
                  <li>RCS Amiens : 944 505 445</li>
                  <li>SIRET : 944 505 445 00011</li>
                  <li>TVA intracommunautaire : FR89944505445</li>
                  <li>Email : contact@emotionscare.com</li>
                  <li>Presidente : Laeticia Motongane</li>
                </ul>
              </div>
              <p className="text-sm">
                Et tout utilisateur souhaitant souscrire a un abonnement payant sur la plateforme MED MNG
                (ci-apres "le Client").
              </p>
              <p className="text-sm font-semibold text-foreground">
                Toute souscription a un abonnement implique l'acceptation sans reserve des presentes CGV,
                des <Link to={ROUTE_PATHS.cgu} className="text-primary hover:underline">CGU</Link> et de
                la <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">Politique de Confidentialite</Link>.
              </p>
            </div>
          </Card>

          {/* 2. Services proposes */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">2. SERVICES PROPOSES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>MED MNG propose des abonnements donnant acces a :</p>
              <ul className="space-y-1 text-sm">
                <li>- Generation de chansons pedagogiques medicales par IA (OpenAI, Suno AI)</li>
                <li>- Tableaux recapitulatifs conformes aux programmes EDN (Rang A et B)</li>
                <li>- Quiz d'entrainement (QCM, QRU, QROC)</li>
                <li>- Bandes dessinees pedagogiques generees par IA</li>
                <li>- Simulations cliniques ECOS</li>
                <li>- Bibliotheque personnelle de contenus</li>
                <li>- Copilote medical intelligent (Chat IA)</li>
              </ul>
              <p className="text-sm italic">
                Les contenus sont generes par intelligence artificielle et ne constituent en aucun cas un avis medical.
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
                  <li><strong>Gratuit (Free)</strong> : 3 generations/mois - 0 euros/mois</li>
                  <li><strong>Standard (Basic)</strong> : 30 generations/mois - 19 euros/mois</li>
                  <li><strong>Pro (Premium)</strong> : 300 generations/mois + QCM - 29 euros/mois</li>
                  <li><strong>Premium (Enterprise)</strong> : 3 000 generations/mois + BD + support VIP - 39 euros/mois</li>
                </ul>
              </div>
              <p className="text-sm">
                Les prix sont indiques en euros TTC. EmotionsCare se reserve le droit de modifier ses tarifs
                a tout moment. Les modifications tarifaires prendront effet au prochain renouvellement de l'abonnement
                et seront notifiees <strong>30 jours</strong> a l'avance par email.
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
                <li>1. Creation d'un compte sur MED MNG</li>
                <li>2. Selection de la formule d'abonnement</li>
                <li>3. Acceptation des CGV et CGU</li>
                <li>4. Paiement securise via Stripe</li>
                <li>5. Confirmation par email</li>
              </ol>

              <h4 className="font-semibold text-foreground mt-4">4.2 Moyens de paiement</h4>
              <p className="text-sm">
                Les paiements sont securises par <strong>Stripe</strong>. EmotionsCare ne conserve aucune donnee
                bancaire. Les moyens acceptes sont : carte bancaire (Visa, Mastercard, American Express).
              </p>

              <h4 className="font-semibold text-foreground mt-4">4.3 Renouvellement automatique</h4>
              <p className="text-sm">
                Les abonnements sont renouveles automatiquement chaque mois a la date anniversaire de
                souscription. Le Client peut desactiver le renouvellement automatique a tout moment depuis
                son espace Profil &gt; Gerer l'abonnement.
              </p>
            </div>
          </Card>

          {/* 5. Droit de retractation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">5. DROIT DE RETRACTATION</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm">
                  Conformement a l'article L221-18 du Code de la consommation, vous disposez d'un delai de
                  <strong> 14 jours calendaires</strong> a compter de la souscription pour exercer votre droit
                  de retractation, sans avoir a justifier de motifs.
                </p>
              </div>

              <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                <h4 className="font-semibold text-destructive mb-2">Exception importante :</h4>
                <p className="text-sm">
                  Conformement a l'article L221-28 du Code de la consommation, le droit de retractation ne peut
                  etre exerce si vous avez utilise vos credits de generation (chansons, bandes dessinees, quiz).
                  L'utilisation de ces credits vaut renonciation expresse au droit de retractation pour la prestation
                  de service pleinement executee.
                </p>
              </div>

              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Formulaire de retractation :</h4>
                <p className="text-sm">
                  Pour exercer votre droit de retractation, envoyez un email a <strong>contact@emotionscare.com</strong> avec
                  l'objet "Retractation - [Votre nom] - [Numero de commande]" contenant :
                </p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>- Votre nom et prenom</li>
                  <li>- L'email associe a votre compte</li>
                  <li>- La date de souscription</li>
                  <li>- La formule concernee</li>
                </ul>
                <p className="text-sm mt-2">
                  Le remboursement sera effectue sous <strong>14 jours</strong> par le meme moyen de paiement.
                </p>
              </div>
            </div>
          </Card>

          {/* 6. Garanties legales */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">6. GARANTIES LEGALES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="font-semibold text-foreground">
                Conformement aux articles L217-4 et suivants du Code de la consommation :
              </p>
              <div className="bg-primary/10 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Garantie legale de conformite (2 ans)</h4>
                  <p className="text-sm">
                    Le contenu numerique et les services numeriques doivent etre conformes au contrat.
                    En cas de defaut de conformite, vous avez droit a la mise en conformite ou, a defaut,
                    a une reduction du prix ou a la resolution du contrat.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Garantie des vices caches</h4>
                  <p className="text-sm">
                    Vous pouvez invoquer la garantie des vices caches (Articles 1641 et suivants du Code civil)
                    dans un delai de 2 ans a compter de la decouverte du vice.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 7. Limitation de responsabilite */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">7. LIMITATION DE RESPONSABILITE</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p className="text-sm">
                La responsabilite d'EmotionsCare est limitee au montant de l'abonnement paye par le Client
                au cours des 12 derniers mois. EmotionsCare ne saurait etre tenue responsable :
              </p>
              <ul className="text-sm space-y-1">
                <li>- Des erreurs factuelles dans les contenus generes par IA</li>
                <li>- Des echecs a un examen medical</li>
                <li>- Des interruptions de service dues a des cas de force majeure</li>
                <li>- Des dommages indirects ou consequents</li>
              </ul>
            </div>
          </Card>

          {/* 8. Resiliation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Ban className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">8. RESILIATION</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Par le Client :</h4>
                  <p className="text-sm">
                    Vous pouvez resilier votre abonnement a tout moment depuis votre espace Profil.
                    La resiliation prend effet a la fin de la periode en cours. Aucun remboursement
                    au prorata n'est effectue.
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Par EmotionsCare :</h4>
                  <p className="text-sm">
                    En cas de violation des CGU/CGV, d'usage frauduleux ou d'impaye, EmotionsCare
                    peut suspendre ou resilier l'abonnement sans preavis ni remboursement.
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
              <p>Les presentes CGV sont regies par le <strong>droit francais</strong>.</p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">En cas de litige :</h4>
                <ol className="text-sm space-y-2">
                  <li>
                    <strong>1. Mediation :</strong> Conformement aux articles L611-1 et suivants du Code de la
                    consommation, vous pouvez recourir gratuitement a un mediateur de la consommation.
                    <br />
                    <span className="ml-4">Plateforme europeenne : https://ec.europa.eu/consumers/odr</span>
                  </li>
                  <li>
                    <strong>2. Juridiction competente :</strong> A defaut d'accord amiable, les tribunaux
                    du ressort de la <strong>Cour d'Appel d'Amiens</strong> sont competents.
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
  );
};

export default CGV;
