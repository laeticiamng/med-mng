import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Target, Award, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/lib/logger';

interface OICCompetence {
  objectif_id: string;
  intitule: string;
  description?: string;
  rubrique?: string;
}

interface Concept {
  competence_id: string;
  concept: string;
  analyse?: string;
  cas?: string;
  ecueil?: string;
  technique?: string;
  maitrise?: string;
  excellence?: string;
  paroles_chantables?: string[];
}

interface Section {
  title: string;
  content?: string;
  objectif_id?: string;
  concepts?: Concept[];
  competences?: Concept[];
}

interface TableauRangBProps {
  data: {
    title?: string;
    sections?: Section[];
    competences_oic?: OICCompetence[];
  };
  itemCode: string;
}

export const TableauRangB: React.FC<TableauRangBProps> = ({ data, itemCode }) => {
  const isMobile = useIsMobile();
  // PRIORITÉ 1: Afficher les compétences OIC réelles si disponibles
  if (data?.competences_oic && Array.isArray(data.competences_oic) && data.competences_oic.length > 0) {
    logger.info('Displaying real OIC competences Rang B', {
      component: 'TableauRangB',
      action: 'display_oic_competences',
      itemCode,
      metadata: { competencesCount: data.competences_oic.length }
    });
    
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-2 flex items-center gap-2">
            <Badge className="bg-purple-600">Rang B</Badge>
            Compétences Approfondies EDN - {itemCode}
          </h2>
          <p className="text-gray-600">
            Compétences officielles du référentiel OIC - Niveau Expertise ({data.competences_oic.length} compétences)
          </p>
        </div>

        <div className="space-y-4">
          {data.competences_oic.map((competence: OICCompetence, idx: number) => {
            const competenceId = `competence-oic-b-${idx}`;
            return (
              <Card 
                key={competence.objectif_id || idx} 
                className="border-l-4 border-l-purple-500 bg-purple-50/30"
                role="article"
                aria-labelledby={competenceId}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-purple-100 border-purple-300"
                            aria-label={`Code de compétence ${competence.objectif_id}`}
                          >
                            {competence.objectif_id}
                          </Badge>
                          {competence.rubrique && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {competence.rubrique}
                            </Badge>
                          )}
                        </div>
                        
                        <h5 
                          id={competenceId}
                          className="font-semibold text-purple-800 text-base leading-tight"
                        >
                          {competence.intitule}
                        </h5>
                      </div>
                    </div>
                    
                    {competence.description && (
                      <div 
                        className="text-sm text-gray-700 leading-relaxed p-3 bg-white rounded border text-container overflow-safe"
                        role="definition"
                      >
                        <div 
                          className="break-words-force"
                          dangerouslySetInnerHTML={{ 
                            __html: competence.description 
                              .replace(/&nbsp;/g, ' ')
                              .replace(/<br\s*\/?>/gi, '<br>')
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <Badge className="bg-purple-600">
              {data.competences_oic.length}
            </Badge>
            compétences officielles du référentiel EDN - Rang B (Expertise)
          </div>
        </div>
      </div>
    );
  }
  
  if (!data || !data.sections) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            {itemCode} Rang B - Expertise Avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            Aucune compétence de rang B disponible
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
      {/* Header avec statistiques */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              {data.title || `${itemCode} Rang B - Expertise Avancée`}
            </CardTitle>
            <Badge className="bg-white/20 text-white">
              {concepts.length} compétences expertes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4' : 'p-6'}>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4 mb-6`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{concepts.length}</div>
              <div className="text-sm text-gray-600">Compétences Expertes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{data.sections?.length || 0}</div>
              <div className="text-sm text-gray-600">Sections Spécialisées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {concepts.length > 0 ? '100%' : '0%'}
              </div>
              <div className="text-sm text-gray-600">Couverture Complète</div>
            </div>
          </div>
          
          {/* Message si pas de compétences */}
          {concepts.length === 0 && (
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-700 font-medium">
                📋 Compétences en cours d'intégration pour le rang B
              </p>
              <p className="text-orange-600 text-sm mt-1">
                {data.sections?.length || 0} section{(data.sections?.length || 0) > 1 ? 's' : ''} configurée{(data.sections?.length || 0) > 1 ? 's' : ''} • Contenu bientôt disponible
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sections de compétences */}
      {data.sections?.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="border border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Target className="h-5 w-5" />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              {concepts.length > 0 ? concepts.filter(concept => 
                section.objectif_id ? concept.competence_id === section.objectif_id : true
              ).map((concept, conceptIndex) => (
                <div key={conceptIndex} className={`border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-6'} bg-white hover:shadow-md transition-shadow`}>
                  {/* En-tête du concept */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          {concept.competence_id}
                        </Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {concept.concept}
                      </h4>
                    </div>
                  </div>

                  {/* Contenu détaillé */}
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                    {concept.analyse && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-purple-700 flex items-center gap-1">
                          <Brain className="h-4 w-4" />
                          Analyse Experte
                        </h5>
                        <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded text-container break-words-force overflow-safe">
                          {concept.analyse}
                        </p>
                      </div>
                    )}

                    {concept.cas && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-indigo-700 flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          Cas Clinique
                        </h5>
                        <p className="text-sm text-gray-700 bg-indigo-50 p-3 rounded">
                          {concept.cas}
                        </p>
                      </div>
                    )}

                    {concept.ecueil && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-red-700 flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Écueil à Éviter
                        </h5>
                        <p className="text-sm text-gray-700 bg-red-50 p-3 rounded">
                          {concept.ecueil}
                        </p>
                      </div>
                    )}

                    {concept.technique && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Technique Spécialisée
                        </h5>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                          {concept.technique}
                        </p>
                      </div>
                    )}

                    {concept.maitrise && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Maîtrise Requise
                        </h5>
                        <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">
                          {concept.maitrise}
                        </p>
                      </div>
                    )}

                    {concept.excellence && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-yellow-700 flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Excellence Clinique
                        </h5>
                        <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded">
                          {concept.excellence}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Paroles chantables pour le rang B */}
                  {concept.paroles_chantables && concept.paroles_chantables.length > 0 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <h5 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
                        <Brain className="h-4 w-4" />
                        Phrases Clés Rang B
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {concept.paroles_chantables.map((parole, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                            {parole}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>📋 Compétences en préparation pour cette section</p>
                  <p className="text-sm mt-2">Les concepts seront bientôt disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Footer avec validation */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">
              Rang B complet - {concepts.length} compétences expertes intégrées
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};