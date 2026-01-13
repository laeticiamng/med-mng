import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, Plus, Calendar, Clock, BookOpen, 
  Play, UserPlus, LogOut, Loader2, Video
} from 'lucide-react';
import { useCollaborativeStudy } from '@/hooks/useCollaborativeStudy';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function StudyGroupsPanel() {
  const { toast } = useToast();
  const { 
    groups, 
    currentSession,
    loading,
    createGroup,
    joinGroup,
    leaveGroup,
    startSession,
    endSession,
    loadGroups
  } = useCollaborativeStudy();

  const [user, setUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupTopic, setNewGroupTopic] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadGroups();
      }
    };
    loadUser();
  }, [loadGroups]);

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    
    const success = await createGroup(newGroupName, newGroupDescription, newGroupTopic);
    if (success) {
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupTopic('');
      setShowCreateDialog(false);
      toast({
        title: "Groupe créé",
        description: "Votre groupe d'étude a été créé avec succès"
      });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    const success = await joinGroup(groupId);
    if (success) {
      toast({
        title: "Groupe rejoint",
        description: "Vous avez rejoint le groupe avec succès"
      });
    }
  };

  const handleStartSession = async (groupId: string) => {
    const success = await startSession(groupId);
    if (success) {
      toast({
        title: "Session démarrée",
        description: "La session d'étude collaborative a commencé"
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Connectez-vous pour accéder aux groupes d'étude</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Groupes d'étude</h2>
          <p className="text-muted-foreground">Étudiez ensemble, progressez plus vite</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un groupe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau groupe d'étude</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom du groupe</Label>
                <Input 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Révisions Cardiologie"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Décrivez l'objectif du groupe..."
                />
              </div>
              <div>
                <Label>Sujet principal</Label>
                <Input 
                  value={newGroupTopic}
                  onChange={(e) => setNewGroupTopic(e.target.value)}
                  placeholder="Ex: IC-78 à IC-85"
                />
              </div>
              <Button onClick={handleCreateGroup} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Créer le groupe
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Session */}
      {currentSession && (
        <Card className="border-success bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <Video className="h-5 w-5" />
              Session en cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Session active</span>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => endSession(currentSession.id)}
              className="w-full"
            >
              Terminer la session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Aucun groupe d'étude</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Créer le premier groupe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => {
            const isMember = group.members?.some((m: any) => m.user_id === user.id);
            const isOwner = group.created_by === user.id;
            
            return (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </div>
                    {group.is_active && (
                      <Badge variant="default" className="bg-success">
                        Actif
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.topic && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {group.topic}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {group.member_count || group.members?.length || 0} / {group.max_members || 10} membres
                    </span>
                  </div>

                  {/* Members avatars */}
                  {group.members && group.members.length > 0 && (
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 5).map((member: any, idx: number) => (
                        <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {member.profiles?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {group.members.length > 5 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                          +{group.members.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isMember ? (
                      <>
                        <Button 
                          onClick={() => handleStartSession(group.id)}
                          className="flex-1 gap-2"
                          disabled={!!currentSession}
                        >
                          <Play className="h-4 w-4" />
                          Démarrer
                        </Button>
                        {!isOwner && (
                          <Button 
                            variant="outline"
                            onClick={() => leaveGroup(group.id)}
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => handleJoinGroup(group.id)}
                        className="w-full gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Rejoindre
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
