import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  UserPlus,
  Crown,
  Shield,
  Users,
  Mail,
  MoreVertical,
  Trash2,
  Edit,
  Send,
  Loader2,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useFetchTeamBySlug,
  useFetchTeamMembers,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
  useInviteToTeam,
  useFetchTeamInvitations
} from '@/hooks/useTeams';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeamMembers() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Fetch data
  const { data: team } = useFetchTeamBySlug(slug || '');
  const { data: members = [], isLoading: loadingMembers } = useFetchTeamMembers(team?.id || '');
  const { data: invitations = [] } = useFetchTeamInvitations(team?.id || '');

  // Mutations
  const updateRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();
  const inviteMember = useInviteToTeam();

  // Get current user's membership
  const currentMember = members.find((m: any) => m.user_id === user?.id);
  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || isOwner;

  // Filter members
  const filteredMembers = members.filter((member: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.user?.full_name?.toLowerCase().includes(query) ||
      member.user?.email?.toLowerCase().includes(query)
    );
  });

  const handleInvite = async () => {
    if (!team?.id || !inviteEmail) return;

    try {
      await inviteMember.mutateAsync({
        teamId: team.id,
        invitedEmail: inviteEmail,
        role: inviteRole,
      });

      toast({
        title: 'Invitation envoyée',
        description: `Une invitation a été envoyée à ${inviteEmail}`,
      });

      setInviteEmail('');
      setInviteRole('member');
      setInviteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer l\'invitation',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (memberId: string, userId: string, newRole: 'admin' | 'member') => {
    if (!team?.id) return;

    try {
      await updateRole.mutateAsync({
        teamId: team.id,
        userId,
        role: newRole,
      });

      toast({
        title: 'Rôle mis à jour',
        description: `Le rôle du membre a été modifié`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le rôle',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!team?.id) return;
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${userName} de l'équipe ?`)) return;

    try {
      await removeMember.mutateAsync({
        teamId: team.id,
        userId,
      });

      toast({
        title: 'Membre retiré',
        description: `${userName} a été retiré de l'équipe`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de retirer le membre',
        variant: 'destructive',
      });
    }
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Skeleton className="h-64 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Membres - {team.name} | Med-Mng</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/teams/${slug}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'équipe
              </Button>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des membres</h1>
                <p className="text-gray-600">{team.name}</p>
              </div>

              {isAdmin && (
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Inviter des membres
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Inviter un membre</DialogTitle>
                      <DialogDescription>
                        Envoyez une invitation par email pour rejoindre l'équipe
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="exemple@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rôle</Label>
                        <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Membre</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleInvite}
                        disabled={!inviteEmail || inviteMember.isPending}
                        className="w-full gap-2"
                      >
                        {inviteMember.isPending ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</>
                        ) : (
                          <><Send className="h-4 w-4" /> Envoyer l'invitation</>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-sm text-gray-600">Membres totaux</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-gray-600">Propriétaire</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {members.filter((m: any) => m.role === 'admin').length}
                  </p>
                  <p className="text-sm text-gray-600">Admins</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Mail className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{invitations.filter((i: any) => i.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">Invitations</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Members List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Membres actifs ({filteredMembers.length})</CardTitle>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher un membre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingMembers ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Aucun membre trouvé</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredMembers.map((member: any) => (
                        <MemberRow
                          key={member.id}
                          member={member}
                          isCurrentUser={member.user_id === user?.id}
                          isOwner={isOwner}
                          isAdmin={isAdmin}
                          onUpdateRole={handleUpdateRole}
                          onRemove={handleRemoveMember}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Invitations Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Invitations en attente</CardTitle>
                  <CardDescription>{invitations.filter((i: any) => i.status === 'pending').length} invitation(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  {invitations.filter((i: any) => i.status === 'pending').length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      <Mail className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p>Aucune invitation en attente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invitations
                        .filter((i: any) => i.status === 'pending')
                        .map((invitation: any) => (
                          <div key={invitation.id} className="p-3 border rounded-lg">
                            <div className="flex items-start gap-2">
                              <Mail className="h-4 w-4 text-gray-400 mt-1" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{invitation.invited_email}</p>
                                <p className="text-xs text-gray-500">{invitation.role}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Member Row Component
function MemberRow({
  member,
  isCurrentUser,
  isOwner,
  isAdmin,
  onUpdateRole,
  onRemove,
}: {
  member: any;
  isCurrentUser: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  onUpdateRole: (memberId: string, userId: string, role: 'admin' | 'member') => void;
  onRemove: (userId: string, userName: string) => void;
}) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-yellow-100 text-yellow-800">Propriétaire</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
      case 'member':
        return <Badge variant="outline">Membre</Badge>;
      default:
        return null;
    }
  };

  const canManage = isAdmin && !isCurrentUser && member.role !== 'owner';

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1">
        <Avatar>
          <AvatarFallback>
            {member.user?.full_name?.[0] || member.user?.email?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">
              {member.user?.full_name || member.user?.email || 'Utilisateur'}
            </p>
            {getRoleIcon(member.role)}
            {isCurrentUser && <Badge variant="outline" className="text-xs">Vous</Badge>}
          </div>
          <p className="text-xs text-gray-500 truncate">{member.user?.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getRoleBadge(member.role)}

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, member.user_id, 'admin')} disabled={member.role === 'admin'}>
                <Shield className="h-4 w-4 mr-2" />
                Promouvoir Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, member.user_id, 'member')} disabled={member.role === 'member'}>
                <Edit className="h-4 w-4 mr-2" />
                Rétrograder Membre
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRemove(member.user_id, member.user?.full_name || member.user?.email || 'ce membre')}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Retirer de l'équipe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
