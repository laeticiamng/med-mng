import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Command } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category: string;
}

export const KeyboardShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = [
    // Navigation
    { key: 'h', description: 'Aller à l\'accueil', action: () => navigate('/'), category: 'Navigation' },
    { key: 'd', description: 'Dashboard', action: () => navigate('/dashboard'), category: 'Navigation' },
    { key: 'e', description: 'Items EDN', action: () => navigate('/edn-complete'), category: 'Navigation' },
    { key: 'g', description: 'Générateur musical', action: () => navigate('/generator'), category: 'Navigation' },
    { key: 'c', description: 'Chat IA', action: () => navigate('/chat'), category: 'Navigation' },
    
    // Actions
    { key: 's', description: 'Rechercher', action: () => focusSearchInput(), category: 'Actions' },
    { key: 'n', description: 'Nouveau contenu', action: () => navigate('/generator'), category: 'Actions' },
    { key: 'f', description: 'Mes favoris', action: () => navigate('/favorites'), category: 'Actions' },
    { key: 'a', description: 'Achievements', action: () => navigate('/achievements'), category: 'Actions' },
    
    // Interface
    { key: '?', description: 'Afficher cette aide', action: () => setShowHelp(true), category: 'Interface' },
    { key: 'Escape', description: 'Fermer les dialogues', action: () => closeModals(), category: 'Interface' },
  ];

  const focusSearchInput = () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="recherch"], input[placeholder*="Recherch"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      toast.success('Zone de recherche activée');
    } else {
      toast.info('Pas de zone de recherche sur cette page');
    }
  };

  const closeModals = () => {
    // Fermer les dialogues ouverts
    const closeButtons = document.querySelectorAll('[data-radix-dialog-close]');
    closeButtons.forEach(button => (button as HTMLElement).click());
    
    // Fermer le help aussi
    setShowHelp(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer les raccourcis si un input est focus
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'INPUT' || 
          activeElement?.tagName === 'TEXTAREA' || 
          activeElement?.hasAttribute('contenteditable')) {
        return;
      }

      // Vérifier si Ctrl/Cmd est pressé pour les raccourcis système
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      const shortcut = shortcuts.find(s => s.key.toLowerCase() === event.key.toLowerCase());
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
        
        // Feedback visuel
        if (shortcut.key !== '?' && shortcut.key !== 'Escape') {
          toast.success(`Raccourci: ${shortcut.description}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {/* Bouton d'aide en floating */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 bg-white shadow-lg"
        onClick={() => setShowHelp(true)}
      >
        <Keyboard className="w-4 h-4 mr-2" />
        Raccourcis
      </Button>

      {/* Dialog d'aide */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="w-5 h-5" />
              Raccourcis Clavier
            </DialogTitle>
            <DialogDescription>
              Utilisez ces raccourcis pour naviguer plus rapidement dans MED MNG
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono">
                        {shortcut.key === ' ' ? 'Space' : shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Astuce :</strong> Ces raccourcis ne fonctionnent que lorsque vous n'êtes pas en train de taper dans un champ de texte.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};