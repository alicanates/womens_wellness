# Implementation Plan

- [x] 1. Backend: Database Schema ve Models
  - Prisma schema'ya Subscription, SubscriptionTransaction ve PremiumFeatureUsage modellerini ekle
  - Enum'ları tanımla (SubscriptionStatus, SubscriptionTier, PaymentProvider, TransactionStatus, TransactionType)
  - Migration oluştur ve çalıştır
  - _Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 2. Backend: Subscription Service Core
  - [x] 2.1 SubscriptionService temel metodlarını implement et
    - getSubscription: Kullanıcının abonelik durumunu getir
    - checkQuota: AI mesaj kotasını kontrol et
    - incrementMessageUsage: Mesaj kullanımını artır
    - resetQuota: Aylık kotayı sıfırla
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 2.2 Abonelik yaşam döngüsü metodlarını implement et
    - handleExpiration: Süre dolmuş abonelikleri işle
    - handleRenewal: Yenileme işlemlerini yönet
    - handleGracePeriod: Ödeme başarısız durumlarını yönet
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x] 3. Backend: Receipt Validation Service
  - [x] 3.1 Apple receipt validation implement et
    - Apple verification endpoint entegrasyonu
    - Production ve sandbox ortam desteği
    - Receipt parsing ve validation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 3.2 Google receipt validation implement et
    - Google Play Developer API entegrasyonu
    - Purchase token validation
    - Subscription status kontrolü
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 4. Backend: Subscription Controller ve Endpoints
  - GET /subscription/status endpoint'i
  - GET /subscription/products endpoint'i
  - POST /subscription/purchase endpoint'i
  - POST /subscription/restore endpoint'i
  - POST /subscription/cancel endpoint'i
  - GET /subscription/transactions endpoint'i
  - GET /subscription/quota endpoint'i
  - POST /subscription/quota/increment endpoint'i
  - GET /subscription/usage-stats endpoint'i
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

- [x] 5. Backend: Webhook Handlers
  - [x] 5.1 Apple webhook handler implement et
    - Notification signature verification
    - INITIAL_BUY, DID_RENEW, DID_FAIL_TO_RENEW event'lerini işle
    - DID_CHANGE_RENEWAL_STATUS, CANCEL, REFUND event'lerini işle
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [x] 5.2 Google webhook handler implement et
    - Notification authenticity verification
    - SUBSCRIPTION_PURCHASED, SUBSCRIPTION_RENEWED event'lerini işle
    - SUBSCRIPTION_CANCELED, SUBSCRIPTION_EXPIRED event'lerini işle
    - SUBSCRIPTION_IN_GRACE_PERIOD, SUBSCRIPTION_RECOVERED event'lerini işle
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 6. Backend: Feature Gate Middleware
  - Premium feature kontrolü için middleware oluştur
  - AI endpoint'lerine quota kontrolü ekle
  - Premium özelliklere erişim kontrolü ekle
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 7. Mobile: IAP Integration Setup
  - react-native-iap kütüphanesini kur ve yapılandır
  - iOS için App Store Connect yapılandırması
  - Android için Google Play Console yapılandırması
  - Product ID'lerini tanımla
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 8. Mobile: IAP Manager Service
  - [x] 8.1 IAPManager class'ını oluştur
    - initialize: IAP bağlantısını başlat
    - loadProducts: Ürünleri yükle
    - getProduct: Belirli ürünü getir
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 8.2 Purchase ve restore metodlarını implement et
    - purchase: Satın alma işlemini başlat
    - restorePurchases: Önceki satın almaları geri yükle
    - validatePurchase: Satın almayı backend'de doğrula
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x] 8.3 Event listener'ları ekle
    - purchaseUpdatedListener
    - purchaseErrorListener
    - Cleanup metodları
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 9. Mobile: Subscription API Service
  - subscriptionService.getStatus implement et
  - subscriptionService.getProducts implement et
  - subscriptionService.processPurchase implement et
  - subscriptionService.restorePurchases implement et
  - subscriptionService.cancelSubscription implement et
  - subscriptionService.getTransactions implement et
  - subscriptionService.getQuota implement et
  - subscriptionService.incrementQuota implement et
  - subscriptionService.getUsageStats implement et
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 10. Mobile: usePremium Hook
  - Subscription status query'si
  - isPremium computed value
  - canUseFeature metodu
  - checkQuota metodu
  - incrementQuota metodu
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 11. Mobile: Premium Badge Component
  - PremiumBadge component'ini oluştur
  - Size variants (small, medium, large)
  - Style variants (icon, text, full)
  - Theme integration
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Mobile: Upgrade Prompt Component
  - UpgradePrompt modal component'ini oluştur
  - Feature açıklaması gösterimi
  - Premium benefits listesi
  - CTA ve close butonları
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 13. Mobile: Premium Page
  - [x] 13.1 Premium page layout ve header
    - Sayfa başlığı ve açıklama
    - Mevcut durum kartı (eğer premium ise)
    - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [x] 13.2 Tier selector ve pricing
    - Aylık/Yıllık plan seçici
    - Fiyat gösterimi
    - Tasarruf badge'i
    - _Requirements: 1.4, 1.5_
  
  - [x] 13.3 Features comparison
    - Free vs Premium karşılaştırma tablosu
    - Feature row component'leri
    - İkonlar ve açıklamalar
    - _Requirements: 1.6, 1.7, 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 13.4 Benefits section
    - Benefit card component'leri
    - Detaylı açıklamalar
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [x] 13.5 Purchase flow
    - CTA button
    - Trial info gösterimi
    - Purchase mutation
    - Success/error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [x] 13.6 FAQ section
    - Sıkça sorulan sorular
    - Kullanım koşulları ve gizlilik politikası linkleri
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [x] 14. Mobile: Settings Page Enhancement
  - [x] 14.1 Premium status card (premium kullanıcılar için)
    - Premium badge
    - Plan bilgileri (tier, başlangıç, yenileme tarihi)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2_
  
  - [x] 14.2 AI Quota display
    - Quota progress bar
    - Kullanım/limit gösterimi
    - Reset tarihi
    - _Requirements: 3.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 14.3 Subscription management buttons
    - "Aboneliği Yönet" butonu (premium için)
    - "Premium'a Geç" butonu (free için)
    - "Kullanım İstatistikleri" butonu
    - Platform subscription management sayfasına yönlendirme
    - _Requirements: 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 15. Mobile: Premium Success Screen
  - Success page oluştur
  - Tebrik mesajı ve animasyon
  - Premium özelliklerin listesi
  - "Başla" butonu
  - _Requirements: 2.7, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 16. Mobile: Usage Stats Screen
  - Usage statistics page oluştur
  - Toplam mesaj sayısı
  - Kullanılan premium özellikler
  - Tasarruf edilen süre
  - Üyelik süresi
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [x] 17. Mobile: Feature Gates Integration
  - [x] 17.1 Chat screen'e quota kontrolü ekle
    - Mesaj göndermeden önce quota kontrolü
    - Quota dolduğunda upgrade prompt göster
    - Mesaj gönderildikten sonra quota increment
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 17.2 Premium özelliklere gate ekle
    - Insights özelliğine premium kontrolü
    - Advanced analytics'e premium kontrolü
    - Customization özelliklerine premium kontrolü
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 18. Mobile: Profile Enhancement
  - Profile picture yanına premium badge ekle
  - Home screen'de premium badge gösterimi
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 19. Backend: Scheduled Jobs
  - [x] 19.1 Quota reset job
    - Her ay başında quota'ları sıfırla
    - Cron job yapılandırması
    - _Requirements: 6.7_
  
  - [x] 19.2 Expiration check job
    - Günlük olarak süresi dolan abonelikleri kontrol et
    - Expired duruma güncelle
    - Bildirim gönder
    - _Requirements: 4.6, 12.6_
  
  - [x] 19.3 Grace period check job
    - Grace period süresi dolan abonelikleri kontrol et
    - Free tier'a düşür
    - Bildirim gönder
    - _Requirements: 16.6_

- [x] 20. Backend: Notification Service Integration
  - Subscription başlangıç bildirimi
  - Yenileme bildirimi
  - İptal bildirimi
  - Süre dolmak üzere bildirimi (3 gün kala)
  - Ödeme başarısız bildirimi
  - Süre doldu bildirimi
  - Quota uyarı bildirimi (%20 kaldığında)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 6.3_

- [x] 21. Mobile: Multi-device Sync
  - App başlangıcında subscription status sync
  - Subscription değişikliklerinde tüm ekranları güncelle
  - Cache invalidation stratejisi
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 22. Backend: Analytics ve Monitoring
  - Subscription event logging
  - Conversion tracking
  - Churn rate hesaplama
  - MRR ve ARPU metrikleri
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [x] 23. Mobile: Error Handling ve Edge Cases
  - Purchase error handling (user cancelled, already owned, etc.)
  - Network error handling
  - Receipt validation error handling
  - Quota exceeded handling
  - Grace period UI states
  - _Requirements: 2.8, 5.6, 6.4, 6.5, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x] 24. Testing: Backend Tests
  - [ ]* 24.1 SubscriptionService unit tests
    - processPurchase test cases
    - checkQuota test cases
    - handleExpiration test cases
    - _Requirements: All backend requirements_
  
  - [ ]* 24.2 ReceiptValidatorService unit tests
    - Apple receipt validation tests
    - Google receipt validation tests
    - Invalid receipt handling tests
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 24.3 Webhook handler tests
    - Apple webhook processing tests
    - Google webhook processing tests
    - Signature verification tests
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 25. Testing: Mobile Tests
  - [ ]* 25.1 usePremium hook tests
    - Premium status tests
    - Feature access tests
    - Quota check tests
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 25.2 Component tests
    - PremiumScreen tests
    - UpgradePrompt tests
    - PremiumBadge tests
    - _Requirements: UI requirements_
  
  - [ ]* 25.3 Integration tests
    - Purchase flow tests
    - Restore flow tests
    - Quota enforcement tests
    - _Requirements: End-to-end requirements_

- [ ] 26. Documentation
  - [ ]* 26.1 API documentation
    - Subscription endpoints documentation
    - Webhook documentation
    - Error codes documentation
    - _Requirements: All backend requirements_
  
  - [ ]* 26.2 Mobile integration guide
    - IAP setup guide
    - Premium feature implementation guide
    - Testing guide
    - _Requirements: All mobile requirements_

- [ ] 27. Deployment ve Configuration
  - Environment variables yapılandırması
  - App Store Connect subscription setup
  - Google Play Console subscription setup
  - Webhook URL'lerini yapılandır
  - Production receipt validation setup
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
