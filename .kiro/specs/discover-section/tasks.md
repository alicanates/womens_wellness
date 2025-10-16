# Implementation Plan

- [x] 1. Database schema ve migrations
  - Prisma schema'ya EducationalArticle, ArticleInteraction ve UserContentPreferences modellerini ekle
  - Migration dosyalarını oluştur ve çalıştır
  - User modeline gerekli relation'ları ekle
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 2. Backend API - Core Service Layer
  - [x] 2.1 Discover module ve service oluştur
    - NestJS module, controller ve service dosyalarını oluştur
    - Prisma service'i inject et
    - Temel CRUD operasyonlarını implement et
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 2.2 Recommendation Engine service'i implement et
    - RecommendationEngine service class'ını oluştur
    - Cycle-based scoring algoritmasını implement et
    - Pregnancy-based scoring algoritmasını implement et
    - Category preference weighting'i implement et
    - Seasonal boost logic'i ekle
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 2.3 Article interaction tracking implement et
    - View tracking endpoint ve logic
    - Save/unsave toggle endpoint ve logic
    - Share tracking endpoint ve logic
    - User preferences güncelleme logic'i
    - _Requirements: 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 10.5_

- [x] 3. Backend API - Controller Endpoints
  - [x] 3.1 Home feed endpoint implement et
    - GET /discover/home-feed endpoint'i oluştur
    - Personalization logic'i entegre et
    - Locale desteği ekle
    - Response DTO'ları oluştur
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 3.2 Articles listing endpoint implement et
    - GET /discover/articles endpoint'i oluştur
    - Category filtering ekle
    - Search functionality implement et
    - Pagination ekle
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4_
  
  - [x] 3.3 Article detail endpoint implement et
    - GET /discover/articles/:id endpoint'i oluştur
    - Related articles logic'i ekle
    - User interaction status'ü include et
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 3.4 Saved articles endpoint implement et
    - GET /discover/saved endpoint'i oluştur
    - Sorting by save date ekle
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 3.5 User preferences endpoints implement et
    - GET /discover/preferences endpoint'i oluştur
    - PATCH /discover/preferences endpoint'i oluştur
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 4. Mobile - API Service Client
  - discoverService object'ini api.ts'e ekle
  - getHomeFeed method'unu implement et
  - getArticles method'unu implement et
  - getArticle method'unu implement et
  - getSavedArticles method'unu implement et
  - toggleSave method'unu implement et
  - trackView method'unu implement et
  - trackShare method'unu implement et
  - TypeScript type definitions ekle
  - _Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.1_

- [x] 5. Mobile - Shared Components
  - [x] 5.1 ArticleCard component oluştur
    - Component dosyasını oluştur (src/components/discover/ArticleCard.tsx)
    - Vertical ve horizontal variant'ları implement et
    - Image, title, excerpt, category badge render et
    - Read time ve save button ekle
    - Styling ve theme entegrasyonu
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 5.2 CategoryBadge component oluştur
    - Component dosyasını oluştur
    - Category mapping ve renklendirme
    - _Requirements: 2.2_
  
  - [x] 5.3 SearchBar component oluştur
    - Component dosyasını oluştur
    - Debounced search input
    - Clear button ekle
    - _Requirements: 7.1, 7.2_

- [x] 6. Mobile - Home Screen Enhancement
  - home.tsx dosyasını güncelle
  - Keşfet bölümüne "Tümünü Gör" butonu ekle
  - Yatay scroll ArticleCard listesi ekle
  - homeSnapshot query'sine educationalArticles ekle
  - Save article mutation ekle
  - Navigate to discover ve article detail
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7. Mobile - Discover Page
  - [x] 7.1 Discover screen oluştur
    - Screen dosyasını oluştur (app/discover.tsx)
    - Tab navigation (Tümü / Kaydedilenler) implement et
    - Category filter horizontal scroll ekle
    - SearchBar entegrasyonu
    - Article list ile infinite scroll
    - Loading ve error states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 7.2 React Query hooks ekle
    - useArticles hook (with filters)
    - useSavedArticles hook
    - useToggleSave mutation
    - Cache invalidation logic
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1_

- [x] 8. Mobile - Article Detail Page
  - [x] 8.1 Article detail screen oluştur
    - Screen dosyasını oluştur (app/discover/article/[id].tsx)
    - Hero image render et
    - Article header (category, read time) ekle
    - Title ve meta bilgileri göster
    - Markdown content renderer ekle
    - Tags section ekle
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 8.2 Action buttons implement et
    - Save/unsave button ekle
    - Share button ekle (native share sheet)
    - _Requirements: 3.5, 4.1, 4.2, 4.3, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 8.3 View tracking implement et
    - useEffect ile view tracking
    - Read time tracking (on unmount)
    - _Requirements: 3.6_
  
  - [x] 8.4 Related articles section ekle
    - Related articles listesi
    - Horizontal scroll ArticleCard'lar
    - _Requirements: 3.1_

- [x] 9. Home Service Integration
  - home.service.ts'i güncelle
  - getEducationalArticles metodunu güncelle
  - Recommendation engine'i entegre et
  - User interaction status'ü include et
  - HomeSnapshot interface'ine yeni alanlar ekle
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 10. Seed Data ve Testing
  - [x] 10.1 Seed script oluştur
    - Sample articles ekle (TR ve EN)
    - Farklı kategorilerde içerikler
    - Test için yeterli veri
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 10.2 Manual testing
    - Home screen'de article kartlarını test et
    - Discover page'de filtreleme ve arama test et
    - Article detail'de tüm özellikleri test et
    - Save/unsave functionality test et
    - Share functionality test et
    - Personalization logic'i test et
    - _Requirements: All_

- [x] 11. Performance Optimization
  - React Query cache configuration
  - Image lazy loading ve optimization
  - Pagination ve infinite scroll optimization
  - Database query optimization ve indexing
  - _Requirements: All_

- [x] 12. Error Handling ve Edge Cases
  - API error handling ve user feedback
  - Empty states (no articles, no saved articles)
  - Loading states
  - Offline support ve cache
  - Network error recovery
  - _Requirements: All_
