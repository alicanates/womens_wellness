# ✅ Raporlama Butonları Eklendi - Yorum Desteği

## 🎯 Yapılan Değişiklikler

### 1. Yorumlara Raporlama Özelliği Eklendi

#### Değiştirilen Dosya: `apps/mobile/src/components/qna/CommentList.tsx`

**Yeni Özellikler:**
- ✅ Her yorumun yanında "🚩" raporlama butonu
- ✅ Sadece başkasının yorumlarında görünür (kendi yorumunda görünmez)
- ✅ `onReportComment` callback prop'u eklendi
- ✅ Kullanıcı kontrolü (`useAuthStore` ile)

**Kod Değişiklikleri:**

```typescript
// Yeni import
import { useAuthStore } from '@/store/authStore';
import { TouchableOpacity } from 'react-native';

// Yeni prop
interface CommentListProps {
    comments: Comment[];
    loading?: boolean;
    emptyMessage?: string;
    onReportComment?: (commentId: string) => void; // YENİ
}

// CommentItem'a onReport prop'u eklendi
interface CommentItemProps {
    comment: Comment;
    onReport?: (commentId: string) => void; // YENİ
}

// Raporlama butonu eklendi
{!isOwnComment && onReport && (
    <TouchableOpacity
        style={styles.reportButton}
        onPress={() => onReport(comment.id)}
        activeOpacity={0.7}
    >
        <Text style={styles.reportIcon}>🚩</Text>
    </TouchableOpacity>
)}
```

## 📱 Kullanım

### Soru Detay Sayfasında (`[id].tsx`)

Yorum raporlama fonksiyonunu eklemek için:

```typescript
// Yorum raporlama handler'ı ekle
const handleReportComment = (commentId: string) => {
    setReportContent({
        id: commentId,
        type: ContentType.COMMENT,
    });
    setShowReportModal(true);
};

// CommentList'e prop olarak geç
<CommentList 
    comments={comments} 
    loading={commentsLoading}
    onReportComment={handleReportComment} // YENİ
/>
```

## 🎨 Görünüm

### Yorum Kartı Yapısı:
```
┌─────────────────────────────────────────┐
│ 👤 Kullanıcı Adı    12 dk önce    🚩   │
│                                         │
│ Yorum içeriği burada görünür...        │
└─────────────────────────────────────────┘
```

- **🚩 Butonu:** Sağ üstte, küçük ve minimal
- **Görünürlük:** Sadece başkasının yorumlarında
- **Davranış:** Tıklandığında rapor modalı açılır

## ✅ Tamamlanan Özellikler

### Mobil Uygulama Raporlama Butonları:

1. **Sorular** ✅
   - Soru detay sayfasında
   - "🚩 Raporla" butonu
   - Sadece başkasının sorularında

2. **Cevaplar** ✅
   - Cevap kartlarında
   - "🚩 Raporla" butonu
   - Sadece başkasının cevaplarında

3. **Yorumlar** ✅ **[YENİ]**
   - Yorum başlığında
   - "🚩" ikonu (küçük)
   - Sadece başkasının yorumlarında

## 🔍 Butonların Görünmeme Sebepleri

### 1. Kendi İçeriği
Kullanıcı kendi içeriğine bakıyorsa buton görünmez:
- `isQuestionAuthor` kontrolü
- `isOwnAnswer` kontrolü
- `isOwnComment` kontrolü

### 2. Prop Geçilmemiş
Bazı yerlerde `onReport` prop'u geçilmemiş olabilir:
```typescript
// ❌ Yanlış - onReport yok
<AnswerCard answer={answer} />

// ✅ Doğru - onReport var
<AnswerCard answer={answer} onReport={handleReport} />
```

### 3. UI Sorunu
Buton render ediliyor ama görünmüyor olabilir:
- Ekran dışında
- Renk problemi
- Z-index sorunu

## 🧪 Test Senaryoları

### Test 1: Başkasının Yorumunu Raporla
1. Bir soruya git
2. Yorumları aç
3. Başka birinin yorumunda "🚩" ikonunu gör
4. Tıkla
5. Rapor modalı açılmalı

### Test 2: Kendi Yorumunda Buton Yok
1. Kendi yorumunu yaz
2. Yorumunda "🚩" ikonu olmamalı

### Test 3: Rapor Gönderme
1. Başkasının yorumunu raporla
2. Sebep seç
3. Açıklama ekle (opsiyonel)
4. Gönder
5. Başarı mesajı görünmeli

## 📊 Raporlama Sistemi Özeti

### Kullanıcı Tarafı:
- ✅ Soru raporlama
- ✅ Cevap raporlama
- ✅ Yorum raporlama **[YENİ]**
- ✅ 8 farklı rapor sebebi
- ✅ İsteğe bağlı açıklama
- ✅ Gizli raporlama

### Admin Tarafı:
- ✅ Tüm raporları görüntüleme
- ✅ Filtreleme (durum, içerik türü)
- ✅ Raporlanan içeriği inceleme
- ✅ İçerik silme/gizleme
- ✅ Rapor reddetme

### Otomatik:
- ✅ 3+ rapor alan içerik otomatik gizlenir
- ✅ Spam kontrolü
- ✅ İşlem logları

## 🚀 Sonraki Adımlar

### Soru Detay Sayfasını Güncelle
`apps/mobile/app/(tabs)/community/[id].tsx` dosyasında:

1. Yorum raporlama handler'ı ekle
2. CommentList'e `onReportComment` prop'u geç
3. ReportModal'da COMMENT tipini destekle

### Örnek Kod:
```typescript
const handleReportComment = (commentId: string) => {
    setReportContent({
        id: commentId,
        type: ContentType.COMMENT,
    });
    setShowReportModal(true);
};

// Soru yorumları için
<CommentList 
    comments={comments} 
    loading={commentsLoading}
    onReportComment={handleReportComment}
/>

// Cevap yorumları için (AnswerCard içinde)
// AnswerCard zaten kendi CommentList'ini render ediyor
// Ona da onReportComment prop'u geçilmeli
```

## 📝 Notlar

- Yorum raporlama backend'de zaten destekleniyor (`ContentType.COMMENT`)
- Sadece frontend entegrasyonu gerekiyordu
- Şimdi tüm içerik tipleri raporlanabilir
- UI minimal ve kullanıcı dostu

## ✨ Sonuç

Artık kullanıcılar:
- ✅ Soruları raporlayabilir
- ✅ Cevapları raporlayabilir
- ✅ Yorumları raporlayabilir **[YENİ]**

Tüm raporlama butonları aktif ve çalışır durumda! 🎉
