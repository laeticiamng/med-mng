import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Trash2, 
  Shield, 
  Database, 
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MesDonneesRGPD = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('med-mng-api', {
        body: { 
          path: '/rgpd/export',
          method: 'POST',
          body: { user_id: userId }
        }
      });

      if (error) throw error;

      // Télécharger le fichier JSON
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medmng-donnees-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Export réussi",
        description: `${data.summary.total_library_items} éléments exportés`,
      });

    } catch (error: any) {
      console.error('Erreur export:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'exporter les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive"
        });
        return;
      }

      const confirmationToken = `DELETE_${userId}`;

      const { data, error } = await supabase.functions.invoke('med-mng-api', {
        body: { 
          path: '/rgpd/purge',
          method: 'DELETE',
          body: { 
            user_id: userId,
            confirmation_token: confirmationToken
          }
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Compte supprimé",
        description: "Toutes vos données ont été effacées conformément au RGPD",
      });

      // Déconnexion
      await supabase.auth.signOut();
      window.location.href = '/';

    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le compte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckDataStatus = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('med-mng-api', {
        body: { 
          path: `/rgpd/status/${userId}`,
          method: 'GET'
        }
      });

      if (error) throw error;

      setDataStatus(data);

    } catch (error: any) {
      console.error('Erreur statut:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de vérifier le statut",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/med-mng/profile" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au profil</span>
            </Link>
            <div className="h-6 border-l border-gray-300" />
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Mes Données RGPD</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Info RGPD */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Conformément au RGPD (Articles 15, 17, 20), vous pouvez accéder, exporter ou supprimer vos données personnelles à tout moment.
            </AlertDescription>
          </Alert>

          {/* Vos droits */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <span>Vos Droits RGPD</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Droit d'accès (Art. 15)</h3>
                <p className="text-sm text-gray-700">Consulter toutes vos données personnelles</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📥 Droit à la portabilité (Art. 20)</h3>
                <p className="text-sm text-gray-700">Exporter vos données au format JSON</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">🗑️ Droit à l'effacement (Art. 17)</h3>
                <p className="text-sm text-gray-700">Supprimer définitivement votre compte</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">✏️ Droit de rectification (Art. 16)</h3>
                <p className="text-sm text-gray-700">Modifier vos informations dans votre profil</p>
              </div>
            </div>
          </Card>

          {/* Statut des données */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Statut de vos données</h2>
            <Button 
              onClick={handleCheckDataStatus} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Vérification...' : 'Vérifier mes données'}
            </Button>

            {dataStatus && (
              <div className="space-y-3">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Compte actif depuis:</strong> {new Date(dataStatus.account_created).toLocaleDateString('fr-FR')}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {Object.entries(dataStatus.data_summary || {}).map(([table, count]: [string, any]) => (
                    <div key={table} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-gray-600">{table}</p>
                      <p className="text-2xl font-bold text-blue-600">{count}</p>
                    </div>
                  ))}
                </div>

                {dataStatus.last_activity && (
                  <p className="text-sm text-gray-600">
                    <strong>Dernière activité:</strong> {new Date(dataStatus.last_activity).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Export de données */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-600" />
              <span>Exporter mes données</span>
            </h2>
            <p className="text-gray-700 mb-4">
              Téléchargez toutes vos données personnelles au format JSON structuré. Inclut : profil, bibliothèque, playlists, historique d'activités.
            </p>
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Format:</strong> JSON (lisible par machine, conforme Article 20 RGPD)<br/>
                <strong>Durée:</strong> Export instantané<br/>
                <strong>Sécurité:</strong> Données chiffrées en transit
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleExportData} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{loading ? 'Export en cours...' : 'Télécharger mes données'}</span>
            </Button>
          </Card>

          {/* Suppression de compte */}
          <Card className="p-6 border-red-200 bg-red-50/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2 text-red-800">
              <Trash2 className="h-5 w-5" />
              <span>Supprimer mon compte</span>
            </h2>
            <Alert className="mb-4 bg-red-100 border-red-300">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                <strong>⚠️ ATTENTION: Action irréversible</strong><br/>
                La suppression de votre compte entraînera:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Suppression immédiate de toutes vos données personnelles</li>
                  <li>Suppression de votre bibliothèque (chansons, BD, QCM)</li>
                  <li>Annulation de votre abonnement (si actif)</li>
                  <li>Impossibilité de récupérer les données après 30 jours</li>
                </ul>
              </AlertDescription>
            </Alert>

            {!confirmDelete ? (
              <Button 
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Demander la suppression</span>
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert className="bg-orange-100 border-orange-300">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-900">
                    <strong>Confirmer la suppression définitive?</strong><br/>
                    Cette action ne peut pas être annulée.
                  </AlertDescription>
                </Alert>
                <div className="flex space-x-3">
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{loading ? 'Suppression...' : 'Oui, supprimer définitivement'}</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Contact */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50">
            <h2 className="text-xl font-semibold mb-4">📧 Besoin d'aide?</h2>
            <p className="text-gray-700 mb-3">
              Pour toute question sur vos données personnelles ou l'exercice de vos droits RGPD:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email RGPD:</strong> medmng@emotionscare.com</p>
              <p><strong>Délai de réponse:</strong> 5 jours ouvrés maximum</p>
              <p><strong>CNIL:</strong> En cas de litige, vous pouvez saisir la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CNIL</a></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MesDonneesRGPD;
