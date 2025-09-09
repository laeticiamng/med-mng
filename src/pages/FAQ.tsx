import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { ChevronDown, Search, HelpCircle, Music, Stethoscope, Book, Settings, CreditCard } from 'lucide-react';

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>(['general-1']);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const faqCategories = [
    {
      id: 'general',
      title: 'Questions générales',
      icon: HelpCircle,
      color: 'from-blue-500 to-cyan-500',
      questions: [
        {
          id: 'general-1',
          question: 'Qu\'est-ce que MED-MNG ?',
          answer: 'MED-MNG est une plateforme innovante qui génère de la musique thérapeutique personnalisée pour les étudiants en médecine et les professionnels de santé. Elle combine l\'intelligence artificielle et la science de la musique pour créer des expériences sonores adaptées à l\'apprentissage médical.'
        },
        {
          id: 'general-2', 
          question: 'Comment fonctionne la génération musicale ?',
          answer: 'Notre technologie IA analyse vos besoins spécifiques (concentration, détente, mémorisation) et génère des compositions musicales optimisées. Nous utilisons des algorithmes avancés basés sur la neuroscience musicale pour créer des morceaux qui favorisent l\'apprentissage et le bien-être.'
        },
        {
          id: 'general-3',
          question: 'MED-MNG est-il gratuit ?',
          answer: 'MED-MNG propose un plan gratuit avec des fonctionnalités de base et des plans premium pour accéder à toute la bibliothèque musicale, aux fonctionnalités avancées et aux outils d\'analyse.'
        }
      ]
    },
    {
      id: 'music',
      title: 'Génération musicale',
      icon: Music,
      color: 'from-purple-500 to-pink-500',
      questions: [
        {
          id: 'music-1',
          question: 'Combien de temps faut-il pour générer une musique ?',
          answer: 'La génération prend généralement entre 2 à 5 minutes selon la complexité de la demande. Vous pouvez suivre le progrès en temps réel et recevoir des notifications quand c\'est prêt.'
        },
        {
          id: 'music-2',
          question: 'Puis-je personnaliser les musiques générées ?',
          answer: 'Oui, vous pouvez ajuster de nombreux paramètres : tempo, instruments, ambiance, durée, et même ajouter des paroles spécifiques à vos contenus d\'étude.'
        },
        {
          id: 'music-3',
          question: 'Les musiques sont-elles libres de droits ?',
          answer: 'Toutes les musiques générées par MED-MNG sont libres de droits pour votre usage personnel et éducatif. Vous pouvez les télécharger et les utiliser sans restriction.'
        }
      ]
    },
    {
      id: 'medical',
      title: 'Contenu médical',
      icon: Stethoscope,
      color: 'from-green-500 to-emerald-500',
      questions: [
        {
          id: 'medical-1',
          question: 'Le contenu est-il validé médicalement ?',
          answer: 'Oui, tout notre contenu est validé par des professionnels de santé et suit les référentiels officiels de l\'enseignement médical français.'
        },
        {
          id: 'medical-2',
          question: 'Couvrez-vous tous les domaines médicaux ?',
          answer: 'Nous couvrons l\'ensemble du cursus médical : anatomie, physiologie, pathologie, pharmacologie, et les spécialités. Notre base de données s\'enrichit constamment.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <ConsistentBackground>
      <Helmet>
        <title>FAQ - Questions fréquentes | MED-MNG</title>
        <meta name="description" content="Trouvez des réponses à vos questions sur MED-MNG, la plateforme de musique thérapeutique pour l'apprentissage médical." />
      </Helmet>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Questions fréquentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement des réponses à vos questions sur MED-MNG
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {category.questions.length} question{category.questions.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {category.questions.map((item) => (
                    <Collapsible 
                      key={item.id}
                      open={openItems.includes(item.id)}
                      onOpenChange={() => toggleItem(item.id)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-muted/50 rounded-lg transition-colors">
                        <span className="font-medium text-foreground">{item.question}</span>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openItems.includes(item.id) ? 'transform rotate-180' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results */}
        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucune réponse trouvée
            </h3>
            <p className="text-muted-foreground mb-6">
              Essayez avec d'autres mots-clés ou contactez notre support
            </p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-accent/5">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Notre équipe de support est là pour vous aider
            </p>
            <Link
              to="/support"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contacter le support
            </Link>
          </Card>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default FAQ;