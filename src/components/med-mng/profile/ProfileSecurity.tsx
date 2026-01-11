import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/med-mng/AuthProvider';
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
  Loader2
} from 'lucide-react';

export const ProfileSecurity: React.FC = () => {
  const { updatePassword, resetPassword, user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Au moins 8 caractères');
    if (!/[A-Z]/.test(password)) errors.push('Au moins une majuscule');
    if (!/[a-z]/.test(password)) errors.push('Au moins une minuscule');
    if (!/[0-9]/.test(password)) errors.push('Au moins un chiffre');
    return errors;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    const validationErrors = validatePassword(passwordForm.newPassword);
    if (validationErrors.length > 0) {
      toast({
        title: "Mot de passe invalide",
        description: validationErrors.join(', '),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await updatePassword(passwordForm.newPassword);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible de mettre à jour le mot de passe.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast({
        title: "Erreur",
        description: "Aucun email associé à ce compte.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(user.email);
      
      if (error) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'envoyer l'email de réinitialisation.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation a été envoyé à votre adresse.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnable2FA = () => {
    toast({
      title: "Authentification à deux facteurs",
      description: "Cette fonctionnalité sera bientôt disponible.",
    });
  };

  const mockSessions = [
    {
      id: 1,
      device: 'Chrome sur Windows',
      location: 'Paris, France',
      lastActive: '2024-01-15 14:30',
      current: true,
    },
    {
      id: 2,
      device: 'Safari sur iPhone',
      location: 'Lyon, France',
      lastActive: '2024-01-14 09:15',
      current: false,
    },
    {
      id: 3,
      device: 'Firefox sur macOS',
      location: 'Marseille, France',
      lastActive: '2024-01-13 16:45',
      current: false,
    },
  ];

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
              <p className="text-xs text-muted-foreground">
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

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Mettre à jour le mot de passe
              </Button>
              <Button 
                type="button" 
                variant="link" 
                className="text-sm"
                onClick={handleForgotPassword}
                disabled={isSubmitting}
              >
                Mot de passe oublié ? Recevoir un email de réinitialisation
              </Button>
            </div>
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
          <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning">2FA désactivée</p>
                <p className="text-sm text-warning/80">
                  Votre compte n'est pas protégé par l'authentification à deux facteurs
                </p>
              </div>
            </div>
            <Button onClick={handleEnable2FA} size="sm">
              Activer
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Méthodes disponibles :</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Application d'authentification</span>
                </div>
                <Badge variant="outline">Recommandé</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
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
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <Button variant="outline" size="sm">
                  Déconnecter
                </Button>
              )}
            </div>
          ))}
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
          <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-sm text-success">Mot de passe fort configuré</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-sm text-warning">Activez l'authentification à deux facteurs</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm text-primary">Vérifiez régulièrement vos sessions actives</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};