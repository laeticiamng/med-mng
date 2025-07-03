import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TranslatedText } from '@/components/TranslatedText';
import { Sparkles, ArrowLeft, MessageSquare, Image, AlertTriangle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOpenAIGeneration } from '@/hooks/useOpenAIGeneration';
import { toast } from 'sonner';
import { PremiumBackground } from '@/components/ui/premium-background';
import { PremiumCard } from '@/components/ui/premium-card';
import { PremiumButton } from '@/components/ui/premium-button';

const OpenAIGenerator = () => {
  const navigate = useNavigate();
  const { generateText, generateImageAI, isGenerating, error, lastResponse, resetGeneration } = useOpenAIGeneration();
  
  // Mode sélection
  const [mode, setMode] = useState<'text' | 'image'>('text');
  
  // Configuration texte
  const [textModel, setTextModel] = useState('gpt-4o-mini');
  const [textPrompt, setTextPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(1000);
  const [temperature, setTemperature] = useState(0.7);
  
  // Configuration image
  const [imageModel, setImageModel] = useState<'dall-e-2' | 'dall-e-3' | 'gpt-image-1'>('dall-e-3');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard');
  const [imageStyle, setImageStyle] = useState<'vivid' | 'natural'>('vivid');

  // Modèles disponibles
  const textModels = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Rapide)' },
    { value: 'gpt-4o', label: 'GPT-4o (Puissant)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ];

  const imageModels = [
    { value: 'dall-e-2', label: 'DALL-E 2 (Rapide)' },
    { value: 'dall-e-3', label: 'DALL-E 3 (Haute qualité)' },
    { value: 'gpt-image-1', label: 'GPT Image 1 (Nouveau)' }
  ];

  const imageSizes = [
    { value: '1024x1024', label: '1024x1024 (Carré)' },
    { value: '1792x1024', label: '1792x1024 (Paysage)' },
    { value: '1024x1792', label: '1024x1792 (Portrait)' }
  ];

  const canGenerate = () => {
    if (mode === 'text') {
      return textPrompt.trim().length > 0;
    } else {
      return imagePrompt.trim().length > 0;
    }
  };

  const handleGenerateText = async () => {
    if (!textPrompt.trim()) {
      toast.error('Veuillez saisir un prompt');
      return;
    }

    try {
      const payload = {
        model: textModel,
        messages: [
          { role: 'user' as const, content: textPrompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      };

      await generateText(payload);
      toast.success('Texte généré avec succès !');
      
    } catch (error) {
      console.error('Erreur génération texte:', error);
      toast.error('Erreur lors de la génération de texte');
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Veuillez saisir un prompt');
      return;
    }

    try {
      const payload = {
        prompt: imagePrompt,
        model: imageModel,
        size: imageSize,
        quality: imageQuality,
        style: imageStyle,
        n: 1
      };

      await generateImageAI(payload);
      toast.success('Image générée avec succès !');
      
    } catch (error) {
      console.error('Erreur génération image:', error);
      toast.error('Erreur lors de la génération d\'image');
    }
  };

  const handleGenerate = () => {
    if (mode === 'text') {
      handleGenerateText();
    } else {
      handleGenerateImage();
    }
  };

  const resetForm = () => {
    setTextPrompt('');
    setImagePrompt('');
    resetGeneration();
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'openai-generated-image.png';
    link.click();
  };

  return (
    <PremiumBackground variant="purple">
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <TranslatedText text="Générateur OpenAI Direct" />
                </h1>
                <p className="text-gray-600 font-medium">
                  <TranslatedText text="IA générative sans serveur" />
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
                  <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Génération en cours...</h3>
                    <p className="text-sm text-gray-600">Traitement de votre demande</p>
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

          {/* Mode Selection */}
          <PremiumCard variant="glass" className="mb-8 p-8">
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  <TranslatedText text="Configuration OpenAI" />
                </h2>
                <p className="text-gray-600">
                  <TranslatedText text="Choisissez votre type de génération" />
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <PremiumCard 
                  variant={mode === 'text' ? 'elevated' : 'glass'} 
                  className={`p-6 cursor-pointer transition-all ${mode === 'text' ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setMode('text')}
                >
                  <div className="flex items-center gap-4">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Génération de Texte</h3>
                      <p className="text-gray-600">Chat, rédaction, analyse</p>
                    </div>
                  </div>
                </PremiumCard>
                
                <PremiumCard 
                  variant={mode === 'image' ? 'elevated' : 'glass'} 
                  className={`p-6 cursor-pointer transition-all ${mode === 'image' ? 'ring-2 ring-purple-500' : ''}`}
                  onClick={() => setMode('image')}
                >
                  <div className="flex items-center gap-4">
                    <Image className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Génération d'Images</h3>
                      <p className="text-gray-600">DALL-E, création visuelle</p>
                    </div>
                  </div>
                </PremiumCard>
              </div>

              {/* Text Generation Config */}
              {mode === 'text' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Modèle</Label>
                      <Select value={textModel} onValueChange={setTextModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textModels.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Tokens max: {maxTokens}</Label>
                      <Input
                        type="range"
                        min={100}
                        max={4000}
                        step={100}
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Température: {temperature}</Label>
                    <Input
                      type="range"
                      min={0}
                      max={2}
                      step={0.1}
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Prompt *</Label>
                    <Textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Posez votre question ou décrivez ce que vous voulez générer..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Image Generation Config */}
              {mode === 'image' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Modèle</Label>
                      <Select value={imageModel} onValueChange={(value: 'dall-e-2' | 'dall-e-3' | 'gpt-image-1') => setImageModel(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageModels.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Taille</Label>
                      <Select value={imageSize} onValueChange={(value: '1024x1024' | '1792x1024' | '1024x1792') => setImageSize(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Qualité</Label>
                      <Select value={imageQuality} onValueChange={(value: 'standard' | 'hd') => setImageQuality(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="hd">HD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Style</Label>
                    <div className="flex gap-4">
                      <Button
                        variant={imageStyle === 'vivid' ? 'default' : 'outline'}
                        onClick={() => setImageStyle('vivid')}
                      >
                        Vivid (Dramatique)
                      </Button>
                      <Button
                        variant={imageStyle === 'natural' ? 'default' : 'outline'}
                        onClick={() => setImageStyle('natural')}
                      >
                        Natural (Naturel)
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Description de l'image *</Label>
                    <Textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Décrivez l'image que vous voulez générer..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

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
                      {mode === 'text' ? <MessageSquare className="h-5 w-5 mr-3" /> : <Image className="h-5 w-5 mr-3" />}
                      <TranslatedText text="Générer avec OpenAI" />
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

          {/* Results Display */}
          {lastResponse && (
            <PremiumCard variant="glass" className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                <TranslatedText text="Résultat" />
              </h3>
              
              {mode === 'text' && lastResponse.choices && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {lastResponse.choices[0]?.message?.content}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Tokens utilisés: {lastResponse.usage?.total_tokens} | 
                    Modèle: {lastResponse.model}
                  </div>
                </div>
              )}

              {mode === 'image' && lastResponse.data && (
                <div className="space-y-4">
                  {lastResponse.data.map((image: any, index: number) => (
                    <div key={index} className="text-center">
                      <img 
                        src={image.url || `data:image/png;base64,${image.b64_json}`} 
                        alt="Generated image"
                        className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      />
                      {image.url && (
                        <div className="mt-4">
                          <PremiumButton
                            variant="secondary"
                            onClick={() => downloadImage(image.url)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            <TranslatedText text="Télécharger" />
                          </PremiumButton>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </PremiumCard>
          )}

          {/* Info */}
          <PremiumCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <TranslatedText text="Utilisation directe de l'API OpenAI" />
            </h3>
            <div className="text-gray-700 space-y-2">
              <p>• Accès direct aux modèles GPT-4, GPT-3.5 et DALL-E</p>
              <p>• Génération de texte et d'images de haute qualité</p>
              <p>• Configuration avancée des paramètres</p>
              <p>• Support des derniers modèles OpenAI</p>
              <p>• Interface intuitive pour tous les cas d'usage</p>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumBackground>
  );
};

export default OpenAIGenerator;