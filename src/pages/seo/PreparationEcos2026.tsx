import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, BookOpen, Clock, Target, CheckCircle, Stethoscope, Brain, Calendar, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeeAlsoLinks } from '@/components/seo/SeeAlsoLinks';
import { TranslatedText } from '@/components/TranslatedText';

const PreparationEcos2026 = () => {
  return (
    <>
      <SEOHead
        title="Comment préparer les ECOS 2026 – Guide complet | MED-MNG"
        description="Guide complet pour réussir les ECOS 2026. Stratégies, planning, fiches interactives et simulation. Préparez-vous efficacement avec MED-MNG."
        keywords="ECOS 2026, préparation ECOS, réussir ECOS, examen clinique objectif structuré, médecine, étudiant"
        canonical="/preparation-ecos-2026"
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          {/* Hero */}
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4"><TranslatedText text="Guide 2026" /></Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              <TranslatedText text="Comment préparer les ECOS 2026 : le guide complet pour réussir" />
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              <TranslatedText text="Les ECOS (Examens Cliniques Objectifs Structurés) sont l'épreuve décisive du 2e cycle des études médicales. Ce guide vous donne toutes les clés pour vous y préparer efficacement, avec un planning structuré et des outils interactifs." />
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> <TranslatedText text="15 min de lecture" /></Badge>
              <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> <TranslatedText text="Mis à jour février 2026" /></Badge>
            </div>
          </header>

          {/* Table of contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-xl border">
            <h2 className="font-semibold text-foreground mb-4">📋 <TranslatedText text="Sommaire" /></h2>
            <ol className="space-y-2 text-sm">
              <li><a href="#comprendre" className="text-primary hover:underline"><TranslatedText text="1. Comprendre les ECOS : format, notation, enjeux" /></a></li>
              <li><a href="#competences" className="text-primary hover:underline"><TranslatedText text="2. Les 11 compétences évaluées" /></a></li>
              <li><a href="#planning" className="text-primary hover:underline"><TranslatedText text="3. Planning de révision sur 6 mois" /></a></li>
              <li><a href="#strategies" className="text-primary hover:underline"><TranslatedText text="4. Stratégies de préparation efficaces" /></a></li>
              <li><a href="#erreurs" className="text-primary hover:underline"><TranslatedText text="5. Les erreurs à éviter absolument" /></a></li>
              <li><a href="#simulation" className="text-primary hover:underline"><TranslatedText text="6. L'importance des simulations" /></a></li>
              <li><a href="#outils" className="text-primary hover:underline"><TranslatedText text="7. Outils et ressources recommandés" /></a></li>
              <li><a href="#faq" className="text-primary hover:underline">8. FAQ</a></li>
            </ol>
          </nav>

          {/* Section 1 */}
          <section id="comprendre" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <TranslatedText text="1. Comprendre les ECOS : format, notation, enjeux" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Les ECOS constituent une épreuve pratique où l'étudiant est évalué dans des situations cliniques simulées. Chaque station dure entre 7 et 15 minutes et simule une consultation, un geste technique, une annonce diagnostique ou une prise en charge d'urgence." />
            </p>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Depuis la réforme du 2e cycle, les ECOS représentent 30% de la note finale pour le classement national. C'est une épreuve qui ne s'improvise pas : elle exige une préparation méthodique, régulière, et orientée compétences." />
            </p>
            <Card className="mb-4">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3"><TranslatedText text="Format type d'une session ECOS :" /></h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> <TranslatedText text="10 stations de 7 à 15 minutes" /></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> <TranslatedText text="Patient standardisé (acteur formé)" /></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> <TranslatedText text="Grille d'évaluation par compétence" /></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> <TranslatedText text="Notation sur check-list + impression globale" /></li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5" /> <TranslatedText text="Aucune pause entre les stations" /></li>
                </ul>
              </CardContent>
            </Card>
            <p className="text-muted-foreground">
              <TranslatedText text="L'enjeu est double : maîtriser le contenu médical ET la communication. Un étudiant techniquement excellent mais qui ne structure pas son entretien ou ne rassure pas le patient perdra des points précieux." />
            </p>
          </section>

          {/* Section 2 */}
          <section id="competences" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <TranslatedText text="2. Les 11 compétences évaluées aux ECOS" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Les ECOS évaluent des compétences transversales, pas uniquement des connaissances. Voici les 11 compétences du référentiel de compétences médicales :" />
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                'Clinicien : anamnèse et examen physique',
                'Communicateur : relation médecin-patient',
                'Collaborateur : travail en équipe',
                'Leader & gestionnaire : organisation des soins',
                'Promoteur de la santé : prévention',
                'Érudit : raisonnement clinique',
                'Professionnel : éthique et déontologie',
                'Annonce diagnostique et pronostique',
                'Prescription et ordonnance',
                'Urgences et situations critiques',
                'Éducation thérapeutique du patient',
              ].map((comp, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm"><TranslatedText text={comp} /></span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground">
              <TranslatedText text="Chaque station ECOS cible 2 à 4 compétences. Votre préparation doit couvrir toutes ces dimensions, pas seulement le savoir théorique. Sur MED-MNG, chaque cas clinique est noté par compétence pour vous permettre d'identifier précisément vos lacunes." />
            </p>
          </section>

          {/* Section 3 */}
          <section id="planning" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <TranslatedText text="3. Planning de révision sur 6 mois" />
            </h2>
            <p className="text-muted-foreground mb-6">
              <TranslatedText text="Un planning structuré est la clé du succès. Voici notre recommandation basée sur les retours de centaines d'étudiants :" />
            </p>
            
            {[
              { period: 'Mois 1-2 : Fondations', tasks: ['Réviser les 367 items EDN (Rang A prioritaire)', 'Maîtriser l\'anamnèse structurée (SOCRATES, OLDCARTS)', 'Pratiquer 2 cas cliniques/semaine', '1 session musique MED-MNG/jour pour la mémorisation active'] },
              { period: 'Mois 3-4 : Approfondissement', tasks: ['Compléter les items Rang B', 'Augmenter à 4-5 cas cliniques/semaine', 'Commencer les simulations ECOS chronométrées', 'Travailler spécifiquement l\'annonce diagnostique'] },
              { period: 'Mois 5 : Simulation intensive', tasks: ['1 ECOS blanc complet/semaine (10 stations)', 'Analyse des scores par compétence', 'Révision ciblée des points faibles identifiés', 'Travail en binôme avec un camarade'] },
              { period: 'Mois 6 : Consolidation', tasks: ['2 ECOS blancs/semaine', 'Révision flash des items critiques', 'Gestion du stress et techniques de relaxation', 'Simulation en conditions réelles (timer strict)'] },
            ].map((phase, i) => (
              <Card key={i} className="mb-4">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3"><TranslatedText text={phase.period} /></h3>
                  <ul className="space-y-2">
                    {phase.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <TranslatedText text={task} />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Section 4 */}
          <section id="strategies" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <TranslatedText text="4. Stratégies de préparation efficaces" />
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="La méthode SOAP pour structurer chaque station" /></h3>
                <p><TranslatedText text="Subjective (motif, anamnèse) → Objective (examen physique) → Assessment (diagnostic) → Plan (prise en charge). Cette structure vous permet de ne rien oublier et d'être systématique." /></p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="L'apprentissage par la musique (méthode MED-MNG)" /></h3>
                <p><TranslatedText text="Les neurosciences montrent que la musique améliore la rétention mémorielle de 20 à 40%. MED-MNG transforme chaque item EDN en chanson médicale, permettant une révision active même pendant vos déplacements." /></p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="La répétition espacée (SRS)" /></h3>
                <p><TranslatedText text="Revoyez chaque item à des intervalles croissants : J+1, J+3, J+7, J+14, J+30. Cette technique scientifiquement prouvée optimise la consolidation en mémoire à long terme." /></p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2"><TranslatedText text="Le travail en binôme" /></h3>
                <p><TranslatedText text="Simulez des stations ECOS avec un camarade. L'un joue le médecin, l'autre le patient. Alternez les rôles. C'est la méthode la plus efficace pour progresser en communication." /></p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="erreurs" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <TranslatedText text="5. Les erreurs à éviter absolument" />
            </h2>
            <div className="space-y-3">
              {[
                'Ne pas chronométrer ses entraînements — le timing est crucial le jour J',
                'Négliger la communication — elle représente 30-40% de la note',
                'Réviser uniquement la théorie sans pratiquer de cas cliniques',
                'Commencer trop tard — les ECOS se préparent sur 6 mois minimum',
                'Ne pas analyser ses erreurs — sans feedback, pas de progression',
                'Sous-estimer le stress — pratiquez en conditions réelles',
              ].map((err, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <span className="text-destructive font-bold">✗</span>
                  <span className="text-sm text-muted-foreground"><TranslatedText text={err} /></span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6 */}
          <section id="simulation" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <TranslatedText text="6. L'importance des simulations" />
            </h2>
            <p className="text-muted-foreground mb-4">
              <TranslatedText text="Les étudiants qui réalisent au moins 5 ECOS blancs complets avant l'épreuve ont un taux de réussite supérieur de 35% (source : étude CNCI 2024). La simulation est le meilleur prédicteur de performance." />
            </p>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3"><TranslatedText text="Simuler sur MED-MNG :" /></h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ <TranslatedText text="10 stations chronométrées sans pause" /></li>
                  <li>✓ <TranslatedText text="Score détaillé par compétence ECOS" /></li>
                  <li>✓ <TranslatedText text="Percentile national simulé" /></li>
                  <li>✓ <TranslatedText text="Feedback structuré après chaque station" /></li>
                  <li>✓ <TranslatedText text="Historique pour suivre votre progression" /></li>
                </ul>
                <Link to={ROUTE_PATHS.examMode}>
                  <Button className="mt-4 gap-2">
                    <TranslatedText text="Lancer une simulation ECOS" /> <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* Section 7 */}
          <section id="outils" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <TranslatedText text="7. Outils et ressources recommandés" />
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: 'MED-MNG', desc: 'Plateforme complète : EDN, ECOS, cas cliniques, musique IA', link: ROUTE_PATHS.home },
                { name: 'Référentiel SIDES', desc: 'Cours officiels par spécialité', link: null },
                { name: 'Collèges de spécialité', desc: 'Référentiels pédagogiques nationaux', link: null },
                { name: 'Annales ECOS', desc: 'Sujets des années précédentes', link: null },
              ].map((tool, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm text-foreground"><TranslatedText text={tool.name} /></h3>
                    <p className="text-xs text-muted-foreground mt-1"><TranslatedText text={tool.desc} /></p>
                    {tool.link && (
                      <Link to={tool.link}>
                        <Button variant="link" size="sm" className="px-0 mt-1 h-auto text-xs">
                          <TranslatedText text="Découvrir" /> <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4"><TranslatedText text="8. Questions fréquentes" /></h2>
            <Accordion type="single" collapsible>
              {[
                { q: 'Combien de temps faut-il pour préparer les ECOS ?', a: 'Nous recommandons un minimum de 6 mois de préparation régulière, avec une intensification les 2 derniers mois.' },
                { q: 'Les ECOS comptent-ils pour le classement ?', a: 'Oui, depuis la réforme, les ECOS représentent 30% de la note finale pour le classement national des étudiants en médecine.' },
                { q: 'Peut-on préparer les ECOS seul ?', a: 'C\'est possible avec des outils comme MED-MNG qui simulent les stations, mais le travail en binôme reste fortement recommandé pour la dimension communication.' },
                { q: 'Quelles spécialités tombent le plus souvent ?', a: 'Cardiologie, pneumologie, urgences, pédiatrie et gynécologie sont les plus fréquentes. Mais toutes les spécialités peuvent tomber.' },
                { q: 'Comment gérer le stress le jour J ?', a: 'Techniques de respiration, visualisation positive, et surtout : être bien préparé. La confiance vient de la pratique répétée.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left"><TranslatedText text={faq.q} /></AccordionTrigger>
                  <AccordionContent className="text-muted-foreground"><TranslatedText text={faq.a} /></AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3"><TranslatedText text="Prêt à préparer les ECOS 2026 ?" /></h2>
            <p className="text-muted-foreground mb-6">
              <TranslatedText text="Rejoignez MED-MNG et accédez à des simulations ECOS complètes, des cas cliniques et de la musique médicale IA." />
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2"><TranslatedText text="Essai gratuit 7 jours" /> <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to={ROUTE_PATHS.medMngPricing}>
                <Button variant="outline" size="lg"><TranslatedText text="Voir les tarifs" /></Button>
              </Link>
            </div>
          </div>

          {/* JSON-LD FAQ Schema */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "Combien de temps faut-il pour préparer les ECOS ?", "acceptedAnswer": { "@type": "Answer", "text": "Nous recommandons un minimum de 6 mois de préparation régulière." }},
              { "@type": "Question", "name": "Les ECOS comptent-ils pour le classement ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui, les ECOS représentent 30% de la note finale pour le classement national." }},
            ]
          })}} />
          <SeeAlsoLinks currentPath="/preparation-ecos-2026" />
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default PreparationEcos2026;
