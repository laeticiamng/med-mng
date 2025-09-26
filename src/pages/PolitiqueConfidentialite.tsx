import React from 'react';
import { Shield, Eye, Lock, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';

export const PolitiqueConfidentialite = () => {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité - MED-MNG</title>
        <meta name="description" content="Politique de confidentialité et protection des données personnelles" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
            <p className="text-muted-foreground">Protection de vos données personnelles</p>
          </div>
        </div>

        <Alert className="mb-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Cette politique est conforme au RGPD et à la loi Informatique et Libertés.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Données collectées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Données d'identification</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Institution d'études</li>
                  <li>Année d'études</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Données d'utilisation</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Historique de navigation</li>
                  <li>Résultats aux évaluations</li>
                  <li>Temps passé sur chaque contenu</li>
                  <li>Statistiques de progression</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Utilisation des données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>Vos données sont utilisées pour :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Fournir les services éducatifs</li>
                  <li>Personnaliser votre expérience</li>
                  <li>Suivre votre progression</li>
                  <li>Améliorer nos contenus</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Vos droits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Droit d'accès</h3>
                  <p className="text-sm text-muted-foreground">
                    Consultez toutes vos données personnelles
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Droit de rectification</h3>
                  <p className="text-sm text-muted-foreground">
                    Corrigez vos informations personnelles
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Droit à l'effacement</h3>
                  <p className="text-sm text-muted-foreground">
                    Supprimez vos données personnelles
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Droit à la portabilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Récupérez vos données dans un format lisible
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pour exercer vos droits : <strong>dpo@med-mng.fr</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PolitiqueConfidentialite;