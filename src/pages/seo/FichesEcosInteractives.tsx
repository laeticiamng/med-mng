import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, CheckCircle, FileText, Stethoscope, MessageSquare, Pill, AlertTriangle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FichesEcosInteractives = () => {
  const specialties = [
    { icon: <Heart className="h-5 w-5" />, name: 'Cardiologie', examples: ['Douleur thoracique', 'Insuffisance cardiaque', 'HTA résistante'] },
    { icon: <Stethoscope className="h-5 w-5" />, name: 'Pneumologie', examples: ['Dyspnée aiguë', 'Asthme', 'Pneumothorax'] },
    { icon: <AlertTriangle className="h-5 w-5" />, name: 'Urgences', examples: ['Arrêt cardiaque', 'Choc septique', 'AVC'] },
    { icon: <MessageSquare className="h-5 w-5" />, name: 'Psychiatrie', examples: ['Annonce diagnostique', 'Risque suicidaire', 'Trouble anxieux'] },
    { icon: <Pill className="h-5 w-5" />, name: 'Pharmacologie', examples: ['Prescription sécurisée', 'Interactions', 'Iatrogénie'] },
    { icon: <FileText className="h-5 w-5" />, name: 'Pédiatrie', examples: ['Fièvre du nourrisson', 'Bronchiolite', 'Vaccination'] },
  ];

  return (
    <>
      <SEOHead
        title="Fiches ECOS interactives gratuites – Préparation médecine | MED-MNG"
        description="Fiches ECOS interactives pour préparer l'examen clinique. Cardiologie, pneumologie, urgences, pédiatrie. Cas cliniques avec scoring par compétence."
        keywords="fiches ECOS, fiches interactives médecine, ECOS cardiologie, fiches révision ECOS gratuites"
        canonical="/fiches-ecos-interactives"
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Ressources gratuites</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Fiches ECOS interactives : révisez par spécialité
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Des fiches de révision ECOS structurées par spécialité, avec cas cliniques interactifs et notation 
              par compétence. Préparez chaque station avec méthode.
            </p>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pourquoi des fiches interactives ?</h2>
            <p className="text-muted-foreground mb-4">
              Les fiches papier classiques sont passives. Nos fiches ECOS interactives vous mettent en situation : 
              vous devez répondre, prescrire, annoncer un diagnostic. Chaque action est évaluée sur les compétences ECOS.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { title: 'Interactif', desc: 'Répondez aux questions comme le jour J' },
                { title: 'Scoring', desc: 'Note par compétence ECOS en temps réel' },
                { title: 'Feedback', desc: 'Correction détaillée après chaque fiche' },
              ].map((f, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Fiches par spécialité</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {specialties.map((spec, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">{spec.icon}</div>
                      <h3 className="font-semibold text-foreground">{spec.name}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {spec.examples.map((ex, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" /> {ex}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Comment utiliser les fiches ECOS MED-MNG</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong>Étape 1 :</strong> Choisissez une spécialité et un cas clinique. Lisez la vignette clinique comme le jour de l'examen.</p>
              <p><strong>Étape 2 :</strong> Répondez aux questions (anamnèse, examen physique, hypothèses diagnostiques, examens complémentaires, PEC).</p>
              <p><strong>Étape 3 :</strong> Consultez votre score détaillé par compétence ECOS. Identifiez vos points forts et vos lacunes.</p>
              <p><strong>Étape 4 :</strong> Révisez les notions manquantes avec les items EDN correspondants et les chansons MED-MNG.</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Exemple de fiche ECOS : Douleur thoracique</h2>
            <Card className="bg-muted/30">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">Vignette clinique</h3>
                  <p className="text-sm text-muted-foreground">
                    M. Dupont, 58 ans, se présente aux urgences pour une douleur thoracique rétrosternale constrictive 
                    irradiant dans le bras gauche, apparue il y a 2 heures au repos. ATCD : HTA traitée, tabagisme actif, 
                    dyslipidémie. PA 160/95, FC 92, SpO2 96%.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">Compétences évaluées</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Clinicien', 'Communicateur', 'Prescripteur', 'Urgentiste'].map(c => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">Questions attendues</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Quels éléments de l'anamnèse recherchez-vous ?</li>
                    <li>2. Quel examen physique réalisez-vous ?</li>
                    <li>3. Quels examens complémentaires demandez-vous en urgence ?</li>
                    <li>4. Quelle prise en charge immédiate initiez-vous ?</li>
                    <li>5. Comment informez-vous le patient ?</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">FAQ</h2>
            <Accordion type="single" collapsible>
              {[
                { q: 'Les fiches ECOS sont-elles gratuites ?', a: 'Les fiches découverte sont gratuites. L\'accès complet avec scoring et feedback détaillé est disponible avec le plan Pro à 19€/mois (essai gratuit 7 jours).' },
                { q: 'Combien de fiches ECOS sont disponibles ?', a: 'MED-MNG propose des fiches pour toutes les spécialités du programme, couvrant les cas les plus fréquents aux ECOS.' },
                { q: 'Les fiches sont-elles conformes au programme officiel ?', a: 'Oui, toutes nos fiches sont alignées sur le référentiel de compétences ECOS et les 367 items du programme EDN.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Accédez à toutes les fiches ECOS</h2>
            <p className="text-muted-foreground mb-6">Scoring par compétence, feedback détaillé, progression suivie.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}><Button size="lg" className="gap-2">Essai gratuit 7 jours <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to={ROUTE_PATHS.ecosIndex}><Button variant="outline" size="lg">Voir les ECOS</Button></Link>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default FichesEcosInteractives;
