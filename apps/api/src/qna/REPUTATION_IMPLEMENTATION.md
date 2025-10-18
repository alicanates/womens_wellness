# Reputation System Implementation

## Genel Bakış

Q&A Community için reputation (itibar) sistemi başarıyla implement edildi. Bu sistem, kullanıcıların topluluk içindeki katkılarını ödüllendirir ve kaliteli içerik üretimini teşvik eder.

## Implement Edilen Özellikler

### 1. Reputation Service (`reputation.service.ts`)

Reputation sisteminin core business logic'ini içerir:

#### Puan Sistemi
- **Best Answer Seçildi**: +15 puan
- **Cevaba Upvote**: +5 puan
- **Cevaba Downvote**: -2 puan
- **Soruya Upvote**: +3 puan (gelecek için hazır)
- **Soruya Downvote**: -1 puan (gelecek için hazır)

#### Ana Metodlar

**`getOrCreateReputation(userId)`**
- Kullanıcının reputation kaydını getirir veya oluşturur
- Her kullanıcı için otomatik reputation kaydı

**`addReputationPoints(userId, reason, metadata)`**
- Kullanıcıya puan ekler/çıkarır
- Reputation history kaydı oluşturur
- Otomatik badge kontrolü yapar

**`calculateReputation(userId)`**
- Kullanıcının toplam puanını hesaplar

**`getUserReputation(userId)`**
- Kullanıcının detaylı reputation bilgilerini getirir
- Kazanılan badge'leri içerir

**`getReputationHistory(userId, limit)`**
- Kullanıcının puan geçmişini getirir
- Hangi aksiyonlardan puan kazandığını gösterir

**`getLeaderboard(limit)`**
- En yüksek puanlı kullanıcıları listeler
- Sıralama bilgisi ile birlikte

**`checkAndAwardBadges(userId)`**
- Kullanıcının badge kazanma kriterlerini kontrol eder
- Yeni badge'leri otomatik olarak verir

**`incrementQuestionsAsked(userId)`**
- Soru sorulduğunda çağrılır
- Soru sayacını artırır
- Badge kontrolü yapar

**`incrementAnswersGiven(userId)`**
- Cevap verildiğinde çağrılır
- Cevap sayacını artırır
- Badge kontrolü yapar

### 2. Reputation Controller (`reputation.controller.ts`)

RESTful API endpoint'leri:

```
GET  /api/qna/reputation/me              # Kendi reputation bilgim
GET  /api/qna/reputation/me/history      # Kendi reputation geçmişim
GET  /api/qna/reputation/me/badges       # Kazandığım badge'ler
GET  /api/qna/reputation/:userId         # Başka kullanıcının reputation'ı
GET  /api/qna/reputation/leaderboard/top # Leaderboard
GET  /api/qna/reputation/badges/all      # Tüm mevcut badge'ler
```

### 3. QnA Service Entegrasyonu

QnA service'e reputation entegrasyonu eklendi:

**Soru Oluşturma**
```typescript
await this.reputationService.incrementQuestionsAsked(userId);
```

**Cevap Oluşturma**
```typescript
await this.reputationService.incrementAnswersGiven(userId);
```

**Best Answer Seçimi**
```typescript
await this.reputationService.addReputationPoints(
    answer.userId,
    'BEST_ANSWER_SELECTED',
    { questionId, answerId }
);
```

### 4. Vote Service Entegrasyonu

Vote service'e reputation entegrasyonu eklendi:

**Upvote/Downvote**
- Oy verildiğinde cevap sahibine puan eklenir
- Oy değiştirildiğinde önceki puan geri alınır, yeni puan eklenir
- Oy geri çekildiğinde puan geri alınır

### 5. Badge Sistemi

16 farklı badge tanımlandı (`seed-qna-badges.ts`):

#### Başlangıç Rozetleri
- 🎯 **İlk Soru**: İlk sorunuzu sordunuz (1 soru)
- 💬 **İlk Cevap**: İlk cevabınızı verdiniz (1 cevap)

#### Soru Rozetleri
- 🤔 **Meraklı**: 5 soru sordunuz
- 🔍 **Araştırmacı**: 10 soru sordunuz

#### Cevap Rozetleri
- 🤝 **Yardımsever**: 10 cevap verdiniz
- 👩‍🏫 **Mentor**: 25 cevap verdiniz
- ⭐ **Uzman**: 50 cevap verdiniz

#### En İyi Cevap Rozetleri
- ✅ **En İyi Cevap**: İlk en iyi cevabınız seçildi
- 🏆 **Güvenilir Danışman**: 5 en iyi cevabınız var
- 👑 **Topluluk Şampiyonu**: 10 en iyi cevabınız var

#### Oy Rozetleri
- 👍 **Takdir Edilen**: 10 upvote aldınız
- 🌟 **Popüler**: 25 upvote aldınız
- 💫 **Etkileyici**: 50 upvote aldınız

#### Toplam Puan Rozetleri
- 🌠 **Yükselen Yıldız**: 100 puana ulaştınız
- 🎖️ **Deneyimli**: 500 puana ulaştınız
- 🏅 **Efsane**: 1000 puana ulaştınız

## Database Schema

Reputation sistemi için gerekli tüm modeller zaten Prisma schema'da mevcut:

- `UserReputation`: Kullanıcı itibar bilgileri
- `ReputationHistory`: Puan geçmişi
- `Badge`: Badge tanımları
- `UserBadge`: Kullanıcıların kazandığı badge'ler

## Test

### Test Script

`test-reputation.ts` dosyası kapsamlı test senaryoları içerir:

1. ✅ Kullanıcı girişleri
2. ✅ Tüm badge'leri listeleme
3. ✅ Başlangıç reputation durumu
4. ✅ Soru oluşturma ve reputation güncelleme
5. ✅ İlk badge kazanma
6. ✅ Cevap verme ve reputation güncelleme
7. ✅ Upvote verme ve puan kazanma
8. ✅ Best answer seçme ve puan kazanma
9. ✅ Badge kazanma kontrolü
10. ✅ Reputation history
11. ✅ Leaderboard
12. ✅ Downvote verme ve puan kaybetme

### Test Çalıştırma

```bash
# API'yi başlat
cd apps/api
pnpm dev

# Başka bir terminalde test'i çalıştır
cd apps/api/src/qna
./run-reputation-test.sh
```

## API Kullanım Örnekleri

### Kendi Reputation Bilgimi Getir

```bash
curl -X GET http://localhost:3000/api/qna/reputation/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "id": "rep_123",
  "userId": "user_123",
  "totalPoints": 45,
  "questionsAsked": 2,
  "answersGiven": 3,
  "bestAnswers": 1,
  "upvotesReceived": 4,
  "user": {
    "id": "user_123",
    "username": "johndoe",
    "displayName": "John Doe",
    "profilePictureUrl": "..."
  },
  "badges": [
    {
      "id": "badge_1",
      "badge": {
        "key": "first_question",
        "nameTr": "İlk Soru",
        "nameEn": "First Question",
        "iconUrl": "🎯"
      },
      "earnedAt": "2025-10-17T10:00:00Z"
    }
  ]
}
```

### Reputation History

```bash
curl -X GET "http://localhost:3000/api/qna/reputation/me/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
[
  {
    "id": "hist_1",
    "points": 15,
    "reason": "BEST_ANSWER_SELECTED",
    "metadata": {
      "questionId": "q_123",
      "answerId": "a_456"
    },
    "createdAt": "2025-10-17T12:00:00Z"
  },
  {
    "id": "hist_2",
    "points": 5,
    "reason": "ANSWER_UPVOTED",
    "metadata": {
      "answerId": "a_456"
    },
    "createdAt": "2025-10-17T11:30:00Z"
  }
]
```

### Leaderboard

```bash
curl -X GET "http://localhost:3000/api/qna/reputation/leaderboard/top?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
[
  {
    "userId": "user_123",
    "username": "johndoe",
    "displayName": "John Doe",
    "profilePictureUrl": "...",
    "totalPoints": 450,
    "questionsAsked": 15,
    "answersGiven": 45,
    "bestAnswers": 12,
    "upvotesReceived": 60,
    "rank": 1
  },
  {
    "userId": "user_456",
    "username": "janedoe",
    "displayName": "Jane Doe",
    "profilePictureUrl": "...",
    "totalPoints": 320,
    "questionsAsked": 8,
    "answersGiven": 38,
    "bestAnswers": 8,
    "upvotesReceived": 42,
    "rank": 2
  }
]
```

### Tüm Badge'leri Listele

```bash
curl -X GET http://localhost:3000/api/qna/reputation/badges/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Özellikler

### ✅ Otomatik Puan Hesaplama
- Her aksiyon otomatik olarak puan kazandırır/kaybettirir
- Reputation history'de tüm değişiklikler kaydedilir

### ✅ Badge Sistemi
- Kullanıcılar başarılarına göre otomatik badge kazanır
- 16 farklı badge kategorisi
- Badge kazanma kriterleri esnek ve genişletilebilir

### ✅ Leaderboard
- En aktif ve başarılı kullanıcıları gösterir
- Topluluk içinde rekabet ortamı yaratır

### ✅ Reputation History
- Kullanıcılar puan geçmişlerini görebilir
- Hangi aksiyonlardan puan kazandıkları şeffaf

### ✅ Circular Dependency Yönetimi
- `forwardRef` kullanılarak circular dependency sorunları çözüldü
- QnaService ↔ ReputationService
- VoteService ↔ ReputationService

## Gelecek İyileştirmeler

### Öncelikli
- [ ] Question upvote/downvote için reputation entegrasyonu
- [ ] Notification sistemi ile badge kazanma bildirimleri
- [ ] Admin panel'de reputation yönetimi

### İsteğe Bağlı
- [ ] Reputation decay (zamanla puan azalması)
- [ ] Seasonal leaderboards (aylık, yıllık)
- [ ] Custom badge'ler (admin tarafından verilen)
- [ ] Reputation-based permissions (belirli puana ulaşınca yeni yetkiler)

## Requirements Coverage

Bu implementation aşağıdaki requirement'ları karşılar:

- ✅ **9.1**: Her kullanıcı için itibar puanı hesaplama
- ✅ **9.2**: Best answer seçildiğinde puan artırma
- ✅ **9.3**: Upvote alındığında puan artırma
- ✅ **9.4**: İtibar puanını profil sayfasında gösterme (API hazır)
- ✅ **9.5**: Belirli seviyelerde rozet/başarım verme

## Sonuç

Reputation sistemi başarıyla implement edildi ve test edildi. Sistem:
- Kullanıcı katkılarını ödüllendirir
- Badge sistemi ile gamification sağlar
- Leaderboard ile rekabet ortamı yaratır
- Şeffaf ve adil bir puan sistemi sunar
- Gelecek geliştirmeler için esnek bir yapıya sahiptir

Sistem production'a hazır durumda ve mobile app entegrasyonu için API endpoint'leri hazır.
