
import { useState } from 'react';
import { MusicLibraryHeader } from '@/components/edn/music/library/MusicLibraryHeader';
import { MusicLibrarySearch } from '@/components/edn/music/library/MusicLibrarySearch';
import { MusicLibraryGrid } from '@/components/edn/music/library/MusicLibraryGrid';
import { MusicLibraryEmpty } from '@/components/edn/music/library/MusicLibraryEmpty';
import { MusicLibraryLoading } from '@/components/edn/music/library/MusicLibraryLoading';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Music } from 'lucide-react';

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
    <ConsistentBackground variant="tertiary">
      <PageHeader
        title="Bibliothèque Musicale EDN"
        subtitle={`${filteredMusics.length} création${filteredMusics.length > 1 ? 's' : ''} musicale${filteredMusics.length > 1 ? 's' : ''} éducative${filteredMusics.length > 1 ? 's' : ''}`}
        icon={Music}
        showBackButton
        backTo="/edn"
      />
      
      <div className="container mx-auto px-4 py-8">
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
    </ConsistentBackground>
  );
};

export default EdnMusicLibrary;
