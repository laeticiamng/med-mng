import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, BookOpen, Calendar, BarChart3, Trophy, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeeAlsoLinks } from '@/components/seo/SeeAlsoLinks';

const ClassementEdnExplique = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Comment fonctionne le classement EDN ? Guide complet 2026",
    "description": "Comprendre le classement national EDN : calcul du score, pondération, rangs A et B, impact sur le choix de spécialité.",
    "author": { "@type": "Organization", "name": "MED-MNG" },
    "datePublished": "2026-02-28",
    "dateModified": "2026-02-28"
  };

  return (
    <>
      <SEOHead
        title="Comment fonctionne le classement EDN 2026 | MED-MNG"
        description="Comprendre le classement national EDN : score, pondération, rangs A/B, ECOS, impact sur le choix de spécialité. Guide complet pour étudiants en médecine."
        keywords="classement EDN, score EDN, rang A rang B, classement national médecine, choix spécialité"
        canonical="/classement-edn-explique"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Classement EDN</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Comment fonctionne le classement EDN ? Guide complet 2026
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Le classement national détermine votre choix de spécialité et de ville. Comprendre son fonctionnement 
              est essentiel pour orienter votre stratégie de révision. Voici tout ce que vous devez savoir.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" /> 18 min de lecture</Badge>
              <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> Février 2026</Badge>
            </div>
          </header>

          {/* Structure */}
          <section id="structure" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              La structure du classement
            </h2>
            <p className="text-muted-foreground mb-4">
              Le classement national est composé de deux épreuves complémentaires dont les résultats sont combinés :
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-2">📝 EDN (60% du classement)</h3>
                  <p className="text-sm text-muted-foreground">
                    Épreuve théorique dématérialisée : QCM, questions à réponse ouverte et courte (QROC), 
                    dossiers cliniques progressifs. Couvre les 367 items du programme.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-2">🩺 ECOS (40% du classement)</h3>
                  <p className="text-sm text-muted-foreground">
                    Épreuve pratique : 10 stations de 15 minutes avec patients simulés. 
                    Évalue les compétences cliniques, la communication et le professionnalisme.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Rangs */}
          <section id="rangs" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Rang A vs Rang B : ce que ça change
            </h2>
            <p className="text-muted-foreground mb-4">
              Chaque item EDN est classé en Rang A (connaissances indispensables) ou Rang B (connaissances approfondies). 
              Cette distinction est fondamentale pour votre stratégie de révision.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-2">Rang A — Indispensable</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Connaissances que tout médecin doit maîtriser</li>
                    <li>• Coefficient plus élevé dans le calcul du score</li>
                    <li>• Erreur sur un Rang A = pénalité significative</li>
                    <li>• Priorité absolue dans vos révisions</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-2">Rang B — Approfondissement</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Connaissances spécialisées</li>
                    <li>• Permet de se démarquer dans le classement</li>
                    <li>• Important pour les spécialités compétitives</li>
                    <li>• À travailler après maîtrise du Rang A</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground">
                  <strong>💡 Stratégie gagnante :</strong> Maîtrisez 100% du Rang A avant d'attaquer le Rang B. 
                  Un étudiant qui maîtrise parfaitement le Rang A est déjà dans le top 40% du classement. 
                  Le Rang B fait la différence pour accéder aux spécialités les plus demandées.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Calcul du score */}
          <section id="calcul" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Comment est calculé votre score final
            </h2>
            <p className="text-muted-foreground mb-4">Le score final combine plusieurs composantes :</p>
            <ol className="space-y-4 mb-6">
              {[
                { step: "Score EDN brut", detail: "Somme pondérée de vos réponses aux QCM et dossiers cliniques. Les items Rang A ont un coefficient supérieur." },
                { step: "Score ECOS brut", detail: "Moyenne pondérée de vos 10 stations selon les grilles UNESS. Chaque compétence a un poids spécifique." },
                { step: "Standardisation", detail: "Les scores bruts sont standardisés pour tenir compte de la difficulté variable des épreuves entre sessions." },
                { step: "Pondération 60/40", detail: "Score final = 60% × score EDN standardisé + 40% × score ECOS standardisé." },
                { step: "Classement national", detail: "Les étudiants sont classés par score final décroissant. Ce rang détermine l'ordre de choix des spécialités et des villes." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-foreground">{item.step}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Impact spécialités */}
          <section id="specialites" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Impact sur le choix de spécialité
            </h2>
            <p className="text-muted-foreground mb-4">
              Votre rang au classement national détermine directement les spécialités et villes auxquelles vous pouvez accéder. 
              Les spécialités les plus demandées (chirurgie, dermatologie, ophtalmologie) nécessitent un rang dans le top 15-20%.
            </p>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {[
                    { rang: "Top 10%", specialites: "Chirurgie, Dermatologie, Ophtalmologie" },
                    { rang: "Top 20%", specialites: "Cardiologie, Radiologie, Anesthésie-réa" },
                    { rang: "Top 40%", specialites: "Pédiatrie, Neurologie, Gastro-entérologie" },
                    { rang: "Top 60%", specialites: "Médecine interne, Urgences, Psychiatrie" },
                  ].map((item) => (
                    <div key={item.rang} className="flex items-center gap-4 text-sm">
                      <Badge variant="outline" className="min-w-[80px] justify-center">{item.rang}</Badge>
                      <span className="text-muted-foreground">{item.specialites}</span>
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
                { title: "Réussir l'EDN : guide complet", path: ROUTE_PATHS.seoReussirEdn },
                { title: "Rang A vs Rang B", path: "/rang-a-vs-rang-b" },
                { title: "Simulation examen EDN", path: ROUTE_PATHS.seoSimulationEdn },
                { title: "Préparation ECOS 2026", path: ROUTE_PATHS.seoPreparationEcos },
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
                { q: "Peut-on améliorer son classement après l'EDN ?", a: "Non, le classement est définitif après publication des résultats. C'est pourquoi la préparation est cruciale." },
                { q: "Le Rang A suffit-il pour choisir sa spécialité ?", a: "Maîtriser le Rang A vous place dans le top 40%. Pour les spécialités compétitives, le Rang B est indispensable." },
                { q: "Comment MED-MNG simule le percentile national ?", a: "Après chaque examen blanc, votre score est comparé à l'ensemble des utilisateurs pour estimer votre rang national." },
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
            <h2 className="text-2xl font-bold text-foreground mb-3">Simulez votre classement EDN</h2>
            <p className="text-muted-foreground mb-6">Examens blancs avec percentile national simulé en temps réel.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2">Essai gratuit 7 jours <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to={ROUTE_PATHS.seoSimulationEdn}>
                <Button variant="outline" size="lg">Simulation EDN</Button>
              </Link>
            </div>
          </section>

          <SeeAlsoLinks currentPath="/classement-edn-explique" />
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default ClassementEdnExplique;
