import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Bookmark,
  Share2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Stethoscope,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Search,
  Crown,
  MessageSquare,
  User,
  Bot,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';

const MedChat: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      content: 'Bonjour ! Je suis votre assistant médical IA. Je peux vous aider avec des diagnostics différentiels, des protocoles de traitement, des révisions de cours et bien plus. Comment puis-je vous assister aujourd\'hui ?',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      confidence: 100,
      category: 'education'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessions] = useState([
    {
      id: '1',
      title: 'Diagnostic différentiel - dyspnée',
      lastMessage: new Date(),
      messageCount: 12,
      category: 'diagnostic'
    },
    {
      id: '2',
      title: 'Révision cardiologie',
      lastMessage: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messageCount: 8,
      category: 'education'
    }
  ]);
  
  const messagesEndRef = useRef(null);

  const quickActions = [
    {
      id: 'differential',
      title: 'Diagnostic différentiel',
      description: 'Analysez des symptômes',
      icon: Stethoscope,
      prompt: 'Aidez-moi à établir un diagnostic différentiel pour : ',
      category: 'diagnostic'
    },
    {
      id: 'treatment',
      title: 'Protocole thérapeutique',
      description: 'Recommandations de traitement',
      icon: AlertTriangle,
      prompt: 'Quelles sont les recommandations thérapeutiques pour : ',
      category: 'treatment'
    },
    {
      id: 'explain',
      title: 'Expliquer concept',
      description: 'Clarification médicale',
      icon: BookOpen,
      prompt: 'Pouvez-vous m\'expliquer le concept de : ',
      category: 'education'
    },
    {
      id: 'exam',
      title: 'Préparation exam',
      description: 'Questions et révisions',
      icon: Brain,
      prompt: 'Aidez-moi à réviser pour l\'examen de : ',
      category: 'education'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content = inputMessage) => {
    if (!content.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(content),
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
        sources: ['Harrison\'s Principles of Internal Medicine', 'UpToDate', 'Collège des enseignants'],
        confidence: Math.floor(Math.random() * 20) + 80,
        category: detectCategory(content)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage) => {
    if (userMessage.toLowerCase().includes('diagnostic')) {
      return `Basé sur les symptômes mentionnés, voici les principaux diagnostics différentiels à considérer :

**1. Causes cardiaques**
- Insuffisance cardiaque
- Infarctus du myocarde
- Embolie pulmonaire

**2. Causes respiratoires**
- Asthme
- BPCO
- Pneumonie

**3. Examens complémentaires recommandés**
- ECG 12 dérivations
- Radiographie thoracique
- Gazométrie artérielle

*Attention : Ces informations sont à des fins éducatives. Toujours consulter un professionnel de santé pour un diagnostic précis.*`;
    }

    if (userMessage.toLowerCase().includes('traitement')) {
      return `Voici les recommandations thérapeutiques basées sur les dernières guidelines :

**Traitement de première intention :**
- Mesures non pharmacologiques
- Thérapeutique médicamenteuse adaptée

**Surveillance :**
- Paramètres à monitorer
- Effets indésirables potentiels

*Sources : Recommandations HAS 2024*`;
    }

    return `Je comprends votre question. Voici une réponse détaillée basée sur les connaissances médicales actuelles :

Cette information provient des références médicales les plus récentes et est conforme aux recommandations des sociétés savantes.

Y a-t-il un aspect particulier que vous souhaiteriez approfondir ?`;
  };

  const detectCategory = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('diagnostic') || lowerMessage.includes('symptom')) return 'diagnostic';
    if (lowerMessage.includes('traitement') || lowerMessage.includes('thérapie')) return 'treatment';
    if (lowerMessage.includes('expli') || lowerMessage.includes('révision')) return 'education';
    return 'reference';
  };

  const handleQuickAction = (action) => {
    setInputMessage(action.prompt);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'diagnostic': return 'bg-blue-500';
      case 'treatment': return 'bg-green-500';
      case 'education': return 'bg-purple-500';
      case 'reference': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <Helmet>
        <title>Assistant IA Médical - MED-MNG</title>
        <meta name="description" content="Assistant médical intelligent pour diagnostics, traitements et formations - IA spécialisée en médecine" />
      </Helmet>

      <div className="h-screen flex overflow-hidden bg-background">
        {/* Sidebar avec historique */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">MedChat AI</h2>
                <Badge className="bg-gradient-to-r from-gold to-yellow-600 text-white text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  PREMIUM
                </Badge>
              </div>
            </div>
            <Button className="w-full" onClick={() => setMessages([messages[0]])}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Nouvelle conversation
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Conversations récentes</h3>
              {sessions.map((session) => (
                <Card key={session.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{session.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{session.messageCount} messages</span>
                      <span>{session.lastMessage.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <Badge className={`mt-2 text-xs ${getCategoryColor(session.category)} text-white`}>
                      {session.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Zone de chat principal */}
        <div className="flex-1 flex flex-col">
          {/* Header du chat */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Assistant IA Médical</h3>
                  <p className="text-sm text-muted-foreground">Spécialisé en diagnostic et formation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.sender === 'user' ? (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className={`flex-1 max-w-3xl ${message.sender === 'user' ? 'text-right' : ''}`}>
                    <Card className={`${message.sender === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                      <CardContent className="p-4">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {message.content.split('\n').map((line, index) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <h4 key={index} className="font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                            }
                            if (line.startsWith('*') && line.endsWith('*')) {
                              return <em key={index} className="text-sm text-muted-foreground">{line.replace(/\*/g, '')}</em>;
                            }
                            if (line.startsWith('- ')) {
                              return <li key={index} className="ml-4">{line.substring(2)}</li>;
                            }
                            return line && <p key={index} className="mb-2">{line}</p>;
                          })}
                        </div>

                        {message.sender === 'ai' && (
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              {message.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  Confiance: {message.confidence}%
                                </Badge>
                              )}
                              {message.category && (
                                <Badge className={`text-xs ${getCategoryColor(message.category)} text-white`}>
                                  {message.category}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Bookmark className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {message.sender === 'ai' && message.sources && (
                          <div className="mt-3 pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Sources :</p>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">L'assistant réfléchit...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Actions rapides */}
          {messages.length === 1 && (
            <div className="p-4 border-t">
              <h4 className="font-medium mb-3">Actions rapides :</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-start text-left"
                    onClick={() => handleQuickAction(action)}
                  >
                    <action.icon className="h-4 w-4 mb-2" />
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Zone de saisie */}
          <div className="p-4 border-t bg-card">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Posez votre question médicale..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="min-h-[60px] max-h-32 pr-12 resize-none"
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  className={isRecording ? 'bg-red-500 text-white' : ''}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Button 
                  onClick={() => sendMessage()} 
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-6"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ⚠️ Les réponses sont générées par IA à des fins éducatives. Consultez toujours un professionnel de santé.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedChat;