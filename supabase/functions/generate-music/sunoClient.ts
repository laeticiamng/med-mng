
// Suno API Client pour Edge Functions Supabase
export interface SunoError {
  code: number;
  msg: string;
}

export class SunoApiClient {
  private readonly maxRetries = 3;
  private readonly baseURL = "https://apibox.erweima.ai";
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Missing SUNO_API_KEY");
    this.apiKey = apiKey;
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.requestWithRetry<T>("POST", endpoint, data);
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.requestWithRetry<T>("GET", url);
  }

  private async requestWithRetry<T>(
    method: string,
    url: string,
    data?: unknown
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const options: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
        };

        if (data && method !== "GET") {
          options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.baseURL}${url}`, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Suno API Error ${response.status}:`, errorText);
          throw new SunoRequestError(response.status, errorText);
        }

        const result = await response.json();
        
        // Vérifier le format de réponse Suno avec code/data/msg
        if (result.code !== undefined) {
          if (result.code !== 200) {
            throw new SunoRequestError(result.code, result.msg || 'Unknown Suno API error');
          }
          return result.data as T;
        }
        
        return result as T;
      } catch (err) {
        console.error(`Attempt ${attempt + 1}/${this.maxRetries + 1} failed:`, err);
        if (attempt === this.maxRetries) throw this.normalizeError(err);
        // Exponential backoff (2^n * 500 ms)
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
    throw new Error("Retry logic failed");
  }

  private normalizeError(err: unknown): Error {
    if (err instanceof SunoRequestError) return err;
    if (err instanceof Error) {
      return new SunoRequestError(500, err.message);
    }
    return new Error("Unknown error occurred");
  }
}

export class SunoRequestError extends Error {
  constructor(public code: number, message: string) {
    super(`[Suno ${code}] ${message}`);
  }
}
