import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, CheckCircle, Stethoscope, Brain, FileText, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const CasCliniqueEdn = () => {
  return (
    <>
      <SEOHead
        title="Cas cliniques corrigés pour l'EDN – Entraînement médecine | MED-MNG"
        description="Cas cliniques corrigés pour l'EDN et les ECOS. Dossiers progressifs, scoring par compétence, correction détaillée. Préparez-vous efficacement."
        keywords="cas cliniques EDN, dossiers progressifs médecine, cas cliniques corrigés, entraînement médecine, ECOS cas cliniques"
        canonical="/cas-cliniques-edn"
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Entraînement premium</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Cas cliniques corrigés pour l'EDN : entraînez-vous comme un pro
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Des dossiers progressifs réalistes avec correction détaillée, scoring par compétence et liens vers les items EDN. 
              La méthode la plus efficace pour progresser en raisonnement clinique.
            </p>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Pourquoi les cas cliniques sont indispensables
            </h2>
            <p className="text-muted-foreground mb-4">
              L'EDN ne teste pas uniquement des connaissances isolées. Les dossiers progressifs évaluent votre capacité 
              à raisonner cliniquement : partir d'un motif de consultation, évoquer des hypothèses, demander les bons 
              examens, poser un diagnostic et proposer une PEC adaptée.
            </p>
            <p className="text-muted-foreground mb-4">
              Les étudiants qui s'entraînent régulièrement sur des cas cliniques développent des réflexes diagnostiques 
              qui font la différence le jour de l'examen. C'est la méthode privilégiée par les majors de promo.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Structure d'un cas clinique MED-MNG</h2>
            <div className="space-y-4">
              {[
                { icon: <FileText className="h-5 w-5" />, title: 'Présentation clinique', desc: 'Vignette réaliste avec antécédents, motif de consultation, constantes, examen physique.' },
                { icon: <Brain className="h-5 w-5" />, title: 'Raisonnement diagnostique', desc: 'Questions progressives : hypothèses diagnostiques, examens complémentaires, interprétation des résultats.' },
                { icon: <Stethoscope className="h-5 w-5" />, title: 'Prise en charge', desc: 'Traitement, prescription, mesures associées, suivi, éducation thérapeutique.' },
                { icon: <Award className="h-5 w-5" />, title: 'Score & feedback', desc: 'Notation par compétence ECOS, correction pédagogique détaillée, liens vers items EDN.' },
              ].map((s, i) => (
                <Card key={i}>
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">{s.icon}</div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Spécialités couvertes</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                'Cardiologie', 'Pneumologie', 'Gastro-entérologie', 'Neurologie', 'Endocrinologie',
                'Néphrologie', 'Rhumatologie', 'Dermatologie', 'Pédiatrie', 'Gynécologie',
                'Psychiatrie', 'Urgences', 'Infectiologie', 'Hématologie', 'ORL',
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  <span className="text-sm">{spec}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Exemple de cas clinique</h2>
            <Card className="bg-muted/30">
              <CardContent className="p-6 space-y-4">
                <Badge>Cardiologie — Niveau intermédiaire</Badge>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">Dossier n°1 — Mme Martin, 72 ans</h3>
                  <p className="text-sm text-muted-foreground">
                    Mme Martin, 72 ans, consulte pour des dyspnées d'effort progressives depuis 3 mois. 
                    Elle est essoufflée à la montée d'un étage. ATCD : HTA depuis 15 ans, diabète de type 2, 
                    hypercholestérolémie. Traitements : ramipril 5mg, metformine 1000mg x2, atorvastatine 40mg. 
                    PA 145/85, FC 88 irrégulier, SpO2 94%, IMC 31. À l'auscultation : crépitants bilatéraux aux bases, 
                    souffle systolique 3/6 au foyer mitral. OMI bilatéraux prenant le godet.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">Questions progressives</h3>
                  <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Quel est votre diagnostic syndromique principal ? Justifiez.</li>
                    <li>Quels examens complémentaires demandez-vous en première intention ?</li>
                    <li>L'ECG montre une ACFA à 88/min. Quelle est votre attitude thérapeutique immédiate ?</li>
                    <li>Le BNP revient à 1200 pg/mL. Quelle prise en charge instaurez-vous ?</li>
                    <li>Quels éléments d'éducation thérapeutique délivrez-vous à la patiente ?</li>
                  </ol>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">Items EDN : 232, 234, 236</Badge>
                  <Badge variant="outline" className="text-xs">Compétences : Clinicien, Prescripteur, Éducateur</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Conseils pour progresser</h2>
            <div className="space-y-3">
              {[
                'Faites au moins 3-4 cas cliniques par semaine pendant les 6 derniers mois',
                'Chronométrez-vous : un dossier EDN dure environ 15-20 minutes',
                'Analysez chaque erreur et reliez-la à l\'item EDN correspondant',
                'Variez les spécialités — ne restez pas dans votre zone de confort',
                'Refaites les cas ratés après 2-3 semaines pour consolider',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">FAQ</h2>
            <Accordion type="single" collapsible>
              {[
                { q: 'Combien de cas cliniques sont disponibles ?', a: 'MED-MNG propose des dizaines de cas cliniques couvrant toutes les spécialités du programme EDN, avec de nouveaux cas ajoutés régulièrement.' },
                { q: 'Les corrections sont-elles détaillées ?', a: 'Oui, chaque cas inclut une correction pédagogique complète avec références aux items EDN, scoring par compétence et pièges à éviter.' },
                { q: 'Puis-je créer mes propres cas cliniques ?', a: 'Avec le plan Premium, vous pouvez utiliser l\'IA MED-MNG pour générer des cas cliniques personnalisés sur les sujets de votre choix.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Accédez aux cas cliniques</h2>
            <p className="text-muted-foreground mb-6">Dossiers progressifs, correction détaillée, scoring par compétence.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.clinicalCases}><Button size="lg" className="gap-2">Voir les cas cliniques <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to={ROUTE_PATHS.medMngPricing}><Button variant="outline" size="lg">Voir les tarifs</Button></Link>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default CasCliniqueEdn;
