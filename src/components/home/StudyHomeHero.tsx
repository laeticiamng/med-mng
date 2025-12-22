import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Search,
  Play,
  BookOpen,
  Library,
  BarChart3,
  Music,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

interface StudyHomeHeroProps {
  lastItem?: {
    code: string;
    title: string;
    type: string;
  } | null;
  onSearch?: (query: string) => void;
}

export const StudyHomeHero: React.FC<StudyHomeHeroProps> = ({ lastItem, onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTE_PATHS.ednComplete}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const shortcuts = [
    {
      id: 'library',
      label: 'Bibliothèque',
      icon: Library,
      path: ROUTE_PATHS.medMngLibrary,
    },
    {
      id: 'playlists',
      label: 'Playlists',
      icon: Music,
      path: ROUTE_PATHS.medMngPlaylists || ROUTE_PATHS.medMngLibrary,
    },
    {
      id: 'progress',
      label: 'Progression',
      icon: BarChart3,
      path: ROUTE_PATHS.progressDashboard,
    },
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Main Question - Clear and Direct */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Que veux-tu réviser aujourd'hui ?
        </h1>
        <p className="text-muted-foreground text-base">
          Écoute, retiens, progresse à ton rythme.
        </p>
      </div>

      {/* Search Bar - Central and Clear */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un item, une spécialité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-14 text-base rounded-xl border-border/60 bg-card shadow-soft focus:shadow-medium focus:border-primary/40"
          />
          {searchQuery && (
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Rechercher
            </Button>
          )}
        </div>
      </form>

      {/* Resume Block - Only if there's a last item */}
      {lastItem && (
        <Card className="max-w-lg mx-auto p-4 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
          onClick={() => navigate(`${ROUTE_PATHS.medMngItemDetail.replace(':itemCode', lastItem.code)}`)}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Reprendre ma révision
              </p>
              <p className="font-medium text-foreground truncate">
                {lastItem.code} — {lastItem.title}
              </p>
              <p className="text-sm text-muted-foreground">{lastItem.type}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Card>
      )}

      {/* Primary CTA */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="h-14 px-8 text-base font-medium shadow-soft hover:shadow-medium"
          onClick={() => navigate(ROUTE_PATHS.ednComplete)}
        >
          <Play className="h-5 w-5 mr-2" />
          Lancer une session
        </Button>
      </div>

      {/* Quick Shortcuts - Sober */}
      <div className="flex justify-center gap-3 flex-wrap">
        {shortcuts.map((shortcut) => (
          <Button
            key={shortcut.id}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 h-10 px-4"
            onClick={() => navigate(shortcut.path)}
          >
            <shortcut.icon className="h-4 w-4 mr-2" />
            {shortcut.label}
          </Button>
        ))}
      </div>

      {/* Reassurance - Subtle */}
      <p className="text-center text-sm text-muted-foreground/70 max-w-md mx-auto">
        La régularité fait la différence. Quelques minutes par jour valent mieux qu'un marathon.
      </p>
    </div>
  );
};

export default StudyHomeHero;
