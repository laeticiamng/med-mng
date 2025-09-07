import React from 'react';
import { cn } from '@/lib/utils';

interface ConsistentBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'light';
  className?: string;
}

export const ConsistentBackground: React.FC<ConsistentBackgroundProps> = ({ 
  children, 
  variant = 'primary',
  className 
}) => {
  const backgroundVariants = {
    // Thème principal - Utilisant le système de couleurs sémantiques
    primary: "min-h-screen bg-background relative overflow-hidden",
    
    // Thème secondaire - Plus doux  
    secondary: "min-h-screen bg-card relative overflow-hidden",
    
    // Thème tertiaire - Coloré
    tertiary: "min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-secondary relative overflow-hidden",
    
    // Thème clair - Pour pages de documentation
    light: "min-h-screen bg-muted relative overflow-hidden"
  };

  const effectVariants = {
    primary: (
      <>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_50%)]"></div>
      </>
    ),
    secondary: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    ),
    tertiary: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-accent/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
    ),
    light: (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-2xl"></div>
      </div>
    )
  };

  return (
    <div className={cn(backgroundVariants[variant], className)}>
      {effectVariants[variant]}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};