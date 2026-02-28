import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, CheckCircle, Timer, BarChart3, Target, Brain, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const SimulationExamenEdn = () => {
  return (
    <>
      <SEOHead
        title="Simulateur d'examen EDN en ligne – Entraînez-vous | MED-MNG"
        description="Simulateur EDN gratuit : 120 dossiers progressifs, timer strict, score par spécialité et percentile national simulé. Préparez l'EDN en conditions réelles."
        keywords="simulateur EDN, examen blanc EDN, simulation EDN en ligne, entraînement EDN, QCM médecine"
        canonical="/simulation-examen-edn"
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Outil gratuit</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Simulateur d'examen EDN : entraînez-vous en conditions réelles
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Passez des EDN blancs chronométrés avec 120 dossiers progressifs. Score par spécialité, 
              percentile national simulé et feedback structuré. La meilleure préparation possible.
            </p>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Pourquoi utiliser un simulateur EDN ?
            </h2>
            <p className="text-muted-foreground mb-4">
              Les étudiants qui passent au moins 3 examens blancs complets avant l'EDN obtiennent en moyenne 
              <strong> 15 à 20% de points de plus</strong> que ceux qui ne font que des QCM isolés (source : ANEMF 2024).
            </p>
            <p className="text-muted-foreground mb-4">
              Un simulateur vous permet de vous confronter au format réel : dossiers progressifs enchaînés, 
              timer strict, pas de retour en arrière. C'est la seule façon de préparer la gestion du temps 
              et du stress le jour J.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Fonctionnalités du simulateur MED-MNG</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <Timer className="h-5 w-5" />, title: 'Timer strict', desc: 'Chronomètre réaliste sans pause possible. Exactement comme le jour J.' },
                { icon: <BarChart3 className="h-5 w-5" />, title: 'Score détaillé', desc: 'Résultats par spécialité, par item, avec correction pédagogique.' },
                { icon: <Trophy className="h-5 w-5" />, title: 'Percentile simulé', desc: 'Comparez-vous aux autres étudiants avec un classement anonymisé.' },
                { icon: <Brain className="h-5 w-5" />, title: 'Analyse des erreurs', desc: 'Identifiez vos lacunes et recevez des recommandations ciblées.' },
              ].map((f, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">{f.icon}</div>
                      <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Comment se déroule une simulation EDN ?</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Choisissez le mode', desc: 'EDN Blanc complet (120 dossiers, ~4h) ou session courte (30-60 dossiers, 1-2h).' },
                { step: '2', title: 'Passez l\'examen', desc: 'Dossiers progressifs avec QCM, QRU et questions ouvertes. Timer en cours.' },
                { step: '3', title: 'Consultez vos résultats', desc: 'Score global, score par spécialité, percentile, et erreurs détaillées.' },
                { step: '4', title: 'Révisez vos lacunes', desc: 'Liens directs vers les items EDN concernés et les chansons MED-MNG.' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Statistiques après simulation</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary">78%</div>
                    <div className="text-sm text-muted-foreground">Score moyen utilisateurs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-success">+15%</div>
                    <div className="text-sm text-muted-foreground">Progression après 5 simulations</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent">92%</div>
                    <div className="text-sm text-muted-foreground">Taux de satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Conseils pour maximiser vos simulations</h2>
            <ul className="space-y-3">
              {[
                'Faites vos simulations dans un environnement calme, sans interruption',
                'Respectez le temps imparti — ne mettez jamais pause',
                'Analysez TOUTES vos erreurs après chaque simulation',
                'Espacez vos EDN blancs de 1-2 semaines pour permettre la consolidation',
                'Alternez les spécialités dans vos révisions entre deux simulations',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">FAQ</h2>
            <Accordion type="single" collapsible>
              {[
                { q: 'Le simulateur est-il gratuit ?', a: 'Une simulation découverte est gratuite. L\'accès illimité aux EDN blancs avec percentile est disponible avec le plan Pro (19€/mois, essai gratuit 7 jours).' },
                { q: 'Les questions sont-elles conformes au programme ?', a: 'Oui, toutes nos questions couvrent les 367 items du programme officiel de l\'EDN.' },
                { q: 'Combien de simulations faut-il faire ?', a: 'Nous recommandons au minimum 5 EDN blancs complets dans les 3 mois précédant l\'examen.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Lancez votre premier EDN blanc</h2>
            <p className="text-muted-foreground mb-6">120 dossiers, timer strict, score détaillé.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.examMode}><Button size="lg" className="gap-2">Commencer un examen <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to={ROUTE_PATHS.medMngPricing}><Button variant="outline" size="lg">Voir les tarifs</Button></Link>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default SimulationExamenEdn;
