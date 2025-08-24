import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, Send, User, Bot, Search, 
  Sparkles, Clock, BookOpen, Brain, Heart, Activity,
  History, HelpCircle, Settings, Mic, Copy, ThumbsUp,
  ThumbsDown, RefreshCw, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useChatConversations } from '@/hooks/useChatConversations';
import { TranslatedText } from '@/components/TranslatedText';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumbs } from '@/components/ux/Breadcrumbs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  courseCitations?: string[];
  isTyping?: boolean;
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Bonjour ! 👋 Je suis votre assistant IA médical intelligent.

Je peux vous aider avec :
• 📚 Questions sur vos cours médicaux
• 🩺 Diagnostics et diagnostics différentiels  
• 💊 Thérapeutiques et protocoles
• 🏥 Cas cliniques et situations d'urgence
• 📝 Préparation aux examens EDN et ECOS

Posez-moi n'importe quelle question ou choisissez une suggestion ci-dessous !`,
      timestamp: new Date(),
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    currentConversation,
    createConversation,
    sendMessage,
    isGenerating,
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

    setSearchHistory(prev => {
      const newHistory = [textToSend, ...prev.filter(item => item !== textToSend)];
      return newHistory.slice(0, 10);
    });

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
      
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        courseCitations: response.courseCitations,
      };

      setMessages(prev => [...prev, assistantMessage]);
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
    setMessages([messages[0]]);
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

  return (
    <ConsistentBackground variant="primary">
      <PageHeader 
        title="Assistant IA Médical" 
        subtitle="Chat intelligent spécialisé en médecine" 
        backTo="/" 
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs />
        
        {/* Header Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 p-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Assistant IA MED-MNG</h2>
              <p className="text-gray-300 text-sm">Votre expert médical personnel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={clearChat}
              className="text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Effacer la conversation et recommencer"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-[calc(100vh-220px)] flex flex-col shadow-xl border-0 bg-black/20 backdrop-blur-xl border border-white/10">
            <CardHeader className="flex-shrink-0 border-b border-white/10">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-orange-400" />
                  <span className="text-white">Conversation avec l'IA</span>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  En ligne
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages */}
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
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[85%] md:max-w-[75%] group relative ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl rounded-br-md p-4 shadow-lg'
                              : 'bg-white/90 backdrop-blur-sm border border-white/20 shadow-sm rounded-2xl rounded-bl-md p-4'
                          }`}
                        >
                          {message.isTyping ? (
                            <div className="flex gap-1 py-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          ) : (
                            <>
                              <p className={`whitespace-pre-wrap leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                                {message.content}
                              </p>
                              
                              {/* Citations */}
                              {message.courseCitations && message.courseCitations.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    Sources :
                                  </p>
                                  <div className="space-y-2">
                                    {message.courseCitations.map((citation, index) => (
                                      <div key={index} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        {citation}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Message Actions */}
                              <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                                message.role === 'user' ? 'border-white/20' : 'border-gray-200'
                              }`}>
                                <p className={`text-xs ${
                                  message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                                } flex items-center gap-1`}>
                                  <Clock className="h-3 w-3" />
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                                
                                {message.role === 'assistant' && !message.isTyping && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 hover:bg-gray-100"
                                      onClick={() => copyToClipboard(message.content)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-green-100">
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-red-100">
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                            <User className="h-5 w-5 text-gray-600" />
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
                      <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
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
                            className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200 text-left border border-white/20 hover:border-white/30 group"
                            aria-label={`Poser la question: ${suggestion.text} (catégorie: ${suggestion.category})`}
                          >
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                              <suggestion.icon className="h-4 w-4 text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{suggestion.text}</p>
                              <p className="text-xs text-gray-300">{suggestion.category}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-white/10 bg-black/10 backdrop-blur-sm p-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tapez votre question médicale ici..."
                      className="min-h-[50px] pr-12 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:border-orange-400 rounded-xl shadow-sm focus:bg-white/20"
                      disabled={isLoading}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-orange-400"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!currentMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 h-[50px] px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
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
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  <TranslatedText text="Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne" />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ConsistentBackground>
  );
};