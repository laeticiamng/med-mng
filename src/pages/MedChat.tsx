import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ROUTE_PATHS } from '@/config/routes';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useChatConversations } from '@/hooks/useChatConversations';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    BookOpen,
    Bot,
    Brain,
    Clock,
    Copy,
    Flame,
    Heart,
    HelpCircle,
    History,
    Loader2,
    MessageSquare,
    Mic,
    RefreshCw,
    Search,
    Send,
    Sparkles,
    Star,
    ThumbsDown,
    ThumbsUp,
    User
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  courseCitations?: string[];
  isTyping?: boolean;
  feedback?: 'positive' | 'negative' | null;
}

const quickSuggestions = [
  { icon: Heart, text: "Expliquez-moi l'insuffisance cardiaque", category: "Cardiologie" },
  { icon: Brain, text: "Différence entre AVC ischémique et hémorragique", category: "Neurologie" },
  { icon: Activity, text: "Signes cliniques de l'infarctus du myocarde", category: "Urgences" },
  { icon: BookOpen, text: "Protocole de prise en charge de l'hypertension", category: "Médecine générale" },
];

export const MedChat: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints, unlockBadge } = useGamification();
  const [user, setUser] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Si tu bloques sur quelque chose, pose ta question ici.

Je peux t'aider avec :
• 🩺 Comprendre un concept
• 💊 Clarifier une thérapeutique
• 🏥 Démêler un cas clinique
• 📝 Préparer un item spécifique

Tu n'as pas besoin de tout chercher toi-même.`,
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user and gamification stats
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

  const {
    sendMessage,
  } = useChatConversations();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || currentMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Ajouter à l'historique de recherche
    setSearchHistory(prev => {
      const newHistory = [textToSend, ...prev.filter(item => item !== textToSend)];
      return newHistory.slice(0, 10); // Garder seulement les 10 dernières
    });

    // Message de frappe temporaire
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await sendMessage(textToSend);
      
      // Retirer le message de frappe
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        courseCitations: response.courseCitations,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Track activity and award points
      if (user) {
        await logActivity({
          activity_type: 'ai_question',
          count: 1,
          metadata: { question: textToSend.slice(0, 100) }
        });
        
        await addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
        const newCount = questionCount + 1;
        setQuestionCount(newCount);
        
        // Unlock AI chat badge after 10 questions
        if (newCount >= 10) {
          await unlockBadge(user.id, 'ai_chat');
        }
        
        loadStats(user.id);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    handleSendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Garder le message d'accueil
    setShowSuggestions(true);
    setCurrentMessage('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copié",
      description: "Le message a été copié dans le presse-papiers",
    });
  };

  const handleFeedback = async (messageId: string, type: 'positive' | 'negative') => {
    // Update local state
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ));

    // Log feedback to database
    if (user) {
      try {
        await supabase.from('ai_chat_feedback' as any).insert({
          user_id: user.id,
          message_id: messageId,
          feedback_type: type,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.debug('Feedback table may not exist yet');
      }
    }

    toast({
      title: type === 'positive' ? "👍 Merci !" : "👎 Noté",
      description: type === 'positive' 
        ? "Votre retour positif a été enregistré" 
        : "Nous améliorerons nos réponses",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-muted/50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(ROUTE_PATHS.home)}
              className="shrink-0 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-destructive rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  <TranslatedText text="Chat Intelligent" />
                </h1>
                <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-warning" />
                  <TranslatedText text="Assistant IA médical avancé" />
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Gamification Quick Stats */}
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
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="hidden md:flex">
                  <History className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Historique des questions</DialogTitle>
                  <DialogDescription>
                    Vos dernières questions posées
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchHistory.map((question, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleSuggestionClick(question)}
                    >
                      <p className="text-sm">{question}</p>
                      <p className="text-xs text-muted-foreground">Cliquez pour réutiliser</p>
                    </div>
                  ))}
                  {searchHistory.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">Aucun historique disponible</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="icon"
              onClick={clearChat}
              className="hover:bg-destructive/10"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Chat Interface Enhanced */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-[calc(100vh-180px)] flex flex-col shadow-xl border-0 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <TranslatedText text="Conversation avec l'IA" />
                </div>
                <Badge variant="outline" className="text-success border-success/20">
                  En ligne
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages Enhanced */}
              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shrink-0 shadow-lg">
                            <Bot className="h-5 w-5 text-primary-foreground" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[85%] md:max-w-[75%] group relative ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl rounded-br-md p-4 shadow-lg'
                              : 'bg-card border border-border shadow-sm rounded-2xl rounded-bl-md p-4'
                          }`}
                        >
                          {message.isTyping ? (
                            <div className="flex gap-1 py-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          ) : (
                            <>
                              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              
                              {/* Citations Enhanced - TOUJOURS AFFICHÉES */}
                              {message.courseCitations && message.courseCitations.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    Sources :
                                  </p>
                                  <div className="space-y-2">
                                    {message.courseCitations.map((citation, index) => (
                                      <div key={index} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                        {citation}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Message Actions */}
                              <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                                message.role === 'user' ? 'border-primary-foreground/20' : 'border-border'
                              }`}>
                                <p className={`text-xs ${
                                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                } flex items-center gap-1`}>
                                  <Clock className="h-3 w-3" />
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                                
                                {message.role === 'assistant' && !message.isTyping && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 hover:bg-muted"
                                      onClick={() => copyToClipboard(message.content)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className={`h-6 w-6 p-0 ${message.feedback === 'positive' ? 'bg-success/20 text-success' : 'hover:bg-success/10'}`}
                                      onClick={() => handleFeedback(message.id, 'positive')}
                                      disabled={message.feedback !== undefined}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className={`h-6 w-6 p-0 ${message.feedback === 'negative' ? 'bg-destructive/20 text-destructive' : 'hover:bg-destructive/10'}`}
                                      onClick={() => handleFeedback(message.id, 'negative')}
                                      disabled={message.feedback !== undefined}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted/60 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Quick Suggestions */}
                  {showSuggestions && messages.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Questions suggérées :
                      </p>
                      <div className="grid gap-2">
                        {quickSuggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleSuggestionClick(suggestion.text)}
                            className="flex items-start gap-3 p-3 bg-gradient-to-r from-muted to-muted/50 rounded-xl hover:from-primary/5 hover:to-accent/5 transition-all duration-200 text-left border border-border hover:border-primary/30 group"
                          >
                            <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                              <suggestion.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{suggestion.text}</p>
                              <p className="text-xs text-muted-foreground">{suggestion.category}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Enhanced */}
              <div className="border-t bg-gradient-to-r from-muted/50 to-muted/80 p-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre question médicale ici..."
                      className="min-h-[50px] pr-12 bg-background border-2 border-border focus:border-primary rounded-xl shadow-sm"
                      disabled={isLoading}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-[50px] px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  <TranslatedText text="Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne" />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};