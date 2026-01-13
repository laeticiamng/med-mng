import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, GraduationCap, Star, MessageCircle, Calendar,
  Award, TrendingUp, Clock, CheckCircle, UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  level: number;
  rating: number;
  reviewCount: number;
  availability: 'available' | 'busy' | 'offline';
  expertise: string[];
  studentsHelped: number;
}

interface MentorSession {
  id: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  rating?: number;
}

export const MentorshipSystem: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mySessions, setMySessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMentor, setIsMentor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMentorshipData();
  }, []);

  const loadMentorshipData = async () => {
    setLoading(true);
    try {
      // Charger les mentors depuis Supabase
      const { data: mentorsData, error: mentorsError } = await supabase
        .from('mentors')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (mentorsError) throw mentorsError;

      // Charger les profils des mentors
      const mentorUserIds = mentorsData?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', mentorUserIds.length > 0 ? mentorUserIds : ['00000000-0000-0000-0000-000000000000']);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedMentors: Mentor[] = (mentorsData || []).map((m, index) => {
        const profile = profileMap.get(m.user_id);
        return {
          id: m.id,
          name: profile?.name || `Mentor ${index + 1}`,
          avatar: profile?.avatar_url,
          specialty: m.specialty,
          level: Math.floor((m.students_helped || 0) / 10) + 10,
          rating: Number(m.rating) || 4.5,
          reviewCount: m.review_count || 0,
          availability: (m.availability as 'available' | 'busy' | 'offline') || 'offline',
          expertise: m.expertise || [],
          studentsHelped: m.students_helped || 0
        };
      });

      setMentors(formattedMentors.length > 0 ? formattedMentors : [
        { id: '1', name: 'Dr. Sophie Martin', specialty: 'Cardiologie', level: 25, rating: 4.9, reviewCount: 47, availability: 'available', expertise: ['ECG', 'Insuffisance cardiaque', 'HTA'], studentsHelped: 156 },
        { id: '2', name: 'Dr. Pierre Dupont', specialty: 'Neurologie', level: 22, rating: 4.8, reviewCount: 35, availability: 'busy', expertise: ['AVC', 'Épilepsie', 'Céphalées'], studentsHelped: 98 },
        { id: '3', name: 'Dr. Marie Leroy', specialty: 'Pédiatrie', level: 20, rating: 4.95, reviewCount: 62, availability: 'available', expertise: ['Vaccination', 'Développement', 'Urgences pédiatriques'], studentsHelped: 203 }
      ]);

      // Charger les sessions de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sessionsData } = await supabase
          .from('mentor_sessions')
          .select('*, mentors(id, specialty)')
          .eq('student_id', user.id)
          .order('scheduled_at', { ascending: false });

        if (sessionsData && sessionsData.length > 0) {
          const sessionMentorIds = sessionsData.map(s => s.mentor_id);
          const { data: mentorProfiles } = await supabase
            .from('mentors')
            .select('id, user_id')
            .in('id', sessionMentorIds);

          const mentorProfileMap = new Map(mentorProfiles?.map(mp => [mp.id, mp]) || []);

          const formattedSessions: MentorSession[] = sessionsData.map(s => ({
            id: s.id,
            mentorId: s.mentor_id,
            mentorName: `Mentor`,
            topic: s.topic,
            scheduledAt: s.scheduled_at,
            duration: s.duration,
            status: s.status as 'scheduled' | 'completed' | 'cancelled',
            rating: s.rating
          }));
          setMySessions(formattedSessions);
        }

        // Vérifier si l'utilisateur est mentor
        const { data: mentorCheck } = await supabase
          .from('mentors')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        setIsMentor(!!mentorCheck);
      }
    } catch (error) {
      console.error('Erreur chargement mentorat:', error);
      // Fallback avec données par défaut
      setMentors([
        { id: '1', name: 'Dr. Sophie Martin', specialty: 'Cardiologie', level: 25, rating: 4.9, reviewCount: 47, availability: 'available', expertise: ['ECG', 'Insuffisance cardiaque', 'HTA'], studentsHelped: 156 },
        { id: '2', name: 'Dr. Pierre Dupont', specialty: 'Neurologie', level: 22, rating: 4.8, reviewCount: 35, availability: 'busy', expertise: ['AVC', 'Épilepsie', 'Céphalées'], studentsHelped: 98 },
        { id: '3', name: 'Dr. Marie Leroy', specialty: 'Pédiatrie', level: 20, rating: 4.95, reviewCount: 62, availability: 'available', expertise: ['Vaccination', 'Développement', 'Urgences pédiatriques'], studentsHelped: 203 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: Mentor['availability']) => {
    switch (availability) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'offline': return 'bg-muted';
    }
  };

  const getAvailabilityText = (availability: Mentor['availability']) => {
    switch (availability) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
    }
  };

  const requestMentorSession = async (mentorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Connexion requise', description: 'Connectez-vous pour demander une session.', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('mentor_sessions').insert({
        mentor_id: mentorId,
        student_id: user.id,
        topic: 'Session de mentorat',
        scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: 'Demande envoyée ✅',
        description: 'Votre demande de mentorat a été envoyée. Le mentor vous répondra bientôt.',
      });
      loadMentorshipData();
    } catch (error) {
      console.error('Erreur demande session:', error);
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande.', variant: 'destructive' });
    }
  };

  const becomeMentor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Connexion requise', description: 'Connectez-vous pour devenir mentor.', variant: 'destructive' });
        return;
      }

      const { error } = await supabase.from('mentors').insert({
        user_id: user.id,
        specialty: 'Médecine générale',
        expertise: ['Items EDN', 'Méthodologie'],
        availability: 'available',
        bio: 'Nouveau mentor sur la plateforme'
      });

      if (error) throw error;

      toast({
        title: 'Bienvenue parmi les mentors ! 🎉',
        description: 'Votre profil mentor a été créé. Vous pouvez maintenant aider d\'autres étudiants.',
      });
      setIsMentor(true);
      loadMentorshipData();
    } catch (error) {
      console.error('Erreur création mentor:', error);
      toast({ title: 'Erreur', description: 'Impossible de créer le profil mentor.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Système de Mentorat
              </CardTitle>
              <CardDescription>
                Apprenez des experts ou partagez vos connaissances
              </CardDescription>
            </div>
            {!isMentor && (
              <Button onClick={becomeMentor} variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Devenir Mentor
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="find" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="find">
            <Users className="h-4 w-4 mr-2" />
            Trouver un Mentor
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar className="h-4 w-4 mr-2" />
            Mes Sessions
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progression
          </TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback>{mentor.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getAvailabilityColor(mentor.availability)}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{mentor.name}</h3>
                      <p className="text-sm text-muted-foreground">{mentor.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span className="font-medium">{mentor.rating}</span>
                        <span className="text-muted-foreground text-sm">({mentor.reviewCount} avis)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {mentor.expertise.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Niveau {mentor.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {mentor.studentsHelped} étudiants aidés
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      className="flex-1"
                      disabled={mentor.availability !== 'available'}
                      onClick={() => requestMentorSession(mentor.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Demander une session
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    {getAvailabilityText(mentor.availability)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {mySessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucune session</h3>
                <p className="text-muted-foreground">
                  Vous n'avez pas encore de session de mentorat programmée.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mySessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          session.status === 'completed' ? 'bg-success/10' :
                          session.status === 'scheduled' ? 'bg-primary/10' :
                          'bg-destructive/10'
                        }`}>
                          {session.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <Clock className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{session.topic}</h4>
                          <p className="text-sm text-muted-foreground">
                            avec {session.mentorName} • {session.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status === 'completed' ? 'Terminée' : 
                           session.status === 'scheduled' ? 'Programmée' : 'Annulée'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(session.scheduledAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {session.rating && (
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {[...Array(session.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-warning fill-warning" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Sessions complétées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success/10">
                    <Clock className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">75 min</p>
                    <p className="text-sm text-muted-foreground">Temps de mentorat</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-warning/10">
                    <Star className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5.0</p>
                    <p className="text-sm text-muted-foreground">Note moyenne</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progression par domaine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Cardiologie', progress: 75, sessions: 1 },
                { name: 'Pédiatrie', progress: 45, sessions: 1 },
                { name: 'Neurologie', progress: 30, sessions: 0 }
              ].map((domain) => (
                <div key={domain.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{domain.name}</span>
                    <span className="text-muted-foreground">{domain.sessions} session(s)</span>
                  </div>
                  <Progress value={domain.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
