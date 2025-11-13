-- Add tags column to notification_filter_templates
ALTER TABLE public.notification_filter_templates 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tags search
CREATE INDEX IF NOT EXISTS idx_notification_filter_templates_tags 
ON public.notification_filter_templates USING GIN(tags);

-- Create a table to store all unique tags with usage count
CREATE TABLE IF NOT EXISTS public.template_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_name TEXT NOT NULL UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.template_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_tags - everyone can read, only system can write
CREATE POLICY "Everyone can view tags"
ON public.template_tags FOR SELECT
USING (true);

-- Create index for tag search
CREATE INDEX IF NOT EXISTS idx_template_tags_name 
ON public.template_tags(tag_name);

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tag TEXT;
  old_tag TEXT;
BEGIN
  -- Handle INSERT or UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Add new tags
    IF NEW.tags IS NOT NULL THEN
      FOREACH tag IN ARRAY NEW.tags
      LOOP
        INSERT INTO template_tags (tag_name, usage_count)
        VALUES (tag, 1)
        ON CONFLICT (tag_name) 
        DO UPDATE SET usage_count = template_tags.usage_count + 1;
      END LOOP;
    END IF;
    
    -- Remove old tags if updating
    IF TG_OP = 'UPDATE' AND OLD.tags IS NOT NULL THEN
      FOREACH old_tag IN ARRAY OLD.tags
      LOOP
        -- Only decrease if tag is not in new tags
        IF NEW.tags IS NULL OR NOT (old_tag = ANY(NEW.tags)) THEN
          UPDATE template_tags 
          SET usage_count = GREATEST(usage_count - 1, 0)
          WHERE tag_name = old_tag;
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.tags IS NOT NULL THEN
      FOREACH old_tag IN ARRAY OLD.tags
      LOOP
        UPDATE template_tags 
        SET usage_count = GREATEST(usage_count - 1, 0)
        WHERE tag_name = old_tag;
      END LOOP;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for tag usage count
DROP TRIGGER IF EXISTS update_tag_usage_trigger ON public.notification_filter_templates;
CREATE TRIGGER update_tag_usage_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.notification_filter_templates
FOR EACH ROW
EXECUTE FUNCTION update_tag_usage_count();