import { MasterContentViewer } from '@/components/content/MasterContentViewer';
import { SpotifyAIPlayer } from '@/components/music/SpotifyAIPlayer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, FileText, Flame, Music, Star, Wand2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BandeDessineeComplete } from './BandeDessineeComplete';
import { ValeursProfessionnellesBD } from './ValeursProfessionnellesBD';
import { AlternativeContentFormats } from './content/AlternativeContentFormats';

interface EnhancedBandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    slug?: string;
    item_code?: string;
    tableau_rang_a?: Record<string, unknown>;
    tableau_rang_b?: Record<string, unknown>;
  };
}

export const EnhancedBandeDessinee: React.FC<EnhancedBandeDessineeProps> = ({ itemData }) => {
  const [activeTab, setActiveTab] = useState('bande-dessinee');
  const { logActivity } = useActivityTracking();
  const { stats, loadStats, addPoints } = useGamification();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadStats(user.id);
        logActivity({ activity_type: 'study', metadata: { action: 'view_enhanced_bd', itemCode: itemData.item_code } });
        addPoints(user.id, 10, 'view_enhanced_bd');
      }
    };
    load();
  }, [itemData.item_code, loadStats, logActivity, addPoints]);

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    await logActivity({ activity_type: 'study', metadata: { action: 'switch_content_tab', tab, itemCode: itemData.item_code } });
  };

  const renderBandeDessinee = () => {
    // Si c'est l'item sur les valeurs professionnelles, utiliser le composant spécialisé
    if (itemData.slug === 'valeurs-professionnelles-medecin') {
      return <ValeursProfessionnellesBD itemData={itemData} />;
    }

    // Utiliser le nouveau composant complet pour tous les autres items
    return <BandeDessineeComplete itemData={itemData} />;
  };


  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-3 text-warning-foreground">
              <BookOpen className="h-6 w-6" />
              Contenu Éducatif Interactif - {itemData.title}
            </CardTitle>
            {stats && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1 text-xs bg-background/50">
                  <Flame className="h-3 w-3 text-warning" />
                  {stats.currentStreak ?? 0}j
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs bg-background/50">
                  <Star className="h-3 w-3 text-primary" />
                  Niv. {stats.level ?? 1}
                </Badge>
              </div>
            )}
          </div>
          <CardDescription>
            Choisissez votre format d'apprentissage préféré : bande dessinée classique ou formats alternatifs
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contenu-master" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Contenu Premium
          </TabsTrigger>
          <TabsTrigger value="spotify-ai" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Spotify IA
          </TabsTrigger>
          <TabsTrigger value="bande-dessinee" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            BD Classique
          </TabsTrigger>
          <TabsTrigger value="formats-alternatifs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Autres Formats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contenu-master" className="space-y-6">
          <MasterContentViewer itemData={itemData} />
        </TabsContent>

        <TabsContent value="spotify-ai" className="space-y-6">
          <SpotifyAIPlayer itemData={itemData} />
        </TabsContent>

        <TabsContent value="bande-dessinee" className="space-y-6">
          {renderBandeDessinee()}
        </TabsContent>

        <TabsContent value="formats-alternatifs" className="space-y-6">
          <AlternativeContentFormats 
            itemData={{
              ...itemData,
              item_code: itemData.item_code || 'IC1'
            }} 
          />
        </TabsContent>
      </Tabs>

      {/* Résumé des compétences couvertes */}
      <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Wand2 className="h-5 w-5" />
            Compétences couvertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-success">📚 Rang A (Fondamental)</h4>
              <p className="text-sm text-success/80">
                Compétences de base essentielles à maîtriser pour comprendre {itemData.title}
              </p>
              <div className="text-xs text-success/60">
                {itemData.tableau_rang_a ? '✅ Contenu disponible' : '⚠️ En cours de création'}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-success">🎯 Rang B (Avancé)</h4>
              <p className="text-sm text-success/80">
                Compétences approfondies pour une maîtrise complète du sujet
              </p>
              <div className="text-xs text-success/60">
                {itemData.tableau_rang_b ? '✅ Contenu disponible' : '⚠️ En cours de création'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
