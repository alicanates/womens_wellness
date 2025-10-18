# Paylaşım ve Raporlama Componentleri - Kullanım Kılavuzu

## 📦 Componentler

### 1. ShareSheet
Soru ve cevapları paylaşmak için kullanılan modal component.

### 2. ReportModal
İçerik raporlamak için kullanılan modal component.

## 🚀 Hızlı Başlangıç

### ShareSheet Kullanımı

```typescript
import { ShareSheet } from '@/components/qna';
import { useState } from 'react';

function MyComponent() {
  const [showShareSheet, setShowShareSheet] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowShareSheet(true)}>
        <Text>Paylaş</Text>
      </TouchableOpacity>

      <ShareSheet
        visible={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        title="Soru başlığı"
        shareUrl="https://app.wellnesscompanion.com/community/123"
        onShareComplete={() => {
          console.log('Paylaşım tamamlandı');
        }}
      />
    </>
  );
}
```

### ReportModal Kullanımı

```typescript
import { ReportModal } from '@/components/qna';
import { ContentType } from '@/types/qna';
import { useState } from 'react';

function MyComponent() {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSubmitReport = async (reason: string, description?: string) => {
    try {
      await reportContent({
        contentId: 'question-id',
        contentType: ContentType.QUESTION,
        reason,
        description,
      });
      Alert.alert('Başarılı', 'Raporunuz alındı');
    } catch (error) {
      Alert.alert('Hata', 'Rapor gönderilemedi');
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowReportModal(true)}>
        <Text>Raporla</Text>
      </TouchableOpacity>

      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId="question-id"
        contentType={ContentType.QUESTION}
        onSubmit={handleSubmitReport}
      />
    </>
  );
}
```

## 📋 Props

### ShareSheet Props

| Prop | Tip | Gerekli | Açıklama |
|------|-----|---------|----------|
| `visible` | `boolean` | ✅ | Modal görünürlüğü |
| `onClose` | `() => void` | ✅ | Modal kapatma callback'i |
| `title` | `string` | ✅ | Paylaşılacak içeriğin başlığı |
| `shareUrl` | `string` | ✅ | Paylaşılacak URL |
| `onShareComplete` | `() => void` | ❌ | Paylaşım tamamlandığında çağrılır |

### ReportModal Props

| Prop | Tip | Gerekli | Açıklama |
|------|-----|---------|----------|
| `visible` | `boolean` | ✅ | Modal görünürlüğü |
| `onClose` | `() => void` | ✅ | Modal kapatma callback'i |
| `contentId` | `string` | ✅ | Raporlanacak içeriğin ID'si |
| `contentType` | `ContentType` | ✅ | İçerik tipi (QUESTION/ANSWER) |
| `onSubmit` | `(reason: string, description?: string) => Promise<void>` | ✅ | Rapor gönderme callback'i |

## 🎨 Özellikler

### ShareSheet Özellikleri

1. **Link Kopyalama**
   - Clipboard API kullanır
   - Başarı feedback'i verir

2. **Native Share**
   - Platform-specific share sheet
   - iOS ve Android desteği

3. **Sosyal Medya**
   - WhatsApp
   - Twitter
   - Facebook

4. **Önizleme**
   - Başlık ve URL gösterimi
   - Truncate desteği

### ReportModal Özellikleri

1. **Rapor Nedenleri**
   - 8 farklı kategori
   - Icon'lu gösterim
   - Seçim göstergesi

2. **Ek Açıklama**
   - 500 karakter limit
   - Karakter sayacı
   - Opsiyonel alan

3. **Bilgilendirme**
   - Gizlilik garantisi
   - Moderasyon süreci

4. **Form Validasyonu**
   - Neden seçimi zorunlu
   - Submit butonu kontrolü

## 💡 Kullanım Örnekleri

### Soru Detay Ekranında Kullanım

```typescript
// Soru paylaşımı
const handleShareQuestion = () => {
  setShareContent({
    title: question.title,
    url: `https://app.wellnesscompanion.com/community/${questionId}`,
  });
  setShowShareSheet(true);
};

// Cevap paylaşımı
const handleShareAnswer = (answerId: string, content: string) => {
  const preview = content.substring(0, 100) + '...';
  setShareContent({
    title: `${question.title} - Cevap: ${preview}`,
    url: `https://app.wellnesscompanion.com/community/${questionId}#answer-${answerId}`,
  });
  setShowShareSheet(true);
};

// Soru raporlama
const handleReportQuestion = () => {
  setReportContent({
    id: questionId,
    type: ContentType.QUESTION,
  });
  setShowReportModal(true);
};

// Cevap raporlama
const handleReportAnswer = (answerId: string) => {
  setReportContent({
    id: answerId,
    type: ContentType.ANSWER,
  });
  setShowReportModal(true);
};
```

### AnswerCard'da Kullanım

```typescript
<AnswerCard
  answer={answer}
  isQuestionAuthor={isQuestionAuthor}
  onVote={handleVote}
  onShare={() => handleShareAnswer(answer.id, answer.content)}
  onReport={() => handleReportAnswer(answer.id)}
  onMarkBest={handleMarkBest}
/>
```

## 🔗 Backend Entegrasyonu

### API Endpoint'leri

```typescript
// Paylaşım tracking
POST /qna/questions/:id/track-share

// İçerik raporlama
POST /qna/moderation/report
Body: {
  contentId: string;
  contentType: 'QUESTION' | 'ANSWER';
  reason: string;
  description?: string;
}
```

### API Servisleri

```typescript
import { qnaService } from '@/services/api';

// Paylaşım tracking
await qnaService.trackShare(questionId);

// İçerik raporlama
await qnaService.reportContent({
  contentId,
  contentType: ContentType.QUESTION,
  reason: 'Spam veya Reklam',
  description: 'Ek açıklama...',
});
```

## 🎯 Best Practices

### 1. State Yönetimi

```typescript
// Paylaşım için
const [shareContent, setShareContent] = useState<{
  title: string;
  url: string;
} | null>(null);

// Raporlama için
const [reportContent, setReportContent] = useState<{
  id: string;
  type: ContentType;
} | null>(null);
```

### 2. Error Handling

```typescript
const handleSubmitReport = async (reason: string, description?: string) => {
  try {
    await reportContentMutation.mutateAsync({
      contentId: reportContent.id,
      contentType: reportContent.type,
      reason,
      description,
    });
    Alert.alert('Başarılı', 'Raporunuz alındı');
  } catch (error: any) {
    Alert.alert('Hata', error.message || 'Rapor gönderilemedi');
  }
};
```

### 3. Analytics Tracking

```typescript
const handleShareComplete = async () => {
  try {
    await qnaService.trackShare(questionId);
  } catch (error) {
    console.error('Failed to track share:', error);
  }
};
```

## 🌐 i18n Desteği

Çeviriler `packages/i18n/src/locales/` altında:

```json
{
  "qna": {
    "share": {
      "title": "Paylaş",
      "copyLink": "Linki Kopyala",
      "linkCopied": "Link kopyalandı"
    },
    "report": {
      "title": "İçeriği Raporla",
      "reasons": {
        "spam": "Spam veya Reklam",
        "inappropriate": "Uygunsuz İçerik"
      }
    }
  }
}
```

## 🎨 Styling

Her iki component da `useTheme` hook'u kullanır:

```typescript
const theme = useTheme();
const styles = createStyles(theme);
```

Tema değişikliklerine otomatik adapte olur.

## 📱 Platform Desteği

- ✅ iOS
- ✅ Android
- ✅ Expo Go
- ✅ Production builds

## 🔒 Güvenlik

### ReportModal
- Rapor nedeni zorunlu
- Ek açıklama opsiyonel
- Karakter limiti (500)
- Gizlilik garantisi

### ShareSheet
- URL validation
- Safe share methods
- Error handling

## 🚀 Performance

- Lazy rendering (modal'lar sadece açıkken render edilir)
- Optimized re-renders
- Minimal dependencies
- Efficient state management

## 📝 Notlar

- ShareSheet ve ReportModal bağımsız componentler
- Yeniden kullanılabilir
- TypeScript tip güvenli
- Accessibility ready (gelecek iyileştirme)
- Deep linking desteği hazır
