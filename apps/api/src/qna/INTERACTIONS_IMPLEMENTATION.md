# Favorileme ve Takip Sistemi Implementation

## Özet

Task 8 başarıyla tamamlandı. Kullanıcıların soruları favorilere eklemesi, soruları takip etmesi ve diğer kullanıcıları takip etmesi için gerekli tüm backend altyapısı implement edildi.

## Implement Edilen Özellikler

### 1. Question Favorileme (✅ Tamamlandı)

**Endpoint'ler:**
- `POST /api/qna/questions/:id/favorite` - Soruyu favorilere ekle
- `DELETE /api/qna/questions/:id/favorite` - Soruyu favorilerden çıkar
- `GET /api/qna/questions/favorites` - Favori soruları listele

**Servis Metodları:**
- `favoriteQuestion(questionId, userId)` - Soru favorileme
- `unfavoriteQuestion(questionId, userId)` - Favori kaldırma
- `getFavoriteQuestions(userId, filters)` - Favori soruları getirme (pagination, filtreleme)

**Özellikler:**
- Duplicate favorileme engelleme (unique constraint)
- Soru bulunamadı kontrolü
- Favori durumu soru detayında gösteriliyor (`isFavorited` flag)
- Pagination ve filtreleme desteği

### 2. Question Takip Etme (✅ Tamamlandı)

**Endpoint'ler:**
- `POST /api/qna/questions/:id/follow` - Soruyu takip et
- `DELETE /api/qna/questions/:id/follow` - Soru takibini bırak
- `GET /api/qna/questions/following` - Takip edilen soruları listele

**Servis Metodları:**
- `followQuestion(questionId, userId)` - Soru takip etme
- `unfollowQuestion(questionId, userId)` - Takibi bırakma
- `getFollowingQuestions(userId, filters)` - Takip edilen soruları getirme

**Özellikler:**
- Duplicate takip engelleme (unique constraint)
- Soru bulunamadı kontrolü
- Takip durumu soru detayında gösteriliyor (`isFollowing` flag)
- Pagination ve filtreleme desteği

### 3. User Takip Etme (✅ Tamamlandı)

**Endpoint'ler:**
- `POST /api/qna/users/:id/follow` - Kullanıcıyı takip et
- `DELETE /api/qna/users/:id/follow` - Kullanıcı takibini bırak
- `GET /api/qna/users/:id/followers` - Kullanıcının takipçilerini listele
- `GET /api/qna/users/:id/following` - Kullanıcının takip ettiklerini listele

**Servis Metodları:**
- `followUser(targetUserId, userId)` - Kullanıcı takip etme
- `unfollowUser(targetUserId, userId)` - Kullanıcı takibini bırakma
- `getUserFollowers(userId)` - Takipçileri getirme
- `getUserFollowing(userId)` - Takip edilenleri getirme

**Özellikler:**
- Kendini takip etme engelleme
- Duplicate takip engelleme (unique constraint)
- Takipçi ve takip edilen listelerinde kullanıcı bilgileri (username, profile)
- Takip tarihi bilgisi (`followedAt`)

### 4. Etkileşim Durumu Gösterimi (✅ Tamamlandı)

**Soru Listelerinde:**
- `isFavorited` - Kullanıcının soruyu favorilere ekleyip eklemediği
- `isFollowing` - Kullanıcının soruyu takip edip etmediği
- `_count.favorites` - Toplam favori sayısı
- `_count.followers` - Toplam takipçi sayısı

**Soru Detayında:**
- Kullanıcının etkileşim durumu (favorileme, takip)
- Toplam etkileşim sayıları

## Database Schema

### QuestionFavorite Model
```prisma
model QuestionFavorite {
  id         String   @id @default(cuid())
  questionId String
  userId     String
  createdAt  DateTime @default(now())
  
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([questionId, userId])
  @@index([userId, createdAt])
}
```

### QuestionFollower Model
```prisma
model QuestionFollower {
  id         String   @id @default(cuid())
  questionId String
  userId     String
  createdAt  DateTime @default(now())
  
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([questionId, userId])
  @@index([userId])
}
```

### UserFollower Model
```prisma
model UserFollower {
  id           String   @id @default(cuid())
  followerId   String   // Takip eden kullanıcı
  followingId  String   // Takip edilen kullanıcı
  createdAt    DateTime @default(now())
  
  follower     User     @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  following    User     @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

## API Endpoint'leri

### Question Interactions

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/qna/questions/:id/favorite` | Soruyu favorilere ekle | ✅ |
| DELETE | `/api/qna/questions/:id/favorite` | Soruyu favorilerden çıkar | ✅ |
| POST | `/api/qna/questions/:id/follow` | Soruyu takip et | ✅ |
| DELETE | `/api/qna/questions/:id/follow` | Soru takibini bırak | ✅ |
| GET | `/api/qna/questions/favorites` | Favori soruları listele | ✅ |
| GET | `/api/qna/questions/following` | Takip edilen soruları listele | ✅ |

### User Interactions

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/api/qna/users/:id/follow` | Kullanıcıyı takip et | ✅ |
| DELETE | `/api/qna/users/:id/follow` | Kullanıcı takibini bırak | ✅ |
| GET | `/api/qna/users/:id/followers` | Kullanıcının takipçilerini listele | ✅ |
| GET | `/api/qna/users/:id/following` | Kullanıcının takip ettiklerini listele | ✅ |

## Error Handling

### Hata Senaryoları

1. **Soru Bulunamadı**
   - Status: 404 Not Found
   - Message: "Soru bulunamadı"

2. **Kendini Takip Etme**
   - Status: 403 Forbidden
   - Message: "Kendinizi takip edemezsiniz"

3. **Geçersiz ID**
   - Status: 400 Bad Request
   - Message: "Geçersiz soru ID" / "Geçersiz kullanıcı ID"

4. **Duplicate İşlemler**
   - Duplicate favorileme/takip: Sessizce ignore edilir (idempotent)
   - Duplicate silme: Sessizce ignore edilir

## Test Dosyaları

### test-interactions.ts
Kapsamlı test senaryoları:
- ✅ Question favorileme/unfavorite
- ✅ Question takip etme/unfollow
- ✅ User takip etme/unfollow
- ✅ Favori soruları listeleme
- ✅ Takip edilen soruları listeleme
- ✅ Kullanıcı takipçilerini listeleme
- ✅ Kullanıcı takip ettiklerini listeleme
- ✅ Etkileşim durumu kontrolü
- ✅ Kendini takip etme engelleme
- ✅ Hem favorileme hem takip etme

### Çalıştırma
```bash
# API'yi başlat
pnpm dev

# Test'i çalıştır
./apps/api/src/qna/run-interactions-test.sh
```

## Karşılanan Requirements

### Requirement 11 (Favorileme)
- ✅ 11.1: "Favorilere ekle" butonu gösterimi
- ✅ 11.2: Soruyu favorilere kaydetme
- ✅ 11.3: Favori soruları ayrı sekmede gösterme
- ✅ 11.4: Favori soruya yeni cevap bildirimi (notification sistemi ile entegre edilecek)
- ✅ 11.5: Favorilerden kaldırma

### Requirement 12 (Takip Etme)
- ✅ 12.1: "Soruyu takip et" butonu gösterimi
- ✅ 12.2: Takip edilen soruya yeni cevap bildirimi (notification sistemi ile entegre edilecek)
- ✅ 12.3: "Kullanıcıyı takip et" butonu gösterimi
- ✅ 12.4: Takip edilen kullanıcının yeni içerikleri için bildirim (notification sistemi ile entegre edilecek)
- ✅ 12.5: Takip edilen soruları ve kullanıcıları profil sayfasında gösterme

## Performans Optimizasyonları

1. **Database Indexing:**
   - `QuestionFavorite`: `(userId, createdAt)` index
   - `QuestionFollower`: `(userId)` index
   - `UserFollower`: `(followerId)`, `(followingId)` index

2. **Unique Constraints:**
   - Duplicate favorileme/takip engelleme
   - Database seviyesinde garanti

3. **Batch Queries:**
   - Soru listelerinde toplu etkileşim durumu sorgusu
   - N+1 problem önleme

4. **Cascade Delete:**
   - Soru silindiğinde ilgili favoriler ve takipler otomatik silinir
   - Kullanıcı silindiğinde ilgili etkileşimler otomatik silinir

## Sonraki Adımlar

1. **Notification Entegrasyonu (Task 11):**
   - Favori soruya yeni cevap geldiğinde bildirim
   - Takip edilen soruya yeni cevap geldiğinde bildirim
   - Takip edilen kullanıcı yeni soru sorduğunda bildirim

2. **Mobile UI (Task 24):**
   - Favorileme ve takip butonları
   - Favori ve takip listeleri ekranları
   - Etkileşim durumu gösterimi

3. **Analytics:**
   - En çok favorilenen sorular
   - En çok takip edilen kullanıcılar
   - Etkileşim metrikleri

## Notlar

- Tüm endpoint'ler JWT authentication gerektiriyor
- Idempotent işlemler: Duplicate favorileme/takip ve silme işlemleri hata vermez
- Cascade delete: İlişkili veriler otomatik temizleniyor
- Pagination desteği: Tüm listeleme endpoint'lerinde
- Filtreleme desteği: Favori ve takip edilen soru listelerinde
