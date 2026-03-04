import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DuelStatus = 'idle' | 'searching' | 'matched' | 'countdown' | 'playing' | 'round_result' | 'finished';
export type DuelMode = 'online' | 'solo';

interface DuelRound {
  id: string;
  round_number: number;
  question: string;
  options: string[];
  correct_answer: number;
  item_code: string | null;
  time_limit_seconds: number;
  type: 'qcm' | 'fill_blank';
  lyrics_line?: string;
  blank_answer?: string;
}

interface DuelPlayer {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  streak: number;
}

export interface DuelState {
  duelId: string | null;
  mode: DuelMode;
  status: DuelStatus;
  currentRound: number;
  totalRounds: number;
  rounds: DuelRound[];
  player: DuelPlayer;
  opponent: DuelPlayer;
  countdown: number;
  roundTimeLeft: number;
  myAnswer: number | null;
  myTextAnswer: string;
  opponentAnswered: boolean;
  winnerId: string | null;
  roundResults: Array<{ round: number; correct: boolean; points: number; opponentCorrect: boolean; opponentPoints: number }>;
}

// Expanded question bank with medical lyrics fill-in-the-blank
const MEDICAL_QUESTIONS = [
  // QCM Questions
  { type: 'qcm' as const, question: "Quel est le signe ECG typique d'un infarctus ST+ ?", options: ["Sus-décalage ST", "Sous-décalage ST", "Onde Q pathologique", "Bloc de branche"], correct: 0, item_code: "IC-228" },
  { type: 'qcm' as const, question: "Quelle est la triade de Virchow ?", options: ["Stase, lésion endothéliale, hypercoagulabilité", "Fièvre, tachycardie, hypotension", "Douleur, rougeur, chaleur", "Dyspnée, douleur thoracique, hémoptysie"], correct: 0, item_code: "IC-224" },
  { type: 'qcm' as const, question: "Quel médicament en 1ère intention dans l'IC à FEVG altérée ?", options: ["Bêta-bloquant", "IEC/ARA2", "Diurétique de l'anse", "Digitalique"], correct: 1, item_code: "IC-232" },
  { type: 'qcm' as const, question: "Quelle complication la plus grave de la FA ?", options: ["AVC ischémique", "Insuffisance cardiaque", "Syncope", "Mort subite"], correct: 0, item_code: "IC-230" },
  { type: 'qcm' as const, question: "Quel score évalue le risque thromboembolique dans la FA ?", options: ["CHA2DS2-VASc", "GRACE", "Wells", "Geneva"], correct: 0, item_code: "IC-230" },
  { type: 'qcm' as const, question: "Traitement d'urgence du choc anaphylactique ?", options: ["Adrénaline IM", "Corticoïdes IV", "Antihistaminiques", "Remplissage"], correct: 0, item_code: "IC-332" },
  { type: 'qcm' as const, question: "Cause la plus fréquente de méningite bactérienne adulte ?", options: ["S. pneumoniae", "N. meningitidis", "Listeria", "H. influenzae"], correct: 0, item_code: "IC-148" },
  { type: 'qcm' as const, question: "Quel marqueur biologique pour l'embolie pulmonaire ?", options: ["D-dimères", "Troponine", "BNP", "CRP"], correct: 0, item_code: "IC-224" },
  { type: 'qcm' as const, question: "Classification de Killip dans l'insuffisance cardiaque aiguë ?", options: ["4 stades de gravité clinique", "Fraction d'éjection", "Pression artérielle", "Score pronostique"], correct: 0, item_code: "IC-232" },
  { type: 'qcm' as const, question: "Quel examen confirme une dissection aortique ?", options: ["Angio-scanner thoracique", "ECG", "Radiographie thoracique", "Échographie transthoracique"], correct: 0, item_code: "IC-223" },

  // Lyrics Fill-in-the-blank (medical mnemonics as song lyrics)
  { type: 'fill_blank' as const, question: "Complète les paroles :", lyrics_line: "Le cœur qui bat trop vite, c'est la ___", blank_answer: "tachycardie", options: ["tachycardie", "bradycardie", "arythmie", "fibrillation"], correct: 0, item_code: "IC-230" },
  { type: 'fill_blank' as const, question: "Complète les paroles :", lyrics_line: "Sus-décalage ST, c'est l'infarctus qui ___", blank_answer: "frappe", options: ["frappe", "menace", "s'installe", "progresse"], correct: 0, item_code: "IC-228" },
  { type: 'fill_blank' as const, question: "Complète les paroles :", lyrics_line: "La douleur thoracique irradie au bras ___, signe classique", blank_answer: "gauche", options: ["gauche", "droit", "bilatéral", "cervical"], correct: 0, item_code: "IC-228" },
  { type: 'fill_blank' as const, question: "Complète les paroles :", lyrics_line: "Trois signes de la méningite : raideur, ___, Brudzinski", blank_answer: "Kernig", options: ["Kernig", "Babinski", "Romberg", "Lasègue"], correct: 0, item_code: "IC-148" },
  { type: 'fill_blank' as const, question: "Complète les paroles :", lyrics_line: "Devant un souffle systolique, pense au ___ aortique", blank_answer: "rétrécissement", options: ["rétrécissement", "prolapsus", "anévrysme", "dissection"], correct: 0, item_code: "IC-231" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Bot names for solo mode
const BOT_NAMES = ['Dr. Quiz', 'MedBot', 'Interne IA', 'Dr. Challenge', 'Prof. Duel'];

function createInitialState(): DuelState {
  return {
    duelId: null,
    mode: 'online',
    status: 'idle',
    currentRound: 0,
    totalRounds: 5,
    rounds: [],
    player: { id: '', name: 'Toi', score: 0, streak: 0 },
    opponent: { id: '', name: 'Adversaire', score: 0, streak: 0 },
    countdown: 3,
    roundTimeLeft: 15,
    myAnswer: null,
    myTextAnswer: '',
    opponentAnswered: false,
    winnerId: null,
    roundResults: [],
  };
}

export function useDuel() {
  const { toast } = useToast();
  const [state, setState] = useState<DuelState>(createInitialState());
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // Generate rounds from question bank
  const generateRounds = useCallback((count: number): DuelRound[] => {
    const selected = shuffleArray(MEDICAL_QUESTIONS).slice(0, count);
    return selected.map((q, i) => ({
      id: `local-${i}`,
      round_number: i + 1,
      question: q.question,
      options: q.options,
      correct_answer: q.correct,
      item_code: q.item_code,
      time_limit_seconds: q.type === 'fill_blank' ? 20 : 15,
      type: q.type,
      lyrics_line: q.type === 'fill_blank' ? q.lyrics_line : undefined,
      blank_answer: q.type === 'fill_blank' ? q.blank_answer : undefined,
    }));
  }, []);

  // ===== SOLO MODE =====
  const startSoloDuel = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const myId = user?.id || 'anonymous';
    const myName = 'Toi';
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const rounds = generateRounds(5);

    setState(s => ({
      ...createInitialState(),
      mode: 'solo',
      duelId: `solo-${Date.now()}`,
      status: 'countdown',
      rounds,
      totalRounds: rounds.length,
      player: { id: myId, name: myName, score: 0, streak: 0 },
      opponent: { id: 'bot', name: botName, score: 0, streak: 0 },
      countdown: 3,
    }));

    // Countdown
    let count = 3;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timerRef.current!);
        setState(s => ({ ...s, status: 'playing', currentRound: 1, roundTimeLeft: s.rounds[0]?.time_limit_seconds || 15, myAnswer: null, myTextAnswer: '', opponentAnswered: false }));
        startRoundTimer();
      } else {
        setState(s => ({ ...s, countdown: count }));
      }
    }, 1000);
  }, [generateRounds]);

  // ===== ONLINE MODE =====
  const searchForDuel = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour lancer un duel en ligne.", variant: "destructive" });
      return;
    }

    setState(s => ({ ...createInitialState(), mode: 'online', status: 'searching', player: { id: user.id, name: 'Toi', score: 0, streak: 0 } }));

    // Look for a waiting duel
    const { data: waitingDuels } = await supabase
      .from('karaoke_duels')
      .select('*')
      .eq('status', 'waiting')
      .neq('player1_id', user.id)
      .limit(1);

    if (waitingDuels && waitingDuels.length > 0) {
      const duel = waitingDuels[0];
      await supabase
        .from('karaoke_duels')
        .update({ player2_id: user.id, status: 'matched', started_at: new Date().toISOString() })
        .eq('id', duel.id);

      startOnlineSession(duel.id, user.id, duel.player1_id, false);
    } else {
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

      const channel = supabase.channel(`duel-${newDuel.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'karaoke_duels',
          filter: `id=eq.${newDuel.id}`,
        }, (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'matched' && updated.player2_id) {
            startOnlineSession(newDuel.id, user.id, updated.player2_id, true);
          }
        })
        .subscribe();

      channelRef.current = channel;
      setState(s => ({ ...s, duelId: newDuel.id }));
    }
  }, [toast]);

  const startOnlineSession = useCallback(async (duelId: string, myId: string, opponentId: string, isHost: boolean) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', opponentId)
      .single();

    const opponentName = profile?.name || 'Adversaire';
    const rounds = generateRounds(5);

    if (isHost) {
      const roundsToInsert = rounds.map((r) => ({
        duel_id: duelId,
        round_number: r.round_number,
        question: r.question,
        options: r.options as any,
        correct_answer: r.correct_answer,
        item_code: r.item_code,
        time_limit_seconds: r.time_limit_seconds,
      }));
      await supabase.from('duel_rounds').insert(roundsToInsert);
    }

    // Fetch rounds from DB for sync
    await new Promise(r => setTimeout(r, 800));
    const { data: dbRounds } = await supabase
      .from('duel_rounds')
      .select('*')
      .eq('duel_id', duelId)
      .order('round_number');

    const mappedRounds: DuelRound[] = (dbRounds || []).map(r => ({
      id: r.id,
      round_number: r.round_number,
      question: r.question,
      options: Array.isArray(r.options) ? r.options as string[] : [],
      correct_answer: r.correct_answer,
      item_code: r.item_code,
      time_limit_seconds: r.time_limit_seconds,
      type: (r.question as string).startsWith('Complète') ? 'fill_blank' as const : 'qcm' as const,
    }));

    setState(s => ({
      ...s,
      duelId,
      status: 'countdown',
      rounds: mappedRounds.length > 0 ? mappedRounds : rounds,
      totalRounds: (mappedRounds.length > 0 ? mappedRounds : rounds).length,
      opponent: { id: opponentId, name: opponentName, score: 0, streak: 0 },
      player: { ...s.player, id: myId },
      countdown: 3,
    }));

    // Listen for opponent answers via Realtime
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
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timerRef.current!);
        setState(s => ({ ...s, status: 'playing', currentRound: 1, roundTimeLeft: s.rounds[0]?.time_limit_seconds || 15, myAnswer: null, myTextAnswer: '', opponentAnswered: false }));
        startRoundTimer();
      } else {
        setState(s => ({ ...s, countdown: count }));
      }
    }, 1000);
  }, [generateRounds]);

  const startRoundTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const s = stateRef.current;
    const round = s.rounds[s.currentRound > 0 ? s.currentRound - 1 : 0];
    let timeLeft = round?.time_limit_seconds || 15;
    
    timerRef.current = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        // Auto-submit timeout
        if (stateRef.current.myAnswer === null) {
          doSubmitAnswer(-1);
        }
        setState(s => ({ ...s, roundTimeLeft: 0 }));
      } else {
        setState(s => ({ ...s, roundTimeLeft: timeLeft }));
      }
    }, 1000);
  }, []);

  const doSubmitAnswer = useCallback((answerIndex: number) => {
    setState(s => {
      if (s.myAnswer !== null) return s;
      
      const round = s.rounds[s.currentRound - 1];
      if (!round) return s;

      const isCorrect = answerIndex === round.correct_answer;
      const timeBonus = Math.max(0, s.roundTimeLeft * 10);
      const basePoints = isCorrect ? 100 : 0;
      const streakBonus = isCorrect && s.player.streak >= 2 ? s.player.streak * 15 : 0;
      const points = basePoints + (isCorrect ? timeBonus : 0) + streakBonus;
      const newStreak = isCorrect ? s.player.streak + 1 : 0;

      // Bot answer for solo mode
      let botCorrect = false;
      let botPoints = 0;
      if (s.mode === 'solo') {
        // Bot has ~60% accuracy, random response time
        botCorrect = Math.random() < 0.6;
        const botTimeBonus = Math.floor(Math.random() * 100);
        botPoints = botCorrect ? 100 + botTimeBonus : 0;
      }

      // Insert answer to DB for online mode
      if (s.mode === 'online' && s.duelId && !s.duelId.startsWith('solo-')) {
        supabase.from('duel_answers').insert({
          duel_id: s.duelId,
          round_id: round.id,
          user_id: s.player.id,
          selected_answer: answerIndex,
          is_correct: isCorrect,
          answer_time_ms: ((round.time_limit_seconds || 15) - s.roundTimeLeft) * 1000,
          points_earned: points,
        });
      }

      const roundResult = {
        round: s.currentRound,
        correct: isCorrect,
        points,
        opponentCorrect: botCorrect,
        opponentPoints: botPoints,
      };

      return {
        ...s,
        myAnswer: answerIndex,
        player: { ...s.player, score: s.player.score + points, streak: newStreak },
        opponent: s.mode === 'solo' 
          ? { ...s.opponent, score: s.opponent.score + botPoints, streak: botCorrect ? s.opponent.streak + 1 : 0 }
          : s.opponent,
        opponentAnswered: s.mode === 'solo' ? true : s.opponentAnswered,
        roundResults: [...s.roundResults, roundResult],
      };
    });

    // Show round result then advance
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setTimeout(() => {
      setState(s => ({ ...s, status: 'round_result' }));
    }, 300);

    setTimeout(() => {
      setState(s => {
        const nextRound = s.currentRound + 1;
        if (nextRound > s.totalRounds) {
          const winnerId = s.player.score > s.opponent.score ? s.player.id : 
                          s.opponent.score > s.player.score ? s.opponent.id : null;
          
          // Update DB for online mode
          if (s.mode === 'online' && s.duelId && !s.duelId.startsWith('solo-')) {
            supabase.from('karaoke_duels').update({
              status: 'finished',
              player1_score: s.player.score,
              player2_score: s.opponent.score,
              winner_id: winnerId,
              finished_at: new Date().toISOString(),
            }).eq('id', s.duelId);
          }

          return { ...s, status: 'finished' as const, winnerId, currentRound: s.currentRound };
        }

        const nextRoundData = s.rounds[nextRound - 1];
        return {
          ...s,
          status: 'playing' as const,
          currentRound: nextRound,
          myAnswer: null,
          myTextAnswer: '',
          opponentAnswered: false,
          roundTimeLeft: nextRoundData?.time_limit_seconds || 15,
        };
      });

      // Start timer for next round if not finished
      setTimeout(() => {
        if (stateRef.current.status === 'playing') {
          startRoundTimer();
        }
      }, 100);
    }, 2500);
  }, [startRoundTimer]);

  const submitAnswer = useCallback((answerIndex: number) => {
    doSubmitAnswer(answerIndex);
  }, [doSubmitAnswer]);

  const cancelSearch = useCallback(async () => {
    if (state.duelId && !state.duelId.startsWith('solo-')) {
      await supabase.from('karaoke_duels').update({ status: 'cancelled' }).eq('id', state.duelId);
    }
    cleanup();
    setState(createInitialState());
  }, [state.duelId, cleanup]);

  const resetDuel = useCallback(() => {
    cleanup();
    setState(createInitialState());
  }, [cleanup]);

  return {
    ...state,
    searchForDuel,
    startSoloDuel,
    submitAnswer,
    cancelSearch,
    resetDuel,
  };
}
