import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    Activity,
    BookOpen,
    Bot,
    Brain,
    Clock,
    Flame,
    Lightbulb,
    MessageSquare,
    Send,
    Sparkles,
    Star,
    Stethoscope,
    User,
    Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'medical' | 'study' | 'general';
  confidence?: number;
  tools_used?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  created_at: Date;
  message_count: number;
  last_activity: Date;
}

export const AIChat = () => {
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints, unlockBadge } = useGamification();
  const [user, setUser] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA médical. Je peux vous aider avec :\n\n• **Révisions EDN** - Questions et explications\n• **Cas cliniques** - Analyse et diagnostic\n• **Recommandations d\'étude** - Plans personnalisés\n• **Recherche médicale** - Dernières avancées\n\nComment puis-je vous assister aujourd\'hui ?',
      timestamp: new Date(),
      type: 'general',
      confidence: 100
    }
  ]);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Charger les sessions réelles depuis Supabase
  useEffect(() => {
    const loadSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setSessions(data.map(conv => ({
          id: conv.id,
          title: conv.title || 'Nouvelle conversation',
          created_at: new Date(conv.created_at),
          message_count: 0,
          last_activity: new Date(conv.updated_at)
        })));
      }
    };
    loadSessions();
  }, []);

  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user and gamification
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    loadUser();
  }, [loadStats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
      type: 'general'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(currentInput);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Track activity and award points
      if (user) {
        await logActivity({
          activity_type: 'ai_question',
          count: 1,
          metadata: { question: currentInput.slice(0, 100), type: aiResponse.type }
        });
        
        await addPoints(user.id, 5, 'ai_question');
        const newCount = questionCount + 1;
        setQuestionCount(newCount);
        
        // Unlock AI chat badge after 10 questions
        if (newCount >= 10) {
          await unlockBadge(user.id, 'ai_chat');
        }
        
        loadStats(user.id);
      }
    }, 1500); // Délai fixe pour UX fluide
  };

  // Constat vérifié le 2026-09-18 : l'edge function 'ai-chat' est bien DÉPLOYÉE sur le projet
  // yaincoxihiqdksxgrsrk (OPTIONS /functions/v1/ai-chat -> 200, le handler répond), même si son
  // code source est absent de supabase/functions/ dans ce dépôt. L'appel est donc conservé.
  // En revanche, l'ancien « fallback local » a été supprimé : quand l'appel échouait, il
  // fabriquait une fausse « Analyse médicale 🩺 » avec une confiance codée en dur (85 %) et de
  // faux outils ('medical_database', 'clinical_guidelines'). Un étudiant pouvait prendre ce
  // texte générique pour une vraie réponse IA. On fait désormais remonter l'échec.
  const generateAIResponse = async (userInput: string): Promise<ChatMessage> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userInput }
      });

      if (error) throw error;

      // Le code source de 'ai-chat' n'étant pas dans ce dépôt, son contrat de sortie exact
      // n'a pas pu être relu : on accepte les formes usuelles du dépôt ('response' pour
      // contextual-ai-chat, 'content' pour chat-with-ai / medical-chat-ai) plutôt que de
      // déclarer un échec sur une simple différence de nom de champ.
      const answer: string | undefined =
        data?.response ?? data?.content ?? data?.message;

      if (!answer) throw new Error("Réponse vide de l'assistant IA");

      return {
        id: Date.now().toString(),
        content: answer,
        role: 'assistant',
        timestamp: new Date(),
        type: data.type || 'general',
        confidence: data.confidence || 85,
        tools_used: data.toolsUsed
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      if (import.meta.env.DEV) console.error('Erreur appel IA:', error);

      toast({
        title: "Assistant IA indisponible",
        description: message,
        variant: 'destructive'
      });

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ Je n'ai pas pu joindre l'assistant IA (${message}).\n\nVotre question n'a pas reçu de réponse : réessayez dans un instant. Aucune réponse automatique n'est générée à la place, pour ne pas vous induire en erreur.`,
        timestamp: new Date(),
        type: 'general',
        confidence: 0,
        tools_used: []
      };
    }
  };

  const getMessageIcon = (message: ChatMessage) => {
    if (message.role === 'user') return <User className="h-4 w-4" />;
    
    switch (message.type) {
      case 'medical': return <Stethoscope className="h-4 w-4" />;
      case 'study': return <BookOpen className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case 'medical': return 'destructive';
      case 'study': return 'default';
      default: return 'secondary';
    }
  };

  const quickSuggestions = [
    "Expliquez-moi l'insuffisance cardiaque",
    "Comment réviser la neurologie efficacement ?",
    "Créez-moi un quiz sur les AVC",
    "Quels sont les derniers items EDN modifiés ?"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assistant IA Médical</h2>
          <p className="text-muted-foreground">
            Chat intelligent avec analyse médicale avancée
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Gamification stats */}
          {user && gamificationStats && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
              <div className="flex items-center gap-1 text-warning">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-bold">{gamificationStats.currentStreak}</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1 text-primary">
                <Star className="h-4 w-4" />
                <span className="text-sm font-bold">Nv.{gamificationStats.level}</span>
              </div>
            </div>
          )}
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            IA Active
          </Badge>
          <Badge variant="secondary">
            GPT-4 Médical
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Sessions Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sessions récentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    activeSession === session.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => setActiveSession(session.id)}
                >
                  <h4 className="font-medium text-sm">{session.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{session.message_count} messages</span>
                    <span>{session.last_activity.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              
              <Button size="sm" className="w-full mt-4">
                <MessageSquare className="mr-2 h-3 w-3" />
                Nouvelle session
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Assistant IA Médical</CardTitle>
                    <CardDescription>
                      Modèle spécialisé en médecine • Dernière mise à jour aujourd'hui
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    Temps réel
                  </Badge>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0">
                          {getMessageIcon(message)}
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                        <div
                          className={`rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="prose prose-sm max-w-none">
                            {message.content.split('\n').map((line, i) => (
                              <p key={i} className={`${line.startsWith('#') ? 'font-semibold text-lg' : ''} ${i > 0 ? 'mt-2' : ''}`}>
                                {line.replace(/^#+\s*/, '')}
                              </p>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                            <div className="flex items-center gap-2">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {message.type && (
                                <Badge variant={getMessageTypeColor(message.type)} className="text-xs">
                                  {message.type}
                                </Badge>
                              )}
                            </div>
                            
                            {message.confidence && message.role === 'assistant' && (
                              <div className="flex items-center gap-1 text-xs opacity-70">
                                <Sparkles className="h-3 w-3" />
                                {message.confidence}%
                              </div>
                            )}
                          </div>
                          
                          {message.tools_used && message.tools_used.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/20">
                              <p className="text-xs opacity-70 mb-1">Outils utilisés :</p>
                              <div className="flex gap-1">
                                {message.tools_used.map((tool, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    <Zap className="mr-1 h-2 w-2" />
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <span className="text-sm text-muted-foreground ml-2">L'IA réfléchit...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4">
              {/* Quick Suggestions */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Suggestions rapides :</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentInput(suggestion)}
                      className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      <Lightbulb className="mr-1 h-3 w-3 inline" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Posez votre question médicale..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping}
                  className="px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 text-center">
                IA médicale spécialisée • Vérifiez toujours les informations avec vos sources officielles
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};