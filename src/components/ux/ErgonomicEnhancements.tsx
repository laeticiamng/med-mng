import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, 
  Keyboard, 
  MousePointer, 
  Zap, 
  Eye,
  ChevronDown,
  Settings,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ErgonomicEnhancementsProps {
  page: string;
  showQuickActions?: boolean;
  showScrollToTop?: boolean;
  showKeyboardHints?: boolean;
  showFocusMode?: boolean;
}

export const ErgonomicEnhancements: React.FC<ErgonomicEnhancementsProps> = ({
  page,
  showQuickActions = true,
  showScrollToTop = true,
  showKeyboardHints = true,
  showFocusMode = true
}) => {
  const { toast } = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);

  // Gestion du scroll to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    if (showScrollToTop) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showScrollToTop]);

  // Raccourcis clavier contextuels par page
  const getKeyboardShortcuts = () => {
    const baseShortcuts = [
      { key: '?', description: 'Afficher l\'aide', action: () => showKeyboardHelp() },
      { key: 'Échap', description: 'Fermer les modales', action: () => handleEscape() },
      { key: '⌘+K', description: 'Recherche rapide', action: () => focusSearch() },
      { key: 'F', description: 'Mode focus', action: () => toggleFocusMode() }
    ];

    const pageShortcuts: Record<string, Array<{key: string, description: string, action: () => void}>> = {
      'edn': [
        { key: '/', description: 'Rechercher items', action: () => focusSearch() },
        { key: 'N', description: 'Nouvel item', action: () => createNewItem() },
        { key: 'G', description: 'Grille/Liste', action: () => toggleViewMode() }
      ],
      'ecos': [
        { key: 'S', description: 'Démarrer simulation', action: () => startSimulation() },
        { key: 'F', description: 'Filtres rapides', action: () => toggleFilters() },
        { key: 'R', description: 'Résultats', action: () => showResults() }
      ],
      'audit': [
        { key: 'E', description: 'Exporter rapport', action: () => exportReport() },
        { key: 'R', description: 'Actualiser données', action: () => refreshData() },
        { key: 'Tab', description: 'Onglet suivant', action: () => nextTab() }
      ],
      'generator': [
        { key: 'Space', description: 'Play/Pause', action: () => togglePlayback() },
        { key: 'G', description: 'Générer musique', action: () => generateMusic() },
        { key: 'S', description: 'Sauvegarder', action: () => saveGeneration() }
      ]
    };

    return [...baseShortcuts, ...(pageShortcuts[page] || [])];
  };

  // Actions des raccourcis
  const showKeyboardHelp = () => {
    toast({
      title: "🎹 Raccourcis clavier",
      description: `${getKeyboardShortcuts().length} raccourcis disponibles pour ${page}`,
    });
  };

  const handleEscape = () => {
    // Fermer les modales ouvertes
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };

  const focusSearch = () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="recherch"], input[placeholder*="Recherch"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    toast({
      title: focusMode ? "Mode focus désactivé" : "Mode focus activé",
      description: focusMode ? "Interface complète restaurée" : "Distractions masquées"
    });
  };

  const createNewItem = () => toast({ title: "Créer un nouvel item", description: "Fonctionnalité à implémenter" });
  const toggleViewMode = () => toast({ title: "Basculer mode d'affichage", description: "Grille ↔ Liste" });
  const startSimulation = () => toast({ title: "Démarrer simulation", description: "Lancement de la simulation ECOS" });
  const toggleFilters = () => toast({ title: "Filtres rapides", description: "Affichage des filtres" });
  const showResults = () => toast({ title: "Afficher les résultats", description: "Navigation vers résultats" });
  const exportReport = () => toast({ title: "Export rapport", description: "Téléchargement en cours..." });
  const refreshData = () => toast({ title: "Actualisation", description: "Données mises à jour" });
  const nextTab = () => toast({ title: "Onglet suivant", description: "Navigation par onglets" });
  const togglePlayback = () => toast({ title: "Lecture/Pause", description: "Contrôle du lecteur" });
  const generateMusic = () => toast({ title: "Génération musicale", description: "Création en cours..." });
  const saveGeneration = () => toast({ title: "Sauvegarde", description: "Génération sauvegardée" });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      
      const shortcuts = getKeyboardShortcuts();
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === e.key.toLowerCase() || 
        (s.key === 'Space' && e.code === 'Space')
      );
      
      if (shortcut && !isInputFocused()) {
        e.preventDefault();
        shortcut.action();
      }
    };

    const isInputFocused = () => {
      const activeElement = document.activeElement;
      return activeElement?.tagName === 'INPUT' || 
             activeElement?.tagName === 'TEXTAREA' || 
             activeElement?.hasAttribute('contenteditable');
    };

    if (showKeyboardHints) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [page, showKeyboardHints]);

  return (
    <>
      {/* Mode Focus Overlay */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 pointer-events-none"
            style={{ 
              maskImage: 'radial-gradient(circle at center, transparent 300px, black 500px)',
              WebkitMaskImage: 'radial-gradient(circle at center, transparent 300px, black 500px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 50 }}
            className={cn(
              "fixed right-4 bottom-4 z-50 flex flex-col gap-2",
              isCompactView ? "right-2 bottom-2" : "right-4 bottom-4"
            )}
          >
            {/* Scroll to Top */}
            {showScrollTop && showScrollToTop && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={scrollToTop}
                  size="icon"
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 text-white border-0"
                  aria-label="Retourner en haut de la page"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Quick Actions Panel */}
            {showQuickActions && (
              <motion.div
                className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col gap-2">
                  {/* Focus Mode Toggle */}
                  <Button
                    onClick={toggleFocusMode}
                    size="icon"
                    variant={focusMode ? "default" : "ghost"}
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all",
                      focusMode ? "bg-purple-600 text-white shadow-lg" : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                    aria-label={focusMode ? "Désactiver le mode focus" : "Activer le mode focus"}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Sound Toggle */}
                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                    aria-label={soundEnabled ? "Désactiver les sons" : "Activer les sons"}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>

                  {/* Compact View Toggle */}
                  <Button
                    onClick={() => setIsCompactView(!isCompactView)}
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                    aria-label={isCompactView ? "Vue normale" : "Vue compacte"}
                  >
                    {isCompactView ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>

                  {/* Keyboard Shortcuts Help */}
                  {showKeyboardHints && (
                    <Button
                      onClick={showKeyboardHelp}
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                      aria-label="Afficher les raccourcis clavier"
                    >
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Hide Panel */}
                  <Button
                    onClick={() => setIsVisible(false)}
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="Masquer le panneau d'actions rapides"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Panel Button (when hidden) */}
      {!isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed right-4 bottom-4 z-50"
        >
          <Button
            onClick={() => setIsVisible(true)}
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 text-white border-0"
            aria-label="Afficher le panneau d'actions rapides"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </motion.div>
      )}

      {/* Contextual Hints */}
      <AnimatePresence>
        {showKeyboardHints && !focusMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 z-40 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-xl max-w-xs"
          >
            <div className="text-white/80 text-xs space-y-1">
              <p className="font-medium mb-2">Raccourcis pour {page}</p>
              {getKeyboardShortcuts().slice(0, 3).map((shortcut, index) => (
                <div key={index} className="flex justify-between">
                  <span>{shortcut.key}</span>
                  <span>{shortcut.description}</span>
                </div>
              ))}
              <p className="text-white/60 text-xs mt-2">Appuyez sur ? pour plus d'aide</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};