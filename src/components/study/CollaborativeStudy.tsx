import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search,
  Filter,
  Video,
  MessageCircle,
  BookOpen,
  UserPlus,
  Settings
} from 'lucide-react';

interface StudySession {
  id: string;
  session_name: string;
  description: string;
  subject_areas: string[];
  max_participants: number;
  current_participants: number;
  session_type: string;
  scheduled_start: string;
  duration_minutes: number;
  is_active: boolean;
  is_public: boolean;
  creator_id: string;
  created_at: string;
}

interface SessionParticipant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export const CollaborativeStudy: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [mySessions, setMySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [newSession, setNewSession] = useState({
    session_name: '',
    description: '',
    subject_areas: [] as string[],
    max_participants: 5,
    duration_minutes: 60,
    scheduled_start: '',
    session_type: 'collaborative',
    is_public: true
  });

  useEffect(() => {
    loadSessions();
    loadMySessions();
    setupRealtimeSubscription();
  }, []);

  const loadSessions = async () => {
    try {
      // Utiliser une table existante compatible ou créer une logique de mapping
      console.log('Chargement des sessions d\'étude...');
      // Pour le moment, utilisons des données simulées
      const mockSessions: StudySession[] = [
        {
          id: '1',
          session_name: 'Révision Cardiologie',
          description: 'Session de révision intensive en cardiologie',
          subject_areas: ['cardiologie', 'ECG'],
          max_participants: 5,
          current_participants: 3,
          session_type: 'collaborative',
          scheduled_start: new Date(Date.now() + 3600000).toISOString(),
          duration_minutes: 90,
          is_active: false,
          is_public: true,
          creator_id: 'user1',
          created_at: new Date().toISOString()
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMySessions = async () => {
    try {
      // Pour le moment, utilisons des données simulées
      const mockMySessions: StudySession[] = [];
      setMySessions(mockMySessions);
    } catch (error) {
      console.error('Erreur chargement mes sessions:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    // Désactivé temporairement car les tables n'existent pas encore
    console.log('Realtime subscription configurée');
    return () => {
      console.log('Subscription nettoyée');
    };
  };

  const createSession = async () => {
    try {
      // Simulation de création de session
      console.log('Création session:', newSession);
      
      const newSessionData: StudySession = {
        id: Date.now().toString(),
        session_name: newSession.session_name,
        description: newSession.description,
        subject_areas: newSession.subject_areas,
        max_participants: newSession.max_participants,
        current_participants: 1,
        session_type: newSession.session_type,
        scheduled_start: newSession.scheduled_start,
        duration_minutes: newSession.duration_minutes,
        is_active: false,
        is_public: newSession.is_public,
        creator_id: 'current-user',
        created_at: new Date().toISOString()
      };

      setSessions(prev => [newSessionData, ...prev]);
      setMySessions(prev => [newSessionData, ...prev]);

      setNewSession({
        session_name: '',
        description: '',
        subject_areas: [],
        max_participants: 5,
        duration_minutes: 60,
        scheduled_start: '',
        session_type: 'collaborative',
        is_public: true
      });

      setShowCreateForm(false);

      toast({
        title: "Session créée (simulation)",
        description: "Votre session d'étude collaborative a été simulée avec succès",
      });
    } catch (error) {
      console.error('Erreur création session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session",
        variant: "destructive"
      });
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      // Simulation de rejoindre une session
      console.log('Rejoindre session:', sessionId);
      
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, current_participants: session.current_participants + 1 }
            : session
        )
      );

      toast({
        title: "Session rejointe (simulation)",
        description: "Vous avez rejoint la session d'étude collaborative",
      });
    } catch (error) {
      console.error('Erreur rejoindre session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejoindre la session",
        variant: "destructive"
      });
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video_call': return <Video className="w-4 h-4" />;
      case 'text_chat': return <MessageCircle className="w-4 h-4" />;
      case 'silent_study': return <BookOpen className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getSessionStatus = (session: StudySession) => {
    const now = new Date();
    const start = new Date(session.scheduled_start);
    const end = new Date(start.getTime() + session.duration_minutes * 60000);

    if (session.is_active && now >= start && now <= end) {
      return { status: 'active', label: 'En cours', color: 'bg-success' };
    } else if (now < start) {
      return { status: 'scheduled', label: 'Programmée', color: 'bg-primary' };
    } else {
      return { status: 'ended', label: 'Terminée', color: 'bg-muted' };
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.session_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    const status = getSessionStatus(session);
    switch (filter) {
      case 'active': return status.status === 'active';
      case 'scheduled': return status.status === 'scheduled';
      default: return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Étude Collaborative
          </h2>
          <p className="text-muted-foreground">
            Rejoignez ou créez des sessions d'étude en groupe
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Créer une session
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher une session..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sessions</SelectItem>
            <SelectItem value="active">Sessions actives</SelectItem>
            <SelectItem value="scheduled">Sessions programmées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mes sessions */}
      {mySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Mes Sessions
            </CardTitle>
            <CardDescription>
              Sessions que vous avez créées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {mySessions.slice(0, 4).map((session) => {
                const status = getSessionStatus(session);
                return (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{session.session_name}</h4>
                      <Badge variant="outline" className="gap-1">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {session.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {session.current_participants}/{session.max_participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration_minutes}min
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions publiques */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => {
          const status = getSessionStatus(session);
          const canJoin = session.current_participants < session.max_participants && 
                         status.status !== 'ended';
          
          return (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getSessionTypeIcon(session.session_type)}
                    <CardTitle className="text-lg">{session.session_name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    {status.label}
                  </Badge>
                </div>
                <CardDescription>{session.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Sujets */}
                <div className="flex flex-wrap gap-1">
                  {session.subject_areas.map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>

                {/* Détails */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(session.scheduled_start).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(session.scheduled_start).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} • {session.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {session.current_participants}/{session.max_participants} participants
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    disabled={!canJoin}
                    onClick={() => joinSession(session.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {canJoin ? 'Rejoindre' : 'Complet'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une nouvelle session</CardTitle>
            <CardDescription>
              Organisez une session d'étude collaborative
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session_name">Nom de la session</Label>
                <Input
                  id="session_name"
                  value={newSession.session_name}
                  onChange={(e) => setNewSession({...newSession, session_name: e.target.value})}
                  placeholder="Ex: Révision Cardiologie"
                />
              </div>
              <div>
                <Label htmlFor="max_participants">Nombre max de participants</Label>
                <Select 
                  value={newSession.max_participants.toString()} 
                  onValueChange={(value) => setNewSession({...newSession, max_participants: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 8, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} personnes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newSession.description}
                onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                placeholder="Décrivez l'objectif de cette session..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled_start">Date et heure</Label>
                <Input
                  id="scheduled_start"
                  type="datetime-local"
                  value={newSession.scheduled_start}
                  onChange={(e) => setNewSession({...newSession, scheduled_start: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="duration">Durée (minutes)</Label>
                <Select 
                  value={newSession.duration_minutes.toString()} 
                  onValueChange={(value) => setNewSession({...newSession, duration_minutes: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2 heures</SelectItem>
                    <SelectItem value="180">3 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
              <Button onClick={createSession} disabled={!newSession.session_name || !newSession.scheduled_start}>
                Créer la session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredSessions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucune session trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Créez la première session d'étude collaborative
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Créer une session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};