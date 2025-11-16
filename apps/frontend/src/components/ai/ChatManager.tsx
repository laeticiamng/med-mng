import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Clock,
  BookOpen,
  History
} from 'lucide-react';
import { ContextualAIChat } from './ContextualAIChat';
import { useAIChat } from '@/hooks/ai/useAIChat';
import { useToast } from '@/hooks/use-toast';

interface ChatManagerProps {
  context?: {
    itemCode?: string;
    itemTitle?: string;
    competencesRangA?: any;
    competencesRangB?: any;
  };
}

export const ChatManager: React.FC<ChatManagerProps> = ({ context }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const {
    sessions,
    currentSession,
    createSession,
    loadSession,
    deleteSession,
    renameSession,
    exportSession
  } = useAIChat();

  const { toast } = useToast();

  const handleCreateSession = () => {
    const title = newSessionTitle.trim() || `Conversation ${sessions.length + 1}`;
    const sessionId = createSession(title, {
      itemCode: context?.itemCode,
      itemTitle: context?.itemTitle,
      competences: {
        rangA: context?.competencesRangA,
        rangB: context?.competencesRangB
      }
    });
    
    setNewSessionTitle('');
    setIsDialogOpen(false);
    
    toast({
      title: "Nouvelle conversation",
      description: `Session "${title}" créée avec succès`,
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    toast({
      title: "Conversation supprimée",
      description: "La session a été supprimée",
    });
  };

  const handleRenameSession = (sessionId: string) => {
    if (editingTitle.trim()) {
      renameSession(sessionId, editingTitle.trim());
      setEditingSessionId(null);
      setEditingTitle('');
      
      toast({
        title: "Conversation renommée",
        description: "Le titre a été mis à jour",
      });
    }
  };

  const handleExportSession = (sessionId: string, format: 'json' | 'markdown' | 'txt') => {
    const content = exportSession(sessionId, format);
    if (content) {
      const session = sessions.find(s => s.id === sessionId);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-${session?.title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: `Conversation exportée au format ${format.toUpperCase()}`,
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('fr').format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="space-y-6">
      {/* Chat principal */}
      {currentSession ? (
        <ContextualAIChat
          context={context}
          placeholder={context?.itemCode 
            ? `Posez votre question sur ${context.itemCode}...`
            : "Posez votre question médicale..."
          }
        />
      ) : (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Aucune conversation active
            </h3>
            <p className="text-blue-600 mb-4">
              Créez une nouvelle conversation ou sélectionnez-en une existante
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle conversation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    placeholder={context?.itemCode 
                      ? `Discussion sur ${context.itemCode}`
                      : "Titre de la conversation"
                    }
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                  />
                  {context?.itemCode && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-800">
                        <BookOpen className="h-4 w-4" />
                        <span className="font-medium">Contexte spécialisé</span>
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        Cette conversation sera spécialisée sur l'item {context.itemCode} - {context.itemTitle}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateSession}>
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Gestionnaire de sessions */}
      {sessions.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-800">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5" />
                Historique des conversations
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={newSessionTitle}
                      onChange={(e) => setNewSessionTitle(e.target.value)}
                      placeholder={context?.itemCode 
                        ? `Discussion sur ${context.itemCode}`
                        : "Titre de la conversation"
                      }
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                    />
                    {context?.itemCode && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-800">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">Contexte spécialisé</span>
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          Cette conversation sera spécialisée sur l'item {context.itemCode} - {context.itemTitle}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateSession}>
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                      currentSession?.id === session.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => loadSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {editingSessionId === session.id ? (
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleRenameSession(session.id);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            onBlur={() => handleRenameSession(session.id)}
                            autoFocus
                            className="h-8"
                          />
                        ) : (
                          <h4 className="font-medium text-gray-800 truncate">
                            {session.title}
                          </h4>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDate(session.updatedAt)}
                          </span>
                          {session.context && (
                            <Badge variant="secondary" className="text-xs">
                              {session.context}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {session.messages.filter(m => m.role !== 'system').length} messages
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(session.id);
                            setEditingTitle(session.title);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportSession(session.id, 'markdown');
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};