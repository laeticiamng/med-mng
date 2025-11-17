import { createServer } from './server/app';
import { log } from '../supabase/functions/med-mng-api/logger';

const port = Number(process.env.PORT || 3000);
const app = createServer();

const server = app.listen(port, () => {
  log('info', `Med-MNG backend listening on port ${port}`);
});

const shutdown = (signal: string) => {
  log('warn', `Received ${signal}, starting graceful shutdown`);

  // Timeout pour forcer la fermeture après 30 secondes
  const forceShutdownTimeout = setTimeout(() => {
    log('error', 'Forced shutdown after timeout');
    process.exit(1);
  }, 30_000);

  server.close(() => {
    clearTimeout(forceShutdownTimeout);
    log('info', 'HTTP server closed gracefully');
    process.exit(0);
  });

  // Arrêter d'accepter de nouvelles connexions immédiatement
  server.closeAllConnections?.();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  log('error', 'Uncaught exception', { error });
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  log('error', 'Unhandled rejection', { reason });
  shutdown('unhandledRejection');
});
