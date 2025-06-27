
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft, Clock, User, MessageCircle, HandIcon, FileText, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const EcosScenario = () => {
  const { slug } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [responses, setResponses] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: string}>({});

  // Sample ECOS data
  const scenarioData = {
    id: 'SD003',
    title: 'Douleur thoracique',
    specialty: 'Cardiologie',
    duration: 15,
    pitch: "Vous êtes interne aux urgences. M. Dupont, 52 ans, consulte pour une douleur thoracique apparue il y 2 heures.",
    patient: {
      name: 'M. Dupont',
      age: 52,
      sex: 'Masculin',
      avatar: '👨‍💼',
      background: 'Cadre supérieur, fumeur 1 paquet/jour depuis 20 ans, père décédé d\'infarctus à 58 ans'
    },
    steps: [
      {
        title: 'Je dis',
        subtitle: 'Interrogatoire dirigé',
        icon: MessageCircle,
        questions: [
          'Depuis quand avez-vous mal ?',
          'Pouvez-vous décrire cette douleur ?',
          'Qu\'est-ce qui déclenche ou soulage la douleur ?',
          'Avez-vous d\'autres symptômes associés ?',
          'Avez-vous des antécédents médicaux ?'
        ]
      },
      {
        title: 'Je fais',
        subtitle: 'Examen clinique',
        icon: HandIcon,
        actions: [
          'Prise des constantes vitales',
          'Inspection générale',
          'Auscultation cardiaque',
          'Auscultation pulmonaire',
          'Palpation abdominale'
        ]
      },
      {
        title: 'Je conclus',
        subtitle: 'Synthèse et prise en charge',
        icon: FileText,
        elements: [
          'Résumé de la situation',
          'Hypothèses diagnostiques',
          'Examens complémentaires',
          'Prise en charge immédiate'
        ]
      }
    ]
  };

  const quizQuestions = [
    {
      question: 'Quel est le premier examen à réaliser devant une douleur thoracique ?',
      options: ['ECG', 'Radio thorax', 'Échographie cardiaque', 'Biologie'],
      correct: 0
    },
    {
      question: 'Quelle est la durée typique d\'une douleur d\'angor instable ?',
      options: ['< 2 minutes', '2-10 minutes', '> 20 minutes', 'Variable'],
      correct: 2
    },
    {
      question: 'Devant une suspicion de SCA, quelle attitude adopter ?',
      options: ['Attendre les résultats', 'Hospitalisation immédiate', 'Traitement ambulatoire', 'Avis spécialisé différé'],
      correct: 1
    },
    {
      question: 'Quel marqueur biologique est le plus spécifique de l\'infarctus ?',
      options: ['CK', 'CK-MB', 'Troponine', 'LDH'],
      correct: 2
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResponse = (field: string, value: string) => {
    setResponses(prev => ({...prev, [field]: value}));
  };

  const nextStep = () => {
    if (currentStep < scenarioData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const getCurrentStepData = () => scenarioData.steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/ecos" className="flex items-center gap-3 text-white hover:text-emerald-300 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <Stethoscope className="h-6 w-6" />
                <span className="font-semibold">Retour aux ECOS</span>
              </Link>
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
                <div className="text-emerald-300">
                  {scenarioData.id} • {scenarioData.specialty}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Scenario header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{scenarioData.title}</h1>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto bg-black/20 rounded-lg p-4">
              {scenarioData.pitch}
            </p>
          </div>

          {/* Patient info */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{scenarioData.patient.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">{scenarioData.patient.name}</h3>
                  <p className="text-emerald-300">{scenarioData.patient.age} ans • {scenarioData.patient.sex}</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">{scenarioData.patient.background}</p>
            </div>
          </Card>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Progression</span>
              <span className="text-emerald-300">{currentStep + 1}/{scenarioData.steps.length}</span>
            </div>
            <Progress value={((currentStep + 1) / scenarioData.steps.length) * 100} className="h-2" />
          </div>

          {!showQuiz ? (
            <>
              {/* Current step */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-8">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <getCurrentStepData().icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{getCurrentStepData().title}</h2>
                      <p className="text-emerald-300 text-lg">{getCurrentStepData().subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {currentStep === 0 && getCurrentStepData().questions?.map((question, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">{question}</h3>
                        <textarea
                          placeholder="Votre approche..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                          rows={3}
                          onChange={(e) => handleResponse(`question_${index}`, e.target.value)}
                        />
                      </div>
                    ))}

                    {currentStep === 1 && getCurrentStepData().actions?.map((action, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">{action}</h3>
                        <textarea
                          placeholder="Décrivez ce que vous trouvez..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                          rows={2}
                          onChange={(e) => handleResponse(`action_${index}`, e.target.value)}
                        />
                      </div>
                    ))}

                    {currentStep === 2 && getCurrentStepData().elements?.map((element, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">{element}</h3>
                        <textarea
                          placeholder="Votre conclusion..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/40 resize-none"
                          rows={3}
                          onChange={(e) => handleResponse(`element_${index}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <Button
                      onClick={nextStep}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 text-lg"
                    >
                      {currentStep < scenarioData.steps.length - 1 ? 'Étape suivante' : 'Terminer la station'} →
                    </Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <div className="p-8">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  📝 Quiz de validation ECOS
                </h2>
                
                <div className="space-y-6">
                  {quizQuestions.map((question, index) => (
                    <div key={index} className="bg-black/20 rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-4">
                        {index + 1}. {question.question}
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded">
                            <input
                              type="radio"
                              name={`quiz-${index}`}
                              value={optIndex.toString()}
                              onChange={(e) => setQuizAnswers(prev => ({...prev, [index]: e.target.value}))}
                              className="text-emerald-600"
                            />
                            <span className="text-white/80">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 justify-center mt-8">
                  <Link to="/ecos">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      🏥 Autres stations ECOS
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcosScenario;
