import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDuel, type DuelState } from '@/hooks/useDuel';
import canvasConfetti from 'canvas-confetti';
import {
  Swords, Trophy, Timer, Zap, X, Music,
  CheckCircle, XCircle, Crown, Share2, RotateCcw,
  Shield, User, Bot, Flame, ArrowRight
} from 'lucide-react';

// ─── Lobby ───────────────────────────────────────────────
const DuelLobby: React.FC<{ onSearchOnline: () => void; onStartSolo: () => void }> = ({ onSearchOnline, onStartSolo }) => (
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
        Affronte un adversaire sur des quiz médicaux musicaux.
        Le plus rapide et précis l'emporte !
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4 text-center">
      {[
        { icon: Timer, label: '15s/question', desc: 'Temps limité' },
        { icon: Flame, label: 'Combos', desc: 'Bonus série' },
        { icon: Trophy, label: '+XP bonus', desc: 'Récompenses' },
      ].map(({ icon: Icon, label, desc }) => (
        <Card key={label} className="p-4 bg-card">
          <Icon className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="font-semibold text-sm text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </Card>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <Button size="lg" onClick={onSearchOnline} className="flex-1 gap-3 text-lg px-6 py-6 rounded-2xl shadow-large">
        <User className="w-5 h-5" />
        Duel en ligne
      </Button>
      <Button size="lg" variant="outline" onClick={onStartSolo} className="flex-1 gap-3 text-lg px-6 py-6 rounded-2xl border-2 border-primary/30 hover:bg-primary/5">
        <Bot className="w-5 h-5" />
        Entraînement solo
      </Button>
    </div>
  </motion.div>
);

// ─── Searching ───────────────────────────────────────────
const SearchingScreen: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent"
      />
      <Swords className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold text-foreground">Recherche d'un adversaire...</h2>
      <p className="text-muted-foreground">En attente d'un autre étudiant</p>
      <p className="text-xs text-muted-foreground mt-4">Astuce : Invite un ami à ouvrir /duel en même temps !</p>
    </div>
    <Button variant="outline" onClick={onCancel} className="gap-2">
      <X className="w-4 h-4" /> Annuler
    </Button>
  </motion.div>
);

// ─── Countdown ───────────────────────────────────────────
const CountdownScreen: React.FC<{ count: number; opponentName: string; mode: string }> = ({ count, opponentName, mode }) => (
  <motion.div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <div className="flex items-center gap-6 mb-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <User className="w-8 h-8 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">Toi</span>
      </div>
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
        <Swords className="w-8 h-8 text-muted-foreground" />
      </motion.div>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-2">
          {mode === 'solo' ? <Bot className="w-8 h-8 text-accent" /> : <User className="w-8 h-8 text-accent" />}
        </div>
        <span className="text-sm font-medium text-foreground">{opponentName}</span>
      </div>
    </div>
    <h2 className="text-xl font-semibold text-muted-foreground">Le duel commence dans</h2>
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

// ─── Playing ─────────────────────────────────────────────
interface PlayingScreenProps {
  currentRound: number;
  totalRounds: number;
  round: DuelState['rounds'][0] | null;
  roundTimeLeft: number;
  myAnswer: number | null;
  opponentAnswered: boolean;
  playerScore: number;
  opponentScore: number;
  playerStreak: number;
  opponentName: string;
  onAnswer: (idx: number) => void;
}

const PlayingScreen: React.FC<PlayingScreenProps> = ({
  currentRound, totalRounds, round, roundTimeLeft, myAnswer, opponentAnswered,
  playerScore, opponentScore, playerStreak, opponentName, onAnswer,
}) => {
  if (!round) return null;
  const answered = myAnswer !== null;
  const isCorrect = myAnswer === round.correct_answer;
  const maxTime = round.time_limit_seconds || 15;
  const timePercent = (roundTimeLeft / maxTime) * 100;
  const urgentTime = roundTimeLeft <= 5;
  const isFillBlank = round.type === 'fill_blank';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {currentRound}/{totalRounds}
          </Badge>
          {round.item_code && <Badge variant="secondary">{round.item_code}</Badge>}
          {isFillBlank && <Badge className="bg-accent/20 text-accent border-accent/30">🎵 Paroles</Badge>}
        </div>
        <div className={`flex items-center gap-1 font-mono text-lg font-bold ${urgentTime ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
          <Timer className="w-4 h-4" />
          {roundTimeLeft}s
        </div>
      </div>

      {/* Timer bar */}
      <Progress value={timePercent} className={`h-1.5 transition-all ${urgentTime ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`} />

      {/* Scores */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Toi</div>
            <div className="text-2xl font-bold text-primary">{playerScore}</div>
          </div>
          {playerStreak >= 2 && (
            <Badge variant="outline" className="text-warning border-warning/30 gap-1 text-xs">
              <Flame className="w-3 h-3" /> x{playerStreak}
            </Badge>
          )}
        </div>
        <Swords className="w-5 h-5 text-muted-foreground" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground">{opponentName}</div>
          <div className="text-2xl font-bold text-accent">{opponentScore}</div>
          {opponentAnswered && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Badge variant="outline" className="text-[10px] mt-1">✓</Badge>
            </motion.div>
          )}
        </div>
      </div>

      {/* Question / Lyrics */}
      <Card className="p-5 bg-card border-2 border-border">
        {isFillBlank && round.lyrics_line && (
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent font-semibold uppercase tracking-wider">Complète les paroles</span>
          </div>
        )}
        <div className="flex items-start gap-3">
          {!isFillBlank && <Music className="w-5 h-5 text-primary mt-0.5 shrink-0" />}
          <p className={`font-semibold text-foreground ${isFillBlank ? 'text-xl italic' : 'text-lg'}`}>
            {isFillBlank ? round.lyrics_line : round.question}
          </p>
        </div>
      </Card>

      {/* Options */}
      <div className="grid gap-2.5">
        {round.options.map((option, idx) => {
          const letters = ['A', 'B', 'C', 'D'];
          let extraClass = 'hover:bg-primary/5 hover:border-primary/50 cursor-pointer border-border';

          if (answered) {
            extraClass = 'cursor-default border-border';
            if (idx === round.correct_answer) {
              extraClass = 'border-success bg-success/10';
            } else if (idx === myAnswer && !isCorrect) {
              extraClass = 'border-destructive bg-destructive/10';
            }
          }

          return (
            <motion.button
              key={idx}
              whileHover={!answered ? { scale: 1.01 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              onClick={() => !answered && onAnswer(idx)}
              disabled={answered}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${extraClass}`}
            >
              <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0">
                {letters[idx]}
              </span>
              <span className="flex-1 font-medium text-foreground text-sm">{option}</span>
              {answered && idx === round.correct_answer && <CheckCircle className="w-5 h-5 text-success shrink-0" />}
              {answered && idx === myAnswer && !isCorrect && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl text-center font-semibold text-sm ${
              isCorrect ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
            }`}
          >
            {isCorrect ? (
              <>✅ Correct ! +{100 + Math.max(0, roundTimeLeft * 10)}{playerStreak >= 2 ? ` +${playerStreak * 15} combo` : ''} pts</>
            ) : (
              <>❌ Incorrect — Réponse : {round.options[round.correct_answer]}</>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Round Result ────────────────────────────────────────
const RoundResultScreen: React.FC<{
  roundResult: DuelState['roundResults'][0] | undefined;
  playerScore: number;
  opponentScore: number;
  opponentName: string;
  currentRound: number;
  totalRounds: number;
}> = ({ roundResult, playerScore, opponentScore, opponentName, currentRound, totalRounds }) => {
  if (!roundResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto px-4 flex flex-col items-center justify-center min-h-[50vh] gap-6"
    >
      <Badge variant="outline" className="text-sm">Round {currentRound}/{totalRounds}</Badge>

      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className={`text-4xl font-black ${roundResult.correct ? 'text-success' : 'text-destructive'}`}>
            {roundResult.correct ? '✓' : '✗'}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Toi</div>
          <div className="text-lg font-bold text-foreground">+{roundResult.points}</div>
        </div>

        <div className="text-muted-foreground font-bold text-lg">vs</div>

        <div className="text-center">
          <div className={`text-4xl font-black ${roundResult.opponentCorrect ? 'text-success' : 'text-destructive'}`}>
            {roundResult.opponentCorrect ? '✓' : '✗'}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{opponentName}</div>
          <div className="text-lg font-bold text-foreground">+{roundResult.opponentPoints}</div>
        </div>
      </div>

      <div className="w-full max-w-xs bg-muted rounded-full h-3 overflow-hidden relative">
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${playerScore + opponentScore > 0 ? (playerScore / (playerScore + opponentScore)) * 100 : 50}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>
      <div className="flex justify-between w-full max-w-xs text-sm">
        <span className="font-bold text-primary">{playerScore}</span>
        <span className="font-bold text-accent">{opponentScore}</span>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <ArrowRight className="w-4 h-4 animate-pulse" /> Round suivant...
      </div>
    </motion.div>
  );
};

// ─── Results ─────────────────────────────────────────────
const ResultsScreen: React.FC<{
  playerScore: number;
  opponentScore: number;
  opponentName: string;
  isWinner: boolean | null;
  roundResults: DuelState['roundResults'];
  onPlayAgain: () => void;
}> = ({ playerScore, opponentScore, opponentName, isWinner, roundResults, onPlayAgain }) => {
  useEffect(() => {
    if (isWinner === true) {
      canvasConfetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => canvasConfetti({ particleCount: 60, spread: 100, origin: { x: 0.3, y: 0.7 } }), 400);
      setTimeout(() => canvasConfetti({ particleCount: 60, spread: 100, origin: { x: 0.7, y: 0.7 } }), 700);
    }
  }, [isWinner]);

  const accuracy = roundResults.length > 0
    ? Math.round((roundResults.filter(r => r.correct).length / roundResults.length) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4"
    >
      <motion.div initial={{ y: -30 }} animate={{ y: 0 }} transition={{ type: 'spring', bounce: 0.5 }}>
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
          <div className={`text-4xl font-black ${isWinner === true ? 'text-primary' : 'text-foreground'}`}>{playerScore}</div>
        </div>
        <div className="text-2xl text-muted-foreground font-bold">VS</div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">{opponentName}</div>
          <div className={`text-4xl font-black ${isWinner === false ? 'text-accent' : 'text-foreground'}`}>{opponentScore}</div>
        </div>
      </div>

      {/* Round recap */}
      <div className="flex gap-2">
        {roundResults.map((r, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              r.correct ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
            }`}
          >
            {r.correct ? '✓' : '✗'}
          </motion.div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">
        Précision : <span className="font-bold text-foreground">{accuracy}%</span>
      </div>

      {isWinner === true && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
          <Badge className="text-lg px-4 py-2 bg-warning text-warning-foreground">
            <Zap className="w-4 h-4 mr-1" /> +{playerScore} XP
          </Badge>
        </motion.div>
      )}

      <div className="flex gap-3 mt-3">
        <Button onClick={onPlayAgain} size="lg" className="gap-2">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => {
            const text = `${isWinner ? '🏆 Victoire' : '⚔️ Duel'} - ${playerScore} pts (${accuracy}% précision) sur MED-MNG ! 🎵`;
            if (navigator.share) {
              navigator.share({ title: 'Duel Karaoké MED-MNG', text, url: window.location.origin + '/duel' });
            } else {
              navigator.clipboard.writeText(text);
            }
          }}
        >
          <Share2 className="w-4 h-4" /> Partager
        </Button>
      </div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────
const KaraokeDuel: React.FC = () => {
  const duel = useDuel();
  const currentRound = duel.rounds[duel.currentRound - 1] || null;
  const lastResult = duel.roundResults[duel.roundResults.length - 1];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto">
        {duel.status === 'idle' && (
          <DuelLobby onSearchOnline={duel.searchForDuel} onStartSolo={duel.startSoloDuel} />
        )}
        {duel.status === 'searching' && <SearchingScreen onCancel={duel.cancelSearch} />}
        {duel.status === 'countdown' && (
          <CountdownScreen count={duel.countdown} opponentName={duel.opponent.name} mode={duel.mode} />
        )}
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
            playerStreak={duel.player.streak}
            opponentName={duel.opponent.name}
            onAnswer={duel.submitAnswer}
          />
        )}
        {duel.status === 'round_result' && (
          <RoundResultScreen
            roundResult={lastResult}
            playerScore={duel.player.score}
            opponentScore={duel.opponent.score}
            opponentName={duel.opponent.name}
            currentRound={duel.currentRound}
            totalRounds={duel.totalRounds}
          />
        )}
        {duel.status === 'finished' && (
          <ResultsScreen
            playerScore={duel.player.score}
            opponentScore={duel.opponent.score}
            opponentName={duel.opponent.name}
            isWinner={duel.winnerId === null ? null : duel.winnerId === duel.player.id}
            roundResults={duel.roundResults}
            onPlayAgain={duel.resetDuel}
          />
        )}
      </div>
    </div>
  );
};

export default KaraokeDuel;
