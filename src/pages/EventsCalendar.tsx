import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useFetchCalendarEvents, useFetchEventCategories } from '@/hooks/useEvents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
} from 'lucide-react'

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export default function EventsCalendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const { data: events = [], isLoading: eventsLoading } = useFetchCalendarEvents(
    user?.id || '',
    startOfMonth,
    endOfMonth
  )
  const { data: categories = [], isLoading: categoriesLoading } = useFetchEventCategories()

  const getCategoryColor = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || '#3B82F6'
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = (getFirstDayOfMonth(currentDate) + 6) % 7 // Convert Sunday to 7
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getEventsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Veuillez vous connecter pour voir vos événements</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Calendrier des Événements | Med-Mng</title>
        <meta name="description" content="Gérez vos événements avec un calendrier interactif" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">Calendrier des Événements</h1>
              <p className="text-muted-foreground mt-2">
                Visualisez et gérez tous vos événements
              </p>
            </div>
            <Link to={ROUTE_PATHS.eventCreate}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvel Événement
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleToday}>
                        Aujourd'hui
                      </Button>
                      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 bg-muted">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="p-4 text-center font-semibold text-sm">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-3 bg-muted/50 min-h-24"></div>
                    ))}

                    {/* Days of month */}
                    {daysArray.map((day) => {
                      const dayEvents = getEventsForDate(day)
                      const isToday = new Date().getDate() === day &&
                        new Date().getMonth() === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear()

                      return (
                        <div
                          key={day}
                          className={`p-3 min-h-24 border cursor-pointer hover:bg-muted/50 transition-colors ${
                            isToday ? 'bg-blue-50 dark:bg-blue-950' : ''
                          }`}
                          onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                        >
                          <div className={`font-semibold mb-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <Link
                                key={event.id}
                                to={ROUTE_PATHS.eventDetail.replace(':eventId', event.id)}
                                className="block"
                              >
                                <div
                                  className="text-xs px-2 py-1 rounded text-white truncate hover:opacity-80"
                                  style={{ backgroundColor: getCategoryColor(event.categoryId) }}
                                >
                                  {event.title}
                                </div>
                              </Link>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground px-2">
                                +{dayEvents.length - 2} plus
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events Sidebar */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Événements à venir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : events.filter(e => new Date(e.startDate) > new Date()).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun événement à venir
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {events
                        .filter(e => new Date(e.startDate) > new Date())
                        .slice(0, 5)
                        .map((event) => (
                          <Link
                            key={event.id}
                            to={ROUTE_PATHS.eventDetail.replace(':eventId', event.id)}
                            className="block"
                          >
                            <div className="p-3 border rounded-lg hover:bg-muted transition-colors">
                              <h4 className="font-semibold text-sm line-clamp-1">
                                {event.title}
                              </h4>
                              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(event.startDate).toLocaleDateString('fr-FR', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
