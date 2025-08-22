import React, { createContext, useContext } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UXToastContextType {
  showAuthRequired: (action?: string) => void;
  showQuotaExceeded: (type?: 'generation' | 'save') => void;
  showSuccess: (message: string, details?: string) => void;
  showError: (message: string, details?: string) => void;
}

const UXToastContext = createContext<UXToastContextType | undefined>(undefined);

export const UXToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const showAuthRequired = (action: string = "accéder à cette fonctionnalité") => {
    toast.error(`🔐 Connexion requise pour ${action}`, {
      description: "Connectez-vous en quelques secondes pour débloquer toutes les fonctionnalités.",
      action: {
        label: "🚀 Se connecter",
        onClick: () => navigate('/med-mng/login')
      },
      duration: 8000
    });
  };

  const showQuotaExceeded = (type: 'generation' | 'save' = 'generation') => {
    const messages = {
      generation: {
        title: "🎵 Quota de génération atteint",
        description: "Améliorez votre abonnement pour générer plus de musiques éducatives.",
        actionLabel: "🚀 Voir les offres"
      },
      save: {
        title: "📦 Sauvegarde limitée",
        description: "Votre plan ne permet pas de sauvegarder. Améliorez pour conserver vos créations.",
        actionLabel: "⭐ Améliorer"
      }
    };

    const message = messages[type];
    
    toast.error(message.title, {
      description: message.description,
      action: {
        label: message.actionLabel,
        onClick: () => navigate('/med-mng/pricing')
      },
      duration: 10000
    });
  };

  const showSuccess = (message: string, details?: string) => {
    toast.success(message, {
      description: details,
      duration: 4000
    });
  };

  const showError = (message: string, details?: string) => {
    toast.error(message, {
      description: details,
      duration: 6000
    });
  };

  const value = {
    showAuthRequired,
    showQuotaExceeded,
    showSuccess,
    showError
  };

  return (
    <UXToastContext.Provider value={value}>
      {children}
    </UXToastContext.Provider>
  );
};

export const useUXToast = () => {
  const context = useContext(UXToastContext);
  if (context === undefined) {
    throw new Error('useUXToast must be used within a UXToastProvider');
  }
  return context;
};