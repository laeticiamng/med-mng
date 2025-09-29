import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bookmark, BookmarkCheck, Heart, Star, 
  Share2, Download, Eye, Clock, Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookmarkItem {
  id: string;
  title: string;
  type: 'edn' | 'ecos' | 'music' | 'quiz';
  category: string;
  description: string;
  rating: number;
  duration: number;
  savedAt: Date;
  tags: string[];
  thumbnail?: string;
  progress?: number;
}

interface BookmarkSystemProps {
  itemId?: string;
  itemType?: 'edn' | 'ecos' | 'music' | 'quiz';
  itemTitle?: string;
  itemCategory?: string;
  itemDescription?: string;
  showBookmarksList?: boolean;
}

export const BookmarkSystem: React.FC<BookmarkSystemProps> = ({
  itemId,
  itemType,
  itemTitle,
  itemCategory,
  itemDescription,
  showBookmarksList = false
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [filter, setFilter] = useState<'all' | 'edn' | 'ecos' | 'music' | 'quiz'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (itemId) {
      setIsBookmarked(bookmarks.some(bookmark => bookmark.id === itemId));
    }
  }, [itemId, bookmarks]);

  const loadBookmarks = () => {
    const saved = localStorage.getItem('user-bookmarks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBookmarks(parsed.map((item: any) => ({
        ...item,
        savedAt: new Date(item.savedAt)
      })));
    }
  };

  const saveBookmarks = (newBookmarks: BookmarkItem[]) => {
    localStorage.setItem('user-bookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  };

  const handleBookmarkToggle = () => {
    if (!itemId || !itemTitle || !itemType) return;

    if (isBookmarked) {
      // Retirer des favoris
      const updated = bookmarks.filter(bookmark => bookmark.id !== itemId);
      saveBookmarks(updated);
      setIsBookmarked(false);
      toast({
        title: "Retiré des favoris",
        description: `${itemTitle} a été retiré de vos favoris`,
      });
    } else {
      // Ajouter aux favoris
      const newBookmark: BookmarkItem = {
        id: itemId,
        title: itemTitle,
        type: itemType,
        category: itemCategory || 'Général',
        description: itemDescription || '',
        rating: 4.5, // Default rating
        duration: 30, // Default duration
        savedAt: new Date(),
        tags: [itemCategory || 'général']
      };

      const updated = [newBookmark, ...bookmarks];
      saveBookmarks(updated);
      setIsBookmarked(true);
      toast({
        title: "Ajouté aux favoris",
        description: `${itemTitle} a été ajouté à vos favoris`,
      });
    }
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    const updated = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    saveBookmarks(updated);
    toast({
      title: "Favori supprimé",
      description: "L'élément a été retiré de vos favoris",
    });
  };

  const handleShare = async (bookmark: BookmarkItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: bookmark.title,
          text: bookmark.description,
          url: window.location.origin + `/content/${bookmark.id}`
        });
      } catch (error) {
        // Fallback to copy to clipboard
        handleCopyLink(bookmark);
      }
    } else {
      handleCopyLink(bookmark);
    }
  };

  const handleCopyLink = (bookmark: BookmarkItem) => {
    const url = window.location.origin + `/content/${bookmark.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Lien copié",
      description: "Le lien a été copié dans le presse-papier",
    });
  };

  const getTypeIcon = (type: BookmarkItem['type']) => {
    switch (type) {
      case 'edn': return '📚';
      case 'ecos': return '🏥';
      case 'music': return '🎵';
      case 'quiz': return '❓';
      default: return '📄';
    }
  };

  const getTypeColor = (type: BookmarkItem['type']) => {
    switch (type) {
      case 'edn': return 'bg-blue-100 text-blue-800';
      case 'ecos': return 'bg-green-100 text-green-800';
      case 'music': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookmarks = filter === 'all' 
    ? bookmarks 
    : bookmarks.filter(bookmark => bookmark.type === filter);

  // Bouton de favori simple
  if (!showBookmarksList) {
    return (
      <Button
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
        onClick={handleBookmarkToggle}
        className="flex items-center gap-2"
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        {isBookmarked ? 'Favori' : 'Ajouter aux favoris'}
      </Button>
    );
  }

  // Liste complète des favoris
  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Mes Favoris</h2>
          <p className="text-muted-foreground">
            {bookmarks.length} élément{bookmarks.length > 1 ? 's' : ''} sauvegardé{bookmarks.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {(['all', 'edn', 'ecos', 'music', 'quiz'] as const).map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
                className="capitalize"
              >
                {type === 'all' ? 'Tous' : type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des favoris */}
      {filteredBookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun favori trouvé</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "Commencez à ajouter des contenus à vos favoris pour les retrouver ici"
                : `Aucun contenu de type "${filter}" dans vos favoris`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(bookmark.type)}</span>
                    <Badge variant="secondary" className={getTypeColor(bookmark.type)}>
                      {bookmark.type.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBookmark(bookmark.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg line-clamp-2">{bookmark.title}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {bookmark.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {bookmark.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {bookmark.duration} min
                  </span>
                  <span>{bookmark.category}</span>
                </div>

                {bookmark.progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progression</span>
                      <span>{bookmark.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${bookmark.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button variant="default" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare(bookmark)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  Ajouté le {bookmark.savedAt.toLocaleDateString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};