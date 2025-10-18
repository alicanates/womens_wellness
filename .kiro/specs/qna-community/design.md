# Q&A Community Design Document

## Overview

Bu doküman, kadın sağlığı odaklı soru-cevap platformunun teknik tasarımını tanımlar. Platform, mevcut NestJS backend ve React Native (Expo) mobile app üzerine inşa edilecektir. Kullanıcılar soru sorabilir, cevap verebilir, anonim kalabilir, en iyi cevapları seçebilir ve içerikleri oylayabilir.

### Core Features
- Soru oluşturma ve yönetimi (anonim mod desteği ile)
- Cevap sistemi ve oylama mekanizması
- En iyi cevap seçimi
- Kategori ve etiket bazlı filtreleme
- Kullanıcı itibar sistemi
- Favorileme ve takip özellikleri
- Paylaşım ve bildirim sistemi
- İçerik moderasyonu
- Premium kullanıcı avantajları

### Technology Stack
- **Backend**: NestJS + Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Mobile**: React Native (Expo) + Expo Router
- **State Management**: Zustand + React Query
- **Authentication**: JWT (mevcut auth sistemi)
- **Notifications**: Expo Notifications

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Expo)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Q&A Screens  │  │ Profile      │  │ Notifications│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Backend API                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ QnA Module   │  │ Vote Module  │  │ Notification │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Moderation   │  │ Reputation   │  │ Search       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Prisma)                    │
│  Questions | Answers | Votes | Comments | Reputation        │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

Backend modülleri:
- `qna/` - Ana Q&A modülü (questions, answers, comments)
- `vote/` - Oylama sistemi
- `reputation/` - İtibar puanlama sistemi
- `moderation/` - İçerik moderasyonu
- `notification/` - Bildirim yönetimi (mevcut sistemi genişletir)

## Components and Interfaces

### Backend Components

#### 1. QnA Module (`apps/api/src/qna/`)

**Sorumluluklar:**
- Soru CRUD işlemleri
- Cevap CRUD işlemleri
- Yorum CRUD işlemleri
- Kategori ve etiket yönetimi
- Arama ve filtreleme
- Anonim mod yönetimi

**Key Services:**

```typescript
// qna.service.ts
class QnaService {
  // Questions
  async createQuestion(userId: string, dto: CreateQuestionDto): Promise<Question>
  async getQuestions(filters: QuestionFilters): Promise<PaginatedQuestions>
  async getQuestionById(id: string, userId?: string): Promise<QuestionDetail>
  async updateQuestion(id: string, userId: string, dto: UpdateQuestionDto): Promise<Question>
  async deleteQuestion(id: string, userId: string): Promise<void>
  
  // Answers
  async createAnswer(questionId: string, userId: string, dto: CreateAnswerDto): Promise<Answer>
  async getAnswers(questionId: string, sort: SortType): Promise<Answer[]>
  async updateAnswer(id: string, userId: string, dto: UpdateAnswerDto): Promise<Answer>
  async deleteAnswer(id: string, userId: string): Promise<void>
  async markBestAnswer(questionId: string, answerId: string, userId: string): Promise<void>
  
  // Comments
  async createComment(targetId: string, targetType: 'question' | 'answer', userId: string, content: string): Promise<Comment>
  async getComments(targetId: string, targetType: string): Promise<Comment[]>
  async deleteComment(id: string, userId: string): Promise<void>
  
  // Interactions
  async favoriteQuestion(questionId: string, userId: string): Promise<void>
  async unfavoriteQuestion(questionId: string, userId: string): Promise<void>
  async followQuestion(questionId: string, userId: string): Promise<void>
  async unfollowQuestion(questionId: string, userId: string): Promise<void>
  async followUser(targetUserId: string, userId: string): Promise<void>
  async unfollowUser(targetUserId: string, userId: string): Promise<void>
}
```

**Controllers:**
- `QuestionsController` - Soru endpoint'leri
- `AnswersController` - Cevap endpoint'leri
- `CommentsController` - Yorum endpoint'leri
- `InteractionsController` - Favorileme, takip etme

#### 2. Vote Module (`apps/api/src/vote/`)

**Sorumluluklar:**
- Cevaplara oy verme (upvote/downvote)
- Oy sayısı hesaplama
- Kullanıcı başına tek oy garantisi
- Oy değiştirme

**Key Services:**

```typescript
// vote.service.ts
class VoteService {
  async voteAnswer(answerId: string, userId: string, voteType: VoteType): Promise<VoteResult>
  async removeVote(answerId: string, userId: string): Promise<void>
  async getAnswerVoteCount(answerId: string): Promise<number>
  async getUserVote(answerId: string, userId: string): Promise<VoteType | null>
  async getTopAnswers(questionId: string, limit: number): Promise<Answer[]>
}
```

#### 3. Reputation Module (`apps/api/src/reputation/`)

**Sorumluluklar:**
- İtibar puanı hesaplama
- Rozet ve başarım yönetimi
- İtibar geçmişi takibi

**Puan Sistemi:**
- Cevap en iyi cevap seçildi: +15 puan
- Cevaba upvote geldi: +5 puan
- Cevaba downvote geldi: -2 puan
- Soru upvote aldı: +3 puan
- Soru downvote aldı: -1 puan

**Key Services:**

```typescript
// reputation.service.ts
class ReputationService {
  async calculateReputation(userId: string): Promise<number>
  async addReputationPoints(userId: string, points: number, reason: string): Promise<void>
  async getUserReputation(userId: string): Promise<ReputationDetail>
  async getUserBadges(userId: string): Promise<Badge[]>
  async checkAndAwardBadges(userId: string): Promise<Badge[]>
}
```

#### 4. Moderation Module (`apps/api/src/moderation/`)

**Sorumluluklar:**
- İçerik raporlama
- Otomatik spam filtreleme
- Moderasyon kuyruğu yönetimi
- İçerik gizleme/silme

**Key Services:**

```typescript
// moderation.service.ts
class ModerationService {
  async reportContent(contentId: string, contentType: string, userId: string, reason: string): Promise<Report>
  async getReports(filters: ReportFilters): Promise<PaginatedReports>
  async reviewReport(reportId: string, action: ModerationAction, moderatorId: string): Promise<void>
  async hideContent(contentId: string, contentType: string): Promise<void>
  async deleteContent(contentId: string, contentType: string): Promise<void>
  async checkSpam(content: string): Promise<boolean>
}
```

### Mobile Components

#### Screen Structure

```
apps/mobile/app/
├── (tabs)/
│   └── community/
│       ├── index.tsx              # Ana Q&A listesi
│       ├── [id].tsx               # Soru detay sayfası
│       ├── ask.tsx                # Yeni soru oluştur
│       ├── my-questions.tsx       # Kullanıcının soruları
│       ├── my-answers.tsx         # Kullanıcının cevapları
│       ├── favorites.tsx          # Favori sorular
│       └── following.tsx          # Takip edilen sorular/kullanıcılar
```

#### Key Components

```typescript
// QuestionCard.tsx - Soru kartı
interface QuestionCardProps {
  question: Question;
  onPress: () => void;
  showActions?: boolean;
}

// AnswerCard.tsx - Cevap kartı
interface AnswerCardProps {
  answer: Answer;
  isQuestionAuthor: boolean;
  onMarkBest?: () => void;
  onVote: (type: VoteType) => void;
}

// CommentList.tsx - Yorum listesi
interface CommentListProps {
  targetId: string;
  targetType: 'question' | 'answer';
}

// VoteButton.tsx - Oylama butonu
interface VoteButtonProps {
  answerId: string;
  currentVote: VoteType | null;
  voteCount: number;
  onVote: (type: VoteType) => void;
}
```

## Data Models

### Database Schema (Prisma)

```prisma
// Question Model
model Question {
  id              String            @id @default(cuid())
  userId          String
  title           String
  content         String            @db.Text
  category        QuestionCategory
  tags            String[]          @default([])
  isAnonymous     Boolean           @default(false)
  status          QuestionStatus    @default(OPEN)
  viewCount       Int               @default(0)
  isPremium       Boolean           @default(false) // Premium user badge
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers         Answer[]
  comments        QuestionComment[]
  favorites       QuestionFavorite[]
  followers       QuestionFollower[]
  reports         ContentReport[]
  
  @@index([userId, createdAt])
  @@index([category, status, createdAt])
  @@index([status, isPremium, createdAt])
}

// Answer Model
model Answer {
  id              String          @id @default(cuid())
  questionId      String
  userId          String
  content         String          @db.Text
  isBestAnswer    Boolean         @default(false)
  voteCount       Int             @default(0)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  question        Question        @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  votes           AnswerVote[]
  comments        AnswerComment[]
  reports         ContentReport[]
  
  @@index([questionId, isBestAnswer, voteCount])
  @@index([userId, createdAt])
}

// Vote Model
model AnswerVote {
  id        String    @id @default(cuid())
  answerId  String
  userId    String
  voteType  VoteType  // UPVOTE, DOWNVOTE
  createdAt DateTime  @default(now())
  
  answer    Answer    @relation(fields: [answerId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([answerId, userId])
  @@index([answerId])
  @@index([userId])
}
```

// Comment Models
model QuestionComment {
  id         String   @id @default(cuid())
  questionId String
  userId     String
  content    String   @db.VarChar(300)
  createdAt  DateTime @default(now())
  
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([questionId, createdAt])
}

model AnswerComment {
  id        String   @id @default(cuid())
  answerId  String
  userId    String
  content   String   @db.VarChar(300)
  createdAt DateTime @default(now())
  
  answer    Answer   @relation(fields: [answerId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([answerId, createdAt])
}

// Favorite & Follow Models
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

// Reputation Models
model UserReputation {
  id              String                @id @default(cuid())
  userId          String                @unique
  totalPoints     Int                   @default(0)
  questionsAsked  Int                   @default(0)
  answersGiven    Int                   @default(0)
  bestAnswers     Int                   @default(0)
  upvotesReceived Int                   @default(0)
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
  
  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  history         ReputationHistory[]
  badges          UserBadge[]
  
  @@index([totalPoints])
}

model ReputationHistory {
  id           String          @id @default(cuid())
  reputationId String
  points       Int
  reason       String
  metadata     Json?
  createdAt    DateTime        @default(now())
  
  reputation   UserReputation  @relation(fields: [reputationId], references: [id], onDelete: Cascade)
  
  @@index([reputationId, createdAt])
}

model Badge {
  id          String      @id @default(cuid())
  key         String      @unique
  nameTr      String
  nameEn      String
  description String
  iconUrl     String?
  requirement Json        // { type: 'best_answers', count: 10 }
  createdAt   DateTime    @default(now())
  
  userBadges  UserBadge[]
}

model UserBadge {
  id           String          @id @default(cuid())
  reputationId String
  badgeId      String
  earnedAt     DateTime        @default(now())
  
  reputation   UserReputation  @relation(fields: [reputationId], references: [id], onDelete: Cascade)
  badge        Badge           @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([reputationId, badgeId])
  @@index([reputationId])
}

// Moderation Models
model ContentReport {
  id          String           @id @default(cuid())
  contentId   String
  contentType ContentType      // QUESTION, ANSWER, COMMENT
  reporterId  String
  reason      String
  description String?          @db.Text
  status      ReportStatus     @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  createdAt   DateTime         @default(now())
  
  reporter    User             @relation("ContentReports", fields: [reporterId], references: [id], onDelete: Cascade)
  reviewer    User?            @relation("ReviewedReports", fields: [reviewedBy], references: [id], onDelete: SetNull)
  question    Question?        @relation(fields: [contentId], references: [id], onDelete: Cascade)
  answer      Answer?          @relation(fields: [contentId], references: [id], onDelete: Cascade)
  
  @@index([status, createdAt])
  @@index([contentId, contentType])
}
```

// Quota Model (extends existing)
model QnaQuota {
  id                String   @id @default(cuid())
  userId            String   @unique
  monthKey          String   // Format: YYYY-MM
  questionsAsked    Int      @default(0)
  freeUserLimit     Int      @default(5)
  premiumUserLimit  Int      @default(20)
  resetsAt          DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, monthKey])
  @@index([userId, monthKey])
}

// Enums
enum QuestionCategory {
  MENSTRUAL_HEALTH
  PREGNANCY
  FERTILITY
  NUTRITION
  EXERCISE
  MENTAL_HEALTH
  SLEEP
  CONTRACEPTION
  PMS
  MENOPAUSE
  SEXUAL_HEALTH
  GENERAL
}

enum QuestionStatus {
  OPEN
  ANSWERED
  CLOSED
}

enum VoteType {
  UPVOTE
  DOWNVOTE
}

enum ContentType {
  QUESTION
  ANSWER
  COMMENT
}

enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
  DISMISSED
}
```

### User Model Extensions

Mevcut User modeline eklenecek relation'lar:

```prisma
model User {
  // ... existing fields
  
  // Q&A Relations
  questions           Question[]
  answers             Answer[]
  answerVotes         AnswerVote[]
  questionComments    QuestionComment[]
  answerComments      AnswerComment[]
  questionFavorites   QuestionFavorite[]
  questionFollowers   QuestionFollower[]
  followers           UserFollower[]       @relation("UserFollowers")
  following           UserFollower[]       @relation("UserFollowing")
  reputation          UserReputation?
  qnaQuota            QnaQuota?
  contentReports      ContentReport[]      @relation("ContentReports")
  reviewedReports     ContentReport[]      @relation("ReviewedReports")
}
```

## API Endpoints

### Questions API

```
POST   /api/qna/questions              # Yeni soru oluştur
GET    /api/qna/questions              # Soruları listele (filtreleme, sayfalama)
GET    /api/qna/questions/:id          # Soru detayı
PATCH  /api/qna/questions/:id          # Soruyu güncelle
DELETE /api/qna/questions/:id          # Soruyu sil
GET    /api/qna/questions/my           # Kullanıcının soruları
GET    /api/qna/questions/favorites    # Favori sorular
GET    /api/qna/questions/following    # Takip edilen sorular
```

**Query Parameters (GET /api/qna/questions):**
- `category`: QuestionCategory
- `tags`: string[] (comma separated)
- `status`: QuestionStatus
- `sort`: 'recent' | 'popular' | 'unanswered'
- `search`: string
- `page`: number
- `limit`: number

### Answers API

```
POST   /api/qna/questions/:id/answers           # Cevap oluştur
GET    /api/qna/questions/:id/answers           # Sorunun cevapları
PATCH  /api/qna/answers/:id                     # Cevabı güncelle
DELETE /api/qna/answers/:id                     # Cevabı sil
POST   /api/qna/answers/:id/mark-best           # En iyi cevap olarak işaretle
GET    /api/qna/answers/my                      # Kullanıcının cevapları
```

### Votes API

```
POST   /api/qna/answers/:id/vote                # Cevaba oy ver
DELETE /api/qna/answers/:id/vote                # Oyunu geri çek
GET    /api/qna/answers/:id/vote                # Kullanıcının oyunu getir
```

**Request Body (POST):**
```json
{
  "voteType": "UPVOTE" | "DOWNVOTE"
}
```

### Comments API

```
POST   /api/qna/questions/:id/comments          # Soruya yorum yap
POST   /api/qna/answers/:id/comments            # Cevaba yorum yap
GET    /api/qna/questions/:id/comments          # Sorunun yorumları
GET    /api/qna/answers/:id/comments            # Cevabın yorumları
DELETE /api/qna/comments/:id                    # Yorumu sil
```

### Interactions API

```
POST   /api/qna/questions/:id/favorite          # Favorilere ekle
DELETE /api/qna/questions/:id/favorite          # Favorilerden çıkar
POST   /api/qna/questions/:id/follow            # Soruyu takip et
DELETE /api/qna/questions/:id/follow            # Takibi bırak
POST   /api/qna/users/:id/follow                # Kullanıcıyı takip et
DELETE /api/qna/users/:id/follow                # Kullanıcı takibini bırak
GET    /api/qna/users/:id/followers             # Kullanıcının takipçileri
GET    /api/qna/users/:id/following             # Kullanıcının takip ettikleri
```

### Reputation API

```
GET    /api/qna/reputation/me                   # Kendi itibar bilgim
GET    /api/qna/reputation/:userId              # Kullanıcının itibar bilgisi
GET    /api/qna/reputation/leaderboard          # İtibar sıralaması
GET    /api/qna/reputation/badges               # Tüm rozetler
GET    /api/qna/reputation/my-badges            # Kazanılan rozetler
```

### Moderation API

```
POST   /api/qna/moderation/report               # İçerik raporla
GET    /api/qna/moderation/reports              # Raporları listele (admin)
PATCH  /api/qna/moderation/reports/:id          # Raporu incele (admin)
POST   /api/qna/moderation/hide/:id             # İçeriği gizle (admin)
DELETE /api/qna/moderation/content/:id          # İçeriği sil (admin)
```

### Sharing API

```
GET    /api/qna/questions/:id/share-link        # Paylaşım linki oluştur
GET    /api/qna/questions/:id/share-metadata    # Sosyal medya meta verileri
```

## Error Handling

### Error Codes

```typescript
enum QnaErrorCode {
  QUESTION_NOT_FOUND = 'QUESTION_NOT_FOUND',
  ANSWER_NOT_FOUND = 'ANSWER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_CATEGORY = 'INVALID_CATEGORY',
  ALREADY_VOTED = 'ALREADY_VOTED',
  CANNOT_VOTE_OWN_ANSWER = 'CANNOT_VOTE_OWN_ANSWER',
  BEST_ANSWER_ALREADY_SET = 'BEST_ANSWER_ALREADY_SET',
  NOT_QUESTION_AUTHOR = 'NOT_QUESTION_AUTHOR',
  CONTENT_TOO_SHORT = 'CONTENT_TOO_SHORT',
  CONTENT_TOO_LONG = 'CONTENT_TOO_LONG',
  SPAM_DETECTED = 'SPAM_DETECTED',
  ALREADY_REPORTED = 'ALREADY_REPORTED',
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  code?: QnaErrorCode;
  details?: any;
}
```

### Common Error Scenarios

1. **Quota Exceeded**: Kullanıcı aylık soru limitini aştı
   - Status: 429 Too Many Requests
   - Code: QUOTA_EXCEEDED
   - Message: "Aylık soru limitinize ulaştınız. Premium üyelik ile daha fazla soru sorabilirsiniz."

2. **Unauthorized Access**: Başkasının içeriğini düzenleme/silme
   - Status: 403 Forbidden
   - Code: UNAUTHORIZED
   - Message: "Bu işlem için yetkiniz yok."

3. **Spam Detection**: Spam olarak algılanan içerik
   - Status: 400 Bad Request
   - Code: SPAM_DETECTED
   - Message: "İçeriğiniz spam olarak algılandı. Lütfen tekrar deneyin."

## Testing Strategy

### Unit Tests

**Backend Services:**
- QnaService: CRUD işlemleri, anonim mod, filtreleme
- VoteService: Oylama mantığı, tekrar oy verme engelleme
- ReputationService: Puan hesaplama, rozet kazanma
- ModerationService: Spam algılama, rapor işleme

**Test Coverage Hedefi:** %80+

### Integration Tests

**API Endpoints:**
- Soru oluşturma ve listeleme flow'u
- Cevap verme ve en iyi cevap seçme
- Oylama sistemi
- Favorileme ve takip etme
- Quota kontrolü

### E2E Tests (Mobile)

**Critical User Flows:**
1. Kullanıcı soru sorar → Cevap alır → En iyi cevabı seçer
2. Kullanıcı anonim soru sorar → Kimliği gizli kalır
3. Kullanıcı cevaplara oy verir → İtibar puanı güncellenir
4. Kullanıcı soruyu favoriler → Bildirim alır
5. Premium kullanıcı daha fazla soru sorar

## Performance Considerations

### Database Optimization

1. **Indexing Strategy:**
   - Questions: `(category, status, createdAt)`, `(status, isPremium, createdAt)`
   - Answers: `(questionId, isBestAnswer, voteCount)`
   - Votes: `(answerId, userId)` unique index
   - Reputation: `(totalPoints)` for leaderboard

2. **Query Optimization:**
   - Pagination için cursor-based pagination kullan
   - Eager loading ile N+1 problemini önle
   - Vote count'ları cache'le (Redis)

3. **Caching Strategy:**
   - Question list: 5 dakika TTL
   - User reputation: 10 dakika TTL
   - Leaderboard: 1 saat TTL
   - Vote counts: 2 dakika TTL

### Mobile App Optimization

1. **Data Fetching:**
   - React Query ile otomatik caching
   - Infinite scroll için incremental loading
   - Optimistic updates (oy verme, favorileme)

2. **Image Optimization:**
   - Profile resimlerini lazy load
   - Thumbnail kullan (150x150)
   - WebP format desteği

3. **Offline Support:**
   - Taslak soruları local storage'da sakla
   - Offline durumda okuma modu
   - Sync queue ile offline işlemleri

## Security Considerations

### Authentication & Authorization

1. **JWT Token Validation:**
   - Her request'te token doğrulama
   - Token expiry kontrolü
   - Refresh token mekanizması

2. **Permission Checks:**
   - Kullanıcı sadece kendi içeriğini düzenleyebilir
   - Soru sahibi sadece kendi sorusunda en iyi cevap seçebilir
   - Admin rolleri için ayrı guard'lar

### Input Validation

1. **Content Validation:**
   - XSS koruması (HTML sanitization)
   - SQL injection koruması (Prisma ORM)
   - Max length kontrolü (başlık: 200, içerik: 5000, yorum: 300)

2. **Rate Limiting:**
   - Soru oluşturma: 5/saat
   - Cevap verme: 10/saat
   - Oy verme: 50/saat
   - Yorum yapma: 20/saat

### Data Privacy

1. **Anonymous Mode:**
   - Gerçek user ID'yi sadece backend'de sakla
   - Frontend'e "anonymous" flag gönder
   - Anonim kullanıcı profil linklerini devre dışı bırak

2. **Content Moderation:**
   - Otomatik spam filtreleme
   - Raporlanan içerikleri gizle
   - Hassas bilgi içeren içerikleri tespit et

3. **GDPR Compliance:**
   - Kullanıcı verilerini silme (right to be forgotten)
   - Veri export özelliği
   - Açık rıza mekanizması

## Notification System

### Notification Types

```typescript
enum QnaNotificationType {
  NEW_ANSWER = 'NEW_ANSWER',                    // Soruna yeni cevap geldi
  ANSWER_VOTED = 'ANSWER_VOTED',                // Cevabına oy verildi
  BEST_ANSWER_SELECTED = 'BEST_ANSWER_SELECTED', // Cevabın en iyi seçildi
  QUESTION_COMMENTED = 'QUESTION_COMMENTED',    // Soruya yorum yapıldı
  ANSWER_COMMENTED = 'ANSWER_COMMENTED',        // Cevaba yorum yapıldı
  FOLLOWED_QUESTION_ANSWERED = 'FOLLOWED_QUESTION_ANSWERED', // Takip edilen soruya cevap
  FOLLOWED_USER_ASKED = 'FOLLOWED_USER_ASKED',  // Takip edilen kullanıcı soru sordu
  BADGE_EARNED = 'BADGE_EARNED',                // Yeni rozet kazanıldı
}
```

### Notification Preferences

Kullanıcılar hangi bildirimleri almak istediklerini seçebilir:

```typescript
interface QnaNotificationPreferences {
  newAnswers: boolean;              // Default: true
  answerVotes: boolean;             // Default: true
  bestAnswerSelected: boolean;      // Default: true
  comments: boolean;                // Default: true
  followedContent: boolean;         // Default: true
  badgesEarned: boolean;            // Default: true
}
```

### Push Notification Implementation

Mevcut Expo Notifications sistemi kullanılacak:

```typescript
// notification.service.ts
async sendQnaNotification(
  userId: string,
  type: QnaNotificationType,
  data: NotificationData
): Promise<void> {
  // Check user preferences
  const preferences = await this.getNotificationPreferences(userId);
  if (!this.shouldSendNotification(type, preferences)) return;
  
  // Get push token
  const pushToken = await this.getPushToken(userId);
  if (!pushToken) return;
  
  // Send notification
  await this.expoPushService.send({
    to: pushToken,
    title: this.getNotificationTitle(type),
    body: this.getNotificationBody(type, data),
    data: { type, ...data },
  });
}
```

## Premium Features Integration

### Subscription Check

Mevcut Subscription sistemi ile entegrasyon:

```typescript
// qna.service.ts
async createQuestion(userId: string, dto: CreateQuestionDto): Promise<Question> {
  // Check quota
  const quota = await this.getOrCreateQuota(userId);
  const subscription = await this.subscriptionService.getUserSubscription(userId);
  
  const isPremium = subscription.status === SubscriptionStatus.ACTIVE;
  const limit = isPremium ? quota.premiumUserLimit : quota.freeUserLimit;
  
  if (quota.questionsAsked >= limit) {
    throw new QuotaExceededException(
      `Aylık soru limitinize ulaştınız (${limit}). ${
        isPremium ? '' : 'Premium üyelik ile daha fazla soru sorabilirsiniz.'
      }`
    );
  }
  
  // Create question
  const question = await this.prisma.question.create({
    data: {
      ...dto,
      userId,
      isPremium, // Premium badge
    },
  });
  
  // Update quota
  await this.updateQuota(userId, quota.monthKey);
  
  return question;
}
```

### Premium Benefits

1. **Soru Limiti:**
   - Free: 5 soru/ay
   - Premium: 20 soru/ay

2. **Görünürlük:**
   - Premium soruları listede öne çıkar
   - Premium badge gösterilir

3. **Öncelikli Destek:**
   - Premium kullanıcı soruları moderasyon önceliği alır

## Analytics & Metrics

### Tracked Metrics

```typescript
interface QnaMetrics {
  // Question Metrics
  totalQuestions: number;
  questionsToday: number;
  questionsThisWeek: number;
  averageAnswersPerQuestion: number;
  unansweredQuestions: number;
  
  // Answer Metrics
  totalAnswers: number;
  answersToday: number;
  averageTimeToFirstAnswer: number; // minutes
  bestAnswerRate: number; // percentage
  
  // Engagement Metrics
  totalVotes: number;
  totalComments: number;
  totalFavorites: number;
  totalFollows: number;
  activeUsers: number; // last 7 days
  
  // Category Distribution
  categoryBreakdown: Record<QuestionCategory, number>;
  
  // User Metrics
  topContributors: Array<{
    userId: string;
    username: string;
    reputation: number;
    answersGiven: number;
    bestAnswers: number;
  }>;
}
```

### Analytics Endpoints

```
GET /api/qna/analytics/overview        # Genel metrikler
GET /api/qna/analytics/categories      # Kategori dağılımı
GET /api/qna/analytics/top-users       # En aktif kullanıcılar
GET /api/qna/analytics/engagement      # Etkileşim metrikleri
```

## Search & Discovery

### Search Implementation

**Full-Text Search:**
- PostgreSQL full-text search kullan
- Soru başlığı ve içeriğinde arama
- Tag bazlı arama

```typescript
// qna.service.ts
async searchQuestions(query: string, filters: SearchFilters): Promise<Question[]> {
  return this.prisma.question.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            hasSome: query.split(' '),
          },
        },
      ],
      category: filters.category,
      status: filters.status,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              displayName: true,
              profilePictureUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          answers: true,
        },
      },
    },
  });
}
```

### Recommendation System

**Benzer Sorular:**
- Tag benzerliği
- Kategori eşleşmesi
- Kullanıcı geçmişi

```typescript
async getRelatedQuestions(questionId: string, limit: number = 5): Promise<Question[]> {
  const question = await this.prisma.question.findUnique({
    where: { id: questionId },
    select: { tags: true, category: true },
  });
  
  return this.prisma.question.findMany({
    where: {
      id: { not: questionId },
      OR: [
        { tags: { hasSome: question.tags } },
        { category: question.category },
      ],
    },
    orderBy: [
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
}
```

## Localization (i18n)

### Supported Languages
- Turkish (tr) - Primary
- English (en) - Secondary

### Translation Keys

```typescript
// apps/mobile/locales/tr/qna.json
{
  "qna": {
    "title": "Topluluk",
    "askQuestion": "Soru Sor",
    "myQuestions": "Sorularım",
    "myAnswers": "Cevaplarım",
    "favorites": "Favoriler",
    "following": "Takip Ettiklerim",
    "categories": {
      "MENSTRUAL_HEALTH": "Adet Sağlığı",
      "PREGNANCY": "Hamilelik",
      "FERTILITY": "Doğurganlık",
      "NUTRITION": "Beslenme",
      "EXERCISE": "Egzersiz",
      "MENTAL_HEALTH": "Ruh Sağlığı",
      "SLEEP": "Uyku",
      "CONTRACEPTION": "Doğum Kontrolü",
      "PMS": "PMS",
      "MENOPAUSE": "Menopoz",
      "SEXUAL_HEALTH": "Cinsel Sağlık",
      "GENERAL": "Genel"
    },
    "status": {
      "OPEN": "Açık",
      "ANSWERED": "Cevaplanmış",
      "CLOSED": "Kapalı"
    },
    "anonymous": "Anonim",
    "bestAnswer": "En İyi Cevap",
    "markAsBest": "En İyi Cevap Olarak İşaretle",
    "answers": "Cevap",
    "views": "Görüntülenme",
    "vote": "Oy",
    "comment": "Yorum",
    "share": "Paylaş",
    "report": "Raporla",
    "quotaExceeded": "Aylık soru limitinize ulaştınız",
    "upgradeToPremium": "Premium'a Geç"
  }
}
```

## Migration Strategy

### Phase 1: Database Setup
1. Prisma schema güncellemeleri
2. Migration dosyaları oluşturma
3. Seed data (kategoriler, rozetler)

### Phase 2: Backend Implementation
1. QnA module (questions, answers, comments)
2. Vote module
3. Reputation module
4. Moderation module
5. API endpoints ve validation

### Phase 3: Mobile Implementation
1. Screen yapısı ve navigation
2. UI components (QuestionCard, AnswerCard, etc.)
3. API integration (React Query)
4. State management (Zustand)

### Phase 4: Testing & Polish
1. Unit tests
2. Integration tests
3. E2E tests
4. Performance optimization
5. Bug fixes

### Phase 5: Launch
1. Beta testing
2. Feedback collection
3. Final adjustments
4. Production deployment

## Deployment Considerations

### Database Migration

```bash
# Development
cd apps/api
pnpm prisma migrate dev --name add_qna_tables

# Production
pnpm prisma migrate deploy
```

### Environment Variables

```env
# .env
QNA_RATE_LIMIT_QUESTIONS=5
QNA_RATE_LIMIT_ANSWERS=10
QNA_RATE_LIMIT_VOTES=50
QNA_RATE_LIMIT_COMMENTS=20
QNA_FREE_QUESTION_LIMIT=5
QNA_PREMIUM_QUESTION_LIMIT=20
QNA_SPAM_THRESHOLD=0.8
```

### Monitoring

**Key Metrics to Monitor:**
- API response times
- Database query performance
- Error rates
- User engagement (questions/day, answers/day)
- Quota usage
- Spam detection accuracy

**Alerts:**
- High error rate (>5%)
- Slow queries (>1s)
- Spam spike
- Database connection issues

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Advanced Search:**
   - Elasticsearch integration
   - Faceted search
   - Search suggestions

2. **Rich Content:**
   - Image upload in questions/answers
   - Markdown support
   - Code snippet formatting

3. **Gamification:**
   - Achievement system
   - Daily challenges
   - Leaderboard rewards

4. **AI Integration:**
   - AI-powered answer suggestions
   - Content quality scoring
   - Automatic tagging

5. **Expert System:**
   - Verified expert badges
   - Expert-only Q&A section
   - Expert consultation booking

6. **Community Features:**
   - User profiles with bio
   - Direct messaging
   - Community guidelines voting

## Conclusion

Bu tasarım dokümanı, Q&A Community özelliğinin teknik implementasyonu için kapsamlı bir blueprint sağlar. Mevcut wellness app mimarisi ile uyumlu, ölçeklenebilir ve güvenli bir çözüm sunar. Implementation sırasında bu doküman referans alınmalı ve gerektiğinde güncellenmelidir.
