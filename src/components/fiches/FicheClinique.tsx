import React from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Brain, 
  CheckCircle2, 
  ChevronRight, 
  Lightbulb, 
  ListOrdered,
  Mic,
  Target,
  XCircle,
  Stethoscope,
  ArrowDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface HypotheseDiagnostique {
  rang: 1 | 2 | 3;
  diagnostic: string;
  arguments: string[];
  examensCles?: string[];
}

export interface EtapeRaisonnement {
  numero: number;
  question: string;
  reponse: string;
  conclusion?: string;
}

export interface FicheCliniqueProp {
  /** Titre de la situation clinique */
  titre: string;
  /** Niveau D2/D3/D4 */
  niveau: "D2" | "D3" | "D4";
  /** Appareil concerné */
  appareil: string;
  /** Description du problème clinique central */
  problemeClinique: string;
  /** Présentation du cas (contexte patient) */
  presentation?: string;
  /** Hypothèses diagnostiques hiérarchisées */
  hypotheses: HypotheseDiagnostique[];
  /** Étapes du raisonnement clinique */
  raisonnement: EtapeRaisonnement[];
  /** Points clés à ne pas rater */
  pointsCles: string[];
  /** Pièges fréquents des externes */
  pieges: string[];
  /** Ce qui est attendu à l'oral EDN/ECOS */
  attenduOral: {
    formulation: string;
    motsClés: string[];
  };
  /** Items EDN associés */
  itemsEdn?: string[];
}

const getRangColor = (rang: 1 | 2 | 3) => {
  switch (rang) {
    case 1:
      return "bg-destructive/10 text-destructive border-destructive/30";
    case 2:
      return "bg-warning/10 text-warning border-warning/30";
    case 3:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getRangLabel = (rang: 1 | 2 | 3) => {
  switch (rang) {
    case 1:
      return "À éliminer en priorité";
    case 2:
      return "Probable";
    case 3:
      return "À évoquer";
  }
};

export const FicheClinique: React.FC<FicheCliniqueProp> = ({
  titre,
  niveau,
  appareil,
  problemeClinique,
  presentation,
  hypotheses,
  raisonnement,
  pointsCles,
  pieges,
  attenduOral,
  itemsEdn,
}) => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* En-tête */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{niveau}</Badge>
          <Badge variant="outline">{appareil}</Badge>
          {itemsEdn?.map((item) => (
            <Badge key={item} variant="outline" className="text-xs">
              {item}
            </Badge>
          ))}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{titre}</h1>
      </div>

      {/* Problème clinique central */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            Problème clinique central
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground font-medium leading-relaxed">
            {problemeClinique}
          </p>
          {presentation && (
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {presentation}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hypothèses diagnostiques hiérarchisées */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListOrdered className="w-5 h-5 text-primary" />
            Hypothèses diagnostiques hiérarchisées
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Du plus grave au plus probable — la logique avant la liste
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {hypotheses
            .sort((a, b) => a.rang - b.rang)
            .map((hypo, index) => (
              <motion.div
                key={hypo.diagnostic}
                className={cn(
                  "p-4 rounded-lg border",
                  getRangColor(hypo.rang)
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">#{hypo.rang}</span>
                    <span className="font-semibold">{hypo.diagnostic}</span>
                  </div>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {getRangLabel(hypo.rang)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Arguments :</p>
                  <ul className="text-sm space-y-1">
                    {hypo.arguments.map((arg, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                  {hypo.examensCles && hypo.examensCles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <p className="text-sm font-medium mb-1">Examens clés :</p>
                      <div className="flex flex-wrap gap-1">
                        {hypo.examensCles.map((exam) => (
                          <Badge key={exam} variant="secondary" className="text-xs">
                            {exam}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
        </CardContent>
      </Card>

      {/* Raisonnement clinique pas à pas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Raisonnement clinique pas à pas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Les questions qui guident la réflexion
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {raisonnement.map((etape, index) => (
              <React.Fragment key={etape.numero}>
                <motion.div
                  className="p-4 bg-muted/50 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {etape.numero}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-foreground">
                        {etape.question}
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {etape.reponse}
                      </p>
                      {etape.conclusion && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium mt-2">
                          <Lightbulb className="w-4 h-4" />
                          <span>{etape.conclusion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                {index < raisonnement.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points clés et Pièges - côte à côte */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Points clés */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Points clés à ne pas rater
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pointsCles.map((point, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-2 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{point}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pièges fréquents */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Pièges fréquents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pieges.map((piege, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-2 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{piege}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Attendu à l'oral */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="w-5 h-5 text-primary" />
            Ce qui est attendu à l'oral (EDN / ECOS)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            La formulation qui fait la différence
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background/80 rounded-lg border border-border">
            <p className="text-foreground leading-relaxed italic">
              "{attenduOral.formulation}"
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Mots-clés à placer :
            </p>
            <div className="flex flex-wrap gap-2">
              {attenduOral.motsClés.map((mot) => (
                <Badge 
                  key={mot} 
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {mot}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Med-MNG */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Fiche Med-MNG — Raisonner, pas réciter.
        </p>
      </div>
    </motion.div>
  );
};

export default FicheClinique;
