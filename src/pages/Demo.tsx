import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MedicalDisclaimer } from '@/components/legal';
import { SEOHead } from '@/components/seo/SEOHead';
import { ROUTE_PATHS } from '@/config/routes';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronLeft,
  GraduationCap,
  Heart,
  Lightbulb,
  Music,
  Play,
  Sparkles,
  Star,
  Stethoscope,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// Demo EDN items (10 items representative of the 367)
const DEMO_EDN_ITEMS = [
  { code: '228', title: 'Douleur thoracique aiguë', specialty: 'Cardiologie', rank: 'A', icon: Heart },
  { code: '330', title: 'Orientation diagnostique devant un souffle cardiaque', specialty: 'Cardiologie', rank: 'A', icon: Heart },
  { code: '132', title: 'Angine de poitrine et infarctus du myocarde', specialty: 'Cardiologie', rank: 'A', icon: Heart },
  { code: '96', title: 'Méningites et méningo-encéphalites', specialty: 'Neurologie', rank: 'A', icon: Brain },
  { code: '340', title: 'Malaise, perte de connaissance', specialty: 'Neurologie', rank: 'B', icon: Brain },
  { code: '354', title: 'Détresse respiratoire aiguë', specialty: 'Pneumologie', rank: 'A', icon: Stethoscope },
  { code: '219', title: 'Facteurs de risque cardiovasculaire', specialty: 'Cardiologie', rank: 'A', icon: Heart },
  { code: '261', title: 'Néphropathie glomérulaire', specialty: 'Néphrologie', rank: 'B', icon: Stethoscope },
  { code: '184', title: 'Asthme de l\'enfant et de l\'adulte', specialty: 'Pneumologie', rank: 'A', icon: Stethoscope },
  { code: '245', title: 'Diabète sucré de type 1 et 2', specialty: 'Endocrinologie', rank: 'A', icon: Stethoscope },
];

// Demo flashcards (2 cards)
const DEMO_FLASHCARDS = [
  {
    id: 'fc-1',
    front: 'Quels sont les 3 critères de la triade de Virchow ?',
    back: '1. Stase veineuse\n2. Lésion endothéliale\n3. Hypercoagulabilité',
    item: 'Item 226 - Thrombose veineuse profonde',
  },
  {
    id: 'fc-2',
    front: 'Quels sont les signes ECG d\'un infarctus ST+ ?',
    back: '1. Sus-décalage du segment ST > 1mm en frontal ou > 2mm en précordial\n2. Dans au moins 2 dérivations contiguës\n3. Image en miroir (sous-décalage en miroir)',
    item: 'Item 228 - Douleur thoracique aiguë',
  },
];

// Demo QCM for exam simulation
const DEMO_QCM = [
  {
    id: 'qcm-1',
    question: 'Patient de 60 ans, douleur thoracique rétrosternale depuis 2h. Quel examen en première intention ?',
    options: [
      'Radiographie thoracique',
      'ECG 12 dérivations',
      'Dosage troponine',
      'Échocardiographie',
    ],
    correctIndex: 1,
    explanation: 'L\'ECG 12 dérivations doit être réalisé dans les 10 minutes suivant le premier contact médical devant toute douleur thoracique suspecte de SCA. C\'est l\'examen clé pour orienter la prise en charge.',
  },
];

// Demo clinical case (mini)
const DEMO_CLINICAL_CASE = {
  title: 'Douleur thoracique aux urgences',
  patient: 'M. Dupont, 62 ans, tabagique (30 PA), diabétique type 2, se présente aux urgences pour une douleur thoracique rétrosternale constrictive irradiant au bras gauche, apparue il y a 45 minutes au repos. PA 145/90 mmHg, FC 95 bpm, SpO2 96%.',
  question: 'Quelle est votre première action ?',
  options: [
    { id: 'a', text: 'Réaliser un ECG 12 dérivations dans les 10 minutes', isCorrect: true, feedback: 'L\'ECG est l\'examen clé à réaliser en urgence (<10 min) devant toute suspicion de SCA.' },
    { id: 'b', text: 'Demander une radiographie thoracique', isCorrect: false, feedback: 'La radiographie peut être utile mais n\'est pas prioritaire. L\'ECG doit être fait en premier.' },
    { id: 'c', text: 'Administrer de la morphine IV', isCorrect: false, feedback: 'L\'antalgie est importante mais l\'ECG doit précéder toute thérapeutique pour orienter la prise en charge.' },
    { id: 'd', text: 'Doser la troponine et attendre le résultat', isCorrect: false, feedback: 'La troponine sera dosée mais son résultat ne doit pas retarder l\'ECG et la prise en charge initiale.' },
  ],
};

type DemoStep = 'intro' | 'edn-browse' | 'edn-detail' | 'flashcard' | 'music' | 'clinical-case' | 'qcm' | 'results';

export default function Demo() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DemoStep>('intro');
  const [selectedEdn, setSelectedEdn] = useState<typeof DEMO_EDN_ITEMS[0] | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [qcmAnswer, setQcmAnswer] = useState<number | null>(null);
  const [qcmSubmitted, setQcmSubmitted] = useState(false);
  const [clinicalAnswer, setClinicalAnswer] = useState<string | null>(null);
  const [clinicalSubmitted, setClinicalSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<DemoStep[]>([]);

  const STEP_ORDER: DemoStep[] = ['intro', 'edn-browse', 'edn-detail', 'flashcard', 'music', 'clinical-case', 'qcm', 'results'];
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const progressPercent = (stepIndex / (STEP_ORDER.length - 1)) * 100;

  const markCompleted = (step: DemoStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const goToStep = (step: DemoStep) => {
    markCompleted(currentStep);
    setCurrentStep(step);
  };

  const getStepLabel = (step: DemoStep): string => {
    switch (step) {
      case 'intro': return 'Bienvenue';
      case 'edn-browse': return 'Items EDN';
      case 'edn-detail': return 'Détail item';
      case 'flashcard': return 'Flashcards';
      case 'music': return 'Musique IA';
      case 'clinical-case': return 'Cas Clinique';
      case 'qcm': return 'Mode Examen';
      case 'results': return 'Résultats';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SEOHead
        title="Démo gratuite"
        description="Découvrez MED-MNG gratuitement : parcours guidé avec items EDN, flashcards et musique IA médicale. Sans inscription."
        keywords="demo, essai gratuit, EDN, médecine, apprentissage"
        canonical="/demo"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with progress */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (stepIndex > 0) {
                setCurrentStep(STEP_ORDER[stepIndex - 1]);
              } else {
                navigate(ROUTE_PATHS.home);
              }
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {stepIndex > 0 ? 'Retour' : 'Accueil'}
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Parcours Démo MED-MNG
              </h1>
              <Badge variant="secondary">{getStepLabel(currentStep)}</Badge>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {STEP_ORDER.map((step, i) => (
            <button
              key={step}
              onClick={() => i <= stepIndex && setCurrentStep(step)}
              disabled={i > stepIndex}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : completedSteps.includes(step)
                    ? 'bg-success/20 text-success cursor-pointer'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {completedSteps.includes(step) && <CheckCircle className="h-3 w-3" />}
              {getStepLabel(step)}
            </button>
          ))}
        </div>

        <MedicalDisclaimer variant="banner" className="mb-6" />

        {/* STEP: Intro */}
        {currentStep === 'intro' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">
                Bienvenue dans la démo MED-MNG
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez comment MED-MNG transforme vos révisions médicales avec la musique IA.
                Ce parcours guidé vous montre les fonctionnalités clés en 5 minutes.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold">10 Items EDN</h3>
                  <p className="text-sm text-muted-foreground">Parcourez des items représentatifs</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Brain className="h-8 w-8 mx-auto mb-3 text-accent" />
                  <h3 className="font-semibold">2 Flashcards</h3>
                  <p className="text-sm text-muted-foreground">Testez la répétition espacée</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Music className="h-8 w-8 mx-auto mb-3 text-success" />
                  <h3 className="font-semibold">1 Musique IA</h3>
                  <p className="text-sm text-muted-foreground">Écoutez un item transformé en chanson</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Stethoscope className="h-8 w-8 mx-auto mb-3 text-orange-500" />
                  <h3 className="font-semibold">1 Cas Clinique</h3>
                  <p className="text-sm text-muted-foreground">Résolvez un cas interactif</p>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" className="gap-2" onClick={() => goToStep('edn-browse')}>
              Commencer la démo
              <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="text-xs text-muted-foreground">
              Aucune inscription requise. Session temporaire.
            </p>
          </div>
        )}

        {/* STEP: EDN Browse */}
        {currentStep === 'edn-browse' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">367 Items EDN disponibles</h2>
              <p className="text-muted-foreground">
                Voici 10 items représentatifs. Cliquez sur un item pour voir le détail.
              </p>
            </div>

            <div className="grid gap-3">
              {DEMO_EDN_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.code}
                    className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
                    onClick={() => {
                      setSelectedEdn(item);
                      goToStep('edn-detail');
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">#{item.code}</span>
                          <Badge variant={item.rank === 'A' ? 'default' : 'secondary'} className="text-xs">
                            Rang {item.rank}
                          </Badge>
                        </div>
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.specialty}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP: EDN Detail */}
        {currentStep === 'edn-detail' && selectedEdn && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>Item #{selectedEdn.code}</Badge>
                  <Badge variant="outline">{selectedEdn.specialty}</Badge>
                  <Badge variant={selectedEdn.rank === 'A' ? 'default' : 'secondary'}>
                    Rang {selectedEdn.rank}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{selectedEdn.title}</CardTitle>
                <CardDescription>
                  Cet item fait partie des 367 items EDN couverts par MED-MNG.
                  En version complète, vous accédez aux tableaux Rang A & B, aux QCM, aux flashcards et à la musique IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-primary/5 rounded-lg text-center">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Tableaux</p>
                    <p className="font-semibold">Rang A & B</p>
                  </div>
                  <div className="p-3 bg-accent/5 rounded-lg text-center">
                    <Brain className="h-5 w-5 mx-auto mb-1 text-accent" />
                    <p className="text-xs text-muted-foreground">QCM</p>
                    <p className="font-semibold">15 questions</p>
                  </div>
                  <div className="p-3 bg-success/5 rounded-lg text-center">
                    <Music className="h-5 w-5 mx-auto mb-1 text-success" />
                    <p className="text-xs text-muted-foreground">Musique IA</p>
                    <p className="font-semibold">Chanson</p>
                  </div>
                  <div className="p-3 bg-warning/5 rounded-lg text-center">
                    <Lightbulb className="h-5 w-5 mx-auto mb-1 text-warning" />
                    <p className="text-xs text-muted-foreground">Flashcards</p>
                    <p className="font-semibold">SRS</p>
                  </div>
                </div>

                {/* Preview content */}
                <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Aperçu du contenu premium</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Le contenu complet inclut les compétences clés, les objectifs pédagogiques,
                    les situations cliniques de départ, et une chanson IA personnalisée pour mémoriser
                    les points essentiels de cet item.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="gap-2" onClick={() => goToStep('flashcard')}>
                Essayer les flashcards
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Flashcards */}
        {currentStep === 'flashcard' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Flashcards - Répétition espacée (SRS)</h2>
              <p className="text-muted-foreground">
                Cliquez sur la carte pour voir la réponse. {currentFlashcardIndex + 1}/2 cartes.
              </p>
            </div>

            <div
              className="relative cursor-pointer max-w-lg mx-auto"
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
            >
              <Card className={`min-h-[280px] flex items-center justify-center transition-all duration-300 ${
                flashcardFlipped ? 'bg-success/5 border-success/30' : 'bg-primary/5 border-primary/30'
              }`}>
                <CardContent className="p-8 text-center">
                  {!flashcardFlipped ? (
                    <>
                      <Badge variant="outline" className="mb-4">{DEMO_FLASHCARDS[currentFlashcardIndex].item}</Badge>
                      <p className="text-xl font-semibold mb-4">
                        {DEMO_FLASHCARDS[currentFlashcardIndex].front}
                      </p>
                      <p className="text-sm text-muted-foreground">Cliquez pour retourner</p>
                    </>
                  ) : (
                    <>
                      <Badge variant="default" className="mb-4 bg-success">Réponse</Badge>
                      <p className="text-lg whitespace-pre-line">
                        {DEMO_FLASHCARDS[currentFlashcardIndex].back}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center gap-4">
              {flashcardFlipped && (
                <>
                  {currentFlashcardIndex < DEMO_FLASHCARDS.length - 1 ? (
                    <Button
                      onClick={() => {
                        setCurrentFlashcardIndex(prev => prev + 1);
                        setFlashcardFlipped(false);
                      }}
                      className="gap-2"
                    >
                      Carte suivante
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => goToStep('music')} className="gap-2">
                      Écouter la musique IA
                      <Music className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP: Music */}
        {currentStep === 'music' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Musique IA - Mémorisation musicale</h2>
              <p className="text-muted-foreground">
                MED-MNG transforme chaque item EDN en chanson pour faciliter la mémorisation.
              </p>
            </div>

            <Card className="max-w-lg mx-auto overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-accent p-8 text-center text-white">
                <Music className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold mb-1">Douleur thoracique aiguë</h3>
                <p className="text-sm opacity-80">Item EDN #228 - Cardiologie</p>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Extrait des paroles :</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "Douleur rétrosternale, constrictive en barre,
                    Irradiant au bras gauche comme un signal d'alarme,
                    ECG en 10 minutes, c'est la règle d'or,
                    Troponine à H0, H3 et H6 encore..."
                  </p>
                </div>

                <Button variant="outline" className="w-full gap-2" disabled>
                  <Play className="h-4 w-4" />
                  Écouter l'extrait (Inscription requise)
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  En version complète, écoutez et téléchargez les chansons pour chaque item EDN.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button className="gap-2" onClick={() => goToStep('clinical-case')}>
                Essayer un cas clinique
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Clinical Case (Mini) */}
        {currentStep === 'clinical-case' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Cas Clinique Interactif</h2>
              <p className="text-muted-foreground">
                Prenez des décisions médicales comme en conditions réelles.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>Urgences</Badge>
                  <Badge variant="outline">Item #228</Badge>
                </div>
                <CardTitle className="text-lg">{DEMO_CLINICAL_CASE.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Présentation du patient
                  </h4>
                  <p className="text-sm">{DEMO_CLINICAL_CASE.patient}</p>
                </div>

                <p className="font-semibold">{DEMO_CLINICAL_CASE.question}</p>

                {DEMO_CLINICAL_CASE.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => !clinicalSubmitted && setClinicalAnswer(option.id)}
                    disabled={clinicalSubmitted}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      clinicalSubmitted
                        ? option.isCorrect
                          ? 'border-success bg-success/10'
                          : clinicalAnswer === option.id
                            ? 'border-destructive bg-destructive/10'
                            : 'border-muted'
                        : clinicalAnswer === option.id
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-1 text-sm">{option.text}</span>
                      {clinicalSubmitted && option.isCorrect && (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      )}
                      {clinicalSubmitted && clinicalAnswer === option.id && !option.isCorrect && (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}

                {clinicalSubmitted && (
                  <div className={`p-4 rounded-lg ${
                    DEMO_CLINICAL_CASE.options.find(o => o.id === clinicalAnswer)?.isCorrect
                      ? 'bg-success/10 border border-success/20'
                      : 'bg-destructive/10 border border-destructive/20'
                  }`}>
                    <p className="text-sm">
                      {DEMO_CLINICAL_CASE.options.find(o => o.id === clinicalAnswer)?.feedback}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {!clinicalSubmitted ? (
                    <Button
                      onClick={() => setClinicalSubmitted(true)}
                      disabled={clinicalAnswer === null}
                    >
                      Valider
                    </Button>
                  ) : (
                    <Button className="gap-2" onClick={() => goToStep('qcm')}>
                      Tester le mode examen
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP: QCM (Mini exam) */}
        {currentStep === 'qcm' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Mode Examen - QCM</h2>
              <p className="text-muted-foreground">
                Conditions proches de l'EDN. Timer, corrections détaillées.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge>Question 1/1</Badge>
                  <Badge variant="outline">Cardiologie</Badge>
                </div>
                <CardTitle className="text-lg mt-4">
                  {DEMO_QCM[0].question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEMO_QCM[0].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => !qcmSubmitted && setQcmAnswer(i)}
                    disabled={qcmSubmitted}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      qcmSubmitted
                        ? i === DEMO_QCM[0].correctIndex
                          ? 'border-success bg-success/10'
                          : qcmAnswer === i
                            ? 'border-destructive bg-destructive/10'
                            : 'border-muted'
                        : qcmAnswer === i
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-mono">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {qcmSubmitted && i === DEMO_QCM[0].correctIndex && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {qcmSubmitted && qcmAnswer === i && i !== DEMO_QCM[0].correctIndex && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </button>
                ))}

                {qcmSubmitted && (
                  <div className={`p-4 rounded-lg mt-4 ${
                    qcmAnswer === DEMO_QCM[0].correctIndex
                      ? 'bg-success/10 border border-success/20'
                      : 'bg-destructive/10 border border-destructive/20'
                  }`}>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      {qcmAnswer === DEMO_QCM[0].correctIndex ? (
                        <><CheckCircle className="h-4 w-4 text-success" /> Correct !</>
                      ) : (
                        <><XCircle className="h-4 w-4 text-destructive" /> Incorrect</>
                      )}
                    </h4>
                    <p className="text-sm">{DEMO_QCM[0].explanation}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  {!qcmSubmitted ? (
                    <Button
                      onClick={() => setQcmSubmitted(true)}
                      disabled={qcmAnswer === null}
                    >
                      Valider
                    </Button>
                  ) : (
                    <Button className="gap-2" onClick={() => goToStep('results')}>
                      Voir les résultats
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP: Results & CTA */}
        {currentStep === 'results' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-success to-primary rounded-2xl flex items-center justify-center mx-auto">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Démo terminée !</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Vous avez découvert un aperçu de MED-MNG. La plateforme complète inclut :
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              {[
                { icon: BookOpen, title: '367 items EDN', desc: 'Couverture complète R2C avec tableaux Rang A & B' },
                { icon: Music, title: 'Musique IA illimitée', desc: 'Chaque item transformé en chanson mémorable' },
                { icon: Stethoscope, title: '50+ cas cliniques', desc: 'Scénarios interactifs avec arbres décisionnels' },
                { icon: Brain, title: 'Flashcards SRS', desc: 'Répétition espacée intelligente pour mémorisation long terme' },
                { icon: GraduationCap, title: 'Mode Examen EDN', desc: 'Conditions réelles : 120 dossiers, QCM + QRU + QROC' },
                { icon: Star, title: 'ECOS', desc: 'Simulations d\'examens cliniques objectifs structurés' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{title}</h4>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => navigate(ROUTE_PATHS.medMngSignup)}
              >
                <Sparkles className="h-5 w-5" />
                Créer un compte gratuit
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => navigate(ROUTE_PATHS.medMngPricing)}
              >
                <Star className="h-5 w-5" />
                Voir les tarifs
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Accès gratuit aux items EDN de base. Plans premium disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
