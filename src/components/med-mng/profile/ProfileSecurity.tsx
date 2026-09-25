import { useAuth } from '@/components/med-mng/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { traduireErreurAuth } from '@/lib/erreursAuth';
import {
    Eye,
    EyeOff,
    Key,
    Loader2,
} from 'lucide-react';
import React, { useState } from 'react';

export const ProfileSecurity: React.FC = () => {
  const { updatePassword, resetPassword, user } = useAuth();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
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
          description: traduireErreurAuth(error),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      setPasswordForm({
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: traduireErreurAuth(error),
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
          description: traduireErreurAuth(error),
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
        description: traduireErreurAuth(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            {/* Le champ « mot de passe actuel » a été retiré : il n'était jamais
                vérifié (la session connectée suffit à Supabase pour changer le mot
                de passe), ce qui laissait croire à un contrôle inexistant. */}
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

      {/* CONSTAT (25/09/2026) : trois encarts factices retirés — « Authentification à
          deux facteurs » (« Activer » répondait « bientôt disponible »), « Sessions
          actives » (une seule ligne, déduite du navigateur courant, sans vraie liste
          de sessions) et « Recommandations de sécurité » (« Mot de passe fort
          configuré » affirmé sans vérification). Seul le changement de mot de
          passe, réel, est conservé. */}
    </div>
  );
};