import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Book, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Video, 
  Download,
  ExternalLink,
  Star,
  Clock,
  Users
} from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    {
      title: 'Guide de démarrage',
      description: 'Apprenez les bases de MED-MNG',
      icon: Book,
      badge: 'Essentiel',
      action: () => console.log('Guide démarrage')
    },
    {
      title: 'Tutoriels vidéo',
      description: 'Découvrez les fonctionnalités en vidéo',
      icon: Video,
      badge: 'Populaire',
      action: () => console.log('Tutoriels')
    },
    {
      title: 'Contacter le support',
      description: 'Obtenez de l\'aide personnalisée',
      icon: MessageSquare,
      badge: '24/7',
      action: () => console.log('Support')
    },
    {
      title: 'Documentation API',
      description: 'Intégrations et développement',
      icon: FileText,
      badge: 'Avancé',
      action: () => console.log('API')
    }
  ];

  const faqData = [
    {
      question: 'Comment démarrer avec MED-MNG ?',
      answer: 'Créez votre compte, explorez le tableau de bord, et commencez par consulter les items EDN disponibles. Notre guide de démarrage vous accompagne étape par étape.'
    },
    {
      question: 'Comment puis-je suivre mes progrès ?',
      answer: 'Utilisez le tableau de bord analytique pour voir vos statistiques détaillées, votre progression par domaine, et vos performances au fil du temps.'
    },
    {
      question: 'Les données sont-elles synchronisées entre appareils ?',
      answer: 'Oui, toutes vos données sont automatiquement synchronisées sur tous vos appareils connectés à votre compte MED-MNG.'
    },
    {
      question: 'Comment puis-je exporter mes données ?',
      answer: 'Rendez-vous dans les paramètres de votre profil, section "Données", et sélectionnez le format d\'exportation souhaité (JSON, CSV, PDF).'
    },
    {
      question: 'Puis-je utiliser MED-MNG hors ligne ?',
      answer: 'Certaines fonctionnalités sont disponibles hors ligne après synchronisation. La génération de contenu nécessite une connexion internet.'
    }
  ];

  const tutorials = [
    {
      title: 'Premiers pas avec MED-MNG',
      duration: '5 min',
      difficulty: 'Débutant',
      views: '2.3k'
    },
    {
      title: 'Navigation dans les items EDN',
      duration: '8 min', 
      difficulty: 'Débutant',
      views: '1.8k'
    },
    {
      title: 'Utilisation avancée des analyses',
      duration: '12 min',
      difficulty: 'Intermédiaire', 
      views: '965'
    },
    {
      title: 'Personnalisation de l\'interface',
      duration: '6 min',
      difficulty: 'Débutant',
      views: '1.2k'
    }
  ];

  const resources = [
    {
      title: 'Guide utilisateur complet',
      type: 'PDF',
      size: '2.4 MB',
      updated: 'Il y a 2 jours'
    },
    {
      title: 'Templates et modèles',
      type: 'ZIP',
      size: '5.1 MB', 
      updated: 'Il y a 1 semaine'
    },
    {
      title: 'Raccourcis clavier',
      type: 'PDF',
      size: '340 KB',
      updated: 'Il y a 3 jours'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Centre d'aide MED-MNG</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions et maîtrisez toutes les fonctionnalités de la plateforme
            </p>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <action.icon className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{action.badge}</Badge>
              </div>
              <h3 className="font-semibold mb-2">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
              <Button size="sm" className="w-full" onClick={action.action}>
                Accéder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Tutoriels
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Ressources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Questions fréquemment posées</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials">
          <Card>
            <CardHeader>
              <CardTitle>Tutoriels vidéo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tutorials.map((tutorial, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{tutorial.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {tutorial.difficulty}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {tutorial.views} vues
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentation complète</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-2">Guide utilisateur</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Documentation complète pour tous les utilisateurs
                    </p>
                    <Button variant="outline" size="sm">
                      Consulter
                    </Button>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-2">Documentation API</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Référence technique pour les développeurs
                    </p>
                    <Button variant="outline" size="sm">
                      Consulter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Ressources téléchargeables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{resource.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{resource.type}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>Mis à jour {resource.updated}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact support */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Besoin d'aide supplémentaire ?</h3>
            <p className="text-muted-foreground">
              Notre équipe support est disponible 24/7 pour vous accompagner
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat en direct
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Créer un ticket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};