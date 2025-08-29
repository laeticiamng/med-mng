import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Share2, 
  Crown,
  Trophy,
  BookOpen,
  Activity,
  Clock,
  Star,
  Send,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Volume2,
  Settings,
  UserPlus,
  Heart,
  Award
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'studying' | 'away';
  currentActivity?: string;
  score?: number;
  studyStreak?: number;
}

interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  participants: User[];
  maxParticipants: number;
  type: 'public' | 'private';
  currentSession?: string;
}

export const RealTimeCollaboration: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [isInVideoCall, setIsInVideoCall] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, time: string}>>([]);

  // Simulate real-time data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Sarah Martin',
        avatar: '/api/placeholder/32/32',
        status: 'studying',
        currentActivity: 'EDN IC-142',
        score: 94,
        studyStreak: 15
      },
      {
        id: '2',
        name: 'Thomas Dubois',
        avatar: '/api/placeholder/32/32',
        status: 'active',
        currentActivity: 'ECOS Cardiologie',
        score: 87,
        studyStreak: 8
      },
      {
        id: '3',
        name: 'Emma Leroy',
        avatar: '/api/placeholder/32/32',
        status: 'studying',
        currentActivity: 'Quiz Neurologie',
        score: 91,
        studyStreak: 22
      },
      {
        id: '4',
        name: 'Antoine Bernard',
        avatar: '/api/placeholder/32/32',
        status: 'away',
        score: 78,
        studyStreak: 5
      }
    ];

    const mockRooms: StudyRoom[] = [
      {
        id: '1',
        name: 'Cardiologie Intensive',
        topic: 'Insuffisance cardiaque',
        participants: mockUsers.slice(0, 3),
        maxParticipants: 6,
        type: 'public',
        currentSession: 'EDN IC-156'
      },
      {
        id: '2',
        name: 'Neurologie Avancée',
        topic: 'AVC et complications',
        participants: mockUsers.slice(1, 2),
        maxParticipants: 4,
        type: 'public',
        currentSession: 'ECOS Neuro'
      },
      {
        id: '3',
        name: 'Groupe Privé P1',
        topic: 'Préparation concours',
        participants: mockUsers.slice(0, 2),
        maxParticipants: 8,
        type: 'private'
      }
    ];

    setActiveUsers(mockUsers);
    setStudyRooms(mockRooms);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'studying': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const joinRoom = (room: StudyRoom) => {
    setCurrentRoom(room);
    setChatMessages([
      { id: '1', user: 'Système', message: 'Vous avez rejoint la salle d\'étude', time: 'maintenant' },
      { id: '2', user: 'Sarah Martin', message: 'Salut ! On révise l\'IC-156 ensemble', time: 'il y a 2 min' }
    ]);
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setIsInVideoCall(false);
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        user: 'Vous',
        message: chatMessage,
        time: 'maintenant'
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const startVideoCall = () => {
    setIsInVideoCall(true);
  };

  return (
    <div className="space-y-6">
      {/* Active Users Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" />
            Étudiants en ligne ({activeUsers.length})
          </h3>
          <Button size="sm" className="bg-green-500 hover:bg-green-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter
          </Button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2">
          {activeUsers.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 bg-white/10 rounded-lg p-3 min-w-[200px]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-purple-500">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(user.status)} border-2 border-slate-900`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{user.name}</p>
                  {user.currentActivity && (
                    <p className="text-gray-300 text-xs truncate">{user.currentActivity}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {user.score && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {user.score}%
                      </Badge>
                    )}
                    {user.studyStreak && (
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                        {user.studyStreak}j
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Study Rooms */}
      {!currentRoom ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {studyRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      {room.type === 'private' ? (
                        <Crown className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-blue-400" />
                      )}
                      {room.name}
                    </CardTitle>
                    <Badge className={room.type === 'private' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'}>
                      {room.type}
                    </Badge>
                  </div>
                  <p className="text-gray-300">{room.topic}</p>
                  {room.currentSession && (
                    <p className="text-purple-200 text-sm">Session: {room.currentSession}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Participants */}
                  <div>
                    <p className="text-gray-300 text-sm mb-2">
                      Participants ({room.participants.length}/{room.maxParticipants})
                    </p>
                    <div className="flex -space-x-2">
                      {room.participants.map((participant) => (
                        <Avatar key={participant.id} className="h-8 w-8 border-2 border-slate-900">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="bg-purple-500 text-xs">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => joinRoom(room)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Rejoindre
                    </Button>
                    <Button
                      onClick={() => startVideoCall()}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Active Study Room */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    {currentRoom.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={startVideoCall}
                      className="bg-green-500 hover:bg-green-600"
                      size="sm"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Vidéo
                    </Button>
                    <Button onClick={leaveRoom} variant="outline" size="sm">
                      <PhoneOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {isInVideoCall ? (
                  <div className="bg-black/50 rounded-lg p-8 text-center">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {currentRoom.participants.slice(0, 4).map((user) => (
                        <div key={user.id} className="bg-slate-800 rounded-lg p-4 aspect-video flex items-center justify-center">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-purple-500">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-4">
                      <Button variant="outline" size="sm">
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => setIsInVideoCall(false)}
                        className="bg-red-500 hover:bg-red-600"
                        size="sm"
                      >
                        <PhoneOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Session d'étude collaborative</h3>
                    <p className="text-gray-300 mb-4">Étudiez ensemble: {currentRoom.topic}</p>
                    <Button onClick={startVideoCall} className="bg-green-500 hover:bg-green-600">
                      <Video className="h-4 w-4 mr-2" />
                      Démarrer la vidéo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-400" />
                Discussion
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300 text-sm font-medium">{message.user}</span>
                      <span className="text-gray-400 text-xs">{message.time}</span>
                    </div>
                    <p className="text-white text-sm bg-white/10 rounded-lg px-3 py-2">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 bg-white/10 border-white/20"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="sm" className="bg-purple-500 hover:bg-purple-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};