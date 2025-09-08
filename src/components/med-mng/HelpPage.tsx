import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Music,
  Play,
  Heart,
  Settings,
  User,
  CreditCard,
  Shield,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const faqItems: FAQItem[] = [
    {
      id: '1',
      category: 'Génération musicale',
      question: 'Comment générer une musique éducative ?',
      answer: 'Pour générer une musique éducative, rendez-vous dans l\'onglet "Générer", saisissez votre contenu médical, choisissez un style musical et cliquez sur "Générer". L\'IA créera une musique personnalisée en quelques minutes.',
      tags: ['génération', 'musique', 'IA', 'création']
    },
    {
      id: '2', 
      category: 'Compte et abonnement',
      question: 'Quels sont les différents types d\'abonnements disponibles ?',
      answer: 'MED-MNG propose plusieurs formules : Standard (gratuit, 10 générations/mois), Premium (€9.99/mois, 50 générations), et Pro (€19.99/mois, générations illimitées + fonctionnalités avancées).',
      tags: ['abonnement', 'prix', 'limite', 'premium']
    },
    {
      id: '3',
      category: 'Utilisation',
      question: 'Comment organiser ma bibliothèque musicale ?',
      answer: 'Dans l\'onglet "Bibliothèque", vous pouvez créer des playlists thématiques, ajouter des favoris, tagger vos musiques par spécialité médicale et utiliser la recherche avancée pour retrouver facilement vos contenus.',
      tags: ['bibliothèque', 'organisation', 'playlist', 'favoris']
    },
    {
      id: '4',
      category: 'Technique',
      question: 'Que faire si la génération échoue ?',
      answer: 'Si une génération échoue, vérifiez votre connexion internet, votre quota disponible, et la taille de votre contenu. Si le problème persiste, contactez notre support technique.',
      tags: ['erreur', 'génération', 'problème', 'technique']
    },
    {
      id: '5',
      category: 'Sécurité',
      question: 'Mes données médicales sont-elles sécurisées ?',
      answer: 'Oui, toutes vos données sont chiffrées et stockées conformément au RGPD. Nous n\'utilisons jamais vos contenus médicaux pour entraîner nos modèles IA ou les partager avec des tiers.',
      tags: ['sécurité', 'RGPD', 'données', 'confidentialité']
    },
    {
      id: '6',
      category: 'Utilisation',
      question: 'Puis-je partager mes musiques avec d\'autres étudiants ?',
      answer: 'Oui, vous pouvez partager vos créations via des liens sécurisés ou les exporter pour les utiliser dans vos présentations et cours.',
      tags: ['partage', 'export', 'collaboration', 'étudiants']
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqItems.map(item => item.category)))];

  const filteredFAQ = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Message envoyé !",
        description: "Nous vous répondrons dans les plus brefs délais."
      });

      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre message. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const quickActions = [
    {
      icon: Music,
      title: 'Guide de génération',
      description: 'Apprenez à créer vos premières musiques éducatives',
      action: () => toast({ title: "Guide", description: "Redirection vers le guide..." })
    },
    {
      icon: Play,
      title: 'Tutoriels vidéo',
      description: 'Regardez nos tutoriels pas à pas',
      action: () => toast({ title: "Tutoriels", description: "Redirection vers les vidéos..." })
    },
    {
      icon: Book,
      title: 'Documentation',
      description: 'Consultez la documentation complète',
      action: () => toast({ title: "Documentation", description: "Redirection vers la doc..." })
    },
    {
      icon: MessageCircle,
      title: 'Communauté',
      description: 'Rejoignez notre communauté d\'étudiants',
      action: () => toast({ title: "Communauté", description: "Redirection vers Discord..." })
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Centre d'aide MED-MNG
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe de support dédiée
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={action.action}
            >
              <CardContent className="pt-6 text-center">
                <action.icon className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-medium mb-1">{action.title}</h3>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher dans la FAQ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category === 'all' ? 'Toutes les catégories' : category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Items */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Questions fréquentes
                    <Badge variant="secondary" className="ml-2">
                      {filteredFAQ.length} résultat{filteredFAQ.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredFAQ.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Aucun résultat trouvé</p>
                      <p className="text-sm">
                        Essayez de modifier votre recherche ou sélectionnez une autre catégorie
                      </p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-2">
                      {filteredFAQ.map((item, index) => (
                        <AccordionItem key={item.id} value={item.id}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-start gap-3 w-full">
                              <Badge variant="outline" className="text-xs shrink-0">
                                {item.category}
                              </Badge>
                              <span className="flex-1">{item.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-2 space-y-3">
                              <p className="text-muted-foreground">{item.answer}</p>
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Guide de démarrage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Découvrez les bases de MED-MNG et créez votre première musique éducative en quelques étapes simples.
                    </p>
                    <Button className="w-full">
                      Commencer le guide
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-blue-500" />
                      Techniques avancées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Apprenez les techniques avancées pour optimiser vos créations musicales et améliorer votre apprentissage.
                    </p>
                    <Button variant="outline" className="w-full">
                      Voir les techniques
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-500" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Personnalisez votre expérience MED-MNG selon vos préférences et besoins d'apprentissage.
                    </p>
                    <Button variant="outline" className="w-full">
                      Guide configuration
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      Sécurité et confidentialité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Comprenez comment nous protégeons vos données médicales et respectons votre vie privée.
                    </p>
                    <Button variant="outline" className="w-full">
                      En savoir plus
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nous contacter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Nom</label>
                          <Input
                            value={contactForm.name}
                            onChange={(e) => setContactForm(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Sujet</label>
                        <Input
                          value={contactForm.subject}
                          onChange={(e) => setContactForm(prev => ({
                            ...prev,
                            subject: e.target.value
                          }))}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Priorité</label>
                        <select
                          value={contactForm.priority}
                          onChange={(e) => setContactForm(prev => ({
                            ...prev,
                            priority: e.target.value as any
                          }))}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                        >
                          <option value="low">Faible</option>
                          <option value="normal">Normale</option>
                          <option value="high">Élevée</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm(prev => ({
                            ...prev,
                            message: e.target.value
                          }))}
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Autres moyens de contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">support@med-mng.fr</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Chat en direct</p>
                          <p className="text-sm text-muted-foreground">Lun-Ven 9h-18h</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Téléphone</p>
                          <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Temps de réponse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Demandes urgentes</span>
                        <Badge variant="destructive">2-4h</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Demandes normales</span>
                        <Badge variant="secondary">24-48h</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Demandes générales</span>
                        <Badge variant="outline">2-5 jours</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};