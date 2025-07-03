import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TranslatedText } from '@/components/TranslatedText';
import { GeneratorMusicPlayer } from '@/components/GeneratorMusicPlayer';
import { Music, Wand2, ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSunoGeneration } from '@/hooks/useSunoGeneration';
import { useEdnItemLyrics } from '@/hooks/useEdnItemLyrics';
import { toast } from 'sonner';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';

const SunoGenerator = () => {
  const navigate = useNavigate();
  const { generateSong, isGenerating, status, error, audioUrl, progress, resetGeneration } = useSunoGeneration();
  
  // Configuration de base
  const [customMode, setCustomMode] = useState(true);
  const [instrumental, setInstrumental] = useState(false);
  const [model, setModel] = useState<'V3_5' | 'V4' | 'V4_5'>('V4');
  
  // Champs requis
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [title, setTitle] = useState('');
  const [negativeTags, setNegativeTags] = useState('');
  
  // Integration EDN
  const [useEdnLyrics, setUseEdnLyrics] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const { lyrics: ednLyrics, loading: lyricsLoading } = useEdnItemLyrics(
    useEdnLyrics ? selectedItem : null
  );

  // Items EDN disponibles
  const ednItems = [
    { code: 'IC1', title: 'La relation médecin-malade' },
    { code: 'IC2', title: 'Les valeurs professionnelles du médecin' },
    { code: 'IC3', title: 'Raisonnement et décision en médecine' },
    { code: 'IC4', title: 'Qualité et sécurité des soins' },
    { code: 'IC5', title: 'Organisation du système de santé' },
    { code: 'IC6', title: 'Organisation de l\'exercice clinique et sécurisation du parcours patient' },
    { code: 'IC7', title: 'Les discriminations' },
    { code: 'IC8', title: 'Certificats médicaux dans le cadre des violences' },
    { code: 'IC9', title: 'Médecine légale et expertises judiciaires' },
    { code: 'IC10', title: 'Approches transversales : corporéité, spiritualité, sexualité' }
  ];

  // Modèles disponibles
  const models = [
    { value: 'V3_5', label: 'V3.5 (Rapide)' },
    { value: 'V4', label: 'V4 (Équilibré)' },
    { value: 'V4_5', label: 'V4.5 (Haute qualité)' }
  ];

  // Styles prédéfinis
  const musicStyles = [
    'Pop', 'Rock', 'Jazz', 'Classical', 'Reggae', 'Hip-Hop', 'Folk', 'Electronic',
    'Blues', 'Country', 'R&B', 'Funk', 'Ambient', 'Metal', 'Punk', 'Indie'
  ];

  const canGenerate = () => {
    if (customMode) {
      if (!style || !title) return false;
      if (!instrumental && !prompt) return false;
    } else {
      if (!prompt) return false;
    }
    return true;
  };

  const getMaxLength = (field: 'prompt' | 'style') => {
    const limits = {
      V3_5: { prompt: 3000, style: 200 },
      V4: { prompt: 3000, style: 200 },
      V4_5: { prompt: 5000, style: 1000 }
    };
    return limits[model][field];
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      let finalPrompt = prompt;
      
      // Utiliser les paroles EDN si sélectionnées
      if (useEdnLyrics && ednLyrics?.paroles_musicales?.[0] && !instrumental) {
        finalPrompt = ednLyrics.paroles_musicales[0];
      }

      const payload = {
        prompt: finalPrompt || undefined,
        style: style || undefined,
        title: title || undefined,
        customMode,
        instrumental,
        model,
        negativeTags: negativeTags || undefined,
        callBackUrl: 'http://localhost:3000/webhook/suno' // Webhook local pour dev
      };

      await generateSong(payload);
      toast.success('Génération démarrée !');
      
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération');
    }
  };

  const resetForm = () => {
    setPrompt('');
    setStyle('');
    setTitle('');
    setNegativeTags('');
    setSelectedItem('');
    setUseEdnLyrics(false);
    resetGeneration();
  };

  // Générer un objet song pour le player
  const generatedSong = audioUrl ? {
    id: Date.now(),
    title: title || 'Musique générée',
    audioUrl: audioUrl,
    style: style,
    duration: 240
  } : null;

  const handleAddToLibrary = () => {
    if (generatedSong) {
      toast.success('Musique sauvegardée !');
      // Ici on pourrait ajouter la logique de sauvegarde
    }
  };

  return (
    <PremiumBackground variant="amber">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            <PremiumButton
              variant="glass"
              size="md"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <TranslatedText text="Retour" />
            </PremiumButton>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg flex items-center justify-center">
                <Music className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <TranslatedText text="Générateur Suno Direct" />
                </h1>
                <p className="text-gray-600 font-medium">
                  <TranslatedText text="Génération musicale IA sans serveur" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Progress indicator */}
          {isGenerating && (
            <div className="mb-8">
              <PremiumCard variant="glass" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Génération en cours...</h3>
                    <p className="text-sm text-gray-600">Statut: {status?.status}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-8">
              <PremiumCard variant="glass" className="p-6 border-red-200 bg-red-50/50">
                <div className="flex items-center gap-3 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Erreur: {error}</span>
                </div>
              </PremiumCard>
            </div>
          )}

          {/* Configuration Form */}
          <PremiumCard variant="glass" className="mb-8 p-8">
            <div className="flex items-center gap-4 mb-8">
              <Wand2 className="h-8 w-8 text-amber-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  <TranslatedText text="Configuration Suno" />
                </h2>
                <p className="text-gray-600">
                  <TranslatedText text="Paramétrez votre génération musicale" />
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              
              {/* Mode et modèle */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Mode de génération</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={customMode}
                      onCheckedChange={setCustomMode}
                    />
                    <Label>Mode personnalisé</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={instrumental}
                      onCheckedChange={setInstrumental}
                    />
                    <Label>Instrumental uniquement</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Modèle IA</Label>
                  <Select value={model} onValueChange={(value: 'V3_5' | 'V4' | 'V4_5') => setModel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Champs obligatoires en mode custom */}
              {customMode && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Titre *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Titre de votre musique"
                      maxLength={80}
                    />
                    <p className="text-sm text-gray-500">{title.length}/80 caractères</p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Style musical *</Label>
                    <div className="flex gap-2 mb-2">
                      {musicStyles.slice(0, 8).map((s) => (
                        <Button
                          key={s}
                          variant="outline"
                          size="sm"
                          onClick={() => setStyle(s)}
                          className={style === s ? 'bg-amber-100 border-amber-500' : ''}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      placeholder="Décrivez le style musical souhaité"
                      maxLength={getMaxLength('style')}
                      rows={2}
                    />
                    <p className="text-sm text-gray-500">{style.length}/{getMaxLength('style')} caractères</p>
                  </div>
                </div>
              )}

              {/* Prompt/Paroles */}
              {!instrumental && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">
                      {customMode ? 'Paroles/Description' : 'Prompt de génération'} *
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={useEdnLyrics}
                        onCheckedChange={setUseEdnLyrics}
                      />
                      <Label className="text-sm">Utiliser les paroles EDN</Label>
                    </div>
                  </div>

                  {useEdnLyrics && (
                    <div className="space-y-4">
                      <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un item EDN" />
                        </SelectTrigger>
                        <SelectContent>
                          {ednItems.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              {item.code} - {item.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {lyricsLoading && (
                        <p className="text-sm text-blue-600">Chargement des paroles...</p>
                      )}
                      
                      {ednLyrics && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            ✅ Paroles trouvées: {ednLyrics.paroles_musicales?.length || 0} versions
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={useEdnLyrics ? "Les paroles EDN seront utilisées automatiquement" : "Décrivez la musique que vous voulez générer..."}
                    disabled={useEdnLyrics && Boolean(ednLyrics?.paroles_musicales?.[0])}
                    maxLength={getMaxLength('prompt')}
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">{prompt.length}/{getMaxLength('prompt')} caractères</p>
                </div>
              )}

              {/* Tags négatifs */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Tags négatifs (optionnel)</Label>
                <Input
                  value={negativeTags}
                  onChange={(e) => setNegativeTags(e.target.value)}
                  placeholder="Éléments à éviter dans la génération"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <PremiumButton
                  variant="primary"
                  size="xl"
                  onClick={handleGenerate}
                  disabled={!canGenerate() || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                      <TranslatedText text="Génération..." />
                    </>
                  ) : (
                    <>
                      <Music className="h-5 w-5 mr-3" />
                      <TranslatedText text="Générer avec Suno" />
                    </>
                  )}
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  size="xl"
                  onClick={resetForm}
                  disabled={isGenerating}
                >
                  <TranslatedText text="Réinitialiser" />
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>

          {/* Music Player */}
          <GeneratorMusicPlayer
            generatedSong={generatedSong}
            onAddToLibrary={handleAddToLibrary}
          />

          {/* Info */}
          <PremiumCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-600" />
              <TranslatedText text="Utilisation directe de l'API Suno" />
            </h3>
            <div className="text-gray-700 space-y-2">
              <p>• Génération directe via l'API Suno officielle</p>
              <p>• Support des modèles V3.5, V4 et V4.5</p>
              <p>• Mode personnalisé ou prompt libre</p>
              <p>• Intégration optionnelle avec les paroles EDN</p>
              <p>• Polling automatique du statut de génération</p>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumBackground>
  );
};

export default SunoGenerator;