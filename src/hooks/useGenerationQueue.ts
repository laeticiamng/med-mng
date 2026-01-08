import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface QueuedGeneration {
  id: string;
  lyrics: string[];
  style: string;
  rang: 'A' | 'B' | 'AB';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  addedAt: Date;
  completedAt?: Date;
  audioUrl?: string;
  error?: string;
}

interface UseGenerationQueueResult {
  queue: QueuedGeneration[];
  isProcessing: boolean;
  addToQueue: (generation: Omit<QueuedGeneration, 'id' | 'status' | 'addedAt'>) => string;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  processNext: () => Promise<void>;
  queueLength: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
}

export const useGenerationQueue = (
  generateFn: (lyrics: string[], style: string, rang: 'A' | 'B' | 'AB') => Promise<string>
): UseGenerationQueueResult => {
  const [queue, setQueue] = useState<QueuedGeneration[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const addToQueue = useCallback((generation: Omit<QueuedGeneration, 'id' | 'status' | 'addedAt'>): string => {
    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newGeneration: QueuedGeneration = {
      ...generation,
      id,
      status: 'pending',
      addedAt: new Date(),
    };

    setQueue(prev => {
      // Insérer selon la priorité (plus haute priorité = en premier)
      const newQueue = [...prev, newGeneration];
      return newQueue.sort((a, b) => {
        // D'abord par priorité décroissante
        if (b.priority !== a.priority) return b.priority - a.priority;
        // Puis par date d'ajout croissante
        return a.addedAt.getTime() - b.addedAt.getTime();
      });
    });

    toast.success('Génération ajoutée à la file d\'attente');
    return id;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(g => g.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue(prev => prev.filter(g => g.status === 'processing'));
    toast.success('File d\'attente vidée');
  }, []);

  const processNext = useCallback(async () => {
    if (processingRef.current) return;

    const nextPending = queue.find(g => g.status === 'pending');
    if (!nextPending) return;

    processingRef.current = true;
    setIsProcessing(true);

    // Marquer comme en cours
    setQueue(prev => prev.map(g => 
      g.id === nextPending.id ? { ...g, status: 'processing' as const } : g
    ));

    try {
      const audioUrl = await generateFn(nextPending.lyrics, nextPending.style, nextPending.rang);
      
      setQueue(prev => prev.map(g => 
        g.id === nextPending.id 
          ? { ...g, status: 'completed' as const, audioUrl, completedAt: new Date() } 
          : g
      ));
      
      toast.success(`🎵 Génération terminée : ${nextPending.rang}`);
    } catch (error) {
      setQueue(prev => prev.map(g => 
        g.id === nextPending.id 
          ? { ...g, status: 'failed' as const, error: error instanceof Error ? error.message : 'Erreur inconnue' } 
          : g
      ));
      
      toast.error(`Échec de la génération : ${nextPending.rang}`);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [queue, generateFn]);

  const queueLength = queue.length;
  const pendingCount = queue.filter(g => g.status === 'pending').length;
  const completedCount = queue.filter(g => g.status === 'completed').length;
  const failedCount = queue.filter(g => g.status === 'failed').length;

  return {
    queue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processNext,
    queueLength,
    pendingCount,
    completedCount,
    failedCount,
  };
};
