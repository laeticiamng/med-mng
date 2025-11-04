import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, AlertTriangle, Shield, Scale, Users, Zap, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CGU = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-3xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG - CGU</h2>
              </div>
              <p className="text-sm opacity-90">Dernière mise à jour : 04 novembre 2025</p>
              <p className="text-sm opacity-90">Version 1.0 - Conforme RGPD et droit français</p>
            </div>
          </Card>

          {/* DISCLAIMER MÉDICAL CRITIQUE */}
          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-destructive font-semibold">
              <p className="text-lg mb-2">⚠️ AVERTISSEMENT MÉDICAL IMPORTANT</p>
              <p className="text-sm">
                MED MNG est un <strong>outil pédagogique d'aide à l'apprentissage</strong> destiné aux étudiants en médecine. 
                Les contenus générés par intelligence artificielle (chansons, tableaux, quiz, bandes dessinées) ne constituent 
                <strong> EN AUCUN CAS un avis médical officiel, un diagnostic ou une prescription thérapeutique</strong>.
              </p>
              <p className="text-sm mt-2">
                Pour toute décision médicale, consultez les référentiels officiels (Collège National des Enseignants, 
                recommandations HAS) et supervisez votre apprentissage avec des professionnels de santé qualifiés.
              </p>
              <p className="text-sm mt-2 font-bold">
                EmotionsCare décline toute responsabilité en cas d'utilisation inappropriée du contenu à des fins cliniques.
              </p>
            </AlertDescription>
          </Alert>

          {/* 1. Acceptation des CGU */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">1. ACCEPTATION DES CONDITIONS</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                En créant un compte sur MED MNG ou en utilisant nos services, vous acceptez sans réserve les présentes 
                Conditions Générales d'Utilisation (CGU). Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.
              </p>
              <p className="font-semibold text-foreground">
                L'utilisation de MED MNG implique l'acceptation pleine et entière des CGU en vigueur au moment de votre utilisation.
              </p>
            </div>
          </Card>

          {/* 2. Objet du service */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">2. OBJET DU SERVICE</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                MED MNG est une plateforme numérique d'apprentissage médical utilisant la méthode 
                <strong> MNG – Music Neuro Learning Generator</strong> (brevet en cours de dépôt INPI).
              </p>
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Services proposés :</p>
                <ul className="space-y-1 text-sm">
                  <li>• Génération de chansons pédagogiques via IA (OpenAI, Suno AI)</li>
                  <li>• Tableaux récapitulatifs conformes aux programmes EDN</li>
                  <li>• Quiz d'entraînement (QCM, QRU, QROC)</li>
                  <li>• Bandes dessinées pédagogiques générées par IA</li>
                  <li>• Simulations cliniques ECOS</li>
                  <li>• Bibliothèque personnelle de contenus</li>
                </ul>
              </div>
              <p className="text-sm italic">
                Les contenus sont générés par intelligence artificielle et peuvent contenir des erreurs. 
                Ils doivent être utilisés comme complément aux cours officiels, jamais comme source unique.
              </p>
            </div>
          </Card>

          {/* 3. Accès au service */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">3. CONDITIONS D'ACCÈS</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">✅ Utilisateurs autorisés :</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Étudiants en médecine (PASS, LAS, DFGSM, DFASM)</li>
                    <li>• Professionnels de santé en formation continue</li>
                    <li>• Institutions académiques (sur accord préalable)</li>
                  </ul>
                </div>
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">⚠️ Restrictions :</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Âge minimum : 16 ans (ou autorisation parentale)</li>
                    <li>• Compte unique par personne</li>
                    <li>• Interdiction de revente ou partage de contenu</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm">
                Vous vous engagez à fournir des informations exactes lors de l'inscription et à maintenir 
                vos identifiants confidentiels. Toute activité suspecte peut entraîner la suspension immédiate de votre compte.
              </p>
            </div>
          </Card>

          {/* 4. Abonnements et paiements */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">4. ABONNEMENTS ET PAIEMENTS</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Plans disponibles :</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Free</strong> : 3 générations/mois (gratuit)</li>
                  <li>• <strong>Basic</strong> : 10 générations/mois (prix sur la page Tarifs)</li>
                  <li>• <strong>Premium</strong> : 30 générations/mois + fonctionnalités avancées</li>
                  <li>• <strong>Enterprise</strong> : 100 générations/mois + support prioritaire</li>
                </ul>
              </div>

              <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                <h4 className="font-semibold text-destructive mb-2">💳 Politique de remboursement :</h4>
                <p className="text-sm text-muted-foreground">
                  Conformément au droit de rétractation européen (Article L221-18 du Code de la consommation), 
                  vous disposez de <strong>14 jours calendaires</strong> à compter de la souscription pour demander 
                  un remboursement intégral, SAUF si vous avez utilisé des crédits de génération.
                </p>
                <p className="text-sm mt-2 text-muted-foreground">
                  <strong>Attention :</strong> En utilisant vos crédits de génération, vous renoncez expressément 
                  à votre droit de rétractation (Article L221-28 du Code de la consommation - prestation de service 
                  pleinement exécutée).
                </p>
                <p className="text-sm mt-2 text-muted-foreground">
                  Pour toute demande de remboursement : <strong>medmng@emotionscare.com</strong> avec objet "Remboursement - [Numéro de commande]"
                </p>
              </div>

              <p className="text-sm">
                Les paiements sont sécurisés via <strong>Stripe</strong>. Nous ne conservons aucune donnée bancaire. 
                Les abonnements sont <strong>renouvelés automatiquement</strong> chaque mois. Vous pouvez annuler à tout moment 
                depuis votre Profil &gt; Gérer l'abonnement.
              </p>
            </div>
          </Card>

          {/* 5. Propriété intellectuelle */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">5. PROPRIÉTÉ INTELLECTUELLE ET LICENCE D'UTILISATION</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
                <h4 className="font-semibold text-foreground mb-2">🏛️ Propriété de la plateforme :</h4>
                <p className="text-sm">
                  Le nom "MED MNG", la méthode "Music Neuro Learning Generator", le logo, le code source et 
                  l'interface sont la propriété exclusive d'<strong>EmotionsCare SASU</strong> et de 
                  <strong> Laëticia Motongane</strong> (créatrice et auteure).
                </p>
                <p className="text-sm mt-2 font-semibold text-destructive">
                  ⚠️ Toute reproduction, adaptation ou exploitation commerciale sans autorisation est interdite 
                  et constitue une contrefaçon passible de 3 ans d'emprisonnement et 300 000€ d'amende (CPI Art. L335-2).
                </p>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">🎵 Licence sur les contenus générés :</h4>
                <p className="text-sm">
                  Les chansons, tableaux et bandes dessinées générées par l'IA pour votre compte vous sont concédés 
                  sous <strong>licence personnelle non-exclusive et non-cessible</strong> dans le cadre suivant :
                </p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>✅ <strong>Autorisé</strong> : Usage personnel pour vos révisions et apprentissage</li>
                  <li>✅ <strong>Autorisé</strong> : Partage avec votre groupe de révision (usage privé)</li>
                  <li>❌ <strong>INTERDIT</strong> : Revente, publication publique, usage commercial</li>
                  <li>❌ <strong>INTERDIT</strong> : Modification ou réutilisation pour créer du contenu concurrent</li>
                  <li>❌ <strong>INTERDIT</strong> : Extraction de masse ou scraping de la base de données</li>
                </ul>
                <p className="text-sm mt-2 italic">
                  EmotionsCare conserve les droits de propriété intellectuelle sur la méthode de génération et le format MNG.
                </p>
              </div>
            </div>
          </Card>

          {/* 6. Obligations de l'utilisateur */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Ban className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">6. OBLIGATIONS ET COMPORTEMENTS INTERDITS</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>En utilisant MED MNG, vous vous engagez à respecter les règles suivantes :</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">✅ Vous devez :</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Utiliser vos propres identifiants</li>
                    <li>• Signaler tout bug ou faille de sécurité</li>
                    <li>• Respecter les quotas de votre abonnement</li>
                    <li>• Vérifier les informations médicales avec sources officielles</li>
                  </ul>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">❌ Vous ne devez PAS :</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Partager votre mot de passe</li>
                    <li>• Contourner les limitations techniques</li>
                    <li>• Utiliser des bots ou scripts automatisés</li>
                    <li>• Revendre le contenu généré</li>
                    <li>• Tenter d'extraire les modèles IA</li>
                    <li>• Générer du contenu offensant ou illégal</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm italic">
                Toute violation de ces règles entraînera la suspension immédiate du compte sans remboursement.
              </p>
            </div>
          </Card>

          {/* 7. Responsabilité et garanties */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">7. LIMITATION DE RESPONSABILITÉ</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                <h4 className="font-semibold text-destructive mb-2">⚠️ Limitations importantes :</h4>
                <ul className="text-sm space-y-2">
                  <li>
                    • <strong>Contenu IA :</strong> Les contenus générés par intelligence artificielle (OpenAI GPT, Suno AI) 
                    peuvent contenir des erreurs factuelles, des imprécisions ou des informations obsolètes. EmotionsCare 
                    ne garantit pas l'exactitude médicale à 100%.
                  </li>
                  <li>
                    • <strong>Usage pédagogique uniquement :</strong> MED MNG est un outil d'apprentissage, pas un dispositif 
                    médical certifié CE. Nous déclinons toute responsabilité en cas d'échec à un examen ou de décision 
                    clinique basée sur notre contenu.
                  </li>
                  <li>
                    • <strong>Disponibilité du service :</strong> Nous nous efforçons d'assurer une disponibilité de 99,9% 
                    mais ne pouvons garantir un accès ininterrompu (maintenance, pannes, attaques DDoS).
                  </li>
                  <li>
                    • <strong>Perte de données :</strong> Nous effectuons des sauvegardes régulières mais ne pouvons être 
                    tenus responsables d'une perte de données due à un cas de force majeure.
                  </li>
                </ul>
              </div>
              <p className="text-sm font-semibold text-foreground">
                La responsabilité d'EmotionsCare est limitée au montant payé par l'utilisateur au cours des 12 derniers mois.
              </p>
            </div>
          </Card>

          {/* 8. Données personnelles */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">8. PROTECTION DES DONNÉES PERSONNELLES</h3>
            </div>
            <div className="text-muted-foreground">
              <p className="mb-3">
                Le traitement de vos données personnelles est régi par notre{' '}
                <Link to="/politique-confidentialite" className="text-primary font-semibold hover:underline">
                  Politique de Confidentialité
                </Link>{' '}
                conforme au RGPD (UE 2016/679).
              </p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Données sensibles :</strong> Vos progressions pédagogiques (historique de génération, 
                  résultats de quiz) peuvent être considérées comme "données relatives à la santé" au sens de 
                  l'Article 9 du RGPD. Elles bénéficient de mesures de protection renforcées :
                </p>
                <ul className="text-sm space-y-1 mt-2">
                  <li>• Chiffrement AES-256 en transit et au repos</li>
                  <li>• Accès restreint aux seules personnes habilitées</li>
                  <li>• Anonymisation après 5 ans d'inactivité</li>
                  <li>• Aucun partage avec des tiers (sauf obligation légale)</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 9. Résiliation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Ban className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">9. RÉSILIATION DU COMPTE</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Par l'utilisateur :</h4>
                  <p className="text-sm">
                    Vous pouvez supprimer votre compte à tout moment depuis Profil &gt; Paramètres &gt; Supprimer le compte. 
                    Vos données seront supprimées sous 30 jours (délai légal de rétractation).
                  </p>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">Par EmotionsCare :</h4>
                  <p className="text-sm">
                    Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de violation des CGU, 
                    d'activité frauduleuse ou d'usage abusif des ressources IA.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 10. Modification des CGU */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">10. MODIFICATION DES CGU</h3>
            </div>
            <div className="text-muted-foreground">
              <p>
                EmotionsCare se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront 
                notifiés par email <strong>30 jours avant</strong> l'entrée en vigueur des modifications importantes.
              </p>
              <p className="mt-2 text-sm italic">
                L'utilisation continue de MED MNG après modification vaut acceptation des nouvelles CGU.
              </p>
            </div>
          </Card>

          {/* 11. Loi applicable et juridiction */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">11. LOI APPLICABLE ET RÈGLEMENT DES LITIGES</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>Les présentes CGU sont régies par le <strong>droit français</strong>.</p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">En cas de litige :</h4>
                <ol className="text-sm space-y-2">
                  <li>
                    <strong>1. Médiation amiable :</strong> Vous pouvez contacter notre médiateur de la consommation :
                    <br />
                    <span className="ml-4">📧 Email : mediation@emotionscare.com</span>
                    <br />
                    <span className="ml-4">🔗 Plateforme européenne : https://ec.europa.eu/consumers/odr</span>
                  </li>
                  <li>
                    <strong>2. Juridiction compétente :</strong> En l'absence d'accord amiable, les tribunaux 
                    compétents sont ceux du ressort de la <strong>Cour d'Appel d'Amiens</strong>.
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* 12. Contact */}
          <Card className="p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-3">📧 NOUS CONTACTER</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>EmotionsCare SASU</strong></p>
              <p>5 rue Caudron, 80000 Amiens, France</p>
              <p>Email : medmng@emotionscare.com</p>
              <p>Support technique : support@emotionscare.com</p>
              <p>SIRET : 981 065 820 00013</p>
            </div>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to="/">
              <Button className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGU;
