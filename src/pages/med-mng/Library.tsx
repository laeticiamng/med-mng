import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import {
  BookOpen,
  Clock,
  Download,
  Filter,
  Folder,
  FolderPlus,
  GraduationCap,
  Heart,
  HeartOff,
  Image as ImageIcon,
  Layers,
  ListPlus,
  Mic,
  Music,
  FileText,
  Pause,
  Play,
  RefreshCcw,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useContentLibrary, type ContentLibraryFilters } from '@/hooks/library/useContentLibrary';
import { contentLibraryService } from '@/services/library/ContentLibraryService';
import { musicService } from '@/services';
import type {
  ContentLibraryEntry,
  ContentResourceType,
  StudyNoteRow,
} from '@/services/library/ContentLibraryService';
import { useUser } from '@/stores/appStore';
import { musicStyles } from '@/components/med-mng/create/StyleSelector';

const RESOURCE_CONFIG: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  track: { label: 'Piste générée', description: 'Audio Suno orchestré par item', icon: <Music className="h-4 w-4" /> },
  lyrics: { label: 'Paroles synchronisées', description: 'Segments temps réel pour karaoké', icon: <Mic className="h-4 w-4" /> },
  edn: { label: 'Fiche EDN', description: 'Données unifiées EDN/ECOS', icon: <BookOpen className="h-4 w-4" /> },
  qcm: { label: 'Session QCM', description: 'Questionnaires générés & scores', icon: <GraduationCap className="h-4 w-4" /> },
  comic: { label: 'Bande dessinée', description: 'Script et planches pédagogiques', icon: <ImageIcon className="h-4 w-4" /> },
  note: { label: 'Note personnelle', description: 'Annotations & rappels de révision', icon: <FileText className="h-4 w-4" /> },
};

interface CollectionSummary {
  id: string;
  name: string;
}

type CollectionJson = { id?: string; name?: string }[] | null | undefined;

const parseCollections = (value: CollectionJson): CollectionSummary[] => {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => ({ id: entry?.id ?? '', name: entry?.name ?? '' }))
    .filter((entry) => Boolean(entry.id) && Boolean(entry.name));
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remaining}`;
};

const formatTimestamp = (ms?: number | null) => {
  if (ms === null || ms === undefined) return '0:00';
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

type ExportFormat = 'md' | 'json';

const buildExportPayload = async (
  resourceType: string,
  resourceIdentifier: string,
  title: string,
  metadata: any,
  format: ExportFormat,
): Promise<{ content: string; mimeType: string; extension: string }> => {
  const header = `# ${title}\nType : ${resourceType.toUpperCase()}\nRéférence : ${resourceIdentifier}\n`;

  if (format === 'json') {
    const payload: Record<string, unknown> = {
      type: resourceType,
      id: resourceIdentifier,
      title,
      metadata,
    };

    switch (resourceType) {
      case 'lyrics': {
        payload.segments = await contentLibraryService.getLyricsSegments(resourceIdentifier);
        break;
      }
      case 'comic': {
        payload.comic = await contentLibraryService.getComicEntry(resourceIdentifier);
        break;
      }
      case 'note': {
        payload.note = await contentLibraryService.getStudyNote(resourceIdentifier);
        break;
      }
      case 'edn': {
        if (metadata?.item_code) {
          payload.item = await contentLibraryService.getEdnItem(metadata.item_code);
        }
        break;
      }
      default:
        break;
    }

    return {
      content: JSON.stringify(payload, null, 2),
      mimeType: 'application/json;charset=utf-8',
      extension: 'json',
    };
  }

  if (resourceType === 'track') {
    const duration = formatDuration(Number(metadata?.duration_seconds ?? metadata?.duration));
    const segmentCount = metadata?.segment_count ?? 0;
    const status = metadata?.generation_status ?? metadata?.status ?? 'Inconnu';
    const style = metadata?.style ?? '—';
    const mode = metadata?.mode ?? '—';
    const itemCode = metadata?.item_code ?? '—';
    const lines = [
      `- Item : ${itemCode}`,
      `- Mode : ${mode}`,
      `- Style : ${style}`,
      `- Durée : ${duration}`,
      `- Segments synchronisés : ${segmentCount}`,
      `- Statut : ${status}`,
    ];
    return {
      content: `${header}\n${lines.join('\n')}\n`,
      mimeType: 'text/markdown;charset=utf-8',
      extension: 'md',
    };
  }

  if (resourceType === 'lyrics') {
    const segments = await contentLibraryService.getLyricsSegments(resourceIdentifier);
    const mode = metadata?.mode ?? '—';
    const style = metadata?.style ?? '—';
    const itemCode = metadata?.item_code ?? '—';
    const lines = segments.length
      ? segments
          .map(
            (segment) =>
              `- [${formatTimestamp(segment.start_ms)} → ${formatTimestamp(segment.end_ms)}] ${segment.text ?? ''}`,
          )
          .join('\n')
      : 'Aucun segment synchronisé.';

    const intro = [`- Item : ${itemCode}`, `- Mode : ${mode}`, `- Style : ${style}`, `- Segments : ${segments.length}`];

    return {
      content: `${header}\n${intro.join('\n')}\n\nSegments synchronisés :\n\n${lines}\n`,
      mimeType: 'text/markdown;charset=utf-8',
      extension: 'md',
    };
  }

  if (resourceType === 'edn') {
    const ednItem = await contentLibraryService.getEdnItem(resourceIdentifier);
    const rangA = ednItem?.rang_a_competence_count ?? metadata?.rang_a ?? 0;
    const rangB = ednItem?.rang_b_competence_count ?? metadata?.rang_b ?? 0;
    const domaines = [ednItem?.specialite, ednItem?.domaine_medical].filter(Boolean).join(' · ');
    const valeurs = ednItem?.valeurs_professionnelles ? JSON.stringify(ednItem.valeurs_professionnelles, null, 2) : '—';
    return {
      content: `${header}\n- Spécialité : ${domaines || '—'}\n- Compétences Rang A : ${rangA}\n- Compétences Rang B : ${rangB}\n- Valeurs professionnelles :\n\n${valeurs}\n`,
      mimeType: 'text/markdown;charset=utf-8',
      extension: 'md',
    };
  }

  if (resourceType === 'qcm') {
    const questionCount = metadata?.question_count ?? 0;
    const completed = metadata?.completed_at ? `Terminé le ${new Date(metadata.completed_at).toLocaleString()}` : 'Session en cours';
    const errors = metadata?.errors ? JSON.stringify(metadata.errors, null, 2) : '—';
    return {
      content: `${header}\n- Questions : ${questionCount}\n- Statut : ${completed}\n- Diagnostics :\n${errors}\n`,
      mimeType: 'text/markdown;charset=utf-8',
      extension: 'md',
    };
  }

  if (resourceType === 'note') {
    const note = await contentLibraryService.getStudyNote(resourceIdentifier);
    const content = note?.content ?? metadata?.preview ?? '—';
    const lastReviewed = note?.last_reviewed_at
      ? new Date(note.last_reviewed_at).toLocaleString()
      : metadata?.last_reviewed_at
      ? new Date(metadata.last_reviewed_at).toLocaleString()
      : 'Jamais';
    return {
      content: `${header}\nDernière révision : ${lastReviewed}\n\n${content}\n`,
      mimeType: 'text/markdown;charset=utf-8',
      extension: 'md',
    };
  }

  if (resourceType === 'comic') {
    const comicEntry = await contentLibraryService.getComicEntry(resourceIdentifier);
    const rawPanels = comicEntry?.comic_panels as any;
    const panels: any[] = Array.isArray(rawPanels)
      ? rawPanels
      : Array.isArray(rawPanels?.panels)
      ? rawPanels.panels
      : [];
    const lines = panels.length
      ? panels
          .map((panel, index) => `- Case ${index + 1} : ${panel?.dialogue ?? '—'}`)
          .join('\n')
      : 'Aucune case disponible.';
    const itemCode = metadata?.item_code ?? comicEntry?.item_id ?? '—';
    const generatedAt = comicEntry?.generated_at ? new Date(comicEntry.generated_at).toLocaleString() : '—';

    return {
      content: `${header}\n- Item : ${itemCode}\n- Nombre de cases : ${panels.length}\n- Généré le : ${generatedAt}\n\nScénario :\n\n${lines}\n`,
      mimeType: 'text/markdown;charset=utf-8',
      extension: 'md',
    };
  }

  return {
    content: header,
    mimeType: 'text/markdown;charset=utf-8',
    extension: 'md',
  };
};

const renderMetadata = (resourceType: string, metadata: any) => {
  switch (resourceType) {
    case 'track': {
      const mode = metadata?.mode ?? '—';
      const style = metadata?.style ?? '—';
      const duration = formatDuration(Number(metadata?.duration_seconds ?? metadata?.duration));
      const segments = metadata?.segment_count ?? 0;
      const status = metadata?.generation_status ?? metadata?.status ?? '—';
      return (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Mode : {mode}</span>
          <span>Style : {style}</span>
          <span>Durée : {duration}</span>
          <span>Segments : {segments}</span>
          <span>Statut : {status}</span>
        </div>
      );
    }
    case 'lyrics': {
      const mode = metadata?.mode ?? '—';
      const style = metadata?.style ?? '—';
      const segments = metadata?.segment_count ?? 0;
      const isAligned = metadata?.has_segments ?? segments > 0;
      return (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Mode : {mode}</span>
          <span>Style : {style}</span>
          <span>Segments : {segments}</span>
          <span>{isAligned ? 'Synchronisé' : 'À synchroniser'}</span>
        </div>
      );
    }
    case 'edn':
      return (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Rang A : {metadata?.rang_a ?? 0}</span>
          <span>Rang B : {metadata?.rang_b ?? 0}</span>
          <span>Valeurs pro : {metadata?.valeurs_professionnelles ? 'Disponibles' : '—'}</span>
        </div>
      );
    case 'qcm':
      return (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Questions : {metadata?.question_count ?? 0}</span>
          <span>{metadata?.completed_at ? `Terminé le ${new Date(metadata.completed_at).toLocaleDateString()}` : 'Session en cours'}</span>
        </div>
      );
    case 'comic':
      return (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Item : {metadata?.item_code ?? '—'}</span>
          <span>Cases : {metadata?.panel_count ?? 0}</span>
          <span>{metadata?.generated_at ? `Généré le ${new Date(metadata.generated_at).toLocaleDateString()}` : '—'}</span>
        </div>
      );
    case 'note':
      return (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{metadata?.item_code ? `Référence : ${metadata.item_code}` : 'Sans rattachement'}</span>
          <span>
            Dernière révision :{' '}
            {metadata?.last_reviewed_at ? new Date(metadata.last_reviewed_at).toLocaleDateString() : 'Jamais'}
          </span>
        </div>
      );
    default:
      return null;
  }
};

const renderPreview = (resourceType: string, metadata: any) => {
  if (resourceType === 'track' && metadata?.image_url) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-white/10">
        <OptimizedImage
          src={metadata.image_url}
          alt="Couverture de la piste"
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  if (resourceType === 'lyrics') {
    const previewSegments = Array.isArray(metadata?.preview_segments) ? metadata.preview_segments : [];
    if (previewSegments.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-white/10 bg-slate-950/40 p-3 text-sm text-slate-400">
          Aucune prévisualisation disponible. Lance une synchronisation pour générer les segments.
        </div>
      );
    }

    return (
      <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/60 p-3 text-sm leading-6 text-slate-100">
        {previewSegments.map((segment: any) => (
          <div key={segment?.idx ?? Math.random()} className="flex items-start gap-3">
            <span className="font-mono text-xs text-emerald-300">{formatTimestamp(segment?.start_ms)}</span>
            <span className="flex-1 text-slate-200">{segment?.text ?? ''}</span>
          </div>
        ))}
      </div>
    );
  }

  if (resourceType === 'comic') {
    if (metadata?.preview_image) {
      return (
        <div className="relative overflow-hidden rounded-lg border border-white/10">
          <OptimizedImage
            src={metadata.preview_image}
            alt="Aperçu de la bande dessinée"
            className="h-40 w-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }

    if (metadata?.preview_dialogue) {
      return (
        <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200">
          « {metadata.preview_dialogue} »
        </div>
      );
    }
  }

  if (resourceType === 'note' && metadata?.preview) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-200">
        {metadata.preview}
      </div>
    );
  }

  return null;
};

const typeFilters: Array<{ type: ContentResourceType; label: string; icon: React.ReactNode }> = [
  { type: 'track', label: 'Pistes', icon: <Music className="h-4 w-4" /> },
  { type: 'lyrics', label: 'Lyrics', icon: <Mic className="h-4 w-4" /> },
  { type: 'edn', label: 'Fiches', icon: <BookOpen className="h-4 w-4" /> },
  { type: 'qcm', label: 'QCM', icon: <GraduationCap className="h-4 w-4" /> },
  { type: 'comic', label: 'BD', icon: <ImageIcon className="h-4 w-4" /> },
  { type: 'note', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
];

const QUICK_FILTERS = [
  { id: 'all', label: 'Tout', description: 'Tous les contenus de la bibliothèque', icon: <Layers className="h-3.5 w-3.5" /> },
  { id: 'favorites', label: 'Favoris', description: 'Vos éléments enregistrés en favoris', icon: <Heart className="h-3.5 w-3.5" /> },
  { id: 'my-creations', label: 'Mes créations', description: 'Pistes générées par vous', icon: <Music className="h-3.5 w-3.5" /> },
  { id: 'recent', label: 'Récents', description: 'Derniers ajouts et modifications', icon: <Clock className="h-3.5 w-3.5" /> },
] as const;

type QuickFilterId = (typeof QUICK_FILTERS)[number]['id'];

const applyPresetForFilter = (
  current: ContentLibraryFilters,
  preset: QuickFilterId,
): ContentLibraryFilters => {
  switch (preset) {
    case 'favorites': {
      if (current.favoritesOnly) return current;
      return {
        ...current,
        favoritesOnly: true,
        page: 1,
      };
    }
    case 'my-creations': {
      const nextTypes: ContentResourceType[] = ['track', 'lyrics'];
      const sameTypes =
        current.types.length === nextTypes.length &&
        current.types.every((type, index) => type === nextTypes[index]);

      if (!current.favoritesOnly && sameTypes && current.sort === 'recent') {
        return current;
      }

      return {
        ...current,
        favoritesOnly: false,
        sort: 'recent',
        types: nextTypes,
        page: 1,
      };
    }
    case 'recent': {
      if (!current.favoritesOnly && current.sort === 'recent') {
        return current;
      }

      return {
        ...current,
        favoritesOnly: false,
        sort: 'recent',
        page: 1,
      };
    }
    case 'all':
    default: {
      if (!current.favoritesOnly) {
        return current;
      }

      return {
        ...current,
        favoritesOnly: false,
        page: 1,
      };
    }
  }
};

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useUser();
  const {
    items,
    totalCount,
    collections,
    filters,
    setFilters,
    setQuery,
    toggleType,
    setCollection,
    setSort,
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
    isLoading,
    isFetching,
    isMutating,
    error: libraryError,
  } = useContentLibrary();

  const [audioState, setAudioState] = useState<{ id: string | null; player: HTMLAudioElement | null }>({ id: null, player: null });
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [notePreview, setNotePreview] = useState<StudyNoteRow | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [isItemPopoverOpen, setIsItemPopoverOpen] = useState(false);

  const { data: itemOptionsData, isLoading: isItemsLoading } = useQuery({
    queryKey: ['library-item-options'],
    queryFn: () => contentLibraryService.listItemOptions(),
    staleTime: 1000 * 60 * 30,
  });

  const itemOptions = itemOptionsData ?? [];
  const selectedItemOption = useMemo(
    () => itemOptions.find((option) => option.item_code === filters.itemCode) ?? null,
    [itemOptions, filters.itemCode],
  );

  const styleOptions = useMemo(
    () => musicStyles.map((style) => ({ value: style.value, label: style.label })),
    [],
  );

  const totalPages = useMemo(() => {
    if (!filters.pageSize) return 1;
    return Math.max(1, Math.ceil((totalCount ?? 0) / filters.pageSize));
  }, [filters.pageSize, totalCount]);

  const paginationPages = useMemo(() => {
    const windowSize = 5;
    const pages: number[] = [];

    if (!Number.isFinite(totalPages) || totalPages <= 0) {
      return [1];
    }

    if (totalPages <= windowSize) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }
      return pages;
    }

    const halfWindow = Math.floor(windowSize / 2);
    let start = filters.page - halfWindow;
    let end = filters.page + halfWindow;

    if (start < 1) {
      end += 1 - start;
      start = 1;
    }

    if (end > totalPages) {
      const diff = end - totalPages;
      start = Math.max(1, start - diff);
      end = totalPages;
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [filters.page, totalPages]);

  const shouldShowFirstPage = paginationPages.length > 0 && paginationPages[0] !== 1;
  const shouldShowLastPage =
    paginationPages.length > 0 && paginationPages[paginationPages.length - 1] !== totalPages;
  const showStartEllipsis = shouldShowFirstPage && paginationPages[0] > 2;
  const showEndEllipsis = shouldShowLastPage &&
    paginationPages[paginationPages.length - 1] < totalPages - 1;

  const libraryErrorMessage = useMemo(() => {
    if (!libraryError) return null;
    return libraryError instanceof Error ? libraryError.message : "Impossible de charger la bibliothèque";
  }, [libraryError]);
  const activeQuickFilter = useMemo<QuickFilterId>(() => {
    const filterParam = searchParams.get('filter');
    return (QUICK_FILTERS.find((filter) => filter.id === filterParam)?.id ?? 'all') as QuickFilterId;
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (audioState.player) {
        audioState.player.pause();
      }
    };
  }, [audioState.player]);

  useEffect(() => {
    setFilters((current) => applyPresetForFilter(current, activeQuickFilter));
  }, [activeQuickFilter, setFilters]);

  const displayedItems = useMemo(() => {
    if (activeQuickFilter === 'my-creations' && user?.id) {
      return items.filter((item) => item.owner_id === user.id);
    }
    return items;
  }, [activeQuickFilter, items, user?.id]);

  const handlePlay = useCallback(
    async (resourceIdentifier: string, title: string) => {
      try {
        if (audioState.id === resourceIdentifier) {
          audioState.player?.pause();
          setAudioState({ id: null, player: null });
          return;
        }

        audioState.player?.pause();

        const streamUrl = musicService.getSecureStreamingUrl(resourceIdentifier);
        const audio = new Audio(streamUrl);
        audio.onended = () => setAudioState({ id: null, player: null });
        await audio.play();
        setAudioState({ id: resourceIdentifier, player: audio });
        toast.success(`Lecture de ${title}`);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de lire la piste");
      }
    },
    [audioState.id, audioState.player],
  );

  const handleExport = useCallback(
    async (
      resourceType: string,
      resourceIdentifier: string,
      title: string,
      metadata: any,
      format: ExportFormat = 'md',
    ) => {
      try {
        const { content, mimeType, extension } = await buildExportPayload(
          resourceType,
          resourceIdentifier,
          title,
          metadata,
          format,
        );
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        const safeTitle = title.replace(/[^a-z0-9_-]/gi, '_');
        anchor.download = `${safeTitle}_${resourceType}.${extension}`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        toast.success('Export généré');
      } catch (error) {
        console.error(error);
        toast.error("Impossible d'exporter l'élément");
      }
    },
    [],
  );

  const handleOpenNote = useCallback(async (resourceIdentifier: string) => {
    try {
      setIsNoteLoading(true);
      const note = await contentLibraryService.getStudyNote(resourceIdentifier);
      if (note) {
        setNotePreview(note);
      } else {
        toast.info('Note introuvable');
      }
    } catch (error) {
      console.error(error);
      toast.error('Impossible de charger la note');
    } finally {
      setIsNoteLoading(false);
    }
  }, []);

  const handleRelaunch = useCallback(
    (item: ContentLibraryEntry) => {
      if (item.resource_type !== 'track' && item.resource_type !== 'lyrics') {
        return;
      }

      const metadata = item.metadata as any;
      const itemCode = metadata?.item_code;
      const mode = metadata?.mode ?? undefined;
      const style = metadata?.style ?? undefined;

      if (!itemCode) {
        navigate('/med-mng/create');
        return;
      }

      const params = new URLSearchParams();
      params.set('item', itemCode);
      if (mode) params.set('mode', mode);
      if (style) params.set('style', style);
      navigate(`/med-mng/create?${params.toString()}`);
    },
    [navigate],
  );

  const handleCreateCollection = useCallback(async () => {
    const created = await createCollection(newCollectionName, newCollectionDescription);
    if (created) {
      setIsCreateCollectionOpen(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    }
  }, [createCollection, newCollectionDescription, newCollectionName]);

  const collectionOptions = useMemo(() => [{ id: 'all', name: 'Toutes les collections' }, ...collections], [collections]);

  const handleSelectItemOption = useCallback(
    (itemCode: string | null) => {
      setItemCode(itemCode);
      setPage(1);
      setIsItemPopoverOpen(false);
    },
    [setItemCode, setPage],
  );

  const handleModeChange = useCallback(
    (value: string) => {
      setMode(value === 'all' ? null : (value as 'A' | 'B' | 'AB'));
    },
    [setMode],
  );

  const handleStyleChange = useCallback(
    (value: string) => {
      setStyle(value === 'all' ? null : value);
    },
    [setStyle],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const boundedPage = Math.min(Math.max(1, page), totalPages);
      setPage(boundedPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setPage, totalPages],
  );

  const handleQuickFilter = useCallback(
    (nextFilter: QuickFilterId) => {
      setFilters((current) => applyPresetForFilter(current, nextFilter));
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (nextFilter === 'all') {
          params.delete('filter');
        } else {
          params.set('filter', nextFilter);
        }
        return params;
      }, { replace: true });
    },
    [setFilters, setSearchParams],
  );

  const handleFavoritesSwitch = useCallback(
    (checked: boolean) => {
      const targetFilter: QuickFilterId = checked ? 'favorites' : 'all';
      handleQuickFilter(targetFilter);
    },
    [handleQuickFilter],
  );

  const handleResetFilters = useCallback(() => {
    setFilters((current) => ({
      ...current,
      query: '',
      types: [],
      favoritesOnly: false,
      collectionId: null,
      sort: 'recent',
      itemCode: null,
      mode: null,
      style: null,
      page: 1,
      pageSize: current.pageSize,
    }));
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete('filter');
      return params;
    }, { replace: true });
  }, [setFilters, setSearchParams]);

  return (
    <MedMngLayout>
      <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <header className="mb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">Bibliothèque unifiée</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Retrouve toutes tes pistes générées, fiches EDN/ECOS, sessions QCM et notes personnelles dans un seul espace avec
                  recherche unifiée, favoris et collections.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span>{totalCount} éléments</span>
                  {isFetching && !isLoading && <span className="text-emerald-300">Actualisation…</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsCreateCollectionOpen(true)}
                  disabled={isMutating}
                >
                  <FolderPlus className="h-4 w-4" />
                  Nouvelle collection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-white"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <Layers className="h-4 w-4" />
                  Parcours complets
                </Button>
              </div>
            </div>
          </header>

          <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-6 flex flex-wrap gap-3">
              {QUICK_FILTERS.map((filter) => {
                const isActive = activeQuickFilter === filter.id;
                return (
                  <Button
                    key={filter.id}
                    type="button"
                    size="sm"
                    variant={isActive ? 'default' : 'outline'}
                    className={cn(
                      'gap-2 rounded-full border-white/10',
                      isActive ? 'bg-emerald-500 text-white' : 'bg-slate-900/60 text-slate-200',
                    )}
                    onClick={() => handleQuickFilter(filter.id)}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </Button>
                );
              })}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="ml-auto gap-2 text-slate-300 hover:text-white"
                onClick={handleResetFilters}
              >
                <Filter className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={filters.query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Par titre, tag ou référence médicale"
                    className="bg-slate-900/80 pl-9 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Trier par</label>
                <Select value={filters.sort} onValueChange={(value) => setSort(value as typeof filters.sort)}>
                  <SelectTrigger className="bg-slate-900/80 text-slate-100">
                    <SelectValue placeholder="Trier" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-slate-100">
                    <SelectItem value="recent">Récents</SelectItem>
                    <SelectItem value="alphabetical">Alphabétique</SelectItem>
                    <SelectItem value="type">Par type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Collections</label>
                <Select
                  value={filters.collectionId ?? 'all'}
                  onValueChange={(value) => setCollection(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="bg-slate-900/80 text-slate-100">
                    <SelectValue placeholder="Toutes les collections" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-slate-100">
                    {collectionOptions.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-200">Item EDN / ECN</label>
                <Popover open={isItemPopoverOpen} onOpenChange={setIsItemPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between bg-slate-900/80 text-slate-100"
                      disabled={isItemsLoading}
                    >
                      <span className="truncate">
                        {selectedItemOption
                          ? `${selectedItemOption.item_code} · ${selectedItemOption.title}`
                          : 'Tous les items'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <Command>
                      <CommandInput placeholder="Rechercher un item..." />
                      <CommandList>
                        <CommandEmpty>Aucun item trouvé.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem onSelect={() => handleSelectItemOption(null)}>Tous les items</CommandItem>
                          {itemOptions.map((option) => (
                            <CommandItem
                              key={option.id}
                              value={`${option.item_code} ${option.title}`}
                              onSelect={() => handleSelectItemOption(option.item_code)}
                            >
                              <span className="font-medium">{option.item_code}</span>
                              <span className="ml-2 text-xs text-slate-400">{option.title}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Mode</label>
                <Select value={filters.mode ?? 'all'} onValueChange={handleModeChange}>
                  <SelectTrigger className="bg-slate-900/80 text-slate-100">
                    <SelectValue placeholder="Tous les modes" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-slate-100">
                    <SelectItem value="all">Tous les modes</SelectItem>
                    <SelectItem value="A">Rang A</SelectItem>
                    <SelectItem value="B">Rang B</SelectItem>
                    <SelectItem value="AB">Mix A+B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Style musical</label>
                <Select value={filters.style ?? 'all'} onValueChange={handleStyleChange}>
                  <SelectTrigger className="bg-slate-900/80 text-slate-100">
                    <SelectValue placeholder="Tous les styles" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-slate-100">
                    <SelectItem value="all">Tous les styles</SelectItem>
                    {styleOptions.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Filter className="h-4 w-4" />
                Types de contenu
              </div>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => {
                  const active = filters.types.includes(filter.type);
                  return (
                    <Button
                      key={filter.type}
                      size="sm"
                      variant={active ? 'default' : 'outline'}
                      className={cn('gap-2 rounded-full border-white/10', active ? 'bg-emerald-500 text-white' : 'bg-slate-900/60')}
                      onClick={() => toggleType(filter.type)}
                      type="button"
                    >
                      {filter.icon}
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Switch checked={filters.favoritesOnly} onCheckedChange={handleFavoritesSwitch} id="favorites-only" />
                <label htmlFor="favorites-only" className="text-sm text-slate-200">
                  Favoris uniquement
                </label>
              </div>
            </div>
          </section>

          {libraryErrorMessage && (
            <Alert variant="destructive" className="mb-6 border-red-500/30 bg-red-950/40 text-red-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Chargement impossible</AlertTitle>
              <AlertDescription>{libraryErrorMessage}</AlertDescription>
            </Alert>
          )}

          {(isLoading || isFetching) && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-white/5 bg-white/5">
                  <CardHeader>
                    <Skeleton className="h-5 w-1/2 bg-white/10" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-4 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-2/3 bg-white/10" />
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Skeleton className="h-9 w-24 bg-white/10" />
                    <Skeleton className="h-9 w-24 bg-white/10" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && displayedItems.length === 0 && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Aucun contenu trouvé</AlertTitle>
              <AlertDescription>
                {activeQuickFilter === 'favorites'
                  ? 'Aucun favori ne correspond à ces filtres. Essaie de retirer certains filtres ou d’ajouter des éléments en favoris.'
                  : activeQuickFilter === 'my-creations'
                  ? 'Tu n’as pas encore de créations personnelles enregistrées. Lance une génération musicale pour alimenter cet espace.'
                  : 'Ajuste ta recherche, explore un autre type de ressource ou ajoute des éléments depuis les modules génération et EDN.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {displayedItems.map((item) => {
              const config = RESOURCE_CONFIG[item.resource_type] ?? RESOURCE_CONFIG.track;
              const collectionsForItem = parseCollections(item.collections as CollectionJson);
              const isFavorite = Boolean(item.is_favorite);
              const inLibrary = Boolean(item.in_library);
              const metadata = item.metadata as any;

              return (
                <Card key={`${item.resource_type}-${item.resource_identifier}`} className="border-white/5 bg-white/5">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300">
                          {config.icon}
                          {config.label}
                        </div>
                        <CardTitle className="mt-2 text-xl text-white">{item.title}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.owner_id && user?.id === item.owner_id && (
                            <Badge className="bg-emerald-500/20 text-emerald-100">Création perso</Badge>
                          )}
                          {item.is_public && (
                            <Badge variant="outline" className="border-white/10 bg-transparent text-xs text-slate-200">
                              Partagé
                            </Badge>
                          )}
                          {activeQuickFilter !== 'all' && (
                            <Badge variant="outline" className="border-white/10 bg-white/10 text-xs text-slate-200">
                              {QUICK_FILTERS.find((filter) => filter.id === activeQuickFilter)?.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn('h-9 w-9 rounded-full border border-white/10', isFavorite ? 'text-emerald-400' : 'text-slate-300')}
                          onClick={() => toggleFavorite(item.resource_type as ContentResourceType, item.resource_identifier, !isFavorite)}
                          disabled={isMutating}
                        >
                          {isFavorite ? <Heart className="h-4 w-4" /> : <HeartOff className="h-4 w-4" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full border border-white/10">
                              <Folder className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56 bg-slate-900 text-slate-100">
                            <DropdownMenuItem className="text-xs uppercase text-slate-400" disabled>
                              Gérer les collections
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {collections.map((collection) => {
                              const assigned = collectionsForItem.some((c) => c.id === collection.id);
                              return (
                                <DropdownMenuItem
                                  key={collection.id}
                                  onClick={() =>
                                    assigned
                                      ? removeFromCollection(item.resource_type as ContentResourceType, item.resource_identifier, collection.id)
                                      : addToCollection(item.resource_type as ContentResourceType, item.resource_identifier, collection.id)
                                  }
                                >
                                  <div className="flex w-full items-center justify-between">
                                    <span>{collection.name}</span>
                                    {assigned && <Badge className="bg-emerald-500/20 text-emerald-200">Assigné</Badge>}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => setIsCreateCollectionOpen(true)}>
                              <ListPlus className="mr-2 h-4 w-4" />Nouvelle collection
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{config.description}</p>
                    {collectionsForItem.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {collectionsForItem.map((collection) => (
                          <Badge key={collection.id} className="bg-emerald-500/20 text-emerald-100">
                            {collection.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 text-slate-200">
                    {renderPreview(item.resource_type, metadata)}
                    <div className="flex flex-wrap gap-2">
                      {item.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/10 bg-white/5 text-xs text-slate-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {renderMetadata(item.resource_type, metadata)}
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    {item.resource_type === 'track' && (
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => handlePlay(item.resource_identifier, item.title ?? 'Piste')}
                        variant="secondary"
                      >
                        {audioState.id === item.resource_identifier ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {audioState.id === item.resource_identifier ? 'Pause' : 'Lire'}
                      </Button>
                    )}
                    {(item.resource_type === 'track' || item.resource_type === 'lyrics') && metadata?.item_code && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/edn?focus=${metadata.item_code}`)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Voir l'item
                      </Button>
                    )}
                    {(item.resource_type === 'track' || item.resource_type === 'lyrics') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => handleRelaunch(item)}
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Relancer
                      </Button>
                    )}
                    {item.resource_type === 'edn' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                          onClick={() => navigate(`/edn?focus=${item.resource_identifier}`)}
                        >
                          <BookOpen className="h-4 w-4" />
                          Ouvrir la fiche
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => navigate(`/edn-production/progression?item=${item.resource_identifier}&session=8min`)}
                        >
                          <Clock className="h-4 w-4" />
                          Séance 8 min
                        </Button>
                      </>
                    )}
                    {item.resource_type === 'qcm' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => navigate(`/qcm?s=${item.resource_identifier}`)}
                      >
                        <GraduationCap className="h-4 w-4" />
                        Reprendre le QCM
                      </Button>
                    )}
                    {item.resource_type === 'note' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => handleOpenNote(item.resource_identifier)}
                        disabled={isNoteLoading && notePreview?.id === item.resource_identifier}
                      >
                        <FileText className="h-4 w-4" />
                        Consulter la note
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Exporter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-44 bg-slate-900 text-slate-100">
                        <DropdownMenuItem
                          onClick={() => handleExport(item.resource_type, item.resource_identifier, item.title ?? 'Export', metadata, 'md')}
                        >
                          Markdown
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExport(item.resource_type, item.resource_identifier, item.title ?? 'Export', metadata, 'json')}
                        >
                          JSON
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {inLibrary ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-slate-200"
                        onClick={() => removeItem(item.resource_type as ContentResourceType, item.resource_identifier)}
                        disabled={isMutating}
                      >
                        Retirer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-slate-200"
                        onClick={() => saveItem(item.resource_type as ContentResourceType, item.resource_identifier)}
                        disabled={isMutating}
                      >
                        Ajouter à la bibliothèque
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (filters.page > 1) {
                          handlePageChange(filters.page - 1);
                        }
                      }}
                      className={filters.page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {shouldShowFirstPage && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          handlePageChange(1);
                        }}
                        isActive={filters.page === 1}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {showStartEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-slate-400" />
                    </PaginationItem>
                  )}
                  {paginationPages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === filters.page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {showEndEllipsis && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-slate-400" />
                    </PaginationItem>
                  )}
                  {shouldShowLastPage && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          handlePageChange(totalPages);
                        }}
                        isActive={filters.page === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (filters.page < totalPages) {
                          handlePageChange(filters.page + 1);
                        }
                      }}
                      className={filters.page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
        <DialogContent className="bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>Nouvelle collection</DialogTitle>
            <DialogDescription className="text-slate-400">
              Organise ta bibliothèque en regroupant des ressources par thématique, projet ou préparation d'examen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-200">Nom de la collection</label>
              <Input
                value={newCollectionName}
                onChange={(event) => setNewCollectionName(event.target.value)}
                placeholder="Ex : Chirurgie – Rythmes & Fiches"
                className="bg-slate-800 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-200">Description (optionnel)</label>
              <Input
                value={newCollectionDescription}
                onChange={(event) => setNewCollectionDescription(event.target.value)}
                placeholder="Notes sur l'usage ou le public cible"
                className="bg-slate-800 text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateCollectionOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
              <FolderPlus className="mr-2 h-4 w-4" />Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(notePreview)} onOpenChange={(open) => !open && setNotePreview(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>{notePreview?.title ?? 'Note'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Dernière révision :{' '}
              {notePreview?.last_reviewed_at
                ? new Date(notePreview.last_reviewed_at).toLocaleString()
                : 'Jamais'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto whitespace-pre-line rounded-lg bg-slate-950/70 p-4 text-sm leading-6 text-slate-200">
            {notePreview?.content ?? 'Aucun contenu disponible'}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setNotePreview(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MedMngLayout>
  );
};

export default LibraryPage;
