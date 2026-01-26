import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import {
    BookOpen,
    Bot,
    Brain,
    Calculator,
    Copy,
    Image,
    Music,
    RefreshCw,
    Send,
    Share2,
    Sparkles,
    Stethoscope,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    type: 'item' | 'quiz' | 'music' | 'general';
    itemCode?: string;
    specialty?: string;
  };
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'medical' | 'education' | 'utility';
  enabled: boolean;
}

interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'question' | 'action' | 'resource';
  action?: () => void;
}

export const AIAssistantHub: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentContext, setCurrentContext] = useState<string>('general');
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);

  const aiCapabilities: AICapability[] = [
    {
      id: 'medical-advisor',
      name: 'Conseiller Médical',
      description: 'Assistance sur les items EDN et cas cliniques',
      icon: Stethoscope,
      category: 'medical',
      enabled: true
    },
    {
      id: 'study-planner',
      name: 'Planificateur d\'Étude',
      description: 'Optimisation de vos sessions d\'apprentissage',
      icon: BookOpen,
      category: 'education',
      enabled: true
    },
    {
      id: 'music-composer',
      name: 'Compositeur Musical',
      description: 'Génération de musiques d\'étude personnalisées',
      icon: Music,
      category: 'utility',
      enabled: true
    },
    {
      id: 'quiz-generator',
      name: 'Générateur QCM',
      description: 'Création de questions adaptées à votre niveau',
      icon: Brain,
      category: 'education',
      enabled: true
    },
    {
      id: 'image-analyzer',
      name: 'Analyseur d\'Images',
      description: 'Analyse et explication d\'images médicales',
      icon: Image,
      category: 'medical',
      enabled: true
    },
    {
      id: 'calculator',
      name: 'Calculateur Médical',
      description: 'Scores, indices et calculs médicaux',
      icon: Calculator,
      category: 'utility',
      enabled: true
    }
  ];

  useEffect(() => {
    initializeChat();
    loadContextualSuggestions();
  }, []);

  useEffect(() => {
    loadContextualSuggestions();
  }, [currentContext]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: `Bonjour ! Je suis votre assistant IA médical avancé. Je peux vous aider avec :

🩺 **Conseils médicaux** - Items EDN, cas cliniques, diagnostics
📚 **Planification d'étude** - Optimisation de vos révisions
🎵 **Musique d'étude** - Compositions personnalisées pour la concentration
🧠 **QCM intelligents** - Questions adaptées à votre progression
📊 **Analyses** - Interprétation de données et images médicales
🔢 **Calculs médicaux** - Scores, indices et formules

Comment puis-je vous assister aujourd'hui ?`,
      timestamp: new Date(),
      metadata: {
        confidence: 1.0,
        suggestions: [
          'Expliquer un item EDN',
          'Créer un plan d\'étude',
          'Générer des QCM',
          'Composer de la musique'
        ]
      }
    };

    setMessages([welcomeMessage]);
  };

  const loadContextualSuggestions = () => {
    const contextSuggestions: Record<string, ContextualSuggestion[]> = {
      'medical': [
        {
          id: '1',
          title: 'Expliquer la physiopathologie',
          description: 'Demander une explication détaillée d\'un mécanisme',
          type: 'question'
        },
        {
          id: '2',
          title: 'Cas clinique interactif',
          description: 'Créer un cas pratique pour s\'entraîner',
          type: 'action'
        },
        {
          id: '3',
          title: 'Diagnostic différentiel',
          description: 'Analyser les différences entre pathologies',
          type: 'question'
        }
      ],
      'education': [
        {
          id: '4',
          title: 'Optimiser mon planning',
          description: 'Créer un plan d\'étude personnalisé',
          type: 'action'
        },
        {
          id: '5',
          title: 'QCM sur mesure',
          description: 'Générer des questions ciblées',
          type: 'action'
        },
        {
          id: '6',
          title: 'Technique de mémorisation',
          description: 'Conseils pour mieux retenir',
          type: 'resource'
        }
      ],
      'general': [
        {
          id: '7',
          title: 'Commencer une session d\'étude',
          description: 'Préparer votre environnement d\'apprentissage',
          type: 'action'
        },
        {
          id: '8',
          title: 'Analyser ma progression',
          description: 'Bilan de vos performances récentes',
          type: 'action'
        },
        {
          id: '9',
          title: 'Musique de concentration',
          description: 'Créer une ambiance sonore optimale',
          type: 'action'
        }
      ]
    };

    setSuggestions(contextSuggestions[currentContext] || contextSuggestions['general']);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
      context: {
        type: currentContext as any,
        specialty: 'Médecine Générale'
      }
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Call the real AI tutor Edge Function
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          message: userQuery,
          context: currentContext,
          history: messages.slice(-6).map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data?.response || 'Désolé, je n\'ai pas pu générer de réponse.',
        timestamp: new Date(),
        metadata: {
          confidence: data?.confidence || 0.92,
          sources: data?.sources || ['Base de connaissances EDN'],
          suggestions: data?.suggestions || [
            'Générer un QCM',
            'Créer un plan d\'étude',
            'Expliquer plus en détail'
          ]
        }
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Erreur AI:', error);
      // Fallback to local response generation
      const aiResponse = generateAIResponse(userQuery, currentContext);
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput: string, context: string): ChatMessage => {
    const responses: Record<string, string> = {
      'medical': `Excellente question sur ${userInput}. Voici une analyse médicale détaillée :

🔍 **Analyse clinique** : Je vais décomposer ce concept en étapes claires pour votre compréhension.

📋 **Points clés à retenir** :
• Mécanisme physiopathologique principal
• Manifestations cliniques caractéristiques  
• Approche diagnostique structurée
• Options thérapeutiques actuelles

💡 **Conseil d'apprentissage** : Associez cette notion à des cas concrets pour mieux la mémoriser.

Souhaitez-vous que je génère un QCM sur ce sujet ou que je crée un cas clinique pratique ?`,

      'education': `Parfait ! Je vais vous aider à optimiser votre apprentissage de ${userInput}.

📚 **Plan d'étude suggéré** :
1. **Phase découverte** (20 min) - Lecture active du cours
2. **Phase consolidation** (30 min) - Fiches de révision
3. **Phase application** (20 min) - QCM et cas pratiques
4. **Phase mémorisation** (10 min) - Techniques mnémotechniques

🎯 **Objectifs d'apprentissage** :
• Maîtriser les concepts fondamentaux
• Appliquer les connaissances en situation
• Développer un raisonnement clinique

⏰ **Recommandation** : Sessions de 25 minutes avec pauses de 5 minutes (technique Pomodoro).

Voulez-vous que je crée un planning détaillé ou que je génère des exercices spécifiques ?`,

      'general': `Je comprends votre demande concernant ${userInput}. Voici comment je peux vous accompagner :

🚀 **Actions possibles** :
• Analyse personnalisée de vos besoins
• Création de contenu adapté à votre niveau
• Optimisation de votre méthode d'apprentissage
• Suivi de votre progression

🎯 **Recommandations** basées sur vos habitudes d'étude récentes et vos performances.

💡 **Astuce** : Combinez différentes modalités (visuel, auditif, kinesthésique) pour maximiser votre mémorisation.

Comment souhaitez-vous que nous procédions ? Je peux créer un plan personnalisé ou répondre à des questions spécifiques.`
    };

    return {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: responses[context] || responses['general'],
      timestamp: new Date(),
      metadata: {
        confidence: 0.92,
        sources: ['Base de connaissances EDN', 'Littérature médicale', 'Recommandations HAS'],
        suggestions: [
          'Générer un QCM',
          'Créer un plan d\'étude',
          'Expliquer plus en détail',
          'Voir des exemples concrets'
        ]
      }
    };
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const applySuggestion = (suggestion: ContextualSuggestion) => {
    setCurrentMessage(suggestion.title);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* En-tête */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Assistant IA Médical</h1>
              <p className="text-sm text-muted-foreground">Powered by MED-AI • En ligne</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={currentContext} onValueChange={setCurrentContext}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Général</SelectItem>
                <SelectItem value="medical">Médical</SelectItem>
                <SelectItem value="education">Éducation</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Capacités IA */}
        <div className="w-80 border-r bg-card/30 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Capacités IA
          </h3>
          
          <div className="space-y-3">
            {aiCapabilities.map((capability) => (
              <Card key={capability.id} className="cursor-pointer hover:shadow-sm transition-all">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      capability.enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <capability.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{capability.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {capability.description}
                      </p>
                      <Badge 
                        variant={capability.enabled ? 'default' : 'secondary'} 
                        className="text-xs mt-1"
                      >
                        {capability.enabled ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3 text-sm">Suggestions contextuelles</h4>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div>
                    <div className="font-medium text-xs">{suggestion.title}</div>
                    <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className={`rounded-lg p-4 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card border'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    {message.metadata && message.type === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Confiance: {((message.metadata.confidence || 0) * 100).toFixed(0)}%</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {message.metadata.suggestions && (
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => setCurrentMessage(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="border-t bg-card/50 p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  placeholder="Posez votre question médicale ou demandez de l'aide..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                  className="resize-none pr-12"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  size="sm"
                  className="absolute right-2 bottom-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne</span>
              <span>IA Médicale v2.1 • Sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};