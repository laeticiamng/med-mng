
import { HTTP_TIMEOUT } from './constants.ts';

export class SunoApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async post<T>(url: string, data: any): Promise<T> {
    console.log(`🌐 POST ${url}`);
    console.log(`📤 Payload:`, JSON.stringify(data, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      const responseText = await response.text();
      console.log(`📥 Response text length: ${responseText.length}`);

      if (!response.ok) {
        console.error(`❌ Error response: ${responseText}`);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const parsedResponse = JSON.parse(responseText);
      console.log(`✅ Parsed response:`, parsedResponse);

      return parsedResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async get<T>(url: string, params?: Record<string, string>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const fullUrl = `${url}${queryString}`;
    
    console.log(`🌐 GET ${fullUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      const responseText = await response.text();

      if (!response.ok) {
        console.error(`❌ Error response: ${responseText}`);
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const parsedResponse = JSON.parse(responseText);
      console.log(`✅ GET Response:`, parsedResponse);

      return parsedResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}
