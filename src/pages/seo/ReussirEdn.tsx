import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, BookOpen, CheckCircle, Brain, Calendar, Target, Lightbulb, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeeAlsoLinks } from '@/components/seo/SeeAlsoLinks';
import { TranslatedText } from '@/components/TranslatedText';

const ReussirEdn = () => {
  return (
    <>
      <SEOHead
        title="Guide complet pour réussir l'EDN 2026 | MED-MNG"
        description="Réussir l'EDN : stratégies, planning, méthodes de révision et outils. 367 items, QCM, cas cliniques. Le guide ultime pour les étudiants en médecine."
        keywords="réussir EDN, EDN 2026, examen dématérialisé national, révision médecine, classement national"
        canonical="/reussir-edn"
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4"><TranslatedText text="Guide EDN 2026" /></Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              <TranslatedText text="Guide complet pour réussir l'EDN : stratégie, planning et outils" />
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              <TranslatedText text="L'Examen Dématérialisé National (EDN) remplace l'ancien ECN. Avec 367 items à maîtriser et un classement national, la préparation doit être méthodique et intelligente. Ce guide vous donne la feuille de route complète." />
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" /> <TranslatedText text="20 min de lecture" /></Badge>
              <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> <TranslatedText text="Mis à jour février 2026" /></Badge>
            </div>
          </header>

          <nav className="mb-12 p-6 bg-muted/50 rounded-xl border">
            <h2 className="font-semibold text-foreground mb-4">📋 <TranslatedText text="Sommaire" /></h2>
            <ol className="space-y-2 text-sm">
              <li><a href="#quest-ce" className="text-primary hover:underline"><TranslatedText text="1. Qu'est-ce que l'EDN ?" /></a></li>
              <li><a href="#items" className="text-primary hover:underline"><TranslatedText text="2. Les 367 items : comment les aborder" /></a></li>
              <li><a href="#rang" className="text-primary hover:underline"><TranslatedText text="3. Rang A vs Rang B : stratégie de priorisation" /></a></li>
              <li><a href="#methodes" className="text-primary hover:underline"><TranslatedText text="4. Méthodes de révision scientifiquement prouvées" /></a></li>
              <li><a href="#planning-edn" className="text-primary hover:underline"><TranslatedText text="5. Planning de révision EDN sur 12 mois" /></a></li>
              <li><a href="#qcm" className="text-primary hover:underline"><TranslatedText text="6. Entraînement QCM : qualité vs quantité" /></a></li>
              <li><a href="#musique" className="text-primary hover:underline"><TranslatedText text="7. La méthode musicale : réviser autrement" /></a></li>
              <li><a href="#faq-edn" className="text-primary hover:underline">8. FAQ</a></li>
            </ol>
          </nav>

          <section id="quest-ce" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <TranslatedText text="1. Qu'est-ce que l'EDN ?" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="L'EDN (Examen Dématérialisé National) est l'épreuve théorique du 2e cycle des études médicales. Il représente 70% de la note finale pour le classement national, les 30% restants étant les ECOS." />
            </p>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="L'examen se compose de dossiers progressifs et de questions isolées couvrant l'ensemble des 367 items du programme. Chaque item est classé Rang A (indispensable) ou Rang B (approfondi)." />
            </p>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3"><TranslatedText text="Chiffres clés de l'EDN :" /></h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    '367 items au programme',
                    '70% du classement national',
                    '120 dossiers progressifs',
                    'Format dématérialisé sur tablette',
                    'Rang A : connaissances indispensables',
                    'Rang B : connaissances approfondies',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" /> <TranslatedText text={item} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="items" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <TranslatedText text="2. Les 367 items : comment les aborder" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="367 items, c'est considérable. La clé est de ne pas les traiter de manière linéaire mais par cercles concentriques : d'abord une vue d'ensemble, puis des approfondissements successifs." />
            </p>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Premier passage (2 mois) : Lisez chaque item une fois en vous concentrant sur les mots-clés et les tableaux cliniques typiques. Utilisez les fiches synthétiques MED-MNG pour avoir l'essentiel en un coup d'œil." />
            </p>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Deuxième passage (2 mois) : Approfondissez avec les QCM et les cas cliniques. Identifiez vos lacunes. Utilisez la répétition espacée pour consolider." />
            </p>
            <p className="text-muted-foreground">
              <TranslatedText text="Troisième passage (2 mois) : Révision ciblée des items faibles, simulations d'examen chronométrées, et consolidation par la musique médicale." />
            </p>
          </section>

          <section id="rang" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <TranslatedText text="3. Rang A vs Rang B : stratégie de priorisation" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Le Rang A représente les connaissances indispensables que tout médecin doit maîtriser. Le Rang B va plus loin et permet de départager les étudiants dans le classement." />
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Card className="border-success/30">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-success mb-2"><TranslatedText text="Rang A — Priorité absolue" /></h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <TranslatedText text="Diagnostics et PEC des urgences" /></li>
                    <li>• <TranslatedText text="Sémiologie fondamentale" /></li>
                    <li>• <TranslatedText text="Thérapeutiques de première ligne" /></li>
                    <li>• <TranslatedText text="Maîtriser à 100% avant l'examen" /></li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-primary mb-2"><TranslatedText text="Rang B — Pour le classement" /></h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <TranslatedText text="Diagnostics différentiels avancés" /></li>
                    <li>• <TranslatedText text="Physiopathologie détaillée" /></li>
                    <li>• <TranslatedText text="Traitements de 2e/3e ligne" /></li>
                    <li>• <TranslatedText text="Fait la différence dans le top 30%" /></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="text-muted-foreground">
              <TranslatedText text="Règle d'or : Ne commencez jamais le Rang B d'un item si vous ne maîtrisez pas le Rang A. Sur MED-MNG, chaque item affiche clairement le contenu Rang A et Rang B séparément." />
            </p>
          </section>

          <section id="methodes" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <TranslatedText text="4. Méthodes de révision scientifiquement prouvées" />
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="Active Recall (rappel actif)" /></h3>
                <p><TranslatedText text="Au lieu de relire passivement, testez-vous constamment. Les flashcards et les QCM sont les outils les plus efficaces pour le rappel actif. Études montrent une amélioration de 50% vs lecture passive." /></p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="Spaced Repetition (répétition espacée)" /></h3>
                <p><TranslatedText text="Revoyez chaque notion à intervalles croissants (J1, J3, J7, J14, J30). Le système SRS de MED-MNG automatise ce processus pour vous." /></p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="Interleaving (entrelacement)" /></h3>
                <p><TranslatedText text="Mélangez les sujets plutôt que de réviser une spécialité pendant des jours. L'alternance force votre cerveau à faire des connexions plus profondes." /></p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="Elaborative Encoding (encodage élaboré)" /></h3>
                <p><TranslatedText text="Reliez chaque nouvelle information à ce que vous savez déjà. Les chansons MED-MNG créent ces associations automatiquement en transformant les données médicales en mélodies mémorables." /></p>
              </div>
            </div>
          </section>

          <section id="planning-edn" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <TranslatedText text="5. Planning de révision EDN sur 12 mois" />
            </h2>
            {[
              { period: 'Trimestre 1 (M1-M3)', focus: 'Premier tour complet des 367 items Rang A. 3-4 items/jour. Flashcards quotidiennes.' },
              { period: 'Trimestre 2 (M4-M6)', focus: 'Deuxième tour + Rang B des items fréquents. QCM quotidiens. Premiers cas cliniques.' },
              { period: 'Trimestre 3 (M7-M9)', focus: 'Approfondissement Rang B. Simulations d\'examen hebdomadaires. Musique IA pour consolidation.' },
              { period: 'Trimestre 4 (M10-M12)', focus: 'Révision ciblée des points faibles. EDN blancs bi-hebdomadaires. Préparation ECOS en parallèle.' },
            ].map((t, i) => (
              <Card key={i} className="mb-3">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground text-sm"><TranslatedText text={t.period} /></h3>
                  <p className="text-sm text-muted-foreground mt-1"><TranslatedText text={t.focus} /></p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section id="qcm" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <TranslatedText text="6. Entraînement QCM : qualité vs quantité" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Faire 10 000 QCM ne sert à rien si vous ne comprenez pas vos erreurs. La qualité prime toujours sur la quantité." />
            </p>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Notre recommandation : 30-50 QCM/jour avec analyse détaillée de chaque erreur. Sur MED-MNG, chaque QCM est lié à un item EDN avec correction pédagogique." />
            </p>
          </section>

          <section id="musique" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <TranslatedText text="7. La méthode musicale : réviser autrement" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="MED-MNG est la première plateforme à combiner apprentissage médical et musique IA. Chaque item EDN peut être transformé en chanson, créant des associations mnémotechniques puissantes." />
            </p>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Les études en neurosciences cognitives montrent que l'apprentissage musical active les deux hémisphères cérébraux simultanément, améliorant la rétention de 20 à 40% par rapport à la lecture seule." />
            </p>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-3"><TranslatedText text="Essayez la méthode MED-MNG" /></h3>
                <p className="text-sm text-muted-foreground mb-4"><TranslatedText text="367 items EDN + Musique IA + QCM + Cas cliniques" /></p>
                <Link to={ROUTE_PATHS.medMngSignup}>
                  <Button className="gap-2"><TranslatedText text="Essai gratuit 7 jours" /> <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section id="faq-edn" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4"><TranslatedText text="8. Questions fréquentes" /></h2>
            <Accordion type="single" collapsible>
              {[
                { q: 'Combien d\'items faut-il réviser par jour ?', a: 'Visez 3-4 items/jour en premier tour, puis 8-10 en révision. La régularité prime sur l\'intensité.' },
                { q: 'L\'EDN est-il plus dur que l\'ancien ECN ?', a: 'Le format est différent (dématérialisé, dossiers progressifs) mais le niveau de difficulté est comparable. La préparation méthodique reste la clé.' },
                { q: 'Faut-il tout apprendre par cœur ?', a: 'Non. Comprenez les mécanismes et retenez les éléments clés. Les tableaux, les scores et les critères diagnostiques doivent être maîtrisés.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left"><TranslatedText text={faq.q} /></AccordionTrigger>
                  <AccordionContent className="text-muted-foreground"><TranslatedText text={faq.a} /></AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3"><TranslatedText text="Prêt à réussir l'EDN ?" /></h2>
            <p className="text-muted-foreground mb-6"><TranslatedText text="367 items, QCM illimités, musique IA et cas cliniques sur une seule plateforme." /></p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}><Button size="lg" className="gap-2"><TranslatedText text="Commencer" /> <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to={ROUTE_PATHS.medMngPricing}><Button variant="outline" size="lg"><TranslatedText text="Voir les tarifs" /></Button></Link>
            </div>
          </div>

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "Combien d'items faut-il réviser par jour ?", "acceptedAnswer": { "@type": "Answer", "text": "Visez 3-4 items/jour en premier tour, puis 8-10 en révision." }},
              { "@type": "Question", "name": "L'EDN est-il plus dur que l'ancien ECN ?", "acceptedAnswer": { "@type": "Answer", "text": "Le format est différent mais le niveau de difficulté est comparable." }},
            ]
          })}} />
          <SeeAlsoLinks currentPath="/reussir-edn" />
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default ReussirEdn;
