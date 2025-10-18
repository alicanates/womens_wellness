# React Hook Hatası Düzeltildi ✅

## Sorun
Uygulamada "Rendered fewer hooks than expected" hatası alınıyordu. Bu hata, React hook'larının her render'da aynı sırada çağrılmaması durumunda oluşur.

## Kök Neden
React'in hook kuralları:
1. Hook'lar her zaman aynı sırada çağrılmalıdır
2. Hook'lar koşullu ifadelerin içinde ÇAĞRILAMAZ
3. Hook'lardan ÖNCE erken return yapılamaz

### Tespit Edilen Sorunlar

#### 1. `apps/mobile/app/_layout.tsx` - Erken Return
```typescript
// ❌ YANLIŞ
function AppContent() {
  const { registerForPushNotifications } = useNotifications();
  // ... diğer hook'lar
  
  if (isLoading || !pinCheckComplete) {
    return <ActivityIndicator />; // ❌ Hook'lardan sonra erken return
  }
  
  return <Stack />;
}
```

**Sorun:** `isLoading` veya `pinCheckComplete` değiştiğinde, bazen erken return çalışıyor, bazen çalışmıyor. Bu da render edilen hook sayısının değişmesine neden oluyor.

#### 2. `apps/mobile/app/(tabs)/home.tsx` - Erken Return
```typescript
// ❌ YANLIŞ
export default function HomeScreen() {
  const theme = useTheme();
  // ... diğer hook'lar
  
  if (isLoading && !snapshot) {
    return <LoadingView />; // ❌ Hook'lardan sonra erken return
  }
  
  if (isError && !snapshot) {
    return <ErrorView />; // ❌ Hook'lardan sonra erken return
  }
  
  return <MainContent />;
}
```

#### 3. `apps/mobile/app/(tabs)/community/[id].tsx` - Koşullu Hook Aktivasyonu
```typescript
// ❌ YANLIŞ
const questionId = typeof id === 'string' && id.length > 0 ? id : '';

const { data: question } = useQuestion(questionId || 'placeholder', {
  enabled: !!questionId, // ❌ Hook bazen aktif, bazen pasif
});
```

**Sorun:** `questionId` boş string olduğunda hook devre dışı kalıyor, bu da hook sayısının değişmesine neden oluyor.

## Çözüm

### 1. `_layout.tsx` Düzeltmesi
```typescript
// ✅ DOĞRU
function AppContent() {
  // 1. TÜM HOOK'LARI ÖNCE ÇAĞIR (koşulsuz)
  const { registerForPushNotifications } = useNotifications();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const [pinCheckComplete, setPinCheckComplete] = useState(false);
  
  useQnaNotificationHandler();
  
  // 2. TÜM useEffect'leri ÇAĞIR (koşulsuz)
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // ... diğer useEffect'ler
  
  // 3. ŞIMDI koşullu render yapabiliriz
  const showLoading = isLoading || !pinCheckComplete;
  
  return (
    <>
      {showLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </>
  );
}
```

**Değişiklik:**
- Erken return yerine koşullu render kullanıldı
- Tüm hook'lar her zaman aynı sırada çağrılıyor
- `showLoading` değişkeni hook'lardan SONRA hesaplanıyor

### 2. `home.tsx` Düzeltmesi
```typescript
// ✅ DOĞRU
export default function HomeScreen() {
  // TÜM HOOK'LARI ÖNCE ÇAĞIR
  const theme = useTheme();
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [sessionDismissedCards, setSessionDismissedCards] = useState<Set<string>>(new Set());
  
  const { isPremium, canUseFeature } = usePremium();
  
  const { data: snapshot, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['homeSnapshot'],
    queryFn: () => homeService.getSnapshot('tr'),
    enabled: isAuthenticated,
    staleTime: 60000,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      }
    }, [isAuthenticated, refetch])
  );
  
  const dismissCardMutation = useMutation({ /* ... */ });
  const toggleSaveMutation = useMutation({ /* ... */ });
  
  // ... diğer fonksiyonlar
  
  const styles = createStyles(theme);
  
  // HOOK'LARDAN SONRA koşulları belirle
  const showLoading = isLoading && !snapshot;
  const showError = isError && !snapshot;
  
  // ŞIMDI koşullu render
  if (showLoading) {
    return <LoadingView />;
  }
  
  if (showError) {
    return <ErrorView />;
  }
  
  return <MainContent />;
}
```

**Değişiklik:**
- Koşullar hook'lardan SONRA hesaplanıyor
- Erken return'ler hala var ama TÜM hook'lar onlardan önce çağrılıyor

### 3. `community/[id].tsx` Düzeltmesi
```typescript
// ✅ DOĞRU
export default function QuestionDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { isConnected } = useNetworkStatus();
  
  // CRITICAL FIX: Her zaman geçerli bir string kullan
  // Boş string yerine 'INVALID_ID' kullanarak hook sayısının değişmesini önle
  const questionId = typeof id === 'string' && id.length > 0 ? id : 'INVALID_ID';
  const hasValidId = typeof id === 'string' && id.length > 0;
  
  // State - TÜM useState çağrıları koşulsuz
  const [showComments, setShowComments] = useState(false);
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  // ... diğer state'ler
  
  // Queries - Stable enabled flag ile koşulsuz çağrılıyor
  const { data: question, isLoading: questionLoading, refetch: refetchQuestion } = useQuestion(questionId, {
    enabled: hasValidId, // ✅ Stable boolean
  });
  const { data: answers = [], isLoading: answersLoading, refetch: refetchAnswers } = useAnswers(questionId, 'best', {
    enabled: hasValidId, // ✅ Stable boolean
  });
  const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } = useQuestionComments(questionId, {
    enabled: hasValidId, // ✅ Stable boolean
  });
  
  // ... mutations ve diğer hook'lar
  
  // Render
  if (questionLoading) {
    return <LoadingView />;
  }
  
  if (!question) {
    return <ErrorView />;
  }
  
  return <MainContent />;
}
```

**Değişiklikler:**
1. `questionId` her zaman geçerli bir string (`'INVALID_ID'` veya gerçek ID)
2. `hasValidId` stable bir boolean değişken
3. `enabled` parametresi artık stable (her render'da aynı değer)
4. Hook'lar her zaman aynı sayıda ve aynı sırada çağrılıyor

## React Hook Kuralları (Özet)

### ✅ YAPILMASI GEREKENLER
1. Hook'ları her zaman component'in en üst seviyesinde çağırın
2. Hook'ları her zaman aynı sırada çağırın
3. Tüm hook'ları koşullu render'lardan ÖNCE çağırın
4. Hook'ların `enabled` parametresi stable olmalı (her render'da aynı değer)

### ❌ YAPILMAMASI GEREKENLER
1. Hook'ları koşullu ifadelerin içinde çağırmayın
2. Hook'ları loop'ların içinde çağırmayın
3. Hook'lardan önce erken return yapmayın
4. Hook'ların `enabled` parametresini dinamik değerlerle değiştirmeyin

### 4. `discover/article/[id].tsx` Düzeltmesi
```typescript
// ✅ DOĞRU
export default function ArticleDetailScreen() {
    const theme = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = useLocalSearchParams<{ id: string }>();
    
    // CRITICAL FIX: Stabilize articleId
    const articleId = typeof id === 'string' && id.length > 0 ? id : 'INVALID_ID';
    const hasValidId = typeof id === 'string' && id.length > 0;
    
    const [readStartTime] = useState(Date.now());
    const [imageLoaded, setImageLoaded] = useState(false);
    
    const styles = createStyles(theme);
    
    const { data: article, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['article', articleId],
        queryFn: () => discoverService.getArticle(articleId, 'tr'),
        enabled: hasValidId, // ✅ Stable boolean
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
    
    // ... rest of the component
}
```

### 5. `community/search.tsx` Düzeltmesi
```typescript
// ✅ DOĞRU
export default function SearchScreen() {
    const params = useLocalSearchParams<{ q?: string; category?: string }>();
    const [searchQuery, setSearchQuery] = useState(params.q || '');
    const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | undefined>(
        params.category as QuestionCategory | undefined
    );
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'unanswered'>('recent');
    
    const { debouncedValue: debouncedSearch, isDebouncing } = useAdvancedDebounce(searchQuery, 500);
    
    // CRITICAL FIX: Stabilize enabled flag
    const hasSearchCriteria = useMemo(() => {
        return (debouncedSearch && debouncedSearch.length > 0) || !!selectedCategory;
    }, [debouncedSearch, selectedCategory]);
    
    const filters: QuestionFilters = useMemo(() => {
        const f: QuestionFilters = {
            sort: selectedSort,
            limit: 20,
        };
        if (debouncedSearch) f.search = debouncedSearch;
        if (selectedCategory) f.category = selectedCategory;
        return f;
    }, [debouncedSearch, selectedCategory, selectedSort]);
    
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuestions(filters, {
        enabled: hasSearchCriteria, // ✅ Stable boolean from useMemo
    });
    
    // ... rest of the component
}
```

## Test Sonuçları
- ✅ `apps/mobile/app/_layout.tsx` - Hata yok
- ✅ `apps/mobile/app/(tabs)/home.tsx` - Hata yok
- ✅ `apps/mobile/app/(tabs)/community/[id].tsx` - Hata yok
- ✅ `apps/mobile/app/discover/article/[id].tsx` - Hata yok
- ✅ `apps/mobile/app/(tabs)/community/search.tsx` - Hata yok

## Düzeltilen Dosyalar
1. `apps/mobile/app/_layout.tsx` - Erken return yerine koşullu JSX
2. `apps/mobile/app/(tabs)/home.tsx` - Erken return'ler tüm hook'lardan sonra
3. `apps/mobile/app/(tabs)/community/[id].tsx` - Stable questionId ve enabled flag
4. `apps/mobile/app/discover/article/[id].tsx` - Stable articleId ve enabled flag
5. `apps/mobile/app/(tabs)/community/search.tsx` - Stable enabled flag with useMemo

## Sonuç
"Rendered fewer hooks than expected" hatası **tamamen düzeltildi**. Artık uygulama her render'da aynı sayıda hook çağırıyor ve React'in hook kurallarına uyuyor.

### Kritik Noktalar
1. **Erken return'ler tüm hook'lardan SONRA** yapılmalı
2. **Koşullu render yerine koşullu JSX** kullanılmalı (hook'lardan sonra)
3. **Hook'ların `enabled` parametresi stable** olmalı
4. **Geçersiz ID'ler için placeholder değer** kullanılmalı (boş string yerine)

Bu düzeltmeler sayesinde uygulama artık stabil çalışacak ve hook hataları almayacaksınız! 🎉
