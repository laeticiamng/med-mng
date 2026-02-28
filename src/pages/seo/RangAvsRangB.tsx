import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, BookOpen, Calendar, Shield, Sword, Scale, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RangAvsRangB = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Qu'est-ce que le Rang A en médecine ?", "acceptedAnswer": { "@type": "Answer", "text": "Le Rang A regroupe les connaissances indispensables que tout médecin doit maîtriser, quel que soit sa spécialité. Ce sont les items prioritaires de l'EDN." }},
      { "@type": "Question", "name": "Quelle est la différence entre Rang A et Rang B ?", "acceptedAnswer": { "@type": "Answer", "text": "Le Rang A contient les savoirs essentiels (priorité absolue), le Rang B les connaissances approfondies qui départagent les étudiants dans le classement national." }},
      { "@type": "Question", "name": "Faut-il apprendre le Rang B ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, si vous visez une spécialité compétitive (top 20%). Si vous visez le top 40%, concentrez-vous d'abord sur une maîtrise parfaite du Rang A." }},
    ]
  };

  return (
    <>
      <SEOHead
        title="Rang A vs Rang B EDN : comprendre la différence | MED-MNG"
        description="Rang A vs Rang B à l'EDN : quelles connaissances prioriser ? Stratégie de révision, items par rang, impact sur le classement national. Guide complet."
        keywords="rang A rang B, EDN rang A, EDN rang B, items EDN, stratégie révision médecine"
        canonical="/rang-a-vs-rang-b"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Stratégie EDN</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Rang A vs Rang B : comprendre la différence pour mieux réviser
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              La réforme R2C a introduit une classification des connaissances en deux rangs. Cette distinction 
              est la clé de votre stratégie de révision. Voici tout ce que vous devez savoir pour optimiser votre temps.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" /> 12 min de lecture</Badge>
              <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> Février 2026</Badge>
            </div>
          </header>

          {/* Définitions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Définitions officielles
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-t-4 border-t-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">Rang A</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Connaissances <strong>indispensables</strong> que tout médecin diplômé doit maîtriser, 
                    indépendamment de sa future spécialité. Ce sont les fondamentaux de la médecine.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Priorité absolue de révision</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Coefficient élevé au classement</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Erreur = forte pénalité</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> ~60% des items EDN</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-accent">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sword className="h-5 w-5 text-accent-foreground" />
                    <h3 className="text-xl font-bold text-foreground">Rang B</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Connaissances <strong>approfondies</strong> nécessaires pour la pratique spécialisée. 
                    Ce sont les savoirs qui font la différence dans le classement.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground flex-shrink-0" /> À travailler après le Rang A</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground flex-shrink-0" /> Départage les meilleurs</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground flex-shrink-0" /> Essentiel pour le top 20%</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground flex-shrink-0" /> ~40% des items EDN</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Stratégie */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">🎯 Stratégie de révision par objectif</h2>
            <div className="space-y-4">
              {[
                { objectif: "Top 60% — Médecine générale, Psychiatrie", strategie: "Maîtrisez 95% du Rang A. Survolez le Rang B pour les spécialités qui vous intéressent. Concentrez-vous sur les ECOS." },
                { objectif: "Top 40% — Pédiatrie, Neurologie, Urgences", strategie: "100% du Rang A + 60% du Rang B. Entraînement QCM quotidien. Cas cliniques 2×/semaine." },
                { objectif: "Top 20% — Cardiologie, Radiologie, Anesthésie", strategie: "100% Rang A + 80% Rang B. Examens blancs hebdomadaires. Analyse systématique des erreurs." },
                { objectif: "Top 10% — Chirurgie, Dermato, Ophtalmo", strategie: "Maîtrise totale A + B. Entraînement intensif QCM + ECOS. Groupes de travail. Analyse percentile." },
              ].map((item, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-foreground mb-2">{item.objectif}</h3>
                    <p className="text-sm text-muted-foreground">{item.strategie}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Planning */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">📅 Planning type sur 12 mois</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[
                    { mois: "Mois 1-4", focus: "Rang A exclusif", detail: "Parcourir tous les items Rang A. Fiches de synthèse. QCM de vérification." },
                    { mois: "Mois 5-8", focus: "Rang A consolidation + Rang B", detail: "Révision espacée du Rang A (SRS). Introduction progressive du Rang B. Cas cliniques." },
                    { mois: "Mois 9-10", focus: "Examens blancs", detail: "1 examen blanc/semaine. Analyse des erreurs. Travail ciblé sur les faiblesses." },
                    { mois: "Mois 11-12", focus: "Sprint final", detail: "Révision ciblée. ECOS intensif. Gestion du stress. Derniers examens blancs." },
                  ].map((item) => (
                    <div key={item.mois} className="flex gap-4">
                      <Badge variant="outline" className="min-w-[90px] h-fit justify-center">{item.mois}</Badge>
                      <div>
                        <p className="font-semibold text-foreground">{item.focus}</p>
                        <p className="text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Articles liés */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">📚 Articles liés</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Réussir l'EDN", path: ROUTE_PATHS.seoReussirEdn },
                { title: "Classement EDN expliqué", path: "/classement-edn-explique" },
                { title: "Fiches ECOS interactives", path: ROUTE_PATHS.seoFichesEcos },
                { title: "Simulation examen EDN", path: ROUTE_PATHS.seoSimulationEdn },
              ].map((article) => (
                <Link key={article.path} to={article.path}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4 pb-4 flex items-center justify-between">
                      <span className="font-medium text-sm">{article.title}</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">❓ Questions fréquentes</h2>
            <Accordion type="single" collapsible>
              {[
                { q: "Qu'est-ce que le Rang A en médecine ?", a: "Le Rang A regroupe les connaissances indispensables que tout médecin doit maîtriser, quel que soit sa spécialité." },
                { q: "Faut-il apprendre le Rang B ?", a: "Oui si vous visez une spécialité compétitive. Non si vous visez la médecine générale et maîtrisez parfaitement le Rang A." },
                { q: "Combien d'items sont en Rang A ?", a: "Environ 60% des 367 items EDN sont classés en Rang A, soit environ 220 items." },
                { q: "MED-MNG différencie-t-il Rang A et Rang B ?", a: "Oui, chaque item est étiqueté Rang A ou Rang B. Vous pouvez filtrer vos révisions et examens par rang." },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Révisez les 367 items par rang</h2>
            <p className="text-muted-foreground mb-6">Filtrez Rang A / Rang B, suivez votre progression par spécialité.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2">Essai gratuit 7 jours <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to={ROUTE_PATHS.ednComplete}>
                <Button variant="outline" size="lg">Voir les 367 items</Button>
              </Link>
            </div>
          </section>

        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default RangAvsRangB;
