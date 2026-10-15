import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSRS } from '@/hooks/useSRS';
import { supabase } from '@/integrations/supabase/client';
import { enregistrerProgressionQuiz, type ClientProgression } from '@/lib/progressionQuiz';
import type { QuestionAffichee } from '@/data/quizMemorisation/types';
import {
  compterParRang,
  construireSerie,
  ecrireNotions,
  incrementerNombreSeries,
  lireNombreSeries,
  lireNotions,
  mettreAJourNotions,
  notionsConcernees,
  scoreSerie,
  stockageNavigateur,
  type RangMemo,
  type ResultatQuestion,
} from '@/utils/quizMemorisation';
import { Brain, CheckCircle2, ChevronRight, Eye, RotateCcw, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface QuizMemorisationProps {
  itemCode: string;
  itemTitle: string;
  questions: QuestionAffichee[];
  /** Pilote : bandeau « en cours de relecture médicale ». */
  pilote?: boolean;
}

type Phase =
  | { nom: 'accueil' }
  | { nom: 'serie'; rang: RangMemo; serie: QuestionAffichee[]; rejeu: boolean }
  | { nom: 'bilan'; rang: RangMemo; serie: QuestionAffichee[]; resultats: ResultatQuestion[]; rejeu: boolean };

const LIBELLE_RANG: Record<RangMemo, { titre: string; sous: string }> = {
  A: { titre: 'Les essentiels', sous: 'Rang A' },
  B: { titre: 'Pour aller plus loin', sous: 'Rang B' },
};

const LETTRES = ['A', 'B', 'C', 'D'] as const;

/**
 * Quiz de mémorisation d’un item : séries de 5 notions, une par écran, avec
 * correction immédiate et explication courte. Pas de chronomètre, pas de note
 * « d’examen » : on mesure ce qui est retenu et on remet au premier plan ce qui
 * ne l’est pas encore.
 */
export const QuizMemorisation: React.FC<QuizMemorisationProps> = ({ itemCode, itemTitle, questions, pilote = false }) => {
  const { recordReview } = useSRS();
  const stockage = useMemo(() => stockageNavigateur(), []);
  const [utilisateurId, setUtilisateurId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ nom: 'accueil' });
  const [notions, setNotions] = useState(() => lireNotions(stockage, null));
  const comptes = useMemo(() => compterParRang(questions), [questions]);

  // getSession() lit la session locale : fonctionne aussi hors connexion.
  useEffect(() => {
    let actif = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!actif) return;
      const id = data?.session?.user?.id ?? null;
      setUtilisateurId(id);
      setNotions(lireNotions(stockage, id));
    }).catch(() => undefined);
    return () => { actif = false; };
  }, [stockage]);

  const nbARevoir = notionsConcernees(notions, questions).length;

  const demarrer = (rang: RangMemo) => {
    const decalage = lireNombreSeries(stockage, utilisateurId, itemCode, rang);
    const serie = construireSerie({ questions, rang, aRevoir: notions, decalage });
    setPhase({ nom: 'serie', rang, serie, rejeu: false });
  };

  const terminerSerie = useCallback(
    async (rang: RangMemo, serie: QuestionAffichee[], resultats: ResultatQuestion[], rejeu: boolean) => {
      const suivantes = mettreAJourNotions(notions, resultats);
      setNotions(suivantes);
      ecrireNotions(stockage, utilisateurId, suivantes);
      setPhase({ nom: 'bilan', rang, serie, resultats, rejeu });
      if (rejeu) return;

      incrementerNombreSeries(stockage, utilisateurId, itemCode, rang);
      if (!utilisateurId) return;
      const { retenues, total, pourcentage } = scoreSerie(resultats);
      try {
        // Même enregistrement que le quiz « Reconnaître les compétences » : l’historique
        // et la répétition espacée de /edn-complete restent alimentés.
        const { error } = await supabase.from('quiz_results').insert({
          user_id: utilisateurId,
          item_code: itemCode,
          item_title: itemTitle,
          score: pourcentage,
          total_questions: total,
          correct_answers: retenues,
          wrong_answers: total - retenues,
          time_spent: 0,
          answers: { mode: 'memorisation', rang, notions: resultats.map(({ id, ok }) => ({ id, ok })) },
        });
        if (error) {
          console.error('Résultat de mémorisation non enregistré :', error);
          toast.error(
            typeof navigator !== 'undefined' && !navigator.onLine
              ? 'Résultat non enregistré : connexion interrompue. Refaites une série une fois reconnecté.'
              : 'Résultat non enregistré. Réessayez plus tard.',
          );
          return;
        }
        const progression = await enregistrerProgressionQuiz(supabase as unknown as ClientProgression, recordReview, {
          userId: utilisateurId,
          itemCode,
          pourcentage,
        });
        if (!progression.historique || progression.carte === false) {
          toast.error('Résultat enregistré, mais votre suivi de révision n’a pas pu être mis à jour.');
        }
      } catch (err) {
        // Une exception (réseau, session) ne doit ni bloquer le bilan ni passer sous silence.
        console.error('Enregistrement de la série de mémorisation impossible :', err);
        toast.error('Résultat non enregistré. Réessayez plus tard.');
      }
    },
    [itemCode, itemTitle, notions, recordReview, stockage, utilisateurId],
  );

  if (phase.nom === 'accueil') {
    const rangs = (['A', 'B'] as const).filter((r) => comptes[r] > 0);
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
            Mémoriser {itemCode}
          </CardTitle>
          <CardDescription>
            Quelques notions à rappeler de mémoire, une à la fois. Cinq questions, deux minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pilote && <BandeauPilote />}
          {rangs.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune question de mémorisation pour cet item pour le moment.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {rangs.map((rang) => (
              <Button
                key={rang}
                variant="outline"
                className="h-auto min-h-16 flex-col items-start gap-1 whitespace-normal p-4 text-left"
                onClick={() => demarrer(rang)}
              >
                <span className="text-base font-semibold">{LIBELLE_RANG[rang].titre}</span>
                <span className="text-xs text-muted-foreground">
                  {LIBELLE_RANG[rang].sous} · {Math.min(comptes[rang], 5)} questions
                </span>
              </Button>
            ))}
          </div>
          {nbARevoir > 0 && (
            <p className="text-sm text-muted-foreground" data-testid="memo-a-revoir">
              {nbARevoir} notion{nbARevoir > 1 ? 's' : ''} à revoir : {nbARevoir > 1 ? 'elles reviendront' : 'elle reviendra'} en premier.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (phase.nom === 'serie') {
    return (
      <Serie
        key={phase.serie.map((q) => q.id).join('|')}
        serie={phase.serie}
        pilote={pilote}
        onTerminee={(resultats) => terminerSerie(phase.rang, phase.serie, resultats, phase.rejeu)}
      />
    );
  }

  // Bilan
  const { retenues, total } = scoreSerie(phase.resultats);
  const ratees = phase.serie.filter((q) => phase.resultats.find((r) => r.id === q.id)?.ok === false);
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl" data-testid="memo-bilan">
          {retenues} notion{retenues > 1 ? 's' : ''} retenue{retenues > 1 ? 's' : ''} sur {total}
        </CardTitle>
        <CardDescription>
          {ratees.length === 0
            ? 'Tout est en place pour cette série.'
            : 'Les notions manquées reviendront en premier à la prochaine série.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratees.length > 0 && (
          <ul className="space-y-3" aria-label="Notions à revoir">
            {ratees.map((q) => (
              <li key={q.id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                <p className="font-medium">{q.question}</p>
                <p className="mt-1 text-foreground">
                  <span className="text-muted-foreground">Réponse : </span>
                  {q.type === 'qcm' ? q.options[q.indexCorrect] : q.reponse}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          {ratees.length > 0 && (
            <Button
              className="min-h-12"
              onClick={() => setPhase({ nom: 'serie', rang: phase.rang, serie: ratees, rejeu: true })}
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Revoir les notions manquées
            </Button>
          )}
          <Button className="min-h-12" variant={ratees.length > 0 ? 'outline' : 'default'} onClick={() => demarrer(phase.rang)}>
            Nouvelle série
          </Button>
          <Button className="min-h-12" variant="ghost" onClick={() => setPhase({ nom: 'accueil' })}>
            Retour
          </Button>
        </div>
        {!utilisateurId && (
          <p className="text-xs text-muted-foreground">Connectez-vous pour conserver votre progression sur tous vos appareils.</p>
        )}
      </CardContent>
    </Card>
  );
};

const BandeauPilote: React.FC = () => (
  <Badge variant="outline" className="whitespace-normal text-xs font-normal text-muted-foreground">
    Pilote — questions en cours de relecture médicale
  </Badge>
);

interface SerieProps {
  serie: QuestionAffichee[];
  pilote: boolean;
  onTerminee: (resultats: ResultatQuestion[]) => void;
}

const Serie: React.FC<SerieProps> = ({ serie, pilote, onTerminee }) => {
  const [indice, setIndice] = useState(0);
  const [resultats, setResultats] = useState<ResultatQuestion[]>([]);
  // QCM : option choisie. Rappel : réponse affichée (true) avant auto-évaluation.
  const [choix, setChoix] = useState<number | null>(null);
  const [reponseVue, setReponseVue] = useState(false);
  const boutonSuivant = useRef<HTMLButtonElement>(null);

  const question = serie[indice];
  const dernier = indice === serie.length - 1;
  const repondue = question.type === 'qcm' ? choix !== null : reponseVue;

  useEffect(() => {
    if (question.type === 'qcm' && choix !== null) boutonSuivant.current?.focus();
  }, [choix, question.type]);

  const passer = (ok: boolean) => {
    const maj = [...resultats, { id: question.id, ok }];
    setResultats(maj);
    if (dernier) {
      onTerminee(maj);
      return;
    }
    setIndice(indice + 1);
    setChoix(null);
    setReponseVue(false);
  };

  const repondreQcm = (i: number) => {
    if (choix === null) setChoix(i);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{LIBELLE_RANG[question.rang].sous}</span>
          <span aria-live="polite">{indice + 1} / {serie.length}</span>
        </div>
        <Progress value={((indice + (repondue ? 1 : 0)) / serie.length) * 100} className="h-1.5" aria-label="Avancement de la série" />
        {pilote && <BandeauPilote />}
      </CardHeader>
      <CardContent className="space-y-5">
        <h3 className="text-lg font-semibold leading-snug" id={`memo-q-${question.id}`}>{question.question}</h3>

        {question.type === 'qcm' ? (
          <div role="group" aria-labelledby={`memo-q-${question.id}`} className="space-y-2">
            {question.options.map((option, i) => {
              const estBonne = i === question.indexCorrect;
              const estChoisie = choix === i;
              const etat = choix === null ? 'neutre' : estBonne ? 'bonne' : estChoisie ? 'fausse' : 'inactive';
              return (
                <button
                  key={option}
                  type="button"
                  disabled={choix !== null}
                  onClick={() => repondreQcm(i)}
                  data-etat={etat}
                  className={[
                    'flex min-h-12 w-full items-start gap-3 rounded-lg border p-3 text-left text-base transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    etat === 'neutre' ? 'hover:bg-muted/50 active:bg-muted' : '',
                    etat === 'bonne' ? 'border-success bg-success/10' : '',
                    etat === 'fausse' ? 'border-destructive bg-destructive/10' : '',
                    etat === 'inactive' ? 'opacity-60' : '',
                  ].join(' ')}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium" aria-hidden="true">
                    {etat === 'bonne' ? <CheckCircle2 className="h-5 w-5 text-success" /> : etat === 'fausse' ? <XCircle className="h-5 w-5 text-destructive" /> : LETTRES[i]}
                  </span>
                  <span className="flex-1">
                    {option}
                    {etat === 'bonne' && <span className="sr-only"> — bonne réponse</span>}
                    {etat === 'fausse' && <span className="sr-only"> — votre réponse, incorrecte</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          !reponseVue && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Formulez la réponse dans votre tête, puis vérifiez.</p>
              <Button className="min-h-12 w-full" variant="outline" onClick={() => setReponseVue(true)}>
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                Afficher la réponse
              </Button>
            </div>
          )
        )}

        {repondue && (
          <div aria-live="polite" className="space-y-3">
            {question.type === 'rappel' && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Réponse</p>
                <p className="mt-1 text-base font-medium">{question.reponse}</p>
              </div>
            )}
            <p className="rounded-lg bg-muted/50 p-3 text-sm" data-testid="memo-explication">{question.explication}</p>

            {question.type === 'qcm' ? (
              <Button ref={boutonSuivant} className="min-h-12 w-full" onClick={() => passer(choix === question.indexCorrect)}>
                {dernier ? 'Voir le bilan' : 'Suivant'}
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button className="min-h-12" variant="outline" onClick={() => passer(false)}>À revoir</Button>
                <Button className="min-h-12" onClick={() => passer(true)}>Je le savais</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
