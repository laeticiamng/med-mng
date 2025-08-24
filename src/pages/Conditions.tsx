import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle, CheckCircle2, XCircle, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { PageHeader } from '@/components/layout/PageHeader';

const Conditions = () => {
  return (
    <ConsistentBackground variant="light">
      <PageHeader
        title="Conditions Générales d'Utilisation"
        subtitle="Conditions d'accès et d'utilisation de la plateforme MED MNG"
        icon={FileText}
        showBackButton
        backTo="/"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* En-tête avec logo */}
          <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG - Conditions Générales d'Utilisation</h2>
              </div>
              <p className="text-blue-100">https://medmng.com</p>
              <p className="text-sm text-blue-200">Version officielle – Dernière mise à jour : 2024</p>
            </div>
          </Card>

          {/* 1. Objet */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">1. OBJET</h3>
            </div>
            <div className="text-gray-700">
              <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme <strong>MED MNG</strong>, service d'apprentissage médical révolutionnaire basé sur la méthode MNG (Music Neuro Learning Generator).</p>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-blue-800">Service proposé :</p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Apprentissage des Items EDN par la musique</li>
                  <li>• Simulations ECOS interactives</li>
                  <li>• Audit et suivi pédagogique personnalisé</li>
                  <li>• Génération de contenus musicaux éducatifs</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 2. Éditeur */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">2. ÉDITEUR DU SERVICE</h3>
            </div>
            <div className="text-gray-700">
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <p><strong>EMOTIONSCARE</strong>, SASU au capital de 100 €</p>
                <p>Siège social : <strong>5 rue Caudron, 80000 Amiens, France</strong></p>
                <p>SIRET : [À compléter]</p>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span>medmng@emotionscare.com</span>
                  </div>
                </div>
                <p className="pt-2"><strong>Directrice de publication :</strong> Laëticia Motongane</p>
                <p><strong>Hébergement :</strong> Supabase (infrastructure sécurisée)</p>
              </div>
            </div>
          </Card>

          {/* 3. Accès au service */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-xl font-semibold text-gray-800">3. ACCÈS AU SERVICE</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-3">✅ Conditions d'accès</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Être étudiant en médecine, professionnel de santé ou formateur</li>
                    <li>• Accepter les présentes CGU</li>
                    <li>• Fournir des informations exactes lors de l'inscription</li>
                    <li>• Respecter les règles d'usage pédagogique</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-3">⚠️ Restrictions</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Service réservé à un usage pédagogique</li>
                    <li>• Interdit : revente, partage de comptes</li>
                    <li>• Respect des droits de propriété intellectuelle</li>
                    <li>• Usage conforme à l'éthique médicale</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Modalités d'utilisation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">4. MODALITÉS D'UTILISATION</h3>
            </div>
            <div className="text-gray-700">
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Droits de l'utilisateur</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Accès aux contenus pédagogiques selon l'abonnement</li>
                    <li>• Génération de musiques personnalisées pour l'apprentissage</li>
                    <li>• Suivi de progression pédagogique</li>
                    <li>• Support technique dans les délais annoncés</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Obligations de l'utilisateur</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Utiliser le service de manière responsable et éthique</li>
                    <li>• Ne pas diffuser ou revendre les contenus protégés</li>
                    <li>• Respecter la confidentialité des données d'autrui</li>
                    <li>• Signaler tout dysfonctionnement ou abus</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Propriété intellectuelle */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-800">5. PROPRIÉTÉ INTELLECTUELLE</h3>
            </div>
            <div className="text-gray-700">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="font-semibold text-indigo-800 mb-3">Méthode MNG - Propriété exclusive</p>
                <p className="text-sm mb-3">La méthode <strong>Music Neuro Learning Generator (MNG)</strong> développée par Laëticia Motongane est protégée par le droit d'auteur.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-indigo-700 mb-1">Contenus protégés :</p>
                    <ul className="space-y-1">
                      <li>• Algorithmes de génération musicale</li>
                      <li>• Contenus pédagogiques EDN/ECOS</li>
                      <li>• Interface utilisateur</li>
                      <li>• Marque MED MNG</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-indigo-700 mb-1">Droits de l'utilisateur :</p>
                    <ul className="space-y-1">
                      <li>• Usage personnel éducatif</li>
                      <li>• Téléchargement pour étude hors ligne</li>
                      <li>• Partage en contexte pédagogique autorisé</li>
                      <li>• Aucun droit de reproduction commerciale</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 6. Responsabilités */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-800">6. RESPONSABILITÉS ET LIMITATIONS</h3>
            </div>
            <div className="text-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-3">Responsabilité de l'éditeur</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Qualité des contenus pédagogiques</li>
                    <li>• Sécurité des données personnelles</li>
                    <li>• Disponibilité du service (objectif 99%)</li>
                    <li>• Support technique selon l'abonnement</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Limitations</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Service fourni "en l'état"</li>
                    <li>• Pas de garantie de réussite aux examens</li>
                    <li>• Interruptions pour maintenance</li>
                    <li>• Évolution des contenus pédagogiques</li>
                  </ul>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-lg border-l-4 border-red-500 mt-4">
                <p className="font-medium text-red-800">Important : MED MNG est un outil pédagogique complémentaire et ne remplace pas les cours magistraux, travaux dirigés et formations pratiques officielles.</p>
              </div>
            </div>
          </Card>

          {/* 7. Durée et résiliation */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-teal-600" />
              <h3 className="text-xl font-semibold text-gray-800">7. DURÉE ET RÉSILIATION</h3>
            </div>
            <div className="text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-teal-800">Abonnements</h4>
                  <p className="text-sm mt-2">Durée selon formule choisie</p>
                  <p className="text-sm">Renouvellement automatique</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-teal-800">Résiliation</h4>
                  <p className="text-sm mt-2">À tout moment depuis le profil</p>
                  <p className="text-sm">Effet à la fin de la période</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-teal-800">Suspension</h4>
                  <p className="text-sm mt-2">En cas de non-respect des CGU</p>
                  <p className="text-sm">Après mise en demeure</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 8. Modifications */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-xl font-semibold text-gray-800">8. MODIFICATION DES CONDITIONS</h3>
            </div>
            <div className="text-gray-700">
              <div className="bg-amber-50 p-4 rounded-lg">
                <p>Les présentes CGU peuvent être modifiées à tout moment pour s'adapter aux évolutions légales, techniques ou pédagogiques.</p>
                <p className="mt-2 text-sm">Les utilisateurs seront informés des modifications majeures par email et devront les accepter pour continuer à utiliser le service.</p>
              </div>
            </div>
          </Card>

          {/* 9. Droit applicable */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-800">9. DROIT APPLICABLE ET JURIDICTION</h3>
            </div>
            <div className="text-gray-700">
              <p>Les présentes CGU sont soumises au <strong>droit français</strong>.</p>
              <p className="mt-2">En cas de litige, les tribunaux compétents sont ceux du ressort du siège social de la société EMOTIONSCARE (Amiens, France), sauf disposition légale contraire.</p>
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <p className="text-sm text-gray-600">Pour tout litige, une médiation amiable sera privilégiée avant toute action judiciaire.</p>
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3">Questions sur les Conditions d'Utilisation ?</h4>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>medmng@emotionscare.com</span>
                </div>
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

export default Conditions;