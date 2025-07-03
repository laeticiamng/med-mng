import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface ChatResponse {
  content: string;
  courseCitations?: string[];
}

export const useChatConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, []);

  // Créer une nouvelle conversation
  const createConversation = useCallback(async (title: string = 'Nouvelle conversation') => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          title,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de la conversation:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer la conversation",
          variant: "destructive",
        });
        return null;
      }

      setCurrentConversation(data);
      await loadConversations();
      return data;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  }, [loadConversations, toast]);

  // Rechercher dans les cours pour enrichir la réponse
  const searchCourseContent = useCallback(async (query: string): Promise<string[]> => {
    try {
      // Rechercher dans les items EDN complets
      const { data: ednItems, error: ednError } = await supabase
        .from('edn_items_complete')
        .select('item_number, title, content')
        .or(`title.ilike.%${query}%,content::text.ilike.%${query}%`)
        .limit(3);

      if (ednError) {
        console.error('Erreur recherche EDN:', ednError);
      }

      // Rechercher dans les items immersifs
      const { data: immersiveItems, error: immersiveError } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, payload_v2')
        .or(`title.ilike.%${query}%,payload_v2::text.ilike.%${query}%`)
        .limit(3);

      if (immersiveError) {
        console.error('Erreur recherche immersive:', immersiveError);
      }

      // Rechercher dans les situations ECOS
      const { data: ecosItems, error: ecosError } = await supabase
        .from('ecos_situations_complete')
        .select('situation_number, title, content')
        .or(`title.ilike.%${query}%,content::text.ilike.%${query}%`)
        .limit(2);

      if (ecosError) {
        console.error('Erreur recherche ECOS:', ecosError);
      }

      const citations: string[] = [];

      if (ednItems?.length) {
        ednItems.forEach(item => {
          citations.push(`Item EDN ${item.item_number}: ${item.title}`);
        });
      }

      if (immersiveItems?.length) {
        immersiveItems.forEach(item => {
          citations.push(`Item ${item.item_code}: ${item.title}`);
        });
      }

      if (ecosItems?.length) {
        ecosItems.forEach(item => {
          citations.push(`ECOS ${item.situation_number}: ${item.title}`);
        });
      }

      return citations;
    } catch (error) {
      console.error('Erreur lors de la recherche dans les cours:', error);
      return [];
    }
  }, []);

  // Envoyer un message et obtenir une réponse IA
  const sendMessage = useCallback(async (messageText: string): Promise<ChatResponse> => {
    setIsGenerating(true);

    try {
      // Rechercher du contenu pertinent dans les cours
      const courseCitations = await searchCourseContent(messageText);
      
      // Préparer le contexte pour OpenAI
      const systemPrompt = `Tu es un assistant IA spécialisé en médecine pour étudiants. Tu as accès à une base de données de cours médicaux incluant des items EDN et des situations ECOS.

Réponds aux questions des étudiants en te basant sur les informations disponibles dans les cours. Sois précis, pédagogique et bienveillant.

${courseCitations.length > 0 ? `
Contenu de cours pertinent trouvé:
${courseCitations.map(citation => `- ${citation}`).join('\n')}

Utilise ces informations pour enrichir ta réponse si elles sont pertinentes.` : ''}

Réponds en français et de manière structurée.`;

      // Appeler l'API de chat via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: messageText }
          ],
          model: 'gpt-4o-mini'
        }
      });

      if (error) {
        throw error;
      }

      const response: ChatResponse = {
        content: data.content || "Je n'ai pas pu générer une réponse. Veuillez réessayer.",
        courseCitations: courseCitations.length > 0 ? courseCitations : undefined
      };

      // Sauvegarder les messages dans la base de données si une conversation est active
      if (currentConversation) {
        // Sauvegarder le message utilisateur
        await supabase
          .from('chat_messages')
          .insert({
            conversation_id: currentConversation.id,
            sender: 'user',
            text: messageText,
          });

        // Sauvegarder la réponse de l'assistant
        await supabase
          .from('chat_messages')
          .insert({
            conversation_id: currentConversation.id,
            sender: 'assistant',
            text: response.content,
          });

        // Mettre à jour la conversation
        await supabase
          .from('chat_conversations')
          .update({
            last_message: response.content.substring(0, 100) + (response.content.length > 100 ? '...' : ''),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentConversation.id);
      }

      return response;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw new Error('Erreur lors de la communication avec l\'IA');
    } finally {
      setIsGenerating(false);
    }
  }, [currentConversation, searchCourseContent]);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    isGenerating,
    createConversation,
    sendMessage,
    loadConversations,
  };
};