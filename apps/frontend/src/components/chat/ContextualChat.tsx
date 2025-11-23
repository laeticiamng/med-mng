import logger from '@/lib/logger';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Book, 
  Globe, 
  Loader2, 
  Music, 
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  source?: 'edn' | 'web' | 'mixed';
  relatedItems?: string[];
  suggestions?: ChatSuggestion[];
  isTyping?: boolean;
}

interface ChatSuggestion {
  type: 'music' | 'quiz' | 'content' | 'item';
  title: string;
  action: string;
  data?: any;
}

interface ContextualChatProps {
  currentItem?: string;
  className?: string;
}

export const ContextualChat: React.FC<ContextualChatProps> = ({ 
  currentItem, 
  className 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: currentItem 
          ? `Bonjour ! Je suis votre assistant IA spécialisé sur l'item ${currentItem}. Posez-moi vos questions sur cet item ou sur tout autre sujet médical.`
          : "Bonjour ! Je suis votre assistant IA médical. Je peux vous aider avec vos questions sur les items EDN, générer du contenu personnalisé, et bien plus !",
        isUser: false,
        timestamp: new Date(),
        source: 'edn',
        suggestions: [
          {
            type: 'item',
            title: currentItem ? `Expliquer ${currentItem}` : 'Explorer un item EDN',
            action: currentItem ? `Explique-moi l'item ${currentItem} en détail` : 'Quels sont les items EDN les plus importants ?'
          },
          {
            type: 'quiz',
            title: 'Créer un quiz',
            action: currentItem ? `Crée un quiz sur ${currentItem}` : 'Crée un quiz médical personnalisé'
          },
          {
            type: 'music',
            title: 'Générer une chanson',
            action: currentItem ? `Génère une chanson pour ${currentItem}` : 'Génère une chanson médicale'
          }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [currentItem]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Message "typing"
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: 'L\'assistant réfléchit...',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('contextual-medical-chat', {
        body: {
          message: content,
          currentItem,
          conversationId,
          context: {
            previousMessages: messages.slice(-5), // Derniers 5 messages pour le contexte
            userId: (await supabase.auth.getUser()).data.user?.id
          }
        }
      });

      if (error) throw error;

      // Retirer le message "typing"
      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        source: data.source || 'mixed',
        relatedItems: data.relatedItems || [],
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);

      // Sauvegarder la conversation
      await saveConversation(userMessage, assistantMessage);

    } catch (error) {
      logger.error('Error sending message:', error);
      
      // Retirer le message "typing"
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: 'Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?',
        isUser: false,
        timestamp: new Date(),
        source: 'edn'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Erreur de communication avec l\'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (userMessage: ChatMessage, assistantMessage: ChatMessage) => {
    try {
      if (!conversationId) {
        // Créer une nouvelle conversation
        const { data: convData } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            title: userMessage.content.slice(0, 50) + '...',
            last_message: assistantMessage.content.slice(0, 100)
          })
          .select()
          .single();
        
        if (convData) {
          setConversationId(convData.id);
        }
      }

      // Sauvegarder les messages
      if (conversationId) {
        await supabase.from('chat_messages').insert([
          {
            conversation_id: conversationId,
            text: userMessage.content,
            sender: 'user'
          },
          {
            conversation_id: conversationId,
            text: assistantMessage.content,
            sender: 'assistant'
          }
        ]);
      }
    } catch (error) {
      logger.error('Error saving conversation:', error);
    }
  };

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    sendMessage(suggestion.action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'edn': return <Book className="h-4 w-4 text-blue-500" />;
      case 'web': return <Globe className="h-4 w-4 text-green-500" />;
      case 'mixed': return <Brain className="h-4 w-4 text-purple-500" />;
      default: return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'edn': return 'Base EDN';
      case 'web': return 'Recherche Web';
      case 'mixed': return 'EDN + Web';
      default: return 'Assistant';
    }
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Assistant IA Médical
          {currentItem && (
            <Badge variant="secondary" className="ml-auto">
              {currentItem}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <Separator />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] space-y-2",
                message.isUser ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "rounded-lg px-4 py-2 text-sm",
                  message.isUser 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted",
                  message.isTyping && "animate-pulse"
                )}>
                  {message.isTyping ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {message.content}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                {!message.isUser && !message.isTyping && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getSourceIcon(message.source)}
                    <span>{getSourceLabel(message.source)}</span>
                    <Clock className="h-3 w-3 ml-1" />
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                )}

                {/* Items liés */}
                {message.relatedItems && message.relatedItems.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {message.relatedItems.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="space-y-2 w-full">
                    <p className="text-xs text-muted-foreground">Suggestions :</p>
                    <div className="grid gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-auto p-2 text-left justify-start"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.type === 'music' && <Music className="h-3 w-3 mr-2" />}
                          {suggestion.type === 'quiz' && <Brain className="h-3 w-3 mr-2" />}
                          {suggestion.type === 'content' && <Book className="h-3 w-3 mr-2" />}
                          {suggestion.type === 'item' && <MessageCircle className="h-3 w-3 mr-2" />}
                          <span className="text-xs">{suggestion.title}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      <CardContent className="p-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              currentItem 
                ? `Posez une question sur ${currentItem}...`
                : "Posez votre question médicale..."
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          💡 L'assistant priorise les contenus EDN officiels puis enrichit avec des recherches web si nécessaire
        </div>
      </CardContent>
    </Card>
  );
};