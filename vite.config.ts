import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      tsDecorators: true,
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  esbuild: {
    target: 'esnext',
    logOverride: { 
      'this-is-undefined-in-esm': 'silent'
    }
  },
  build: {
    target: 'esnext',
    // Aggressive CSS optimization for render-blocking elimination
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        // Optimized chunk splitting to eliminate icon request chains
        manualChunks: (id: string) => {
          // Core React bundle - highest priority
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-core';
          }
          
          // Critical UI bundle - icons and basic components
          if (id.includes('lucide-react') || id.includes('@radix-ui')) {
            return 'ui-core';
          }
          
          // Critical path chunks
          if (id.includes('src/pages/Index')) return 'page-index';
          if (id.includes('src/components/layout')) return 'layout-core';
          
          // Supabase and query - often needed together
          if (id.includes('@supabase') || id.includes('@tanstack/react-query')) {
            return 'data-core';
          }
          
          // Heavy features - defer loading
          if (id.includes('src/components/med-mng')) return 'med-mng';
          if (id.includes('framer-motion')) return 'animations';
          if (id.includes('src/components/onboarding')) return 'onboarding';
          
          // Other vendor libraries
          if (id.includes('node_modules')) return 'vendor-misc';
        },
        // Optimize file names for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            // Split CSS into smaller chunks based on content
            if (assetInfo.name.includes('index')) return 'assets/css/main-[hash].css';
            return 'assets/css/[name]-[hash].css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
      onwarn(warning, warn) {
        if (warning.code === 'TS6305') return;
        warn(warning);
      }
    },
    // Enable tree shaking optimization  
    minify: true,
    // Optimize bundle size and eliminate render-blocking
    chunkSizeWarningLimit: 500, // Smaller chunks for better loading
    assetsInlineLimit: 2048, // Inline smaller assets to reduce requests
    reportCompressedSize: false // Faster builds
  }
}));