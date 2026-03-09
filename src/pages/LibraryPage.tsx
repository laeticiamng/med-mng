import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Music, Library, Heart, Clock, Flame, Trophy, Star, BookOpen, Wand2, Brain, GraduationCap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MusicLibrary } from '@/components/library/MusicLibrary';
import { MedicalContentLibrary } from '@/components/library/MedicalContentLibrary';
import { CreatorStudio } from '@/components/library/CreatorStudio';
import { MemoryAnalytics } from '@/components/library/MemoryAnalytics';
import { DPCCertification } from '@/components/library/DPCCertification';
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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'content');
  const { stats } = useGamification();
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
          {user && stats && (
            <Card className="p-4 mb-6 bg-card/80 backdrop-blur-sm border-border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-warning" />
                    <span className="font-medium">{stats.currentStreak} jours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="font-medium">Niveau {stats.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    <span className="font-medium">{stats.totalPoints} XP</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {stats.badges.filter(b => b.id.includes('music')).slice(0, 3).map(badge => (
                    <Badge key={badge.id} variant="secondary" className="bg-accent/20">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="overflow-x-auto -mx-2 px-2">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-8 gap-1">
                <TabsTrigger value="content" className="flex items-center gap-1.5 text-xs">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Catalogue</span>
                </TabsTrigger>
                <TabsTrigger value="creator" className="flex items-center gap-1.5 text-xs">
                  <Wand2 className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Studio</span>
                </TabsTrigger>
                <TabsTrigger value="memory" className="flex items-center gap-1.5 text-xs">
                  <Brain className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Mémoire</span>
                </TabsTrigger>
                <TabsTrigger value="dpc" className="flex items-center gap-1.5 text-xs">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">DPC</span>
                </TabsTrigger>
                <TabsTrigger value="library" className="flex items-center gap-1.5 text-xs">
                  <Library className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Biblio</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-1.5 text-xs">
                  <Heart className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Favoris</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Récents</span>
                </TabsTrigger>
                <TabsTrigger value="playlists" className="flex items-center gap-1.5 text-xs">
                  <Music className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Playlists</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="content">
              <MedicalContentLibrary />
            </TabsContent>

            <TabsContent value="creator">
              <CreatorStudio />
            </TabsContent>

            <TabsContent value="memory">
              <MemoryAnalytics />
            </TabsContent>

            <TabsContent value="dpc">
              <DPCCertification />
            </TabsContent>

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
