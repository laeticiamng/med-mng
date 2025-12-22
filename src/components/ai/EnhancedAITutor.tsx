import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, 
  Loader2, Trash2, Lightbulb, BookOpen, Sparkles, History,
  ChevronDown, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  itemContext?: ItemContext;
  createdAt: string;
  updatedAt: string;
}

interface ItemContext {
  itemCode: string;
  title: string;
  competences?: string[];
  rangA?: any;
  rangB?: any;
}

interface EnhancedAITutorProps {
  itemContext?: ItemContext;
}

const QUICK_PROMPTS = [
  { icon: '📝', text: 'Explique-moi cet item simplement', category: 'explain' },
  { icon: '🎯', text: 'Quels sont les points clés à retenir ?', category: 'key_points' },
  { icon: '❓', text: 'Génère-moi 3 QCM sur ce sujet', category: 'qcm' },
  { icon: '🏥', text: 'Donne-moi un cas clinique type', category: 'clinical' },
  { icon: '⚠️', text: 'Quels sont les pièges classiques ?', category: 'pitfalls' },
  { icon: '🔗', text: 'Liens avec d\'autres items EDN ?', category: 'links' },
  { icon: '💊', text: 'Quels sont les traitements de référence ?', category: 'treatment' },
  { icon: '🩺', text: 'Signes cliniques pathognomoniques ?', category: 'signs' },
];

export function EnhancedAITutor({ itemContext }: EnhancedAITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addPoints, unlockBadge, checkAndUnlockBadges } = useGamification();
  const { logActivity } = useActivityTracking();

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversations from Supabase
  useEffect(() => {
    const loadConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at, updated_at, last_message')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (data) {
        const mapped: Conversation[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          messages: [],
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
        setConversations(mapped);
      }
    };
    loadConversations();
  }, []);

  const saveConversations = async (convs: Conversation[]) => {
    setConversations(convs);
    // Supabase is the source of truth now, no localStorage needed
  };

  const startNewConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const title = itemContext ? `Item ${itemContext.itemCode}` : 'Nouvelle conversation';
    
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title,
      } as any)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating conversation:', error);
      return;
    }

    const newConv: Conversation = {
      id: data.id,
      title: data.title,
      messages: [],
      itemContext,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    setCurrentConversationId(newConv.id);
    setMessages([]);
    setConversations([newConv, ...conversations]);
  };

  const loadConversation = async (conv: Conversation) => {
    setCurrentConversationId(conv.id);
    
    // Load messages from Supabase
    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    const loadedMessages: Message[] = (messagesData || []).map((m: any) => ({
      role: m.sender as 'user' | 'assistant',
      content: m.text,
      timestamp: m.created_at,
    }));

    setMessages(loadedMessages);
    setShowQuickPrompts(loadedMessages.length === 0);
  };

  const deleteConversation = async (convId: string) => {
    // Delete messages first
    await supabase.from('chat_messages').delete().eq('conversation_id', convId);
    // Then delete conversation
    await supabase.from('chat_conversations').delete().eq('id', convId);
    
    const updated = conversations.filter(c => c.id !== convId);
    setConversations(updated);
    if (currentConversationId === convId) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  };

  const streamChat = async (userMessages: Message[]) => {
    // Enrich context with medical data when available
    const enrichedContext = itemContext ? {
      ...itemContext,
      systemPrompt: itemContext.rangA || itemContext.rangB 
        ? `Tu es un tuteur médical expert. Contexte actuel: Item ${itemContext.itemCode} - ${itemContext.title}. ` +
          `Compétences Rang A: ${JSON.stringify(itemContext.rangA?.competences_cles?.slice(0, 5) || [])}. ` +
          `Réponds de manière pédagogique et structurée.`
        : undefined
    } : undefined;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages, itemContext: enrichedContext }),
    });

    if (resp.status === 429) {
      toast({ title: "Limite atteinte", description: "Trop de requêtes, réessayez plus tard.", variant: "destructive" });
      throw new Error("Rate limited");
    }
    if (resp.status === 402) {
      toast({ title: "Crédits insuffisants", description: "Rechargez vos crédits IA.", variant: "destructive" });
      throw new Error("Payment required");
    }
    if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowQuickPrompts(false);

    try {
      const assistantContent = await streamChat(newMessages);
      
      // Gamification: Award points for AI questions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await addPoints(user.id, 'aiQuestion');
        await logActivity({ 
          activity_type: 'study', 
          count: 1, 
          metadata: { type: 'ai_question', itemContext: itemContext?.itemCode } 
        });
        
        // Track question count for badge
        const newCount = questionCount + 1;
        setQuestionCount(newCount);
        
        // Unlock "Curieux" badge after 10 AI questions
        if (newCount >= 10) {
          await unlockBadge(user.id, 'ai_chat');
        }
        
        await checkAndUnlockBadges(user.id);
      }
      
      // Save messages to Supabase
      if (currentConversationId) {
        // Save user message
        await supabase.from('chat_messages').insert({
          conversation_id: currentConversationId,
          sender: 'user',
          text: messageText.trim(),
        } as any);

        // Save assistant message
        await supabase.from('chat_messages').insert({
          conversation_id: currentConversationId,
          sender: 'assistant',
          text: assistantContent,
        } as any);

        // Update conversation title if first message
        const conv = conversations.find(c => c.id === currentConversationId);
        if (conv && conv.messages.length === 0) {
          await supabase.from('chat_conversations').update({
            title: messageText.slice(0, 30) + '...',
            last_message: assistantContent.slice(0, 100),
            updated_at: new Date().toISOString(),
          } as any).eq('id', currentConversationId);
        }

        // Update local state
        const updated = conversations.map(c => 
          c.id === currentConversationId 
            ? { 
                ...c, 
                messages: [...newMessages, { role: 'assistant' as const, content: assistantContent, timestamp: new Date().toISOString() }],
                title: c.messages.length === 0 ? messageText.slice(0, 30) + '...' : c.title,
                updatedAt: new Date().toISOString()
              }
            : c
        );
        setConversations(updated);
      }
    } catch (error) {
      console.error('AI Tutor error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => { setIsOpen(true); if (!currentConversationId) startNewConversation(); }}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-br from-primary to-primary/80"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  const cardSize = isExpanded 
    ? 'w-[600px] h-[700px]' 
    : isMinimized 
      ? 'w-72 h-14' 
      : 'w-96 h-[500px]';

  return (
    <Card className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all ${cardSize}`}>
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm">Tuteur IA EDN</CardTitle>
            {itemContext && (
              <Badge variant="outline" className="text-[10px] mt-0.5">
                {itemContext.itemCode}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          {/* History dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <History className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={startNewConversation}>
                <Sparkles className="h-3 w-3 mr-2" />
                Nouvelle conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {conversations.slice(0, 10).map(conv => (
                <DropdownMenuItem 
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  className="flex justify-between"
                >
                  <span className="truncate text-xs">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-2"
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-56px)]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 && showQuickPrompts && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Bonjour ! Je suis votre tuteur IA.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {itemContext 
                      ? `Posez-moi vos questions sur l'item ${itemContext.itemCode}` 
                      : 'Posez-moi vos questions sur les items EDN'}
                  </p>
                </div>

                {/* Quick prompts */}
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-3 text-left justify-start text-xs"
                      onClick={() => handleSend(prompt.text)}
                    >
                      <span className="mr-2">{prompt.icon}</span>
                      <span className="truncate">{prompt.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick prompts toggle when in conversation */}
          {messages.length > 0 && (
            <div className="px-3 py-1 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs gap-1"
                onClick={() => setShowQuickPrompts(!showQuickPrompts)}
              >
                <Lightbulb className="h-3 w-3" />
                Suggestions
                <ChevronDown className={`h-3 w-3 transition-transform ${showQuickPrompts ? 'rotate-180' : ''}`} />
              </Button>
              {showQuickPrompts && (
                <div className="flex gap-1 flex-wrap py-2">
                  {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-6 px-2"
                      onClick={() => handleSend(prompt.text)}
                    >
                      {prompt.icon} {prompt.text.slice(0, 20)}...
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-3 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
