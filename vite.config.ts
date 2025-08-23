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
    sourcemap: true, // Enable source maps for debugging and SEO tools
    // Aggressive CSS optimization for render-blocking elimination
    cssCodeSplit: true,
    rollupOptions: {
      // Optimize tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      },
      output: {
        // Optimized chunk splitting to eliminate icon request chains
        manualChunks: (id: string) => {
          // Core React bundle - highest priority, smallest size
          if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) {
            return 'react-core';
          }
          
          // Router - separate for route-based loading
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          
          // Critical UI bundle - only essential components
          if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-button')) {
            return 'ui-critical';
          }
          
          // Non-critical UI components
          if (id.includes('@radix-ui') || id.includes('cmdk')) {
            return 'ui-extended';
          }
          
          // Icons - defer unless critical
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Critical pages only
          if (id.includes('src/pages/Index')) return 'page-index';
          
          // Layout components
          if (id.includes('src/components/layout')) return 'layout';
          
          // Supabase - defer until needed
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // React Query - defer until needed  
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // Heavy features - completely defer
          if (id.includes('src/components/med-mng')) return 'features-medical';
          if (id.includes('src/components/onboarding')) return 'features-onboarding';
          if (id.includes('src/components/admin')) return 'features-admin';
          if (id.includes('src/components/audit')) return 'features-audit';
          if (id.includes('src/components/edn')) return 'features-edn';
          if (id.includes('src/components/ecos')) return 'features-ecos';
          
          // Animation libraries - defer
          if (id.includes('framer-motion')) return 'animations';
          
          // Form libraries - defer
          if (id.includes('react-hook-form') || id.includes('@hookform')) return 'forms';
          
          // Chart libraries - defer
          if (id.includes('recharts')) return 'charts';
          
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
    chunkSizeWarningLimit: 300, // Even smaller chunks for better loading
    assetsInlineLimit: 1024, // Inline only very small assets
    reportCompressedSize: false // Faster builds
  }
}));