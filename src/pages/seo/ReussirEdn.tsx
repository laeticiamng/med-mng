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
            <Badge variant="secondary" className="mb-4">Guide EDN 2026</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Guide complet pour réussir l'EDN : stratégie, planning et outils
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              L'Examen Dématérialisé National (EDN) remplace l'ancien ECN. Avec 367 items à maîtriser et un classement national, 
              la préparation doit être méthodique et intelligente. Ce guide vous donne la feuille de route complète.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" /> 20 min de lecture</Badge>
              <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> Mis à jour février 2026</Badge>
            </div>
          </header>

          <nav className="mb-12 p-6 bg-muted/50 rounded-xl border">
            <h2 className="font-semibold text-foreground mb-4">📋 Sommaire</h2>
            <ol className="space-y-2 text-sm">
              <li><a href="#quest-ce" className="text-primary hover:underline">1. Qu'est-ce que l'EDN ?</a></li>
              <li><a href="#items" className="text-primary hover:underline">2. Les 367 items : comment les aborder</a></li>
              <li><a href="#rang" className="text-primary hover:underline">3. Rang A vs Rang B : stratégie de priorisation</a></li>
              <li><a href="#methodes" className="text-primary hover:underline">4. Méthodes de révision scientifiquement prouvées</a></li>
              <li><a href="#planning-edn" className="text-primary hover:underline">5. Planning de révision EDN sur 12 mois</a></li>
              <li><a href="#qcm" className="text-primary hover:underline">6. Entraînement QCM : qualité vs quantité</a></li>
              <li><a href="#musique" className="text-primary hover:underline">7. La méthode musicale : réviser autrement</a></li>
              <li><a href="#faq-edn" className="text-primary hover:underline">8. FAQ</a></li>
            </ol>
          </nav>

          <section id="quest-ce" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              1. Qu'est-ce que l'EDN ?
            </h2>
            <p className="text-muted-foreground mb-4">
              L'EDN (Examen Dématérialisé National) est l'épreuve théorique du 2e cycle des études médicales. 
              Il représente <strong>70% de la note finale</strong> pour le classement national, les 30% restants étant les ECOS.
            </p>
            <p className="text-muted-foreground mb-4">
              L'examen se compose de dossiers progressifs et de questions isolées couvrant l'ensemble des 367 items 
              du programme. Chaque item est classé Rang A (indispensable) ou Rang B (approfondi).
            </p>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Chiffres clés de l'EDN :</h3>
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
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="items" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              2. Les 367 items : comment les aborder
            </h2>
            <p className="text-muted-foreground mb-4">
              367 items, c'est considérable. La clé est de ne pas les traiter de manière linéaire mais par cercles concentriques : 
              d'abord une vue d'ensemble, puis des approfondissements successifs.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Premier passage (2 mois) :</strong> Lisez chaque item une fois en vous concentrant sur les mots-clés et les tableaux 
              cliniques typiques. Utilisez les fiches synthétiques MED-MNG pour avoir l'essentiel en un coup d'œil.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Deuxième passage (2 mois) :</strong> Approfondissez avec les QCM et les cas cliniques. Identifiez vos lacunes. 
              Utilisez la répétition espacée pour consolider.
            </p>
            <p className="text-muted-foreground">
              <strong>Troisième passage (2 mois) :</strong> Révision ciblée des items faibles, simulations d'examen chronométrées, 
              et consolidation par la musique médicale.
            </p>
          </section>

          <section id="rang" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              3. Rang A vs Rang B : stratégie de priorisation
            </h2>
            <p className="text-muted-foreground mb-4">
              Le Rang A représente les connaissances indispensables que tout médecin doit maîtriser. Le Rang B va plus loin 
              et permet de départager les étudiants dans le classement.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Card className="border-success/30">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-success mb-2">Rang A — Priorité absolue</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Diagnostics et PEC des urgences</li>
                    <li>• Sémiologie fondamentale</li>
                    <li>• Thérapeutiques de première ligne</li>
                    <li>• Maîtriser à 100% avant l'examen</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-primary mb-2">Rang B — Pour le classement</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Diagnostics différentiels avancés</li>
                    <li>• Physiopathologie détaillée</li>
                    <li>• Traitements de 2e/3e ligne</li>
                    <li>• Fait la différence dans le top 30%</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="text-muted-foreground">
              <strong>Règle d'or :</strong> Ne commencez jamais le Rang B d'un item si vous ne maîtrisez pas le Rang A. 
              Sur MED-MNG, chaque item affiche clairement le contenu Rang A et Rang B séparément.
            </p>
          </section>

          <section id="methodes" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              4. Méthodes de révision scientifiquement prouvées
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Active Recall (rappel actif)</h3>
                <p>Au lieu de relire passivement, testez-vous constamment. Les flashcards et les QCM sont les outils 
                les plus efficaces pour le rappel actif. Études montrent une amélioration de 50% vs lecture passive.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Spaced Repetition (répétition espacée)</h3>
                <p>Revoyez chaque notion à intervalles croissants (J1, J3, J7, J14, J30). Le système SRS de MED-MNG 
                automatise ce processus pour vous.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Interleaving (entrelacement)</h3>
                <p>Mélangez les sujets plutôt que de réviser une spécialité pendant des jours. L'alternance force 
                votre cerveau à faire des connexions plus profondes.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Elaborative Encoding (encodage élaboré)</h3>
                <p>Reliez chaque nouvelle information à ce que vous savez déjà. Les chansons MED-MNG créent ces associations 
                automatiquement en transformant les données médicales en mélodies mémorables.</p>
              </div>
            </div>
          </section>

          <section id="planning-edn" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              5. Planning de révision EDN sur 12 mois
            </h2>
            {[
              { period: 'Trimestre 1 (M1-M3)', focus: 'Premier tour complet des 367 items Rang A. 3-4 items/jour. Flashcards quotidiennes.' },
              { period: 'Trimestre 2 (M4-M6)', focus: 'Deuxième tour + Rang B des items fréquents. QCM quotidiens. Premiers cas cliniques.' },
              { period: 'Trimestre 3 (M7-M9)', focus: 'Approfondissement Rang B. Simulations d\'examen hebdomadaires. Musique IA pour consolidation.' },
              { period: 'Trimestre 4 (M10-M12)', focus: 'Révision ciblée des points faibles. EDN blancs bi-hebdomadaires. Préparation ECOS en parallèle.' },
            ].map((t, i) => (
              <Card key={i} className="mb-3">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground text-sm">{t.period}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t.focus}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section id="qcm" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              6. Entraînement QCM : qualité vs quantité
            </h2>
            <p className="text-muted-foreground mb-4">
              Faire 10 000 QCM ne sert à rien si vous ne comprenez pas vos erreurs. La qualité prime toujours sur la quantité.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Notre recommandation :</strong> 30-50 QCM/jour avec analyse détaillée de chaque erreur. 
              Sur MED-MNG, chaque QCM est lié à un item EDN avec correction pédagogique.
            </p>
          </section>

          <section id="musique" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. La méthode musicale : réviser autrement
            </h2>
            <p className="text-muted-foreground mb-4">
              MED-MNG est la première plateforme à combiner apprentissage médical et musique IA. Chaque item EDN peut être 
              transformé en chanson, créant des associations mnémotechniques puissantes.
            </p>
            <p className="text-muted-foreground mb-4">
              Les études en neurosciences cognitives montrent que l'apprentissage musical active les deux hémisphères 
              cérébraux simultanément, améliorant la rétention de 20 à 40% par rapport à la lecture seule.
            </p>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-3">Essayez la méthode MED-MNG</h3>
                <p className="text-sm text-muted-foreground mb-4">367 items EDN + Musique IA + QCM + Cas cliniques</p>
                <Link to={ROUTE_PATHS.medMngSignup}>
                  <Button className="gap-2">Essai gratuit 7 jours <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section id="faq-edn" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. FAQ</h2>
            <Accordion type="single" collapsible>
              {[
                { q: 'Combien d\'items faut-il réviser par jour ?', a: 'Visez 3-4 items/jour en premier tour, puis 8-10 en révision. La régularité prime sur l\'intensité.' },
                { q: 'L\'EDN est-il plus dur que l\'ancien ECN ?', a: 'Le format est différent (dématérialisé, dossiers progressifs) mais le niveau de difficulté est comparable. La préparation méthodique reste la clé.' },
                { q: 'Faut-il tout apprendre par cœur ?', a: 'Non. Comprenez les mécanismes et retenez les éléments clés. Les tableaux, les scores et les critères diagnostiques doivent être maîtrisés.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Prêt à réussir l'EDN ?</h2>
            <p className="text-muted-foreground mb-6">367 items, QCM illimités, musique IA et cas cliniques sur une seule plateforme.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}><Button size="lg" className="gap-2">Commencer <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to={ROUTE_PATHS.medMngPricing}><Button variant="outline" size="lg">Voir les tarifs</Button></Link>
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
