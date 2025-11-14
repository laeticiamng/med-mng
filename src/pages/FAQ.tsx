import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, BookOpen, Users, Trophy, Settings } from 'lucide-react';
import { useState } from 'react';

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      icon: BookOpen,
      title: 'Démarrage',
      color: 'text-blue-600',
      questions: [
        {
          question: 'Comment créer un compte sur Med-Mng ?',
          answer: 'Pour créer un compte, cliquez sur le bouton "S\'inscrire" en haut à droite de la page d\'accueil. Remplissez le formulaire avec votre email et choisissez un mot de passe sécurisé. Vous recevrez un email de confirmation pour activer votre compte.',
        },
        {
          question: 'Quelles sont les fonctionnalités principales ?',
          answer: 'Med-Mng propose un journal personnel, des challenges quotidiens, un système de leaderboard, des sessions d\'étude et de méditation, un suivi de progression avec badges et auras, ainsi qu\'une communauté active pour partager vos expériences.',
        },
        {
          question: 'Comment personnaliser mon profil ?',
          answer: 'Accédez à votre profil via le menu utilisateur, puis cliquez sur "Éditer le profil". Vous pouvez modifier votre photo, bio, nom d\'affichage et configurer vos paramètres de confidentialité.',
        },
      ],
    },
    {
      icon: Trophy,
      title: 'Gamification',
      color: 'text-purple-600',
      questions: [
        {
          question: 'Comment fonctionnent les challenges ?',
          answer: 'Les challenges sont des objectifs quotidiens ou hebdomadaires que vous pouvez compléter pour gagner des points et des badges. Consultez la page Challenges pour voir les défis disponibles et votre progression.',
        },
        {
          question: 'Qu\'est-ce que le leaderboard ?',
          answer: 'Le leaderboard classe les utilisateurs selon leurs performances dans différentes catégories (focus, apprentissage, etc.). Gagnez des points en complétant des activités pour grimper dans le classement.',
        },
        {
          question: 'Comment débloquer des badges et auras ?',
          answer: 'Les badges se débloquent en accomplissant des objectifs spécifiques (séries de jours, challenges complétés, etc.). Les auras sont des récompenses visuelles obtenues en atteignant des niveaux élevés dans certaines catégories.',
        },
      ],
    },
    {
      icon: Users,
      title: 'Communauté',
      color: 'text-green-600',
      questions: [
        {
          question: 'Comment interagir avec d\'autres utilisateurs ?',
          answer: 'Vous pouvez suivre d\'autres utilisateurs, liker et commenter leurs posts, participer aux challenges en équipe, et partager vos réalisations dans le fil d\'activité.',
        },
        {
          question: 'Comment créer un post ?',
          answer: 'Allez sur la page Posts, cliquez sur "Nouveau Post", rédigez votre contenu, ajoutez des tags si souhaité, et publiez. Votre post apparaîtra dans le fil d\'actualité de vos abonnés.',
        },
        {
          question: 'Puis-je rejoindre une équipe ?',
          answer: 'Oui ! Consultez la page Équipes pour voir les équipes disponibles ou créer la vôtre. Les équipes permettent de participer à des challenges collaboratifs et de partager des objectifs communs.',
        },
      ],
    },
    {
      icon: Settings,
      title: 'Paramètres',
      color: 'text-orange-600',
      questions: [
        {
          question: 'Comment gérer mes notifications ?',
          answer: 'Accédez à Paramètres > Notifications pour configurer vos préférences. Vous pouvez choisir les types de notifications à recevoir (email, push, in-app) et leur fréquence.',
        },
        {
          question: 'Comment protéger ma vie privée ?',
          answer: 'Dans Profil > Confidentialité, vous pouvez contrôler qui peut voir votre profil, vos activités, vos statistiques, et qui peut vous contacter. Vous pouvez également rendre votre profil privé.',
        },
        {
          question: 'Comment exporter mes données ?',
          answer: 'Conformément au RGPD, vous pouvez exporter toutes vos données depuis Paramètres > Mes Données. Un fichier ZIP contenant vos informations vous sera envoyé par email sous 48h.',
        },
      ],
    },
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <>
      <Helmet>
        <title>FAQ - Questions Fréquentes | Med-Mng</title>
        <meta name="description" content="Réponses aux questions fréquemment posées sur Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.help}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Centre d'Aide
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Questions Fréquentes
            </h1>
            <p className="text-lg text-gray-600">
              Trouvez rapidement des réponses à vos questions
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher une question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          {filteredCategories.length > 0 ? (
            <div className="space-y-6">
              {filteredCategories.map((category, categoryIndex) => {
                const Icon = category.icon;
                return (
                  <Card key={categoryIndex}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${category.color}`} />
                        {category.title}
                        <Badge variant="secondary">{category.questions.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez avec d'autres mots-clés ou parcourez les catégories
                </p>
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Réinitialiser la recherche
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact CTA */}
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="text-center py-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vous n'avez pas trouvé de réponse ?
              </h3>
              <p className="text-gray-600 mb-4">
                Notre équipe est là pour vous aider
              </p>
              <Link to={ROUTE_PATHS.helpContact}>
                <Button>Contacter le Support</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
