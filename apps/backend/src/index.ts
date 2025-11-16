import { createServer } from './server/app';
import { log } from '../supabase/functions/med-mng-api/logger';

const port = Number(process.env.PORT || 3000);
const app = createServer();

const server = app.listen(port, () => {
  log('info', `Med-MNG backend listening on port ${port}`);
});

const shutdown = (signal: string) => {
  log('warn', `Received ${signal}, closing HTTP server`);
  server.close(() => {
    log('info', 'HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
