# Subscription Scheduled Jobs

This document describes the automated scheduled jobs that manage subscription lifecycle and quota management.

## Overview

The `SubscriptionSchedulerService` implements three critical scheduled jobs using NestJS's `@nestjs/schedule` package:

1. **Quota Reset Job** - Resets AI message quotas monthly
2. **Expiration Check Job** - Checks for expired subscriptions daily
3. **Grace Period Check Job** - Handles grace period expirations daily

## Jobs

### 1. Quota Reset Job

**Schedule:** `@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)`  
**Runs:** 00:00 on the 1st day of every month  
**Requirements:** 6.7

#### Purpose
Resets the AI message quota for all users at the beginning of each month.

#### Process
1. Finds all subscriptions where `quotaResetDate <= now`
2. For each subscription:
   - Determines the appropriate quota limit based on subscription status:
     - Free/Expired: 100 messages
     - Active/Trial: 1000 messages
   - Resets `aiMessagesUsed` to 0
   - Updates `aiMessagesLimit` to the appropriate value
   - Sets `quotaResetDate` to the 1st of next month
3. Logs success/failure counts

#### Manual Trigger
```typescript
await subscriptionSchedulerService.triggerQuotaReset();
```

### 2. Expiration Check Job

**Schedule:** `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`  
**Runs:** 00:00 every day  
**Requirements:** 4.6, 12.6

#### Purpose
Identifies and processes subscriptions that have expired, downgrading them to free tier.

#### Process
1. Finds all subscriptions with:
   - Status: `ACTIVE` or `CANCELLED`
   - `endDate <= now`
2. For each expired subscription:
   - Updates status to `EXPIRED`
   - Resets `aiMessagesLimit` to 100 (free tier)
   - Clears grace period flags
   - Logs notification intent (TODO: integrate with notification service)
3. Logs success/failure counts

#### Manual Trigger
```typescript
await subscriptionSchedulerService.triggerExpirationCheck();
```

### 3. Grace Period Check Job

**Schedule:** `@Cron(CronExpression.EVERY_DAY_AT_1AM)`  
**Runs:** 01:00 every day (1 hour after expiration check)  
**Requirements:** 16.6

#### Purpose
Handles subscriptions where the grace period (given after payment failure) has ended, downgrading them to free tier.

#### Process
1. Finds all subscriptions with:
   - Status: `GRACE_PERIOD`
   - `gracePeriodEndDate <= now`
2. For each ended grace period:
   - Updates status to `EXPIRED`
   - Resets `aiMessagesLimit` to 100 (free tier)
   - Clears grace period flags (`isInGracePeriod`, `gracePeriodEndDate`)
   - Logs notification intent (TODO: integrate with notification service)
3. Logs success/failure counts

#### Manual Trigger
```typescript
await subscriptionSchedulerService.triggerGracePeriodCheck();
```

## Configuration

### Cron Schedule
The jobs use NestJS's built-in cron expressions:
- `EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT` = `0 0 1 * *`
- `EVERY_DAY_AT_MIDNIGHT` = `0 0 * * *`
- `EVERY_DAY_AT_1AM` = `0 1 * * *`

### Timezone
Jobs run in the server's timezone. Ensure your server is configured to the correct timezone (default: UTC).

## Logging

All jobs use NestJS's Logger with the following log levels:
- **INFO**: Job start/completion with counts
- **DEBUG**: Individual subscription processing
- **ERROR**: Failures with stack traces

Example logs:
```
[SubscriptionSchedulerService] Starting monthly quota reset job
[SubscriptionSchedulerService] Found 150 subscriptions to reset
[SubscriptionSchedulerService] Quota reset job completed: 150 successful, 0 failed
```

## Error Handling

Each job implements robust error handling:
1. **Job-level try-catch**: Prevents entire job from failing
2. **Individual subscription try-catch**: Continues processing other subscriptions if one fails
3. **Error logging**: All errors are logged with context
4. **Failure counting**: Tracks and reports number of failures

## Monitoring

### Key Metrics to Monitor
- Number of subscriptions processed per job
- Success/failure rates
- Job execution time
- Error patterns

### Recommended Alerts
- Alert if quota reset job fails on 1st of month
- Alert if expiration check finds 0 subscriptions for 30+ days (possible bug)
- Alert if failure rate exceeds 5%

## Testing

### Manual Testing
You can manually trigger jobs for testing:

```typescript
// In a controller or test script
import { SubscriptionSchedulerService } from './subscription-scheduler.service';

// Trigger quota reset
await schedulerService.triggerQuotaReset();

// Trigger expiration check
await schedulerService.triggerExpirationCheck();

// Trigger grace period check
await schedulerService.triggerGracePeriodCheck();
```

### Integration Testing
Create test subscriptions with specific dates to verify job behavior:

```typescript
// Create expired subscription
await prisma.subscription.create({
  data: {
    userId: testUserId,
    status: 'ACTIVE',
    endDate: new Date('2024-01-01'), // Past date
    // ... other fields
  },
});

// Run expiration check
await schedulerService.triggerExpirationCheck();

// Verify subscription was expired
const subscription = await prisma.subscription.findUnique({
  where: { userId: testUserId },
});
expect(subscription.status).toBe('EXPIRED');
```

## Future Enhancements

### Notification Integration
When the notification service is integrated, update the TODO comments to:
1. Send push notifications to users
2. Send email notifications
3. Track notification delivery

### Batch Processing
For large user bases, consider:
1. Processing subscriptions in batches
2. Using BullMQ for distributed job processing
3. Implementing job queues for retry logic

### Analytics
Add analytics tracking for:
1. Churn rate (subscriptions that expire)
2. Grace period recovery rate
3. Quota usage patterns

## Troubleshooting

### Job Not Running
1. Verify `ScheduleModule.forRoot()` is imported in `AppModule`
2. Check server logs for cron initialization
3. Verify server timezone configuration

### Incorrect Quota Limits
1. Check subscription status is correctly set
2. Verify quota reset date calculation
3. Review subscription tier logic

### Grace Period Not Working
1. Verify `gracePeriodEndDate` is set correctly (7 days from payment failure)
2. Check that grace period check runs after expiration check
3. Review webhook handler that sets grace period

## Related Files

- `subscription-scheduler.service.ts` - Main scheduler implementation
- `subscription.service.ts` - Core subscription logic
- `subscription.module.ts` - Module configuration
- `app.module.ts` - ScheduleModule import

## Dependencies

- `@nestjs/schedule` - Cron job scheduling
- `@nestjs/common` - NestJS core functionality
- `@prisma/client` - Database access
