import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Image, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useCreateEvent, useFetchEventCategories } from '@/hooks/useEvents';
import { ROUTE_PATHS } from '@/config/routes';

const eventSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  eventType: z.enum(['event', 'meeting', 'task', 'reminder']),
  location: z.string().optional(),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  allDay: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  maxAttendees: z.number().optional(),
  eventUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories = [] } = useFetchEventCategories();
  const createEvent = useCreateEvent();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventType: 'event',
      allDay: false,
      isPrivate: false,
    },
  });

  const allDay = watch('allDay');

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un événement');
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        ...data,
        organizerId: user.id,
        status: 'scheduled' as const,
        maxAttendees: data.maxAttendees || undefined,
      };

      await createEvent.mutateAsync(eventData);
      toast.success('Événement créé avec succès');
      navigate(ROUTE_PATHS.eventsCalendar);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Erreur lors de la création de l\'événement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Veuillez vous connecter pour créer un événement</p>
            <Button className="mt-4" onClick={() => navigate('/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Créer un Événement | Med-Mng</title>
        <meta name="description" content="Créez un nouvel événement sur Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTE_PATHS.eventsCalendar)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au calendrier
            </Button>
            <div className="flex items-center gap-3">
              <Calendar className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">Créer un Événement</h1>
                <p className="text-muted-foreground mt-1">
                  Organisez un nouvel événement pour votre communauté
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'événement</CardTitle>
                <CardDescription>
                  Remplissez les détails de votre événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Conférence sur la cardiologie"
                    {...register('title')}
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
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Type and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Type d'événement *</Label>
                    <Select
                      value={watch('eventType')}
                      onValueChange={(value) => setValue('eventType', value as any)}
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Catégorie</Label>
                    <Select
                      value={watch('categoryId') || ''}
                      onValueChange={(value) => setValue('categoryId', value)}
                    >
                      <SelectTrigger>
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
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allDay"
                      checked={watch('allDay')}
                      onCheckedChange={(checked) => setValue('allDay', checked)}
                    />
                    <Label htmlFor="allDay">Événement sur toute la journée</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Date de début *
                      </Label>
                      <Input
                        id="startDate"
                        type={allDay ? 'date' : 'datetime-local'}
                        {...register('startDate')}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-destructive">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Date de fin *
                      </Label>
                      <Input
                        id="endDate"
                        type={allDay ? 'date' : 'datetime-local'}
                        {...register('endDate')}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-destructive">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Lieu
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ex: Amphithéâtre A, Campus médical"
                    {...register('location')}
                  />
                </div>

                {/* Additional Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Paramètres avancés</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">
                        <Users className="h-4 w-4 inline mr-2" />
                        Nombre maximum de participants
                      </Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        min="1"
                        placeholder="Illimité"
                        {...register('maxAttendees', {
                          setValueAs: (v) => v === '' ? undefined : parseInt(v, 10)
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventUrl">
                        <LinkIcon className="h-4 w-4 inline mr-2" />
                        URL de l'événement
                      </Label>
                      <Input
                        id="eventUrl"
                        type="url"
                        placeholder="https://..."
                        {...register('eventUrl')}
                      />
                      {errors.eventUrl && (
                        <p className="text-sm text-destructive">{errors.eventUrl.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">
                      <Image className="h-4 w-4 inline mr-2" />
                      URL de l'image
                    </Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://..."
                      {...register('imageUrl')}
                    />
                    {errors.imageUrl && (
                      <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPrivate"
                      checked={watch('isPrivate')}
                      onCheckedChange={(checked) => setValue('isPrivate', checked)}
                    />
                    <Label htmlFor="isPrivate">Événement privé</Label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTE_PATHS.eventsCalendar)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Création...' : 'Créer l\'événement'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
}
