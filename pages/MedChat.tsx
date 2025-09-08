import React, { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Send,
  Brain,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  BookOpen,
  Stethoscope,
  User,
  Bot,
  Heart,
  Clock,
  Quote,
  Lightbulb
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  sources?: string[];
  isTyping?: boolean;
}

const quickSuggestions = [
  "Expliquez-moi l'insuffisance cardiaque aiguë",
  "Différence entre pneumonie et pleurésie",
  "Protocole de prise en charge de l'AVC",
  "Signes cliniques du diabète de type 2",
  "Complications de l'hypertension artérielle",
  "Diagnostic différentiel des douleurs thoraciques"
];

const medicalCategories = [
  { name: "Cardiologie", icon: Heart, color: "text-red-500" },
  { name: "Pneumologie", icon: Brain, color: "text-blue-500" },
  { name: "Neurologie", icon: Brain, color: "text-purple-500" },
  { name: "Urgences", icon: Stethoscope, color: "text-orange-500" }
];

const MedChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant IA médical spécialisé. Je peux vous aider avec vos questions sur les items EDN, les protocoles médicaux, et bien plus encore. Toutes mes réponses sont basées sur des sources fiables et actualisées.\n\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
      sources: ["Base de données EDN", "Recommandations HAS"]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // Simulation de l'API IA
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMedicalResponse(content),
        timestamp: new Date(),
        sources: ["EDN Item #123", "Recommandations ESC 2023", "Guidelines HAS"]
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const generateMedicalResponse = (question: string): string => {
    // Simulation de réponse médicale intelligente
    if (question.toLowerCase().includes("insuffisance cardiaque")) {
      return `## Insuffisance Cardiaque Aiguë

**Définition :** L'insuffisance cardiaque aiguë (ICA) est une urgence médicale caractérisée par l'apparition brutale ou l'aggravation rapide de signes et symptômes d'insuffisance cardiaque.

**Signes cliniques principaux :**
- Dyspnée de repos ou d'effort
- Œdèmes des membres inférieurs
- Râles crépitants pulmonaires
- Turgescence jugulaire
- Galop B3

**Examens complémentaires :**
1. **BNP/NT-proBNP** : Marqueurs biologiques essentiels
2. **Radiographie thoracique** : Cardiomégalie, signes de surcharge
3. **Échocardiographie** : Évaluation de la FEVG
4. **ECG** : Recherche d'arythmies, ischémie

**Prise en charge immédiate :**
- Position demi-assise
- Oxygénothérapie si SpO2 < 90%
- Diurétiques IV (furosémide)
- Surveillance hémodynamique

Cette information est basée sur les dernières recommandations de la Société Européenne de Cardiologie (ESC) 2021.`;
    }

    return `Je comprends votre question sur "${question}". 

Voici une réponse détaillée basée sur les dernières recommandations médicales :

**Points clés à retenir :**
- Diagnostic basé sur l'examen clinique et les examens complémentaires
- Prise en charge selon les guidelines actuelles
- Surveillance de l'évolution et des complications

**Recommandations pratiques :**
1. Toujours corréler clinique et paraclinique
2. Respecter les protocoles établis
3. Réévaluer régulièrement le patient

Cette réponse s'appuie sur les référentiels officiels et la littérature médicale récente.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentMessage);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const regenerateResponse = (messageId: string) => {
    // Logique pour régénérer une réponse
    console.log("Regenerating response for message:", messageId);
  };

  return (
    <>
      <Helmet>
        <title>Chat IA Médical - MED-MNG | Assistant intelligent spécialisé</title>
        <meta name="description" content="Posez vos questions médicales à notre IA spécialisée. Réponses basées sur les sources EDN/ECOS avec références automatiques." />
        <meta name="keywords" content="IA médicale, chat médical, questions médecine, assistant IA, EDN, ECOS" />
      </Helmet>

      <main className="min-h-screen flex flex-col">
        <div className="medical-container flex-1 flex flex-col py-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              IA médicale avancée
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Chat IA
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent block">
                médical
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Votre assistant intelligent spécialisé en médecine. 
              Réponses basées sur les sources EDN/ECOS officielles.
            </p>
          </div>

          {/* Suggestions rapides */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Suggestions rapides</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(suggestion)}
                  className="text-xs"
                  disabled={isLoading}
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Zone de chat */}
          <Card className="medical-card-premium flex-1 flex flex-col max-h-[600px]">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary" />
                <span>Assistant IA Médical</span>
                <Badge variant="secondary" className="ml-auto">En ligne</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-4",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 border border-border"
                        )}
                      >
                        <div className="prose prose-sm max-w-none">
                          {message.content.split('\n').map((line, i) => {
                            if (line.startsWith('## ')) {
                              return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 first:mt-0">{line.replace('## ', '')}</h3>;
                            }
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={i} className="font-semibold mb-2">{line.replace(/\*\*/g, '')}</p>;
                            }
                            if (line.startsWith('- ')) {
                              return <p key={i} className="ml-4 mb-1">• {line.replace('- ', '')}</p>;
                            }
                            if (line.startsWith(/\d+\./)) {
                              return <p key={i} className="ml-4 mb-1">{line}</p>;
                            }
                            return line ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
                          })}
                        </div>

                        {/* Sources */}
                        {message.sources && (
                          <div className="mt-4 pt-3 border-t border-border/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <BookOpen className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">Sources :</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  <Quote className="w-2 h-2 mr-1" />
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {message.role === "assistant" && (
                          <div className="flex items-center space-x-2 mt-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyMessage(message.content)}
                              className="h-6 px-2"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => regenerateResponse(message.id)}
                              className="h-6 px-2"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>
                      </div>

                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Indicateur de frappe */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-muted/50 border border-border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">L'IA réfléchit...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Zone de saisie */}
              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      ref={inputRef}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Posez votre question médicale..."
                      className="medical-input min-h-[60px] resize-none"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={() => sendMessage(currentMessage)}
                    disabled={!currentMessage.trim() || isLoading}
                    size="lg"
                    className="medical-btn-primary self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne</span>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3" />
                    <span>IA médicale v2.0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spécialités médicales */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Spécialités couvertes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {medicalCategories.map((category) => (
                <Card key={category.name} className="medical-card text-center p-4">
                  <category.icon className={cn("w-8 h-8 mx-auto mb-2", category.color)} />
                  <h4 className="font-medium text-sm">{category.name}</h4>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MedChat;