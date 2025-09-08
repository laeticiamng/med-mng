import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Repeat,
  Shuffle,
  Music,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Timer,
  Brain,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatedProgress } from './AnimatedComponents';

interface InteractiveMusicPlayerProps {
  track?: {
    title: string;
    artist: string;
    duration: number;
    audioUrl: string;
    imageUrl?: string;
  };
  className?: string;
}

export const InteractiveMusicPlayer: React.FC<InteractiveMusicPlayerProps> = ({ 
  track,
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [track]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (values: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (values[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (values: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    setVolume(values);
    audio.volume = values[0] / 100;
    setIsMuted(values[0] === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setVolume([75]);
      audio.volume = 0.75;
      setIsMuted(false);
    } else {
      setVolume([0]);
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!track) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-2" />
            <p>Aucune piste sélectionnée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {track.imageUrl && (
              <motion.img
                src={track.imageUrl}
                alt={track.title}
                className="w-16 h-16 rounded-lg object-cover"
                whileHover={{ scale: 1.05 }}
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{track.title}</CardTitle>
              <p className="text-muted-foreground">{track.artist}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsShuffle(!isShuffle)}
              className={isShuffle ? "bg-primary/10" : ""}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="icon" onClick={togglePlayPause}>
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
            
            <Button variant="outline" size="icon">
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsRepeat(!isRepeat)}
              className={isRepeat ? "bg-primary/10" : ""}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={track.audioUrl}
            preload="metadata"
            loop={isRepeat}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  className?: string;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ 
  questions, 
  onComplete, 
  className = "" 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { toast } = useToast();

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleFinishQuiz();
    }
  }, [timeLeft, showResults]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    const score = calculateScore();
    setShowResults(true);
    onComplete(score);
    
    if (score >= 80) {
      toast({
        title: "Excellent !",
        description: `Score: ${score}% - Félicitations !`,
        duration: 5000,
      });
    } else if (score >= 60) {
      toast({
        title: "Bien joué !",
        description: `Score: ${score}% - Continue comme ça !`,
        duration: 5000,
      });
    } else {
      toast({
        title: "À améliorer",
        description: `Score: ${score}% - Révise et réessaie !`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const calculateScore = () => {
    const correctAnswers = questions.filter((question, index) => 
      selectedAnswers[index] === question.correctAnswer
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Résultats du Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">
              {score}%
            </div>
            <p className="text-muted-foreground">
              {questions.filter((_, index) => selectedAnswers[index] === questions[index].correctAnswer).length} sur {questions.length} bonnes réponses
            </p>
            
            <AnimatedProgress value={score} label="Score final" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-500">
                  {questions.filter((_, index) => selectedAnswers[index] === questions[index].correctAnswer).length}
                </div>
                <p className="text-sm text-muted-foreground">Correctes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-500">
                  {questions.filter((_, index) => selectedAnswers[index] !== undefined && selectedAnswers[index] !== questions[index].correctAnswer).length}
                </div>
                <p className="text-sm text-muted-foreground">Incorrectes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-500">
                  {questions.filter((_, index) => selectedAnswers[index] === undefined).length}
                </div>
                <p className="text-sm text-muted-foreground">Non répondues</p>
              </div>
            </div>
            
            <Button onClick={() => window.location.reload()} className="mt-6">
              Recommencer le quiz
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1} / {questions.length}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant={timeLeft < 60 ? "destructive" : "secondary"}>
                {formatTime(timeLeft)}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <h3 className="text-xl font-medium">{currentQuestion.question}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedAnswers[currentQuestionIndex] === index ? "default" : "outline"}
                  className="w-full justify-start text-left p-4 h-auto"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Précédent
            </Button>
            
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
            >
              {currentQuestionIndex === questions.length - 1 ? "Terminer" : "Suivant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface StudyTimerProps {
  onComplete: () => void;
  className?: string;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ onComplete, className = "" }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          if (!isBreak) {
            setSessionsCompleted(prev => prev + 1);
            onComplete();
          }
          handleTimerComplete();
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval!);
    }
    
    return () => clearInterval(interval!);
  }, [isActive, minutes, seconds, isBreak, onComplete]);

  const handleTimerComplete = () => {
    if (isBreak) {
      // End break, start new work session
      setMinutes(25);
      setSeconds(0);
      setIsBreak(false);
    } else {
      // End work session, start break
      const breakDuration = sessionsCompleted % 4 === 3 ? 15 : 5; // Long break every 4 sessions
      setMinutes(breakDuration);
      setSeconds(0);
      setIsBreak(true);
      setIsActive(true); // Auto-start break
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
  };

  const progress = isBreak 
    ? ((15 - minutes - seconds / 60) / 15) * 100
    : ((25 - minutes - seconds / 60) / 25) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Clock className="h-5 w-5" />
            {isBreak ? "Temps de pause" : "Session d'étude"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="text-6xl font-bold text-primary">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-center gap-4">
            <Button onClick={toggleTimer} size="lg">
              {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              Reset
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Sessions terminées: {sessionsCompleted}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full ${
                  index < sessionsCompleted % 4 ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main InteractiveStudyTools component that combines all tools
const InteractiveStudyTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quiz');

  const sampleQuestions = [
    {
      id: '1',
      question: 'Quels sont les principaux signes cliniques de l\'infarctus du myocarde ?',
      options: [
        'Douleur thoracique, dyspnée, nausées',
        'Fièvre, maux de tête, fatigue',
        'Toux, expectorations, dyspnée',
        'Douleur abdominale, vomissements'
      ],
      correctAnswer: 0,
      explanation: 'L\'infarctus du myocarde se manifeste typiquement par une douleur thoracique intense, de la dyspnée et des nausées.'
    },
    {
      id: '2',
      question: 'Quelle est la valeur normale de la pression artérielle systolique ?',
      options: ['90-110 mmHg', '120-140 mmHg', '100-120 mmHg', '140-160 mmHg'],
      correctAnswer: 2,
      explanation: 'La pression artérielle systolique normale est généralement comprise entre 100 et 120 mmHg.'
    }
  ];

  const sampleTrack = {
    title: 'Musique de Concentration',
    artist: 'MED-MNG',
    duration: 180,
    audioUrl: '/sample-audio.mp3',
    imageUrl: '/sample-cover.jpg'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Outils d'Étude Interactifs</h1>
        <p className="text-muted-foreground">
          Optimisez votre apprentissage avec nos outils intégrés
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Quiz Médical
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Timer Pomodoro
          </TabsTrigger>
          <TabsTrigger value="music" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Musique d'Étude
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="mt-6">
          <InteractiveQuiz 
            questions={sampleQuestions}
            onComplete={(score) => {
              console.log('Quiz completed with score:', score);
            }}
          />
        </TabsContent>

        <TabsContent value="timer" className="mt-6">
          <StudyTimer 
            onComplete={() => {
              console.log('Study session completed');
            }}
          />
        </TabsContent>

        <TabsContent value="music" className="mt-6">
          <InteractiveMusicPlayer track={sampleTrack} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveStudyTools;
