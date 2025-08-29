import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { Search, MessageCircle, Book, Settings, Zap, Users, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Toutes', icon: Book },
    { id: 'getting-started', label: 'Démarrage', icon: Zap },
    { id: 'features', label: 'Fonctionnalités', icon: Settings },
    { id: 'account', label: 'Compte', icon: Users },
    { id: 'technical', label: 'Technique', icon: MessageCircle }
  ];

  const faqs = [
    {
      id: '1',
      category: 'getting-started',
      question: 'Comment créer mon premier projet sur MED-MNG ?',
      answer: `Pour créer votre premier projet :
      
1. Connectez-vous à votre compte MED-MNG
2. Accédez à la section "Créer" depuis le menu principal
3. Choisissez le type de projet (EDN, ECOS, ou Personnalisé)
4. Remplissez les informations requises
5. Cliquez sur "Créer le projet"

Votre projet sera automatiquement sauvegardé et accessible depuis votre dashboard.`,
      tags: ['projet', 'création', 'démarrage']
    },
    {
      id: '2',
      category: 'features',
      question: 'Qu\'est-ce que le module EDN ?',
      answer: `Le module EDN (Examens Dématérialisés Nationaux) est un système complet qui permet de :

• Créer des examens interactifs et immersifs
• Gérer des contenus pédagogiques par items
• Suivre les performances et analytics
• Générer de la musique mnémotechnique
• Organiser des simulations d'examens

Il s'adapte automatiquement au niveau de l'utilisateur avec des contenus Rang A (fondamentaux) et Rang B (avancés).`,
      tags: ['EDN', 'examens', 'fonctionnalités']
    },
    {
      id: '3',
      category: 'features',
      question: 'Comment utiliser les simulations ECOS ?',
      answer: `Les simulations ECOS (Examens Cliniques Objectifs Structurés) permettent de :

1. **Sélectionner un scénario** depuis la bibliothèque
2. **Pratiquer en mode simulation** avec des cas cliniques réels
3. **Recevoir des évaluations détaillées** de vos performances
4. **Suivre vos progrès** avec des analytics personnalisés

Chaque simulation inclut des ressources multimédia, des grilles d'évaluation, et des feedbacks automatisés.`,
      tags: ['ECOS', 'simulation', 'clinique']
    },
    {
      id: '4',
      category: 'account',
      question: 'Comment modifier mes informations de profil ?',
      answer: `Pour modifier votre profil :

1. Accédez à **Paramètres** > **Profil** depuis le menu utilisateur
2. Modifiez les informations souhaitées :
   - Nom d'affichage
   - Biographie
   - Photo de profil
   - Préférences de notification
3. Cliquez sur **Sauvegarder** pour valider les changements

Vos informations sont automatiquement synchronisées sur toute la plateforme.`,
      tags: ['profil', 'paramètres', 'compte']
    },
    {
      id: '5',
      category: 'account',
      question: 'Comment fonctionne le système de crédits ?',
      answer: `Le système de crédits MED-MNG fonctionne ainsi :

**Crédits gratuits :** 100 crédits/mois pour les comptes gratuits
**Utilisation :**
• Génération de musique : 10 crédits
• Création de quiz : 5 crédits  
• Analytics avancés : 2 crédits
• Export de données : 1 crédit

**Renouvellement :** Automatique chaque mois
**Upgrade :** Abonnements Premium et Enterprise pour plus de crédits`,
      tags: ['crédits', 'abonnement', 'limite']
    },
    {
      id: '6',
      category: 'technical',
      question: 'Pourquoi ma page se recharge-t-elle lors de la navigation ?',
      answer: `Si vos pages se rechargent complètement, cela peut être dû à :

**Causes courantes :**
• Navigation via des liens externes au lieu de liens internes
• Problème de cache du navigateur
• Extension de navigateur interférant

**Solutions :**
1. Videz le cache de votre navigateur
2. Désactivez temporairement les extensions
3. Utilisez la navigation interne de la plateforme
4. Contactez le support si le problème persiste`,
      tags: ['navigation', 'rechargement', 'technique']
    },
    {
      id: '7',
      category: 'technical',
      question: 'Mes données sont-elles sécurisées ?',
      answer: `Oui, la sécurité est notre priorité :

**Chiffrement :** Toutes les données sont chiffrées en transit et au repos
**Authentification :** Système d'authentification sécurisé avec Supabase
**Permissions :** Contrôle d'accès granulaire par utilisateur
**Conformité :** Respect du RGPD et des normes de sécurité médicales
**Sauvegardes :** Sauvegardes automatiques et redondantes

Vous pouvez exporter vos données à tout moment depuis les paramètres.`,
      tags: ['sécurité', 'données', 'RGPD']
    },
    {
      id: '8',
      category: 'features',
      question: 'Comment utiliser l\'analytics et le monitoring ?',
      answer: `Le système d'analytics offre :

**Tableaux de bord :**
• Métriques de performance en temps réel
• Suivi des progrès d'apprentissage
• Analytics d'utilisation des fonctionnalités

**Monitoring système :**
• État de santé des services
• Temps de réponse des API
• Alertes automatiques

**Exports :**
• Données utilisateur (JSON/CSV)
• Rapports d'activité
• Métriques personnalisées

Accédez via le menu **Analytics** ou **Monitoring**.`,
      tags: ['analytics', 'monitoring', 'métriques']
    },
    {
      id: '9',
      category: 'getting-started',
      question: 'Comment contacter le support technique ?',
      answer: `Plusieurs options de support :

**Support intégré :**
• Assistant IA disponible 24/7
• Chat en direct pendant les heures ouvrables
• Base de connaissances interactive

**Contact direct :**
• Email : support@med-mng.com
• Formulaire de contact sur la page Support
• Ticket de support depuis votre dashboard

**Urgences :**
• Email prioritaire : urgent@med-mng.com
• Réponse garantie sous 2 heures

**Communauté :**
• Forum communautaire
• Discussions avec d'autres utilisateurs`,
      tags: ['support', 'contact', 'aide']
    },
    {
      id: '10',
      category: 'technical',
      question: 'Quels navigateurs sont supportés ?',
      answer: `MED-MNG est optimisé pour :

**Navigateurs recommandés :**
• Chrome 90+ (recommandé)
• Firefox 88+
• Safari 14+
• Edge 90+

**Fonctionnalités requises :**
• JavaScript activé
• Cookies activés
• LocalStorage disponible
• Connexion internet stable

**Mobile :**
• Interface responsive
• Support des touches tactiles
• Optimisé pour tablettes

Pour une expérience optimale, utilisez la dernière version de Chrome.`,
      tags: ['navigateur', 'compatibilité', 'technique']
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const helpfulLinks = [
    { title: 'Documentation complète', url: '/documentation', icon: Book },
    { title: 'Guide utilisateur', url: '/documentation', icon: Users },
    { title: 'Support technique', url: '/support', icon: MessageCircle },
    { title: 'Communauté', url: '/community', icon: Users }
  ];

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Questions Fréquentes
            </h1>
            <p className="text-white/70 text-lg mb-6">
              Trouvez rapidement les réponses à vos questions
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Catégories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <category.icon className="h-4 w-4 mr-2" />
                        {category.label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Liens utiles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {helpfulLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                        asChild
                      >
                        <Link to={link.url} className="flex items-center gap-2">
                          <link.icon className="h-4 w-4" />
                          {link.title}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Link>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {searchQuery && (
                <div className="mb-6">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
                    {filteredFAQs.length} résultats trouvés
                  </Badge>
                </div>
              )}

              {filteredFAQs.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">
                      Aucune question trouvée
                    </h3>
                    <p className="text-white/60 mb-4">
                      Essayez avec d'autres mots-clés ou parcourez les catégories.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      Voir toutes les questions
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="pt-6">
                    <Accordion type="single" collapsible className="space-y-2">
                      {filteredFAQs.map((faq) => (
                        <AccordionItem
                          key={faq.id}
                          value={faq.id}
                          className="border-white/10"
                        >
                          <AccordionTrigger className="text-white hover:text-white/80 text-left">
                            <div className="flex items-start gap-3">
                              <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{faq.question}</div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {faq.tags.map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline" 
                                      className="border-white/20 text-white/60 text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-white/80 pl-7">
                            <div className="prose prose-invert max-w-none">
                              <div className="whitespace-pre-line">{faq.answer}</div>
                              
                              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-sm text-white/70 mb-2">
                                  <strong>Cette réponse vous a-t-elle aidé ?</strong>
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" className="border-green-400/50 text-green-400 hover:bg-green-400/10">
                                    👍 Oui
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-red-400/50 text-red-400 hover:bg-red-400/10">
                                    👎 Non
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {/* Contact Support */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Vous ne trouvez pas votre réponse ?
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Notre équipe de support est là pour vous aider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" asChild>
                      <Link to="/support">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contacter le support
                      </Link>
                    </Button>
                    <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10" asChild>
                      <Link to="/community">
                        <Users className="h-4 w-4 mr-2" />
                        Rejoindre la communauté
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default FAQ;