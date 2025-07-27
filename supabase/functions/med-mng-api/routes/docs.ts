import { jsonResponse, errorResponse } from '../response.ts';

export async function handleDocs(req: Request, supabase: any, path: string): Promise<Response | null> {
  // GET /docs - OpenAPI JSON
  if (path === '/docs' && req.method === 'GET') {
    try {
      // Read the OpenAPI spec
      const openApiSpec = await Deno.readTextFile('./openapi.json');
      const spec = JSON.parse(openApiSpec);
      
      return new Response(JSON.stringify(spec, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      return errorResponse(500, 'DOCS_ERROR', 'Failed to load API documentation');
    }
  }

  // GET /docs/swagger - Swagger UI
  if (path === '/docs/swagger' && req.method === 'GET') {
    const swaggerHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MED-MNG API Documentation</title>
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
        background-color: #2c5282;
      }
      .swagger-ui .topbar .download-url-wrapper .select-label {
        color: white;
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
        url: './docs',
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
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        operationsSorter: "alpha",
        tagsSorter: "alpha",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
      });
    };
    </script>
</body>
</html>`;

    return new Response(swaggerHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  return null;
}