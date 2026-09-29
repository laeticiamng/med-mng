-- SÉCURITÉ CRITIQUE : med_mng_create_user_sub() acceptait un plan_name arbitraire
-- fourni par l'appelant, sans aucune vérification de paiement (Stripe/PayPal), et
-- était exécutable par PUBLIC (donc anon ET authenticated). Concrètement, n'importe
-- quel compte inscrit gratuitement pouvait s'auto-attribuer l'abonnement "premium"
-- (5000 crédits) via un simple appel RPC/API, sans jamais payer.
--
-- La création/mise à jour d'abonnement légitime passe exclusivement par le webhook
-- Stripe vérifié (mm-stripe-webhook, qui contrôle la signature Stripe et tourne en
-- service_role) — cette fonction ne doit donc être appelable que par service_role.
--
-- Découvert et corrigé en urgence le 2026-09-30 lors de l'audit sécurité Supabase
-- (chantier RLS/RPC), appliqué directement en base de données production avant
-- ce commit ; ce fichier rend le correctif permanent et rejouable.

revoke execute on function public.med_mng_create_user_sub(text, text, text) from public, anon, authenticated;
grant execute on function public.med_mng_create_user_sub(text, text, text) to service_role;
