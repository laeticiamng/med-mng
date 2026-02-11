import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, GraduationCap, Users, BarChart3, Shield, Headphones, CheckCircle, Mail, BookOpen, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';

const B2B = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_b2b' } });
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
            <h1 className="text-3xl font-bold text-foreground">MED MNG pour les institutions</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero */}
          <Card className="p-8 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Building2 className="h-10 w-10" />
                <h2 className="text-3xl font-bold">Offre B2B</h2>
              </div>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Integrez la puissance de l'apprentissage musical par IA dans votre institution
              </p>
              <p className="text-sm opacity-80">
                Universites - Facultes de medecine - CHU - Organismes de formation
              </p>
            </div>
          </Card>

          {/* Pourquoi MED MNG */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Pourquoi integrer MED MNG ?</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                L'EDN exige des etudiants une maitrise de 367 items medicaux. Les taux d'echec et le stress
                etudiant sont en hausse constante. MED MNG offre une approche complementaire et innovante
                pour accompagner vos etudiants vers la reussite.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-3xl font-bold text-primary">x3</p>
                  <p className="text-sm mt-1">Retention amelioree par rapport a la lecture seule</p>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-3xl font-bold text-accent">4.9/5</p>
                  <p className="text-sm mt-1">Satisfaction des etudiants utilisateurs</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-3xl font-bold text-primary">367</p>
                  <p className="text-sm mt-1">Items EDN integralement couverts</p>
                </div>
              </div>
            </div>
          </Card>

          {/* A qui s'adresse l'offre */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">A qui s'adresse l'offre B2B ?</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Facultes de medecine</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Offrez a vos etudiants un outil complementaire innovant pour la preparation a l'EDN.
                  Licences en volume pour l'ensemble de votre promotion.
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <Stethoscope className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-foreground">CHU et Hopitaux</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Formation continue des internes et des equipes soignantes. Acces aux 367 items
                  et simulations ECOS pour maintenir les competences.
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Universites</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integration dans les plateformes LMS existantes. Suivi pedagogique des etudiants
                  et statistiques d'utilisation.
                </p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-foreground">Organismes de formation</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enrichissez votre catalogue de formations avec un outil pedagogique unique base
                  sur les neurosciences et l'IA.
                </p>
              </div>
            </div>
          </Card>

          {/* Fonctionnalites B2B */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Fonctionnalites de l'offre institutionnelle</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>Acces complet aux 367 items EDN</strong> pour tous les etudiants</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>Generations illimitees</strong> de chansons et contenus</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>Dashboard administrateur</strong> avec suivi des etudiants</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>Statistiques d'utilisation</strong> et rapports pedagogiques</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>Simulations ECOS</strong> en nombre illimite</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>Support VIP</strong> dedie et accompagnement technique</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>SSO / LDAP</strong> integration avec votre systeme d'authentification</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm"><strong>API d'integration</strong> pour connexion a votre LMS</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Avantages */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Les avantages pour votre institution</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Amelioration des resultats</h4>
                <p className="text-sm">
                  Les etudiants utilisant MED MNG rapportent une retention x3 et une meilleure confiance
                  en soi lors des examens. La methode MNG est fondee sur les neurosciences cognitives.
                </p>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Reduction du stress etudiant</h4>
                <p className="text-sm">
                  L'apprentissage par la musique reduit le stress lie aux revisions intensives.
                  Les etudiants retrouvent du plaisir dans l'apprentissage, ce qui favorise
                  la perseverance et la reussite.
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Innovation pedagogique reconnue</h4>
                <p className="text-sm">
                  Integrer MED MNG dans votre offre pedagogique montre votre engagement pour l'innovation
                  et les nouvelles methodes d'enseignement. La methode MNG est en cours de depot de brevet (INPI).
                </p>
              </div>
            </div>
          </Card>

          {/* Securite */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Securite et conformite</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm"><strong>RGPD compliant</strong> : donnees hebergees en Europe (AWS EU)</p>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm"><strong>Securite A+</strong> : chiffrement AES-256, HTTPS, RLS</p>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm"><strong>Zero tracking pub</strong> : aucun cookie publicitaire</p>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm"><strong>DPA disponible</strong> : accord de traitement des donnees sur demande</p>
              </div>
            </div>
          </Card>

          {/* Temoignages */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Headphones className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Ce que disent les etudiants</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground italic mb-2">
                  "MED MNG a change ma facon de reviser. J'ecoute les chansons pendant mes trajets et je retiens
                  beaucoup mieux qu'avec mes fiches."
                </p>
                <p className="text-xs text-primary font-semibold">- Etudiant DFASM2, Paris</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground italic mb-2">
                  "Les quiz apres l'ecoute sont parfaits pour verifier que j'ai bien assimile. La methode est
                  vraiment efficace."
                </p>
                <p className="text-xs text-primary font-semibold">- Etudiante DFASM1, Lyon</p>
              </div>
            </div>
          </Card>

          {/* Tarification B2B */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Tarification institutionnelle</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Nos tarifs B2B sont adaptes a la taille de votre institution et au nombre d'etudiants.
                Nous proposons des licences annuelles avec des remises significatives par rapport aux
                abonnements individuels.
              </p>
              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-foreground mb-2">Exemples de tarification :</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Petite promotion</strong> (jusqu'a 100 etudiants) : tarif sur devis</li>
                  <li><strong>Moyenne promotion</strong> (100-500 etudiants) : tarif degressif</li>
                  <li><strong>Grande promotion</strong> (500+ etudiants) : tarif personnalise</li>
                  <li><strong>Multi-sites</strong> (plusieurs campus) : offre globale sur mesure</li>
                </ul>
              </div>
              <p className="text-sm italic">
                Tous les tarifs incluent le support technique, les mises a jour et l'accompagnement pedagogique.
              </p>
            </div>
          </Card>

          {/* CTA Contact */}
          <Card className="p-8 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <Mail className="h-10 w-10 mx-auto" />
              <h3 className="text-2xl font-bold">Contactez-nous pour une demonstration</h3>
              <p className="text-sm opacity-90 max-w-xl mx-auto">
                Notre equipe est disponible pour vous presenter MED MNG, organiser une demonstration
                et elaborer une offre adaptee a votre institution.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <a href="mailto:contact@emotionscare.com?subject=Demande%20offre%20B2B%20MED%20MNG">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    <Mail className="h-4 w-4 mr-2" />
                    contact@emotionscare.com
                  </Button>
                </a>
              </div>
              <p className="text-xs opacity-70">
                EmotionsCare SASU - 5 rue Caudron, 80000 Amiens - SIRET : 944 505 445 00011
              </p>
            </div>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to={ROUTE_PATHS.home}>
              <Button variant="outline" className="flex items-center space-x-2">
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

export default B2B;
