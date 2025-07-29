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
  Sparkles
} from 'lucide-react';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';

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

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message, contextItems);
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
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Chat IA Médical</span>
            {enableWebFallback ? (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                <Globe className="h-3 w-3 mr-1" />
                Web activé
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                <Database className="h-3 w-3 mr-1" />
                EDN uniquement
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
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
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Fallback web</span>
              </div>
              <Switch
                checked={enableWebFallback}
                onCheckedChange={toggleWebFallback}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Si activé, utilise des sources web quand l'information n'est pas trouvée dans la base EDN
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Zone de messages */}
        <ScrollArea className={`${maxHeight} border rounded-lg bg-gray-50`}>
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
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
                          <span className="text-xs text-gray-500">
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
                <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Informations contextuelles */}
        {contextItems.length > 0 && (
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
            <span className="font-medium">Contexte spécialisé:</span> {contextItems.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};