import { CompetenceValidation } from '@/components/edn/CompetenceValidation';
import { PersonalNotes } from '@/components/edn/PersonalNotes';
import { ProgressHeatmap } from '@/components/edn/quiz/ProgressHeatmap';
import { QuizProgressChart } from '@/components/edn/quiz/QuizProgressChart';
import { QuizHistorySummary } from '@/components/edn/QuizHistorySummary';
import { QuizLeaderboard } from '@/components/edn/QuizLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';

/** `/edn-complete/:slug/stats` — ancien onglet « Stats » de la modale. */
export default function EdnItemStats() {
  const { item, competencesRangA, competencesRangB, contenuVerrouille } = useFicheItemEdn();

  return (
    <>
      <EdnItemSeo segment="stats" />
      <div className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Statistiques - {item.item_code}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Décompte des compétences */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-3xl font-bold text-primary">{competencesRangA.length}</div>
                <div className="text-sm text-muted-foreground">Rang A</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="text-3xl font-bold text-accent-foreground">{competencesRangB.length}</div>
                <div className="text-sm text-muted-foreground">Rang B</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="text-3xl font-bold text-success">{competencesRangA.length + competencesRangB.length}</div>
                <div className="text-sm text-muted-foreground">Total OIC</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
                {/* Les paroles viennent de la RPC de contenu immersif : pour un
                    item verrouillé, on indique « Premium » et non « absent ». */}
                <div className={`font-bold text-warning ${contenuVerrouille ? 'text-base leading-9' : 'text-3xl'}`}>
                  {contenuVerrouille ? 'Premium' : item.paroles_musicales?.length ? '✓' : '○'}
                </div>
                <div className="text-sm text-muted-foreground">Musique</div>
              </div>
            </div>

            {/* Détail des compétences */}
            {(competencesRangA.length > 0 || competencesRangB.length > 0) && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Détail des compétences UNESS</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {competencesRangA.slice(0, 5).map((comp, idx) => (
                    <div key={`a-${idx}`} className="flex items-start gap-2 p-2 bg-primary/5 rounded text-sm">
                      <span className="font-mono text-primary text-xs">{comp.objectif_id}</span>
                      <span className="text-foreground">{comp.intitule?.substring(0, 80)}...</span>
                    </div>
                  ))}
                  {competencesRangB.slice(0, 5).map((comp, idx) => (
                    <div key={`b-${idx}`} className="flex items-start gap-2 p-2 bg-accent/5 rounded text-sm">
                      <span className="font-mono text-accent-foreground text-xs">{comp.objectif_id}</span>
                      <span className="text-foreground">{comp.intitule?.substring(0, 80)}...</span>
                    </div>
                  ))}
                  {(competencesRangA.length > 5 || competencesRangB.length > 5) && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{Math.max(0, competencesRangA.length - 5) + Math.max(0, competencesRangB.length - 5)} autres compétences
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Historique des quiz + progression */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuizHistorySummary itemCode={item.item_code} />
              <QuizProgressChart itemCode={item.item_code} />
            </div>

            {/* Heatmap d'activité */}
            <ProgressHeatmap itemCode={item.item_code} days={28} />

            {/* Validation des compétences */}
            <CompetenceValidation item={item} contenuVerrouille={contenuVerrouille} />

            {/* Classement */}
            <QuizLeaderboard itemCode={item.item_code} limit={5} />
          </CardContent>
        </Card>

        {/* Notes personnelles */}
        <PersonalNotes itemCode={item.item_code} />
      </div>
    </>
  );
}
