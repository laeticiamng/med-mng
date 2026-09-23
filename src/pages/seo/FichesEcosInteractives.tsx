import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, CheckCircle, FileText, Stethoscope, MessageSquare, Pill, AlertTriangle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeeAlsoLinks } from '@/components/seo/SeeAlsoLinks';

const FichesEcosInteractives = () => {
  // Les 12 situations réellement disponibles sur /ecos (table ecos_situations_uness).
  // À mettre à jour si de nouvelles situations sont ajoutées.
  const specialties = [
    { icon: <Heart className="h-5 w-5" />, name: 'Cardiologie / Urgences', examples: ['Douleur thoracique aiguë', 'Syndrome coronarien aigu ST+', 'Polytraumatisé (accident de la voie publique)'] },
    { icon: <Stethoscope className="h-5 w-5" />, name: 'Neurologie / Gériatrie', examples: ['AVC ischémique en phase aiguë', 'Personne âgée confuse aux urgences'] },
    { icon: <FileText className="h-5 w-5" />, name: 'Pédiatrie', examples: ['Enfant avec fièvre et éruption cutanée', 'Allergie alimentaire sévère chez l\'enfant'] },
    { icon: <MessageSquare className="h-5 w-5" />, name: 'Psychiatrie', examples: ['Adolescent avec idées suicidaires', 'Dépression du post-partum'] },
    { icon: <AlertTriangle className="h-5 w-5" />, name: 'Obstétrique', examples: ['Femme enceinte avec contractions prématurées'] },
    { icon: <Pill className="h-5 w-5" />, name: 'Autres', examples: ['Patient diabétique avec pied infecté', 'Colique néphrétique hyperalgique'] },
  ];

  return (
    <>
      <SEOHead
        title="Situations ECOS guidées gratuites – Préparation médecine | MED-MNG"
        description="12 situations ECOS guidées et gratuites pour préparer l'examen clinique : déroulé pas à pas, chronomètre et grille d'auto-évaluation."
        keywords="fiches ECOS, fiches interactives médecine, ECOS cardiologie, fiches révision ECOS gratuites"
        canonical="/fiches-ecos-interactives"
      />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Gratuit avec un compte</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Situations ECOS guidées : entraînez-vous station par station
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              12 situations ECOS issues du référentiel, avec un déroulé guidé (je questionne, j'examine, je conclus),
              un chronomètre et une grille d'auto-évaluation. Préparez chaque station avec méthode.
            </p>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Pourquoi des situations guidées ?</h2>
            <p className="text-muted-foreground mb-4">
              Relire une fiche ne prépare pas à parler à un patient. Nos situations vous font dérouler la station
              étape par étape, puis vous comparez votre démarche à une grille d'auto-évaluation.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { title: 'Guidé', desc: 'Déroulé étape par étape' },
                { title: 'Chronomètre', desc: 'Pour s\'habituer au temps limité' },
                { title: 'Auto-évaluation', desc: 'Grille de critères génériques à cocher' },
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
            <h2 className="text-2xl font-bold text-foreground mb-6">Les 12 situations disponibles</h2>
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
              <p><strong>Étape 3 :</strong> Remplissez la grille d'auto-évaluation. Identifiez vos points forts et vos lacunes.</p>
              <p><strong>Étape 4 :</strong> Révisez les notions manquantes avec les items EDN correspondants (fiche, rang A, rang B, paroles).</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Exemple de situation : douleur thoracique</h2>
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
                  <h3 className="font-semibold text-foreground text-sm mb-1">Dimensions travaillées</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Interrogatoire', 'Examen clinique', 'Prise en charge', 'Communication'].map(c => (
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
                { q: 'Les situations ECOS sont-elles gratuites ?', a: 'Oui, les situations ECOS sont accessibles gratuitement.' },
                { q: 'Combien de situations ECOS sont disponibles ?', a: '12 situations sont disponibles pour l\'instant.' },
                { q: 'Les situations sont-elles officielles ?', a: 'Elles s\'inspirent des situations de départ du référentiel. La grille d\'auto-évaluation utilise des critères génériques : ce n\'est pas la grille officielle de la station.' },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="text-center p-8 bg-primary/5 rounded-xl border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">Accédez aux situations ECOS</h2>
            <p className="text-muted-foreground mb-6">Déroulé guidé, chronomètre, grille d'auto-évaluation et historique de vos tentatives.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}><Button size="lg" className="gap-2">Créer un compte gratuit <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to={ROUTE_PATHS.ecosIndex}><Button variant="outline" size="lg">Voir les ECOS</Button></Link>
            </div>
          </div>
          <SeeAlsoLinks currentPath="/fiches-ecos-interactives" />
        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default FichesEcosInteractives;
