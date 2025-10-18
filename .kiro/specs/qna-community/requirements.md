# Requirements Document

## Introduction

Bu doküman, kullanıcıların kadın sağlığı, hamilelik, adet döngüsü ve genel wellness konularında soru sorabileceği, diğer kullanıcıların cevap verebileceği ve topluluk odaklı bir bilgi paylaşım platformunun gereksinimlerini tanımlar. Platform, kullanıcıların anonim olarak soru sorabilmesini, en iyi cevapları seçebilmesini ve kaliteli içeriği ön plana çıkarabilmesini sağlar.

## Glossary

- **QnA System**: Soru-cevap platformu sistemi
- **Question Author**: Soru soran kullanıcı
- **Answer Provider**: Cevap veren kullanıcı
- **Anonymous Mode**: Kullanıcının kimliğinin gizli tutulduğu mod
- **Best Answer**: Soru sahibi tarafından en iyi olarak işaretlenen cevap
- **Vote System**: Cevapların kalitesini değerlendirmek için kullanılan oylama mekanizması
- **Question Status**: Sorunun durumu (açık, cevaplanmış, kapalı)
- **Content Moderation**: İçerik denetleme ve filtreleme sistemi
- **User Reputation**: Kullanıcının platform içindeki güvenilirlik puanı

## Requirements

### Requirement 1

**User Story:** Kullanıcı olarak, kadın sağlığı konularında soru sorabileceğim bir platform istiyorum, böylece topluluktan bilgi ve destek alabilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı soru oluşturma formunu açtığında, THE QnA System SHALL başlık, açıklama, kategori ve etiket alanlarını gösterir
2. WHEN bir kullanıcı geçerli bir soru gönderdiğinde, THE QnA System SHALL soruyu veritabanına kaydeder ve benzersiz bir kimlik atar
3. WHEN bir soru başarıyla oluşturulduğunda, THE QnA System SHALL kullanıcıyı soru detay sayfasına yönlendirir
4. THE QnA System SHALL her sorunun oluşturulma zamanını, güncellenme zamanını ve görüntülenme sayısını kaydeder
5. WHEN bir kullanıcı soru başlığı veya açıklaması boş bıraktığında, THE QnA System SHALL hata mesajı gösterir ve gönderimi engeller

### Requirement 2

**User Story:** Kullanıcı olarak, sorularımı anonim olarak sorabileceğim bir seçenek istiyorum, böylece mahrem konularda rahatça soru sorabilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı soru oluşturma formunu açtığında, THE QnA System SHALL "anonim olarak sor" seçeneğini gösterir
2. WHEN bir kullanıcı anonim modu etkinleştirdiğinde, THE QnA System SHALL kullanıcı adı yerine "Anonim Kullanıcı" etiketini gösterir
3. THE QnA System SHALL anonim soruların gerçek yazarını yalnızca veritabanında saklar ve diğer kullanıcılara göstermez
4. WHEN bir kullanıcı kendi anonim sorusunu görüntülediğinde, THE QnA System SHALL sorunun kendisine ait olduğunu belirten bir gösterge sunar
5. THE QnA System SHALL anonim kullanıcıların profil resimlerini genel bir avatar ile değiştirir

### Requirement 3

**User Story:** Kullanıcı olarak, diğer kullanıcıların sorularına cevap verebilmek istiyorum, böylece bilgimi paylaşabilir ve topluluğa katkıda bulunabilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı bir soru detay sayfasını açtığında, THE QnA System SHALL cevap yazma alanını gösterir
2. WHEN bir kullanıcı geçerli bir cevap gönderdiğinde, THE QnA System SHALL cevabı soruya bağlı olarak kaydeder
3. THE QnA System SHALL her cevabın oluşturulma zamanını ve güncellenme zamanını kaydeder
4. WHEN bir cevap başarıyla gönderildiğinde, THE QnA System SHALL cevabı soru detay sayfasında gösterir
5. THE QnA System SHALL kullanıcıların kendi cevaplarını düzenlemesine ve silmesine izin verir

### Requirement 4

**User Story:** Soru sahibi olarak, soruma gelen cevaplar arasından en iyi cevabı seçebilmek istiyorum, böylece en yararlı bilgiyi ön plana çıkarabilirim.

#### Acceptance Criteria

1. WHEN soru sahibi kendi sorusunun cevaplarını görüntülediğinde, THE QnA System SHALL her cevabın yanında "en iyi cevap olarak işaretle" butonunu gösterir
2. WHEN soru sahibi bir cevabı en iyi cevap olarak işaretlediğinde, THE QnA System SHALL cevabı "en iyi cevap" olarak veritabanına kaydeder
3. WHEN bir soru en iyi cevaba sahip olduğunda, THE QnA System SHALL en iyi cevabı diğer cevapların üstünde özel bir gösterge ile gösterir
4. THE QnA System SHALL bir soru için yalnızca bir en iyi cevap seçilmesine izin verir
5. WHEN soru sahibi en iyi cevabı değiştirmek istediğinde, THE QnA System SHALL önceki en iyi cevap işaretini kaldırır ve yeni cevabı işaretler

### Requirement 5

**User Story:** Kullanıcı olarak, cevapları oylamak istiyorum, böylece kaliteli içeriğin daha görünür olmasına yardımcı olabilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı bir cevabı görüntülediğinde, THE QnA System SHALL yukarı oy ve aşağı oy butonlarını gösterir
2. WHEN bir kullanıcı bir cevaba oy verdiğinde, THE QnA System SHALL oyunu kaydeder ve cevabın toplam oy sayısını günceller
3. THE QnA System SHALL bir kullanıcının aynı cevaba birden fazla oy vermesini engeller
4. WHEN bir kullanıcı daha önce verdiği oyunu değiştirmek istediğinde, THE QnA System SHALL önceki oyunu kaldırır ve yeni oyunu kaydeder
5. THE QnA System SHALL cevapları varsayılan olarak oy sayısına göre sıralar (en iyi cevap hariç)

### Requirement 6

**User Story:** Kullanıcı olarak, soruları kategorilere ve etiketlere göre filtreleyebilmek istiyorum, böylece ilgilendiğim konulardaki soruları kolayca bulabilirim.

#### Acceptance Criteria

1. THE QnA System SHALL soruları önceden tanımlanmış kategorilere (adet döngüsü, hamilelik, wellness, genel sağlık) ayırır
2. WHEN bir kullanıcı kategori filtresi seçtiğinde, THE QnA System SHALL yalnızca seçilen kategorideki soruları gösterir
3. WHEN bir kullanıcı etiket filtresi seçtiğinde, THE QnA System SHALL seçilen etikete sahip soruları gösterir
4. THE QnA System SHALL kullanıcıların soru oluştururken en fazla beş etiket eklemesine izin verir
5. WHEN bir kullanıcı arama çubuğuna metin girdiğinde, THE QnA System SHALL soru başlıklarında ve açıklamalarında arama yapar

### Requirement 7

**User Story:** Kullanıcı olarak, sorularımın ve cevaplarımın durumunu takip edebilmek istiyorum, böylece hangi sorularıma cevap geldiğini görebilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı profil sayfasını açtığında, THE QnA System SHALL kullanıcının sorduğu soruları ve verdiği cevapları ayrı sekmelerde gösterir
2. WHEN bir kullanıcının sorusuna yeni cevap geldiğinde, THE QnA System SHALL kullanıcıya bildirim gönderir
3. WHEN bir kullanıcının cevabı en iyi cevap olarak seçildiğinde, THE QnA System SHALL kullanıcıya bildirim gönderir
4. THE QnA System SHALL her sorunun durumunu (açık, cevaplanmış, kapalı) gösterir
5. WHEN bir soru en iyi cevaba sahip olduğunda, THE QnA System SHALL sorunun durumunu "cevaplanmış" olarak günceller

### Requirement 8

**User Story:** Platform yöneticisi olarak, uygunsuz içerikleri moderasyon yapabilmek istiyorum, böylece platformun güvenli ve saygılı kalmasını sağlayabilirim.

#### Acceptance Criteria

1. THE QnA System SHALL kullanıcıların soruları ve cevapları raporlama özelliği sunar
2. WHEN bir kullanıcı bir içeriği raporladığında, THE QnA System SHALL raporu moderasyon kuyruğuna ekler
3. WHEN bir yönetici bir içeriği sildiğinde, THE QnA System SHALL içeriği veritabanından kaldırır veya gizler
4. THE QnA System SHALL spam ve uygunsuz içerik için temel otomatik filtreleme uygular
5. WHEN bir kullanıcının içeriği birden fazla kez raporlandığında, THE QnA System SHALL içeriği otomatik olarak gizler ve moderasyon için işaretler

### Requirement 9

**User Story:** Kullanıcı olarak, iyi katkılarda bulunduğumda itibar kazanmak istiyorum, böylece topluluk içinde güvenilirliğim artabilir.

#### Acceptance Criteria

1. THE QnA System SHALL her kullanıcı için bir itibar puanı hesaplar
2. WHEN bir kullanıcının cevabı en iyi cevap seçildiğinde, THE QnA System SHALL kullanıcının itibar puanını artırır
3. WHEN bir kullanıcının cevabı yukarı oy aldığında, THE QnA System SHALL kullanıcının itibar puanını artırır
4. THE QnA System SHALL kullanıcının itibar puanını profil sayfasında gösterir
5. WHERE bir kullanıcı belirli itibar seviyelerine ulaştığında, THE QnA System SHALL kullanıcıya rozet veya başarım verir

### Requirement 10

**User Story:** Premium kullanıcı olarak, sorularımın daha fazla görünürlük kazanmasını istiyorum, böylece daha hızlı ve kaliteli cevaplar alabilirim.

#### Acceptance Criteria

1. WHERE bir kullanıcı premium aboneliğe sahipse, THE QnA System SHALL kullanıcının sorularını soru listesinde öne çıkarır
2. WHERE bir kullanıcı premium aboneliğe sahipse, THE QnA System SHALL kullanıcının sorularına özel bir "premium" rozeti ekler
3. THE QnA System SHALL ücretsiz kullanıcıların ayda en fazla beş soru sormasına izin verir
4. WHERE bir kullanıcı premium aboneliğe sahipse, THE QnA System SHALL kullanıcının ayda en fazla yirmi soru sormasına izin verir
5. WHEN bir kullanıcı aylık soru limitine ulaştığında, THE QnA System SHALL kullanıcıya limit dolduğunu bildiren mesaj gösterir

### Requirement 11

**User Story:** Kullanıcı olarak, ilgimi çeken soruları favorilerime ekleyebilmek istiyorum, böylece daha sonra kolayca erişebilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı bir soru detay sayfasını görüntülediğinde, THE QnA System SHALL "favorilere ekle" butonunu gösterir
2. WHEN bir kullanıcı bir soruyu favorilerine eklediğinde, THE QnA System SHALL soruyu kullanıcının favori listesine kaydeder
3. WHEN bir kullanıcı profil sayfasını açtığında, THE QnA System SHALL kullanıcının favori sorularını ayrı bir sekmede gösterir
4. WHEN bir kullanıcı favorilediği bir soruya yeni cevap geldiğinde, THE QnA System SHALL kullanıcıya bildirim gönderir
5. THE QnA System SHALL kullanıcıların bir soruyu favorilerinden kaldırmasına izin verir

### Requirement 12

**User Story:** Kullanıcı olarak, belirli soruları veya kullanıcıları takip edebilmek istiyorum, böylece güncellemelerden haberdar olabilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı bir soru detay sayfasını görüntülediğinde, THE QnA System SHALL "soruyu takip et" butonunu gösterir
2. WHEN bir kullanıcı bir soruyu takip ettiğinde, THE QnA System SHALL soruya gelen her yeni cevap için kullanıcıya bildirim gönderir
3. WHEN bir kullanıcı başka bir kullanıcının profilini görüntülediğinde, THE QnA System SHALL "kullanıcıyı takip et" butonunu gösterir
4. WHEN bir kullanıcı başka bir kullanıcıyı takip ettiğinde, THE QnA System SHALL takip edilen kullanıcının yeni soruları ve cevapları için bildirim gönderir
5. THE QnA System SHALL kullanıcıların takip ettikleri soruları ve kullanıcıları profil sayfasında gösterir

### Requirement 13

**User Story:** Kullanıcı olarak, yararlı bulduğum soruları sosyal medyada veya arkadaşlarımla paylaşabilmek istiyorum, böylece daha fazla kişiye ulaşabilir.

#### Acceptance Criteria

1. WHEN bir kullanıcı bir soru detay sayfasını görüntülediğinde, THE QnA System SHALL "paylaş" butonunu gösterir
2. WHEN bir kullanıcı paylaş butonuna tıkladığında, THE QnA System SHALL sosyal medya platformları ve link kopyalama seçeneklerini gösterir
3. WHEN bir kullanıcı link kopyalama seçeneğini seçtiğinde, THE QnA System SHALL sorunun benzersiz URL'sini panoya kopyalar
4. THE QnA System SHALL paylaşılan soruların görüntülenme sayısını takip eder
5. THE QnA System SHALL paylaşım linkleri için önizleme meta verilerini (başlık, açıklama, görsel) sağlar

### Requirement 14

**User Story:** Kullanıcı olarak, sorulara yorum yapabilmek istiyorum, böylece ek bilgi isteyebilir veya açıklama yapabilirim.

#### Acceptance Criteria

1. WHEN bir kullanıcı bir soru veya cevabı görüntülediğinde, THE QnA System SHALL "yorum yap" seçeneğini gösterir
2. WHEN bir kullanıcı geçerli bir yorum gönderdiğinde, THE QnA System SHALL yorumu ilgili soru veya cevabın altında gösterir
3. THE QnA System SHALL yorumların maksimum üçyüz karakter uzunluğunda olmasını zorunlu kılar
4. WHEN bir kullanıcının sorusuna veya cevabına yorum yapıldığında, THE QnA System SHALL kullanıcıya bildirim gönderir
5. THE QnA System SHALL kullanıcıların kendi yorumlarını silmesine izin verir
