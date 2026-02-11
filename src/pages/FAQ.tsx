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
            <h1 className="text-3xl font-bold text-foreground">Questions Frequentes</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* En-tete */}
          <Card className="p-6 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <HelpCircle className="h-8 w-8" />
                <h2 className="text-2xl font-bold">FAQ - MED MNG</h2>
              </div>
              <p className="text-sm opacity-90">
                Toutes les reponses a vos questions sur la plateforme d'apprentissage medical par la musique IA
              </p>
            </div>
          </Card>

          {/* Section 1 - Comment ca marche */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Comment ca marche ?</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="how-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  C'est quoi MED MNG exactement ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  MED MNG est une plateforme d'apprentissage medical qui transforme chacun des 367 items de
                  l'EDN (Examen Dossiers Nationaux) en chansons generees par intelligence artificielle. Chaque
                  chanson est concue pour vous aider a memoriser les notions cles d'un item medical de maniere
                  ludique et efficace. C'est la methode MNG : Music Neuro Learning Generator.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment sont generees les chansons ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Les chansons sont generees en deux etapes : d'abord, l'IA (OpenAI GPT) redige des paroles
                  structurees a partir du contenu medical de chaque item EDN. Ensuite, ces paroles sont mises
                  en musique par Suno AI, un generateur de musique par intelligence artificielle. Le resultat :
                  une chanson originale dont chaque phrase contient des informations medicales essentielles.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment reviser efficacement avec MED MNG ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  <p className="mb-2">Voici le parcours de revision recommande pour chaque item :</p>
                  <ol className="space-y-1">
                    <li>1. <strong>Ecouter la chanson</strong> pour une premiere decouverte du sujet</li>
                    <li>2. <strong>Lire les tableaux Rang A et B</strong> pour approfondir les notions</li>
                    <li>3. <strong>Faire le quiz</strong> pour tester vos connaissances</li>
                    <li>4. <strong>Re-ecouter la chanson</strong> pour consolider la memorisation</li>
                    <li>5. <strong>Utiliser les flashcards</strong> pour la repetition espacee</li>
                  </ol>
                  <p className="mt-2">
                    La repetition musicale exploite la memoire procedurale : les paroles s'ancrent
                    naturellement comme les paroles d'une chanson que vous connaissez par coeur.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 2 - Contenu medical */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Contenu medical</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="med-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Les chansons sont-elles fiables medicalement ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Les paroles sont generees a partir des referentiels officiels (programmes EDN, recommandations
                  des Colleges Nationaux des Enseignants, HAS). Cependant, comme tout contenu genere par IA,
                  elles peuvent contenir des imprecisions. MED MNG est un outil <strong>complementaire</strong> a
                  vos cours, pas un substitut. Nous vous recommandons de toujours verifier avec vos sources
                  officielles (College, polycopes de faculte).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="med-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Les 367 items EDN sont-ils tous couverts ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, MED MNG couvre l'integralite des 367 items du programme EDN. Chaque item dispose
                  d'une chanson pedagogique, de tableaux recapitulatifs (Rang A et Rang B), d'un quiz
                  d'entrainement et d'une bande dessinee generee par IA. Vous pouvez consulter la liste
                  complete dans la section{' '}
                  <Link to={ROUTE_PATHS.ednComplete} className="text-primary hover:underline">Items EDN</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="med-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Qu'est-ce que le Rang A et le Rang B ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Le <strong>Rang A</strong> correspond aux connaissances fondamentales que tout interne doit
                  maitriser. Le <strong>Rang B</strong> correspond aux connaissances plus approfondies qui
                  permettent de se demarquer. MED MNG propose des tableaux recapitulatifs pour les deux rangs,
                  conformes aux objectifs du programme officiel.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="med-4" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment fonctionne le copilote medical IA (Chat) ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Le copilote medical est un assistant IA specialise dans les questions medicales liees aux
                  items EDN. Il peut vous aider a comprendre un concept, expliquer une pathologie, ou vous
                  proposer des cas cliniques. Il est accessible depuis le menu{' '}
                  <Link to={ROUTE_PATHS.chat} className="text-primary hover:underline">Chat</Link>.
                  Comme tout outil IA, ses reponses doivent etre verifiees avec les sources officielles.
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
                  Oui, vous pouvez commencer gratuitement avec 3 generations de chansons par mois, sans
                  carte bancaire requise. Cela vous permet de decouvrir la methode MNG et de tester la
                  plateforme. Pour un usage plus intensif, des abonnements payants sont disponibles a
                  partir de 19 euros/mois. Consultez nos{' '}
                  <Link to={ROUTE_PATHS.medMngPricing} className="text-primary hover:underline">tarifs</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je annuler mon abonnement a tout moment ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, vous pouvez annuler votre abonnement a tout moment depuis votre espace Profil &gt;
                  Gerer l'abonnement. L'annulation prend effet a la fin de la periode en cours : vous
                  conservez l'acces a toutes les fonctionnalites premium jusqu'a la date de fin de votre
                  abonnement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Comment fonctionne le droit de retractation ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Vous disposez de 14 jours pour exercer votre droit de retractation apres la souscription.
                  Cependant, si vous avez utilise vos credits de generation pendant cette periode, le droit
                  de retractation ne s'applique plus (conformement a l'article L221-28 du Code de la
                  consommation). Pour plus de details, consultez nos{' '}
                  <Link to={ROUTE_PATHS.cgv} className="text-primary hover:underline">CGV</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 4 - Securite et donnees */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Securite et donnees</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="sec-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Mes donnees sont-elles protegees ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, MED MNG est conforme au RGPD et certifie A+ en securite. Vos donnees sont chiffrees
                  (AES-256) en transit et au repos, hebergees sur des serveurs europeens (Supabase / AWS EU).
                  Nous ne vendons jamais vos donnees et ne partageons rien avec des tiers. Pour en savoir plus,
                  consultez notre{' '}
                  <Link to={ROUTE_PATHS.politiqueConfidentialite} className="text-primary hover:underline">Politique de Confidentialite</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sec-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je supprimer mon compte et mes donnees ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, vous pouvez supprimer votre compte a tout moment depuis Profil &gt; Parametres &gt;
                  Supprimer le compte. Vos donnees personnelles seront conservees 90 jours (pour vous
                  permettre de changer d'avis) puis definitivement supprimees. Vous pouvez egalement
                  demander un export de vos donnees au format JSON. Consultez la page{' '}
                  <Link to={ROUTE_PATHS.mesDonneesRgpd} className="text-primary hover:underline">Mes donnees RGPD</Link>.
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
                  Oui, MED MNG est une PWA (Progressive Web App) que vous pouvez installer sur votre
                  smartphone ou tablette directement depuis votre navigateur. Elle fonctionne comme une
                  application native et est meme utilisable hors connexion. Pour l'installer, rendez-vous
                  sur la page{' '}
                  <Link to={ROUTE_PATHS.installPwa} className="text-primary hover:underline">Installer l'app</Link>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tech-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je utiliser MED MNG hors connexion ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, une fois la PWA installee et vos items favoris synchronises, vous pouvez acceder
                  a vos contenus meme sans connexion internet. Les tableaux, quiz et progressions sont
                  sauvegardes localement. La synchronisation se fait automatiquement lorsque vous retrouvez
                  une connexion.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tech-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Quels navigateurs sont supportes ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  MED MNG fonctionne sur tous les navigateurs modernes : Chrome, Firefox, Safari, Edge.
                  Pour la meilleure experience (notamment l'installation PWA), nous recommandons Chrome
                  ou Edge sur ordinateur, et Safari sur iOS / Chrome sur Android.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 6 - Efficacite et pedagogie */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Efficacite et pedagogie</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="eff-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  La musique aide-t-elle vraiment a memoriser ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Oui, de nombreuses etudes en neurosciences montrent que la musique active des zones
                  cerebrales liees a la memoire a long terme (hippocampe, cortex prefrontal). La methode MNG
                  exploite ce mecanisme : en associant des informations medicales a des melodies, elles
                  s'ancrent dans la memoire procedurale, comme les paroles d'une chanson que vous connaissez.
                  Nos utilisateurs rapportent une retention x3 par rapport a la lecture seule.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="eff-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  MED MNG remplace-t-il mes cours de fac ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Non, MED MNG est un <strong>complement</strong> a vos cours. Il est concu pour vous aider
                  a memoriser et reviser, pas pour remplacer l'enseignement de vos professeurs. Nous vous
                  recommandons de l'utiliser en parallele de vos cours, polycopes et referentiels officiels
                  pour une preparation optimale a l'EDN.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="eff-3" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  A qui s'adresse MED MNG ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  MED MNG s'adresse principalement aux etudiants en medecine preparant l'EDN (DFGSM2 a DFASM3),
                  mais aussi aux professionnels de sante en formation continue. La plateforme est egalement
                  accessible aux institutions academiques (universites, CHU, facultes de medecine) via notre{' '}
                  <Link to={ROUTE_PATHS.b2b} className="text-primary hover:underline">offre B2B</Link>.
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
                  Les ECOS (Examens Cliniques Objectifs Structures) sont des simulations de consultations
                  medicales. MED MNG propose des scenarios interactifs qui reproduisent des situations cliniques
                  reelles. Vous interagissez avec un patient virtuel et devez poser les bonnes questions,
                  proposer des examens et etablir un diagnostic. Consultez la section{' '}
                  <Link to={ROUTE_PATHS.ecosIndex} className="text-primary hover:underline">ECOS</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Section 8 - Ecoute et musique */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Headphones className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-semibold text-foreground">Ecoute et musique</h3>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="music-1" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Puis-je telecharger les chansons ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  Les chansons sont disponibles en streaming uniquement via la plateforme MED MNG. Le
                  telechargement n'est pas disponible pour des raisons de droits d'auteur et de licence.
                  Cependant, avec la PWA installee, vous pouvez ecouter vos chansons meme hors connexion.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="music-2" className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  Quels styles musicaux sont disponibles ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                  MED MNG genere des chansons dans differents styles musicaux (pop, rap, variete, electro...)
                  pour s'adapter aux gouts de chacun. L'IA adapte le style en fonction du contenu medical
                  pour optimiser la memorisation. Vous pouvez decouvrir les differents styles dans la{' '}
                  <Link to={ROUTE_PATHS.ednMusicLibrary} className="text-primary hover:underline">bibliotheque musicale</Link>.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact */}
          <Card className="p-6 bg-primary/10 border-primary/20">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Vous n'avez pas trouve votre reponse ?</h3>
              <p className="text-sm text-muted-foreground">
                Contactez-nous a <strong>contact@emotionscare.com</strong> ou utilisez le{' '}
                <Link to={ROUTE_PATHS.chat} className="text-primary hover:underline">copilote IA</Link> pour
                poser votre question.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <Link to={ROUTE_PATHS.medMngSignup}>
                  <Button>Creer un compte gratuit</Button>
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
                <span>Retour a l'accueil</span>
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
