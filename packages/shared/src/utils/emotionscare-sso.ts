/**
 * EmotionsCare SSO Integration
 *
 * Gère la redirection SSO vers EmotionsCare en mode "Examens"
 * en utilisant les tokens Supabase pour l'authentification.
 */

import { supabase } from '../lib/supabase';

/**
 * URL de base d'EmotionsCare (à configurer selon l'environnement)
 */
const EMOTIONSCARE_BASE_URL = import.meta.env.VITE_EMOTIONSCARE_URL || 'https://app.emotionscare.com';

/**
 * Erreurs possibles lors du SSO EmotionsCare
 */
export class EmotionsCareError extends Error {
  constructor(
    message: string,
    public code: 'NO_SESSION' | 'NO_ACCESS' | 'REDIRECT_FAILED'
  ) {
    super(message);
    this.name = 'EmotionsCareError';
  }
}

/**
 * Vérifie si l'utilisateur a accès au module EmotionsCare
 *
 * Critères d'accès :
 * - Utilisateur connecté avec session Supabase valide
 * - Plan premium ou supérieur
 *
 * @returns Promise<boolean> - true si l'utilisateur a accès
 */
export async function checkEmotionsCareAccess(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      return false;
    }

    // Récupérer le profil utilisateur pour vérifier le plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', session.user.id)
      .single();

    // Vérifier si l'utilisateur a un plan premium
    const isPremium = profile?.subscription_plan?.toLowerCase().includes('premium');

    return isPremium || false;
  } catch (error) {
    console.error('Error checking EmotionsCare access:', error);
    return false;
  }
}

/**
 * Redirige l'utilisateur vers EmotionsCare en mode "Examens"
 * avec authentification SSO via tokens Supabase
 *
 * @throws EmotionsCareError si la redirection échoue
 */
export async function redirectToEmotionsCare(): Promise<void> {
  try {
    // Récupérer la session Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new EmotionsCareError(
        'Aucune session active. Veuillez vous reconnecter.',
        'NO_SESSION'
      );
    }

    // Vérifier l'accès
    const hasAccess = await checkEmotionsCareAccess();
    if (!hasAccess) {
      throw new EmotionsCareError(
        'Le module bien-être EmotionsCare est inclus dans l\'abonnement Réussite. Mets à jour ton abonnement pour y accéder.',
        'NO_ACCESS'
      );
    }

    // Construire l'URL de redirection avec les tokens
    const redirectUrl = new URL('/exam-mode', EMOTIONSCARE_BASE_URL);

    // Ajouter les tokens en tant que paramètres
    // Note: En production, considérer l'utilisation de hash au lieu de query params
    // pour plus de sécurité (les tokens ne seront pas dans l'historique)
    redirectUrl.searchParams.set('access_token', session.access_token);
    redirectUrl.searchParams.set('refresh_token', session.refresh_token);

    // Rediriger vers EmotionsCare
    window.location.href = redirectUrl.toString();
  } catch (error) {
    // Si c'est déjà une EmotionsCareError, la relancer
    if (error instanceof EmotionsCareError) {
      throw error;
    }

    // Sinon, créer une nouvelle erreur
    throw new EmotionsCareError(
      'Erreur lors de la redirection vers EmotionsCare. Veuillez réessayer.',
      'REDIRECT_FAILED'
    );
  }
}

/**
 * Construit l'URL de redirection vers EmotionsCare (sans effectuer la redirection)
 * Utile pour les tests ou pour ouvrir dans un nouvel onglet
 *
 * @returns Promise<string> - L'URL de redirection complète
 */
export async function getEmotionsCareUrl(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new EmotionsCareError(
      'Aucune session active. Veuillez vous reconnecter.',
      'NO_SESSION'
    );
  }

  const redirectUrl = new URL('/exam-mode', EMOTIONSCARE_BASE_URL);
  redirectUrl.searchParams.set('access_token', session.access_token);
  redirectUrl.searchParams.set('refresh_token', session.refresh_token);

  return redirectUrl.toString();
}
