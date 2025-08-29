import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff,
  Share2,
  BookOpen,
  Music,
  Target,
  Clock,
  Send,
  UserPlus,
  Settings,
  Headphones,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

interface CollaborativeUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'studying' | 'listening' | 'away';
  currentActivity?: {
    type: 'edn' | 'ecos' | 'music' | 'chat';
    title: string;
    progress?: number;
  };
  isOnline: boolean;
  lastSeen?: Date;
}

interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  participants: CollaborativeUser[];
  maxParticipants: number;
  type: 'study' | 'music' | 'discussion' | 'exam';
  isLocked: boolean;
  created: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'study_share' | 'music_share';
  metadata?: any;
}

const generateMockUsers = (): CollaborativeUser[] => [
  {
    id: '1',
    name: 'Marie Dubois',
    status: 'studying',
    currentActivity: {
      type: 'edn',
      title: 'IC-230 Insuffisance Cardiaque',
      progress: 75
    },
    isOnline: true
  },
  {
    id: '2',
    name: 'Alex Chen',
    status: 'listening',
    currentActivity: {
      type: 'music',
      title: 'Pneumologie - Méthodes Diagnostiques'
    },
    isOnline: true
  },
  {
    id: '3',
    name: 'Sophie Martin',
    status: 'active',
    currentActivity: {
      type: 'ecos',
      title: 'Simulation Urgences Cardiaques',
      progress: 40
    },
    isOnline: true
  },
  {
    id: '4',
    name: 'Thomas Durand',
    status: 'away',
    isOnline: false,
    lastSeen: new Date(Date.now() - 15 * 60000)
  }
];

const generateStudyRooms = (): StudyRoom[] => [
  {
    id: '1',
    name: 'Cardiologie Intensive',
    topic: 'Préparation ECN - Pathologies cardiaques',
    participants: generateMockUsers().slice(0, 3),
    maxParticipants: 8,
    type: 'study',
    isLocked: false,
    created: new Date(Date.now() - 2 * 3600000)
  },
  {
    id: '2',
    name: 'Session Musique EDN',
    topic: 'Création collaborative de mnémotechniques',
    participants: generateMockUsers().slice(1, 3),
    maxParticipants: 6,
    type: 'music',
    isLocked: false,
    created: new Date(Date.now() - 1 * 3600000)
  },
  {
    id: '3',
    name: 'ECOS Blancs',
    topic: 'Entraînement examens pratiques',
    participants: generateMockUsers().slice(0, 2),
    maxParticipants: 4,
    type: 'exam',
    isLocked: true,
    created: new Date(Date.now() - 30 * 60000)
  }
];

export const LiveCollaborationHub: React.FC = () => {
  const navigate = useNavigate();
  const [users] = useState<CollaborativeUser[]>(generateMockUsers());
  const [studyRooms] = useState<StudyRoom[]>(generateStudyRooms());
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const getStatusColor = (status: CollaborativeUser['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'studying': return 'bg-blue-500';
      case 'listening': return 'bg-purple-500';
      case 'away': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'edn': return BookOpen;
      case 'ecos': return Target;
      case 'music': return Music;
      case 'chat': return MessageCircle;
      default: return Users;
    }
  };

  const joinRoom = (room: StudyRoom) => {
    if (room.isLocked) {
      toast.error('Cette salle est verrouillée');
      return;
    }
    
    if (room.participants.length >= room.maxParticipants) {
      toast.error('Cette salle est complète');
      return;
    }

    setSelectedRoom(room);
    toast.success(`Vous avez rejoint "${room.name}"`);
    
    // Simulate joining messages
    const welcomeMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'system',
        userName: 'Système',
        message: `Bienvenue dans ${room.name} ! 👋`,
        timestamp: new Date(),
        type: 'text'
      }
    ];
    setChatMessages(welcomeMessages);
  };

  const leaveRoom = () => {
    setSelectedRoom(null);
    setChatMessages([]);
    toast.info('Vous avez quitté la salle');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current_user',
      userName: 'Vous',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const shareStudyContent = (type: 'edn' | 'music' | 'ecos', title: string) => {
    if (!selectedRoom) return;

    const shareMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current_user',
      userName: 'Vous',
      message: `A partagé: ${title}`,
      timestamp: new Date(),
      type: type === 'music' ? 'music_share' : 'study_share',
      metadata: { type, title }
    };

    setChatMessages(prev => [...prev, shareMessage]);
    toast.success('Contenu partagé avec le groupe !');
  };

  if (selectedRoom) {
    return (
      <Card className="w-full h-[600px] bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-xl border-white/10 text-white flex flex-col">
        {/* Room Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{selectedRoom.name}</h3>
              <p className="text-sm text-white/60">{selectedRoom.topic}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/20 border-green-500/40 text-green-400">
              {selectedRoom.participants.length} participants
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={leaveRoom}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Quitter
            </Button>
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2 p-4 border-b border-white/10 overflow-x-auto">
          {selectedRoom.participants.map((user) => (
            <div key={user.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 min-w-max">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(user.status)}`} />
              </div>
              <span className="text-sm text-white">{user.name}</span>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs">
                    {message.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{message.userName}</span>
                    <span className="text-xs text-white/50">{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-white/80">{message.message}</p>
                  
                  {message.type !== 'text' && message.metadata && (
                    <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/20">
                      <div className="flex items-center gap-2">
                        {React.createElement(getActivityIcon(message.metadata.type), { className: "w-4 h-4" })}
                        <span className="text-sm text-white">{message.metadata.title}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Controls */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Voice/Video Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant={isVoiceEnabled ? "default" : "ghost"}
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={isVoiceEnabled ? "bg-green-600 hover:bg-green-700" : "hover:bg-white/10"}
            >
              {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={isVideoEnabled ? "default" : "ghost"}
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={isVideoEnabled ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-white/10"}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={isMuted ? "ghost" : "default"}
              onClick={() => setIsMuted(!isMuted)}
              className={isMuted ? "hover:bg-white/10" : "bg-red-600 hover:bg-red-700"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Quick Share Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => shareStudyContent('edn', 'IC-230 Insuffisance Cardiaque')}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              EDN
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => shareStudyContent('music', 'Cardiologie Rythmée')}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Music className="w-4 h-4 mr-1" />
              Musique
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => shareStudyContent('ecos', 'Urgences Cardiaques')}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Target className="w-4 h-4 mr-1" />
              ECOS
            </Button>
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez votre message..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-xl border-white/10 text-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hub Collaboration</h2>
              <p className="text-white/60 text-sm">Étudiez ensemble en temps réel</p>
            </div>
          </div>
          
          <Badge variant="outline" className="bg-green-500/20 border-green-500/40 text-green-400">
            {users.filter(u => u.isOnline).length} en ligne
          </Badge>
        </div>

        {/* Online Users */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/80 mb-3">Utilisateurs connectés</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.filter(u => u.isOnline).map((user) => {
              const ActivityIcon = user.currentActivity ? getActivityIcon(user.currentActivity.type) : Users;
              
              return (
                <motion.div
                  key={user.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${getStatusColor(user.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{user.name}</h4>
                    {user.currentActivity ? (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <ActivityIcon className="w-3 h-3" />
                        <span className="truncate">{user.currentActivity.title}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-white/50 capitalize">{user.status}</p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => toast.success(`Message envoyé à ${user.name}`)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Study Rooms */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3">Salles d'étude actives</h3>
          <div className="space-y-3">
            {studyRooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{room.name}</h4>
                      {room.isLocked && (
                        <Badge className="bg-red-500/20 border-red-500/40 text-red-400 text-xs">
                          Privée
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mb-2">{room.topic}</p>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {room.participants.length}/{room.maxParticipants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor((Date.now() - room.created.getTime()) / 60000)}m
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => joinRoom(room)}
                    disabled={room.participants.length >= room.maxParticipants}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {room.isLocked ? 'Demander' : 'Rejoindre'}
                  </Button>
                </div>
                
                {/* Participants Preview */}
                <div className="flex items-center gap-1">
                  {room.participants.slice(0, 4).map((participant, idx) => (
                    <Avatar key={participant.id} className="h-6 w-6 border border-white/20" style={{ marginLeft: idx > 0 ? '-0.5rem' : 0 }}>
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {room.participants.length > 4 && (
                    <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center text-xs text-white/70" style={{ marginLeft: '-0.5rem' }}>
                      +{room.participants.length - 4}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            onClick={() => toast.success('Création de salle bientôt disponible !')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Créer une nouvelle salle
          </Button>
        </div>
      </div>
    </Card>
  );
};