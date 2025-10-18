# Kota Gösterimleri Profil Sayfasına Taşındı

## Yapılan Değişiklikler

**ÖNEMLİ:** AI Sohbet Kotası ve Soru-Cevap Kotası artık ayrı ayrı gösteriliyor!

### 1. Chat Ekranı (apps/mobile/app/(tabs)/chat.tsx)
- **Kaldırılan**: Header'daki kalan hak sayısı gösterimi
- **Eklenen**: Basit bir alt başlık ("Yapay zeka destekli sağlık asistanınız")
- **Neden**: Kullanıcıların sohbet deneyimini bozmamak ve kota bilgisini daha uygun bir yerde göstermek için

**Önceki Durum:**
```
NOVA - AI Arkadaşın
12/100 mesaj ⚡
```

**Yeni Durum:**
```
NOVA - AI Arkadaşın
Yapay zeka destekli sağlık asistanınız
```

### 2. Profil/Ayarlar Ekranı (apps/mobile/app/settings.tsx)

#### Premium Kullanıcılar İçin:
Her iki kota için de ayrı kartlar:

**A) AI Sohbet Kotası:**
- **Sınırsız badge** gösterimi
- **Bu ay kullanılan** mesaj sayısı
- **Kalan hak**: Sonsuz (∞) sembolü

**Görünüm:**
```
💬 AI Sohbet Kotası                Sınırsız ✨
Premium üye olarak sınırsız AI mesajı gönderebilirsiniz

    45                    ∞
Bu ay kullanılan      Kalan hak
```

**B) Soru Sorma Kotası:**
- **Sınırsız badge** gösterimi
- **Bu ay sorduğunuz** soru sayısı
- **Kalan hak**: Sonsuz (∞) sembolü

**Görünüm:**
```
❓ Soru Sorma Kotası               Sınırsız ✨
Premium üye olarak sınırsız soru sorabilirsiniz

    12                    ∞
Bu ay sorduğunuz      Kalan hak
```

#### Ücretsiz Kullanıcılar İçin:
- **İlerleme çubuğu** (progress bar) ile görsel gösterim
- **Kullanılan** ve **Kalan hak** sayıları yan yana
- **Uyarı badge'leri**:
  - %80+ kullanımda: "Azalıyor ⚡" (turuncu)
  - %100 kullanımda: "Doldu ⚠️" (kırmızı)
- İlerleme çubuğu renk değişimi:
  - Normal: Mavi (primary color)
  - %80+: Turuncu (#F59E0B)
  - %100: Kırmızı (error color)
- **Sıfırlanma tarihi** bilgisi

**Görünüm (Normal):**
```
AI Mesaj Kotası
[████████░░] 80%

    80                    20
Kullanılan            Kalan hak

15 Kasım tarihinde sıfırlanır
```

**Görünüm (Azalıyor):**
```
AI Mesaj Kotası              Azalıyor ⚡
[█████████░] 90%

    90                    10
Kullanılan            Kalan hak

15 Kasım tarihinde sıfırlanır
```

**Görünüm (Doldu):**
```
AI Mesaj Kotası              Doldu ⚠️
[██████████] 100%

    100                    0
Kullanılan            Kalan hak

15 Kasım tarihinde sıfırlanır
```

## Kullanıcı Deneyimi İyileştirmeleri

### Avantajlar:
1. **Daha Az Dikkat Dağıtıcı**: Chat ekranında kota bilgisi kullanıcının sohbet deneyimini bozmuyor
2. **Merkezi Bilgi**: Tüm abonelik ve kota bilgileri tek bir yerde (Profil/Ayarlar)
3. **Daha Detaylı Gösterim**: Profil sayfasında daha fazla alan olduğu için daha detaylı bilgi gösterilebiliyor
4. **Görsel Geri Bildirim**: İlerleme çubuğu ve renk değişimleri ile kullanıcı durumu daha iyi anlayabiliyor
5. **Premium Ayrımı**: Premium ve ücretsiz kullanıcılar için farklı, uygun gösterimler

### Kullanıcı Akışı:
1. Kullanıcı chat ekranında mesaj gönderir
2. Kota azaldığında/dolduğunda uyarı modal'ı gösterilir
3. Kullanıcı detaylı bilgi için Profil > Abonelik bölümüne gidebilir
4. Orada kalan hak sayısını, sıfırlanma tarihini ve diğer detayları görebilir

## Teknik Detaylar

### Yeni Stil Tanımları:
- `quotaHeader`: Başlık ve badge için flex container
- `quotaBadge`: Premium için "Sınırsız" badge'i
- `quotaWarningBadge`: Ücretsiz kullanıcılar için uyarı badge'i
- `quotaUnlimitedText`: Premium açıklama metni
- `quotaStatsRow`: İstatistikleri yan yana göstermek için
- `quotaStat`: Her bir istatistik için container
- `quotaStatValue`: Büyük sayı gösterimi
- `quotaStatValueDepleted`: Kota dolduğunda kırmızı renk
- `quotaStatLabel`: İstatistik etiketi
- `quotaDivider`: İstatistikler arası ayırıcı çizgi

### Veri Kaynağı:
- `subscription.aiMessagesUsed`: Kullanılan mesaj sayısı
- `subscription.aiMessagesLimit`: Toplam limit (ücretsiz için 100)
- `subscription.quotaResetDate`: Kotanın sıfırlanacağı tarih

## Test Senaryoları

### Premium Kullanıcı:
1. ✅ "Sınırsız" badge'i görünüyor
2. ✅ Kullanılan mesaj sayısı gösteriliyor
3. ✅ Kalan hak sonsuz (∞) olarak gösteriliyor
4. ✅ İlerleme çubuğu yok

### Ücretsiz Kullanıcı - Normal (%0-79):
1. ✅ İlerleme çubuğu mavi renkte
2. ✅ Kullanılan ve kalan hak sayıları doğru
3. ✅ Uyarı badge'i yok
4. ✅ Sıfırlanma tarihi gösteriliyor

### Ücretsiz Kullanıcı - Azalıyor (%80-99):
1. ✅ İlerleme çubuğu turuncu renkte
2. ✅ "Azalıyor ⚡" badge'i gösteriliyor
3. ✅ Kalan hak sayısı doğru

### Ücretsiz Kullanıcı - Doldu (%100):
1. ✅ İlerleme çubuğu kırmızı renkte
2. ✅ "Doldu ⚠️" badge'i gösteriliyor
3. ✅ Kalan hak 0 olarak gösteriliyor
4. ✅ Kalan hak sayısı kırmızı renkte

## Gelecek İyileştirmeler

1. **Bildirim**: Kota %80'e ulaştığında push notification
2. **Animasyon**: Kota değiştiğinde smooth transition
3. **Grafik**: Aylık kullanım grafiği
4. **Karşılaştırma**: Geçmiş aylarla karşılaştırma
