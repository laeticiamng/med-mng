# Logging Guide

Centralized logging system for the Med-Mng application.

## Overview

The logging service provides structured, contextual logging with support for different log levels, remote reporting, and performance tracking.

## Basic Usage

### Import the Logger

```typescript
import logger, { debug, info, warn, error } from '@/lib/logger';
```

### Log Levels

#### Debug (Development Only)
Use for detailed debugging information that's only relevant during development.

```typescript
debug('User clicked button', { buttonId: 'submit' });
```

#### Info
Use for general informational messages.

```typescript
info('User logged in successfully', { userId: user.id });
```

#### Warning
Use for unexpected situations that aren't critical.

```typescript
warn('API rate limit approaching', { remaining: 10, limit: 100 });
```

#### Error
Use for critical errors that need attention.

```typescript
try {
  await riskyOperation();
} catch (err) {
  error('Failed to save data', err, { component: 'DataForm' });
}
```

## Context Management

### Setting Global Context

Set context that will be included in all subsequent logs:

```typescript
import { setLogContext } from '@/lib/logger';

// In your auth provider
setLogContext({
  user_id: user.id,
  session_id: sessionId
});
```

### Clearing Context

```typescript
import { clearLogContext } from '@/lib/logger';

// Clear specific keys
clearLogContext(['user_id']);

// Clear all context
clearLogContext();
```

### Per-Log Context

Add context to individual logs:

```typescript
info('Data loaded', { count: items.length }, { component: 'DataTable' });
```

## Advanced Features

### Performance Logging

Track performance of operations:

```typescript
import { PerformanceLogger } from '@/lib/logger';

const perfLog = new PerformanceLogger('fetchUserData', { userId });

// Mark checkpoints
await fetchUser();
perfLog.mark('user_fetched');

await fetchPermissions();
perfLog.mark('permissions_fetched');

// End with success/failure
perfLog.end(true);
```

Output:
```
[DEBUG] [userId=123] Starting: fetchUserData
[DEBUG] [userId=123] fetchUserData - user_fetched { elapsed_ms: 45.23 }
[DEBUG] [userId=123] fetchUserData - permissions_fetched { elapsed_ms: 78.45 }
[DEBUG] [userId=123] Completed: fetchUserData { duration_ms: 78.45, marks: {...} }
```

### User Action Logging

Track user interactions:

```typescript
import { logUserAction } from '@/lib/logger';

const handleClick = () => {
  logUserAction('button_click', {
    buttonId: 'submit',
    formData: { /* ... */ }
  });
};
```

### API Call Logging

Log API requests and responses:

```typescript
import { logApiCall } from '@/lib/logger';

const startTime = performance.now();

try {
  const response = await fetch('/api/data');
  const duration = performance.now() - startTime;

  logApiCall('GET', '/api/data', response.status, duration);
} catch (err) {
  logApiCall('GET', '/api/data', 500);
}
```

### React Error Boundaries

Log component errors:

```typescript
import { logComponentError } from '@/lib/logger';
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logComponentError(this.constructor.name, error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}
```

### Child Loggers

Create loggers with fixed context:

```typescript
import logger from '@/lib/logger';

// In a component or service
const componentLogger = logger.createChild({ component: 'UserDashboard' });

componentLogger.info('Component mounted');
componentLogger.debug('Loading data');
```

## Debugging

### Access Logs in Browser Console

The logger is available globally for debugging:

```javascript
// In browser console
__logger.getRecentLogs(20); // Get last 20 logs
__logger.exportLogs(); // Export all logs as JSON
__logger.clearBuffer(); // Clear log buffer
```

### Log Buffer

The logger maintains a buffer of the last 100 log entries. Access them:

```typescript
import logger from '@/lib/logger';

const recentLogs = logger.getRecentLogs(50);
console.table(recentLogs);
```

## Migration from console.log

### Before

```typescript
console.log('User data:', userData);
console.error('Error fetching data:', error);
console.warn('Deprecated API used');
```

### After

```typescript
import { debug, error, warn } from '@/lib/logger';

debug('User data loaded', { userData });
error('Error fetching data', error);
warn('Deprecated API used', { api: 'v1/users' });
```

## Production Behavior

In production:
- `debug()` logs are **not** emitted
- `error()` and `warn()` logs are sent to remote logging service
- Logs are stored in Supabase `application_logs` table
- Automatic cleanup removes debug/info logs older than 30 days

## Remote Logging

### Supabase Integration

Errors and warnings are automatically sent to the `application_logs` table:

```sql
SELECT * FROM application_logs
WHERE level = 'error'
ORDER BY created_at DESC
LIMIT 50;
```

### Error Summary

Get an error summary:

```sql
SELECT * FROM get_error_summary(24); -- Last 24 hours
```

### Log Statistics

View hourly statistics:

```sql
SELECT * FROM log_statistics;
```

## Best Practices

### 1. Use Appropriate Log Levels

- **Debug**: Detailed debugging (dev only)
- **Info**: General information (successful operations)
- **Warn**: Unexpected but recoverable situations
- **Error**: Critical failures requiring attention

### 2. Add Context

Always add relevant context to help debugging:

```typescript
// ❌ Bad
error('Save failed');

// ✅ Good
error('Save failed', err, {
  component: 'UserForm',
  userId: user.id,
  formData: sanitizedData
});
```

### 3. Don't Log Sensitive Data

Never log passwords, tokens, or sensitive user data:

```typescript
// ❌ Bad
debug('User logged in', { password: user.password });

// ✅ Good
debug('User logged in', { userId: user.id });
```

### 4. Use Structured Data

Pass objects instead of string concatenation:

```typescript
// ❌ Bad
info(`User ${userId} completed ${count} tasks`);

// ✅ Good
info('User completed tasks', { userId, count });
```

### 5. Track Performance for Slow Operations

```typescript
const perfLog = new PerformanceLogger('complexOperation');

// ... operation steps with marks ...

perfLog.end(true);
```

## Examples

### Complete Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { info, error, debug, setLogContext } from '@/lib/logger';
import { PerformanceLogger } from '@/lib/logger';

export const UserDashboard: React.FC = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    setLogContext({ component: 'UserDashboard' });

    const loadData = async () => {
      const perfLog = new PerformanceLogger('loadDashboardData');

      try {
        debug('Starting data load');

        const result = await fetchData();
        perfLog.mark('data_fetched');

        setData(result);
        perfLog.mark('state_updated');

        info('Dashboard data loaded successfully', {
          itemCount: result.length
        });

        perfLog.end(true);
      } catch (err) {
        error('Failed to load dashboard data', err);
        perfLog.end(false);
      }
    };

    loadData();
  }, []);

  return <div>{/* ... */}</div>;
};
```

### Complete API Service Example

```typescript
import { logApiCall, error } from '@/lib/logger';

export class ApiService {
  async get<T>(endpoint: string): Promise<T> {
    const startTime = performance.now();

    try {
      const response = await fetch(endpoint);
      const duration = performance.now() - startTime;

      logApiCall('GET', endpoint, response.status, duration);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (err) {
      const duration = performance.now() - startTime;
      logApiCall('GET', endpoint, 500, duration);

      error('API request failed', err, { endpoint });
      throw err;
    }
  }
}
```

## Monitoring & Alerts

### View Recent Errors (Admins)

```typescript
import { supabase } from '@/lib/supabase';

const { data: errors } = await supabase
  .from('application_logs')
  .select('*')
  .eq('level', 'error')
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: false });
```

### Error Count by Component

```typescript
const { data: errorsByComponent } = await supabase
  .rpc('get_error_summary', { p_hours: 24 });
```

## Troubleshooting

### Logs Not Appearing in Production

1. Check Supabase RLS policies are applied
2. Verify `application_logs` table exists
3. Check browser network tab for failed requests to Supabase
4. Verify user has permission to insert logs

### Performance Issues

1. Reduce log verbosity (avoid debug in production)
2. Check log buffer size (default 100)
3. Ensure cleanup function runs regularly

### Missing Context

1. Verify `setLogContext()` is called in appropriate places (auth, routing)
2. Check context is not being cleared prematurely
3. Use child loggers for component-specific context
