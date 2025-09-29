import React, { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Home, Music, BookOpen, Users, BarChart3, 
  Settings, User, MessageSquare, Heart, Trophy, 
  Calculator, FileText, Calendar
} from 'lucide-react';

interface QuickNavItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  keywords: string[];
}

/**
 * Navigation rapide globale avec recherche intelligente
 */
export const QuickNavigation: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Raccourci clavier pour ouvrir
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigationItems: QuickNavItem[] = [
    // Pages principales
    {
      id: 'home',
      title: 'Accueil',
      description: 'Page d\'accueil de la plateforme',
      url: '/',
      icon: Home,
      category: 'Navigation',
      keywords: ['accueil', 'home', 'début', 'start']
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Tableau de bord et analytics',
      url: '/dashboard',
      icon: BarChart3,
      category: 'Navigation',
      keywords: ['dashboard', 'tableau', 'bord', 'analytics', 'stats']
    },
    {
      id: 'generator',
      title: 'Générateur Musical',
      description: 'Créer des contenus musicaux éducatifs',
      url: '/generator',
      icon: Music,
      category: 'Outils IA',
      keywords: ['musique', 'générateur', 'création', 'IA', 'suno']
    },
    {
      id: 'edn',
      title: 'Items EDN',
      description: 'Bibliothèque d\'items EDN complets',
      url: '/edn-complete',
      icon: BookOpen,
      category: 'Contenu',
      keywords: ['EDN', 'items', 'questions', 'bibliothèque', 'formation']
    },
    {
      id: 'ecos',
      title: 'Simulation ECOS',
      description: 'Entraînement aux examens cliniques',
      url: '/ecos',
      icon: Users,
      category: 'Formation',
      keywords: ['ECOS', 'simulation', 'examen', 'clinique', 'pratique']
    },
    {
      id: 'chat',
      title: 'Assistant IA',
      description: 'Chat intelligent pour l\'aide',
      url: '/chat',
      icon: MessageSquare,
      category: 'Outils IA',
      keywords: ['chat', 'assistant', 'IA', 'aide', 'support']
    },
    
    // Pages secondaires
    {
      id: 'library',
      title: 'Ma Bibliothèque',
      description: 'Mes contenus sauvegardés',
      url: '/med-mng/library',
      icon: Heart,
      category: 'Personnel',
      keywords: ['bibliothèque', 'favoris', 'sauvegardés', 'mes contenus']
    },
    {
      id: 'profile',
      title: 'Mon Profil',
      description: 'Paramètres de profil utilisateur',
      url: '/med-mng/profile',
      icon: User,
      category: 'Personnel',
      keywords: ['profil', 'compte', 'utilisateur', 'paramètres']
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'Badges et récompenses',
      url: '/achievements',
      icon: Trophy,
      category: 'Gamification',
      keywords: ['achievements', 'badges', 'récompenses', 'succès']
    },
    {
      id: 'favorites',
      title: 'Favoris',
      description: 'Contenus marqués comme favoris',
      url: '/favorites',
      icon: Heart,
      category: 'Personnel',
      keywords: ['favoris', 'liked', 'préférés', 'aimés']
    },
    
    // Outils
    {
      id: 'calculator',
      title: 'Calculatrice Médicale',
      description: 'Calculateurs médicaux spécialisés',
      url: '/tools/calculator',
      icon: Calculator,
      category: 'Outils',
      keywords: ['calculatrice', 'calcul', 'médical', 'outil', 'formule']
    },
    {
      id: 'planner',
      title: 'Planificateur d\'Études',
      description: 'Planifier et organiser vos révisions',
      url: '/study-planner',
      icon: Calendar,
      category: 'Outils',
      keywords: ['planificateur', 'études', 'révisions', 'planning', 'organisation']
    },
    {
      id: 'documents',
      title: 'Mes Documents',
      description: 'Documents et notes personnels',
      url: '/documents',
      icon: FileText,
      category: 'Personnel',
      keywords: ['documents', 'notes', 'fichiers', 'personnels']
    },
    
    // Paramètres
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configuration de la plateforme',
      url: '/platform-settings',
      icon: Settings,
      category: 'Configuration',
      keywords: ['paramètres', 'configuration', 'réglages', 'options']
    }
  ];

  const handleSelect = (item: QuickNavItem) => {
    setOpen(false);
    navigate(item.url);
  };

  // Grouper les items par catégorie
  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, QuickNavItem[]>);

  return (
    <>
      {/* Bouton d'ouverture */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="relative h-8 w-full justify-start rounded-lg bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Rechercher...</span>
        <span className="inline-flex lg:hidden">Recherche</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Dialog de recherche */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Rechercher dans MED-MNG..." 
          className="h-12 text-base"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-6 text-center text-muted-foreground">
            Aucun résultat trouvé.
          </CommandEmpty>
          
          {Object.entries(groupedItems).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.description} ${item.keywords.join(' ')}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};