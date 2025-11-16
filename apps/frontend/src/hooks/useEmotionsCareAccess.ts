/**
 * Hook React pour gérer l'accès à EmotionsCare
 *
 * Vérifie si l'utilisateur a accès au module EmotionsCare
 * et fournit une fonction pour rediriger vers la plateforme.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useSubscription } from './useSubscription';
import { redirectToEmotionsCare, EmotionsCareError } from '@/utils/emotionscare-sso';
import { toast } from 'sonner';

export interface EmotionsCareAccessState {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

export const useEmotionsCareAccess = () => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [state, setState] = useState<EmotionsCareAccessState>({
    hasAccess: false,
    loading: true,
    error: null,
  });

  /**
   * Vérifie si l'utilisateur a accès à EmotionsCare
   */
  useEffect(() => {
    if (subscriptionLoading) {
      setState(prev => ({ ...prev, loading: true }));
      return;
    }

    if (!user) {
      setState({
        hasAccess: false,
        loading: false,
        error: null,
      });
      return;
    }

    // Vérifier si l'utilisateur a un plan premium
    const isPremium = subscription?.plan_name?.toLowerCase().includes('premium') || false;

    setState({
      hasAccess: isPremium,
      loading: false,
      error: isPremium ? null : 'Access denied: Premium subscription required',
    });
  }, [user, subscription, subscriptionLoading]);

  /**
   * Fonction pour rediriger vers EmotionsCare
   * Gère les erreurs et affiche des toasts appropriés
   */
  const navigateToEmotionsCare = useCallback(async () => {
    if (!user) {
      toast.error('Connexion requise', {
        description: 'Veuillez vous connecter pour accéder au module bien-être.',
      });
      return;
    }

    if (!state.hasAccess) {
      toast.error('Abonnement requis', {
        description: 'Le module bien-être EmotionsCare est inclus dans l\'abonnement Réussite. Mets à jour ton abonnement pour y accéder.',
        duration: 5000,
      });
      return;
    }

    try {
      // Afficher un toast de chargement
      toast.loading('Redirection vers EmotionsCare...', {
        id: 'emotionscare-redirect',
      });

      await redirectToEmotionsCare();

      // Note: le toast sera automatiquement fermé lors de la redirection
    } catch (error) {
      // Fermer le toast de chargement
      toast.dismiss('emotionscare-redirect');

      if (error instanceof EmotionsCareError) {
        switch (error.code) {
          case 'NO_SESSION':
            toast.error('Session expirée', {
              description: 'Veuillez vous reconnecter pour accéder à EmotionsCare.',
            });
            break;
          case 'NO_ACCESS':
            toast.error('Accès refusé', {
              description: error.message,
              duration: 5000,
            });
            break;
          case 'REDIRECT_FAILED':
            toast.error('Erreur de redirection', {
              description: 'Impossible d\'accéder à EmotionsCare. Veuillez réessayer.',
            });
            break;
        }
      } else {
        toast.error('Erreur inattendue', {
          description: 'Une erreur est survenue. Veuillez réessayer.',
        });
      }
    }
  }, [user, state.hasAccess]);

  return {
    ...state,
    navigateToEmotionsCare,
  };
};
