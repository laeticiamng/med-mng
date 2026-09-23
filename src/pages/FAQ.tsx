import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, Music, BookOpen, CreditCard, Shield, Smartphone, Brain, GraduationCap, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { PremiumPageLayout } from '@/components/layout/PremiumPageLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const { logActivity } = useActivityTracking();

  useEffect(() => {
    logActivity({ activity_type: 'study', metadata: { action: 'view_faq' } });
  }, []);

  return (
    <>
    <SEOHead
      title="FAQ - Questions Fréquentes - MED MNG"
      description="Toutes les réponses à vos questions sur MED MNG : fonctionnement, tarifs, fiabilité médicale, révisions, application mobile et sécurité."
      keywords="FAQ, questions fréquentes, MED MNG, apprentissage médecine, musique IA, EDN"
      canonical="/faq"
    />
    <PremiumPageLayout gradient="default" showOrbs={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to={ROUTE_PATHS.home} className="flex items-center space-x-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Link>
            <div className="h-6 border-l border-border" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Questions fréquentes</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* En-tête */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <HelpCircle className="h-8 w-8" />
                <h2 className="text-2xl font-bold">FAQ - MED MNG</h2>
              </div>
              <p className="text-sm opacity-90">
                Toutes les réponses à vos questions sur la plateforme de révision médicale par la musique IA
              </p>
            </div>
          </Card>

          {/* Section 1 - Comment ça marche */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Comment ça marche ?</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="how-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  C'est quoi MED MNG exactement ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  MED MNG est une plateforme de révision pour les 367 items de l'EDN (Épreuves Dématérialisées
                  Nationales). Pour chaque item, vous trouvez une fiche, les compétences rang A et rang B du
                  référentiel public UNESS/LiSA, un quiz et des paroles de chanson générées par intelligence
                  artificielle, que vous pouvez mettre en musique. C'est la méthode MNG : Music Neuro Learning Generator.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment sont générées les chansons ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  En deux étapes. D'abord, l'IA (OpenAI GPT) rédige des paroles à partir des compétences
                  rang A, rang B ou A+B de l'item : ces paroles sont disponibles pour les 367 items. Ensuite,
                  si vous le souhaitez, vous générez l'audio depuis votre compte avec Suno AI, un générateur
                  de musique par IA ; cette étape consomme des crédits. Aucune piste audio n'est pré-enregistrée.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment réviser efficacement avec MED MNG ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  <p className="mb-2">Voici un parcours de révision possible pour chaque item :</p>
                  <ol className="space-y-1">
                    <li>1. <strong>Lire la fiche et les compétences rang A et rang B</strong></li>
                    <li>2. <strong>Lire ou écouter la chanson</strong> de l'item</li>
                    <li>3. <strong>Faire le quiz</strong> pour tester vos connaissances</li>
                    <li>4. <strong>Réécouter la chanson</strong> pour revoir les points clés</li>
                    <li>5. <strong>Utiliser les flashcards</strong> pour la répétition espacée</li>
                  </ol>
                  <p className="mt-2">
                    La chanson est un complément : le quiz (rappel actif) et vos cours restent
                    indispensables.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 2 - Contenu médical */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Contenu médical</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="med-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Les chansons sont-elles fiables médicalement ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Les paroles sont générées à partir des compétences rang A et rang B du référentiel public
                  UNESS/LiSA. Comme tout contenu généré par IA, elles peuvent contenir des imprécisions.
                  MED MNG est un outil <strong>complémentaire</strong> à vos cours, pas un substitut. Vérifiez
                  toujours avec vos sources officielles (Collèges, polycopiés de faculté). MED MNG n'a aucun
                  partenariat officiel avec l'UNESS ni le CNG.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="med-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Les 367 items EDN sont-ils tous couverts ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui. Les 367 items ont une fiche, les compétences rang A et rang B, un quiz et des paroles
                  de chanson. L'audio se génère à la demande (crédits). Les récits et les planches BD sont en
                  cours de génération. Vous pouvez consulter la liste complète dans la section{' '}
                  <Link to={ROUTE_PATHS.ednComplete} className="text-primary hover:underline">Items EDN</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="med-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Qu'est-ce que le Rang A et le Rang B ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Le rang s'applique à chaque connaissance, pas à l'item : un même item contient des
                  connaissances de <strong>rang A</strong> (fondamentales, à maîtriser par tout futur interne)
                  et de <strong>rang B</strong> (plus approfondies). MED MNG affiche séparément les
                  connaissances des deux rangs pour chaque item, telles qu'elles figurent dans le référentiel.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="med-4" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment fonctionne le copilote médical IA (Chat) ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Le copilote médical est un assistant IA pour les questions médicales liées aux items EDN.
                  Il peut vous aider à comprendre un concept, expliquer une pathologie ou vous proposer des
                  cas cliniques. Il est accessible, avec un compte, depuis le menu{' '}
                  <Link to={ROUTE_PATHS.chat} className="text-primary hover:underline">Chat</Link>.
                  Comme tout outil IA, ses réponses doivent être vérifiées avec les sources officielles.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 3 - Tarifs et abonnements */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Tarifs et abonnements</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="price-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Est-ce que MED MNG est gratuit ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui. Avec un compte gratuit, sans carte bancaire, vous accédez aux 367 items (fiche, rang A,
                  rang B, quiz, paroles) et aux situations ECOS, avec 3 générations audio offertes. Les
                  formules Standard (19 €/mois, 30 générations audio), Pro (29 €/mois, 300) et Premium
                  (39 €/mois, 3 000) augmentent le nombre de générations audio. Consultez nos{' '}
                  <Link to={ROUTE_PATHS.medMngPricing} className="text-primary hover:underline">tarifs</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je annuler mon abonnement à tout moment ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, depuis votre espace Profil &gt; Gérer l'abonnement. L'annulation prend effet à la fin
                  de la période en cours : vous conservez votre quota de générations jusqu'à la date de fin
                  de votre abonnement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment fonctionne le droit de rétractation ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Vous disposez de 14 jours pour exercer votre droit de rétractation après la souscription.
                  Cependant, si vous avez utilisé vos crédits de génération pendant cette période, le droit
                  de rétractation ne s'applique plus (conformément à l'article L221-28 du Code de la
                  consommation). Pour plus de détails, consultez nos{' '}
                  <Link to={ROUTE_PATHS.cgv} className="text-primary hover:underline">CGV</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 4 - Sécurité et données */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Sécurité et données</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="sec-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Mes données sont-elles protégées ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Vos données sont chiffrées en transit et au repos et hébergées sur des serveurs européens
                  (Supabase / AWS EU). Nous ne vendons jamais vos données. Pour en savoir plus, consultez
                  notre{' '}
                  <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">Politique de confidentialité</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sec-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je supprimer mon compte et mes données ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, à tout moment depuis Profil &gt; Paramètres &gt; Supprimer le compte. Vos données
                  personnelles sont conservées 90 jours (pour vous permettre de changer d'avis) puis
                  définitivement supprimées. Vous pouvez également demander un export de vos données au
                  format JSON. Consultez la page{' '}
                  <Link to={ROUTE_PATHS.mesDonneesRgpd} className="text-primary hover:underline">Mes données RGPD</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 5 - Application et technique */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Smartphone className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Application et technique</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="tech-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  MED MNG est-il disponible sur mobile ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, MED MNG est une application web installable (PWA) sur smartphone ou tablette, directement
                  depuis votre navigateur. Les fiches déjà consultées restent lisibles hors connexion. Pour
                  l'installer, rendez-vous sur la page{' '}
                  <Link to={ROUTE_PATHS.installPwa} className="text-primary hover:underline">Installer l'app</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tech-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je utiliser MED MNG hors connexion ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  En partie : une fois la PWA installée, les fiches d'items déjà consultées restent lisibles
                  hors connexion. L'audio des chansons, les quiz et la génération nécessitent une connexion
                  internet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tech-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Quels navigateurs sont pris en charge ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  MED MNG fonctionne sur tous les navigateurs modernes : Chrome, Firefox, Safari, Edge.
                  Pour la meilleure expérience (notamment l'installation de l'application), nous recommandons
                  Chrome ou Edge sur ordinateur, et Safari sur iOS / Chrome sur Android.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 6 - Efficacité et pédagogie */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Efficacité et pédagogie</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="eff-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  La musique aide-t-elle vraiment à mémoriser ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Certaines études montrent qu'une mélodie répétée peut aider à retenir un texte (par exemple
                  Wallace, 1994). L'effet reste modeste et dépend de la répétition : la chanson est un
                  complément au rappel actif (quiz) et à vos cours, pas une méthode miracle. Nous n'avons pas
                  encore de données d'efficacité propres à MED MNG.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="eff-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  MED MNG remplace-t-il mes cours de fac ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Non, MED MNG est un <strong>complément</strong> à vos cours. Il est conçu pour vous aider
                  à mémoriser et réviser, pas pour remplacer l'enseignement de vos professeurs. Utilisez-le
                  en parallèle de vos cours, polycopiés et référentiels officiels.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="eff-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  À qui s'adresse MED MNG ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  {/* CONSTAT : ce paragraphe renvoyait vers /b2b, page supprimée (commit ca5d38cb)
                      et sans route : le lien « offre B2B » tombait en 404. Lien retiré et renvoi
                      vers le contact, seule voie réellement disponible aujourd’hui. */}
                  MED MNG s'adresse principalement aux étudiants en médecine préparant l'EDN (DFGSM2 à DFASM3).
                  Pour un usage institutionnel (universités, CHU, facultés de médecine), écrivez-nous à{' '}
                  <a href="mailto:contact@emotionscare.com" className="text-primary hover:underline">contact@emotionscare.com</a>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 7 - ECOS */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Simulations ECOS</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="ecos-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Qu'est-ce que les simulations ECOS ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Les ECOS (Examens Cliniques Objectifs Structurés) évaluent vos compétences sur des
                  consultations simulées. MED MNG propose des situations ECOS issues du référentiel, avec un
                  déroulé guidé (je questionne, j'examine, je conclus), un chronomètre et une grille
                  d'auto-évaluation. Il n'y a pas de patient virtuel. Consultez la section{' '}
                  <Link to={ROUTE_PATHS.ecosIndex} className="text-primary hover:underline">ECOS</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 8 - Écoute et musique */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Headphones className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Écoute et musique</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="music-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je télécharger les chansons ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Les chansons sont disponibles en streaming uniquement via la plateforme MED MNG. Le
                  téléchargement n'est pas disponible pour des raisons de droits d'auteur et de licence.
                  L'écoute nécessite une connexion internet.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="music-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Quels styles musicaux sont disponibles ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Vous choisissez le style (pop, rap, variété, électro…) au moment de générer l'audio d'une
                  chanson. Vos chansons générées se retrouvent ensuite dans votre{' '}
                  <Link to={ROUTE_PATHS.ednMusicLibrary} className="text-primary hover:underline">bibliothèque musicale</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact */}
          <Card className="p-6 bg-primary/10 border-primary/20">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Vous n'avez pas trouvé votre réponse ?</h3>
              <p className="text-sm text-muted-foreground">
                Contactez-nous à <strong>contact@emotionscare.com</strong> ou utilisez le{' '}
                <Link to={ROUTE_PATHS.chat} className="text-primary hover:underline">copilote IA</Link> pour
                poser votre question.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <Link to={ROUTE_PATHS.medMngSignup}>
                  <Button>Créer un compte gratuit</Button>
                </Link>
                <Link to={ROUTE_PATHS.ednComplete}>
                  <Button variant="outline">Explorer les 367 items</Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to={ROUTE_PATHS.home}>
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumPageLayout>
    </>
  );
};

export default FAQ;
