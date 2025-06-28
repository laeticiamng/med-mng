
export class SunoApiClient {
  private apiKey: string;
  private baseUrl: string = 'https://apibox.erweima.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    console.log(`🌐 POST ${this.baseUrl}${endpoint}`);
    console.log(`📤 Payload:`, JSON.stringify(data, null, 2));

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.error(`❌ Error response:`, errorText);
        
        if (errorText.trim()) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText;
          }
        }
      } catch (e) {
        console.error(`❌ Erreur lors de la lecture de la réponse d'erreur:`, e);
      }

      throw new Error(errorMessage);
    }

    // Gestion sécurisée du parsing JSON
    const responseText = await response.text();
    console.log(`📥 Response text length: ${responseText.length}`);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Réponse vide de l\'API Suno');
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`✅ Parsed response:`, result);
      return result;
    } catch (parseError) {
      console.error(`❌ Erreur de parsing JSON:`, parseError);
      console.error(`📄 Raw response:`, responseText.substring(0, 500));
      throw new Error(`Réponse JSON invalide de l'API Suno: ${parseError.message}`);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    console.log(`🌐 GET ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        console.error(`❌ Error response:`, errorText);
        
        if (errorText.trim()) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText;
          }
        }
      } catch (e) {
        console.error(`❌ Erreur lors de la lecture de la réponse d'erreur:`, e);
      }

      throw new Error(errorMessage);
    }

    // Gestion sécurisée du parsing JSON
    const responseText = await response.text();
    console.log(`📥 Response text length: ${responseText.length}`);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Réponse vide de l\'API Suno');
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`✅ Parsed response:`, result);
      return result;
    } catch (parseError) {
      console.error(`❌ Erreur de parsing JSON:`, parseError);
      console.error(`📄 Raw response:`, responseText.substring(0, 500));
      throw new Error(`Réponse JSON invalide de l'API Suno: ${parseError.message}`);
    }
  }
}
