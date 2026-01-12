import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, Clock, Calendar, Brain, Target, Flame,
  Settings, Plus, Trash2, CheckCircle, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartReminder {
  id: string;
  type: 'srs' | 'streak' | 'goal' | 'custom';
  title: string;
  description: string;
  time: string;
  days: number[];
  enabled: boolean;
  lastTriggered?: string;
  priority: 'low' | 'medium' | 'high';
}

interface ReminderStats {
  totalReminders: number;
  activeReminders: number;
  streakDays: number;
  nextReview: Date | null;
  itemsDueToday: number;
}

export const SmartReminders: React.FC = () => {
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [stats, setStats] = useState<ReminderStats>({
    totalReminders: 0,
    activeReminders: 0,
    streakDays: 0,
    nextReview: null,
    itemsDueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    time: '09:00',
    type: 'custom' as SmartReminder['type'],
    priority: 'medium' as SmartReminder['priority']
  });
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Données de démonstration enrichies
      const demoReminders: SmartReminder[] = [
        {
          id: '1',
          type: 'srs',
          title: 'Révision SRS',
          description: '15 cartes à réviser aujourd\'hui',
          time: '09:00',
          days: [1, 2, 3, 4, 5],
          enabled: true,
          priority: 'high'
        },
        {
          id: '2',
          type: 'streak',
          title: 'Maintenir le streak',
          description: 'N\'oubliez pas votre session quotidienne',
          time: '18:00',
          days: [0, 1, 2, 3, 4, 5, 6],
          enabled: true,
          priority: 'high'
        },
        {
          id: '3',
          type: 'goal',
          title: 'Objectif hebdomadaire',
          description: 'Compléter 10 items cette semaine',
          time: '10:00',
          days: [1],
          enabled: true,
          priority: 'medium'
        },
        {
          id: '4',
          type: 'custom',
          title: 'Révision Cardiologie',
          description: 'Focus sur les ECG',
          time: '14:00',
          days: [2, 4],
          enabled: false,
          priority: 'low'
        }
      ];

      setReminders(demoReminders);
      setStats({
        totalReminders: demoReminders.length,
        activeReminders: demoReminders.filter(r => r.enabled).length,
        streakDays: 7,
        nextReview: new Date(Date.now() + 2 * 60 * 60 * 1000),
        itemsDueToday: 15
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
    toast({
      title: 'Rappel mis à jour',
      description: 'Le statut du rappel a été modifié.',
    });
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    toast({
      title: 'Rappel supprimé',
      description: 'Le rappel a été supprimé avec succès.',
    });
  };

  const addReminder = () => {
    if (!newReminder.title) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un titre pour le rappel.',
        variant: 'destructive'
      });
      return;
    }

    const reminder: SmartReminder = {
      id: Date.now().toString(),
      type: newReminder.type,
      title: newReminder.title,
      description: 'Rappel personnalisé',
      time: newReminder.time,
      days: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      priority: newReminder.priority
    };

    setReminders(prev => [...prev, reminder]);
    setNewReminder({ title: '', time: '09:00', type: 'custom', priority: 'medium' });
    setShowAddReminder(false);
    toast({
      title: 'Rappel créé',
      description: 'Votre nouveau rappel a été ajouté.',
    });
  };

  const getTypeIcon = (type: SmartReminder['type']) => {
    switch (type) {
      case 'srs': return <Brain className="h-4 w-4" />;
      case 'streak': return <Flame className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SmartReminder['type']) => {
    switch (type) {
      case 'srs': return 'bg-primary/10 text-primary';
      case 'streak': return 'bg-warning/10 text-warning';
      case 'goal': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: SmartReminder['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  const getDayName = (day: number) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[day];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Rappels Intelligents
              </CardTitle>
              <CardDescription>
                Restez sur la bonne voie avec des rappels personnalisés
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddReminder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rappel
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeReminders}</p>
                <p className="text-xs text-muted-foreground">Rappels actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-warning/10">
                <Flame className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.streakDays}</p>
                <p className="text-xs text-muted-foreground">Jours de streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.itemsDueToday}</p>
                <p className="text-xs text-muted-foreground">Items à réviser</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.nextReview ? stats.nextReview.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Prochaine révision</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'ajout */}
      {showAddReminder && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nouveau rappel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Ex: Révision neurologie"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newReminder.type}
                  onValueChange={(value: SmartReminder['type']) => setNewReminder({ ...newReminder, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="srs">Révision SRS</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="goal">Objectif</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={newReminder.priority}
                  onValueChange={(value: SmartReminder['priority']) => setNewReminder({ ...newReminder, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddReminder(false)}>
                Annuler
              </Button>
              <Button onClick={addReminder}>
                Créer le rappel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des rappels */}
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <Card key={reminder.id} className={!reminder.enabled ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${getTypeColor(reminder.type)}`}>
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{reminder.title}</h4>
                      <Badge variant={getPriorityColor(reminder.priority)}>
                        {reminder.priority === 'high' ? 'Haute' : 
                         reminder.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{reminder.time}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {reminder.days.map(d => getDayName(d)).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conseil intelligent */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-primary">Conseil du jour</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Basé sur votre historique, nous vous recommandons de réviser les items de Cardiologie 
                avant 14h pour une meilleure rétention. Votre streak de {stats.streakDays} jours 
                montre que vous êtes sur la bonne voie !
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
