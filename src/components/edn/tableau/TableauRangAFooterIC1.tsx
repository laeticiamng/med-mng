
import { CheckCircle, Heart, Users, MessageCircle, Shield, Brain, Target, AlertTriangle } from 'lucide-react';

interface TableauRangAFooterIC1Props {
  colonnesCount?: number;
  lignesCount?: number;
}

export const TableauRangAFooterIC1 = ({ colonnesCount = 0, lignesCount = 0 }: TableauRangAFooterIC1Props) => {
  const expectedCount = 15;
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
            IC-1 Rang A - Audit E-LiSA : {isComplete ? 'CONFORME' : 'NON-CONFORME'}
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

      {/* Détail des 15 connaissances attendues selon E-LiSA */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="h-5 w-5 text-primary" />
          <h4 className="text-lg font-bold text-foreground">
            15 Connaissances IC-1 selon E-LiSA officielle
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1 text-primary">
            <Target className="h-3 w-3" />
            <span>1. Définition relation médecin-malade</span>
          </div>
          <div className="flex items-center space-x-1 text-success">
            <Users className="h-3 w-3" />
            <span>2. Déterminants de la relation</span>
          </div>
          <div className="flex items-center space-x-1 text-accent">
            <Brain className="h-3 w-3" />
            <span>3. Corrélats cliniques</span>
          </div>
          <div className="flex items-center space-x-1 text-warning">
            <Heart className="h-3 w-3" />
            <span>4. Approche centrée patient</span>
          </div>
          <div className="flex items-center space-x-1 text-accent">
            <MessageCircle className="h-3 w-3" />
            <span>5. Représentations maladie</span>
          </div>
          <div className="flex items-center space-x-1 text-accent">
            <Shield className="h-3 w-3" />
            <span>6. Facteurs information patient</span>
          </div>
          <div className="flex items-center space-x-1 text-destructive">
            <Target className="h-3 w-3" />
            <span>7. Ajustement au stress</span>
          </div>
          <div className="flex items-center space-x-1 text-accent">
            <Brain className="h-3 w-3" />
            <span>8. Mécanismes de défense</span>
          </div>
          <div className="flex items-center space-x-1 text-accent">
            <Heart className="h-3 w-3" />
            <span>9. Empathie clinique</span>
          </div>
          <div className="flex items-center space-x-1 text-success">
            <Users className="h-3 w-3" />
            <span>10. Alliance thérapeutique</span>
          </div>
          <div className="flex items-center space-x-1 text-warning">
            <MessageCircle className="h-3 w-3" />
            <span>11. Processus changement</span>
          </div>
          <div className="flex items-center space-x-1 text-accent">
            <Shield className="h-3 w-3" />
            <span>12. Entretien motivationnel</span>
          </div>
          <div className="flex items-center space-x-1 text-accent">
            <Heart className="h-3 w-3" />
            <span>13. Se montrer empathique</span>
          </div>
          <div className="flex items-center space-x-1 text-primary">
            <MessageCircle className="h-3 w-3" />
            <span>14. Communication adaptée</span>
          </div>
          <div className="flex items-center space-x-1 text-success">
            <AlertTriangle className="h-3 w-3" />
            <span>15. Annonce mauvaise nouvelle</span>
          </div>
        </div>
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
              ? '✅ IC-1 : PARFAITEMENT CONFORME E-LiSA'
              : '❌ IC-1 : NÉCESSITE CORRECTION E-LiSA'
            }
          </p>
        </div>
        
        <p className={`text-sm font-medium ${
          isComplete ? 'text-success/80' : 'text-destructive/80'
        }`}>
          {isComplete 
            ? '15 connaissances fondamentales parfaitement intégrées selon fiche officielle E-LiSA'
            : `Seulement ${lignesCount}/15 connaissances - Compléter selon E-LiSA`
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
