import { useParams, Link } from 'react-router-dom';
import { 
  usePathDetail, useUserPathProgress, useUserStepProgresses,
  useStartPath, useCompleteStep, useCertifyPath 
} from '@/hooks/useSpecialtyPaths';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, CheckCircle2, Circle, Lock, Play, Trophy, 
  Award, BookOpen, Clock, Flag, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const SpecialtyPathDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePathDetail(slug || '');
  const path = data?.path;
  const steps = data?.steps || [];

  const { data: userProgress } = useUserPathProgress(path?.id);
  const stepIds = steps.map(s => s.id);
  const { data: stepProgresses } = useUserStepProgresses(stepIds);

  const startPath = useStartPath();
  const completeStep = useCompleteStep();
  const certifyPath = useCertifyPath();

  const [showCertificate, setShowCertificate] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Parcours introuvable</h2>
        <Link to="/parcours">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Retour aux parcours</Button>
        </Link>
      </div>
    );
  }

  const currentStepOrder = userProgress?.current_step_order || 0;
  const hasStarted = !!userProgress;
  const isCertified = userProgress?.is_certified || false;
  const completedSteps = stepProgresses?.filter(sp => sp.status === 'completed').length || 0;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  const getStepStatus = (step: typeof steps[0]) => {
    const sp = stepProgresses?.find(p => p.step_id === step.id);
    if (sp?.status === 'completed') return 'completed';
    if (!hasStarted) return 'locked';
    if (step.step_order <= currentStepOrder) return 'available';
    return 'locked';
  };

  const handleStartPath = () => {
    if (path) startPath.mutate(path.id);
  };

  const handleCompleteStep = (step: typeof steps[0]) => {
    const nextStep = steps.find(s => s.step_order === step.step_order + 1);
    completeStep.mutate({
      stepId: step.id,
      pathId: path.id,
      score: 100,
      nextStepOrder: nextStep ? nextStep.step_order : step.step_order + 1,
    });
  };

  const handleCertify = () => {
    certifyPath.mutate(path.id, {
      onSuccess: () => setShowCertificate(true),
    });
  };

  const allCompleted = steps.length > 0 && completedSteps === steps.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back */}
      <Link to="/parcours" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Tous les parcours
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: path.color }} />
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: `${path.color}15` }}
            >
              {path.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{path.name}</h1>
                {isCertified && (
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                    <Award className="h-3 w-3 mr-1" /> Certifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{path.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {steps.length} étapes</span>
                <span className="flex items-center gap-1.5"><Flag className="h-4 w-4" /> {steps.filter(s => s.is_checkpoint).length} checkpoints</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> ~{path.estimated_hours}h</span>
              </div>

              {/* Progress bar */}
              {hasStarted && (
                <div className="mt-4">
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold text-foreground">{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2.5" />
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              {!hasStarted ? (
                <Button
                  size="lg"
                  onClick={handleStartPath}
                  disabled={startPath.isPending}
                  className="shadow-md"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Commencer
                </Button>
              ) : allCompleted && !isCertified ? (
                <Button
                  size="lg"
                  onClick={handleCertify}
                  disabled={certifyPath.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Obtenir la certification
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Steps Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const isCheckpoint = step.is_checkpoint;
            const isCompleted = status === 'completed';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-14"
              >
                {/* Timeline node */}
                <div className={cn(
                  "absolute left-4 w-7 h-7 rounded-full flex items-center justify-center z-10 border-2",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" :
                  isAvailable ? "bg-background border-primary text-primary" :
                  isCheckpoint ? "bg-background border-yellow-500 text-yellow-500" :
                  "bg-muted border-muted-foreground/30 text-muted-foreground/50"
                )}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> :
                   isLocked ? <Lock className="h-3.5 w-3.5" /> :
                   isCheckpoint ? <Flag className="h-3.5 w-3.5" /> :
                   <Circle className="h-3.5 w-3.5" />}
                </div>

                <Card className={cn(
                  "p-4 transition-all",
                  isCompleted && "bg-primary/5 border-primary/20",
                  isAvailable && "border-primary/40 shadow-sm hover:shadow-md",
                  isCheckpoint && !isCompleted && "border-yellow-500/30 bg-yellow-500/5",
                  isLocked && "opacity-60"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        {isCheckpoint && (
                          <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-600 h-5">
                            Checkpoint
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Étape {step.step_order}/{steps.length}
                        </span>
                        {!isCheckpoint && step.item_code !== 'CHECKPOINT' && (
                          <Badge variant="secondary" className="text-[10px] h-5">
                            IC-{step.item_code}
                          </Badge>
                        )}
                      </div>
                      <h3 className={cn(
                        "font-medium",
                        isCompleted && "text-primary",
                        isLocked && "text-muted-foreground"
                      )}>
                        {step.title}
                      </h3>
                      {step.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                      )}
                      {isCheckpoint && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Score minimum : {step.min_score_percent}%
                        </p>
                      )}
                    </div>

                    {/* Step action */}
                    <div className="flex-shrink-0 ml-4">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Validé</span>
                        </div>
                      ) : isAvailable ? (
                        <Button
                          size="sm"
                          variant={isCheckpoint ? "default" : "outline"}
                          onClick={() => handleCompleteStep(step)}
                          disabled={completeStep.isPending}
                        >
                          {isCheckpoint ? (
                            <><Flag className="h-3.5 w-3.5 mr-1.5" /> Valider</>
                          ) : (
                            <><Play className="h-3.5 w-3.5 mr-1.5" /> Étudier</>
                          )}
                        </Button>
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Certificate Modal */}
      <AnimatePresence>
        {(showCertificate || isCertified) && userProgress?.certificate_id && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10"
          >
            <Card className="p-8 text-center border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-background relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">
                  Certification {path.name}
                </h2>
                <p className="text-muted-foreground mb-4">
                  Félicitations ! Vous avez complété l'ensemble du parcours de {path.name}.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="font-mono text-sm">{userProgress.certificate_id}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Certifié le {new Date(userProgress.completed_at || '').toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecialtyPathDetail;
