import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mic, MicOff, Volume2, VolumeX, Settings2, Loader2 } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { cn } from '@/lib/utils';

interface VoiceChatButtonProps {
  onTranscript: (text: string) => void;
  textToSpeak?: string;
  className?: string;
  compact?: boolean;
}

export const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({
  onTranscript,
  textToSpeak,
  className,
  compact = false
}) => {
  const [usePremiumTTS, setUsePremiumTTS] = useState(false);
  
  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    speak,
    speakWithElevenLabs,
    stopSpeaking,
    clearTranscript
  } = useVoiceChat({
    language: 'fr-FR',
    autoSend: false,
    onTranscript: (text) => {
      if (text.trim()) {
        onTranscript(text);
        clearTranscript();
      }
    }
  });

  // Auto-speak when textToSpeak changes
  useEffect(() => {
    if (textToSpeak && !isSpeaking) {
      if (usePremiumTTS) {
        speakWithElevenLabs(textToSpeak);
      } else {
        speak(textToSpeak);
      }
    }
  }, [textToSpeak, usePremiumTTS, speak, speakWithElevenLabs, isSpeaking]);

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
      // Send accumulated transcript
      if (transcript.trim()) {
        onTranscript(transcript);
        clearTranscript();
      }
    } else {
      startListening();
    }
  }, [isListening, transcript, startListening, stopListening, onTranscript, clearTranscript]);

  const handleSpeakerClick = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (textToSpeak) {
      if (usePremiumTTS) {
        speakWithElevenLabs(textToSpeak);
      } else {
        speak(textToSpeak);
      }
    }
  }, [isSpeaking, textToSpeak, usePremiumTTS, speak, speakWithElevenLabs, stopSpeaking]);

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" disabled className={className}>
              <MicOff className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mode vocal non supporté par votre navigateur</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {/* Microphone button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isListening ? "default" : "ghost"}
                size="icon"
                onClick={handleMicClick}
                className={cn(
                  "relative",
                  isListening && "bg-destructive hover:bg-destructive/90"
                )}
              >
                {isListening ? (
                  <>
                    <Mic className="h-4 w-4 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
                  </>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isListening ? 'Arrêter l\'écoute' : 'Activer le micro'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Speaker button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isSpeaking ? "default" : "ghost"}
                size="icon"
                onClick={handleSpeakerClick}
                disabled={!textToSpeak && !isSpeaking}
                className={cn(
                  isSpeaking && "bg-primary"
                )}
              >
                {isSpeaking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSpeaking ? 'Arrêter la lecture' : 'Lire à voix haute'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Voice controls */}
      <div className="flex items-center gap-2">
        {/* Microphone button with pulse animation */}
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          onClick={handleMicClick}
          className={cn(
            "relative gap-2 transition-all",
            isListening && "ring-2 ring-destructive ring-offset-2"
          )}
        >
          {isListening ? (
            <>
              <Mic className="h-5 w-5 animate-pulse" />
              <span>Écoute en cours...</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              <span>Parler</span>
            </>
          )}
        </Button>

        {/* Speaker button */}
        <Button
          variant={isSpeaking ? "default" : "outline"}
          size="lg"
          onClick={handleSpeakerClick}
          disabled={!textToSpeak && !isSpeaking}
          className="gap-2"
        >
          {isSpeaking ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Lecture...</span>
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              <span>Écouter</span>
            </>
          )}
        </Button>

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Paramètres vocaux</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setUsePremiumTTS(!usePremiumTTS)}>
              <span className="flex-1">
                Voix Premium (ElevenLabs)
              </span>
              {usePremiumTTS && <Badge variant="secondary">Actif</Badge>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Transcript preview */}
      {(transcript || interimTranscript) && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <span>{transcript}</span>
            <span className="text-muted-foreground italic">{interimTranscript}</span>
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <Badge variant="destructive" className="text-xs">
          Erreur: {error}
        </Badge>
      )}
    </div>
  );
};
