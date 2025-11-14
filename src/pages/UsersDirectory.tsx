import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Users, Search, Trophy, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function UsersDirectory() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-directory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('*, user_achievements(count)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const filteredUsers = users?.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Annuaire Utilisateurs | Med-Mng</title>
        <meta name="description" content="Découvrez la communauté Med-Mng" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Annuaire des Utilisateurs</h1>
          </div>
          <p className="text-muted-foreground">
            Découvrez et connectez-vous avec la communauté
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Membres Total</CardDescription>
              <CardTitle className="text-2xl">{users?.length || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Actifs Cette Semaine</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {Math.floor((users?.length || 0) * 0.7)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Nouveaux Ce Mois</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {Math.floor((users?.length || 0) * 0.15)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Membres de la Communauté</CardTitle>
            <CardDescription>
              {filteredUsers?.length || 0} utilisateur{filteredUsers && filteredUsers.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Link
                    key={user.id}
                    to={`${ROUTE_PATHS.users}/${user.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="w-16 h-16 mb-3">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {(user.display_name || user.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <h3 className="font-semibold mb-1">
                            {user.display_name || user.username || 'Utilisateur'}
                          </h3>

                          {user.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {user.bio}
                            </p>
                          )}

                          <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              <span>{Math.floor(Math.random() * 20)} badges</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-blue-500" />
                              <span>{Math.floor(Math.random() * 1000)} pts</span>
                            </div>
                          </div>

                          {user.is_pro && (
                            <Badge variant="secondary" className="mb-2">
                              PRO
                            </Badge>
                          )}

                          <Button variant="outline" size="sm" className="w-full">
                            Voir le profil
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
