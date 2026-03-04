import { useSpecialtyPaths } from '@/hooks/useSpecialtyPaths';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Clock, BookOpen, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const difficultyLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  beginner: { label: 'Débutant', variant: 'secondary' },
  intermediate: { label: 'Intermédiaire', variant: 'default' },
  advanced: { label: 'Avancé', variant: 'destructive' },
};

const SpecialtyPaths = () => {
  const { data: paths, isLoading } = useSpecialtyPaths();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Parcours guidés
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Parcours par Spécialité
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Progressez méthodiquement dans chaque spécialité médicale avec des checkpoints de validation 
            et obtenez votre certification de maîtrise.
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
        {[
          { icon: BookOpen, label: 'Spécialités', value: paths?.length || '—' },
          { icon: Trophy, label: 'Certifications', value: paths?.length || '—' },
          { icon: Clock, label: 'Heures de contenu', value: paths?.reduce((acc, p) => acc + p.estimated_hours, 0) || '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center p-4 rounded-xl bg-muted/30">
            <Icon className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Paths Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths?.map((path, index) => {
            const diff = difficultyLabel[path.difficulty] || difficultyLabel.intermediate;
            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Link to={`/parcours/${path.slug}`}>
                  <Card className="group p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 relative overflow-hidden">
                    {/* Accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                      style={{ backgroundColor: path.color }}
                    />

                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: `${path.color}15` }}
                      >
                        {path.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                            {path.name}
                          </h3>
                          <Badge variant={diff.variant} className="text-[10px] h-5">
                            {diff.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {path.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {path.steps_count || 0} étapes
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3.5 w-3.5" />
                            {path.checkpoints_count || 0} checkpoints
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            ~{path.estimated_hours}h
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SpecialtyPaths;
