-- Fix search_path for security definer functions using correct app_role type

-- Update has_role function with proper search_path and correct type
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Update handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update calculate_srs_interval function with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_srs_interval(
  current_interval integer,
  ease_factor numeric,
  quality integer
)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_interval integer;
BEGIN
  IF quality < 3 THEN
    -- Failed: reset to 1 day
    new_interval := 1;
  ELSIF current_interval = 0 THEN
    -- First review
    new_interval := 1;
  ELSIF current_interval = 1 THEN
    -- Second review
    new_interval := 6;
  ELSE
    -- Subsequent reviews: multiply by ease factor
    new_interval := CEIL(current_interval * ease_factor);
  END IF;
  
  -- Cap at 365 days
  RETURN LEAST(new_interval, 365);
END;
$$;

-- Update calculate_new_ease_factor function with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_new_ease_factor(
  current_ease numeric,
  quality integer
)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_ease numeric;
BEGIN
  -- SM-2 algorithm ease factor adjustment
  new_ease := current_ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  -- Minimum ease factor is 1.3
  RETURN GREATEST(new_ease, 1.3);
END;
$$;