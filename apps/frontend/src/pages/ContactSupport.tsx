import logger from '@/lib/logger';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Mail, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ContactSupport() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    priority: 'normal',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Import contact support service
      const { contactSupportService } = await import('@/services/contact-support.service');

      // Validate form
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        throw new Error('Tous les champs sont requis');
      }

      // Create ticket
      await contactSupportService.createTicket({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        category: (formData.category as any) || 'other',
        priority: (formData.priority as any) || 'medium',
      });

      // Send email notification
      try {
        await contactSupportService.sendEmailNotification({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          category: (formData.category as any) || 'other',
        });
      } catch (emailErr) {
        logger.warn('Email notification failed but ticket was created', emailErr);
      }

      // Log submission
      await contactSupportService.logContactSubmission({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: '',
          priority: 'normal',
        });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setIsLoading(false);
    }
  };

  const supportCategories = [
    { value: 'account', label: 'Compte & Connexion' },
    { value: 'technical', label: 'Problème Technique' },
    { value: 'billing', label: 'Facturation & Abonnement' },
    { value: 'features', label: 'Fonctionnalités' },
    { value: 'bug', label: 'Signaler un Bug' },
    { value: 'feedback', label: 'Suggestions & Feedback' },
    { value: 'other', label: 'Autre' },
  ];

  const responseTimeInfo = [
    {
      priority: 'Urgent',
      time: '< 2 heures',
      icon: '🔴',
      description: 'Problèmes bloquants',
    },
    {
      priority: 'Normal',
      time: '< 24 heures',
      icon: '🟡',
      description: 'Questions générales',
    },
    {
      priority: 'Faible',
      time: '< 48 heures',
      icon: '🟢',
      description: 'Suggestions & feedback',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contacter le Support | Med-Mng</title>
        <meta name="description" content="Contactez notre équipe d'assistance pour obtenir de l'aide" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.help}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Centre d'Aide
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Contacter le Support
            </h1>
            <p className="text-lg text-gray-600">
              Notre équipe est là pour vous aider
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Formulaire de Contact
                  </CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Message envoyé !
                      </h3>
                      <p className="text-gray-600">
                        Nous avons bien reçu votre message et vous répondrons sous peu.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Jean Dupont"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="jean.dupont@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Catégorie *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {supportCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priorité</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                          >
                            <SelectTrigger id="priority">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">🟢 Faible</SelectItem>
                              <SelectItem value="normal">🟡 Normal</SelectItem>
                              <SelectItem value="high">🔴 Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet *</Label>
                        <Input
                          id="subject"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="Résumé de votre demande"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Décrivez votre problème ou votre question en détail..."
                          rows={8}
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Envoyer le message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Response Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Temps de Réponse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {responseTimeInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {info.priority} - {info.time}
                        </div>
                        <div className="text-sm text-gray-600">{info.description}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Besoin d'une réponse rapide ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to={ROUTE_PATHS.helpFaq}>
                    <Button variant="outline" className="w-full justify-start">
                      Consulter la FAQ
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.helpTutorials}>
                    <Button variant="outline" className="w-full justify-start">
                      Voir les tutoriels
                    </Button>
                  </Link>
                  <Link to={ROUTE_PATHS.helpSearch}>
                    <Button variant="outline" className="w-full justify-start">
                      Rechercher dans l'aide
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Autres moyens de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <div className="text-gray-600">support@med-mng.com</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Disponibilité</div>
                    <div className="text-gray-600">Lun-Ven: 9h-18h (CET)</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
