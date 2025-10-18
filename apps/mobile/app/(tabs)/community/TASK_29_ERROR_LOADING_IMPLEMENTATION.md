# Task 29: Error Handling ve Loading States Implementation

## Özet

Task 29 kapsamında Q&A Community özelliği için kapsamlı error handling, loading states, empty states ve offline mode handling implement edildi.

## Implement Edilen Component'ler

### 1. Loading Skeletons (`LoadingSkeleton.tsx`)

Shimmer effect'li skeleton component'ler:

- **LoadingSkeleton**: Temel skeleton component (animasyonlu)
- **QuestionCardSkeleton**: Soru kartı skeleton'u
- **AnswerCardSkeleton**: Cevap kartı skeleton'u
- **CommentSkeleton**: Yorum skeleton'u
- **QuestionListSkeleton**: Soru listesi skeleton'u (count parametresi ile)
- **AnswerListSkeleton**: Cevap listesi skeleton'u (count parametresi ile)

**Özellikler:**
- Smooth fade in/out animasyonu
- Configurable width, height, borderRadius
- Gerçek component'lerin layout'unu taklit eder
- Theme-aware (dark mode desteği)

**Kullanım:**
```tsx
import { QuestionListSkeleton, AnswerListSkeleton } from '@/components/qna';

// Loading state'de
{isLoading && <QuestionListSkeleton count={5} />}
```

### 2. Error Boundary (`ErrorBoundary.tsx`)

React Error Boundary component'i:

- Beklenmeyen hataları yakalar
- Custom fallback UI desteği
- Error logging callback
- Development mode'da error details gösterir
- Reset functionality

**Kullanım:**
```tsx
import { ErrorBoundary } from '@/components/qna';

<ErrorBoundary
    onError={(error, errorInfo) => {
        // Log to error tracking service
        console.error('Error:', error, errorInfo);
    }}
    fallback={(error, resetError) => (
        <CustomErrorUI error={error} onReset={resetError} />
    )}
>
    <YourComponent />
</ErrorBoundary>
```

### 3. Error State (`ErrorState.tsx`)

Standart error display component'i:

**Error Types:**
- `network`: İnternet bağlantı hatası
- `not-found`: İçerik bulunamadı
- `unauthorized`: Yetki hatası
- `server`: Sunucu hatası
- `unknown`: Bilinmeyen hata

**Özellikler:**
- Her error type için önceden tanımlı icon, title, message
- Custom title ve message override
- Retry button (opsiyonel)
- Theme-aware styling

**Kullanım:**
```tsx
import { ErrorState } from '@/components/qna';

{isError && (
    <ErrorState
        type="network"
        onRetry={() => refetch()}
    />
)}
```

### 4. Empty State (`EmptyState.tsx`)

Boş içerik durumları için component:

**Empty State Types:**
- `questions`: Soru yok
- `answers`: Cevap yok
- `comments`: Yorum yok
- `favorites`: Favori yok
- `following`: Takip edilen yok
- `search`: Arama sonucu yok
- `generic`: Genel boş durum

**Özellikler:**
- Her type için önceden tanımlı icon, title, message
- Custom content override
- Action button (opsiyonel)
- Minimum height garantisi

**Kullanım:**
```tsx
import { EmptyState } from '@/components/qna';

{questions.length === 0 && (
    <EmptyState
        type="questions"
        actionLabel="Soru Sor"
        onAction={handleAskQuestion}
    />
)}
```

### 5. Offline Banner (`OfflineBanner.tsx`)

Network durumu banner'ı:

**Özellikler:**
- Otomatik slide in/out animasyonu
- Network durumunu real-time takip eder
- Ekranın üstünde fixed position
- Smooth spring animasyonu

**Kullanım:**
```tsx
import { OfflineBanner } from '@/components/qna';

// Her ekranın en üstüne ekle
<SafeAreaView>
    <OfflineBanner />
    {/* Rest of content */}
</SafeAreaView>
```

### 6. Network Status Hook (`useNetworkStatus.ts`)

Network durumunu takip eden hook:

**Return Values:**
- `isConnected`: boolean - İnternet bağlantısı var mı?
- `isInternetReachable`: boolean | null - İnternet erişilebilir mi?
- `type`: string | null - Bağlantı tipi (wifi, cellular, etc.)

**Kullanım:**
```tsx
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const { isConnected, isInternetReachable, type } = useNetworkStatus();

if (!isConnected) {
    // Show offline UI
}
```

### 7. Retry Hook (`useRetry.ts`)

Retry logic için hook:

**Features:**
- Configurable max retries
- Configurable retry delay
- Retry callbacks
- Can check if retry is available
- Reset functionality

**Exponential Backoff Variant:**
- `useExponentialRetry`: Exponential backoff strategy ile retry

**Kullanım:**
```tsx
import { useRetry, useExponentialRetry } from '@/hooks/useRetry';

const { retry, isRetrying, retryCount, canRetry, reset } = useRetry(
    async () => {
        await fetchData();
    },
    {
        maxRetries: 3,
        retryDelay: 1000,
        onRetry: (attempt) => console.log(`Retry attempt ${attempt}`),
        onMaxRetriesReached: () => console.log('Max retries reached'),
    }
);

// Exponential backoff
const exponentialRetry = useExponentialRetry(
    async () => await fetchData(),
    { baseDelay: 1000, maxRetries: 5 }
);
```

## Güncellenen Ekranlar

### 1. Community Index (`community/index.tsx`)

**Değişiklikler:**
- ✅ Loading state'de `QuestionListSkeleton` gösteriliyor
- ✅ Error state'de `ErrorState` component'i kullanılıyor
- ✅ Empty state'de `EmptyState` component'i kullanılıyor
- ✅ `OfflineBanner` eklendi
- ✅ Network durumuna göre error type belirleniyor
- ✅ Loading overlay kaldırıldı (skeleton kullanılıyor)

### 2. Question Detail (`community/[id].tsx`)

**Değişiklikler:**
- ✅ Loading state'de skeleton gösteriliyor
- ✅ Error state'de `ErrorState` component'i kullanılıyor
- ✅ Empty state'de `EmptyState` component'i kullanılıyor
- ✅ `OfflineBanner` eklendi
- ✅ Network durumuna göre error type belirleniyor
- ✅ Answers loading'de `AnswerListSkeleton` kullanılıyor

## Best Practices

### 1. Loading States

```tsx
// ❌ Kötü: Generic spinner
{isLoading && <ActivityIndicator />}

// ✅ İyi: Content-aware skeleton
{isLoading && <QuestionListSkeleton count={5} />}
```

### 2. Error Handling

```tsx
// ❌ Kötü: Generic error message
{isError && <Text>Error occurred</Text>}

// ✅ İyi: Specific error type with retry
{isError && (
    <ErrorState
        type={!isConnected ? 'network' : 'server'}
        onRetry={() => refetch()}
    />
)}
```

### 3. Empty States

```tsx
// ❌ Kötü: Sadece text
{items.length === 0 && <Text>No items</Text>}

// ✅ İyi: Actionable empty state
{items.length === 0 && (
    <EmptyState
        type="questions"
        actionLabel="Create First Item"
        onAction={handleCreate}
    />
)}
```

### 4. Offline Handling

```tsx
// Her ekranda offline banner ekle
<SafeAreaView>
    <OfflineBanner />
    {/* Content */}
</SafeAreaView>

// Network durumunu kontrol et
const { isConnected } = useNetworkStatus();

if (!isConnected) {
    return <ErrorState type="network" />;
}
```

## Performans Optimizasyonları

1. **Skeleton Animations**: Native driver kullanılıyor (60 FPS)
2. **Network Listener**: Component unmount'da unsubscribe ediliyor
3. **Memoization**: useMemo ile gereksiz re-render'lar önleniyor
4. **Conditional Rendering**: Loading state'de sadece gerekli component'ler render ediliyor

## Accessibility

- Error ve empty state'ler screen reader friendly
- Retry button'lar accessible
- Icon'lar decorative (aria-hidden equivalent)
- Color contrast WCAG AA standardına uygun

## Testing Önerileri

### Unit Tests
```tsx
// ErrorState component
- Should render correct icon for each error type
- Should call onRetry when retry button pressed
- Should hide retry button when showRetry is false

// EmptyState component
- Should render correct content for each type
- Should call onAction when action button pressed
- Should hide action button when showAction is false

// useNetworkStatus hook
- Should return correct initial state
- Should update when network changes
- Should cleanup on unmount
```

### Integration Tests
```tsx
// Community screens
- Should show skeleton while loading
- Should show error state on fetch failure
- Should show empty state when no data
- Should show offline banner when disconnected
- Should retry on button press
```

## Gelecek İyileştirmeler

1. **Error Tracking**: Sentry/Bugsnag entegrasyonu
2. **Offline Queue**: Offline'da yapılan işlemleri queue'ya al
3. **Retry Strategy**: Daha akıllı retry logic (circuit breaker pattern)
4. **Loading Progress**: Progress indicator for long operations
5. **Skeleton Variants**: Daha fazla skeleton variant (grid, list, etc.)

## Sonuç

Task 29 başarıyla tamamlandı. Tüm Q&A Community ekranlarında:
- ✅ Loading skeletons implement edildi
- ✅ Error boundaries eklendi
- ✅ Retry mechanisms implement edildi
- ✅ Empty states eklendi
- ✅ Offline mode handling implement edildi

Kullanıcı deneyimi önemli ölçüde iyileştirildi ve hata durumları daha iyi yönetiliyor.
