import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Brain, 
  Target, 
  Award, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  Stethoscope,
  AlertTriangle,
  Lightbulb,
  Settings,
  Eye,
  Crown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TableauRangBProps {
  data: {
    title?: string;
    sections?: Array<{
      title: string;
      content?: string;
      objectif_id?: string;
      concepts?: Array<{
        competence_id: string;
        concept: string;
        analyse?: string;
        cas?: string;
        ecueil?: string;
        technique?: string;
        maitrise?: string;
        excellence?: string;
        paroles_chantables?: string[];
      }>;
      competences?: Array<{
        competence_id: string;
        concept: string;
        analyse?: string;
        cas?: string;
        ecueil?: string;
        technique?: string;
        maitrise?: string;
        excellence?: string;
        paroles_chantables?: string[];
      }>;
    }>;
  };
  itemCode: string;
}

interface ConceptCardProps {
  concept: {
    competence_id: string;
    concept: string;
    analyse?: string;
    cas?: string;
    ecueil?: string;
    technique?: string;
    maitrise?: string;
    excellence?: string;
    paroles_chantables?: string[];
  };
  index: number;
}

const ConceptSection: React.FC<{
  title: string;
  content: string;
  icon: React.ReactNode;
  colorClass: string;
}> = ({ title, content, icon, colorClass }) => (
  <div className={`p-4 rounded-xl border-l-4 ${colorClass} bg-background/50 hover:bg-background/80 transition-colors`}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <h4 className="font-semibold text-foreground">{title}</h4>
    </div>
    <div className="pl-11">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {content}
      </p>
    </div>
  </div>
);

const ConceptCard: React.FC<ConceptCardProps> = ({ concept, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sections = [
    { 
      key: 'analyse', 
      title: 'Analyse experte', 
      content: concept.analyse, 
      icon: <Brain className="w-4 h-4 text-purple-600" />,
      colorClass: 'border-l-purple-500 bg-purple-50/30'
    },
    { 
      key: 'cas', 
      title: 'Cas clinique complexe', 
      content: concept.cas, 
      icon: <Stethoscope className="w-4 h-4 text-blue-600" />,
      colorClass: 'border-l-blue-500 bg-blue-50/30'
    },
    { 
      key: 'ecueil', 
      title: 'Écueils et pièges', 
      content: concept.ecueil, 
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      colorClass: 'border-l-red-500 bg-red-50/30'
    },
    { 
      key: 'technique', 
      title: 'Technique spécialisée', 
      content: concept.technique, 
      icon: <Settings className="w-4 h-4 text-green-600" />,
      colorClass: 'border-l-green-500 bg-green-50/30'
    },
    { 
      key: 'maitrise', 
      title: 'Maîtrise clinique', 
      content: concept.maitrise, 
      icon: <Eye className="w-4 h-4 text-indigo-600" />,
      colorClass: 'border-l-indigo-500 bg-indigo-50/30'
    },
    { 
      key: 'excellence', 
      title: 'Excellence thérapeutique', 
      content: concept.excellence, 
      icon: <Crown className="w-4 h-4 text-amber-600" />,
      colorClass: 'border-l-amber-500 bg-amber-50/30'
    }
  ].filter(section => section.content && section.content.trim().length > 0);

  const availableSectionsCount = sections.length;

  return (
    <Card className="transition-all duration-300 border-0 shadow-sm hover:shadow-lg group relative overflow-hidden bg-card">
      {/* Indicateur de progression visuel */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-80"></div>
      
      <CardHeader 
        className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 cursor-pointer hover:bg-opacity-80 transition-all duration-200 pb-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Numéro et badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-105 transition-transform">
                {index + 1}
              </div>
              {concept.competence_id && (
                <Badge variant="outline" className="text-xs font-medium px-2 py-1 border-purple-200 text-purple-700">
                  {concept.competence_id}
                </Badge>
              )}
            </div>
            
            {/* Contenu principal */}
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-purple-700 transition-colors">
                {concept.concept}
              </h3>
              
              {/* Indicateurs de contenu */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {sections.slice(0, 4).map((section, idx) => (
                    <div key={`${concept.competence_id}-indicator-${idx}`} className="w-2 h-2 rounded-full bg-purple-500/60"></div>
                  ))}
                  {availableSectionsCount > 4 && (
                    <span className="text-xs text-muted-foreground">+{availableSectionsCount - 4}</span>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {availableSectionsCount} section{availableSectionsCount > 1 ? 's' : ''} experte{availableSectionsCount > 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Paroles chantables */}
              {concept.paroles_chantables && concept.paroles_chantables.length > 0 && (
                <div className="bg-gradient-to-r from-purple-100/50 to-indigo-100/50 rounded-lg p-3 border border-purple-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-purple-800">Mémorisation musicale</span>
                  </div>
                  <div className="text-xs text-purple-700 space-y-1">
                    {concept.paroles_chantables.slice(0, 2).map((parole, idx) => (
                      <div key={`${concept.competence_id}-parole-${idx}`} className="italic">"{parole}"</div>
                    ))}
                    {concept.paroles_chantables.length > 2 && (
                      <div className="text-purple-600">+{concept.paroles_chantables.length - 2} autres...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Contrôle d'expansion */}
          <Button variant="ghost" size="sm" className="group-hover:bg-purple-100/50">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      {/* Contenu étendu */}
      {isExpanded && (
        <CardContent className="pt-0 pb-6 px-6">
          <Separator className="mb-6" />
          
          {availableSectionsCount > 0 ? (
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <ConceptSection
                  key={section.key}
                  title={section.title}
                  content={section.content!}
                  icon={section.icon}
                  colorClass={section.colorClass}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Analyse experte en cours de développement
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export const TableauRangB: React.FC<TableauRangBProps> = ({ data, itemCode }) => {
  const isMobile = useIsMobile();
  
  if (!data || !data.sections) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6" />
            {itemCode} Rang B - Expertise Avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Expertise de rang B non disponible
              </h4>
              <p className="text-gray-600 text-sm">
                Les compétences expertes pour cet item sont en cours de développement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAllConcepts = () => {
    if (!data || !data.sections) return [];
    
    return data.sections.flatMap(section => {
      // Nouveau format OIC avec concepts/competences
      if (section.concepts && Array.isArray(section.concepts)) {
        return section.concepts;
      } else if (section.competences && Array.isArray(section.competences)) {
        return section.competences;
      }
      // Format simple avec contenu direct (item IC-5 par exemple)
      else if (section.content && section.title) {
        return [{
          competence_id: section.objectif_id || 'N/A',
          concept: section.title,
          analyse: section.content,
          cas: `Cas clinique lié à: ${section.title}`,
          ecueil: `Attention particulière à porter sur: ${section.title}`,
          technique: `Technique spécialisée pour: ${section.title}`,
          maitrise: `Maîtrise experte requise pour: ${section.title}`,
          excellence: `Excellence clinique dans: ${section.title}`
        }];
      }
      return [];
    });
  };

  const concepts = getAllConcepts();

  return (
    <div className="space-y-6">
      {/* En-tête amélioré */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-background to-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {data.title || `${itemCode} Rang B - Expertise Avancée`}
                </CardTitle>
                <p className="text-muted-foreground font-medium">
                  Analyse experte et maîtrise clinique avancée
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm font-bold px-4 py-2 bg-purple-100/50 text-purple-700 border-purple-200">
                {concepts.length} concept{concepts.length > 1 ? 's' : ''} expert{concepts.length > 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="font-medium">
                Rang B - Avancé
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal */}
      {concepts.length > 0 ? (
        <div className="space-y-6">
          {concepts.map((concept, index) => (
            <ConceptCard
              key={`${concept.competence_id}-${index}`}
              concept={concept}
              index={index}
            />
          ))}
        </div>
      ) : (
        <Card className="border border-border/50 bg-muted/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Expertise en développement
            </h4>
            <p className="text-gray-600 text-sm">
              Les concepts experts de rang B sont en cours d'élaboration
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pied de page informatif */}
      <Card className="border border-border/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground font-medium">
              <span>🧠 {concepts.length} concepts experts analysés</span>
              <span>🎯 Niveau maîtrise clinique avancée</span>
            </div>
            <Badge variant="outline" className="font-medium bg-purple-100/50 text-purple-700">
              Expertise Rang B
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};