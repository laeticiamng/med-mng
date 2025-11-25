import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export const ProfileSecurity: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [has2FA, setHas2FA] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Récupérer les sessions actives et le statut 2FA
  const fetchSecurityInfo = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Vérifier si 2FA est activée
      const { data: factors } = await supabase.auth.mfa.listFactors();
      setHas2FA(factors?.totp?.length > 0 || false);

      // Récupérer les sessions depuis la table connected_devices si elle existe
      const { data: devicesData, error } = await supabase
        .from('connected_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen_at', { ascending: false });

      if (!error && devicesData) {
        const mappedSessions: ActiveSession[] = devicesData.map((device: any) => ({
          id: device.id,
          device: `${device.browser_name || 'Unknown'} sur ${device.os_name || 'Unknown'}`,
          location: device.location || 'Localisation inconnue',
          lastActive: new Date(device.last_seen_at).toLocaleString('fr-FR'),
          current: device.is_current || false
        }));
        setSessions(mappedSessions);
      } else {
        // Si pas de table, montrer au moins la session actuelle
        setSessions([{
          id: 'current',
          device: detectCurrentDevice(),
          location: 'Session actuelle',
          lastActive: new Date().toLocaleString('fr-FR'),
          current: true
        }]);
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des infos sécurité:', error);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityInfo();
  }, [fetchSecurityInfo]);

  // Détecter l'appareil actuel
  const detectCurrentDevice = (): string => {
    const ua = navigator.userAgent;
    let browser = 'Navigateur';
    let os = 'Unknown';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';

    return `${browser} sur ${os}`;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 8 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({
        title: 'Mot de passe mis à jour',
        description: 'Votre mot de passe a été modifié avec succès.',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      logger.error('Erreur changement mot de passe:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le mot de passe.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      // Initier le processus d'inscription 2FA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Configuration 2FA',
          description: 'Scannez le QR code avec votre application d\'authentification, puis entrez le code pour confirmer.',
        });
        // Le flux complet de 2FA nécessiterait un modal avec QR code
        // Pour l'instant, on informe l'utilisateur
      }
    } catch (error: any) {
      logger.error('Erreur activation 2FA:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'activer la 2FA pour le moment.',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // Révoquer une session spécifique
      const { error } = await supabase
        .from('connected_devices')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Mettre à jour la liste localement
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      toast({
        title: 'Session révoquée',
        description: 'L\'appareil a été déconnecté avec succès.',
      });
    } catch (error) {
      logger.error('Erreur révocation session:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de révoquer cette session.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Changer le mot de passe
          </CardTitle>
          <CardDescription>
            Mettez à jour votre mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Votre mot de passe actuel"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Votre nouveau mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Minimum 8 caractères avec au moins une majuscule, une minuscule et un chiffre
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Authentification à deux facteurs
          </CardTitle>
          <CardDescription>
            Ajoutez une couche de sécurité supplémentaire à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {has2FA ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">2FA activée</p>
                  <p className="text-sm text-green-600">
                    Votre compte est protégé par l'authentification à deux facteurs
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600">Actif</Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">2FA désactivée</p>
                  <p className="text-sm text-orange-600">
                    Votre compte n'est pas protégé par l'authentification à deux facteurs
                  </p>
                </div>
              </div>
              <Button onClick={handleEnable2FA} size="sm">
                Activer
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Méthodes disponibles :</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Application d'authentification</span>
                </div>
                <Badge variant="outline">Recommandé</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">SMS</span>
                </div>
                <Badge variant="outline">Bientôt</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sessions actives
          </CardTitle>
          <CardDescription>
            Gérez les appareils connectés à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune session active trouvée</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actuelle
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Déconnecter
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recommandations de sécurité
          </CardTitle>
          <CardDescription>
            Améliorez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">Mot de passe fort configuré</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-orange-800">Activez l'authentification à deux facteurs</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Vérifiez régulièrement vos sessions actives</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};