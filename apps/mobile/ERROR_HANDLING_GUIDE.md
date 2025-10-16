# Error Handling & Edge Cases - Testing Guide

Bu doküman, Discover Section için implement edilen error handling ve edge case'lerin test edilmesi için hazırlanmıştır.

## 🎯 Kapsam

Task 12 kapsamında aşağıdaki özellikler implement edilmiştir:

### 1. API Error Handling
- ✅ Input validation (limit, page, locale, search length)
- ✅ Better error messages
- ✅ Proper HTTP status codes
- ✅ Logging with NestJS Logger
- ✅ Try-catch blocks tüm service metodlarında

### 2. Mobile Error States
- ✅ Loading states (spinner + text)
- ✅ Error states (icon + message + retry button)
- ✅ Empty states (no articles, no saved articles, no search results)
- ✅ Network error recovery (retry with exponential backoff)

### 3. Offline Support & Cache
- ✅ React Query cache configuration (5 min stale, 30 min cache)
- ✅ Retry logic (2 attempts with exponential backoff)
- ✅ RefetchOnReconnect enabled
- ✅ KeepPreviousData for better UX
- ✅ Optimistic updates for save/unsave

### 4. Network Error Recovery
- ✅ Network error utility functions
- ✅ User-friendly error messages
- ✅ Retry button on all error states
- ✅ Pull-to-refresh on all lists

## 🧪 Test Senaryoları

### Backend API Tests

#### 1. Input Validation Tests

**Test: Invalid limit parameter**
```bash
# Should return 400 Bad Request
curl -X GET "http://localhost:3000/discover/home-feed?limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: "Limit must be between 1 and 50"
```

**Test: Invalid locale**
```bash
# Should return 400 Bad Request
curl -X GET "http://localhost:3000/discover/articles?locale=fr" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: "Locale must be 'tr' or 'en'"
```

**Test: Invalid page number**
```bash
# Should return 400 Bad Request
curl -X GET "http://localhost:3000/discover/articles?page=0" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: "Page must be a positive number"
```

**Test: Search query too long**
```bash
# Should return 400 Bad Request
curl -X GET "http://localhost:3000/discover/articles?search=VERY_LONG_STRING_OVER_200_CHARS..." \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: "Search query too long (max 200 characters)"
```

**Test: Invalid article ID**
```bash
# Should return 400 Bad Request
curl -X GET "http://localhost:3000/discover/articles/123" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: "Invalid article ID"
```

#### 2. Not Found Tests

**Test: Article not found**
```bash
# Should return 404 Not Found
curl -X GET "http://localhost:3000/discover/articles/clxxxxxxxxxxxxxxxxx" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: "Article not found"
```

#### 3. Error Logging Tests

- Check server logs for error messages
- Verify that sensitive information is not logged
- Confirm that error context (userId, articleId) is included

### Mobile App Tests

#### 1. Loading States

**Test: Home screen loading**
1. Clear app cache
2. Open app
3. Navigate to home screen
4. ✅ Should show loading spinner with "Yükleniyor..." text

**Test: Discover page loading**
1. Navigate to Discover page
2. ✅ Should show loading spinner with "Makaleler yükleniyor..." text

**Test: Article detail loading**
1. Click on an article
2. ✅ Should show loading spinner with "Makale yükleniyor..." text

#### 2. Error States

**Test: Home screen error**
1. Turn off internet connection
2. Clear app cache
3. Open app
4. ✅ Should show error icon (⚠️)
5. ✅ Should show error message
6. ✅ Should show "Tekrar Dene" button
7. Click retry button
8. ✅ Should attempt to reload

**Test: Discover page error**
1. Turn off internet connection
2. Navigate to Discover page
3. ✅ Should show error state with retry button
4. Turn on internet
5. Click retry button
6. ✅ Should successfully load articles

**Test: Article detail error**
1. Navigate to article detail with invalid ID
2. ✅ Should show "Makale bulunamadı" error
3. ✅ Should show "Listeye Dön" button
4. Click button
5. ✅ Should navigate back to list

#### 3. Empty States

**Test: No articles in category**
1. Navigate to Discover page
2. Select a category with no articles
3. ✅ Should show "Makale bulunamadı" message
4. ✅ Should show empty state icon (📚)

**Test: No saved articles**
1. Navigate to Discover page
2. Switch to "Kaydedilenler" tab
3. ✅ Should show "Henüz kaydedilmiş makale yok" message

**Test: No search results**
1. Navigate to Discover page
2. Search for "xyz123nonexistent"
3. ✅ Should show "Arama sonucu bulunamadı" message
4. ✅ Should show "Farklı bir arama terimi deneyin" subtitle

#### 4. Network Recovery

**Test: Offline to online transition**
1. Turn off internet
2. Navigate to Discover page
3. ✅ Should show error state
4. Turn on internet
5. ✅ Should automatically refetch (refetchOnReconnect)

**Test: Pull to refresh**
1. Navigate to Discover page
2. Pull down to refresh
3. ✅ Should show refresh indicator
4. ✅ Should reload articles

**Test: Infinite scroll with network error**
1. Load Discover page
2. Scroll to bottom
3. Turn off internet
4. Continue scrolling
5. ✅ Should show error in footer
6. Turn on internet
7. ✅ Should retry loading next page

#### 5. Optimistic Updates

**Test: Save article offline**
1. Load article list
2. Turn off internet
3. Click save button on an article
4. ✅ Should immediately show as saved (optimistic update)
5. Turn on internet
6. ✅ Should sync with server
7. ✅ If sync fails, should revert to previous state

**Test: Unsave article with error**
1. Have a saved article
2. Simulate server error (500)
3. Click unsave button
4. ✅ Should show error message
5. ✅ Should keep article as saved

#### 6. Cache Behavior

**Test: Stale data**
1. Load Discover page
2. Wait 6 minutes (stale time = 5 min)
3. Navigate away and back
4. ✅ Should show cached data immediately
5. ✅ Should refetch in background

**Test: Cache expiration**
1. Load Discover page
2. Wait 31 minutes (cache time = 30 min)
3. Navigate away and back
4. ✅ Should show loading state
5. ✅ Should fetch fresh data

#### 7. Retry Logic

**Test: Exponential backoff**
1. Simulate network error
2. Observe retry attempts
3. ✅ First retry after ~1 second
4. ✅ Second retry after ~2 seconds
5. ✅ Should stop after 2 retries

**Test: Retry on 5xx errors**
1. Simulate 500 server error
2. ✅ Should retry automatically
3. ✅ Should show error after max retries

**Test: No retry on 4xx errors**
1. Simulate 404 error
2. ✅ Should NOT retry
3. ✅ Should show error immediately

## 📊 Error Messages

### Turkish Error Messages
- ✅ "İnternet bağlantınızı kontrol edin" - Network error
- ✅ "Sunucu hatası. Lütfen daha sonra tekrar deneyin." - Server error (5xx)
- ✅ "İçerik bulunamadı" - 404 error
- ✅ "Oturum süreniz doldu. Lütfen tekrar giriş yapın." - 401 error
- ✅ "Bu işlem için yetkiniz yok" - 403 error
- ✅ "Makaleler yüklenirken bir hata oluştu" - Generic error
- ✅ "Makale bulunamadı" - Article not found
- ✅ "Henüz kaydedilmiş makale yok" - No saved articles
- ✅ "Arama sonucu bulunamadı" - No search results
- ✅ "Makale bulunamadı" - No articles in category

## 🔧 Debugging Tools

### Network Error Utility
```typescript
import { parseNetworkError, getErrorMessage, isRetryableError } from '@/utils/networkError';

// Parse error
const parsed = parseNetworkError(error);
console.log('Is network error:', parsed.isNetworkError);
console.log('Is server error:', parsed.isServerError);
console.log('Status code:', parsed.statusCode);

// Get user-friendly message
const message = getErrorMessage(error);

// Check if retryable
const shouldRetry = isRetryableError(error);
```

### React Query DevTools
```typescript
// Add to _layout.tsx for debugging
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## ✅ Checklist

### Backend
- [x] Input validation on all endpoints
- [x] Proper error status codes (400, 404, 500)
- [x] Error logging with context
- [x] Try-catch blocks in all service methods
- [x] User-friendly error messages
- [x] Validation for limit, page, locale, search
- [x] ID format validation

### Mobile
- [x] Loading states on all screens
- [x] Error states with retry button
- [x] Empty states with helpful messages
- [x] Network error detection
- [x] Retry logic with exponential backoff
- [x] Pull-to-refresh on lists
- [x] Optimistic updates for mutations
- [x] Cache configuration
- [x] RefetchOnReconnect enabled
- [x] KeepPreviousData for better UX

### User Experience
- [x] Clear error messages in Turkish
- [x] Retry buttons on all error states
- [x] Loading indicators
- [x] Empty state illustrations
- [x] Smooth transitions
- [x] No data loss on errors
- [x] Graceful degradation

## 🚀 Performance

### Optimizations Implemented
- ✅ React Query caching (5 min stale, 30 min cache)
- ✅ Optimistic updates (instant UI feedback)
- ✅ KeepPreviousData (no loading flicker)
- ✅ Retry with exponential backoff
- ✅ RefetchOnReconnect (auto-recovery)
- ✅ Structural sharing (prevent re-renders)

### Metrics to Monitor
- Time to first content
- Error rate
- Retry success rate
- Cache hit rate
- Network request count

## 📝 Notes

- Tracking errors (view, share) fail silently to not disrupt user experience
- Save/unsave errors are shown to user as they're critical operations
- Network errors are retried automatically
- Client errors (4xx) are not retried
- Server errors (5xx) are retried up to 2 times
- All error messages are in Turkish for better UX
- Error logging includes user and article context for debugging

## 🎓 Best Practices Followed

1. **Fail Gracefully**: Show cached data when possible
2. **User Feedback**: Clear error messages and retry options
3. **Automatic Recovery**: Retry on network reconnect
4. **Optimistic Updates**: Instant UI feedback
5. **Proper Logging**: Context-rich error logs
6. **Input Validation**: Validate early, fail fast
7. **Type Safety**: TypeScript for error handling
8. **Consistent UX**: Same error patterns across app
