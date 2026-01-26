import { useState, useEffect } from 'react';
import { MusicLibraryHeader } from '@/components/edn/music/library/MusicLibraryHeader';
import { MusicLibrarySearch } from '@/components/edn/music/library/MusicLibrarySearch';
import { MusicLibraryGrid } from '@/components/edn/music/library/MusicLibraryGrid';
import { MusicLibraryEmpty } from '@/components/edn/music/library/MusicLibraryEmpty';
import { MusicLibraryLoading } from '@/components/edn/music/library/MusicLibraryLoading';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Star, Music } from 'lucide-react';

const EdnMusicLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { savedMusics, loading, playingId, handlePlay, handleDelete } = useMusicLibrary();
  const [user, setUser] = useState<any>(null);
  const { stats, loadStats } = useGamification();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadStats(user.id);
      }
    };
    checkUser();
  }, [loadStats]);

  const filteredMusics = savedMusics.filter(music =>
    music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (music.item_code && music.item_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <MusicLibraryLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning/10 via-warning/5 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Gamification Stats Banner */}
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
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-success" />
                  <span className="font-medium">{savedMusics.length} musiques</span>
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

        <MusicLibraryHeader musicCount={filteredMusics.length} />
        
        <MusicLibrarySearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {filteredMusics.length === 0 ? (
          <MusicLibraryEmpty searchTerm={searchTerm} />
        ) : (
          <MusicLibraryGrid
            musics={filteredMusics}
            playingId={playingId}
            onPlay={handlePlay}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default EdnMusicLibrary;
