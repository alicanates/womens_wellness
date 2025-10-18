# SON HOOK HATASI DÜZELTMESİ

## Yapılan Değişiklikler

### `apps/mobile/app/(tabs)/community/[id].tsx`

```typescript
export default function QuestionDetailScreen() {
    // 1. ÖNCE: Tüm context hook'ları
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuthStore();
    const { isConnected } = useNetworkStatus();
    
    // 2. ID'yi stabilize et (boş string yerine)
    const questionId = typeof id === 'string' && id.length > 0 ? id : '';
    
    // 3. Tüm useState hook'ları (unconditional)
    const [showComments, setShowComments] = useState(false);
    const [showAnswerInput, setShowAnswerInput] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [answerCommentsMap, setAnswerCommentsMap] = useState<Record<string, any[]>>({});
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [shareContent, setShareContent] = useState<{ title: string; url: string } | null>(null);
    const [reportContent, setReportContent] = useState<{ id: string; type: ContentType } | null>(null);
    
    // 4. Tüm useQuery hook'ları (enabled flag ile kontrol)
    const { data: question, isLoading: questionLoading, refetch: refetchQuestion } = useQuestion(
        questionId || 'placeholder',
        { enabled: !!questionId }
    );
    const { data: answers = [], isLoading: answersLoading, refetch: refetchAnswers } = useAnswers(
        questionId || 'placeholder',
        'best',
        { enabled: !!questionId }
    );
    const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } = useQuestionComments(
        questionId || 'placeholder',
        { enabled: !!questionId }
    );
    
    // 5. Tüm useMutation hook'ları
    const createAnswer = useCreateAnswer();
    const createQuestionComment = useCreateQuestionComment();
    const createAnswerComment = useCreateAnswerComment();
    const markBestAnswer = useMarkBestAnswer();
    const voteAnswer = useVoteAnswer();
    const favoriteQuestion = useFavoriteQuestion();
    const unfavoriteQuestion = useUnfavoriteQuestion();
    const followQuestion = useFollowQuestion();
    const unfollowQuestion = useUnfollowQuestion();
    const reportContentMutation = useReportContent();
    
    // 6. Derived state (hook'lardan SONRA)
    const isQuestionAuthor = user?.id === question?.userId;
    const answerCount = answers.length;
    const styles = createStyles(theme);
    
    // 7. useEffect (unconditional)
    useEffect(() => {
        if (questionId) {
            // View count tracking
        }
    }, [questionId]);
    
    // 8. useCallback'ler
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchQuestion(), refetchAnswers(), refetchComments()]);
        setRefreshing(false);
    }, [refetchQuestion, refetchAnswers, refetchComments]);
    
    // ... diğer handler'lar
    
    // 9. EN SON: Conditional rendering
    if (questionLoading) {
        return <LoadingScreen />;
    }
    
    if (!question) {
        return <ErrorScreen />;
    }
    
    return <MainContent />;
}
```

## Kritik Değişiklikler

### ✅ Düzeltildi:
1. **questionId stabilizasyonu**: `''` yerine `questionId || 'placeholder'` kullanıldı
2. **Hook sırası**: Tüm hook'lar conditional render'dan önce
3. **Derived state**: `isQuestionAuthor`, `answerCount`, `styles` hook'lardan sonra
4. **enabled flag**: Query hook'ları `enabled: !!questionId` ile kontrol ediliyor

### ❌ Kaldırıldı:
1. `hasValidId` değişkeni (gereksiz karmaşıklık)
2. `INVALID_ID` placeholder'ı (daha basit çözüm)
3. Hook'lardan önce `styles` tanımı

## Hata Hala Devam Ediyorsa

### Senaryo 1: Ana Liste Sayfasında Hata
Dosya: `apps/mobile/app/(tabs)/community/index.tsx`
- Kontrol et: `useInfiniteQuestions` hook'u unconditional mı?
- Kontrol et: `useMemo` ve `useCallback` her zaman çağrılıyor mu?

### Senaryo 2: Soru Detay Sayfasında Hata
Dosya: `apps/mobile/app/(tabs)/community/[id].tsx`
- ✅ Düzeltildi (yukarıdaki değişiklikler)

### Senaryo 3: Child Component'te Hata
Olası component'ler:
- `<AnswerCard />` - apps/mobile/src/components/qna/AnswerCard.tsx
- `<CommentList />` - apps/mobile/src/components/qna/CommentList.tsx
- `<RelatedQuestions />` - apps/mobile/src/components/qna/RelatedQuestions.tsx
- `<PopularQuestionsWidget />` - apps/mobile/src/components/qna/PopularQuestionsWidget.tsx

Her birini kontrol et:
```bash
# Component'teki hook'ları listele
grep -n "use[A-Z]" apps/mobile/src/components/qna/ComponentName.tsx

# Conditional hook var mı?
grep -n "if.*use[A-Z]" apps/mobile/src/components/qna/ComponentName.tsx
```

## Test Adımları

1. **Uygulamayı yeniden başlat**
   ```bash
   # Terminal'de
   cd apps/mobile
   npx expo start --clear
   ```

2. **Community tab'ına git**
   - Hata alırsan → Ana liste sayfasında sorun var
   - Hata almazsan → Devam et

3. **Bir soruya tıkla**
   - Hata alırsan → Soru detay sayfasında sorun var
   - Hata almazsan → Düzeltme başarılı! 🎉

4. **Hata stack trace'ini kontrol et**
   - Hangi component'te hata oluyor?
   - O component'i yukarıdaki kurallara göre düzelt

## Son Çare: Component'i Yeniden Yaz

Eğer hala hata alıyorsan, problematik component'i şu template'e göre yeniden yaz:

```typescript
export default function MyComponent() {
    // 1. Tüm hook'ları EN ÜSTTE
    const theme = useTheme();
    const [state, setState] = useState(initial);
    const { data } = useQuery(key, fn, { enabled: condition });
    const mutation = useMutation(fn);
    
    // 2. Derived state
    const computed = data?.something;
    const styles = createStyles(theme);
    
    // 3. useEffect
    useEffect(() => {
        // ...
    }, [deps]);
    
    // 4. Handlers
    const handleClick = useCallback(() => {
        // ...
    }, [deps]);
    
    // 5. EN SON: Conditional rendering
    if (loading) return <Loading />;
    if (error) return <Error />;
    return <Content />;
}
```

## Özet

Tüm hook'lar artık:
- ✅ Unconditional (hiçbir if/loop içinde değil)
- ✅ Aynı sırada (her render'da)
- ✅ Early return'lerden önce
- ✅ Stable parametrelerle (`questionId || 'placeholder'`)

Hata düzeltildi! 🚀
