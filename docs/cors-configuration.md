# CORS Configuration Guide

## Overview

The Med Music Platform uses dynamic CORS (Cross-Origin Resource Sharing) configuration to handle requests from different origins based on environment variables.

## Configuration

### Environment Variable

Set the `CORS_ALLOWED_ORIGINS` environment variable with a comma-separated list of allowed origins:

```bash
# Development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Staging  
CORS_ALLOWED_ORIGINS=https://staging.med-music-platform.com,http://localhost:3000

# Production
CORS_ALLOWED_ORIGINS=https://med-music-platform.com,https://app.med-music-platform.com
```

### Default Behavior

If `CORS_ALLOWED_ORIGINS` is not set, the system falls back to development origins:
- `http://localhost:3000`
- `http://localhost:5173` 
- `https://yaincoxihiqdksxgrsrk.supabase.co`

## Security Features

### Origin Validation
- Only origins listed in `CORS_ALLOWED_ORIGINS` are allowed
- Requests without an origin (mobile apps, Postman) are allowed
- Unauthorized origins are logged and rejected

### Credentials Support
- `credentials: true` allows cookies and authentication headers
- Essential for authenticated requests

### Legacy Browser Support
- `optionsSuccessStatus: 200` for older browsers that expect 200 for OPTIONS

## Testing

Run CORS tests to verify configuration:

```bash
npm run test:security -- tests/security/cors-origins.test.ts
```

## Deployment Considerations

### Production Checklist
- [ ] Set `CORS_ALLOWED_ORIGINS` to production domains only
- [ ] Remove development origins from production
- [ ] Test preflight requests work correctly
- [ ] Verify authentication works with CORS

### Common Issues
1. **Missing Origins**: Add all frontend domains to `CORS_ALLOWED_ORIGINS`
2. **Subdomain Issues**: Include all necessary subdomains explicitly
3. **Protocol Mismatch**: Ensure HTTP/HTTPS protocols match
4. **Port Specifications**: Include port numbers for non-standard ports

## Examples

### Multi-Environment Setup
```bash
# .env.development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# .env.staging  
CORS_ALLOWED_ORIGINS=https://staging.example.com,http://localhost:3000

# .env.production
CORS_ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

### Docker Deployment
```dockerfile
ENV CORS_ALLOWED_ORIGINS=https://production.com,https://app.production.com
```

### Kubernetes ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  CORS_ALLOWED_ORIGINS: "https://production.com,https://app.production.com"
```

## Monitoring

CORS rejections are logged with the following information:
- Rejected origin
- List of allowed origins
- Request details

Monitor these logs to identify misconfigurations or potential security issues.