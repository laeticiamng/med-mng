import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { TEST_MODE_ENABLED, TEST_USER } from '@/config/testMode';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { sendWelcomeEmail } = useEmailNotifications();

  // Gestion des erreurs de refresh token
  const handleAuthError = useCallback((error: any) => {
    if (error?.code === 'refresh_token_not_found' || 
        error?.message?.includes('Refresh Token Not Found') ||
        error?.message?.includes('Invalid Refresh Token')) {
      if (import.meta.env.DEV) console.warn('🔄 Token de rafraîchissement invalide, nettoyage de la session...');
      // Nettoyer la session locale sans appeler signOut (qui pourrait échouer)
      supabase.auth.signOut({ scope: 'local' }).catch(() => {
        // Ignorer les erreurs de déconnexion locale
      });
      setUser(null);
      setLoading(false);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    // Mode test: simuler un utilisateur connecté (log unique au démarrage)
    if (TEST_MODE_ENABLED) {
      // Log unique pour éviter le spam console
      if (!sessionStorage.getItem('test-mode-logged')) {
        if (import.meta.env.DEV) console.log('🧪 Mode test actif - Authentification simulée');
        sessionStorage.setItem('test-mode-logged', 'true');
      }
      setUser(TEST_USER as unknown as User);
      setLoading(false);
      return;
    }

    // Get initial session avec gestion d'erreur
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          handleAuthError(error);
          return;
        }
        setUser(data?.session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.error('Erreur lors de la récupération de session:', error);
        handleAuthError(error);
        setLoading(false);
      });

    // ------------------------------------------------------------------
    // INTERBLOCAGE (constate en production le 18/09/2026)
    // supabase-js execute ce callback EN TENANT son verrou d'authentification
    // (navigator.locks : "lock:sb-<projet>-auth-token"). Tout appel a
    // supabase.from(...) fait depuis l'interieur redemande ce meme verrou et
    // ne l'obtient jamais : le verrou n'est plus jamais relache, et plus
    // AUCUNE requete REST ne part de l'application. Mesure en ligne : verrou
    // detenu, 24 acquisitions en attente, zero requete /rest/v1 sur toute la
    // session. Favoris, gamification, quota, hors-ligne : tout etait gele.
    //
    // La regle de la documentation Supabase : dans ce callback, uniquement des
    // mises a jour d'etat synchrones. Tout le reste est repousse hors du
    // callback (setTimeout 0), une fois le verrou relache.
    // ------------------------------------------------------------------
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (import.meta.env.DEV) console.log('🔔 Auth state change:', event);
        
        // Gérer les erreurs de token
        if (event === 'TOKEN_REFRESHED' && !session) {
          if (import.meta.env.DEV) console.warn('⚠️ Échec du rafraîchissement du token');
          setUser(null);
          setLoading(false);
          return;
        }
        
        setUser(session?.user ?? null);
        setLoading(false);

        // Log auth events & upsert profile — hors du callback (cf. ci-dessus).
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
          // Log activity
          try {
            await supabase.from('user_activity_log').insert({
              user_id: session.user.id,
              activity_type: 'study',
              action: 'user_signed_in',
              duration: 0,
              count: 1,
              metadata: { event: 'signed_in' }
            });
          } catch (e) {
            if (import.meta.env.DEV) console.warn('Could not log sign in activity:', e);
          }

          // Upsert profile with name immediately
          const userId = session.user.id;
          const userName = session.user.user_metadata?.name || session.user.user_metadata?.full_name || null;
          const userEmail = session.user.email;
          try {
            await supabase.from('profiles').upsert({
              id: userId,
              name: userName,
              email: userEmail,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch (e) {
            if (import.meta.env.DEV) console.warn('Could not upsert profile:', e);
          }

          // Send welcome email for new users
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();
          const isNewUser = timeDiff < 60000;
          
          if (isNewUser) {
            const name = userName || userEmail?.split('@')[0] || '';
            if (import.meta.env.DEV) console.log('👤 Nouvel utilisateur inscrit, envoi email de bienvenue...');
            
            setTimeout(async () => {
              try {
                await sendWelcomeEmail(session.user.email!, name);
              } catch (e) {
                if (import.meta.env.DEV) console.warn('Échec envoi email de bienvenue:', e);
              }
            }, 2000);
          }
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          if (import.meta.env.DEV) console.log('User signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [sendWelcomeEmail, handleAuthError]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/med-mng/music-library`,
          data: {
            name,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion locale même si l'appel API échoue
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/med-mng/music-library`,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };


  // Nouvelle fonction: réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/med-mng/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Nouvelle fonction: mise à jour du mot de passe
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
