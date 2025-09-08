/**
 * 🚀 CONFIGURATION VITE OPTIMISÉE MED-MNG v2.0
 * Bundle splitting avancé et optimisations maximales
 */

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// Fonction utilitaire pour analyser les dépendances
const isVendorChunk = (id: string) => {
  return /node_modules/.test(id);
};

const getChunkName = (id: string) => {
  // Radix UI components
  if (id.includes('@radix-ui')) return 'ui-radix';
  // React ecosystem
  if (id.includes('react') || id.includes('framer-motion')) return 'vendor-react';
  // Supabase & API
  if (id.includes('@supabase') || id.includes('@tanstack')) return 'vendor-api';
  // Utilities
  if (id.includes('date-fns') || id.includes('clsx') || id.includes('lucide')) return 'vendor-utils';
  // Default vendor
  return 'vendor-misc';
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false, // Désactiver l'overlay d'erreur en dev pour de meilleures performances
      },
    },
    
    plugins: [
      react({
        tsDecorators: true,
        // Optimisations SWC pour de meilleures performances
      }),
      
      mode === 'development' && componentTagger(),
      
      // Analyzer de bundle en mode développement
      mode === 'development' && visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
      }),
    ].filter(Boolean),
    
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Optimisation : remplacer les variables globales
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
    },
    
    esbuild: {
      target: 'esnext',
      logOverride: { 
        'this-is-undefined-in-esm': 'silent'
      },
      // Optimisations de build
      treeShaking: true,
      minifyIdentifiers: mode === 'production',
      minifySyntax: mode === 'production',
      minifyWhitespace: mode === 'production',
    },
    
    // Optimisations CSS
    css: {
      devSourcemap: mode === 'development',
      preprocessorOptions: {
        // Optimiser les imports CSS
        additionalData: mode === 'production' ? '' : undefined,
      },
    },
    
    build: {
      target: 'esnext',
      sourcemap: mode === 'development' ? 'inline' : false,
      
      // Optimisations de bundle
      cssCodeSplit: true,
      minify: 'esbuild', // esbuild est plus rapide que terser
      
      rollupOptions: {
        // Cache externe pour les dépendances stables
        external: mode === 'production' ? [] : undefined,
        
        output: {
          // Stratégie avancée de chunking
          manualChunks: (id) => {
            // Vendor chunks optimisés
            if (isVendorChunk(id)) {
              return getChunkName(id);
            }
            
            // Chunks par fonctionnalité
            if (id.includes('/pages/')) {
              const match = id.match(/\/pages\/([^/]+)/);
              return match ? `page-${match[1].toLowerCase()}` : 'pages';
            }
            
            if (id.includes('/components/')) {
              // Grouper les composants par catégorie
              if (id.includes('/admin/')) return 'components-admin';
              if (id.includes('/med-mng/')) return 'components-medmng';
              if (id.includes('/ui/')) return 'components-ui';
              return 'components-misc';
            }
            
            if (id.includes('/hooks/')) return 'hooks';
            if (id.includes('/contexts/')) return 'contexts';
            if (id.includes('/lib/')) return 'lib';
            if (id.includes('/utils/')) return 'utils';
            
            return undefined; // Laisser Rollup décider pour le reste
          },
          
          // Noms de fichiers optimisés pour le cache
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId;
            if (facadeModuleId) {
              const name = facadeModuleId
                .split('/')
                .pop()
                ?.replace(/\.\w+$/, '') || 'chunk';
              return `assets/js/${name}-[hash].js`;
            }
            return `assets/js/[name]-[hash].js`;
          },
          
          entryFileNames: 'assets/js/[name]-[hash].js',
          
          // Optimisation des assets
          assetFileNames: (assetInfo) => {
            if (assetInfo.name) {
              // CSS files
              if (assetInfo.name.endsWith('.css')) {
                return 'assets/css/[name]-[hash].css';
              }
              // Images
              if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
                return 'assets/images/[name]-[hash][extname]';
              }
              // Fonts
              if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                return 'assets/fonts/[name]-[hash][extname]';
              }
            }
            return 'assets/misc/[name]-[hash][extname]';
          },
        },
        
        onwarn(warning, warn) {
          // Ignorer certains warnings non-critiques
          if (warning.code === 'TS6305') return;
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          if (warning.code === 'THIS_IS_UNDEFINED') return;
          warn(warning);
        },
      },
      
      // Optimisations de taille
      chunkSizeWarningLimit: 800, // Plus strict que 1000
      assetsInlineLimit: 2048, // Plus petit pour éviter les gros inline
      
      // Optimisations de minification
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true, // Supprimer les console.log en production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
      } : undefined,
    },
    
    // Optimisations de développement
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'framer-motion',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },
    
    // Pre-bundling pour de meilleures performances
    ...(mode === 'development' && {
      server: {
        warmup: {
          clientFiles: [
            './src/App.tsx',
            './src/pages/Index.tsx', 
            './src/pages/Generator.tsx',
          ],
        },
      },
    }),
  };
});