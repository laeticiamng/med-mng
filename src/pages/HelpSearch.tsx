import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, FileText, Video, MessageCircle, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HelpSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'tutorials' | 'faq'>('all');

  // Mock search results
  const allResults = [
    {
      type: 'article',
      title: 'Comment créer un compte sur Med-Mng',
      description: 'Guide complet pour créer et configurer votre compte utilisateur',
      category: 'Démarrage',
      relevance: 95,
      url: ROUTE_PATHS.helpFaq,
    },
    {
      type: 'tutorial',
      title: 'Guide de démarrage rapide (vidéo)',
      description: 'Découvrez les fonctionnalités essentielles en 5 minutes',
      category: 'Premiers Pas',
      relevance: 92,
      duration: '5 min',
      url: ROUTE_PATHS.helpTutorials,
    },
    {
      type: 'faq',
      title: 'Quelles sont les fonctionnalités principales ?',
      description: 'Med-Mng propose un journal personnel, des challenges quotidiens...',
      category: 'Démarrage',
      relevance: 88,
      url: ROUTE_PATHS.helpFaq,
    },
    {
      type: 'article',
      title: 'Gérer vos notifications',
      description: 'Configurez vos préférences de notifications pour rester informé',
      category: 'Paramètres',
      relevance: 85,
      url: ROUTE_PATHS.helpFaq,
    },
    {
      type: 'tutorial',
      title: 'Utiliser le journal quotidien',
      description: 'Techniques pour tenir un journal efficace',
      category: 'Productivité',
      relevance: 82,
      duration: '12 min',
      url: ROUTE_PATHS.helpTutorials,
    },
    {
      type: 'faq',
      title: 'Comment fonctionnent les challenges ?',
      description: 'Les challenges sont des objectifs quotidiens ou hebdomadaires...',
      category: 'Gamification',
      relevance: 80,
      url: ROUTE_PATHS.helpFaq,
    },
    {
      type: 'tutorial',
      title: 'Système de challenges (vidéo)',
      description: 'Comprendre et réussir les challenges quotidiens',
      category: 'Gamification',
      relevance: 78,
      duration: '10 min',
      url: ROUTE_PATHS.helpTutorials,
    },
    {
      type: 'article',
      title: 'Protection de votre vie privée',
      description: 'Contrôlez qui peut voir vos informations et activités',
      category: 'Sécurité',
      relevance: 75,
      url: ROUTE_PATHS.helpFaq,
    },
  ];

  const filteredResults = allResults.filter((result) => {
    if (activeTab !== 'all') {
      if (activeTab === 'articles' && result.type !== 'article') return false;
      if (activeTab === 'tutorials' && result.type !== 'tutorial') return false;
      if (activeTab === 'faq' && result.type !== 'faq') return false;
    }
    if (query) {
      const searchLower = query.toLowerCase();
      return (
        result.title.toLowerCase().includes(searchLower) ||
        result.description.toLowerCase().includes(searchLower) ||
        result.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tutorial':
        return Video;
      case 'faq':
        return MessageCircle;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tutorial':
        return 'Tutoriel';
      case 'faq':
        return 'FAQ';
      default:
        return 'Article';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tutorial':
        return 'bg-purple-100 text-purple-700';
      case 'faq':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const tabs = [
    { id: 'all' as const, label: 'Tout', count: allResults.length },
    { id: 'articles' as const, label: 'Articles', count: allResults.filter(r => r.type === 'article').length },
    { id: 'tutorials' as const, label: 'Tutoriels', count: allResults.filter(r => r.type === 'tutorial').length },
    { id: 'faq' as const, label: 'FAQ', count: allResults.filter(r => r.type === 'faq').length },
  ];

  return (
    <>
      <Helmet>
        <title>Recherche dans l'Aide | Med-Mng</title>
        <meta name="description" content="Recherchez dans notre base de connaissances" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.help}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Centre d'Aide
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Recherche dans l'Aide
            </h1>
            <p className="text-lg text-gray-600">
              Trouvez rapidement les réponses dont vous avez besoin
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Rechercher dans l'aide..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    Rechercher
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0"
              >
                {tab.label}
                <Badge variant="secondary" className="ml-2">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Results */}
          {query && (
            <div className="mb-6">
              <h2 className="text-lg text-gray-700">
                <span className="font-semibold">{filteredResults.length}</span> résultat{filteredResults.length > 1 ? 's' : ''} pour{' '}
                <span className="font-semibold">"{query}"</span>
              </h2>
            </div>
          )}

          <div className="space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, index) => {
                const Icon = getTypeIcon(result.type);
                return (
                  <Link key={index} to={result.url}>
                    <Card className="hover:shadow-md transition-all duration-200 hover:border-blue-300">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(result.type)}>
                                <Icon className="w-3 h-3 mr-1" />
                                {getTypeLabel(result.type)}
                              </Badge>
                              <Badge variant="outline">{result.category}</Badge>
                              {result.type === 'tutorial' && result.duration && (
                                <Badge variant="secondary">{result.duration}</Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl mb-2 flex items-center gap-2 group">
                              {result.title}
                              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardTitle>
                            <CardDescription className="text-base">
                              {result.description}
                            </CardDescription>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="text-sm text-gray-500">
                              {result.relevance}% pertinent
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Essayez avec d'autres mots-clés ou parcourez nos catégories
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to={ROUTE_PATHS.helpFaq}>
                      <Button variant="outline">Voir la FAQ</Button>
                    </Link>
                    <Link to={ROUTE_PATHS.helpTutorials}>
                      <Button variant="outline">Voir les tutoriels</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Popular Searches */}
          {!query && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recherches populaires</CardTitle>
                <CardDescription>Les sujets les plus recherchés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['créer compte', 'notifications', 'challenges', 'leaderboard', 'badges', 'journal', 'méditation', 'profil'].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(term);
                        setSearchParams({ q: term });
                      }}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
