import React, { useCallback, useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  BookOpen, Music, Trophy, Flame, Clock, Target,
  GripVertical, Settings, Eye, EyeOff, RotateCcw,
  Calendar, TrendingUp, Brain, Users, Star
} from 'lucide-react';
import { useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types pour les widgets
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  order: number;
}

type WidgetType = 
  | 'streak' 
  | 'level' 
  | 'badges' 
  | 'study-time' 
  | 'items-progress' 
  | 'weekly-goal'
  | 'recent-activity'
  | 'music-stats'
  | 'quiz-score'
  | 'calendar'
  | 'leaderboard-rank'
  | 'recommendations';

// Configuration par défaut des widgets
const DEFAULT_WIDGETS: Widget[] = [
  { id: 'streak', type: 'streak', title: 'Série de jours', icon: Flame, size: 'small', visible: true, order: 0 },
  { id: 'level', type: 'level', title: 'Niveau XP', icon: Star, size: 'small', visible: true, order: 1 },
  { id: 'badges', type: 'badges', title: 'Badges', icon: Trophy, size: 'small', visible: true, order: 2 },
  { id: 'study-time', type: 'study-time', title: 'Temps d\'étude', icon: Clock, size: 'small', visible: true, order: 3 },
  { id: 'items-progress', type: 'items-progress', title: 'Progression Items', icon: BookOpen, size: 'medium', visible: true, order: 4 },
  { id: 'weekly-goal', type: 'weekly-goal', title: 'Objectif hebdo', icon: Target, size: 'medium', visible: true, order: 5 },
  { id: 'recent-activity', type: 'recent-activity', title: 'Activité récente', icon: TrendingUp, size: 'large', visible: true, order: 6 },
  { id: 'music-stats', type: 'music-stats', title: 'Musiques générées', icon: Music, size: 'small', visible: false, order: 7 },
  { id: 'quiz-score', type: 'quiz-score', title: 'Score Quiz', icon: Brain, size: 'small', visible: false, order: 8 },
  { id: 'leaderboard-rank', type: 'leaderboard-rank', title: 'Classement', icon: Users, size: 'small', visible: false, order: 9 },
  { id: 'recommendations', type: 'recommendations', title: 'Recommandations', icon: Star, size: 'medium', visible: false, order: 10 },
];

// Composant Widget Sortable
interface SortableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ widget, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-2 lg:col-span-3',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${sizeClasses[widget.size]} ${isDragging ? 'z-50' : ''}`}
    >
      <Card className="h-full relative group">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {children}
      </Card>
    </div>
  );
};

// Composants de contenu pour chaque type de widget
interface WidgetContentProps {
  gamificationStats: any;
  todayStats: any;
}

const StreakWidget: React.FC<WidgetContentProps> = ({ gamificationStats }) => (
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-warning">{gamificationStats?.currentStreak || 0}</p>
        <p className="text-xs text-muted-foreground">jours consécutifs</p>
      </div>
      <Flame className="h-8 w-8 text-warning" />
    </div>
  </CardContent>
);

const LevelWidget: React.FC<WidgetContentProps> = ({ gamificationStats }) => {
  const level = gamificationStats ? Math.floor((gamificationStats.currentXP || 0) / XP_PER_LEVEL) + 1 : 1;
  const xpProgress = gamificationStats ? ((gamificationStats.currentXP || 0) % XP_PER_LEVEL) / XP_PER_LEVEL * 100 : 0;
  
  return (
    <CardContent className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">Niv. {level}</p>
            <p className="text-xs text-muted-foreground">{gamificationStats?.currentXP || 0} XP</p>
          </div>
          <Star className="h-8 w-8 text-primary" />
        </div>
        <Progress value={xpProgress} className="h-2" />
      </div>
    </CardContent>
  );
};

const BadgesWidget: React.FC<WidgetContentProps> = ({ gamificationStats }) => (
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-success">{gamificationStats?.badges?.length || 0}</p>
        <p className="text-xs text-muted-foreground">badges obtenus</p>
      </div>
      <Trophy className="h-8 w-8 text-success" />
    </div>
    {gamificationStats?.badges?.length > 0 && (
      <div className="flex gap-1 mt-2">
        {gamificationStats.badges.slice(-3).map((badge: any, i: number) => (
          <Badge key={i} variant="outline" className="text-lg">
            {badge.icon}
          </Badge>
        ))}
      </div>
    )}
  </CardContent>
);

const StudyTimeWidget: React.FC<WidgetContentProps> = ({ todayStats }) => (
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold">{todayStats?.totalMinutes || 0}</p>
        <p className="text-xs text-muted-foreground">minutes aujourd'hui</p>
      </div>
      <Clock className="h-8 w-8 text-accent" />
    </div>
  </CardContent>
);

const ItemsProgressWidget: React.FC<WidgetContentProps> = () => (
  <CardContent className="p-4 space-y-4">
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span>Items Rang A</span>
        <span className="text-muted-foreground">47/183</span>
      </div>
      <Progress value={26} className="h-2" />
    </div>
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span>Items Rang B</span>
        <span className="text-muted-foreground">23/184</span>
      </div>
      <Progress value={13} className="h-2" />
    </div>
  </CardContent>
);

const WeeklyGoalWidget: React.FC<WidgetContentProps> = ({ todayStats }) => {
  const weeklyTarget = 300; // 5h par semaine
  const weeklyProgress = (todayStats?.weeklyMinutes || 0);
  const percent = Math.min(100, (weeklyProgress / weeklyTarget) * 100);
  
  return (
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-lg font-bold">{weeklyProgress}/{weeklyTarget} min</p>
          <p className="text-xs text-muted-foreground">objectif hebdomadaire</p>
        </div>
        <Target className="h-8 w-8 text-primary" />
      </div>
      <Progress value={percent} className="h-3" />
      <p className="text-xs text-muted-foreground mt-2">
        {Math.round(percent)}% complété
      </p>
    </CardContent>
  );
};

const RecentActivityWidget: React.FC<WidgetContentProps> = () => {
  const activities = [
    { type: 'study', title: 'Item IC-042 étudié', time: 'il y a 2h' },
    { type: 'music', title: 'Musique générée', time: 'il y a 4h' },
    { type: 'quiz', title: 'Quiz réussi (92%)', time: 'hier' },
  ];
  
  return (
    <CardContent className="p-4">
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span>{activity.title}</span>
            <span className="text-muted-foreground">{activity.time}</span>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

// Composant principal
export const DashboardWidgets: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);
  const { stats: gamificationStats, loadStats } = useGamification();
  const { getTodayStats } = useActivityTracking();
  const [todayStats, setTodayStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load user data
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
        const stats = await getTodayStats();
        setTodayStats(stats);
        
        // Load saved widget config
        await loadWidgetConfig(user.id);
      }
    };
    init();
  }, [loadStats, getTodayStats]);

  // Load widget configuration from database
  const loadWidgetConfig = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data && (data as any).dashboard_widgets) {
        const savedWidgets = (data as any).dashboard_widgets as any[];
        setWidgets(prev => prev.map(w => {
          const saved = savedWidgets.find((s: any) => s.id === w.id);
          return saved ? { ...w, ...saved } : w;
        }).sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error loading widget config:', error);
    }
  };

  // Save widget configuration
  const saveWidgetConfig = useCallback(async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dashboard_widgets: widgets.map(w => ({
            id: w.id,
            visible: w.visible,
            order: w.order
          }))
        }, { onConflict: 'user_id' });
      
      toast.success('Configuration sauvegardée');
    } catch (error) {
      console.error('Error saving widget config:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  }, [user, widgets]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index
        }));
        
        return newItems;
      });
    }
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  // Reset to default
  const resetToDefault = () => {
    setWidgets(DEFAULT_WIDGETS);
    toast.success('Configuration réinitialisée');
  };

  // Render widget content based on type
  const renderWidgetContent = (widget: Widget) => {
    const props = { gamificationStats, todayStats };
    
    switch (widget.type) {
      case 'streak': return <StreakWidget {...props} />;
      case 'level': return <LevelWidget {...props} />;
      case 'badges': return <BadgesWidget {...props} />;
      case 'study-time': return <StudyTimeWidget {...props} />;
      case 'items-progress': return <ItemsProgressWidget {...props} />;
      case 'weekly-goal': return <WeeklyGoalWidget {...props} />;
      case 'recent-activity': return <RecentActivityWidget {...props} />;
      default: return <CardContent className="p-4 text-muted-foreground">Widget en cours de développement</CardContent>;
    }
  };

  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className="space-y-4">
      {/* Header avec bouton de configuration */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mon tableau de bord</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Personnaliser
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Personnaliser le tableau de bord</SheetTitle>
              <SheetDescription>
                Activez/désactivez les widgets et réorganisez-les par glisser-déposer.
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
              {widgets.map(widget => (
                <div 
                  key={widget.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <widget.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{widget.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{widget.size}</p>
                    </div>
                  </div>
                  <Switch
                    checked={widget.visible}
                    onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                  />
                </div>
              ))}
              
              <div className="pt-4 space-y-2">
                <Button onClick={saveWidgetConfig} className="w-full">
                  Sauvegarder
                </Button>
                <Button onClick={resetToDefault} variant="outline" className="w-full gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Grille de widgets */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleWidgets.map(widget => (
              <SortableWidget key={widget.id} widget={widget}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <widget.icon className="h-4 w-4" />
                    {widget.title}
                  </CardTitle>
                </CardHeader>
                {renderWidgetContent(widget)}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
