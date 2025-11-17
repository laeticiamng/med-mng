import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useCreateEvent, useFetchEventCategories } from '@/hooks/useEvents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ROUTE_PATHS } from '@/config/routes'
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface EventFormData {
  title: string
  description: string
  eventType: 'event' | 'meeting' | 'task' | 'reminder'
  location: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  allDay: boolean
  isPrivate: boolean
  maxAttendees: number | undefined
  categoryId: string
  eventUrl: string
}

export default function EventCreate() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createEventMutation = useCreateEvent()
  const { data: categories = [] } = useFetchEventCategories()

  const [allDay, setAllDay] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [hasMaxAttendees, setHasMaxAttendees] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    defaultValues: {
      eventType: 'event',
      allDay: false,
      isPrivate: false,
      maxAttendees: undefined,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
    },
  })

  const eventType = watch('eventType')

  const onSubmit = async (data: EventFormData) => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour créer un événement')
      return
    }

    try {
      // Combine date and time
      const startDateTime = allDay
        ? `${data.startDate}T00:00:00.000Z`
        : `${data.startDate}T${data.startTime}:00.000Z`

      const endDateTime = allDay
        ? `${data.endDate}T23:59:59.000Z`
        : `${data.endDate}T${data.endTime}:00.000Z`

      // Validate dates
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast.error('La date de fin doit être après la date de début')
        return
      }

      const eventData = {
        title: data.title,
        description: data.description || undefined,
        eventType: data.eventType,
        location: data.location || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: allDay,
        organizerId: user.id,
        isPrivate: isPrivate,
        maxAttendees: hasMaxAttendees ? data.maxAttendees : undefined,
        categoryId: data.categoryId || undefined,
        eventUrl: data.eventUrl || undefined,
        status: 'scheduled' as const,
      }

      await createEventMutation.mutateAsync(eventData)

      toast.success('Événement créé avec succès !', {
        description: 'Vous pouvez le retrouver dans votre calendrier',
        icon: <CheckCircle2 className="h-5 w-5" />,
      })

      navigate(ROUTE_PATHS.events)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Erreur lors de la création de l\'événement', {
        description: 'Veuillez réessayer ou contacter le support',
      })
    }
  }

  if (!user) {
    return (
      <>
        <Helmet><title>Connexion requise | Med-Mng</title></Helmet>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Connexion requise</CardTitle>
              <CardDescription>Vous devez être connecté pour créer un événement</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(ROUTE_PATHS.login)} className="w-full">
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Créer un Événement | Med-Mng</title>
        <meta name="description" content="Créez un nouvel événement, réunion ou tâche" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.events}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux événements
              </Button>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Créer un événement</h1>
            <p className="text-muted-foreground text-lg">
              Organisez un événement, une réunion ou créez une tâche
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informations de base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Titre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Réunion d'équipe, Conférence..."
                    {...register('title', {
                      required: 'Le titre est requis',
                      minLength: { value: 3, message: 'Le titre doit contenir au moins 3 caractères' }
                    })}
                    aria-invalid={errors.title ? 'true' : 'false'}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre événement..."
                    rows={4}
                    {...register('description')}
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">
                    Type d'événement <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={eventType}
                    onValueChange={(value) => setValue('eventType', value as EventFormData['eventType'])}
                  >
                    <SelectTrigger id="eventType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Événement</SelectItem>
                      <SelectItem value="meeting">Réunion</SelectItem>
                      <SelectItem value="task">Tâche</SelectItem>
                      <SelectItem value="reminder">Rappel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Catégorie</Label>
                    <Select onValueChange={(value) => setValue('categoryId', value)}>
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date and Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Date et heure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* All Day Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="allDay" className="cursor-pointer">
                    Événement toute la journée
                  </Label>
                  <Switch
                    id="allDay"
                    checked={allDay}
                    onCheckedChange={(checked) => {
                      setAllDay(checked)
                      setValue('allDay', checked)
                    }}
                  />
                </div>

                {/* Start Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Date de début <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate', { required: 'La date de début est requise' })}
                      aria-invalid={errors.startDate ? 'true' : 'false'}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-destructive">{errors.startDate.message}</p>
                    )}
                  </div>

                  {!allDay && (
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Heure de début</Label>
                      <Input id="startTime" type="time" {...register('startTime')} />
                    </div>
                  )}
                </div>

                {/* End Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      Date de fin <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate', { required: 'La date de fin est requise' })}
                      aria-invalid={errors.endDate ? 'true' : 'false'}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-destructive">{errors.endDate.message}</p>
                    )}
                  </div>

                  {!allDay && (
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Heure de fin</Label>
                      <Input id="endTime" type="time" {...register('endTime')} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location and Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lieu et détails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Salle de conférence, Paris..."
                    {...register('location')}
                  />
                </div>

                {/* Event URL */}
                <div className="space-y-2">
                  <Label htmlFor="eventUrl">Lien de visioconférence (optionnel)</Label>
                  <Input
                    id="eventUrl"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    {...register('eventUrl')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Private Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPrivate" className="cursor-pointer">
                      Événement privé
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Seuls les participants invités pourront voir cet événement
                    </p>
                  </div>
                  <Switch
                    id="isPrivate"
                    checked={isPrivate}
                    onCheckedChange={(checked) => {
                      setIsPrivate(checked)
                      setValue('isPrivate', checked)
                    }}
                  />
                </div>

                {/* Max Attendees */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hasMaxAttendees" className="cursor-pointer">
                      Limiter le nombre de participants
                    </Label>
                    <Switch
                      id="hasMaxAttendees"
                      checked={hasMaxAttendees}
                      onCheckedChange={setHasMaxAttendees}
                    />
                  </div>
                  {hasMaxAttendees && (
                    <Input
                      type="number"
                      min="1"
                      placeholder="Nombre maximum de participants"
                      {...register('maxAttendees', {
                        valueAsNumber: true,
                        min: { value: 1, message: 'Au moins 1 participant requis' },
                      })}
                    />
                  )}
                  {errors.maxAttendees && (
                    <p className="text-sm text-destructive">{errors.maxAttendees.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTE_PATHS.events)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Créer l'événement
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
