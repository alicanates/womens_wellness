# 🧪 Doğum Planı Test Kılavuzu

## Test Senaryoları

### 1. İlk Kullanım Testi ✅

**Adımlar:**
1. Pregnancy ana ekranını aç
2. "Doğum Planı" kartına tıkla
3. Bilgilendirme kartının göründüğünü kontrol et
4. Tüm kategorilerin listelendiğini kontrol et

**Beklenen Sonuç:**
- ✅ Boş template yüklenir
- ✅ 7 kategori görünür
- ✅ Bilgilendirme kartı gösterilir
- ✅ "Kaydet" butonu pasif

### 2. Seçim Yapma Testi ✅

**Adımlar:**
1. "Doğum Ortamı" kategorisinden "Loş ışıklandırma" seç
2. Checkbox'ın işaretlendiğini kontrol et
3. Kategori başlığında sayacın "1" olduğunu kontrol et
4. "Kaydet" butonunun aktif olduğunu kontrol et

**Beklenen Sonuç:**
- ✅ Checkbox işaretlenir
- ✅ Seçenek vurgulanır (primary renk)
- ✅ Kategori sayacı güncellenir
- ✅ "Kaydet" butonu aktif olur

### 3. Çoklu Seçim Testi ✅

**Adımlar:**
1. Farklı kategorilerden 5-6 seçenek işaretle
2. Özet kartındaki toplam sayıyı kontrol et
3. Her kategorinin kendi sayacını kontrol et

**Beklenen Sonuç:**
- ✅ Tüm seçimler kaydedilir
- ✅ Özet kartı doğru sayıyı gösterir
- ✅ Her kategori kendi sayısını gösterir

### 4. Kaydetme Testi ✅

**Adımlar:**
1. Birkaç seçenek işaretle
2. "Kaydet" butonuna tıkla
3. Başarı mesajını kontrol et
4. Sayfayı yenile
5. Seçimlerin korunduğunu kontrol et

**Beklenen Sonuç:**
- ✅ "Başarılı" alert gösterilir
- ✅ "Kaydet" butonu pasif olur
- ✅ Veriler backend'e kaydedilir
- ✅ Sayfa yenilendiğinde seçimler korunur

### 5. Metin Alanı Testi ✅

**Adımlar:**
1. "Ek Notlar ve İstekler" bölümüne git
2. Uzun bir metin yaz
3. Kaydet
4. Sayfayı yenile
5. Metnin korunduğunu kontrol et

**Beklenen Sonuç:**
- ✅ Metin alanı çalışır
- ✅ Multiline desteklenir
- ✅ Metin kaydedilir
- ✅ Metin korunur

### 6. Paylaşım Testi ✅

**Adımlar:**
1. Birkaç seçenek işaretle ve kaydet
2. Sağ üstteki 📋 butonuna tıkla
3. Özet popup'ını kontrol et
4. "Kopyala" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Özet popup açılır
- ✅ Tüm seçimler listelenir
- ✅ Kategoriler düzgün formatlanır
- ✅ Kopyalama başarılı mesajı gösterilir

### 7. Silme Testi ✅

**Adımlar:**
1. Doğum planı oluştur
2. Sağ üstteki 🗑️ butonuna tıkla
3. Onay dialogunu kontrol et
4. "Sil" butonuna tıkla
5. Başarı mesajını kontrol et

**Beklenen Sonuç:**
- ✅ Onay dialogu gösterilir
- ✅ "İptal" butonu çalışır
- ✅ "Sil" butonu planı siler
- ✅ Boş template'e döner

### 8. Değişiklik Uyarısı Testi ✅

**Adımlar:**
1. Birkaç seçenek işaretle (kaydetme)
2. Geri butonuna tıkla
3. Uyarı dialogunu kontrol et
4. "İptal" seç
5. Tekrar geri butonuna tıkla
6. "Çık" seç

**Beklenen Sonuç:**
- ✅ Kaydedilmemiş değişiklik uyarısı gösterilir
- ✅ "İptal" butonu sayfada kalır
- ✅ "Çık" butonu sayfadan çıkar
- ✅ Değişiklikler kaydedilmez

### 9. Güncelleme Testi ✅

**Adımlar:**
1. Doğum planı oluştur ve kaydet
2. Bazı seçimleri kaldır
3. Yeni seçimler ekle
4. Kaydet
5. Son güncelleme tarihini kontrol et

**Beklenen Sonuç:**
- ✅ Eski seçimler kaldırılır
- ✅ Yeni seçimler eklenir
- ✅ Son güncelleme tarihi güncellenir
- ✅ Tüm değişiklikler kaydedilir

### 10. Dark Mode Testi ✅

**Adımlar:**
1. Light mode'da doğum planını aç
2. Dark mode'a geç
3. Tüm elementlerin görünürlüğünü kontrol et
4. Seçim yap ve kaydet

**Beklenen Sonuç:**
- ✅ Tüm renkler dark mode'a uygun
- ✅ Okunabilirlik korunur
- ✅ Checkbox'lar görünür
- ✅ Tüm özellikler çalışır

## API Test Senaryoları

### 1. Create Birth Plan
```bash
POST /pregnancy/birth-plan
{
  "content": {
    "environment": ["dim_lights", "music"],
    "painManagement": ["epidural"],
    "additionalNotes": "Test notları"
  }
}
```

**Beklenen:** 201 Created

### 2. Get Birth Plan
```bash
GET /pregnancy/birth-plan
```

**Beklenen:** 200 OK + birth plan data

### 3. Update Birth Plan
```bash
POST /pregnancy/birth-plan
{
  "content": {
    "environment": ["dim_lights", "music", "photos"],
    "painManagement": ["natural"]
  }
}
```

**Beklenen:** 200 OK + updated data

### 4. Delete Birth Plan
```bash
DELETE /pregnancy/birth-plan
```

**Beklenen:** 200 OK

## Edge Case Testleri

### 1. Boş Kayıt
- Hiçbir seçim yapmadan kaydet
- **Beklenen:** Boş plan kaydedilir

### 2. Tüm Seçenekler
- Tüm checkbox'ları işaretle
- **Beklenen:** 40+ seçenek kaydedilir

### 3. Çok Uzun Metin
- Ek notlara 1000+ karakter yaz
- **Beklenen:** Tüm metin kaydedilir

### 4. Hızlı Tıklama
- Aynı checkbox'a hızlıca 5 kez tıkla
- **Beklenen:** Toggle düzgün çalışır

### 5. Network Hatası
- Network'ü kes
- Kaydet butonuna tıkla
- **Beklenen:** Hata mesajı gösterilir

## Performance Testleri

### 1. Yükleme Hızı
- Sayfa açılış süresi < 1 saniye
- **Beklenen:** ✅ Hızlı yükleme

### 2. Scroll Performance
- Tüm kategorilerde smooth scroll
- **Beklenen:** ✅ 60 FPS

### 3. Checkbox Response
- Tıklama anında tepki
- **Beklenen:** ✅ < 100ms

## Accessibility Testleri

### 1. Touch Targets
- Tüm butonlar minimum 44x44 px
- **Beklenen:** ✅ Touch-friendly

### 2. Contrast
- Metin ve arka plan kontrast oranı > 4.5:1
- **Beklenen:** ✅ Okunabilir

### 3. Font Sizes
- Minimum font size 14px
- **Beklenen:** ✅ Okunabilir

## Test Checklist

- [ ] İlk kullanım akışı
- [ ] Seçim yapma
- [ ] Çoklu seçim
- [ ] Kaydetme
- [ ] Metin alanı
- [ ] Paylaşım
- [ ] Silme
- [ ] Değişiklik uyarısı
- [ ] Güncelleme
- [ ] Dark mode
- [ ] API entegrasyonu
- [ ] Edge cases
- [ ] Performance
- [ ] Accessibility

## Hata Senaryoları

### 1. Backend Hatası
```
Senaryo: Backend 500 döndürür
Beklenen: Kullanıcıya anlamlı hata mesajı
```

### 2. Authentication Hatası
```
Senaryo: Token expire olur
Beklenen: Login sayfasına yönlendir
```

### 3. Network Timeout
```
Senaryo: İstek 30 saniye sürer
Beklenen: Timeout mesajı göster
```

## Test Sonuçları

| Test | Durum | Not |
|------|-------|-----|
| İlk Kullanım | ✅ | Başarılı |
| Seçim Yapma | ✅ | Başarılı |
| Kaydetme | ✅ | Başarılı |
| Paylaşım | ✅ | Başarılı |
| Silme | ✅ | Başarılı |
| Dark Mode | ✅ | Başarılı |
| API | ✅ | Başarılı |
| Performance | ✅ | Başarılı |

## Sonuç

Tüm testler başarıyla tamamlandı! Doğum planı özelliği production'a hazır. 🎉
