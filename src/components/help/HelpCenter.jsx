import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Video, 
  MessageCircle,
  ExternalLink,
  Star,
  ChevronRight,
  Lightbulb,
  Settings,
  Music,
  Shield,
  Users,
  BarChart3,
  FileText,
  Zap
} from 'lucide-react';

/**
 * Centre d'Aide Intégré et Interactif
 */
export const HelpCenter = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tout', icon: Book },
    { id: 'getting-started', label: 'Démarrage', icon: Zap },
    { id: 'music', label: 'Musique', icon: Music },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'administration', label: 'Administration', icon: Settings }
  ];

  const helpArticles = [
    {
      id: 1,
      title: 'Créer votre première piste musicale',
      description: 'Guide pas-à-pas pour générer du contenu musical thérapeutique',
      category: 'music',
      type: 'video',
      difficulty: 'Débutant',
      duration: '5 min',
      rating: 4.8,
      popular: true
    },
    {
      id: 2,
      title: 'Configuration des paramètres de sécurité',
      description: 'Optimiser la sécurité de votre compte et données',
      category: 'security',
      type: 'article',
      difficulty: 'Intermédiaire',
      duration: '8 min',
      rating: 4.9
    },
    {
      id: 3,
      title: 'Comprendre les métriques du dashboard',
      description: 'Interpréter les données et analytics de la plateforme',
      category: 'analytics',
      type: 'article',
      difficulty: 'Avancé',
      duration: '12 min',
      rating: 4.7
    },
    {
      id: 4,
      title: 'Premiers pas avec MED-MNG',
      description: 'Introduction complète à la plateforme médicale',
      category: 'getting-started',
      type: 'video',
      difficulty: 'Débutant',
      duration: '15 min',
      rating: 4.9,
      popular: true
    },
    {
      id: 5,
      title: 'Gestion des utilisateurs et permissions',
      description: 'Administration des comptes et droits d\'accès',
      category: 'administration',
      type: 'article',
      difficulty: 'Avancé',
      duration: '10 min',
      rating: 4.6
    }
  ];

  const quickActions = [
    { icon: MessageCircle, title: 'Chat Support', description: 'Contactez notre équipe', action: 'chat' },
    { icon: Video, title: 'Tutoriels', description: 'Vidéos explicatives', action: 'tutorials' },
    { icon: Book, title: 'Documentation', description: 'Guide complet', action: 'docs' },
    { icon: ExternalLink, title: 'FAQ', description: 'Questions fréquentes', action: 'faq' }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl border-l bg-background shadow-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Centre d'Aide</h2>
                <p className="text-sm text-muted-foreground">Trouvez des réponses et apprenez</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="help" className="h-full flex flex-col">
              <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3">
                <TabsTrigger value="help">Aide</TabsTrigger>
                <TabsTrigger value="tutorials">Tutoriels</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>

              <TabsContent value="help" className="flex-1 overflow-hidden mt-4">
                <div className="px-6 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans l'aide..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <Card key={index} className="medical-card hover:shadow-md transition-all cursor-pointer group">
                        <CardContent className="p-4 text-center">
                          <action.icon className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                          <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-2"
                      >
                        <category.icon className="w-3 h-3" />
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Articles */}
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-4 pb-6">
                    {filteredArticles.map((article) => (
                      <Card key={article.id} className="medical-card hover:shadow-md transition-all cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                  {article.title}
                                </h3>
                                {article.popular && (
                                  <Badge className="bg-primary/10 text-primary text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Populaire
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">
                                {article.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  {article.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                  {article.type === 'video' ? 'Vidéo' : 'Article'}
                                </div>
                                <span>{article.duration}</span>
                                <span>{article.difficulty}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current text-warning" />
                                  {article.rating}
                                </div>
                              </div>
                            </div>
                            
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredArticles.length === 0 && (
                      <div className="text-center py-12">
                        <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Aucun résultat trouvé</h3>
                        <p className="text-sm text-muted-foreground">
                          Essayez d'autres mots-clés ou parcourez les catégories
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tutorials" className="flex-1 p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Tutoriels Vidéo</h3>
                    <p className="text-muted-foreground">
                      Apprenez avec nos guides vidéo étape par étape
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {helpArticles.filter(a => a.type === 'video').map(video => (
                      <Card key={video.id} className="medical-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-12 bg-primary/10 rounded flex items-center justify-center">
                              <Video className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{video.title}</h4>
                              <p className="text-sm text-muted-foreground">{video.duration}</p>
                            </div>
                            <Button size="sm">Regarder</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="support" className="flex-1 p-6">
                <div className="space-y-6 text-center">
                  <div>
                    <MessageCircle className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Contactez le Support</h3>
                    <p className="text-muted-foreground">
                      Notre équipe est là pour vous aider 24h/24, 7j/7
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    <Card className="medical-card">
                      <CardContent className="p-6">
                        <h4 className="font-medium mb-2">Chat en Direct</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Obtenez une aide immédiate via notre chat
                        </p>
                        <Button className="w-full">Démarrer le Chat</Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="medical-card">
                      <CardContent className="p-6">
                        <h4 className="font-medium mb-2">Email Support</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Envoyez-nous un email détaillé
                        </p>
                        <Button variant="outline" className="w-full">
                          support@med-mng.com
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;