import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedProgressRing } from "@/components/ui/animated-progress-ring";
import { ConfettiExplosion } from "@/components/ui/confetti-explosion";
import { motion } from "framer-motion";
import { Trophy, Medal, Target, Clock, RotateCcw, TrendingUp, Sparkles } from "lucide-react";

interface QuizResultsCardProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  onRestart: () => void;
  onViewStats: () => void;
}

export function QuizResultsCard({
  score,
  totalQuestions,
  correctAnswers,
  timeSpent,
  onRestart,
  onViewStats
}: QuizResultsCardProps) {
  const isPerfect = score === 100;
  const isGood = score >= 80;
  const isPass = score >= 60;

  const getGrade = () => {
    if (isPerfect) return { label: "Parfait !", icon: Trophy, color: "text-warning" };
    if (isGood) return { label: "Excellent !", icon: Medal, color: "text-success" };
    if (isPass) return { label: "Bien joué !", icon: Target, color: "text-primary" };
    return { label: "Continuez !", icon: TrendingUp, color: "text-muted-foreground" };
  };

  const grade = getGrade();
  const GradeIcon = grade.icon;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <ConfettiExplosion trigger={isPerfect} type="gold" />
      <ConfettiExplosion trigger={isGood && !isPerfect} type="celebration" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center overflow-hidden">
          {/* Header gradient */}
          <div className={`h-2 bg-gradient-to-r ${
            isPerfect ? "from-warning via-accent to-warning" :
            isGood ? "from-success via-primary to-success" :
            isPass ? "from-primary via-accent to-primary" :
            "from-muted to-muted"
          }`} />

          <CardContent className="p-8 space-y-6">
            {/* Grade icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-background to-muted flex items-center justify-center shadow-lg ${
                isPerfect ? "ring-4 ring-warning/50" : ""
              }`}>
                <GradeIcon className={`h-10 w-10 ${grade.color}`} />
              </div>
            </motion.div>

            {/* Grade label */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-3xl font-bold ${grade.color}`}
            >
              {grade.label}
            </motion.h2>

            {/* Score ring */}
            <div className="flex justify-center">
              <AnimatedProgressRing
                value={score}
                size={140}
                strokeWidth={12}
                color={isPerfect ? "warning" : isGood ? "success" : "primary"}
              />
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="bg-muted/50 rounded-lg p-4">
                <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{correctAnswers}/{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Bonnes réponses</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <Sparkles className="h-5 w-5 mx-auto mb-1 text-accent" />
                <p className="text-2xl font-bold">+{isPerfect ? 100 : 50}</p>
                <p className="text-xs text-muted-foreground">Points gagnés</p>
              </div>
              {timeSpent && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
                  <p className="text-xs text-muted-foreground">Temps</p>
                </div>
              )}
            </motion.div>

            {/* Badges earned */}
            {isPerfect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                <Badge className="bg-gradient-to-r from-warning to-accent text-white gap-2 px-4 py-2">
                  <Trophy className="h-4 w-4" />
                  Badge "Score Parfait" débloqué !
                </Badge>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex gap-4 justify-center pt-4"
            >
              <Button variant="outline" onClick={onRestart} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Recommencer
              </Button>
              <Button onClick={onViewStats} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Voir mes stats
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
