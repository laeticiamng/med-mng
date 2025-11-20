# 🏗️ Med-MNG Security Architecture

**Version**: 1.0
**Date**: 2025-11-19
**Status**: ✅ Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [7-Layer Architecture](#7-layer-architecture)
3. [Security Components](#security-components)
4. [Data Flow](#data-flow)
5. [Integration Points](#integration-points)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [Disaster Recovery](#disaster-recovery)

---

## 🎯 OVERVIEW

### Architecture Philosophy

**Defense in Depth** - Multiple layers of security controls

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER REQUEST                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: EDGE SECURITY                                         │
│  • Rate Limiting (Sliding Window)                               │
│  • DDoS Protection                                              │
│  • Request Validation                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: AUTHENTICATION & AUTHORIZATION                        │
│  • JWT Validation (Supabase Auth)                               │
│  • RBAC (Role-Based Access Control)                             │
│  • Session Management                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3: APPLICATION SECURITY                                  │
│  • Input Validation (Zod schemas)                               │
│  • Output Encoding                                              │
│  • CSRF Protection                                              │
│  • XSS Prevention                                               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: BUSINESS LOGIC                                        │
│  • Edge Functions (Deno runtime)                                │
│  • Secure coding practices                                      │
│  • Error handling                                               │
│  • Logging & monitoring                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 5: DATA ACCESS                                           │
│  • RLS (Row Level Security)                                     │
│  • Prepared statements                                          │
│  • Connection pooling                                           │
│  • Query optimization                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 6: DATABASE                                              │
│  • PostgreSQL (Supabase)                                        │
│  • Encryption at rest                                           │
│  • Encryption in transit (TLS)                                  │
│  • Automated backups                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 7: INFRASTRUCTURE                                        │
│  • Cloud provider security                                      │
│  • Network isolation                                            │
│  • Firewall rules                                               │
│  • DDoS mitigation                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 7-LAYER ARCHITECTURE

### Layer 1: Edge Security

**Components**:
- **Rate Limiting** ([`apps/functions/_shared/rate-limit.ts`](./apps/functions/_shared/rate-limit.ts))
  - Sliding window algorithm
  - Tier-based limits (free/premium)
  - Per-user, per-endpoint tracking
  - Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Database**:
- Table: `rate_limits` ([`supabase/migrations/20251119_rate_limits.sql`](./supabase/migrations/20251119_rate_limits.sql))

**Limits**:
```typescript
FREE_TIER:
  - AI Chat: 20/hour
  - Music Generation: 5/day
  - API Calls: 100/hour

PREMIUM_TIER:
  - AI Chat: 100/hour
  - Music Generation: 50/day
  - API Calls: 1000/hour
```

### Layer 2: Authentication & Authorization

**Components**:
- **Supabase Auth** (JWT-based)
  - Email/password
  - OAuth providers (Google, GitHub)
  - Magic links
  - Phone authentication

- **RBAC** (Role-Based Access Control)
  - Roles: `user`, `premium`, `admin`, `super_admin`
  - Permissions checked at:
    - Edge function level
    - Database RLS level
    - Frontend component level

**JWT Structure**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email",
    "tier": "premium"
  },
  "user_metadata": {
    "name": "User Name"
  },
  "aud": "authenticated",
  "exp": 1700000000,
  "iat": 1699996400
}
```

### Layer 3: Application Security

**Components**:
- **Input Validation** ([`apps/functions/_shared/input-validation.ts`](./apps/functions/_shared/input-validation.ts))
  - Zod schema validation
  - Type checking
  - Range validation
  - Format validation

**Example Schema**:
```typescript
const ChatRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt required')
    .max(1000, 'Prompt too long'),
  conversationId: z.string().uuid().optional(),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4']),
  temperature: z.number().min(0).max(2).default(0.7)
});
```

**Output Encoding**:
- HTML entity encoding
- JavaScript escaping
- URL encoding
- SQL parameterization

**Security Headers**:
```typescript
{
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
}
```

### Layer 4: Business Logic

**Components**:
- **Edge Functions** (Deno runtime)
  - Isolated execution environment
  - Secure by default
  - No file system access
  - Limited network access

**Secure Coding Practices**:
```typescript
// ✅ GOOD: All security controls
export const handler = async (req: Request) => {
  // 1. Authentication
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  // 2. Rate limiting
  const rateLimit = await checkRateLimit(user.id, 'endpoint');
  if (!rateLimit.allowed) return tooManyRequests(rateLimit);

  // 3. Input validation
  const body = await RequestSchema.parseAsync(await req.json());

  // 4. Authorization
  if (!canAccess(user, body.resource)) return forbidden();

  // 5. Business logic
  const result = await processRequest(body);

  // 6. Security logging
  await logSecurityEvent({
    userId: user.id,
    type: 'API_CALL',
    severity: 'low',
    metadata: { endpoint: 'endpoint' }
  });

  // 7. Secure response
  return success(result, rateLimit);
};
```

### Layer 5: Data Access

**Components**:
- **RLS (Row Level Security)**
  - All tables have RLS enabled
  - Policies enforce data isolation
  - Multi-tenant safe

**Example RLS Policy**:
```sql
-- Users can only read their own data
CREATE POLICY "Users can read own data"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Premium users can access premium content
CREATE POLICY "Premium content access"
ON premium_content
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND tier IN ('premium', 'enterprise')
  )
);
```

**Query Security**:
- Always use prepared statements
- Parameterized queries
- No dynamic SQL construction
- Input sanitization before DB

### Layer 6: Database

**Components**:
- **PostgreSQL** (Supabase-managed)
  - Version: 15+
  - Extensions: pgcrypto, uuid-ossp

**Security Tables**:
```sql
-- Rate limiting
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security events
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  event_type security_event_type NOT NULL,
  severity security_severity NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Encryption**:
- **At Rest**: AES-256 (managed by Supabase)
- **In Transit**: TLS 1.3
- **Sensitive Fields**: pgcrypto for additional encryption

### Layer 7: Infrastructure

**Components**:
- **Supabase Cloud**
  - SOC 2 Type II compliant
  - GDPR compliant
  - ISO 27001 certified
  - Automatic security updates

**Network**:
- VPC isolation
- Private subnets
- Security groups
- DDoS protection (Cloudflare)

---

## 🔒 SECURITY COMPONENTS

### Rate Limiting System

**Architecture**:
```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ HTTP Request
       ▼
┌──────────────────────────────────────┐
│  Edge Function                       │
│  ┌────────────────────────────────┐  │
│  │ 1. Extract user_id + endpoint  │  │
│  │ 2. Check rate_limits table     │  │
│  │ 3. Sliding window calculation  │  │
│  │ 4. Allow or deny               │  │
│  │ 5. Update counter              │  │
│  │ 6. Return with headers         │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  rate_limits table                   │
│  ┌────────────────────────────────┐  │
│  │ user_id | endpoint | count     │  │
│  │ uuid-1  | /chat    | 15        │  │
│  │ uuid-1  | /music   | 3         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Implementation**: [`apps/functions/_shared/rate-limit.ts`](./apps/functions/_shared/rate-limit.ts)

**Response Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1700000000
Retry-After: 3600
```

### Security Monitoring System

**Architecture**:
```
┌──────────────┐
│  Any Event   │ (Auth fail, Rate limit, Suspicious activity)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  logSecurityEvent()                  │
│  ┌────────────────────────────────┐  │
│  │ 1. Validate event data         │  │
│  │ 2. Classify severity           │  │
│  │ 3. Insert to DB                │  │
│  │ 4. Check alert thresholds      │  │
│  │ 5. Trigger alerts if needed    │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │
       ┌───────┴──────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────┐
│ DB: Insert  │  │ Alert System │
│ security_   │  │ • Slack      │
│ events      │  │ • Email      │
└─────────────┘  └──────────────┘
```

**Event Types**:
1. `AUTH_FAILURE` - Failed login attempt
2. `RATE_LIMIT_EXCEEDED` - User hit rate limit
3. `SUSPICIOUS_ACTIVITY` - Unusual patterns
4. `API_KEY_USAGE` - API key used
5. `UNAUTHORIZED_ACCESS` - Access denied
6. `DATA_EXPORT` - Sensitive data exported
7. `ADMIN_ACTION` - Admin operation
8. `PASSWORD_CHANGE` - Password updated
9. `EMAIL_CHANGE` - Email updated
10. `ACCOUNT_DELETION` - Account deleted
11. `PERMISSION_CHANGE` - Permissions modified
12. `SENSITIVE_DATA_ACCESS` - Sensitive data viewed
13. `SUSPICIOUS_PATTERN` - Pattern detected

**Severity Levels**:
- `critical` - Immediate action required
- `high` - Urgent attention needed
- `medium` - Should be reviewed
- `low` - Informational

**Implementation**: [`apps/functions/_shared/security-monitoring.ts`](./apps/functions/_shared/security-monitoring.ts)

### Backup & Disaster Recovery

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│  DAILY AUTOMATED BACKUPS (Cron: 2:00 AM)                │
└─────────────┬───────────────────────────────────────────┘
              │
       ┌──────┴──────┬──────────────┐
       │             │              │
       ▼             ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│  Database   │ │  Storage    │ │  Secrets     │
│  Backup     │ │  Backup     │ │  Backup      │
│             │ │             │ │              │
│  • SQL dump │ │  • S3 files │ │  • .env      │
│  • Compress │ │  • Tar/gz   │ │  • GPG enc   │
│  • Encrypt  │ │  • Compress │ │  • Passphrase│
└─────┬───────┘ └─────┬───────┘ └──────┬───────┘
      │               │                │
      └───────────────┴────────────────┘
                      │
                      ▼
      ┌───────────────────────────────┐
      │  STORAGE (3-2-1 Strategy)     │
      │                               │
      │  1. Local: /backups/          │
      │  2. S3: s3://med-mng-backups/ │
      │  3. Off-site: S3 replication  │
      └───────────────────────────────┘
                      │
                      ▼
      ┌───────────────────────────────┐
      │  MONTHLY RESTORE TEST         │
      │  (1st of month, 4:00 AM)      │
      │                               │
      │  • Test DB restore            │
      │  • Test storage restore       │
      │  • Test secrets decrypt       │
      │  • Generate report            │
      └───────────────────────────────┘
```

**RTO/RPO**:
- **RTO** (Recovery Time Objective): < 2 hours
- **RPO** (Recovery Point Objective): < 1 hour

**Scripts**:
- [`scripts/backup-database.sh`](./scripts/backup-database.sh)
- [`scripts/backup-storage.sh`](./scripts/backup-storage.sh)
- [`scripts/backup-secrets.sh`](./scripts/backup-secrets.sh)
- [`scripts/test-restore.sh`](./scripts/test-restore.sh)

---

## 🔄 DATA FLOW

### User Authentication Flow

```
┌──────┐
│ User │
└──┬───┘
   │ 1. Login request (email + password)
   │
   ▼
┌──────────────────────────┐
│  Supabase Auth Service   │
│                          │
│  1. Validate credentials │
│  2. Check user exists    │
│  3. Verify password hash │
│  4. Generate JWT         │
└──────────┬───────────────┘
           │ 2. JWT token
           │
           ▼
┌──────────────────────────┐
│  Frontend (localStorage) │
│                          │
│  • Store JWT             │
│  • Set auth headers      │
└──────────┬───────────────┘
           │ 3. API request + JWT
           │
           ▼
┌──────────────────────────┐
│  Edge Function           │
│                          │
│  1. Extract JWT          │
│  2. Verify signature     │
│  3. Check expiration     │
│  4. Extract user data    │
└──────────┬───────────────┘
           │ 4. Validated user
           │
           ▼
┌──────────────────────────┐
│  Business Logic          │
└──────────────────────────┘
```

### API Request Flow (with all security layers)

```
┌──────┐
│Client│
└──┬───┘
   │ HTTP Request
   ▼
┌─────────────────────────────────────┐
│ LAYER 1: Rate Limiting              │
│ • Check request count               │
│ • Allow or deny (429)               │
└──────────┬──────────────────────────┘
           │ Allowed
           ▼
┌─────────────────────────────────────┐
│ LAYER 2: Authentication             │
│ • Verify JWT                        │
│ • Extract user                      │
└──────────┬──────────────────────────┘
           │ Authenticated
           ▼
┌─────────────────────────────────────┐
│ LAYER 3: Input Validation           │
│ • Parse JSON                        │
│ • Validate schema                   │
│ • Sanitize inputs                   │
└──────────┬──────────────────────────┘
           │ Valid
           ▼
┌─────────────────────────────────────┐
│ LAYER 4: Authorization              │
│ • Check permissions                 │
│ • Verify resource access            │
└──────────┬──────────────────────────┘
           │ Authorized
           ▼
┌─────────────────────────────────────┐
│ LAYER 5: Business Logic             │
│ • Process request                   │
│ • Call database                     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ LAYER 6: Database (RLS)             │
│ • Apply RLS policies                │
│ • Execute query                     │
│ • Return filtered data              │
└──────────┬──────────────────────────┘
           │ Result
           ▼
┌─────────────────────────────────────┐
│ LAYER 7: Security Logging           │
│ • Log event                         │
│ • Check for alerts                  │
└──────────┬──────────────────────────┘
           │ Response
           ▼
┌──────┐
│Client│
└──────┘
```

---

## 🔌 INTEGRATION POINTS

### External Services

```
┌─────────────────────────────────────────────────────────┐
│                  MED-MNG PLATFORM                       │
└──────────┬────────────┬────────────┬─────────────────────┘
           │            │            │
    ┌──────▼────┐  ┌───▼─────┐  ┌──▼──────┐
    │ OpenAI    │  │ Suno    │  │ Resend  │
    │ Chat API  │  │ Music   │  │ Email   │
    └──────┬────┘  └───┬─────┘  └──┬──────┘
           │           │            │
           │ All connections secured with:
           │ • API key rotation
           │ • Rate limiting
           │ • Error handling
           │ • Monitoring
           │ • Fallbacks
           └───────────┴────────────┘
```

**Security Controls**:
- API keys stored in Supabase Vault
- Secrets never in code/logs
- Rotation policy (90 days)
- Usage monitoring
- Cost alerts

---

## 📊 MONITORING & ALERTING

### Security Events Dashboard

**Real-time Metrics**:
```sql
-- Security events summary (last 24h)
SELECT
  event_type,
  severity,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM security_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, severity
ORDER BY count DESC;
```

**Alerting Thresholds**:
- **Critical**: Immediate Slack alert
  - 3+ failed auth attempts (same user, 5 min)
  - Unauthorized access attempt
  - Admin action from unknown IP

- **High**: Slack alert within 5 min
  - 10+ rate limit violations (same user, 1 hour)
  - Suspicious pattern detected
  - Sensitive data access

- **Medium**: Hourly digest
  - Normal rate limit violations
  - Password changes
  - Email changes

- **Low**: Daily digest
  - API key usage
  - Normal operations

### Dashboards Available

1. **Security Overview** (`/admin/security`)
   - Events by type (24h/7d/30d)
   - Events by severity
   - Top users by violations
   - Trends

2. **Rate Limiting** (`/admin/rate-limits`)
   - Requests by endpoint
   - Users throttled
   - Violations by hour
   - Tier usage

3. **Backup Status** (`/admin/backups`)
   - Last backup status
   - Backup sizes
   - S3 storage used
   - Restore test results

---

## 🚨 DISASTER RECOVERY

### Recovery Procedures

**Database Corruption**:
```bash
# 1. Stop application
systemctl stop med-mng-app

# 2. Identify latest good backup
aws s3 ls s3://med-mng-backups/database/

# 3. Download backup
aws s3 cp s3://med-mng-backups/database/db_20251119_020000.sql.gz .

# 4. Restore
gunzip db_20251119_020000.sql.gz
psql $DATABASE_URL < db_20251119_020000.sql

# 5. Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM security_events;"

# 6. Restart application
systemctl start med-mng-app

# 7. Monitor logs
tail -f /var/log/med-mng/app.log
```

**Estimated Time**: 30-60 minutes (RTO < 2h ✅)

**Storage Loss**:
```bash
# 1. Identify latest backup
aws s3 ls s3://med-mng-backups/storage/

# 2. Download and extract
aws s3 cp s3://med-mng-backups/storage/storage_20251119_023000.tar.gz .
tar -xzf storage_20251119_023000.tar.gz

# 3. Upload to Supabase storage
supabase storage sync ./storage/ bucket-name

# 4. Verify
supabase storage ls bucket-name
```

**Estimated Time**: 15-30 minutes

**Secrets Loss**:
```bash
# 1. Get encrypted backup
aws s3 cp s3://med-mng-backups/secrets/secrets_20251119_030000.tar.gz.gpg .

# 2. Decrypt
gpg --decrypt secrets_20251119_030000.tar.gz.gpg > secrets.tar.gz

# 3. Extract
tar -xzf secrets.tar.gz

# 4. Restore .env
cp .env.backup .env

# 5. Restart services
systemctl restart med-mng-app
```

**Estimated Time**: 5-10 minutes

---

## ✅ SECURITY CHECKLIST

### Development

- [x] All secrets in Supabase Vault
- [x] No hardcoded credentials
- [x] Input validation on all endpoints
- [x] Output encoding implemented
- [x] Error messages sanitized
- [x] Security headers configured
- [x] HTTPS enforced
- [x] CORS properly configured

### Database

- [x] RLS enabled on all tables
- [x] Policies tested
- [x] Encryption at rest
- [x] Encryption in transit
- [x] Regular backups (daily)
- [x] Backup testing (monthly)
- [x] Connection pooling
- [x] Query optimization

### Infrastructure

- [x] Rate limiting active
- [x] Security monitoring active
- [x] CI/CD security scans
- [x] Dependency scanning
- [x] Vulnerability scanning
- [x] DDoS protection
- [x] WAF configured
- [x] Network isolation

### Compliance

- [x] GDPR compliant
- [x] OWASP Top 10 covered
- [x] Security best practices
- [x] Audit logging
- [x] Incident response plan
- [x] Data retention policy
- [x] Privacy policy
- [x] Terms of service

---

## 📚 REFERENCES

### Documentation
- [Security Index](./SECURITY_INDEX.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Backup & DR Guide](./BACKUP_DISASTER_RECOVERY.md)

### Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**Version**: 1.0
**Last Updated**: 2025-11-19
**Status**: ✅ Production Ready
