// @ts-nocheck
/**
 * Appels IA résilients : passerelle Lovable d'abord, OpenAI en secours.
 *
 * POURQUOI (constaté le 22/09/2026 avec la session d'une utilisatrice réelle)
 * -------------------------------------------------------------------------
 * 40 fonctions dépendent uniquement de la passerelle Lovable AI. Quand son
 * solde est épuisé, elle répond 402 « Payment required » et TOUTE l'IA
 * tombe d'un coup :
 *   emotion-analysis ...... 402  → le scan texte ne fait rien
 *   analyze-vision ........ 500  → « Analyse interrompue – Reconnexion… »
 *   analyze-voice-hume .... 200 « neutre » → la transcription échouait et la
 *                                  fonction maquillait l'échec en émotion
 *   ai-coach .............. 402  → le coach ne répond plus
 * Pendant ce temps, OPENAI_API_KEY était configurée et fonctionnelle
 * (transcribe-audio répondait normalement).
 *
 * Ce module garde la passerelle comme premier choix et bascule sur OpenAI
 * quand elle refuse (402, 429, 5xx) ou ne répond pas. Il renvoie un vrai
 * objet Response : le code appelant ne change pas.
 */

const PASSERELLE = 'https://ai.gateway.lovable.dev/v1';
const OPENAI = 'https://api.openai.com/v1';

/** Statuts qui justifient d'essayer le fournisseur de secours. */
const STATUTS_DE_REPLI = new Set([402, 408, 429, 500, 502, 503, 504]);

/** Modèle OpenAI équivalent à un modèle demandé à la passerelle. */
export function modeleOpenAI(modele?: string): string {
  if (!modele) return 'gpt-4o-mini';
  if (modele.startsWith('openai/')) {
    const m = modele.slice('openai/'.length);
    // Les modèles gpt-5* de la passerelle n'existent pas forcément côté compte
    // OpenAI : on retombe sur un modèle universellement disponible.
    return m.startsWith('gpt-5') ? 'gpt-4o' : m;
  }
  if (modele.includes('pro')) return 'gpt-4o';
  return 'gpt-4o-mini';
}

export interface ReponseIA extends Response {
  /** 'lovable' ou 'openai' : qui a réellement répondu. */
  fournisseur?: string;
}

/**
 * Remplace `fetch('https://ai.gateway.lovable.dev/v1/chat/completions', …)`.
 * `corps` est l'objet JSON de la requête (pas une chaîne).
 */
export async function completionIA(corps: Record<string, unknown>): Promise<ReponseIA> {
  const cleLovable = Deno.env.get('LOVABLE_API_KEY');
  const cleOpenAI = Deno.env.get('OPENAI_API_KEY');
  const motifs: string[] = [];

  if (cleLovable) {
    try {
      const r = await fetch(`${PASSERELLE}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cleLovable}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(corps),
      });
      if (r.ok || !STATUTS_DE_REPLI.has(r.status) || !cleOpenAI) {
        (r as ReponseIA).fournisseur = 'lovable';
        return r as ReponseIA;
      }
      motifs.push(`passerelle ${r.status}`);
      await r.body?.cancel();
    } catch (e) {
      motifs.push(`passerelle injoignable : ${e instanceof Error ? e.message : e}`);
      if (!cleOpenAI) throw e;
    }
  }

  if (!cleOpenAI) {
    throw new Error('Aucun fournisseur IA configuré (LOVABLE_API_KEY et OPENAI_API_KEY absentes)');
  }

  console.warn('[ia-resiliente] bascule sur OpenAI :', motifs.join(' ; ') || 'passerelle non configurée');
  const corpsOpenAI = { ...corps, model: modeleOpenAI(corps.model as string | undefined) };
  const r = await fetch(`${OPENAI}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cleOpenAI}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(corpsOpenAI),
  });
  (r as ReponseIA).fournisseur = 'openai';
  return r as ReponseIA;
}

// ---------------------------------------------------------------------------
// Transcription
// ---------------------------------------------------------------------------

/**
 * Le vrai format du fichier audio, lu dans ses premiers octets.
 * Safari (iPhone) enregistre en audio/mp4 : l'étiqueter « audio.webm »,
 * comme le faisait analyze-voice-hume, fait échouer le décodage.
 */
export function formatAudio(octets: Uint8Array): { extension: string; mime: string } {
  const txt = (d: number, n: number) => String.fromCharCode(...octets.slice(d, d + n));
  if (octets[0] === 0x1a && octets[1] === 0x45 && octets[2] === 0xdf && octets[3] === 0xa3) {
    return { extension: 'webm', mime: 'audio/webm' };
  }
  if (txt(4, 4) === 'ftyp') return { extension: 'm4a', mime: 'audio/mp4' };
  if (txt(0, 4) === 'OggS') return { extension: 'ogg', mime: 'audio/ogg' };
  if (txt(0, 4) === 'RIFF' && txt(8, 4) === 'WAVE') return { extension: 'wav', mime: 'audio/wav' };
  if (txt(0, 3) === 'ID3' || (octets[0] === 0xff && (octets[1] & 0xe0) === 0xe0)) {
    return { extension: 'mp3', mime: 'audio/mpeg' };
  }
  return { extension: 'webm', mime: 'audio/webm' };
}

/**
 * Transcriptions que Whisper invente sur du silence ou du bruit. Les
 * accepter reviendrait à analyser l'émotion d'une phrase que personne n'a dite.
 * (Constaté : un silence d'une seconde → « Sous-titrage Société Radio-Canada ».)
 */
const HALLUCINATIONS = [
  /sous-titrage/i,
  /soci[ée]t[ée] radio-canada/i,
  /sous-titres r[ée]alis[ée]s/i,
  /merci d'avoir regard[ée]/i,
  /abonnez-vous/i,
  /amara\.org/i,
];

export function estHallucination(texte: string): boolean {
  const t = texte.trim();
  return t.length === 0 || HALLUCINATIONS.some((h) => h.test(t));
}

export interface Transcription {
  texte: string;
  fournisseur: string | null;
  motifs: string[];
}

export async function transcrireIA(octets: Uint8Array, langue = 'fr'): Promise<Transcription> {
  const { extension, mime } = formatAudio(octets);
  const motifs: string[] = [];

  const tentative = async (url: string, cle: string, fournisseur: string) => {
    const fd = new FormData();
    fd.append('file', new Blob([octets], { type: mime }), `audio.${extension}`);
    fd.append('model', 'whisper-1');
    fd.append('language', langue);
    fd.append('response_format', 'json');
    const r = await fetch(`${url}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}` },
      body: fd,
    });
    if (!r.ok) {
      motifs.push(`${fournisseur} ${r.status} : ${(await r.text()).slice(0, 160)}`);
      return null;
    }
    const j = await r.json();
    const texte = String(j?.text ?? '').trim();
    if (estHallucination(texte)) {
      motifs.push(`${fournisseur} : aucune parole reconnue${texte ? ` (« ${texte.slice(0, 60)} »)` : ''}`);
      return '';
    }
    return texte;
  };

  const cleLovable = Deno.env.get('LOVABLE_API_KEY');
  const cleOpenAI = Deno.env.get('OPENAI_API_KEY');

  if (cleLovable) {
    try {
      const t = await tentative(PASSERELLE, cleLovable, 'passerelle');
      if (t) return { texte: t, fournisseur: 'lovable', motifs };
      if (t === '') return { texte: '', fournisseur: 'lovable', motifs }; // vraiment rien entendu
    } catch (e) {
      motifs.push(`passerelle injoignable : ${e instanceof Error ? e.message : e}`);
    }
  }
  if (cleOpenAI) {
    try {
      const t = await tentative(OPENAI, cleOpenAI, 'openai');
      if (t) return { texte: t, fournisseur: 'openai', motifs };
    } catch (e) {
      motifs.push(`openai injoignable : ${e instanceof Error ? e.message : e}`);
    }
  }
  return { texte: '', fournisseur: null, motifs };
}
