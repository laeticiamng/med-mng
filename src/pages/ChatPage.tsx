import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Paperclip, 
  Mic,
  Settings,
  RefreshCw,
  BookOpen,
  Stethoscope,
  Brain,
  Heart,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Bonjour ! Je suis votre assistant IA médical. Je peux vous aider avec des questions sur la médecine, l\'anatomie, la pharmacologie et bien plus encore. Comment puis-je vous assister aujourd\'hui ?',
      timestamp: new Date(),
      sources: ['Base de connaissances MED-MNG']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getSimulatedResponse(inputValue),
        timestamp: new Date(),
        sources: ['Harrison\'s Principles', 'Gray\'s Anatomy', 'Pharmacology Database']
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getSimulatedResponse = (input: string) => {
    const responses = [
      'Excellent question ! En médecine, ce sujet nécessite une approche méthodique. Laissez-moi vous expliquer les points clés...',
      'D\'après les dernières recommandations médicales, voici ce que nous savons sur ce sujet...',
      'Cette condition médicale présente plusieurs aspects importants à considérer. Permettez-moi de détailler...',
      'Pour répondre à votre question, il est important de comprendre d\'abord les mécanismes physiologiques sous-jacents...'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickQuestions = [
    { text: 'Expliquez la physiopathologie de l\'hypertension', icon: Heart },
    { text: 'Quels sont les effets secondaires des AINS ?', icon: Brain },
    { text: 'Comment diagnostiquer une pneumonie ?', icon: Stethoscope },
    { text: 'Mécanisme d\'action de l\'insuline', icon: Zap },
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Assistant IA Médical
          </h1>
          <p className="text-xl text-muted-foreground">
            Votre compagnon intelligent pour l'apprentissage médical
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    Chat Médical
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                      En ligne
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-muted/50 text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.sources && (
                          <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                            <p className="text-xs opacity-70 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Sources: {message.sources.join(', ')}
                            </p>
                          </div>
                        )}
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>

                      {message.type === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-600">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Posez votre question médicale..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setInputValue(question.text)}
                  >
                    <question.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{question.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Chat Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Questions posées</span>
                  <Badge variant="outline">47</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Temps d'étude</span>
                  <Badge variant="outline">12h 30m</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sujets abordés</span>
                  <Badge variant="outline">23</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sujets récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Cardiologie',
                    'Pharmacologie',
                    'Neurologie',
                    'Pneumologie',
                    'Endocrinologie'
                  ].map((topic, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouvelle conversation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Historique des chats
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres IA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};