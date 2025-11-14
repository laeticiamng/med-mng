import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, MessageCircle, Search, Video, HelpCircle, Mail } from 'lucide-react';
import { useState } from 'react';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: BookOpen,
      title: 'FAQ',
      description: 'Réponses aux questions fréquemment posées',
      link: ROUTE_PATHS.helpFaq,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Video,
      title: 'Tutoriels',
      description: 'Guides vidéo et tutoriels pas à pas',
      link: ROUTE_PATHS.helpTutorials,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MessageCircle,
      title: 'Contact Support',
      description: 'Contactez notre équipe d\'assistance',
      link: ROUTE_PATHS.helpContact,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Search,
      title: 'Recherche Avancée',
      description: 'Recherchez dans notre base de connaissances',
      link: ROUTE_PATHS.helpSearch,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const popularTopics = [
    { title: 'Comment débuter sur la plateforme ?', views: 1250 },
    { title: 'Gérer mes notifications', views: 980 },
    { title: 'Participer aux challenges', views: 875 },
    { title: 'Suivre ma progression', views: 760 },
    { title: 'Paramètres de confidentialité', views: 650 },
  ];

  return (
    <>
      <Helmet>
        <title>Centre d'Aide | Med-Mng</title>
        <meta name="description" content="Trouvez de l'aide et des réponses à vos questions sur Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Centre d'Aide
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comment pouvons-nous vous aider aujourd'hui ?
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </div>

          {/* Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} to={category.link}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full">
                    <CardHeader>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${category.bgColor} ${category.color} mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Popular Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Sujets Populaires
              </CardTitle>
              <CardDescription>
                Les articles les plus consultés cette semaine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-gray-900 font-medium">{topic.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">{topic.views} vues</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <CardTitle className="text-white text-2xl">Besoin d'aide supplémentaire ?</CardTitle>
              <CardDescription className="text-white/90">
                Notre équipe d'assistance est disponible pour répondre à vos questions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to={ROUTE_PATHS.helpContact}>
                <Button size="lg" variant="secondary">
                  Contacter le Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
