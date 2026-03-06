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
      title="À propos - MED MNG par EmotionsCare"
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
            <h1 className="text-3xl font-bold text-foreground">À propos de MED MNG</h1>
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
                Une chanson = Un item médical maîtrisé
              </p>
              <p className="text-sm opacity-80">
                La première plateforme d'apprentissage médical par la musique générée par intelligence artificielle
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
                MED MNG est né d'un constat simple : les étudiants en médecine doivent mémoriser une quantité
                colossale d'informations pour réussir l'EDN. Les méthodes traditionnelles (lecture répétée,
                fiches) sont souvent fastidieuses et peu efficaces.
              </p>
              <p>
                Notre mission est de <strong>révolutionner l'apprentissage médical</strong> en exploitant le
                pouvoir de la musique et de l'intelligence artificielle. Chaque item de l'EDN devient une
                chanson dont chaque parole est une information médicale essentielle, ancrée dans la mémoire
                procédurale grâce à la mélodie.
              </p>
              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-foreground font-semibold">
                  « Une chanson = Un item médical maîtrisé »
                </p>
                <p className="text-sm mt-1">
                  C'est la philosophie fondamentale de MED MNG. Nous croyons que l'apprentissage
                  peut être à la fois rigoureux et agréable.
                </p>
              </div>
            </div>
          </Card>

          {/* La méthode MNG */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">La méthode MNG</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>MNG — Music Neuro Learning Generator</strong> est une méthode pédagogique innovante
                (brevet en cours de dépôt INPI) qui combine :
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <Music className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Musique IA</h4>
                  <p className="text-sm">Chansons générées par IA à partir de contenus médicaux validés</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <Brain className="h-8 w-8 text-accent mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Neurosciences</h4>
                  <p className="text-sm">Exploitation de la mémoire procédurale et de la répétition espacée</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground mb-1">Pédagogie active</h4>
                  <p className="text-sm">Quiz, flashcards, simulations ECOS pour un apprentissage complet</p>
                </div>
              </div>
              <p className="text-sm italic">
                En savoir plus sur la{' '}
                <Link to={ROUTE_PATHS.mngMethod} className="text-primary hover:underline">Méthode MNG</Link>.
              </p>
            </div>
          </Card>

          {/* Chiffres clés */}
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
                <p className="text-3xl font-bold text-accent">×3</p>
                <p className="text-sm text-muted-foreground">Rétention améliorée</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">4.9/5</p>
                <p className="text-sm text-muted-foreground">Note des étudiants</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-3xl font-bold text-accent">A+</p>
                <p className="text-sm text-muted-foreground">Sécurité certifiée</p>
              </div>
            </div>
          </Card>

          {/* L'équipe */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">L'équipe</h3>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground text-lg mb-1">Laeticia Motongane</h4>
                <p className="text-primary text-sm mb-3">Fondatrice et Présidente — EmotionsCare SASU</p>
                <p className="text-sm">
                  Créatrice de la méthode MNG et auteure de la plateforme MED MNG. Passionnée par
                  l'intersection entre la technologie, la musique et l'éducation médicale, elle a conçu
                  MED MNG pour rendre l'apprentissage médical plus accessible, plus efficace et plus
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
                MED MNG est développé et édité par <strong>EmotionsCare SASU</strong>, société française
                dédiée à l'innovation dans le domaine de l'éducation et du bien-être par les technologies
                créatives.
              </p>
              <div className="bg-card p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">Informations légales</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Raison sociale :</strong> EmotionsCare SASU</li>
                  <li><strong>Capital social :</strong> 100 euros</li>
                  <li><strong>Siège social :</strong> 5 rue Caudron, 80000 Amiens, France</li>
                  <li><strong>RCS Amiens :</strong> 944 505 445</li>
                  <li><strong>SIRET :</strong> 944 505 445 00011</li>
                  <li><strong>TVA intracommunautaire :</strong> FR89944505445</li>
                  <li><strong>Présidente :</strong> Laeticia Motongane</li>
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
                  Chaque contenu est basé sur les référentiels officiels. La précision médicale est
                  notre priorité absolue.
                </p>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Innovation pédagogique</h4>
                <p className="text-sm text-muted-foreground">
                  Nous exploitons les dernières avancées en IA et neurosciences pour créer des outils
                  d'apprentissage uniques.
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Accessibilité</h4>
                <p className="text-sm text-muted-foreground">
                  Gratuit pour commencer, PWA installable, mode hors ligne : MED MNG est accessible
                  à tous les étudiants.
                </p>
              </div>
              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Respect des données</h4>
                <p className="text-sm text-muted-foreground">
                  RGPD, sécurité A+, zéro tracking publicitaire : vos données sont sacrées.
                </p>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <Card className="p-6 bg-primary/10 border-primary/20">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Prêt à apprendre autrement ?</h3>
              <p className="text-sm text-muted-foreground">
                Rejoignez les étudiants qui utilisent déjà MED MNG pour révolutionner leurs révisions.
              </p>
              <div className="flex justify-center gap-4">
                <Link to={ROUTE_PATHS.medMngSignup}>
                  <Button>Créer un compte gratuit</Button>
                </Link>
                <Link to={ROUTE_PATHS.ednComplete}>
                  <Button variant="outline">Découvrir les 367 items</Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to={ROUTE_PATHS.home}>
              <Button variant="outline" className="flex items-center space-x-2">
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

export default About;