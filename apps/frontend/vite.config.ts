import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'MED-MNG - Plateforme d\'Apprentissage Médical',
        short_name: 'MED-MNG',
        description: 'Plateforme d\'apprentissage médical avec IA : 367 items EDN, génération musicale, et outils d\'étude avancés',
        theme_color: '#3B82F6',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['education', 'medical', 'productivity'],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        // Cache agressif de tous les assets statiques
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,webp,jpg,jpeg}'],
        globIgnores: ['**/node_modules/**/*', '**/dev-dist/**/*'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB max par fichier
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache agressif des images avec support WebP
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200, // Augmenté pour plus d'images
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 jours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache des assets JavaScript et CSS
            urlPattern: /\.(?:js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
              }
            }
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    // 📊 Bundle analysis - generates stats.html after build
    mode === 'production' && visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // or 'sunburst', 'network'
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
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

    // ⚡ PERFORMANCE BUDGET - Prevent bundle bloat
    // ----------------------------------------------
    // Warns if individual chunks exceed 200 KB (uncompressed)
    // Current violations (as of 2025-11-24):
    //   - pdf-*.js: 590 KB (176 KB gzipped) - jsPDF + html2canvas [lazy loaded ✓]
    //   - index-*.js: 473 KB (127 KB gzipped) - Main bundle [needs further splitting]
    //   - charts-*.js: 432 KB (114 KB gzipped) - Recharts library [lazy loadable]
    //   - xlsx-*.js: 429 KB (143 KB gzipped) - Excel export [lazy loaded ✓]
    //
    // ℹ️ Why 200 KB limit?
    //   - Industry best practice for 3G networks (1-2s parse time)
    //   - Forces code splitting for better caching
    //   - Prevents accidental bundle bloat from new dependencies
    //
    // 🎯 Next actions when warning appears:
    //   1. Check if library can be lazy loaded (dynamic import)
    //   2. Consider lighter alternatives
    //   3. Split into smaller chunks if possible
    //   4. Document why large size is acceptable (if unavoidable)
    chunkSizeWarningLimit: 200, // KB (default: 500 KB)

    // ⚡ OPTIMIZATION: Chunk splitting for better caching
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'TS6305') return;
        warn(warning);
      },

      // ⚡ ADVANCED CHUNKING STRATEGY
      // Separates code into smaller, independently cacheable chunks
      output: {
        manualChunks: {
          // React and core dependencies
          'react-core': ['react', 'react-dom', 'react-router-dom'],

          // Query and state management
          'react-query': ['@tanstack/react-query', '@tanstack/react-query-persist-client'],
          'state': ['zustand'],

          // UI Components
          'ui-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-scroll-area'
          ],
          'ui-form': ['react-hook-form', 'zod'],

          // Utilities
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],

          // Heavy libraries
          'charts': ['recharts'],
          'icons': ['lucide-react'],
          'animations': ['framer-motion'],

          // Audio & Media
          'audio': [],

          // Large third-party packages
          'xlsx': ['xlsx'],
          'pdf': ['jspdf', 'html2canvas'],
        },

        // Optimize chunk names for production
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  }
}));