# Multi-Device Sync Flow Diagrams

## 1. App Start Sync Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      App Starts                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Auth Initialized?   │
              └──────────┬───────────┘
                         │ Yes
                         ▼
              ┌──────────────────────┐
              │ Sync Subscription    │
              │ Status from Server   │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Update Cache with   │
              │   Fresh Data         │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Invalidate Related   │
              │     Queries          │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  All Screens Show    │
              │   Updated Status     │
              └──────────────────────┘
```

## 2. Purchase Flow (Multi-Device)

```
Device A                          Backend                      Device B
   │                                 │                            │
   │ 1. User Purchases              │                            │
   ├────────────────────────────────>│                            │
   │                                 │                            │
   │ 2. Validate Receipt             │                            │
   │<────────────────────────────────┤                            │
   │                                 │                            │
   │ 3. Update Subscription          │                            │
   │                                 │ (DB Updated)               │
   │                                 │                            │
   │ 4. Sync Immediately             │                            │
   ├────────────────────────────────>│                            │
   │                                 │                            │
   │ 5. Get Fresh Data               │                            │
   │<────────────────────────────────┤                            │
   │                                 │                            │
   │ 6. Invalidate Cache             │                            │
   │ (Premium Activated)             │                            │
   │                                 │                            │
   │                                 │    7. App Foregrounds      │
   │                                 │<───────────────────────────┤
   │                                 │                            │
   │                                 │    8. Sync Request         │
   │                                 │<───────────────────────────┤
   │                                 │                            │
   │                                 │    9. Fresh Data           │
   │                                 ├───────────────────────────>│
   │                                 │                            │
   │                                 │    10. Cache Updated       │
   │                                 │    (Premium Activated)     │
   │                                 │                            │
```

## 3. Foreground Sync Flow

```
┌─────────────────────────────────────────────────────────────┐
│              App Comes to Foreground                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Check Cooldown     │
              │  (Last sync < 30s?)  │
              └──────────┬───────────┘
                         │
                    ┌────┴────┐
                    │         │
                   Yes       No
                    │         │
                    │         ▼
                    │    ┌──────────────────────┐
                    │    │ Sync Subscription    │
                    │    │ Status from Server   │
                    │    └──────────┬───────────┘
                    │               │
                    │               ▼
                    │    ┌──────────────────────┐
                    │    │  Update Cache with   │
                    │    │   Fresh Data         │
                    │    └──────────┬───────────┘
                    │               │
                    │               ▼
                    │    ┌──────────────────────┐
                    │    │ Invalidate Related   │
                    │    │     Queries          │
                    │    └──────────┬───────────┘
                    │               │
                    ▼               ▼
              ┌──────────────────────┐
              │  Continue with App   │
              └──────────────────────┘
```

## 4. Cache Invalidation Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│            Subscription Change Detected                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Invalidate All       │
              │ ['subscription']     │
              └──────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌────────────┐ ┌────────────────┐
│ Status Query   │ │ Quota Query│ │ Transactions   │
│ Invalidated    │ │ Invalidated│ │ Invalidated    │
└────────┬───────┘ └─────┬──────┘ └────────┬───────┘
         │               │                  │
         └───────────────┼──────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Invalidate Home      │
              │ Snapshot             │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ React Query Notifies │
              │ All Components       │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Components Re-render │
              │ with Fresh Data      │
              └──────────────────────┘
```

## 5. Sync State Machine

```
                    ┌──────────────┐
                    │    IDLE      │
                    └──────┬───────┘
                           │
                           │ Sync Triggered
                           │
                           ▼
                    ┌──────────────┐
              ┌─────┤   SYNCING    ├─────┐
              │     └──────────────┘     │
              │                          │
         Success                      Failure
              │                          │
              ▼                          ▼
       ┌──────────────┐          ┌──────────────┐
       │   SYNCED     │          │    ERROR     │
       │ (30s cooldown)│          │  (Retry)     │
       └──────┬───────┘          └──────┬───────┘
              │                          │
              │                          │
              └──────────┬───────────────┘
                         │
                         │ After Cooldown
                         │
                         ▼
                    ┌──────────────┐
                    │    IDLE      │
                    └──────────────┘
```

## 6. Component Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component                           │
│                                                              │
│  const { subscription, isPremium, syncSubscription } =       │
│    usePremium();                                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         React Query (useQuery)                     │    │
│  │                                                     │    │
│  │  - Fetches subscription data                       │    │
│  │  - Caches with 5 min stale time                    │    │
│  │  - Auto refetches when invalidated                 │    │
│  │  - Notifies component on data change               │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│                       ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Subscription Sync Service                  │    │
│  │                                                     │    │
│  │  - Manages sync lifecycle                          │    │
│  │  - Handles cooldown                                │    │
│  │  - Invalidates cache                               │    │
│  │  - Prevents concurrent syncs                       │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│                       ▼                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │         API Service                                │    │
│  │                                                     │    │
│  │  - Makes HTTP request to backend                   │    │
│  │  - Handles auth tokens                             │    │
│  │  - Returns subscription data                       │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Backend    │
                 │   Database   │
                 └──────────────┘
```

## Key Points

1. **Automatic Sync**: Happens on app start and foreground
2. **Cooldown**: 30 seconds between automatic syncs
3. **Force Sync**: Purchase and restore bypass cooldown
4. **Cache Invalidation**: Propagates changes to all screens
5. **Error Handling**: Graceful degradation on sync failures
6. **Performance**: Optimized to minimize API calls
