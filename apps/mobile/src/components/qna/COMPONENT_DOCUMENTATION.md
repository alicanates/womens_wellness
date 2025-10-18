# Q&A Community Component Dokümantasyonu

## Genel Bakış

Bu doküman, Q&A Community özelliği için oluşturulan React Native component'lerini detaylı olarak açıklar.

## İçindekiler

1. [QuestionCard](#questioncard)
2. [AnswerCard](#answercard)
3. [VoteButton](#votebutton)
4. [CommentList](#commentlist)
5. [CommentInput](#commentinput)
6. [AnswerInput](#answerinput)
7. [CategoryPill](#categorypill)
8. [TagChip](#tagchip)
9. [BadgeCard](#badgecard)
10. [ShareSheet](#sharesheet)
11. [ReportModal](#reportmodal)
12. [LoadingSkeleton](#loadingskeleton)
13. [OptimizedQuestionList](#optimizedquestionlist)

---

## QuestionCard

Soru listesinde gösterilen soru kartı component'i.

### Kullanım

```tsx
import { QuestionCard } from '@/components/qna/QuestionCard';

<QuestionCard
  question={question}
  onPress={() => router.push(`/community/${question.id}`)}
  showActions={true}
/>
```

### Props

```typescript
interface QuestionCardProps {
  question: Question;
  onPress: () => void;
  showActions?: boolean;
}

interface Question {
  id: string;
  title: string;
  content: string;
  category: QuestionCategory;
  tags: string[];
  status: QuestionStatus;
  viewCount: number;
  isPremium: boolean;
  answerCount: number;
  hasAcceptedAnswer: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
  isFavorited: boolean;
  isFollowing: boolean;
}
```

### Özellikler

- Soru başlığı ve özet içerik gösterimi
- Kategori ve tag gösterimi
- Kullanıcı bilgisi (anonim mod desteği ile)
- Cevap sayısı ve durum göstergesi
- Premium rozeti
- Favorileme ve takip butonları
- Görüntülenme sayısı
- Zaman gösterimi (relative time)

### Stil Özellikleri

- Responsive tasarım
- Dark mode desteği
- Haptic feedback
- Press animasyonu
- Skeleton loading state

---

## AnswerCard

Cevap gösterimi için kullanılan component.

### Kullanım

```tsx
import { AnswerCard } from '@/components/qna/AnswerCard';

<AnswerCard
  answer={answer}
  isQuestionAuthor={isQuestionAuthor}
  onMarkBest={() => handleMarkBest(answer.id)}
  onVote={(type) => handleVote(answer.id, type)}
/>
```

### Props

```typescript
interface AnswerCardProps {
  answer: Answer;
  isQuestionAuthor: boolean;
  onMarkBest?: () => void;
  onVote: (type: VoteType) => void;
}

interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  isBestAnswer: boolean;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    profilePictureUrl?: string;
    reputation?: {
      totalPoints: number;
    };
  };
  userVote?: VoteType;
  commentCount: number;
  isOwner: boolean;
}
```

### Özellikler

- Cevap içeriği gösterimi
- En iyi cevap rozeti
- Oy verme butonları (upvote/downvote)
- Kullanıcı bilgisi ve itibar puanı
- Yorum sayısı
- "En iyi cevap olarak işaretle" butonu (sadece soru sahibi için)
- Düzenleme ve silme butonları (sadece cevap sahibi için)
- Zaman gösterimi

### Özel Durumlar

- En iyi cevap özel stil ile vurgulanır
- Soru sahibi sadece kendi sorusunda "en iyi cevap" işaretleyebilir
- Kullanıcı kendi cevabına oy veremez

---

## VoteButton

Cevaplara oy vermek için kullanılan component.

### Kullanım

```tsx
import { VoteButton } from '@/components/qna/VoteButton';

<VoteButton
  answerId={answer.id}
  currentVote={answer.userVote}
  voteCount={answer.voteCount}
  onVote={(type) => handleVote(type)}
  disabled={answer.isOwner}
/>
```

### Props

```typescript
interface VoteButtonProps {
  answerId: string;
  currentVote: VoteType | null;
  voteCount: number;
  onVote: (type: VoteType) => void;
  disabled?: boolean;
}

type VoteType = 'UPVOTE' | 'DOWNVOTE';
```

### Özellikler

- Upvote ve downvote butonları
- Oy sayısı gösterimi
- Aktif oy durumu göstergesi
- Optimistic update desteği
- Haptic feedback
- Disabled state (kendi cevabı için)
- Animasyonlu geçişler

### Davranış

- Aynı oya tekrar tıklanırsa oy geri çekilir
- Farklı oya tıklanırsa oy değiştirilir
- Oy sayısı gerçek zamanlı güncellenir

---

## CommentList

Soru veya cevap altındaki yorumları gösteren component.

### Kullanım

```tsx
import { CommentList } from '@/components/qna/CommentList';

<CommentList
  targetId={question.id}
  targetType="question"
  onCommentAdded={() => refetch()}
/>
```

### Props

```typescript
interface CommentListProps {
  targetId: string;
  targetType: 'question' | 'answer';
  onCommentAdded?: () => void;
}
```

### Özellikler

- Yorum listesi gösterimi
- Yeni yorum ekleme
- Yorum silme (sadece yorum sahibi)
- Kullanıcı bilgisi gösterimi
- Zaman gösterimi
- Loading ve empty state'ler
- Pull-to-refresh

---

## CommentInput

Yorum yazmak için kullanılan input component'i.

### Kullanım

```tsx
import { CommentInput } from '@/components/qna/CommentInput';

<CommentInput
  targetId={question.id}
  targetType="question"
  onCommentSubmit={() => handleCommentSubmit()}
  placeholder="Yorumunuzu yazın..."
/>
```

### Props

```typescript
interface CommentInputProps {
  targetId: string;
  targetType: 'question' | 'answer';
  onCommentSubmit?: () => void;
  placeholder?: string;
  maxLength?: number;
}
```

### Özellikler

- Karakter sayacı (max 300)
- Gönder butonu
- Validation
- Loading state
- Otomatik yükseklik ayarlama
- Keyboard handling

---

## AnswerInput

Cevap yazmak için kullanılan input component'i.

### Kullanım

```tsx
import { AnswerInput } from '@/components/qna/AnswerInput';

<AnswerInput
  questionId={question.id}
  onAnswerSubmit={() => handleAnswerSubmit()}
  placeholder="Cevabınızı yazın..."
/>
```

### Props

```typescript
interface AnswerInputProps {
  questionId: string;
  onAnswerSubmit?: () => void;
  placeholder?: string;
  minLength?: number;
}
```

### Özellikler

- Çok satırlı metin girişi
- Karakter sayacı
- Minimum karakter kontrolü
- Gönder butonu
- Loading state
- Validation
- Taslak kaydetme (local storage)

---

## CategoryPill

Kategori gösterimi için kullanılan pill component'i.

### Kullanım

```tsx
import { CategoryPill } from '@/components/qna/CategoryPill';

<CategoryPill
  category="PREGNANCY"
  onPress={() => handleCategoryFilter('PREGNANCY')}
  selected={selectedCategory === 'PREGNANCY'}
/>
```

### Props

```typescript
interface CategoryPillProps {
  category: QuestionCategory;
  onPress?: () => void;
  selected?: boolean;
  size?: 'small' | 'medium' | 'large';
}
```

### Özellikler

- Kategori adı gösterimi (i18n desteği)
- Kategori ikonu
- Seçili/seçili değil durumu
- Farklı boyutlar
- Press animasyonu
- Renk kodlaması

### Kategori Renkleri

```typescript
const categoryColors = {
  PREGNANCY: '#FF6B9D',
  MENSTRUAL_HEALTH: '#FF4757',
  FERTILITY: '#FFA502',
  NUTRITION: '#26DE81',
  EXERCISE: '#4B7BEC',
  MENTAL_HEALTH: '#A55EEA',
  SLEEP: '#778CA3',
  CONTRACEPTION: '#FC5C65',
  PMS: '#FD79A8',
  MENOPAUSE: '#E17055',
  SEXUAL_HEALTH: '#D63031',
  GENERAL: '#636E72'
};
```

---

## TagChip

Tag gösterimi için kullanılan chip component'i.

### Kullanım

```tsx
import { TagChip } from '@/components/qna/TagChip';

<TagChip
  tag="vitamin"
  onPress={() => handleTagFilter('vitamin')}
  selected={selectedTags.includes('vitamin')}
/>
```

### Props

```typescript
interface TagChipProps {
  tag: string;
  onPress?: () => void;
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}
```

### Özellikler

- Tag adı gösterimi
- Seçili/seçili değil durumu
- Kaldırma butonu (opsiyonel)
- Press animasyonu
- Compact tasarım

---

## BadgeCard

Kullanıcı rozetlerini gösteren component.

### Kullanım

```tsx
import { BadgeCard } from '@/components/qna/BadgeCard';

<BadgeCard
  badge={badge}
  earned={true}
  onPress={() => handleBadgePress(badge)}
/>
```

### Props

```typescript
interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  onPress?: () => void;
}

interface Badge {
  id: string;
  key: string;
  nameTr: string;
  nameEn: string;
  description: string;
  iconUrl?: string;
  requirement: {
    type: string;
    count: number;
  };
  earnedAt?: string;
}
```

### Özellikler

- Rozet ikonu
- Rozet adı ve açıklaması
- Kazanılma durumu göstergesi
- Kazanılma tarihi
- Gereksinim bilgisi
- Locked/unlocked state
- Animasyonlu gösterim

---

## ShareSheet

Paylaşım seçeneklerini gösteren bottom sheet component'i.

### Kullanım

```tsx
import { ShareSheet } from '@/components/qna/ShareSheet';

<ShareSheet
  visible={showShareSheet}
  onClose={() => setShowShareSheet(false)}
  question={question}
/>
```

### Props

```typescript
interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  question: Question;
}
```

### Özellikler

- Sosyal medya paylaşım butonları
- Link kopyalama
- Native share API entegrasyonu
- QR kod oluşturma (opsiyonel)
- Paylaşım sayısı tracking

### Paylaşım Seçenekleri

- WhatsApp
- Twitter
- Facebook
- Instagram
- Link kopyala
- Daha fazla... (native share)

---

## ReportModal

İçerik raporlama için kullanılan modal component'i.

### Kullanım

```tsx
import { ReportModal } from '@/components/qna/ReportModal';

<ReportModal
  visible={showReportModal}
  onClose={() => setShowReportModal(false)}
  contentId={question.id}
  contentType="question"
  onReportSubmit={() => handleReportSubmit()}
/>
```

### Props

```typescript
interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'question' | 'answer' | 'comment';
  onReportSubmit?: () => void;
}
```

### Özellikler

- Rapor nedeni seçimi
- Açıklama alanı
- Gönder butonu
- Validation
- Loading state
- Başarı/hata mesajları

### Rapor Nedenleri

- Spam
- Uygunsuz içerik
- Taciz
- Yanlış bilgi
- Diğer

---

## LoadingSkeleton

Loading durumunda gösterilen skeleton component'i.

### Kullanım

```tsx
import { LoadingSkeleton } from '@/components/qna/LoadingSkeleton';

<LoadingSkeleton type="question" count={3} />
```

### Props

```typescript
interface LoadingSkeletonProps {
  type: 'question' | 'answer' | 'comment';
  count?: number;
}
```

### Özellikler

- Farklı content tipleri için skeleton'lar
- Animasyonlu shimmer efekti
- Responsive tasarım
- Dark mode desteği

---

## OptimizedQuestionList

Performans optimize edilmiş soru listesi component'i.

### Kullanım

```tsx
import { OptimizedQuestionList } from '@/components/qna/OptimizedQuestionList';

<OptimizedQuestionList
  questions={questions}
  onQuestionPress={(id) => router.push(`/community/${id}`)}
  onEndReached={() => fetchNextPage()}
  isLoading={isLoading}
  hasMore={hasNextPage}
/>
```

### Props

```typescript
interface OptimizedQuestionListProps {
  questions: Question[];
  onQuestionPress: (id: string) => void;
  onEndReached?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}
```

### Özellikler

- FlashList kullanımı (yüksek performans)
- Infinite scroll
- Pull-to-refresh
- Optimistic updates
- Skeleton loading
- Empty state
- Error handling
- Memoization

### Performans Optimizasyonları

- `React.memo` kullanımı
- `useMemo` ve `useCallback` hooks
- FlashList virtualization
- Image lazy loading
- Debounced scroll events

---

## Ortak Özellikler

Tüm component'lerde bulunan ortak özellikler:

### Accessibility

- Screen reader desteği
- Semantic HTML/Native elements
- ARIA labels
- Keyboard navigation
- Focus management

### Internationalization (i18n)

- Türkçe ve İngilizce dil desteği
- `useTranslation` hook kullanımı
- Dynamic text rendering
- RTL desteği (gelecek)

### Dark Mode

- Otomatik tema algılama
- Manuel tema değiştirme
- Tüm component'lerde dark mode desteği
- Smooth geçişler

### Animations

- Haptic feedback
- Press animations
- Transition animations
- Loading animations
- Skeleton shimmer

### Error Handling

- Try-catch blokları
- Error boundaries
- User-friendly error messages
- Retry mechanisms
- Fallback UI

---

## Stil Sistemi

### Theme

```typescript
const theme = {
  colors: {
    primary: '#FF6B9D',
    secondary: '#4B7BEC',
    success: '#26DE81',
    warning: '#FFA502',
    error: '#FF4757',
    background: '#FFFFFF',
    backgroundDark: '#1A1A1A',
    text: '#2D3436',
    textDark: '#FFFFFF',
    border: '#DFE6E9',
    borderDark: '#2D3436',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
};
```

### Responsive Design

```typescript
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};
```

---

## Best Practices

### Component Kullanımı

1. **Props Validation**: TypeScript interface'lerini kullan
2. **Memoization**: Gereksiz re-render'ları önle
3. **Error Handling**: Her component'te error boundary kullan
4. **Accessibility**: ARIA labels ve semantic elements kullan
5. **Performance**: Lazy loading ve virtualization kullan

### Stil Yazımı

1. **Consistent Naming**: BEM veya camelCase kullan
2. **Theme Usage**: Hardcoded değerler yerine theme kullan
3. **Responsive**: Farklı ekran boyutları için test et
4. **Dark Mode**: Her stil için dark mode variant'ı ekle

### State Management

1. **Local State**: Component-specific state için `useState`
2. **Global State**: Shared state için Zustand store
3. **Server State**: API data için React Query
4. **Form State**: Form handling için controlled components

---

## Test Stratejisi

### Unit Tests

```typescript
describe('QuestionCard', () => {
  it('should render question title', () => {
    // Test implementation
  });

  it('should show premium badge for premium questions', () => {
    // Test implementation
  });

  it('should call onPress when pressed', () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
describe('Q&A Flow', () => {
  it('should create question and receive answer', async () => {
    // Test implementation
  });
});
```

---

## Örnek Kullanım Senaryoları

### 1. Soru Listesi Gösterimi

```tsx
import { OptimizedQuestionList } from '@/components/qna/OptimizedQuestionList';
import { useQuestions } from '@/hooks/useQna';

function QuestionsScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, refetch } = useQuestions({
    category: 'PREGNANCY',
    sort: 'recent',
  });

  return (
    <OptimizedQuestionList
      questions={data?.pages.flatMap(page => page.data) ?? []}
      onQuestionPress={(id) => router.push(`/community/${id}`)}
      onEndReached={fetchNextPage}
      isLoading={isLoading}
      hasMore={hasNextPage}
      onRefresh={refetch}
    />
  );
}
```

### 2. Soru Detay Sayfası

```tsx
import { QuestionCard } from '@/components/qna/QuestionCard';
import { AnswerCard } from '@/components/qna/AnswerCard';
import { AnswerInput } from '@/components/qna/AnswerInput';

function QuestionDetailScreen({ id }: { id: string }) {
  const { data: question } = useQuestion(id);
  const { data: answers } = useAnswers(id);
  const { mutate: markBest } = useMarkBestAnswer();
  const { mutate: vote } = useVoteAnswer();

  return (
    <ScrollView>
      <QuestionCard question={question} onPress={() => {}} showActions />
      
      {answers?.map(answer => (
        <AnswerCard
          key={answer.id}
          answer={answer}
          isQuestionAuthor={question.userId === currentUserId}
          onMarkBest={() => markBest({ questionId: id, answerId: answer.id })}
          onVote={(type) => vote({ answerId: answer.id, voteType: type })}
        />
      ))}
      
      <AnswerInput questionId={id} onAnswerSubmit={() => refetch()} />
    </ScrollView>
  );
}
```

### 3. Kategori Filtreleme

```tsx
import { CategoryPill } from '@/components/qna/CategoryPill';

function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);

  return (
    <ScrollView horizontal>
      {categories.map(category => (
        <CategoryPill
          key={category}
          category={category}
          selected={selectedCategory === category}
          onPress={() => setSelectedCategory(category)}
        />
      ))}
    </ScrollView>
  );
}
```

---

## Troubleshooting

### Yaygın Sorunlar

1. **Component render edilmiyor**
   - Props'ların doğru geçildiğini kontrol et
   - Console'da error olup olmadığını kontrol et
   - React DevTools ile component tree'yi incele

2. **Stil uygulanmıyor**
   - Theme provider'ın doğru kurulduğunu kontrol et
   - Dark mode durumunu kontrol et
   - Platform-specific stil farklılıklarını kontrol et

3. **Performance sorunları**
   - FlashList kullanımını kontrol et
   - Memoization'ı kontrol et
   - Re-render sayısını React DevTools Profiler ile ölç

4. **Animation çalışmıyor**
   - Reanimated kurulumunu kontrol et
   - Native driver kullanımını kontrol et
   - iOS/Android farklılıklarını kontrol et

---

## Kaynaklar

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [FlashList Docs](https://shopify.github.io/flash-list/)

---

## Katkıda Bulunma

Component'lere katkıda bulunmak için:

1. Yeni component oluştururken bu dokümantasyonu takip et
2. TypeScript interface'lerini eksiksiz tanımla
3. Accessibility özelliklerini unutma
4. Dark mode desteği ekle
5. Test yaz
6. Dokümantasyonu güncelle

---

## Versiyon Geçmişi

- **v1.0.0** (2025-10-17): İlk versiyon
  - Tüm temel component'ler eklendi
  - Dark mode desteği
  - i18n desteği
  - Performance optimizasyonları
