import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, MessageCircle, Keyboard, Eye, Mail } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';

/** Événements écoutés par KeyboardShortcuts et AccessibilityCenter. */
export const EVENEMENT_RACCOURCIS = 'open-keyboard-shortcuts';
export const EVENEMENT_ACCESSIBILITE = 'open-accessibility-center';

/**
 * Bouton d'aide flottant (écrans ≥ md).
 *
 * CONSTAT (25/09/2026) : ce bouton était placé exactement sous celui du
 * tuteur IA (mêmes coordonnées bottom-6 right-6, même z-index) : il était
 * recouvert et inutilisable sur toutes les pages. Ses trois entrées étaient
 * mortes : « Recommencer le tutoriel » ne rouvrait rien (état local d'un hook
 * non partagé), « Centre d'aide » et « Vidéos tutorielles » affichaient
 * « bientôt disponible ». Il regroupe désormais ce qui existe vraiment :
 * la FAQ, les raccourcis clavier, le centre d'accessibilité et le contact.
 */
export const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logActivity } = useActivityTracking();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'help_button', action: 'open' }
      });
    }
  };

  const helpItems = [
    {
      icon: MessageCircle,
      title: 'Questions fréquentes',
      description: 'Fonctionnement, offre, données',
      action: () => navigate(ROUTE_PATHS.faq),
    },
    {
      icon: Keyboard,
      title: 'Raccourcis clavier',
      description: 'Navigation et recherche',
      action: () => window.dispatchEvent(new CustomEvent(EVENEMENT_RACCOURCIS)),
    },
    {
      icon: Eye,
      title: 'Accessibilité',
      description: 'Contraste, animations, taille du texte',
      action: () => window.dispatchEvent(new CustomEvent(EVENEMENT_ACCESSIBILITE)),
    },
    {
      icon: Mail,
      title: 'Nous écrire',
      description: 'contact@emotionscare.com',
      href: 'mailto:contact@emotionscare.com',
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Aide"
          title="Aide"
          className="fixed bottom-24 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 z-40 hidden md:flex"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="medical-card w-80 p-0 shadow-xl"
        side="top"
        align="end"
      >
        <div className="p-4">
          <h3 className="font-semibold text-medical-primary mb-3">
            Besoin d'aide ?
          </h3>
          <div className="space-y-2">
            {helpItems.map((item) => {
              const contenu = (
                <>
                  <item.icon className="h-5 w-5 mr-3 text-medical-accent flex-shrink-0" />
                  <div>
                    <div className="font-medium text-medical-primary">
                      {item.title}
                    </div>
                    <div className="text-sm text-medical-secondary">
                      {item.description}
                    </div>
                  </div>
                </>
              );
              const tracer = () => {
                logActivity({
                  activity_type: 'study',
                  count: 1,
                  metadata: { component: 'help_button', action: item.title }
                });
                setIsOpen(false);
              };
              const classes = 'w-full justify-start h-auto p-3 text-left hover:bg-medical-background';
              return 'href' in item ? (
                <Button key={item.title} asChild variant="ghost" className={classes}>
                  <a href={item.href} onClick={tracer}>{contenu}</a>
                </Button>
              ) : (
                <Button
                  key={item.title}
                  variant="ghost"
                  className={classes}
                  onClick={() => { tracer(); item.action(); }}
                >
                  {contenu}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
