import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  UserPlus,
  Crown,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Flag,
  Edit,
  Trash2,
  Send,
  Video,
  Calendar,
  Globe,
  Lock,
  Eye
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useToast } from '@/hooks/use-toast';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  category: string;
  members: GroupMember[];
  recentActivity: string;
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: string;
  status: 'online' | 'offline' | 'studying';
  studyStreak: number;
}

interface Discussion {
  id: string;
  title: string;
  author: GroupMember;
  content: string;
  itemId?: string;
  itemTitle?: string;
  createdAt: string;
  replies: Reply[];
  likes: number;
  isLiked: boolean;
  tags: string[];
  isResolved?: boolean;
}

interface Reply {
  id: string;
  author: GroupMember;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface StudySession {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  duration: number;
  hostId: string;
  hostName: string;
  participants: string[];
  maxParticipants: number;
  isRecurring: boolean;
  meetingLink?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export const EdnCollaboration: React.FC = () => {
  const { toast } = useToast();
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [publicGroups, setPublicGroups] = useState<StudyGroup[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', tags: '' });
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  // Données simulées
  useEffect(() => {
    const mockMembers: GroupMember[] = [
      {
        id: '1',
        name: 'Sarah Martin',
        avatar: '/avatars/sarah.jpg',
        role: 'owner',
        joinedAt: '2024-01-01',
        status: 'online',
        studyStreak: 12
      },
      {
        id: '2', 
        name: 'Thomas Dubois',
        avatar: '/avatars/thomas.jpg',
        role: 'moderator',
        joinedAt: '2024-01-05',
        status: 'studying',
        studyStreak: 8
      },
      {
        id: '3',
        name: 'Marie Laurent',
        role: 'member',
        joinedAt: '2024-01-10',
        status: 'offline',
        studyStreak: 5
      }
    ];

    const mockGroups: StudyGroup[] = [
      {
        id: 'g1',
        name: 'Cardiologie Avancée',
        description: 'Groupe d\'étude pour approfondir les pathologies cardiovasculaires',
        memberCount: 15,
        isPublic: false,
        createdBy: '1',
        createdAt: '2024-01-01',
        category: 'Cardiologie',
        members: mockMembers,
        recentActivity: 'Discussion active sur l\'insuffisance cardiaque'
      },
      {
        id: 'g2',
        name: 'Urgences Médicales',
        description: 'Préparation aux situations d\'urgence',
        memberCount: 28,
        isPublic: true,
        createdBy: '2',
        createdAt: '2024-01-05',
        category: 'Urgences',
        members: mockMembers.slice(0, 2),
        recentActivity: 'Session d\'étude planifiée pour demain'
      }
    ];

    const mockDiscussions: Discussion[] = [
      {
        id: 'd1',
        title: 'Clarification sur les critères diagnostiques',
        author: mockMembers[0],
        content: 'Quelqu\'un peut-il m\'expliquer la différence entre les critères de Framingham et ESC pour l\'insuffisance cardiaque ?',
        itemId: 'ic-001',
        itemTitle: 'Insuffisance cardiaque aiguë',
        createdAt: '2024-01-15T10:30:00',
        replies: [
          {
            id: 'r1',
            author: mockMembers[1],
            content: 'Les critères ESC sont plus récents et incluent les biomarqueurs comme le BNP...',
            createdAt: '2024-01-15T11:00:00',
            likes: 3,
            isLiked: false
          }
        ],
        likes: 5,
        isLiked: true,
        tags: ['diagnostic', 'cardiologie'],
        isResolved: false
      },
      {
        id: 'd2',
        title: 'Partage de ressources - Pneumologie',
        author: mockMembers[2],
        content: 'J\'ai trouvé cette excellente vidéo sur la spirométrie, très utile pour comprendre les patterns.',
        createdAt: '2024-01-14T16:20:00',
        replies: [],
        likes: 8,
        isLiked: false,
        tags: ['ressources', 'pneumologie'],
        isResolved: true
      }
    ];

    const mockSessions: StudySession[] = [
      {
        id: 's1',
        title: 'Révision Cardiologie - Insuffisance cardiaque',
        description: 'Session de révision collective avec quiz interactifs',
        scheduledFor: '2024-01-16T20:00:00',
        duration: 120,
        hostId: '1',
        hostName: 'Sarah Martin',
        participants: ['2', '3'],
        maxParticipants: 8,
        isRecurring: false,
        meetingLink: 'https://meet.edn.fr/cardio-session',
        status: 'scheduled'
      },
      {
        id: 's2',
        title: 'Club de lecture - Nouvelles recommandations ESC',
        description: 'Discussion autour des dernières recommandations publiées',
        scheduledFor: '2024-01-18T19:00:00',
        duration: 90,
        hostId: '2',
        hostName: 'Thomas Dubois',
        participants: ['1'],
        maxParticipants: 12,
        isRecurring: true,
        status: 'scheduled'
      }
    ];

    setMyGroups([mockGroups[0]]);
    setPublicGroups(mockGroups);
    setDiscussions(mockDiscussions);
    setStudySessions(mockSessions);
    setSelectedGroup(mockGroups[0]);
  }, []);

  const joinGroup = (groupId: string) => {
    toast({
      title: "Demande envoyée",
      description: "Votre demande d'adhésion a été envoyée aux modérateurs"
    });
  };

  const createDiscussion = () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    const discussion: Discussion = {
      id: `d${Date.now()}`,
      title: newDiscussion.title,
      author: selectedGroup?.members[0] || {} as GroupMember,
      content: newDiscussion.content,
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0,
      isLiked: false,
      tags: newDiscussion.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setDiscussions(prev => [discussion, ...prev]);
    setNewDiscussion({ title: '', content: '', tags: '' });
    
    toast({
      title: "Discussion créée",
      description: "Votre discussion a été publiée"
    });
  };

  const addReply = (discussionId: string) => {
    const content = replyContent[discussionId];
    if (!content?.trim()) return;

    setDiscussions(prev => prev.map(discussion => {
      if (discussion.id === discussionId) {
        const reply: Reply = {
          id: `r${Date.now()}`,
          author: selectedGroup?.members[0] || {} as GroupMember,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
          isLiked: false
        };
        
        return {
          ...discussion,
          replies: [...discussion.replies, reply]
        };
      }
      return discussion;
    }));

    setReplyContent(prev => ({ ...prev, [discussionId]: '' }));
    
    toast({
      title: "Réponse ajoutée",
      description: "Votre réponse a été publiée"
    });
  };

  const likeDiscussion = (discussionId: string) => {
    setDiscussions(prev => prev.map(discussion => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1,
          isLiked: !discussion.isLiked
        };
      }
      return discussion;
    }));
  };

  const joinStudySession = (sessionId: string) => {
    setStudySessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          participants: [...session.participants, 'current-user']
        };
      }
      return session;
    }));

    toast({
      title: "Inscription confirmée",
      description: "Vous êtes inscrit à la session d'étude"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'studying': return '📚';
      case 'offline': return '⚫';
      default: return '⚫';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator': return <Badge variant="outline" className="text-xs">Mod</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="h-7 w-7" />
                Collaboration & Communauté
              </CardTitle>
              <CardDescription className="text-emerald-100 mt-2">
                Apprenez ensemble, partagez vos connaissances et progressez en groupe
              </CardDescription>
            </div>
            
            <Button variant="ghost" className="text-white border-white/30 hover:bg-white/10">
              <UserPlus className="h-4 w-4 mr-2" />
              Créer un groupe
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="groups">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">Mes groupes</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions d'étude</TabsTrigger>
          <TabsTrigger value="discover">Découvrir</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des groupes */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Mes groupes d'étude</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id ? 'border-blue-300 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      <div className="flex items-center gap-1">
                        {group.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline">{group.category}</Badge>
                      <span className="text-muted-foreground">{group.memberCount} membres</span>
                    </div>
                    
                    <div className="text-xs text-blue-600 mt-1">
                      {group.recentActivity}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Détails du groupe sélectionné */}
            {selectedGroup && (
              <div className="lg:col-span-2 space-y-4">
                {/* Info du groupe */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedGroup.isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                          {selectedGroup.name}
                        </CardTitle>
                        <CardDescription>{selectedGroup.description}</CardDescription>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedGroup.category}</Badge>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Inviter
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>{selectedGroup.memberCount} membres</span>
                      <span>Créé le {new Date(selectedGroup.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Membres */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Membres actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedGroup.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{member.name}</span>
                                {getRoleIcon(member.role)}
                                <span className="text-xs">{getStatusIcon(member.status)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                          
                          {member.studyStreak > 0 && (
                            <Badge variant="outline" className="text-orange-600">
                              🔥 {member.studyStreak}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activité récente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Activité récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>Sarah a créé une nouvelle discussion il y a 2h</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Session d'étude planifiée pour demain 20h</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>2 nouveaux membres ont rejoint le groupe</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="discussions" className="space-y-6">
          {/* Créer une discussion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nouvelle discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Titre de la discussion"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <Textarea
                placeholder="Contenu de votre message..."
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
              />
              
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Tags (séparés par des virgules)"
                  value={newDiscussion.tags}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                  className="flex-1"
                />
                
                <Button onClick={createDiscussion}>
                  <Send className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des discussions */}
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header de la discussion */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={discussion.author.avatar} />
                          <AvatarFallback>
                            {discussion.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium">{discussion.title}</h4>
                          <div className="text-sm text-muted-foreground">
                            Par {discussion.author.name} • {new Date(discussion.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {discussion.isResolved && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Résolu
                          </Badge>
                        )}
                        {discussion.itemTitle && (
                          <Badge variant="outline">
                            {discussion.itemTitle}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Contenu */}
                    <p className="text-sm">{discussion.content}</p>
                    
                    {/* Tags */}
                    {discussion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {discussion.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likeDiscussion(discussion.id)}
                          className={discussion.isLiked ? "text-blue-600" : ""}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {discussion.likes}
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Reply className="h-4 w-4 mr-1" />
                          {discussion.replies.length}
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Partager
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Réponses */}
                    {discussion.replies.length > 0 && (
                      <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                        {discussion.replies.map((reply) => (
                          <div key={reply.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={reply.author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {reply.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{reply.author.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{reply.content}</p>
                            
                            <Button variant="ghost" size="sm" className="text-xs">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {reply.likes}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Zone de réponse */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Ajouter une réponse..."
                        value={replyContent[discussion.id] || ''}
                        onChange={(e) => setReplyContent(prev => ({
                          ...prev,
                          [discussion.id]: e.target.value
                        }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addReply(discussion.id);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => addReply(discussion.id)}
                        disabled={!replyContent[discussion.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studySessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1">{session.title}</h4>
                        <p className="text-sm text-muted-foreground">{session.description}</p>
                      </div>
                      
                      <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(session.scheduledFor).toLocaleString('fr-FR')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{session.duration} minutes</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{session.participants.length}/{session.maxParticipants} participants</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Animé par</span>
                        <span className="font-medium">{session.hostName}</span>
                      </div>
                    </div>
                    
                    {session.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        Session récurrente
                      </Badge>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2">
                      {session.status === 'scheduled' ? (
                        <Button 
                          size="sm" 
                          onClick={() => joinStudySession(session.id)}
                          disabled={session.participants.length >= session.maxParticipants}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          S'inscrire
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-2" />
                          Rejoindre
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Découvrir de nouveaux groupes</CardTitle>
              <CardDescription>
                Rejoignez des groupes d'étude publics et élargissez votre réseau d'apprentissage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicGroups.map((group) => (
                  <Card key={group.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{group.category}</Badge>
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Public</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-1">{group.name}</h4>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{group.memberCount} membres</span>
                          <span className="text-muted-foreground">
                            Créé le {new Date(group.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        
                        <div className="text-xs text-blue-600">
                          {group.recentActivity}
                        </div>
                        
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => joinGroup(group.id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Rejoindre
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};