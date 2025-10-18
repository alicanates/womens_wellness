# QnA Zustand Stores

Bu klasör, Q&A Community özelliği için kullanılan Zustand store'larını içerir.

## Store'lar

### 1. QnA Store (`qnaStore.ts`)
Ana Q&A store'u - filtreleme, sıralama, cache ve UI state yönetimi.

**Özellikler:**
- Filtreleme (kategori, tag, status, arama)
- Sıralama tercihleri (recent, popular, unanswered)
- Taslak soru kaydetme (offline support)
- Son görüntülenen sorular
- Soru cache (offline support)
- Anonim mod UI state

**Kullanım:**
```typescript
import { useQnaStore } from '@/store/qnaStore';

function QuestionList() {
  const { filters, setFilters, sortBy, setSortBy } = useQnaStore();
  
  // Kategori filtresi uygula
  setFilters({ category: 'PREGNANCY' });
  
  // Sıralama değiştir
  setSortBy('popular');
  
  // Aktif filtre sayısı
  const activeFilters = useQnaStore((state) => state.getActiveFiltersCount());
}
```

**Persist:**
- `sortBy`: Kullanıcının sıralama tercihi
- `draftQuestion`: Taslak soru (uygulama kapansa bile kaybolmaz)
- `recentlyViewed`: Son görüntülenen sorular
- `cachedQuestions`: Offline erişim için cache

---

### 2. QnA Interactions Store (`qnaInteractionsStore.ts`)
Kullanıcı etkileşimlerini yöneten store - favoriler, takipler, oylar.

**Özellikler:**
- Favori sorular (local cache)
- Takip edilen sorular (local cache)
- Takip edilen kullanıcılar (local cache)
- Kullanıcı oyları (optimistic updates için)
- Raporlanan içerikler (duplicate report önleme)
- Kullanıcının kendi soru/cevap ID'leri (quick access)

**Kullanım:**
```typescript
import { useQnaInteractionsStore } from '@/store/qnaInteractionsStore';

function QuestionCard({ question }) {
  const { 
    isFavorited, 
    addFavorite, 
    removeFavorite,
    isFollowingQuestion,
    addFollowedQuestion 
  } = useQnaInteractionsStore();
  
  const favorited = isFavorited(question.id);
  const following = isFollowingQuestion(question.id);
  
  const handleFavorite = () => {
    if (favorited) {
      removeFavorite(question.id);
    } else {
      addFavorite(question.id);
    }
  };
}
```

**Optimistic Updates:**
Store, API çağrıları tamamlanmadan önce UI'ı güncellemek için kullanılır:

```typescript
// Vote örneği
const { setVote, getUserVote } = useQnaInteractionsStore();

const handleVote = async (answerId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
  // Optimistic update
  setVote(answerId, voteType);
  
  try {
    await voteAnswer(answerId, voteType);
  } catch (error) {
    // Rollback on error
    removeVote(answerId);
  }
};
```

**Persist:**
Tüm state persist edilir (AsyncStorage). Logout'ta `clearAll()` çağrılmalı.

---

### 3. QnA Notification Store (`qnaNotificationStore.ts`)
Bildirim tercihlerini ve durumunu yöneten store.

**Özellikler:**
- Bildirim tipi tercihleri (yeni cevap, oy, yorum, vb.)
- Global bildirim toggle
- Push/In-app bildirim tercihleri
- Sessiz saatler (quiet hours)
- Okunmamış bildirim sayısı
- Son kontrol zamanı

**Kullanım:**
```typescript
import { useQnaNotificationStore, QnaNotificationType } from '@/store/qnaNotificationStore';

function NotificationSettings() {
  const { 
    preferences, 
    setNewAnswersEnabled,
    setQuietHoursEnabled,
    setQuietHours 
  } = useQnaNotificationStore();
  
  return (
    <View>
      <Switch 
        value={preferences.newAnswers}
        onValueChange={setNewAnswersEnabled}
      />
      
      <Switch 
        value={preferences.quietHoursEnabled}
        onValueChange={setQuietHoursEnabled}
      />
    </View>
  );
}
```

**Bildirim Kontrolü:**
```typescript
const { shouldShowNotification } = useQnaNotificationStore();

// Bildirim gösterilmeli mi?
if (shouldShowNotification(QnaNotificationType.NEW_ANSWER)) {
  showNotification({
    title: 'Yeni Cevap',
    body: 'Sorunuza yeni bir cevap geldi',
  });
}
```

**Sessiz Saatler:**
```typescript
const { isInQuietHours } = useQnaNotificationStore();

// Şu an sessiz saatlerde mi?
if (isInQuietHours()) {
  // Bildirim gösterme
  return;
}
```

**Persist:**
Tüm state persist edilir (AsyncStorage).

---

## Store Entegrasyonu

### Logout'ta Temizleme
Kullanıcı logout olduğunda interaction store'u temizlenmelidir:

```typescript
import { useQnaInteractionsStore } from '@/store/qnaInteractionsStore';
import { useAuthStore } from '@/store/authStore';

const logout = async () => {
  // Clear QnA interactions
  useQnaInteractionsStore.getState().clearAll();
  
  // Clear auth
  await useAuthStore.getState().logout();
};
```

### React Query ile Senkronizasyon
Store'lar React Query ile senkronize edilmelidir:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useQnaInteractionsStore } from '@/store/qnaInteractionsStore';

function useQuestion(id: string) {
  const { cacheQuestion } = useQnaStore();
  const { isFavorited, isFollowingQuestion } = useQnaInteractionsStore();
  
  return useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      const question = await fetchQuestion(id);
      
      // Cache for offline
      cacheQuestion(question);
      
      // Sync interaction state
      if (question.isFavorited) {
        useQnaInteractionsStore.getState().addFavorite(id);
      }
      if (question.isFollowing) {
        useQnaInteractionsStore.getState().addFollowedQuestion(id);
      }
      
      return question;
    },
  });
}
```

---

## Best Practices

### 1. Optimistic Updates
Store'ları optimistic updates için kullanın:

```typescript
const handleFavorite = async (questionId: string) => {
  // 1. Optimistic update
  addFavorite(questionId);
  
  try {
    // 2. API call
    await favoriteQuestion(questionId);
    
    // 3. Invalidate query to refetch
    queryClient.invalidateQueries(['question', questionId]);
  } catch (error) {
    // 4. Rollback on error
    removeFavorite(questionId);
    showError('Favorilere eklenemedi');
  }
};
```

### 2. Selector Pattern
Performans için selector pattern kullanın:

```typescript
// ❌ Kötü - her state değişiminde re-render
const store = useQnaStore();

// ✅ İyi - sadece ihtiyaç duyulan değer değiştiğinde re-render
const sortBy = useQnaStore((state) => state.sortBy);
const filters = useQnaStore((state) => state.filters);
```

### 3. Batch Updates
Birden fazla state güncellemesi için batch kullanın:

```typescript
// ❌ Kötü - 3 ayrı re-render
setFilters({ category: 'PREGNANCY' });
setSortBy('popular');
setSearchQuery('hamilelik');

// ✅ İyi - tek re-render
useQnaStore.setState((state) => ({
  filters: { ...state.filters, category: 'PREGNANCY' },
  sortBy: 'popular',
  searchQuery: 'hamilelik',
}));
```

### 4. Persist Stratejisi
Sadece gerekli state'i persist edin:

```typescript
// qnaStore.ts
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'qna-store',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      // Sadece bunları persist et
      sortBy: state.sortBy,
      draftQuestion: state.draftQuestion,
      // Bunları persist etme (her seferinde API'den çek)
      // filters: state.filters,
      // searchQuery: state.searchQuery,
    }),
  }
)
```

---

## Testing

Store'ları test etmek için:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useQnaStore } from '@/store/qnaStore';

describe('QnaStore', () => {
  it('should set filters', () => {
    const { result } = renderHook(() => useQnaStore());
    
    act(() => {
      result.current.setFilters({ category: 'PREGNANCY' });
    });
    
    expect(result.current.filters.category).toBe('PREGNANCY');
  });
});
```

---

## Migration Guide

Eski state management'tan geçiş:

```typescript
// Eski (useState)
const [filters, setFilters] = useState({});
const [sortBy, setSortBy] = useState('recent');

// Yeni (Zustand)
const { filters, setFilters, sortBy, setSortBy } = useQnaStore();
```

Avantajlar:
- ✅ Global state (component tree'de prop drilling yok)
- ✅ Persist (AsyncStorage ile otomatik)
- ✅ DevTools support
- ✅ TypeScript support
- ✅ Minimal boilerplate
