# Error Handling Policy

This project aims to avoid silent failures across the stack. Any error occurring in the backend must be logged and an explicit HTTP response returned to the client.

## Backend
- Use the `log` utility to log errors with a timestamp and severity.
- API routes should return appropriate HTTP status codes (400 for bad requests, 401 for unauthenticated, 403 for forbidden, 404 for missing resources, 429 for quota issues, 500 for server errors).
- Avoid empty `catch` blocks. When an unexpected error occurs, log it and return a JSON payload such as `{ "error": "ERROR_CODE", "code": 500, "message": "Human readable" }`.
- Standard error structure: `{ "error": "CODE", "code": <http status>, "message": "Human message" }`.

## Frontend
- Display API error messages to users via toast or alert components.
- Capture unexpected UI exceptions and send them to the logger or monitoring system.

## Example
```ts
try {
  const data = await fetchData();
  return new Response(JSON.stringify({ data }), { status: 200 });
} catch (e) {
  log('error', 'fetchData failed', e);
  return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des données' }), { status: 500 });
}
```

Use this document as a guideline for future contributors.
