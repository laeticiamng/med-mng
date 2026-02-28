import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, Stethoscope, AlertTriangle, CheckCircle, Clock, Target, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExempleCasClinique = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Exemple de cas clinique interactif — Douleur thoracique aiguë",
    "description": "Cas clinique gratuit : patient de 55 ans avec douleur thoracique. Raisonnement clinique, diagnostic différentiel, prise en charge. Corrigé détaillé.",
    "author": { "@type": "Organization", "name": "MED-MNG" },
    "datePublished": "2026-02-28"
  };

  return (
    <>
      <SEOHead
        title="Exemple cas clinique gratuit — Douleur thoracique | MED-MNG"
        description="Cas clinique interactif gratuit : douleur thoracique aiguë chez un homme de 55 ans. Raisonnement clinique, diagnostic différentiel, prise en charge. Correction détaillée."
        keywords="cas clinique gratuit, douleur thoracique, cas clinique médecine, EDN cas clinique, ECOS exemple"
        canonical="/exemple-cas-clinique"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Cas clinique gratuit</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Cas clinique : Douleur thoracique aiguë
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Testez votre raisonnement clinique sur ce cas complet avec correction détaillée. 
              Ce type de cas est représentatif de ce que vous rencontrerez à l'EDN et aux ECOS.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> 20 min</Badge>
              <Badge variant="outline" className="gap-1"><Stethoscope className="h-3 w-3" /> Cardiologie</Badge>
              <Badge className="bg-primary text-primary-foreground">Rang A</Badge>
            </div>
          </header>

          {/* Énoncé */}
          <section className="mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Présentation du patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  <strong>M. Bernard D., 55 ans</strong>, est adressé aux urgences par son médecin traitant pour une 
                  <strong> douleur thoracique</strong> évoluant depuis 2 heures.
                </p>
                <div>
                  <p className="font-semibold mb-1">Antécédents :</p>
                  <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                    <li>HTA traitée depuis 10 ans (Amlodipine 5mg)</li>
                    <li>Diabète de type 2 (Metformine 1000mg × 2/j)</li>
                    <li>Tabagisme actif : 30 paquets-années</li>
                    <li>Dyslipidémie non traitée (LDL 1,8 g/L)</li>
                    <li>Père décédé d'un IDM à 52 ans</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">Histoire de la maladie :</p>
                  <p className="text-muted-foreground">
                    Douleur rétrosternale constrictive, irradiant au bras gauche et à la mâchoire, 
                    apparue brutalement au repos il y a 2 heures. Nausées sans vomissements. 
                    Sueurs profuses. Anxiété majeure. Prise de trinitrine sublinguale sans amélioration.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Examen clinique :</p>
                  <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                    <li>PA : 150/95 mmHg, FC : 95 bpm, FR : 22/min, SpO2 : 96% AA</li>
                    <li>T° : 37,2°C</li>
                    <li>Auscultation cardiaque : B1B2 réguliers, souffle systolique 2/6 apex</li>
                    <li>Auscultation pulmonaire : quelques crépitants basaux bilatéraux</li>
                    <li>Pas de signes de TVP</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Questions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">📝 Questions</h2>
            <div className="space-y-4">
              {[
                "Quel est votre diagnostic principal ? Justifiez.",
                "Quels examens complémentaires demandez-vous en urgence ?",
                "Quel est votre diagnostic différentiel ?",
                "Décrivez votre prise en charge immédiate."
              ].map((q, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-4">
                    <p className="font-medium text-foreground">Question {i + 1} : {q}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Correction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">✅ Correction détaillée</h2>
            
            <div className="space-y-6">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-3">1. Diagnostic principal : Syndrome coronarien aigu ST+ (STEMI)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Douleur rétrosternale typique constrictive</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Irradiation bras gauche + mâchoire</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Résistante à la trinitrine</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> FdR CV majeurs : HTA, diabète, tabac, dyslipidémie, ATCD familiaux</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Signes végétatifs associés (nausées, sueurs)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-3">2. Examens complémentaires urgents</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> <strong>ECG 18 dérivations</strong> en urgence ({'<'} 10 min)</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> <strong>Troponine Hs</strong> (T0 et T3h)</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Bilan biologique : NFS, ionogramme, créatinine, glycémie, CRP</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Radiographie thoracique (OAP associé ?)</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> BNP/NT-proBNP (insuffisance cardiaque ?)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-3">3. Diagnostic différentiel</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" /> <strong>Embolie pulmonaire</strong> (dyspnée, tachycardie, mais pas de TVP)</li>
                    <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" /> <strong>Dissection aortique</strong> (douleur migratrice, asymétrie tensionnelle ?)</li>
                    <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" /> <strong>Péricardite aiguë</strong> (fièvre, frottement péricardique ?)</li>
                    <li className="flex gap-2"><AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" /> <strong>Pneumothorax</strong> (asymétrie auscultatoire ?)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-3">4. Prise en charge immédiate</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Monitoring continu + voie veineuse</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Oxygénothérapie si SpO2 {'<'} 95%</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Aspirine 250-300 mg IV ou PO</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Anticoagulation : Héparine IV</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Morphine titrée si douleur persistante</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> <strong>Reperfusion coronaire en urgence</strong> : angioplastie primaire (idéal {'<'} 2h) ou thrombolyse</li>
                    <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" /> Appel cardiologue interventionnel + SAMU</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Score par compétence */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Grille de notation ECOS
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {[
                    { competence: "Raisonnement clinique", poids: "30%", critere: "Diagnostic justifié avec arguments" },
                    { competence: "Examens complémentaires", poids: "20%", critere: "ECG + troponine + bilan en urgence" },
                    { competence: "Diagnostic différentiel", poids: "15%", critere: "Au moins 3 diagnostics avec arguments" },
                    { competence: "Prise en charge", poids: "25%", critere: "Traitement complet et hiérarchisé" },
                    { competence: "Communication", poids: "10%", critere: "Information du patient, consentement" },
                  ].map((item) => (
                    <div key={item.competence} className="flex items-center gap-4 text-sm">
                      <Badge variant="outline" className="min-w-[50px] justify-center">{item.poids}</Badge>
                      <div>
                        <p className="font-medium text-foreground">{item.competence}</p>
                        <p className="text-xs text-muted-foreground">{item.critere}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Premium */}
          <section className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <Lock className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Accédez aux 20+ cas cliniques premium</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Cas cliniques interactifs avec correction par compétence ECOS, score comparatif et recommandations personnalisées.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2">Essai gratuit 7 jours <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to={ROUTE_PATHS.medMngPricing}>
                <Button variant="outline" size="lg">Voir les tarifs</Button>
              </Link>
            </div>
          </section>

          {/* Articles liés */}
          <section className="mt-12 mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">📚 Articles liés</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Travailler les cas cliniques", path: "/travailler-cas-cliniques" },
                { title: "Erreurs fréquentes ECOS", path: "/erreurs-frequentes-ecos" },
                { title: "Cas cliniques EDN", path: ROUTE_PATHS.seoCasCliniqueEdn },
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

        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default ExempleCasClinique;
