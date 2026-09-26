import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, CheckCircle, Timer, BarChart3, Target, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeeAlsoLinks } from '@/components/seo/SeeAlsoLinks';

const SimulationExamenEdn = () => {
  return (
    <>
      <SEOHead
        title="Simulateur d'examen EDN en ligne – Entraînez-vous | MED MNG"
        description="Examens blancs EDN en ligne : 120 questions chronométrées (3 h) générées à partir des items, score par spécialité et par rang."
        keywords="simulateur EDN, examen blanc EDN, simulation EDN en ligne, entraînement EDN, QCM médecine"
        canonical="/simulation-examen-edn"
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Gratuit avec un compte</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Simulateur d'examen EDN : entraînez-vous en temps limité
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Passez des examens blancs chronométrés de 120 questions (QCM) générées à partir des items EDN,
              ou des sessions courtes. Vous obtenez un score par spécialité et par rang (A et B).
            </p>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Pourquoi utiliser un simulateur EDN ?
            </h2>
            <p className="text-muted-foreground mb-4">
              S'entraîner en temps limité aide à gérer son rythme et à repérer ses points faibles avant le jour J.
            </p>
            <p className="text-muted-foreground mb-4">
              Un examen blanc vous oblige à enchaîner les questions sous chronomètre, sans consulter vos cours.
              Les questions de MED MNG sont des QCM générés à partir des items : elles ne reproduisent pas
              le format exact des dossiers progressifs de l'EDN.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Fonctionnalités du simulateur MED MNG</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <Timer className="h-5 w-5" />, title: 'Chronomètre', desc: 'Durée fixée à l\'avance (3 h pour l\'examen blanc complet).' },
                { icon: <BarChart3 className="h-5 w-5" />, title: 'Score détaillé', desc: 'Résultats par spécialité et par rang (A et B).' },
                { icon: <Brain className="h-5 w-5" />, title: 'Analyse des erreurs', desc: 'Repérez les items et spécialités où vous vous trompez le plus.' },
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
                { step: '1', title: 'Choisissez le mode', desc: 'Examen blanc complet (120 questions, 3 h), session rapide (10 à 20 questions) ou par spécialité.' },
                { step: '2', title: 'Passez l\'examen', desc: 'Questions à choix multiples générées à partir des items, sous chronomètre.' },
                { step: '3', title: 'Consultez vos résultats', desc: 'Score global, score par spécialité et par rang, liste de vos erreurs.' },
                { step: '4', title: 'Révisez vos lacunes', desc: 'Retournez aux items EDN concernés (fiche, rang A, rang B, paroles).' },
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
            <h2 className="text-2xl font-bold text-foreground mb-4">Conseils pour maximiser vos simulations</h2>
            <ul className="space-y-3">
              {[
                'Faites vos simulations dans un environnement calme, sans interruption',
                'Respectez le temps imparti, sans pause',
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
                { q: 'Le simulateur est-il gratuit ?', a: 'Oui, les examens blancs sont accessibles avec un compte gratuit.' },
                { q: 'Les questions sont-elles conformes au programme ?', a: 'Les questions sont générées par IA à partir des 367 items et de leurs compétences rang A / rang B. Elles peuvent contenir des erreurs : vérifiez avec vos sources officielles.' },
                { q: 'Combien de simulations faut-il faire ?', a: 'Il n\'existe pas de nombre idéal. Espacer les examens blancs pour avoir le temps de retravailler ses erreurs est une bonne pratique.' },
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
            <p className="text-muted-foreground mb-6">120 questions, chronomètre, score par spécialité et par rang.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.examMode}><Button size="lg" className="gap-2">Commencer un examen <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to={ROUTE_PATHS.medMngPricing}><Button variant="outline" size="lg">Voir les tarifs</Button></Link>
            </div>
          </div>
          <SeeAlsoLinks currentPath="/simulation-examen-edn" />
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default SimulationExamenEdn;
