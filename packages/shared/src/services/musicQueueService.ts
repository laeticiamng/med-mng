/**
 * 🎵 Service de File d'Attente pour Génération Musicale
 *
 * Gère une file d'attente des générations pour:
 * - Éviter les dépassements de quota API
 * - Prioriser les générations importantes
 * - Gérer la concurrence
 * - Offrir visibilité sur la progression
 */

import { supabase } from '@/integrations/supabase/client';

export type QueuePriority = 'low' | 'normal' | 'high' | 'urgent';
export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface QueueItem {
  id: string;
  user_id: string;
  item_code: string;
  rang: 'A' | 'B' | 'AB';
  style: string;
  language: string;
  priority: QueuePriority;
  status: QueueStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  track_id?: string;
  metadata?: any;
}

export class MusicQueueService {
  private static MAX_CONCURRENT_GENERATIONS = 3; // Maximum de générations simultanées
  private static MAX_RETRIES = 3;

  /**
   * Ajouter une génération à la file d'attente
   */
  static async enqueue(params: {
    itemCode: string;
    rang: 'A' | 'B' | 'AB';
    style: string;
    language?: string;
    priority?: QueuePriority;
    metadata?: any;
  }): Promise<QueueItem> {
    const { itemCode, rang, style, language = 'fr', priority = 'normal', metadata } = params;

    console.log('📥 Ajout à la file d\'attente:', { itemCode, rang, style, priority });

    try {
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier si une demande identique existe déjà en attente
      const { data: existingQueue } = await supabase
        .from('music_generation_queue')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_code', itemCode)
        .eq('rang', rang)
        .eq('style', style)
        .in('status', ['pending', 'processing'])
        .limit(1);

      if (existingQueue && existingQueue.length > 0) {
        console.log('⚠️ Génération déjà en file d\'attente:', existingQueue[0].id);
        return existingQueue[0];
      }

      // Calculer la position dans la file
      const position = await this.calculateQueuePosition(priority);

      // Insérer dans la file
      const { data: queueItem, error } = await supabase
        .from('music_generation_queue')
        .insert({
          user_id: user.id,
          item_code: itemCode,
          rang,
          style,
          language,
          priority,
          status: 'pending',
          retry_count: 0,
          max_retries: this.MAX_RETRIES,
          queue_position: position,
          metadata
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Ajouté à la file d\'attente:', queueItem.id, 'position:', position);

      // Déclencher le traitement de la file
      this.processQueue();

      return queueItem;
    } catch (error) {
      console.error('❌ Erreur ajout file d\'attente:', error);
      throw error;
    }
  }

  /**
   * Calculer la position dans la file selon la priorité
   */
  private static async calculateQueuePosition(priority: QueuePriority): Promise<number> {
    const priorityWeight = {
      urgent: 1,
      high: 2,
      normal: 3,
      low: 4
    };

    // Compter les items avec priorité supérieure ou égale
    const { count } = await supabase
      .from('music_generation_queue')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processing'])
      .lte('priority_weight', priorityWeight[priority]);

    return (count || 0) + 1;
  }

  /**
   * Traiter la file d'attente
   */
  static async processQueue(): Promise<void> {
    console.log('🔄 Traitement de la file d\'attente...');

    try {
      // Vérifier combien de générations sont en cours
      const { count: processingCount } = await supabase
        .from('music_generation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing');

      const availableSlots = this.MAX_CONCURRENT_GENERATIONS - (processingCount || 0);

      if (availableSlots <= 0) {
        console.log('⏳ File saturée, attente de slots disponibles');
        return;
      }

      console.log(`✅ ${availableSlots} slots disponibles`);

      // Récupérer les prochains items à traiter
      const { data: pendingItems } = await supabase
        .from('music_generation_queue')
        .select('*')
        .eq('status', 'pending')
        .order('priority_weight', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(availableSlots);

      if (!pendingItems || pendingItems.length === 0) {
        console.log('✅ File vide');
        return;
      }

      console.log(`🚀 Traitement de ${pendingItems.length} items`);

      // Traiter chaque item
      for (const item of pendingItems) {
        await this.processItem(item);
      }
    } catch (error) {
      console.error('❌ Erreur traitement file d\'attente:', error);
    }
  }

  /**
   * Traiter un item de la file
   */
  private static async processItem(item: QueueItem): Promise<void> {
    console.log('🎵 Traitement item:', item.id);

    try {
      // Marquer comme en cours
      await supabase
        .from('music_generation_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', item.id);

      // Appeler la génération musicale
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: '', // Sera généré automatiquement
          style: item.style,
          rang: item.rang,
          language: item.language,
          itemCode: item.item_code,
          fastMode: true
        }
      });

      if (error) throw error;

      // Marquer comme complété
      await supabase
        .from('music_generation_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          track_id: data.trackId
        })
        .eq('id', item.id);

      console.log('✅ Item traité avec succès:', item.id);

      // Continuer le traitement de la file
      setTimeout(() => this.processQueue(), 1000);
    } catch (error) {
      console.error('❌ Erreur traitement item:', item.id, error);

      // Incrémenter retry_count
      const newRetryCount = item.retry_count + 1;

      if (newRetryCount >= item.max_retries) {
        // Max retries atteint, marquer comme failed
        await supabase
          .from('music_generation_queue')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message,
            retry_count: newRetryCount
          })
          .eq('id', item.id);

        console.log('❌ Item échoué après', newRetryCount, 'tentatives');
      } else {
        // Retry
        await supabase
          .from('music_generation_queue')
          .update({
            status: 'pending',
            retry_count: newRetryCount,
            error_message: error.message
          })
          .eq('id', item.id);

        console.log('🔄 Retry', newRetryCount, '/', item.max_retries);

        // Réessayer après un délai exponentiel
        const retryDelay = Math.pow(2, newRetryCount) * 5000; // 5s, 10s, 20s
        setTimeout(() => this.processQueue(), retryDelay);
      }
    }
  }

  /**
   * Obtenir l'état de la file d'attente
   */
  static async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    userItems: QueueItem[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Compter par statut
      const { count: pendingCount } = await supabase
        .from('music_generation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: processingCount } = await supabase
        .from('music_generation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'processing');

      const { count: completedCount } = await supabase
        .from('music_generation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: failedCount } = await supabase
        .from('music_generation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      // Items de l'utilisateur
      let userItems: QueueItem[] = [];
      if (user) {
        const { data } = await supabase
          .from('music_generation_queue')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        userItems = data || [];
      }

      return {
        pending: pendingCount || 0,
        processing: processingCount || 0,
        completed: completedCount || 0,
        failed: failedCount || 0,
        userItems
      };
    } catch (error) {
      console.error('❌ Erreur récupération état file:', error);
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        userItems: []
      };
    }
  }

  /**
   * Annuler un item de la file
   */
  static async cancelItem(itemId: string): Promise<void> {
    console.log('🛑 Annulation item:', itemId);

    try {
      const { error } = await supabase
        .from('music_generation_queue')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .in('status', ['pending', 'processing']);

      if (error) throw error;

      console.log('✅ Item annulé');
    } catch (error) {
      console.error('❌ Erreur annulation item:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les anciens items
   */
  static async cleanOldItems(daysToKeep: number = 7): Promise<number> {
    console.log(`🧹 Nettoyage items > ${daysToKeep} jours`);

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data: deletedItems, error } = await supabase
        .from('music_generation_queue')
        .delete()
        .in('status', ['completed', 'failed', 'cancelled'])
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      const deletedCount = deletedItems?.length || 0;
      console.log(`✅ ${deletedCount} items nettoyés`);

      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur nettoyage items:', error);
      return 0;
    }
  }
}
