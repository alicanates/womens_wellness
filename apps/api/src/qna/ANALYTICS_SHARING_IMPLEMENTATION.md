# Analytics and Sharing Implementation

## Overview
Bu doküman, Q&A Community için analytics ve sharing özelliklerinin implementasyonunu açıklar.

## Implemented Features

### 1. Analytics Service (`analytics.service.ts`)

Analytics servisi, Q&A platformunun çeşitli metriklerini hesaplar ve raporlar.

#### Endpoints

**GET /api/qna/analytics/overview**
- Genel platform metrikleri
- Toplam soru/cevap sayıları
- Günlük ve haftalık istatistikler
- Ortalama cevap süresi
- En iyi cevap oranı
- Aktif kullanıcı sayısı

Response:
```json
{
  "totalQuestions": 150,
  "questionsToday": 5,
  "questionsThisWeek": 32,
  "averageAnswersPerQuestion": 2.5,
  "unansweredQuestions": 12,
  "totalAnswers": 375,
  "answersToday": 8,
  "averageTimeToFirstAnswer": 45.5,
  "bestAnswerRate": 65.5,
  "totalVotes": 890,
  "totalComments": 234,
  "totalFavorites": 156,
  "totalFollows": 89,
  "activeUsers": 45
}
```

**GET /api/qna/analytics/categories**
- Kategori bazlı soru dağılımı
- Her kategorinin yüzdesi

Response:
```json
[
  {
    "category": "PREGNANCY",
    "count": 45,
    "percentage": 30.0
  },
  {
    "category": "MENSTRUAL_HEALTH",
    "count": 38,
    "percentage": 25.33
  }
]
```

**GET /api/qna/analytics/top-users?limit=10**
- En yüksek itibar puanına sahip kullanıcılar
- Cevap ve en iyi cevap sayıları

Response:
```json
[
  {
    "userId": "user123",
    "username": "healthexpert",
    "reputation": 1250,
    "answersGiven": 85,
    "bestAnswers": 23
  }
]
```

**GET /api/qna/analytics/engagement**
- Etkileşim metrikleri
- Ortalama oy ve yorum sayıları

Response:
```json
{
  "totalVotes": 890,
  "totalComments": 234,
  "totalFavorites": 156,
  "totalFollows": 89,
  "averageVotesPerAnswer": 2.37,
  "averageCommentsPerQuestion": 1.56
}
```

### 2. Sharing Service (`sharing.service.ts`)

Sharing servisi, soruların ve cevapların paylaşılması için link ve metadata oluşturur.

#### Endpoints

**GET /api/qna/questions/:id/share-link**
- Soru için paylaşım linki oluşturur
- Public endpoint (auth gerekmez)

Response:
```json
{
  "url": "https://app.example.com/community/question123",
  "shortUrl": "https://app.example.com/community/question123"
}
```

**GET /api/qna/answers/:id/share-link**
- Cevap için paylaşım linki oluşturur
- Cevabın bulunduğu soruya yönlendirir

Response:
```json
{
  "url": "https://app.example.com/community/question123?answer=answer456",
  "shortUrl": "https://app.example.com/community/question123?answer=answer456"
}
```

**GET /api/qna/questions/:id/share-metadata**
- Sosyal medya paylaşımı için metadata
- Open Graph ve Twitter Card uyumlu

Response:
```json
{
  "title": "Hamilelikte beslenme nasıl olmalı? - 5 cevap",
  "description": "Hamilelik döneminde hangi besinlere dikkat etmeliyim...",
  "image": "https://cdn.example.com/profile/user123.jpg",
  "url": "https://app.example.com/community/question123",
  "type": "question"
}
```

**GET /api/qna/answers/:id/share-metadata**
- Cevap için sosyal medya metadata

Response:
```json
{
  "title": "healthexpert'in cevabı: Hamilelikte beslenme nasıl olmalı?",
  "description": "Hamilelik döneminde dengeli beslenme çok önemlidir...",
  "image": "https://cdn.example.com/profile/expert123.jpg",
  "url": "https://app.example.com/community/question123?answer=answer456",
  "type": "answer"
}
```

**POST /api/qna/questions/:id/track-share**
- Paylaşım olayını takip eder
- Analytics için kullanılır
- Requires authentication

Response:
```json
{
  "success": true
}
```

## Key Features

### Analytics Features

1. **Real-time Metrics**
   - Güncel soru/cevap sayıları
   - Günlük ve haftalık trendler
   - Aktif kullanıcı takibi

2. **Performance Metrics**
   - Ortalama cevap süresi (dakika)
   - En iyi cevap oranı (%)
   - Cevapsız soru sayısı

3. **Engagement Tracking**
   - Toplam oy sayısı
   - Yorum aktivitesi
   - Favori ve takip istatistikleri

4. **Category Analytics**
   - Kategori bazlı dağılım
   - Yüzdelik hesaplama
   - Popüler kategoriler

5. **Leaderboard**
   - En yüksek itibar puanı
   - En çok cevap veren kullanıcılar
   - En iyi cevap sayıları

### Sharing Features

1. **Link Generation**
   - Benzersiz paylaşım linkleri
   - Deep linking desteği
   - Answer-specific links

2. **Social Media Metadata**
   - Open Graph tags
   - Twitter Card uyumlu
   - Dinamik başlık ve açıklama
   - Profil resmi entegrasyonu

3. **Share Tracking**
   - Paylaşım sayısı takibi
   - Analytics entegrasyonu
   - View count güncelleme

4. **SEO Optimization**
   - Temiz URL yapısı
   - Meta description (200 karakter)
   - Anlamlı başlıklar

## Configuration

### Environment Variables

```env
APP_URL=https://app.example.com
```

Bu değişken, paylaşım linklerinin base URL'ini belirler.

## Implementation Details

### Analytics Service

**Performance Considerations:**
- Karmaşık hesaplamalar için cache kullanılabilir
- Büyük veri setlerinde pagination önerilir
- Index'ler sorgu performansını artırır

**Calculation Methods:**
- `averageTimeToFirstAnswer`: İlk cevap gelene kadar geçen süre (dakika)
- `bestAnswerRate`: En iyi cevap seçilen soruların yüzdesi
- `activeUsers`: Son 7 günde soru veya cevap veren kullanıcılar

### Sharing Service

**URL Structure:**
- Questions: `/community/{questionId}`
- Answers: `/community/{questionId}?answer={answerId}`

**Metadata Generation:**
- Başlık: Soru başlığı + cevap sayısı
- Açıklama: İlk 200 karakter + "..."
- Görsel: Kullanıcı profil resmi (varsa)

## Testing

Test script'i çalıştırmak için:

```bash
chmod +x apps/api/src/qna/run-analytics-sharing-test.sh
./apps/api/src/qna/run-analytics-sharing-test.sh
```

### Test Coverage

1. **Analytics Tests**
   - Overview metrics
   - Category breakdown
   - Top contributors
   - Engagement metrics

2. **Sharing Tests**
   - Question share link
   - Answer share link
   - Question metadata
   - Answer metadata
   - Share tracking

## Requirements Mapping

Bu implementation aşağıdaki requirement'ları karşılar:

- **13.1**: Paylaş butonu ve link oluşturma
- **13.2**: Sosyal medya platformları ve link kopyalama
- **13.3**: Link kopyalama ve panoya kopyalama
- **13.4**: Paylaşım sayısı takibi (view count ile)
- **13.5**: Paylaşım linkleri için önizleme meta verileri

## Future Enhancements

1. **URL Shortener Integration**
   - Bit.ly veya custom shortener
   - QR code generation

2. **Advanced Analytics**
   - Time-series data
   - Trend analysis
   - Predictive metrics

3. **Share Analytics**
   - Platform-specific tracking
   - Referrer analysis
   - Conversion tracking

4. **Cache Layer**
   - Redis cache for metrics
   - Scheduled metric updates
   - Real-time vs cached data

## API Documentation

Tüm endpoint'ler Swagger/OpenAPI dokümantasyonunda mevcuttur:
- Analytics endpoints: `/api/qna/analytics/*`
- Sharing endpoints: `/api/qna/questions/:id/share-*` ve `/api/qna/answers/:id/share-*`

## Security Notes

- Analytics endpoint'leri authentication gerektirir
- Sharing metadata endpoint'leri public (SEO için)
- Share tracking authentication gerektirir
- Rate limiting önerilir (özellikle analytics için)
