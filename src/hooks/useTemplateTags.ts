import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TemplateTag } from '@/types/database.types';

export type { TemplateTag };

export const useTemplateTags = () => {
  // Fetch all tags sorted by usage
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['template-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_tags')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return (data || []) as TemplateTag[];
    },
  });

  // Get popular tags (top 10)
  const popularTags = tags.slice(0, 10);

  // Search tags by name
  const searchTags = (query: string): TemplateTag[] => {
    if (!query.trim()) return popularTags;
    
    const lowerQuery = query.toLowerCase();
    return tags.filter(tag => 
      tag.tag_name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
  };

  return {
    tags,
    popularTags,
    searchTags,
    isLoading,
  };
};
