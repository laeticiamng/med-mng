# Med-MNG Security - Logs

Ce répertoire contient les logs de toutes les opérations de sécurité:

- `activation.log` - Log du script d'activation
- `wizard.log` - Log du wizard de configuration
- `auto-setup.log` - Log du setup automatique
- `backup-database.log` - Logs des backups DB (via cron)
- `backup-storage.log` - Logs des backups storage (via cron)
- `backup-secrets.log` - Logs des backups secrets (via cron)
- `test-restore.log` - Logs des tests de restore (via cron)

Les logs sont automatiquement ignorés par git (.gitignore).
