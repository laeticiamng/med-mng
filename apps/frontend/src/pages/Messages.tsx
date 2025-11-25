import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  User,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useFetchConversations,
  useFetchMessages,
  useSendMessage,
  useMarkAsRead,
  useSearchUsers,
  type Conversation,
  type DirectMessage
} from '@/hooks/useDirectMessages';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user');

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: conversations = [], isLoading: loadingConversations } = useFetchConversations();
  const { data: messages = [], isLoading: loadingMessages } = useFetchMessages(selectedUserId || '');
  const { data: searchResults = [] } = useSearchUsers(userSearch);

  // Mutations
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Get selected conversation info
  const selectedConversation = conversations.find(c => c.participant_id === selectedUserId);

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      const hasUnread = messages.some(m => m.sender_id === selectedUserId && !m.read_at);
      if (hasUnread) {
        markAsRead.mutate(selectedUserId);
      }
    }
  }, [selectedUserId, messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUserId) return;

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedUserId,
        content: messageInput.trim(),
      });
      setMessageInput('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    }
  };

  const handleSelectUser = (userId: string) => {
    setSearchParams({ user: userId });
    setNewChatOpen(false);
    setUserSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Connectez-vous pour accéder à vos messages</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Messages | Med-Mng</title>
        <meta name="description" content="Messagerie directe - Communiquez avec d'autres utilisateurs" />
      </Helmet>

      <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-4 h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Conversations List */}
            <Card className="md:col-span-1 flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </CardTitle>
                  <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nouvelle conversation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Rechercher un utilisateur..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <ScrollArea className="h-64">
                          {searchResults.length === 0 && userSearch.length >= 2 && (
                            <p className="text-center text-gray-500 py-4">Aucun utilisateur trouvé</p>
                          )}
                          {searchResults.map((profile) => (
                            <button
                              key={profile.id}
                              onClick={() => handleSelectUser(profile.id)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Avatar>
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback>
                                  {profile.full_name?.[0] || profile.email[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="font-medium text-sm">
                                  {profile.full_name || 'Utilisateur'}
                                </p>
                                <p className="text-xs text-gray-500">{profile.email}</p>
                              </div>
                            </button>
                          ))}
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                  {loadingConversations ? (
                    <div className="space-y-2 p-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Aucune conversation</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setNewChatOpen(true)}
                      >
                        Démarrer une conversation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredConversations.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          isSelected={selectedUserId === conv.participant_id}
                          onClick={() => handleSelectUser(conv.participant_id)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="md:col-span-2 flex flex-col h-full">
              {selectedUserId ? (
                <>
                  {/* Header */}
                  <CardHeader className="border-b pb-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setSearchParams({})}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar>
                        <AvatarImage src={selectedConversation?.participant_avatar || undefined} />
                        <AvatarFallback>
                          {selectedConversation?.participant_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {selectedConversation?.participant_name || 'Utilisateur'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversation?.participant_email}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-4">
                      {loadingMessages ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-3/4" />
                          ))}
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Aucun message</p>
                          <p className="text-sm text-gray-400">Envoyez le premier message !</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((message) => (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              isOwn={message.sender_id === user?.id}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Écrivez votre message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessage.isPending}
                      >
                        {sendMessage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Vos messages
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Sélectionnez une conversation ou démarrez-en une nouvelle
                    </p>
                    <Button onClick={() => setNewChatOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle conversation
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// Conversation Item Component
function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
        isSelected ? 'bg-blue-100 border border-blue-200' : 'hover:bg-gray-100'
      )}
    >
      <Avatar>
        <AvatarImage src={conversation.participant_avatar || undefined} />
        <AvatarFallback>
          {conversation.participant_name?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm truncate">
            {conversation.participant_name}
          </p>
          {conversation.unread_count > 0 && (
            <Badge variant="default" className="ml-2 text-xs">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {conversation.last_message || 'Aucun message'}
        </p>
      </div>
    </button>
  );
}

// Message Bubble Component
function MessageBubble({
  message,
  isOwn,
}: {
  message: DirectMessage;
  isOwn: boolean;
}) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div className={cn(
          'flex items-center gap-1 mt-1 text-xs',
          isOwn ? 'text-blue-200 justify-end' : 'text-gray-400'
        )}>
          <span>
            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isOwn && (
            message.read_at ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
