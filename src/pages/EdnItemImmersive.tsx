
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { TableauRangA } from '@/components/edn/TableauRangA';
import { TableauRangB } from '@/components/edn/TableauRangB';
import { SceneImmersive } from '@/components/edn/SceneImmersive';
import { InteractionDragDrop } from '@/components/edn/InteractionDragDrop';
import { QuizFinal } from '@/components/edn/QuizFinal';
import { ParolesMusicales } from '@/components/edn/ParolesMusicales';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';

interface EdnItemImmersive {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  item_code: string;
  pitch_intro: string;
  visual_ambiance: any;
  audio_ambiance: any;
  tableau_rang_a: any;
  tableau_rang_b: any;
  scene_immersive: any;
  paroles_musicales: string[];
  interaction_config: any;
  quiz_questions: any;
  reward_messages: any;
}

const EdnItemImmersive = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<EdnItemImmersive | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const sections = [
    'Pitch d\'introduction',
    'Scène immersive',
    'Tableau Rang A',
    'Tableau Rang B',
    'Paroles musicales',
    'Interaction',
    'Quiz final'
  ];

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching item:', error);
          return;
        }

        setItem(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchItem();
    }
  }, [slug]);

  useEffect(() => {
    const newProgress = ((currentSection + 1) / sections.length) * 100;
    setProgress(newProgress);
  }, [currentSection]);

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl text-amber-800">Chargement de l'expérience immersive...</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-800 mb-4">Item non trouvé</h1>
          <Link to="/edn" className="text-blue-600 hover:text-blue-800">
            Retour à la liste des items EDN
          </Link>
        </div>
      </div>
    );
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse" />
              <h1 className="relative text-4xl font-serif text-amber-900 mb-4">{item.title}</h1>
            </div>
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
              {item.item_code} - {item.subtitle}
            </Badge>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-amber-800 leading-relaxed font-medium italic">
                "{item.pitch_intro}"
              </p>
            </div>
          </div>
        );
      case 1:
        return <SceneImmersive data={item.scene_immersive} />;
      case 2:
        return <TableauRangA data={item.tableau_rang_a} />;
      case 3:
        return <TableauRangB data={item.tableau_rang_b} />;
      case 4:
        return <ParolesMusicales paroles={item.paroles_musicales} />;
      case 5:
        return <InteractionDragDrop config={item.interaction_config} />;
      case 6:
        return <QuizFinal questions={item.quiz_questions} rewards={item.reward_messages} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4A574" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-amber-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/edn" className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Retour aux items EDN</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                {isAudioPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="ml-2">{isAudioPlaying ? 'Couper' : 'Musique'}</span>
              </Button>
              
              <div className="text-sm text-amber-700">
                {currentSection + 1} / {sections.length}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-amber-600 mb-2">
              <span>{sections[currentSection]}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-amber-100" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl">
          <div className="p-8 min-h-[600px]">
            {renderCurrentSection()}
          </div>
          
          {/* Navigation */}
          <div className="border-t border-amber-200 p-6 bg-amber-50/50">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                Précédent
              </Button>
              
              <div className="flex gap-2">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSection
                        ? 'bg-amber-600'
                        : index < currentSection
                        ? 'bg-amber-400'
                        : 'bg-amber-200'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={nextSection}
                disabled={currentSection === sections.length - 1}
                className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
              >
                Suivant
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating audio indicator */}
      {isAudioPlaying && (
        <div className="fixed bottom-4 right-4 bg-amber-600 text-white p-3 rounded-full shadow-lg animate-pulse">
          <Volume2 className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default EdnItemImmersive;
