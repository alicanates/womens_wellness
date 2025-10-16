# Requirements Document

## Introduction

Bu özellik, kullanıcılara premium abonelik sistemi sunarak gelişmiş AI özellikleri, sınırsız mesajlaşma, öncelikli destek ve kişiselleştirilmiş içgörüler gibi premium hizmetlere erişim sağlar. Sistem, kullanıcıların ücretsiz ve premium planlar arasında geçiş yapmasına, aboneliklerini yönetmesine ve premium özelliklerin kontrolüne olanak tanır.

## Glossary

- **Premium Subscription**: Kullanıcının ücretli premium plana sahip olduğu abonelik durumu
- **Free Plan**: Temel özelliklere erişim sağlayan ücretsiz plan
- **Premium Plan**: Gelişmiş özelliklere erişim sağlayan ücretli plan
- **Subscription Status**: Kullanıcının mevcut abonelik durumu (active, expired, cancelled, trial)
- **AI Message Quota**: Kullanıcının aylık AI mesaj kullanım limiti
- **In-App Purchase (IAP)**: Mobil uygulama içi satın alma sistemi
- **Subscription Management**: Abonelik yönetim sayfası ve işlemleri
- **Premium Badge**: Premium kullanıcıları gösteren görsel işaret
- **Upgrade Prompt**: Kullanıcıyı premium'a yükseltmeye teşvik eden bildirim
- **Trial Period**: Kullanıcının premium özellikleri ücretsiz deneme süresi
- **Subscription Tier**: Abonelik seviyesi (monthly, yearly)
- **Payment Provider**: Ödeme sağlayıcı (Apple App Store, Google Play Store)
- **Receipt Validation**: Satın alma makbuzunun doğrulanması
- **Auto-Renewal**: Aboneliğin otomatik yenilenmesi
- **Grace Period**: Ödeme başarısız olduğunda verilen ek süre

## Requirements

### Requirement 1

**User Story:** Kullanıcı olarak, premium ve ücretsiz plan arasındaki farkları görmek istiyorum, böylece hangi planın bana uygun olduğuna karar verebilirim.

#### Acceptance Criteria

1. THE Premium Page SHALL ücretsiz plan özelliklerini listeler
2. THE Premium Page SHALL premium plan özelliklerini listeler
3. THE Premium Page SHALL her iki planın fiyatlandırmasını gösterir
4. THE Premium Page SHALL aylık ve yıllık fiyatlandırma seçeneklerini gösterir
5. WHERE yıllık plan seçiliyse, THE Premium Page SHALL tasarruf yüzdesini gösterir
6. THE Premium Page SHALL AI mesaj limitlerini karşılaştırır
7. THE Premium Page SHALL her özellik için açıklayıcı ikonlar gösterir

### Requirement 2

**User Story:** Kullanıcı olarak, premium plana kolayca abone olmak istiyorum, böylece gelişmiş özelliklere hızlıca erişebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı premium satın alma butonuna tıkladığında, THE System SHALL ödeme modalını açar
2. THE ödeme modalı SHALL seçilen plan bilgilerini gösterir
3. THE ödeme modalı SHALL toplam tutarı gösterir
4. WHEN kullanıcı satın almayı onayladığında, THE System SHALL platform IAP sistemini başlatır
5. WHEN satın alma başarılı olduğunda, THE System SHALL makbuzu backend'e gönderir
6. WHEN makbuz doğrulandığında, THE System SHALL kullanıcının abonelik durumunu günceller
7. WHEN satın alma tamamlandığında, THE System SHALL başarı ekranını gösterir
8. IF satın alma başarısız olursa, THE System SHALL hata mesajı gösterir

### Requirement 3

**User Story:** Kullanıcı olarak, mevcut abonelik durumumu görmek istiyorum, böylece planımı ve yenileme tarihimi takip edebilirim.

#### Acceptance Criteria

1. THE Settings Page SHALL kullanıcının mevcut plan durumunu gösterir
2. WHERE kullanıcı premium aboneyse, THE Settings Page SHALL yenileme tarihini gösterir
3. WHERE kullanıcı premium aboneyse, THE Settings Page SHALL abonelik başlangıç tarihini gösterir
4. WHERE kullanıcı premium aboneyse, THE Settings Page SHALL aylık/yıllık plan bilgisini gösterir
5. THE Settings Page SHALL kalan AI mesaj kotasını gösterir
6. WHERE kullanıcı ücretsiz plandaysa, THE Settings Page SHALL "Premium'a Geç" butonunu gösterir
7. WHERE kullanıcı premium aboneyse, THE Settings Page SHALL "Aboneliği Yönet" butonunu gösterir

### Requirement 4

**User Story:** Kullanıcı olarak, aboneliğimi yönetmek istiyorum, böylece planımı iptal edebilir veya değiştirebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı "Aboneliği Yönet" butonuna tıkladığında, THE System SHALL platform abonelik yönetim sayfasını açar
2. THE System SHALL kullanıcıyı App Store veya Google Play abonelik ayarlarına yönlendirir
3. THE System SHALL abonelik iptal talimatlarını gösterir
4. WHEN kullanıcı aboneliği iptal ettiğinde, THE System SHALL iptal bilgisini webhook ile alır
5. WHEN abonelik iptal edildiğinde, THE System SHALL kullanıcının premium erişimini süre sonuna kadar korur
6. WHEN abonelik süresi dolduğunda, THE System SHALL kullanıcıyı ücretsiz plana geçirir

### Requirement 5

**User Story:** Kullanıcı olarak, premium özelliklere erişmeye çalıştığımda planımın yeterli olup olmadığını bilmek istiyorum, böylece gerekirse yükseltme yapabilirim.

#### Acceptance Criteria

1. WHEN ücretsiz kullanıcı premium özelliğe erişmeye çalıştığında, THE System SHALL yükseltme prompt'unu gösterir
2. THE yükseltme prompt'u SHALL özelliğin premium olduğunu açıklar
3. THE yükseltme prompt'u SHALL premium planın faydalarını listeler
4. THE yükseltme prompt'u SHALL "Premium'a Geç" butonunu içerir
5. WHEN kullanıcı "Premium'a Geç" butonuna tıkladığında, THE System SHALL premium sayfasına yönlendirir
6. THE System SHALL kullanıcının iptal etme seçeneğini sunar

### Requirement 6

**User Story:** Kullanıcı olarak, AI mesaj limitimi görmek istiyorum, böylece ne kadar kota kaldığını bilebilirim.

#### Acceptance Criteria

1. THE Chat Screen SHALL kullanıcının kalan AI mesaj kotasını gösterir
2. WHEN kullanıcı mesaj gönderdiğinde, THE System SHALL kota sayacını günceller
3. WHEN kota %20'nin altına düştüğünde, THE System SHALL uyarı mesajı gösterir
4. WHEN kota tükendiğinde, THE System SHALL mesaj göndermeyi engeller
5. WHEN kota tükendiğinde, THE System SHALL premium'a yükseltme önerisi gösterir
6. THE System SHALL kotayı her ay başında sıfırlar
7. WHERE kullanıcı premium aboneyse, THE System SHALL daha yüksek kota gösterir

### Requirement 7

**User Story:** Kullanıcı olarak, premium kullanıcı olduğumu görmek istiyorum, böylece özel statümü fark edebilirim.

#### Acceptance Criteria

1. WHERE kullanıcı premium aboneyse, THE System SHALL profil resminin yanında premium badge gösterir
2. WHERE kullanıcı premium aboneyse, THE Settings Page SHALL premium badge gösterir
3. THE premium badge SHALL görsel olarak ayırt edici olur
4. THE premium badge SHALL "Premium" yazısı içerir
5. WHERE kullanıcı ücretsiz plandaysa, THE System SHALL badge göstermez

### Requirement 8

**User Story:** Kullanıcı olarak, premium özelliklerin neler olduğunu görmek istiyorum, böylece yükseltme kararımı bilinçli verebilirim.

#### Acceptance Criteria

1. THE Premium Page SHALL gelişmiş AI modelini açıklar
2. THE Premium Page SHALL artan mesaj limitini vurgular
3. THE Premium Page SHALL öncelikli yanıt hızını açıklar
4. THE Premium Page SHALL kişiselleştirilmiş içgörüleri açıklar
5. THE Premium Page SHALL gelişmiş analitikleri açıklar
6. THE Premium Page SHALL özel özellikleri listeler
7. THE Premium Page SHALL her özellik için örnek kullanım senaryoları gösterir

### Requirement 9

**User Story:** Sistem yöneticisi olarak, abonelik verilerini yönetebilmek istiyorum, böylece kullanıcı aboneliklerini takip edebilirim.

#### Acceptance Criteria

1. THE System SHALL her kullanıcı için abonelik durumunu veritabanında saklar
2. THE System SHALL abonelik başlangıç tarihini saklar
3. THE System SHALL abonelik bitiş tarihini saklar
4. THE System SHALL abonelik planını (monthly/yearly) saklar
5. THE System SHALL ödeme sağlayıcısını (apple/google) saklar
6. THE System SHALL orijinal işlem ID'sini saklar
7. THE System SHALL abonelik geçmişini saklar
8. THE System SHALL iptal tarihini saklar (eğer iptal edildiyse)

### Requirement 10

**User Story:** Kullanıcı olarak, satın alma işlemimin güvenli olduğunu bilmek istiyorum, böylece güvenle ödeme yapabilirim.

#### Acceptance Criteria

1. THE System SHALL tüm ödemeleri platform IAP sistemi üzerinden işler
2. THE System SHALL makbuz doğrulamasını backend'de yapar
3. THE System SHALL geçersiz makbuzları reddeder
4. THE System SHALL her işlem için benzersiz ID oluşturur
5. THE System SHALL işlem geçmişini güvenli şekilde saklar
6. THE System SHALL kullanıcı ödeme bilgilerini saklamaz
7. THE System SHALL HTTPS üzerinden tüm iletişimi yapar

### Requirement 11

**User Story:** Kullanıcı olarak, premium'u denemek istiyorum, böylece satın almadan önce özellikleri test edebilirim.

#### Acceptance Criteria

1. WHERE kullanıcı ilk kez premium'a abone oluyorsa, THE System SHALL deneme süresi sunar
2. THE System SHALL deneme süresinin kaç gün olduğunu gösterir
3. WHEN deneme süresi başladığında, THE System SHALL tüm premium özelliklere erişim verir
4. THE System SHALL deneme süresinin ne zaman biteceğini gösterir
5. WHEN deneme süresi %50'ye ulaştığında, THE System SHALL hatırlatma bildirimi gönderir
6. WHEN deneme süresi bittiğinde, THE System SHALL kullanıcıyı ücretsiz plana geçirir
7. WHERE kullanıcı deneme sırasında iptal ederse, THE System SHALL ücret almaz

### Requirement 12

**User Story:** Kullanıcı olarak, abonelik durumumda değişiklik olduğunda bilgilendirilmek istiyorum, böylece durumumu takip edebilirim.

#### Acceptance Criteria

1. WHEN abonelik başarıyla başladığında, THE System SHALL onay bildirimi gönderir
2. WHEN abonelik yenilendiğinde, THE System SHALL bilgilendirme bildirimi gönderir
3. WHEN abonelik iptal edildiğinde, THE System SHALL onay bildirimi gönderir
4. WHEN abonelik süresi dolmak üzereyken (3 gün kala), THE System SHALL hatırlatma bildirimi gönderir
5. WHEN ödeme başarısız olduğunda, THE System SHALL hata bildirimi gönderir
6. WHEN abonelik süresi dolduğunda, THE System SHALL bilgilendirme bildirimi gönderir

### Requirement 13

**User Story:** Kullanıcı olarak, premium özelliklerin gerçek zamanlı olarak aktif olmasını istiyorum, böylece satın alma sonrası hemen kullanabilirim.

#### Acceptance Criteria

1. WHEN satın alma tamamlandığında, THE System SHALL kullanıcı oturumunu günceller
2. THE System SHALL premium durumunu tüm ekranlarda anında yansıtır
3. THE System SHALL AI mesaj kotasını anında günceller
4. THE System SHALL premium badge'i anında gösterir
5. THE System SHALL premium özelliklere anında erişim verir
6. THE System SHALL cache'i temizleyerek güncel veriyi çeker

### Requirement 14

**User Story:** Kullanıcı olarak, farklı cihazlarda aynı premium aboneliğe sahip olmak istiyorum, böylece tüm cihazlarımda premium özelliklerden yararlanabilirim.

#### Acceptance Criteria

1. THE System SHALL abonelik durumunu sunucuda saklar
2. WHEN kullanıcı farklı cihazda oturum açtığında, THE System SHALL abonelik durumunu senkronize eder
3. THE System SHALL aynı platform (iOS/Android) içinde abonelik paylaşımını destekler
4. THE System SHALL kullanıcının tüm cihazlarında premium erişimi sağlar
5. WHEN abonelik durumu değiştiğinde, THE System SHALL tüm cihazları günceller

### Requirement 15

**User Story:** Kullanıcı olarak, premium planlar arasında geçiş yapabilmek istiyorum, böylece ihtiyacıma göre planımı değiştirebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı aylık plandan yıllık plana geçmek istediğinde, THE System SHALL geçiş seçeneği sunar
2. THE System SHALL mevcut aboneliğin kalan değerini hesaplar
3. THE System SHALL yeni plan fiyatından kalan değeri düşer
4. WHEN plan değişikliği onaylandığında, THE System SHALL yeni planı aktive eder
5. THE System SHALL plan değişikliğini işlem geçmişine kaydeder
6. THE System SHALL kullanıcıya plan değişikliği onayı gönderir

### Requirement 16

**User Story:** Kullanıcı olarak, ödeme sorunları yaşadığımda bilgilendirilmek istiyorum, böylece aboneliğimi kaybetmeden düzeltebilirim.

#### Acceptance Criteria

1. WHEN otomatik yenileme başarısız olduğunda, THE System SHALL kullanıcıya bildirim gönderir
2. THE System SHALL ödeme yöntemini güncelleme talimatları gösterir
3. THE System SHALL grace period (ek süre) sağlar
4. WHILE grace period aktifken, THE System SHALL premium erişimi korur
5. THE System SHALL grace period süresini gösterir
6. WHEN grace period bittiğinde, THE System SHALL kullanıcıyı ücretsiz plana geçirir
7. WHEN ödeme sorunu çözüldüğünde, THE System SHALL aboneliği yeniden aktive eder

### Requirement 17

**User Story:** Kullanıcı olarak, premium özelliklerin performansının daha iyi olmasını istiyorum, böylece ödediğim paranın karşılığını alabilirim.

#### Acceptance Criteria

1. WHERE kullanıcı premium aboneyse, THE AI Service SHALL gelişmiş model kullanır
2. WHERE kullanıcı premium aboneyse, THE AI Service SHALL öncelikli kuyruk kullanır
3. WHERE kullanıcı premium aboneyse, THE System SHALL daha hızlı yanıt süresi sağlar
4. WHERE kullanıcı premium aboneyse, THE System SHALL gelişmiş hafıza kullanır
5. WHERE kullanıcı premium aboneyse, THE System SHALL daha detaylı analizler sunar

### Requirement 18

**User Story:** Kullanıcı olarak, fatura ve ödeme geçmişimi görmek istiyorum, böylece harcamalarımı takip edebilirim.

#### Acceptance Criteria

1. THE Settings Page SHALL "Ödeme Geçmişi" bölümünü içerir
2. THE ödeme geçmişi SHALL tüm işlemleri tarih sırasıyla listeler
3. THE her işlem SHALL tarih, tutar ve plan bilgisini gösterir
4. THE her işlem SHALL işlem durumunu (başarılı/başarısız) gösterir
5. THE System SHALL kullanıcının platform fatura sayfasına yönlendirme sunar
6. THE System SHALL son 12 aylık işlem geçmişini gösterir

### Requirement 19

**User Story:** Kullanıcı olarak, premium özellikler hakkında yardım almak istiyorum, böylece tüm avantajlardan yararlanabilirim.

#### Acceptance Criteria

1. THE Premium Page SHALL "Sıkça Sorulan Sorular" bölümünü içerir
2. THE SSS bölümü SHALL premium özellikleri açıklar
3. THE SSS bölümü SHALL iptal ve iade politikasını açıklar
4. THE SSS bölümü SHALL fiyatlandırma sorularını yanıtlar
5. THE Premium Page SHALL destek iletişim bilgilerini gösterir
6. THE System SHALL premium kullanıcılara öncelikli destek sunar

### Requirement 20

**User Story:** Kullanıcı olarak, premium aboneliğimin değerini görmek istiyorum, böylece yatırımımın karşılığını aldığımı bilebilirim.

#### Acceptance Criteria

1. THE Premium Page SHALL kullanılan premium özelliklerin istatistiklerini gösterir
2. THE istatistikler SHALL toplam AI mesaj sayısını gösterir
3. THE istatistikler SHALL tasarruf edilen süreyi gösterir
4. THE istatistikler SHALL kullanılan gelişmiş özellikleri listeler
5. THE System SHALL aylık kullanım özetini gösterir
6. THE System SHALL premium'dan elde edilen faydaları vurgular
