# Requirements Document

## Introduction

Bu özellik, anasayfadaki "Keşfet" bölümünü geliştirerek kullanıcılara kişiselleştirilmiş eğitim içerikleri, sağlık makaleleri ve rehberler sunmayı amaçlar. Kullanıcılar, döngü durumlarına, hamilelik moduna ve ilgi alanlarına göre özelleştirilmiş içerikler keşfedebilecek, makaleleri kaydedebilecek ve detaylı olarak okuyabilecekler.

## Glossary

- **Discover Section**: Anasayfada bulunan ve eğitim içeriklerinin gösterildiği bölüm
- **Educational Article**: Kullanıcılara sağlık, wellness ve kadın sağlığı konularında bilgi veren makale
- **Content Card**: Bir makaleyi temsil eden görsel kart bileşeni
- **Saved Articles**: Kullanıcının daha sonra okumak üzere kaydettiği makaleler
- **Article Category**: Makalelerin gruplandırıldığı kategori (regl sağlığı, hamilelik, beslenme vb.)
- **Personalized Content**: Kullanıcının durumuna göre özelleştirilmiş içerik önerileri
- **Reading History**: Kullanıcının daha önce okuduğu makalelerin geçmişi
- **Content Recommendation Engine**: Kullanıcıya uygun içerikleri öneren sistem

## Requirements

### Requirement 1

**User Story:** Kullanıcı olarak, anasayfada bana özel içerikler görmek istiyorum, böylece ilgimi çeken sağlık bilgilerine hızlıca ulaşabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı anasayfayı açtığında, THE Discover Section SHALL kullanıcının döngü durumuna göre ilgili makaleleri gösterir
2. WHEN kullanıcı hamilelik modundayken, THE Discover Section SHALL hamilelik ile ilgili içerikleri önceliklendirir
3. WHEN kullanıcının kaydedilmiş tercihleri varsa, THE Discover Section SHALL bu tercihlere göre içerik önerir
4. THE Discover Section SHALL en fazla 5 makale kartı gösterir
5. WHEN hiç içerik yoksa, THE Discover Section SHALL uygun bir boş durum mesajı gösterir

### Requirement 2

**User Story:** Kullanıcı olarak, makale kartlarında görsel ve özet bilgi görmek istiyorum, böylece hangi içeriği okumak istediğime karar verebilirim.

#### Acceptance Criteria

1. THE Content Card SHALL makale başlığını gösterir
2. THE Content Card SHALL makale kategorisini gösterir
3. THE Content Card SHALL makale özetini (maksimum 2 satır) gösterir
4. WHERE makale görseli mevcutsa, THE Content Card SHALL görseli gösterir
5. THE Content Card SHALL tahmini okuma süresini gösterir
6. THE Content Card SHALL kaydetme butonunu gösterir

### Requirement 3

**User Story:** Kullanıcı olarak, bir makaleye tıklayarak detaylı içeriği okumak istiyorum, böylece konuyu tam olarak öğrenebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı bir Content Card'a tıkladığında, THE System SHALL makale detay sayfasını açar
2. THE makale detay sayfası SHALL tam makale içeriğini gösterir
3. THE makale detay sayfası SHALL yayın tarihini gösterir
4. THE makale detay sayfası SHALL kategori ve etiketleri gösterir
5. THE makale detay sayfası SHALL kaydetme ve paylaşma butonlarını içerir
6. WHEN kullanıcı makaleyi okumaya başladığında, THE System SHALL okuma geçmişine kaydeder

### Requirement 4

**User Story:** Kullanıcı olarak, beğendiğim makaleleri kaydetmek istiyorum, böylece daha sonra kolayca erişebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı kaydetme butonuna tıkladığında, THE System SHALL makaleyi kaydedilenlere ekler
2. WHEN makale zaten kaydedilmişse, THE System SHALL kaydetme butonunu dolu simge ile gösterir
3. WHEN kullanıcı kaydedilmiş bir makalenin kaydetme butonuna tıkladığında, THE System SHALL makaleyi kaydedilenlerden çıkarır
4. THE System SHALL kullanıcıya başarılı kaydetme bildirimi gösterir
5. THE System SHALL kaydedilen makaleleri kullanıcı veritabanında saklar

### Requirement 5

**User Story:** Kullanıcı olarak, tüm içerikleri görmek ve kategorilere göre filtrelemek istiyorum, böylece ilgilendiğim konuları keşfedebilirim.

#### Acceptance Criteria

1. WHEN kullanıcı "Tümünü Gör" butonuna tıkladığında, THE System SHALL keşfet sayfasını açar
2. THE keşfet sayfası SHALL tüm mevcut makaleleri listeler
3. THE keşfet sayfası SHALL kategori filtrelerini gösterir
4. WHEN kullanıcı bir kategori seçtiğinde, THE System SHALL sadece o kategorideki makaleleri gösterir
5. THE keşfet sayfası SHALL arama fonksiyonunu içerir
6. THE keşfet sayfası SHALL "Kaydedilenler" sekmesini içerir

### Requirement 6

**User Story:** Kullanıcı olarak, kaydedilmiş makalelerimi görmek istiyorum, böylece daha sonra okumak istediklerimi bulabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı "Kaydedilenler" sekmesine tıkladığında, THE System SHALL kaydedilmiş makaleleri gösterir
2. WHEN hiç kaydedilmiş makale yoksa, THE System SHALL uygun bir boş durum mesajı gösterir
3. THE System SHALL kaydedilmiş makaleleri kaydetme tarihine göre sıralar
4. THE kaydedilenler listesi SHALL her makale için kaydetme tarihini gösterir

### Requirement 7

**User Story:** Kullanıcı olarak, makalelerde arama yapabilmek istiyorum, böylece spesifik konuları hızlıca bulabilirim.

#### Acceptance Criteria

1. THE keşfet sayfası SHALL arama çubuğunu gösterir
2. WHEN kullanıcı arama çubuğuna metin girdiğinde, THE System SHALL başlık ve içerikte arama yapar
3. THE System SHALL arama sonuçlarını anlık olarak gösterir
4. WHEN arama sonucu bulunamazsa, THE System SHALL uygun bir mesaj gösterir
5. THE System SHALL arama geçmişini saklar

### Requirement 8

**User Story:** Sistem yöneticisi olarak, makaleleri yönetebilmek istiyorum, böylece kullanıcılara güncel ve kaliteli içerik sunabilirim.

#### Acceptance Criteria

1. THE System SHALL makaleleri veritabanında saklar
2. THE System SHALL her makale için başlık (TR ve EN) saklar
3. THE System SHALL her makale için içerik (TR ve EN) saklar
4. THE System SHALL her makale için kategori, etiketler, görsel URL ve öncelik saklar
5. THE System SHALL makalelerin aktif/pasif durumunu yönetir
6. THE System SHALL makalelerin son kullanma tarihini destekler

### Requirement 9

**User Story:** Kullanıcı olarak, içeriklerin bana özel olmasını istiyorum, böylece daha alakalı bilgiler alabilirim.

#### Acceptance Criteria

1. WHEN kullanıcı döngüsünün belirli bir aşamasındaysa, THE Content Recommendation Engine SHALL o aşamaya uygun içerikleri önceliklendirir
2. WHEN kullanıcı hamilelik modundaysa, THE Content Recommendation Engine SHALL hamilelik haftasına göre içerik önerir
3. WHEN kullanıcı daha önce belirli kategorilerdeki makaleleri okumuşsa, THE Content Recommendation Engine SHALL benzer içerikleri önerir
4. THE Content Recommendation Engine SHALL kullanıcının okuma geçmişini dikkate alır
5. THE Content Recommendation Engine SHALL mevsimsel içerikleri uygun zamanlarda önerir

### Requirement 10

**User Story:** Kullanıcı olarak, makaleleri paylaşabilmek istiyorum, böylece yararlı bilgileri arkadaşlarımla paylaşabilirim.

#### Acceptance Criteria

1. THE makale detay sayfası SHALL paylaşma butonunu gösterir
2. WHEN kullanıcı paylaşma butonuna tıkladığında, THE System SHALL paylaşım seçeneklerini gösterir
3. THE System SHALL makale linkini kopyalama seçeneği sunar
4. THE System SHALL native paylaşım menüsünü açar
5. WHEN paylaşım başarılı olduğunda, THE System SHALL kullanıcıya onay mesajı gösterir
