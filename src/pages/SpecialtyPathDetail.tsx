import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  usePathDetail, useUserPathProgress, useUserStepProgresses,
  useStartPath, useCompleteStep, useCertifyPath
} from '@/hooks/useSpecialtyPaths';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTE_PATHS } from '@/config/routes';
import { avecSuivant } from '@/lib/cheminSuivant';
import { cheminItemEdn } from '@/pages/edn-item/ednItemTabs';
import {
  ArrowLeft, CheckCircle2, Circle, Lock, Play,
  Award, BookOpen, Clock, Flag, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Détail d'un parcours par spécialité : une liste ordonnée d'items EDN à
 * réviser, avec des points d'étape.
 *
 * CONSTAT (25/09/2026) :
 *  - « Commencer » ne faisait rien pour un visiteur (mutation rejetée en
 *    silence, aucun message) ; il mène désormais à la connexion, avec retour.
 *  - « Étudier » n'ouvrait pas l'item : il marquait l'étape validée avec un
 *    score de 100 sans rien étudier. « Valider » un checkpoint « quiz » avec un
 *    « score minimum » faisait de même alors qu'aucun quiz n'était posé, et
 *    « Obtenir la certification » délivrait un identifiant de certificat pour
 *    ces clics. Désormais : « Ouvrir l'item » mène à la fiche, l'avancement
 *    est déclaratif (« Marquer comme révisé »), et la fin du parcours est
 *    présentée comme telle, sans certification.
 */
const SpecialtyPathDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data, isLoading } = usePathDetail(slug || '');
  const path = data?.path;
  const steps = data?.steps || [];

  const { data: userProgress } = useUserPathProgress(path?.id);
  const stepIds = steps.map(s => s.id);
  const { data: stepProgresses } = useUserStepProgresses(stepIds);

  const startPath = useStartPath();
  const completeStep = useCompleteStep();
  const certifyPath = useCertifyPath();

  const [showCompletion, setShowCompletion] = useState(false);

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
        <Link to={ROUTE_PATHS.specialtyPaths}>
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Retour aux parcours</Button>
        </Link>
      </div>
    );
  }

  const currentStepOrder = userProgress?.current_step_order || 0;
  const hasStarted = !!userProgress;
  const isCompleted = userProgress?.is_certified || false;
  const completedSteps = stepProgresses?.filter(sp => sp.status === 'completed').length || 0;
  const progressPercent = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const itemsDuParcours = steps.filter(s => !s.is_checkpoint && s.item_code !== 'CHECKPOINT');

  const getStepStatus = (step: typeof steps[0]) => {
    const sp = stepProgresses?.find(p => p.step_id === step.id);
    if (sp?.status === 'completed') return 'completed';
    if (!hasStarted) return 'locked';
    if (step.step_order <= currentStepOrder) return 'available';
    return 'locked';
  };

  const handleStartPath = () => {
    if (!user) {
      // Le suivi d'un parcours est propre au compte : connexion, puis retour ici.
      navigate(avecSuivant(ROUTE_PATHS.medMngLogin, location.pathname));
      return;
    }
    startPath.mutate(path.id);
  };

  const handleCompleteStep = (step: typeof steps[0]) => {
    const nextStep = steps.find(s => s.step_order === step.step_order + 1);
    completeStep.mutate({
      stepId: step.id,
      pathId: path.id,
      nextStepOrder: nextStep ? nextStep.step_order : step.step_order + 1,
    });
  };

  const handleFinish = () => {
    certifyPath.mutate(path.id, {
      onSuccess: () => setShowCompletion(true),
    });
  };

  const allCompleted = steps.length > 0 && completedSteps === steps.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back */}
      <Link to={ROUTE_PATHS.specialtyPaths} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
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
                {isCompleted && (
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                    <Award className="h-3 w-3 mr-1" /> Terminé
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{path.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {itemsDuParcours.length} items EDN</span>
                <span className="flex items-center gap-1.5"><Flag className="h-4 w-4" /> {steps.filter(s => s.is_checkpoint).length} points d'étape</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> ~{path.estimated_hours} h estimées</span>
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
              {!hasStarted && !user && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Les items du parcours sont consultables librement ; le suivi de votre avancement demande un compte.
                </p>
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
                  {user ? 'Commencer' : 'Se connecter pour suivre'}
                </Button>
              ) : allCompleted && !isCompleted ? (
                <Button
                  size="lg"
                  onClick={handleFinish}
                  disabled={certifyPath.isPending}
                  className="shadow-md"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Terminer le parcours
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
            const isStepCompleted = status === 'completed';
            const isAvailable = status === 'available';
            const isLocked = status === 'locked';
            const estUnItem = !isCheckpoint && step.item_code !== 'CHECKPOINT';

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
                  isStepCompleted ? "bg-primary border-primary text-primary-foreground" :
                  isAvailable ? "bg-background border-primary text-primary" :
                  isCheckpoint ? "bg-background border-yellow-500 text-yellow-500" :
                  "bg-muted border-muted-foreground/30 text-muted-foreground/50"
                )}>
                  {isStepCompleted ? <CheckCircle2 className="h-4 w-4" /> :
                   isLocked && hasStarted ? <Lock className="h-3.5 w-3.5" /> :
                   isCheckpoint ? <Flag className="h-3.5 w-3.5" /> :
                   <Circle className="h-3.5 w-3.5" />}
                </div>

                <Card className={cn(
                  "p-4 transition-all",
                  isStepCompleted && "bg-primary/5 border-primary/20",
                  isAvailable && "border-primary/40 shadow-sm hover:shadow-md",
                  isCheckpoint && !isStepCompleted && "border-yellow-500/30 bg-yellow-500/5",
                  isLocked && hasStarted && "opacity-60"
                )}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {isCheckpoint && (
                          <Badge variant="outline" className="text-[10px] border-yellow-500/50 text-yellow-600 h-5">
                            Point d'étape
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Étape {step.step_order}/{steps.length}
                        </span>
                        {estUnItem && (
                          <Badge variant="secondary" className="text-[10px] h-5">
                            IC-{step.item_code}
                          </Badge>
                        )}
                      </div>
                      <h3 className={cn(
                        "font-medium",
                        isStepCompleted && "text-primary",
                        isLocked && hasStarted && "text-muted-foreground"
                      )}>
                        {step.title}
                      </h3>
                      {step.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                      )}
                      {isCheckpoint && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Relisez les items précédents avant de poursuivre.
                        </p>
                      )}
                    </div>

                    {/* Step action */}
                    <div className="flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      {estUnItem && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={cheminItemEdn(`IC-${step.item_code}`, 'apercu')}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Ouvrir l'item
                          </Link>
                        </Button>
                      )}
                      {isStepCompleted ? (
                        <div className="flex items-center gap-1.5 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Révisé</span>
                        </div>
                      ) : isAvailable ? (
                        <Button
                          size="sm"
                          variant={isCheckpoint ? "default" : "secondary"}
                          onClick={() => handleCompleteStep(step)}
                          disabled={completeStep.isPending}
                        >
                          {isCheckpoint ? (
                            <><Flag className="h-3.5 w-3.5 mr-1.5" /> Passer ce point d'étape</>
                          ) : (
                            <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Marquer comme révisé</>
                          )}
                        </Button>
                      ) : hasStarted ? (
                        <Lock className="h-4 w-4 text-muted-foreground/40" aria-label="Étape à venir" />
                      ) : null}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fin de parcours */}
      <AnimatePresence>
        {(showCompletion || isCompleted) && userProgress?.completed_at && (
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
                  Parcours {path.name} terminé
                </h2>
                <p className="text-muted-foreground mb-4">
                  Vous avez marqué comme révisés les {itemsDuParcours.length} items de ce parcours.
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Terminé le {new Date(userProgress.completed_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
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
