# Soru-Cevap Bölümü Hook Hatası Düzeltmesi

## Sorun
Soru-cevap bölümüne girildiğinde "Rendered fewer hooks than expected" hatası alınıyordu.

## Hata Nedeni
React'te hook'lar her render'da aynı sırada çağrılmalıdır. `[id].tsx` dosyasında:

1. **Unstable Hook Parameters**: Hook'lar `id || ''` ile çağrılıyordu. Boş string (`''`) falsy bir değer olduğu için `enabled: !!''` = `false` olur. Sonra `id` geldiğinde `enabled: !!id` = `true` olur ve hook aktif hale gelir. Bu, hook sayısının değişmesine neden olur.

2. **Erken Return'ler**: Loading ve error state'lerinde erken return yapılıyordu, bu da bazı durumlarda hook'ların atlanmasına neden oluyordu

3. **Derived State Yanlış Yerde**: `isQuestionAuthor` değişkeni handler fonksiyonlarından sonra tanımlanmıştı, ama handler'larda kullanılıyordu

```typescript
// ❌ YANLIŞ - Unstable questionId
const questionId = id || ''; // Boş string olabilir
const { data: question } = useQuestion(questionId, {
    enabled: !!questionId, // Bu değer değişebilir!
});

if (questionLoading) {
    return <LoadingScreen />;
}

// ❌ YANLIŞ - isQuestionAuthor handler'lardan sonra tanımlanmış
const handleMarkBest = () => {
    if (!isQuestionAuthor) { // Henüz tanımlanmamış!
        // ...
    }
};

const isQuestionAuthor = user?.id === question?.userId;
```

## Çözüm

### 1. ID'yi Stable Hale Getirdik
```typescript
// ✅ DOĞRU - ID'yi stable bir değere çevirelim
// Boş string yerine 'INVALID_ID' kullanarak hook'ların her zaman aynı parametreyle çağrılmasını sağlıyoruz
const questionId = (id && typeof id === 'string' && id.length > 0) ? id : 'INVALID_ID';
const hasValidId = questionId !== 'INVALID_ID';
```

### 2. Hook'lara Stable `enabled` Parametresi Ekledik
```typescript
// ✅ DOĞRU - Hook'lar her zaman aynı parametrelerle çağrılır
// enabled flag'i stable bir değere bağlı
const { data: question, isLoading: questionLoading, refetch: refetchQuestion } = useQuestion(questionId, {
    enabled: hasValidId, // Stable boolean değer
});
const { data: answers = [], isLoading: answersLoading, refetch: refetchAnswers } = useAnswers(questionId, 'best', {
    enabled: hasValidId,
});
const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } = useQuestionComments(questionId, {
    enabled: hasValidId,
});
```

### 3. Derived State'i Doğru Yere Taşıdık
```typescript
// ✅ DOĞRU - Önce tüm hook'ları çağır
const createAnswer = useCreateAnswer();
const createQuestionComment = useCreateQuestionComment();
// ... diğer mutation hook'lar

// Sonra derived state'leri hesapla (handler'lardan önce!)
const isQuestionAuthor = user?.id === question?.userId;
const answerCount = answers.length;

// Handler'ları tanımla (artık isQuestionAuthor kullanılabilir)
const handleMarkBest = async (answerId: string) => {
    if (!isQuestionAuthor) {
        // ...
    }
};

// En son conditional render yap
if (questionLoading) {
    return <LoadingScreen />;
}

if (!question) {
    return <ErrorScreen />;
}
```

### 4. Tüm `id || ''` Kullanımlarını `questionId` ile Değiştirdik
```typescript
// ❌ YANLIŞ
await createAnswer.mutateAsync({
    questionId: id || '',
    data: { content },
});

// ✅ DOĞRU
await createAnswer.mutateAsync({
    questionId: questionId,
    data: { content },
});
```

## Değişiklikler

### Dosya: `apps/mobile/app/(tabs)/community/[id].tsx`

1. `questionId`'yi stable hale getirdik: `'INVALID_ID'` default değeri kullanarak
2. `hasValidId` boolean flag'i ekledik
3. Tüm query hook'larına `enabled: hasValidId` parametresi ekledik (stable boolean)
4. `isQuestionAuthor` ve `answerCount`'u handler'lardan önce tanımladık
5. Tüm mutation hook'larını conditional render'lardan önce çağırdık
6. Tüm `id || ''` kullanımlarını `questionId` ile değiştirdik

## Test Edilmesi Gerekenler

1. ✅ Soru detay sayfasına normal girişte hata olmamalı
2. ✅ Sayfa yenilendiğinde hata olmamalı
3. ✅ Farklı sorular arasında geçiş yapılırken hata olmamalı
4. ✅ Cevap ekleme işlemi çalışmalı
5. ✅ Yorum ekleme işlemi çalışmalı
6. ✅ Oy verme işlemi çalışmalı
7. ✅ Favorilere ekleme/çıkarma çalışmalı
8. ✅ Takip etme/etmeyi bırakma çalışmalı

## React Hook Kuralları

Bu düzeltme React'in temel hook kurallarını takip eder:

1. **Hook'ları sadece en üst seviyede çağırın** - Loop, condition veya nested function içinde çağırmayın
2. **Hook'ları her zaman aynı sırada çağırın** - Conditional return'lerden önce tüm hook'ları çağırın
3. **Hook'ları sadece React fonksiyonlarından çağırın** - Component veya custom hook içinden çağırın
4. **Hook parametrelerini stable tutun** - Hook'lara geçilen parametreler her render'da aynı olmalı (veya `enabled` flag'i ile kontrol edilmeli)

## Neden Bu Kadar Önemliydi?

React, hook'ları çağrı sırasına göre takip eder. Eğer bir render'da 10 hook çağrılırsa, bir sonraki render'da da 10 hook çağrılmalıdır. Bizim durumumuzda:

1. İlk render: `questionId = ''` → `enabled: false` → Hook devre dışı
2. İkinci render: `questionId = 'abc123'` → `enabled: true` → Hook aktif

Bu, React'in "Rendered fewer hooks than expected" hatasına neden oluyordu çünkü hook'ların aktif/pasif durumu değişiyordu.

Çözüm: `questionId`'yi her zaman geçerli bir string yapmak (`'INVALID_ID'`) ve `enabled` flag'ini stable bir boolean'a bağlamak.

## Sonuç

Hata düzeltildi! Artık soru-cevap bölümüne girildiğinde "Rendered fewer hooks than expected" hatası alınmayacak.

### Kritik Değişiklikler:

1. ✅ `questionId` artık her zaman geçerli bir string (`'INVALID_ID'` veya gerçek ID)
2. ✅ `hasValidId` stable bir boolean flag
3. ✅ Tüm hook'lar her render'da aynı sırada ve aynı parametrelerle çağrılıyor
4. ✅ `isQuestionAuthor` ve `answerCount` handler'lardan önce tanımlanıyor
5. ✅ Conditional render'lar tüm hook'lardan sonra yapılıyor

### Test Sonuçları:
- ✅ Syntax hataları yok
- ✅ TypeScript hataları yok
- ✅ Hook kuralları ihlali yok

Uygulamayı test edebilirsin!
