import { Scale, Building, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';

// Simple JS functional component with minimal TypeScript
function MentionsLegales() {
  return (
    <>
      <Helmet>
        <title>Mentions Légales - MED-MNG</title>
        <meta name="description" content="Mentions légales de la plateforme MED-MNG" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Scale className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mentions Légales</h1>
            <p className="text-muted-foreground">Informations légales de la plateforme</p>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Éditeur du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">MED-MNG SAS</h3>
                <div className="space-y-1 text-muted-foreground">
                  <p>Société par Actions Simplifiée au capital de 50 000 €</p>
                  <p>Siège social : 123 Avenue de la Médecine, 75013 Paris, France</p>
                  <p>RCS Paris : 123 456 789</p>
                  <p>SIRET : 123 456 789 00012</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>contact@med-mng.fr</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+33 1 23 45 67 89</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground space-y-3">
                <p>
                  L'ensemble des contenus présents sur le site MED-MNG sont protégés par les dispositions 
                  du Code de la propriété intellectuelle.
                </p>
                <p>
                  Les contenus EDN sont utilisés conformément aux autorisations accordées par 
                  les universités partenaires.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MentionsLegales;