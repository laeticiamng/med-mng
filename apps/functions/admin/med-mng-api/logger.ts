export const log = (
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: unknown
) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta) {
    console[level === 'error' ? 'error' : 'log'](base, meta);
  } else {
    console[level === 'error' ? 'error' : 'log'](base);
  }
};
