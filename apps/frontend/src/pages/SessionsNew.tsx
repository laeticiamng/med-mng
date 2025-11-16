/**
 * New Session Page
 * Create a new study/focus/meditation session
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Focus, Brain, Clock, Target, Tag, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

type SessionType = 'study' | 'focus' | 'meditation';

const sessionTypeConfig = {
  study: {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'Session d\'Étude',
    description: 'Révision de cours, mémorisation, prise de notes',
    defaultDuration: 45,
  },
  focus: {
    icon: Focus,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'Session de Focus',
    description: 'Concentration profonde, deep work, Pomodoro',
    defaultDuration: 25,
  },
  meditation: {
    icon: Brain,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'Session de Méditation',
    description: 'Relaxation, respiration, pleine conscience',
    defaultDuration: 15,
  },
};

const predefinedGoals = [
  'Réviser un chapitre',
  'Compléter un quiz',
  'Mémoriser des concepts clés',
  'Faire des exercices pratiques',
  'Prendre des notes synthétiques',
  'Préparer un examen',
  'Travail sur un projet',
  'Lecture approfondie',
];

const tags = [
  'Urgent', 'Important', 'Examen', 'Révision',
  'Nouveau', 'Difficile', 'Révision rapide',
  'Long terme', 'Pratique', 'Théorie',
];

export const SessionsNew: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessionType, setSessionType] = useState<SessionType>('study');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(sessionTypeConfig[sessionType].defaultDuration);
  const [goal, setGoal] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [enableTimer, setEnableTimer] = useState(true);
  const [enableBreaks, setEnableBreaks] = useState(true);
  const [breakDuration, setBreakDuration] = useState(5);
  const [enableMusic, setEnableMusic] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const config = sessionTypeConfig[sessionType];
  const Icon = config.icon;

  // Update duration when session type changes
  React.useEffect(() => {
    setDuration(config.defaultDuration);
  }, [sessionType]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleCreate = useCallback(async () => {
    if (!title.trim()) {
      toast({
        title: 'Titre requis',
        description: 'Veuillez entrer un titre pour votre session',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const sessionData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        session_type: sessionType,
        planned_duration: duration,
        goal: goal.trim() || null,
        tags: selectedTags,
        settings: {
          timer_enabled: enableTimer,
          breaks_enabled: enableBreaks,
          break_duration: breakDuration,
          music_enabled: enableMusic,
          notifications_enabled: enableNotifications,
        },
        status: 'planned',
      };

      const tableName = `${sessionType}_sessions`;
      const { data, error } = await supabase
        .from(tableName)
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Session créée !',
        description: `Votre session de ${duration} minutes est prête à démarrer`,
      });

      // Navigate to session detail or start page
      navigate(`/sessions/${data.id}`);
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la session. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  }, [title, description, sessionType, duration, goal, selectedTags, enableTimer, enableBreaks, breakDuration, enableMusic, enableNotifications, toast, navigate]);

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          Nouvelle Session
        </h1>
        <p className="text-muted-foreground">
          Créez une session personnalisée pour optimiser votre apprentissage
        </p>
      </div>

      <div className="grid gap-6">
        {/* Session Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Type de Session</CardTitle>
            <CardDescription>Choisissez le type d'activité que vous souhaitez faire</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={sessionType} onValueChange={(value) => setSessionType(value as SessionType)}>
              <TabsList className="grid w-full grid-cols-3">
                {(Object.keys(sessionTypeConfig) as SessionType[]).map((type) => {
                  const cfg = sessionTypeConfig[type];
                  const TypeIcon = cfg.icon;
                  return (
                    <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4" />
                      {cfg.title}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {(Object.keys(sessionTypeConfig) as SessionType[]).map((type) => {
                const cfg = sessionTypeConfig[type];
                const TypeIcon = cfg.icon;
                return (
                  <TabsContent key={type} value={type} className="mt-4">
                    <div className={`p-4 rounded-lg border ${cfg.borderColor} ${cfg.bgColor}`}>
                      <div className="flex items-start gap-3">
                        <TypeIcon className={`h-6 w-6 ${cfg.color} mt-0.5`} />
                        <div>
                          <h3 className="font-semibold mb-1">{cfg.title}</h3>
                          <p className="text-sm text-muted-foreground">{cfg.description}</p>
                          <Badge variant="outline" className="mt-2">
                            Durée recommandée: {cfg.defaultDuration} min
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Détails de la Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Ex: Révision Cardiologie - Chapitre 3`}
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails supplémentaires sur cette session..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Durée: {duration} minutes</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  id="duration"
                  value={[duration]}
                  onValueChange={([value]) => setDuration(value)}
                  min={5}
                  max={120}
                  step={5}
                  className="flex-1"
                  aria-label={`Durée de la session: ${duration} minutes`}
                />
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Entre 5 et 120 minutes (par tranches de 5 min)
              </p>
            </div>

            {/* Goal */}
            <div>
              <Label htmlFor="goal">Objectif de la session</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionnez un objectif ou tapez le vôtre" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedGoals.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ou tapez votre propre objectif..."
                className="mt-2"
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex gap-2 flex-wrap mt-2" role="group" aria-label="Sélection de tags">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleTag(tag);
                      }
                    }}
                    role="checkbox"
                    aria-checked={selectedTags.includes(tag)}
                    aria-label={`Tag ${tag}`}
                    tabIndex={0}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>Personnalisez votre expérience de session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timer */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="timer">Activer le timer</Label>
                <p className="text-sm text-muted-foreground">Compte à rebours pendant la session</p>
              </div>
              <Switch id="timer" checked={enableTimer} onCheckedChange={setEnableTimer} />
            </div>

            {/* Breaks */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="breaks">Activer les pauses</Label>
                <p className="text-sm text-muted-foreground">
                  Pauses automatiques toutes les {breakDuration} minutes
                </p>
              </div>
              <Switch id="breaks" checked={enableBreaks} onCheckedChange={setEnableBreaks} />
            </div>

            {enableBreaks && (
              <div className="ml-6">
                <Label>Durée des pauses: {breakDuration} min</Label>
                <Slider
                  value={[breakDuration]}
                  onValueChange={([value]) => setBreakDuration(value)}
                  min={3}
                  max={15}
                  step={1}
                  className="mt-2"
                  aria-label={`Durée des pauses: ${breakDuration} minutes`}
                />
              </div>
            )}

            {/* Music */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="music">Musique de fond</Label>
                <p className="text-sm text-muted-foreground">Musique relaxante pendant la session</p>
              </div>
              <Switch id="music" checked={enableMusic} onCheckedChange={setEnableMusic} />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">Alertes de fin de session et pauses</p>
              </div>
              <Switch
                id="notifications"
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
          >
            <Icon className="h-5 w-5 mr-2" />
            {isCreating ? 'Création...' : 'Créer et Démarrer'}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/sessions')}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionsNew;
