import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Keyboard, Search, Music, BookOpen, BarChart3, Home, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
    action?: () => void;
  }[];
}

export const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Ouvrir la recherche rapide' },
        { keys: ['G', 'H'], description: 'Aller à l\'accueil', action: () => navigate(ROUTE_PATHS.home) },
        { keys: ['G', 'M'], description: 'Aller au générateur musical', action: () => navigate(ROUTE_PATHS.generator) },
        { keys: ['G', 'E'], description: 'Aller à EDN', action: () => navigate(ROUTE_PATHS.ednComplete) },
        { keys: ['G', 'D'], description: 'Aller au dashboard', action: () => navigate(ROUTE_PATHS.dashboard) },
      ]
    },
    {
      title: 'Interface',
      shortcuts: [
        { keys: ['?'], description: 'Afficher les raccourcis clavier' },
        { keys: ['Ctrl', '/'], description: 'Basculer le thème' },
        { keys: ['Escape'], description: 'Fermer les modales' },
        { keys: ['Ctrl', 'B'], description: 'Basculer la barre latérale' },
      ]
    },
    {
      title: 'Actions',
      shortcuts: [
        { keys: ['Ctrl', 'Enter'], description: 'Générer de la musique' },
        { keys: ['Ctrl', 'S'], description: 'Sauvegarder le contenu' },
        { keys: ['Ctrl', 'Shift', 'P'], description: 'Ouvrir la palette de commandes' },
        { keys: ['Alt', 'N'], description: 'Nouvelle création' },
      ]
    }
  ];

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Vérification de sécurité - s'assurer que e.key existe
      if (!e || !e.key) return;
      
      // Ctrl+K pour recherche
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Logique de recherche
        console.log('Ouverture recherche rapide');
      }

      // ? pour afficher les raccourcis
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setIsOpen(true);
      }

      // Navigation avec G+lettre
      if (e.key && e.key.toLowerCase() === 'g' && !e.ctrlKey) {
        const handleSecondKey = (secondE: KeyboardEvent) => {
          if (!secondE || !secondE.key) return;
          
          const secondKey = secondE.key.toLowerCase();
          const action = shortcutGroups[0].shortcuts.find(s => 
            s.keys[1] && s.keys[1].toLowerCase() === secondKey
          )?.action;
          
          if (action) {
            secondE.preventDefault();
            action();
          }
          
          document.removeEventListener('keydown', handleSecondKey);
        };
        
        document.addEventListener('keydown', handleSecondKey, { once: true });
        setTimeout(() => document.removeEventListener('keydown', handleSecondKey), 2000);
      }

      // Escape pour fermer
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [navigate]);

  const formatKeys = (keys: string[]) => {
    if (!Array.isArray(keys)) return null;
    
    return keys.filter(key => key != null).map((key, index) => (
      <span key={`${key}-${index}`} className="inline-flex items-center">
        <Badge variant="outline" className="px-2 py-1 font-mono text-xs">
          {key}
        </Badge>
        {index < keys.filter(k => k != null).length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
      </span>
    ));
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        title="Raccourcis clavier (?)"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Raccourcis Clavier
            </DialogTitle>
            <DialogDescription>
              Gagnez en productivité avec ces raccourcis essentiels
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {formatKeys(shortcut.keys)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Appuyez sur <Badge variant="outline" className="px-1 py-0 text-xs">?</Badge> pour afficher cette aide
            </p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};