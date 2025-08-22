import React from 'react';
import ReactDOM from 'react-dom/client';
import { validateEnvironment } from '@med-music/config';

// Import the app after environment validation
import App from './App';
import './index.css';

/**
 * Initialize application with environment validation
 */
async function initializeApp() {
  try {
    // Validate environment variables before starting the app
    console.log('🚀 Initializing Med Music Platform...');
    
    const env = validateEnvironment();
    
    // Additional client-side validations
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Missing required Supabase configuration');
    }
    
    // Check if running in development and show debug info
    if (env.NODE_ENV === 'development') {
      console.log('🔧 Development mode active');
      console.log('📊 Environment info:', {
        supabaseUrl: env.VITE_SUPABASE_URL,
        features: {
          musicGeneration: env.ENABLE_MUSIC_GENERATION,
          analytics: env.ENABLE_ANALYTICS,
          realTime: env.ENABLE_REAL_TIME_FEATURES,
        }
      });
    }
    
    // Initialize React app
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('✅ Med Music Platform initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    
    // Show user-friendly error message
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 2rem;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 500px;
        ">
          <h1 style="margin: 0 0 1rem 0; font-size: 2rem;">🚫 Configuration Error</h1>
          <p style="margin: 0 0 1.5rem 0; opacity: 0.9; line-height: 1.6;">
            The application cannot start due to missing or invalid configuration.
          </p>
          <details style="
            text-align: left;
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
          ">
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 0.5rem;">
              Technical Details
            </summary>
            <pre style="
              white-space: pre-wrap;
              word-break: break-word;
              font-family: monospace;
              font-size: 0.8rem;
              margin: 0;
              opacity: 0.8;
            ">${error instanceof Error ? error.message : String(error)}</pre>
          </details>
          <p style="margin: 0; font-size: 0.9rem; opacity: 0.7;">
            Check the browser console for more information.
          </p>
        </div>
      </div>
    `;
  }
}

// Start the application
initializeApp();