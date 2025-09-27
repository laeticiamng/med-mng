import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, Play, Pause, RotateCcw, CheckCircle, AlertTriangle, 
  Target, Stethoscope, ClipboardList, MessageSquare, Award,
  Timer, Activity, Heart, Brain, User, ArrowRight, Star, Trophy
} from 'lucide-react';

interface EcosStation {
  id: string;
  name: string;
  duration_minutes: number;
  type: 'avec_ps' | 'sans_ps' | 'pratique' | 'theorique';
  competences: string[];
  scenario: {
    context: string;
    patient_profile: string;
    chief_complaint: string;
    expected_actions: string[];
    grading_criteria: {
      criterium: string;
      points: number;
      description: string;
    }[];
  };
  difficulty: number;
  medical_specialty: string;
}

interface SimulationTimer {
  isRunning: boolean;
  timeLeft: number;
  totalTime: number;
  phase: 'preparation' | 'consultation' | 'synthesis' | 'completed';
}

interface EcosSimulationChronometreeProps {
  itemCode: string;
  stationData?: EcosStation;
  onSimulationComplete?: (results: any) => void;
}

export const EcosSimulationChronometree = ({ 
  itemCode, 
  stationData,
  onSimulationComplete 
}: EcosSimulationChronometreeProps) => {
  const [timer, setTimer] = useState<SimulationTimer>({
    isRunning: false,
    timeLeft: 480, // 8 minutes par défaut
    totalTime: 480,
    phase: 'preparation'
  });
  
  const [currentAction, setCurrentAction] = useState<string>('');
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Station ECOS de démonstration
  const demoStation: EcosStation = {
    id: 'ecos-demo-1',
    name: 'Consultation Cardiologique',
    duration_minutes: 8,
    type: 'avec_ps',
    competences: ['Anamnèse', 'Examen clinique', 'Communication', 'Diagnostic'],
    scenario: {
      context: 'Service de cardiologie - Consultation programmée',
      patient_profile: 'Homme, 65 ans, antécédents d\'HTA',
      chief_complaint: 'Douleurs thoraciques d\'effort depuis 3 semaines',
      expected_actions: [
        'Saluer et se présenter',
        'Interrogatoire SOCRATES',
        'Antécédents cardiovasculaires',
        'Examen clinique cardiaque',
        'Hypothèses diagnostiques',
        'Plan diagnostique',
        'Synthèse et conseils'
      ],
      grading_criteria: [
        { criterium: 'Présentation et communication', points: 2, description: 'Salutation, présentation, écoute active' },
        { criterium: 'Anamnèse structurée', points: 4, description: 'Interrogatoire complet et méthodique' },
        { criterium: 'Examen clinique', points: 4, description: 'Technique correcte et systématique' },
        { criterium: 'Raisonnement diagnostique', points: 3, description: 'Hypothèses pertinentes et hiérarchisées' },
        { criterium: 'Plan de prise en charge', points: 2, description: 'Examens et suivi appropriés' },
        { criterium: 'Synthèse', points: 1, description: 'Résumé clair et structuré' }
      ]
    },
    difficulty: 3,
    medical_specialty: 'Cardiologie'
  };

  const station = stationData || demoStation;

  // Gestion du timer
  useEffect(() => {
    if (timer.isRunning && timer.timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (timer.timeLeft === 0) {
      handleSimulationEnd();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer.isRunning, timer.timeLeft]);

  // Phases de la simulation
  const phases = [
    { name: 'Préparation', duration: 30, color: 'from-blue-500 to-cyan-500' },
    { name: 'Consultation', duration: 390, color: 'from-green-500 to-emerald-500' },
    { name: 'Synthèse', duration: 60, color: 'from-purple-500 to-pink-500' }
  ];

  const getCurrentPhase = () => {
    const elapsed = timer.totalTime - timer.timeLeft;
    if (elapsed < 30) return 'preparation';
    if (elapsed < 420) return 'consultation';
    return 'synthesis';
  };

  const startSimulation = () => {
    setTimer(prev => ({ ...prev, isRunning: true, phase: 'preparation' }));
    setCompletedActions([]);
    setScore(0);
    setFeedback([]);
  };

  const pauseSimulation = () => {
    setTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resetSimulation = () => {
    setTimer({
      isRunning: false,
      timeLeft: station.duration_minutes * 60,
      totalTime: station.duration_minutes * 60,
      phase: 'preparation'
    });
    setCompletedActions([]);
    setCurrentAction('');
    setScore(0);
    setFeedback([]);
  };

  const handleActionComplete = (action: string) => {
    if (!completedActions.includes(action)) {
      setCompletedActions([...completedActions, action]);
      const points = Math.round(Math.random() * 3) + 1;
      setScore(prev => prev + points);
      setFeedback(prev => [...prev, `✅ ${action} - +${points} points`]);
    }
  };

  const handleSimulationEnd = () => {
    setTimer(prev => ({ ...prev, isRunning: false, phase: 'completed' }));
    
    // Calcul du score final
    const completionRate = (completedActions.length / station.scenario.expected_actions.length) * 100;
    const timeBonus = timer.timeLeft > 0 ? 10 : 0;
    const finalScore = Math.min(20, score + timeBonus);
    
    onSimulationComplete?.({
      station_id: station.id,
      completion_rate: completionRate,
      final_score: finalScore,
      completed_actions: completedActions,
      time_used: timer.totalTime - timer.timeLeft,
      feedback: feedback
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timer.timeLeft / timer.totalTime) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const TimerDisplay = () => (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/20">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="relative">
            <motion.div
              className={`text-6xl font-mono font-bold ${getTimeColor()}`}
              animate={{ scale: timer.timeLeft <= 30 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 1, repeat: timer.timeLeft <= 30 ? Infinity : 0 }}
            >
              {formatTime(timer.timeLeft)}
            </motion.div>
            
            {/* Indicateur de phase */}
            <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Phase: {getCurrentPhase().charAt(0).toUpperCase() + getCurrentPhase().slice(1)}
            </Badge>
          </div>
          
          {/* Barre de progression circulaire */}
          <div className="relative w-40 h-40 mx-auto">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1 - (timer.timeLeft / timer.totalTime),
                  stroke: timer.timeLeft <= 60 ? '#ef4444' : '#10b981'
                }}
                transition={{ duration: 0.5 }}
                style={{
                  strokeDasharray: `${2 * Math.PI * 70}`,
                  strokeDashoffset: `${2 * Math.PI * 70 * (timer.timeLeft / timer.totalTime)}`
                }}
              />
            </svg>
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.round(((timer.totalTime - timer.timeLeft) / timer.totalTime) * 100)}%
                </div>
                <div className="text-xs text-gray-400">complété</div>
              </div>
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex justify-center gap-3">
            {!timer.isRunning ? (
              <Button onClick={startSimulation} size="lg" className="bg-green-600 hover:bg-green-700">
                <Play className="h-5 w-5 mr-2" />
                Démarrer
              </Button>
            ) : (
              <Button onClick={pauseSimulation} size="lg" variant="outline">
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            
            <Button onClick={resetSimulation} size="lg" variant="outline">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ScenarioPanel = () => (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-600" />
          Scénario ECOS - {station.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contexte */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Contexte</h3>
          <p className="text-sm text-blue-700">{station.scenario.context}</p>
        </div>

        {/* Profil patient */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil Patient
          </h3>
          <p className="text-sm text-green-700 mb-2">{station.scenario.patient_profile}</p>
          <p className="text-sm text-green-700 font-medium">
            Motif de consultation: {station.scenario.chief_complaint}
          </p>
        </div>

        {/* Actions attendues */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Actions Attendues ({completedActions.length}/{station.scenario.expected_actions.length})
          </h3>
          <div className="space-y-2">
            {station.scenario.expected_actions.map((action, index) => {
              const isCompleted = completedActions.includes(action);
              const isCurrent = currentAction === action;
              
              return (
                <motion.div
                  key={index}
                  layout
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : isCurrent 
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Activity className="h-5 w-5 text-blue-600" />
                      </motion.div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                    )}
                    <span className={`text-sm ${isCompleted ? 'text-green-800 line-through' : isCurrent ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                      {index + 1}. {action}
                    </span>
                  </div>
                  
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCurrentAction(action);
                        handleActionComplete(action);
                      }}
                      disabled={!timer.isRunning}
                    >
                      Valider
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Score en temps réel */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Score Temps Réel
              </h3>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                {score}/20 points
              </Badge>
            </div>
            <Progress value={(score / 20) * 100} className="h-3 mb-3" />
            
            {/* Critères de notation */}
            <div className="space-y-2">
              {station.scenario.grading_criteria.map((criteria, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-purple-700">{criteria.criterium}</span>
                  <span className="font-medium text-purple-800">{criteria.points} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );

  const FeedbackPanel = () => (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          Feedback en Temps Réel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <AnimatePresence>
            {feedback.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-700"
              >
                {msg}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {feedback.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              Le feedback apparaîtra ici pendant la simulation
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const CompletionSummary = () => {
    const completionRate = (completedActions.length / station.scenario.expected_actions.length) * 100;
    const timeUsed = timer.totalTime - timer.timeLeft;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6" />
              Simulation Terminée !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{score}/20</div>
                <div className="text-sm text-green-700">Score Final</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{Math.round(completionRate)}%</div>
                <div className="text-sm text-blue-700">Complétude</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatTime(timeUsed)}</div>
                <div className="text-sm text-purple-700">Temps Utilisé</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={resetSimulation} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
              <Button size="lg" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Voir Corrigé
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                ECOS Simulation Chronométrée
              </CardTitle>
              <p className="text-blue-100">{station.name}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-white/20 text-white">
                  {itemCode}
                </Badge>
                <Badge className="bg-white/20 text-white">
                  {station.medical_specialty}
                </Badge>
                <Badge className="bg-white/20 text-white">
                  {station.duration_minutes} minutes
                </Badge>
                <Badge className={`${
                  station.type === 'avec_ps' ? 'bg-green-500' : 
                  station.type === 'sans_ps' ? 'bg-orange-500' : 'bg-blue-500'
                } text-white`}>
                  {station.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-sm text-blue-100 mb-1">Difficulté</div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < station.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {timer.phase === 'completed' ? (
        <CompletionSummary />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer principal */}
          <div className="lg:col-span-1">
            <TimerDisplay />
          </div>

          {/* Scénario et actions */}
          <div className="lg:col-span-1">
            <ScenarioPanel />
          </div>

          {/* Feedback */}
          <div className="lg:col-span-1">
            <FeedbackPanel />
          </div>
        </div>
      )}
    </div>
  );
};