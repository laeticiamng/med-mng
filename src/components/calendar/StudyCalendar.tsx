import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export const StudyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    // Mock data - Replace with real Supabase query
    const mockEvents: StudyEvent[] = [
      {
        id: '1',
        title: 'Révision Cardiologie',
        description: 'Items IC-220 à IC-235',
        date: '2025-01-15',
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
        date: '2025-01-16',
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
        date: '2025-01-20',
        time: '08:00',
        duration: 360,
        type: 'exam',
        priority: 'high',
        status: 'planned'
      }
    ];
    setEvents(mockEvents);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'destructive';
      case 'quiz': return 'default';
      case 'study': return 'secondary';
      case 'revision': return 'outline';
      default: return 'default';
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

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendrier d'étude</h2>
          <p className="text-muted-foreground">
            Planifiez et suivez vos sessions d'apprentissage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode('month')}>
            Mois
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('week')}>
            Semaine
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('day')}>
            Jour
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    ←
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                        ${date ? 'hover:bg-muted/50' : ''}
                        ${isToday(date) ? 'bg-primary/10 border-primary' : ''}
                        ${isSelected(date) ? 'bg-accent border-accent-foreground' : ''}
                        ${!date ? 'opacity-0' : ''}
                      `}
                      onClick={() => date && setSelectedDate(date)}
                    >
                      {date && (
                        <>
                          <div className="text-sm font-medium">
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                              >
                                {event.time} {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground">
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              <CardDescription>
                {getEventsForDate(selectedDate).length} événement(s) programmé(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(event.priority)}
                      <Badge variant={getEventTypeColor(event.type)}>
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
                      <Badge variant="outline">
                        {event.item_code}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-8 w-8 mb-2" />
                  <p>Aucun événement programmé</p>
                  <Button size="sm" className="mt-2">
                    <Plus className="mr-2 h-3 w-3" />
                    Ajouter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};