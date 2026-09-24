import { ProfileSubscription } from '@/components/med-mng/profile/ProfileSubscription';

/**
 * Page /med-mng/billing : même vue que l'onglet Abonnement du profil
 * (source unique : useSubscription → RPC get_user_subscription), avec le
 * bouton « Gérer / résilier mon abonnement » vers le portail Stripe.
 */
export const BillingDashboard = () => <ProfileSubscription afficherLienFacturation={false} />;
