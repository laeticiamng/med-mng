import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  Settings,
  ArrowLeft,
  Globe,
  Lock,
  Crown,
  Shield,
  UserPlus,
  MessageSquare,
  Activity,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFetchTeamBySlug, useFetchTeamMembers } from '@/hooks/useTeams';
import { useToast } from '@/hooks/use-toast';

export default function TeamDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch team data
  const { data: team, isLoading: loadingTeam, error: teamError } = useFetchTeamBySlug(slug || '');
  const { data: members = [], isLoading: loadingMembers } = useFetchTeamMembers(team?.id || '');

  // Get current user's membership
  const currentMember = members.find((m: any) => m.user_id === user?.id);
  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || isOwner;
  const isMember = !!currentMember;

  if (loadingTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full max-w-3xl mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Équipe introuvable</CardTitle>
            <CardDescription>Cette équipe n'existe pas ou vous n'y avez pas accès</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/teams">
              <Button className="w-full">Retour aux équipes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{team.name} | Équipe | Med-Mng</title>
        <meta name="description" content={team.description || `Équipe ${team.name}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/teams">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux équipes
              </Button>
            </Link>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900">{team.name}</h1>
                  <Badge variant={team.visibility === 'public' ? 'default' : 'secondary'}>
                    {team.visibility === 'public' ? (
                      <><Globe className="h-3 w-3 mr-1" /> Public</>
                    ) : (
                      <><Lock className="h-3 w-3 mr-1" /> Privée</>
                    )}
                  </Badge>
                </div>
                {team.description && (
                  <p className="text-gray-600 max-w-3xl">{team.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{members.length} membres</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Créée le {new Date(team.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!isMember && team.visibility === 'public' && (
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Rejoindre
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="outline" className="gap-2" onClick={() => navigate(`/teams/${slug}/settings`)}>
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                  <p className="text-sm text-gray-600">Membres</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Channels</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Messages</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">24h</p>
                  <p className="text-sm text-gray-600">Activité</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="members">Membres</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="activity">Activité</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>À propos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">Description</h4>
                        <p className="text-gray-600">
                          {team.description || 'Aucune description disponible'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Visibilité</h4>
                        <p className="text-gray-600">
                          {team.visibility === 'public'
                            ? 'Équipe publique - Tout le monde peut rejoindre'
                            : 'Équipe privée - Sur invitation uniquement'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Capacité</h4>
                        <p className="text-gray-600">
                          {members.length} / {team.max_members || 'illimité'} membres
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Activité récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Aucune activité récente</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Members Preview */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Membres ({members.length})</CardTitle>
                        <Link to={`/teams/${slug}/members`}>
                          <Button variant="ghost" size="sm">Voir tout</Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingMembers ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <Skeleton className="h-4 flex-1" />
                            </div>
                          ))}
                        </div>
                      ) : members.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Aucun membre
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {members.slice(0, 5).map((member: any) => (
                            <MemberItem key={member.id} member={member} />
                          ))}
                          {members.length > 5 && (
                            <Link to={`/teams/${slug}/members`}>
                              <Button variant="outline" size="sm" className="w-full">
                                +{members.length - 5} autres membres
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Owner Card */}
                  {members.find((m: any) => m.role === 'owner') && (
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-600" />
                          Propriétaire
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MemberItem member={members.find((m: any) => m.role === 'owner')} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Membres de l'équipe</CardTitle>
                      <CardDescription>{members.length} membres au total</CardDescription>
                    </div>
                    {isAdmin && (
                      <Button className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Inviter
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingMembers ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <MemberItem member={member} showRole />
                          {isAdmin && member.user_id !== user?.id && (
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Channels Tab */}
            <TabsContent value="channels">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Channels</CardTitle>
                    {isAdmin && (
                      <Button className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Créer un channel
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Aucun channel</h3>
                    <p className="mb-4">Les channels permettent d'organiser les conversations</p>
                    {isAdmin && (
                      <Button>Créer le premier channel</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Journal d'activité</CardTitle>
                  <CardDescription>Historique des actions de l'équipe</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Aucune activité</h3>
                    <p>Les activités de l'équipe s'afficheront ici</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

// Member Item Component
function MemberItem({ member, showRole = false }: { member: any; showRole?: boolean }) {
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Membre';
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-3">
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
        </div>
        {showRole && (
          <p className="text-xs text-gray-500">{getRoleLabel(member.role)}</p>
        )}
        {!showRole && member.user?.email && (
          <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
        )}
      </div>
    </div>
  );
}
