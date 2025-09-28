// Configuration d'optimisation du build pour la production

// Vite configuration optimizations
export const viteOptimizations = {
  build: {
    // Optimisations de build
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        unused: true,
        dead_code: true
      },
      mangle: {
        properties: {
          regex: /^_/
      }
    }
    },
    
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
          'query-vendor': ['@tanstack/react-query'],
          
          // Feature chunks
          'music-features': [
            './src/components/optimized/OptimizedMusicPlayer',
            './src/components/optimized/OptimizedGenerator',
            './src/hooks/music/useMusicTranslation'
          ],
          'dashboard-features': [
            './src/components/optimized/OptimizedDashboard',
            './src/hooks/useModernState'
          ],
          'language-features': [
            './src/contexts/LanguageContext',
            './src/hooks/useOptimizedTranslation'
          ]
        }
      }
    },
    
    // Asset optimizations
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    
    // Source maps pour debugging en prod
    sourcemap: false // Désactivé pour de meilleures performances
  },
  
  // Optimisations du serveur de développement
  server: {
    hmr: {
      overlay: false
    }
  },
  
  // Plugins d'optimisation
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'date-fns',
      'clsx'
    ],
    exclude: [
      // Exclure les gros packages qui ne sont pas souvent utilisés
      '@storybook/*'
    ]
  }
};

// Configuration webpack fallback pour les projets utilisant webpack
export const webpackOptimizations = {
  resolve: {
    alias: {
      '@': './src'
    }
  },
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20
        },
        ui: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 15
        }
      }
    },
    
    usedExports: true,
    sideEffects: false,
    
    minimizer: [
      // Configuration Terser pour JS
      {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.warn'],
            unused: true
          },
          mangle: true,
          format: {
            comments: false
          }
        }
      }
    ]
  }
};

// Configuration des services workers pour PWA
export const serviceWorkerConfig = {
  workbox: {
    // Stratégies de cache
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
          }
        }
      },
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 3,
          expiration: {
            maxAgeSeconds: 60 * 60 * 24, // 1 jour
          }
        }
      }
    ],
    
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true
  }
};

// Configuration des headers de performance
export const performanceHeaders = {
  // Security headers
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Performance headers
  'Cache-Control': 'public, max-age=31536000, immutable',
  'Expires': new Date(Date.now() + 31536000000).toUTCString(),
  
  // Compression
  'Vary': 'Accept-Encoding',
  
  // Preload hints
  'Link': [
    '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
    '</css/app.css>; rel=preload; as=style'
  ].join(', ')
};

// Configuration des métriques Web Vitals
export const webVitalsConfig = {
  // Seuils pour Core Web Vitals
  thresholds: {
    LCP: 2.5, // Largest Contentful Paint
    FID: 100, // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    FCP: 1.8,  // First Contentful Paint
    TTFB: 600  // Time to First Byte
  },
  
  // Configuration du reporting
  reporting: {
    endpoint: '/api/vitals',
    sampleRate: 0.1, // 10% des sessions
    enableInDevelopment: false
  }
};

// Optimisations CSS
export const cssOptimizations = {
  // PurgeCSS configuration
  purge: {
    enabled: true,
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html'
    ],
    safelist: [
      // Classes dynamiques à préserver
      /^animate-/,
      /^transition-/,
      /^duration-/,
      /^ease-/,
      /^delay-/
    ]
  },
  
  // Autoprefixer
  autoprefixer: {
    browsers: ['> 1%', 'last 2 versions', 'not dead']
  },
  
  // CSS Nano optimizations
  cssnano: {
    preset: ['default', {
      discardComments: { removeAll: true },
      normalizeWhitespace: true,
      mergeLonghand: true,
      mergeRules: true
    }]
  }
};

// Configuration de monitoring des performances
export const performanceMonitoring = {
  // Budget de performance
  budgets: {
    javascript: '250kb', // Taille maximale du JS
    css: '50kb',         // Taille maximale du CSS
    images: '500kb',     // Taille maximale des images
    total: '1mb'         // Taille totale maximale
  },
  
  // Alertes de performance
  alerts: {
    slowQueries: 1000,     // Requêtes > 1s
    memoryUsage: 100,      // Usage mémoire > 100MB
    bundleSize: 500000,    // Taille bundle > 500KB
    renderTime: 16         // Temps de render > 16ms
  },
  
  // Métriques personnalisées
  customMetrics: [
    'component_render_time',
    'api_response_time',
    'user_interaction_delay',
    'memory_usage',
    'bundle_load_time'
  ]
};

// Utilitaires d'analyse des performances
export const performanceAnalysis = {
  // Analyse des bundles
  analyzeBundles: () => {
    // Logic pour analyser la taille des bundles
    console.log('Analyzing bundle sizes...');
  },
  
  // Audit des performances
  auditPerformance: () => {
    // Logic pour auditer les performances
    console.log('Running performance audit...');
  },
  
  // Rapport de métriques
  generateReport: () => {
    // Logic pour générer un rapport
    console.log('Generating performance report...');
  }
};