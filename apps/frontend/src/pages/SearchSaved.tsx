import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Bookmark, Search, Trash2, Clock, ArrowRight, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SavedSearch {
  query: string;
  timestamp: number;
  category?: string;
}

export default function SearchSaved() {
  const navigate = useNavigate();
  const [searchFilter, setSearchFilter] = useState('');
  const [deleteConfirmQuery, setDeleteConfirmQuery] = useState<string | null>(null);

  // Load saved searches from localStorage
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    const saved = localStorage.getItem('savedSearches');
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      // Convert old format (string[]) to new format (SavedSearch[])
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          return parsed.map(query => ({
            query,
            timestamp: Date.now(),
          }));
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const filteredSearches = savedSearches.filter(search =>
    search.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const removeSavedSearch = (query: string) => {
    const updated = savedSearches.filter(s => s.query !== query);
    setSavedSearches(updated);
    // Save both old format and new format for compatibility
    localStorage.setItem('savedSearches', JSON.stringify(updated.map(s => s.query)));
    localStorage.setItem('savedSearchesData', JSON.stringify(updated));
    setDeleteConfirmQuery(null);
  };

  const clearAllSearches = () => {
    setSavedSearches([]);
    localStorage.removeItem('savedSearches');
    localStorage.removeItem('savedSearchesData');
  };

  const executeSearch = (query: string) => {
    navigate(`${ROUTE_PATHS.globalSearch}?q=${encodeURIComponent(query)}`);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure${Math.floor(diffInHours) > 1 ? 's' : ''}`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Recherches Sauvegardées | Med-Mng</title>
        <meta name="description" content="Accédez rapidement à vos recherches sauvegardées" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bookmark className="h-10 w-10 text-primary" />
                <div>
                  <h1 className="text-4xl font-bold">Recherches Sauvegardées</h1>
                  <p className="text-muted-foreground mt-1">
                    Accédez rapidement à vos recherches fréquentes
                  </p>
                </div>
              </div>
              {savedSearches.length > 0 && (
                <AlertDialog>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const dialog = document.getElementById('clear-all-dialog');
                      if (dialog) dialog.click();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Tout supprimer
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer toutes les recherches ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes vos recherches sauvegardées seront supprimées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAllSearches}>
                        Supprimer tout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Search Filter */}
          {savedSearches.length > 5 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrer les recherches sauvegardées..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Searches List */}
          {savedSearches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Aucune recherche sauvegardée</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par effectuer une recherche et sauvegardez-la pour y accéder rapidement plus tard
                </p>
                <Link to={ROUTE_PATHS.globalSearch}>
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher maintenant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {filteredSearches.map((search) => (
                  <Card
                    key={search.query}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Search className="h-5 w-5 text-primary" />
                        </div>
                        <button
                          onClick={() => executeSearch(search.query)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-lg">{search.query}</h3>
                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(search.timestamp)}</span>
                            {search.category && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary" className="text-xs">
                                  {search.category}
                                </Badge>
                              </>
                            )}
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmQuery(search.query);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredSearches.length === 0 && searchFilter && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-semibold mb-2">Aucune recherche trouvée</h3>
                    <p className="text-muted-foreground text-sm">
                      Aucune recherche sauvegardée ne correspond à "{searchFilter}"
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{savedSearches.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cette semaine</p>
                      <p className="text-2xl font-bold">
                        {savedSearches.filter(s =>
                          (Date.now() - s.timestamp) < 7 * 24 * 60 * 60 * 1000
                        ).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                      <p className="text-2xl font-bold">
                        {savedSearches.filter(s =>
                          new Date(s.timestamp).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Quick Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <Link to={ROUTE_PATHS.globalSearch}>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Nouvelle recherche
              </Button>
            </Link>
            <Link to={ROUTE_PATHS.advancedSearch}>
              <Button variant="outline">
                Recherche avancée
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmQuery} onOpenChange={(open) => !open && setDeleteConfirmQuery(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette recherche ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer la recherche "{deleteConfirmQuery}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmQuery && removeSavedSearch(deleteConfirmQuery)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
