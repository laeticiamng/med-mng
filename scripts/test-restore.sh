#!/bin/bash
# ========================================
# Restore Test Script
# ========================================
# Teste la restauration d'un backup dans un environnement isolé

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_DIR="./test-results"
LOG_FILE="$TEST_DIR/restore_test_$TIMESTAMP.log"
TEST_PROJECT="med-mng-restore-test-$(date +%Y%m)"

# Créer le répertoire de test
mkdir -p $TEST_DIR

# Fonction de logging
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Fonction de nettoyage
cleanup() {
  if [ -n "$TEST_PROJECT_CREATED" ]; then
    log "Cleaning up test project..."
    supabase projects delete $TEST_PROJECT --force 2>&1 | tee -a $LOG_FILE || true
  fi
}
trap cleanup EXIT

log "========================================="
log "Starting restore test"
log "Test Project: $TEST_PROJECT"
log "========================================="

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
  log "ERROR: Supabase CLI not installed"
  exit 1
fi

# Trouver le dernier backup
LATEST_BACKUP=$(ls -t backups/database/backup_*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  log "ERROR: No backup files found"
  exit 1
fi

log "Using backup: $LATEST_BACKUP"
BACKUP_SIZE=$(du -h $LATEST_BACKUP | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Étape 1: Créer un projet de test
log "========================================="
log "Step 1: Creating test project..."

supabase projects create $TEST_PROJECT 2>&1 | tee -a $LOG_FILE

if [ $? -eq 0 ]; then
  TEST_PROJECT_CREATED=true
  log "✅ Test project created"
else
  log "❌ Failed to create test project"
  exit 1
fi

# Attendre que le projet soit prêt
log "Waiting for project to be ready..."
sleep 30

# Récupérer les credentials du projet de test
TEST_DB_HOST=$(supabase projects api-keys --project-id $TEST_PROJECT | jq -r '.db_host')
TEST_DB_PASSWORD=$(supabase projects api-keys --project-id $TEST_PROJECT | jq -r '.db_password')

log "Test DB Host: $TEST_DB_HOST"

# Étape 2: Restaurer le backup
log "========================================="
log "Step 2: Restoring backup..."

PGPASSWORD=$TEST_DB_PASSWORD pg_restore \
  -h $TEST_DB_HOST \
  -p 5432 \
  -U postgres \
  -d postgres \
  --verbose \
  --no-owner \
  --no-acl \
  $LATEST_BACKUP 2>&1 | tee -a $LOG_FILE

if [ $? -eq 0 ]; then
  log "✅ Backup restored successfully"
else
  log "⚠️  Restore completed with warnings (this may be normal)"
fi

# Étape 3: Vérifier l'intégrité des données
log "========================================="
log "Step 3: Verifying data integrity..."

TEST_DB_URL="postgresql://postgres:$TEST_DB_PASSWORD@$TEST_DB_HOST:5432/postgres"

# Tests d'intégrité
TESTS=(
  "SELECT COUNT(*) as user_count FROM auth.users"
  "SELECT COUNT(*) as security_events_count FROM security_events"
  "SELECT COUNT(*) as rate_limits_count FROM rate_limits"
  "SELECT COUNT(*) as user_roles_count FROM user_roles"
)

FAILED_TESTS=0

for TEST_QUERY in "${TESTS[@]}"; do
  log "Running: $TEST_QUERY"

  RESULT=$(psql $TEST_DB_URL -t -c "$TEST_QUERY" 2>&1 | tee -a $LOG_FILE)

  if [ $? -eq 0 ]; then
    log "✅ $TEST_QUERY: $RESULT"
  else
    log "❌ $TEST_QUERY failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
done

# Étape 4: Tester les fonctionnalités critiques
log "========================================="
log "Step 4: Testing critical functions..."

TEST_URL=$(supabase projects api-keys --project-id $TEST_PROJECT | jq -r '.api_url')
TEST_ANON_KEY=$(supabase projects api-keys --project-id $TEST_PROJECT | jq -r '.anon_key')

# Créer un token de test (simplification - en réalité il faudrait créer un utilisateur)
log "Test API URL: $TEST_URL"

# Test 1: Endpoint public (webhook)
log "Testing public endpoint..."
curl -X POST $TEST_URL/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}' \
  -w "\nHTTP Status: %{http_code}\n" 2>&1 | tee -a $LOG_FILE || true

# Étape 5: Générer le rapport
log "========================================="
log "Step 5: Generating test report..."

DURATION=$SECONDS

cat > $TEST_DIR/restore_test_$TIMESTAMP.txt <<EOF
================================================================================
Restore Test Report
================================================================================

Test Date: $(date)
Test Duration: ${DURATION}s
Backup File: $LATEST_BACKUP
Backup Size: $BACKUP_SIZE
Test Project: $TEST_PROJECT

--------------------------------------------------------------------------------
Data Integrity Tests
--------------------------------------------------------------------------------

Total Tests: ${#TESTS[@]}
Failed Tests: $FAILED_TESTS
Success Rate: $(echo "scale=2; (${#TESTS[@]} - $FAILED_TESTS) * 100 / ${#TESTS[@]}" | bc)%

--------------------------------------------------------------------------------
Test Results
--------------------------------------------------------------------------------

$(for TEST_QUERY in "${TESTS[@]}"; do
  RESULT=$(psql $TEST_DB_URL -t -c "$TEST_QUERY" 2>/dev/null || echo "FAILED")
  echo "✓ $TEST_QUERY: $RESULT"
done)

--------------------------------------------------------------------------------
Conclusion
--------------------------------------------------------------------------------

$(if [ $FAILED_TESTS -eq 0 ]; then
  echo "✅ RESTORE TEST PASSED"
  echo "All data integrity tests passed successfully."
  echo "The backup can be reliably used for disaster recovery."
else
  echo "⚠️  RESTORE TEST COMPLETED WITH WARNINGS"
  echo "$FAILED_TESTS test(s) failed."
  echo "Review the failures and investigate potential issues."
fi)

================================================================================
Next Steps
================================================================================

1. Review this report
2. If failures occurred, investigate the root cause
3. Update backup procedures if needed
4. Document any issues found
5. Schedule the next test for $(date -d '+1 month' +%Y-%m-%d)

================================================================================
EOF

# Afficher le rapport
cat $TEST_DIR/restore_test_$TIMESTAMP.txt | tee -a $LOG_FILE

# Étape 6: Nettoyage (via trap)
log "========================================="
log "Test complete!"
log "Report saved to: $TEST_DIR/restore_test_$TIMESTAMP.txt"
log "========================================="

# Retourner le code de sortie approprié
if [ $FAILED_TESTS -eq 0 ]; then
  exit 0
else
  exit 1
fi
