import { describe, test, expect } from '@jest/globals';

const LOG_TAG = '[extract-edn-objectifs]';
const FUNCTION_SLUG = 'extract-edn-objectifs';
const LOGS_POLL_INTERVAL_MS = 2000;
const LOGS_MAX_ATTEMPTS = 10;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getProjectRef = (url: string) => {
  const parsed = new URL(url);
  return parsed.hostname.split('.')[0];
};

const extractLogMessages = (payload: unknown): string[] => {
  const messages: string[] = [];

  const pushMessage = (entry: any) => {
    if (!entry) return;
    if (typeof entry === 'string') {
      messages.push(entry);
      return;
    }
    if (typeof entry.message === 'string') {
      messages.push(entry.message);
    }
    if (typeof entry.event_message === 'string') {
      messages.push(entry.event_message);
    }
    if (typeof entry.log === 'string') {
      messages.push(entry.log);
    }
  };

  if (Array.isArray(payload)) {
    payload.forEach(pushMessage);
  } else if (payload && typeof payload === 'object') {
    const maybeLogs = (payload as any).logs || (payload as any).data || (payload as any).result;
    if (Array.isArray(maybeLogs)) {
      maybeLogs.forEach(pushMessage);
    }
  }

  return messages;
};

describe('Supabase Functions logs - extract-edn-objectifs', () => {
  test(
    'logs contain explicit extract-edn-objectifs entries for the current session',
    async () => {
      if (!supabaseUrl || !supabaseAccessToken) {
        throw new Error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_ACCESS_TOKEN for logs test.');
      }

      const projectRef = getProjectRef(supabaseUrl);
      const functionUrl = new URL(`/functions/v1/${FUNCTION_SLUG}`, supabaseUrl);
      const startResponse = await fetch(functionUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      expect(startResponse.status).toBe(200);
      const startPayload = await startResponse.json();
      const sessionId = startPayload?.session_id;

      expect(sessionId).toBeTruthy();

      const logsUrl = new URL(`https://api.supabase.com/v1/projects/${projectRef}/functions/${FUNCTION_SLUG}/logs`);
      logsUrl.searchParams.set('limit', '100');

      let found = false;
      let lastMessages: string[] = [];

      for (let attempt = 0; attempt < LOGS_MAX_ATTEMPTS; attempt += 1) {
        const logsResponse = await fetch(logsUrl.toString(), {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`,
          },
        });

        expect(logsResponse.status).toBe(200);
        const logsPayload = await logsResponse.json();
        lastMessages = extractLogMessages(logsPayload);

        found = lastMessages.some(message => message.includes(LOG_TAG) && message.includes(sessionId));
        if (found) break;

        await delay(LOGS_POLL_INTERVAL_MS);
      }

      if (!found) {
        const preview = lastMessages.slice(0, 10).join('\n');
        throw new Error(`Missing logs for session ${sessionId}. Last messages:\n${preview}`);
      }
    },
    60000
  );
});
