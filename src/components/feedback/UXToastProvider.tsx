import React, { createContext, useContext } from "react";
import { toast } from "sonner";
import { appNavigate } from "@/lib/navigation";

type ToastKind = "generation" | "save";

interface UXToastContextType {
  showAuthRequired: (action?: string) => void;
  showQuotaExceeded: (type?: ToastKind) => void;
  showSuccess: (message: string, details?: string) => void;
  showError: (message: string, details?: string) => void;
}

const UXToastContext = createContext<UXToastContextType | undefined>(undefined);

// Option: centralise le basePath pour éviter les hardcodes
const BASE = import.meta.env.VITE_APP_BASE_PATH ?? "/med-mng";
const path = (p: string) => `${BASE}${p}`;

export const UXToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gotoLogin = () => appNavigate(path("/login"));
  const gotoPricing = () => appNavigate(path("/pricing"));

  const showAuthRequired = (action = "accéder à cette fonctionnalité") => {
    toast.error(`🔐 Connexion requise pour ${action}`, {
      description: "Connectez-vous en quelques secondes pour débloquer toutes les fonctionnalités.",
      action: { label: "🚀 Se connecter", onClick: gotoLogin },
      duration: 8000,
    });
  };

  const showQuotaExceeded = (type: ToastKind = "generation") => {
    const messages = {
      generation: {
        title: "🎵 Quota de génération atteint",
        description: "Améliorez votre abonnement pour générer plus de musiques éducatives.",
        actionLabel: "🚀 Voir les offres",
      },
      save: {
        title: "📦 Sauvegarde limitée",
        description: "Votre plan ne permet pas de sauvegarder. Améliorez pour conserver vos créations.",
        actionLabel: "⭐ Améliorer",
      },
    } as const;

    const m = messages[type];
    toast.error(m.title, {
      description: m.description,
      action: { label: m.actionLabel, onClick: gotoPricing },
      duration: 10000,
    });
  };

  const showSuccess = (message: string, details?: string) =>
    toast.success(message, { description: details, duration: 4000 });

  const showError = (message: string, details?: string) =>
    toast.error(message, { description: details, duration: 6000 });

  const value: UXToastContextType = {
    showAuthRequired,
    showQuotaExceeded,
    showSuccess,
    showError,
  };

  return <UXToastContext.Provider value={value}>{children}</UXToastContext.Provider>;
};

export const useUXToast = () => {
  const ctx = useContext(UXToastContext);
  if (!ctx) throw new Error("useUXToast must be used within a UXToastProvider");
  return ctx;
};