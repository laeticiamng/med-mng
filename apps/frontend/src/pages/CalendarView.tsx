import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  X,
  Trophy,
  Bell
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { ROUTE_PATHS } from '@/config/routes';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'study' | 'goal' | 'challenge' | 'reminder';
  description?: string;
  duration?: number;
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
