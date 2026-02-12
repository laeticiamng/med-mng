import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Music, Brain, GraduationCap, Target, Users, Sparkles, Shield, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';
import { SEOHead } from '@/components/seo/SEOHead';

const About = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_about' } });
  }, []);

  return (
    <>
    <SEOHead
      title="A propos - MED MNG par EmotionsCare"
      description="Découvrez MED MNG : la première plateforme d'apprentissage médical par la musique IA. Mission, méthode MNG, équipe et EmotionsCare SASU."
      keywords="à propos, MED MNG, EmotionsCare, méthode MNG, apprentissage médical, musique IA"
      canonical="/about"
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
            <h1 className="text-3xl font-bold text-foreground">A propos de MED MNG</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero */}
          <Card className="p-8 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Music className="h-10 w-10" />
                <h2 className="text-3xl font-bold">MED MNG</h2>
              </div>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Une chanson = Un item medical maitrise
              </p>
              <p className="text-sm opacity-80">
                La premiere plateforme d'apprentissage medical par la musique generee par intelligence artificielle
              </p>
            </div>
          </Card>

          {/* Notre mission */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Notre mission</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                MED MNG est ne d'un constat simple : les etudiants en medecine doivent memoriser une quantite
                colossale d'informations pour reussir l'EDN. Les methodes traditionnelles (lecture repetee,
                fiches) sont souvent fastidieuses et peu efficaces.
              </p>
              <p>
                Notre mission est de <strong>revolutionner l'apprentissage medical</strong> en exploitant le
                pouvoir de la musique et de l'intelligence artificielle. Chaque item de l'EDN devient une
                chanson dont chaque parole est une information medicale essentielle, ancree dans la memoire
                procedurale grace a la melodie.
              </p>
              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-foreground font-semibold">
                  "Une chanson = Un item medical maitrise"
                </p>
                <p className="text-sm mt-1">
                  C'est la philosophie fondamentale de MED MNG. Nous croyons que l'apprentissage
                  peut etre a la fois rigoureux et agreable.
                </p>
              </div>
            </div>
          </Card>

          {/* La methode MNG */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">La methode MNG</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>MNG - Music Neuro Learning Generator</strong> est une methode pedagogique innovante
                (brevet en cours de depot INPI) qui combine :
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <Music className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Musique IA</h4>
                  <p className="text-sm">Chansons generees par IA a partir de contenus medicaux valides</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <Brain className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Neurosciences</h4>
                  <p className="text-sm">Exploitation de la memoire procedurale et de la repetition espacee</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Pedagogie active</h4>
                  <p className="text-sm">Quiz, flashcards, simulations ECOS pour un apprentissage complet</p>
                </div>
              </div>
              <p className="text-sm italic">
                En savoir plus sur la{' '}
                <Link to={ROUTE_PATHS.mngMethod} className="text-primary hover:underline">Methode MNG</Link>.
              </p>
            </div>
          </Card>

          {/* Chiffres cles */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">MED MNG en chiffres</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">367</p>
                <p className="text-sm text-muted-foreground">Items EDN couverts</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-3xl font-bold text-accent">x3</p>
                <p className="text-sm text-muted-foreground">Retention amelioree</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">4.9/5</p>
                <p className="text-sm text-muted-foreground">Note des etudiants</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-3xl font-bold text-accent">A+</p>
                <p className="text-sm text-muted-foreground">Securite certifiee</p>
              </div>
            </div>
          </Card>

          {/* L'equipe */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">L'equipe</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground text-lg mb-1">Laeticia Motongane</h4>
                <p className="text-primary text-sm mb-3">Fondatrice et Presidente - EmotionsCare SASU</p>
                <p className="text-sm">
                  Creatrice de la methode MNG et auteure de la plateforme MED MNG. Passionnee par
                  l'intersection entre la technologie, la musique et l'education medicale, elle a concu
                  MED MNG pour rendre l'apprentissage medical plus accessible, plus efficace et plus
                  humain.
                </p>
              </div>
            </div>
          </Card>

          {/* EmotionsCare */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-destructive" />
              <h3 className="text-xl font-semibold text-foreground">EmotionsCare SASU</h3>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                MED MNG est developpe et edite par <strong>EmotionsCare SASU</strong>, societe francaise
                dediee a l'innovation dans le domaine de l'education et du bien-etre par les technologies
                creatives.
              </p>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Informations legales</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Raison sociale :</strong> EmotionsCare SASU</li>
                  <li><strong>Capital social :</strong> 100 euros</li>
                  <li><strong>Siege social :</strong> 5 rue Caudron, 80000 Amiens, France</li>
                  <li><strong>RCS Amiens :</strong> 944 505 445</li>
                  <li><strong>SIRET :</strong> 944 505 445 00011</li>
                  <li><strong>TVA intracommunautaire :</strong> FR89944505445</li>
                  <li><strong>Presidente :</strong> Laeticia Motongane</li>
                  <li><strong>Contact :</strong> contact@emotionscare.com</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Nos valeurs */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Nos valeurs</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Rigueur scientifique</h4>
                <p className="text-sm text-muted-foreground">
                  Chaque contenu est base sur les referentiels officiels. La precision medicale est
                  notre priorite absolue.
                </p>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Innovation pedagogique</h4>
                <p className="text-sm text-muted-foreground">
                  Nous exploitons les dernieres avancees en IA et neurosciences pour creer des outils
                  d'apprentissage uniques.
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Accessibilite</h4>
                <p className="text-sm text-muted-foreground">
                  Gratuit pour commencer, PWA installable, mode hors ligne : MED MNG est accessible
                  a tous les etudiants.
                </p>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Respect des donnees</h4>
                <p className="text-sm text-muted-foreground">
                  RGPD, securite A+, zero tracking publicitaire : vos donnees sont sacrees.
                </p>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-6 bg-primary/10 border-primary/20">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Pret a apprendre autrement ?</h3>
              <p className="text-sm text-muted-foreground">
                Rejoignez les etudiants qui utilisent deja MED MNG pour revolutionner leurs revisions.
              </p>
              <div className="flex justify-center gap-4">
                <Link to={ROUTE_PATHS.medMngSignup}>
                  <Button>Creer un compte gratuit</Button>
                </Link>
                <Link to={ROUTE_PATHS.ednComplete}>
                  <Button variant="outline">Decouvrir les 367 items</Button>
                </Link>
              </div>
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
    </>
  );
};

export default About;
