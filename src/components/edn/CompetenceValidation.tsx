import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface CompetenceValidationProps {
  item: any;
}

export const CompetenceValidation: React.FC<CompetenceValidationProps> = ({ item }) => {
  const validateCompetences = () => {
    const validation = {
      rangA: {
        present: false,
        count: 0,
        competences: []
      },
      rangB: {
        present: false,
        count: 0,
        competences: []
      },
      complete: false,
      issues: []
    };

    // Validation Rang A
    if (item.tableau_rang_a) {
      validation.rangA.present = true;
      
      if (item.tableau_rang_a.sections) {
        const concepts = item.tableau_rang_a.sections.flatMap((section: any) => 
          section.concepts || []
        );
        validation.rangA.count = concepts.length;
        validation.rangA.competences = concepts.map((c: any) => c.competence_id || c.concept).filter(Boolean);
      }
    } else {
      validation.issues.push("Tableau Rang A manquant");
    }

    // Validation Rang B
    if (item.tableau_rang_b) {
      validation.rangB.present = true;
      
      if (item.tableau_rang_b.sections) {
        const concepts = item.tableau_rang_b.sections.flatMap((section: any) => 
          section.concepts || []
        );
        validation.rangB.count = concepts.length;
        validation.rangB.competences = concepts.map((c: any) => c.competence_id || c.concept).filter(Boolean);
      }
    } else {
      validation.issues.push("Tableau Rang B manquant");
    }

    // Vérification des contenus complémentaires
    if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
      validation.issues.push("Paroles musicales manquantes");
    }

    if (!item.quiz_questions) {
      validation.issues.push("Quiz manquant");
    }

    if (!item.scene_immersive) {
      validation.issues.push("Scène immersive manquante");
    }

    // Déterminer si l'item est complet
    validation.complete = validation.rangA.present && 
                        validation.rangB.present && 
                        validation.rangA.count > 0 && 
                        validation.rangB.count > 0 &&
                        validation.issues.length === 0;

    return validation;
  };

  const validation = validateCompetences();

  const getStatusColor = () => {
    if (validation.complete) return "border-green-500 bg-green-50";
    if (validation.issues.length < 3) return "border-yellow-500 bg-yellow-50";
    return "border-red-500 bg-red-50";
  };

  const getStatusIcon = () => {
    if (validation.complete) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (validation.issues.length < 3) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className={`border-2 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Validation des Compétences - {item.item_code}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-white border">
            <div className="text-2xl font-bold text-blue-600">
              {validation.rangA.count}
            </div>
            <div className="text-sm text-gray-600">Compétences Rang A</div>
            {validation.rangA.present ? (
              <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mt-1" />
            )}
          </div>
          
          <div className="text-center p-3 rounded-lg bg-white border">
            <div className="text-2xl font-bold text-purple-600">
              {validation.rangB.count}
            </div>
            <div className="text-sm text-gray-600">Compétences Rang B</div>
            {validation.rangB.present ? (
              <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mt-1" />
            )}
          </div>
          
          <div className="text-center p-3 rounded-lg bg-white border">
            <div className="text-2xl font-bold text-green-600">
              {validation.complete ? "100%" : Math.round((6 - validation.issues.length) / 6 * 100) + "%"}
            </div>
            <div className="text-sm text-gray-600">Complétude</div>
            {validation.complete ? (
              <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto mt-1" />
            )}
          </div>
        </div>

        {/* Détails des compétences */}
        {validation.rangA.competences.length > 0 && (
          <div>
            <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Compétences Rang A ({validation.rangA.count})
            </h4>
            <div className="flex flex-wrap gap-1">
              {validation.rangA.competences.slice(0, 5).map((competence, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                  {competence}
                </Badge>
              ))}
              {validation.rangA.competences.length > 5 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                  +{validation.rangA.competences.length - 5} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        {validation.rangB.competences.length > 0 && (
          <div>
            <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Compétences Rang B ({validation.rangB.count})
            </h4>
            <div className="flex flex-wrap gap-1">
              {validation.rangB.competences.slice(0, 5).map((competence, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                  {competence}
                </Badge>
              ))}
              {validation.rangB.competences.length > 5 && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                  +{validation.rangB.competences.length - 5} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Issues */}
        {validation.issues.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Éléments manquants ({validation.issues.length})
            </h4>
            <div className="space-y-1">
              {validation.issues.map((issue, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  • {issue}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status final */}
        <div className={`p-3 rounded-lg border ${
          validation.complete 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            {validation.complete ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Item complet - Toutes les compétences sont présentes
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Item en cours de développement - {validation.issues.length} éléments à compléter
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};