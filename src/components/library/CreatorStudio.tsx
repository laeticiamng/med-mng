import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Upload, FileText, Music, Play, Pause, Wand2, Send, Edit3,
  CheckCircle2, Loader2, Volume2, RotateCcw, Sparkles
} from 'lucide-react';

type StudioStep = 'upload' | 'generating' | 'review' | 'published';

interface GeneratedSong {
  title: string;
  lyrics: string;
  specialty: string;
  style: string;
  tempo: number;
  key: string;
}

const MUSIC_STYLES = [
  { id: 'pop', label: 'Pop éducatif' },
  { id: 'rap', label: 'Rap médical' },
  { id: 'jazz', label: 'Jazz lounge' },
  { id: 'electronic', label: 'Électro mnémonique' },
  { id: 'acoustic', label: 'Acoustique folk' },
  { id: 'rnb', label: 'R&B' },
];

const SPECIALTIES = [
  'Cardiologie', 'Neurologie', 'Pharmacologie', 'Chirurgie',
  'Pédiatrie', 'Urgences', 'Immunologie', 'Pneumologie',
];

export const CreatorStudio = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<StudioStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [song, setSong] = useState<GeneratedSong>({
    title: '',
    lyrics: '',
    specialty: 'Cardiologie',
    style: 'pop',
    tempo: 120,
    key: 'C Major',
  });

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.pdf') || droppedFile.name.endsWith('.pptx'))) {
      setFile(droppedFile);
    } else {
      toast({ title: 'Format non supporté', description: 'Veuillez déposer un fichier PDF ou PPTX.', variant: 'destructive' });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const startGeneration = async () => {
    if (!file || isGenerating) return;
    setStep('generating');
    setGenerationProgress(0);
    setIsGenerating(true);

    // Progress simulation for UX while real AI works
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 85) return prev;
        return prev + Math.random() * 8;
      });
    }, 500);

    try {
      const fileName = file.name.replace(/\.(pdf|pptx)$/i, '');
      const styleLabel = MUSIC_STYLES.find(s => s.id === song.style)?.label || song.style;

      const { data, error } = await supabase.functions.invoke('generate-medical-lyrics', {
        body: {
          fileName,
          specialty: song.specialty,
          style: styleLabel,
          tempo: song.tempo,
        },
      });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message || 'Erreur lors de la génération');
      }

      setGenerationProgress(100);

      setSong(prev => ({
        ...prev,
        title: data.title || `${fileName} — Chanson Médicale`,
        lyrics: data.lyrics || '',
      }));

      await new Promise(r => setTimeout(r, 400)); // Brief pause for UX
      setStep('review');
      toast({ title: '✨ Génération terminée !', description: 'Vos paroles médicales IA sont prêtes à être éditées.' });
    } catch (err: any) {
      clearInterval(progressInterval);
      setStep('upload');
      toast({
        title: 'Erreur de génération',
        description: err?.message || 'Impossible de générer les paroles. Réessayez.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Connexion requise', description: 'Connectez-vous pour publier.', variant: 'destructive' });
        return;
      }

      // Save to med_mng_songs
      const { error } = await supabase.from('med_mng_songs').insert({
        title: song.title,
        lyrics: { text: song.lyrics, specialty: song.specialty, style: song.style, tempo: song.tempo, key: song.key },
        meta: { source: 'creator_studio', generated_by: 'med_mng' },
        suno_audio_id: `cs-${Date.now()}`, // placeholder until audio is generated
        user_id: user.id,
        created_by: user.id,
      });

      if (error) throw error;

      setStep('published');
      toast({ title: '🎉 Publié !', description: 'Votre chanson est maintenant disponible dans la bibliothèque.' });
    } catch (err: any) {
      toast({
        title: 'Erreur de publication',
        description: err?.message || 'Impossible de publier. Réessayez.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Creator Studio
        </h2>
        <p className="text-muted-foreground">
          Transformez vos cours en chansons médicales avec l'IA
        </p>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
          ✨ Propulsé par MED-MNG
        </Badge>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {(['upload', 'generating', 'review', 'published'] as StudioStep[]).map((s, i) => {
          const labels = ['Upload', 'Génération IA', 'Édition', 'Publié'];
          const icons = [Upload, Wand2, Edit3, CheckCircle2];
          const Icon = icons[i];
          const isActive = step === s;
          const isDone = ['upload', 'generating', 'review', 'published'].indexOf(step) > i;
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`h-0.5 w-8 ${isDone ? 'bg-primary' : 'bg-muted'}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{labels[i]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              dragOver ? 'border-primary bg-primary/5' : file ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <CardContent className="p-12 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.pptx"
                onChange={handleFileSelect}
              />
              {file ? (
                <div className="space-y-3">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} Mo
                  </p>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    Changer de fichier
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground/60" />
                  <p className="font-medium">Glissez votre cours ici</p>
                  <p className="text-sm text-muted-foreground">PDF ou PPTX • Max 20 Mo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pre-generation config */}
          {file && (
            <Card>
              <CardHeader><CardTitle className="text-base">Configuration musicale</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Spécialité</label>
                    <Select value={song.specialty} onValueChange={v => setSong(s => ({ ...s, specialty: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Style musical</label>
                    <Select value={song.style} onValueChange={v => setSong(s => ({ ...s, style: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MUSIC_STYLES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={startGeneration} className="w-full gap-2" size="lg" disabled={isGenerating}>
                  <Wand2 className="h-5 w-5" />
                  Générer avec l'IA
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step: Generating */}
      {step === 'generating' && (
        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <Loader2 className="h-20 w-20 animate-spin text-primary/30" />
              <Music className="h-8 w-8 absolute inset-0 m-auto text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">L'IA compose votre chanson…</h3>
              <p className="text-sm text-muted-foreground">
                {generationProgress < 30 ? 'Analyse du contenu pédagogique…' :
                 generationProgress < 60 ? 'Extraction des concepts clés…' :
                 generationProgress < 85 ? 'Rédaction des paroles mnémoniques…' :
                 'Finalisation de la composition…'}
              </p>
            </div>
            <Progress value={generationProgress} className="max-w-md mx-auto" />
            <p className="text-xs text-muted-foreground">{Math.round(generationProgress)}%</p>
          </CardContent>
        </Card>
      )}

      {/* Step: Review & Edit */}
      {step === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Éditeur de paroles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Titre</label>
                <Input
                  value={song.title}
                  onChange={e => setSong(s => ({ ...s, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Paroles</label>
                <Textarea
                  value={song.lyrics}
                  onChange={e => setSong(s => ({ ...s, lyrics: e.target.value }))}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Spécialité</label>
                  <Select value={song.specialty} onValueChange={v => setSong(s => ({ ...s, specialty: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Style</label>
                  <Select value={song.style} onValueChange={v => setSong(s => ({ ...s, style: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MUSIC_STYLES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Player + Melody Params */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-14 w-14"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                  </Button>
                  <div className="flex-1 text-center text-sm text-muted-foreground">
                    <p>Aperçu audio disponible après publication</p>
                  </div>
                </div>

                <Badge variant="outline" className="gap-1">
                  <Music className="h-3 w-3" />
                  {MUSIC_STYLES.find(s => s.id === song.style)?.label} • {song.specialty}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Paramètres de mélodie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Tempo</span>
                    <span className="text-muted-foreground">{song.tempo} BPM</span>
                  </div>
                  <Slider
                    value={[song.tempo]}
                    onValueChange={([v]) => setSong(s => ({ ...s, tempo: v }))}
                    min={60}
                    max={180}
                    step={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tonalité</label>
                  <Select value={song.key} onValueChange={v => setSong(s => ({ ...s, key: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['C Major', 'D Major', 'E Minor', 'F Major', 'G Major', 'A Minor', 'B♭ Major'].map(k =>
                        <SelectItem key={k} value={k}>{k}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep('upload')}>
                    <RotateCcw className="h-4 w-4" />
                    Recommencer
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handlePublish}>
                    <Send className="h-4 w-4" />
                    Publier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step: Published */}
      {step === 'published' && (
        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Chanson publiée avec succès !</h3>
              <p className="text-muted-foreground">
                « {song.title} » est maintenant disponible dans le catalogue.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setStep('upload'); setFile(null); }}>
                Créer une autre chanson
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
