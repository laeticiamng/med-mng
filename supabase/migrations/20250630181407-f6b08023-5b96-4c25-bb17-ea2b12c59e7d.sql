
-- Add payload_v2 column to edn_items_immersive table
ALTER TABLE public.edn_items_immersive 
ADD COLUMN payload_v2 jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN public.edn_items_immersive.payload_v2 IS 'New V2 format data structure for EDN items';
