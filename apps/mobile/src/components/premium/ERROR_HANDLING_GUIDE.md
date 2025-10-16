# Premium Subscription Error Handling Guide

This guide explains how error handling is implemented for the premium subscription system.

## Requirements Coverage

This implementation covers the following requirements:

- **2.8**: Purchase error handling (user cancelled, already owned, etc.)
- **5.6**: Feature access error handling
- **6.4**: Quota exceeded handling
- **6.5**: Quota warning handling
- **16.1-16.7**: Grace period UI states and payment failure handling

## Error Types

### IAP Errors

The `IAPServiceError` class provides detailed error information for in-app purchase operations:

```typescript
enum IAPErrorCode {
    NOT_INITIALIZED,
    INITIALIZATION_FAILED,
    PRODUCT_NOT_FOUND,
    PURCHASE_FAILED,
    VALIDATION_FAILED,
    RESTORE_FAILED,
    USER_CANCELLED,
    ALREADY_OWNED,
    NO_RECEIPT,
    NETWORK_ERROR,
    ITEM_UNAVAILABLE,
    SERVICE_ERROR,
    RECEIPT_FAILED,
    PAYMENT_INVALID,
    PAYMENT_NOT_ALLOWED,
    // ... and more platform-specific errors
}
```

### Error Classification

Errors are automatically classified into categories:

- **NETWORK**: Internet connection issues
- **TIMEOUT**: Request timeout
- **RATE_LIMIT**: Too many requests
- **QUOTA_EXCEEDED**: Message quota depleted
- **VALIDATION**: Invalid input
- **AUTHENTICATION**: Session expired
- **PERMISSION**: Insufficient permissions
- **NOT_FOUND**: Resource not found
- **SERVER**: Server error
- **UNKNOWN**: Unclassified error

## Components

### 1. GracePeriodBanner

Displays a warning when subscription is in grace period due to payment failure.

**Usage:**
```tsx
import { GracePeriodBanner } from '@/components/premium/GracePeriodBanner';

<GracePeriodBanner 
    subscription={subscription}
    onDismiss={() => {}}
/>
```

**Features:**
- Shows days remaining in grace period
- Provides button to update payment method
- Opens platform subscription management
- Dismissible

### 2. QuotaExceededModal

Shows when user has exceeded their AI message quota.

**Usage:**
```tsx
import { QuotaExceededModal } from '@/components/premium/QuotaExceededModal';

<QuotaExceededModal
    visible={showModal}
    onClose={() => setShowModal(false)}
    quota={quota}
    isPremium={isPremium}
/>
```

**Features:**
- Shows quota usage and reset date
- Offers upgrade to premium (for free users)
- Shows premium benefits
- Animated entrance

### 3. Error Handling Utilities

Centralized error handling functions in `@/utils/errorHandling`:

```typescript
import {
    classifyError,
    getUserFriendlyMessage,
    isRecoverableError,
    requiresUserAction,
    showErrorAlert,
    handleIAPError,
    logError,
} from '@/utils/errorHandling';
```

## Error Handling Patterns

### 1. Purchase Errors

```typescript
try {
    await iapManager.purchase(tier);
} catch (error) {
    handleIAPError(error, {
        onRestore: handleRestore,
        onRetry: handlePurchase,
        onCancel: () => {},
    });
}
```

**Handled Cases:**
- User cancelled → Silent (no alert)
- Already owned → Offer restore
- Network error → Offer retry
- Payment invalid → Show error + settings
- Other errors → Show user-friendly message

### 2. Restore Errors

```typescript
try {
    const purchases = await iapManager.restorePurchases();
    
    if (purchases.length === 0) {
        Alert.alert(
            'Satın Alım Bulunamadı',
            'Geri yüklenecek satın alım bulunamadı...'
        );
    }
} catch (error) {
    handleIAPError(error, {
        onRetry: handleRestore,
    });
}
```

**Handled Cases:**
- No purchases found → Informative message
- Network error → Offer retry
- Validation failed → Show error message

### 3. Quota Errors

```typescript
// Before sending message
if (isDepleted) {
    setShowQuotaExceeded(true);
    return;
}

// Show warning if low
if (isLow && !isPremium) {
    Alert.alert(
        'Mesaj Kotası Azalıyor',
        `Kalan mesaj kotanız: ${quota?.remaining}...`,
        [
            { text: 'Devam Et' },
            { text: 'Premium\'a Geç', onPress: () => router.push('/premium') },
        ]
    );
}
```

**Handled Cases:**
- Quota depleted → Show modal with upgrade option
- Quota low (< 20%) → Show warning alert
- After message sent → Increment quota

### 4. Network Errors

```typescript
try {
    await api.call();
} catch (error) {
    if (classifyError(error) === ErrorType.NETWORK) {
        showErrorAlert(error, {
            title: 'Bağlantı Hatası',
            onRetry: () => api.call(),
        });
    }
}
```

**Features:**
- Automatic retry with exponential backoff (in IAP validation)
- User-friendly messages
- Retry option for recoverable errors

### 5. Grace Period Handling

```typescript
// In Settings screen
{subscription && subscription.isInGracePeriod && (
    <GracePeriodBanner subscription={subscription} />
)}
```

**Features:**
- Automatic display when in grace period
- Shows days remaining
- Direct link to payment update
- Maintains premium access during grace period

## Error Messages

All error messages are user-friendly and in Turkish:

### Purchase Errors
- User cancelled: (Silent)
- Already owned: "Bu aboneliğe zaten sahipsiniz. Satın alımlarınızı geri yükleyebilirsiniz."
- Network error: "İnternet bağlantınızı kontrol edin ve tekrar deneyin."
- Payment invalid: "Ödeme bilgileriniz geçersiz. Lütfen ödeme yönteminizi kontrol edin."
- Payment not allowed: "Bu cihazda satın alma yapma izniniz yok. Lütfen cihaz ayarlarınızı kontrol edin."

### Quota Errors
- Quota exceeded: "Mesaj kotanız doldu. Premium'a geçerek sınırsız mesaj gönderin."
- Quota low: "Mesaj kotanız azalıyor. Kalan: X mesaj."

### Grace Period
- Payment failed: "Aboneliğiniz için ödeme alınamadı. Premium erişiminiz X gün içinde sona erecek."

## Testing Error Scenarios

### 1. Test User Cancellation
```typescript
// User cancels purchase dialog
// Expected: No error alert, silent return
```

### 2. Test Already Owned
```typescript
// Try to purchase already owned subscription
// Expected: Alert with "Geri Yükle" option
```

### 3. Test Network Error
```typescript
// Disable internet, try purchase
// Expected: Alert with "Tekrar Dene" option
```

### 4. Test Quota Exceeded
```typescript
// Use all quota, try to send message
// Expected: QuotaExceededModal appears
```

### 5. Test Grace Period
```typescript
// Set subscription to grace period state
// Expected: GracePeriodBanner appears in settings
```

## Best Practices

1. **Always use error utilities**: Don't create custom error messages
2. **Log errors**: Use `logError()` for debugging
3. **Provide retry options**: For recoverable errors
4. **Be specific**: Use appropriate error codes
5. **Test edge cases**: Especially network failures
6. **Handle silent errors**: Like user cancellation
7. **Show progress**: Use loading states during operations
8. **Validate early**: Check quota before operations
9. **Sync after changes**: Invalidate queries after subscription changes
10. **Graceful degradation**: Continue operation even if non-critical steps fail

## Error Recovery Flow

```
Error Occurs
    ↓
Classify Error Type
    ↓
Is Recoverable? ──Yes──→ Show Retry Option
    ↓ No
Requires Action? ──Yes──→ Show Settings Option
    ↓ No
Show Error Message
    ↓
Log for Debugging
```

## Platform-Specific Considerations

### iOS
- Cloud service errors (iCloud required)
- Privacy acknowledgement required (iOS 14+)
- App Store subscription management URL

### Android
- Google Play service errors
- Purchase token validation
- Play Store subscription management URL

## Monitoring and Debugging

All errors are logged with context:

```typescript
logError(error, 'Purchase Flow');
// Logs: [Error - Purchase Flow] { type, message, originalError, stack }
```

Use these logs to:
- Track error frequency
- Identify patterns
- Debug production issues
- Improve error messages

## Future Improvements

1. **Error Analytics**: Track error rates and types
2. **Automatic Retry**: Implement automatic retry for transient errors
3. **Offline Queue**: Queue operations when offline
4. **Error Recovery**: Automatic recovery for known issues
5. **User Feedback**: Collect feedback on error experiences
