
import { useState } from 'react';
import { MusicLibraryHeader } from '@/components/edn/music/library/MusicLibraryHeader';
import { MusicLibrarySearch } from '@/components/edn/music/library/MusicLibrarySearch';
import { MusicLibraryGrid } from '@/components/edn/music/library/MusicLibraryGrid';
import { MusicLibraryEmpty } from '@/components/edn/music/library/MusicLibraryEmpty';
import { MusicLibraryLoading } from '@/components/edn/music/library/MusicLibraryLoading';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';

const EdnMusicLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { savedMusics, loading, playingId, handlePlay, handleDelete } = useMusicLibrary();

  const filteredMusics = savedMusics.filter(music =>
    music.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (music.item_code && music.item_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <MusicLibraryLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
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
