/**
 * Goals Create Page
 * Comprehensive goal creation with templates and SMART framework
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Target,
  BookOpen,
  Brain,
  Trophy,
  Clock,
  Zap,
  Calendar,
  Flag,
  Lightbulb,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCreateGoal, UserGoal } from '@/hooks/useGoals';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: UserGoal['category'];
  goal_type: UserGoal['goal_type'];
  target_value: number;
  unit: string;
  duration_days: number;
  priority: UserGoal['priority'];
}

const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'edn-50',
    name: 'Compléter 50 items EDN',
    description: 'Maîtrisez 50 items EDN en 30 jours',
    icon: <BookOpen className="h-5 w-5" />,
    category: 'edn',
    goal_type: 'completion',
    target_value: 50,
    unit: 'items',
    duration_days: 30,
    priority: 'high',
  },
  {
    id: 'quiz-10',
    name: '10 Quiz parfaits',
    description: 'Obtenez 100% sur 10 quiz',
    icon: <Brain className="h-5 w-5" />,
    category: 'quiz',
    goal_type: 'count',
    target_value: 10,
    unit: 'quiz',
    duration_days: 21,
    priority: 'medium',
  },
  {
    id: 'study-20h',
    name: '20 heures d\'étude',
    description: 'Accumulez 20 heures d\'étude ce mois',
    icon: <Clock className="h-5 w-5" />,
    category: 'study_time',
    goal_type: 'time',
    target_value: 1200,
    unit: 'minutes',
    duration_days: 30,
    priority: 'medium',
  },
  {
    id: 'streak-30',
    name: 'Streak de 30 jours',
    description: 'Étudiez chaque jour pendant 30 jours',
    icon: <Zap className="h-5 w-5" />,
    category: 'streak',
    goal_type: 'streak',
    target_value: 30,
    unit: 'jours',
    duration_days: 30,
    priority: 'high',
  },
  {
    id: 'badges-5',
    name: 'Débloquer 5 badges',
    description: 'Collectez 5 nouveaux badges',
    icon: <Trophy className="h-5 w-5" />,
    category: 'badge',
    goal_type: 'count',
    target_value: 5,
    unit: 'badges',
    duration_days: 60,
    priority: 'low',
  },
];

export const GoalsCreate: React.FC = () => {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();

  const [creationMode, setCreationMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<UserGoal['category']>('edn');
  const [goalType, setGoalType] = useState<UserGoal['goal_type']>('completion');
  const [targetValue, setTargetValue] = useState(0);
  const [unit, setUnit] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<UserGoal['priority']>('medium');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly' | 'never'>('daily');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // SMART criteria tracking
  const [smartCriteria, setSmartCriteria] = useState({
    specific: false,
    measurable: false,
    achievable: false,
    relevant: false,
    timeBound: false,
  });

  // Update SMART criteria based on form
  React.useEffect(() => {
    setSmartCriteria({
      specific: title.length > 10 && description.length > 20,
      measurable: targetValue > 0 && unit.length > 0,
      achievable: targetValue > 0 && targetValue <= 1000,
      relevant: category !== ('custom' as any),
      timeBound: targetDate.length > 0,
    });
  }, [title, description, targetValue, unit, category, targetDate]);

  const smartScore = Object.values(smartCriteria).filter(Boolean).length;

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDescription(template.description);
    setCategory(template.category);
    setGoalType(template.goal_type);
    setTargetValue(template.target_value);
    setUnit(template.unit);
    setPriority(template.priority);

    // Set target date based on duration
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + template.duration_days);
    setTargetDate(targetDate.toISOString().split('T')[0]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    if (targetValue <= 0) {
      newErrors.targetValue = 'La valeur cible doit être positive';
    }
    if (!targetDate) {
      newErrors.targetDate = 'La date d\'échéance est requise';
    } else {
      const selectedDate = new Date(targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.targetDate = 'La date doit être dans le futur';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createGoal.mutateAsync({
        title,
        description: description || null,
        category,
        goal_type: goalType,
        target_value: targetValue,
        unit: unit || null,
        start_date: new Date().toISOString().split('T')[0],
        target_date: targetDate,
        status: 'active',
        priority,
        reminder_enabled: reminderEnabled,
        reminder_frequency: reminderFrequency,
        metadata: {
          created_from_template: selectedTemplate?.id || null,
          smart_score: smartScore,
        },
      } as any);

      navigate('/goals');
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/goals')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux objectifs
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Créer un Objectif</h1>
            <p className="text-muted-foreground">
              Définissez un objectif SMART pour suivre votre progression
            </p>
          </div>
        </div>

        {/* SMART Score */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold">Score SMART</span>
            </div>
            <Badge variant={smartScore === 5 ? 'default' : smartScore >= 3 ? 'secondary' : 'outline'}>
              {smartScore}/5
            </Badge>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { key: 'specific', label: 'Spécifique', tooltip: 'Objectif clair et détaillé' },
              { key: 'measurable', label: 'Mesurable', tooltip: 'Progression quantifiable' },
              { key: 'achievable', label: 'Atteignable', tooltip: 'Objectif réaliste' },
              { key: 'relevant', label: 'Pertinent', tooltip: 'Aligné avec vos objectifs' },
              { key: 'timeBound', label: 'Temporel', tooltip: 'Échéance définie' },
            ].map((criterion) => (
              <div
                key={criterion.key}
                className={`text-center p-2 rounded border ${
                  smartCriteria[criterion.key as keyof typeof smartCriteria]
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'border-muted-foreground/20'
                }`}
                title={criterion.tooltip}
              >
                {smartCriteria[criterion.key as keyof typeof smartCriteria] ? (
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                )}
                <div className="text-xs font-medium">{criterion.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creation Tabs */}
      <Tabs value={creationMode} onValueChange={(v) => setCreationMode(v as any)}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="template">
            <Target className="h-4 w-4 mr-2" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Lightbulb className="h-4 w-4 mr-2" />
            Personnalisé
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modèles d'Objectifs</CardTitle>
              <CardDescription>
                Choisissez un modèle prédéfini pour commencer rapidement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {GOAL_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary border-2'
                        : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {template.target_value} {template.unit}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.duration_days} jours
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedTemplate && (
                <Alert className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Modèle sélectionné: <strong>{selectedTemplate.name}</strong>
                    <br />
                    Vous pouvez personnaliser les détails ci-dessous
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objectif Personnalisé</CardTitle>
              <CardDescription>
                Créez un objectif sur mesure adapté à vos besoins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Catégorie *</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edn">📚 EDN</SelectItem>
                      <SelectItem value="quiz">📝 Quiz</SelectItem>
                      <SelectItem value="study_time">⏱️ Temps d'étude</SelectItem>
                      <SelectItem value="streak">🔥 Streak</SelectItem>
                      <SelectItem value="badge">🏆 Badges</SelectItem>
                      <SelectItem value="custom">🎯 Personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Type d'objectif *</Label>
                  <Select value={goalType} onValueChange={(value: any) => setGoalType(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completion">Complétion</SelectItem>
                      <SelectItem value="score">Score</SelectItem>
                      <SelectItem value="time">Temps</SelectItem>
                      <SelectItem value="streak">Streak</SelectItem>
                      <SelectItem value="count">Compteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Common Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Détails de l'Objectif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Compléter 50 items EDN"
                className="mt-1"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre objectif et pourquoi il est important..."
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Une description détaillée améliore votre score SMART
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Valeur cible *</Label>
                <Input
                  type="number"
                  value={targetValue || ''}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  placeholder="100"
                  min="1"
                  className="mt-1"
                />
                {errors.targetValue && (
                  <p className="text-sm text-destructive mt-1">{errors.targetValue}</p>
                )}
              </div>

              <div>
                <Label>Unité</Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="items, heures, %"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Priorité *</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Basse</SelectItem>
                    <SelectItem value="medium">🟡 Moyenne</SelectItem>
                    <SelectItem value="high">🔴 Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Date d'échéance *</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
              {errors.targetDate && (
                <p className="text-sm text-destructive mt-1">{errors.targetDate}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rappels</CardTitle>
            <CardDescription>
              Configurez des rappels pour rester motivé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Activer les rappels</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications pour suivre votre progression
                </p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {reminderEnabled && (
              <div>
                <Label>Fréquence des rappels</Label>
                <Select
                  value={reminderFrequency}
                  onValueChange={(value: any) => setReminderFrequency(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="never">Jamais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/goals')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createGoal.isPending}
            className="min-w-[120px]"
          >
            {createGoal.isPending ? 'Création...' : 'Créer l\'objectif'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GoalsCreate;
