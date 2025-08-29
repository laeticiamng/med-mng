import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Brain, 
  Target, 
  TrendingUp, 
  Send, 
  Mic, 
  MicOff, 
  Heart,
  BookOpen,
  Lightbulb,
  Award
} from 'lucide-react';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';
import { toast } from 'sonner';

interface CoachSession {
  id: string;
  type: 'motivation' | 'study-plan' | 'stress-management' | 'goal-setting';
  title: string;
  duration: string;
  aiPersonality: 'encouraging' | 'analytical' | 'empathetic' | 'challenging';
  progress: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'coach';
  timestamp: Date;
  emotion?: 'positive' | 'neutral' | 'concerned' | 'excited';
  aiInsight?: string;
}

const VirtualCoachAI: React.FC = () => {
  const { sendMessage, clearChat } = useEnhancedChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentSession, setCurrentSession] = useState<CoachSession | null>(null);
  const [coachMood, setCoachMood] = useState<'energetic' | 'calm' | 'focused'>('energetic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coachSessions: CoachSession[] = [
    {
      id: '1',
      type: 'motivation',
      title: 'Session de Motivation Matinale',
      duration: '15min',
      aiPersonality: 'encouraging',
      progress: 0
    },
    {
      id: '2',
      type: 'study-plan',
      title: 'Planification d\'Étude Adaptative',
      duration: '30min',
      aiPersonality: 'analytical',
      progress: 0
    },
    {
      id: '3',
      type: 'stress-management',
      title: 'Gestion du Stress Pré-Examens',
      duration: '20min',
      aiPersonality: 'empathetic',
      progress: 0
    }
  ];

  useEffect(() => {
    // Message d'accueil du coach IA
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: `Bonjour ! Je suis votre coach IA personnalisé. Je suis là pour vous accompagner dans votre parcours d'apprentissage médical. Comment puis-je vous aider aujourd'hui ? 🎯`,
      sender: 'coach',
      timestamp: new Date(),
      emotion: 'excited',
      aiInsight: 'Analyse du profil utilisateur : Étudiant motivé, niveau intermédiaire, préfère les approches structurées'
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Simuler une réponse du coach IA
      setTimeout(() => {
        const coachResponse = generateCoachResponse(inputMessage);
        setMessages(prev => [...prev, coachResponse]);
      }, 1500);
    } catch (error) {
      toast.error('Erreur de communication avec le coach IA');
    }

    setInputMessage('');
  };

  const generateCoachResponse = (userInput: string): ChatMessage => {
    // Logique simplifiée de génération de réponse
    const responses = [
      {
        content: "C'est une excellente question ! D'après votre profil d'apprentissage, je vous recommande une approche par cas cliniques. Cela correspond parfaitement à votre style d'apprentissage kinesthésique. 💡",
        emotion: 'positive' as const,
        insight: "Détection d'une préférence pour l'apprentissage pratique basée sur l'historique des interactions"
      },
      {
        content: "Je comprends votre frustration. Le stress avant les examens est normal. Avez-vous essayé la technique de respiration 4-7-8 ? Je peux vous guider si vous voulez. 🧘‍♀️",
        emotion: 'concerned' as const,
        insight: "Niveau de stress élevé détecté. Recommandation d'intervention immédiate pour la gestion émotionnelle"
      },
      {
        content: "Fantastique ! Vos progrès cette semaine sont remarquables. Vous avez augmenté votre temps d'étude de 23% tout en maintenant une excellente rétention. Continuez ainsi ! 🎉",
        emotion: 'excited' as const,
        insight: "Performance en hausse significative. Renforcement positif pour maintenir la motivation"
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      id: Date.now().toString(),
      content: randomResponse.content,
      sender: 'coach',
      timestamp: new Date(),
      emotion: randomResponse.emotion,
      aiInsight: randomResponse.insight
    };
  };

  const startSession = (session: CoachSession) => {
    setCurrentSession(session);
    clearChat();
    
    const sessionMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `Parfait ! Commençons votre session "${session.title}". Cette session durera ${session.duration} et sera adaptée à votre profil. Êtes-vous prêt(e) ? 🚀`,
      sender: 'coach',
      timestamp: new Date(),
      emotion: 'excited'
    };
    
    setMessages([sessionMessage]);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('Enregistrement vocal activé');
    } else {
      toast.info('Enregistrement vocal arrêté');
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'positive': return 'text-green-600';
      case 'excited': return 'text-blue-600';
      case 'concerned': return 'text-orange-600';
      case 'empathetic': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getPersonalityBadge = (personality: string) => {
    const styles = {
      encouraging: 'bg-green-100 text-green-800',
      analytical: 'bg-blue-100 text-blue-800',
      empathetic: 'bg-purple-100 text-purple-800',
      challenging: 'bg-red-100 text-red-800'
    };
    return styles[personality as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-blue-900">Coach Virtuel IA</CardTitle>
              <CardDescription className="text-blue-700">
                Accompagnement personnalisé avec intelligence émotionnelle
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progrès
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/ai-coach-avatar.png" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Coach IA Personnel</h3>
                    <p className="text-sm text-muted-foreground">
                      Mode: {coachMood} • En ligne
                    </p>
                  </div>
                </div>
                {currentSession && (
                  <Badge className={getPersonalityBadge(currentSession.aiPersonality)}>
                    {currentSession.title}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-lg rounded-br-sm' 
                          : 'bg-gray-100 text-gray-900 rounded-lg rounded-bl-sm'
                      } p-3`}>
                        <p className="text-sm">{message.content}</p>
                        {message.emotion && (
                          <div className={`text-xs mt-1 ${getEmotionColor(message.emotion)}`}>
                            Émotion détectée: {message.emotion}
                          </div>
                        )}
                        {message.aiInsight && (
                          <div className="text-xs mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                            <strong>IA Insight:</strong> {message.aiInsight}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Parlez à votre coach IA..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coachSessions.map((session) => (
              <Card key={session.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{session.title}</CardTitle>
                    <Badge className={getPersonalityBadge(session.aiPersonality)}>
                      {session.aiPersonality}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {session.duration}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progrès</span>
                      <span>{session.progress}%</span>
                    </div>
                    <Progress value={session.progress} className="h-2" />
                  </div>
                  
                  <Button 
                    onClick={() => startSession(session)}
                    className="w-full" 
                    size="sm"
                  >
                    Commencer Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">89%</div>
                    <div className="text-sm text-muted-foreground">Bien-être</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">12/15</div>
                    <div className="text-sm text-muted-foreground">Objectifs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">47</div>
                    <div className="text-sm text-muted-foreground">Sessions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Insights IA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VirtualCoachAI;