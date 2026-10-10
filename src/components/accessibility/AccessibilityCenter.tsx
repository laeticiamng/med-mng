import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EVENEMENT_ACCESSIBILITE } from '@/components/onboarding/HelpButton';
import { Eye } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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
 *
 * 09.10.2026 : le panneau (z-50, fait main) était recouvert en bas par le bandeau cookies
 * (z-[100]) tant que le visiteur n'avait pas choisi ; il se disait « aria-modal » sans piéger
 * le focus (Tab sortait vers la page et le bandeau) ni le rendre à la fermeture. Il repose
 * désormais sur la feuille Radix (Sheet) : focus piégé puis rendu, Échap, reste de la page
 * masqué aux lecteurs d'écran (aria-hidden) — ce qui masque aussi le bandeau cookies
 * (règle CSS sur [data-aria-hidden] et [data-bandeau-cookies], src/index.css).
 */
/**
 * Élément présent, affiché et donc capable de recevoir le focus (un bouton masqué par
 * « hidden » / « lg:hidden » ignore focus()). Sans boîte de rendu (jsdom, display: none),
 * on remonte les styles calculés.
 */
function estFocalisable(el: HTMLElement | null): el is HTMLElement {
  if (!el || !el.isConnected) return false;
  if (el.getClientRects().length > 0) return true;
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const style = window.getComputedStyle(n);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
}

export const AccessibilityCenter: React.FC = () => {
  const accessibility = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  // Élément qui avait le focus à l'ouverture : il le retrouve à la fermeture (sans déclencheur
  // Radix, la feuille ne rend le focus à personne). Ouvert depuis un menu (menu mobile, menu
  // Aide), cet élément disparaît avec le menu : le focus revient alors au bouton qui ouvre ce
  // menu (détail « retour » de l'événement), s'il est affiché, sinon au contenu principal.
  const retourFocus = useRef<HTMLElement | null>(null);
  const retourMenu = useRef<string | null>(null);

  const ouvrirPanneau = (menu: string | null = null) => {
    const actif = document.activeElement;
    retourFocus.current = actif instanceof HTMLElement && actif !== document.body ? actif : null;
    retourMenu.current = menu;
    setIsOpen(true);
  };

  const rendreFocus = (evenement: Event) => {
    evenement.preventDefault();
    const candidats = [
      retourFocus.current,
      retourMenu.current
        ? document.querySelector<HTMLElement>(`[data-retour-focus-accessibilite="${retourMenu.current}"]`)
        : null,
      document.getElementById('main-content'),
    ];
    retourFocus.current = null;
    retourMenu.current = null;
    candidats.find(estFocalisable)?.focus();
  };

  useEffect(() => {
    const ouvrir = (e: Event) => {
      const retour = (e as CustomEvent<{ retour?: string } | null>).detail?.retour;
      ouvrirPanneau(typeof retour === 'string' ? retour : null);
    };
    window.addEventListener(EVENEMENT_ACCESSIBILITE, ouvrir);
    return () => window.removeEventListener(EVENEMENT_ACCESSIBILITE, ouvrir);
  }, []);

  return (
    <>
      <Button
        onClick={() => ouvrirPanneau()}
        variant="outline"
        size="icon"
        aria-label="Ouvrir le centre d'accessibilité"
        title="Accessibilité"
        // Mobile (< 768 px) : plus de bouton flottant, il recouvrait le texte et les actions
        // à 390 px (constat du 09.10.2026) ; le centre s'ouvre depuis le menu (« Accessibilité »).
        // Tablette et ordinateur : au-dessus du bouton d'aide, en tenant compte de la zone sûre.
        className="hidden md:inline-flex fixed bottom-[calc(10rem+env(safe-area-inset-bottom))] right-6 z-40 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-background/80 border-border/50 h-9 w-9 rounded-full opacity-60 hover:opacity-100"
      >
        <Eye className="w-4 h-4" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm p-6" onCloseAutoFocus={rendreFocus}>
        <div className="space-y-8">
          <SheetHeader className="pr-10 text-left">
            <SheetTitle className="text-xl font-bold">Accessibilité</SheetTitle>
            <SheetDescription>Contraste, taille du texte, animations et focus clavier.</SheetDescription>
          </SheetHeader>

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
        </SheetContent>
      </Sheet>
    </>
  );
};
