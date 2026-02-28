import { SEOHead } from '@/components/seo/SEOHead';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ROUTE_PATHS } from '@/config/routes';
import { ArrowRight, BookOpen, Calendar, Stethoscope, Brain, CheckCircle, ClipboardList, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const TravaillerCasCliniques = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Comment travailler les cas cliniques efficacement pour l'EDN",
    "description": "Méthode structurée pour réussir les cas cliniques : raisonnement clinique, dossiers progressifs, grilles ECOS. Guide complet avec exemples.",
    "author": { "@type": "Organization", "name": "MED-MNG" },
    "datePublished": "2026-02-28",
    "dateModified": "2026-02-28"
  };

  return (
    <>
      <SEOHead
        title="Travailler les cas cliniques EDN efficacement | MED-MNG"
        description="Méthode structurée pour réussir les cas cliniques EDN et ECOS : raisonnement clinique, dossiers progressifs, grilles de notation. Guide pratique."
        keywords="cas cliniques EDN, dossier progressif, raisonnement clinique, ECOS cas clinique, méthode révision"
        canonical="/travailler-cas-cliniques"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-20 max-w-4xl">
          
          <header className="mb-12">
            <Badge variant="secondary" className="mb-4">Méthode de révision</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Comment travailler les cas cliniques efficacement
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Les cas cliniques représentent une part majeure de l'EDN et la totalité des ECOS. 
              Voici une méthode structurée pour les travailler efficacement et maximiser vos points.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" /> 15 min de lecture</Badge>
              <Badge variant="outline" className="gap-1"><Calendar className="h-3 w-3" /> Février 2026</Badge>
            </div>
          </header>

          {/* Pourquoi */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Pourquoi les cas cliniques sont essentiels
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-2">40%</p>
                  <p className="text-sm text-muted-foreground">du classement EDN vient des ECOS (cas cliniques pratiques)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-2">60%</p>
                  <p className="text-sm text-muted-foreground">des QCM EDN sont contextualisés dans des dossiers cliniques</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold text-primary mb-2">10</p>
                  <p className="text-sm text-muted-foreground">stations ECOS de 15 min avec patient simulé</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Méthode */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              La méthode en 5 étapes
            </h2>
            <div className="space-y-6">
              {[
                {
                  titre: "1. Lire l'énoncé en mode « médecin »",
                  contenu: "Ne lisez pas comme un étudiant qui cherche la bonne réponse. Lisez comme un médecin face à un patient. Identifiez : âge, sexe, motif de consultation, antécédents, traitements. Formulez vos hypothèses avant de lire les questions."
                },
                {
                  titre: "2. Structurer le raisonnement clinique",
                  contenu: "Utilisez systématiquement : Syndrome → Étiologies → Arguments pour/contre → Examens complémentaires → Diagnostic retenu → Prise en charge. Ce schéma est valorisé dans toutes les grilles de notation."
                },
                {
                  titre: "3. Rédiger comme pour un dossier médical",
                  contenu: "Pour les QROC et les ECOS, structurez vos réponses comme un compte-rendu médical. Utilisez les termes sémiologiques précis. Évitez les abréviations non standard. Soyez systématique."
                },
                {
                  titre: "4. Analyser ses erreurs en profondeur",
                  contenu: "Après chaque cas, analysez : Ai-je manqué un diagnostic différentiel ? Ai-je oublié un examen complémentaire ? Mon raisonnement était-il structuré ? Notez vos erreurs récurrentes par spécialité."
                },
                {
                  titre: "5. Répéter avec espacement croissant",
                  contenu: "Revoyez les cas ratés à J+3, J+7, J+21. La répétition espacée (SRS) est la méthode la plus efficace pour ancrer le raisonnement clinique dans la mémoire à long terme."
                }
              ].map((etape) => (
                <Card key={etape.titre}>
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-foreground mb-2">{etape.titre}</h3>
                    <p className="text-sm text-muted-foreground">{etape.contenu}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Erreurs courantes */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">⚠️ Les 5 erreurs les plus courantes</h2>
            <ul className="space-y-3">
              {[
                "Lire les questions avant l'énoncé (biais de confirmation)",
                "Ne pas formuler d'hypothèses avant de répondre",
                "Oublier les mesures de prévention et d'éducation thérapeutique",
                "Négliger les aspects médico-légaux (consentement, information)",
                "Ne pas relire ses réponses avec un regard critique",
              ].map((err, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Target className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{err}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Planning */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">📅 Planning hebdomadaire recommandé</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  {[
                    { jour: "Lundi", activite: "2 cas cliniques écrits (dossiers progressifs)" },
                    { jour: "Mardi", activite: "Analyse des erreurs + révision ciblée des items faibles" },
                    { jour: "Mercredi", activite: "1 cas clinique ECOS (simulation orale)" },
                    { jour: "Jeudi", activite: "QCM contextualisés (30 questions)" },
                    { jour: "Vendredi", activite: "2 cas cliniques écrits + flashcards des erreurs" },
                    { jour: "Samedi", activite: "Révision espacée (SRS) des cas de la semaine" },
                    { jour: "Dimanche", activite: "Repos ou 1 examen blanc complet" },
                  ].map((item) => (
                    <div key={item.jour} className="flex gap-4">
                      <Badge variant="outline" className="min-w-[80px] justify-center">{item.jour}</Badge>
                      <span className="text-muted-foreground">{item.activite}</span>
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
                { title: "Erreurs fréquentes aux ECOS", path: "/erreurs-frequentes-ecos" },
                { title: "Cas cliniques EDN", path: ROUTE_PATHS.seoCasCliniqueEdn },
                { title: "Réussir l'EDN", path: ROUTE_PATHS.seoReussirEdn },
                { title: "Fiches ECOS interactives", path: ROUTE_PATHS.seoFichesEcos },
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
                { q: "Combien de cas cliniques faut-il faire avant l'EDN ?", a: "Minimum 100 cas cliniques complets sur 6 mois. L'idéal est 3-4 cas/semaine avec une analyse approfondie des erreurs." },
                { q: "Les cas cliniques MED-MNG sont-ils conformes au programme ?", a: "Oui, tous les cas sont alignés sur les items EDN officiels avec scoring par compétence UNESS." },
                { q: "Faut-il travailler les cas cliniques seul ou en groupe ?", a: "Les deux. Seul pour le raisonnement écrit, en groupe pour les ECOS (simulation de consultation)." },
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
            <h2 className="text-2xl font-bold text-foreground mb-3">Entraînez-vous sur des cas cliniques interactifs</h2>
            <p className="text-muted-foreground mb-6">Correction détaillée, score par compétence, progression suivie.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTE_PATHS.medMngSignup}>
                <Button size="lg" className="gap-2">Essai gratuit 7 jours <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/exemple-cas-clinique">
                <Button variant="outline" size="lg">Voir un exemple gratuit</Button>
              </Link>
            </div>
          </section>

        </article>
        <AppFooter />
      </div>
    </>
  );
};

export default TravaillerCasCliniques;
