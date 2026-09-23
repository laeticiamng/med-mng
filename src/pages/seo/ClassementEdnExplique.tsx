import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, BookOpen, Calendar, BarChart3, Trophy, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeeAlsoLinks } from '@/components/seo/SeeAlsoLinks';

const ClassementEdnExplique = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Comment fonctionne le classement EDN ? Guide complet 2026",
    "description": "Comprendre le classement national EDN : épreuves, rangs A et B, choix de spécialité.",
    "author": { "@type": "Organization", "name": "MED-MNG" },
    "datePublished": "2026-02-28",
    "dateModified": "2026-02-28"
  };

  return (
    <>
      <SEOHead
        title="Comment fonctionne le classement EDN 2026 | MED-MNG"
        description="Comprendre le classement national EDN : épreuves, rangs A/B, ECOS et choix de spécialité."
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
              L'EDN et les ECOS comptent tous deux dans le classement ; consultez l'arrêté en vigueur pour la pondération exacte.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-2">📝 EDN</h3>
                  <p className="text-sm text-muted-foreground">
                    Épreuve théorique dématérialisée : QCM, questions à réponse ouverte et courte (QROC), 
                    dossiers cliniques progressifs. Couvre les 367 items du programme.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-2">🩺 ECOS</h3>
                  <p className="text-sm text-muted-foreground">
                    Épreuve pratique en stations avec patients simulés. Évalue les compétences cliniques,
                    la communication et le professionnalisme.
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
              Le rang ne s'applique pas à l'item mais à chaque connaissance : un même item contient des connaissances
              de rang A (indispensables) et de rang B (approfondies).
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-2">Rang A — Indispensable</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Connaissances que tout médecin doit maîtriser</li>
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
                    <li>• À travailler après maîtrise du Rang A</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-foreground">
                  <strong>💡 Stratégie simple :</strong> pour chaque item, travaillez d'abord ses connaissances de rang A,
                  puis son rang B. Le rôle exact de chaque rang dans la validation et le classement est fixé par les textes officiels.
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
            <p className="text-muted-foreground mb-4">
              Les modalités de calcul (pondération entre EDN et ECOS, traitement des rangs, éventuelle standardisation)
              sont définies par les textes officiels. Nous ne les reproduisons pas ici pour éviter toute erreur :
              consultez l'arrêté en vigueur et les informations du CNG.
            </p>
            <p className="text-muted-foreground mb-4">
              Le principe reste simple : les étudiants sont classés selon leur résultat final, et ce rang détermine
              l'ordre de choix des spécialités et des villes.
            </p>
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
                { q: "Faut-il travailler le Rang B ?", a: "Oui, le rang B fait partie du programme. Commencez par le rang A de chaque item, puis travaillez son rang B." },
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
            <h2 className="text-2xl font-bold text-foreground mb-3">Entraînez-vous avec des examens blancs</h2>
            <p className="text-muted-foreground mb-6">Examens blancs chronométrés avec score par spécialité et par rang.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2">Créer un compte gratuit <ArrowRight className="h-4 w-4" /></Button>
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
