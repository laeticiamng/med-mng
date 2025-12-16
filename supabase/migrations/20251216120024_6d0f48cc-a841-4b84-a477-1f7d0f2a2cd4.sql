-- Add unique constraint on stripe_subscription_id for upserts
ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_stripe_subscription_id_key;
ALTER TABLE public.user_subscriptions ADD CONSTRAINT user_subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);