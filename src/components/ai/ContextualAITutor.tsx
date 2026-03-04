import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Brain, Send, X, Sparkles, BookOpen, Target,
  Lightbulb, MessageSquare, ChevronDown, ChevronUp,
  Loader2, AlertCircle, Stethoscope, RotateCcw,
} from 'lucide-react';
import type { ItemDetail, ItemNote } from '@/types/medMngItems';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ContextualAITutorProps {
  item: ItemDetail;
  userId: string;
  score: number;
  revisionCount: number;
  status: string;
}

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Explique-moi', prompt: 'Explique-moi les points essentiels de cet item de manière simple et structurée.' },
  { icon: Target, label: 'Plan de remédiation', prompt: 'Propose-moi un plan de remédiation personnalisé pour cet item basé sur mes performances.' },
  { icon: BookOpen, label: 'Mnémoniques', prompt: 'Donne-moi des moyens mnémotechniques pour retenir les points clés de cet item.' },
  { icon: Stethoscope, label: 'Cas clinique', prompt: 'Propose-moi un cas clinique court pour tester mes connaissances sur cet item.' },
];

export const ContextualAITutor: React.FC<ContextualAITutorProps> = ({
  item, userId, score, revisionCount, status,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Reset conversation when item changes
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [item.code]);

  const buildItemContext = useCallback(() => ({
    itemCode: item.code,
    title: item.title,
    specialty: item.specialty,
    rang: item.rang,
    keywords: item.keywords,
    tags: item.tags,
    notes: item.notes.map((n: ItemNote) => ({
      title: n.title,
      content: n.content,
      rang: n.rang,
    })),
    score,
    revisionCount,
    status,
  }), [item, score, revisionCount, status]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages,
        itemContext: buildItemContext(),
        userId,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errData.error || `Erreur ${resp.status}`);
    }

    if (!resp.body) throw new Error('Pas de réponse en streaming');
    return resp.body;
  }, [buildItemContext, userId]);

  const processStream = useCallback(async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
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
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const body = await streamChat(allMessages);
      await processStream(body);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, streamChat, processStream]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-xl bg-primary hover:bg-primary/90 p-0"
        >
          <Brain className="w-6 h-6" />
        </Button>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className={cn(
          'fixed z-50 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col',
          isExpanded
            ? 'inset-4 md:inset-8'
            : 'bottom-24 right-4 w-[calc(100%-2rem)] max-w-md h-[500px] md:bottom-6 md:right-6 md:w-[420px] md:h-[560px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">Tuteur IA</h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {item.code} • {item.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetChat}>
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-4">
              {/* Welcome */}
              <div className="text-center py-4">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-foreground text-sm">
                  Bonjour ! Je suis ton tuteur pour{' '}
                  <span className="text-primary">{item.code}</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Je connais cet item, tes scores et ton historique.
                  Pose-moi n'importe quelle question !
                </p>
              </div>

              {/* Context badges */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                <Badge variant="outline" className="text-[10px]">
                  Score : {score}%
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {revisionCount} révision{revisionCount > 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {status === 'revised' ? '✅ Révisé' : status === 'in_progress' ? '📖 En cours' : '🆕 Nouveau'}
                </Badge>
              </div>

              {/* Quick prompts */}
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(prompt)}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted/60 text-foreground rounded-bl-md'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Réflexion en cours...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border/30 bg-background/50 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question sur cet item..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 max-h-24"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="rounded-xl h-9 w-9 shrink-0 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Simple markdown renderer (no external dependency needed)
function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold mt-3 mb-1 text-foreground">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold mt-3 mb-1 text-foreground">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="font-bold mt-4 mb-2 text-foreground text-base">$1</h2>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^[-•] (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm">$2</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
