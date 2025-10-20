# Soru-Cevap Raporlama Sistemi - Özet

## 📋 Yapılan Değişiklikler

### 1. Backend (API) ✅
Backend tarafında raporlama sistemi **zaten mevcuttu** ve tam çalışır durumdaydı:

- ✅ `ContentReport` modeli Prisma schema'da tanımlı
- ✅ `ModerationController` ve `ModerationService` hazır
- ✅ Raporlama endpoint'leri aktif:
  - `POST /api/qna/moderation/report` - İçerik raporla
  - `GET /api/qna/moderation/reports` - Raporları listele (admin)
  - `GET /api/qna/moderation/reports/:id` - Rapor detayı (admin) **[YENİ]**
  - `PATCH /api/qna/moderation/reports/:id` - Raporu incele (admin)
  - `DELETE /api/qna/moderation/content/:contentType/:id` - İçeriği sil (admin)

**Yeni Eklenen:**
- `getReportById()` metodu moderation service'e eklendi
- Admin için rapor detayı endpoint'i eklendi

### 2. Mobile App ✅
Mobil uygulamada raporlama **zaten mevcuttu** ve çalışıyordu:

- ✅ `ReportModal` komponenti hazır ve kullanılıyor
- ✅ Soru detay sayfasında "Bildir" butonu var
- ✅ Cevaplarda "Bildir" butonu var
- ✅ `useReportContent` hook'u hazır

**İyileştirme Yapılan:**
- QnA tab (statik FAQ) sayfasına "Topluluğa Git" butonu eklendi
- Kullanıcılar artık statik FAQ'den gerçek community'ye kolayca geçebilir

### 3. Admin Panel 🆕
Admin panelinde raporlama sistemi **büyük ölçüde iyileştirildi**:

#### Reports List Sayfası (`/qna/reports`)
**Önceki Durum:**
- Basit tablo görünümü
- Sınırlı filtreleme
- Minimal bilgi gösterimi

**Yeni Durum:**
- ✨ Gelişmiş tablo görünümü
- ✨ İçerik türüne göre renkli etiketler (Soru/Cevap/Yorum)
- ✨ Durum filtreleme (Beklemede/İncelendi/Çözüldü/Reddedildi)
- ✨ İçerik türü filtreleme
- ✨ Açıklama önizlemesi (tooltip ile tam metin)
- ✨ Bekleyen raporlar için görsel vurgu (turuncu arka plan)
- ✨ Yeni raporlar için uyarı ikonu (24 saat içindekiler)
- ✨ Varsayılan olarak "Beklemede" raporları gösterir
- ✨ Tarih sıralaması (en yeni önce)

#### Report Detail Sayfası (`/qna/reports/show/[id]`)
**Önceki Durum:**
- Sadece rapor bilgileri
- Raporlanan içerik görünmüyordu
- Basit işlem butonları

**Yeni Durum:**
- ✨ **Raporlanan içeriği gösterir** (Soru/Cevap/Yorum)
- ✨ İçerik detayları:
  - Soru: Başlık, içerik, kategori, etiketler
  - Cevap: İçerik metni
  - Yorum: Yorum metni
  - Yazar bilgisi
  - Oluşturulma tarihi
- ✨ Gelişmiş rapor detayları
- ✨ Moderasyon işlemleri:
  - 🗑️ İçeriği Sil (kalıcı silme)
  - 👁️ İçeriği Gizle (soft delete)
  - ❌ Raporu Reddet
- ✨ İşlem uyarıları ve onay mesajları
- ✨ İçerik bulunamadığında uyarı gösterimi
- ✨ İşlenmiş raporlar için bilgi mesajı

## 🎯 Özellikler

### Kullanıcı Tarafı (Mobile)
1. **Raporlama Sebepleri:**
   - Spam veya Reklam
   - Uygunsuz İçerik
   - Yanıltıcı Bilgi
   - Taciz veya Zorbalık
   - Şiddet veya Tehdit
   - Nefret Söylemi
   - Gizlilik İhlali
   - Diğer

2. **Raporlama Süreci:**
   - Kullanıcı bir sebep seçer
   - İsteğe bağlı açıklama ekleyebilir (500 karakter)
   - Rapor gizli tutulur
   - Moderasyon ekibi inceler

3. **Kısıtlamalar:**
   - Aynı içeriği birden fazla raporlayamaz
   - Saatte 10 rapor limiti (throttling)

### Admin Tarafı
1. **Rapor Yönetimi:**
   - Tüm raporları listeleme
   - Filtreleme (durum, içerik türü)
   - Sıralama (tarih)
   - Detaylı inceleme

2. **Moderasyon İşlemleri:**
   - İçeriği silme (kalıcı)
   - İçeriği gizleme (soruları kapatma)
   - Raporu reddetme
   - İşlem geçmişi takibi

3. **Otomatik Moderasyon:**
   - 3+ rapor alan içerik otomatik gizlenir
   - Spam keyword kontrolü
   - İşlem logları tutulur

## 📊 Veritabanı Yapısı

```prisma
model ContentReport {
  id          String       @id @default(cuid())
  contentId   String       // Raporlanan içeriğin ID'si
  contentType ContentType  // QUESTION, ANSWER, COMMENT
  reporterId  String       // Raporlayan kullanıcı
  reason      String       // Rapor sebebi
  description String?      // Ek açıklama
  status      ReportStatus // PENDING, REVIEWED, RESOLVED, DISMISSED
  reviewedBy  String?      // İnceleyen admin
  reviewedAt  DateTime?    // İnceleme tarihi
  createdAt   DateTime     @default(now())
  
  reporter    User         @relation("ContentReports")
  reviewer    User?        @relation("ReviewedReports")
}
```

## 🔄 İş Akışı

### Kullanıcı Raporlama
1. Kullanıcı "Bildir" butonuna tıklar
2. Rapor modalı açılır
3. Sebep seçer ve açıklama ekler
4. Rapor gönderilir
5. Backend'de kaydedilir
6. Otomatik kontroller yapılır (3+ rapor kontrolü)

### Admin İnceleme
1. Admin reports sayfasına gider
2. Bekleyen raporları görür
3. Rapor detayına tıklar
4. Raporlanan içeriği inceler
5. Karar verir:
   - İçeriği sil → İçerik kalıcı silinir
   - İçeriği gizle → Soru kapatılır
   - Raporu reddet → Rapor dismissed olur
6. İşlem loglanır

## 🚀 Kullanım

### Mobil Uygulamada
```typescript
// Soru raporlama
<TouchableOpacity onPress={handleReport}>
  <Text>🚩 Raporla</Text>
</TouchableOpacity>

// Cevap raporlama
<TouchableOpacity onPress={() => handleReportAnswer(answerId)}>
  <Text>🚩 Raporla</Text>
</TouchableOpacity>
```

### Admin Panelinde
1. Sol menüden "Q&A" → "Raporlar" seçin
2. Bekleyen raporları görün
3. "İncele" butonuna tıklayın
4. Raporlanan içeriği görün
5. Uygun işlemi seçin

## 📝 Notlar

### Admin Panelinde Raporlar Ne İşe Yarar?
Admin panelindeki "Raporlar" bölümü şu amaçlarla kullanılır:

1. **İçerik Moderasyonu:**
   - Kullanıcılar tarafından bildirilen uygunsuz içerikleri inceleme
   - Topluluk kurallarına aykırı içerikleri tespit etme
   - Spam, taciz, yanıltıcı bilgi gibi sorunları ele alma

2. **Topluluk Güvenliği:**
   - Kullanıcıları zararlı içerikten koruma
   - Güvenli ve sağlıklı bir topluluk ortamı sağlama
   - Kötü niyetli kullanıcıları tespit etme

3. **Kalite Kontrolü:**
   - Düşük kaliteli içerikleri filtreleme
   - Topluluk standartlarını koruma
   - Kullanıcı deneyimini iyileştirme

4. **Yasal Uyumluluk:**
   - Yasal gerekliliklere uygun içerik yönetimi
   - Şikayet ve raporlama süreçlerinin dokümantasyonu
   - Moderasyon kararlarının kayıt altına alınması

### Önemli Noktalar
- ✅ Raporlama sistemi tamamen çalışır durumda
- ✅ Mobil uygulamada "Bildir" butonları mevcut
- ✅ Admin paneli büyük ölçüde iyileştirildi
- ✅ Raporlanan içerik artık admin panelinde görülebiliyor
- ✅ Otomatik moderasyon (3+ rapor) aktif
- ✅ Spam kontrolü aktif
- ✅ İşlem logları tutuluyor

### Gelecek İyileştirmeler (Opsiyonel)
- [ ] Email bildirimleri (admin'e yeni rapor geldiğinde)
- [ ] Rapor istatistikleri dashboard'u
- [ ] Kullanıcı bazlı rapor geçmişi
- [ ] Toplu işlem yapma (birden fazla raporu aynı anda işleme)
- [ ] Rapor kategorilerine göre otomatik önceliklendirme
- [ ] Makine öğrenmesi ile otomatik içerik moderasyonu

## 🎉 Sonuç

Soru-cevap raporlama sistemi artık **tam işlevsel** ve **kullanıma hazır** durumda:

1. ✅ Kullanıcılar soru ve cevapları raporlayabiliyor
2. ✅ Admin panelinde raporlar görüntülenebiliyor
3. ✅ Raporlanan içerik detaylı şekilde incelenebiliyor
4. ✅ Moderasyon işlemleri yapılabiliyor
5. ✅ Otomatik kontroller çalışıyor

Sistem production ortamında kullanıma hazır! 🚀
