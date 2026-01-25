import { useState, useEffect } from 'react';
import { Music, Library, Heart, Clock, Flame, Trophy, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MusicLibrary } from '@/components/library/MusicLibrary';
import { FavoritesTab } from '@/components/library/FavoritesTab';
import { RecentTab } from '@/components/library/RecentTab';
import { PlaylistsTab } from '@/components/library/PlaylistsTab';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('library');
  const { _stats } = useGamification();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <MedMngLayout>
      <PlayerProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 pb-20">
        <div className="container mx-auto p-6">
          {/* Gamification stats banner */}
          {user && _stats && (
            <Card className="p-4 mb-6 bg-card/80 backdrop-blur-sm border-border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-warning" />
                    <span className="font-medium">{_stats.currentStreak} jours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="font-medium">Niveau {_stats.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    <span className="font-medium">{_stats.totalPoints} XP</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {_stats.badges.filter(b => b.id.includes('music')).slice(0, 3).map(badge => (
                    <Badge key={badge.id} variant="secondary" className="bg-accent/20">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Bibliothèque
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favoris
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Récents
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library">
              <MusicLibrary />
            </TabsContent>

            <TabsContent value="favorites">
              <FavoritesTab />
            </TabsContent>

            <TabsContent value="recent">
              <RecentTab />
            </TabsContent>

            <TabsContent value="playlists">
              <PlaylistsTab />
            </TabsContent>
          </Tabs>
        </div>

          {/* Mini Player fixe en bas */}
          <MiniPlayer />
        </div>
      </PlayerProvider>
    </MedMngLayout>
  );
}
