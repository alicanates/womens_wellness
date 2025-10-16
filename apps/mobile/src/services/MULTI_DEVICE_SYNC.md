# Multi-Device Subscription Sync

This document describes the multi-device synchronization implementation for premium subscriptions.

## Overview

The multi-device sync system ensures that subscription status is consistent across all devices where a user is logged in. When a user purchases, cancels, or restores a subscription on one device, all other devices are automatically updated.

## Requirements Addressed

- **14.1**: THE System SHALL abonelik durumunu sunucuda saklar
- **14.2**: WHEN kullanıcı farklı cihazda oturum açtığında, THE System SHALL abonelik durumunu senkronize eder
- **14.3**: THE System SHALL aynı platform (iOS/Android) içinde abonelik paylaşımını destekler
- **14.4**: THE System SHALL kullanıcının tüm cihazlarında premium erişimi sağlar
- **14.5**: WHEN abonelik durumu değiştiğinde, THE System SHALL tüm cihazları günceller

## Architecture

### Components

1. **SubscriptionSyncService** (`subscriptionSync.ts`)
   - Manages subscription synchronization
   - Handles sync cooldown to prevent excessive API calls
   - Provides methods for forced sync and cache invalidation

2. **App Layout Integration** (`_layout.tsx`)
   - Syncs subscription on app start
   - Syncs subscription when app comes to foreground
   - Listens to app state changes

3. **IAP Integration** (`iap.ts`)
   - Triggers sync after successful purchase
   - Triggers sync after restore purchases

4. **Auth Store Integration** (`authStore.ts`)
   - Resets sync state on logout
   - Clears cache on auth changes

5. **usePremium Hook** (`usePremium.ts`)
   - Provides `syncSubscription()` method for manual sync
   - Exposes subscription status to components

## Sync Triggers

### Automatic Sync

1. **App Start**
   - When user is authenticated and app finishes loading
   - Ensures fresh subscription data on app launch

2. **App Foreground**
   - When app comes to foreground from background
   - Only syncs if last sync was > 30 seconds ago (cooldown)

3. **After Purchase**
   - Immediately after successful purchase validation
   - Forces sync regardless of cooldown

4. **After Restore**
   - After successfully restoring purchases
   - Forces sync regardless of cooldown

### Manual Sync

Components can manually trigger sync using:

```typescript
const { syncSubscription } = usePremium();

// Force sync
await syncSubscription();
```

## Cache Invalidation Strategy

### Query Keys

All subscription-related queries use consistent keys:

```typescript
subscriptionKeys = {
  all: ['subscription'],
  status: () => ['subscription', 'status'],
  quota: () => ['subscription', 'quota'],
  transactions: () => ['subscription', 'transactions'],
  usageStats: () => ['subscription', 'usage-stats'],
}
```

### Invalidation Hierarchy

When subscription changes:

1. Invalidate all subscription queries (`['subscription']`)
2. Invalidate quota queries separately (ensure refresh)
3. Invalidate home snapshot (contains subscription-dependent data)

This ensures all screens showing subscription data are updated.

## Sync Cooldown

To prevent excessive API calls:

- **Cooldown Period**: 30 seconds
- **Applies To**: Automatic foreground sync only
- **Bypassed By**: 
  - Purchase completion
  - Restore completion
  - Manual sync via `syncSubscription()`

## Data Flow

### Purchase Flow

```
User purchases → IAP validates → Backend updates DB → 
Sync service fetches fresh data → Cache invalidated → 
All screens re-render with new data
```

### Multi-Device Flow

```
Device A: User purchases → Backend updates DB
Device B: App foregrounds → Sync service checks → 
Fetches fresh data → Cache invalidated → 
Premium features activated
```

## Error Handling

### Sync Failures

- Sync failures are logged but don't block app functionality
- App continues with cached data if sync fails
- Next sync attempt will retry

### Network Issues

- React Query handles retries automatically (2 retries)
- Exponential backoff for retry delays
- Refetch on network reconnect

## Testing

### Test Scenarios

1. **Purchase on Device A, Open Device B**
   - Device B should show premium status within 30 seconds

2. **Cancel on Device A, Open Device B**
   - Device B should show free status within 30 seconds

3. **Restore on Device A**
   - Device A should immediately show premium status
   - Device B should sync on next foreground

4. **Offline Purchase**
   - Purchase queued until online
   - Sync occurs when connection restored

### Manual Testing

```typescript
// In any component
const { syncSubscription, subscription } = usePremium();

// Check current status
console.log('Current status:', subscription?.status);

// Force sync
await syncSubscription();

// Check updated status
console.log('Updated status:', subscription?.status);
```

## Performance Considerations

### Optimizations

1. **Cooldown Period**: Prevents excessive API calls
2. **Stale Time**: 5 minutes for subscription queries
3. **Cache Time**: 30 minutes to keep data available
4. **Structural Sharing**: Prevents unnecessary re-renders
5. **Concurrent Sync Prevention**: Only one sync at a time

### Network Usage

- Typical sync: ~1-2 KB per request
- Frequency: Max once per 30 seconds (automatic)
- Additional syncs only on critical events (purchase, restore)

## Debugging

### Enable Logging

All sync operations are logged with `[SubscriptionSync]` prefix:

```
[SubscriptionSync] Starting subscription sync...
[SubscriptionSync] Sync completed successfully
[SubscriptionSync] Invalidating subscription cache...
[SubscriptionSync] Cache invalidation complete
```

### Check Sync State

```typescript
import { subscriptionSyncService } from '@/services/subscriptionSync';

// Check if sync should occur
console.log('Should sync:', subscriptionSyncService.shouldSync());

// Force sync
await subscriptionSyncService.forceSyncSubscriptionStatus();

// Reset state
subscriptionSyncService.reset();
```

## Future Enhancements

1. **WebSocket Support**: Real-time subscription updates
2. **Background Sync**: Sync even when app is backgrounded
3. **Conflict Resolution**: Handle simultaneous changes on multiple devices
4. **Offline Queue**: Queue subscription changes when offline

## Related Files

- `apps/mobile/src/services/subscriptionSync.ts` - Sync service
- `apps/mobile/app/_layout.tsx` - App integration
- `apps/mobile/src/hooks/usePremium.ts` - React hook
- `apps/mobile/src/services/iap.ts` - IAP integration
- `apps/mobile/src/store/authStore.ts` - Auth integration
- `apps/mobile/src/lib/queryClient.ts` - Cache configuration
