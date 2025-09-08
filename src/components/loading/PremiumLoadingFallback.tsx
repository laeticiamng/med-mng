/**
 * ⏳ PREMIUM LOADING FALLBACK - MED-MNG v4.0
 * Animation de chargement premium avec indicateurs de progression
 */

import React from 'react';
import { Loader2, Stethoscope, Heart } from 'lucide-react';

export const PremiumLoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        
        {/* Logo animé */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Stethoscope className="w-12 h-12 text-white" />
          </div>
          
          {/* Cercle de progression */}
          <div className="absolute -inset-2">
            <div className="w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Texte de chargement */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            MED-MNG v4.0 Premium
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initialisation de la plateforme médicale...</span>
          </div>
        </div>

        {/* Barre de progression stylisée */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary animate-pulse rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Indicateurs de statut */}
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sécurité</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Interface</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>Données</span>
          </div>
        </div>

        {/* Message de statut */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Chargement des modules premium...
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Heart className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Plateforme médicale certifiée
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};