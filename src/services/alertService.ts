import axios from 'axios';

export type IncidentType =
  | 'EXTRACTION_FAILURE'
  | 'PAYMENT_FAILURE'
  | 'BACKEND_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'SUPABASE_DOWN'
  | 'ERROR_PATTERN_DETECTED';

export interface Incident {
  type: IncidentType;
  message: string;
  details?: unknown;
  severity?: string;
}

const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
const slackWebhook = process.env.SLACK_WEBHOOK_URL;

export async function notifyIncident(incident: Incident): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  const text = `[${incident.type}] ${incident.message}`;

  if (discordWebhook) {
    tasks.push(
      axios
        .post(discordWebhook, { content: text })
        .catch((err) => console.error('Discord alert failed', err))
    );
  }

  if (slackWebhook) {
    tasks.push(
      axios
        .post(slackWebhook, { text, incident })
        .catch((err) => console.error('Slack alert failed', err))
    );
  }

  if (tasks.length) {
    await Promise.all(tasks);
  }
}
