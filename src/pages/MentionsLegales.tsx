
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Globe, Shield, Scale, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="h-6 border-l border-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800">Mentions Légales</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* En-tête avec logo */}
          <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-8 w-8" />
                <h2 className="text-2xl font-bold">MED MNG</h2>
              </div>
              <p className="text-blue-100">https://medmng.com</p>
              <p className="text-sm text-blue-200">Version officielle – conforme RGPD et droit français</p>
            </div>
          </Card>

          {/* 1. Éditeur du site */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">1. ÉDITEUR DU SITE</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Le site medmng.com est édité par la société :</p>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p><strong>EMOTIONSCARE</strong>, SASU au capital de 100 €</p>
                <p>Immatriculée au Registre du Commerce et des Sociétés (RCS) d'Amiens sous le numéro <strong>981 065 820</strong></p>
                <p>N° SIRET : <strong>981 065 820 00013</strong></p>
                <p>TVA intracommunautaire : <strong>FR20981065820</strong></p>
                <p>Siège social : <strong>5 rue Caudron, 80000 Amiens, France</strong></p>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>contact@emotionscare.com</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>medmng@emotionscare.com</span>
                  </div>
                </div>
                <p className="pt-2"><strong>Responsable de la publication :</strong> Laëticia Motongane (Présidente d'EMOTIONSCARE)</p>
              </div>
            </div>
          </Card>

          {/* 2. Hébergement et technique */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">2. HÉBERGEMENT ET TECHNIQUE</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p><strong>Hébergeur des données :</strong></p>
                  <p>Supabase (serveurs sécurisés et scalables)</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p><strong>Prototypage UX/UI :</strong></p>
                  <p>Réalisé via Lovable.dev</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p><strong>Versionnement & sécurité :</strong></p>
                  <p>GitHub</p>
                </div>
              </div>
              <p className="text-center text-sm text-green-600 font-medium">Données stockées et traitées dans le respect du RGPD.</p>
            </div>
          </Card>

          {/* 3. Objet de la plateforme */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">3. OBJET DE LA PLATEFORME</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>MED MNG est une plateforme immersive dédiée à l'apprentissage médical via la méthode exclusive <strong>MNG – Music Neuro Learning Generator</strong>, développée par Laëticia Motongane.</p>
              <p>Elle combine des contenus musicaux, visuels et interactifs pour renforcer l'apprentissage cognitif dans les parcours de formation médicale post-bac (EDN, ECOS).</p>
            </div>
          </Card>

          {/* 4. Contenu pédagogique */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">4. CONTENU PÉDAGOGIQUE DISPONIBLE</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parcours EDN */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3 text-lg">🎓 Parcours EDN :</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Sélection de l'item selon la base nationale LISA</li>
                  <li>• Choix du niveau (📒 Rang A ou 📘 Rang B)</li>
                  <li>• Choix du style musical (trap, lofi, jazz, afrobeat, etc.)</li>
                  <li>• Génération automatique d'une chanson pédagogique (format MNG)</li>
                  <li>• Tableaux récapitulatifs conformes aux attendus EDN</li>
                  <li>• Bande dessinée (mémorisation visuelle)</li>
                  <li>• QCM, QRU et QROC d'entraînement</li>
                </ul>
              </div>

              {/* Parcours ECOS */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3 text-lg">🩺 Parcours ECOS :</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Fiches cliniques spécifiques à chaque situation de départ (SD)</li>
                  <li>• Une chanson MNG dédiée par SD (sans distinction A/B)</li>
                  <li>• Simulation clinique immersive, orientée prise de décision</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 5. Propriété intellectuelle */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-amber-600" />
              <h3 className="text-xl font-semibold text-gray-800">5. PROPRIÉTÉ INTELLECTUELLE</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>Tous les contenus du site MED MNG sont protégés au titre de la propriété intellectuelle :</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-amber-50 p-3 rounded text-center text-sm">Chansons générées</div>
                <div className="bg-amber-50 p-3 rounded text-center text-sm">Visuels, tableaux, BD</div>
                <div className="bg-amber-50 p-3 rounded text-center text-sm">Fiches pédagogiques</div>
                <div className="bg-amber-50 p-3 rounded text-center text-sm">Noms, concepts, logos</div>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg border-l-4 border-amber-500">
                <p className="font-semibold">La méthode MNG – Music Neuro Learning Generator est protégée par dépôt de brevet en cours auprès de l'INPI.</p>
                <p className="text-sm mt-2">Le suffixe "MNG" désigne tout format pédagogique utilisant la génération musicale pour la mémorisation cognitive, dans tous les domaines de formation post-bac diplômante.</p>
              </div>
              <p className="text-red-600 font-medium">Tout usage, reproduction ou adaptation sans autorisation expresse est interdit.</p>
              <p>La créatrice Laëticia Motongane reste l'unique titulaire des droits d'auteur.</p>
            </div>
          </Card>

          {/* 6. Données personnelles */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-800">6. DONNÉES PERSONNELLES</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p className="font-medium text-green-600">Traitement conforme au RGPD.</p>
              <p>Les seules données collectées sont nécessaires à la bonne expérience utilisateur :</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-green-50 p-3 rounded text-center">Adresse email</div>
                <div className="bg-green-50 p-3 rounded text-center">Historique d'apprentissage</div>
                <div className="bg-green-50 p-3 rounded text-center">Préférences musicales et pédagogiques</div>
              </div>
              <p className="text-green-600 font-medium">Aucune revente ou partage des données à des tiers.</p>
              <p className="text-sm text-gray-600">Politique de confidentialité complète disponible [sur demande ou lien externe].</p>
            </div>
          </Card>

          {/* 7. Juridiction compétente */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-5 w-5 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-800">7. JURIDICTION COMPÉTENTE</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Les présentes mentions sont régies par le droit français.</p>
              <p>En cas de litige, les tribunaux compétents sont ceux du ressort de la <strong>Cour d'Appel d'Amiens</strong>.</p>
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
    </div>
  );
};

export default MentionsLegales;
