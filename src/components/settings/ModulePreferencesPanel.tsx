import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Music, 
  Stethoscope, 
  Layers, 
  Brain, 
  FileQuestion,
  ClipboardList,
  MessageSquare,
  Calendar,
  Timer,
  Target,
  Users,
  Trophy,
  Award,
  Heart,
  Medal,
  Sparkles,
  Minimize2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useModulePreferences, AVAILABLE_MODULES, ModuleConfig } from '@/hooks/useModulePreferences';

// Map des icônes par nom
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Music,
  Stethoscope,
  Layers,
  Brain,
  FileQuestion,
  ClipboardList,
  MessageSquare,
  Calendar,
  Timer,
  Target,
  Users,
  Trophy,
  Award,
  Heart,
  Medal,
};

const CATEGORY_LABELS: Record<ModuleConfig['category'], { label: string; description: string }> = {
  core: { label: 'Modules principaux', description: 'Fonctionnalités essentielles de la plateforme' },
  learning: { label: 'Apprentissage', description: 'Outils de révision et d\'entraînement' },
  productivity: { label: 'Productivité', description: 'Organisation et suivi du travail' },
  social: { label: 'Social', description: 'Interactions et motivation collective' },
  wellbeing: { label: 'Bien-être', description: 'Suivi de la santé mentale et récompenses' },
};

/**
 * Panneau de configuration des modules activés/désactivés
 */
export const ModulePreferencesPanel: React.FC = () => {
  const {
    isLoading,
    toggleModule,
    enableAll,
    setMinimalMode,
    isModuleEnabled,
    getModulesByCategory,
  } = useModulePreferences();

  const renderModuleCard = (module: ModuleConfig) => {
    const Icon = ICON_MAP[module.icon] || BookOpen;
    const isEnabled = isModuleEnabled(module.id);

    return (
      <motion.div
        key={module.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between p-4 rounded-lg border ${
          isEnabled ? 'bg-card border-border' : 'bg-muted/30 border-border/50'
        } transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${!isEnabled && 'text-muted-foreground'}`}>
                {module.name}
              </span>
              {module.isCore && (
                <Badge variant="secondary" className="text-xs">Essentiel</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{module.description}</p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={() => toggleModule(module.id)}
          disabled={module.isCore || isLoading}
        />
      </motion.div>
    );
  };

  const categories: ModuleConfig['category'][] = ['core', 'learning', 'productivity', 'social', 'wellbeing'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Modules activés</CardTitle>
            <CardDescription>
              Personnalisez votre expérience en activant ou désactivant des fonctionnalités
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={setMinimalMode}
              className="gap-2"
            >
              <Minimize2 className="h-4 w-4" />
              Mode minimal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={enableAll}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Tout activer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category) => {
          const modules = getModulesByCategory(category);
          const categoryInfo = CATEGORY_LABELS[category];

          return (
            <div key={category}>
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{categoryInfo.label}</h3>
                <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map(renderModuleCard)}
              </div>
              {category !== 'wellbeing' && <Separator className="mt-6" />}
            </div>
          );
        })}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💡 Les modules désactivés n'apparaîtront plus dans la navigation. 
            Vous pouvez les réactiver à tout moment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModulePreferencesPanel;
