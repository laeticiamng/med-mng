import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  HelpCircle,
  Bug,
  Lightbulb,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';

// Types
interface Ticket {
  id: string;
  subject: string;
  category: 'bug' | 'question' | 'suggestion' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  content: string;
  author: 'user' | 'support';
  createdAt: Date;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

// FAQ statique (pourrait venir d'une base de données)
const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'Comment fonctionne le système de répétition espacée (SRS) ?',
    answer: 'Le SRS adapte automatiquement les intervalles de révision selon vos performances. Les cartes que vous maîtrisez sont présentées moins fréquemment, tandis que celles difficiles reviennent plus souvent. Cet algorithme optimise la mémorisation à long terme.',
    category: 'Apprentissage',
    helpful: 127
  },
  {
    id: '2',
    question: 'Comment générer une chanson médicale ?',
    answer: 'Rendez-vous sur la page de génération musicale, sélectionnez un item EDN ou entrez un sujet médical. L\'IA Suno créera une chanson personnalisée avec paroles éducatives. Vous pouvez choisir le style musical et télécharger le résultat.',
    category: 'Musique',
    helpful: 89
  },
  {
    id: '3',
    question: 'Les réponses de l\'IA sont-elles fiables médicalement ?',
    answer: 'L\'IA MED-MNG est conçue pour l\'apprentissage pédagogique uniquement. Ses réponses ne constituent pas un avis médical professionnel. Vérifiez toujours les informations avec des sources officielles (Collèges, HAS) et consultez un professionnel de santé pour tout diagnostic.',
    category: 'IA Médicale',
    helpful: 203
  },
  {
    id: '4',
    question: 'Comment importer mes flashcards Anki ?',
    answer: 'Exportez votre deck Anki au format .txt ou .csv. Sur MED-MNG, allez dans Flashcards > Importer, sélectionnez le fichier. Les champs question/réponse seront automatiquement détectés. Vous pouvez les assigner à des items EDN après import.',
    category: 'Flashcards',
    helpful: 56
  },
  {
    id: '5',
    question: 'Comment fonctionne l\'abonnement Premium ?',
    answer: 'L\'abonnement Premium débloque : génération illimitée de chansons, accès complet aux simulations ECOS, MedChat IA avancé, export PDF, et statistiques détaillées. Facturation mensuelle via Stripe, annulation possible à tout moment.',
    category: 'Compte',
    helpful: 145
  },
  {
    id: '6',
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Oui, vos données sont chiffrées et stockées sur des serveurs européens (Supabase). Nous appliquons le RGPD : vous pouvez exporter ou supprimer vos données à tout moment depuis votre profil. Aucune donnée n\'est vendue à des tiers.',
    category: 'Sécurité',
    helpful: 178
  },
];

const CATEGORIES = [
  { value: 'bug', label: 'Bug / Erreur', icon: Bug, color: 'text-destructive' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-500' },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-yellow-500' },
  { value: 'other', label: 'Autre', icon: MessageCircle, color: 'text-muted-foreground' },
];

const STATUS_CONFIG = {
  open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed: { label: 'Fermé', color: 'bg-muted text-muted-foreground', icon: CheckCircle },
};

/**
 * Système de support avec tickets et FAQ
 */
export const SupportTicketSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // État du formulaire de ticket
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'question' as Ticket['category'],
    priority: 'medium' as Ticket['priority'],
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tickets mockés (à remplacer par données Supabase)
  const [tickets] = useState<Ticket[]>([]);

  // Filtrer FAQ
  const filteredFAQ = FAQ_ITEMS.filter(item => {
    const matchesSearch = faqSearch === '' || 
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const faqCategories = [...new Set(FAQ_ITEMS.map(item => item.category))];

  // Soumettre un ticket
  const handleSubmitTicket = async () => {
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (!user) {
      toast.error('Veuillez vous connecter pour soumettre un ticket');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi (à remplacer par appel Supabase)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Ticket envoyé ! Nous vous répondrons sous 24-48h.');
      setTicketForm({
        subject: '',
        category: 'question',
        priority: 'medium',
        message: '',
      });
      setActiveTab('tickets');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Centre d'aide</CardTitle>
              <CardDescription>
                FAQ, tickets de support et assistance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="new" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau ticket
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Mes tickets
                {tickets.filter(t => t.status !== 'closed').length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {tickets.filter(t => t.status !== 'closed').length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-4 mt-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans la FAQ..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {faqCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {filteredFAQ.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun résultat trouvé</p>
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab('new')}
                    className="mt-2"
                  >
                    Poser une question →
                  </Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFAQ.map(item => (
                    <AccordionItem 
                      key={item.id} 
                      value={item.id}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-start gap-3">
                          <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{item.question}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8 text-muted-foreground">
                        <p className="mb-3">{item.answer}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span>👍 {item.helpful} personnes ont trouvé cela utile</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>
            
            {/* New Ticket Tab */}
            <TabsContent value="new" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    placeholder="Résumez votre demande en quelques mots"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select 
                      value={ticketForm.category} 
                      onValueChange={(v) => setTicketForm(prev => ({ ...prev, category: v as Ticket['category'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className={`h-4 w-4 ${cat.color}`} />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priorité</Label>
                    <Select 
                      value={ticketForm.priority}
                      onValueChange={(v) => setTicketForm(prev => ({ ...prev, priority: v as Ticket['priority'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Normale</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre problème ou question en détail..."
                    rows={6}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                
                <Button 
                  className="w-full gap-2" 
                  onClick={handleSubmitTicket}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer le ticket
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {/* My Tickets Tab */}
            <TabsContent value="tickets" className="mt-4">
              {tickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aucun ticket</p>
                  <p className="text-sm">Vous n'avez pas encore créé de ticket de support.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('new')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map(ticket => {
                    const StatusIcon = STATUS_CONFIG[ticket.status].icon;
                    const CategoryIcon = CATEGORIES.find(c => c.value === ticket.category)?.icon || MessageCircle;
                    
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <CategoryIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{ticket.subject}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={STATUS_CONFIG[ticket.status].color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {STATUS_CONFIG[ticket.status].label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {ticket.updatedAt.toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketSystem;
