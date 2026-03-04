import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DuelStatus = 'idle' | 'searching' | 'matched' | 'countdown' | 'playing' | 'finished';

interface DuelRound {
  id: string;
  round_number: number;
  question: string;
  options: string[];
  correct_answer: number;
  item_code: string | null;
  time_limit_seconds: number;
}

interface DuelPlayer {
  id: string;
  name: string;
  score: number;
}

interface DuelState {
  duelId: string | null;
  status: DuelStatus;
  currentRound: number;
  totalRounds: number;
  rounds: DuelRound[];
  player: DuelPlayer;
  opponent: DuelPlayer;
  countdown: number;
  roundTimeLeft: number;
  myAnswer: number | null;
  opponentAnswered: boolean;
  winnerId: string | null;
}

const SAMPLE_QUESTIONS = [
  { question: "Quel est le signe ECG typique d'un infarctus ST+ ?", options: ["Sus-décalage ST", "Sous-décalage ST", "Onde Q pathologique", "Bloc de branche"], correct: 0, item_code: "IC-228" },
  { question: "Quelle est la triade de Virchow ?", options: ["Stase, lésion endothéliale, hypercoagulabilité", "Fièvre, tachycardie, hypotension", "Douleur, rougeur, chaleur", "Dyspnée, douleur thoracique, hémoptysie"], correct: 0, item_code: "IC-224" },
  { question: "Quel médicament est le traitement de première intention de l'insuffisance cardiaque à FEVG altérée ?", options: ["Bêta-bloquant", "IEC/ARA2", "Diurétique de l'anse", "Digitalique"], correct: 1, item_code: "IC-232" },
  { question: "Quelle est la complication la plus grave d'une fibrillation atriale ?", options: ["AVC ischémique", "Insuffisance cardiaque", "Syncope", "Mort subite"], correct: 0, item_code: "IC-230" },
  { question: "Quel score évalue le risque thromboembolique dans la FA ?", options: ["CHA2DS2-VASc", "GRACE", "Wells", "Geneva"], correct: 0, item_code: "IC-230" },
  { question: "Quel est le traitement d'urgence d'un choc anaphylactique ?", options: ["Adrénaline IM", "Corticoïdes IV", "Antihistaminiques", "Remplissage vasculaire"], correct: 0, item_code: "IC-332" },
  { question: "Quelle est la cause la plus fréquente de méningite bactérienne chez l'adulte ?", options: ["Streptococcus pneumoniae", "Neisseria meningitidis", "Listeria monocytogenes", "Haemophilus influenzae"], correct: 0, item_code: "IC-148" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useDuel() {
  const { toast } = useToast();
  const [state, setState] = useState<DuelState>({
    duelId: null,
    status: 'idle',
    currentRound: 0,
    totalRounds: 5,
    rounds: [],
    player: { id: '', name: 'Toi', score: 0 },
    opponent: { id: '', name: 'Adversaire', score: 0 },
    countdown: 3,
    roundTimeLeft: 15,
    myAnswer: null,
    opponentAnswered: false,
    winnerId: null,
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const searchForDuel = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour lancer un duel.", variant: "destructive" });
      return;
    }

    setState(s => ({ ...s, status: 'searching', player: { ...s.player, id: user.id } }));

    // Look for a waiting duel
    const { data: waitingDuels } = await supabase
      .from('karaoke_duels')
      .select('*')
      .eq('status', 'waiting')
      .neq('player1_id', user.id)
      .limit(1);

    if (waitingDuels && waitingDuels.length > 0) {
      const duel = waitingDuels[0];
      // Join existing duel
      await supabase
        .from('karaoke_duels')
        .update({ player2_id: user.id, status: 'matched', started_at: new Date().toISOString() })
        .eq('id', duel.id);

      startDuelSession(duel.id, user.id, duel.player1_id, false);
    } else {
      // Create new duel
      const { data: newDuel, error } = await supabase
        .from('karaoke_duels')
        .insert({ player1_id: user.id, status: 'waiting', round_count: 5 })
        .select('id')
        .single();

      if (error || !newDuel) {
        toast({ title: "Erreur", description: "Impossible de créer le duel.", variant: "destructive" });
        setState(s => ({ ...s, status: 'idle' }));
        return;
      }

      // Subscribe for opponent joining
      const channel = supabase.channel(`duel-${newDuel.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'karaoke_duels',
          filter: `id=eq.${newDuel.id}`,
        }, (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'matched' && updated.player2_id) {
            startDuelSession(newDuel.id, user.id, updated.player2_id, true);
          }
        })
        .subscribe();

      channelRef.current = channel;
      setState(s => ({ ...s, duelId: newDuel.id }));
    }
  }, [toast]);

  const startDuelSession = useCallback(async (duelId: string, myId: string, opponentId: string, isHost: boolean) => {
    // Get opponent profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', opponentId)
      .single();

    const opponentName = profile?.name || 'Adversaire';

    // Generate rounds (host creates them)
    const questions = shuffleArray(SAMPLE_QUESTIONS).slice(0, 5);
    
    if (isHost) {
      const roundsToInsert = questions.map((q, i) => ({
        duel_id: duelId,
        round_number: i + 1,
        question: q.question,
        options: q.options,
        correct_answer: q.correct,
        item_code: q.item_code,
      }));
      
      await supabase.from('duel_rounds').insert(roundsToInsert);
    }

    // Fetch rounds
    await new Promise(r => setTimeout(r, 500)); // small delay for host insert
    const { data: rounds } = await supabase
      .from('duel_rounds')
      .select('*')
      .eq('duel_id', duelId)
      .order('round_number');

    const mappedRounds: DuelRound[] = (rounds || []).map(r => ({
      id: r.id,
      round_number: r.round_number,
      question: r.question,
      options: Array.isArray(r.options) ? r.options as string[] : [],
      correct_answer: r.correct_answer,
      item_code: r.item_code,
      time_limit_seconds: r.time_limit_seconds,
    }));

    setState(s => ({
      ...s,
      duelId,
      status: 'countdown',
      rounds: mappedRounds,
      totalRounds: mappedRounds.length || 5,
      opponent: { id: opponentId, name: opponentName, score: 0 },
      player: { ...s.player, id: myId },
      countdown: 3,
    }));

    // Listen for opponent answers
    const answerChannel = supabase.channel(`duel-answers-${duelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'duel_answers',
        filter: `duel_id=eq.${duelId}`,
      }, (payload) => {
        const answer = payload.new as any;
        if (answer.user_id !== myId) {
          setState(s => ({
            ...s,
            opponentAnswered: true,
            opponent: { ...s.opponent, score: s.opponent.score + (answer.points_earned || 0) },
          }));
        }
      })
      .subscribe();

    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = answerChannel;

    // Countdown
    let count = 3;
    const countdownTimer = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownTimer);
        setState(s => ({ ...s, status: 'playing', currentRound: 1, roundTimeLeft: 15, myAnswer: null, opponentAnswered: false }));
        startRoundTimer();
      } else {
        setState(s => ({ ...s, countdown: count }));
      }
    }, 1000);
    timerRef.current = countdownTimer;
  }, []);

  const startRoundTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    let timeLeft = 15;
    timerRef.current = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerRef.current!);
        // Auto-submit no answer
        setState(s => {
          if (s.myAnswer === null) {
            submitAnswer(-1);
          }
          return { ...s, roundTimeLeft: 0 };
        });
      } else {
        setState(s => ({ ...s, roundTimeLeft: timeLeft }));
      }
    }, 1000);
  }, []);

  const submitAnswer = useCallback(async (answerIndex: number) => {
    setState(s => {
      if (s.myAnswer !== null) return s; // Already answered
      
      const round = s.rounds[s.currentRound - 1];
      if (!round) return s;

      const isCorrect = answerIndex === round.correct_answer;
      const timeBonus = Math.max(0, s.roundTimeLeft * 10);
      const points = isCorrect ? 100 + timeBonus : 0;

      // Insert answer async
      supabase.from('duel_answers').insert({
        duel_id: s.duelId!,
        round_id: round.id,
        user_id: s.player.id,
        selected_answer: answerIndex,
        is_correct: isCorrect,
        answer_time_ms: (15 - s.roundTimeLeft) * 1000,
        points_earned: points,
      });

      return {
        ...s,
        myAnswer: answerIndex,
        player: { ...s.player, score: s.player.score + points },
      };
    });

    // Wait 2s then advance round
    setTimeout(() => {
      setState(s => {
        const nextRound = s.currentRound + 1;
        if (nextRound > s.totalRounds) {
          // Duel finished
          if (timerRef.current) clearInterval(timerRef.current);
          const winnerId = s.player.score > s.opponent.score ? s.player.id : 
                          s.opponent.score > s.player.score ? s.opponent.id : null;
          
          // Update duel in DB
          supabase.from('karaoke_duels').update({
            status: 'finished',
            player1_score: s.player.score,
            player2_score: s.opponent.score,
            winner_id: winnerId,
            finished_at: new Date().toISOString(),
          }).eq('id', s.duelId!);

          return { ...s, status: 'finished', winnerId };
        }
        return { ...s, currentRound: nextRound, myAnswer: null, opponentAnswered: false, roundTimeLeft: 15 };
      });
      startRoundTimer();
    }, 2000);
  }, [startRoundTimer]);

  const cancelSearch = useCallback(async () => {
    if (state.duelId) {
      await supabase.from('karaoke_duels').update({ status: 'cancelled' }).eq('id', state.duelId);
    }
    cleanup();
    setState(s => ({ ...s, status: 'idle', duelId: null }));
  }, [state.duelId, cleanup]);

  const resetDuel = useCallback(() => {
    cleanup();
    setState({
      duelId: null,
      status: 'idle',
      currentRound: 0,
      totalRounds: 5,
      rounds: [],
      player: { id: '', name: 'Toi', score: 0 },
      opponent: { id: '', name: 'Adversaire', score: 0 },
      countdown: 3,
      roundTimeLeft: 15,
      myAnswer: null,
      opponentAnswered: false,
      winnerId: null,
    });
  }, [cleanup]);

  return {
    ...state,
    searchForDuel,
    submitAnswer,
    cancelSearch,
    resetDuel,
  };
}
