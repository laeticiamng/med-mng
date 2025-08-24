import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Database, Globe, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const PolitiqueConfidentialite = () => {
  return (
    <ConsistentBackground variant="light">
      <PageHeader
        title="Politique de Confidentialité"
        subtitle="Protection des données personnelles et respect du RGPD"
        icon={Shield}
        showBackButton
        backTo="/"
      />
      
      <div className="container mx-auto px-4 py-8">

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête avec logo */}
          <Card className="p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG - Politique de Confidentialité</h2>
              </div>
              <p className="text-green-100">https://medmng.com</p>
              <p className="text-sm text-green-200">Version officielle – Conformité RGPD</p>
            </div>
          </Card>

          {/* 1. Finalité */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">1. FINALITÉ DE LA PRÉSENTE POLITIQUE</h3>
            </div>
            <div className="text-gray-700">
              <p>La présente politique de confidentialité a pour but d'informer les utilisateurs de la plateforme MED MNG sur la nature des données personnelles collectées, leur traitement, leur protection, et les droits des utilisateurs conformément au <strong>Règlement Général sur la Protection des Données (RGPD – UE 2016/679)</strong>.</p>
            </div>
          </Card>

          {/* 2. Responsable du traitement */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserCheck className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">2. RESPONSABLE DU TRAITEMENT</h3>
            </div>
            <div className="text-gray-700">
              <p>Le traitement des données personnelles est effectué par :</p>
              <div className="bg-green-50 p-4 rounded-lg mt-3 space-y-2">
                <p><strong>EMOTIONSCARE</strong>, SASU au capital de 100 €</p>
                <p>Siège social : <strong>5 rue Caudron, 80000 Amiens, France</strong></p>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span>medmng@emotionscare.com</span>
                  </div>
                  <span className="text-gray-500">ou</span>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span>contact@emotionscare.com</span>
                  </div>
                </div>
                <p className="pt-2"><strong>Représentée par :</strong> Laëticia Motongane, Présidente et responsable de la publication</p>
              </div>
            </div>
          </Card>

          {/* 3. Données collectées */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">3. DONNÉES COLLECTÉES</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-3">📌 Données collectées automatiquement :</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Adresse IP (à des fins de sécurité)</li>
                    <li>• Données de navigation anonymisées (cookies strictement nécessaires)</li>
                    <li>• Temps de connexion, pages visitées</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">📌 Données fournies volontairement :</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Adresse email (création de compte)</li>
                    <li>• Nom ou pseudonyme (optionnel)</li>
                    <li>• Préférences pédagogiques (Rang A/B, styles musicaux)</li>
                    <li>• Progression pédagogique (historique des chansons, QCM)</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-500">
                <p className="font-medium text-green-800">Aucune donnée de santé ou donnée sensible n'est collectée.</p>
              </div>
            </div>
          </Card>

          {/* 4. Finalité du traitement */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-amber-600" />
              <h3 className="text-xl font-semibold text-gray-800">4. FINALITÉ DU TRAITEMENT</h3>
            </div>
            <div className="text-gray-700">
              <p className="mb-3">Les données sont collectées uniquement dans les buts suivants :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-amber-50 p-3 rounded text-sm">• Fournir une expérience utilisateur personnalisée</div>
                <div className="bg-amber-50 p-3 rounded text-sm">• Suivre la progression pédagogique</div>
                <div className="bg-amber-50 p-3 rounded text-sm">• Générer du contenu adapté (chansons MNG)</div>
                <div className="bg-amber-50 p-3 rounded text-sm">• Améliorer les services (analyse anonyme)</div>
                <div className="bg-amber-50 p-3 rounded text-sm">• Communiquer les mises à jour</div>
                <div className="bg-amber-50 p-3 rounded text-sm">• Newsletter (si inscrite)</div>
              </div>
            </div>
          </Card>

          {/* 5. Base légale */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="h-5 w-5 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-800">5. BASE LÉGALE</h3>
            </div>
            <div className="text-gray-700">
              <p className="mb-3">Le traitement est fondé sur :</p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>L'exécution du contrat utilisateur (accès à la plateforme MED MNG)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>L'intérêt légitime de l'éditeur (amélioration continue du service)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Le consentement libre, éclairé et spécifique (informations marketing - opt-in)</span>
                </li>
              </ul>
            </div>
          </Card>

          {/* 6. Durée de conservation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-800">6. DURÉE DE CONSERVATION</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <p className="font-semibold text-indigo-800">Données de compte</p>
                  <p className="text-sm mt-1">Durée d'utilisation + 3 ans</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <p className="font-semibold text-indigo-800">Données de navigation</p>
                  <p className="text-sm mt-1">12 mois maximum</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <p className="font-semibold text-indigo-800">Données pédagogiques</p>
                  <p className="text-sm mt-1">5 ans (puis anonymisées)</p>
                </div>
              </div>
              <p className="text-sm text-indigo-600 text-center">Sauf demande explicite de suppression immédiate</p>
            </div>
          </Card>

          {/* 7. Sécurité des données */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">7. SÉCURITÉ DES DONNÉES</h3>
            </div>
            <div className="text-gray-700">
              <div className="bg-emerald-50 p-4 rounded-lg space-y-2">
                <p>• <strong>Hébergement :</strong> Serveurs sécurisés via Supabase</p>
                <p>• <strong>Chiffrement :</strong> En transit et au repos</p>
                <p>• <strong>Sauvegardes :</strong> Automatisées et sécurisées</p>
                <p>• <strong>Accès :</strong> Restreint aux seules personnes habilitées</p>
                <p className="text-emerald-600 font-medium">• <strong>Aucun prestataire tiers</strong> n'a accès aux données</p>
              </div>
            </div>
          </Card>

          {/* 8. Partage et transmission */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-800">8. PARTAGE ET TRANSMISSION</h3>
            </div>
            <div className="text-gray-700">
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <p className="font-semibold text-orange-800 mb-2">Aucune donnée personnelle n'est transmise à des tiers</p>
                <p className="text-sm">Sauf en cas d'obligation légale (demandes judiciaires, sécurité nationale)</p>
                <p className="text-sm mt-2">Aucun transfert hors UE sans protection adéquate conforme au RGPD</p>
              </div>
            </div>
          </Card>

          {/* 9. Droits des utilisateurs */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserCheck className="h-5 w-5 text-teal-600" />
              <h3 className="text-xl font-semibold text-gray-800">9. DROITS DES UTILISATEURS</h3>
            </div>
            <div className="text-gray-700">
              <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Droit d'accès</div>
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Droit de rectification</div>
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Droit à l'effacement</div>
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Droit à la limitation</div>
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Droit à la portabilité</div>
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Droit d'opposition</div>
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Retrait du consentement</div>
                <div className="bg-teal-50 p-3 rounded text-center text-sm">Droit à l'oubli</div>
              </div>
              <div className="bg-teal-100 p-4 rounded-lg">
                <p className="font-semibold text-teal-800">Pour exercer vos droits :</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-teal-600" />
                    <span>medmng@emotionscare.com</span>
                  </div>
                  <span className="text-gray-500">ou</span>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-teal-600" />
                    <span>contact@emotionscare.com</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 10. Cookies */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-pink-600" />
              <h3 className="text-xl font-semibold text-gray-800">10. COOKIES</h3>
            </div>
            <div className="text-gray-700">
              <div className="bg-pink-50 p-4 rounded-lg">
                <p><strong>Seuls des cookies strictement nécessaires</strong> au bon fonctionnement de la plateforme sont utilisés :</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Authentification</li>
                  <li>• Session utilisateur</li>
                  <li>• Préférences</li>
                </ul>
                <p className="mt-3 text-pink-600 font-medium">Aucun cookie de publicité ou de tracking externe.</p>
              </div>
            </div>
          </Card>

          {/* 11. Mise à jour */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-800">11. MISE À JOUR DE LA POLITIQUE</h3>
            </div>
            <div className="text-gray-700">
              <p>Cette politique peut être mise à jour à tout moment. La date de la dernière mise à jour sera indiquée en haut de page.</p>
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

export default PolitiqueConfidentialite;
