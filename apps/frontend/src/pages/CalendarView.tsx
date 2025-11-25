import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Target,
  GraduationCap,
  FileQuestion,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface StudyEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  type: 'study' | 'revision' | 'exam' | 'quiz';
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'completed' | 'missed';
  item_code?: string;
}

/**
 * CalendarView - Vue calendrier complète pour planification d'étude
 * Permet de créer, visualiser et gérer des sessions d'étude
 */
export default function CalendarView() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Données d'exemple - À remplacer par les vraies données Supabase
  const [events, setEvents] = useState<StudyEvent[]>([
    {
      id: '1',
      title: 'Révision Cardiologie',
      description: 'Items IC-220 à IC-235',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      duration: 90,
      type: 'study',
      priority: 'high',
      status: 'planned',
      item_code: 'IC-220'
    },
    {
      id: '2',
      title: 'Quiz Neurologie',
      description: 'Test sur les AVC',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '09:00',
      duration: 30,
      type: 'quiz',
      priority: 'medium',
      status: 'planned',
      item_code: 'IC-125'
    },
    {
      id: '3',
      title: 'Examen Blanc',
      description: 'Simulation EDN complète',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      time: '08:00',
      duration: 360,
      type: 'exam',
      priority: 'high',
      status: 'planned'
    },
    {
      id: '4',
      title: 'Révision Pneumologie',
      description: 'BPCO et asthme',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      type: 'revision',
      priority: 'medium',
      status: 'planned',
      item_code: 'IC-154'
    }
  ]);

  // Formulaire pour nouvelle session
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    type: 'study' as const,
    priority: 'medium' as const,
    item_code: ''
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Cellules vides avant le premier jour du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (type: string): "destructive" | "default" | "secondary" | "outline" => {
    switch (type) {
      case 'exam': return 'destructive';
      case 'quiz': return 'default';
      case 'study': return 'secondary';
      case 'revision': return 'outline';
      default: return 'default';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <GraduationCap className="h-4 w-4" />;
      case 'quiz': return <FileQuestion className="h-4 w-4" />;
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'revision': return <Target className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-3 w-3 text-destructive" />;
      case 'medium': return <Clock className="h-3 w-3 text-primary" />;
      case 'low': return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
      default: return null;
    }
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error('Veuillez entrer un titre');
      return;
    }

    const event: StudyEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description || undefined,
      date: newEvent.date,
      time: newEvent.time,
      duration: newEvent.duration,
      type: newEvent.type,
      priority: newEvent.priority,
      status: 'planned',
      item_code: newEvent.item_code || undefined
    };

    setEvents(prev => [...prev, event]);
    setIsCreateDialogOpen(false);
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate.toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      type: 'study',
      priority: 'medium',
      item_code: ''
    });
    toast.success('Session créée avec succès');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast.success('Session supprimée');
  };

  const handleMarkComplete = (eventId: string) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, status: 'completed' as const } : e
    ));
    toast.success('Session marquée comme terminée');
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  // Helper to normalize a date string or Date object to midnight
  function getDateAtMidnight(date: string | Date): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // Statistiques
  const stats = {
    total: events.length,
    completed: events.filter(e => e.status === 'completed').length,
    upcoming: events.filter(e =>
      e.status === 'planned' &&
      getDateAtMidnight(e.date) >= getDateAtMidnight(new Date())
    ).length,
    thisWeek: events.filter(e => {
      const eventDate = getDateAtMidnight(e.date);
      const now = getDateAtMidnight(new Date());
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= now && eventDate <= weekFromNow;
    }).length
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  Target,
  Trophy,
  Bell,
  Loader2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/config/routes';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'study' | 'goal' | 'challenge' | 'reminder';
  description?: string;
  duration?: number;
  completed?: boolean;
}

const eventTypeConfig = {
  study: { icon: BookOpen, color: 'bg-blue-500', label: 'Session d\'étude' },
  goal: { icon: Target, color: 'bg-green-500', label: 'Objectif' },
  challenge: { icon: Trophy, color: 'bg-purple-500', label: 'Challenge' },
  reminder: { icon: Bell, color: 'bg-orange-500', label: 'Rappel' },
};

export default function CalendarView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'study' as const,
    description: '',
    duration: 60,
  });

  // Sample events data (would be fetched from backend in production)
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Révision Cardiologie',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 10, 0),
      type: 'study',
      duration: 120,
      description: 'Items 228-232 - Insuffisance cardiaque',
    },
    {
      id: '2',
      title: 'Challenge Hebdo',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 17, 14, 0),
      type: 'challenge',
      description: '20 QCM en 30 minutes',
    },
    {
      id: '3',
      title: 'Objectif: 100 items',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 0, 0),
      type: 'goal',
      description: 'Terminer 100 items cette semaine',
    },
    {
      id: '4',
      title: 'Rappel ECN Blanc',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25, 9, 0),
      type: 'reminder',
      description: 'Inscription ECN Blanc Mars',
    },
  ]);

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Calendar grid calculation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: (Date | null)[] = [];

    // Add empty days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(
      (event) =>
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
    );
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Handle event creation
  const handleCreateEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      type: newEvent.type,
      description: newEvent.description,
      duration: newEvent.duration,
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', type: 'study', description: '', duration: 60 });
    setCreateDialogOpen(false);

    toast({
      title: 'Événement créé',
      description: `"${event.title}" ajouté au ${selectedDate.toLocaleDateString('fr-FR')}`,
    });
  };

  // Check if a date is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <>
      <Helmet>
        <title>Calendrier d'étude | Med-Mng</title>
        <meta name="description" content="Planifiez et suivez vos sessions d'étude avec le calendrier Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Calendar className="h-10 w-10 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold">Calendrier d'étude</h1>
                  <p className="text-muted-foreground">Planifiez et suivez vos sessions d'apprentissage</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className="rounded-r-none"
                  >
                    Mois
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className="rounded-none border-x"
                  >
                    Semaine
                  </Button>
                  <Button
                    variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                    className="rounded-l-none"
                  >
                    Jour
                  </Button>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Créer une session d'étude</DialogTitle>
                      <DialogDescription>
                        Planifiez une nouvelle session d'étude ou de révision
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                          id="title"
                          placeholder="Ex: Révision Cardiologie"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Détails sur la session..."
                          value={newEvent.description}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="time">Heure</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={newEvent.type}
                            onValueChange={(value: 'study' | 'revision' | 'exam' | 'quiz') =>
                              setNewEvent(prev => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="study">Étude</SelectItem>
                              <SelectItem value="revision">Révision</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="exam">Examen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="priority">Priorité</Label>
                          <Select
                            value={newEvent.priority}
                            onValueChange={(value: 'low' | 'medium' | 'high') =>
                              setNewEvent(prev => ({ ...prev, priority: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Basse</SelectItem>
                              <SelectItem value="medium">Moyenne</SelectItem>
                              <SelectItem value="high">Haute</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="duration">Durée (min)</Label>
                          <Input
                            id="duration"
                            type="number"
                            min="15"
                            step="15"
                            value={newEvent.duration}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="item_code">Code Item (optionnel)</Label>
                          <Input
                            id="item_code"
                            placeholder="Ex: IC-220"
                            value={newEvent.item_code}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, item_code: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateEvent}>
                        Créer la session
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total sessions</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Terminées</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">À venir</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cette semaine</p>
                    <p className="text-2xl font-bold text-primary">{stats.thisWeek}</p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendrier principal */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentDate(new Date());
                          setSelectedDate(new Date());
                        }}
                      >
                        Aujourd'hui
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* En-têtes des jours */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {dayNames.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grille du calendrier */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                      const dayEvents = getEventsForDate(date);
                      return (
                        <div
                          key={index}
                          className={`
                            min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                            ${date ? 'hover:bg-muted/50 hover:border-primary/50' : 'opacity-0 pointer-events-none'}
                            ${isToday(date) ? 'bg-primary/10 border-primary' : 'border-border'}
                            ${isSelected(date) ? 'ring-2 ring-primary ring-offset-2' : ''}
                          `}
                          onClick={() => date && setSelectedDate(date)}
                        >
                          {date && (
                            <>
                              <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-primary' : ''}`}>
                                {date.getDate()}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => (
                                  <div
                                    key={event.id}
                                    className={`
                                      text-xs p-1 rounded truncate
                                      ${event.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-primary/10 text-primary'}
                                    `}
                                  >
                                    {event.time.slice(0, 5)} {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-muted-foreground pl-1">
                                    +{dayEvents.length - 2} autres
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Panneau de détails */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {selectedDate.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateEvents.length} session{selectedDateEvents.length !== 1 ? 's' : ''} programmée{selectedDateEvents.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`
                          border rounded-lg p-4 space-y-3 transition-all
                          ${event.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <h4 className="font-medium">{event.title}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(event.priority)}
                            <Badge variant={getEventTypeColor(event.type)} className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </div>
                          <div>
                            {event.duration} min
                          </div>
                          {event.item_code && (
                            <Badge variant="outline" className="text-xs">
                              {event.item_code}
                            </Badge>
                          )}
                        </div>

                        {event.status === 'planned' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleMarkComplete(event.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Terminer
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {event.status === 'completed' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terminée
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="mb-4">Aucune session programmée</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewEvent(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] }));
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Ajouter une session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

        <title>Calendrier | Med-Mng</title>
        <meta name="description" content="Planifiez vos sessions d'étude et suivez vos objectifs" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Calendar className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Calendrier</h1>
                <p className="text-gray-600">Planifiez vos sessions d'étude</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={ROUTE_PATHS.studyPlanner}>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Planificateur
                </Button>
              </Link>
              <Link to={ROUTE_PATHS.goals}>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Objectifs
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Aujourd'hui
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day names header */}
                <div className="grid grid-cols-7 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <button
                        key={index}
                        onClick={() => date && setSelectedDate(date)}
                        disabled={!date}
                        className={cn(
                          'aspect-square p-1 rounded-lg transition-colors relative flex flex-col items-center justify-start',
                          date && 'hover:bg-gray-100',
                          isToday(date) && 'bg-blue-100 hover:bg-blue-200',
                          isSelected(date) && 'ring-2 ring-blue-500 bg-blue-50',
                          !date && 'invisible'
                        )}
                      >
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isToday(date) && 'text-blue-600',
                            isSelected(date) && 'text-blue-700'
                          )}
                        >
                          {date?.getDate()}
                        </span>
                        {hasEvents && (
                          <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  eventTypeConfig[event.type].color
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Event type legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                  {Object.entries(eventTypeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', config.color)} />
                      <span className="text-sm text-gray-600">{config.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected date events */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedDate ? (
                      <>
                        {selectedDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </>
                    ) : (
                      'Sélectionnez une date'
                    )}
                  </CardTitle>
                  {selectedDate && (
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nouvel événement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Titre</Label>
                            <Input
                              placeholder="Ex: Révision Cardiologie"
                              value={newEvent.title}
                              onChange={(e) =>
                                setNewEvent({ ...newEvent, title: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                              value={newEvent.type}
                              onValueChange={(value: any) =>
                                setNewEvent({ ...newEvent, type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(eventTypeConfig).map(([type, config]) => (
                                  <SelectItem key={type} value={type}>
                                    <div className="flex items-center gap-2">
                                      <div className={cn('w-2 h-2 rounded-full', config.color)} />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Durée (minutes)</Label>
                            <Input
                              type="number"
                              value={newEvent.duration}
                              onChange={(e) =>
                                setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description (optionnel)</Label>
                            <Textarea
                              placeholder="Détails de l'événement..."
                              value={newEvent.description}
                              onChange={(e) =>
                                setNewEvent({ ...newEvent, description: e.target.value })
                              }
                              rows={3}
                            />
                          </div>
                          <Button
                            onClick={handleCreateEvent}
                            disabled={!newEvent.title.trim()}
                            className="w-full"
                          >
                            Créer l'événement
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {selectedDate ? (
                    selectedDateEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDateEvents.map((event) => {
                          const config = eventTypeConfig[event.type];
                          const Icon = config.icon;

                          return (
                            <div
                              key={event.id}
                              className="p-3 rounded-lg border bg-white hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn('p-2 rounded-lg', config.color, 'bg-opacity-20')}>
                                  <Icon className={cn('h-4 w-4', config.color.replace('bg-', 'text-'))} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {event.title}
                                  </h4>
                                  {event.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                      {event.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {config.label}
                                    </Badge>
                                    {event.duration && (
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {event.duration} min
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Aucun événement</p>
                        <p className="text-sm text-gray-400">
                          Cliquez sur + pour ajouter un événement
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Sélectionnez une date</p>
                      <p className="text-sm text-gray-400">
                        pour voir ou ajouter des événements
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(ROUTE_PATHS.sessions)}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Sessions d'étude</h3>
                  <p className="text-sm text-gray-500">Gérez vos sessions</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(ROUTE_PATHS.challenges)}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Challenges</h3>
                  <p className="text-sm text-gray-500">Relevez des défis</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(ROUTE_PATHS.notifications)}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Rappels</h3>
                  <p className="text-sm text-gray-500">Configurez vos alertes</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
