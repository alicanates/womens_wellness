# Hook Hatası Debug Rehberi

## Hata: "Rendered fewer hooks than expected"

Bu hata, React hook'larının her render'da aynı sırada çağrılmaması durumunda oluşur.

## Yapılan Düzeltmeler

### 1. `[id].tsx` Dosyası

```typescript
// ✅ DOĞRU - Tüm hook'lar unconditional
export default function QuestionDetailScreen() {
    // 1. Context hooks
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { isConnected } = useNetworkStatus();
    
    // 2. Stabilize ID
    const questionId = typeof id === 'string' && id.length > 0 ? id : '';
    
    // 3. ALL useState - unconditional
    const [showComments, setShowComments] = useState(false);
    const [showAnswerInput, setShowAnswerInput] = useState(false);
    // ... diğer state'ler
    
    // 4. ALL useQuery - unconditional (enabled flag ile kontrol)
    const { data: question } = useQuestion(questionId || 'placeholder', {
        enabled: !!questionId,
    });
    const { data: answers } = useAnswers(questionId || 'placeholder', 'best', {
        enabled: !!questionId,
    });
    const { data: comments } = useQuestionComments(questionId || 'placeholder', {
        enabled: !!questionId,
    });
    
    // 5. ALL useMutation - unconditional
    const createAnswer = useCreateAnswer();
    const createQuestionComment = useCreateQuestionComment();
    // ... diğer mutations
    
    // 6. Derived state - AFTER all hooks
    const isQuestionAuthor = user?.id === question?.userId;
    const answerCount = answers.length;
    const styles = createStyles(theme);
    
    // 7. useEffect - unconditional
    useEffect(() => {
        if (questionId) {
            // ...
        }
    }, [questionId]);
    
    // 8. useCallback - unconditional
    const handleRefresh = useCallback(async () => {
        // ...
    }, [refetchQuestion, refetchAnswers, refetchComments]);
    
    // 9. ONLY NOW can we do conditional rendering
    if (questionLoading) {
        return <LoadingScreen />;
    }
    
    if (!question) {
        return <ErrorScreen />;
    }
    
    return <MainContent />;
}
```

## Kritik Kurallar

### ✅ YAPILMASI GEREKENLER:

1. **Tüm hook'ları en üstte çağır** - Hiçbir condition, loop veya early return'den önce
2. **Hook'ları her zaman aynı sırada çağır** - Sıra asla değişmemeli
3. **`enabled` flag kullan** - Query hook'larını devre dışı bırakmak için
4. **Stable parametreler kullan** - `questionId || 'placeholder'` gibi
5. **Derived state'leri hook'lardan sonra hesapla** - `const x = y?.z` gibi
6. **`createStyles` gibi fonksiyonları hook'lardan sonra çağır**

### ❌ YAPILMAMASI GEREKENLER:

1. **Conditional hook çağrısı** - `if (x) { useState() }` ASLA!
2. **Loop içinde hook** - `for() { useEffect() }` ASLA!
3. **Early return'den önce bazı hook'ları çağırmamak**
4. **Hook parametrelerini unstable tutmak** - `id || ''` yerine `id || 'placeholder'`

## Hata Devam Ediyorsa

### Adım 1: Hangi Component'te Hata Oluyor?

Stack trace'e bak:
- `<Unknown />` → Genellikle Suspense veya Error Boundary
- `<Route />` → Navigation sırasında
- Component adı → O component'te sorun var

### Adım 2: Component'i İncele

```bash
# Component'teki tüm hook'ları listele
grep -n "use[A-Z]" apps/mobile/app/(tabs)/community/[id].tsx
```

### Adım 3: Hook Sırasını Kontrol Et

Her hook çağrısının:
1. Unconditional olduğundan emin ol
2. Her render'da aynı sırada çağrıldığından emin ol
3. Early return'lerden önce olduğundan emin ol

### Adım 4: Nested Component'leri Kontrol Et

Eğer ana component temizse, child component'lerde sorun olabilir:
- `<AnswerCard />` 
- `<CommentList />`
- `<RelatedQuestions />`
- `<PopularQuestionsWidget />`

## Test Etme

1. Uygulamayı yeniden başlat
2. Community tab'ına git
3. Bir soruya tıkla
4. Hata alırsan, stack trace'i kontrol et
5. Hangi component'te olduğunu bul
6. O component'i yukarıdaki kurallara göre düzelt

## Son Çare

Eğer hala hata alıyorsan, tüm component'i yeniden yaz:
1. Tüm hook'ları en üste al
2. Hiçbir conditional hook kullanma
3. `enabled` flag ile kontrol et
4. Early return'leri en sona al
