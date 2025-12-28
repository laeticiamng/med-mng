import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Music } from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { toast } from 'sonner';

export const PersonalizedPlaylistGenerator = () => {
  const [specialty, setSpecialty] = useState<string>('');
  const [mood, setMood] = useState<string>('');
  const [studyContext, setStudyContext] = useState<string>('');
  const [generatedPlaylist, setGeneratedPlaylist] = useState<any>(null);
  
  const { isLoading, getPersonalizedPlaylist } = useAIRecommendations();
  const { logActivity } = useActivityTracking();

  const handleGenerate = async () => {
    if (!studyContext.trim()) return;

    try {
      const result = await getPersonalizedPlaylist({
        specialty: specialty || undefined,
        mood: mood || undefined,
        study_context: studyContext
      });
      
      setGeneratedPlaylist(result);
      
      // Track activity
      await logActivity({ activity_type: 'music_generation', metadata: { action: 'playlist_generated' } });
      toast.success('Playlist générée avec succès !');
    } catch {
      // Erreur silencieuse
    }
  };

  const specialties = [
    'cardiologie', 'neurologie', 'pédiatrie', 'chirurgie', 
    'psychiatrie', 'dermatologie', 'pneumologie', 'gastroentérologie'
  ];

  const moods = [
    'concentration', 'motivation', 'révision', 'détente',
    'énergie', 'mémorisation', 'créativité', 'confiance'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Générateur de Playlist Personnalisée
          </CardTitle>
          <CardDescription>
            Créez une playlist optimisée par IA selon votre contexte d'étude
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specialty">Spécialité médicale (optionnel)</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les spécialités</SelectItem>
                  {specialties.map(spec => (
                    <SelectItem key={spec} value={spec}>
                      {spec.charAt(0).toUpperCase() + spec.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Humeur d'étude (optionnel)</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une humeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les humeurs</SelectItem>
                  {moods.map(m => (
                    <SelectItem key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexte d'étude *</Label>
            <Textarea
              id="context"
              value={studyContext}
              onChange={(e) => setStudyContext(e.target.value)}
              placeholder="Décrivez votre session d'étude : examen à préparer, sujet à réviser, objectifs d'apprentissage..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isLoading || !studyContext.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Music className="h-4 w-4 mr-2" />
            )}
            Générer ma playlist personnalisée
          </Button>
        </CardContent>
      </Card>

      {generatedPlaylist && (
        <Card>
          <CardHeader>
            <CardTitle>Votre playlist optimisée</CardTitle>
            <CardDescription>{generatedPlaylist.reasoning}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {generatedPlaylist.ordered_songs?.length || 0} chansons organisées pour optimiser votre apprentissage
              </p>
              
              <Button variant="outline" className="w-full">
                <Music className="h-4 w-4 mr-2" />
                Créer cette playlist
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
