import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ROUTE_PATHS } from '@/config/routes';
import { EVENEMENT_RACCOURCIS } from '@/components/onboarding/HelpButton';
import { Keyboard } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
    action?: () => void;
  }[];
}

/** Vrai quand la frappe vient d'un champ de saisie : les raccourcis n'y ont pas cours. */
const dansUnChamp = (e: KeyboardEvent) => {
  const cible = e.target as HTMLElement | null;
  if (!cible) return false;
  const balise = cible.tagName;
  return balise === 'INPUT' || balise === 'TEXTAREA' || balise === 'SELECT' || cible.isContentEditable;
};

/**
 * Aide-mémoire des raccourcis clavier, ouvert par « ? » ou depuis le bouton
 * d'aide (événement EVENEMENT_RACCOURCIS).
 *
 * CONSTAT (25/09/2026) : la liste annonçait dix raccourcis dont sept
 * n'existaient pas (Ctrl+/, Ctrl+B, Ctrl+Entrée, Ctrl+S, Ctrl+Maj+P, Alt+N,
 * G+D vers un tableau de bord réservé aux administrateurs), et la séquence
 * « G puis H » se déclenchait même en tapant dans un champ (« gh » saisi dans
 * la recherche renvoyait à l'accueil). Le bouton flottant dédié était
 * recouvert par celui du tuteur IA. Ne restent que les raccourcis réels ;
 * les champs de saisie sont ignorés.
 */
export const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Rechercher un item EDN' },
        { keys: ['G', 'H'], description: "Aller à l'accueil", action: () => navigate(ROUTE_PATHS.home) },
        { keys: ['G', 'E'], description: 'Aller aux items EDN', action: () => navigate(ROUTE_PATHS.ednComplete) },
        { keys: ['G', 'M'], description: 'Créer une chanson (compte requis)', action: () => navigate(ROUTE_PATHS.medMngCreate) },
      ]
    },
    {
      title: 'Interface',
      shortcuts: [
        { keys: ['?'], description: 'Afficher cette aide' },
        { keys: ['Échap'], description: 'Fermer les fenêtres et menus' },
      ]
    },
  ];

  useEffect(() => {
    const ouvrir = () => setIsOpen(true);
    window.addEventListener(EVENEMENT_RACCOURCIS, ouvrir);
    return () => window.removeEventListener(EVENEMENT_RACCOURCIS, ouvrir);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!e || !e.key) return;
      if (dansUnChamp(e)) return;

      // ? pour afficher les raccourcis
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Navigation avec G + lettre (dans les deux secondes)
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const handleSecondKey = (secondE: KeyboardEvent) => {
          if (!secondE || !secondE.key || dansUnChamp(secondE)) return;
          const secondKey = secondE.key.toLowerCase();
          const action = shortcutGroups[0].shortcuts.find(s =>
            s.keys[1] && s.keys[1].toLowerCase() === secondKey
          )?.action;
          if (action) {
            secondE.preventDefault();
            action();
          }
        };
        document.addEventListener('keydown', handleSecondKey, { once: true });
        setTimeout(() => document.removeEventListener('keydown', handleSecondKey), 2000);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis clavier
          </DialogTitle>
          <DialogDescription>
            Les raccourcis ne s'appliquent pas pendant la saisie dans un champ.
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
  );
};
