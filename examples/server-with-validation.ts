/**
 * Example Express server with centralized environment validation
 * This demonstrates how to properly validate environment variables before starting the server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { 
  validateEnvironment, 
  getEnvironment, 
  getSecurityConfig,
  getCorsConfig,
  getRateLimitConfig,
  createEnvValidationMiddleware,
  isProduction,
  isDevelopment
} from '@med-music/config';

/**
 * Initialize and start the Express server with proper environment validation
 */
async function startServer() {
  try {
    // ✅ STEP 1: Validate environment variables BEFORE doing anything else
    console.log('🔍 Validating environment configuration...');
    const env = validateEnvironment();
    
    // ✅ STEP 2: Create Express app with validated configuration
    const app = express();
    
    // ✅ STEP 3: Apply security middleware with validated config
    const securityConfig = getSecurityConfig();
    const corsConfig = getCorsConfig();
    
    // Security headers
    app.use(helmet(securityConfig.helmet));
    
    // CORS with validated origins
    app.use(cors(corsConfig));
    
    // Rate limiting with validated config
    const rateLimitConfig = getRateLimitConfig();
    // Note: In real implementation, you'd use express-rate-limit here
    console.log(`🛡️  Rate limiting: ${rateLimitConfig.maxRequests} requests per ${rateLimitConfig.windowMs}ms`);
    
    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // ✅ STEP 4: Environment validation middleware for all routes
    app.use(createEnvValidationMiddleware());
    
    // ✅ STEP 5: Health check endpoint with environment info
    app.get('/health', (req, res) => {
      const env = getEnvironment();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        features: {
          musicGeneration: env.ENABLE_MUSIC_GENERATION,
          realTimeFeatures: env.ENABLE_REAL_TIME_FEATURES,
          analytics: env.ENABLE_ANALYTICS,
        },
        // Only expose non-sensitive config info
        config: {
          port: env.PORT,
          supabaseConfigured: !!env.VITE_SUPABASE_URL,
          externalApisConfigured: {
            openai: !!env.OPENAI_API_KEY,
            suno: !!env.SUNO_API_KEY,
          }
        }
      });
    });
    
    // ✅ STEP 6: API routes with environment-aware logic
    app.get('/api/config', (req, res) => {
      const env = getEnvironment();
      
      // Only send client-safe configuration
      res.json({
        supabaseUrl: env.VITE_SUPABASE_URL,
        supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY,
        features: {
          musicGeneration: env.ENABLE_MUSIC_GENERATION,
          realTimeFeatures: env.ENABLE_REAL_TIME_FEATURES,
          analytics: env.ENABLE_ANALYTICS,
        },
        environment: env.NODE_ENV,
        // Never send sensitive keys to client
      });
    });
    
    // ✅ STEP 7: Environment-specific route protection
    if (isProduction()) {
      // Production-only routes
      app.get('/admin/*', (req, res, next) => {
        // Add admin authentication here
        console.log('🔒 Admin route accessed in production');
        next();
      });
    }
    
    if (isDevelopment()) {
      // Development-only routes
      app.get('/debug/env', (req, res) => {
        const env = getEnvironment();
        res.json({
          message: 'Debug endpoint - development only',
          environment: env.NODE_ENV,
          // Show sanitized environment info for debugging
          variables: Object.keys(process.env).filter(key => 
            key.startsWith('VITE_') || 
            key.startsWith('NODE_') || 
            key.startsWith('PORT') ||
            key.startsWith('LOG_') ||
            key.startsWith('ENABLE_')
          ).reduce((acc, key) => {
            acc[key] = process.env[key];
            return acc;
          }, {} as Record<string, string | undefined>)
        });
      });
    }
    
    // Error handling middleware
    app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Server error:', error);
      
      if (isDevelopment()) {
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
          stack: error.stack,
        });
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'Something went wrong',
        });
      }
    });
    
    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`,
      });
    });
    
    // ✅ STEP 8: Start server with validated port
    const server = app.listen(env.PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`   - Environment: ${env.NODE_ENV}`);
      console.log(`   - Port: ${env.PORT}`);
      console.log(`   - Supabase: ${env.VITE_SUPABASE_URL}`);
      console.log(`   - Health check: http://localhost:${env.PORT}/health`);
      
      if (isDevelopment()) {
        console.log(`   - Debug info: http://localhost:${env.PORT}/debug/env`);
      }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('VITE_SUPABASE_URL')) {
        console.error('💡 Make sure VITE_SUPABASE_URL is set in your .env file');
        console.error('   Example: VITE_SUPABASE_URL=https://your-project.supabase.co');
      }
      
      if (error.message.includes('VITE_SUPABASE_ANON_KEY')) {
        console.error('💡 Make sure VITE_SUPABASE_ANON_KEY is set in your .env file');
        console.error('   Get it from: https://supabase.com/dashboard/project/your-project/settings/api');
      }
      
      if (error.message.includes('PORT')) {
        console.error('💡 Make sure PORT is a valid number between 1 and 65535');
      }
    }
    
    console.error('\n📋 Checklist:');
    console.error('  □ Copy .env.example to .env');
    console.error('  □ Fill in required values in .env');
    console.error('  □ Check Supabase project settings');
    console.error('  □ Verify API keys are valid');
    
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    console.error('❌ Unhandled error during server startup:', error);
    process.exit(1);
  });
}

export { startServer };