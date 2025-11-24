import logger from '@/lib/logger';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, BookOpen, Brain, Lightbulb, MessageSquare, Loader2 } from 'lucide-react';
import { createChatCompletion, ChatCompletionMessage } from '@shared/openai/chat/completions';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

interface ContextualAIChatProps {
  context?: {
    itemCode?: string;
    itemTitle?: string;
    competencesRangA?: any;
    competencesRangB?: any;
    userProgress?: any;
  };
  placeholder?: string;
  maxHeight?: string;
}

export const ContextualAIChat: React.FC<ContextualAIChatProps> = ({
  context,
  placeholder = "Posez votre question médicale...",
  maxHeight = "600px"
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'contextual' | 'quiz'>('contextual');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message d'accueil contextuel
  useEffect(() => {
    if (context?.itemCode && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Bonjour ! Je suis votre assistant IA spécialisé pour l'item ${context.itemCode} - ${context.itemTitle}. 

Je peux vous aider avec :
• Les compétences Rang A et B
• Les diagnostics différentiels
• Les stratégies thérapeutiques
• La préparation aux examens
• L'analyse de cas cliniques

Que souhaitez-vous apprendre aujourd'hui ?`,
        timestamp: new Date(),
        context: context.itemCode
      };
      setMessages([welcomeMessage]);
    }
  }, [context]);

  const buildSystemPrompt = () => {
    const basePrompt = `Tu es un assistant IA expert en médecine, spécialisé dans la formation médicale et la préparation aux EDN (Épreuves Dématérialisées Nationales).

RÈGLES IMPORTANTES :
- Réponds UNIQUEMENT en français
- Sois précis, pédagogique et bienveillant
- Utilise un vocabulaire médical approprié
- Structures tes réponses clairement
- Propose des exemples cliniques quand pertinent
- Indique les sources de tes affirmations quand possible

DOMAINES D'EXPERTISE :
- Diagnostics et diagnostics différentiels
- Thérapeutiques et protocoles de soins
- Physiopathologie et mécanismes
- Sémiologie et signes cliniques
- Examens complémentaires et interprétation
- Urgences médicales et conduite à tenir`;

    if (context?.itemCode) {
      return `${basePrompt}

CONTEXTE SPÉCIFIQUE :
- Item actuel : ${context.itemCode} - ${context.itemTitle}
- Mode : Formation spécialisée sur cet item
- Compétences Rang A disponibles : ${context.competencesRangA ? 'Oui' : 'Non'}
- Compétences Rang B disponibles : ${context.competencesRangB ? 'Oui' : 'Non'}

Concentre-toi sur les aspects spécifiques de cet item médicale. Utilise les compétences des Rang A (fondamentaux) et Rang B (approfondis) pour structurer tes réponses.`;
    }

    return basePrompt;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      context: context?.itemCode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Préparer les messages pour l'API
      const apiMessages: ChatCompletionMessage[] = [
        {
          role: 'system',
          content: buildSystemPrompt()
        },
        // Inclure les derniers messages pour le contexte
        ...messages.slice(-6).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage.content
        }
      ];

      // Mode spécialisé selon le type de chat
      let enhancedPrompt = userMessage.content;
      if (chatMode === 'quiz') {
        enhancedPrompt = `Mode Quiz : ${userMessage.content}. Génère une question QCM avec 4 options et l'explication détaillée.`;
      } else if (chatMode === 'contextual' && context?.itemCode) {
        enhancedPrompt = `Contexte ${context.itemCode} : ${userMessage.content}. Réponds spécifiquement par rapport à cet item médical.`;
      }

      apiMessages[apiMessages.length - 1].content = enhancedPrompt;

      const response = await createChatCompletion({
        model: 'gpt-4.1-2025-04-14',
        messages: apiMessages,
        max_tokens: 1200,
        temperature: 0.7,
        frequency_penalty: 0.3,
        presence_penalty: 0.1
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.',
        timestamp: new Date(),
        context: context?.itemCode
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      logger.error('Erreur Chat IA:', error);
      
      toast({
        title: "Erreur de communication",
        description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
        variant: "destructive"
      });

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Désolé, une erreur s\'est produite. Veuillez réessayer votre question.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (context?.itemCode) {
      // Remettre le message d'accueil
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat réinitialisé pour l'item ${context.itemCode} - ${context.itemTitle}. Comment puis-je vous aider ?`,
        timestamp: new Date(),
        context: context.itemCode
      };
      setMessages([welcomeMessage]);
    }
  };

  const getQuickQuestions = () => {
    if (!context?.itemCode) return [];
    
    return [
      `Quels sont les points clés de ${context.itemTitle} ?`,
      `Diagnostic différentiel pour ${context.itemCode}`,
      `Prise en charge thérapeutique`,
      `Examens complémentaires nécessaires`,
      `Complications à surveiller`
    ];
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200" style={{ maxHeight }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-emerald-800">
            <MessageSquare className="h-6 w-6" />
            Assistant IA Médical
            {context?.itemCode && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {context.itemCode}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Mode Selection */}
            <div className="flex rounded-lg border border-emerald-200 overflow-hidden">
              <Button
                size="sm"
                variant={chatMode === 'contextual' ? 'default' : 'ghost'}
                onClick={() => setChatMode('contextual')}
                className="rounded-none"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Contextuel
              </Button>
              <Button
                size="sm"
                variant={chatMode === 'quiz' ? 'default' : 'ghost'}
                onClick={() => setChatMode('quiz')}
                className="rounded-none"
              >
                <Brain className="h-4 w-4 mr-1" />
                Quiz
              </Button>
              <Button
                size="sm"
                variant={chatMode === 'general' ? 'default' : 'ghost'}
                onClick={() => setChatMode('general')}
                className="rounded-none"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Général
              </Button>
            </div>
            
            <Button onClick={clearChat} variant="outline" size="sm">
              Effacer
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-80 w-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-card-foreground border border-border'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' ? (
                      <Bot className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <User className="h-5 w-5 text-primary-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {message.timestamp.toLocaleTimeString()}
                        {message.context && (
                          <span className="ml-2">• {message.context}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Assistant en train de réfléchir...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Questions rapides */}
        {messages.length <= 1 && context?.itemCode && (
          <div className="bg-white/60 rounded-lg p-3 border border-emerald-200">
            <h4 className="text-sm font-semibold text-emerald-800 mb-2">Questions suggérées :</h4>
            <div className="flex flex-wrap gap-2">
              {getQuickQuestions().map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(question)}
                  className="text-xs h-auto py-1 px-2"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="bg-white/80 border-emerald-200 focus:border-emerald-400"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Info mode */}
        <div className="text-xs text-emerald-600 text-center">
          Mode : {chatMode === 'contextual' ? 'Contextuel' : chatMode === 'quiz' ? 'Génération de Quiz' : 'Général'}
          {context?.itemCode && ` • Spécialisé sur ${context.itemCode}`}
        </div>
      </CardContent>
    </Card>
  );
};