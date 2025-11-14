import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Trash2, AlertCircle } from 'lucide-react';
import { DirectMessage, Conversation, useDirectMessaging } from '@/hooks/useDirectMessaging';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/**
 * Props for MessageThread component
 */
interface MessageThreadProps {
  /**
   * Conversation to display
   */
  conversation: Conversation;

  /**
   * Callback when conversation is closed
   */
  onClose?: () => void;
}

/**
 * MessageThread Component
 *
 * Display and manage messages in a conversation
 */
export const MessageThread: React.FC<MessageThreadProps> = ({ conversation, onClose }) => {
  const { user } = useAuth();
  const { messages, sendMessage, deleteMessage, sendTypingIndicator, isLoading, error, getMessages, typingUsers } =
    useDirectMessaging();

  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Load messages for conversation
   */
  useEffect(() => {
    getMessages(conversation.id);
  }, [conversation.id, getMessages]);

  /**
   * Scroll to bottom when messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle send message
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageContent.trim()) {
      return;
    }

    setIsSending(true);
    try {
      const success = await sendMessage(conversation.id, messageContent);
      if (success) {
        setMessageContent('');
        toast.success('Message sent');
      }
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle delete message
   */
  const handleDeleteMessage = async (messageId: string) => {
    if (confirm('Delete this message?')) {
      const success = await deleteMessage(messageId);
      if (success) {
        toast.success('Message deleted');
      }
    }
  };

  /**
   * Get participant name (excluding current user)
   */
  const otherParticipant = conversation.participantNames.find(
    (name) => name !== user?.email
  ) || 'Unknown';

  return (
    <Card className="h-full flex flex-col max-h-screen md:max-h-96 lg:max-h-screen">
      {/* Header */}
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg">{otherParticipant}</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.senderId === user?.id ? 'justify-end' : 'justify-start'
                )}
              >
                {message.senderId !== user?.id && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                    message.senderId === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    {message.senderId === user?.id && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>{otherParticipant.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 flex gap-2 flex-shrink-0"
      >
        <Input
          placeholder="Type a message..."
          value={messageContent}
          onChange={(e) => {
            setMessageContent(e.target.value);
            sendTypingIndicator(conversation.id);
          }}
          disabled={isSending}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isSending || !messageContent.trim()}
          size="sm"
          className="px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default MessageThread;
