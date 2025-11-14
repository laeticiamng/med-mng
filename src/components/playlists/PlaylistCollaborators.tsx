import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, UserPlus, Trash2, Shield, Edit2 } from 'lucide-react';
import { PlaylistCollaborator, PlaylistPermission } from '@/hooks/useCollaborativePlaylist';
import { toast } from 'sonner';

/**
 * Props for PlaylistCollaborators component
 */
interface PlaylistCollaboratorsProps {
  /**
   * Current collaborators
   */
  collaborators: PlaylistCollaborator[];

  /**
   * Is current user the owner
   */
  isOwner: boolean;

  /**
   * Callback to invite collaborator
   */
  onInvite: (email: string, permission: PlaylistPermission) => Promise<boolean>;

  /**
   * Callback to update permission
   */
  onUpdatePermission: (collaboratorId: string, permission: PlaylistPermission) => Promise<boolean>;

  /**
   * Callback to remove collaborator
   */
  onRemove: (collaboratorId: string) => Promise<boolean>;

  /**
   * Is loading
   */
  isLoading?: boolean;
}

/**
 * PlaylistCollaborators Component
 *
 * Manage playlist collaborators and permissions
 */
export const PlaylistCollaborators: React.FC<PlaylistCollaboratorsProps> = ({
  collaborators,
  isOwner,
  onInvite,
  onUpdatePermission,
  onRemove,
  isLoading = false,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<PlaylistPermission>('edit');
  const [isInviting, setIsInviting] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * Handle invite
   */
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsInviting(true);
    try {
      const success = await onInvite(inviteEmail, invitePermission);
      if (success) {
        toast.success('Collaborator invited');
        setInviteEmail('');
        setInvitePermission('edit');
      }
    } finally {
      setIsInviting(false);
    }
  };

  /**
   * Get permission badge color
   */
  const getPermissionColor = (permission: PlaylistPermission) => {
    switch (permission) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'edit':
        return 'bg-blue-100 text-blue-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaborateurs
        </CardTitle>
        <CardDescription>
          Manage who can access and edit this playlist
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Form */}
        {isOwner && (
          <form onSubmit={handleInvite} className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm">Invite Collaborator</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="email" className="text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="permission" className="text-sm">
                  Permission
                </Label>
                <Select value={invitePermission} onValueChange={(v) => setInvitePermission(v as PlaylistPermission)}>
                  <SelectTrigger id="permission" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isInviting || isLoading} size="sm" className="w-full md:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              {isInviting ? 'Inviting...' : 'Invite'}
            </Button>
          </form>
        )}

        {/* Collaborators List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Current Collaborators ({collaborators.length})</h4>

          {collaborators.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collaborators yet</p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={collab.userAvatar} />
                      <AvatarFallback>{collab.userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{collab.userName}</p>
                        {collab.isOwner && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{collab.userEmail}</p>
                    </div>
                  </div>

                  {/* Permission Control */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isOwner && !collab.isOwner ? (
                      <>
                        {editingId === collab.id ? (
                          <Select
                            value={collab.permission}
                            onValueChange={async (v) => {
                              await onUpdatePermission(collab.id, v as PlaylistPermission);
                              setEditingId(null);
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">View</SelectItem>
                              <SelectItem value="edit">Edit</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <>
                            <Badge className={getPermissionColor(collab.permission)}>
                              {collab.permission}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingId(collab.id)}
                              disabled={isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveConfirm(collab.id)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Badge className={getPermissionColor(collab.permission)}>
                        {collab.permission}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removeConfirm} onOpenChange={() => setRemoveConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator?</AlertDialogTitle>
            <AlertDialogDescription>
              This collaborator will no longer have access to this playlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={async () => {
              if (removeConfirm) {
                await onRemove(removeConfirm);
                setRemoveConfirm(null);
              }
            }}
            disabled={isLoading}
            className="bg-destructive"
          >
            Remove
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PlaylistCollaborators;
