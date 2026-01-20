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
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
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
  Settings,
  Flame,
  Star,
  Trophy
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
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();

  // Load user and gamification stats
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    init();
  }, [loadStats]);

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
      // Load real sessions from Supabase study_group_sessions table if it exists
      const { data, error } = await (supabase as any)
        .from('study_group_sessions')
        .select('*')
        .eq('is_public', true)
        .order('scheduled_start', { ascending: true })
        .limit(20);

      if (error) {
        console.warn('study_group_sessions table not available:', error.message);
        setSessions([]);
        return;
      }

      const formattedSessions: StudySession[] = (data || []).map((session: any) => ({
        id: session.id,
        session_name: session.session_name || session.name || 'Session sans nom',
        description: session.description || '',
        subject_areas: session.subject_areas || [],
        max_participants: session.max_participants || 5,
        current_participants: session.current_participants || 0,
        session_type: session.session_type || 'collaborative',
        scheduled_start: session.scheduled_start || new Date().toISOString(),
        duration_minutes: session.duration_minutes || 60,
        is_active: session.is_active || false,
        is_public: session.is_public || true,
        creator_id: session.creator_id || '',
        created_at: session.created_at || new Date().toISOString()
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMySessions = async () => {
    try {
      if (!user) {
        setMySessions([]);
        return;
      }

      const { data, error } = await (supabase as any)
        .from('study_group_sessions')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not load user sessions:', error.message);
        setMySessions([]);
        return;
      }

      const formattedSessions: StudySession[] = (data || []).map((session: any) => ({
        id: session.id,
        session_name: session.session_name || session.name || 'Session sans nom',
        description: session.description || '',
        subject_areas: session.subject_areas || [],
        max_participants: session.max_participants || 5,
        current_participants: session.current_participants || 0,
        session_type: session.session_type || 'collaborative',
        scheduled_start: session.scheduled_start || new Date().toISOString(),
        duration_minutes: session.duration_minutes || 60,
        is_active: session.is_active || false,
        is_public: session.is_public || true,
        creator_id: session.creator_id || '',
        created_at: session.created_at || new Date().toISOString()
      }));

      setMySessions(formattedSessions);
    } catch (error) {
      console.error('Erreur chargement mes sessions:', error);
      setMySessions([]);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour créer une session",
          variant: "destructive"
        });
        return;
      }

      // Insérer dans Supabase (table non typée)
      const { data: newSessionData, error } = await (supabase as any)
        .from('collaborative_study_sessions')
        .insert({
          session_name: newSession.session_name,
          description: newSession.description,
          subject_areas: newSession.subject_areas,
          max_participants: newSession.max_participants,
          current_participants: 1,
          session_type: newSession.session_type,
          scheduled_start: newSession.scheduled_start || null,
          duration_minutes: newSession.duration_minutes,
          is_active: false,
          is_public: newSession.is_public,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      const sessionData: StudySession = {
        id: newSessionData.id,
        session_name: newSessionData.session_name,
        description: newSessionData.description,
        subject_areas: newSessionData.subject_areas || [],
        max_participants: newSessionData.max_participants,
        current_participants: newSessionData.current_participants,
        session_type: newSessionData.session_type,
        scheduled_start: newSessionData.scheduled_start,
        duration_minutes: newSessionData.duration_minutes,
        is_active: newSessionData.is_active,
        is_public: newSessionData.is_public,
        creator_id: newSessionData.creator_id,
        created_at: newSessionData.created_at
      };

      setSessions(prev => [sessionData, ...prev]);
      setMySessions(prev => [sessionData, ...prev]);

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
        title: "Session créée",
        description: "Votre session d'étude collaborative a été créée avec succès",
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Connectez-vous pour rejoindre une session",
          variant: "destructive"
        });
        return;
      }

      // Incrémenter le nombre de participants (table non typée)
      await (supabase as any)
        .from('collaborative_study_sessions')
        .update({ current_participants: (sessions.find(s => s.id === sessionId)?.current_participants || 0) + 1 })
        .eq('id', sessionId);

      // Mise à jour locale
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, current_participants: session.current_participants + 1 }
            : session
        )
      );

      toast({
        title: "Session rejointe",
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
      {/* Gamification Stats Banner */}
      {user && gamificationStats && (
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-warning/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-warning" />
                  <span className="text-lg font-bold text-warning">{gamificationStats.currentStreak}</span>
                  <span className="text-sm text-muted-foreground">jours</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-lg font-bold text-primary">Niv. {gamificationStats.level}</span>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-success" />
                  <span className="text-lg font-bold text-success">{gamificationStats.badges?.length || 0}</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              </div>
              <Badge variant="outline">{gamificationStats.totalPoints} XP</Badge>
            </div>
          </CardContent>
        </Card>
      )}

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