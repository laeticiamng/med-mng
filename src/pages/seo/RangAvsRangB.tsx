import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, BookOpen, Calendar, Shield, Sword, Scale, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeeAlsoLinks } from '@/components/seo/SeeAlsoLinks';

const RangAvsRangB = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Qu'est-ce que le Rang A en médecine ?", "acceptedAnswer": { "@type": "Answer", "text": "Le Rang A regroupe les connaissances indispensables que tout médecin doit maîtriser, quel que soit sa spécialité. Au sein de chaque item, ce sont les connaissances à maîtriser en priorité." }},
      { "@type": "Question", "name": "Quelle est la différence entre Rang A et Rang B ?", "acceptedAnswer": { "@type": "Answer", "text": "Le Rang A contient les savoirs essentiels (priorité absolue), le Rang B les connaissances approfondies qui départagent les étudiants dans le classement national." }},
      { "@type": "Question", "name": "Faut-il apprendre le Rang B ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, le rang B fait partie du programme. Commencez par le rang A de chaque item, puis travaillez son rang B." }},
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
              Définitions
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
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Présent dans la plupart des items</li>
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
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground flex-shrink-0" /> Aide à départager les candidats</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-accent-foreground flex-shrink-0" /> Coexiste avec le rang A dans un même item</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Rang = propriété de chaque connaissance, pas de l'item */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">🎯 Le rang s'applique à chaque connaissance, pas à l'item</h2>
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
                <p>
                  Un item EDN n'est pas « de rang A » ou « de rang B » : il contient des connaissances des deux rangs.
                  Par exemple, l'item 1 (relation médecin-malade) compte 15 connaissances de rang A et 10 de rang B
                  dans le référentiel.
                </p>
                <p>
                  Stratégie simple : pour chaque item, commencez par ses connaissances de rang A, puis passez au rang B.
                  Le poids exact de chaque rang dans la validation et le classement est fixé par les textes officiels en vigueur.
                </p>
              </CardContent>
            </Card>
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
                { q: "Faut-il apprendre le Rang B ?", a: "Oui, le rang B fait partie du programme. Commencez par le rang A de chaque item, puis travaillez son rang B." },
                { q: "Combien d'items sont en Rang A ?", a: "La question ne se pose pas ainsi : le rang s'applique à chaque connaissance, pas à l'item. Un même item contient des connaissances de rang A et de rang B." },
                { q: "MED-MNG différencie-t-il Rang A et Rang B ?", a: "Oui, pour chaque item, MED-MNG affiche séparément les connaissances de rang A et de rang B (onglets Rang A et Rang B)." },
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
            <p className="text-muted-foreground mb-6">Pour chaque item, les connaissances de rang A et de rang B sont affichées séparément.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2">Créer un compte gratuit <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to={ROUTE_PATHS.ednComplete}>
                <Button variant="outline" size="lg">Voir les 367 items</Button>
              </Link>
            </div>
          </section>

          <SeeAlsoLinks currentPath="/rang-a-vs-rang-b" />
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default RangAvsRangB;
