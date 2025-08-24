import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail,
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  Send,
  User,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  FileText,
  Lightbulb,
  Bug,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ImmersiveLayout } from '@/components/immersive/ImmersiveLayout';
import { useToast } from '@/hooks/use-toast';

export default function Contact() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: '',
    message: '',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
    
    setIsSubmitting(false);
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      priority: '',
      message: '',
      attachments: []
    });
  };

  const contactMethods = [
    {
      title: 'Support Email',
      description: 'Réponse sous 24h en jours ouvrés',
      icon: Mail,
      contact: 'support@medmng.com',
      color: 'from-blue-500 to-indigo-600',
      action: () => window.open('mailto:support@medmng.com')
    },
    {
      title: 'Chat en Direct',
      description: 'Disponible 9h-18h, Lun-Ven',
      icon: MessageCircle,
      contact: 'Chat disponible',
      color: 'from-green-500 to-emerald-600',
      action: () => {} // Open chat widget
    },
    {
      title: 'Téléphone',
      description: 'Support technique urgent',
      icon: Phone,
      contact: '+33 1 23 45 67 89',
      color: 'from-purple-500 to-pink-600',
      action: () => window.open('tel:+33123456789')
    },
    {
      title: 'Documentation',
      description: 'Guides et tutoriels détaillés',
      icon: FileText,
      contact: 'docs.medmng.com',
      color: 'from-orange-500 to-red-600',
      action: () => window.open('/docs', '_blank')
    }
  ];

  const faqCategories = [
    {
      id: 'technical',
      name: 'Problème Technique',
      description: 'Bugs, erreurs, problèmes de performance'
    },
    {
      id: 'account',
      name: 'Compte & Abonnement',
      description: 'Gestion du compte, facturation, abonnement'
    },
    {
      id: 'content',
      name: 'Contenu & Fonctionnalités',
      description: 'Questions sur les items EDN, musiques, etc.'
    },
    {
      id: 'feature',
      name: 'Demande de Fonctionnalité',
      description: 'Suggestions d\'amélioration'
    },
    {
      id: 'other',
      name: 'Autre',
      description: 'Question générale ou autre sujet'
    }
  ];

  const priorityLevels = [
    { id: 'low', name: 'Basse', color: 'bg-green-500/20 text-green-300' },
    { id: 'medium', name: 'Normale', color: 'bg-yellow-500/20 text-yellow-300' },
    { id: 'high', name: 'Haute', color: 'bg-orange-500/20 text-orange-300' },
    { id: 'urgent', name: 'Urgente', color: 'bg-red-500/20 text-red-300' }
  ];

  return (
    <ImmersiveLayout
      variant="medical"
      header={{
        title: "Nous Contacter",
        subtitle: "Notre équipe est là pour vous accompagner",
        icon: <MessageCircle className="h-6 w-6" />,
        backTo: "/help",
        actions: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/help')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Centre d'aide
            </Button>
          </div>
        )
      }}
    >
      <div className="space-y-6">
        {/* Méthodes de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactMethods.map((method, index) => (
            <Card 
              key={index} 
              className="bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              onClick={method.action}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">{method.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{method.description}</p>
                <p className="text-white text-sm font-medium">{method.contact}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="bg-black/20 border border-white/10">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Question Générale
                </TabsTrigger>
                <TabsTrigger value="bug" className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Signaler un Bug
                </TabsTrigger>
                <TabsTrigger value="feature" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Demande de Fonctionnalité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Contactez notre équipe</CardTitle>
                    <CardDescription className="text-gray-400">
                      Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-white">Nom complet</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Votre nom et prénom"
                            required
                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-white">Adresse email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="votre@email.com"
                            required
                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-white">Objet</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="Résumé de votre question"
                          required
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category" className="text-white">Catégorie</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {faqCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div>
                                    <div className="font-medium">{cat.name}</div>
                                    <div className="text-xs text-gray-500">{cat.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="priority" className="text-white">Priorité</Label>
                          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Sélectionnez la priorité" />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityLevels.map((level) => (
                                <SelectItem key={level.id} value={level.id}>
                                  <Badge className={level.color}>
                                    {level.name}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-white">Message</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Décrivez votre question ou problème en détail..."
                          required
                          rows={6}
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bug" className="space-y-6">
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      Signaler un Bug
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Aidez-nous à améliorer MED MNG en signalant les problèmes que vous rencontrez
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-gray-300 text-sm">
                      <p>Avant de signaler un bug, vérifiez :</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Que le problème est reproductible</li>
                        <li>Votre navigateur et système d'exploitation</li>
                        <li>Les étapes exactes pour reproduire le problème</li>
                        <li>Le message d'erreur s'il y en a un</li>
                      </ul>
                      <Button className="w-full">
                        <Bug className="h-4 w-4 mr-2" />
                        Ouvrir le formulaire de bug report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feature" className="space-y-6">
                <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Demande de Fonctionnalité
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Partagez vos idées pour améliorer MED MNG
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-gray-300 text-sm">
                      <p>Pour une demande de fonctionnalité efficace :</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Décrivez le problème que vous voulez résoudre</li>
                        <li>Expliquez la solution que vous envisagez</li>
                        <li>Mentionnez des alternatives que vous avez considérées</li>
                        <li>Indiquez combien d'utilisateurs pourraient bénéficier de cette fonctionnalité</li>
                      </ul>
                      <Button className="w-full">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Soumettre une idée
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Informations de contact et FAQ */}
          <div className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Heures d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-gray-300 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="text-white">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="text-white">10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="text-gray-500">Fermé</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">
                    Support d'urgence disponible 24h/24 pour les abonnés Premium
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Temps de réponse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-500/20 text-green-300">Email</Badge>
                    <span className="text-gray-300 text-sm">&lt; 24h</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-500/20 text-blue-300">Chat</Badge>
                    <span className="text-gray-300 text-sm">&lt; 5 min</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-500/20 text-purple-300">Téléphone</Badge>
                    <span className="text-gray-300 text-sm">Immédiat</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Ressources utiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/help')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Centre d'aide
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('/docs', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://status.medmng.com', '_blank')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Statut des services
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ImmersiveLayout>
  );
}