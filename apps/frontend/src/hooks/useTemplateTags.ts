import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TemplateTag {
  id: string;
  tag_name: string;
  usage_count: number;
  created_at: string;
}

export const useTemplateTags = () => {
  // Fetch all tags sorted by usage
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['template-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_tags' as any)
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as TemplateTag[];
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
