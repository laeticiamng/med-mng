import { CompetenceValidation } from '@/components/edn/CompetenceValidation';
import { CompetencesBadges } from '@/components/edn/CompetencesBadges';
import { EdnItemExport } from '@/components/edn/export/EdnItemExport';
import { PersonalNotes } from '@/components/edn/PersonalNotes';
import { QuizHistorySummary } from '@/components/edn/QuizHistorySummary';
import { FaqSection } from '@/components/help/FaqSection';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sceneImmersiveEstGenerique } from '@/utils/tableauTransformations';
import { BookOpen, Brain } from 'lucide-react';
import { useFicheItemEdn } from './EdnItemContext';
import { EdnItemSeo } from './EdnItemSeo';
import { useAccesPremium } from '@/hooks/useAccesPremium';

/** `/edn-complete/:slug/apercu` — ancien onglet « Aperçu » de la modale. */
export default function EdnItemApercu() {
  const {
    item,
    contenu,
    competencesRangA,
    competencesRangB,
    chargementRangA,
    chargementRangB,
  } = useFicheItemEdn();
  const { peutVoirItem } = useAccesPremium();

  return (
    <>
      <EdnItemSeo segment="apercu" />
      <div className="space-y-6">
        {/* Aperçu général */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Aperçu général - {item.item_code}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Contenu disponible</h4>
                <div className="space-y-2 flex flex-wrap gap-2">
                  {/* On se fie aux compétences OIC réellement chargées : c'est
                      exactement ce que les sous-pages Rang A / Rang B affichent. */}
                  {competencesRangA.length > 0 && (
                    <Badge className="bg-primary/10 text-primary">Rang A</Badge>
                  )}
                  {competencesRangB.length > 0 && (
                    <Badge className="bg-accent/10 text-accent">Rang B</Badge>
                  )}
                  {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                    <Badge className="bg-success/10 text-success">Paroles</Badge>
                  )}
                  {!sceneImmersiveEstGenerique(item.scene_immersive) && (
                    <Badge className="bg-success/10 text-success">Scène</Badge>
                  )}
                  {item.quiz_questions && (
                    <Badge className="bg-warning/10 text-warning">Quiz</Badge>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground text-sm">
                  {item.pitch_intro && !/^Excellence avec|fusionnées/i.test(item.pitch_intro)
                    ? item.pitch_intro
                    : `${competencesRangA.length + competencesRangB.length} compétences officielles (rang A : ${competencesRangA.length} · rang B : ${competencesRangB.length}), issues du référentiel national LiSA 2026 (UNESS).`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Données OIC complètes avec détails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Compétences du référentiel (source publique UNESS)</span>
              {(chargementRangA || chargementRangB) && (
                <span className="text-xs text-muted-foreground animate-pulse">Chargement...</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Rang A - Affichage complet */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Rang A - {competencesRangA.length} compétences
                </h4>
                {competencesRangA.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {competencesRangA.map((comp, idx) => (
                      <div key={idx} className="p-3 bg-background rounded-lg border border-primary/10 hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="outline" className="shrink-0 text-xs font-bold text-primary">
                            {comp.objectif_id}
                          </Badge>
                          {comp.rubrique && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              {comp.rubrique}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">{comp.intitule}</p>
                        {comp.description && comp.description !== comp.intitule && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{comp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{chargementRangA ? 'Chargement...' : 'Aucune compétence'}</p>
                )}
              </div>

              {/* Rang B - Affichage complet */}
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <h4 className="font-semibold mb-3 text-accent-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Rang B - {competencesRangB.length} compétences
                </h4>
                {competencesRangB.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {competencesRangB.map((comp, idx) => (
                      <div key={idx} className="p-3 bg-background rounded-lg border border-accent/10 hover:border-accent/30 transition-colors">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="outline" className="shrink-0 text-xs font-bold">
                            {comp.objectif_id}
                          </Badge>
                          {comp.rubrique && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              {comp.rubrique}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">{comp.intitule}</p>
                        {comp.description && comp.description !== comp.intitule && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{comp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{chargementRangB ? 'Chargement...' : 'Aucune compétence'}</p>
                )}
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <span className="font-bold text-lg">{competencesRangA.length + competencesRangB.length}</span>
              <span className="text-muted-foreground ml-2">compétences UNESS officielles</span>
            </div>
          </CardContent>
        </Card>

        {/* Validation complète des compétences */}
        <CompetenceValidation item={item} />

        {/* Export PDF — on passe les tableaux normalisés en sections : la modale
            transmettait la forme brute (objectifs / competences_cles), que
            l'export ne sait pas lire, et le PDF annonçait alors « Aucune
            compétence Rang A disponible ». */}
        <EdnItemExport
          itemCode={item.item_code}
          itemTitle={item.title}
          tableauRangA={contenu.tableau_rang_a}
          tableauRangB={contenu.tableau_rang_b}
          parolesRangA={peutVoirItem(item.item_code) ? contenu.paroles_rang_a : undefined}
          parolesRangB={peutVoirItem(item.item_code) ? contenu.paroles_rang_b : undefined}
        />

        {/* Notes personnelles */}
        <PersonalNotes itemCode={item.item_code} />

        {/* Historique des quiz */}
        <QuizHistorySummary itemCode={item.item_code} />

        {/* FAQ */}
        <FaqSection />

        {/* Badges de compétences — alimentés par les compétences OIC réellement
            chargées, pour ne pas contredire les sous-pages Rang A / Rang B. */}
        <CompetencesBadges
          item={item}
          competencesRangA={competencesRangA.length}
          competencesRangB={competencesRangB.length}
        />
      </div>
    </>
  );
}
