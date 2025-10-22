import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { join } from "https://deno.land/std@0.224.0/path/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

// Serve OpenAPI documentation and Swagger UI
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  console.log('📚 API Docs request:', path);

  try {
    if (path === '/api-docs' || path === '/') {
      // Serve Swagger UI
      return new Response(
        getSwaggerUIHTML(),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'text/html' 
          } 
        }
      );
    } 
    
    if (path === '/openapi.yaml' || path === '/openapi.yml') {
      // Serve OpenAPI spec
      const openApiSpec = await getOpenAPISpec();
      return new Response(
        openApiSpec,
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/yaml' 
          } 
        }
      );
    }

    if (path === '/openapi.json') {
      // Serve OpenAPI spec as JSON
      const openApiSpec = await getOpenAPISpecJSON();
      return new Response(
        JSON.stringify(openApiSpec, null, 2),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    if (path === '/redoc') {
      // Serve ReDoc
      return new Response(
        getReDocHTML(),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'text/html' 
          } 
        }
      );
    }

    if (path === '/validate') {
      // Endpoint validation tool
      return await handleValidation(req);
    }

    if (path === '/health') {
      // API health check
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'api-documentation',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          endpoints: {
            swagger: '/api-docs',
            redoc: '/redoc',
            openapi_yaml: '/openapi.yaml',
            openapi_json: '/openapi.json',
            validation: '/validate'
          }
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // 404 for unknown paths
    return new Response(
      JSON.stringify({ 
        error: 'NOT_FOUND',
        message: 'API documentation endpoint not found',
        availableEndpoints: ['/api-docs', '/redoc', '/openapi.yaml', '/openapi.json', '/validate', '/health']
      }),
      { 
        status: 404,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ API docs error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to serve API documentation',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})

async function getOpenAPISpec(): Promise<string> {
  // In a real implementation, you would read from a file or generate dynamically
  // For now, return the base spec
  return `
openapi: 3.0.3
info:
  title: E-LiSA Backend API
  description: |
    API complète pour la plateforme E-LiSA (Éducation Ludique et Interactive pour la Santé et l'Apprentissage).
    
    Cette API fournit des services pour :
    - Gestion des abonnements et paiements
    - Extraction et traitement de contenu médical
    - Gestion des erreurs et monitoring
    - Authentification et autorisation
    - Services de médecine musicale
    
    ## Authentification
    La plupart des endpoints nécessitent une authentification via Supabase Auth.
    Utilisez le header \`Authorization: Bearer <token>\` avec votre JWT token.
    
    ## Gestion des erreurs
    Toutes les erreurs suivent un format standardisé :
    \`\`\`json
    {
      "error": "ERROR_CODE",
      "code": 400,
      "message": "Human readable message", 
      "timestamp": "2024-01-01T00:00:00.000Z",
      "requestId": "req_123456_abc"
    }
    \`\`\`
    
  version: 1.0.0
  contact:
    name: E-LiSA API Support
    email: support@e-lisa.fr
  license:
    name: Proprietary

servers:
  - url: https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1
    description: Production Supabase Edge Functions
  - url: http://localhost:54321/functions/v1
    description: Local Development

paths:
  /med-mng-api/health:
    get:
      tags: [System]
      summary: Health check pour med-mng-api
      responses:
        '200':
          description: Service en bonne santé
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "ok"
                  timestamp:
                    type: string
                    format: date-time

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

tags:
  - name: System
    description: Endpoints système et monitoring
  `;
}

async function getOpenAPISpecJSON(): Promise<object> {
  // Convert YAML to JSON (simplified for demo)
  return {
    openapi: "3.0.3",
    info: {
      title: "E-LiSA Backend API",
      description: "API complète pour la plateforme E-LiSA",
      version: "1.0.0"
    },
    servers: [
      {
        url: "https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1",
        description: "Production Supabase Edge Functions"
      }
    ],
    paths: {
      "/med-mng-api/health": {
        get: {
          tags: ["System"],
          summary: "Health check pour med-mng-api",
          responses: {
            "200": {
              description: "Service en bonne santé",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      timestamp: { type: "string", format: "date-time" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

function getSwaggerUIHTML(): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>E-LiSA API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      background-color: #2c3e50;
    }
    .swagger-ui .topbar .download-url-wrapper {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: './openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Add any request interceptors here
          console.log('API Request:', request);
          return request;
        },
        responseInterceptor: function(response) {
          // Add any response interceptors here
          console.log('API Response:', response);
          return response;
        }
      });
    };
  </script>
</body>
</html>
  `;
}

function getReDocHTML(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>E-LiSA API Documentation - ReDoc</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <redoc spec-url='./openapi.yaml' theme='{"colors": {"primary": {"main": "#2c3e50"}}}'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
</body>
</html>
  `;
}

async function handleValidation(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST method allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { endpoint, method, requestBody, responseBody } = await req.json();

    // Basic validation logic (would be more sophisticated in real implementation)
    const validationResult = {
      valid: true,
      errors: [],
      warnings: [],
      endpoint,
      method,
      timestamp: new Date().toISOString()
    };

    // Check if endpoint exists in our spec
    const knownEndpoints = [
      '/med-mng-api/health',
      '/med-mng-api/subscriptions',
      '/med-mng-api/songs',
      '/error-handling-service',
      '/extract-edn-uness-complete'
    ];

    if (!knownEndpoints.some(ep => endpoint.startsWith(ep))) {
      validationResult.warnings.push(`Endpoint ${endpoint} not found in OpenAPI specification`);
    }

    // Validate HTTP method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!allowedMethods.includes(method?.toUpperCase())) {
      validationResult.errors.push(`Invalid HTTP method: ${method}`);
      validationResult.valid = false;
    }

    // Check for required authentication header patterns
    if (endpoint.startsWith('/med-mng-api/') && endpoint !== '/med-mng-api/health') {
      validationResult.warnings.push('This endpoint requires authentication via Bearer token');
    }

    return new Response(
      JSON.stringify(validationResult, null, 2),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'VALIDATION_ERROR',
        message: 'Failed to validate request',
        details: error.message 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
}