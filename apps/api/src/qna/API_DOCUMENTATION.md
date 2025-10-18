# Q&A Community API Dokümantasyonu

## Genel Bakış

Q&A Community API'si, kullanıcıların kadın sağlığı konularında soru sorabileceği, cevap verebileceği ve topluluk odaklı bilgi paylaşımı yapabileceği bir platform sağlar.

**Base URL:** `/api/qna`

**Authentication:** Tüm endpoint'ler JWT token ile korunmaktadır. Header'da `Authorization: Bearer <token>` gönderilmelidir.

## İçindekiler

1. [Questions API](#questions-api)
2. [Answers API](#answers-api)
3. [Votes API](#votes-api)
4. [Comments API](#comments-api)
5. [Interactions API](#interactions-api)
6. [Reputation API](#reputation-api)
7. [Moderation API](#moderation-api)
8. [Notifications API](#notifications-api)
9. [Analytics API](#analytics-api)
10. [Sharing API](#sharing-api)
11. [Error Codes](#error-codes)
12. [Rate Limiting](#rate-limiting)

---

## Questions API

### Yeni Soru Oluştur

**Endpoint:** `POST /api/qna/questions`

**Rate Limit:** 5 istek/saat

**Request Body:**
```json
{
  "title": "Hamilelikte hangi vitaminler alınmalı?",
  "content": "Hamileliğimin 3. ayındayım ve doktorum vitamin takviyesi önerdi...",
  "category": "PREGNANCY",
  "tags": ["vitamin", "hamilelik", "beslenme"],
  "isAnonymous": false
}
```

**Response:** `201 Created`
```json
{
  "id": "clx123abc...",
  "userId": "user123",
  "title": "Hamilelikte hangi vitaminler alınmalı?",
  "content": "Hamileliğimin 3. ayındayım...",
  "category": "PREGNANCY",
  "tags": ["vitamin", "hamilelik", "beslenme"],
  "isAnonymous": false,
  "status": "OPEN",
  "viewCount": 0,
  "isPremium": false,
  "createdAt": "2025-10-17T10:00:00Z",
  "updatedAt": "2025-10-17T10:00:00Z"
}
```


**Errors:**
- `429 Too Many Requests` - Quota aşıldı
- `400 Bad Request` - Geçersiz veri
- `401 Unauthorized` - Token geçersiz

---

### Soruları Listele

**Endpoint:** `GET /api/qna/questions`

**Query Parameters:**
- `category` (optional): QuestionCategory enum değeri
- `tags` (optional): Virgülle ayrılmış tag listesi
- `status` (optional): OPEN | ANSWERED | CLOSED
- `sort` (optional): recent | popular | unanswered (default: recent)
- `search` (optional): Arama terimi
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına kayıt (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "clx123abc...",
      "title": "Hamilelikte hangi vitaminler alınmalı?",
      "category": "PREGNANCY",
      "tags": ["vitamin", "hamilelik"],
      "status": "OPEN",
      "viewCount": 45,
      "isPremium": false,
      "answerCount": 3,
      "hasAcceptedAnswer": false,
      "createdAt": "2025-10-17T10:00:00Z",
      "user": {
        "id": "user123",
        "username": "ayse_k",
        "profilePictureUrl": "https://..."
      },
      "isFavorited": false,
      "isFollowing": false
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### Soru Detayı Getir

**Endpoint:** `GET /api/qna/questions/:id`

**Response:** `200 OK`
```json
{
  "id": "clx123abc...",
  "userId": "user123",
  "title": "Hamilelikte hangi vitaminler alınmalı?",
  "content": "Hamileliğimin 3. ayındayım ve doktorum vitamin takviyesi önerdi...",
  "category": "PREGNANCY",
  "tags": ["vitamin", "hamilelik", "beslenme"],
  "isAnonymous": false,
  "status": "OPEN",
  "viewCount": 46,
  "isPremium": false,
  "createdAt": "2025-10-17T10:00:00Z",
  "updatedAt": "2025-10-17T10:00:00Z",
  "user": {
    "id": "user123",
    "username": "ayse_k",
    "profilePictureUrl": "https://...",
    "reputation": {
      "totalPoints": 150
    }
  },
  "answerCount": 3,
  "hasAcceptedAnswer": false,
  "isFavorited": false,
  "isFollowing": false,
  "isOwner": true
}
```

---

### Soruyu Güncelle

**Endpoint:** `PATCH /api/qna/questions/:id`

**Rate Limit:** 10 istek/saat

**Authorization:** Sadece soru sahibi

**Request Body:**
```json
{
  "title": "Güncellenmiş başlık",
  "content": "Güncellenmiş içerik",
  "tags": ["yeni", "etiketler"]
}
```

**Response:** `200 OK` (Güncellenmiş soru objesi)

---

### Soruyu Sil

**Endpoint:** `DELETE /api/qna/questions/:id`

**Rate Limit:** 10 istek/saat

**Authorization:** Sadece soru sahibi

**Response:** `204 No Content`

---

### Kullanıcının Soruları

**Endpoint:** `GET /api/qna/questions/my`

**Query Parameters:** Aynı filtreleme parametreleri

**Response:** `200 OK` (Soru listesi)

---

### Favori Sorular

**Endpoint:** `GET /api/qna/questions/favorites`

**Response:** `200 OK` (Favori soru listesi)

---

### Takip Edilen Sorular

**Endpoint:** `GET /api/qna/questions/following`

**Response:** `200 OK` (Takip edilen soru listesi)

---

### Quota Durumu

**Endpoint:** `GET /api/qna/questions/quota/status`

**Response:** `200 OK`
```json
{
  "questionsAsked": 3,
  "limit": 5,
  "remaining": 2,
  "isPremium": false,
  "resetsAt": "2025-11-01T00:00:00Z"
}
```

---

### Soruyu Favorilere Ekle

**Endpoint:** `POST /api/qna/questions/:id/favorite`

**Rate Limit:** 30 istek/saat

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### Soruyu Favorilerden Çıkar

**Endpoint:** `DELETE /api/qna/questions/:id/favorite`

**Rate Limit:** 30 istek/saat

**Response:** `200 OK`

---

### Soruyu Takip Et

**Endpoint:** `POST /api/qna/questions/:id/follow`

**Rate Limit:** 30 istek/saat

**Response:** `200 OK`

---

### Soru Takibini Bırak

**Endpoint:** `DELETE /api/qna/questions/:id/follow`

**Rate Limit:** 30 istek/saat

**Response:** `200 OK`

---

## Answers API

### Cevap Oluştur

**Endpoint:** `POST /api/qna/questions/:questionId/answers`

**Rate Limit:** 10 istek/saat

**Request Body:**
```json
{
  "content": "Hamilelikte folik asit, demir ve D vitamini çok önemlidir..."
}
```

**Response:** `201 Created`
```json
{
  "id": "clx456def...",
  "questionId": "clx123abc...",
  "userId": "user456",
  "content": "Hamilelikte folik asit, demir ve D vitamini çok önemlidir...",
  "isBestAnswer": false,
  "voteCount": 0,
  "createdAt": "2025-10-17T11:00:00Z",
  "updatedAt": "2025-10-17T11:00:00Z",
  "user": {
    "id": "user456",
    "username": "dr_zeynep",
    "profilePictureUrl": "https://..."
  }
}
```

---

### Cevapları Listele

**Endpoint:** `GET /api/qna/questions/:questionId/answers`

**Response:** `200 OK`
```json
[
  {
    "id": "clx456def...",
    "questionId": "clx123abc...",
    "userId": "user456",
    "content": "Hamilelikte folik asit, demir ve D vitamini çok önemlidir...",
    "isBestAnswer": true,
    "voteCount": 15,
    "createdAt": "2025-10-17T11:00:00Z",
    "updatedAt": "2025-10-17T11:00:00Z",
    "user": {
      "id": "user456",
      "username": "dr_zeynep",
      "profilePictureUrl": "https://...",
      "reputation": {
        "totalPoints": 450
      }
    },
    "userVote": "UPVOTE",
    "commentCount": 2,
    "isOwner": false
  }
]
```

---

### Cevabı Güncelle

**Endpoint:** `PATCH /api/qna/answers/:id`

**Rate Limit:** 20 istek/saat

**Authorization:** Sadece cevap sahibi

**Request Body:**
```json
{
  "content": "Güncellenmiş cevap içeriği..."
}
```

**Response:** `200 OK` (Güncellenmiş cevap objesi)

---

### Cevabı Sil

**Endpoint:** `DELETE /api/qna/answers/:id`

**Rate Limit:** 10 istek/saat

**Authorization:** Sadece cevap sahibi

**Response:** `204 No Content`

---

### En İyi Cevap Olarak İşaretle

**Endpoint:** `POST /api/qna/questions/:questionId/answers/:answerId/mark-best`

**Rate Limit:** 20 istek/saat

**Authorization:** Sadece soru sahibi

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## Votes API

### Cevaba Oy Ver

**Endpoint:** `POST /api/qna/answers/:id/vote`

**Rate Limit:** 50 istek/saat

**Request Body:**
```json
{
  "voteType": "UPVOTE"
}
```

**Vote Types:** `UPVOTE` | `DOWNVOTE`

**Response:** `200 OK`
```json
{
  "answerId": "clx456def...",
  "voteType": "UPVOTE",
  "voteCount": 16,
  "changed": false
}
```

**Errors:**
- `400 Bad Request` - Kendi cevabına oy veremezsin
- `409 Conflict` - Zaten aynı şekilde oy verilmiş

---

### Oyunu Geri Çek

**Endpoint:** `DELETE /api/qna/answers/:id/vote`

**Rate Limit:** 50 istek/saat

**Response:** `200 OK`
```json
{
  "success": true,
  "voteCount": 15
}
```

---

### Kullanıcının Oyunu Getir

**Endpoint:** `GET /api/qna/answers/:id/vote`

**Response:** `200 OK`
```json
{
  "answerId": "clx456def...",
  "voteType": "UPVOTE"
}
```

---

### Oy Sayısını Getir

**Endpoint:** `GET /api/qna/answers/:id/vote-count`

**Response:** `200 OK`
```json
{
  "answerId": "clx456def...",
  "voteCount": 15
}
```

---

## Comments API

### Soruya Yorum Yap

**Endpoint:** `POST /api/qna/questions/:id/comments`

**Rate Limit:** 20 istek/saat

**Request Body:**
```json
{
  "content": "Çok faydalı bir soru, ben de merak ediyordum."
}
```

**Response:** `201 Created`
```json
{
  "id": "clx789ghi...",
  "questionId": "clx123abc...",
  "userId": "user789",
  "content": "Çok faydalı bir soru, ben de merak ediyordum.",
  "createdAt": "2025-10-17T12:00:00Z",
  "user": {
    "id": "user789",
    "username": "elif_m",
    "profilePictureUrl": "https://..."
  }
}
```

---

### Sorunun Yorumlarını Getir

**Endpoint:** `GET /api/qna/questions/:id/comments`

**Response:** `200 OK` (Yorum listesi)

---

### Cevaba Yorum Yap

**Endpoint:** `POST /api/qna/answers/:id/comments`

**Rate Limit:** 20 istek/saat

**Request Body:** Aynı format

**Response:** `201 Created`

---

### Cevabın Yorumlarını Getir

**Endpoint:** `GET /api/qna/answers/:id/comments`

**Response:** `200 OK` (Yorum listesi)

---

### Soru Yorumunu Sil

**Endpoint:** `DELETE /api/qna/comments/question/:id`

**Rate Limit:** 20 istek/saat

**Authorization:** Sadece yorum sahibi

**Response:** `204 No Content`

---

### Cevap Yorumunu Sil

**Endpoint:** `DELETE /api/qna/comments/answer/:id`

**Rate Limit:** 20 istek/saat

**Authorization:** Sadece yorum sahibi

**Response:** `204 No Content`

---

## Interactions API

### Kullanıcıyı Takip Et

**Endpoint:** `POST /api/qna/users/:id/follow`

**Rate Limit:** 20 istek/saat

**Response:** `200 OK`

---

### Kullanıcı Takibini Bırak

**Endpoint:** `DELETE /api/qna/users/:id/follow`

**Rate Limit:** 20 istek/saat

**Response:** `200 OK`

---

### Kullanıcının Takipçileri

**Endpoint:** `GET /api/qna/users/:id/followers`

**Response:** `200 OK`
```json
{
  "followers": [
    {
      "id": "user123",
      "username": "ayse_k",
      "profilePictureUrl": "https://...",
      "followedAt": "2025-10-15T10:00:00Z"
    }
  ],
  "count": 25
}
```

---

### Kullanıcının Takip Ettikleri

**Endpoint:** `GET /api/qna/users/:id/following`

**Response:** `200 OK` (Aynı format)

---

## Reputation API

### Kendi İtibar Bilgim

**Endpoint:** `GET /api/qna/reputation/me`

**Response:** `200 OK`
```json
{
  "userId": "user123",
  "totalPoints": 450,
  "questionsAsked": 12,
  "answersGiven": 35,
  "bestAnswers": 8,
  "upvotesReceived": 120,
  "level": "EXPERT",
  "badges": [
    {
      "id": "badge1",
      "key": "first_best_answer",
      "nameTr": "İlk En İyi Cevap",
      "nameEn": "First Best Answer",
      "iconUrl": "https://...",
      "earnedAt": "2025-09-15T10:00:00Z"
    }
  ]
}
```

---

### Kullanıcının İtibar Bilgisi

**Endpoint:** `GET /api/qna/reputation/:userId`

**Response:** `200 OK` (Aynı format)

---

### İtibar Sıralaması (Leaderboard)

**Endpoint:** `GET /api/qna/reputation/leaderboard`

**Query Parameters:**
- `period` (optional): week | month | all (default: all)
- `limit` (optional): Kayıt sayısı (default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user456",
      "username": "dr_zeynep",
      "profilePictureUrl": "https://...",
      "totalPoints": 1250,
      "answersGiven": 85,
      "bestAnswers": 32
    }
  ]
}
```

---

### Tüm Rozetler

**Endpoint:** `GET /api/qna/reputation/badges`

**Response:** `200 OK`
```json
{
  "badges": [
    {
      "id": "badge1",
      "key": "first_best_answer",
      "nameTr": "İlk En İyi Cevap",
      "nameEn": "First Best Answer",
      "description": "İlk en iyi cevabını aldın",
      "iconUrl": "https://...",
      "requirement": {
        "type": "best_answers",
        "count": 1
      }
    }
  ]
}
```

---

### Kazanılan Rozetler

**Endpoint:** `GET /api/qna/reputation/my-badges`

**Response:** `200 OK` (Kazanılan rozetler listesi)

---

## Moderation API

### İçerik Raporla

**Endpoint:** `POST /api/qna/moderation/report`

**Rate Limit:** 10 istek/saat

**Request Body:**
```json
{
  "contentId": "clx123abc...",
  "contentType": "QUESTION",
  "reason": "SPAM",
  "description": "Bu içerik spam içeriyor..."
}
```

**Content Types:** `QUESTION` | `ANSWER` | `COMMENT`

**Reasons:** `SPAM` | `INAPPROPRIATE` | `HARASSMENT` | `MISINFORMATION` | `OTHER`

**Response:** `201 Created`
```json
{
  "id": "report123",
  "status": "PENDING",
  "createdAt": "2025-10-17T13:00:00Z"
}
```

---

### Raporları Listele (Admin)

**Endpoint:** `GET /api/qna/moderation/reports`

**Authorization:** Admin rolü gerekli

**Query Parameters:**
- `status` (optional): PENDING | REVIEWED | RESOLVED | DISMISSED
- `contentType` (optional): QUESTION | ANSWER | COMMENT
- `page` (optional): Sayfa numarası
- `limit` (optional): Sayfa başına kayıt

**Response:** `200 OK` (Rapor listesi)

---

### Raporu İncele (Admin)

**Endpoint:** `PATCH /api/qna/moderation/reports/:id`

**Authorization:** Admin rolü gerekli

**Request Body:**
```json
{
  "action": "HIDE",
  "notes": "İçerik gizlendi"
}
```

**Actions:** `HIDE` | `DELETE` | `DISMISS`

**Response:** `200 OK`

---

### İçeriği Gizle (Admin)

**Endpoint:** `POST /api/qna/moderation/hide/:id`

**Authorization:** Admin rolü gerekli

**Response:** `200 OK`

---

### İçeriği Sil (Admin)

**Endpoint:** `DELETE /api/qna/moderation/content/:id`

**Authorization:** Admin rolü gerekli

**Query Parameters:**
- `type`: question | answer | comment

**Response:** `204 No Content`

---

## Notifications API

### Bildirim Tercihlerini Getir

**Endpoint:** `GET /api/qna/notifications/preferences`

**Response:** `200 OK`
```json
{
  "newAnswers": true,
  "answerVotes": true,
  "bestAnswerSelected": true,
  "comments": true,
  "followedContent": true,
  "badgesEarned": true
}
```

---

### Bildirim Tercihlerini Güncelle

**Endpoint:** `PATCH /api/qna/notifications/preferences`

**Request Body:**
```json
{
  "newAnswers": false,
  "comments": true
}
```

**Response:** `200 OK` (Güncellenmiş tercihler)

---

## Analytics API

### Genel Metrikler

**Endpoint:** `GET /api/qna/analytics/overview`

**Response:** `200 OK`
```json
{
  "totalQuestions": 1250,
  "questionsToday": 45,
  "questionsThisWeek": 320,
  "totalAnswers": 4500,
  "answersToday": 180,
  "averageAnswersPerQuestion": 3.6,
  "unansweredQuestions": 125,
  "bestAnswerRate": 68.5,
  "totalVotes": 15000,
  "totalComments": 8500,
  "activeUsers": 450
}
```

---

### Kategori Dağılımı

**Endpoint:** `GET /api/qna/analytics/categories`

**Response:** `200 OK`
```json
{
  "categories": {
    "PREGNANCY": 450,
    "MENSTRUAL_HEALTH": 320,
    "FERTILITY": 180,
    "NUTRITION": 150,
    "MENTAL_HEALTH": 100,
    "GENERAL": 50
  }
}
```

---

### En Aktif Kullanıcılar

**Endpoint:** `GET /api/qna/analytics/top-users`

**Query Parameters:**
- `period` (optional): week | month | all
- `limit` (optional): Kayıt sayısı (default: 10)

**Response:** `200 OK` (Kullanıcı listesi)

---

## Sharing API

### Paylaşım Linki Oluştur

**Endpoint:** `GET /api/qna/questions/:id/share-link`

**Response:** `200 OK`
```json
{
  "shareUrl": "https://app.example.com/qna/questions/clx123abc",
  "shortUrl": "https://app.example.com/q/abc123"
}
```

---

### Sosyal Medya Meta Verileri

**Endpoint:** `GET /api/qna/questions/:id/share-metadata`

**Response:** `200 OK`
```json
{
  "title": "Hamilelikte hangi vitaminler alınmalı?",
  "description": "Hamileliğimin 3. ayındayım ve doktorum vitamin takviyesi önerdi...",
  "imageUrl": "https://...",
  "url": "https://app.example.com/qna/questions/clx123abc",
  "type": "article",
  "author": "ayse_k"
}
```

---

## Error Codes

### Genel Hatalar

- `400 Bad Request` - Geçersiz istek verisi
- `401 Unauthorized` - Kimlik doğrulama hatası
- `403 Forbidden` - Yetki hatası
- `404 Not Found` - Kaynak bulunamadı
- `429 Too Many Requests` - Rate limit aşıldı
- `500 Internal Server Error` - Sunucu hatası

### Q&A Spesifik Hatalar

```typescript
{
  "statusCode": 429,
  "message": "Aylık soru limitinize ulaştınız",
  "error": "Too Many Requests",
  "code": "QUOTA_EXCEEDED",
  "details": {
    "limit": 5,
    "used": 5,
    "resetsAt": "2025-11-01T00:00:00Z"
  }
}
```

**Error Codes:**
- `QUESTION_NOT_FOUND` - Soru bulunamadı
- `ANSWER_NOT_FOUND` - Cevap bulunamadı
- `COMMENT_NOT_FOUND` - Yorum bulunamadı
- `QUOTA_EXCEEDED` - Soru limiti aşıldı
- `ALREADY_VOTED` - Zaten oy verilmiş
- `CANNOT_VOTE_OWN_ANSWER` - Kendi cevabına oy verilemez
- `NOT_QUESTION_AUTHOR` - Soru sahibi değil
- `SPAM_DETECTED` - Spam algılandı
- `ALREADY_REPORTED` - Zaten raporlanmış
- `CONTENT_TOO_SHORT` - İçerik çok kısa
- `CONTENT_TOO_LONG` - İçerik çok uzun

---

## Rate Limiting

Her endpoint için farklı rate limit'ler uygulanmaktadır:

| Endpoint | Limit | Süre |
|----------|-------|------|
| Soru oluşturma | 5 | 1 saat |
| Cevap oluşturma | 10 | 1 saat |
| Oy verme | 50 | 1 saat |
| Yorum yapma | 20 | 1 saat |
| Favorileme/Takip | 30 | 1 saat |
| Güncelleme | 10-20 | 1 saat |
| Silme | 10 | 1 saat |

Rate limit aşıldığında `429 Too Many Requests` hatası döner:

```json
{
  "statusCode": 429,
  "message": "Rate limit aşıldı",
  "error": "Too Many Requests",
  "retryAfter": 3600
}
```

---

## Kategoriler

```typescript
enum QuestionCategory {
  MENSTRUAL_HEALTH = 'MENSTRUAL_HEALTH',      // Adet Sağlığı
  PREGNANCY = 'PREGNANCY',                     // Hamilelik
  FERTILITY = 'FERTILITY',                     // Doğurganlık
  NUTRITION = 'NUTRITION',                     // Beslenme
  EXERCISE = 'EXERCISE',                       // Egzersiz
  MENTAL_HEALTH = 'MENTAL_HEALTH',            // Ruh Sağlığı
  SLEEP = 'SLEEP',                            // Uyku
  CONTRACEPTION = 'CONTRACEPTION',            // Doğum Kontrolü
  PMS = 'PMS',                                // PMS
  MENOPAUSE = 'MENOPAUSE',                    // Menopoz
  SEXUAL_HEALTH = 'SEXUAL_HEALTH',            // Cinsel Sağlık
  GENERAL = 'GENERAL'                         // Genel
}
```

---

## Soru Durumları

```typescript
enum QuestionStatus {
  OPEN = 'OPEN',           // Açık
  ANSWERED = 'ANSWERED',   // Cevaplanmış
  CLOSED = 'CLOSED'        // Kapalı
}
```

---

## Oy Tipleri

```typescript
enum VoteType {
  UPVOTE = 'UPVOTE',       // Yukarı oy
  DOWNVOTE = 'DOWNVOTE'    // Aşağı oy
}
```

---

## İtibar Puanlama Sistemi

| Eylem | Puan |
|-------|------|
| Cevap en iyi seçildi | +15 |
| Cevaba upvote geldi | +5 |
| Cevaba downvote geldi | -2 |
| Soru upvote aldı | +3 |
| Soru downvote aldı | -1 |

---

## Örnek Kullanım Senaryoları

### 1. Soru Sorma ve Cevap Alma

```javascript
// 1. Soru oluştur
const question = await fetch('/api/qna/questions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Hamilelikte hangi vitaminler alınmalı?',
    content: 'Detaylı açıklama...',
    category: 'PREGNANCY',
    tags: ['vitamin', 'hamilelik'],
    isAnonymous: false
  })
});

// 2. Cevap ver
const answer = await fetch(`/api/qna/questions/${question.id}/answers`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Folik asit ve demir çok önemlidir...'
  })
});

// 3. Cevaba oy ver
await fetch(`/api/qna/answers/${answer.id}/vote`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    voteType: 'UPVOTE'
  })
});

// 4. En iyi cevap olarak işaretle
await fetch(`/api/qna/questions/${question.id}/answers/${answer.id}/mark-best`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. Soru Arama ve Filtreleme

```javascript
// Kategori ve tag ile filtreleme
const questions = await fetch(
  '/api/qna/questions?category=PREGNANCY&tags=vitamin,beslenme&sort=popular&page=1&limit=20',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Arama
const searchResults = await fetch(
  '/api/qna/questions?search=vitamin&sort=recent',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

### 3. Favorileme ve Takip

```javascript
// Soruyu favorile
await fetch(`/api/qna/questions/${questionId}/favorite`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Soruyu takip et
await fetch(`/api/qna/questions/${questionId}/follow`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Kullanıcıyı takip et
await fetch(`/api/qna/users/${userId}/follow`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Notlar

1. **Authentication**: Tüm endpoint'ler JWT token gerektirir
2. **Rate Limiting**: Her endpoint için farklı limitler vardır
3. **Pagination**: Varsayılan sayfa boyutu 20, maksimum 100
4. **Sorting**: Varsayılan sıralama `recent` (en yeni)
5. **Anonymous Mode**: Anonim sorularda gerçek kullanıcı bilgisi gizlenir
6. **Premium Features**: Premium kullanıcılar daha yüksek quota'ya sahiptir
7. **Content Sanitization**: Tüm içerikler XSS koruması için sanitize edilir
8. **Spam Detection**: Otomatik spam filtreleme aktiftir

---

## Destek

API ile ilgili sorularınız için:
- Email: api-support@example.com
- Dokümantasyon: https://docs.example.com/qna-api
- GitHub Issues: https://github.com/example/wellness-app/issues
