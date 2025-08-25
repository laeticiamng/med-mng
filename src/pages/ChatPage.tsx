import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, Bot, User, Stethoscope, BookOpen, Brain, Settings, History, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  specialty?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  specialty: string;
}

const specialties = [
  'Médecine générale',
  'Cardiologie',
  'Neurologie',
  'Pédiatrie',
  'Gynécologie',
  'Orthopédie',
  'Psychiatrie',
  'Dermatologie',
  'Pneumologie',
  'Gastroentérologie'
];

const mockPrompts = [
  "Expliquez-moi les signes d'alerte d'un infarctus du myocarde",
  "Quels sont les examens à prescrire devant une dyspnée ?",
  "Comment prendre en charge une crise d'asthme aigüe ?",
  "Quelles sont les contre-indications de l'aspirine ?",
  "Décrivez la conduite à tenir devant une fièvre chez l'enfant"
];

export function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Médecine générale');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Session ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      specialty: selectedSpecialty
    };
    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      specialty: selectedSpecialty
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage]
    };

    if (updatedSession.messages.length === 1) {
      updatedSession.title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
    }

    setCurrentSession(updatedSession);
    setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(userMessage.content, selectedSpecialty),
        timestamp: new Date(),
        specialty: selectedSpecialty
      };

      const sessionWithAI = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage]
      };

      setCurrentSession(sessionWithAI);
      setSessions(sessions.map(s => s.id === currentSession.id ? sessionWithAI : s));
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string, specialty: string): string => {
    const responses = {
      'infarctus': `En tant qu'assistant médical spécialisé en ${specialty}, voici les signes d'alerte d'un infarctus du myocarde :

**Signes cliniques majeurs :**
• Douleur thoracique constrictive, intense, prolongée (>20 min)
• Localisation rétrosternale avec irradiation possible (bras gauche, mâchoire, épigastre)
• Accompagnée de sueurs, nausées, dyspnée
• Sensation d'angoisse de mort imminente

**Formes atypiques à connaître :**
• Chez la femme : fatigue, dyspnée, douleurs épigastriques
• Chez le diabétique : forme silencieuse possible
• Chez la personne âgée : confusion, chute

**Conduite à tenir :**
1. Appel SAMU (15) immédiat
2. ECG 12 dérivations en urgence
3. Troponines
4. Préparation à la revascularisation

⚠️ Tout retard diagnostic engage le pronostic vital.`,
      
      'dyspnée': `Concernant les examens devant une dyspnée en ${specialty} :

**Bilan de première intention :**
• Gazométrie artérielle (hypoxémie, hypercapnie)
• Radiographie thoracique (épanchement, pneumothorax, œdème)
• ECG (signes d'insuffisance cardiaque, trouble du rythme)
• BNP ou NT-proBNP (insuffisance cardiaque)
• Hémogramme (anémie)

**Selon l'orientation clinique :**
• Échocardiographie (fonction systolique, valvulopathie)
• Scanner thoracique (embolie pulmonaire, pathologie parenchymateuse)
• EFR (BPCO, asthme)
• D-dimères (si suspicion EP et probabilité faible)

**Examens spécialisés :**
• Angioscanner pulmonaire si EP
• Cathétérisme cardiaque si coronaropathie
• Fibroscopie bronchique si suspicion néoplasique`,

      'default': `En tant qu'assistant médical spécialisé en ${specialty}, je peux vous aider avec votre question. Pouvez-vous préciser davantage votre demande pour que je puisse vous fournir une réponse plus détaillée et adaptée à votre contexte clinique ?

Je peux vous assister sur :
• Diagnostics différentiels
• Conduites à tenir
• Prescriptions et posologies
• Interprétation d'examens
• Recommandations HAS

N'hésitez pas à reformuler votre question ou à me donner plus de contexte.`
    };

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('infarctus') || lowerMessage.includes('myocarde')) {
      return responses.infarctus;
    } else if (lowerMessage.includes('dyspnée') || lowerMessage.includes('dyspnee')) {
      return responses.dyspnée;
    } else {
      return responses.default;
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                <span>Assistant IA Médical</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Spécialité</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createNewSession} className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Nouvelle conversation
              </Button>
            </CardContent>
          </Card>

          {/* Sessions History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <History className="h-4 w-4" />
                <span>Historique</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className={`p-2 rounded cursor-pointer transition-colors ${currentSession?.id === session.id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                      <div className="flex items-start justify-between" onClick={() => setCurrentSession(session)}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <p className="text-xs text-muted-foreground">{session.messages.length} messages</p>
                          <Badge variant="outline" className="text-xs mt-1">{session.specialty}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Suggested Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPrompts.slice(0, 3).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-left justify-start h-auto p-2"
                    onClick={() => setMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">
                      Assistant IA - {selectedSpecialty}
                    </CardTitle>
                    {currentSession && (
                      <p className="text-sm text-muted-foreground">
                        {currentSession.messages.length} messages
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="outline">
                  <Brain className="h-3 w-3 mr-1" />
                  Powered by AI
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {currentSession ? (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {currentSession.messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start space-x-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.type === 'assistant' && (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          )}
                          <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-2' : ''}`}>
                            <div className={`rounded-lg px-4 py-2 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <p className="text-sm whitespace-pre-line">{msg.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                          {msg.type === 'user' && (
                            <div className="flex-shrink-0 order-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Posez votre question médicale..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!message.trim() || isTyping}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Bienvenue dans votre assistant IA médical</h3>
                      <p className="text-muted-foreground">Créez une nouvelle conversation pour commencer</p>
                    </div>
                    <Button onClick={createNewSession}>
                      Nouvelle conversation
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}