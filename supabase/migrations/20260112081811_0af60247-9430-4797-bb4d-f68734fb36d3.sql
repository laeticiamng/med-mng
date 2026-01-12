-- =============================================
-- CORRECTION CRITIQUE: Récursion infinie RLS
-- Tables: social_rooms et room_members
-- =============================================

-- 1. Créer les fonctions SECURITY DEFINER pour éviter la récursion
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.room_members
    WHERE user_id = _user_id
      AND room_id = _room_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_room_host(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.social_rooms
    WHERE host_id = _user_id
      AND id = _room_id
  )
$$;

-- 2. Supprimer policies v2 si elles existent
DROP POLICY IF EXISTS "social_rooms_select_v2" ON public.social_rooms;
DROP POLICY IF EXISTS "room_members_select_v2" ON public.room_members;

-- 3. Recréer les policies sans récursion
-- social_rooms: Voir les salons publics ou les salons où l'utilisateur est membre/host
CREATE POLICY "social_rooms_select_v2" 
ON public.social_rooms 
FOR SELECT 
TO authenticated
USING (
  host_id = auth.uid() 
  OR is_private = false
  OR public.is_room_member(auth.uid(), id)
);

-- room_members: Voir ses propres memberships ou ceux des rooms dont on est host
CREATE POLICY "room_members_select_v2" 
ON public.room_members 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_room_host(auth.uid(), room_id)
);