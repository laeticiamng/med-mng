import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Send, 
  Shield, 
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface TherapeuticMessage {
  id: string;
  content: string;
  sender: 'user' | 'therapist';
  timestamp: Date;
  emotionalScore: {
    valence: number; // -1 à 1 (négatif à positif)
    arousal: number; // 0 à 1 (calme à excité)
    stress: number; // 0 à 1 (détendu à stressé)
  };
  aiAnalysis?: {
    concerns: string[];
    recommendations: string[];
    interventionLevel: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface MoodMetrics {
  dailyMood: number;
  stressLevel: number;
  anxietyLevel: number;
  wellbeingScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

const TherapeuticChatAI: React.FC = () => {
  const [messages, setMessages] = useState<TherapeuticMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodMetrics, setMoodMetrics] = useState<MoodMetrics>({
    dailyMood: 65,
    stressLevel: 45,
    anxietyLevel: 35,
    wellbeingScore: 72,
    trend: 'stable'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Message d'accueil thérapeutique
    const welcomeMessage: TherapeuticMessage = {
      id: 'welcome',
      content: `Bonjour et bienvenue dans cet espace sécurisé. Je suis votre assistant thérapeutique IA, conçu pour vous offrir un soutien émotionnel et psychologique. Tout ce que vous partagez ici reste confidentiel. Comment vous sentez-vous aujourd'hui ? 💚`,
      sender: 'therapist',
      timestamp: new Date(),
      emotionalScore: {
        valence: 0.8,
        arousal: 0.3,
        stress: 0.1
      }
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const analyzeEmotionalState = (text: string): TherapeuticMessage['emotionalScore'] => {
    // Simulation d'analyse émotionnelle basée sur des mots-clés
    const stressKeywords = ['anxieux', 'stressé', 'inquiet', 'peur', 'panic', 'pression'];
    const positiveKeywords = ['bien', 'content', 'heureux', 'confiant', 'motivé', 'optimiste'];
    const negativeKeywords = ['triste', 'déprimé', 'fatigué', 'découragé', 'seul', 'perdu'];
    
    const lowerText = text.toLowerCase();
    
    let valence = 0;
    let stress = 0;
    let arousal = 0.5;
    
    // Analyser la valence (positif/négatif)
    positiveKeywords.forEach(word => {
      if (lowerText.includes(word)) valence += 0.3;
    });
    negativeKeywords.forEach(word => {
      if (lowerText.includes(word)) valence -= 0.3;
    });
    
    // Analyser le stress
    stressKeywords.forEach(word => {
      if (lowerText.includes(word)) {
        stress += 0.4;
        arousal += 0.3;
      }
    });
    
    return {
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, arousal)),
      stress: Math.max(0, Math.min(1, stress))
    };
  };

  const generateTherapeuticResponse = (userMessage: string, emotionalScore: TherapeuticMessage['emotionalScore']): TherapeuticMessage => {
    let response = '';
    let concerns: string[] = [];
    let recommendations: string[] = [];
    let interventionLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Adapter la réponse selon l'état émotionnel
    if (emotionalScore.stress > 0.6) {
      response = "Je perçois que vous ressentez beaucoup de stress en ce moment. C'est tout à fait compréhensible, et je veux que vous sachiez que ces sentiments sont valides. Avez-vous essayé des techniques de respiration profonde ? Cela peut vraiment aider à réduire l'intensité de ces sensations.";
      concerns.push('Niveau de stress élevé détecté');
      recommendations.push('Exercices de respiration');
      recommendations.push('Techniques de relaxation progressive');
      interventionLevel = 'medium';
    } else if (emotionalScore.valence < -0.5) {
      response = "Je sens que vous traversez une période difficile. Il est important de reconnaître ces émotions plutôt que de les ignorer. Vous n'êtes pas seul(e) dans cette expérience. Pouvez-vous me parler de ce qui vous préoccupe le plus en ce moment ?";
      concerns.push('Humeur négative significative');
      recommendations.push('Expression des émotions');
      recommendations.push('Identification des déclencheurs');
      interventionLevel = 'medium';
    } else if (emotionalScore.valence > 0.5) {
      response = "C'est merveilleux d'entendre que vous vous sentez bien ! Maintenir cet état positif est important. Qu'est-ce qui contribue le plus à votre bien-être en ce moment ?";
      recommendations.push('Maintenir les habitudes positives');
      interventionLevel = 'low';
    } else {
      response = "Merci de partager cela avec moi. Je vous écoute attentivement. Pouvez-vous m'en dire plus sur ce que vous ressentez ?";
      recommendations.push('Exploration émotionnelle approfondie');
      interventionLevel = 'low';
    }
    
    return {
      id: Date.now().toString(),
      content: response,
      sender: 'therapist',
      timestamp: new Date(),
      emotionalScore: {
        valence: 0.6,
        arousal: 0.4,
        stress: 0.2
      },
      aiAnalysis: {
        concerns,
        recommendations,
        interventionLevel
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsAnalyzing(true);

    // Analyser l'état émotionnel du message utilisateur
    const emotionalScore = analyzeEmotionalState(inputMessage);

    const userMessage: TherapeuticMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      emotionalScore
    };

    setMessages(prev => [...prev, userMessage]);

    // Mettre à jour les métriques de bien-être
    setMoodMetrics(prev => ({
      ...prev,
      dailyMood: Math.max(0, Math.min(100, prev.dailyMood + (emotionalScore.valence * 10))),
      stressLevel: Math.max(0, Math.min(100, emotionalScore.stress * 100)),
      anxietyLevel: Math.max(0, Math.min(100, prev.anxietyLevel + (emotionalScore.arousal * 5))),
      wellbeingScore: Math.max(0, Math.min(100, (prev.dailyMood + (100 - prev.stressLevel)) / 2))
    }));

    setTimeout(() => {
      const therapistResponse = generateTherapeuticResponse(inputMessage, emotionalScore);
      setMessages(prev => [...prev, therapistResponse]);
      setIsAnalyzing(false);
    }, 2000);

    setInputMessage('');
  };

  const getEmotionIcon = (score: TherapeuticMessage['emotionalScore']) => {
    if (score.valence > 0.3) return <Smile className="h-4 w-4 text-green-500" />;
    if (score.valence < -0.3) return <Frown className="h-4 w-4 text-red-500" />;
    return <Meh className="h-4 w-4 text-yellow-500" />;
  };

  const getInterventionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-100">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <CardTitle className="text-pink-900">Chat Thérapeutique IA</CardTitle>
              <CardDescription className="text-pink-700">
                Soutien émotionnel avec analyse psychologique avancée
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Sécurisé & Confidentiel</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analyse Émotionnelle
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Bien-être
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-lg font-bold">{moodMetrics.dailyMood}%</div>
                    <div className="text-xs text-muted-foreground">Humeur</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="text-lg font-bold">{moodMetrics.stressLevel}%</div>
                    <div className="text-xs text-muted-foreground">Stress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-lg font-bold">{moodMetrics.anxietyLevel}%</div>
                    <div className="text-xs text-muted-foreground">Anxiété</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-lg font-bold">{moodMetrics.wellbeingScore}%</div>
                    <div className="text-xs text-muted-foreground">Bien-être</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/therapist-ai.png" />
                  <AvatarFallback className="bg-pink-100 text-pink-600">TH</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Thérapeute IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Spécialisé en soutien émotionnel • En ligne
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.sender === 'user' 
                          ? 'bg-pink-600 text-white rounded-lg rounded-br-sm' 
                          : 'bg-gray-100 text-gray-900 rounded-lg rounded-bl-sm'
                      } p-3`}>
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                          </div>
                          {getEmotionIcon(message.emotionalScore)}
                        </div>
                        
                        {message.sender === 'user' && (
                          <div className="mt-2 text-xs opacity-75">
                            Valence: {(message.emotionalScore.valence * 100).toFixed(0)}% | 
                            Stress: {(message.emotionalScore.stress * 100).toFixed(0)}%
                          </div>
                        )}
                        
                        {message.aiAnalysis && (
                          <div className="mt-2 p-2 bg-white/20 rounded text-xs">
                            <Badge className={getInterventionColor(message.aiAnalysis.interventionLevel)} variant="secondary">
                              Niveau: {message.aiAnalysis.interventionLevel}
                            </Badge>
                            {message.aiAnalysis.recommendations.length > 0 && (
                              <div className="mt-1">
                                <strong>Recommandations:</strong>
                                <ul className="list-disc list-inside text-xs mt-1">
                                  {message.aiAnalysis.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Brain className="h-4 w-4 animate-pulse" />
                          Analyse émotionnelle en cours...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Partagez vos sentiments en toute sécurité..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon"
                    disabled={isAnalyzing || !inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Analyse Émotionnelle des Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.filter(m => m.sender === 'user').slice(-5).map((message) => (
                    <div key={message.id} className="space-y-2">
                      <div className="text-sm font-medium">
                        {message.content.substring(0, 50)}...
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Valence</span>
                          <span>{(message.emotionalScore.valence * 100).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={(message.emotionalScore.valence + 1) * 50} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Stress</span>
                          <span>{(message.emotionalScore.stress * 100).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={message.emotionalScore.stress * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommandations IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800">Techniques de Relaxation</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Basé sur votre niveau de stress actuel, essayez la respiration 4-7-8.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800">Mindfulness</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Des exercices de pleine conscience peuvent améliorer votre bien-être général.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-800">Expression Émotionnelle</h4>
                    <p className="text-xs text-purple-700 mt-1">
                      Continuez à exprimer vos émotions, cela contribue à votre équilibre mental.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wellness" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Humeur Quotidienne</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{moodMetrics.dailyMood}%</div>
                  <Progress value={moodMetrics.dailyMood} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gestion du Stress</span>
                    <Heart className="h-4 w-4 text-pink-500" />
                  </div>
                  <div className="text-2xl font-bold">{100 - moodMetrics.stressLevel}%</div>
                  <Progress value={100 - moodMetrics.stressLevel} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score Bien-être</span>
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{moodMetrics.wellbeingScore}%</div>
                  <Progress value={moodMetrics.wellbeingScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TherapeuticChatAI;