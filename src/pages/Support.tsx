import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Headphones, Mail, MessageCircle, Book, Clock, AlertCircle, CheckCircle2, Phone, Globe, Users, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const Support = () => {
  return (
    <ConsistentBackground variant="light">
      <PageHeader
        title="Support & Assistance"
        subtitle="Aide, documentation et contact pour la plateforme MED MNG"
        icon={Headphones}
        showBackButton
        backTo="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* En-tête avec logo */}
          <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Headphones className="h-8 w-8" />
                <h2 className="text-2xl font-bold">Support MED MNG</h2>
              </div>
              <p className="text-emerald-100">Nous sommes là pour vous accompagner dans votre apprentissage</p>
              <p className="text-sm text-emerald-200">Équipe support disponible du lundi au vendredi, 9h-18h</p>
            </div>
          </Card>

          {/* Contact rapide */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MessageCircle className="h-5 w-5 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">CONTACT RAPIDE</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg text-center">
                <Mail className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-semibold text-emerald-800">Email Support</h4>
                <p className="text-sm text-gray-600 mb-3">Réponse sous 24h ouvrées</p>
                <a 
                  href="mailto:medmng@emotionscare.com" 
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  medmng@emotionscare.com
                </a>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-800">Chat en ligne</h4>
                <p className="text-sm text-gray-600 mb-3">Assistance immédiate</p>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">
                  Ouvrir le chat
                </Button>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Book className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-800">Documentation</h4>
                <p className="text-sm text-gray-600 mb-3">Guides et tutoriels</p>
                <Link to="#documentation">
                  <Button variant="outline" size="sm" className="text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white">
                    Consulter
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Types de support selon abonnement */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">SUPPORT SELON VOTRE ABONNEMENT</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-gray-800 text-lg">Gratuit</h4>
                  <p className="text-sm text-gray-600">Version d'essai</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Documentation en ligne</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>FAQ communautaire</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Email support (72h)</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-blue-800 text-lg">Premium</h4>
                  <p className="text-sm text-blue-600">Abonnement standard</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Support prioritaire (24h)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Chat en ligne</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Guides avancés</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Webinaires mensuels</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
                <div className="text-center mb-4">
                  <h4 className="font-semibold text-purple-800 text-lg">Enterprise</h4>
                  <p className="text-sm text-purple-600">Institutions</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Support dédié (2h)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Formation personnalisée</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Hotline téléphonique</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Account manager</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* FAQ rapide */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <HelpCircle className="h-5 w-5 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-800">QUESTIONS FRÉQUENTES</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Comment fonctionne la méthode MNG ?</h4>
                <p className="text-sm text-gray-700">La méthode Music Neuro Learning Generator transforme les contenus EDN en musiques mnémotechniques, facilitant la mémorisation par l'activation de zones cérébrales spécifiques.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Puis-je utiliser MED MNG hors ligne ?</h4>
                <p className="text-sm text-gray-700">Oui, vous pouvez télécharger vos musiques et contenus pour les consulter sans connexion Internet. Synchronisation automatique à la reconnexion.</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Les contenus sont-ils conformes au programme EDN ?</h4>
                <p className="text-sm text-gray-700">Absolument. Tous nos contenus sont créés par des praticiens hospitaliers et validés selon les dernières recommandations du CNCI.</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Comment annuler mon abonnement ?</h4>
                <p className="text-sm text-gray-700">Vous pouvez annuler à tout moment depuis votre profil. L'accès reste actif jusqu'à la fin de la période payée.</p>
              </div>
            </div>
          </Card>

          {/* Documentation */}
          <Card className="p-6" id="documentation">
            <div className="flex items-center space-x-2 mb-6">
              <Book className="h-5 w-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">DOCUMENTATION & GUIDES</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Guide de démarrage</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Première connexion et paramètres</li>
                  <li>• Navigation dans l'interface</li>
                  <li>• Personnalisation de l'apprentissage</li>
                  <li>• Synchronisation multi-appareils</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3 text-purple-600 border-purple-600">
                  Télécharger le PDF
                </Button>
              </div>
              
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-800 mb-3">Utilisation avancée</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Création de playlists personnalisées</li>
                  <li>• Analyse de progression détaillée</li>
                  <li>• Partage en groupe d'étude</li>
                  <li>• Intégration avec autres outils</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3 text-teal-600 border-teal-600">
                  Voir les tutoriels
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Méthode MNG</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Principes neuroscientifiques</li>
                  <li>• Optimisation de l'apprentissage</li>
                  <li>• Études et validations cliniques</li>
                  <li>• Applications en médecine</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3 text-blue-600 border-blue-600">
                  Livre blanc
                </Button>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-3">Dépannage</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Problèmes de lecture audio</li>
                  <li>• Synchronisation des données</li>
                  <li>• Problèmes de connexion</li>
                  <li>• Récupération de compte</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-3 text-amber-600 border-amber-600">
                  Base de connaissances
                </Button>
              </div>
            </div>
          </Card>

          {/* Status système */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">STATUT DES SERVICES</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Plateforme web</p>
                <p className="text-xs text-green-600">Opérationnel</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Génération musicale</p>
                <p className="text-xs text-green-600">Opérationnel</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Base de données</p>
                <p className="text-xs text-green-600">Opérationnel</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">API services</p>
                <p className="text-xs text-green-600">Opérationnel</p>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <Link to="/system-health">
                <Button variant="outline" size="sm" className="text-gray-600 border-gray-400">
                  Voir le statut détaillé
                </Button>
              </Link>
            </div>
          </Card>

          {/* Contact d'urgence */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-xl font-semibold text-red-800">URGENCE OU PROBLÈME CRITIQUE</h3>
            </div>
            <div className="text-gray-700">
              <p className="mb-3">En cas de problème urgent affectant vos examens ou votre apprentissage :</p>
              <div className="bg-red-100 p-4 rounded-lg">
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <Mail className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="font-semibold text-red-800">Email prioritaire</p>
                    <a href="mailto:urgent@emotionscare.com" className="text-red-600 text-sm">urgent@emotionscare.com</a>
                  </div>
                  <div className="text-center">
                    <Phone className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="font-semibold text-red-800">Hotline Enterprise</p>
                    <p className="text-red-600 text-sm">+33 (0)X XX XX XX XX</p>
                  </div>
                </div>
                <p className="text-xs text-red-600 text-center mt-3">Réponse sous 2h en période ouvrée</p>
              </div>
            </div>
          </Card>

          {/* Retour */}
          <div className="text-center pt-6">
            <Link to="/">
              <Button className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Support;