-- Fix infinite recursion in emotionsroom RLS policies by creating SECURITY DEFINER functions

-- 1. Create security definer function to get user's active rooms
CREATE OR REPLACE FUNCTION public.get_user_active_room_ids(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(room_id uuid) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT emotionsroom_participants.room_id
  FROM emotionsroom_participants
  WHERE emotionsroom_participants.user_id = p_user_id 
    AND emotionsroom_participants.left_at IS NULL;
$$;

-- 2. Drop and recreate problematic policies for emotionsroom_participants
DROP POLICY IF EXISTS "Users can view participants in rooms they joined" ON public.emotionsroom_participants;

CREATE POLICY "Users can view participants in rooms they joined" 
ON public.emotionsroom_participants 
FOR SELECT 
USING (room_id IN (SELECT get_user_active_room_ids()));

-- 3. Fix ICE candidates policies
DROP POLICY IF EXISTS "Users can create ICE candidates in their rooms" ON public.emotionsroom_ice_candidates;
DROP POLICY IF EXISTS "Users can view ICE candidates in their rooms" ON public.emotionsroom_ice_candidates;

CREATE POLICY "Users can create ICE candidates in their rooms" 
ON public.emotionsroom_ice_candidates 
FOR INSERT 
WITH CHECK (room_id IN (SELECT get_user_active_room_ids()));

CREATE POLICY "Users can view ICE candidates in their rooms" 
ON public.emotionsroom_ice_candidates 
FOR SELECT 
USING (room_id IN (SELECT get_user_active_room_ids()));

-- 4. Fix WebRTC offers policies
DROP POLICY IF EXISTS "Users can create offers in their rooms" ON public.emotionsroom_webrtc_offers;
DROP POLICY IF EXISTS "Users can view offers in their rooms" ON public.emotionsroom_webrtc_offers;

CREATE POLICY "Users can create offers in their rooms" 
ON public.emotionsroom_webrtc_offers 
FOR INSERT 
WITH CHECK (room_id IN (SELECT get_user_active_room_ids()));

CREATE POLICY "Users can view offers in their rooms" 
ON public.emotionsroom_webrtc_offers 
FOR SELECT 
USING (room_id IN (SELECT get_user_active_room_ids()));

-- 5. Fix WebRTC answers policies
DROP POLICY IF EXISTS "Users can create answers in their rooms" ON public.emotionsroom_webrtc_answers;
DROP POLICY IF EXISTS "Users can view answers in their rooms" ON public.emotionsroom_webrtc_answers;

CREATE POLICY "Users can create answers in their rooms" 
ON public.emotionsroom_webrtc_answers 
FOR INSERT 
WITH CHECK (room_id IN (SELECT get_user_active_room_ids()));

CREATE POLICY "Users can view answers in their rooms" 
ON public.emotionsroom_webrtc_answers 
FOR SELECT 
USING (room_id IN (SELECT get_user_active_room_ids()));

-- 6. Fix rooms update policy
DROP POLICY IF EXISTS "Authenticated users can update room participation" ON public.emotionsroom_rooms;

CREATE POLICY "Authenticated users can update room participation" 
ON public.emotionsroom_rooms 
FOR UPDATE 
TO authenticated
USING (id IN (SELECT get_user_active_room_ids()))
WITH CHECK (true);