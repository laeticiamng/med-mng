
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/med-mng-api';

class MedMngApi {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Authentification requise pour MED-MNG');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async createSong(title: string, sunoAudioId: string, meta: any = {}) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/songs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        suno_audio_id: sunoAudioId,
        meta,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec création chanson MED-MNG');
    }

    return response.json();
  }

  getSongStreamUrl(songId: string) {
    return `${API_BASE_URL}/songs/${songId}/stream`;
  }

  async addToLibrary(songId: string) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/library`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ song_id: songId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec ajout bibliothèque MED-MNG');
    }

    return response.json();
  }

  async removeFromLibrary(songId: string) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/library/${songId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec suppression bibliothèque MED-MNG');
    }

    return response.json();
  }

  async toggleLike(songId: string) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/songs/${songId}/like`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec toggle like MED-MNG');
    }

    return response.json();
  }

  async getLibrary(page = 1, limit = 20) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/library?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec récupération bibliothèque MED-MNG');
    }

    return response.json();
  }

  async getLyrics(songId: string) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/songs/${songId}/lyrics`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec récupération paroles MED-MNG');
    }

    return response.json();
  }

  async getRemainingQuota() {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/quota`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec récupération quota MED-MNG');
    }

    return response.json();
  }

  async createUserSubscription(planId: string, gateway: string, subscriptionId?: string) {
    try {
      const { error } = await supabase.rpc('MedMNG_create_user_sub', {
        plan_name: planId,
        gateway_name: gateway,
        subscription_id: subscriptionId || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur création abonnement MED-MNG:', error);
      throw error;
    }
  }
}

export const medMngApi = new MedMngApi();

export const useMedMngApi = () => {
  return medMngApi;
};
