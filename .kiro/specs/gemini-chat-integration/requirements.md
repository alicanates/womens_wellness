# Requirements Document

## Introduction

Bu özellik, NOVA AI asistanının Google Gemini API ile tam entegrasyonunu sağlayarak kullanıcılara akıllı, bağlamsal ve kişiselleştirilmiş sağlık danışmanlığı sunmayı amaçlamaktadır. Mevcut chat arayüzü zaten oluşturulmuş durumda, ancak backend'de Gemini API bağlantısı, konuşma hafızası, kullanıcı bağlamı ve akış optimizasyonları tamamlanmalıdır.

Sistem, kullanıcının regl döngüsü, hamilelik durumu, su tüketimi, wellness verileri ve geçmiş sohbet geçmişini kullanarak kişiselleştirilmiş yanıtlar üretecektir. Ayrıca, kullanıcı kotası kontrolü, hata yönetimi ve performans optimizasyonları da dahil edilecektir.

## Requirements

### Requirement 1: Google Gemini API Entegrasyonu

**User Story:** As a user, I want to chat with NOVA AI assistant powered by Google Gemini, so that I can get intelligent health advice and support.

#### Acceptance Criteria

1. WHEN backend başlatıldığında THEN sistem Google Gemini API anahtarının varlığını kontrol etmeli ve eksikse hata vermeli
2. WHEN kullanıcı mesaj gönderdiğinde THEN sistem Gemini API'ye istek göndermeli ve streaming yanıt almalı
3. WHEN API yanıtı alındığında THEN yanıt token token olarak frontend'e stream edilmeli
4. IF API hatası oluşursa THEN kullanıcıya anlamlı hata mesajı gösterilmeli ve hata loglanmalı
5. WHEN streaming tamamlandığında THEN toplam token sayısı hesaplanmalı ve kaydedilmeli

### Requirement 2: Konuşma Hafızası ve Bağlam Yönetimi

**User Story:** As a user, I want NOVA to remember our conversation history, so that I can have contextual and continuous conversations.

#### Acceptance Criteria

1. WHEN kullanıcı mesaj gönderdiğinde THEN sistem son 10 mesajı conversation history olarak ChatGPT'ye göndermelidir
2. WHEN yeni konuşma başlatıldığında THEN sistem unique conversation ID oluşturmalı ve veritabanına kaydetmeli
3. WHEN kullanıcı "Sil" butonuna bastığında THEN tüm konuşma geçmişi ve hafıza silinmeli
4. IF konuşma 20 mesajı aşarsa THEN sistem en eski mesajları context'ten çıkarmalı ama veritabanında tutmalı
5. WHEN her mesaj kaydedildiğinde THEN mesaj role (user/assistant), content, timestamp ve token sayısı ile birlikte saklanmalı

### Requirement 3: Kişiselleştirilmiş Sistem Promptu

**User Story:** As a user, I want NOVA to know my health context (cycle, pregnancy, wellness data), so that I can receive personalized advice.

#### Acceptance Criteria

1. WHEN sistem promptu oluşturulduğunda THEN kullanıcının aktif regl döngüsü bilgisi dahil edilmeli
2. IF kullanıcı hamile ise THEN hamilelik haftası, due date ve özel notlar sistem promptuna eklenmelidir
3. WHEN kullanıcının bugünkü su tüketimi varsa THEN bu bilgi context'e dahil edilmeli
4. WHEN kullanıcının wellness verileri (steps, meditation, sleep) varsa THEN bu veriler özet olarak eklenmelidir
5. WHEN sistem promptu oluşturulduğunda THEN NOVA'nın kişiliği, görevleri ve sınırları açıkça tanımlanmalı
6. WHEN kullanıcı Türkçe konuşuyorsa THEN NOVA Türkçe yanıt vermeli, İngilizce konuşuyorsa İngilizce yanıt vermeli

### Requirement 4: Kullanıcı Kotası ve Rate Limiting

**User Story:** As a system administrator, I want to control API usage through quotas, so that I can manage costs and prevent abuse.

#### Acceptance Criteria

1. WHEN kullanıcı mesaj göndermeden önce THEN sistem kullanıcının kota durumunu kontrol etmeli
2. IF kullanıcı kotası dolmuşsa THEN mesaj gönderimi engellenmelidir ve kullanıcıya bilgi verilmelidir
3. WHEN streaming başarıyla tamamlandığında THEN kullanıcının kota sayacı 1 artırılmalı
4. WHEN kullanıcı quota durumunu sorguladığında THEN used/limit bilgisi döndürülmeli
5. IF kullanıcı premium aboneliğe sahipse THEN daha yüksek kota limiti uygulanmalı
6. WHEN kota sıfırlanma zamanı geldiğinde THEN sistem otomatik olarak kotaları sıfırlamalı (günlük/aylık)

### Requirement 5: Hata Yönetimi ve Dayanıklılık

**User Story:** As a user, I want the chat to handle errors gracefully, so that I have a smooth experience even when issues occur.

#### Acceptance Criteria

1. WHEN Gemini API timeout verirse THEN kullanıcıya "Yanıt alınamadı, lütfen tekrar deneyin" mesajı gösterilmeli
2. WHEN API rate limit hatası alınırsa THEN kullanıcıya "Sistem yoğun, lütfen birkaç saniye bekleyin" mesajı gösterilmeli
3. WHEN network hatası oluşursa THEN kullanıcıya bağlantı hatası bildirimi yapılmalı
4. IF streaming sırasında bağlantı koparsa THEN partial yanıt kaydedilmeli ve kullanıcıya gösterilmeli
5. WHEN kullanıcı "Durdur" butonuna basarsa THEN streaming anında kesilmeli ve partial yanıt kaydedilmeli
6. WHEN herhangi bir hata oluştuğunda THEN hata detayları backend loglarına kaydedilmeli

### Requirement 6: Performans ve Optimizasyon

**User Story:** As a user, I want fast and responsive chat experience, so that I can have natural conversations without delays.

#### Acceptance Criteria

1. WHEN mesaj gönderildiğinde THEN ilk token 2 saniye içinde kullanıcıya ulaşmalı
2. WHEN streaming devam ederken THEN tokenlar smooth bir şekilde akmalı (buffer yönetimi)
3. WHEN conversation history yüklendiğinde THEN sadece gerekli alanlar (id, role, content, timestamp) çekilmeli
4. IF kullanıcı hızlı mesaj gönderirse THEN sistem concurrent request'leri handle edebilmeli
5. WHEN veritabanı sorguları yapılırken THEN index'ler kullanılarak performans optimize edilmeli

### Requirement 7: Güvenlik ve Gizlilik

**User Story:** As a user, I want my conversations to be private and secure, so that my personal health information is protected.

#### Acceptance Criteria

1. WHEN kullanıcı chat'e eriştiğinde THEN JWT authentication zorunlu olmalı
2. WHEN conversation sorgulanırken THEN sadece kullanıcının kendi konuşmaları erişilebilir olmalı
3. WHEN Gemini API'ye istek gönderildiğinde THEN kullanıcının kişisel bilgileri (email, tam ad) gönderilmemeli
4. IF kullanıcı hesabını silerse THEN tüm chat geçmişi ve hafızası da silinmeli
5. WHEN API anahtarları kullanılırken THEN environment variables'dan okunmalı ve asla loglanmamalı

### Requirement 8: Mobil Arayüz İyileştirmeleri

**User Story:** As a mobile user, I want smooth chat interface with proper keyboard handling, so that I can easily type and read messages.

#### Acceptance Criteria

1. WHEN klavye açıldığında THEN chat listesi otomatik olarak en alta scroll etmeli
2. WHEN yeni mesaj geldiğinde THEN liste smooth bir şekilde en alta kaymalı
3. WHEN kullanıcı mesaj yazarken THEN input alanı multi-line olmalı ve 100 karakter sonra scroll etmeli
4. IF mesaj çok uzunsa THEN kullanıcıya karakter limiti (500) gösterilmeli
5. WHEN streaming devam ederken THEN "Durdur" butonu görünür ve erişilebilir olmalı
6. WHEN quota bilgisi güncellendiğinde THEN header'daki quota göstergesi otomatik yenilenmeli

### Requirement 9: Konuşma Geçmişi Yönetimi

**User Story:** As a user, I want to view my past conversations and manage them, so that I can review previous advice and clean up old chats.

#### Acceptance Criteria

1. WHEN kullanıcı chat ekranına girdiğinde THEN mevcut conversation ID ile devam etmeli veya yeni oluşturmalı
2. WHEN kullanıcı "Sil" butonuna basıp onayladığında THEN conversation ve tüm mesajları silinmeli
3. WHEN konuşma silindikten sonra THEN yeni conversation ID oluşturulmalı
4. IF gelecekte multiple conversation desteği eklenirse THEN conversation listesi gösterilebilmeli
5. WHEN conversation arşivlendiğinde THEN soft delete yapılmalı (archivedAt timestamp)

### Requirement 10: Test ve Monitoring

**User Story:** As a developer, I want comprehensive testing and monitoring, so that I can ensure system reliability and quickly identify issues.

#### Acceptance Criteria

1. WHEN API entegrasyonu tamamlandığında THEN Gemini API bağlantısı test edilmeli
2. WHEN streaming implementasyonu yapıldığında THEN SSE connection'ın düzgün çalıştığı doğrulanmalı
3. WHEN hata senaryoları test edildiğinde THEN timeout, rate limit ve network hataları simulate edilmeli
4. IF production'da hata oluşursa THEN error tracking sistemi (örn: Sentry) ile loglanmalı
5. WHEN API kullanımı izlendiğinde THEN günlük token kullanımı ve maliyet raporlanmalı
