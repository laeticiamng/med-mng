# DevOps Configuration Guide

Ce guide détaille les configurations nécessaires pour déployer l'application Medical Training API en production.

## Configuration des Proxys Inverses

### Trust Proxy Configuration

L'application Express est configurée avec `trust proxy` activé pour fonctionner correctement derrière des load balancers et proxys inverses :

```javascript
app.set('trust proxy', 1);
```

**Pourquoi cette configuration est nécessaire :**

1. **Extraction d'IP correcte** : Sans `trust proxy`, `req.ip` retourne l'IP du load balancer au lieu de l'IP réelle du client
2. **Rate limiting efficace** : Le rate limiting basé sur l'IP fonctionne correctement avec les vraies IPs clients
3. **Logs précis** : Les logs contiennent les vraies IPs pour le debugging et la sécurité
4. **Headers de sécurité** : Les headers `X-Forwarded-*` sont correctement interprétés

### Headers supportés

L'application reconnaît et utilise les headers suivants :
- `X-Forwarded-For` : IP du client réel
- `X-Forwarded-Proto` : Protocole utilisé (HTTP/HTTPS)
- `X-Forwarded-Host` : Nom d'hôte original

### Configuration recommandée par environnement

#### AWS Application Load Balancer
```yaml
# ALB ajoute automatiquement les headers X-Forwarded-*
# Aucune configuration supplémentaire requise côté ALB
```

#### Nginx Reverse Proxy
```nginx
location / {
    proxy_pass http://backend;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header Host $host;
}
```

#### Cloudflare
```yaml
# Cloudflare ajoute automatiquement :
# - CF-Connecting-IP (IP réelle du visiteur)
# - X-Forwarded-For
# - X-Forwarded-Proto
# Aucune configuration requise
```

#### Docker + Traefik
```yaml
# labels dans docker-compose.yml
labels:
  - "traefik.frontend.headers.customRequestHeaders=X-Forwarded-Proto:https"
  - "traefik.frontend.headers.customRequestHeaders=X-Forwarded-For:$$proxy_add_x_forwarded_for"
```

## Sécurité et Rate Limiting

### Configuration par environnement

**Development :**
```bash
TRUST_PROXY=1
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=100
```

**Staging :**
```bash
TRUST_PROXY=1
RATE_LIMIT_WINDOW_MS=60000  # 1 minute  
RATE_LIMIT_MAX_REQUESTS=50
```

**Production :**
```bash
TRUST_PROXY=1
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=30
MAX_PAYLOAD_MB=1  # Limite stricte en production
```

### Validation de la configuration

Pour vérifier que la configuration proxy fonctionne :

1. **Test manuel avec curl :**
```bash
curl -H "X-Forwarded-For: 192.168.1.100" http://your-api/health
```

2. **Vérifier les logs :** L'IP loggée doit être `192.168.1.100` et non l'IP du load balancer

3. **Test de rate limiting :** Le rate limiting doit se baser sur l'IP forwarded

## Monitoring et Observabilité

### Métriques importantes à surveiller

1. **Taux de requêtes par IP** : Détection des abus
2. **Distribution géographique des IPs** : Sécurité
3. **Pourcentage de requêtes avec X-Forwarded-For** : Sanité du proxy

### Alertes recommandées

```yaml
# Exemple pour Prometheus/Grafana
- alert: HighRateFromSingleIP
  expr: rate(http_requests_total[5m]) by (client_ip) > 100
  annotations:
    summary: "IP {{ $labels.client_ip }} génère un taux anormalement élevé"

- alert: MissingForwardedHeaders
  expr: (rate(http_requests_without_forwarded_headers[5m]) / rate(http_requests_total[5m])) > 0.1
  annotations:
    summary: "Plus de 10% des requêtes n'ont pas de headers X-Forwarded-*"
```

## Déploiement

### Variables d'environnement requises

```bash
# Configuration de base
NODE_ENV=production
PORT=3000

# Proxy et sécurité
TRUST_PROXY=1
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30

# Limites de payload (sécurité DoS)
MAX_PAYLOAD_MB=1

# Logs
LOG_LEVEL=info

# Supabase (si utilisé)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Health Check

L'endpoint `/health` retourne des informations sur :
- Status de l'application
- Uptime
- Usage mémoire
- Configuration proxy (en développement)

```bash
curl http://your-api/health
```

## Troubleshooting

### Problèmes courants

**1. Rate limiting ne fonctionne pas correctement**
- Vérifier que `trust proxy` est activé
- Contrôler les headers `X-Forwarded-For` dans les requêtes
- Vérifier la configuration du load balancer

**2. IPs incorrectes dans les logs**
- S'assurer que le proxy ajoute les headers `X-Forwarded-*`
- Vérifier la valeur de `trust proxy` (1 pour un seul proxy)
- Tester avec des requêtes manuelles

**3. CORS ne fonctionne pas**
- Vérifier que les origines sont correctement configurées
- S'assurer que le proxy preserve les headers Origin

### Commandes de debug

```bash
# Tester la configuration proxy
curl -v -H "X-Forwarded-For: 1.2.3.4" http://your-api/

# Vérifier les logs en temps réel
tail -f logs/combined.log | grep "client_ip"

# Test de rate limiting
for i in {1..35}; do curl http://your-api/; done
```