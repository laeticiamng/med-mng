/**
 * 📚 AI USAGE GUIDE
 * Guide de formation à l'utilisation critique de l'IA
 * Sensibilise les utilisateurs aux limites et bonnes pratiques
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  XCircle,
  BookOpen,
  Shield,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  GraduationCap,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface AIUsageGuideProps {
  variant?: 'modal' | 'inline' | 'compact';
  onComplete?: () => void;
  showOnFirstVisit?: boolean;
  className?: string;
}

const GUIDE_SECTIONS = [
  {
    id: 'understand',
    title: "Comprendre l'IA générative",
    icon: Brain,
    content: `Les modèles d'IA comme GPT fonctionnent par prédiction statistique de mots. 
Ils ne "comprennent" pas réellement le contenu médical et peuvent générer des informations 
plausibles mais incorrectes (appelées "hallucinations").`,
    keyPoints: [
      "L'IA génère du texte probable, pas nécessairement vrai",
      "Les modèles sont entraînés sur des données qui peuvent être obsolètes",
      "L'IA n'a pas accès aux dernières recommandations médicales"
    ]
  },
  {
    id: 'verify',
    title: 'Toujours vérifier',
    icon: CheckCircle,
    content: `Chaque information fournie par l'IA doit être croisée avec des sources officielles. 
Les recommandations HAS, ANSM, et les cours de votre faculté restent les références.`,
    keyPoints: [
      "Croiser avec les recommandations HAS/ANSM",
      "Consulter vos cours et manuels de référence",
      "Demander confirmation à vos enseignants si doute"
    ],
    links: [
      { label: 'HAS - Recommandations', url: 'https://www.has-sante.fr/' },
      { label: 'ANSM - Médicaments', url: 'https://ansm.sante.fr/' },
      { label: 'Collèges nationaux', url: 'https://www.cncem.fr/' }
    ]
  },
  {
    id: 'critical',
    title: 'Garder son esprit critique',
    icon: Shield,
    content: `L'IA est un outil d'aide à l'apprentissage, pas une autorité médicale. 
Développer son propre raisonnement clinique reste essentiel pour devenir un bon médecin.`,
    keyPoints: [
      "L'IA complète votre apprentissage, ne le remplace pas",
      "Exercez votre propre raisonnement clinique",
      "Méfiez-vous des réponses trop confiantes"
    ]
  },
  {
    id: 'contribute',
    title: 'Signaler les erreurs',
    icon: ThumbsDown,
    content: `Votre feedback améliore la plateforme. Signalez les erreurs que vous détectez 
pour protéger les autres utilisateurs et améliorer les contenus.`,
    keyPoints: [
      "Utilisez les boutons 👍/👎 après chaque réponse IA",
      "Décrivez l'erreur détectée si possible",
      "Vos signalements sont examinés par notre équipe"
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "Une réponse de l'IA vous semble correcte. Que faites-vous ?",
    options: [
      { text: "Je l'utilise directement", correct: false },
      { text: "Je vérifie avec une source officielle", correct: true },
      { text: "Je demande à l'IA de confirmer", correct: false }
    ],
    explanation: "Même si une réponse semble correcte, il faut toujours la vérifier avec les recommandations officielles (HAS, ANSM, cours)."
  },
  {
    question: "L'IA vous donne une posologie médicamenteuse. Que pensez-vous ?",
    options: [
      { text: "C'est fiable car l'IA a accès à toutes les données", correct: false },
      { text: "Je dois vérifier dans le Vidal ou les RCP", correct: true },
      { text: "C'est forcément faux", correct: false }
    ],
    explanation: "Les posologies peuvent évoluer et l'IA peut halluciner des valeurs. Toujours vérifier avec le Vidal ou les RCP officiels."
  },
  {
    question: "Vous détectez une erreur dans une réponse de l'IA. Que faites-vous ?",
    options: [
      { text: "Rien, ce n'est pas grave", correct: false },
      { text: "Je la signale via le bouton de feedback", correct: true },
      { text: "J'arrête d'utiliser la plateforme", correct: false }
    ],
    explanation: "Signaler les erreurs aide à améliorer la plateforme et protège les autres utilisateurs."
  }
];

export const AIUsageGuide: React.FC<AIUsageGuideProps> = ({
  variant = 'inline',
  onComplete,
  showOnFirstVisit = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  // Vérifier si l'utilisateur a déjà vu le guide
  useEffect(() => {
    if (showOnFirstVisit) {
      const hasSeenGuide = localStorage.getItem('ai-usage-guide-completed');
      if (!hasSeenGuide && variant === 'modal') {
        setIsOpen(true);
      }
    }
  }, [showOnFirstVisit, variant]);

  const handleComplete = () => {
    localStorage.setItem('ai-usage-guide-completed', 'true');
    localStorage.setItem('ai-usage-guide-date', new Date().toISOString());
    setIsOpen(false);
    onComplete?.();
  };

  const handleQuizAnswer = (correct: boolean) => {
    setQuizAnswers([...quizAnswers, correct]);
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    }
  };

  const quizScore = quizAnswers.filter(Boolean).length;
  const quizComplete = quizAnswers.length === QUIZ_QUESTIONS.length;
  const progress = showQuiz 
    ? 50 + (quizAnswers.length / QUIZ_QUESTIONS.length) * 50
    : (acknowledged.length / GUIDE_SECTIONS.length) * 50;

  // Version compacte pour les bandeaux
  if (variant === 'compact') {
    return (
      <Card className={cn("bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Rappel : L'IA peut se tromper
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Vérifiez toujours les informations avec les recommandations officielles (HAS, ANSM).
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            >
              En savoir plus
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const GuideContent = () => (
    <div className="space-y-6">
      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{showQuiz ? 'Quiz de validation' : 'Guide de formation'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {!showQuiz ? (
        <>
          {/* Sections du guide */}
          <Accordion type="multiple" value={acknowledged} onValueChange={setAcknowledged}>
            {GUIDE_SECTIONS.map((section, index) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      acknowledged.includes(section.id) 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-muted"
                    )}>
                      <section.icon className={cn(
                        "h-4 w-4",
                        acknowledged.includes(section.id) 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-muted-foreground"
                      )} />
                    </div>
                    <span>{section.title}</span>
                    {acknowledged.includes(section.id) && (
                      <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                        Lu ✓
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <p className="text-muted-foreground">{section.content}</p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Points clés :</p>
                    <ul className="space-y-1">
                      {section.keyPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {section.links && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Ressources :</p>
                      <div className="flex flex-wrap gap-2">
                        {section.links.map((link, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.label}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {acknowledged.length === GUIDE_SECTIONS.length && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <Button onClick={() => setShowQuiz(true)}>
                Passer au quiz de validation
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </>
      ) : (
        <>
          {/* Quiz de validation */}
          {!quizComplete ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Question {quizStep + 1} / {QUIZ_QUESTIONS.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{QUIZ_QUESTIONS[quizStep].question}</p>
                <div className="space-y-2">
                  {QUIZ_QUESTIONS[quizStep].options.map((option, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4"
                      onClick={() => handleQuizAnswer(option.correct)}
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={cn(
                quizScore === QUIZ_QUESTIONS.length 
                  ? "border-green-300 bg-green-50 dark:bg-green-950/30" 
                  : "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
              )}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {quizScore === QUIZ_QUESTIONS.length ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        Félicitations !
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-6 w-6 text-amber-600" />
                        Quiz terminé
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Score : {quizScore} / {QUIZ_QUESTIONS.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    {quizScore === QUIZ_QUESTIONS.length 
                      ? "Vous avez bien compris les principes d'utilisation critique de l'IA. Vous êtes prêt à utiliser la plateforme de manière responsable !"
                      : "Relisez les sections du guide pour mieux comprendre comment utiliser l'IA de manière critique."}
                  </p>
                  
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Rappel : Cette plateforme est un <strong>outil d'apprentissage</strong>, 
                      pas une source médicale officielle. Vérifiez toujours les informations.
                    </p>
                  </div>

                  <Button 
                    onClick={handleComplete} 
                    className="w-full"
                  >
                    {quizScore === QUIZ_QUESTIONS.length 
                      ? "Terminer et commencer" 
                      : "J'ai compris, continuer"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );

  // Version modale
  if (variant === 'modal') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Utiliser l'IA de manière responsable
            </DialogTitle>
            <DialogDescription>
              Avant d'utiliser l'assistant IA, prenez connaissance de ces principes essentiels.
            </DialogDescription>
          </DialogHeader>
          <GuideContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Version inline
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Guide : Utiliser l'IA de manière responsable
        </CardTitle>
        <CardDescription>
          Comprenez les limites de l'IA et adoptez les bonnes pratiques
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <GuideContent />
      </CardContent>
    </Card>
  );
};

export default AIUsageGuide;
