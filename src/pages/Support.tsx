import React, { useState } from 'react';
import { SubPageLayout } from '@/components/platform/SubPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle, MessageSquare, Book, Phone, Mail, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Support: React.FC = () => {
  const { toast } = useToast();
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  });
  const [openFaqItems, setOpenFaqItems] = useState<string[]>([]);

  const faqItems = [
    {
      id: '1',
      question: 'Comment générer une musique pédagogique ?',
      answer: 'Rendez-vous dans la section "Générateur Musical", sélectionnez vos paroles EDN, choisissez un style musical et cliquez sur "Générer". La musique sera créée automatiquement avec l\'IA.'
    },
    {
      id: '2',
      question: 'Comment accéder aux items EDN ?',
      answer: 'Dans le menu principal, cliquez sur "EDN - Items" pour accéder à la bibliothèque complète de 365+ items de connaissances médicales organisés par spécialités.'
    },
    {
      id: '3',
      question: 'Que sont les ECOS ?',
      answer: 'Les ECOS (Examens Cliniques Objectifs Structurés) sont des simulations d\'examens médicaux. Accédez-y via le menu "ECOS" pour pratiquer différents scénarios cliniques.'
    },
    {
      id: '4',
      question: 'Comment suivre ma progression ?',
      answer: 'Utilisez la section "Analytics" pour voir vos statistiques détaillées : temps d\'étude, scores par spécialité, progression hebdomadaire et objectifs personnalisés.'
    },
    {
      id: '5',
      question: 'Comment utiliser l\'Assistant IA ?',
      answer: 'L\'Assistant IA est accessible via "Chat IA". Posez vos questions médicales et obtenez des réponses détaillées avec explications, physiopathologie et recommandations.'
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@med-mng.com',
      details: 'Réponse sous 24h'
    },
    {
      icon: MessageSquare,
      title: 'Chat en Direct',
      description: 'Assistance immédiate',
      details: 'Lun-Ven 9h-18h'
    },
    {
      icon: Phone,
      title: 'Support Téléphonique',
      description: '+33 1 XX XX XX XX',
      details: 'Urgences uniquement'
    }
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.message) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Simulation d'envoi
    toast({
      title: "Ticket créé",
      description: "Votre demande a été enregistrée. Vous recevrez une réponse sous 24h.",
    });

    setTicketForm({
      subject: '',
      category: '',
      message: '',
      priority: 'normal'
    });
  };

  const toggleFaqItem = (id: string) => {
    setOpenFaqItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <SubPageLayout
      title="Support & Aide"
      subtitle="Obtenez de l'aide pour utiliser la plateforme MED-MNG"
      breadcrumbs={[
        { label: 'Accueil', href: '/' },
        { label: 'Support', href: '/support' }
      ]}
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <method.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium">{method.title}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
                <p className="text-xs text-primary mt-1">{method.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Questions Fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faqItems.map((item) => (
                <Collapsible key={item.id}>
                  <CollapsibleTrigger 
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    onClick={() => toggleFaqItem(item.id)}
                  >
                    <span className="text-left font-medium">{item.question}</span>
                    {openFaqItems.includes(item.id) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-3">
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Créer un Ticket de Support</CardTitle>
            <p className="text-sm text-muted-foreground">
              Décrivez votre problème ou votre question, nous vous répondrons rapidement.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sujet *</label>
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Résumez votre demande"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Catégorie *</label>
                  <Select 
                    value={ticketForm.category} 
                    onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technique">Problème technique</SelectItem>
                      <SelectItem value="compte">Gestion de compte</SelectItem>
                      <SelectItem value="contenu">Contenu pédagogique</SelectItem>
                      <SelectItem value="facturation">Facturation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Priorité</label>
                <Select 
                  value={ticketForm.priority} 
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Décrivez votre problème ou votre question en détail..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Envoyer le Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Ressources Utiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Guides Utilisateur</h4>
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                    Guide de Démarrage Rapide
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                    Utilisation du Générateur Musical
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                    Optimiser ses Révisions EDN
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Tutoriels Vidéo</h4>
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                    Première Connexion (5 min)
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                    Créer sa Première Musique (8 min)
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                    Naviguer dans les ECOS (12 min)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default Support;