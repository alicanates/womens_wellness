# Implementation Plan

- [x] 1. Backend: Context Builder Service oluşturma
  - ContextBuilderService sınıfını oluştur ve temel yapıyı kur
  - Kullanıcı sağlık verilerini toplayan buildUserContext metodunu implement et
  - Kişiselleştirilmiş sistem promptu oluşturan buildSystemPrompt metodunu implement et
  - Helper metodları ekle (calculateCycleDay, calculatePregnancyData, determinePhase, estimateNextPeriod, getWellnessData)
  - _Requirements: 1.2, 1.3_

- [x] 2. Backend: Chat Service'i Gemini API için güncelleme
  - ContextBuilderService'i ChatService'e inject et
  - streamResponse metodunu Gemini API kullanacak şekilde güncelle
  - google('gemini-1.5-flash') modelini entegre et
  - Dinamik sistem promptu oluşturmayı ekle
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Backend: Environment configuration ve API key yönetimi
  - .env.example dosyasına GOOGLE_GENERATIVE_AI_API_KEY ekle
  - API key varlık kontrolü ekle (app bootstrap'da)
  - ConfigModule'de Gemini API key'i tanımla
  - _Requirements: 1.1, 1.7_

- [x] 4. Backend: Chat Controller hata yönetimini iyileştirme
  - stream endpoint'inde gelişmiş hata yakalama ekle
  - Hata tipine göre kullanıcı dostu Türkçe mesajlar döndür (timeout, rate limit, API key, network)
  - Error logging mekanizması ekle
  - _Requirements: 1.5_

- [x] 5. Backend: Quota Guard iyileştirmeleri
  - QuotaGuard'da Türkçe hata mesajları ekle
  - Kota dolduğunda detaylı bilgi ver (used/limit, reset tarihi)
  - _Requirements: 1.4_

- [x] 6. Backend: Chat Module bağımlılıklarını güncelleme
  - ContextBuilderService'i ChatModule providers'a ekle
  - @ai-sdk/google paketinin yüklü olduğunu doğrula
  - Module export/import yapılandırmasını kontrol et
  - _Requirements: 1.1_

- [x] 7. Backend: Database query optimizasyonları
  - Conversation ve Message modellerinde index'lerin doğru olduğunu kontrol et
  - getConversationHistory metodunda sadece gerekli alanları çek (select kullan)
  - Context building sorgularını optimize et
  - _Requirements: 1.6_

- [x] 8. Mobile: SSE Client buffer yönetimini doğrulama
  - SSEClient'ın mevcut buffer mekanizmasını test et
  - Gerekirse buffer boyutunu ayarla (512 karakter)
  - Flush interval'i optimize et (50ms)
  - _Requirements: 1.6_

- [x] 9. Mobile: Chat Screen hata gösterimini iyileştirme
  - Backend'den gelen hata mesajlarını kullanıcıya göster
  - Network hatası durumunda retry önerisi ekle
  - Kota dolduğunda upgrade önerisi göster
  - _Requirements: 1.5, 1.8_

- [x] 10. Mobile: Quota display güncellemelerini doğrulama
  - Quota bilgisinin streaming sonrası otomatik yenilendiğini kontrol et
  - Header'daki quota göstergesinin doğru çalıştığını test et
  - _Requirements: 1.4, 1.8_

- [x] 11. Backend: Gemini API entegrasyonunu test etme
  - Basit test mesajı ile Gemini API bağlantısını doğrula
  - Streaming'in düzgün çalıştığını test et
  - Token sayımının doğru olduğunu kontrol et
  - _Requirements: 1.1, 1.10_

- [x] 12. Backend: Context building test senaryoları
  - Hamile kullanıcı için context oluşturmayı test et
  - Regl döngüsü olan kullanıcı için context oluşturmayı test et
  - Wellness verisi olan kullanıcı için context oluşturmayı test et
  - Hiç veri olmayan yeni kullanıcı için context oluşturmayı test et
  - _Requirements: 1.3, 1.10_

- [x] 13. End-to-end test: Tam chat akışı
  - Yeni conversation oluştur ve mesaj gönder
  - Streaming yanıtı al ve veritabanına kaydet
  - Quota'nın arttığını doğrula
  - Conversation history'nin doğru çalıştığını test et
  - _Requirements: 1.1, 1.2, 1.4, 1.9_

- [x] 14. End-to-end test: Hata senaryoları
  - Timeout senaryosunu simulate et
  - Rate limit senaryosunu test et
  - Network kesintisini test et
  - "Durdur" butonunun çalıştığını doğrula
  - _Requirements: 1.5, 1.8_

- [x] 15. End-to-end test: Forget conversation
  - "Sil" butonuna basıp conversation'ı sil
  - Tüm mesajların silindiğini doğrula
  - Yeni conversation ID'nin oluştuğunu kontrol et
  - _Requirements: 1.9_

- [x] 16. Mobile: iOS ve Android'de test
  - iOS'ta chat akışını test et
  - Android'de chat akışını test et
  - Klavye davranışını kontrol et (KeyboardAvoidingView)
  - Auto-scroll'un düzgün çalıştığını doğrula
  - _Requirements: 1.8_

- [x] 17. Documentation ve deployment hazırlığı
  - README'ye Gemini API key kurulum talimatları ekle
  - Environment variables dokümantasyonunu güncelle
  - Deployment checklist'i gözden geçir
  - _Requirements: 1.10_
