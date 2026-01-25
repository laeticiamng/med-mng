import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'edn_local' | 'web_fallback' | 'edn_limited';
  suggestions?: ChatSuggestion[];
}

interface ChatSuggestion {
  type: 'quiz' | 'music' | 'immersive' | 'related_item';
  title: string;
  description: string;
  action: string;
  item_code?: string;
}

interface ChatContext {
  edn_items_found: number;
  web_fallback_used: boolean;
  items: Array<{
    item_code: string;
    title: string;
    relevance: number;
  }>;
}

interface ChatResponse {
  success: boolean;
  response: string;
  source: 'edn_local' | 'web_fallback' | 'edn_limited';
  context: ChatContext;
  suggestions: ChatSuggestion[];
  conversation_id: string;
}

export const useEnhancedChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [enableWebFallback, setEnableWebFallback] = useState(true);
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    content: string,
    contextItems: string[] = []
  ): Promise<ChatResponse | null> => {
    if (!content.trim()) return null;

    setIsLoading(true);

    try {
      // Ajouter le message utilisateur immédiatement
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Préparer l'historique de conversation
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Appeler l'API de chat amélioré
      const { _data, error } = await supabase.functions.invoke('enhanced-contextual-chat', {
        body: {
          message: content,
          conversation_history: conversationHistory,
          context_items: contextItems,
          enable_web_fallback: enableWebFallback
        }
      });

      if (error) throw error;

      const response: ChatResponse = _data;

      // Ajouter la réponse de l'assistant
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        source: response.source,
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(response.conversation_id);

      // Afficher une notification selon la source
      if (response.source === 'web_fallback') {
        toast({
          title: "Source web utilisée",
          description: "Cette réponse utilise des connaissances générales car l'information n'a pas été trouvée dans la base EDN",
          variant: "default",
        });
      } else if (response.source === 'edn_limited') {
        toast({
          title: "Contexte EDN limité",
          description: "Essayez de reformuler votre question ou d'être plus spécifique",
          variant: "default",
        });
      }

      return response;

    } catch (error) {
      console.error('Erreur envoi message:', error);
      
      // Ajouter un message d'erreur
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
        source: 'edn_limited'
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, enableWebFallback, toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const toggleWebFallback = useCallback(() => {
    setEnableWebFallback(prev => !prev);
  }, []);

  const executeSuggestion = useCallback((suggestion: ChatSuggestion) => {
    switch (suggestion.action) {
      case 'start_quiz':
        toast({
          title: "Quiz lancé",
          description: `Démarrage du quiz pour ${suggestion.item_code}`,
        });
        // Ici, on pourrait naviguer vers la page de quiz
        break;
        
      case 'play_music':
        toast({
          title: "Musique",
          description: `Lecture de la musique pour ${suggestion.item_code}`,
        });
        // Ici, on pourrait déclencher la lecture de musique
        break;
        
      case 'start_immersive':
        toast({
          title: "Expérience immersive",
          description: `Lancement de l'expérience pour ${suggestion.item_code}`,
        });
        // Ici, on pourrait naviguer vers l'expérience immersive
        break;
        
      case 'explore_item':
        // Ajouter une nouvelle question sur cet item
        if (suggestion.item_code) {
          sendMessage(`Parle-moi de l'item ${suggestion.item_code}`, [suggestion.item_code]);
        }
        break;
    }
  }, [sendMessage, toast]);

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'edn_local':
        return 'EDN';
      case 'web_fallback':
        return 'Web';
      case 'edn_limited':
        return 'EDN limité';
      default:
        return 'Inconnu';
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'edn_local':
        return 'bg-success/10 text-success';
      case 'web_fallback':
        return 'bg-warning/10 text-warning';
      case 'edn_limited':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return {
    // État
    messages,
    isLoading,
    conversationId,
    enableWebFallback,

    // Actions
    sendMessage,
    clearChat,
    toggleWebFallback,
    executeSuggestion,

    // Utilitaires
    getSourceLabel,
    getSourceColor
  };
};