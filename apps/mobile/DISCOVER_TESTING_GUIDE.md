# Discover Section - Manual Testing Guide

Bu rehber, Keşfet bölümünün tüm özelliklerini test etmeniz için hazırlanmıştır.

## Ön Hazırlık

1. **Database Seed**: Seed script'i çalıştırıldı mı kontrol edin
   ```bash
   cd apps/api
   npx prisma db seed
   ```

2. **API Çalışıyor mu**: Backend API'nin çalıştığından emin olun
   ```bash
   cd apps/api
   pnpm dev
   ```

3. **Mobile App Çalışıyor mu**: Mobile uygulamayı başlatın
   ```bash
   cd apps/mobile
   pnpm start
   ```

4. **Test Kullanıcısı**: Aşağıdaki kullanıcılardan biriyle giriş yapın
   - Email: `free@wellness.local` / Password: `free123`
   - Email: `premium@wellness.local` / Password: `premium123`

---

## Test 1: Home Screen - Article Cards

### Amaç
Anasayfada Keşfet bölümünün doğru çalıştığını doğrulayın.

### Adımlar
1. ✅ Uygulamayı açın ve Home ekranına gidin
2. ✅ Aşağı kaydırarak "Keşfet" bölümünü bulun
3. ✅ En az 3-5 article kartı göründüğünü kontrol edin

### Kontrol Listesi
- [ ] Article kartları yatay scroll ile görüntüleniyor mu?
- [ ] Her kartta şunlar var mı:
  - [ ] Başlık (titleTr)
  - [ ] Özet (excerpt)
  - [ ] Kategori badge'i
  - [ ] Okuma süresi (readTimeMin)
  - [ ] Kaydet butonu (kalp ikonu)
- [ ] "Tümünü Gör" butonu görünüyor mu?
- [ ] Kartlar düzgün render ediliyor mu (görsel bozukluk yok)?

### Beklenen Sonuç
✅ Keşfet bölümü anasayfada görünür ve article kartları düzgün şekilde listelenir.

---

## Test 2: Article Card - Save Functionality

### Amaç
Article kartlarındaki kaydetme özelliğinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Home screen'deki bir article kartında kalp ikonuna tıklayın
2. ✅ İkonun dolu hale geldiğini gözlemleyin
3. ✅ Tekrar tıklayın
4. ✅ İkonun boş hale geldiğini gözlemleyin

### Kontrol Listesi
- [ ] Kalp ikonu tıklanınca doluyor mu?
- [ ] Tekrar tıklanınca boşalıyor mu?
- [ ] Animasyon/feedback var mı?
- [ ] API çağrısı başarılı oluyor mu? (Network tab'de kontrol edin)

### Beklenen Sonuç
✅ Save/unsave işlemi sorunsuz çalışır ve görsel feedback verilir.

---

## Test 3: Navigate to Discover Page

### Amaç
"Tümünü Gör" butonunun Discover sayfasına yönlendirdiğini doğrulayın.

### Adımlar
1. ✅ Home screen'de "Tümünü Gör" butonuna tıklayın
2. ✅ Discover sayfasının açıldığını kontrol edin

### Kontrol Listesi
- [ ] Sayfa geçişi sorunsuz mu?
- [ ] Discover sayfası açılıyor mu?
- [ ] Geri butonu çalışıyor mu?

### Beklenen Sonuç
✅ "Tümünü Gör" butonu Discover sayfasına yönlendirir.

---

## Test 4: Discover Page - Tab Navigation

### Amaç
Discover sayfasındaki tab navigation'ın çalıştığını doğrulayın.

### Adımlar
1. ✅ Discover sayfasını açın
2. ✅ "Tümü" ve "Kaydedilenler" tabları arasında geçiş yapın

### Kontrol Listesi
- [ ] İki tab görünüyor mu? (Tümü / Kaydedilenler)
- [ ] Aktif tab vurgulanıyor mu?
- [ ] Tab değiştiğinde içerik değişiyor mu?
- [ ] "Kaydedilenler" tabında sadece kaydedilen makaleler görünüyor mu?

### Beklenen Sonuç
✅ Tab navigation sorunsuz çalışır ve doğru içeriği gösterir.

---

## Test 5: Discover Page - Category Filter

### Amaç
Kategori filtreleme özelliğinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Discover sayfasında kategori filtrelerini görün (yatay scroll)
2. ✅ Bir kategori seçin (örn: "Regl Sağlığı")
3. ✅ Sadece o kategorideki makalelerin göründüğünü kontrol edin
4. ✅ Filtreyi kaldırın (Tümü'ne tıklayın)
5. ✅ Tüm makalelerin tekrar göründüğünü kontrol edin

### Kontrol Listesi
- [ ] Kategori filtreleri yatay scroll ile görünüyor mu?
- [ ] Kategoriler doğru isimlerde mi?
- [ ] Kategori seçilince filtreleme çalışıyor mu?
- [ ] Seçili kategori vurgulanıyor mu?
- [ ] "Tümü" seçeneği var mı ve çalışıyor mu?

### Beklenen Sonuç
✅ Kategori filtreleme doğru çalışır ve sadece ilgili makaleleri gösterir.

---

## Test 6: Discover Page - Search Functionality

### Amaç
Arama özelliğinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Discover sayfasında arama çubuğuna tıklayın
2. ✅ "uyku" yazın
3. ✅ Arama sonuçlarının filtrelendiğini gözlemleyin
4. ✅ Arama çubuğunu temizleyin (X butonuna tıklayın)
5. ✅ Tüm makalelerin tekrar göründüğünü kontrol edin

### Kontrol Listesi
- [ ] Arama çubuğu görünüyor mu?
- [ ] Yazı yazılınca arama çalışıyor mu?
- [ ] Sonuçlar başlık ve içerikte arama yapıyor mu?
- [ ] Debounce çalışıyor mu? (Her tuşta arama yapmıyor)
- [ ] Temizle (X) butonu var mı ve çalışıyor mu?
- [ ] Sonuç bulunamadığında uygun mesaj gösteriliyor mu?

### Beklenen Sonuç
✅ Arama özelliği sorunsuz çalışır ve ilgili sonuçları gösterir.

---

## Test 7: Article Detail Page - Navigation

### Amaç
Article kartına tıklandığında detay sayfasının açıldığını doğrulayın.

### Adımlar
1. ✅ Discover sayfasında veya Home screen'de bir article kartına tıklayın
2. ✅ Article detail sayfasının açıldığını kontrol edin

### Kontrol Listesi
- [ ] Sayfa geçişi sorunsuz mu?
- [ ] Article detail sayfası açılıyor mu?
- [ ] Doğru makale gösteriliyor mu?
- [ ] Geri butonu çalışıyor mu?

### Beklenen Sonuç
✅ Article kartına tıklandığında detay sayfası açılır.

---

## Test 8: Article Detail Page - Content Display

### Amaç
Article detail sayfasının tüm içeriği doğru gösterdiğini doğrulayın.

### Adımlar
1. ✅ Bir article detail sayfasını açın
2. ✅ Sayfayı aşağı kaydırarak tüm içeriği görün

### Kontrol Listesi
- [ ] Hero image (varsa) gösteriliyor mu?
- [ ] Başlık gösteriliyor mu?
- [ ] Kategori badge'i gösteriliyor mu?
- [ ] Okuma süresi gösteriliyor mu?
- [ ] Yazar adı (varsa) gösteriliyor mu?
- [ ] Yayın tarihi gösteriliyor mu?
- [ ] Makale içeriği (markdown) düzgün render ediliyor mu?
- [ ] Başlıklar, listeler, paragraflar doğru formatta mı?
- [ ] Etiketler (tags) gösteriliyor mu?

### Beklenen Sonuç
✅ Article detail sayfası tüm içeriği düzgün şekilde gösterir.

---

## Test 9: Article Detail Page - Save/Unsave

### Amaç
Detay sayfasındaki kaydetme özelliğinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Article detail sayfasında "Kaydet" butonuna tıklayın
2. ✅ Butonun "Kaydedildi" olarak değiştiğini gözlemleyin
3. ✅ Geri dönün ve Discover sayfasında "Kaydedilenler" tabına gidin
4. ✅ Makaleyi orada görün
5. ✅ Tekrar detay sayfasına gidin ve "Kaydedildi" butonuna tıklayın
6. ✅ Makaleyi kayıtlardan kaldırın

### Kontrol Listesi
- [ ] Kaydet butonu görünüyor mu?
- [ ] Tıklandığında durum değişiyor mu?
- [ ] Görsel feedback var mı (ikon değişimi)?
- [ ] Kaydedilen makale "Kaydedilenler" tabında görünüyor mu?
- [ ] Unsave işlemi çalışıyor mu?

### Beklenen Sonuç
✅ Save/unsave işlemi detay sayfasında sorunsuz çalışır.

---

## Test 10: Article Detail Page - Share

### Amaç
Paylaşma özelliğinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Article detail sayfasında "Paylaş" butonuna tıklayın
2. ✅ Native share sheet'in açıldığını gözlemleyin
3. ✅ İptal edin veya bir paylaşım yöntemi seçin

### Kontrol Listesi
- [ ] Paylaş butonu görünüyor mu?
- [ ] Tıklandığında native share sheet açılıyor mu?
- [ ] Paylaşım seçenekleri görünüyor mu?
- [ ] İptal butonu çalışıyor mu?
- [ ] Paylaşım başarılı oluyor mu?

### Beklenen Sonuç
✅ Paylaşma özelliği native share sheet ile çalışır.

---

## Test 11: Article Detail Page - View Tracking

### Amaç
Makale görüntüleme takibinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Bir article detail sayfasını açın
2. ✅ En az 10 saniye sayfada kalın
3. ✅ Geri dönün
4. ✅ Network tab'de `/discover/articles/:id/view` endpoint'ine POST isteği gönderildiğini kontrol edin

### Kontrol Listesi
- [ ] Sayfa açıldığında view tracking çalışıyor mu?
- [ ] API çağrısı başarılı oluyor mu?
- [ ] Okuma süresi (readTimeMs) gönderiliyor mu?

### Beklenen Sonuç
✅ Makale görüntüleme otomatik olarak takip edilir.

---

## Test 12: Article Detail Page - Related Articles

### Amaç
İlgili makaleler bölümünün çalıştığını doğrulayın.

### Adımlar
1. ✅ Article detail sayfasını aşağı kaydırın
2. ✅ "İlgini Çekebilir" bölümünü bulun
3. ✅ İlgili makalelerin listelendiğini görün
4. ✅ Bir ilgili makaleye tıklayın
5. ✅ O makalenin detay sayfasının açıldığını kontrol edin

### Kontrol Listesi
- [ ] "İlgini Çekebilir" başlığı görünüyor mu?
- [ ] İlgili makaleler listeleniyor mu?
- [ ] Makaleler yatay scroll ile görünüyor mu?
- [ ] İlgili makaleye tıklandığında detay sayfası açılıyor mu?
- [ ] İlgili makaleler aynı kategoriden mi?

### Beklenen Sonuç
✅ İlgili makaleler bölümü çalışır ve navigasyon sorunsuz.

---

## Test 13: Personalization - Cycle-Based Content

### Amaç
Döngü bazlı kişiselleştirmenin çalıştığını doğrulayın.

### Adımlar
1. ✅ Kullanıcının döngü bilgisini ayarlayın (Calendar sayfasından)
2. ✅ Home screen'e dönün
3. ✅ Keşfet bölümündeki makalelerin döngü fazına uygun olduğunu kontrol edin

### Kontrol Listesi
- [ ] Menstrüasyon fazında: Ağrı, regl sağlığı makaleleri öncelikli mi?
- [ ] Foliküler fazda: Beslenme, egzersiz makaleleri öncelikli mi?
- [ ] Ovulasyon döneminde: Doğurganlık makaleleri öncelikli mi?
- [ ] Luteal fazda: PMS, ruh sağlığı makaleleri öncelikli mi?

### Beklenen Sonuç
✅ Makale önerileri kullanıcının döngü fazına göre kişiselleştirilir.

---

## Test 14: Personalization - Pregnancy Mode

### Amaç
Hamilelik modunda içerik kişiselleştirmesinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Hamilelik modunu aktif edin (Pregnancy setup)
2. ✅ Home screen'e dönün
3. ✅ Keşfet bölümünde hamilelik makalelerinin öncelikli olduğunu kontrol edin

### Kontrol Listesi
- [ ] Hamilelik kategorisindeki makaleler öncelikli mi?
- [ ] Hamilelik haftasına uygun içerikler mi?
- [ ] Diğer kategoriler de görünüyor mu (tamamen gizlenmiyor)?

### Beklenen Sonuç
✅ Hamilelik modunda hamilelik içerikleri önceliklendirilir.

---

## Test 15: Empty States

### Amaç
Boş durum mesajlarının doğru gösterildiğini doğrulayın.

### Adımlar
1. ✅ "Kaydedilenler" tabına gidin (hiç kayıtlı makale yoksa)
2. ✅ Boş durum mesajını görün
3. ✅ Arama yapın ve sonuç bulunamayan bir terim girin
4. ✅ "Sonuç bulunamadı" mesajını görün

### Kontrol Listesi
- [ ] Kaydedilen makale yoksa uygun mesaj gösteriliyor mu?
- [ ] Arama sonucu yoksa uygun mesaj gösteriliyor mu?
- [ ] Mesajlar kullanıcı dostu mu?
- [ ] İkonlar/görseller var mı?

### Beklenen Sonuç
✅ Boş durumlar için uygun mesajlar gösterilir.

---

## Test 16: Loading States

### Amaç
Yükleme durumlarının doğru gösterildiğini doğrulayın.

### Adımlar
1. ✅ Ağ bağlantısını yavaşlatın (Chrome DevTools - Network throttling)
2. ✅ Discover sayfasını açın
3. ✅ Loading indicator'ı gözlemleyin
4. ✅ Article detail sayfasını açın
5. ✅ Loading state'i gözlemleyin

### Kontrol Listesi
- [ ] Liste yüklenirken loading indicator gösteriliyor mu?
- [ ] Detay sayfası yüklenirken loading gösteriliyor mu?
- [ ] Skeleton loader kullanılıyor mu?
- [ ] Loading süresi makul mu?

### Beklenen Sonuç
✅ Yükleme durumları kullanıcıya net bir şekilde gösterilir.

---

## Test 17: Error Handling

### Amaç
Hata durumlarının doğru yönetildiğini doğrulayın.

### Adımlar
1. ✅ API'yi durdurun
2. ✅ Discover sayfasını yenileyin
3. ✅ Hata mesajını gözlemleyin
4. ✅ API'yi tekrar başlatın
5. ✅ Retry butonuna tıklayın (varsa)

### Kontrol Listesi
- [ ] API hatası durumunda kullanıcı dostu mesaj gösteriliyor mu?
- [ ] Retry mekanizması var mı?
- [ ] Hata mesajı anlaşılır mı?
- [ ] Uygulama crash olmuyor mu?

### Beklenen Sonuç
✅ Hatalar düzgün yönetilir ve kullanıcıya bildirilir.

---

## Test 18: Performance - Infinite Scroll

### Amaç
Sonsuz scroll özelliğinin performanslı çalıştığını doğrulayın.

### Adımlar
1. ✅ Discover sayfasında makale listesini aşağı kaydırın
2. ✅ Sayfa sonuna geldiğinizde yeni makalelerin yüklendiğini gözlemleyin
3. ✅ Hızlı scroll yapın ve performansı test edin

### Kontrol Listesi
- [ ] Sayfa sonuna gelince otomatik yeni makaleler yükleniyor mu?
- [ ] Loading indicator gösteriliyor mu?
- [ ] Scroll performansı iyi mi (lag yok)?
- [ ] Duplicate makaleler yüklenmiyor mu?

### Beklenen Sonuç
✅ Infinite scroll sorunsuz ve performanslı çalışır.

---

## Test 19: Offline Support

### Amaç
Offline durumda uygulamanın davranışını test edin.

### Adımlar
1. ✅ Bir makaleyi açın ve içeriği görün
2. ✅ Ağ bağlantısını kapatın
3. ✅ Geri dönün ve tekrar aynı makaleyi açın
4. ✅ Cache'den yüklendiğini kontrol edin

### Kontrol Listesi
- [ ] Daha önce görüntülenen makaleler cache'den yükleniyor mu?
- [ ] Offline durumda uygun mesaj gösteriliyor mu?
- [ ] Yeni makaleler yüklenmeye çalışılmıyor mu?
- [ ] Uygulama crash olmuyor mu?

### Beklenen Sonuç
✅ Offline durumda cache'lenmiş içerik gösterilir.

---

## Test 20: Multi-Language Support

### Amaç
Çoklu dil desteğinin çalıştığını doğrulayın.

### Adımlar
1. ✅ Uygulama dilini İngilizce'ye değiştirin (Settings)
2. ✅ Discover sayfasına gidin
3. ✅ Makalelerin İngilizce başlıklarla göründüğünü kontrol edin
4. ✅ Bir makale detayını açın
5. ✅ İçeriğin İngilizce olduğunu kontrol edin

### Kontrol Listesi
- [ ] Dil değiştiğinde makale başlıkları değişiyor mu?
- [ ] Makale içeriği doğru dilde mi?
- [ ] UI elementleri (butonlar, başlıklar) doğru dilde mi?
- [ ] Fallback çalışıyor mu? (EN yoksa TR gösteriliyor)

### Beklenen Sonuç
✅ Çoklu dil desteği sorunsuz çalışır.

---

## Özet Kontrol Listesi

### Backend API
- [ ] Tüm endpoint'ler çalışıyor
- [ ] Personalization logic doğru çalışıyor
- [ ] Recommendation engine skorları doğru
- [ ] Interaction tracking çalışıyor

### Mobile UI
- [ ] Home screen entegrasyonu tamamlandı
- [ ] Discover page tüm özelliklerle çalışıyor
- [ ] Article detail page tam fonksiyonel
- [ ] Tüm componentler düzgün render ediliyor

### User Experience
- [ ] Navigation akıcı
- [ ] Loading states uygun
- [ ] Error handling iyi
- [ ] Empty states kullanıcı dostu

### Performance
- [ ] Infinite scroll performanslı
- [ ] Image loading optimize
- [ ] API çağrıları hızlı
- [ ] Cache stratejisi çalışıyor

---

## Bilinen Sorunlar ve Notlar

Testler sırasında karşılaşılan sorunları buraya not edin:

1. 
2. 
3. 

---

## Test Sonucu

- **Test Tarihi**: _______________
- **Test Eden**: _______________
- **Genel Durum**: ⬜ Başarılı / ⬜ Başarısız / ⬜ Kısmi
- **Notlar**: 

---

**Tebrikler!** Tüm testleri tamamladıysanız, Discover Section başarıyla implement edilmiştir! 🎉
