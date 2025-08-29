import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  ThumbsDown,
  Send,
  Crown,
  BookOpen,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudySession {
  id: string;
  name: string;
  participants: User[];
  itemCode: string;
  currentSection: string;
  createdAt: Date;
  isActive: boolean;
  host: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'host' | 'participant';
  status: 'online' | 'away' | 'offline';
  currentSection?: string;
  score?: number;
}

interface Message {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'question' | 'hint' | 'achievement';
  timestamp: Date;
  reactions?: { [emoji: string]: string[] };
  sectionContext?: string;
}

interface CollaborativeLearningProps {
  itemCode: string;
  currentSection: string;
  onCreateSession?: (session: StudySession) => void;
  onJoinSession?: (sessionId: string) => void;
}

export const CollaborativeLearning: React.FC<CollaborativeLearningProps> = ({
  itemCode,
  currentSection,
  onCreateSession,
  onJoinSession
}) => {
  const [currentUser] = useState<User>({
    id: 'user-1',
    name: 'Étudiant',
    avatar: '/avatars/default.png',
    role: 'participant',
    status: 'online'
  });

  const [activeSessions, setActiveSessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Sessions d'étude simulées
  useEffect(() => {
    const mockSessions: StudySession[] = [
      {
        id: 'session-1',
        name: 'Groupe EDN - ' + itemCode,
        participants: [
          { id: 'user-2', name: 'Marie L.', avatar: '/avatars/marie.png', role: 'host', status: 'online', currentSection: 'tableau-a', score: 85 },
          { id: 'user-3', name: 'Paul M.', avatar: '/avatars/paul.png', role: 'participant', status: 'online', currentSection: 'scene', score: 72 },
          { id: 'user-4', name: 'Sarah K.', avatar: '/avatars/sarah.png', role: 'participant', status: 'away', currentSection: 'tableau-b', score: 91 }
        ],
        itemCode,
        currentSection,
        createdAt: new Date(Date.now() - 1800000), // 30 min ago
        isActive: true,
        host: 'user-2'
      },
      {
        id: 'session-2',
        name: 'Révision Express',
        participants: [
          { id: 'user-5', name: 'Alex R.', avatar: '/avatars/alex.png', role: 'host', status: 'online', score: 78 },
          { id: 'user-6', name: 'Emma D.', avatar: '/avatars/emma.png', role: 'participant', status: 'online', score: 84 }
        ],
        itemCode,
        currentSection: 'quiz',
        createdAt: new Date(Date.now() - 900000), // 15 min ago
        isActive: true,
        host: 'user-5'
      }
    ];

    setActiveSessions(mockSessions);
  }, [itemCode, currentSection]);

  // Messages de chat simulés
  useEffect(() => {
    if (currentSession) {
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          userId: 'user-2',
          content: 'Salut tout le monde ! On commence par les tableaux Rang A ?',
          type: 'text',
          timestamp: new Date(Date.now() - 600000),
          reactions: { '👍': ['user-3', 'user-4'] }
        },
        {
          id: 'msg-2',
          userId: 'user-3',
          content: 'Parfait ! J\'ai quelques questions sur la communication médecin-patient',
          type: 'question',
          timestamp: new Date(Date.now() - 480000),
          sectionContext: 'tableau-a'
        },
        {
          id: 'msg-3',
          userId: 'user-4',
          content: '🎉 Sarah a complété la section Tableau B avec 91% !',
          type: 'achievement',
          timestamp: new Date(Date.now() - 300000)
        }
      ];

      setMessages(mockMessages);
    }
  }, [currentSession]);

  const createNewSession = () => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      name: `Ma session - ${itemCode}`,
      participants: [{ ...currentUser, role: 'host' }],
      itemCode,
      currentSection,
      createdAt: new Date(),
      isActive: true,
      host: currentUser.id
    };

    setActiveSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    onCreateSession?.(newSession);
  };

  const joinSession = (session: StudySession) => {
    setCurrentSession(session);
    setShowChat(true);
    onJoinSession?.(session.id);

    // Simuler l'ajout de l'utilisateur à la session
    setActiveSessions(prev =>
      prev.map(s =>
        s.id === session.id
          ? { ...s, participants: [...s.participants, currentUser] }
          : s
      )
    );
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentSession) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      sectionContext: currentSection
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: [...(msg.reactions?.[emoji] || []), currentUser.id]
              }
            }
          : msg
      )
    );
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMessageTypeIcon = (type: Message['type']) => {
    switch (type) {
      case 'question': return '❓';
      case 'hint': return '💡';
      case 'achievement': return '🏆';
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sessions disponibles */}
      {!currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Sessions d'Étude Collaborative
            </CardTitle>
            <p className="text-sm text-gray-600">
              Rejoignez ou créez une session pour étudier en groupe
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mb-6">
              {activeSessions.map(session => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => joinSession(session)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{session.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>Actif depuis {Math.floor((Date.now() - session.createdAt.getTime()) / 60000)} min</span>
                        <Badge variant="secondary">{session.currentSection}</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {session.participants.length} participants
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {session.participants.slice(0, 4).map(participant => (
                        <div key={participant.id} className="relative">
                          <Avatar className="w-8 h-8 border-2 border-white">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{participant.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${getStatusColor(participant.status)}`} />
                          {participant.role === 'host' && (
                            <Crown className="absolute -top-1 -left-1 w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      ))}
                      {session.participants.length > 4 && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs">
                          +{session.participants.length - 4}
                        </div>
                      )}
                    </div>

                    <Button size="sm">
                      Rejoindre
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button onClick={createNewSession} className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Créer une nouvelle session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session active */}
      {currentSession && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({currentSession.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentSession.participants.map(participant => (
                  <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${getStatusColor(participant.status)}`} />
                        {participant.role === 'host' && (
                          <Crown className="absolute -top-1 -left-1 w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{participant.name}</div>
                        <div className="text-xs text-gray-500">
                          {participant.currentSection && (
                            <Badge variant="outline" className="text-xs">
                              {participant.currentSection}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {participant.score && (
                      <Badge variant="secondary" className="text-xs">
                        {participant.score}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Discussion - {currentSession.name}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentSession(null)}
                >
                  Quitter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-80 overflow-y-auto mb-4 space-y-3 border rounded-lg p-3 bg-gray-50">
                <AnimatePresence>
                  {messages.map(message => {
                    const sender = currentSession.participants.find(p => p.id === message.userId);
                    const messageIcon = getMessageTypeIcon(message.type);
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${
                          message.type === 'achievement' 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200' 
                            : ''
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={sender?.avatar} />
                          <AvatarFallback>{sender?.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{sender?.name}</span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {messageIcon && <span>{messageIcon}</span>}
                            {message.sectionContext && (
                              <Badge variant="outline" className="text-xs">
                                {message.sectionContext}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{message.content}</p>
                          
                          {/* Réactions */}
                          {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {Object.entries(message.reactions).map(([emoji, users]) => (
                                <Button
                                  key={emoji}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => addReaction(message.id, emoji)}
                                >
                                  {emoji} {users.length}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Boutons de réaction rapide */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => addReaction(message.id, '👍')}
                          >
                            👍
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => addReaction(message.id, '❤️')}
                          >
                            ❤️
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Zone de saisie */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Boutons d'actions rapides */}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewMessage('J\'ai une question sur cette section 🤔')}
                >
                  ❓ Question
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewMessage('Excellent point ! 👏')}
                >
                  👏 Encourager
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewMessage('Pouvez-vous expliquer davantage ? 🤓')}
                >
                  🤓 Approfondir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistiques de collaboration */}
      {currentSession && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Statistiques de Groupe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(currentSession.participants.reduce((acc, p) => acc + (p.score || 0), 0) / currentSession.participants.length)}%
                </div>
                <div className="text-sm text-gray-600">Score Moyen</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor((Date.now() - currentSession.createdAt.getTime()) / 60000)}
                </div>
                <div className="text-sm text-gray-600">Minutes Actif</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{messages.length}</div>
                <div className="text-sm text-gray-600">Messages</div>
              </div>
              
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {currentSession.participants.filter(p => p.status === 'online').length}
                </div>
                <div className="text-sm text-gray-600">En Ligne</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};