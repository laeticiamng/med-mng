
import { supabase } from '@/integrations/supabase/client';

export const useEmailNotifications = () => {
  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      console.log('📧 Envoi email de bienvenue à:', email, name);
      
      const { _data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          email,
          name,
        },
      });

      if (error) {
        console.error('Erreur envoi email de bienvenue:', error);
        return { success: false, error };
      }

      console.log('Email de bienvenue envoyé:', _data);
      return { success: true, data };
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error };
    }
  };

  const sendSubscriptionEmail = async (
    email: string, 
    name: string, 
    planName: string, 
    credits: number,
    amount: number
  ) => {
    try {
      const { _data, error } = await supabase.functions.invoke('send-emails', {
        body: {
          type: 'subscription_success',
          email,
          name,
          variables: {
            plan_name: planName,
            credits: credits.toString(),
            amount: amount.toString(),
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
          },
        },
      });

      if (error) {
        console.error('Erreur envoi email abonnement:', error);
        return { success: false, error };
      }

      console.log('Email abonnement envoyé:', _data);
      return { success: true, data };
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error };
    }
  };

  return {
    sendWelcomeEmail,
    sendSubscriptionEmail,
  };
};
