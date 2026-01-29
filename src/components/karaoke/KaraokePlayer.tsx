import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, Pause, Music, Star, Trophy, CheckCircle, XCircle, 
  Mic, Volume2, SkipForward, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface LyricsLine {
  time: number;
  text: string;
  blanks?: { position: number; term: string; hint?: string }[];
}

interface QCMQuestion {
  time: number;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface KaraokePlayerProps {
  audioUrl: string;
  lyrics: LyricsLine[];
  qcmQuestions?: QCMQuestion[];
  title: string;
  itemCode?: string;
  onSessionComplete?: (score: number, maxScore: number) => void;
}

export const KaraokePlayer: React.FC<KaraokePlayerProps> = ({
  audioUrl,
  lyrics,
  qcmQuestions = [],
  title,
  itemCode,
  onSessionComplete
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  
  // Fill-the-blank state
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [blankResults, setBlankResults] = useState<Record<string, boolean>>({});
  const [blankScore, setBlankScore] = useState({ correct: 0, total: 0 });
  
  // QCM state
  const [activeQCM, setActiveQCM] = useState<QCMQuestion | null>(null);
  const [qcmAnswered, setQcmAnswered] = useState<Set<number>>(new Set());
  const [qcmScore, setQcmScore] = useState({ correct: 0, total: 0 });
  const [showQCMResult, setShowQCMResult] = useState<{ correct: boolean; explanation?: string } | null>(null);
  
  // Session state
  const [sessionComplete, setSessionComplete] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  // Audio handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      
      // Update current lyric
      const newIndex = lyrics.findIndex((lyric, idx) => {
        const next = lyrics[idx + 1];
        return time >= lyric.time && (!next || time < next.time);
      });
      setCurrentLyricIndex(newIndex);
      
      // Check for QCM popup
      const pendingQCM = qcmQuestions.find(q => 
        time >= q.time && 
        time < q.time + 1 && 
        !qcmAnswered.has(q.time)
      );
      if (pendingQCM && !activeQCM) {
        audio.pause();
        setIsPlaying(false);
        setActiveQCM(pendingQCM);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      handleSessionEnd();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [lyrics, qcmQuestions, activeQCM, qcmAnswered]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const currentEl = container.children[currentLyricIndex] as HTMLElement;
      currentEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLyricIndex]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || activeQCM) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, activeQCM]);

  const handleBlankInput = (lineIdx: number, blankIdx: number, value: string) => {
    const key = `${lineIdx}-${blankIdx}`;
    setUserInputs(prev => ({ ...prev, [key]: value }));
  };

  const validateBlank = (lineIdx: number, blankIdx: number, correctTerm: string) => {
    const key = `${lineIdx}-${blankIdx}`;
    const userInput = userInputs[key] || '';
    const isCorrect = userInput.toLowerCase().trim() === correctTerm.toLowerCase().trim();
    
    setBlankResults(prev => ({ ...prev, [key]: isCorrect }));
    setBlankScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    if (isCorrect) {
      setTotalXP(prev => prev + 10);
      toast.success('+10 XP');
    }
  };

  const handleQCMAnswer = (optionIndex: number) => {
    if (!activeQCM) return;
    
    const isCorrect = optionIndex === activeQCM.correct;
    setShowQCMResult({ correct: isCorrect, explanation: activeQCM.explanation });
    setQcmAnswered(prev => new Set([...prev, activeQCM.time]));
    setQcmScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    if (isCorrect) {
      setTotalXP(prev => prev + 25);
      toast.success('+25 XP - Bonne réponse !');
    }
    
    setTimeout(() => {
      setActiveQCM(null);
      setShowQCMResult(null);
      audioRef.current?.play();
      setIsPlaying(true);
    }, 2000);
  };

  const handleSessionEnd = () => {
    setSessionComplete(true);
    const totalScore = blankScore.correct * 10 + qcmScore.correct * 25;
    const maxScore = blankScore.total * 10 + qcmScore.total * 25;
    onSessionComplete?.(totalScore, maxScore);
  };

  const restartSession = () => {
    setUserInputs({});
    setBlankResults({});
    setBlankScore({ correct: 0, total: 0 });
    setQcmAnswered(new Set());
    setQcmScore({ correct: 0, total: 0 });
    setSessionComplete(false);
    setTotalXP(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const renderLyricLine = (line: LyricsLine, idx: number) => {
    const isCurrent = idx === currentLyricIndex;
    const isPast = idx < currentLyricIndex;
    
    if (!line.blanks?.length) {
      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0.5, scale: 0.98 }}
          animate={{ 
            opacity: isCurrent ? 1 : isPast ? 0.6 : 0.8,
            scale: isCurrent ? 1.02 : 1,
            backgroundColor: isCurrent ? 'hsl(var(--primary) / 0.15)' : 'transparent'
          }}
          className={`p-3 rounded-lg transition-all cursor-pointer ${
            isCurrent ? 'border-l-4 border-primary font-semibold text-primary' : ''
          }`}
        >
          {line.text}
        </motion.div>
      );
    }

    // Render line with blanks
    let textParts: React.ReactNode[] = [];
    let lastIdx = 0;
    
    line.blanks.forEach((blank, blankIdx) => {
      const key = `${idx}-${blankIdx}`;
      const result = blankResults[key];
      
      textParts.push(
        <span key={`text-${blankIdx}`}>{line.text.slice(lastIdx, blank.position)}</span>
      );
      
      textParts.push(
        <span key={`blank-${blankIdx}`} className="inline-flex items-center mx-1">
          <Input
            value={userInputs[key] || ''}
            onChange={(e) => handleBlankInput(idx, blankIdx, e.target.value)}
            onBlur={() => validateBlank(idx, blankIdx, blank.term)}
            placeholder={blank.hint || '___'}
            className={`w-24 h-7 text-sm text-center ${
              result === true ? 'border-green-500 bg-green-50' :
              result === false ? 'border-red-500 bg-red-50' : ''
            }`}
            disabled={result !== undefined}
          />
          {result === true && <CheckCircle className="h-4 w-4 text-success ml-1" />}
          {result === false && <XCircle className="h-4 w-4 text-destructive ml-1" />}
        </span>
      );
      
      lastIdx = blank.position + blank.term.length;
    });
    
    textParts.push(<span key="text-end">{line.text.slice(lastIdx)}</span>);

    return (
      <motion.div
        key={idx}
        initial={{ opacity: 0.5 }}
        animate={{ 
          opacity: isCurrent ? 1 : 0.8,
          backgroundColor: isCurrent ? 'hsl(var(--primary) / 0.15)' : 'transparent'
        }}
        className={`p-3 rounded-lg ${isCurrent ? 'border-l-4 border-primary' : ''}`}
      >
        {textParts}
      </motion.div>
    );
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Mode Karaoké - {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              {totalXP} XP
            </Badge>
            {itemCode && <Badge variant="secondary">{itemCode}</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button 
            onClick={togglePlayPause} 
            size="lg"
            disabled={!!activeQCM}
            className="gap-2"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {isPlaying ? 'Pause' : 'Écouter'}
          </Button>
          <Button variant="outline" onClick={restartSession} size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Lyrics Display */}
        <div 
          ref={lyricsContainerRef}
          className="max-h-64 overflow-y-auto bg-background/80 rounded-lg border p-4 space-y-1"
        >
          {lyrics.map((line, idx) => renderLyricLine(line, idx))}
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Fill-the-blank</div>
            <div className="text-xl font-bold text-primary">
              {blankScore.correct}/{blankScore.total}
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-sm text-muted-foreground">Quiz QCM</div>
            <div className="text-xl font-bold text-accent">
              {qcmScore.correct}/{qcmScore.total}
            </div>
          </Card>
        </div>

        {/* QCM Popup */}
        <AnimatePresence>
          {activeQCM && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-background/95 flex items-center justify-center p-6"
            >
              <Card className="w-full max-w-md p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">Quiz Flash !</span>
                  <Badge variant="outline">10s</Badge>
                </div>
                
                <p className="text-lg font-medium">{activeQCM.question}</p>
                
                {showQCMResult ? (
                  <div className={`p-4 rounded-lg ${showQCMResult.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {showQCMResult.correct ? '✅ Correct !' : '❌ Incorrect'}
                    {showQCMResult.explanation && (
                      <p className="mt-2 text-sm">{showQCMResult.explanation}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeQCM.options.map((option, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => handleQCMAnswer(idx)}
                      >
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Complete */}
        <AnimatePresence>
          {sessionComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-background/95 flex items-center justify-center"
            >
              <Card className="p-8 text-center space-y-4">
                <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
                <h3 className="text-2xl font-bold">Session terminée !</h3>
                <p className="text-muted-foreground">
                  Score: {blankScore.correct * 10 + qcmScore.correct * 25} / {blankScore.total * 10 + qcmScore.total * 25} points
                </p>
                <div className="text-3xl font-bold text-primary">+{totalXP} XP</div>
                <Button onClick={restartSession} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Recommencer
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
