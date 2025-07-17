export const config = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },
  suno: {
    apiUrl: process.env.SUNO_API_URL || 'https://api.suno.ai',
    apiKey: process.env.SUNO_API_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.SMTP_FROM || 'MED-MNG <noreply@med-mng.com>',
  },
  appUrl: process.env.APP_URL || 'http://localhost:3000',
}
