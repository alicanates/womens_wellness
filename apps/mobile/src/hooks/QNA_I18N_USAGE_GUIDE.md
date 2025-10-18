# Q&A Community i18n Usage Guide

Bu doküman Q&A Community özelliğinde çok dilli desteğin nasıl kullanılacağını açıklar.

## Kurulum

i18n paketi zaten projeye dahil edilmiştir. Kullanmak için sadece hook'ları import etmeniz yeterli.

## Temel Kullanım

### 1. useTranslation Hook

Genel çeviriler için:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('qna.askQuestion')}</Text>
  );
}
```

### 2. useQnaTranslation Hook

Q&A özel çevirileri için (daha kısa syntax):

```typescript
import { useQnaTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t } = useQnaTranslation();
  
  return (
    <Text>{t('askQuestion')}</Text> // 'qna.' prefix otomatik eklenir
  );
}
```

### 3. Değişkenli Çeviriler

```typescript
const { t } = useQnaTranslation();

// Örnek: "Kalan: 3/5"
const quotaText = t('quota.remaining', { count: 3, limit: 5 });
```

## Kategori ve Durum Çevirileri

### Kategori Çevirisi

```typescript
import { getCategoryTranslation, getCategoryIcon } from '@repo/i18n';
import { QuestionCategory } from '@/types/qna';

function CategoryDisplay({ category }: { category: QuestionCategory }) {
  const label = getCategoryTranslation(category, 'tr');
  const icon = getCategoryIcon(category);
  
  return (
    <View>
      <Text>{icon}</Text>
      <Text>{label}</Text>
    </View>
  );
}
```

### Durum Çevirisi

```typescript
import { getStatusTranslation, getStatusColor } from '@repo/i18n';
import { QuestionStatus } from '@/types/qna';

function StatusBadge({ status }: { status: QuestionStatus }) {
  const label = getStatusTranslation(status, 'tr');
  const color = getStatusColor(status);
  
  return (
    <View style={{ backgroundColor: color }}>
      <Text>{label}</Text>
    </View>
  );
}
```

## Zaman Formatı

```typescript
import { formatRelativeTime } from '@repo/i18n';

function QuestionCard({ question }) {
  const timeAgo = formatRelativeTime(question.createdAt, 'tr');
  
  return <Text>{timeAgo}</Text>; // "5 dk önce"
}
```

## Sayı Formatı

```typescript
import { formatCount } from '@repo/i18n';

function AnswerCount({ count }) {
  const text = formatCount(count, 'cevap', 'cevaplar', 'tr');
  
  return <Text>{text}</Text>; // "3 cevap"
}
```

## Mevcut Çeviri Anahtarları

### Genel

- `qna.community` - "Topluluk"
- `qna.askQuestion` - "Soru Sor"
- `qna.search` - "Soru ara..."
- `qna.filter` - "Filtrele"

### Sıralama

- `qna.sort.recent` - "En Yeni"
- `qna.sort.popular` - "Popüler"
- `qna.sort.unanswered` - "Cevaplanmamış"

### Durum

- `qna.status.all` - "Tümü"
- `qna.status.open` - "Açık"
- `qna.status.answered` - "Cevaplanmış"
- `qna.status.closed` - "Kapalı"

### Soru Detayı

- `qna.questionDetail.title` - "Soru Detayı"
- `qna.questionDetail.views` - "görüntülenme"
- `qna.questionDetail.answers` - "cevap"
- `qna.questionDetail.comments` - "Yorumlar"
- `qna.questionDetail.favorite` - "Favorile"
- `qna.questionDetail.follow` - "Takip Et"
- `qna.questionDetail.share` - "Paylaş"
- `qna.questionDetail.report` - "Raporla"
- `qna.questionDetail.bestAnswer` - "En İyi Cevap"
- `qna.questionDetail.markAsBest` - "En İyi Olarak İşaretle"

### Başarı Mesajları

- `qna.success.questionCreated` - "Sorunuz başarıyla yayınlandı"
- `qna.success.answerSubmitted` - "Cevabınız gönderildi"
- `qna.success.commentAdded` - "Yorumunuz eklendi"
- `qna.success.favorited` - "Favorilere eklendi"
- `qna.success.following` - "Takip ediliyor"

### Hata Mesajları

- `qna.errors.createFailed` - "Soru oluşturulamadı"
- `qna.errors.submitFailed` - "Gönderim başarısız"
- `qna.errors.quotaExceeded` - "Aylık soru limitinize ulaştınız"
- `qna.errors.networkError` - "Bağlantı hatası. Lütfen tekrar deneyin."
- `qna.errors.notFound` - "Bulunamadı"
- `qna.errors.unauthorized` - "Bu işlem için yetkiniz yok"

### Validasyon

- `qna.validation.titleRequired` - "Başlık gerekli"
- `qna.validation.titleMinLength` - "Başlık en az 10 karakter olmalı"
- `qna.validation.contentRequired` - "Açıklama gerekli"
- `qna.validation.categoryRequired` - "Kategori seçmelisiniz"

### Kategoriler

- `qna.categories.MENSTRUAL_HEALTH` - "Regl Sağlığı"
- `qna.categories.PREGNANCY` - "Hamilelik"
- `qna.categories.FERTILITY` - "Doğurganlık"
- `qna.categories.NUTRITION` - "Beslenme"
- `qna.categories.EXERCISE` - "Egzersiz"
- `qna.categories.MENTAL_HEALTH` - "Ruh Sağlığı"
- `qna.categories.SLEEP` - "Uyku"
- `qna.categories.CONTRACEPTION` - "Doğum Kontrolü"
- `qna.categories.PMS` - "PMS"
- `qna.categories.MENOPAUSE` - "Menopoz"
- `qna.categories.SEXUAL_HEALTH` - "Cinsel Sağlık"
- `qna.categories.GENERAL` - "Genel"

## Örnek: Tam Bileşen

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import { useQnaTranslation } from '@/hooks/useTranslation';
import { getCategoryTranslation, formatRelativeTime } from '@repo/i18n';
import { Question } from '@/types/qna';

function QuestionCard({ question }: { question: Question }) {
  const { t } = useQnaTranslation();
  
  return (
    <View>
      <Text>{question.title}</Text>
      <Text>{getCategoryTranslation(question.category)}</Text>
      <Text>{formatRelativeTime(question.createdAt)}</Text>
      
      <View>
        <Text>
          {t('questionDetail.views', { count: question.viewCount })}
        </Text>
        <Text>
          {question._count?.answers || 0} {t('questionDetail.answers')}
        </Text>
      </View>
      
      <TouchableOpacity>
        <Text>{t('questionDetail.favorite')}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Dil Değiştirme (Gelecek)

Şu anda uygulama Türkçe olarak çalışıyor. Gelecekte dil değiştirme özelliği eklendiğinde:

```typescript
// Bir language store oluşturulacak
const { language, setLanguage } = useLanguageStore();

// Hook'lara dil parametresi geçilebilecek
const { t } = useQnaTranslation(language);
```

## Yeni Çeviri Ekleme

1. `packages/i18n/src/locales/tr.json` dosyasına Türkçe çeviriyi ekleyin
2. `packages/i18n/src/locales/en.json` dosyasına İngilizce çeviriyi ekleyin
3. Gerekirse `packages/i18n/src/qna.ts` dosyasına helper fonksiyon ekleyin

## Test

Çevirileri test etmek için:

```typescript
import { translations } from '@repo/i18n';

// Türkçe çeviriyi kontrol et
console.log(translations.tr.qna.askQuestion); // "Soru Sor"

// İngilizce çeviriyi kontrol et
console.log(translations.en.qna.askQuestion); // "Ask Question"
```
