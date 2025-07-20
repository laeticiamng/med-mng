
import axios, { AxiosError, AxiosInstance } from "axios";

export interface SunoError {
  code: number;
  msg: string;
}

export class SunoApiClient {
  private client: AxiosInstance;
  private readonly maxRetries = 3;

  constructor(
    private baseURL = "https://apibox.erweima.ai",
    private apiKey = process.env.SUNO_API_KEY as string
  ) {
    if (!this.apiKey) throw new Error("Missing SUNO_API_KEY env var");
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 30_000,
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

        const { code, data: payload, msg } = res.data as {
          code: number;
          data: T;
          msg: string;
        };

        if (code !== 200) throw new SunoRequestError(code, msg);
        return payload;
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
    if (err instanceof SunoRequestError) return err;
    if ((err as AxiosError).isAxiosError) {
      const ax = err as AxiosError;
      const code = ax.response?.status ?? 500;
      return new SunoRequestError(code, ax.message);
    }
    return err;
  }
}

export class SunoRequestError extends Error {
  constructor(public code: number, message: string) {
    super(`[Suno ${code}] ${message}`);
  }
}
