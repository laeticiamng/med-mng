import React, { useState } from 'react';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Lightbulb,
  MessageCircle,
  BookOpen,
  Settings,
  Shield,
  CreditCard,
  Phone
} from 'lucide-react';

const NewFAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState(new Set(['0-0']));
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    { id: 'all', label: 'Toutes', icon: BookOpen },
    { id: 'general', label: 'Général', icon: Lightbulb },
    { id: 'usage', label: 'Utilisation', icon: MessageCircle },
    { id: 'technical', label: 'Technique', icon: Settings },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'security', label: 'Sécurité', icon: Shield }
  ];

  const faqs = [
    {
      category: 'general',
      questions: [
        {
          question: 'Qu\'est-ce que MED-MNG ?',
          answer: 'MED-MNG est une plateforme révolutionnaire qui utilise l\'intelligence artificielle pour générer de la musique thérapeutique personnalisée spécialement conçue pour les étudiants et professionnels de médecine. Notre technologie combine neurosciences, musicothérapie et apprentissage adaptatif pour optimiser votre concentration et rétention d\'information.',
          tags: ['plateforme', 'IA', 'médecine']
        },
        {
          question: 'Comment fonctionne la génération musicale par IA ?',
          answer: 'Notre IA analyse vos paramètres d\'entrée (domaine médical, humeur souhaitée, durée, complexité) et génère en temps réel une composition musicale unique. L\'algorithme prend en compte les recherches en neurosciences sur l\'impact de la musique sur la cognition et adapte automatiquement les fréquences, rythmes et harmonies pour maximiser votre efficacité d\'apprentissage.',
          tags: ['IA', 'génération', 'algorithme']
        },
        {
          question: 'Puis-je utiliser MED-MNG gratuitement ?',
          answer: 'Oui ! MED-MNG propose un plan gratuit qui inclut la génération de 5 chansons par mois, l\'accès à votre bibliothèque personnelle et les fonctionnalités de base. Pour des besoins plus intensifs, nos plans premium offrent des générations illimitées, des fonctionnalités avancées et un support prioritaire.',
          tags: ['gratuit', 'plans', 'premium']
        }
      ]
    },
    {
      category: 'usage',
      questions: [
        {
          question: 'Comment créer ma première chanson ?',
          answer: 'C\'est très simple ! Rendez-vous dans la section "Créer", choisissez votre domaine médical d\'étude (anatomie, cardiologie, etc.), sélectionnez l\'ambiance souhaitée (relaxation, concentration, énergie), ajustez la durée et cliquez sur "Générer". L\'IA créera votre musique personnalisée en quelques secondes.',
          tags: ['création', 'première chanson', 'tutoriel']
        },
        {
          question: 'Puis-je télécharger mes créations ?',
          answer: 'Absolument ! Toutes vos créations peuvent être téléchargées au format MP3 haute qualité (320 kbps) directement depuis votre bibliothèque. Vous pouvez également les exporter vers d\'autres plateformes ou les partager avec vos collègues d\'étude.',
          tags: ['téléchargement', 'MP3', 'export']
        },
        {
          question: 'Comment partager mes musiques avec d\'autres étudiants ?',
          answer: 'Utilisez la fonction de partage dans votre bibliothèque. Vous pouvez générer un lien de partage sécurisé, envoyer directement par email, ou publier dans les groupes d\'étude de la communauté MED-MNG. Les droits d\'accès sont configurables selon vos préférences.',
          tags: ['partage', 'collaboration', 'communauté']
        },
        {
          question: 'Puis-je modifier une chanson après sa génération ?',
          answer: 'Actuellement, chaque génération produit une œuvre unique. Cependant, vous pouvez sauvegarder vos paramètres préférés comme "templates" et régénérer avec des variations. Notre équipe travaille sur des fonctionnalités d\'édition avancées pour les prochaines versions.',
          tags: ['modification', 'édition', 'templates']
        }
      ]
    },
    {
      category: 'technical',
      questions: [
        {
          question: 'Quels formats audio sont supportés ?',
          answer: 'MED-MNG génère et exporte principalement en MP3 haute qualité (320 kbps). Nous supportons également l\'export en WAV pour une qualité studio. D\'autres formats (FLAC, AAC) seront bientôt disponibles selon la demande des utilisateurs.',
          tags: ['formats', 'audio', 'qualité']
        },
        {
          question: 'L\'application fonctionne-t-elle hors ligne ?',
          answer: 'La génération musicale nécessite une connexion internet pour accéder à nos serveurs IA. Cependant, une fois téléchargées, vos musiques peuvent être écoutées hors ligne. Nous développons actuellement une version avec génération locale pour une utilisation entièrement hors ligne.',
          tags: ['hors ligne', 'connexion', 'téléchargement']
        },
        {
          question: 'Sur quels appareils puis-je utiliser MED-MNG ?',
          answer: 'MED-MNG est une application web responsive qui fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge). Compatible avec ordinateurs, tablettes et smartphones. Des applications mobiles natives iOS et Android sont en développement.',
          tags: ['compatibilité', 'navigateurs', 'mobile']
        },
        {
          question: 'Mes données sont-elles sécurisées ?',
          answer: 'Absolument ! Nous utilisons un chiffrement AES-256 pour toutes les données, authentification à deux facteurs optionnelle, et nos serveurs sont certifiés SOC 2. Vos créations musicales et données personnelles sont stockées de manière sécurisée et ne sont jamais partagées sans votre consentement explicite.',
          tags: ['sécurité', 'chiffrement', 'confidentialité']
        }
      ]
    },
    {
      category: 'billing',
      questions: [
        {
          question: 'Quels sont les tarifs des plans premium ?',
          answer: 'Plan Étudiant : 9,99€/mois (générations illimitées, fonctionnalités avancées). Plan Professionnel : 19,99€/mois (tout le plan étudiant + collaboration d\'équipe + API access). Plan Institution : tarifs personnalisés pour écoles et hôpitaux. Tous les plans incluent un essai gratuit de 14 jours.',
          tags: ['tarifs', 'plans', 'premium']
        },
        {
          question: 'Puis-je annuler mon abonnement à tout moment ?',
          answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L\'annulation prend effet à la fin de votre période de facturation en cours. Vous conservez l\'accès aux fonctionnalités premium jusqu\'à cette date et vos données restent accessibles.',
          tags: ['annulation', 'abonnement', 'facturation']
        },
        {
          question: 'Y a-t-il des réductions pour les étudiants ?',
          answer: 'Oui ! Nous offrons 50% de réduction sur tous nos plans pour les étudiants en médecine avec justificatif. Des tarifs préférentiels sont également disponibles pour les institutions académiques et les résidences médicales. Contactez notre équipe pour plus d\'informations.',
          tags: ['réductions', 'étudiants', 'académique']
        }
      ]
    },
    {
      category: 'security',
      questions: [
        {
          question: 'Comment mes données personnelles sont-elles protégées ?',
          answer: 'Nous respectons strictement le RGPD et utilisons des standards de sécurité bancaires : chiffrement AES-256, authentification multi-facteurs, audits de sécurité réguliers. Vos données ne sont jamais vendues et sont stockées sur des serveurs sécurisés en Europe.',
          tags: ['RGPD', 'protection', 'données']
        },
        {
          question: 'Puis-je supprimer définitivement mon compte ?',
          answer: 'Oui, vous pouvez supprimer définitivement votre compte depuis les paramètres. Cette action est irréversible et supprime toutes vos données, créations et paramètres. Nous vous recommandons d\'exporter vos musiques préférées avant la suppression.',
          tags: ['suppression', 'compte', 'données']
        }
      ]
    }
  ];

  const filteredFaqs = faqs.filter(category => {
    if (selectedCategory !== 'all' && category.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      return category.questions.some(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  }).map(category => ({
    ...category,
    questions: searchTerm 
      ? category.questions.filter(q => 
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : category.questions
  })).filter(category => category.questions.length > 0);

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const globalIndex = `${categoryIndex}-${questionIndex}`;
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(globalIndex)) {
      newOpenItems.delete(globalIndex);
    } else {
      newOpenItems.add(globalIndex);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <ConsistentBackground variant="secondary">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Questions Fréquentes"
          subtitle="Trouvez rapidement les réponses à vos questions sur MED-MNG"
          icon={HelpCircle}
        />

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une question..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {faqCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* FAQ Content */}
        <div className="space-y-6">
          {filteredFaqs.map((category, categoryIndex) => (
            <Card key={`${category.category}-${categoryIndex}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {faqCategories.find(c => c.id === category.category)?.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const globalIndex = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openItems.has(globalIndex);
                    
                    return (
                      <Collapsible 
                        key={questionIndex} 
                        open={isOpen} 
                        onOpenChange={() => toggleItem(categoryIndex, questionIndex)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{faq.question}</h3>
                            <div className="flex flex-wrap gap-1">
                              {faq.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {isOpen ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 py-3">
                          <div className="prose prose-sm max-w-none">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucune question trouvée</h3>
              <p className="text-muted-foreground mb-6">
                Essayez avec d'autres termes de recherche ou parcourez les catégories.
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Effacer la recherche
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Vous ne trouvez pas votre réponse ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Notre équipe de support est là pour vous aider. Nous nous engageons à répondre dans les 24h.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter le support
              </Button>
              <Button variant="outline" className="flex-1">
                <BookOpen className="h-4 w-4 mr-2" />
                Consulter la documentation
              </Button>
              <Button variant="outline" className="flex-1">
                Rejoindre la communauté
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConsistentBackground>
  );
};

export default NewFAQ;