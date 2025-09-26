import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, Mail, MessageCircle, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PanicOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyContacts?: {
    phone?: string;
    email?: string;
    chat?: string;
  };
}

export const PanicOverlay: React.FC<PanicOverlayProps> = ({
  isOpen,
  onClose,
  emergencyContacts = {
    phone: '+33 1 23 45 67 89',
    email: 'urgence@med-mng.fr',
    chat: '/support'
  }
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  // Emergency exit sequence - double ESC key
  useEffect(() => {
    let escapeCount = 0;
    let resetTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escapeCount++;
        
        if (escapeCount === 1) {
          // First escape - start countdown
          setCountdown(3);
          resetTimer = setTimeout(() => {
            escapeCount = 0;
            setCountdown(null);
          }, 3000);
        } else if (escapeCount === 2) {
          // Second escape - activate panic mode
          clearTimeout(resetTimer);
          setCountdown(null);
          activatePanicMode();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      activatePanicMode();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const activatePanicMode = () => {
    // Clear all data and redirect to a safe page
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear browser history
      window.history.replaceState({}, '', '/');
      
      // Redirect to a neutral page
      window.location.href = 'https://www.google.com/search?q=study+resources';
      
    } catch (error) {
      console.error('Error during panic mode activation:', error);
      // Fallback: just redirect
      window.location.href = 'https://www.google.com';
    }
  };

  const handleQuickExit = () => {
    setCountdown(3);
  };

  const handleEmergencyCall = () => {
    if (emergencyContacts.phone) {
      window.location.href = `tel:${emergencyContacts.phone}`;
    }
  };

  const handleEmergencyEmail = () => {
    if (emergencyContacts.email) {
      window.location.href = `mailto:${emergencyContacts.email}?subject=Demande d'aide urgente&body=J'ai besoin d'aide concernant l'utilisation de la plateforme MED-MNG.`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm",
      "flex items-center justify-center p-4",
      "animate-in fade-in duration-200"
    )}>
      <Card className="w-full max-w-md shadow-2xl border-red-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Mode Sécurisé
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {countdown !== null && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <strong>Sortie d'urgence dans {countdown} secondes...</strong>
                <br />
                Appuyez sur Échap pour annuler
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-3">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Besoin d'aide ?</h3>
            <p className="text-sm text-muted-foreground">
              Si vous vous sentez en détresse ou avez besoin d'aide immédiate, 
              voici plusieurs options pour vous accompagner.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleQuickExit}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Sortie d'urgence (efface tout)
            </Button>

            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={handleEmergencyCall}
                variant="outline"
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler le support
              </Button>

              <Button
                onClick={handleEmergencyEmail}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email d'urgence
              </Button>

              <Button
                onClick={() => window.open('/support', '_blank')}
                variant="outline"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat d'aide
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Ressources d'aide</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p><strong>SOS Étudiants :</strong> 01 40 29 12 12</p>
              <p><strong>Nightline :</strong> Service d'écoute nocturne</p>
              <p><strong>3114 :</strong> Numéro national de prévention du suicide</p>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              Double appui sur <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Échap</kbd> pour 
              la sortie d'urgence rapide
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {countdown !== null && `Sortie d'urgence dans ${countdown} secondes`}
      </div>
    </div>
  );
};

export default PanicOverlay;