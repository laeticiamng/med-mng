import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';

interface MusicGenerationState {
  generating: boolean;
  progress: number;
  currentTrack: string | null;
  queue: Array<{
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
  }>;
}

interface MusicGenerationContextType {
  state: MusicGenerationState;
  generateMusic: (title: string, description: string, style?: string) => Promise<string | null>;
  cancelGeneration: (id: string) => void;
  clearQueue: () => void;
}

const MusicGenerationContext = createContext<MusicGenerationContextType | null>(null);

export const MusicGenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MusicGenerationState>({
    generating: false,
    progress: 0,
    currentTrack: null,
    queue: []
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const generateMusic = useCallback(async (title: string, description: string, style = 'upbeat') => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour générer de la musique",
        variant: "destructive"
      });
      return null;
    }

    const generationId = crypto.randomUUID();
    
    // Add to queue
    setState(prev => ({
      ...prev,
      queue: [...prev.queue, {
        id: generationId,
        title,
        description,
        status: 'pending'
      }],
      generating: true,
      currentTrack: title,
      progress: 0
    }));

    try {
      // Call Supabase Edge Function for music generation
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          title,
          description,
          style,
          user_id: user.id
        }
      });

      if (error) throw error;

      // Update queue status
      setState(prev => ({
        ...prev,
        queue: prev.queue.map(item =>
          item.id === generationId 
            ? { ...item, status: 'completed' }
            : item
        ),
        generating: false,
        progress: 100
      }));

      toast({
        title: "Musique générée !",
        description: `"${title}" a été ajoutée à votre bibliothèque`
      });

      return data?.track_id || null;

    } catch (error) {
      console.error('Music generation failed:', error);
      
      setState(prev => ({
        ...prev,
        queue: prev.queue.map(item =>
          item.id === generationId 
            ? { ...item, status: 'failed' }
            : item
        ),
        generating: false
      }));

      toast({
        title: "Génération échouée",
        description: `Impossible de générer "${title}". Veuillez réessayer.`,
        variant: "destructive"
      });

      return null;
    }
  }, [user, toast]);

  const cancelGeneration = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.filter(item => item.id !== id),
      generating: prev.queue.length > 1,
      currentTrack: null
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState({
      generating: false,
      progress: 0,
      currentTrack: null,
      queue: []
    });
  }, []);

  return (
    <MusicGenerationContext.Provider value={{
      state,
      generateMusic,
      cancelGeneration,
      clearQueue
    }}>
      {children}
    </MusicGenerationContext.Provider>
  );
};

export const useMusicGeneration = () => {
  const context = useContext(MusicGenerationContext);
  if (!context) {
    throw new Error('useMusicGeneration must be used within MusicGenerationProvider');
  }
  return context;
};