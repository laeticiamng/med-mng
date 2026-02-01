// Composant générique unifié pour tous les Footer IC
// Remplace les 11 fichiers individuels (TableauRangAFooterIC1.tsx → TableauRangAFooterIC10.tsx + OIC010)

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { getFooterConfig, type ICFooterConfig } from './config/footerConfig';

interface TableauRangAFooterGenericProps {
  icCode: string;
  colonnesCount?: number;
  lignesCount?: number;
  isRangB?: boolean;
}

export const TableauRangAFooterGeneric = ({ 
  icCode,
  colonnesCount = 0, 
  lignesCount = 0, 
  isRangB = false 
}: TableauRangAFooterGenericProps) => {
  const config = getFooterConfig(icCode);
  
  if (!config) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <p className="text-destructive">Configuration non trouvée pour {icCode}</p>
      </div>
    );
  }

  const expectedCount = isRangB ? config.expectedCountRangB : config.expectedCountRangA;
  const isComplete = lignesCount >= expectedCount;
  const completionRate = expectedCount > 0 ? Math.round((lignesCount / expectedCount) * 100) : 100;
  const rangLabel = isRangB ? 'B' : 'A';
  
  const themeColor = config.themeColorClass;
  const IconComponent = config.titleIcon;
  
  const keyPoints = isRangB && config.keyPointsRangB ? config.keyPointsRangB : config.keyPointsRangA;
  const pitfalls = isRangB && config.pitfallsRangB ? config.pitfallsRangB : config.pitfallsRangA;
  const objectives = isRangB && config.objectivesRangB ? config.objectivesRangB : config.objectivesRangA;
  const knowledgeList = isRangB && config.knowledgeListRangB ? config.knowledgeListRangB : config.knowledgeListRangA;

  return (
    <div className="space-y-6">
      {/* Validation conformité E-LiSA */}
      <div className={`bg-gradient-to-r p-6 rounded-lg border-2 ${
        isComplete 
          ? 'from-success/5 to-success/10 border-success/30' 
          : 'from-warning/5 to-destructive/5 border-warning/30'
      }`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          {isComplete ? (
            <CheckCircle className="h-6 w-6 text-success" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-warning" />
          )}
          <h4 className={`text-xl font-bold ${isComplete ? 'text-success' : 'text-warning'}`}>
            {config.icCode} Rang {rangLabel} - Audit E-LiSA : {isComplete ? 'CONFORME' : 'NON-CONFORME'}
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div className="text-center">
            <div className="font-semibold text-primary">Connaissances E-LiSA</div>
            <div className={`text-3xl font-bold ${isComplete ? 'text-success' : 'text-destructive'}`}>
              {lignesCount}/{expectedCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Attendues selon fiche officielle</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-accent">Dimensions analysées</div>
            <div className="text-3xl font-bold text-accent">{colonnesCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Colonnes pédagogiques</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-accent">Conformité</div>
            <div className={`text-3xl font-bold ${isComplete ? 'text-success' : 'text-destructive'}`}>
              {completionRate}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Taux de conformité E-LiSA</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-accent">Statut</div>
            <div className={`text-2xl font-bold ${isComplete ? 'text-success' : 'text-destructive'}`}>
              {isComplete ? '✅' : '❌'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Validation officielle</div>
          </div>
        </div>
      </div>

      {/* Liste des connaissances (si disponible) */}
      {knowledgeList.length > 0 && (
        <div className={`bg-gradient-to-r from-${themeColor}/5 to-accent/5 p-6 rounded-lg border border-${themeColor}/20`}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <IconComponent className={`h-5 w-5 text-${themeColor}`} />
            <h4 className="text-lg font-bold text-foreground">
              {expectedCount} Connaissances {config.icCode} selon E-LiSA officielle
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {knowledgeList.map((knowledge, index) => {
              const KnowledgeIcon = knowledge.icon;
              return (
                <div key={index} className={`flex items-center space-x-1 ${knowledge.colorClass}`}>
                  <KnowledgeIcon className="h-3 w-3" />
                  <span>{index + 1}. {knowledge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Points clés et pièges */}
      <Card className={`p-6 bg-gradient-to-r from-${themeColor}/5 to-${themeColor}/10 border-${themeColor}/20`}>
        <div className="flex items-center space-x-2 mb-4">
          <IconComponent className={`h-5 w-5 text-${themeColor}`} />
          <h3 className="text-lg font-semibold text-foreground">
            Points clés {config.icCode} - {config.title} {isRangB ? '(Expert)' : ''}
          </h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 text-${themeColor}`}>
              🎯 {isRangB ? 'Expertise avancée' : 'Fondamentaux à retenir'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {keyPoints.map((point, index) => (
                <li key={index}>• {point}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium mb-3 text-${themeColor}`}>⚠️ Pièges à éviter</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {pitfalls.map((pitfall, index) => (
                <li key={index}>• {pitfall}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Objectifs pédagogiques */}
      {objectives.length > 0 && (
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <h4 className="font-medium text-primary mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Objectifs pédagogiques
          </h4>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {objectives.map((objective, index) => (
              <li key={index}>• {objective}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Badges de compétences */}
      <div className="flex flex-wrap gap-2 justify-center">
        {config.badges.map((badge, index) => (
          <Badge 
            key={index}
            variant="secondary" 
            className={`bg-${badge.colorClass}/10 text-${badge.colorClass} border-${badge.colorClass}/30`}
          >
            {badge.label}
          </Badge>
        ))}
        {isRangB && (
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/30">
            Expertise avancée
          </Badge>
        )}
      </div>

      {/* Message de conformité finale */}
      <div className={`text-center p-6 rounded-lg border-2 ${
        isComplete 
          ? 'bg-success/5 border-success/30' 
          : 'bg-destructive/5 border-destructive/30'
      }`}>
        <div className="flex items-center justify-center space-x-2 mb-3">
          {isComplete ? (
            <CheckCircle className="h-8 w-8 text-success" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-destructive" />
          )}
          <p className={`text-xl font-bold ${isComplete ? 'text-success' : 'text-destructive'}`}>
            {isComplete 
              ? `✅ ${config.icCode} Rang ${rangLabel} : PARFAITEMENT CONFORME E-LiSA`
              : `❌ ${config.icCode} Rang ${rangLabel} : NÉCESSITE CORRECTION E-LiSA`
            }
          </p>
        </div>
        
        <p className={`text-sm font-medium ${isComplete ? 'text-success/80' : 'text-destructive/80'}`}>
          {isComplete 
            ? `${expectedCount} connaissances ${isRangB ? 'expertes' : 'fondamentales'} parfaitement intégrées selon fiche officielle E-LiSA`
            : `Seulement ${lignesCount}/${expectedCount} connaissances - Compléter selon E-LiSA`
          }
        </p>
        
        <p className={`text-xs italic mt-2 ${isComplete ? 'text-success/60' : 'text-destructive/60'}`}>
          {isComplete 
            ? '🎯 Optimisation parfaite - Prêt pour apprentissage E-LiSA'
            : '📝 Révision nécessaire pour conformité E-LiSA officielle'
          }
        </p>
      </div>
    </div>
  );
};

// Alias de compatibilité pour migration progressive
export const TableauRangAFooterIC1 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-1" />;
export const TableauRangAFooterIC2 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-2" />;
export const TableauRangAFooterIC3 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-3" />;
export const TableauRangAFooterIC4 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-4" />;
export const TableauRangAFooterIC5 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-5" />;
export const TableauRangAFooterIC6 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-6" />;
export const TableauRangAFooterIC7 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-7" />;
export const TableauRangAFooterIC8 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-8" />;
export const TableauRangAFooterIC9 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-9" />;
export const TableauRangAFooterIC10 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="IC-10" />;
export const TableauRangAFooterOIC010 = (props: Omit<TableauRangAFooterGenericProps, 'icCode'>) => 
  <TableauRangAFooterGeneric {...props} icCode="OIC-010" />;
