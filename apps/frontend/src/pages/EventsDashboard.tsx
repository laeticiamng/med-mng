import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Calendar, Plus, Clock, MapPin, Users, Grid, List, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useFetchUserEvents, useFetchEventCategories } from '@/hooks/useEvents';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'upcoming' | 'past' | 'today';

export default function EventsDashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: events = [], isLoading } = useFetchUserEvents(user?.id || '', 100);
  const { data: categories = [] } = useFetchEventCategories();

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || event.categoryId === selectedCategory;

    const eventDate = new Date(event.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let matchesStatus = true;
    if (filterStatus === 'upcoming') {
      matchesStatus = eventDate >= today;
    } else if (filterStatus === 'past') {
      matchesStatus = eventDate < today;
    } else if (filterStatus === 'today') {
      matchesStatus = eventDate >= today && eventDate < tomorrow;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const upcomingCount = events.filter(e => new Date(e.startDate) >= new Date()).length;
  const pastCount = events.filter(e => new Date(e.startDate) < new Date()).length;
  const todayCount = events.filter(e => {
    const eventDate = new Date(e.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return eventDate >= today && eventDate < tomorrow;
  }).length;

  const getCategoryColor = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  };

  const formatEventDate = (dateStr: string, allDay: boolean) => {
    const date = new Date(dateStr);
    if (allDay) {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const EventCard = ({ event }: { event: any }) => (
    <Link to={ROUTE_PATHS.eventDetail.replace(':eventId', event.id)}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {event.imageUrl && (
          <div className="w-full h-40 overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
            {event.categoryId && (
              <Badge
                style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                className="flex-shrink-0"
              >
                {categories.find(c => c.id === event.categoryId)?.name || 'Event'}
              </Badge>
            )}
          </div>
          {event.description && (
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{formatEventDate(event.startDate, event.allDay)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
            {event.maxAttendees && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>{event.maxAttendees} participants max</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const EventListItem = ({ event }: { event: any }) => (
    <Link to={ROUTE_PATHS.eventDetail.replace(':eventId', event.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-20 h-20 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                {event.categoryId && (
                  <Badge
                    style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                    className="flex-shrink-0"
                  >
                    {categories.find(c => c.id === event.categoryId)?.name || 'Event'}
                  </Badge>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {event.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatEventDate(event.startDate, event.allDay)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                {event.maxAttendees && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{event.maxAttendees} max</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Veuillez vous connecter pour voir vos événements</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Événements | Med-Mng</title>
        <meta name="description" content="Gérez tous vos événements en un seul endroit" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold">Événements</h1>
              </div>
              <p className="text-muted-foreground">
                Gérez tous vos événements en un seul endroit
              </p>
            </div>
            <Link to={ROUTE_PATHS.eventCreate}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un événement
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-2xl">{events.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>À venir</CardDescription>
                <CardTitle className="text-2xl text-blue-600">{upcomingCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Aujourd'hui</CardDescription>
                <CardTitle className="text-2xl text-green-600">{todayCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Passés</CardDescription>
                <CardTitle className="text-2xl text-gray-600">{pastCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters and View Toggle */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un événement..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events Tabs */}
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="all">Tous ({events.length})</TabsTrigger>
              <TabsTrigger value="upcoming">À venir ({upcomingCount})</TabsTrigger>
              <TabsTrigger value="today">Aujourd'hui ({todayCount})</TabsTrigger>
              <TabsTrigger value="past">Passés ({pastCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filterStatus} className="mt-6">
              {isLoading ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-40 w-full mb-4" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredEvents.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <EventListItem key={event.id} event={event} />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucun événement trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory !== 'all'
                      ? 'Essayez de modifier vos filtres de recherche'
                      : 'Créez votre premier événement pour commencer'
                    }
                  </p>
                  {!searchQuery && selectedCategory === 'all' && (
                    <Link to={ROUTE_PATHS.eventCreate}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un événement
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <Link to={ROUTE_PATHS.eventsCalendar}>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Voir le calendrier
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
