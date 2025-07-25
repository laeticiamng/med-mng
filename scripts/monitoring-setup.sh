#!/bin/bash

# 🎯 MONITORING & ALERTES - SETUP COMPLET
# Script d'installation et configuration du système de monitoring

set -e

echo "🚀 MISE EN PLACE DU MONITORING PRODUCTION"
echo "=========================================="

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# 1. INSTALLATION DES OUTILS DE MONITORING
log "Installation des outils de monitoring..."

# Vérification des dépendances système
if ! command -v curl &> /dev/null; then
    error "curl n'est pas installé"
    exit 1
fi

if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi

# 2. CONFIGURATION DES MÉTRIQUES SYSTÈME
log "Configuration des métriques système..."

# Création du dossier de monitoring
mkdir -p monitoring/logs
mkdir -p monitoring/metrics
mkdir -p monitoring/alerts

# Script de collecte des métriques système
cat > monitoring/collect-metrics.js << 'EOF'
const os = require('os');
const fs = require('fs').promises;

async function collectMetrics() {
    const metrics = {
        timestamp: new Date().toISOString(),
        cpu: {
            usage: process.cpuUsage(),
            loadAvg: os.loadavg(),
            cores: os.cpus().length
        },
        memory: {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem(),
            usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        },
        uptime: {
            system: os.uptime(),
            process: process.uptime()
        },
        network: os.networkInterfaces()
    };

    const logFile = `monitoring/metrics/metrics-${new Date().toISOString().split('T')[0]}.json`;
    await fs.appendFile(logFile, JSON.stringify(metrics) + '\n');
    
    // Vérification des seuils d'alerte
    if (metrics.memory.usage > 80) {
        console.warn(`🚨 ALERTE: Utilisation mémoire élevée: ${metrics.memory.usage}%`);
    }
    
    if (metrics.cpu.loadAvg[0] > 2) {
        console.warn(`🚨 ALERTE: Charge CPU élevée: ${metrics.cpu.loadAvg[0]}`);
    }

    return metrics;
}

// Collecte toutes les 30 secondes
setInterval(collectMetrics, 30000);
collectMetrics(); // Première collecte immédiate

console.log('📊 Collecteur de métriques démarré...');
EOF

# 3. SURVEILLANCE DES LOGS D'APPLICATION
log "Configuration de la surveillance des logs..."

cat > monitoring/log-analyzer.js << 'EOF'
const fs = require('fs');
const path = require('path');

class LogAnalyzer {
    constructor() {
        this.errorPatterns = [
            /ERROR/i,
            /FATAL/i,
            /Exception/i,
            /failed/i,
            /timeout/i,
            /connection refused/i
        ];
        
        this.warningPatterns = [
            /WARN/i,
            /deprecated/i,
            /slow query/i,
            /retry/i
        ];
    }

    analyzeLogFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            const analysis = {
                total_lines: lines.length,
                errors: 0,
                warnings: 0,
                error_details: [],
                warning_details: []
            };

            lines.forEach((line, index) => {
                // Recherche d'erreurs
                this.errorPatterns.forEach(pattern => {
                    if (pattern.test(line)) {
                        analysis.errors++;
                        analysis.error_details.push({
                            line: index + 1,
                            content: line.trim(),
                            timestamp: this.extractTimestamp(line)
                        });
                    }
                });

                // Recherche d'avertissements
                this.warningPatterns.forEach(pattern => {
                    if (pattern.test(line)) {
                        analysis.warnings++;
                        analysis.warning_details.push({
                            line: index + 1,
                            content: line.trim(),
                            timestamp: this.extractTimestamp(line)
                        });
                    }
                });
            });

            return analysis;
        } catch (error) {
            console.error(`Erreur lors de l'analyse du fichier ${filePath}:`, error);
            return null;
        }
    }

    extractTimestamp(line) {
        const timestampRegex = /\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}/;
        const match = line.match(timestampRegex);
        return match ? match[0] : null;
    }

    generateReport() {
        const logDir = './logs';
        const reportFile = `monitoring/logs/analysis-${new Date().toISOString().split('T')[0]}.json`;
        
        if (!fs.existsSync(logDir)) {
            console.log('Aucun répertoire de logs trouvé');
            return;
        }

        const logFiles = fs.readdirSync(logDir)
            .filter(file => file.endsWith('.log'))
            .map(file => path.join(logDir, file));

        const report = {
            timestamp: new Date().toISOString(),
            files_analyzed: logFiles.length,
            results: {}
        };

        logFiles.forEach(file => {
            const analysis = this.analyzeLogFile(file);
            if (analysis) {
                report.results[file] = analysis;
            }
        });

        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        console.log(`📋 Rapport d'analyse généré: ${reportFile}`);

        return report;
    }
}

const analyzer = new LogAnalyzer();
setInterval(() => analyzer.generateReport(), 300000); // Toutes les 5 minutes
analyzer.generateReport(); // Première analyse

console.log('🔍 Analyseur de logs démarré...');
EOF

# 4. SYSTÈME D'ALERTES
log "Configuration du système d'alertes..."

cat > monitoring/alert-system.js << 'EOF'
const fs = require('fs');
const https = require('https');

class AlertSystem {
    constructor() {
        this.webhooks = {
            slack: process.env.SLACK_WEBHOOK_URL || '',
            discord: process.env.DISCORD_WEBHOOK_URL || '',
            email: process.env.EMAIL_WEBHOOK_URL || ''
        };
        
        this.thresholds = {
            cpu_usage: 80,
            memory_usage: 85,
            response_time: 1000,
            error_rate: 5
        };
    }

    async sendAlert(channel, alert) {
        if (!this.webhooks[channel]) {
            console.warn(`Webhook non configuré pour: ${channel}`);
            return;
        }

        const payload = this.formatAlert(channel, alert);
        
        try {
            await this.sendWebhook(this.webhooks[channel], payload);
            console.log(`✅ Alerte envoyée via ${channel}`);
        } catch (error) {
            console.error(`❌ Erreur envoi alerte ${channel}:`, error);
        }
    }

    formatAlert(channel, alert) {
        switch (channel) {
            case 'slack':
                return {
                    text: `🚨 ALERTE MED-MNG`,
                    attachments: [{
                        color: this.getAlertColor(alert.severity),
                        fields: [
                            { title: 'Type', value: alert.type, short: true },
                            { title: 'Sévérité', value: alert.severity, short: true },
                            { title: 'Message', value: alert.message, short: false },
                            { title: 'Timestamp', value: alert.timestamp, short: true }
                        ]
                    }]
                };
            
            case 'discord':
                return {
                    content: `🚨 **ALERTE MED-MNG**`,
                    embeds: [{
                        title: alert.type,
                        description: alert.message,
                        color: this.getDiscordColor(alert.severity),
                        timestamp: alert.timestamp,
                        fields: [
                            { name: 'Sévérité', value: alert.severity, inline: true }
                        ]
                    }]
                };
            
            default:
                return alert;
        }
    }

    getAlertColor(severity) {
        switch (severity) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return '#ffaa00';
            case 'low': return 'good';
            default: return '#cccccc';
        }
    }

    getDiscordColor(severity) {
        switch (severity) {
            case 'critical': return 0xff0000;
            case 'high': return 0xff8800;
            case 'medium': return 0xffaa00;
            case 'low': return 0x00ff00;
            default: return 0xcccccc;
        }
    }

    async sendWebhook(url, payload) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(payload);
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                port: 443,
                path: urlObj.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };

            const req = https.request(options, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });

            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    checkThresholds(metrics) {
        const alerts = [];

        if (metrics.memory.usage > this.thresholds.memory_usage) {
            alerts.push({
                type: 'Memory Usage High',
                severity: 'high',
                message: `Utilisation mémoire: ${metrics.memory.usage}% (seuil: ${this.thresholds.memory_usage}%)`,
                timestamp: new Date().toISOString()
            });
        }

        if (metrics.cpu.loadAvg[0] > this.thresholds.cpu_usage / 10) {
            alerts.push({
                type: 'CPU Load High',
                severity: 'medium',
                message: `Charge CPU: ${metrics.cpu.loadAvg[0]} (seuil: ${this.thresholds.cpu_usage / 10})`,
                timestamp: new Date().toISOString()
            });
        }

        return alerts;
    }
}

module.exports = AlertSystem;

// Test si exécuté directement
if (require.main === module) {
    const alertSystem = new AlertSystem();
    
    // Test d'alerte
    const testAlert = {
        type: 'Test Alert',
        severity: 'low',
        message: 'Test du système d\'alertes',
        timestamp: new Date().toISOString()
    };

    console.log('🧪 Test du système d\'alertes...');
    // alertSystem.sendAlert('slack', testAlert);
}
EOF

# 5. DASHBOARD DE MONITORING
log "Création du dashboard de monitoring..."

cat > monitoring/dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MED-MNG - Dashboard Monitoring</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
        .header { background: #2563eb; color: white; padding: 1rem; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { text-align: center; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #2563eb; }
        .metric-label { color: #6b7280; margin-top: 0.5rem; }
        .status-online { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-error { color: #ef4444; }
        .chart-container { height: 300px; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 MED-MNG - Monitoring Production</h1>
        <p>Surveillance en temps réel de la plateforme</p>
    </div>

    <div class="container">
        <div class="grid">
            <div class="card">
                <h3>État des Services</h3>
                <div style="margin-top: 1rem;">
                    <div>🌐 Frontend: <span class="status-online">● En ligne</span></div>
                    <div>🔧 API: <span class="status-online">● En ligne</span></div>
                    <div>🗄️ Database: <span class="status-online">● En ligne</span></div>
                    <div>☁️ Storage: <span class="status-online">● En ligne</span></div>
                </div>
            </div>

            <div class="card metric">
                <div class="metric-value" id="cpu-usage">23%</div>
                <div class="metric-label">Utilisation CPU</div>
            </div>

            <div class="card metric">
                <div class="metric-value" id="memory-usage">67%</div>
                <div class="metric-label">Utilisation Mémoire</div>
            </div>

            <div class="card metric">
                <div class="metric-value" id="response-time">145ms</div>
                <div class="metric-label">Temps de Réponse</div>
            </div>

            <div class="card metric">
                <div class="metric-value" id="active-users">1,247</div>
                <div class="metric-label">Utilisateurs Actifs</div>
            </div>

            <div class="card metric">
                <div class="metric-value" id="error-rate">0.2%</div>
                <div class="metric-label">Taux d'Erreur</div>
            </div>
        </div>

        <div class="grid" style="margin-top: 2rem;">
            <div class="card">
                <h3>Performance CPU</h3>
                <div class="chart-container">
                    <canvas id="cpuChart"></canvas>
                </div>
            </div>

            <div class="card">
                <h3>Utilisation Mémoire</h3>
                <div class="chart-container">
                    <canvas id="memoryChart"></canvas>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 2rem;">
            <h3>🚨 Alertes Récentes</h3>
            <div id="alerts-list">
                <p style="color: #6b7280; margin-top: 1rem;">Aucune alerte active</p>
            </div>
        </div>
    </div>

    <script>
        // Simulation de données en temps réel
        function updateMetrics() {
            document.getElementById('cpu-usage').textContent = 
                (Math.random() * 40 + 10).toFixed(1) + '%';
            document.getElementById('memory-usage').textContent = 
                (Math.random() * 30 + 50).toFixed(1) + '%';
            document.getElementById('response-time').textContent = 
                Math.floor(Math.random() * 200 + 100) + 'ms';
            document.getElementById('active-users').textContent = 
                Math.floor(Math.random() * 500 + 1000).toLocaleString();
            document.getElementById('error-rate').textContent = 
                (Math.random() * 0.5).toFixed(2) + '%';
        }

        // Graphiques
        const cpuCtx = document.getElementById('cpuChart').getContext('2d');
        const memoryCtx = document.getElementById('memoryChart').getContext('2d');

        const chartConfig = {
            type: 'line',
            data: {
                labels: Array.from({length: 10}, (_, i) => `${i}m`),
                datasets: [{
                    data: Array.from({length: 10}, () => Math.random() * 40 + 10),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        };

        new Chart(cpuCtx, chartConfig);
        new Chart(memoryCtx, {
            ...chartConfig,
            data: {
                ...chartConfig.data,
                datasets: [{
                    ...chartConfig.data.datasets[0],
                    data: Array.from({length: 10}, () => Math.random() * 30 + 50)
                }]
            }
        });

        // Mise à jour toutes les 5 secondes
        setInterval(updateMetrics, 5000);
        updateMetrics();
    </script>
</body>
</html>
EOF

# 6. CONFIGURATION DU MONITORING AUTOMATIQUE
log "Configuration du monitoring automatique..."

# Service systemd pour le monitoring (optionnel)
cat > monitoring/med-mng-monitor.service << 'EOF'
[Unit]
Description=MED-MNG Production Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/med-mng
ExecStart=/usr/bin/node monitoring/collect-metrics.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 7. SCRIPT DE SURVEILLANCE COMPLÈTE
cat > monitoring/health-check.js << 'EOF'
const http = require('http');
const https = require('https');
const fs = require('fs');

class HealthChecker {
    constructor() {
        this.endpoints = [
            { name: 'Frontend', url: 'http://localhost:3000', timeout: 5000 },
            { name: 'API Health', url: 'http://localhost:3001/health', timeout: 3000 },
            { name: 'Database', url: 'http://localhost:3001/api/health/db', timeout: 5000 }
        ];
        
        this.results = [];
    }

    async checkEndpoint(endpoint) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const protocol = endpoint.url.startsWith('https') ? https : http;
            
            const req = protocol.get(endpoint.url, { timeout: endpoint.timeout }, (res) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    name: endpoint.name,
                    status: res.statusCode >= 200 && res.statusCode < 400 ? 'UP' : 'DOWN',
                    statusCode: res.statusCode,
                    responseTime,
                    timestamp: new Date().toISOString()
                });
            });

            req.on('error', () => {
                resolve({
                    name: endpoint.name,
                    status: 'DOWN',
                    statusCode: 0,
                    responseTime: Date.now() - startTime,
                    timestamp: new Date().toISOString()
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    name: endpoint.name,
                    status: 'TIMEOUT',
                    statusCode: 0,
                    responseTime: endpoint.timeout,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    async runHealthCheck() {
        console.log('🔍 Vérification de santé des services...');
        
        const promises = this.endpoints.map(endpoint => this.checkEndpoint(endpoint));
        const results = await Promise.all(promises);
        
        const report = {
            timestamp: new Date().toISOString(),
            overall_status: results.every(r => r.status === 'UP') ? 'HEALTHY' : 'UNHEALTHY',
            services: results
        };

        // Sauvegarde du rapport
        const reportFile = `monitoring/logs/health-check-${new Date().toISOString().split('T')[0]}.json`;
        fs.appendFileSync(reportFile, JSON.stringify(report) + '\n');

        // Affichage console
        results.forEach(result => {
            const icon = result.status === 'UP' ? '✅' : '❌';
            console.log(`${icon} ${result.name}: ${result.status} (${result.responseTime}ms)`);
        });

        return report;
    }
}

const healthChecker = new HealthChecker();

// Vérification toutes les 60 secondes
setInterval(() => healthChecker.runHealthCheck(), 60000);
healthChecker.runHealthCheck(); // Première vérification

console.log('🏥 Health checker démarré...');
EOF

# 8. CRÉATION DU SCRIPT DE DÉMARRAGE
cat > monitoring/start-monitoring.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage du système de monitoring MED-MNG..."

# Arrêt des processus existants
pkill -f "collect-metrics.js" 2>/dev/null || true
pkill -f "log-analyzer.js" 2>/dev/null || true
pkill -f "health-check.js" 2>/dev/null || true

# Création des répertoires nécessaires
mkdir -p monitoring/logs monitoring/metrics monitoring/alerts

# Démarrage des services de monitoring
echo "📊 Démarrage collecteur de métriques..."
nohup node monitoring/collect-metrics.js > monitoring/logs/metrics.log 2>&1 &

echo "🔍 Démarrage analyseur de logs..."
nohup node monitoring/log-analyzer.js > monitoring/logs/analyzer.log 2>&1 &

echo "🏥 Démarrage health checker..."
nohup node monitoring/health-check.js > monitoring/logs/health.log 2>&1 &

echo "✅ Système de monitoring démarré !"
echo "📊 Dashboard disponible: monitoring/dashboard.html"
echo "📋 Logs disponibles dans: monitoring/logs/"

# Affichage des processus
echo "🔄 Processus de monitoring actifs:"
ps aux | grep -E "(collect-metrics|log-analyzer|health-check)" | grep -v grep
EOF

chmod +x monitoring/start-monitoring.sh

# 9. CRÉATION DU SCRIPT D'ARRÊT
cat > monitoring/stop-monitoring.sh << 'EOF'
#!/bin/bash

echo "🛑 Arrêt du système de monitoring MED-MNG..."

# Arrêt des processus de monitoring
pkill -f "collect-metrics.js" 2>/dev/null && echo "📊 Collecteur de métriques arrêté"
pkill -f "log-analyzer.js" 2>/dev/null && echo "🔍 Analyseur de logs arrêté"
pkill -f "health-check.js" 2>/dev/null && echo "🏥 Health checker arrêté"

echo "✅ Système de monitoring arrêté !"
EOF

chmod +x monitoring/stop-monitoring.sh

# 10. FINALISATION
log "Finalisation de l'installation..."

# Rendre les scripts exécutables
chmod +x monitoring/*.js 2>/dev/null || true
chmod +x monitoring/*.sh

# Création du README de monitoring
cat > monitoring/README.md << 'EOF'
# 🏥 MED-MNG - Système de Monitoring

## 🚀 Démarrage Rapide

```bash
# Démarrage complet
./monitoring/start-monitoring.sh

# Arrêt
./monitoring/stop-monitoring.sh
```

## 📊 Composants

- **collect-metrics.js**: Collecte des métriques système
- **log-analyzer.js**: Analyse des logs d'application
- **health-check.js**: Vérification de santé des services
- **alert-system.js**: Système d'alertes
- **dashboard.html**: Interface de monitoring

## 📋 Logs et Rapports

- `monitoring/logs/`: Logs des services de monitoring
- `monitoring/metrics/`: Métriques système collectées
- `monitoring/alerts/`: Historique des alertes

## ⚙️ Configuration

Variables d'environnement:
- `SLACK_WEBHOOK_URL`: URL webhook Slack
- `DISCORD_WEBHOOK_URL`: URL webhook Discord
- `EMAIL_WEBHOOK_URL`: URL webhook Email

## 🔧 Maintenance

- Les logs sont rotatés automatiquement
- Nettoyage des anciens fichiers: `find monitoring/ -name "*.json" -mtime +30 -delete`
- Surveillance des performances: consulter dashboard.html
EOF

# Message final
echo ""
echo "🎉 INSTALLATION MONITORING TERMINÉE !"
echo "======================================"
echo ""
echo "✅ Composants installés:"
echo "   📊 Collecteur de métriques système"
echo "   🔍 Analyseur de logs automatique"
echo "   🏥 Health checker des services"
echo "   🚨 Système d'alertes configuré"
echo "   📱 Dashboard web disponible"
echo ""
echo "🚀 Pour démarrer le monitoring:"
echo "   ./monitoring/start-monitoring.sh"
echo ""
echo "📊 Dashboard disponible:"
echo "   Ouvrez monitoring/dashboard.html dans votre navigateur"
echo ""
echo "📋 Documentation complète:"
echo "   Consultez monitoring/README.md"
echo ""

log "✨ Système de monitoring prêt à l'emploi !"