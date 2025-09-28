import { Helmet } from "react-helmet-async";
import { FileText, Users, Shield, AlertTriangle, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Pure JS functional component
function Conditions() {
  return (
    <>
      <Helmet>
        <title>Conditions Générales d'Utilisation - MED-MNG</title>
        <meta name="description" content="Conditions générales d'utilisation de la plateforme éducative médicale MED-MNG" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
              <p className="text-muted-foreground">Modalités d'utilisation de la plateforme MED-MNG</p>
            </div>
          </div>

          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important :</strong> En utilisant MED-MNG, vous acceptez ces conditions dans leur intégralité. 
              Veuillez les lire attentivement avant d'utiliser nos services.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Article 1 - Objet et portée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation 
                  de la plateforme éducative médicale MED-MNG, accessible à l'adresse med-mng.com.
                </p>
                <p className="text-muted-foreground">
                  MED-MNG est une plateforme dédiée à l'apprentissage médical proposant des contenus éducatifs, 
                  des outils de révision, et des fonctionnalités de génération musicale thérapeutique.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Article 2 - Accès au service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Conditions d'accès</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Être étudiant en médecine ou professionnel de santé</li>
                      <li>Disposer d'une connexion Internet stable</li>
                      <li>Utiliser un navigateur moderne et compatible</li>
                      <li>Respecter les conditions d'âge légal</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Types d'accès</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Accès gratuit avec fonctionnalités limitées</li>
                      <li>Abonnements premium avec contenus avancés</li>
                      <li>Accès institutionnel pour établissements</li>
                      <li>API pour intégrations tierces (sur demande)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article 3 - Inscription et compte utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  L'inscription sur MED-MNG nécessite de fournir des informations exactes et complètes. 
                  L'utilisateur s'engage à :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Fournir des informations véridiques et à jour</li>
                  <li>Maintenir la confidentialité de ses identifiants de connexion</li>
                  <li>Signaler immédiatement toute utilisation non autorisée de son compte</li>
                  <li>Ne pas créer de comptes multiples ou fictifs</li>
                  <li>Respecter les règles de la communauté médicale</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Article 4 - Utilisation du service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">Utilisations autorisées</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Consultation des contenus éducatifs à des fins d'apprentissage</li>
                      <li>Génération de musique thérapeutique pour usage personnel</li>
                      <li>Participation aux discussions communautaires</li>
                      <li>Sauvegarde de progressions et favoris</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-red-700">Utilisations interdites</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Reproduction ou diffusion non autorisée des contenus</li>
                      <li>Utilisation commerciale sans autorisation expresse</li>
                      <li>Tentative d'accès non autorisé aux systèmes</li>
                      <li>Diffusion de contenus inappropriés ou illégaux</li>
                      <li>Automatisation excessive (scraping, bots)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article 5 - Propriété intellectuelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Contenus MED-MNG</h4>
                    <p className="text-sm text-muted-foreground">
                      Tous les contenus originaux (interface, algorithmes, musiques générées) 
                      sont protégés par les droits de propriété intellectuelle et appartiennent à MED-MNG.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Contenus EDN</h4>
                    <p className="text-sm text-muted-foreground">
                      Les contenus éducatifs EDN sont utilisés conformément aux accords avec 
                      les universités partenaires et le Collège National des Universitaires.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article 6 - Responsabilité et garanties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Usage médical :</strong> MED-MNG est un outil éducatif et ne remplace pas 
                    l'avis d'un professionnel de santé. Les contenus ne constituent pas de conseils médicaux.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Limitations de responsabilité</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Interruptions de service pour maintenance ou incidents techniques</li>
                      <li>Erreurs ou imprécisions dans les contenus éducatifs</li>
                      <li>Dommages indirects liés à l'utilisation de la plateforme</li>
                      <li>Pertes de données dues à des facteurs externes</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Engagements de MED-MNG</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Maintenir la disponibilité du service dans la mesure du possible</li>
                      <li>Assurer la sécurité et confidentialité des données</li>
                      <li>Fournir des contenus de qualité et régulièrement mis à jour</li>
                      <li>Offrir un support technique réactif</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Article 7 - Durée et résiliation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Résiliation par l'utilisateur</h4>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez résilier votre compte à tout moment depuis vos paramètres. 
                      Les abonnements en cours restent actifs jusqu'à leur échéance.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Résiliation par MED-MNG</h4>
                    <p className="text-sm text-muted-foreground">
                      Nous nous réservons le droit de suspendre ou résilier l'accès en cas 
                      de non-respect des présentes conditions, avec préavis sauf urgence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Article 8 - Droit applicable et juridiction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Les présentes CGU sont soumises au droit français. En cas de litige, 
                  les parties s'efforceront de trouver une solution amiable.
                </p>
                <p className="text-muted-foreground">
                  À défaut d'accord amiable, les tribunaux de Paris seront seuls compétents 
                  pour connaître de tout litige relatif à l'interprétation ou à l'exécution 
                  des présentes conditions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Version actuelle : 2.1</p>
                    <p className="text-sm text-muted-foreground">Dernière mise à jour : 28 septembre 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Ces conditions peuvent être modifiées.<br />
                      Les utilisateurs seront prévenus par email.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default Conditions;