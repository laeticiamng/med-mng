import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Share, 
  Heart,
  Wand2,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

const musicStyles = [
  { value: "pop", label: "Pop", description: "Mélodies accrocheuses et rythmes entraînants" },
  { value: "rap", label: "Rap", description: "Parfait pour mémoriser des listes et définitions" },
  { value: "classical", label: "Classique", description: "Concentration et apprentissage profond" },
  { value: "rock", label: "Rock", description: "Énergie et motivation pour réviser" },
  { value: "jazz", label: "Jazz", description: "Sophistication pour concepts complexes" },
  { value: "electronic", label: "Électronique", description: "Moderne et stimulant" },
  { value: "folk", label: "Folk", description: "Narratif et mémorable" },
  { value: "blues", label: "Blues", description: "Émotionnel et expressif" }
];

const ednCategories = [
  "Cardiologie", "Pneumologie", "Gastro-entérologie", "Neurologie",
  "Endocrinologie", "Rhumatologie", "Dermatologie", "Psychiatrie",
  "Pédiatrie", "Gynécologie", "Urologie", "ORL", "Ophtalmologie"
];

const Generator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSong, setGeneratedSong] = useState<any>(null);
  const [formData, setFormData] = useState({
    topic: "",
    content: "",
    style: "",
    duration: [180], // 3 minutes par défaut
    category: "",
    difficulty: "intermediate"
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulation de génération
    setTimeout(() => {
      setGeneratedSong({
        title: `Chanson EDN - ${formData.topic}`,
        duration: formData.duration[0],
        style: formData.style,
        audioUrl: "https://example.com/generated-song.mp3",
        lyrics: "Paroles générées automatiquement...",
        waveform: Array.from({ length: 100 }, () => Math.random() * 100)
      });
      setIsGenerating(false);
      setCurrentStep(3);
    }, 3000);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Étape 1 : Sujet d'étude</h2>
        <p className="text-muted-foreground">Définissez le contenu médical à transformer en musique</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="topic">Titre du sujet</Label>
          <Input
            id="topic"
            placeholder="Ex: Insuffisance cardiaque aiguë"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            className="medical-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie EDN</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="medical-input">
              <SelectValue placeholder="Sélectionnez une spécialité" />
            </SelectTrigger>
            <SelectContent>
              {ednCategories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Contenu à apprendre</Label>
          <Textarea
            id="content"
            placeholder="Collez ici votre cours, définitions, protocoles médicaux..."
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="medical-input min-h-[120px]"
          />
          <p className="text-sm text-muted-foreground">
            {formData.content.length}/2000 caractères
          </p>
        </div>

        <div className="space-y-2">
          <Label>Niveau de difficulté</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
            <SelectTrigger className="medical-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Débutant (DFGSM)</SelectItem>
              <SelectItem value="intermediate">Intermédiaire (DFASM)</SelectItem>
              <SelectItem value="advanced">Avancé (Internat)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={() => setCurrentStep(2)}
        disabled={!formData.topic || !formData.content || !formData.category}
        className="w-full medical-btn-primary"
        size="lg"
      >
        Continuer vers le style musical
        <Music className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Étape 2 : Style musical</h2>
        <p className="text-muted-foreground">Choisissez le style qui correspond à votre méthode d'apprentissage</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {musicStyles.map((style) => (
          <Card 
            key={style.value}
            className={`cursor-pointer transition-all ${
              formData.style === style.value 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, style: style.value }))}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{style.label}</CardTitle>
                {formData.style === style.value && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
              <CardDescription className="text-sm">{style.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Durée de la chanson</Label>
          <div className="px-4">
            <Slider
              value={formData.duration}
              onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              max={300}
              min={60}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>1 min</span>
              <span className="font-medium">{Math.floor(formData.duration[0] / 60)}:{(formData.duration[0] % 60).toString().padStart(2, '0')}</span>
              <span>5 min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="flex-1"
        >
          Retour
        </Button>
        <Button 
          onClick={handleGenerate}
          disabled={!formData.style}
          className="flex-1 medical-btn-primary"
          size="lg"
        >
          Générer la chanson
          <Wand2 className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="text-center space-y-6 py-12">
      <div className="relative">
        <div className="w-20 h-20 mx-auto mb-6">
          <Loader2 className="w-20 h-20 animate-spin text-primary" />
        </div>
        <div className="absolute inset-0 w-20 h-20 mx-auto animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-sm"></div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Génération en cours...</h2>
        <p className="text-muted-foreground mb-4">
          Notre IA compose votre chanson personnalisée
        </p>
        
        <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Analyse du contenu médical</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>Génération des paroles</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Composition musicale...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Chanson générée !</h2>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground">Votre contenu médical transformé en musique</p>
      </div>

      {generatedSong && (
        <Card className="medical-card-premium">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{generatedSong.title}</CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-2">
                  <Badge variant="secondary">{formData.style}</Badge>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(generatedSong.duration / 60)}:{(generatedSong.duration % 60).toString().padStart(2, '0')}</span>
                  </span>
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Share className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Lecteur audio simulé */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-3">
                  <Button size="sm" className="rounded-full w-10 h-10 p-0">
                    <Play className="w-4 h-4" />
                  </Button>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <div className="w-12 h-1 bg-muted rounded-full">
                      <div className="h-full bg-primary w-3/4 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* Forme d'onde simulée */}
                <div className="flex items-end justify-center space-x-1 h-16">
                  {generatedSong.waveform.slice(0, 50).map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/30 rounded-full"
                      style={{ height: `${Math.max(height * 0.4, 4)}px` }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Aperçu des paroles */}
              <div>
                <h4 className="font-semibold mb-2">Aperçu des paroles</h4>
                <div className="bg-muted/20 rounded-lg p-4 text-sm leading-relaxed">
                  <p className="italic text-muted-foreground">
                    "L'insuffisance cardiaque aiguë, c'est quand le cœur ne peut plus...<br/>
                    Dyspnée, œdèmes, c'est le tableau clinique...<br/>
                    BNP élevé, radio pulmonaire...<br/>
                    <span className="text-primary">♪ Le diagnostic se confirme ♪</span>"
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button 
          onClick={() => {
            setCurrentStep(1);
            setGeneratedSong(null);
            setFormData({
              topic: "",
              content: "",
              style: "",
              duration: [180],
              category: "",
              difficulty: "intermediate"
            });
          }}
          variant="outline"
          className="flex-1"
        >
          Créer une nouvelle chanson
        </Button>
        <Button asChild className="flex-1 medical-btn-primary">
          <Link to="/med-mng/library">
            Sauvegarder dans ma bibliothèque
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Générateur Musical IA - MED-MNG | Transformez vos cours en musique</title>
        <meta name="description" content="Créez des chansons personnalisées à partir de vos cours de médecine avec notre IA avancée. Mémorisez plus facilement avec MED-MNG." />
        <meta name="keywords" content="générateur musical, IA médicale, apprentissage musical, EDN, cours médecine" />
      </Helmet>

      <main className="min-h-screen py-8">
        <div className="medical-container max-w-4xl">
          {/* En-tête */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Wand2 className="w-4 h-4 mr-2" />
              Générateur IA
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Transformez vos cours en 
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent block">
                chansons mémorables
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Notre IA génère des chansons personnalisées à partir de vos contenus médicaux 
              pour une mémorisation 40% plus efficace.
            </p>
          </div>

          {/* Indicateur de progression */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-primary text-primary-foreground' 
                    : currentStep > step
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    currentStep > step ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Contenu principal */}
          <Card className="medical-card-premium">
            <CardContent className="p-8">
              {isGenerating ? renderGenerating() : (
                <>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderResult()}
                </>
              )}
            </CardContent>
          </Card>

          {/* Call to action */}
          {!isGenerating && currentStep !== 3 && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Nouveau sur MED-MNG ? 
                <Link to="/med-mng/signup" className="text-primary hover:underline ml-1">
                  Créez votre compte gratuit
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Generator;