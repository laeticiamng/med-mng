import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, AlertTriangle, CheckCircle, XCircle, Target, BookOpen, Calendar, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

const erreurs = [
  {
    titre: "Ne pas structurer sa présentation initiale",
    description: "Beaucoup d'étudiants sautent directement au diagnostic sans recueillir méthodiquement l'anamnèse. L'examinateur évalue votre capacité à suivre une démarche clinique structurée.",
    conseil: "Utilisez toujours le schéma ATCD → HMA → Signes fonctionnels → Examen clinique → Hypothèses diagnostiques."
  },
  {
    titre: "Oublier le consentement et l'empathie",
    description: "Les compétences relationnelles sont notées explicitement dans les grilles UNESS. Se présenter, expliquer la démarche et recueillir le consentement sont des points souvent oubliés.",
    conseil: "Commencez chaque station par : 'Bonjour, je suis [nom], [fonction]. Je vais vous expliquer ce que nous allons faire ensemble.'"
  },
  {
    titre: "Gérer mal le temps (15 minutes par station)",
    description: "Chaque station dure exactement 15 minutes. Trop d'étudiants passent 10 minutes sur l'anamnèse et n'ont plus le temps pour l'examen clinique ou l'annonce diagnostique.",
    conseil: "Divisez mentalement : 5 min anamnèse, 5 min examen/raisonnement, 5 min plan de prise en charge et communication."
  },
  {
    titre: "Ne pas annoncer ses gestes à voix haute",
    description: "L'examinateur ne peut pas deviner ce que vous pensez. Si vous n'annoncez pas vos gestes d'examen clinique, ils ne sont pas comptabilisés.",
    conseil: "Verbalisez tout : 'Je vais maintenant ausculter les poumons en commençant par les bases.'"
  },
  {
    titre: "Ignorer les signaux du patient simulé",
    description: "Le patient standardisé est formé pour donner des indices. Si vous posez une question fermée et qu'il développe, c'est un signal qu'il y a une information importante.",
    conseil: "Soyez attentif aux réponses spontanées et n'hésitez pas à reformuler pour approfondir."
  },
  {
    titre: "Faire un diagnostic sans justification",
    description: "Annoncer un diagnostic sans expliquer le raisonnement clinique qui y mène est une erreur fréquente. La grille évalue le processus, pas juste le résultat.",
    conseil: "Structurez : 'Au vu de [symptômes], [examen], [contexte], mon hypothèse principale est [diagnostic] car [arguments].'"
  },
  {
    titre: "Négliger l'annonce de mauvaise nouvelle",
    description: "Les stations d'annonce sont parmi les plus redoutées. L'erreur classique est d'être trop direct ou au contraire trop évasif.",
    conseil: "Utilisez le protocole SPIKES : Setting, Perception, Invitation, Knowledge, Emotions, Strategy."
  },
  {
    titre: "Ne pas conclure la consultation",
    description: "Terminer sans résumer, sans vérifier la compréhension du patient et sans planifier le suivi est une erreur de structure.",
    conseil: "Toujours finir par : résumé → vérification compréhension → plan de suivi → questions du patient."
  }
];

const faqs = [
  {
    question: "Combien de stations comporte l'épreuve ECOS ?",
    answer: "L'épreuve ECOS comporte 10 stations de 15 minutes chacune, couvrant différentes compétences cliniques : communication, examen clinique, raisonnement diagnostique, gestes techniques et annonce."
  },
  {
    question: "Comment sont notées les ECOS ?",
    answer: "Chaque station est évaluée selon une grille UNESS standardisée avec des items pondérés. Les compétences évaluées incluent : communication, examen clinique, raisonnement, éthique et professionnalisme."
  },
  {
    question: "Peut-on s'entraîner seul aux ECOS ?",
    answer: "Oui, avec des outils comme MED-MNG qui proposent des cas cliniques interactifs avec correction par compétence. L'entraînement entre pairs est aussi très efficace pour les aspects communication."
  },
  {
    question: "Quelle est la différence entre ECOS et ECN ?",
    answer: "L'ECN était un examen purement théorique (QCM). Les ECOS ajoutent une évaluation pratique des compétences cliniques en situation simulée, ce qui les rend complémentaires de l'EDN."
  },
  {
    question: "Combien de temps faut-il pour se préparer aux ECOS ?",
    answer: "Idéalement 6 mois de préparation progressive : 2 mois de théorie (protocoles, grilles), 2 mois de cas cliniques écrits, 2 mois de simulations pratiques."
  }
];

const ErreursFrquentesEcos = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Les 8 erreurs les plus fréquentes aux ECOS (et comment les éviter)",
    "description": "Découvrez les erreurs classiques qui font perdre des points aux ECOS et les stratégies concrètes pour les éviter.",
    "author": { "@type": "Organization", "name": "MED-MNG" },
    "datePublished": "2026-02-28",
    "dateModified": "2026-02-28"
  };

  return (
    <>
      <SEOHead
        title="8 erreurs fréquentes aux ECOS à éviter | MED-MNG"
        description="Les erreurs classiques qui font perdre des points aux ECOS : mauvaise gestion du temps, oubli du consentement, diagnostic sans justification. Solutions concrètes."
        keywords="erreurs ECOS, fautes ECOS, préparation ECOS, stations ECOS, grille UNESS"
        canonical="/erreurs-frequentes-ecos"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Guide ECOS</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Les 8 erreurs les plus fréquentes aux ECOS (et comment les éviter)
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Les ECOS sont redoutés par les étudiants en médecine. Pourtant, la plupart des points perdus viennent d'erreurs évitables. 
              Ce guide analyse les 8 erreurs les plus fréquentes et vous donne des solutions concrètes pour chacune.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" /> 15 min de lecture</Badge>
              <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> Février 2026</Badge>
            </div>
          </header>

          {/* Erreurs */}
          <section className="space-y-8 mb-16">
            {erreurs.map((err, i) => (
              <Card key={i} className="border-l-4 border-l-destructive/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                    <h2 className="text-xl font-bold text-foreground">
                      Erreur #{i + 1} : {err.titre}
                    </h2>
                  </div>
                  <p className="text-muted-foreground mb-4 ml-8">{err.description}</p>
                  <div className="flex items-start gap-3 ml-8 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground"><strong>Solution :</strong> {err.conseil}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Checklist */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">✅ Checklist pré-ECOS</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {[
                    "Je me suis entraîné sur au moins 20 cas cliniques",
                    "Je connais le protocole SPIKES pour l'annonce",
                    "Je sais structurer une consultation en 3×5 minutes",
                    "Je verbalise mes gestes d'examen clinique",
                    "Je commence toujours par me présenter et recueillir le consentement",
                    "Je conclus par un résumé + vérification de compréhension",
                    "J'ai fait au moins 3 simulations chronométrées",
                    "Je connais les grilles UNESS par compétence"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Articles liés */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">📚 Articles liés</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Préparation ECOS 2026", path: ROUTE_PATHS.seoPreparationEcos },
                { title: "Fiches ECOS interactives", path: ROUTE_PATHS.seoFichesEcos },
                { title: "Cas cliniques EDN", path: ROUTE_PATHS.seoCasCliniqueEdn },
                { title: "Réussir l'EDN", path: ROUTE_PATHS.seoReussirEdn },
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
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Prêt à vous entraîner aux ECOS ?</h2>
            <p className="text-muted-foreground mb-6">Cas cliniques interactifs avec correction par compétence UNESS.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2">Essai gratuit 7 jours <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to={ROUTE_PATHS.seoPreparationEcos}>
                <Button variant="outline" size="lg">Guide préparation ECOS</Button>
              </Link>
            </div>
          </section>

        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default ErreursFrquentesEcos;
