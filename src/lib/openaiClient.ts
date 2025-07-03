import axios, { AxiosError, AxiosInstance } from "axios";

export interface OpenAIError {
  code: string;
  message: string;
  type: string;
}

export class OpenAIApiClient {
  private client: AxiosInstance;
  private readonly maxRetries = 3;

  constructor(
    private baseURL = "https://api.openai.com/v1",
    private apiKey = process.env.OPENAI_API_KEY as string
  ) {
    if (!this.apiKey) throw new Error("Missing OPENAI_API_KEY env var");
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 60_000,
    });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.requestWithRetry<T>("post", endpoint, data);
  }

  async get<T>(endpoint: string, params?: unknown): Promise<T> {
    return this.requestWithRetry<T>("get", endpoint, undefined, params);
  }

  // --- privates -------------------------------------------------------------

  private async requestWithRetry<T>(
    method: "post" | "get",
    url: string,
    data?: unknown,
    params?: unknown
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const res =
          method === "post"
            ? await this.client.post(url, data)
            : await this.client.get(url, { params });

        return res.data as T;
      } catch (err) {
        if (attempt === this.maxRetries) throw this.normalizeErr(err);
        // back-off (2^n * 500 ms)
        await new Promise(r => setTimeout(r, 500 * 2 ** attempt));
      }
    }
    // unreachable
    throw new Error("retry logic failed");
  }

  private normalizeErr(err: unknown) {
    if (err instanceof OpenAIRequestError) return err;
    if ((err as AxiosError).isAxiosError) {
      const ax = err as AxiosError;
      const code = ax.response?.status ?? 500;
      const errorData = ax.response?.data as any;
      const message = errorData?.error?.message || ax.message;
      return new OpenAIRequestError(code, message);
    }
    return err;
  }
}

export class OpenAIRequestError extends Error {
  constructor(public code: number, message: string) {
    super(`[OpenAI ${code}] ${message}`);
  }
}