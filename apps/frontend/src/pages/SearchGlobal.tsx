import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Search, FileText, Calendar, MessageSquare, Users, TrendingUp, Filter, Bookmark, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

type SearchCategory = 'all' | 'edn' | 'events' | 'posts' | 'users';

interface SearchResult {
  id: string;
  type: 'edn' | 'event' | 'post' | 'user';
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

export default function GlobalSearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [savedSearches, setSavedSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search EDN items
  const { data: ednResults = [], isLoading: ednLoading } = useQuery({
    queryKey: ['search-edn', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('edn_items')
        .select('id, title, question, item_number, rang')
        .or(`title.ilike.%${debouncedSearch}%,question.ilike.%${debouncedSearch}%`)
        .limit(10);

      if (error) throw error;

      return data.map((item): SearchResult => ({
        id: item.id,
        type: 'edn',
        title: `Item ${item.item_number}: ${item.title || 'Sans titre'}`,
        description: item.question?.substring(0, 150),
        url: `/edn-complete/${item.id}`,
        metadata: { rang: item.rang, itemNumber: item.item_number }
      }));
    },
    enabled: (category === 'all' || category === 'edn') && debouncedSearch.length >= 2
  });

  // Search Events
  const { data: eventResults = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['search-events', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, start_date, location')
        .or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)
        .limit(10);

      if (error) throw error;

      return data.map((event): SearchResult => ({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description?.substring(0, 150),
        url: `/events/${event.id}`,
        metadata: { startDate: event.start_date, location: event.location }
      }));
    },
    enabled: (category === 'all' || category === 'events') && debouncedSearch.length >= 2
  });

  // Search Posts
  const { data: postResults = [], isLoading: postsLoading } = useQuery({
    queryKey: ['search-posts', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, created_at')
        .or(`title.ilike.%${debouncedSearch}%,content.ilike.%${debouncedSearch}%`)
        .limit(10);

      if (error) throw error;

      return data.map((post): SearchResult => ({
        id: post.id,
        type: 'post',
        title: post.title,
        description: post.content?.substring(0, 150),
        url: `/posts/${post.id}`,
        metadata: { createdAt: post.created_at }
      }));
    },
    enabled: (category === 'all' || category === 'posts') && debouncedSearch.length >= 2
  });

  // Search Users
  const { data: userResults = [], isLoading: usersLoading } = useQuery({
    queryKey: ['search-users', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${debouncedSearch}%,full_name.ilike.%${debouncedSearch}%`)
        .limit(10);

      if (error) throw error;

      return data.map((profile): SearchResult => ({
        id: profile.id,
        type: 'user',
        title: profile.full_name || profile.username || 'Utilisateur',
        description: profile.username ? `@${profile.username}` : undefined,
        url: `/users/${profile.id}`,
        metadata: { avatarUrl: profile.avatar_url }
      }));
    },
    enabled: (category === 'all' || category === 'users') && debouncedSearch.length >= 2
  });

  const allResults = [
    ...ednResults,
    ...eventResults,
    ...postResults,
    ...userResults
  ];

  const isLoading = ednLoading || eventsLoading || postsLoading || usersLoading;

  const saveSearch = () => {
    if (!searchQuery || savedSearches.includes(searchQuery)) return;
    const updated = [searchQuery, ...savedSearches].slice(0, 10);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const removeSavedSearch = (query: string) => {
    const updated = savedSearches.filter(s => s !== query);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'edn': return FileText;
      case 'event': return Calendar;
      case 'post': return MessageSquare;
      case 'user': return Users;
      default: return FileText;
    }
  };

  const ResultCard = ({ result }: { result: SearchResult }) => {
    const Icon = getResultIcon(result.type);

    return (
      <Link to={result.url}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold line-clamp-1">{result.title}</h3>
                  <Badge variant="outline" className="flex-shrink-0">
                    {result.type === 'edn' ? 'EDN' :
                     result.type === 'event' ? 'Événement' :
                     result.type === 'post' ? 'Post' : 'Utilisateur'}
                  </Badge>
                </div>
                {result.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.description}
                  </p>
                )}
                {result.metadata && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {result.type === 'edn' && result.metadata.rang && (
                      <span>Rang {result.metadata.rang}</span>
                    )}
                    {result.type === 'event' && result.metadata.startDate && (
                      <span>{new Date(result.metadata.startDate).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <>
      <Helmet>
        <title>Recherche Globale | Med-Mng</title>
        <meta name="description" content="Recherchez dans tout Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">Recherche Globale</h1>
                <p className="text-muted-foreground mt-1">
                  Recherchez dans tout Med-Mng : items EDN, événements, posts et utilisateurs
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-lg h-12"
                    autoFocus
                  />
                </div>
                <Select value={category} onValueChange={(v) => setCategory(v as SearchCategory)}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout</SelectItem>
                    <SelectItem value="edn">Items EDN</SelectItem>
                    <SelectItem value="events">Événements</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="users">Utilisateurs</SelectItem>
                  </SelectContent>
                </Select>
                {searchQuery && (
                  <Button onClick={saveSearch} variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Saved Searches */}
          {savedSearches.length > 0 && !searchQuery && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Recherches sauvegardées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {savedSearches.map((saved) => (
                    <Badge
                      key={saved}
                      variant="secondary"
                      className="cursor-pointer px-3 py-1.5"
                    >
                      <button
                        onClick={() => setSearchQuery(saved)}
                        className="mr-2"
                      >
                        {saved}
                      </button>
                      <button
                        onClick={() => removeSavedSearch(saved)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {debouncedSearch.length < 2 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Commencez votre recherche</h3>
                <p className="text-muted-foreground">
                  Tapez au moins 2 caractères pour commencer la recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={category} onValueChange={(v) => setCategory(v as SearchCategory)}>
              <TabsList className="grid w-full max-w-2xl grid-cols-5">
                <TabsTrigger value="all">Tout ({allResults.length})</TabsTrigger>
                <TabsTrigger value="edn">EDN ({ednResults.length})</TabsTrigger>
                <TabsTrigger value="events">Événements ({eventResults.length})</TabsTrigger>
                <TabsTrigger value="posts">Posts ({postResults.length})</TabsTrigger>
                <TabsTrigger value="users">Utilisateurs ({userResults.length})</TabsTrigger>
              </TabsList>

              <TabsContent value={category} className="mt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i}>
                        <CardContent className="py-4">
                          <div className="flex gap-3">
                            <Skeleton className="h-12 w-12 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {category === 'all' && allResults.length > 0 && (
                      <div className="space-y-4">
                        {allResults.map((result) => (
                          <ResultCard key={`${result.type}-${result.id}`} result={result} />
                        ))}
                      </div>
                    )}
                    {category === 'edn' && ednResults.length > 0 && (
                      <div className="space-y-4">
                        {ednResults.map((result) => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}
                    {category === 'events' && eventResults.length > 0 && (
                      <div className="space-y-4">
                        {eventResults.map((result) => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}
                    {category === 'posts' && postResults.length > 0 && (
                      <div className="space-y-4">
                        {postResults.map((result) => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}
                    {category === 'users' && userResults.length > 0 && (
                      <div className="space-y-4">
                        {userResults.map((result) => (
                          <ResultCard key={result.id} result={result} />
                        ))}
                      </div>
                    )}
                    {((category === 'all' && allResults.length === 0) ||
                      (category === 'edn' && ednResults.length === 0) ||
                      (category === 'events' && eventResults.length === 0) ||
                      (category === 'posts' && postResults.length === 0) ||
                      (category === 'users' && userResults.length === 0)) && (
                      <Card>
                        <CardContent className="text-center py-16">
                          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Aucun résultat trouvé</h3>
                          <p className="text-muted-foreground">
                            Essayez avec d'autres mots-clés ou filtres
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Quick Links */}
          <div className="mt-8 flex justify-center gap-4">
            <Link to={ROUTE_PATHS.advancedSearch}>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Recherche avancée
              </Button>
            </Link>
            <Link to={ROUTE_PATHS.searchSaved}>
              <Button variant="outline">
                <Bookmark className="h-4 w-4 mr-2" />
                Recherches sauvegardées
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
