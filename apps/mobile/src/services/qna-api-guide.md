# QnA API Client & Hooks Kullanım Kılavuzu

Bu doküman, QnA Community özelliği için oluşturulan API client, types ve React Query hooks'larının kullanımını açıklar.

## İçindekiler

1. [Types](#types)
2. [API Client](#api-client)
3. [React Query Hooks](#react-query-hooks)
4. [Zustand Store](#zustand-store)
5. [Kullanım Örnekleri](#kullanım-örnekleri)

---

## Types

Tüm QnA ile ilgili TypeScript type'ları `@/types/qna.ts` dosyasında tanımlanmıştır.

### Ana Type'lar

```typescript
import type {
  Question,
  Answer,
  QuestionComment,
  AnswerComment,
  Vote,
  UserReputation,
  Badge,
  QuestionCategory,
  QuestionStatus,
  VoteType,
} from '@/types/qna';
```

### DTO'lar (Data Transfer Objects)

```typescript
import type {
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateAnswerDto,
  UpdateAnswerDto,
  CreateCommentDto,
  VoteDto,
  ReportContentDto,
} from '@/types/qna';
```

### Filtreler ve Pagination

```typescript
import type {
  QuestionFilters,
  PaginatedQuestions,
  PaginatedAnswers,
} from '@/types/qna';
```

---

## API Client

API client fonksiyonları `@/services/api.ts` dosyasında `qnaService` objesi altında export edilmiştir.

### Kullanım

```typescript
import { qnaService } from '@/services/api';

// Örnek: Soru oluşturma
const question = await qnaService.createQuestion({
  title: 'Hamilelikte kahve içilebilir mi?',
  content: 'Günde kaç fincan kahve içmek güvenlidir?',
  category: 'PREGNANCY',
  tags: ['kahve', 'beslenme'],
  isAnonymous: false,
});
```

### Tüm Endpoint'ler

#### Questions
- `getQuestions(filters)` - Soruları listele
- `getQuestion(id)` - Tek soru detayı
- `createQuestion(data)` - Yeni soru oluştur
- `updateQuestion(id, data)` - Soruyu güncelle
- `deleteQuestion(id)` - Soruyu sil
- `getMyQuestions(page, limit)` - Kullanıcının soruları
- `getFavoriteQuestions(page, limit)` - Favori sorular
- `getFollowingQuestions(page, limit)` - Takip edilen sorular

#### Answers
- `getAnswers(questionId, sort)` - Sorunun cevapları
- `createAnswer(questionId, data)` - Cevap oluştur
- `updateAnswer(id, data)` - Cevabı güncelle
- `deleteAnswer(id)` - Cevabı sil
- `markBestAnswer(answerId)` - En iyi cevap olarak işaretle
- `getMyAnswers(page, limit)` - Kullanıcının cevapları

#### Votes
- `voteAnswer(answerId, data)` - Cevaba oy ver
- `removeVote(answerId)` - Oyunu geri çek
- `getUserVote(answerId)` - Kullanıcının oyunu getir

#### Comments
- `createQuestionComment(questionId, data)` - Soruya yorum yap
- `getQuestionComments(questionId)` - Sorunun yorumları
- `createAnswerComment(answerId, data)` - Cevaba yorum yap
- `getAnswerComments(answerId)` - Cevabın yorumları
- `deleteComment(id)` - Yorumu sil

#### Interactions
- `favoriteQuestion(questionId)` - Favorilere ekle
- `unfavoriteQuestion(questionId)` - Favorilerden çıkar
- `followQuestion(questionId)` - Soruyu takip et
- `unfollowQuestion(questionId)` - Takibi bırak
- `followUser(userId)` - Kullanıcıyı takip et
- `unfollowUser(userId)` - Kullanıcı takibini bırak

#### Reputation
- `getMyReputation()` - Kendi itibar bilgim
- `getUserReputation(userId)` - Kullanıcının itibar bilgisi
- `getLeaderboard(page, limit)` - İtibar sıralaması
- `getAllBadges()` - Tüm rozetler
- `getMyBadges()` - Kazanılan rozetler

#### Moderation
- `reportContent(data)` - İçerik raporla

#### Sharing
- `getShareLink(questionId)` - Paylaşım linki
- `getShareMetadata(questionId)` - Sosyal medya meta verileri

#### Quota
- `getQuota()` - Soru kotası bilgisi

---

## React Query Hooks

React Query hooks'ları `@/hooks/useQna.ts` dosyasında tanımlanmıştır.

### Query Hooks (Veri Çekme)

#### Questions

```typescript
import {
  useQuestions,
  useInfiniteQuestions,
  useQuestion,
  useMyQuestions,
  useFavoriteQuestions,
  useFollowingQuestions,
} from '@/hooks/useQna';

// Örnek: Soruları listele
const { data, isLoading, error } = useQuestions({
  category: 'PREGNANCY',
  sort: 'recent',
  limit: 20,
});

// Örnek: Infinite scroll ile sorular
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuestions({
  category: 'MENSTRUAL_HEALTH',
  sort: 'popular',
});

// Örnek: Tek soru detayı
const { data: question } = useQuestion('question-id');
```

#### Answers

```typescript
import {
  useAnswers,
  useMyAnswers,
} from '@/hooks/useQna';

// Örnek: Sorunun cevapları
const { data: answers } = useAnswers('question-id', 'best');
```

#### Comments

```typescript
import {
  useQuestionComments,
  useAnswerComments,
} from '@/hooks/useQna';

// Örnek: Sorunun yorumları
const { data: comments } = useQuestionComments('question-id');
```

#### Reputation

```typescript
import {
  useReputation,
  useLeaderboard,
  useBadges,
  useMyBadges,
} from '@/hooks/useQna';

// Örnek: Kullanıcı itibarı
const { data: reputation } = useReputation();

// Örnek: Liderlik tablosu
const { data: leaderboard } = useLeaderboard(1, 50);
```

#### Quota

```typescript
import { useQnaQuota } from '@/hooks/useQna';

// Örnek: Soru kotası
const { data: quota } = useQnaQuota();
```

### Mutation Hooks (Veri Değiştirme)

#### Questions

```typescript
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from '@/hooks/useQna';

// Örnek: Soru oluşturma
const createQuestion = useCreateQuestion();

const handleSubmit = async () => {
  try {
    await createQuestion.mutateAsync({
      title: 'Soru başlığı',
      content: 'Soru içeriği',
      category: 'PREGNANCY',
      tags: ['tag1', 'tag2'],
      isAnonymous: false,
    });
    // Başarılı
  } catch (error) {
    // Hata
  }
};
```

#### Answers

```typescript
import {
  useCreateAnswer,
  useUpdateAnswer,
  useDeleteAnswer,
  useMarkBestAnswer,
} from '@/hooks/useQna';

// Örnek: Cevap oluşturma
const createAnswer = useCreateAnswer();

const handleAnswer = async () => {
  await createAnswer.mutateAsync({
    questionId: 'question-id',
    data: { content: 'Cevap içeriği' },
  });
};

// Örnek: En iyi cevap işaretleme
const markBest = useMarkBestAnswer();
await markBest.mutateAsync('answer-id');
```

#### Votes

```typescript
import {
  useVoteAnswer,
  useRemoveVote,
} from '@/hooks/useQna';

// Örnek: Oy verme
const voteAnswer = useVoteAnswer();

const handleUpvote = async () => {
  await voteAnswer.mutateAsync({
    answerId: 'answer-id',
    data: { voteType: 'UPVOTE' },
  });
};
```

#### Comments

```typescript
import {
  useCreateQuestionComment,
  useCreateAnswerComment,
  useDeleteComment,
} from '@/hooks/useQna';

// Örnek: Yorum oluşturma
const createComment = useCreateQuestionComment();

await createComment.mutateAsync({
  questionId: 'question-id',
  data: { content: 'Yorum içeriği' },
});
```

#### Interactions

```typescript
import {
  useFavoriteQuestion,
  useUnfavoriteQuestion,
  useFollowQuestion,
  useUnfollowQuestion,
  useFollowUser,
  useUnfollowUser,
} from '@/hooks/useQna';

// Örnek: Favorileme
const favorite = useFavoriteQuestion();
await favorite.mutateAsync('question-id');

// Örnek: Takip etme
const follow = useFollowQuestion();
await follow.mutateAsync('question-id');
```

#### Moderation

```typescript
import { useReportContent } from '@/hooks/useQna';

// Örnek: İçerik raporlama
const report = useReportContent();

await report.mutateAsync({
  contentId: 'question-id',
  contentType: 'QUESTION',
  reason: 'Spam',
  description: 'Detaylı açıklama',
});
```

---

## Zustand Store

QnA state yönetimi için Zustand store kullanılır: `@/store/qnaStore.ts`

### Kullanım

```typescript
import { useQnaStore } from '@/store/qnaStore';

function MyComponent() {
  const {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    draftQuestion,
    setDraftQuestion,
    clearDraftQuestion,
  } = useQnaStore();

  // Filtre değiştirme
  const handleCategoryChange = (category: QuestionCategory) => {
    setSelectedCategory(category);
    setFilters({ category });
  };

  // Taslak kaydetme
  const saveDraft = () => {
    setDraftQuestion({
      title: 'Taslak başlık',
      content: 'Taslak içerik',
      category: 'PREGNANCY',
    });
  };

  return (
    // JSX
  );
}
```

### Store Özellikleri

- `filters` - Aktif filtreler
- `setFilters(filters)` - Filtreleri güncelle
- `resetFilters()` - Filtreleri sıfırla
- `searchQuery` - Arama sorgusu
- `setSearchQuery(query)` - Arama sorgusunu güncelle
- `selectedCategory` - Seçili kategori
- `setSelectedCategory(category)` - Kategori seç
- `sortBy` - Sıralama tercihi
- `setSortBy(sort)` - Sıralama değiştir
- `draftQuestion` - Taslak soru
- `setDraftQuestion(draft)` - Taslak kaydet
- `clearDraftQuestion()` - Taslağı temizle
- `showAnonymousMode` - Anonim mod göster
- `setShowAnonymousMode(show)` - Anonim mod değiştir
- `recentlyViewed` - Son görüntülenen sorular
- `addRecentlyViewed(id)` - Son görüntülenenlere ekle
- `clearRecentlyViewed()` - Son görüntülenenleri temizle

---

## Kullanım Örnekleri

### Örnek 1: Soru Listesi Ekranı

```typescript
import { useInfiniteQuestions } from '@/hooks/useQna';
import { useQnaStore } from '@/store/qnaStore';

function QuestionListScreen() {
  const { selectedCategory, sortBy } = useQnaStore();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuestions({
    category: selectedCategory,
    sort: sortBy,
    limit: 20,
  });

  const questions = data?.pages.flatMap(page => page.questions) ?? [];

  return (
    <FlatList
      data={questions}
      renderItem={({ item }) => <QuestionCard question={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
    />
  );
}
```

### Örnek 2: Soru Detay Ekranı

```typescript
import { useQuestion, useAnswers, useFavoriteQuestion } from '@/hooks/useQna';

function QuestionDetailScreen({ questionId }: { questionId: string }) {
  const { data: question, isLoading } = useQuestion(questionId);
  const { data: answers } = useAnswers(questionId, 'best');
  const favorite = useFavoriteQuestion();

  const handleFavorite = async () => {
    await favorite.mutateAsync(questionId);
  };

  if (isLoading) return <Spinner />;

  return (
    <ScrollView>
      <QuestionDetail question={question} />
      <Button onPress={handleFavorite}>
        {question?.isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
      </Button>
      <AnswerList answers={answers} />
    </ScrollView>
  );
}
```

### Örnek 3: Soru Oluşturma Ekranı

```typescript
import { useCreateQuestion } from '@/hooks/useQna';
import { useQnaQuota } from '@/hooks/useQna';
import { useQnaStore } from '@/store/qnaStore';

function AskQuestionScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<QuestionCategory>('GENERAL');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: quota } = useQnaQuota();
  const createQuestion = useCreateQuestion();
  const { draftQuestion, setDraftQuestion, clearDraftQuestion } = useQnaStore();

  // Taslak yükle
  useEffect(() => {
    if (draftQuestion) {
      setTitle(draftQuestion.title);
      setContent(draftQuestion.content);
      setCategory(draftQuestion.category || 'GENERAL');
      setIsAnonymous(draftQuestion.isAnonymous || false);
    }
  }, [draftQuestion]);

  // Otomatik taslak kaydetme
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title || content) {
        setDraftQuestion({ title, content, category, isAnonymous });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, category, isAnonymous]);

  const handleSubmit = async () => {
    // Quota kontrolü
    if (quota && quota.questionsAsked >= quota.freeUserLimit) {
      Alert.alert('Limit Doldu', 'Aylık soru limitinize ulaştınız.');
      return;
    }

    try {
      await createQuestion.mutateAsync({
        title,
        content,
        category,
        isAnonymous,
      });
      clearDraftQuestion();
      // Navigate back
    } catch (error) {
      Alert.alert('Hata', error.message);
    }
  };

  return (
    <View>
      <TextInput value={title} onChangeText={setTitle} placeholder="Başlık" />
      <TextInput value={content} onChangeText={setContent} placeholder="İçerik" />
      <CategoryPicker value={category} onChange={setCategory} />
      <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
      <Button onPress={handleSubmit} loading={createQuestion.isPending}>
        Soru Sor
      </Button>
      {quota && (
        <Text>
          Kalan soru hakkı: {quota.freeUserLimit - quota.questionsAsked}
        </Text>
      )}
    </View>
  );
}
```

### Örnek 4: Oy Verme

```typescript
import { useVoteAnswer, useUserVote } from '@/hooks/useQna';

function VoteButtons({ answerId }: { answerId: string }) {
  const { data: userVote } = useUserVote(answerId);
  const vote = useVoteAnswer();

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      await vote.mutateAsync({
        answerId,
        data: { voteType },
      });
    } catch (error) {
      Alert.alert('Hata', error.message);
    }
  };

  return (
    <View>
      <Button
        onPress={() => handleVote('UPVOTE')}
        variant={userVote?.voteType === 'UPVOTE' ? 'solid' : 'outline'}
      >
        ↑
      </Button>
      <Button
        onPress={() => handleVote('DOWNVOTE')}
        variant={userVote?.voteType === 'DOWNVOTE' ? 'solid' : 'outline'}
      >
        ↓
      </Button>
    </View>
  );
}
```

### Örnek 5: İtibar ve Rozetler

```typescript
import { useReputation, useMyBadges } from '@/hooks/useQna';

function ProfileScreen() {
  const { data: reputation } = useReputation();
  const { data: badges } = useMyBadges();

  return (
    <View>
      <Text>İtibar Puanı: {reputation?.reputation.totalPoints}</Text>
      <Text>Sorular: {reputation?.reputation.questionsAsked}</Text>
      <Text>Cevaplar: {reputation?.reputation.answersGiven}</Text>
      <Text>En İyi Cevaplar: {reputation?.reputation.bestAnswers}</Text>
      
      <Text>Rozetler:</Text>
      {badges?.map(badge => (
        <BadgeCard key={badge.id} badge={badge.badge} />
      ))}
    </View>
  );
}
```

---

## Optimistic Updates

Bazı mutation'lar optimistic update kullanır (kullanıcı deneyimini iyileştirmek için):

- `useFavoriteQuestion` / `useUnfavoriteQuestion`
- `useFollowQuestion` / `useUnfollowQuestion`
- `useVoteAnswer`

Bu hook'lar, API yanıtını beklemeden UI'ı günceller ve hata durumunda geri alır.

---

## Cache Yönetimi

React Query otomatik cache yönetimi yapar:

- **Questions**: 2 dakika stale time
- **Question Detail**: 5 dakika stale time
- **Answers**: 2 dakika stale time
- **Reputation**: 5 dakika stale time
- **Leaderboard**: 10 dakika stale time
- **Badges**: 30 dakika stale time

Cache manuel olarak invalidate edilebilir:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { qnaKeys } from '@/hooks/useQna';

const queryClient = useQueryClient();

// Tüm soruları yeniden yükle
queryClient.invalidateQueries({ queryKey: qnaKeys.questions() });

// Belirli bir soruyu yeniden yükle
queryClient.invalidateQueries({ queryKey: qnaKeys.question('question-id') });
```

---

## Error Handling

Tüm hook'lar error state döner:

```typescript
const { data, error, isError } = useQuestions();

if (isError) {
  return <ErrorMessage error={error} />;
}
```

Mutation'larda try-catch kullanın:

```typescript
const createQuestion = useCreateQuestion();

try {
  await createQuestion.mutateAsync(data);
} catch (error) {
  Alert.alert('Hata', error.message);
}
```

---

## Best Practices

1. **Infinite Scroll**: Uzun listeler için `useInfiniteQuestions` kullanın
2. **Optimistic Updates**: Hızlı UI feedback için optimistic update'leri kullanın
3. **Cache**: Gereksiz API çağrılarını önlemek için cache'i kullanın
4. **Error Handling**: Her zaman error state'i kontrol edin
5. **Loading States**: Loading indicator'ları gösterin
6. **Quota Check**: Soru oluşturmadan önce quota'yı kontrol edin
7. **Draft Saving**: Kullanıcı deneyimi için taslak kaydetme kullanın
8. **Offline Support**: Recently viewed sorular için local state kullanın

---

## Sonraki Adımlar

1. UI Components oluşturma (QuestionCard, AnswerCard, vb.)
2. Screen'leri implement etme
3. Navigation yapısını kurma
4. Localization (i18n) ekleme
5. Testing

