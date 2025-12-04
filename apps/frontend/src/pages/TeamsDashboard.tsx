import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Search,
  Globe,
  Lock,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFetchUserTeams, useSearchTeams } from '@/hooks/useTeams';
import { useToast } from '@/hooks/use-toast';

export default function TeamsDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-teams' | 'discover'>('my-teams');

  // Fetch user's teams
  const { data: myTeams = [], isLoading: loadingMyTeams } = useFetchUserTeams(user?.id || '');

  // Search public teams (only when in discover tab and has query)
  const { data: searchResults = [], isLoading: searching } = useSearchTeams(
    searchQuery,
    'public'
  );

  const teamsToShow = activeTab === 'my-teams' ? myTeams : searchQuery.length > 2 ? searchResults : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
            <CardDescription>Connectez-vous pour accéder aux équipes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/med-mng/login">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mes Équipes | Med-Mng</title>
        <meta name="description" content="Gérez vos équipes et collaborez avec d'autres étudiants en médecine" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-500/5 dark:from-primary/10 dark:via-background dark:to-purple-500/10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Équipes</h1>
              <p className="text-muted-foreground">Collaborez avec d'autres étudiants et apprenez ensemble</p>
            </div>
            <Link to="/teams/create">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Créer une équipe
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mes Équipes</p>
                    <p className="text-3xl font-bold text-primary">{myTeams.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Membres Total</p>
                    <p className="text-3xl font-bold text-success">
                      {myTeams.reduce((acc, team: any) => acc + (team.member_count || 0), 0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Activité Récente</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">24h</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="my-teams" className="gap-2">
                <Users className="h-4 w-4" />
                Mes Équipes
              </TabsTrigger>
              <TabsTrigger value="discover" className="gap-2">
                <Star className="h-4 w-4" />
                Découvrir
              </TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            {activeTab === 'discover' && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Rechercher des équipes publiques..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <TabsContent value="my-teams" className="mt-0">
              {loadingMyTeams ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : myTeams.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Aucune équipe pour le moment
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Créez votre première équipe ou rejoignez une équipe existante
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Link to="/teams/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer une équipe
                        </Button>
                      </Link>
                      <Button variant="outline" onClick={() => setActiveTab('discover')}>
                        Découvrir des équipes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTeams.map((team: any) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="discover" className="mt-0">
              {searchQuery.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Recherchez des équipes
                    </h3>
                    <p className="text-muted-foreground">
                      Utilisez la barre de recherche pour trouver des équipes publiques
                    </p>
                  </CardContent>
                </Card>
              ) : searching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Aucune équipe trouvée
                    </h3>
                    <p className="text-muted-foreground">
                      Essayez avec d'autres mots-clés ou créez votre propre équipe
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((team: any) => (
                    <TeamCard key={team.id} team={team} isPublic />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

// Team Card Component
function TeamCard({ team, isPublic = false }: { team: any; isPublic?: boolean }) {
  return (
    <Link to={`/teams/${team.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{team.name}</CardTitle>
            </div>
            <Badge variant={team.visibility === 'public' ? 'default' : 'secondary'} className="ml-2">
              {team.visibility === 'public' ? (
                <><Globe className="h-3 w-3 mr-1" /> Public</>
              ) : (
                <><Lock className="h-3 w-3 mr-1" /> Privé</>
              )}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {team.description || 'Aucune description'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{team.member_count || 0} membres</span>
            </div>
            {!isPublic && team.role && (
              <Badge variant="outline" className="text-xs">
                {team.role === 'owner' ? 'Propriétaire' : team.role === 'admin' ? 'Admin' : 'Membre'}
              </Badge>
            )}
          </div>
          {team.created_at && (
            <div className="mt-3 text-xs text-muted-foreground/70">
              Créé le {new Date(team.created_at).toLocaleDateString('fr-FR')}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
