import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailySRSPlaylist, type SRSPlaylistItem } from '@/hooks/useDailySRSPlaylist';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Play, Pause, SkipForward, SkipBack, ListMusic, Brain,
  Flame, CheckCircle, AlertTriangle, Clock, Music2,
  Sparkles, RefreshCw, ThumbsUp, ThumbsDown, ArrowLeft,
  Zap, Target, TrendingUp, Shuffle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const riskColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const riskLabels = {
  critical: 'Critique',
  high: 'Urgent',
  medium: 'À revoir',
  low: 'Stable',
};

const RetentionGauge: React.FC<{ value: number }> = ({ value }) => {
  const color = value < 30 ? 'text-red-400' : value < 50 ? 'text-orange-400' : value < 70 ? 'text-yellow-400' : 'text-emerald-400';
  const bgColor = value < 30 ? 'stroke-red-500/30' : value < 50 ? 'stroke-orange-500/30' : value < 70 ? 'stroke-yellow-500/30' : 'stroke-emerald-500/30';
  const fgColor = value < 30 ? 'stroke-red-400' : value < 50 ? 'stroke-orange-400' : value < 70 ? 'stroke-yellow-400' : 'stroke-emerald-400';

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3" className={bgColor} />
        <circle
          cx="18" cy="18" r="14" fill="none" strokeWidth="3"
          className={fgColor}
          strokeDasharray={`${(value / 100) * 88} 88`}
          strokeLinecap="round"
        />
      </svg>
      <span className={cn('absolute text-[10px] font-bold', color)}>{value}%</span>
    </div>
  );
};

const PlaylistItemRow: React.FC<{
  item: SRSPlaylistItem;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onPlay: () => void;
}> = ({ item, index, isActive, isCompleted, onPlay }) => (
  <motion.button
    onClick={onPlay}
    className={cn(
      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
      isActive
        ? 'bg-primary/15 border border-primary/30 shadow-lg shadow-primary/5'
        : 'hover:bg-muted/50 border border-transparent',
      isCompleted && !isActive && 'opacity-60'
    )}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    {/* Index / Status */}
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
      {isCompleted ? (
        <CheckCircle className="w-5 h-5 text-emerald-400" />
      ) : isActive ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Music2 className="w-5 h-5 text-primary" />
        </motion.div>
      ) : (
        <span className="text-muted-foreground">{index + 1}</span>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-primary/80">{item.itemCode}</span>
        {item.isNew && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-500/20 text-blue-400 border-blue-500/30">
            Nouveau
          </Badge>
        )}
      </div>
      <p className="text-sm font-medium truncate text-foreground">{item.title}</p>
      {item.specialty && (
        <p className="text-xs text-muted-foreground truncate">{item.specialty}</p>
      )}
    </div>

    {/* Risk Badge */}
    <Badge variant="outline" className={cn('text-[10px] shrink-0', riskColors[item.riskLevel])}>
      {riskLabels[item.riskLevel]}
    </Badge>

    {/* Retention Gauge */}
    <RetentionGauge value={item.retentionProbability} />
  </motion.button>
);

const DailySRSPlaylist: React.FC = () => {
  const navigate = useNavigate();
  const {
    items, currentIndex, isAutoPlaying, loading, totalDue,
    completedCount, currentItem, playItem, startAutoPlay,
    playNext, playPrevious, toggleAutoPlay, markReviewed,
    generatePlaylist,
  } = useDailySRSPlaylist();
  const { isPlaying, pause, resume, currentTime, duration } = useGlobalAudio();
  const [reviewingIndex, setReviewingIndex] = useState<number | null>(null);

  const progressPercent = totalDue > 0 ? (completedCount / totalDue) * 100 : 0;
  const criticalCount = items.filter(i => i.riskLevel === 'critical').length;
  const newCount = items.filter(i => i.isNew).length;

  const handleReview = async (quality: number) => {
    await markReviewed(quality);
    setReviewingIndex(null);
    if (isAutoPlaying) {
      playNext();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <Brain className="w-12 h-12 text-primary" />
        </motion.div>
        <p className="ml-4 text-lg text-muted-foreground">Analyse SM-2 en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Playlist SRS du jour
                </h1>
                <p className="text-xs text-muted-foreground">
                  {totalDue} item{totalDue > 1 ? 's' : ''} à réviser • Algorithme SM-2
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={generatePlaylist}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress bar */}
          {totalDue > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{completedCount}/{totalDue} écoutés</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <Target className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{totalDue}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">À réviser</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critiques</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-400">{newCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nouveaux</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Tout est à jour ! 🎉</h2>
              <p className="text-muted-foreground mb-4">
                Aucun item à réviser aujourd'hui. Ta mémoire est au top !
              </p>
              <Button variant="outline" onClick={() => navigate('/edn-complete')}>
                Explorer de nouveaux items
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Now Playing Card */}
        <AnimatePresence>
          {currentItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Music2 className="w-4 h-4 text-primary" />
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                      En lecture • {currentIndex + 1}/{items.length}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-1">{currentItem.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="font-mono text-primary/80">{currentItem.itemCode}</span>
                    {currentItem.specialty && (
                      <>
                        <span>•</span>
                        <span>{currentItem.specialty}</span>
                      </>
                    )}
                  </div>

                  {/* Playback Progress */}
                  <div className="mb-4">
                    <Progress value={duration > 0 ? (currentTime / duration) * 100 : 0} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="ghost" size="icon" onClick={playPrevious} disabled={currentIndex <= 0}>
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90"
                      onClick={() => isPlaying ? pause() : resume()}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={playNext} disabled={currentIndex >= items.length - 1}>
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Auto-play toggle */}
                  <div className="flex justify-center mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAutoPlay}
                      className={cn(isAutoPlaying && 'text-primary')}
                    >
                      <ListMusic className="w-4 h-4 mr-1" />
                      Auto-enchaînement {isAutoPlaying ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  {/* SRS Review Buttons */}
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      <Brain className="w-3 h-3 inline mr-1" />
                      Comment juges-tu ta mémorisation ?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { q: 1, label: 'Oublié', icon: ThumbsDown, color: 'text-red-400 hover:bg-red-500/10' },
                        { q: 3, label: 'Difficile', icon: AlertTriangle, color: 'text-orange-400 hover:bg-orange-500/10' },
                        { q: 4, label: 'Correct', icon: CheckCircle, color: 'text-yellow-400 hover:bg-yellow-500/10' },
                        { q: 5, label: 'Facile', icon: ThumbsUp, color: 'text-emerald-400 hover:bg-emerald-500/10' },
                      ].map(({ q, label, icon: Icon, color }) => (
                        <Button
                          key={q}
                          variant="ghost"
                          size="sm"
                          className={cn('flex-col h-auto py-2', color)}
                          onClick={() => handleReview(q)}
                        >
                          <Icon className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px]">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        {items.length > 0 && currentIndex < 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <Button
              size="lg"
              onClick={startAutoPlay}
              className="gap-2 text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90"
            >
              <Play className="w-6 h-6" />
              Lancer la session ({totalDue} items)
            </Button>
          </motion.div>
        )}

        {/* Playlist Queue */}
        {items.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListMusic className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                File d'attente
              </h3>
            </div>
            <div className="space-y-1">
              {items.map((item, i) => (
                <PlaylistItemRow
                  key={item.id}
                  item={item}
                  index={i}
                  isActive={i === currentIndex}
                  isCompleted={i < completedCount}
                  onPlay={() => playItem(i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Session completed */}
        <AnimatePresence>
          {completedCount === totalDue && totalDue > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 to-card border-emerald-500/20">
                <CardContent className="py-8 text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: 3, duration: 0.5 }}
                  >
                    <Flame className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Session terminée ! 🏆</h2>
                  <p className="text-muted-foreground mb-1">
                    {totalDue} item{totalDue > 1 ? 's' : ''} révisé{totalDue > 1 ? 's' : ''} avec succès
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Ta rétention s'améliore à chaque session
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate('/progress-dashboard')}>
                      Voir mes progrès
                    </Button>
                    <Button onClick={generatePlaylist} className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Nouvelle session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default DailySRSPlaylist;
