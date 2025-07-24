# Dashboard Monitoring

Example SQL queries to feed a Metabase or Grafana dashboard.

## Total extractions per day

```sql
SELECT
  date_trunc('day', created_at) AS day,
  count(*) AS extractions
FROM operation_logs
WHERE type = 'extraction'
GROUP BY 1
ORDER BY 1 DESC;
```

## Recent backend errors

```sql
SELECT created_at, message, meta
FROM operation_logs
WHERE type = 'error'
ORDER BY created_at DESC
LIMIT 50;
```
