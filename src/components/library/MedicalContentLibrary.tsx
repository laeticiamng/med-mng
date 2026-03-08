import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowingCard } from '@/components/ui/glowing-card';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { usePlayer } from '@/hooks/usePlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Brain, Filter, Globe, GraduationCap, Heart, Music, Pause, Play,
  Search, Star, Stethoscope, Pill, Activity, Eye, Bone, Baby,
  Siren, Shield, Microscope, X, Clock
} from 'lucide-react';
import { useState, useMemo } from 'react';

// Medical specialties with icons and colors
const SPECIALTIES = [
  { id: 'all', label: 'Toutes', icon: Music, color: 'bg-primary/10 text-primary' },
  { id: 'cardiology', label: 'Cardiologie', icon: Activity, color: 'bg-red-500/10 text-red-500' },
  { id: 'neurology', label: 'Neurologie', icon: Brain, color: 'bg-purple-500/10 text-purple-500' },
  { id: 'pharmacology', label: 'Pharmacologie', icon: Pill, color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 'surgery', label: 'Chirurgie', icon: Stethoscope, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'ophthalmology', label: 'Ophtalmologie', icon: Eye, color: 'bg-amber-500/10 text-amber-500' },
  { id: 'orthopedics', label: 'Orthopédie', icon: Bone, color: 'bg-orange-500/10 text-orange-500' },
  { id: 'pediatrics', label: 'Pédiatrie', icon: Baby, color: 'bg-pink-500/10 text-pink-500' },
  { id: 'emergency', label: 'Urgences', icon: Siren, color: 'bg-destructive/10 text-destructive' },
  { id: 'immunology', label: 'Immunologie', icon: Shield, color: 'bg-cyan-500/10 text-cyan-500' },
  { id: 'biology', label: 'Biologie', icon: Microscope, color: 'bg-teal-500/10 text-teal-500' },
] as const;

const STUDY_YEARS = [
  { id: 'all', label: 'Toutes années' },
  { id: '1', label: '1ʳᵉ année' },
  { id: '2', label: '2ᵉ année' },
  { id: '3', label: '3ᵉ année' },
  { id: '4', label: '4ᵉ année' },
  { id: '5', label: '5ᵉ année' },
  { id: '6', label: '6ᵉ année' },
];

const DIFFICULTY_LEVELS = [
  { id: 'all', label: 'Tous niveaux', stars: 0 },
  { id: 'basic', label: 'Basique', stars: 1 },
  { id: 'intermediate', label: 'Intermédiaire', stars: 2 },
  { id: 'expert', label: 'Expert', stars: 3 },
];

const CONTENT_LANGUAGES = [
  { id: 'all', label: 'Toutes', flag: '🌍' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
];

// Derive specialty from item_code ranges (mock logic — adapt to real mapping)
function getSpecialtyFromCode(code?: string): string {
  if (!code) return 'cardiology';
  const num = parseInt(code.replace(/\D/g, ''), 10);
  if (num <= 40) return 'cardiology';
  if (num <= 80) return 'neurology';
  if (num <= 120) return 'pharmacology';
  if (num <= 160) return 'surgery';
  if (num <= 200) return 'ophthalmology';
  if (num <= 240) return 'orthopedics';
  if (num <= 280) return 'pediatrics';
  if (num <= 320) return 'emergency';
  if (num <= 350) return 'immunology';
  return 'biology';
}

function getDifficultyFromType(type: string): string {
  if (type === 'rang_a') return 'basic';
  if (type === 'rang_b') return 'expert';
  return 'intermediate';
}

function getYearFromCode(code?: string): string {
  if (!code) return '1';
  const num = parseInt(code.replace(/\D/g, ''), 10);
  if (num <= 60) return '1';
  if (num <= 120) return '2';
  if (num <= 180) return '3';
  if (num <= 240) return '4';
  if (num <= 300) return '5';
  return '6';
}

function getDifficultyStars(level: string) {
  const count = level === 'basic' ? 1 : level === 'intermediate' ? 2 : 3;
  return Array.from({ length: 3 }, (_, i) => (
    <Star key={i} className={`h-3 w-3 ${i < count ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`} />
  ));
}

// Specialty gradient covers
const SPECIALTY_GRADIENTS: Record<string, string> = {
  cardiology: 'from-red-500/80 to-rose-600/80',
  neurology: 'from-purple-500/80 to-violet-600/80',
  pharmacology: 'from-emerald-500/80 to-green-600/80',
  surgery: 'from-blue-500/80 to-indigo-600/80',
  ophthalmology: 'from-amber-500/80 to-yellow-600/80',
  orthopedics: 'from-orange-500/80 to-amber-600/80',
  pediatrics: 'from-pink-500/80 to-rose-400/80',
  emergency: 'from-red-600/80 to-red-800/80',
  immunology: 'from-cyan-500/80 to-teal-600/80',
  biology: 'from-teal-500/80 to-emerald-600/80',
};

export const MedicalContentLibrary = () => {
  const { tracks, loading, toggleFavorite, totalTracks } = useMusicLibrary();
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { currentLanguage } = useLanguage();

  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [year, setYear] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [contentLang, setContentLang] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const enrichedTracks = useMemo(() =>
    tracks.map(t => ({
      ...t,
      specialty: getSpecialtyFromCode(t.item_code),
      difficulty: getDifficultyFromType(t.type),
      year: getYearFromCode(t.item_code),
      language: 'fr', // default — extend when multi-lang content exists
      retention: Math.floor(60 + Math.random() * 35), // mock retention %
      durationLabel: `${Math.floor(2 + Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    })),
  [tracks]);

  const filtered = useMemo(() =>
    enrichedTracks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.item_code?.toLowerCase().includes(search.toLowerCase())) return false;
      if (specialty !== 'all' && t.specialty !== specialty) return false;
      if (year !== 'all' && t.year !== year) return false;
      if (difficulty !== 'all' && t.difficulty !== difficulty) return false;
      if (contentLang !== 'all' && t.language !== contentLang) return false;
      return true;
    }),
  [enrichedTracks, search, specialty, year, difficulty, contentLang]);

  const activeFiltersCount = [specialty, year, difficulty, contentLang].filter(f => f !== 'all').length + (search ? 1 : 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-0"><Skeleton className="h-64 w-full rounded-lg" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, item, spécialité…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Specialty pills */}
      <div className="flex flex-wrap gap-2">
        {SPECIALTIES.map(s => {
          const Icon = s.icon;
          const active = specialty === s.id;
          return (
            <Button
              key={s.id}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSpecialty(s.id)}
              className={`gap-1.5 transition-all ${active ? '' : 'hover:bg-muted'}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </Button>
          );
        })}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  <GraduationCap className="h-3 w-3 inline mr-1" />
                  Année d'étude
                </label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STUDY_YEARS.map(y => <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  <Star className="h-3 w-3 inline mr-1" />
                  Difficulté
                </label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(d => <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  <Globe className="h-3 w-3 inline mr-1" />
                  Langue du contenu
                </label>
                <Select value={contentLang} onValueChange={setContentLang}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.flag} {l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-muted-foreground"
                onClick={() => { setSpecialty('all'); setYear('all'); setDifficulty('all'); setContentLang('all'); setSearch(''); }}
              >
                <X className="h-3 w-3 mr-1" /> Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} chanson{filtered.length > 1 ? 's' : ''} sur {totalTracks}
      </p>

      {/* Song cards grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Aucune chanson trouvée</h3>
            <p className="text-sm text-muted-foreground">Essayez d'ajuster vos filtres</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(track => {
            const specInfo = SPECIALTIES.find(s => s.id === track.specialty) || SPECIALTIES[0];
            const SpecIcon = specInfo.icon;
            const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
            const gradient = SPECIALTY_GRADIENTS[track.specialty] || 'from-primary/80 to-primary/60';

            return (
              <GlowingCard key={track.id} className="overflow-hidden group">
                {/* Cover area */}
                <div className={`relative aspect-square bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Music className="h-16 w-16 text-white/30" />

                  {/* Specialty badge */}
                  <Badge className="absolute top-3 left-3 bg-black/40 text-white border-0 backdrop-blur-sm gap-1">
                    <SpecIcon className="h-3 w-3" />
                    {specInfo.label}
                  </Badge>

                  {/* Language flag */}
                  <span className="absolute top-3 right-3 text-lg drop-shadow-md">
                    {CONTENT_LANGUAGES.find(l => l.id === track.language)?.flag || '🇫🇷'}
                  </span>

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <Button
                      onClick={() => playTrack(track)}
                      size="lg"
                      className="rounded-full h-14 w-14 bg-white text-foreground hover:bg-white/90 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-0.5" />
                      )}
                    </Button>
                  </div>

                  {/* Duration */}
                  <span className="absolute bottom-3 right-3 text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {track.duration}
                  </span>
                </div>

                {/* Info section */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{track.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{track.item_code || 'N/A'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() => toggleFavorite(track.id)}
                    >
                      <Heart className={`h-4 w-4 ${track.is_favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>

                  {/* Difficulty stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">{getDifficultyStars(track.difficulty)}</div>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {STUDY_YEARS.find(y => y.id === track.year)?.label || '—'}
                    </Badge>
                  </div>

                  {/* Retention bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Rétention mémoire</span>
                      <span className="font-medium text-foreground">{track.retention}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          track.retention >= 80 ? 'bg-green-500' : track.retention >= 50 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${track.retention}%` }}
                      />
                    </div>
                  </div>
                </div>
              </GlowingCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
