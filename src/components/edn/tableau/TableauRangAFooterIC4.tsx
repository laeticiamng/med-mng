
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, AlertTriangle, Lightbulb } from 'lucide-react';

interface TableauRangAFooterIC4Props {
  colonnesCount: number;
  lignesCount: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC4: React.FC<TableauRangAFooterIC4Props> = ({
  colonnesCount,
  lignesCount,
  isRangB = false
}) => {
  const gradientClass = isRangB 
    ? "bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20"
    : "bg-gradient-to-r from-warning/5 to-warning/10 border border-warning/20";
  
  const titleColor = isRangB ? "text-accent" : "text-warning";
  const textColor = isRangB ? "text-accent" : "text-warning";

  return (
    <div className="mt-8 space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{isRangB ? '22' : '13'}</div>
          <div className="text-sm text-primary/80">Concepts {isRangB ? 'experts' : 'fondamentaux'}</div>
        </div>
        
        <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div className="text-2xl font-bold text-success">7</div>
          <div className="text-sm text-success/80">Dimensions qualité</div>
        </div>
        
        <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div className="text-2xl font-bold text-warning">5</div>
          <div className="text-sm text-warning/80">Niveaux gravité EIAS</div>
        </div>
        
        <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-center justify-center mb-2">
            <Lightbulb className="h-5 w-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent">30</div>
          <div className="text-sm text-accent/80">Secondes SHA</div>
        </div>
      </div>

      {/* Points clés */}
      <div className={`p-6 rounded-xl ${gradientClass}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${titleColor}`}>
          <Target className="h-5 w-5" />
          Points clés IC-4 - Qualité et sécurité des soins {isRangB ? '(Expert)' : ''}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>
              🎯 {isRangB ? 'Expertise avancée' : 'Fondamentaux à retenir'}
            </h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• <strong>Économique :</strong> 760M€/an IAS Europe</li>
                  <li>• <strong>Transmission :</strong> Plasmides résistants</li>
                  <li>• <strong>Structures :</strong> 3 niveaux coordination</li>
                  <li>• <strong>Causes :</strong> Modèle systémique Reason</li>
                  <li>• <strong>Leadership :</strong> Culture transformation</li>
                </>
              ) : (
                <>
                  <li>• <strong>Qualité :</strong> 7 dimensions (SPEC-AEC)</li>
                  <li>• <strong>EIAS :</strong> 40-50% évitables</li>
                  <li>• <strong>SHA :</strong> 7 temps, 20-30 secondes</li>
                  <li>• <strong>Antisepsie :</strong> tissus vivants</li>
                  <li>• <strong>Asepsie :</strong> prévention contamination</li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium mb-3 ${textColor}`}>⚠️ Pièges à éviter</h4>
            <ul className={`space-y-2 text-sm ${textColor}`}>
              {isRangB ? (
                <>
                  <li>• Analyse superficielle vs systémique</li>
                  <li>• Bouc émissaire vs causes multiples</li>
                  <li>• Résistance stable vs transférable</li>
                  <li>• Coût partiel vs coût global</li>
                  <li>• Vision locale vs approche système</li>
                </>
              ) : (
                <>
                  <li>• Confondre qualité et sécurité</li>
                  <li>• EIAS ≠ complication attendue</li>
                  <li>• Antisepsie ≠ désinfection</li>
                  <li>• Gants ne dispensent pas SHA</li>
                  <li>• Approche punitive vs culture juste</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Badges de compétences */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
          Démarche qualité
        </Badge>
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/30">
          Sécurité des soins
        </Badge>
        <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
          Prévention EIAS
        </Badge>
        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/30">
          Hygiène des mains
        </Badge>
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/30">
          Antisepsie-Asepsie
        </Badge>
        {isRangB && (
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/30">
            Expertise économique
          </Badge>
        )}
      </div>

      {/* Note de progression */}
      <div className="text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        📊 Tableau IC-4 : {lignesCount} concepts {isRangB ? 'experts' : 'fondamentaux'} sur {colonnesCount} dimensions d'analyse
        <br />
        🎯 {isRangB 
          ? 'Maîtrise experte pour leadership qualité-sécurité institutionnel'
          : 'Passage au Rang B avec 22 concepts experts après maîtrise complète'
        }
      </div>
    </div>
  );
};
