
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, Users, Clock, Sparkles, BarChart3, Target, Award, TrendingUp, Music, Brain, Zap, Lightbulb, Shield, Globe, Microscope, Headphones } from "lucide-react";
import PolitiqueConfidentialite from "./PolitiqueConfidentialite";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              MED MNG
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plateforme d'apprentissage immersive pour les étudiants en médecine avec contenus EDN et simulations ECOS
          </p>
          
          {/* Navigation rapide */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/edn">
              <Button size="lg" className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Items EDN</span>
              </Button>
            </Link>
            <Link to="/ecos">
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Simulations ECOS</span>
              </Button>
            </Link>
            <Link to="/audit-general">
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Audit EDN</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Présentation officielle de la méthode MNG */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white mb-8">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Music className="h-8 w-8" />
                <CardTitle className="text-3xl">Méthode MNG</CardTitle>
              </div>
              <CardDescription className="text-purple-100 text-lg">
                Music Neuro Learning Generator - Révolutionnez votre apprentissage
              </CardDescription>
              <p className="text-sm text-purple-200 mt-2">
                Méthode pédagogique innovante développée par Laëticia Motongane
              </p>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Objectif */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-xl">Objectif de la méthode</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Faciliter l'apprentissage de savoirs complexes par une immersion cognitive, sonore et visuelle, 
                  via une génération automatique de contenus éducatifs en chansons personnalisées, en respectant 
                  les attendus pédagogiques de chaque discipline diplômante.
                </p>
              </CardContent>
            </Card>

            {/* Fondements scientifiques */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">Fondements scientifiques</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Sciences cognitives de l'apprentissage (effet de redondance, double codage, émotion positive)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Neuroplasticité favorisée par la musique (rythme, structure, répétition)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Mémoire à long terme consolidée par l'ancrage multisensoriel</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Principe de fonctionnement */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-xl">Principe de fonctionnement</CardTitle>
              </div>
              <CardDescription>
                Chaque unité de cours est transformée en un module MNG comprenant :
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Headphones className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-800">1. Génération automatique</h4>
                  </div>
                  <p className="text-sm text-gray-700">Chanson conforme au cours officiel (texte, tableau, item)</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Music className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">2. Sélection musicale</h4>
                  </div>
                  <p className="text-sm text-gray-700">Style musical par l'apprenant (trap, jazz, lofi, etc.)</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">3. Visuels synchronisés</h4>
                  </div>
                  <p className="text-sm text-gray-700">Tableaux de synthèse, BD récapitulative, animations</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">4. Entraînement ciblé</h4>
                  </div>
                  <p className="text-sm text-gray-700">QCM, QROC, QRU basés sur les contenus chantés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Caractère unique */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-emerald-600" />
                <CardTitle className="text-xl">Caractère unique de la méthode MNG</CardTitle>
              </div>
              <CardDescription>
                Contrairement à une simple chanson éducative ou un podcast musical :
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                  <p className="text-sm text-gray-700">
                    <strong>Génération automatique</strong> à la demande à partir de contenus pédagogiques vérifiés 
                    (syllabus officiels, item LISA, compétences ECOS, etc.)
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700">
                    <strong>Structure musicale optimisée</strong> pour la mémorisation à long terme, 
                    adaptant le flow, le rythme et les refrains aux points clés du cours
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-sm text-gray-700">
                    <strong>Plan didactique codifié :</strong> introduction → développement → ancrage → répétition ciblée → conclusion
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm text-gray-700">
                    <strong>Adaptabilité multisectorielle</strong> : médecine, droit, sciences humaines, économie, ingénierie, etc.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domaine d'application du brevet */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Microscope className="h-6 w-6 text-indigo-600" />
                  <CardTitle className="text-xl">Domaine d'application du brevet</CardTitle>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800">Propriété intellectuelle</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-800 mb-3">Le brevet couvre :</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Génération algorithmique de chansons pédagogiques personnalisées</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Usage dans un parcours académique diplômant post-bac</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Interface immersive interactive (fiches, tableaux, BD, QCM)</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Adaptabilité multisectorielle (santé, droit, commerce, ingénierie)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-800 mb-3">Exemples d'exclusivité à protéger :</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Générateur de chanson éducative automatisé et personnalisé</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Combinaison chanson + tableau + quiz + visuel animé</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Application dans un contexte diplômant reconnu officiellement</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-gray-600">Items IC Complets</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">150+</div>
            <div className="text-sm text-gray-600">Concepts E-LiSA</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">20+</div>
            <div className="text-sm text-gray-600">Situations ECOS</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-sm text-gray-600">Interactif</div>
          </Card>
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* EDN Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <CardTitle>Items EDN Immersifs</CardTitle>
              </div>
              <CardDescription>
                Explorez les 5 items de compétences avec tableaux interactifs, scènes immersives et contenus musicaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">IC-1 : Relation médecin-malade</span>
                  <Badge className="bg-blue-100 text-blue-800">Complet</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IC-2 : Valeurs professionnelles</span>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IC-3 : Démarche scientifique</span>
                  <Badge className="bg-yellow-100 text-yellow-800">À améliorer</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IC-4 : Qualité et sécurité</span>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IC-5 : Organisation système</span>
                  <Badge className="bg-red-100 text-red-800">Incomplet</Badge>
                </div>
              </div>
              <Link to="/edn" className="block">
                <Button className="w-full">Accéder aux Items EDN</Button>
              </Link>
            </CardContent>
          </Card>

          {/* ECOS Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-green-600" />
                <CardTitle>Simulations ECOS</CardTitle>
              </div>
              <CardDescription>
                Entraînez-vous avec des situations cliniques réalistes et des patients virtuels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Sessions chronométrées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Évaluation en temps réel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Feedback détaillé</span>
                </div>
              </div>
              <Link to="/ecos" className="block">
                <Button variant="outline" className="w-full">Commencer les ECOS</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Audit Section */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <CardTitle>Audit des Items EDN</CardTitle>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Nouveau</Badge>
            </div>
            <CardDescription>
              Analyse complète de la conformité E-LiSA des 5 items IC avec scores détaillés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">81%</div>
                <div className="text-sm text-gray-600">Score Moyen Général</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-gray-600">Items Excellents</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-sm text-gray-600">À Améliorer</div>
              </div>
            </div>
            <Link to="/audit-general">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Voir l'Audit Complet</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Music className="h-6 w-6 text-blue-600" />
                  <span className="font-bold text-xl">MED MNG</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Par EmotionsCare - L'apprentissage médical révolutionnaire avec la méthode MNG
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Formations</h3>
                <div className="space-y-2">
                  <Link to="/edn" className="block text-gray-600 hover:text-blue-600 text-sm">Items EDN</Link>
                  <Link to="/ecos" className="block text-gray-600 hover:text-blue-600 text-sm">Situations ECOS</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Outils</h3>
                <div className="space-y-2">
                  <Link to="/audit-general" className="block text-gray-600 hover:text-blue-600 text-sm">Audit Général</Link>
                  <Link to="/med-mng/library" className="block text-gray-600 hover:text-blue-600 text-sm">Bibliothèque</Link>
                  <Link to="/med-mng/create" className="block text-gray-600 hover:text-blue-600 text-sm">Créer</Link>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Légal</h3>
                <div className="space-y-2">
                  <Link to="/mentions-legales" className="block text-gray-600 hover:text-blue-600 text-sm">Mentions Légales</Link>
                  <Link to="/politique-confidentialite" className="block text-gray-600 hover:text-blue-600 text-sm">Politique de Confidentialité</Link>
                  <a href="mailto:contact@emotionscare.com" className="block text-gray-600 hover:text-blue-600 text-sm">Contact</a>
                </div>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 text-center text-gray-600 text-sm">
              <p>&copy; 2024 EmotionsCare - MED MNG. Tous droits réservés.</p>
              <p className="mt-1">Méthode MNG - Music Neuro Learning Generator par Laëticia Motongane</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
