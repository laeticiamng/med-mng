import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Layers,
  ListPlus,
  Music,
  NoteText,
  Pause,
  Play,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useContentLibrary } from '@/hooks/library/useContentLibrary';
import { contentLibraryService } from '@/services/library/ContentLibraryService';
import { musicService } from '@/services';
import type { StudyNoteRow } from '@/services/library/ContentLibraryService';

const RESOURCE_CONFIG: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  track: { label: 'Piste générée', description: 'Audio IA + paroles synchronisées', icon: <Music className="h-4 w-4" /> },
  edn: { label: 'Fiche EDN', description: 'Données unifiées EDN/ECOS', icon: <BookOpen className="h-4 w-4" /> },
  qcm: { label: 'Session QCM', description: 'Questionnaires générés & scores', icon: <GraduationCap className="h-4 w-4" /> },
  note: { label: 'Note personnelle', description: 'Annotations & rappels de révision', icon: <NoteText className="h-4 w-4" /> },
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

const buildMarkdownExport = async (
  resourceType: string,
  resourceIdentifier: string,
  title: string,
  metadata: any,
): Promise<string> => {
  const header = `# ${title}\nType : ${resourceType.toUpperCase()}\nRéférence : ${resourceIdentifier}\n`;

  if (resourceType === 'track') {
    const duration = formatDuration(Number(metadata?.duration_seconds));
    const bpm = metadata?.bpm ? `${metadata.bpm} BPM` : 'N/A';
    const lyricsInfo = metadata?.has_lyrics ? `${metadata?.lyric_segments ?? 0} segments synchronisés` : 'Paroles non disponibles';
    return `${header}\n- Durée : ${duration}\n- Tempo : ${bpm}\n- Audio status : ${metadata?.audio_status ?? 'Inconnu'}\n- Lyrics : ${lyricsInfo}\n`;
  }

  if (resourceType === 'edn') {
    const ednItem = await contentLibraryService.getEdnItem(resourceIdentifier);
    const rangA = ednItem?.rang_a_competence_count ?? metadata?.rang_a ?? 0;
    const rangB = ednItem?.rang_b_competence_count ?? metadata?.rang_b ?? 0;
    const domaines = [ednItem?.specialite, ednItem?.domaine_medical].filter(Boolean).join(' · ');
    const valeurs = ednItem?.valeurs_professionnelles ? JSON.stringify(ednItem.valeurs_professionnelles, null, 2) : '—';
    return `${header}\n- Spécialité : ${domaines || '—'}\n- Compétences Rang A : ${rangA}\n- Compétences Rang B : ${rangB}\n- Valeurs professionnelles :\n\n${valeurs}\n`;
  }

  if (resourceType === 'qcm') {
    const questionCount = metadata?.question_count ?? 0;
    const completed = metadata?.completed_at ? `Terminé le ${new Date(metadata.completed_at).toLocaleString()}` : 'Session en cours';
    const errors = metadata?.errors ? JSON.stringify(metadata.errors, null, 2) : '—';
    return `${header}\n- Questions : ${questionCount}\n- Statut : ${completed}\n- Diagnostics :\n${errors}\n`;
  }

  if (resourceType === 'note') {
    const note = await contentLibraryService.getStudyNote(resourceIdentifier);
    const content = note?.content ?? metadata?.preview ?? '—';
    const lastReviewed = note?.last_reviewed_at
      ? new Date(note.last_reviewed_at).toLocaleString()
      : metadata?.last_reviewed_at
      ? new Date(metadata.last_reviewed_at).toLocaleString()
      : 'Jamais';
    return `${header}\nDernière révision : ${lastReviewed}\n\n${content}\n`;
  }

  return header;
};

const renderMetadata = (resourceType: string, metadata: any) => {
  switch (resourceType) {
    case 'track':
      return (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Durée : {formatDuration(Number(metadata?.duration_seconds))}</span>
          <span>Tempo : {metadata?.bpm ? `${metadata.bpm} BPM` : '—'}</span>
          <span>Lyrics : {metadata?.has_lyrics ? `${metadata?.lyric_segments ?? 0} segments` : 'Non synchronisées'}</span>
        </div>
      );
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

const typeFilters = [
  { type: 'track', label: 'Pistes', icon: <Music className="h-4 w-4" /> },
  { type: 'edn', label: 'Fiches', icon: <BookOpen className="h-4 w-4" /> },
  { type: 'qcm', label: 'QCM', icon: <GraduationCap className="h-4 w-4" /> },
  { type: 'note', label: 'Notes', icon: <NoteText className="h-4 w-4" /> },
] as const;

const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    collections,
    filters,
    setQuery,
    toggleType,
    toggleFavoritesOnly,
    setCollection,
    setSort,
    saveItem,
    removeItem,
    toggleFavorite,
    addToCollection,
    removeFromCollection,
    createCollection,
    isLoading,
    isFetching,
    isMutating,
  } = useContentLibrary();

  const [audioState, setAudioState] = useState<{ id: string | null; player: HTMLAudioElement | null }>({ id: null, player: null });
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [notePreview, setNotePreview] = useState<StudyNoteRow | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (audioState.player) {
        audioState.player.pause();
      }
    };
  }, [audioState.player]);

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

  const handleExport = useCallback(async (resourceType: string, resourceIdentifier: string, title: string, metadata: any) => {
    try {
      const markdown = await buildMarkdownExport(resourceType, resourceIdentifier, title, metadata);
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${title.replace(/[^a-z0-9]/gi, '_')}_${resourceType}.md`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Export généré');
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'exporter l'élément");
    }
  }, []);

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

  const handleCreateCollection = useCallback(async () => {
    const created = await createCollection(newCollectionName, newCollectionDescription);
    if (created) {
      setIsCreateCollectionOpen(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    }
  }, [createCollection, newCollectionDescription, newCollectionName]);

  const collectionOptions = useMemo(() => [{ id: 'all', name: 'Toutes les collections' }, ...collections], [collections]);

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

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Filter className="h-4 w-4" />
                Types de contenu
              </div>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => {
                  const active = filters.types.includes(filter.type as any);
                  return (
                    <Button
                      key={filter.type}
                      size="sm"
                      variant={active ? 'default' : 'outline'}
                      className={cn('gap-2 rounded-full border-white/10', active ? 'bg-emerald-500 text-white' : 'bg-slate-900/60')}
                      onClick={() => toggleType(filter.type as any)}
                      type="button"
                    >
                      {filter.icon}
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Switch checked={filters.favoritesOnly} onCheckedChange={toggleFavoritesOnly} id="favorites-only" />
                <label htmlFor="favorites-only" className="text-sm text-slate-200">
                  Favoris uniquement
                </label>
              </div>
            </div>
          </section>

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

          {!isLoading && items.length === 0 && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Aucun contenu trouvé</AlertTitle>
              <AlertDescription>
                Ajuste ta recherche, explore un autre type de ressource ou ajoute des éléments depuis les modules génération et
                EDN.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const config = RESOURCE_CONFIG[item.resource_type] ?? RESOURCE_CONFIG.track;
              const collectionsForItem = parseCollections(item.collections as CollectionJson);
              const isFavorite = Boolean(item.is_favorite);
              const inLibrary = Boolean(item.in_library);

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
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn('h-9 w-9 rounded-full border border-white/10', isFavorite ? 'text-emerald-400' : 'text-slate-300')}
                          onClick={() => toggleFavorite(item.resource_type as any, item.resource_identifier, !isFavorite)}
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
                                      ? removeFromCollection(item.resource_type as any, item.resource_identifier, collection.id)
                                      : addToCollection(item.resource_type as any, item.resource_identifier, collection.id)
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
                    <div className="flex flex-wrap gap-2">
                      {item.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/10 bg-white/5 text-xs text-slate-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {renderMetadata(item.resource_type, item.metadata)}
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
                        <NoteText className="h-4 w-4" />
                        Consulter la note
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => handleExport(item.resource_type, item.resource_identifier, item.title ?? 'Export', item.metadata)}
                    >
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                    {inLibrary ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-slate-200"
                        onClick={() => removeItem(item.resource_type as any, item.resource_identifier)}
                        disabled={isMutating}
                      >
                        Retirer
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-slate-200"
                        onClick={() => saveItem(item.resource_type as any, item.resource_identifier)}
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
