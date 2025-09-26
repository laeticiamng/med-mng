import React, { useState } from 'react';
import { HelpCircle, Mail, MessageCircle, Phone, Search, Book, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Comment accéder aux items EDN ?',
    answer: 'Rendez-vous dans la section "EDN Items" depuis le menu principal. Vous y trouverez tous les contenus organisés par spécialité médicale.',
    category: 'utilisation'
  },
  {
    id: '2',
    question: 'La musique générée ne se lance pas',
    answer: 'Vérifiez que votre navigateur autorise la lecture automatique et que le volume n\'est pas coupé. Essayez de rafraîchir la page.',
    category: 'technique'
  },
  {
    id: '3',
    question: 'Comment modifier mon profil ?',
    answer: 'Accédez à votre profil via l\'icône utilisateur en haut à droite, puis cliquez sur "Modifier" pour mettre à jour vos informations.',
    category: 'compte'
  },
  {
    id: '4',
    question: 'Puis-je utiliser MED-MNG hors ligne ?',
    answer: 'Certaines fonctionnalités de base sont disponibles hors ligne, mais la génération musicale et les nouveaux contenus nécessitent une connexion.',
    category: 'utilisation'
  }
];

export const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'normal'
    });
  };

  return (
    <>
      <Helmet>
        <title>Support Technique - MED-MNG</title>
        <meta name="description" content="Centre d'aide et support technique MED-MNG - FAQ, contact et assistance" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Centre de Support</h1>
            <p className="text-muted-foreground">Trouvez rapidement l'aide dont vous avez besoin</p>
          </div>
        </div>

        {/* Contact rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Réponse sous 24h en moyenne
              </p>
              <Button className="w-full" asChild>
                <a href="mailto:support@med-mng.fr">
                  support@med-mng.fr
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat en direct
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Disponible 9h-18h (jours ouvrés)
              </p>
              <Button variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Démarrer le chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Assistance téléphonique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Support premium uniquement
              </p>
              <Button variant="outline" className="w-full">
                +33 1 23 45 67 89
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">Questions fréquentes</TabsTrigger>
            <TabsTrigger value="contact">Nous contacter</TabsTrigger>
            <TabsTrigger value="status">État des services</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            {/* Recherche FAQ */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans la FAQ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                    >
                      Tous
                    </Button>
                    <Button
                      variant={selectedCategory === 'utilisation' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory('utilisation')}
                    >
                      Utilisation
                    </Button>
                    <Button
                      variant={selectedCategory === 'technique' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory('technique')}
                    >
                      Technique
                    </Button>
                    <Button
                      variant={selectedCategory === 'compte' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory('compte')}
                    >
                      Compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQ.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune question trouvée</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQ.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        {item.question}
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Formulaire de contact</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nom complet</label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sujet</label>
                    <Input
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priorité</label>
                    <div className="flex gap-2 mt-2">
                      {['low', 'normal', 'high', 'urgent'].map((priority) => (
                        <Button
                          key={priority}
                          type="button"
                          variant={contactForm.priority === priority ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContactForm(prev => ({ ...prev, priority }))}
                        >
                          {priority === 'low' && 'Faible'}
                          {priority === 'normal' && 'Normale'}
                          {priority === 'high' && 'Élevée'}
                          {priority === 'urgent' && 'Urgente'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={5}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Services opérationnels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'Plateforme principale',
                    'Base de données EDN',
                    'Génération musicale IA',
                    'Système d\'authentification',
                    'API de synchronisation'
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-green-50 border border-green-200">
                      <span className="text-sm">{service}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Opérationnel
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance planifiée</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Prochaine maintenance :</strong><br />
                      Dimanche 29 septembre, 2h00-4h00<br />
                      <em>Mise à jour des serveurs et optimisations</em>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historique des incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Ralentissement de la génération musicale</p>
                      <p className="text-xs text-muted-foreground">25 septembre 2024, 14h30-15h45</p>
                    </div>
                    <Badge variant="outline">Résolu</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Maintenance programmée réussie</p>
                      <p className="text-xs text-muted-foreground">22 septembre 2024, 2h00-3h15</p>
                    </div>
                    <Badge variant="outline">Terminé</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Support;