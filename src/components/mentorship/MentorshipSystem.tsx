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
      // Simulated data - would connect to Supabase in production
      setMentors([
        {
          id: '1',
          name: 'Dr. Sophie Martin',
          specialty: 'Cardiologie',
          level: 25,
          rating: 4.9,
          reviewCount: 47,
          availability: 'available',
          expertise: ['ECG', 'Insuffisance cardiaque', 'HTA'],
          studentsHelped: 156
        },
        {
          id: '2',
          name: 'Dr. Pierre Dupont',
          specialty: 'Neurologie',
          level: 22,
          rating: 4.8,
          reviewCount: 35,
          availability: 'busy',
          expertise: ['AVC', 'Épilepsie', 'Céphalées'],
          studentsHelped: 98
        },
        {
          id: '3',
          name: 'Dr. Marie Leroy',
          specialty: 'Pédiatrie',
          level: 20,
          rating: 4.95,
          reviewCount: 62,
          availability: 'available',
          expertise: ['Vaccination', 'Développement', 'Urgences pédiatriques'],
          studentsHelped: 203
        }
      ]);

      setMySessions([
        {
          id: '1',
          mentorId: '1',
          mentorName: 'Dr. Sophie Martin',
          topic: 'Lecture ECG avancée',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 45,
          status: 'scheduled'
        },
        {
          id: '2',
          mentorId: '3',
          mentorName: 'Dr. Marie Leroy',
          topic: 'Cas clinique pédiatrique',
          scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          status: 'completed',
          rating: 5
        }
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
    toast({
      title: 'Demande envoyée',
      description: 'Votre demande de mentorat a été envoyée. Le mentor vous répondra bientôt.',
    });
  };

  const becomeMentor = async () => {
    toast({
      title: 'Candidature envoyée',
      description: 'Votre candidature pour devenir mentor est en cours de traitement.',
    });
    setIsMentor(true);
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
