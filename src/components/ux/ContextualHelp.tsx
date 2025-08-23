/**
 * Système d'aide contextuelle intelligente
 * Fournit une assistance adaptée à chaque page/composant
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HelpCircle, 
  BookOpen, 
  Keyboard, 
  Lightbulb, 
  Video,
  ExternalLink,
  ChevronRight,
  X,
  Search
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'guide' | 'shortcut' | 'tip' | 'video';
  keywords: string[];
  videoUrl?: string;
  externalLink?: string;
}

interface PageHelp {
  pageId: string;
  title: string;
  description: string;
  topics: HelpTopic[];
  quickActions: Array<{
    label: string;
    action: () => void;
    icon: React.ComponentType<any>;
  }>;
}

// Base de connaissances contextuelle
const helpDatabase: Record<string, PageHelp> = {
  '/edn': {
    pageId: 'edn',
    title: 'Items EDN - Référentiel E-LiSA',
    description: 'Explorez les items du référentiel EDN organisés selon E-LiSA officiel',
    topics: [
      {
        id: 'navigation-edn',
        title: 'Navigation dans les Items EDN',
        description: 'Comment naviguer efficacement',
        content: 'Les items EDN sont organisés par codes (IC-1, IC-2, etc.). Utilisez la barre de recherche pour filtrer par thème ou mot-clé. Cliquez sur un item pour voir son tableau enrichi avec définitions, exemples et pièges.',
        category: 'guide',
        keywords: ['navigation', 'recherche', 'items', 'codes']
      },
      {
        id: 'tableaux-rang',
        title: 'Comprendre les Tableaux Rang A/B',
        description: 'Différences entre Rang A et Rang B',
        content: 'Rang A = connaissances fondamentales (15 concepts). Rang B = expertise approfondie (8 concepts avancés). Les tableaux incluent : concept, définition, exemple, piège, mnémotechnique, subtilité, application, vigilance.',
        category: 'guide',
        keywords: ['rang', 'tableau', 'concepts', 'elisa']
      },
      {
        id: 'shortcuts-edn',
        title: 'Raccourcis Clavier EDN',
        description: 'Naviguer plus rapidement',
        content: 'Ctrl+K : Recherche rapide\n/ : Focus sur recherche\nÉchap : Fermer modal\nEntrée : Ouvrir item sélectionné\n↑↓ : Naviguer dans la liste',
        category: 'shortcut',
        keywords: ['clavier', 'raccourcis', 'navigation']
      }
    ],
    quickActions: [
      {
        label: 'Rechercher un item',
        action: () => (document.querySelector('[data-tour="search"]') as HTMLInputElement)?.focus(),
        icon: Search
      }
    ]
  },
  '/generator': {
    pageId: 'generator',
    title: 'Générateur Musical IA',
    description: 'Créez des mnémotechniques musicales avec l\'IA',
    topics: [
      {
        id: 'ai-generation',
        title: 'Comment fonctionne l\'IA Musicale',
        description: 'Génération automatique de mélodies',
        content: 'Notre IA analyse vos textes médicaux et génère des mélodies mnémotechniques adaptées. Plus votre texte est structuré, meilleure sera la mélodie. Utilisez des phrases courtes et répétitives pour un meilleur résultat.',
        category: 'guide',
        keywords: ['ia', 'génération', 'mélodie', 'mnémotechnique']
      }
    ],
    quickActions: []
  },
  '/ecos': {
    pageId: 'ecos',
    title: 'Cas Cliniques ECOS',
    description: 'Entraînement aux examens cliniques',
    topics: [
      {
        id: 'ecos-navigation',
        title: 'Structure des Cas ECOS',
        description: 'Organisation des scénarios',
        content: 'Chaque cas ECOS comprend : présentation du patient, anamnèse, examen clinique, examens complémentaires, diagnostic et prise en charge. Suivez l\'ordre logique pour une approche méthodique.',
        category: 'guide',
        keywords: ['ecos', 'cas', 'patient', 'diagnostic']
      }
    ],
    quickActions: []
  }
};

// Raccourcis globaux
const globalShortcuts: HelpTopic[] = [
  {
    id: 'global-nav',
    title: 'Navigation Globale',
    description: 'Raccourcis de navigation principale',
    content: 'Alt + 1 : Accueil\nAlt + 2 : Items EDN\nAlt + 3 : Cas ECOS\nAlt + 4 : Bibliothèque\nAlt + G : Générateur\nAlt + P : Profil',
    category: 'shortcut',
    keywords: ['navigation', 'global', 'raccourcis']
  },
  {
    id: 'accessibility',
    title: 'Raccourcis Accessibilité',
    description: 'Améliorer l\'expérience',
    content: 'Alt + A : Panneau accessibilité\nAlt + H : Aide contextuelle\nTab : Navigation clavier\nEspace : Activer bouton\nÉchap : Fermer modal/menu',
    category: 'shortcut',
    keywords: ['accessibilité', 'clavier', 'navigation']
  }
];

interface ContextualHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  isOpen,
  onClose
}) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('guide');
  
  const currentPageHelp = helpDatabase[location.pathname] || {
    pageId: 'general',
    title: 'Aide Générale',
    description: 'Assistance générale pour MED-MNG',
    topics: [],
    quickActions: []
  };

  // Filtrer les topics selon la recherche
  const filteredTopics = [
    ...currentPageHelp.topics,
    ...globalShortcuts
  ].filter(topic => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      topic.content.toLowerCase().includes(query) ||
      topic.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  const topicsByCategory = {
    guide: filteredTopics.filter(t => t.category === 'guide'),
    shortcut: filteredTopics.filter(t => t.category === 'shortcut'),
    tip: filteredTopics.filter(t => t.category === 'tip'),
    video: filteredTopics.filter(t => t.category === 'video')
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentPageHelp.title}</h2>
                <p className="text-sm text-muted-foreground">{currentPageHelp.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-6 pb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>

          {/* Quick Actions */}
          {currentPageHelp.quickActions.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-sm font-medium mb-3">Actions Rapides</h3>
              <div className="flex gap-2">
                {currentPageHelp.quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        action.action();
                        onClose();
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 px-6 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="guide" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Guides
                  {topicsByCategory.guide.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {topicsByCategory.guide.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="shortcut" className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Raccourcis
                  {topicsByCategory.shortcut.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {topicsByCategory.shortcut.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tip" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Astuces
                  {topicsByCategory.tip.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {topicsByCategory.tip.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Vidéos
                  {topicsByCategory.video.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {topicsByCategory.video.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {Object.entries(topicsByCategory).map(([category, topics]) => (
                <TabsContent key={category} value={category} className="mt-4">
                  <ScrollArea className="h-96">
                    {topics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucune aide disponible dans cette catégorie</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {topics.map((topic) => (
                          <Card key={topic.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">{topic.title}</CardTitle>
                                  <CardDescription>{topic.description}</CardDescription>
                                </div>
                                {topic.externalLink && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(topic.externalLink, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                                  {topic.content}
                                </pre>
                              </div>
                              {topic.videoUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3"
                                  onClick={() => window.open(topic.videoUrl, '_blank')}
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  Voir la vidéo
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Bouton d'aide contextuelle
export const ContextualHelpButton: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-4 right-4 z-40 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        title="Aide contextuelle (Alt + H)"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      
      <ContextualHelp
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};