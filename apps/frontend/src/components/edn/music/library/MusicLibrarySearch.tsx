
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MusicLibrarySearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const MusicLibrarySearch = ({ searchTerm, onSearchChange }: MusicLibrarySearchProps) => {
  return (
    <div className="mb-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher une musique..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
