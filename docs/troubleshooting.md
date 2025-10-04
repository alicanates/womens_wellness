# Troubleshooting

## Google Sign‑In not working
- Verify iOS bundle ID / Android applicationId match Google Console.
- Check reversed client ID (iOS) and SHA‑1 (Android) are registered.
- Ensure you use a **development build** (not Expo Go).
- Placeholder values (`PLACEHOLDER_GOOGLE_CLIENT_*`) must be replaced with actual IDs.

## Push notifications not received
- Check quiet hours settings and local timezone.
- Verify FCM/APNs credentials are configured via EAS.
- Inspect BullMQ job status and Expo receipts.
- Ensure `EXPO_ACCESS_TOKEN` is set correctly.

## AI responses slow or failing
- Check ModelPolicy (temperature/maxTokens) and provider status.
- Verify at least one AI provider key is configured (not placeholder).
- Inspect quotas; ensure not rate‑limited.
- Review server logs for SSE backpressure.

## Database connection errors
```bash
# Check PostgreSQL is running
pg_isready -q

# Verify database exists
psql -lqt | awk '{print $1}' | grep -qw wellness

# If missing, create it
createdb wellness
```

## Redis connection errors
```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"

# If not running
brew services start redis
```

## Environment validation failures
```bash
# Run validation script
pnpm validate:env

# Or manually check
node scripts/validate-env.js
```

## Mailpit not receiving emails
```bash
# Check if running
nc -z 127.0.0.1 1025

# Restart service
brew services restart mailpit

# Access UI at http://localhost:8025
```

## Services not starting
```bash
# Check all services status
brew services list

# Restart PostgreSQL
brew services restart postgresql@16

# Restart Redis
brew services restart redis

# Restart Mailpit
brew services restart mailpit
```

## PNPM installation issues
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```
