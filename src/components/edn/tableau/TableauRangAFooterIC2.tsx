
import { CheckCircle, Target, BookOpen, Award, Scale, Users, Shield, AlertTriangle, Heart, Brain } from 'lucide-react';

interface TableauRangAFooterIC2Props {
  colonnesCount?: number;
  lignesCount?: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC2 = ({ colonnesCount = 0, lignesCount = 0, isRangB = false }: TableauRangAFooterIC2Props) => {
  const expectedCount = isRangB ? 2 : 7; // EXACTEMENT 7 pour Rang A
  const rangLabel = isRangB ? "B" : "A";
  const totalExpected = isRangB ? "2 connaissances approfondies" : "7 connaissances fondamentales";
  const isComplete = lignesCount === expectedCount;
  
  return (
    <div className="space-y-6">
      {/* Validation conformité E-LiSA officielle */}
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
          <h4 className={`text-xl font-bold ${
            isComplete ? 'text-success' : 'text-warning'
          }`}>
            IC-2 Rang {rangLabel} - Audit E-LiSA : {isComplete ? 'CONFORME' : 'NON-CONFORME'}
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
              {Math.round((lignesCount / expectedCount) * 100)}%
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

      {/* Détail des connaissances attendues selon E-LiSA */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h4 className="text-lg font-bold text-foreground">
            Connaissances IC-2 Rang {rangLabel} selon E-LiSA officielle
          </h4>
        </div>
        
        {!isRangB ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 text-primary">
              <Users className="h-4 w-4" />
              <span>1. Identifier professionnels et compétences</span>
            </div>
            <div className="flex items-center space-x-2 text-success">
              <Target className="h-4 w-4" />
              <span>2. Définition pratique médicale et éthique</span>
            </div>
            <div className="flex items-center space-x-2 text-warning">
              <Scale className="h-4 w-4" />
              <span>3. Normes et valeurs professionnelles</span>
            </div>
            <div className="flex items-center space-x-2 text-accent">
              <Shield className="h-4 w-4" />
              <span>4. Organisation et régulation</span>
            </div>
            <div className="flex items-center space-x-2 text-accent">
              <Award className="h-4 w-4" />
              <span>5. EBM et responsabilité patient</span>
            </div>
            <div className="flex items-center space-x-2 text-destructive">
              <CheckCircle className="h-4 w-4" />
              <span>6. Déontologie et conflits</span>
            </div>
            <div className="flex items-center space-x-2 text-accent">
              <Brain className="h-4 w-4" />
              <span>7. Interactions interprofessionnelles</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-success">
              <Award className="h-4 w-4" />
              <span>1. Organisation exercice et statuts professionnels</span>
            </div>
            <div className="flex items-center space-x-2 text-primary">
              <Shield className="h-4 w-4" />
              <span>2. Rôle des ordres professionnels</span>
            </div>
          </div>
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
          <p className={`text-xl font-bold ${
            isComplete ? 'text-success' : 'text-destructive'
          }`}>
            {isComplete 
              ? `✅ IC-2 Rang ${rangLabel} : PARFAITEMENT CONFORME E-LiSA`
              : `❌ IC-2 Rang ${rangLabel} : NÉCESSITE CORRECTION E-LiSA`
            }
          </p>
        </div>
        
        <p className={`text-sm font-medium ${
          isComplete ? 'text-success/80' : 'text-destructive/80'
        }`}>
          {isComplete 
            ? `${totalExpected} parfaitement intégrées selon fiche officielle E-LiSA`
            : `Seulement ${lignesCount}/${expectedCount} connaissances - Compléter selon E-LiSA`
          }
        </p>
        
        <p className={`text-xs italic mt-2 ${
          isComplete ? 'text-success/60' : 'text-destructive/60'
        }`}>
          {isComplete 
            ? '🎯 Optimisation parfaite - Prêt pour apprentissage E-LiSA'
            : '📝 Révision nécessaire pour conformité E-LiSA officielle'
          }
        </p>
      </div>
    </div>
  );
};
