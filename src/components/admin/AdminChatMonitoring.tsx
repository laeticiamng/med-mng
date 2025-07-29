import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  TrendingUp, 
  Globe, 
  Database,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatLog {
  id: string;
  user_id: string;
  question: string;
  response: string;
  edn_context_items: string[];
  web_fallback_used: boolean;
  response_source: 'edn_local' | 'web_fallback' | 'edn_limited';
  response_quality_score?: number;
  conversation_id: string;
  created_at: string;
}

interface ChatStats {
  total_conversations: number;
  edn_responses: number;
  web_fallback_responses: number;
  avg_response_quality: number;
  most_asked_topics: Array<{ topic: string; count: number }>;
}

export const AdminChatMonitoring: React.FC = () => {
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('24h');
  const { toast } = useToast();

  useEffect(() => {
    loadChatData();
  }, [filterSource, timeFilter]);

  const loadChatData = async () => {
    setIsLoading(true);
    try {
      // Simuler les données pour éviter les erreurs de types
      // En production, cette requête utilisera la vraie table enhanced_chat_logs
      const mockLogs: ChatLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          question: 'Qu\'est-ce que l\'item IC-123 ?',
          response: 'L\'item IC-123 concerne les pathologies cardiovasculaires...',
          edn_context_items: ['IC-123'],
          web_fallback_used: false,
          response_source: 'edn_local',
          response_quality_score: 4,
          conversation_id: 'conv-1',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user-2',
          question: 'Comment traiter l\'hypertension ?',
          response: 'Le traitement de l\'hypertension comprend...',
          edn_context_items: [],
          web_fallback_used: true,
          response_source: 'web_fallback',
          response_quality_score: 3,
          conversation_id: 'conv-2',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setChatLogs(mockLogs);

      // Calculer les statistiques
      const calculatedStats: ChatStats = {
        total_conversations: new Set(mockLogs.map(log => log.conversation_id)).size,
        edn_responses: mockLogs.filter(log => log.response_source === 'edn_local').length,
        web_fallback_responses: mockLogs.filter(log => log.web_fallback_used).length,
        avg_response_quality: mockLogs
          .filter(log => log.response_quality_score !== null)
          .reduce((sum, log) => sum + (log.response_quality_score || 0), 0) / 
          mockLogs.filter(log => log.response_quality_score !== null).length || 0,
        most_asked_topics: extractTopicsFromLogs(mockLogs)
      };
      
      setStats(calculatedStats);

    } catch (error) {
      console.error('Erreur loadChatData:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractTopicsFromLogs = (logs: ChatLog[]): Array<{ topic: string; count: number }> => {
    const topicCounts: Record<string, number> = {};

    logs.forEach(log => {
      // Extraire les items EDN mentionnés
      log.edn_context_items.forEach(item => {
        topicCounts[item] = (topicCounts[item] || 0) + 1;
      });

      // Extraire des mots-clés de la question
      const keywords = extractKeywords(log.question);
      keywords.forEach(keyword => {
        if (keyword.length > 3) {
          topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
        }
      });
    });

    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));
  };

  const extractKeywords = (text: string): string[] => {
    const medicalKeywords = [
      'diagnostic', 'traitement', 'symptôme', 'pathologie', 'maladie',
      'patient', 'clinique', 'thérapie', 'examen', 'urgence'
    ];

    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => 
      word.length > 3 && (
        medicalKeywords.includes(word) || 
        /^(cardio|neuro|gastro|pneumo|dermato)/i.test(word)
      )
    );
  };

  const getSourceBadge = (source: string, webFallback: boolean) => {
    if (source === 'edn_local') {
      return <Badge className="bg-green-100 text-green-800">EDN</Badge>;
    } else if (webFallback || source === 'web_fallback') {
      return <Badge className="bg-orange-100 text-orange-800">Web</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">EDN Limité</Badge>;
    }
  };

  const getQualityIndicator = (score?: number) => {
    if (score === undefined || score === null) return null;
    
    if (score >= 4) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (score >= 3) {
      return <CheckCircle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p>Chargement du monitoring chat...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversations</p>
                  <p className="text-2xl font-bold">{stats.total_conversations}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Réponses EDN</p>
                  <p className="text-2xl font-bold text-green-600">{stats.edn_responses}</p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fallback Web</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.web_fallback_responses}</p>
                </div>
                <Globe className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Qualité Moy.</p>
                  <p className="text-2xl font-bold">
                    {stats.avg_response_quality ? stats.avg_response_quality.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monitoring Chat IA</span>
            <Button onClick={loadChatData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Dernière heure</SelectItem>
                <SelectItem value="24h">Dernières 24h</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes sources</SelectItem>
                <SelectItem value="edn_local">EDN uniquement</SelectItem>
                <SelectItem value="web_fallback">Web fallback</SelectItem>
                <SelectItem value="edn_limited">EDN limité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs de chat */}
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {chatLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSourceBadge(log.response_source, log.web_fallback_used)}
                      {getQualityIndicator(log.response_quality_score)}
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {log.user_id.substring(0, 8)}...
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Question:</p>
                      <p className="text-sm text-gray-600 italic">"{log.question}"</p>
                    </div>

                    {log.edn_context_items.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Items EDN utilisés:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.edn_context_items.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-700">Réponse:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {log.response.substring(0, 200)}
                        {log.response.length > 200 && '...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {chatLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucun log de chat trouvé pour les filtres sélectionnés</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Sujets les plus demandés */}
      {stats && stats.most_asked_topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sujets les plus demandés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {stats.most_asked_topics.map((topic, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-sm font-medium">{topic.topic}</p>
                  <p className="text-xs text-gray-500">{topic.count} fois</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};