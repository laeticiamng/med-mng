import React, { useState } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Search, 
  Book, 
  Code, 
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Play,
  Download,
  Star,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react';

const NewDocumentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const sections = [
    {
      title: 'Guide de démarrage',
      description: 'Apprenez les bases de la plateforme MED-MNG',
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      articles: [
        { title: 'Introduction à MED-MNG', duration: '5 min', difficulty: 'Débutant' },
        { title: 'Première configuration', duration: '10 min', difficulty: 'Débutant' },
        { title: 'Navigation de base', duration: '8 min', difficulty: 'Débutant' },
        { title: 'Créer votre premier profil', duration: '12 min', difficulty: 'Débutant' }
      ]
    },
    {
      title: 'Génération musicale',
      description: 'Maîtrisez l\'IA de création musicale',
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      articles: [
        { title: 'Comprendre les genres musicaux', duration: '15 min', difficulty: 'Intermédiaire' },
        { title: 'Paramètres avancés de génération', duration: '20 min', difficulty: 'Avancé' },
        { title: 'Optimiser pour l\'apprentissage médical', duration: '18 min', difficulty: 'Intermédiaire' },
        { title: 'Techniques de personnalisation', duration: '25 min', difficulty: 'Avancé' }
      ]
    },
    {
      title: 'Bibliothèque et gestion',
      description: 'Organisez et gérez votre collection',
      icon: Book,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      articles: [
        { title: 'Organiser votre bibliothèque', duration: '12 min', difficulty: 'Débutant' },
        { title: 'Partage et collaboration', duration: '16 min', difficulty: 'Intermédiaire' },
        { title: 'Import/Export de musiques', duration: '14 min', difficulty: 'Intermédiaire' },
        { title: 'Sauvegarde et synchronisation', duration: '10 min', difficulty: 'Débutant' }
      ]
    },
    {
      title: 'API et intégrations',
      description: 'Documentation technique pour développeurs',
      icon: Code,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      articles: [
        { title: 'Référence API complète', duration: '30 min', difficulty: 'Avancé' },
        { title: 'Webhooks et événements', duration: '25 min', difficulty: 'Avancé' },
        { title: 'SDK JavaScript', duration: '20 min', difficulty: 'Intermédiaire' },
        { title: 'Authentification OAuth', duration: '22 min', difficulty: 'Avancé' }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Tutoriel vidéo complet', duration: '45 min', type: 'Vidéo', popular: true },
    { title: 'FAQ - Questions fréquentes', duration: '15 min', type: 'Guide', popular: true },
    { title: 'Raccourcis clavier', duration: '5 min', type: 'Référence', popular: false },
    { title: 'Résolution des problèmes', duration: '20 min', type: 'Guide', popular: true },
    { title: 'Meilleures pratiques', duration: '25 min', type: 'Guide', popular: false },
    { title: 'Communauté et support', duration: '8 min', type: 'Info', popular: false }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Vidéo': return <Play className="h-4 w-4" />;
      case 'Guide': return <Book className="h-4 w-4" />;
      case 'Référence': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredSections = sections.filter(section =>
    activeCategory === 'all' || 
    section.title.toLowerCase().includes(activeCategory.toLowerCase())
  );

  return (
    <ConsistentBackground variant="primary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Documentation"
          subtitle="Guides complets et références pour maîtriser MED-MNG"
          icon={FileText}
        />

        {/* Search and Quick Access */}
        <div className="mb-8 space-y-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans la documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={activeCategory === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveCategory('all')}
            >
              Tout
            </Badge>
            {sections.map((section) => (
              <Badge
                key={section.title}
                variant={activeCategory === section.title ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setActiveCategory(section.title)}
              >
                {section.title}
              </Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="guides" className="space-y-6">
          <TabsList>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="quick">Accès rapide</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="community">Communauté</TabsTrigger>
          </TabsList>

          <TabsContent value="guides">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <Card key={section.title} className="overflow-hidden">
                    <CardHeader className={`${section.bgColor} pb-4`}>
                      <CardTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white`}>
                          <IconComponent className={`h-6 w-6 ${section.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{section.title}</h3>
                          <p className="text-sm text-muted-foreground font-normal">{section.description}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-0">
                        {section.articles.map((article, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{article.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {article.duration}
                                </div>
                                <Badge variant="outline" className={`text-xs ${getDifficultyColor(article.difficulty)}`}>
                                  {article.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="quick">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(link.type)}
                        <Badge variant="secondary" className="text-xs">
                          {link.type}
                        </Badge>
                      </div>
                      {link.popular && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Populaire
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-medium mb-2">{link.title}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {link.duration}
                    </div>
                    
                    <Button variant="ghost" size="sm" className="w-full mt-3 justify-between">
                      Consulter
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentation API</CardTitle>
                  <p className="text-muted-foreground">
                    Documentation technique complète pour intégrer MED-MNG dans vos applications
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-between h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Référence API</div>
                        <div className="text-xs text-muted-foreground">Endpoints complets</div>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" className="justify-between h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">SDK JavaScript</div>
                        <div className="text-xs text-muted-foreground">Bibliothèque officielle</div>
                      </div>
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" className="justify-between h-auto p-4">
                      <div className="text-left">
                        <div className="font-medium">Exemples de code</div>
                        <div className="text-xs text-muted-foreground">Implémentations types</div>
                      </div>
                      <Code className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authentification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.med-mng.com/v1/generate`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Communauté et Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Rejoignez notre communauté active de professionnels de santé et développeurs.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-between">
                      Discord communautaire
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="justify-between">
                      Forum de discussion
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="justify-between">
                      Support technique
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="justify-between">
                      Feedback et suggestions
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vous ne trouvez pas votre réponse ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Notre équipe de support est là pour vous aider. Contactez-nous à tout moment.
                  </p>
                  <div className="flex gap-3">
                    <Button>
                      Contacter le support
                    </Button>
                    <Button variant="outline">
                      Demander une fonctionnalité
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ConsistentBackground>
  );
};

export default NewDocumentation;