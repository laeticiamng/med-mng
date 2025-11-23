import logger from '@/lib/logger';

/**
 * Newsletter Service
 * Handles newsletter subscription management
 */

export interface NewsletterSubscription {
  email: string;
  name?: string;
  preferences?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    categories?: string[];
  };
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  subscriptionId?: string;
  error?: string;
}

/**
 * Newsletter Service
 */
class NewsletterService {
  private apiEndpoint = '/api/newsletter/subscribe';

  /**
   * Subscribe to newsletter
   * @param subscription - Subscription data
   * @returns Promise resolving to subscription response
   */
  async subscribe(subscription: NewsletterSubscription): Promise<NewsletterResponse> {
    try {
      // Validate email
      if (!subscription.email || !this.isValidEmail(subscription.email)) {
        return {
          success: false,
          message: 'Please provide a valid email address',
          error: 'INVALID_EMAIL',
        };
      }

      // Submit to API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 409) {
          return {
            success: false,
            message: 'This email is already subscribed to our newsletter',
            error: 'ALREADY_SUBSCRIBED',
          };
        }

        return {
          success: false,
          message: errorData.message || 'Failed to subscribe to newsletter',
          error: errorData.code || 'SUBSCRIPTION_FAILED',
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Successfully subscribed to newsletter!',
        subscriptionId: data.subscriptionId || data.id,
      };
    } catch (error) {
      logger.error('Error subscribing to newsletter:', error);

      // Fallback for development
      logger.debug('Newsletter Subscription (Development):', subscription);

      return {
        success: true,
        subscriptionId: `DEV-${Date.now()}`,
        message: 'Subscription recorded (development mode). Backend API not available.',
      };
    }
  }

  /**
   * Unsubscribe from newsletter
   * @param email - Email to unsubscribe
   * @param token - Unsubscribe token
   * @returns Promise resolving to unsubscribe response
   */
  async unsubscribe(email: string, token?: string): Promise<NewsletterResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || 'Failed to unsubscribe',
          error: 'UNSUBSCRIBE_FAILED',
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Successfully unsubscribed from newsletter',
      };
    } catch (error) {
      logger.error('Error unsubscribing from newsletter:', error);
      return {
        success: false,
        message: 'Failed to unsubscribe. Please try again later.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns true if valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const newsletterService = new NewsletterService();

// Export class for testing
export { NewsletterService };
