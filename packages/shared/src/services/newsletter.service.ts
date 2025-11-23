/**
 * Newsletter Service
 * Manages newsletter subscriptions and mailing
 */

import { supabase } from '../lib/supabase'

export interface NewsletterSubscription {
  email: string
  firstName?: string
  lastName?: string
  preferences?: {
    frequency?: 'daily' | 'weekly' | 'monthly'
    categories?: string[]
  }
}

export const newsletterService = {
  /**
   * Subscribe to newsletter
   */
  async subscribe(subscription: NewsletterSubscription): Promise<{ success: boolean; message: string }> {
    try {
      // Store subscription in database (using a table or similar)
      // For now, using activity logging as a workaround
      const { error } = await supabase.from('abonnement_fiches').insert({
        email: subscription.email,
        prenom: subscription.firstName || 'Unknown',
      })

      if (error) throw error

      return {
        success: true,
        message: 'Inscription réussie! Vérifiez votre email pour confirmer.',
      }
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l\'inscription à la newsletter'
      )
    }
  },

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(email: string): Promise<void> {
    try {
      // Mark as unsubscribed in database
      // Implementation depends on your database schema
      const { error } = await supabase
        .from('abonnement_fiches')
        .delete()
        .eq('email', email)

      if (error) throw error
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la désinscription'
      )
    }
  },

  /**
   * Check if email is subscribed
   */
  async isSubscribed(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('abonnement_fiches')
        .select('id')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (err) {
      console.error('Error checking subscription:', err)
      return false
    }
  },

  /**
   * Update subscription preferences
   */
  async updatePreferences(
    email: string,
    preferences: NewsletterSubscription['preferences']
  ): Promise<void> {
    try {
      // Implementation depends on your database schema
      const { error } = await supabase
        .from('abonnement_fiches')
        .update({ prenom: `${preferences?.frequency || 'weekly'}` })
        .eq('email', email)

      if (error) throw error
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour des préférences'
      )
    }
  },
}
