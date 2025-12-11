import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Settings,
  Globe,
  Database,
  Play,
  BookOpen,
  Brain,
  Sparkles,
  Flame,
  Star
} from 'lucide-react';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedChatWidgetProps {
  contextItems?: string[];
  placeholder?: string;
  maxHeight?: string;
}

export const EnhancedChatWidget: React.FC<EnhancedChatWidgetProps> = ({
  contextItems = [],
  placeholder = "Posez votre question médicale...",
  maxHeight = "h-96"
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    enableWebFallback,
    sendMessage,
    clearChat,
    toggleWebFallback,
    executeSuggestion,
    getSourceLabel,
    getSourceColor
  } = useEnhancedChat();

  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();

  // Load user and stats
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    init();
  }, [loadStats]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message, contextItems);
    
    // Track activity and award points
    if (user) {
      await logActivity({
        activity_type: 'ai_question',
        count: 1,
        metadata: { contextItems }
      });
      await addPoints(user.id, 'aiQuestion');
      loadStats(user.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <Brain className="h-3 w-3" />;
      case 'music':
        return <Play className="h-3 w-3" />;
      case 'immersive':
        return <Sparkles className="h-3 w-3" />;
      case 'related_item':
        return <BookOpen className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <Card className="bg-background border-border shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Chat IA Médical</span>
            {enableWebFallback ? (
              <Badge variant="outline" className="text-xs bg-warning/10 text-warning">
                <Globe className="h-3 w-3 mr-1" />
                Web activé
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-success/10 text-success">
                <Database className="h-3 w-3 mr-1" />
                EDN uniquement
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {gamificationStats && (
              <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-full text-xs">
                <Flame className="h-3 w-3 text-warning" />
                <span className="font-bold text-warning">{gamificationStats.currentStreak}</span>
                <Star className="h-3 w-3 text-primary ml-1" />
                <span className="font-bold text-primary">Nv.{gamificationStats.level}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>

        {showSettings && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Fallback web</span>
              </div>
              <Switch
                checked={enableWebFallback}
                onCheckedChange={toggleWebFallback}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Si activé, utilise des sources web quand l'information n'est pas trouvée dans la base EDN
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Zone de messages */}
        <ScrollArea className={`${maxHeight} border rounded-lg bg-muted/30`}>
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">Commencez une conversation...</p>
                {contextItems.length > 0 && (
                  <p className="text-xs mt-1">
                    Contexte: {contextItems.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      
                      {message.role === 'assistant' && message.source && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSourceColor(message.source)}`}
                          >
                            {getSourceLabel(message.source)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-4">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => executeSuggestion(suggestion)}
                        >
                          {getSuggestionIcon(suggestion.type)}
                          <span className="ml-1">{suggestion.title}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-sm">L'IA réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Zone de saisie */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Informations contextuelles */}
        {contextItems.length > 0 && (
          <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded border border-primary/20">
            <span className="font-medium">Contexte spécialisé:</span> {contextItems.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};