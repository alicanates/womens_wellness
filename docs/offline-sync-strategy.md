# Offline Sync Strategy

## Overview
The Wellness app implements an offline-first architecture where the mobile app can function without network connectivity, queueing mutations for later sync.

## Architecture

### Local Storage (Mobile)
- **SQLite**: Persistent offline cache
- **SecureStore**: Encrypted credentials
- **AsyncStorage**: App preferences

### Sync Queue
```
User Action → Local SQLite → Background Sync Job → API Server
```

## SQLite Schema

### Offline Queue Table
```sql
CREATE TABLE IF NOT EXISTS offline_queue (
  id TEXT PRIMARY KEY,
  operation TEXT NOT NULL,           -- 'create', 'update', 'delete'
  payload TEXT NOT NULL,              -- JSON-serialized data
  created_at INTEGER NOT NULL,
  retry_count INTEGER DEFAULT 0,
  conflict_resolution TEXT DEFAULT 'last_write_wins'
);
```

### Cached Messages Table
```sql
CREATE TABLE IF NOT EXISTS cached_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  synced INTEGER DEFAULT 0,          -- 0 = pending, 1 = synced
  sync_version INTEGER DEFAULT 1
);
```

## Conflict Resolution Strategies

### 1. Last Write Wins (Default)
- Use for: water logs, measurements, simple metrics
- Client timestamp determines winner
- Server accepts if `updatedAt` is newer

### 2. Server Authoritative
- Use for: conversations, memory, AI responses
- Server state is always correct
- Client discards local changes on conflict
- Return canonical record with `409 Conflict`

### 3. Version-Based (Future Enhancement)
- Track version numbers
- Reject if version mismatch
- Require client to fetch latest and re-apply

## Implementation

### Queueing a Mutation
```ts
async function queueMutation(operation: string, payload: any) {
  await db.runAsync(
    'INSERT INTO offline_queue (id, operation, payload, created_at) VALUES (?, ?, ?, ?)',
    [uuid(), operation, JSON.stringify(payload), Date.now()]
  );
}
```

### Background Sync Job
```ts
async function syncQueue() {
  // Check network
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return;

  // Get pending operations
  const pending = await db.getAllAsync(
    'SELECT * FROM offline_queue ORDER BY created_at ASC'
  );

  for (const op of pending) {
    try {
      await executeOperation(op);
      await db.runAsync('DELETE FROM offline_queue WHERE id = ?', [op.id]);
    } catch (error) {
      if (error.status === 409) {
        // Conflict - handle based on strategy
        await handleConflict(op, error.data);
      } else {
        // Increment retry count
        await db.runAsync(
          'UPDATE offline_queue SET retry_count = retry_count + 1 WHERE id = ?',
          [op.id]
        );
      }
    }
  }
}
```

### Network State Listener
```ts
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && isAuthenticated) {
      syncQueue(); // Trigger sync when online
    }
  });

  return unsubscribe;
}, [isAuthenticated]);
```

## Cached Data Strategy

### What to Cache
1. **Recent messages** (last 100 per conversation)
2. **Water logs** (last 30 days)
3. **Period cycles** (last 12 months)
4. **Reminders** (active only)
5. **User profile** (always)

### What NOT to Cache
- Sensitive personal data (unless encrypted)
- AI model responses (except user's messages)
- Admin data
- Other users' data

### Cache Invalidation
```ts
// ETags from server
const response = await fetch('/api/water', {
  headers: { 'If-None-Match': cachedETag },
});

if (response.status === 304) {
  // Use cached data
  return getCachedWaterLogs();
}

// Update cache
const data = await response.json();
await updateCache(data, response.headers.get('ETag'));
```

## Optimistic Updates

### Pattern
```ts
// 1. Update UI immediately
setWaterLogs(prev => [...prev, newLog]);

// 2. Queue for sync
await queueMutation('log_water', newLog);

// 3. Try to sync immediately if online
if (isOnline) {
  try {
    await syncQueue();
  } catch (error) {
    // Will retry in background
  }
}
```

### Rollback on Failure
```ts
try {
  await api.logWater(newLog);
} catch (error) {
  // Revert optimistic update
  setWaterLogs(prev => prev.filter(l => l.id !== newLog.id));

  // Show error
  showToast('Failed to log water. Will retry when online.');
}
```

## Sync Indicators

### UI States
1. **Synced** ✅: Green checkmark
2. **Pending** ⏳: Clock icon, grayed out
3. **Failed** ❌: Red exclamation, retry button
4. **Offline** 📡: Offline banner at top

### Banner Component
```tsx
{!isOnline && (
  <OfflineBanner>
    📡 You're offline. Changes will sync when reconnected.
  </OfflineBanner>
)}
```

## Testing Strategy

### Offline Mode Testing
1. Enable airplane mode on device
2. Perform actions (log water, create reminder)
3. Verify queued in SQLite
4. Disable airplane mode
5. Verify automatic sync
6. Check server for synced data

### Conflict Testing
1. Create data offline on Device A
2. Create conflicting data on Device B
3. Bring Device A online
4. Verify conflict resolution
5. Check both devices converge to same state

## Performance Considerations

### Batching
```ts
// Batch sync operations
const batch = pending.slice(0, 10);
await Promise.all(batch.map(executeOperation));
```

### Exponential Backoff
```ts
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
await new Promise(resolve => setTimeout(resolve, delay));
```

### Data Limits
- Max 1000 items in offline queue
- Max 100 MB cached data
- Prune old cache monthly

## Security Notes
- Encrypt sensitive cached data using device keychain
- Clear cache on logout
- Never cache authentication tokens in SQLite
- Use SecureStore for credentials only
