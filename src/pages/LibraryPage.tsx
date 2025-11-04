import { useState } from 'react';
import { Music, Library, Heart, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MusicLibrary } from '@/components/library/MusicLibrary';
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Mes Favoris
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Vos pistes musicales favorites apparaîtront ici.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Écoutes Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Votre historique d'écoute apparaîtra ici.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="playlists">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Mes Playlists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Créez et gérez vos playlists personnalisées.
                  </p>
                </CardContent>
              </Card>
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