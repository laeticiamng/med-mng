import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/contexts/AuthContext'
import {
  useFetchEvent,
  useFetchEventAttendees,
  useFetchEventComments,
  useAddEventAttendee,
  useUpdateAttendeeStatus,
  useAddEventComment,
  useDeleteEvent,
} from '@/hooks/useEvents'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { ROUTE_PATHS } from '@/config/routes'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  Share2,
  Edit,
  Trash2,
  Check,
  X,
  HelpCircle,
} from 'lucide-react'

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [commentContent, setCommentContent] = useState('')
  const [userRsvpStatus, setUserRsvpStatus] = useState<string | null>(null)

  const { data: event, isLoading: eventLoading } = useFetchEvent(eventId || '')
  const { data: attendees = [], isLoading: attendeesLoading } = useFetchEventAttendees(eventId || '')
  const { data: comments = [], isLoading: commentsLoading } = useFetchEventComments(eventId || '')

  const addAttendee = useAddEventAttendee()
  const updateRsvp = useUpdateAttendeeStatus()
  const addComment = useAddEventComment()
  const deleteEvent = useDeleteEvent()

  const handleRsvp = (status: string) => {
    if (!user?.id || !eventId) return

    const attendee = attendees.find(a => a.userId === user.id)

    if (attendee) {
      updateRsvp.mutate({
        eventId,
        userId: user.id,
        status,
      })
    } else {
      addAttendee.mutate({
        eventId,
        userId: user.id,
        status,
      })
    }
    setUserRsvpStatus(status)
  }

  const handleAddComment = () => {
    if (!user?.id || !eventId || !commentContent.trim()) return

    addComment.mutate({
      eventId,
      authorId: user.id,
      content: commentContent,
    })
    setCommentContent('')
  }

  const handleDeleteEvent = () => {
    if (!eventId) return
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
      deleteEvent.mutate(eventId, {
        onSuccess: () => navigate(ROUTE_PATHS.events),
      })
    }
  }

  const isEventOrganizer = event && user && event.organizerId === user.id
  const userAttendee = attendees.find(a => a.userId === user?.id)

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-lg mb-8" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Événement non trouvé</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.startDate)
  const eventEndDate = new Date(event.endDate)

  return (
    <>
      <Helmet>
        <title>{event.title} | Med-Mng</title>
        <meta name="description" content={event.description || 'Détail de l\'événement'} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
            {isEventOrganizer && (
              <div className="flex gap-2">
                <Link to={ROUTE_PATHS.eventEdit?.replace(':eventId', event.id) || '#'}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Éditer
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={handleDeleteEvent}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Détails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-semibold">Date de début</span>
                      </div>
                      <p>
                        {eventDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-semibold">Date de fin</span>
                      </div>
                      <p>
                        {eventEndDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {!event.allDay && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {eventDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {eventEndDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  <div>
                    <Badge
                      variant={
                        event.status === 'scheduled'
                          ? 'default'
                          : event.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {event.status === 'scheduled'
                        ? 'Planifié'
                        : event.status === 'in_progress'
                          ? 'En cours'
                          : event.status === 'completed'
                            ? 'Terminé'
                            : 'Annulé'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Attendees */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants ({attendees.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {attendeesLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : attendees.length === 0 ? (
                    <p className="text-muted-foreground">Aucun participant encore</p>
                  ) : (
                    <div className="space-y-2">
                      {attendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted"
                        >
                          <div>
                            <p className="font-semibold text-sm">{attendee.userId}</p>
                            <Badge
                              variant={
                                attendee.status === 'accepted'
                                  ? 'default'
                                  : attendee.status === 'declined'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className="text-xs"
                            >
                              {attendee.status === 'accepted'
                                ? 'Accepté'
                                : attendee.status === 'declined'
                                  ? 'Refusé'
                                  : attendee.status === 'maybe'
                                    ? 'Peut-être'
                                    : 'En attente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Commentaires ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Ajouter un commentaire..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!commentContent.trim() || addComment.isPending}
                        className="w-full"
                      >
                        Commenter
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3 mt-4">
                    {commentsLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : comments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        Aucun commentaire encore
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm">{comment.authorId}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              {/* RSVP Card */}
              {user && !isEventOrganizer && (
                <Card className="sticky top-8 mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">RSVP</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Confirmez votre présence:
                    </p>
                    <Button
                      variant={userRsvpStatus === 'accepted' ? 'default' : 'outline'}
                      className="w-full gap-2"
                      onClick={() => handleRsvp('accepted')}
                      disabled={updateRsvp.isPending || addAttendee.isPending}
                    >
                      <Check className="h-4 w-4" />
                      J'y vais
                    </Button>
                    <Button
                      variant={userRsvpStatus === 'maybe' ? 'default' : 'outline'}
                      className="w-full gap-2"
                      onClick={() => handleRsvp('maybe')}
                      disabled={updateRsvp.isPending || addAttendee.isPending}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Peut-être
                    </Button>
                    <Button
                      variant={userRsvpStatus === 'declined' ? 'destructive' : 'outline'}
                      className="w-full gap-2"
                      onClick={() => handleRsvp('declined')}
                      disabled={updateRsvp.isPending || addAttendee.isPending}
                    >
                      <X className="h-4 w-4" />
                      Je ne peux pas
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Event Type Badge */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type d'événement</p>
                    <Badge>
                      {event.eventType === 'meeting'
                        ? 'Réunion'
                        : event.eventType === 'task'
                          ? 'Tâche'
                          : event.eventType === 'reminder'
                            ? 'Rappel'
                            : 'Événement'}
                    </Badge>
                  </div>
                  {event.eventUrl && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Lien de l'événement</p>
                      <a
                        href={event.eventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm break-all"
                      >
                        Rejoindre en ligne
                      </a>
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
