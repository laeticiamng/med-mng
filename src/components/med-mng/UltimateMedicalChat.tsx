import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Bot, User, BookOpen, Search, History, Zap, Brain, Stethoscope, FileText } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  specialty?: string;
}

interface MedicalTemplate {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon: React.ReactNode;
}

export const UltimateMedicalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA médical spécialisé. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      specialty: 'Général'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Général');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const templates: MedicalTemplate[] = [
    {
      id: '1',
      title: 'Diagnostic différentiel',
      prompt: 'Aidez-moi à établir un diagnostic différentiel pour un patient présentant',
      category: 'Diagnostic',
      icon: <Stethoscope className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'Plan thérapeutique',
      prompt: 'Proposez un plan thérapeutique pour',
      category: 'Traitement',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'Mécanisme physiopathologique',
      prompt: 'Expliquez le mécanisme physiopathologique de',
      category: 'Physiopathologie',
      icon: <Brain className="h-4 w-4" />
    },
    {
      id: '4',
      title: 'Recherche bibliographique',
      prompt: 'Trouvez les dernières études sur',
      category: 'Recherche',
      icon: <Search className="h-4 w-4" />
    }
  ];

  const specialties = [
    'Général', 'Cardiologie', 'Neurologie', 'Gastroentérologie', 
    'Pneumologie', 'Endocrinologie', 'Psychiatrie', 'Urgences',
    'Pédiatrie', 'Gynécologie', 'Dermatologie', 'Orthopédie'
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      specialty: selectedSpecialty
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simuler une réponse IA
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Excellente question concernant ${selectedSpecialty.toLowerCase()}. Voici une réponse détaillée basée sur les dernières recommandations médicales et la littérature scientifique récente.

Pour votre demande sur "${input}", je peux vous proposer plusieurs approches :

1. **Approche diagnostique** : Selon les guidelines actuelles...
2. **Considérations thérapeutiques** : Les options incluent...
3. **Suivi et monitoring** : Il est recommandé de...

Cette réponse est basée sur des sources médicales fiables et actualisées.`,
        timestamp: new Date(),
        sources: ['Harrison\'s Principles of Internal Medicine 2023', 'UpToDate', 'Cochrane Reviews'],
        specialty: selectedSpecialty
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const useTemplate = (template: MedicalTemplate) => {
    setInput(template.prompt + ' ');
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col space-y-4">
      {/* En-tête avec sélection de spécialité */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>Assistant IA Médical Avancé</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Spécialité:</span>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-3 py-1 text-sm border rounded-md"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>
          <CardDescription>
            Chat médical avec sources automatiques et expertise spécialisée
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Zone de chat principale */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        
                        {message.sources && (
                          <div className="mt-2 pt-2 border-t border-border/20">
                            <p className="text-xs font-medium mb-1">Sources:</p>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.specialty && (
                            <Badge variant="outline" className="text-xs">
                              {message.specialty}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="rounded-full bg-primary h-2 w-2"></div>
                          <div className="rounded-full bg-primary h-2 w-2 animate-pulse"></div>
                          <div className="rounded-full bg-primary h-2 w-2 animate-pulse"></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Analyse en cours...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question médicale..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panneau latéral */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
                <TabsTrigger value="history" className="text-xs">Historique</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Modèles rapides</h4>
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-auto p-2"
                      onClick={() => useTemplate(template)}
                    >
                      <div className="flex items-center gap-2">
                        {template.icon}
                        <div className="text-left">
                          <div className="font-medium">{template.title}</div>
                          <div className="text-muted-foreground">{template.category}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Conversations récentes</h4>
                  <div className="space-y-2">
                    {['Syndrome coronarien aigu', 'Insuffisance cardiaque', 'Hypertension artérielle'].map((topic, index) => (
                      <div key={index} className="p-2 rounded border text-xs hover:bg-muted cursor-pointer">
                        <div className="font-medium">{topic}</div>
                        <div className="text-muted-foreground">Il y a {index + 1} jour(s)</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Barre de statut */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            IA Médicale Active
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            Sources: 147 guides médicaux
          </span>
        </div>
        <span>{messages.length - 1} messages échangés</span>
      </div>
    </div>
  );
};