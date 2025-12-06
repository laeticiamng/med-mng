import { useState } from 'react';
import { Music, Library, Heart, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MusicLibrary } from '@/components/library/MusicLibrary';
import { FavoritesTab } from '@/components/library/FavoritesTab';
import { RecentTab } from '@/components/library/RecentTab';
import { PlaylistsTab } from '@/components/library/PlaylistsTab';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('library');

  return (
    <MedMngLayout>
      <PlayerProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 pb-20">
        <div className="container mx-auto p-6">
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