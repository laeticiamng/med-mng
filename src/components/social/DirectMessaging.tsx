import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    ArrowLeft,
    Check, CheckCheck,
    Circle,
    Loader2,
    MessageCircle,
    Search,
    Send
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface DirectMessagingProps {
  selectedUserId?: string;
  onBack?: () => void;
}

export const DirectMessaging: React.FC<DirectMessagingProps> = ({ 
  selectedUserId, 
  onBack 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(selectedUserId || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast: _toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!currentUser || !selectedConversation) return;

    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.sender_id === selectedConversation) {
            setMessages(prev => [...prev, {
              id: newMsg.id,
              senderId: newMsg.sender_id,
              content: newMsg.content,
              createdAt: newMsg.created_at,
              read: false
            }]);
            // Mark as read immediately
            supabase
              .from('direct_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedConversation]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load from direct_messages table
      const { data: dbConversations } = await (supabase as any)
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (dbConversations && dbConversations.length > 0) {
        // Group by conversation partner
        const convMap = new Map<string, Conversation>();
        
        for (const msg of dbConversations) {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          
          if (!convMap.has(partnerId)) {
            convMap.set(partnerId, {
              id: partnerId,
              participantId: partnerId,
              participantName: 'Utilisateur',
              lastMessage: msg.content,
              lastMessageAt: msg.created_at,
              unreadCount: msg.sender_id !== user.id && !msg.read ? 1 : 0,
              isOnline: false
            });
          } else if (msg.sender_id !== user.id && !msg.read) {
            const conv = convMap.get(partnerId)!;
            conv.unreadCount++;
          }
        }

        setConversations(Array.from(convMap.values()));
      } else {
        // No conversations yet - show empty state
        setConversations([]);
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (participantId: string) => {
    if (!currentUser) return;
    
    try {
      const { data: dbMessages } = await (supabase as any)
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (dbMessages) {
        setMessages(dbMessages.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          content: m.content,
          createdAt: m.created_at,
          read: m.read
        })));

        // Mark as read
        await (supabase as any)
          .from('direct_messages')
          .update({ read: true })
          .eq('receiver_id', currentUser.id)
          .eq('sender_id', participantId);
      }
    } catch (e) {
      console.error('Error loading messages:', e);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      const { data: newMsg } = await (supabase as any)
        .from('direct_messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: selectedConversation,
          content: newMessage,
          read: false
        })
        .select()
        .maybeSingle();

      if (newMsg) {
        setMessages(prev => [...prev, {
          id: newMsg.id,
          senderId: currentUser.id,
          content: newMessage,
          createdAt: newMsg.created_at,
          read: false
        }]);
      }
    } catch (e) {
      // Local fallback
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: currentUser.id,
        content: newMessage,
        createdAt: new Date().toISOString(),
        read: false
      }]);
    }

    setNewMessage('');
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedParticipant = conversations.find(c => c.participantId === selectedConversation);

  if (selectedConversation && selectedParticipant) {
    return (
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => {
              setSelectedConversation(null);
              onBack?.();
            }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {selectedParticipant.participantName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{selectedParticipant.participantName}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Circle className={`h-2 w-2 ${selectedParticipant.isOnline ? 'fill-success text-success' : 'fill-muted text-muted'}`} />
                {selectedParticipant.isOnline ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    msg.senderId === currentUser?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {formatTimeAgo(msg.createdAt)}
                    </span>
                    {msg.senderId === currentUser?.id && (
                      msg.read 
                        ? <CheckCheck className="h-3 w-3 opacity-70" />
                        : <Check className="h-3 w-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Écrire un message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Messages
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Aucune conversation</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.participantId)}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{conv.participantName[0]}</AvatarFallback>
                  </Avatar>
                  {conv.isOnline && (
                    <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-success text-success border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{conv.participantName}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge variant="destructive" className="rounded-full h-5 min-w-5 flex items-center justify-center">
                    {conv.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
