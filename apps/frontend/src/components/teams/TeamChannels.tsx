import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Hash,
  Lock,
  Plus,
  Send,
  Settings,
  MoreVertical,
  Edit2,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import {
  useFetchTeamChannels,
  useFetchChannelMessages,
  useCreateChannel,
  useDeleteChannel,
  usePostMessage,
  useDeleteMessage,
} from '@/hooks/useTeams';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { TeamChannel, TeamMessage } from '@shared/services';

interface TeamChannelsProps {
  teamId: string;
  isAdmin?: boolean;
}

export function TeamChannels({ teamId, isAdmin = false }: TeamChannelsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<TeamChannel | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: channels = [], isLoading: loadingChannels } = useFetchTeamChannels(teamId);
  const { data: messages = [], isLoading: loadingMessages } = useFetchChannelMessages(selectedChannel?.id || '');

  // Mutations
  const createChannel = useCreateChannel();
  const deleteChannel = useDeleteChannel();
  const postMessage = usePostMessage();
  const deleteMessage = useDeleteMessage();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      await createChannel.mutateAsync({
        teamId,
        name: newChannelName.trim(),
        options: {
          description: newChannelDescription || undefined,
          is_private: newChannelPrivate,
        },
      });

      toast({
        title: 'Channel créé',
        description: `Le channel "${newChannelName}" a été créé`,
      });

      setNewChannelName('');
      setNewChannelDescription('');
      setNewChannelPrivate(false);
      setCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le channel',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce channel ?')) return;

    try {
      await deleteChannel.mutateAsync(channelId);
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
      }
      toast({
        title: 'Channel supprimé',
        description: 'Le channel a été supprimé',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le channel',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return;

    try {
      await postMessage.mutateAsync({
        channelId: selectedChannel.id,
        teamId,
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

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(messageId);
      toast({
        title: 'Message supprimé',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le message',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Channels</h3>
            {isAdmin && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Nom du channel</Label>
                      <Input
                        placeholder="général"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optionnel)</Label>
                      <Textarea
                        placeholder="Description du channel..."
                        value={newChannelDescription}
                        onChange={(e) => setNewChannelDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Channel privé</Label>
                      <Switch
                        checked={newChannelPrivate}
                        onCheckedChange={setNewChannelPrivate}
                      />
                    </div>
                    <Button
                      onClick={handleCreateChannel}
                      disabled={!newChannelName.trim() || createChannel.isPending}
                      className="w-full"
                    >
                      {createChannel.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Création...</>
                      ) : (
                        'Créer le channel'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loadingChannels ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : channels.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <Hash className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Aucun channel</p>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Créer un channel
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {channels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel?.id === channel.id}
                  isAdmin={isAdmin}
                  onClick={() => setSelectedChannel(channel)}
                  onDelete={() => handleDeleteChannel(channel.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedChannel.is_private ? (
                  <Lock className="h-4 w-4 text-gray-400" />
                ) : (
                  <Hash className="h-4 w-4 text-gray-400" />
                )}
                <h3 className="font-semibold">{selectedChannel.name}</h3>
              </div>
              {selectedChannel.description && (
                <p className="text-xs text-gray-500">{selectedChannel.description}</p>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <Hash className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun message dans ce channel</p>
                  <p className="text-sm text-gray-400">Soyez le premier à écrire !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChannelMessage
                      key={message.id}
                      message={message}
                      isOwn={message.author_id === user?.id}
                      canDelete={message.author_id === user?.id || isAdmin}
                      onDelete={() => handleDeleteMessage(message.id)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder={`Message dans #${selectedChannel.name}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || postMessage.isPending}
                >
                  {postMessage.isPending ? (
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
              <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Sélectionnez un channel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Channel Item Component
function ChannelItem({
  channel,
  isSelected,
  isAdmin,
  onClick,
  onDelete,
}: {
  channel: TeamChannel;
  isSelected: boolean;
  isAdmin: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
        isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0">
        {channel.is_private ? (
          <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <Hash className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
        <span className="text-sm truncate">{channel.name}</span>
      </div>
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Channel Message Component
function ChannelMessage({
  message,
  isOwn,
  canDelete,
  onDelete,
}: {
  message: TeamMessage;
  isOwn: boolean;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="group flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {message.author_id?.substring(0, 2).toUpperCase() || '??'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isOwn ? 'Vous' : 'Membre'}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(message.created_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.edited_at && (
            <Badge variant="outline" className="text-xs">modifié</Badge>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default TeamChannels;
