import axios from 'axios';

export type IncidentType =
  | 'EXTRACTION_FAILURE'
  | 'PAYMENT_FAILURE'
  | 'BACKEND_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'SUPABASE_DOWN'
  | 'ERROR_PATTERN_DETECTED'
  | 'UPTIME_CHECK_FAILED';

export interface Incident {
  type: IncidentType;
  message: string;
  details?: unknown;
  severity?: string;
}

const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
const slackWebhook = process.env.SLACK_WEBHOOK_URL;
const resendApiKey = process.env.RESEND_API_KEY;
const alertEmail = process.env.ALERT_EMAIL;
const alertFromEmail = process.env.ALERT_FROM_EMAIL || 'MedMNG Alerts <alerts@medmng.app>';

export async function notifyIncident(incident: Incident): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  const severity = incident.severity ?? 'warning';
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

  if (resendApiKey && alertEmail) {
    const recipients = alertEmail
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length > 0) {
      const htmlBody = `
        <h2>Incident ${incident.type}</h2>
        <p><strong>Message :</strong> ${incident.message}</p>
        <p><strong>Gravité :</strong> ${severity}</p>
        <p><strong>Horodatage :</strong> ${new Date().toISOString()}</p>
        <pre style="background:#f4f4f5;padding:12px;border-radius:6px;white-space:pre-wrap;">${
          incident.details ? JSON.stringify(incident.details, null, 2) : 'Aucun détail fourni'
        }</pre>
      `;

      tasks.push(
        axios
          .post(
            'https://api.resend.com/emails',
            {
              from: alertFromEmail,
              to: recipients,
              subject: `[${severity}] ${incident.type}`,
              html: htmlBody,
            },
            {
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
            }
          )
          .catch((err) => console.error('Email alert failed', err))
      );
    }
  }

  if (tasks.length) {
    await Promise.all(tasks);
  }
}
