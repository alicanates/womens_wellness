# Subscription Scheduler - Quick Start Guide

## What Was Implemented

Three automated scheduled jobs for subscription management:

1. **Quota Reset** - Resets AI message quotas monthly (1st of month at 00:00)
2. **Expiration Check** - Expires subscriptions daily (every day at 00:00)
3. **Grace Period Check** - Handles grace period expirations daily (every day at 01:00)

## How It Works

The scheduler runs automatically when your NestJS application starts. No manual configuration needed!

### Automatic Execution

```
Application Start
    ↓
ScheduleModule initializes
    ↓
Cron jobs registered
    ↓
Jobs run on schedule automatically
```

## Testing the Scheduler

### Option 1: Run Test Script

```bash
cd apps/api
pnpm run test:scheduler
```

This will:
- Show current subscription statistics
- Manually trigger all three jobs
- Display results and updated statistics

### Option 2: Manual Trigger in Code

```typescript
import { SubscriptionSchedulerService } from './subscription/subscription-scheduler.service';

// Inject the service
constructor(private schedulerService: SubscriptionSchedulerService) {}

// Trigger individual jobs
await this.schedulerService.triggerQuotaReset();
await this.schedulerService.triggerExpirationCheck();
await this.schedulerService.triggerGracePeriodCheck();
```

## Monitoring Logs

When jobs run, you'll see logs like:

```
[SubscriptionSchedulerService] Starting monthly quota reset job
[SubscriptionSchedulerService] Found 150 subscriptions to reset
[SubscriptionSchedulerService] Quota reset job completed: 150 successful, 0 failed
```

## Job Schedules

| Job | Schedule | Cron Expression | Purpose |
|-----|----------|----------------|---------|
| Quota Reset | 1st of month at 00:00 | `0 0 1 * *` | Reset monthly AI message quotas |
| Expiration Check | Daily at 00:00 | `0 0 * * *` | Expire subscriptions that ended |
| Grace Period Check | Daily at 01:00 | `0 1 * * *` | Downgrade grace periods that ended |

## What Each Job Does

### Quota Reset Job
- Finds subscriptions needing quota reset
- Resets message count to 0
- Sets appropriate limit (100 for free, 1000 for premium)
- Updates next reset date

### Expiration Check Job
- Finds active/cancelled subscriptions past end date
- Changes status to EXPIRED
- Downgrades to free tier (100 messages)
- Logs notification intent

### Grace Period Check Job
- Finds grace periods that ended
- Changes status to EXPIRED
- Downgrades to free tier (100 messages)
- Logs notification intent

## Integration with Other Services

### Ready for Notification Service (Task 20)
Jobs log notification intents with format:
```
[NOTIFICATION] Subscription expired for user user@example.com (John Doe)
```

Search for `[NOTIFICATION]` in logs to find where to integrate notifications.

### Ready for Analytics (Task 22)
All job executions are logged with:
- Start/completion times
- Success/failure counts
- Individual subscription processing

## Troubleshooting

### Jobs Not Running?
1. Check if `ScheduleModule.forRoot()` is in `app.module.ts` ✅ (Already added)
2. Verify application is running
3. Check server timezone configuration

### Wrong Quota Limits?
1. Verify subscription status is correct
2. Check tier assignment logic
3. Review subscription service

### Need to Test Immediately?
Use the manual trigger methods or run the test script!

## Files to Know

- `subscription-scheduler.service.ts` - Main implementation
- `SCHEDULED_JOBS.md` - Detailed documentation
- `test-scheduler.ts` - Test script
- `TASK_19_IMPLEMENTATION_SUMMARY.md` - Implementation details

## Next Steps

1. ✅ Jobs are running automatically
2. 🔜 Integrate notification service (Task 20)
3. 🔜 Add analytics tracking (Task 22)
4. 🔜 Monitor job execution in production

## Quick Commands

```bash
# Test the scheduler
pnpm run test:scheduler

# Build the project
pnpm run build

# Start the application (jobs will run automatically)
pnpm run dev
```

---

**Status:** ✅ Fully Implemented and Ready  
**Auto-starts:** Yes, when application starts  
**Manual Testing:** Available via test script
