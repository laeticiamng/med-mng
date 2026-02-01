// Chat unifié - Composant générique remplaçant ContextualChat et EnhancedChatWidget
// Architecture consolidée avec toutes les fonctionnalités

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Book,
  Bot,
  Brain,
  Clock,
  Database,
  Flame,
  Globe,
  Loader2,
  MessageCircle,
  MessageSquare,
  Music,
  Play,
  Send,
  Settings,
  Sparkles,
  Star,
  Trash2,
  User
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  source?: 'edn' | 'web' | 'mixed';
  relatedItems?: string[];
  suggestions?: ChatSuggestion[];
  isTyping?: boolean;
}

interface ChatSuggestion {
  type: 'music' | 'quiz' | 'content' | 'item' | 'immersive' | 'related_item';
  title: string;
  action: string;
  data?: any;
}

export interface UnifiedChatProps {
  /** Code de l'item EDN courant (optionnel) */
  currentItem?: string;
  /** Items de contexte additionnels */
  contextItems?: string[];
  /** Placeholder du champ de saisie */
  placeholder?: string;
  /** Hauteur max de la zone de messages */
  maxHeight?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Variante de style */
  variant?: 'full' | 'widget' | 'compact';
  /** Afficher les contrôles de settings */
  showSettings?: boolean;
  /** Callback lors de l'exécution d'une suggestion */
  onSuggestionExecute?: (suggestion: ChatSuggestion) => void;
}

// ============================================
// Composant Principal
// ============================================

export const UnifiedChat: React.FC<UnifiedChatProps> = ({
  currentItem,
  contextItems = [],
  placeholder,
  maxHeight = 'h-96',
  className,
  variant = 'full',
  showSettings = true,
  onSuggestionExecute
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [enableWebFallback, setEnableWebFallback] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();

  // Placeholder dynamique
  const dynamicPlaceholder = placeholder || (
    currentItem 
      ? `Posez une question sur ${currentItem}...`
      : 'Posez votre question médicale...'
  );

  // ============================================
  // Initialisation
  // ============================================
  
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    init();
  }, [loadStats]);

  // Auto-scroll
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
        role: 'assistant',
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
  }, [currentItem, messages.length]);

  // ============================================
  // Actions
  // ============================================

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Message typing
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: 'L\'assistant réfléchit...',
      role: 'assistant',
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
          enableWebFallback,
          context: {
            previousMessages: messages.slice(-5),
            userId: user?.id,
            contextItems
          }
        }
      });

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== 'typing'));

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        source: data.source || 'mixed',
        relatedItems: data.relatedItems || [],
        suggestions: data.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);

      // Gamification
      if (user) {
        await logActivity({
          activity_type: 'ai_question',
          count: 1,
          metadata: { currentItem, source: data.source, contextItems }
        });
        await addPoints(user.id, POINTS_CONFIG.aiQuestion, 'aiQuestion');
        loadStats(user.id);
      }

      // Sauvegarder
      await saveConversation(userMessage, assistantMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: 'Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?',
        role: 'assistant',
        timestamp: new Date(),
        source: 'edn'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Erreur de communication avec l\'assistant');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentItem, conversationId, enableWebFallback, messages, user, contextItems, logActivity, addPoints, loadStats]);

  const saveConversation = async (userMessage: ChatMessage, assistantMessage: ChatMessage) => {
    try {
      if (!conversationId && user) {
        const { data: convData } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            title: userMessage.content.slice(0, 50) + '...',
            last_message: assistantMessage.content.slice(0, 100)
          })
          .select()
          .maybeSingle();
        
        if (convData) {
          setConversationId(convData.id);
        }
      }

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
      console.error('Error saving conversation:', error);
    }
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: ChatSuggestion) => {
    if (onSuggestionExecute) {
      onSuggestionExecute(suggestion);
    } else {
      sendMessage(suggestion.action);
    }
  }, [onSuggestionExecute, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // ============================================
  // Helpers UI
  // ============================================

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'edn': return <Book className="h-4 w-4 text-primary" />;
      case 'web': return <Globe className="h-4 w-4 text-success" />;
      case 'mixed': return <Brain className="h-4 w-4 text-accent-foreground" />;
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

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <Brain className="h-3 w-3" />;
      case 'music': return <Music className="h-3 w-3" />;
      case 'immersive': return <Sparkles className="h-3 w-3" />;
      case 'related_item': return <Book className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  // ============================================
  // Render
  // ============================================

  const isCompact = variant === 'compact';
  const cardHeight = isCompact ? 'h-[400px]' : 'h-[600px]';

  return (
    <Card className={cn("flex flex-col", cardHeight, className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className={isCompact ? 'text-sm' : ''}>Assistant IA Médical</span>
            {enableWebFallback ? (
              <Badge variant="outline" className="text-xs bg-warning/10 text-warning">
                <Globe className="h-3 w-3 mr-1" />
                Web
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-success/10 text-success">
                <Database className="h-3 w-3 mr-1" />
                EDN
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {gamificationStats && !isCompact && (
              <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full text-xs">
                <Flame className="h-3 w-3 text-warning" />
                <span className="font-bold text-warning">{gamificationStats.currentStreak}</span>
                <Star className="h-3 w-3 text-primary ml-1" />
                <span className="font-bold text-primary">Nv.{gamificationStats.level}</span>
              </div>
            )}
            {currentItem && (
              <Badge variant="secondary" className="text-xs">
                {currentItem}
              </Badge>
            )}
            {showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>

        {showSettingsPanel && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Fallback web</span>
              </div>
              <Switch
                checked={enableWebFallback}
                onCheckedChange={setEnableWebFallback}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Si activé, utilise des sources web quand l'info n'est pas dans EDN
            </p>
          </div>
        )}
      </CardHeader>

      <Separator />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] space-y-2",
                message.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "rounded-lg px-4 py-2 text-sm",
                  message.role === 'user' 
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

                {message.role === 'assistant' && !message.isTyping && (
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
                          {getSuggestionIcon(suggestion.type)}
                          <span className="text-xs ml-2">{suggestion.title}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
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
            placeholder={dynamicPlaceholder}
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
        
        {!isCompact && (
          <div className="mt-2 text-xs text-muted-foreground">
            💡 L'assistant priorise les contenus EDN officiels puis enrichit avec des recherches web si nécessaire
          </div>
        )}

        {contextItems.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded border border-primary/20">
            <span className="font-medium">Contexte:</span> {contextItems.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Alias de compatibilité
export const ContextualChat = UnifiedChat;
export const EnhancedChatWidget = UnifiedChat;
