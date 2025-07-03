import React, { useState } from 'react';
import { BandeDessineeComplete } from './BandeDessineeComplete';
import { ValeursProfessionnellesBD } from './ValeursProfessionnellesBD';
import { ContentGenerator } from './content/ContentGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, Wand2 } from 'lucide-react';

interface EnhancedBandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    slug?: string;
    item_code?: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const EnhancedBandeDessinee: React.FC<EnhancedBandeDessineeProps> = ({ itemData }) => {
  const [activeTab, setActiveTab] = useState('bande-dessinee');

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
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-amber-800">
            <BookOpen className="h-6 w-6" />
            Contenu Éducatif Interactif - {itemData.title}
          </CardTitle>
          <CardDescription>
            Choisissez votre format d'apprentissage préféré : bande dessinée classique ou formats alternatifs
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bande-dessinee" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Bande Dessinée
          </TabsTrigger>
          <TabsTrigger value="formats-alternatifs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Autres Formats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bande-dessinee" className="space-y-6">
          {renderBandeDessinee()}
        </TabsContent>

        <TabsContent value="formats-alternatifs" className="space-y-6">
          <ContentGenerator 
            itemData={{
              ...itemData,
              item_code: itemData.item_code || 'IC1'
            }} 
          />
        </TabsContent>
      </Tabs>

      {/* Résumé des compétences couvertes */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Wand2 className="h-5 w-5" />
            Compétences couvertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-700">📚 Rang A (Fondamental)</h4>
              <p className="text-sm text-emerald-600">
                Compétences de base essentielles à maîtriser pour comprendre {itemData.title}
              </p>
              <div className="text-xs text-emerald-500">
                {itemData.tableau_rang_a ? '✅ Contenu disponible' : '⚠️ En cours de création'}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-700">🎯 Rang B (Avancé)</h4>
              <p className="text-sm text-emerald-600">
                Compétences approfondies pour une maîtrise complète du sujet
              </p>
              <div className="text-xs text-emerald-500">
                {itemData.tableau_rang_b ? '✅ Contenu disponible' : '⚠️ En cours de création'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};