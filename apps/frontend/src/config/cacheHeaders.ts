/**
 * Cache Headers Configuration
 * Recommended HTTP headers for optimal performance and caching
 *
 * Deploy these headers on your server (Nginx, Express, Vercel, etc.)
 * to maximize browser caching and CDN efficiency
 */

/**
 * Recommended headers for different file types
 * These should be configured on your server
 */
export const cacheHeaderConfig = {
  // ⚡ PERMANENT ASSETS (with content hash)
  // These have hash in filename, so they're safe to cache forever
  permanentAssets: {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
    'Access-Control-Allow-Origin': '*',
  },

  // ⚡ VERSIONED ASSETS
  // Intermediate caching for versioned files
  versionedAssets: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },

  // ⚡ DYNAMIC HTML/INDEX
  // Don't cache HTML files to ensure users get latest code
  html: {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Content-Type': 'text/html; charset=utf-8',
  },

  // ⚡ API RESPONSES
  // Short-lived cache for API endpoints
  api: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600', // 5 min + 1 hour stale
    'Content-Type': 'application/json; charset=utf-8',
  },

  // ⚡ API RESPONSES (REAL-TIME)
  apiRealtime: {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Content-Type': 'application/json; charset=utf-8',
  },

  // ⚡ STATIC IMAGES
  images: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': 'image/*',
  },

  // ⚡ FONTS
  fonts: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Access-Control-Allow-Origin': '*',
  },

  // ⚡ STYLESHEETS
  stylesheets: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },

  // ⚡ SCRIPTS
  scripts: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },

  // ⚡ SERVICE WORKER
  // Never cache service worker - it needs to check for updates
  serviceWorker: {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Service-Worker-Allowed': '/',
    'Content-Type': 'application/javascript',
  },
};

/**
 * Server configuration examples
 */

// ========== NGINX EXAMPLE ==========
export const nginxConfig = `
# Cache permanent assets (with hash in filename)
location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header Access-Control-Allow-Origin "*";
}

# Cache images aggressively
location ~* \\.(?:png|jpg|jpeg|svg|gif|webp|avif)$ {
  expires 90d;
  add_header Cache-Control "public, max-age=7776000, immutable";
}

# Cache fonts forever
location ~* \\.(?:woff|woff2|ttf|otf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header Access-Control-Allow-Origin "*";
}

# Cache API responses with stale-while-revalidate
location /api/ {
  add_header Cache-Control "public, max-age=300, stale-while-revalidate=3600";
  add_header Content-Type "application/json";
}

# Cache real-time API endpoints with validation
location /api/realtime/ {
  add_header Cache-Control "public, max-age=0, must-revalidate";
}

# Never cache HTML or service worker
location ~* \\.(html|json)$ {
  expires -1;
  add_header Cache-Control "public, max-age=0, must-revalidate";
}

location = /service-worker.js {
  expires -1;
  add_header Cache-Control "public, max-age=0, must-revalidate";
  add_header Service-Worker-Allowed "/";
}

# Gzip compression
gzip on;
gzip_min_length 1000;
gzip_types text/plain text/css text/javascript application/json application/javascript application/xml+rss;
`;

// ========== EXPRESS EXAMPLE ==========
export const expressConfig = `
import express from 'express';
import compression from 'compression';
import logger from '@/lib/logger';

const app = express();

// Enable gzip compression
app.use(compression());

// Permanent assets with hash
app.use(express.static('dist', {
  maxAge: '1y',
  etag: false,
  setHeaders: (res, path) => {
    if (path.match(/\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.set('Access-Control-Allow-Origin', '*');
    }
  }
}));

// API caching
app.use('/api/', (req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('/realtime/')) {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  } else {
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  next();
});

// Never cache HTML
app.get('*.html', (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  // serve HTML
});

// Never cache service worker
app.get('/service-worker.js', (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  res.set('Service-Worker-Allowed', '/');
  // serve service worker
});
`;

// ========== VERCEL CONFIG ==========
export const vercelConfig = `
// vercel.json
{
  "headers": [
    {
      "source": "/js/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/:path*.woff2",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, stale-while-revalidate=3600"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
`;

/**
 * Performance optimization recommendations
 */
export const performanceRecommendations = {
  cdnSetup: [
    '1. Use a CDN (Cloudflare, Fastly, CloudFront) to serve static assets',
    '2. Configure CDN to respect Cache-Control headers',
    '3. Set CDN TTL to match Cache-Control max-age',
    '4. Enable gzip/brotli compression on CDN',
  ],

  monitoring: [
    '1. Monitor cache hit rates in CDN dashboard',
    '2. Track Core Web Vitals in Google Search Console',
    '3. Use Lighthouse CI in your CI/CD pipeline',
    '4. Monitor bundle size with bundlesize or package-size',
  ],

  optimization: [
    '1. Minify and tree-shake unused code',
    '2. Use dynamic imports for route-based code splitting',
    '3. Lazy load below-the-fold images',
    '4. Optimize images with next-gen formats (WebP, AVIF)',
    '5. Pre-compress assets (gzip, brotli)',
    '6. Enable HTTP/2 server push for critical assets',
  ],

  testing: [
    '1. Test cache headers: curl -I https://yoursite.com',
    '2. Validate with WebPageTest.org',
    '3. Check with PageSpeed Insights',
    '4. Test offline functionality with Chrome DevTools',
  ],
};

/**
 * Helper to verify cache headers in browser
 */
export const verifyCacheHeaders = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const headers = {
      'Cache-Control': response.headers.get('Cache-Control'),
      'ETag': response.headers.get('ETag'),
      'Last-Modified': response.headers.get('Last-Modified'),
      'Content-Encoding': response.headers.get('Content-Encoding'),
      'Age': response.headers.get('Age'),
    };
    logger.debug('Cache Headers:', headers);
    return headers;
  } catch (error) {
    logger.error('Error checking cache headers:', error);
  }
};
