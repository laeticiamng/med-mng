/**
 * Contact Support Service
 * Manages support tickets and contact form submissions
 */

import { supabase } from '../lib/supabase'

export interface SupportTicket {
  name: string
  email: string
  subject: string
  message: string
  category?: 'bug' | 'feature' | 'feedback' | 'other'
  priority?: 'low' | 'medium' | 'high'
}

export interface SupportTicketResponse extends SupportTicket {
  id: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export const contactSupportService = {
  /**
   * Submit a support ticket
   */
  async createTicket(ticket: SupportTicket): Promise<SupportTicketResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(ticket.email)) {
        throw new Error('Email invalide')
      }

      // Validate required fields
      if (!ticket.name.trim() || !ticket.subject.trim() || !ticket.message.trim()) {
        throw new Error('Tous les champs sont requis')
      }

      // Store ticket in database
      const { data, error } = await supabase
        .from('support_tickets') // Replace with actual table name
        .insert({
          name: ticket.name,
          email: ticket.email,
          subject: ticket.subject,
          message: ticket.message,
          category: ticket.category || 'other',
          priority: ticket.priority || 'medium',
          status: 'open',
        })
        .select()
        .single()

      if (error) {
        // If table doesn't exist, create a support entry in an alternative table
        if (error.code === 'PGRST116') {
          // Log ticket creation via activity table as fallback
          await supabase.from('user_activity').insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user
            action: 'create',
            resource_type: 'support_ticket',
            resource_name: `${ticket.name} - ${ticket.subject}`,
            metadata: {
              email: ticket.email,
              message: ticket.message,
              category: ticket.category,
              priority: ticket.priority,
            },
          })

          return {
            id: 'temp-' + Date.now(),
            ...ticket,
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as SupportTicketResponse
        }
        throw error
      }

      return data as SupportTicketResponse
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Erreur lors de l\'envoi du formulaire'
      )
    }
  },

  /**
   * Send email notification about ticket
   */
  async sendEmailNotification(ticket: SupportTicket): Promise<void> {
    try {
      // Call a function or API to send email via Resend
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: ticket.email,
          subject: `Ticket de support: ${ticket.subject}`,
          template: 'support_ticket_confirmation',
          data: {
            name: ticket.name,
            subject: ticket.subject,
            ticketNumber: 'TICKET-' + Date.now(),
          },
        },
      })

      if (error) {
        console.error('Error sending email:', error)
        // Don't throw - email sending is not critical
      }
    } catch (err) {
      console.error('Error in sendEmailNotification:', err)
      // Don't throw - email sending is not critical
    }
  },

  /**
   * Get support tickets for a user (if stored)
   */
  async getUserTickets(email: string): Promise<SupportTicketResponse[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') throw error
      return (data || []) as SupportTicketResponse[]
    } catch (err) {
      console.error('Error fetching tickets:', err)
      return []
    }
  },

  /**
   * Track contact submission as activity
   */
  async logContactSubmission(
    ticket: SupportTicket,
    userId?: string
  ): Promise<void> {
    try {
      await supabase.from('user_activity').insert({
        user_id: userId || '00000000-0000-0000-0000-000000000000',
        action: 'create',
        resource_type: 'contact_form',
        resource_name: `Contact: ${ticket.subject}`,
        metadata: {
          email: ticket.email,
          name: ticket.name,
          category: ticket.category,
        },
      })
    } catch (err) {
      console.error('Error logging contact submission:', err)
      // Don't throw - logging is not critical
    }
  },
}
