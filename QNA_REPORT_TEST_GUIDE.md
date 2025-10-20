# Soru-Cevap Raporlama Sistemi - Test Kılavuzu

## 🧪 Test Senaryoları

### 1. Mobil Uygulama - Soru Raporlama

#### Test Adımları:
1. Mobil uygulamayı açın
2. Community sekmesine gidin
3. Herhangi bir soruya tıklayın
4. Sağ üstteki "🚩 Raporla" butonuna tıklayın
5. Rapor modalında bir sebep seçin (örn: "Spam veya Reklam")
6. İsteğe bağlı açıklama ekleyin
7. "Gönder" butonuna tıklayın

#### Beklenen Sonuç:
- ✅ Modal açılmalı
- ✅ 8 farklı rapor sebebi görünmeli
- ✅ Açıklama alanı 500 karakter ile sınırlı olmalı
- ✅ "Gönder" butonu seçim yapılmadan disabled olmalı
- ✅ Rapor gönderildikten sonra başarı mesajı görünmeli
- ✅ Modal kapanmalı

### 2. Mobil Uygulama - Cevap Raporlama

#### Test Adımları:
1. Bir soru detay sayfasında olun
2. Herhangi bir cevabın üç nokta menüsüne tıklayın
3. "Raporla" seçeneğine tıklayın
4. Rapor modalında işlemleri tamamlayın

#### Beklenen Sonuç:
- ✅ Cevap için rapor modalı açılmalı
- ✅ Rapor başarıyla gönderilmeli

### 3. Mobil Uygulama - Aynı İçeriği Tekrar Raporlama

#### Test Adımları:
1. Bir içeriği raporlayın
2. Aynı içeriği tekrar raporlamaya çalışın

#### Beklenen Sonuç:
- ❌ "Bu içeriği zaten raporladınız" hatası almalısınız

### 4. Admin Panel - Raporları Listeleme

#### Test Adımları:
1. Admin paneline giriş yapın
2. Sol menüden "Q&A" → "Raporlar" seçin
3. Raporlar listesini görüntüleyin

#### Beklenen Sonuç:
- ✅ Tüm raporlar tablo halinde görünmeli
- ✅ Bekleyen raporlar turuncu arka planla vurgulanmalı
- ✅ İçerik türü renkli etiketlerle gösterilmeli
- ✅ Durum filtreleri çalışmalı
- ✅ Varsayılan olarak "Beklemede" raporları göstermeli

### 5. Admin Panel - Rapor Detayı İnceleme

#### Test Adımları:
1. Raporlar listesinde bir rapora tıklayın
2. "İncele" butonuna tıklayın
3. Rapor detay sayfasını görüntüleyin

#### Beklenen Sonuç:
- ✅ Rapor bilgileri görünmeli:
  - İçerik türü
  - Durum
  - Sebep
  - Raporlayan kullanıcı
  - Rapor tarihi
  - Açıklama (varsa)
- ✅ **Raporlanan içerik görünmeli:**
  - Soru ise: Başlık, içerik, kategori, etiketler
  - Cevap ise: İçerik metni
  - Yorum ise: Yorum metni
  - Yazar bilgisi
  - Oluşturulma tarihi
- ✅ Moderasyon işlem butonları görünmeli

### 6. Admin Panel - İçeriği Silme

#### Test Adımları:
1. Bir rapor detay sayfasında olun
2. "İçeriği Sil" butonuna tıklayın
3. Onay verin

#### Beklenen Sonuç:
- ✅ İçerik veritabanından silinmeli
- ✅ Rapor durumu "Çözüldü" olmalı
- ✅ Başarı mesajı görünmeli
- ✅ İnceleyen admin bilgisi kaydedilmeli

### 7. Admin Panel - İçeriği Gizleme

#### Test Adımları:
1. Bir soru raporu detay sayfasında olun
2. "İçeriği Gizle" butonuna tıklayın

#### Beklenen Sonuç:
- ✅ Soru durumu "CLOSED" olmalı
- ✅ Rapor durumu "Çözüldü" olmalı
- ✅ Başarı mesajı görünmeli

### 8. Admin Panel - Raporu Reddetme

#### Test Adımları:
1. Bir rapor detay sayfasında olun
2. "Raporu Reddet" butonuna tıklayın

#### Beklenen Sonuç:
- ✅ Rapor durumu "Reddedildi" olmalı
- ✅ İçerik değişmemeli
- ✅ Başarı mesajı görünmeli

### 9. Otomatik Moderasyon - 3+ Rapor

#### Test Adımları:
1. Aynı içeriği 3 farklı kullanıcı ile raporlayın
2. Admin panelinde kontrol edin

#### Beklenen Sonuç:
- ✅ İçerik otomatik olarak gizlenmeli
- ✅ Tüm raporlar "İncelendi" durumuna geçmeli

### 10. Spam Kontrolü

#### Test Adımları:
1. Bir soru veya cevap oluştururken spam keyword kullanın
   (örn: "viagra", "casino", "click here")
2. Göndermeyi deneyin

#### Beklenen Sonuç:
- ❌ "İçeriğiniz spam olarak algılandı" hatası almalısınız

## 🔍 API Test Komutları

### Rapor Oluşturma
```bash
curl -X POST http://localhost:4000/qna/moderation/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "QUESTION_ID",
    "contentType": "QUESTION",
    "reason": "Spam veya Reklam",
    "description": "Bu içerik spam içeriyor"
  }'
```

### Raporları Listeleme (Admin)
```bash
curl -X GET "http://localhost:4000/qna/moderation/reports?status=PENDING" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Rapor Detayı (Admin)
```bash
curl -X GET http://localhost:4000/qna/moderation/reports/REPORT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Raporu İnceleme (Admin)
```bash
curl -X PATCH http://localhost:4000/qna/moderation/reports/REPORT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "DELETE"
  }'
```

## 📊 Test Verileri

### Örnek Rapor Sebepleri
- "Spam veya Reklam"
- "Uygunsuz İçerik"
- "Yanıltıcı Bilgi"
- "Taciz veya Zorbalık"
- "Şiddet veya Tehdit"
- "Nefret Söylemi"
- "Gizlilik İhlali"
- "Diğer"

### Spam Keywords (Test için)
- viagra
- cialis
- casino
- lottery
- click here
- buy now
- free money
- work from home

## ✅ Test Checklist

### Mobil Uygulama
- [ ] Soru raporlama çalışıyor
- [ ] Cevap raporlama çalışıyor
- [ ] Yorum raporlama çalışıyor (varsa)
- [ ] Aynı içeriği tekrar raporlama engelleniyor
- [ ] Rapor modalı doğru çalışıyor
- [ ] Başarı mesajları görünüyor
- [ ] Throttling çalışıyor (10 rapor/saat)

### Admin Panel
- [ ] Raporlar listesi görünüyor
- [ ] Filtreleme çalışıyor
- [ ] Sıralama çalışıyor
- [ ] Rapor detayı açılıyor
- [ ] Raporlanan içerik görünüyor
- [ ] İçerik silme çalışıyor
- [ ] İçerik gizleme çalışıyor
- [ ] Rapor reddetme çalışıyor
- [ ] İşlem logları kaydediliyor

### Backend
- [ ] Rapor oluşturma endpoint'i çalışıyor
- [ ] Rapor listeleme endpoint'i çalışıyor
- [ ] Rapor detayı endpoint'i çalışıyor
- [ ] Rapor inceleme endpoint'i çalışıyor
- [ ] Otomatik moderasyon (3+ rapor) çalışıyor
- [ ] Spam kontrolü çalışıyor
- [ ] Admin guard çalışıyor
- [ ] Throttling çalışıyor

## 🐛 Bilinen Sorunlar ve Çözümler

### Sorun 1: Raporlanan içerik görünmüyor
**Çözüm:** İçerik silinmiş olabilir. Admin panelinde "İçerik Bulunamadı" uyarısı görünmelidir.

### Sorun 2: "Unauthorized" hatası
**Çözüm:** Token'ın geçerli olduğundan ve admin yetkisine sahip olduğunuzdan emin olun.

### Sorun 3: Rapor gönderilemiyor
**Çözüm:** 
- İçeriğin var olduğundan emin olun
- Daha önce aynı içeriği raporlamadığınızdan emin olun
- Throttling limitini aşmadığınızdan emin olun

## 📝 Test Sonuçları Şablonu

```markdown
## Test Tarihi: [TARİH]
## Test Eden: [İSİM]

### Mobil Uygulama
- [ ] Soru raporlama: ✅/❌
- [ ] Cevap raporlama: ✅/❌
- [ ] Tekrar raporlama engeli: ✅/❌

### Admin Panel
- [ ] Raporlar listesi: ✅/❌
- [ ] Rapor detayı: ✅/❌
- [ ] Raporlanan içerik görünümü: ✅/❌
- [ ] İçerik silme: ✅/❌
- [ ] İçerik gizleme: ✅/❌
- [ ] Rapor reddetme: ✅/❌

### Otomatik Sistemler
- [ ] 3+ rapor otomatik moderasyon: ✅/❌
- [ ] Spam kontrolü: ✅/❌

### Notlar:
[Test sırasında karşılaşılan sorunlar veya gözlemler]
```

## 🎯 Performans Testleri

### Yük Testi
1. 100 kullanıcı ile eşzamanlı rapor gönderme
2. Admin panelinde 1000+ rapor ile listeleme performansı
3. Otomatik moderasyon tetiklenme süresi

### Beklenen Performans
- Rapor oluşturma: < 500ms
- Rapor listeleme: < 1s
- Rapor detayı: < 500ms
- Otomatik moderasyon: < 2s

## 🔒 Güvenlik Testleri

### Test Senaryoları
1. Admin olmayan kullanıcı rapor incelemeye çalışsın
2. Başka kullanıcının raporunu görmeye çalışsın
3. SQL injection denemeleri
4. XSS denemeleri
5. Rate limiting testleri

### Beklenen Sonuçlar
- ❌ Yetkisiz erişimler engellenmelidir
- ❌ SQL injection çalışmamalıdır
- ❌ XSS çalışmamalıdır
- ✅ Rate limiting aktif olmalıdır

---

**Not:** Tüm testler production ortamına geçmeden önce staging ortamında yapılmalıdır.
