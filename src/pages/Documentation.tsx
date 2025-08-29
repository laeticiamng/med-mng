import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { Search, Book, Code, Zap, Users, Settings, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Documentation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      icon: Zap,
      items: [
        {
          title: 'Installation et configuration',
          description: 'Guide pour configurer votre environnement',
          content: 'Instructions détaillées pour installer et configurer la plateforme...'
        },
        {
          title: 'Premier pas',
          description: 'Créez votre premier projet',
          content: 'Tutoriel étape par étape pour créer votre premier projet...'
        },
        {
          title: 'Interface utilisateur',
          description: 'Navigation dans la plateforme',
          content: 'Guide complet de navigation et d\'utilisation de l\'interface...'
        }
      ]
    },
    {
      id: 'features',
      title: 'Fonctionnalités',
      icon: Book,
      items: [
        {
          title: 'EDN - Examens Dématérialisés',
          description: 'Système d\'examens numériques avancé',
          content: 'Le module EDN permet de créer et gérer des examens dématérialisés...'
        },
        {
          title: 'MED-MNG - Gestion Médicale',
          description: 'Plateforme de gestion médicale complète',
          content: 'MED-MNG offre une suite complète d\'outils de gestion médicale...'
        },
        {
          title: 'Analytics & Monitoring',
          description: 'Suivi et analyse des performances',
          content: 'Outils d\'analyse et de monitoring pour optimiser vos processus...'
        },
        {
          title: 'Export & Import',
          description: 'Gestion des données',
          content: 'Fonctionnalités avancées d\'import et export de données...'
        }
      ]
    },
    {
      id: 'api',
      title: 'API & Intégrations',
      icon: Code,
      items: [
        {
          title: 'API REST',
          description: 'Documentation de l\'API REST',
          content: 'Guide complet de l\'API REST avec exemples de code...'
        },
        {
          title: 'Webhooks',
          description: 'Configuration des webhooks',
          content: 'Comment configurer et utiliser les webhooks...'
        },
        {
          title: 'Intégrations tierces',
          description: 'Connecter des services externes',
          content: 'Guide d\'intégration avec des services tiers populaires...'
        }
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      icon: Settings,
      items: [
        {
          title: 'Gestion des utilisateurs',
          description: 'Administration des comptes utilisateurs',
          content: 'Guide d\'administration des utilisateurs et des permissions...'
        },
        {
          title: 'Configuration système',
          description: 'Paramètres avancés de la plateforme',
          content: 'Configuration avancée du système et des paramètres...'
        },
        {
          title: 'Sécurité',
          description: 'Bonnes pratiques de sécurité',
          content: 'Guide des bonnes pratiques de sécurité...'
        }
      ]
    }
  ];

  const filteredSections = searchQuery
    ? sections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : sections;

  const quickLinks = [
    { title: 'API Reference', url: '/api-docs', icon: Code },
    { title: 'Guide utilisateur', url: '/user-guide', icon: Users },
    { title: 'FAQ', url: '/faq', icon: Book },
    { title: 'Support', url: '/support', icon: Settings }
  ];

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
            <p className="text-white/70 text-lg mb-6">
              Guide complet pour utiliser la plateforme MED-MNG
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Rechercher dans la documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Liens rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {quickLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                        asChild
                      >
                        <Link to={link.url} className="flex items-center gap-2">
                          <link.icon className="h-4 w-4" />
                          {link.title}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Link>
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Navigation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {sections.map((section) => (
                      <Button
                        key={section.id}
                        variant="ghost"
                        className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          const element = document.getElementById(section.id);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <section.icon className="h-4 w-4 mr-2" />
                        {section.title}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {searchQuery && (
                <div className="mb-6">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                    {filteredSections.reduce((acc, section) => acc + section.items.length, 0)} résultats trouvés
                  </Badge>
                </div>
              )}

              {filteredSections.map((section) => (
                <div key={section.id} id={section.id}>
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-3">
                        <section.icon className="h-6 w-6" />
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        {section.items.length} articles disponibles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {section.items.map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`${section.id}-${index}`}
                            className="border-white/10"
                          >
                            <AccordionTrigger className="text-white hover:text-white/80">
                              <div className="flex items-center gap-3">
                                <ChevronRight className="h-4 w-4" />
                                <div className="text-left">
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-sm text-white/60">{item.description}</div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-white/80 pl-7">
                              <div className="prose prose-invert max-w-none">
                                <p>{item.content}</p>
                                
                                {/* Code example */}
                                {section.id === 'api' && (
                                  <div className="mt-4 p-4 bg-black/30 rounded-lg">
                                    <pre className="text-sm text-green-400">
                                      <code>
{`// Exemple d'utilisation
const response = await fetch('/api/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}
                                      </code>
                                    </pre>
                                  </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                  <Badge variant="outline" className="border-white/20 text-white/80">
                                    Guide
                                  </Badge>
                                  <Badge variant="outline" className="border-green-400/20 text-green-400">
                                    Mis à jour
                                  </Badge>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {filteredSections.length === 0 && searchQuery && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="py-12 text-center">
                    <Book className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">
                      Aucun résultat trouvé
                    </h3>
                    <p className="text-white/60 mb-4">
                      Essayez avec d'autres mots-clés ou parcourez les sections ci-dessus.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      Effacer la recherche
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Documentation;