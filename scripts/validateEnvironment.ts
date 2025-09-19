import { validateEnvironment } from '../packages/config/src/env';

(async function main() {
  try {
    const env = validateEnvironment();
    console.log('✅ Environment validation successful');
    console.log(`   - Environment: ${env.NODE_ENV}`);
    console.log(`   - Supabase URL: ${env.VITE_SUPABASE_URL}`);
    console.log(`   - Music generation enabled: ${env.ENABLE_MUSIC_GENERATION}`);
  } catch (error) {
    console.error('❌ Environment validation failed');
    console.error(error);
    process.exit(1);
  }
})();
