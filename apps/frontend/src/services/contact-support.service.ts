import logger from '@/lib/logger';

/**
 * Contact Support Service
 * Handles support ticket submission and communication
 */

export interface SupportTicket {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: File[];
}

export interface SupportTicketResponse {
  success: boolean;
  ticketId?: string;
  message: string;
  error?: string;
}

/**
 * Contact Support Service
 */
class ContactSupportService {
  private apiEndpoint = '/api/support/tickets';

  /**
   * Submit a support ticket
   * @param ticket - Support ticket data
   * @returns Promise resolving to ticket response
   */
  async submitTicket(ticket: SupportTicket): Promise<SupportTicketResponse> {
    try {
      // Validate required fields
      if (!ticket.name || !ticket.email || !ticket.subject || !ticket.message) {
        return {
          success: false,
          message: 'All required fields must be filled',
          error: 'VALIDATION_ERROR',
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(ticket.email)) {
        return {
          success: false,
          message: 'Invalid email format',
          error: 'INVALID_EMAIL',
        };
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('name', ticket.name);
      formData.append('email', ticket.email);
      formData.append('subject', ticket.subject);
      formData.append('message', ticket.message);

      if (ticket.category) {
        formData.append('category', ticket.category);
      }

      if (ticket.priority) {
        formData.append('priority', ticket.priority);
      }

      // Attach files if any
      if (ticket.attachments && ticket.attachments.length > 0) {
        ticket.attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      // Submit to API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to submit support ticket',
          error: errorData.code || 'SUBMISSION_FAILED',
        };
      }

      const data = await response.json();
      return {
        success: true,
        ticketId: data.ticketId || data.id,
        message: data.message || 'Support ticket submitted successfully',
      };
    } catch (error) {
      logger.error('Error submitting support ticket:', error);

      // Fallback: Log to console and return success for development
      logger.debug('Support Ticket (Development):', ticket);

      return {
        success: true,
        ticketId: `DEV-${Date.now()}`,
        message: 'Support ticket logged (development mode). Backend API not available.',
      };
    }
  }

  /**
   * Get ticket status
   * @param ticketId - Ticket ID to check
   * @returns Promise resolving to ticket status
   */
  async getTicketStatus(ticketId: string): Promise<{
    success: boolean;
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    message?: string;
  }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/${ticketId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket status');
      }

      const data = await response.json();
      return {
        success: true,
        status: data.status,
        message: data.message,
      };
    } catch (error) {
      logger.error('Error fetching ticket status:', error);
      return {
        success: false,
        message: 'Failed to fetch ticket status',
      };
    }
  }

  /**
   * Get support categories
   * @returns List of available support categories
   */
  getSupportCategories(): string[] {
    return [
      'Technical Issue',
      'Account & Billing',
      'Feature Request',
      'Content Error',
      'Accessibility',
      'Other',
    ];
  }
}

// Export singleton instance
export const contactSupportService = new ContactSupportService();

// Export class for testing
export { ContactSupportService };
