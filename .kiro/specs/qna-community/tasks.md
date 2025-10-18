türkçe konuş# Q&A Community Implementation Plan

## Overview
Bu implementation plan, Q&A Community özelliğinin adım adım kodlanması için hazırlanmıştır. Her task, önceki task'lere dayanır ve incremental progress sağlar.

---

## Tasks

- [x] 1. Database schema ve migrations oluştur
  - Prisma schema'ya Q&A modellerini ekle (Question, Answer, Vote, Comment, Reputation, vb.)
  - Migration dosyalarını oluştur ve test et
  - Seed data hazırla (kategoriler, başlangıç rozetleri)
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 5.1, 6.1, 9.1, 10.1_

- [x] 2. Backend: QnA core module ve DTOs oluştur
  - QnA module yapısını oluştur (module, controller, service)
  - DTO'ları tanımla (CreateQuestionDto, UpdateQuestionDto, CreateAnswerDto, vb.)
  - Validation decorator'larını ekle (class-validator)
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [x] 3. Backend: Question CRUD işlemlerini implement et
  - Question oluşturma servisi (anonim mod desteği ile)
  - Question listeleme (filtreleme, pagination, sorting)
  - Question detay getirme (view count artırma)
  - Question güncelleme ve silme
  - Quota kontrolü entegrasyonu
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 10.3, 10.4, 10.5_

- [x] 4. Backend: Answer CRUD işlemlerini implement et
  - Answer oluşturma servisi
  - Answer listeleme (sorting: best answer first, then by votes)
  - Answer güncelleme ve silme
  - Best answer marking (sadece soru sahibi)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Backend: Vote sistemi implement et
  - Vote module oluştur (module, controller, service)
  - Upvote/downvote işlemleri
  - Vote değiştirme ve geri çekme
  - Vote count hesaplama ve güncelleme
  - Kullanıcı kendi cevabına oy verememe kontrolü
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Backend: Comment sistemi implement et
  - Question ve Answer comment servisleri
  - Comment oluşturma (max 300 karakter)
  - Comment listeleme
  - Comment silme
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 7. Backend: Kategori ve tag filtreleme implement et
  - Kategori bazlı filtreleme
  - Tag bazlı filtreleme
  - Arama fonksiyonu (başlık ve içerik)
  - Sorting options (recent, popular, unanswered)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8. Backend: Favorileme ve takip sistemi implement et
  - Question favorileme/unfavorite
  - Question takip etme/unfollow
  - User takip etme/unfollow
  - Favori ve takip listelerini getirme
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 9. Backend: Reputation sistemi implement et
  - Reputation module oluştur
  - Puan hesaplama servisi (best answer, upvote, downvote)
  - Reputation history kaydetme
  - Badge tanımları ve kontrol sistemi
  - User reputation endpoint'leri
  - Leaderboard endpoint'i
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Backend: Moderation sistemi implement et
  - Moderation module oluştur
  - Content report servisi
  - Spam detection (basit keyword-based)
  - Report review ve action (hide, delete)
  - Otomatik gizleme (multiple reports)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 11. Backend: Notification entegrasyonu
  - QnA notification types tanımla
  - Notification service'e QnA event'leri ekle
  - Notification preferences yönetimi
  - Push notification gönderimi (new answer, vote, best answer, vb.)
  - _Requirements: 7.2, 7.3, 11.4, 12.4_

- [x] 12. Backend: Paylaşım ve analytics endpoint'leri
  - Share link oluşturma
  - Social media meta data endpoint'i
  - Analytics metrikleri hesaplama
  - Analytics endpoint'leri (overview, categories, top users)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 13. Backend: Rate limiting ve security
  - Rate limiting guards ekle (questions, answers, votes, comments)
  - Input validation ve sanitization
  - XSS koruması
  - Permission guards (owner check, admin check)
  - _Requirements: Tüm requirements için security_

- [ ]* 14. Backend: Unit testler
  - QnaService testleri
  - VoteService testleri
  - ReputationService testleri
  - ModerationService testleri
  - _Requirements: Tüm requirements_

- [ ]* 15. Backend: Integration testler
  - Question CRUD flow testleri
  - Answer ve best answer flow testleri
  - Vote sistemi testleri
  - Quota kontrolü testleri
  - _Requirements: Tüm requirements_

- [x] 16. Mobile: API client ve types oluştur
  - API endpoint fonksiyonları (questions, answers, votes, vb.)
  - TypeScript interface'leri (Question, Answer, Vote, vb.)
  - React Query hooks (useQuestions, useQuestion, useAnswers, vb.)
  - _Requirements: Tüm requirements için data layer_

- [x] 17. Mobile: Zustand store oluştur
  - QnA store (filters, sorting, cache)
  - User interactions store (favorites, following)
  - Notification preferences store
  - _Requirements: Tüm requirements için state management_

- [x] 18. Mobile: Temel UI components oluştur
  - QuestionCard component
  - AnswerCard component
  - VoteButton component
  - CommentList component
  - CategoryPill component
  - TagChip component
  - _Requirements: 1.1, 3.1, 5.1, 6.1, 14.1_

- [x] 19. Mobile: Ana Q&A listesi ekranı
  - Question list screen (community/index.tsx)
  - Infinite scroll pagination
  - Kategori ve tag filtreleri
  - Sorting options (recent, popular, unanswered)
  - Search bar
  - Pull-to-refresh
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.5, 10.1_

- [x] 20. Mobile: Soru detay ekranı
  - Question detail screen (community/[id].tsx)
  - Question content gösterimi
  - Answer listesi (best answer first, then by votes)
  - Comment sections
  - Action buttons (favorite, follow, share, report)
  - View count tracking
  - _Requirements: 1.4, 3.4, 4.3, 11.1, 12.1, 13.1, 14.1_

- [x] 21. Mobile: Soru oluşturma ekranı
  - Ask question screen (community/ask.tsx)
  - Form (title, content, category, tags)
  - Anonymous mode toggle
  - Quota display ve kontrol
  - Premium upgrade prompt (quota exceeded)
  - Draft save (local storage)
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 6.4, 10.3, 10.4, 10.5_

- [x] 22. Mobile: Cevap verme ve yorum yapma
  - Answer input component
  - Comment input component
  - Character count display
  - Submit ve cancel actions
  - Optimistic updates
  - _Requirements: 3.1, 3.2, 3.3, 14.1, 14.2, 14.3_

- [x] 23. Mobile: Oylama ve best answer seçimi
  - Vote button interactions (upvote/downvote)
  - Vote count display
  - Best answer marking (sadece soru sahibi için)
  - Optimistic updates
  - Error handling
  - _Requirements: 4.1, 4.2, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 24. Mobile: Kullanıcı profil ve aktivite ekranları
  - My questions screen (community/my-questions.tsx)
  - My answers screen (community/my-answers.tsx)
  - Favorites screen (community/favorites.tsx)
  - Following screen (community/following.tsx)
  - Reputation display
  - Badges display
  - _Requirements: 7.1, 9.4, 9.5, 11.3, 12.5_

- [x] 25. Mobile: Bildirim sistemi entegrasyonu
  - QnA notification handlers
  - In-app notification display
  - Notification navigation (deep linking)
  - Notification preferences screen
  - _Requirements: 7.2, 7.3, 11.4, 12.4_

- [x] 26. Mobile: Paylaşım ve raporlama
  - Share sheet implementation
  - Social media share options
  - Copy link functionality
  - Report content modal
  - Report reasons selection
  - _Requirements: 8.1, 13.1, 13.2, 13.3_

- [x] 27. Mobile: Arama ve keşfet özellikleri
  - Search screen implementation
  - Search suggestions
  - Related questions display
  - Category browsing
  - Popular questions widget
  - _Requirements: 6.5_

- [x] 28. Mobile: Localization (i18n)
  - Türkçe çeviriler (qna.json)
  - İngilizce çeviriler (qna.json)
  - Dynamic text rendering
  - Category ve status çevirileri
  - _Requirements: Tüm requirements için i18n_

- [x] 29. Mobile: Error handling ve loading states
  - Loading skeletons
  - Error boundaries
  - Retry mechanisms
  - Empty states
  - Offline mode handling
  - _Requirements: Tüm requirements için UX_

- [x] 30. Mobile: Performance optimizations
  - Image lazy loading
  - List virtualization (FlashList)
  - React Query cache configuration
  - Debounced search
  - Optimistic updates
  - _Requirements: Tüm requirements için performance_

- [ ]* 31. Mobile: E2E testler
  - Soru oluşturma flow testi
  - Cevap verme ve best answer seçme testi
  - Oylama sistemi testi
  - Favorileme ve takip testi
  - Anonim mod testi
  - _Requirements: Tüm requirements_

- [x] 32. Integration: Backend ve mobile entegrasyon testi
  - End-to-end flow testleri
  - API contract testleri
  - Error scenario testleri
  - Performance testleri
  - _Requirements: Tüm requirements_

- [x] 33. Polish: UI/UX iyileştirmeleri
  - Animasyonlar ve transitions
  - Haptic feedback
  - Accessibility improvements
  - Dark mode support
  - Responsive design tweaks
  - _Requirements: Tüm requirements için UX polish_

- [x] 34. Documentation: Kod ve API dokümantasyonu
  - API endpoint dokümantasyonu (Swagger)
  - Component dokümantasyonu
  - README güncellemeleri
  - Deployment guide
  - _Requirements: Tüm requirements için documentation_
