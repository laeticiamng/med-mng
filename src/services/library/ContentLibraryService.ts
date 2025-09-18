import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type ContentLibraryEntry = Database['public']['Functions']['get_content_library']['Returns'][number];
export type ContentLibraryCollection = Database['public']['Tables']['content_library_collections']['Row'];
export type ContentLibraryItemRow = Database['public']['Tables']['content_library_items']['Row'];
export type StudyNoteRow = Database['public']['Tables']['study_notes']['Row'];
export type ContentResourceType = ContentLibraryEntry['resource_type'];

export interface ContentLibraryQuery {
  query?: string;
  types?: ContentResourceType[];
  favoritesOnly?: boolean;
  collectionId?: string | null;
  sort?: 'recent' | 'alphabetical' | 'type';
  limit?: number;
  offset?: number;
}

interface ToggleFavoriteInput {
  resourceType: ContentResourceType;
  resourceIdentifier: string;
  isFavorite: boolean;
}

interface SaveItemInput {
  resourceType: ContentResourceType;
  resourceIdentifier: string;
  collectionIds?: string[];
  markAsFavorite?: boolean;
}

class ContentLibraryService {
  async fetchLibrary(params: ContentLibraryQuery): Promise<ContentLibraryEntry[]> {
    const { data, error } = await supabase.rpc('get_content_library', {
      p_search: params.query?.trim() ? params.query : null,
      p_types: params.types && params.types.length > 0 ? params.types : null,
      p_only_favorites: params.favoritesOnly ?? false,
      p_collection_id: params.collectionId ?? null,
      p_sort: params.sort ?? 'recent',
      p_limit: params.limit ?? 24,
      p_offset: params.offset ?? 0,
    });

    if (error) {
      throw new Error(error.message || 'Impossible de charger la bibliothèque');
    }

    return data ?? [];
  }

  async listCollections(): Promise<ContentLibraryCollection[]> {
    const { data, error } = await supabase
      .from('content_library_collections')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message || 'Impossible de charger les collections');
    }

    return data ?? [];
  }

  async createCollection(name: string, description?: string | null): Promise<ContentLibraryCollection> {
    const { data, error } = await supabase.rpc('create_library_collection', {
      p_name: name,
      p_description: description ?? null,
    });

    if (error) {
      throw new Error(error.message || "Impossible de créer la collection");
    }

    return data;
  }

  async saveItem(input: SaveItemInput): Promise<ContentLibraryItemRow> {
    const { data, error } = await supabase.rpc('save_content_library_item', {
      p_resource_type: input.resourceType,
      p_resource_identifier: input.resourceIdentifier,
      p_collection_ids: input.collectionIds ?? null,
      p_is_favorite: input.markAsFavorite ?? null,
    });

    if (error) {
      throw new Error(error.message || "Impossible d'ajouter à la bibliothèque");
    }

    return data;
  }

  async removeItem(resourceType: ContentResourceType, resourceIdentifier: string): Promise<void> {
    const { error } = await supabase.rpc('remove_content_library_item', {
      p_resource_type: resourceType,
      p_resource_identifier: resourceIdentifier,
    });

    if (error) {
      throw new Error(error.message || "Impossible de retirer l'élément");
    }
  }

  async toggleFavorite({ resourceType, resourceIdentifier, isFavorite }: ToggleFavoriteInput): Promise<ContentLibraryItemRow> {
    return this.saveItem({
      resourceType,
      resourceIdentifier,
      markAsFavorite: isFavorite,
    });
  }

  async addToCollection(resourceType: ContentResourceType, resourceIdentifier: string, collectionId: string): Promise<ContentLibraryItemRow> {
    const { data, error } = await supabase.rpc('add_library_item_to_collection', {
      p_resource_type: resourceType,
      p_resource_identifier: resourceIdentifier,
      p_collection_id: collectionId,
    });

    if (error) {
      throw new Error(error.message || "Impossible d'ajouter à la collection");
    }

    return data;
  }

  async removeFromCollection(resourceType: ContentResourceType, resourceIdentifier: string, collectionId: string): Promise<void> {
    const { error } = await supabase.rpc('remove_library_item_from_collection', {
      p_resource_type: resourceType,
      p_resource_identifier: resourceIdentifier,
      p_collection_id: collectionId,
    });

    if (error) {
      throw new Error(error.message || "Impossible de retirer de la collection");
    }
  }

  async getStudyNote(noteId: string): Promise<StudyNoteRow | null> {
    const { data, error } = await supabase
      .from('study_notes')
      .select('*')
      .eq('id', noteId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || 'Impossible de charger la note');
    }

    return data ?? null;
  }

  async getEdnItem(itemCode: string) {
    const { data, error } = await supabase
      .from('edn_unified_materialized')
      .select('*')
      .eq('item_code', itemCode)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || "Impossible de charger la fiche EDN");
    }

    return data;
  }
}

export const contentLibraryService = new ContentLibraryService();
