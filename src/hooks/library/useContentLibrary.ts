import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentLibraryService, type ContentLibraryCollection, type ContentLibraryEntry, type ContentResourceType } from '@/services/library/ContentLibraryService';
import { toast } from 'sonner';

export type ContentLibrarySort = 'recent' | 'alphabetical' | 'type';

export interface ContentLibraryFilters {
  query: string;
  types: ContentResourceType[];
  favoritesOnly: boolean;
  collectionId: string | null;
  sort: ContentLibrarySort;
  itemCode: string | null;
  mode: 'A' | 'B' | 'AB' | null;
  style: string | null;
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: ContentLibraryFilters = {
  query: '',
  types: [],
  favoritesOnly: false,
  collectionId: null,
  sort: 'recent',
  itemCode: null,
  mode: null,
  style: null,
  page: 1,
  pageSize: 12,
};

export interface UseContentLibraryResult {
  items: ContentLibraryEntry[];
  totalCount: number;
  collections: ContentLibraryCollection[];
  filters: ContentLibraryFilters;
  setFilters: (updater: (filters: ContentLibraryFilters) => ContentLibraryFilters) => void;
  isLoading: boolean;
  isFetching: boolean;
  isMutating: boolean;
  error: unknown;
  refresh: () => Promise<void>;
  toggleType: (type: ContentResourceType) => void;
  toggleFavoritesOnly: () => void;
  setCollection: (collectionId: string | null) => void;
  setSort: (sort: ContentLibrarySort) => void;
  setQuery: (query: string) => void;
  setItemCode: (itemCode: string | null) => void;
  setMode: (mode: 'A' | 'B' | 'AB' | null) => void;
  setStyle: (style: string | null) => void;
  setPage: (page: number) => void;
  saveItem: (resourceType: ContentResourceType, resourceIdentifier: string) => Promise<void>;
  removeItem: (resourceType: ContentResourceType, resourceIdentifier: string) => Promise<void>;
  toggleFavorite: (resourceType: ContentResourceType, resourceIdentifier: string, nextValue: boolean) => Promise<void>;
  addToCollection: (resourceType: ContentResourceType, resourceIdentifier: string, collectionId: string) => Promise<void>;
  removeFromCollection: (resourceType: ContentResourceType, resourceIdentifier: string, collectionId: string) => Promise<void>;
  createCollection: (name: string, description?: string | null) => Promise<ContentLibraryCollection | null>;
}

export const useContentLibrary = (): UseContentLibraryResult => {
  const queryClient = useQueryClient();
  const [filters, updateFilters] = useState<ContentLibraryFilters>(DEFAULT_FILTERS);

  const libraryQuery = useQuery({
    queryKey: ['content-library', filters],
    queryFn: () =>
      contentLibraryService.fetchLibrary({
        query: filters.query,
        types: filters.types,
        favoritesOnly: filters.favoritesOnly,
        collectionId: filters.collectionId,
        sort: filters.sort,
        itemCode: filters.itemCode,
        mode: filters.mode,
        style: filters.style,
        limit: filters.pageSize,
        offset: (filters.page - 1) * filters.pageSize,
      }),
    placeholderData: (previousData) => previousData,
  });

  const collectionsQuery = useQuery({
    queryKey: ['content-library-collections'],
    queryFn: () => contentLibraryService.listCollections(),
    staleTime: 1000 * 60 * 5,
  });

  const saveMutation = useMutation({
    mutationFn: ({ resourceType, resourceIdentifier }: { resourceType: ContentResourceType; resourceIdentifier: string }) =>
      contentLibraryService.saveItem({ resourceType, resourceIdentifier }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content-library'] });
      await queryClient.invalidateQueries({ queryKey: ['content-library-collections'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Impossible d'enregistrer l'élément");
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ resourceType, resourceIdentifier }: { resourceType: ContentResourceType; resourceIdentifier: string }) =>
      contentLibraryService.removeItem(resourceType, resourceIdentifier),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content-library'] });
      await queryClient.invalidateQueries({ queryKey: ['content-library-collections'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Impossible de retirer l'élément");
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ resourceType, resourceIdentifier, isFavorite }: { resourceType: ContentResourceType; resourceIdentifier: string; isFavorite: boolean }) =>
      contentLibraryService.toggleFavorite({ resourceType, resourceIdentifier, isFavorite }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content-library'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Impossible de mettre à jour le favori');
    },
  });

  const addToCollectionMutation = useMutation({
    mutationFn: ({ resourceType, resourceIdentifier, collectionId }: { resourceType: ContentResourceType; resourceIdentifier: string; collectionId: string }) =>
      contentLibraryService.addToCollection(resourceType, resourceIdentifier, collectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content-library'] });
      await queryClient.invalidateQueries({ queryKey: ['content-library-collections'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Impossible d'ajouter à la collection");
    },
  });

  const removeFromCollectionMutation = useMutation({
    mutationFn: ({ resourceType, resourceIdentifier, collectionId }: { resourceType: ContentResourceType; resourceIdentifier: string; collectionId: string }) =>
      contentLibraryService.removeFromCollection(resourceType, resourceIdentifier, collectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content-library'] });
      await queryClient.invalidateQueries({ queryKey: ['content-library-collections'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Impossible de retirer de la collection");
    },
  });

  const createCollectionMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string | null }) =>
      contentLibraryService.createCollection(name, description),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['content-library-collections'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Impossible de créer la collection');
    },
  });

  const setFilters = useCallback((updater: (filters: ContentLibraryFilters) => ContentLibraryFilters) => {
    updateFilters((current) => updater({ ...current }));
  }, []);

  const toggleType = useCallback((type: ContentResourceType) => {
    setFilters((current) => {
      const exists = current.types.includes(type);
      const nextTypes = exists ? current.types.filter((t) => t !== type) : [...current.types, type];
      return { ...current, types: nextTypes, page: 1 };
    });
  }, [setFilters]);

  const toggleFavoritesOnly = useCallback(() => {
    setFilters((current) => ({ ...current, favoritesOnly: !current.favoritesOnly, page: 1 }));
  }, [setFilters]);

  const setCollection = useCallback((collectionId: string | null) => {
    setFilters((current) => ({ ...current, collectionId, page: 1 }));
  }, [setFilters]);

  const setSort = useCallback((sort: ContentLibrarySort) => {
    setFilters((current) => ({ ...current, sort, page: 1 }));
  }, [setFilters]);

  const setQuery = useCallback((query: string) => {
    setFilters((current) => ({ ...current, query, page: 1 }));
  }, [setFilters]);

  const setItemCode = useCallback((itemCode: string | null) => {
    setFilters((current) => ({ ...current, itemCode, page: 1 }));
  }, [setFilters]);

  const setMode = useCallback((mode: 'A' | 'B' | 'AB' | null) => {
    setFilters((current) => ({ ...current, mode, page: 1 }));
  }, [setFilters]);

  const setStyle = useCallback((style: string | null) => {
    setFilters((current) => ({ ...current, style, page: 1 }));
  }, [setFilters]);

  const setPage = useCallback((page: number) => {
    setFilters((current) => ({ ...current, page: Math.max(1, page) }));
  }, [setFilters]);

  const saveItem = useCallback(
    async (resourceType: ContentResourceType, resourceIdentifier: string) => {
      await saveMutation.mutateAsync({ resourceType, resourceIdentifier });
      toast.success('Ajouté à votre bibliothèque');
    },
    [saveMutation],
  );

  const removeItem = useCallback(
    async (resourceType: ContentResourceType, resourceIdentifier: string) => {
      await removeMutation.mutateAsync({ resourceType, resourceIdentifier });
      toast.success('Supprimé de votre bibliothèque');
    },
    [removeMutation],
  );

  const toggleFavorite = useCallback(
    async (resourceType: ContentResourceType, resourceIdentifier: string, nextValue: boolean) => {
      await favoriteMutation.mutateAsync({ resourceType, resourceIdentifier, isFavorite: nextValue });
      toast.success(nextValue ? 'Ajouté aux favoris' : 'Retiré des favoris');
    },
    [favoriteMutation],
  );

  const addToCollection = useCallback(
    async (resourceType: ContentResourceType, resourceIdentifier: string, collectionId: string) => {
      await addToCollectionMutation.mutateAsync({ resourceType, resourceIdentifier, collectionId });
      toast.success('Ajouté à la collection');
    },
    [addToCollectionMutation],
  );

  const removeFromCollection = useCallback(
    async (resourceType: ContentResourceType, resourceIdentifier: string, collectionId: string) => {
      await removeFromCollectionMutation.mutateAsync({ resourceType, resourceIdentifier, collectionId });
      toast.success('Retiré de la collection');
    },
    [removeFromCollectionMutation],
  );

  const createCollection = useCallback(
    async (name: string, description?: string | null) => {
      if (!name.trim()) {
        toast.error('Le nom de la collection est requis');
        return null;
      }

      const result = await createCollectionMutation.mutateAsync({ name: name.trim(), description: description ?? null });
      toast.success('Collection créée');
      return result;
    },
    [createCollectionMutation],
  );

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['content-library'] }),
      queryClient.invalidateQueries({ queryKey: ['content-library-collections'] }),
    ]);
  }, [queryClient]);

  const isMutating = useMemo(
    () =>
      saveMutation.isPending ||
      removeMutation.isPending ||
      favoriteMutation.isPending ||
      addToCollectionMutation.isPending ||
      removeFromCollectionMutation.isPending ||
      createCollectionMutation.isPending,
    [
      addToCollectionMutation.isPending,
      createCollectionMutation.isPending,
      favoriteMutation.isPending,
      removeFromCollectionMutation.isPending,
      removeMutation.isPending,
      saveMutation.isPending,
    ],
  );

  return {
    items: libraryQuery.data?.items ?? [],
    totalCount: libraryQuery.data?.totalCount ?? 0,
    collections: collectionsQuery.data ?? [],
    filters,
    setFilters,
    isLoading: libraryQuery.isLoading,
    isFetching: libraryQuery.isFetching,
    isMutating,
    error: libraryQuery.error,
    refresh,
    toggleType,
    toggleFavoritesOnly,
    setCollection,
    setSort,
    setQuery,
    setItemCode,
    setMode,
    setStyle,
    setPage,
    saveItem,
    removeItem,
    toggleFavorite,
    addToCollection,
    removeFromCollection,
    createCollection,
  };
};
