import { useState, useCallback } from 'react';
import { createChatCompletion, ChatCompletionMessage } from '@/openai/chat/completions';
import { errorService } from '@/services/core/ErrorService';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    context?: string;
  };
}

interface ChatContext {
  itemCode?: string;
  itemTitle?: string;
  competences?: any;
  userLevel?: 'student' | 'resident' | 'physician';
  specialty?: string;
}

export const useAIChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Créer une nouvelle session
  const createSession = useCallback((title: string, context?: ChatContext) => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title,
      messages: [],
      context: context?.itemCode,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ajouter un message système de contexte si nécessaire
    if (context?.itemCode) {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        role: 'system',
        content: buildContextualSystemPrompt(context),
        timestamp: new Date(),
        metadata: { context: context.itemCode }
      };
      newSession.messages.push(systemMessage);
    }

    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    
    return newSession.id;
  }, []);

  // Construire le prompt système contextuel
  const buildContextualSystemPrompt = (context: ChatContext): string => {
    let prompt = `Tu es un assistant IA expert en médecine, spécialisé dans la formation médicale française et la préparation aux EDN.

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Sois précis, pédagogique et bienveillant
- Utilise un vocabulaire médical approprié
- Structure tes réponses clairement avec des titres
- Propose des exemples cliniques concrets
- Indique tes sources quand possible
- Adapte ton niveau selon l'interlocuteur

DOMAINES D'EXPERTISE :
- Diagnostics et diagnostics différentiels
- Thérapeutiques et protocoles
- Physiopathologie et mécanismes
- Sémiologie clinique
- Examens complémentaires
- Urgences et conduite à tenir
- Préparation EDN et concours`;

    if (context.itemCode) {
      prompt += `

CONTEXTE SPÉCIFIQUE :
- Item médical : ${context.itemCode} - ${context.itemTitle}
- Spécialité : ${context.specialty || 'Médecine générale'}
- Niveau utilisateur : ${context.userLevel || 'étudiant'}

INSTRUCTIONS CONTEXTUELLES :
- Concentre-toi sur les aspects spécifiques de cet item
- Utilise les compétences Rang A (fondamentaux) et Rang B (approfondis)
- Propose des cas cliniques liés à cet item
- Adapte la complexité selon le niveau de l'utilisateur`;
    }

    return prompt;
  };

  // Envoyer un message
  const sendMessage = useCallback(async (
    content: string,
    sessionId?: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      context?: ChatContext;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let session = currentSession;
      
      // Si pas de session courante ou sessionId spécifié
      if (!session || (sessionId && session.id !== sessionId)) {
        session = sessions.find(s => s.id === sessionId) || null;
        if (!session) {
          // Créer une nouvelle session
          const newSessionId = createSession('Nouvelle conversation', options?.context);
          session = sessions.find(s => s.id === newSessionId) || null;
        }
        setCurrentSession(session);
      }

      if (!session) throw new Error('Impossible de créer ou trouver une session');

      // Ajouter le message utilisateur
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        metadata: { context: options?.context?.itemCode }
      };

      // Préparer les messages pour l'API
      const apiMessages: ChatCompletionMessage[] = session.messages
        .filter(msg => msg.role !== 'system' || session.messages.indexOf(msg) === 0) // Garder seulement le premier message système
        .slice(-10) // Limiter l'historique
        .map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        }));

      // Ajouter le nouveau message utilisateur
      apiMessages.push({
        role: 'user',
        content: userMessage.content
      });

      // Appeler l'API OpenAI
      const response = await createChatCompletion({
        model: options?.model || 'gpt-4.1-2025-04-14',
        messages: apiMessages,
        max_tokens: options?.maxTokens || 1200,
        temperature: options?.temperature || 0.7,
        frequency_penalty: 0.3,
        presence_penalty: 0.1
      });

      // Créer le message de l'assistant
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.',
        timestamp: new Date(),
        metadata: {
          model: response.model,
          tokens: response.usage?.total_tokens,
          context: options?.context?.itemCode
        }
      };

      // Mettre à jour la session
      const updatedSession = {
        ...session,
        messages: [...session.messages, userMessage, assistantMessage],
        updatedAt: new Date()
      };

      setSessions(prev => prev.map(s => s.id === session!.id ? updatedSession : s));
      setCurrentSession(updatedSession);

      return {
        userMessage,
        assistantMessage,
        session: updatedSession
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      errorService.handleError(err as Error, 'user_action', true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, sessions, createSession]);

  // Supprimer une session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  // Renommer une session
  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, title: newTitle, updatedAt: new Date() }
        : s
    ));
  }, []);

  // Charger une session
  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
    return session;
  }, [sessions]);

  // Effacer l'historique d'une session
  const clearSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { 
            ...s, 
            messages: s.messages.filter(msg => msg.role === 'system'),
            updatedAt: new Date() 
          }
        : s
    ));
  }, []);

  // Exporter une session
  const exportSession = useCallback((sessionId: string, format: 'json' | 'markdown' | 'txt' = 'json') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;

    switch (format) {
      case 'markdown':
        return exportToMarkdown(session);
      case 'txt':
        return exportToText(session);
      case 'json':
      default:
        return JSON.stringify(session, null, 2);
    }
  }, [sessions]);

  const exportToMarkdown = (session: ChatSession): string => {
    let markdown = `# ${session.title}\n\n`;
    markdown += `**Créé le :** ${session.createdAt.toLocaleString()}\n`;
    markdown += `**Dernière mise à jour :** ${session.updatedAt.toLocaleString()}\n\n`;

    session.messages
      .filter(msg => msg.role !== 'system')
      .forEach(msg => {
        const role = msg.role === 'user' ? '👤 **Utilisateur**' : '🤖 **Assistant IA**';
        markdown += `## ${role}\n\n${msg.content}\n\n---\n\n`;
      });

    return markdown;
  };

  const exportToText = (session: ChatSession): string => {
    let text = `${session.title}\n`;
    text += `Créé le : ${session.createdAt.toLocaleString()}\n\n`;

    session.messages
      .filter(msg => msg.role !== 'system')
      .forEach(msg => {
        const role = msg.role === 'user' ? 'UTILISATEUR' : 'ASSISTANT IA';
        text += `[${role}] ${msg.content}\n\n`;
      });

    return text;
  };

  return {
    // État
    sessions,
    currentSession,
    isLoading,
    error,

    // Actions principales
    createSession,
    sendMessage,
    loadSession,
    
    // Gestion des sessions
    deleteSession,
    renameSession,
    clearSession,
    exportSession,

    // Utilitaires
    setCurrentSession,
    clearError: () => setError(null)
  };
};