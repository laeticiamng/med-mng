import { ProfileSubscription } from '@/components/med-mng/profile/ProfileSubscription';

/**
 * Onglet « Facturation » des réglages. L'ancienne version lisait la table
 * `subscriptions` (celle d'EmotionsCare) et affichait une grille obsolète
 * (19/29/39 €, « Institution 99 €/mois ») : elle affiche désormais la même
 * vue que le profil, alimentée par l'abonnement Med MNG réel.
 */
export const BillingDashboard = () => <ProfileSubscription />;
