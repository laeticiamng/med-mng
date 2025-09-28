import { Helmet } from "react-helmet-async";
import { Shield, Lock, Eye, FileText, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Pure JS functional component
function PolitiqueConfidentialite() {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité - MED-MNG</title>
        <meta name="description" content="Politique de confidentialité et protection des données personnelles MED-MNG" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Politique de Confidentialité</h1>
              <p className="text-muted-foreground">Protection de vos données personnelles</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Collecte des données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Nous collectons les données personnelles suivantes dans le cadre de votre utilisation de MED-MNG :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Nom, prénom et adresse email lors de l'inscription</li>
                  <li>Données d'utilisation et de navigation sur la plateforme</li>
                  <li>Préférences et paramètres de personnalisation</li>
                  <li>Données de performance et d'apprentissage médical</li>
                  <li>Informations de connexion et logs techniques</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Utilisation des données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Vos données personnelles sont utilisées exclusivement pour :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Fournir et améliorer nos services éducatifs médicaux</li>
                  <li>Personnaliser votre expérience d'apprentissage</li>
                  <li>Communiquer avec vous concernant votre compte et les services</li>
                  <li>Analyser l'utilisation de la plateforme pour l'optimiser</li>
                  <li>Assurer la sécurité et la conformité de nos services</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Partage des données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Nous ne vendons, ne louons et ne partageons pas vos données personnelles 
                  avec des tiers, sauf dans les cas strictement nécessaires suivants :
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Avec votre consentement explicite et préalable</li>
                  <li>Pour respecter nos obligations légales et réglementaires</li>
                  <li>Avec nos prestataires de services (hébergement, analytics) sous contrat de confidentialité</li>
                  <li>En cas de fusion, acquisition ou restructuration de l'entreprise</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vos droits RGPD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Conformément au Règlement Général sur la Protection des Données (RGPD), 
                  vous disposez des droits suivants :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Droits d'accès et de contrôle</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Droit d'accès à vos données personnelles</li>
                      <li>Droit de rectification et de mise à jour</li>
                      <li>Droit à l'effacement de vos données</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Droits de portabilité</h4>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                      <li>Droit à la portabilité de vos données</li>
                      <li>Droit d'opposition au traitement</li>
                      <li>Droit à la limitation du traitement</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sécurité et conservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Mesures de sécurité</h4>
                    <p className="text-sm text-muted-foreground">
                      Nous mettons en œuvre des mesures techniques et organisationnelles 
                      robustes : chiffrement des données, authentification multi-facteurs, 
                      audits de sécurité réguliers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Durée de conservation</h4>
                    <p className="text-sm text-muted-foreground">
                      Les données sont conservées pendant la durée nécessaire aux finalités 
                      pour lesquelles elles ont été collectées, conformément à nos obligations légales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact et réclamations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Délégué à la Protection des Données</h4>
                    <p className="text-sm text-muted-foreground">
                      <strong>Email :</strong> dpo@med-mng.com<br />
                      <strong>Courrier :</strong> DPO MED-MNG<br />
                      123 Avenue de la Médecine, 75013 Paris
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Autorité de contrôle</h4>
                    <p className="text-sm text-muted-foreground">
                      En cas de réclamation, vous pouvez vous adresser à la CNIL :<br />
                      <strong>Web :</strong> www.cnil.fr<br />
                      <strong>Téléphone :</strong> 01 53 73 22 22
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Dernière mise à jour :</strong> 28 septembre 2024<br />
                  Cette politique peut être modifiée. Les utilisateurs seront informés 
                  de tout changement significatif par email et notification sur la plateforme.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export default PolitiqueConfidentialite;