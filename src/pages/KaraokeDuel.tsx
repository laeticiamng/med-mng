import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDuel } from '@/hooks/useDuel';
import { 
  Swords, Trophy, Timer, Zap, X, Music, 
  CheckCircle, XCircle, Crown, Share2, RotateCcw, Loader2, Shield
} from 'lucide-react';

const DuelLobby: React.FC<{ onSearch: () => void }> = ({ onSearch }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }} 
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4"
  >
    <motion.div 
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="relative"
    >
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-large">
        <Swords className="w-16 h-16 text-primary-foreground" />
      </div>
      <div className="absolute -top-2 -right-2">
        <Badge className="bg-destructive text-destructive-foreground animate-pulse-glow">LIVE</Badge>
      </div>
    </motion.div>

    <div className="text-center space-y-3">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Duel Karaoké
      </h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Affronte un autre étudiant en temps réel sur des questions médicales musicales. 
        Le plus rapide et le plus précis l'emporte !
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4 text-center">
      {[
        { icon: Timer, label: '15s/question', desc: 'Temps limité' },
        { icon: Zap, label: '5 rounds', desc: 'Quiz rapides' },
        { icon: Trophy, label: '+XP bonus', desc: 'Récompenses' },
      ].map(({ icon: Icon, label, desc }) => (
        <Card key={label} className="p-4 bg-card">
          <Icon className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="font-semibold text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </Card>
      ))}
    </div>

    <Button size="lg" onClick={onSearch} className="gap-3 text-lg px-8 py-6 rounded-2xl shadow-large">
      <Swords className="w-6 h-6" />
      Trouver un adversaire
    </Button>
  </motion.div>
);

const SearchingScreen: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent"
    />
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold text-foreground">Recherche d'un adversaire...</h2>
      <p className="text-muted-foreground">En attente d'un autre étudiant</p>
    </div>
    <Button variant="outline" onClick={onCancel} className="gap-2">
      <X className="w-4 h-4" /> Annuler
    </Button>
  </motion.div>
);

const CountdownScreen: React.FC<{ count: number; opponentName: string }> = ({ count, opponentName }) => (
  <motion.div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <div className="text-center space-y-2">
      <Badge variant="secondary" className="text-sm mb-4">
        <Shield className="w-3 h-3 mr-1" /> vs {opponentName}
      </Badge>
      <h2 className="text-xl font-semibold text-muted-foreground">Le duel commence dans</h2>
    </div>
    <AnimatePresence mode="wait">
      <motion.div
        key={count}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 2, opacity: 0 }}
        className="text-8xl font-black text-primary"
      >
        {count}
      </motion.div>
    </AnimatePresence>
  </motion.div>
);

interface PlayingScreenProps {
  currentRound: number;
  totalRounds: number;
  round: { question: string; options: string[]; correct_answer: number; item_code: string | null } | null;
  roundTimeLeft: number;
  myAnswer: number | null;
  opponentAnswered: boolean;
  playerScore: number;
  opponentScore: number;
  opponentName: string;
  onAnswer: (idx: number) => void;
}

const PlayingScreen: React.FC<PlayingScreenProps> = ({
  currentRound, totalRounds, round, roundTimeLeft, myAnswer, opponentAnswered,
  playerScore, opponentScore, opponentName, onAnswer
}) => {
  if (!round) return null;
  const answered = myAnswer !== null;
  const isCorrect = myAnswer === round.correct_answer;
  const timePercent = (roundTimeLeft / 15) * 100;
  const urgentTime = roundTimeLeft <= 5;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Round {currentRound}/{totalRounds}</Badge>
          {round.item_code && <Badge variant="secondary">{round.item_code}</Badge>}
        </div>
        <div className={`flex items-center gap-1 font-mono text-lg font-bold ${urgentTime ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <Timer className="w-4 h-4" />
          {roundTimeLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <Progress value={timePercent} className={`h-2 ${urgentTime ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`} />

      {/* Scores */}
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Toi</div>
          <div className="text-2xl font-bold text-primary">{playerScore}</div>
        </div>
        <Swords className="w-6 h-6 text-muted-foreground" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{opponentName}</div>
          <div className="text-2xl font-bold text-accent">{opponentScore}</div>
          {opponentAnswered && <Badge variant="outline" className="text-[10px] mt-1">A répondu ✓</Badge>}
        </div>
      </div>

      {/* Question */}
      <Card className="p-6 bg-card border-2">
        <div className="flex items-start gap-3">
          <Music className="w-5 h-5 text-primary mt-1 shrink-0" />
          <p className="text-lg font-semibold text-foreground">{round.question}</p>
        </div>
      </Card>

      {/* Options */}
      <div className="grid gap-3">
        {round.options.map((option, idx) => {
          const letters = ['A', 'B', 'C', 'D'];
          let variant: 'outline' | 'default' | 'destructive' = 'outline';
          let extraClass = 'hover:bg-primary/5 hover:border-primary cursor-pointer';
          
          if (answered) {
            extraClass = 'cursor-default';
            if (idx === round.correct_answer) {
              extraClass += ' border-success bg-success/10';
            } else if (idx === myAnswer && !isCorrect) {
              extraClass += ' border-destructive bg-destructive/10';
            }
          }

          return (
            <motion.button
              key={idx}
              whileHover={!answered ? { scale: 1.01 } : {}}
              whileTap={!answered ? { scale: 0.99 } : {}}
              onClick={() => !answered && onAnswer(idx)}
              disabled={answered}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${extraClass}`}
            >
              <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-sm shrink-0">
                {letters[idx]}
              </span>
              <span className="flex-1 font-medium text-foreground">{option}</span>
              {answered && idx === round.correct_answer && <CheckCircle className="w-5 h-5 text-success shrink-0" />}
              {answered && idx === myAnswer && !isCorrect && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Answer feedback */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-center font-semibold ${
              isCorrect ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
            }`}
          >
            {isCorrect ? `✅ Correct ! +${100 + Math.max(0, roundTimeLeft * 10)} pts` : '❌ Incorrect'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ResultsScreenProps {
  playerScore: number;
  opponentScore: number;
  opponentName: string;
  isWinner: boolean | null; // null = draw
  onPlayAgain: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ playerScore, opponentScore, opponentName, isWinner, onPlayAgain }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4"
  >
    <motion.div
      initial={{ y: -30 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', bounce: 0.5 }}
    >
      {isWinner === true && <Crown className="w-20 h-20 text-warning mx-auto" />}
      {isWinner === false && <Shield className="w-20 h-20 text-muted-foreground mx-auto" />}
      {isWinner === null && <Swords className="w-20 h-20 text-primary mx-auto" />}
    </motion.div>

    <h2 className="text-3xl font-bold text-foreground">
      {isWinner === true ? '🎉 Victoire !' : isWinner === false ? 'Défaite...' : 'Égalité !'}
    </h2>

    <div className="flex items-center gap-8">
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-1">Toi</div>
        <div className={`text-4xl font-black ${isWinner === true ? 'text-primary' : 'text-foreground'}`}>
          {playerScore}
        </div>
      </div>
      <div className="text-2xl text-muted-foreground font-bold">VS</div>
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-1">{opponentName}</div>
        <div className={`text-4xl font-black ${isWinner === false ? 'text-accent' : 'text-foreground'}`}>
          {opponentScore}
        </div>
      </div>
    </div>

    {isWinner === true && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Badge className="text-lg px-4 py-2 bg-warning text-warning-foreground">
          <Zap className="w-4 h-4 mr-1" /> +{playerScore} XP
        </Badge>
      </motion.div>
    )}

    <div className="flex gap-3 mt-4">
      <Button onClick={onPlayAgain} size="lg" className="gap-2">
        <RotateCcw className="w-4 h-4" /> Rejouer
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="gap-2"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Duel Karaoké MED-MNG',
              text: `J'ai marqué ${playerScore} pts dans un duel karaoké médical ! 🎵⚔️`,
              url: window.location.origin + '/duel',
            });
          }
        }}
      >
        <Share2 className="w-4 h-4" /> Partager
      </Button>
    </div>
  </motion.div>
);

const KaraokeDuel: React.FC = () => {
  const duel = useDuel();
  const currentRound = duel.rounds[duel.currentRound - 1] || null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto">
        {duel.status === 'idle' && <DuelLobby onSearch={duel.searchForDuel} />}
        {duel.status === 'searching' && <SearchingScreen onCancel={duel.cancelSearch} />}
        {duel.status === 'countdown' && <CountdownScreen count={duel.countdown} opponentName={duel.opponent.name} />}
        {duel.status === 'playing' && (
          <PlayingScreen
            currentRound={duel.currentRound}
            totalRounds={duel.totalRounds}
            round={currentRound}
            roundTimeLeft={duel.roundTimeLeft}
            myAnswer={duel.myAnswer}
            opponentAnswered={duel.opponentAnswered}
            playerScore={duel.player.score}
            opponentScore={duel.opponent.score}
            opponentName={duel.opponent.name}
            onAnswer={duel.submitAnswer}
          />
        )}
        {duel.status === 'finished' && (
          <ResultsScreen
            playerScore={duel.player.score}
            opponentScore={duel.opponent.score}
            opponentName={duel.opponent.name}
            isWinner={duel.winnerId === null ? null : duel.winnerId === duel.player.id}
            onPlayAgain={duel.resetDuel}
          />
        )}
      </div>
    </div>
  );
};

export default KaraokeDuel;
