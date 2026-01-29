import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Award, CheckCircle2, ClipboardCheck, FileText, Stethoscope, Users } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// Types pour les grilles UNESS officielles
interface UNESSCriterion {
  id: string;
  libelle: string;
  ponderation: number;
  type: 'obligatoire' | 'recommande' | 'optionnel';
  remarques?: string;
}

interface UNESSCategory {
  id: string;
  nom: string;
  icone: string;
  criteres: UNESSCriterion[];
  ponderationMax: number;
}

interface UNESSGrid {
  id: string;
  nom: string;
  specialite: string;
  dureeMinutes: number;
  categories: UNESSCategory[];
  seuilValidation: number; // % minimum pour valider
}

// Grilles ECOS officielles UNESS par spécialité
const GRILLES_UNESS: Record<string, UNESSGrid> = {
  cardiologie: {
    id: 'ecos-cardio',
    nom: 'ECOS Cardiologie',
    specialite: 'Cardiologie',
    dureeMinutes: 7,
    seuilValidation: 60,
    categories: [
      {
        id: 'communication',
        nom: 'Communication',
        icone: '💬',
        ponderationMax: 8,
        criteres: [
          { id: 'comm-1', libelle: 'Se présente au patient (nom, fonction)', ponderation: 1, type: 'obligatoire' },
          { id: 'comm-2', libelle: 'Explique le but de la consultation', ponderation: 1, type: 'obligatoire' },
          { id: 'comm-3', libelle: 'Utilise un vocabulaire adapté', ponderation: 2, type: 'obligatoire' },
          { id: 'comm-4', libelle: 'Écoute active et reformulation', ponderation: 2, type: 'recommande' },
          { id: 'comm-5', libelle: 'Vérifie la compréhension', ponderation: 1, type: 'recommande' },
          { id: 'comm-6', libelle: 'Attitude empathique et rassurante', ponderation: 1, type: 'recommande' }
        ]
      },
      {
        id: 'interrogatoire',
        nom: 'Interrogatoire',
        icone: '🔍',
        ponderationMax: 14,
        criteres: [
          { id: 'int-1', libelle: 'Recherche le motif principal de consultation', ponderation: 2, type: 'obligatoire' },
          { id: 'int-2', libelle: 'Caractérise la douleur thoracique (SOCRATES)', ponderation: 3, type: 'obligatoire' },
          { id: 'int-3', libelle: 'Recherche les signes de gravité (dyspnée, syncope)', ponderation: 3, type: 'obligatoire' },
          { id: 'int-4', libelle: 'Antécédents cardiovasculaires personnels', ponderation: 2, type: 'obligatoire' },
          { id: 'int-5', libelle: 'Antécédents familiaux (mort subite, IDM)', ponderation: 1, type: 'recommande' },
          { id: 'int-6', libelle: 'Facteurs de risque CV (tabac, HTA, diabète, dyslipidémie)', ponderation: 2, type: 'obligatoire' },
          { id: 'int-7', libelle: 'Traitements en cours', ponderation: 1, type: 'obligatoire' }
        ]
      },
      {
        id: 'examen',
        nom: 'Examen Clinique',
        icone: '🩺',
        ponderationMax: 14,
        criteres: [
          { id: 'exam-1', libelle: 'Prend les constantes (PA, FC, SpO2)', ponderation: 3, type: 'obligatoire' },
          { id: 'exam-2', libelle: 'Mesure PA aux deux bras', ponderation: 1, type: 'recommande' },
          { id: 'exam-3', libelle: 'Auscultation cardiaque (bruits, souffles)', ponderation: 3, type: 'obligatoire' },
          { id: 'exam-4', libelle: 'Auscultation pulmonaire', ponderation: 2, type: 'obligatoire' },
          { id: 'exam-5', libelle: 'Recherche signes d\'insuffisance cardiaque', ponderation: 2, type: 'obligatoire' },
          { id: 'exam-6', libelle: 'Palpation des pouls périphériques', ponderation: 2, type: 'recommande' },
          { id: 'exam-7', libelle: 'Recherche œdèmes des membres inférieurs', ponderation: 1, type: 'recommande' }
        ]
      },
      {
        id: 'raisonnement',
        nom: 'Raisonnement Clinique',
        icone: '🧠',
        ponderationMax: 10,
        criteres: [
          { id: 'reas-1', libelle: 'Formule les hypothèses diagnostiques principales', ponderation: 3, type: 'obligatoire' },
          { id: 'reas-2', libelle: 'Hiérarchise les diagnostics différentiels', ponderation: 2, type: 'recommande' },
          { id: 'reas-3', libelle: 'Propose les examens complémentaires pertinents', ponderation: 3, type: 'obligatoire' },
          { id: 'reas-4', libelle: 'Justifie ses choix diagnostiques', ponderation: 2, type: 'recommande' }
        ]
      },
      {
        id: 'prise-en-charge',
        nom: 'Prise en Charge',
        icone: '💊',
        ponderationMax: 10,
        criteres: [
          { id: 'pec-1', libelle: 'Propose une prise en charge initiale adaptée', ponderation: 3, type: 'obligatoire' },
          { id: 'pec-2', libelle: 'Identifie les critères d\'hospitalisation', ponderation: 2, type: 'obligatoire' },
          { id: 'pec-3', libelle: 'Prescrit le traitement médicamenteux adapté', ponderation: 2, type: 'recommande' },
          { id: 'pec-4', libelle: 'Planifie le suivi et la surveillance', ponderation: 2, type: 'recommande' },
          { id: 'pec-5', libelle: 'Donne les consignes de sortie/surveillance', ponderation: 1, type: 'obligatoire' }
        ]
      }
    ]
  },
  neurologie: {
    id: 'ecos-neuro',
    nom: 'ECOS Neurologie',
    specialite: 'Neurologie',
    dureeMinutes: 7,
    seuilValidation: 60,
    categories: [
      {
        id: 'communication',
        nom: 'Communication',
        icone: '💬',
        ponderationMax: 6,
        criteres: [
          { id: 'comm-1', libelle: 'Se présente correctement', ponderation: 1, type: 'obligatoire' },
          { id: 'comm-2', libelle: 'Explique la démarche au patient', ponderation: 1, type: 'obligatoire' },
          { id: 'comm-3', libelle: 'Communication adaptée et claire', ponderation: 2, type: 'obligatoire' },
          { id: 'comm-4', libelle: 'Gestion de l\'anxiété du patient', ponderation: 2, type: 'recommande' }
        ]
      },
      {
        id: 'interrogatoire',
        nom: 'Interrogatoire',
        icone: '🔍',
        ponderationMax: 14,
        criteres: [
          { id: 'int-1', libelle: 'Mode d\'installation des symptômes', ponderation: 3, type: 'obligatoire' },
          { id: 'int-2', libelle: 'Caractérise les céphalées (SOCRATES)', ponderation: 3, type: 'obligatoire' },
          { id: 'int-3', libelle: 'Recherche signes neurologiques focaux', ponderation: 2, type: 'obligatoire' },
          { id: 'int-4', libelle: 'Recherche troubles de conscience', ponderation: 2, type: 'obligatoire' },
          { id: 'int-5', libelle: 'Antécédents neurologiques', ponderation: 2, type: 'obligatoire' },
          { id: 'int-6', libelle: 'Traitements et toxiques', ponderation: 2, type: 'recommande' }
        ]
      },
      {
        id: 'examen',
        nom: 'Examen Neurologique',
        icone: '🩺',
        ponderationMax: 18,
        criteres: [
          { id: 'exam-1', libelle: 'Évalue le niveau de conscience (Glasgow)', ponderation: 3, type: 'obligatoire' },
          { id: 'exam-2', libelle: 'Examine les paires crâniennes', ponderation: 3, type: 'obligatoire' },
          { id: 'exam-3', libelle: 'Teste la motricité des 4 membres', ponderation: 3, type: 'obligatoire' },
          { id: 'exam-4', libelle: 'Évalue la sensibilité', ponderation: 2, type: 'obligatoire' },
          { id: 'exam-5', libelle: 'Recherche les réflexes ostéo-tendineux', ponderation: 2, type: 'obligatoire' },
          { id: 'exam-6', libelle: 'Recherche syndrome méningé', ponderation: 3, type: 'obligatoire' },
          { id: 'exam-7', libelle: 'Évalue la coordination (cervelet)', ponderation: 2, type: 'recommande' }
        ]
      },
      {
        id: 'raisonnement',
        nom: 'Raisonnement Clinique',
        icone: '🧠',
        ponderationMax: 10,
        criteres: [
          { id: 'reas-1', libelle: 'Identifie le syndrome neurologique', ponderation: 3, type: 'obligatoire' },
          { id: 'reas-2', libelle: 'Localise la lésion (topographie)', ponderation: 3, type: 'obligatoire' },
          { id: 'reas-3', libelle: 'Propose les examens d\'imagerie adaptés', ponderation: 2, type: 'obligatoire' },
          { id: 'reas-4', libelle: 'Identifie l\'urgence thérapeutique', ponderation: 2, type: 'obligatoire' }
        ]
      },
      {
        id: 'prise-en-charge',
        nom: 'Prise en Charge',
        icone: '💊',
        ponderationMax: 8,
        criteres: [
          { id: 'pec-1', libelle: 'Oriente le patient (urgences, UNV)', ponderation: 2, type: 'obligatoire' },
          { id: 'pec-2', libelle: 'Mesures de neuroprotection', ponderation: 2, type: 'obligatoire' },
          { id: 'pec-3', libelle: 'Traitement symptomatique adapté', ponderation: 2, type: 'recommande' },
          { id: 'pec-4', libelle: 'Information du patient et de la famille', ponderation: 2, type: 'recommande' }
        ]
      }
    ]
  },
  urgences: {
    id: 'ecos-urgences',
    nom: 'ECOS Urgences',
    specialite: 'Médecine d\'Urgence',
    dureeMinutes: 7,
    seuilValidation: 60,
    categories: [
      {
        id: 'evaluation-initiale',
        nom: 'Évaluation Initiale',
        icone: '⚡',
        ponderationMax: 12,
        criteres: [
          { id: 'eval-1', libelle: 'Évalue les voies aériennes (A)', ponderation: 3, type: 'obligatoire' },
          { id: 'eval-2', libelle: 'Évalue la respiration (B)', ponderation: 3, type: 'obligatoire' },
          { id: 'eval-3', libelle: 'Évalue la circulation (C)', ponderation: 3, type: 'obligatoire' },
          { id: 'eval-4', libelle: 'Évalue l\'état neurologique (D)', ponderation: 2, type: 'obligatoire' },
          { id: 'eval-5', libelle: 'Exposition et examen complet (E)', ponderation: 1, type: 'recommande' }
        ]
      },
      {
        id: 'gestes-urgence',
        nom: 'Gestes d\'Urgence',
        icone: '🚨',
        ponderationMax: 14,
        criteres: [
          { id: 'gest-1', libelle: 'Mise en position adaptée', ponderation: 2, type: 'obligatoire' },
          { id: 'gest-2', libelle: 'Pose d\'une voie veineuse périphérique', ponderation: 2, type: 'obligatoire' },
          { id: 'gest-3', libelle: 'Oxygénothérapie si nécessaire', ponderation: 2, type: 'obligatoire' },
          { id: 'gest-4', libelle: 'Monitoring adapté (scope, SpO2)', ponderation: 2, type: 'obligatoire' },
          { id: 'gest-5', libelle: 'Prélèvements biologiques urgents', ponderation: 2, type: 'recommande' },
          { id: 'gest-6', libelle: 'ECG si indication', ponderation: 2, type: 'obligatoire' },
          { id: 'gest-7', libelle: 'Glycémie capillaire', ponderation: 2, type: 'obligatoire' }
        ]
      },
      {
        id: 'raisonnement',
        nom: 'Raisonnement d\'Urgence',
        icone: '🧠',
        ponderationMax: 10,
        criteres: [
          { id: 'reas-1', libelle: 'Identifie la détresse vitale', ponderation: 4, type: 'obligatoire' },
          { id: 'reas-2', libelle: 'Hiérarchise les diagnostics urgents', ponderation: 3, type: 'obligatoire' },
          { id: 'reas-3', libelle: 'Demande les examens appropriés', ponderation: 3, type: 'obligatoire' }
        ]
      },
      {
        id: 'traitement',
        nom: 'Traitement d\'Urgence',
        icone: '💉',
        ponderationMax: 12,
        criteres: [
          { id: 'ttt-1', libelle: 'Remplissage vasculaire si choc', ponderation: 3, type: 'obligatoire' },
          { id: 'ttt-2', libelle: 'Traitement étiologique urgent', ponderation: 3, type: 'obligatoire' },
          { id: 'ttt-3', libelle: 'Analgésie adaptée', ponderation: 2, type: 'recommande' },
          { id: 'ttt-4', libelle: 'Prévention des complications', ponderation: 2, type: 'recommande' },
          { id: 'ttt-5', libelle: 'Appel renfort si nécessaire (SAMU, réa)', ponderation: 2, type: 'obligatoire' }
        ]
      },
      {
        id: 'organisation',
        nom: 'Organisation',
        icone: '📋',
        ponderationMax: 8,
        criteres: [
          { id: 'org-1', libelle: 'Communication claire avec l\'équipe', ponderation: 2, type: 'obligatoire' },
          { id: 'org-2', libelle: 'Transmission structurée (SBAR)', ponderation: 2, type: 'recommande' },
          { id: 'org-3', libelle: 'Documentation des actes', ponderation: 2, type: 'recommande' },
          { id: 'org-4', libelle: 'Information de la famille', ponderation: 2, type: 'recommande' }
        ]
      }
    ]
  }
};

// Props du composant
interface EcosUNESSGridProps {
  specialite: keyof typeof GRILLES_UNESS;
  scenarioTitle: string;
  onComplete?: (result: EvaluationResult) => void;
  onSave?: (draft: EvaluationDraft) => void;
}

interface EvaluationResult {
  score: number;
  maxScore: number;
  pourcentage: number;
  estValide: boolean;
  detailsCategories: {
    categorie: string;
    score: number;
    maxScore: number;
  }[];
  criteresValides: string[];
  commentaires: string;
}

interface EvaluationDraft {
  criteresCoches: Set<string>;
  commentaires: string;
  timestamp: Date;
}

export const EcosUNESSGrid = ({
  specialite,
  scenarioTitle,
  onComplete,
  onSave
}: EcosUNESSGridProps) => {
  const grille = GRILLES_UNESS[specialite] || GRILLES_UNESS.cardiologie;
  
  const [criteresCoches, setCriteresCoches] = useState<Set<string>>(new Set());
  const [commentaires, setCommentaires] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState(grille.categories[0].id);

  // Calcul du score
  const calculerScore = useCallback(() => {
    let scoreTotal = 0;
    let maxTotal = 0;
    const detailsCategories: EvaluationResult['detailsCategories'] = [];

    grille.categories.forEach(cat => {
      let scoreCat = 0;
      cat.criteres.forEach(crit => {
        if (criteresCoches.has(crit.id)) {
          scoreCat += crit.ponderation;
        }
      });
      scoreTotal += scoreCat;
      maxTotal += cat.ponderationMax;
      detailsCategories.push({
        categorie: cat.nom,
        score: scoreCat,
        maxScore: cat.ponderationMax
      });
    });

    const pourcentage = Math.round((scoreTotal / maxTotal) * 100);
    
    return {
      score: scoreTotal,
      maxScore: maxTotal,
      pourcentage,
      estValide: pourcentage >= grille.seuilValidation,
      detailsCategories,
      criteresValides: Array.from(criteresCoches),
      commentaires
    };
  }, [criteresCoches, commentaires, grille]);

  const resultat = calculerScore();

  const handleCheck = (criteriaId: string, checked: boolean) => {
    const newCoches = new Set(criteresCoches);
    if (checked) {
      newCoches.add(criteriaId);
    } else {
      newCoches.delete(criteriaId);
    }
    setCriteresCoches(newCoches);

    // Auto-save draft
    onSave?.({
      criteresCoches: newCoches,
      commentaires,
      timestamp: new Date()
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const result = calculerScore();
    onComplete?.(result);
    
    if (result.estValide) {
      toast.success(`Station validée avec ${result.pourcentage}% !`);
    } else {
      toast.warning(`Station non validée (${result.pourcentage}% < ${grille.seuilValidation}%)`);
    }
  };

  const getTypeColor = (type: UNESSCriterion['type']) => {
    switch (type) {
      case 'obligatoire': return 'text-destructive';
      case 'recommande': return 'text-warning';
      case 'optionnel': return 'text-muted-foreground';
    }
  };

  const getTypeLabel = (type: UNESSCriterion['type']) => {
    switch (type) {
      case 'obligatoire': return '* Obligatoire';
      case 'recommande': return 'Recommandé';
      case 'optionnel': return 'Optionnel';
    }
  };

  const getCategoryIcon = (icone: string) => {
    return <span className="text-lg">{icone}</span>;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 via-accent/5 to-warning/5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="flex items-center gap-2">
                Grille UNESS - {grille.specialite}
                <Badge variant="outline" className="ml-2">
                  {grille.dureeMinutes} min
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{scenarioTitle}</p>
            </div>
          </div>
          
          {/* Score en temps réel */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                resultat.pourcentage >= grille.seuilValidation ? 'text-success' : 'text-destructive'
              }`}>
                {resultat.score}/{resultat.maxScore}
              </div>
              <div className="text-sm text-muted-foreground">
                {resultat.pourcentage}% {resultat.estValide ? '✓' : '✗'}
              </div>
            </div>
            <Progress value={resultat.pourcentage} className="w-24 h-3" />
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            <span className="text-destructive">Obligatoire</span>
          </span>
          <span className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3 text-warning" />
            <span className="text-warning">Recommandé</span>
          </span>
          <span className="text-muted-foreground">
            Seuil validation: {grille.seuilValidation}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto flex-wrap">
            {grille.categories.map(cat => {
              const catScore = resultat.detailsCategories.find(d => d.categorie === cat.nom);
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(cat.icone)}
                    <span className="hidden sm:inline">{cat.nom}</span>
                    <Badge variant="secondary" className="text-xs">
                      {catScore?.score || 0}/{cat.ponderationMax}
                    </Badge>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {grille.categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="p-4 space-y-3">
              {cat.criteres.map(crit => (
                <label
                  key={crit.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    criteresCoches.has(crit.id)
                      ? 'bg-success/10 border-success/30'
                      : 'bg-muted/30 border-transparent hover:bg-muted/50'
                  } ${isSubmitted ? 'pointer-events-none opacity-75' : ''}`}
                >
                  <Checkbox
                    checked={criteresCoches.has(crit.id)}
                    onCheckedChange={(checked) => handleCheck(crit.id, checked as boolean)}
                    disabled={isSubmitted}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm">{crit.libelle}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs ${getTypeColor(crit.type)}`}>
                          {getTypeLabel(crit.type)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {crit.ponderation} pt{crit.ponderation > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    {crit.remarques && (
                      <p className="text-xs text-muted-foreground mt-1">{crit.remarques}</p>
                    )}
                  </div>
                  {criteresCoches.has(crit.id) && (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  )}
                </label>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Commentaires */}
        <div className="p-4 border-t">
          <label className="text-sm font-medium mb-2 block">
            Commentaires / Points d'amélioration
          </label>
          <Textarea
            value={commentaires}
            onChange={(e) => setCommentaires(e.target.value)}
            placeholder="Notez vos observations, points forts et axes d'amélioration..."
            rows={3}
            disabled={isSubmitted}
          />
        </div>

        {/* Boutons d'action */}
        <div className="p-4 border-t flex items-center justify-between gap-4">
          {!isSubmitted ? (
            <>
              <div className="text-sm text-muted-foreground">
                {criteresCoches.size} critères cochés sur{' '}
                {grille.categories.reduce((acc, cat) => acc + cat.criteres.length, 0)}
              </div>
              <Button onClick={handleSubmit} className="gap-2">
                <Award className="h-4 w-4" />
                Valider l'évaluation
              </Button>
            </>
          ) : (
            <div className={`w-full p-4 rounded-lg text-center ${
              resultat.estValide ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {resultat.estValide ? (
                <>
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                  <p className="font-semibold text-success">Station Validée !</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-destructive" />
                  <p className="font-semibold text-destructive">Station Non Validée</p>
                </>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Score final: {resultat.score}/{resultat.maxScore} ({resultat.pourcentage}%)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Export des grilles pour usage externe
export { GRILLES_UNESS };
export type { UNESSGrid, UNESSCategory, UNESSCriterion, EvaluationResult };
