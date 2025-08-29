import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Music, 
  Users, 
  BarChart3,
  MessageSquare,
  Settings,
  HelpCircle,
  ArrowRight,
  Clock,
  Star,
  Zap
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  type: 'page' | 'feature' | 'content';
  icon: React.ComponentType<any>;
  isNew?: boolean;
  isPremium?: boolean;
  tags: string[];
}

const searchResults: SearchResult[] = [
  // Pages principales
  { 
    id: 'edn', 
    title: 'Items EDN', 
    description: '367 items de connaissances avec contenu immersif', 
    path: '/edn', 
    type: 'page', 
    icon: BookOpen,
    tags: ['apprentissage', 'médecine', 'items', 'edn']
  },
  { 
    id: 'generator', 
    title: 'Générateur Musical IA', 
    description: 'Créez des chansons éducatives personnalisées', 
    path: '/generator', 
    type: 'feature', 
    icon: Music,
    isPremium: true,
    tags: ['musique', 'ia', 'générateur', 'creation']
  },
  { 
    id: 'chat', 
    title: 'Assistant IA Médical', 
    description: 'Chat intelligent spécialisé en médecine', 
    path: '/chat', 
    type: 'feature', 
    icon: MessageSquare,
    isNew: true,
    tags: ['assistant', 'ia', 'chat', 'aide']
  },
  { 
    id: 'community', 
    title: 'Communauté', 
    description: 'Réseau social des étudiants en médecine', 
    path: '/community', 
    type: 'page', 
    icon: Users,
    tags: ['communauté', 'social', 'étudiants', 'partage']
  },
  { 
    id: 'analytics', 
    title: 'Analytics', 
    description: 'Analyses de performance et progression', 
    path: '/analytics', 
    type: 'page', 
    icon: BarChart3,
    tags: ['analytics', 'statistiques', 'performance', 'données']
  },
  { 
    id: 'profile', 
    title: 'Mon Profil', 
    description: 'Gérez vos informations personnelles', 
    path: '/profile', 
    type: 'page', 
    icon: Settings,
    tags: ['profil', 'compte', 'paramètres', 'personnel']
  },
  { 
    id: 'documentation', 
    title: 'Documentation', 
    description: 'Guide complet d\'utilisation', 
    path: '/documentation', 
    type: 'page', 
    icon: HelpCircle,
    tags: ['aide', 'documentation', 'guide', 'tutorial']
  },
  { 
    id: 'med-mng-dashboard', 
    title: 'Dashboard MED-MNG', 
    description: 'Interface principale de la plateforme musicale', 
    path: '/med-mng/dashboard', 
    type: 'page', 
    icon: BarChart3,
    isPremium: true,
    tags: ['dashboard', 'med-mng', 'premium', 'musique']
  }
];

export const UniversalSearchWidget: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredResults(filtered);
      setSelectedIndex(-1);
    } else {
      setFilteredResults(searchResults.slice(0, 6)); // Afficher les 6 premiers par défaut
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
        handleNavigate(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleNavigate = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Champ de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Badge className="bg-white/10 text-white/60 text-xs border-white/20">
            Ctrl+K
          </Badge>
        </div>
      </div>

      {/* Résultats de recherche */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Résultats */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-2 w-full z-50"
            >
              <Card className="bg-black/95 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                {query && (
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">
                        {filteredResults.length} résultat{filteredResults.length !== 1 ? 's' : ''}
                      </span>
                      <Badge className="bg-blue-500/20 border-blue-500/40 text-blue-300 text-xs">
                        Recherche intelligente
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Résultats */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    <div className="p-2">
                      {filteredResults.map((result, index) => {
                        const IconComponent = result.icon;
                        const isSelected = index === selectedIndex;
                        
                        return (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Button
                              variant="ghost"
                              onClick={() => handleNavigate(result)}
                              className={`w-full h-auto p-3 justify-start text-left transition-all ${
                                isSelected 
                                  ? 'bg-white/20 border-white/20' 
                                  : 'hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className={`p-2 rounded-lg ${
                                  result.type === 'page' ? 'bg-blue-500/20' :
                                  result.type === 'feature' ? 'bg-purple-500/20' :
                                  'bg-green-500/20'
                                }`}>
                                  <IconComponent className="w-4 h-4 text-white" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-white truncate">
                                      {result.title}
                                    </h4>
                                    {result.isNew && (
                                      <Badge className="bg-green-500/20 border-green-500/40 text-green-400 text-xs">
                                        Nouveau
                                      </Badge>
                                    )}
                                    {result.isPremium && (
                                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
                                        <Zap className="w-3 h-3 mr-1" />
                                        Premium
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-white/60 text-sm truncate">
                                    {result.description}
                                  </p>
                                </div>
                                
                                <ArrowRight className="w-4 h-4 text-white/40 shrink-0" />
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <h4 className="text-white/70 font-semibold mb-1">
                        Aucun résultat
                      </h4>
                      <p className="text-white/50 text-sm">
                        Essayez d'autres mots-clés
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer avec raccourcis */}
                <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">↑↓</kbd>
                        <span>naviguer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">↵</kbd>
                        <span>sélectionner</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">esc</kbd>
                      <span>fermer</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hook pour raccourci clavier global
export const useGlobalSearch = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Déclencher l'ouverture du widget de recherche
        const searchInput = document.querySelector('input[placeholder="Rechercher..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};