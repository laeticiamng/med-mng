import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Type declarations for Web Speech API
interface SpeechRecognitionErrorEventCustom extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEventCustom extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface VoiceChatOptions {
  language?: string;
  autoSend?: boolean;
  onTranscript?: (text: string) => void;
  onSpeakEnd?: () => void;
}

interface VoiceChatState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
}

export const useVoiceChat = (options: VoiceChatOptions = {}) => {
  const { 
    language = 'fr-FR', 
    autoSend = true,
    onTranscript,
    onSpeakEnd 
  } = options;

  const [state, setState] = useState<VoiceChatState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    interimTranscript: '',
    isSupported: false,
    error: null
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    const isSupported = !!SpeechRecognitionAPI && !!window.speechSynthesis;
    setState(prev => ({ ...prev, isSupported }));

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventCustom) => {
        console.error('Speech recognition error:', event.error);
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: event.error 
        }));
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone non autorisé. Veuillez activer les permissions.');
        }
      };

      recognition.onresult = (event: SpeechRecognitionEventCustom) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: prev.transcript + finalTranscript,
          interimTranscript
        }));

        if (finalTranscript && autoSend) {
          onTranscript?.(finalTranscript);
        }
      };

      recognitionRef.current = recognition;
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, [language, autoSend, onTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('La reconnaissance vocale n\'est pas supportée');
      return;
    }

    try {
      setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Erreur lors du démarrage de la reconnaissance vocale');
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Speak text using TTS (Web Speech API)
  const speak = useCallback((text: string, voiceIndex: number = 0) => {
    if (!synthRef.current) {
      toast.error('La synthèse vocale n\'est pas supportée');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Get French voice if available
    const voices = synthRef.current.getVoices();
    const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
    if (frenchVoices.length > voiceIndex) {
      utterance.voice = frenchVoices[voiceIndex];
    }

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
      onSpeakEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [language, onSpeakEnd]);

  // Speak using ElevenLabs TTS (higher quality)
  const speakWithElevenLabs = useCallback(async (text: string, voiceId?: string) => {
    setState(prev => ({ ...prev, isSpeaking: true }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: {
          text,
          voiceId: voiceId || '9BWtsMINqrJLrRacOk9x', // Aria par défaut
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      if (data?.audioBase64) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioBase64}`;
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          onSpeakEnd?.();
        };
        
        audio.onerror = () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          toast.error('Erreur lors de la lecture audio');
        };

        await audio.play();
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
      // Fallback to Web Speech API
      speak(text);
    }
  }, [speak, onSpeakEnd]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  // Log voice session to database
  const logVoiceSession = useCallback(async (sessionData: {
    duration: number;
    transcriptLength: number;
    mode: 'stt' | 'tts' | 'both';
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use generic insert since table may not be in types yet
      await supabase.from('ai_voice_sessions' as any).insert({
        user_id: user.id,
        duration_seconds: sessionData.duration,
        transcript_length: sessionData.transcriptLength,
        mode: sessionData.mode,
        language
      });
    } catch (error) {
      console.error('Error logging voice session:', error);
    }
  }, [language]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    speak,
    speakWithElevenLabs,
    stopSpeaking,
    clearTranscript,
    logVoiceSession
  };
};
