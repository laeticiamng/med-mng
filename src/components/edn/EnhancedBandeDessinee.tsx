import React, { useState } from 'react';
import { BandeDessineeComplete } from './BandeDessineeComplete';
import { ValeursProfessionnellesBD } from './ValeursProfessionnellesBD';
import { ContentFormatSelector } from './content/ContentFormatSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Palette, Wand2 } from 'lucide-react';

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
  const [selectedFormat, setSelectedFormat] = useState<string | null>('bande-dessinee');
  const [showFormatSelector, setShowFormatSelector] = useState(false);

  const handleFormatSelect = (format: any) => {
    setSelectedFormat(format.id);
    setShowFormatSelector(false);
  };

  const renderBandeDessinee = () => {
    // Si c'est l'item sur les valeurs professionnelles, utiliser le composant spécialisé
    if (itemData.slug === 'valeurs-professionnelles-medecin') {
      return <ValeursProfessionnellesBD itemData={itemData} />;
    }

    // Utiliser le nouveau composant complet pour tous les autres items
    return <BandeDessineeComplete itemData={itemData} />;
  };

  const renderContentByFormat = () => {
    switch (selectedFormat) {
      case 'bande-dessinee':
        return renderBandeDessinee();
      
      case 'roman':
        return (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">📚 Format Roman</CardTitle>
              <CardDescription>Récit narratif complet pour {itemData.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3>Chapitre 1 : Introduction</h3>
                <p>
                  Dans le monde complexe de la médecine moderne, Dr. Sarah Martin fait face à des défis quotidiens 
                  qui illustrent parfaitement les principes de <strong>{itemData.title}</strong>. 
                  Cette histoire nous emmène dans son quotidien, où chaque décision compte...
                </p>
                <p>
                  Ce matin-là, en entrant dans son cabinet, elle ne se doutait pas que cette journée 
                  allait mettre à l'épreuve toutes ses connaissances sur ce sujet crucial.
                </p>
                <div className="bg-white p-4 rounded-lg border border-green-200 mt-4">
                  <p className="text-sm text-green-700">
                    📝 Ce contenu serait généré automatiquement en fonction des compétences 
                    des rangs A et B de l'item {itemData.item_code}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'poesie':
        return (
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">🎭 Format Poésie</CardTitle>
              <CardDescription>Vers rythmés pour {itemData.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    Ode à {itemData.title}
                  </h3>
                  <div className="font-serif text-purple-700 space-y-2">
                    <p>Ô noble art de la médecine,</p>
                    <p>Où {itemData.title} nous guide,</p>
                    <p>Vers une pratique qui se raffine,</p>
                    <p>Et notre savoir qui se confie.</p>
                    <br />
                    <p>Rang A pose les fondations,</p>
                    <p>Rang B élève nos ambitions,</p>
                    <p>Ensemble ils forment la vision,</p>
                    <p>D'une médecine de passion.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700">
                    🎵 Ces vers seraient adaptés aux compétences spécifiques 
                    de l'item {itemData.item_code} pour faciliter la mémorisation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-800">🚧 Format en développement</CardTitle>
              <CardDescription>Le format "{selectedFormat}" sera bientôt disponible</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700">
                Ce format de contenu est en cours de développement et sera disponible prochainement 
                avec un contenu personnalisé pour {itemData.title}.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête avec sélecteur de format */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-slate-600" />
              <div>
                <CardTitle className="text-slate-800">
                  Contenu Éducatif - {itemData.title}
                </CardTitle>
                <CardDescription>
                  Choisissez le format d'apprentissage qui vous convient
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFormatSelector(!showFormatSelector)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Palette className="h-4 w-4 mr-2" />
              Changer de format
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sélecteur de format (conditionnel) */}
      {showFormatSelector && (
        <ContentFormatSelector
          itemData={{
            ...itemData,
            item_code: itemData.item_code || 'IC1'
          }}
          onFormatSelect={handleFormatSelect}
          selectedFormat={selectedFormat}
        />
      )}

      {/* Contenu selon le format sélectionné */}
      <div className="space-y-4">
        {renderContentByFormat()}
      </div>

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