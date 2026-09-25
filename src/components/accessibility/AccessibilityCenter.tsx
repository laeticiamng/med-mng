import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EVENEMENT_ACCESSIBILITE } from '@/components/onboarding/HelpButton';
import { Eye, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const TAILLES: { valeur: 'small' | 'medium' | 'large'; label: string }[] = [
  { valeur: 'small', label: 'Petit' },
  { valeur: 'medium', label: 'Moyen' },
  { valeur: 'large', label: 'Grand' },
];

/**
 * Centre d'accessibilité : quatre réglages, tous réellement appliqués par
 * AccessibilityProvider (classes sur <html>, mémorisées dans le navigateur).
 *
 * CONSTAT (25/09/2026) : l'ancien panneau proposait aussi une « assistance
 * daltonisme », un zoom, un « mode lecteur d'écran », une « navigation
 * clavier » et un « test d'accessibilité automatique » avec un score sur 100 :
 * aucun n'avait d'effet (état local jamais lu, score écrit en dur). Les
 * tailles de texte étaient affichées en anglais (small/medium/large). Le
 * panneau ne se fermait pas avec Échap. Tout cela est corrigé ; le bouton
 * flottant est déplacé pour ne plus chevaucher le tuteur IA.
 */
export const AccessibilityCenter: React.FC = () => {
  const accessibility = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const ouvrir = () => setIsOpen(true);
    window.addEventListener(EVENEMENT_ACCESSIBILITE, ouvrir);
    return () => window.removeEventListener(EVENEMENT_ACCESSIBILITE, ouvrir);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const surTouche = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="icon"
        aria-label="Ouvrir le centre d'accessibilité"
        title="Accessibilité"
        className="fixed bottom-24 md:bottom-40 right-6 z-40 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-background/80 border-border/50 h-9 w-9 rounded-full opacity-60 hover:opacity-100"
      >
        <Eye className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />

      {/* Panneau d'accessibilité */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-accessibilite"
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l shadow-lg z-50 overflow-y-auto"
      >
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <h2 id="titre-accessibilite" className="text-xl font-bold">Accessibilité</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Fermer">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <section className="space-y-4">
            <h3 className="text-base font-medium">Affichage</h3>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="high-contrast">Contraste élevé</Label>
              <Switch id="high-contrast" checked={accessibility.isHighContrast} onCheckedChange={accessibility.setHighContrast} />
            </div>
            <div className="space-y-2">
              <Label>Taille du texte</Label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Taille du texte">
                {TAILLES.map((taille) => (
                  <Button
                    key={taille.valeur}
                    variant={accessibility.fontSize === taille.valeur ? 'default' : 'outline'}
                    aria-pressed={accessibility.fontSize === taille.valeur}
                    onClick={() => accessibility.setFontSize(taille.valeur)}
                  >
                    {taille.label}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-medium">Mouvement</h3>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="reduced-motion">Réduire les animations</Label>
              <Switch id="reduced-motion" checked={accessibility.reducedMotion} onCheckedChange={accessibility.setReducedMotion} />
            </div>
            <p className="text-sm text-muted-foreground">
              Désactive les animations et transitions de l'interface.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-base font-medium">Clavier</h3>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="focus-visible">Indicateur de focus renforcé</Label>
              <Switch id="focus-visible" checked={accessibility.isFocusVisible} onCheckedChange={accessibility.setFocusVisible} />
            </div>
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground space-y-1">
              <div>Tab / Maj + Tab : passer d'un élément à l'autre</div>
              <div>Entrée ou Espace : activer un bouton</div>
              <div>Échap : fermer une fenêtre ou un menu</div>
              <div>Flèches : se déplacer dans un menu</div>
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            Ces préférences sont enregistrées dans ce navigateur.
          </p>
        </div>
      </div>
    </>
  );
};
