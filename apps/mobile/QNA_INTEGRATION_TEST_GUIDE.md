# QnA Mobile Integration Test Guide

Bu doküman, QnA Community özelliğinin mobile tarafında yapılması gereken entegrasyon testlerini açıklar.

## Test Ortamı Hazırlığı

### 1. Backend API'nin Çalışır Durumda Olması

```bash
cd apps/api
pnpm dev
```

API'nin `http://localhost:3000` adresinde çalıştığından emin olun.

### 2. Test Kullanıcıları Oluşturma

Backend e2e testleri otomatik olarak test kullanıcıları oluşturur. Manuel test için:

```bash
cd apps/api
npx ts-node scripts/create-test-user.ts
```

### 3. Mobile App'i Test Modunda Çalıştırma

```bash
cd apps/mobile
pnpm start
```

## Manuel Entegrasyon Test Senaryoları

### Senaryo 1: Soru Oluşturma ve Görüntüleme

**Adımlar:**
1. Uygulamayı açın ve giriş yapın
2. Community tab'ına gidin
3. "Soru Sor" butonuna tıklayın
4. Formu doldurun:
   - Başlık: "Hamilelikte hangi vitaminleri almalıyım?"
   - İçerik: "3 aylık hamileyim, vitamin önerileri istiyorum"
   - Kategori: Hamilelik
   - Etiketler: vitamin, hamilelik
5. "Gönder" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Soru başarıyla oluşturulmalı
- ✅ Soru detay sayfasına yönlendirilmeli
- ✅ Soru listesinde görünmeli
- ✅ Quota sayacı güncellenmiş olmalı

**API Endpoint:** `POST /qna/questions`

---

### Senaryo 2: Anonim Soru Oluşturma

**Adımlar:**
1. Community tab'ında "Soru Sor" butonuna tıklayın
2. "Anonim olarak sor" toggle'ını aktif edin
3. Soruyu oluşturun
4. Soru detayına gidin

**Beklenen Sonuç:**
- ✅ Kullanıcı adı yerine "Anonim Kullanıcı" görünmeli
- ✅ Profil resmi genel avatar olmalı
- ✅ Kendi sorunuzda "Bu sizin sorunuz" göstergesi olmalı

**API Endpoint:** `POST /qna/questions` (isAnonymous: true)

---

### Senaryo 3: Cevap Verme ve En İyi Cevap Seçme

**Adımlar:**
1. Bir soruya gidin
2. Cevap yazma alanına tıklayın
3. Cevap yazın: "Folik asit, demir ve D vitamini önemlidir"
4. "Gönder" butonuna tıklayın
5. Soru sahibi olarak giriş yapın
6. Cevabın yanındaki "En İyi Cevap" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Cevap başarıyla oluşturulmalı
- ✅ Cevap listesinde görünmeli
- ✅ En iyi cevap işareti görünmeli
- ✅ En iyi cevap en üstte olmalı
- ✅ Soru durumu "Cevaplanmış" olmalı

**API Endpoints:** 
- `POST /qna/questions/:id/answers`
- `POST /qna/answers/:id/mark-best`

---

### Senaryo 4: Oylama Sistemi

**Adımlar:**
1. Bir cevaba gidin
2. Upvote butonuna tıklayın
3. Oy sayısının arttığını gözlemleyin
4. Downvote butonuna tıklayın
5. Oy sayısının azaldığını gözlemleyin
6. Tekrar aynı butona tıklayın (oy geri çekme)

**Beklenen Sonuç:**
- ✅ Upvote sonrası oy sayısı artmalı
- ✅ Downvote sonrası oy sayısı azalmalı
- ✅ Tekrar tıklayınca oy geri çekilmeli
- ✅ Kendi cevabınıza oy verememelisiniz
- ✅ Optimistic update çalışmalı (anında UI güncellemesi)

**API Endpoints:**
- `POST /qna/answers/:id/vote`
- `DELETE /qna/answers/:id/vote`

---

### Senaryo 5: Yorum Yapma

**Adımlar:**
1. Bir soruya veya cevaba gidin
2. "Yorum Yap" butonuna tıklayın
3. Yorum yazın (max 300 karakter)
4. "Gönder" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Yorum başarıyla eklenmeli
- ✅ Yorum listesinde görünmeli
- ✅ 300 karakterden uzun yorumlar reddedilmeli
- ✅ Karakter sayacı çalışmalı

**API Endpoints:**
- `POST /qna/questions/:id/comments`
- `POST /qna/answers/:id/comments`

---

### Senaryo 6: Favorileme ve Takip Etme

**Adımlar:**
1. Bir soruya gidin
2. Favori ikonuna tıklayın
3. "Favorilerim" sayfasına gidin
4. Sorunun listelendiğini kontrol edin
5. Takip et butonuna tıklayın
6. "Takip Ettiklerim" sayfasına gidin

**Beklenen Sonuç:**
- ✅ Favori ikonu dolu olmalı
- ✅ Favoriler sayfasında soru görünmeli
- ✅ Takip edilen sorulara yeni cevap gelince bildirim alınmalı
- ✅ Optimistic update çalışmalı

**API Endpoints:**
- `POST /qna/questions/:id/favorite`
- `POST /qna/questions/:id/follow`
- `GET /qna/questions/favorites`
- `GET /qna/questions/following`

---

### Senaryo 7: Kullanıcı Takip Etme

**Adımlar:**
1. Bir kullanıcının profiline gidin
2. "Takip Et" butonuna tıklayın
3. Kullanıcının yeni soru sormasını bekleyin
4. Bildirim alındığını kontrol edin

**Beklenen Sonuç:**
- ✅ Takip butonu "Takip Ediliyor" olmalı
- ✅ Takipçi sayısı artmalı
- ✅ Takip edilen kullanıcının aktiviteleri bildirim olarak gelmeli

**API Endpoints:**
- `POST /qna/users/:id/follow`
- `GET /qna/users/:id/followers`

---

### Senaryo 8: Arama ve Filtreleme

**Adımlar:**
1. Community ana sayfasında arama çubuğuna tıklayın
2. "vitamin" kelimesini aratın
3. Kategori filtresinden "Hamilelik" seçin
4. Sıralama seçeneğinden "Popüler" seçin
5. Etiket filtresinden "beslenme" seçin

**Beklenen Sonuç:**
- ✅ Arama sonuçları anında güncellenmeli
- ✅ Filtreler doğru çalışmalı
- ✅ Sıralama seçenekleri etkili olmalı
- ✅ Birden fazla filtre birlikte çalışmalı

**API Endpoint:** `GET /qna/questions` (query params ile)

---

### Senaryo 9: İtibar Sistemi

**Adımlar:**
1. Profil sayfanıza gidin
2. İtibar puanınızı kontrol edin
3. Bir cevap verin ve en iyi cevap seçilmesini bekleyin
4. İtibar puanının arttığını gözlemleyin
5. Rozetler sayfasına gidin

**Beklenen Sonuç:**
- ✅ İtibar puanı doğru hesaplanmalı
- ✅ En iyi cevap seçilince +15 puan eklenmeli
- ✅ Upvote alınca +5 puan eklenmeli
- ✅ Kazanılan rozetler görünmeli
- ✅ Liderlik tablosunda sıralama doğru olmalı

**API Endpoints:**
- `GET /qna/reputation/me`
- `GET /qna/reputation/badges`
- `GET /qna/reputation/leaderboard`

---

### Senaryo 10: Bildirimler

**Adımlar:**
1. Bir soru sorun
2. Başka bir kullanıcı cevap versin
3. Bildirim alındığını kontrol edin
4. Bildirime tıklayın
5. Soru detay sayfasına yönlendirildiğinizi kontrol edin

**Beklenen Sonuç:**
- ✅ Yeni cevap bildirimi gelmeli
- ✅ En iyi cevap seçilince bildirim gelmeli
- ✅ Upvote alınca bildirim gelmeli
- ✅ Yorum yapılınca bildirim gelmeli
- ✅ Deep linking çalışmalı

**API Endpoint:** Push notification sistemi

---

### Senaryo 11: Paylaşım

**Adımlar:**
1. Bir soruya gidin
2. Paylaş butonuna tıklayın
3. Paylaşım seçeneklerini görün
4. "Linki Kopyala" seçeneğini seçin
5. Link'in panoya kopyalandığını kontrol edin

**Beklenen Sonuç:**
- ✅ Paylaşım sheet açılmalı
- ✅ Sosyal medya seçenekleri görünmeli
- ✅ Link kopyalama çalışmalı
- ✅ Paylaşılan link doğru sayfaya yönlendirmeli

**API Endpoints:**
- `GET /qna/questions/:id/share-link`
- `GET /qna/questions/:id/share-metadata`

---

### Senaryo 12: İçerik Raporlama

**Adımlar:**
1. Bir soruya veya cevaba gidin
2. Üç nokta menüsüne tıklayın
3. "Raporla" seçeneğini seçin
4. Rapor nedenini seçin
5. Açıklama yazın
6. "Gönder" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Rapor modal'ı açılmalı
- ✅ Rapor nedenleri listelenmiş olmalı
- ✅ Rapor başarıyla gönderilmeli
- ✅ Onay mesajı görünmeli

**API Endpoint:** `POST /qna/moderation/report`

---

### Senaryo 13: Quota Kontrolü

**Adımlar:**
1. Ücretsiz kullanıcı olarak giriş yapın
2. 5 soru sorun
3. 6. soruyu sormaya çalışın
4. Quota aşıldı mesajını görün
5. Premium upgrade prompt'unu kontrol edin

**Beklenen Sonuç:**
- ✅ 5. soruya kadar izin verilmeli
- ✅ 6. soruda hata mesajı görünmeli
- ✅ Premium upgrade prompt gösterilmeli
- ✅ Kalan soru hakkı gösterilmeli

**API Endpoint:** `POST /qna/questions` (quota kontrolü ile)

---

### Senaryo 14: Offline Mod

**Adımlar:**
1. Uygulamayı açın ve soruları görüntüleyin
2. İnternet bağlantısını kapatın
3. Soruları görüntülemeye devam edin (cache'den)
4. Yeni bir soru yazmaya başlayın
5. Taslak olarak kaydedin
6. İnternet bağlantısını açın
7. Taslağı gönderin

**Beklenen Sonuç:**
- ✅ Cache'lenmiş içerik offline görüntülenebilmeli
- ✅ Taslaklar local storage'da saklanmalı
- ✅ Online olunca taslaklar gönderilebilmeli
- ✅ Offline durumu kullanıcıya bildirilmeli

---

### Senaryo 15: Performance Test

**Adımlar:**
1. Uzun bir soru listesini scroll edin
2. Infinite scroll'un çalıştığını kontrol edin
3. Resimlerin lazy load olduğunu gözlemleyin
4. Arama yaparken debounce çalıştığını kontrol edin

**Beklenen Sonuç:**
- ✅ Scroll performansı akıcı olmalı
- ✅ Yeni sayfa otomatik yüklenmeli
- ✅ Resimler görünür olunca yüklenmeli
- ✅ Arama her tuşta değil, durduğunda tetiklenmeli

---

## Otomatik Test Çalıştırma

### Backend E2E Testleri

```bash
cd apps/api
./src/qna/run-e2e-test.sh
```

### Test Sonuçları

Test sonuçları şu kategorilerde raporlanır:

1. **Question Flow Tests** - Soru oluşturma, güncelleme, silme
2. **Answer Flow Tests** - Cevap verme, en iyi cevap seçme
3. **Voting Tests** - Oylama sistemi
4. **Comment Tests** - Yorum yapma
5. **Interaction Tests** - Favorileme, takip etme
6. **Reputation Tests** - İtibar hesaplama
7. **Search Tests** - Arama ve filtreleme
8. **Moderation Tests** - İçerik raporlama
9. **Quota Tests** - Soru limiti kontrolü
10. **Sharing Tests** - Paylaşım linkleri
11. **Analytics Tests** - İstatistikler
12. **Error Tests** - Hata senaryoları
13. **Performance Tests** - Performans testleri

## Test Coverage Hedefleri

- ✅ **API Contract Tests**: Tüm endpoint'ler test edildi
- ✅ **End-to-End Flows**: Kritik kullanıcı akışları test edildi
- ✅ **Error Scenarios**: Hata durumları test edildi
- ✅ **Performance**: Temel performans testleri yapıldı
- ⚠️  **Mobile E2E**: Manuel test senaryoları dokümante edildi
- ⚠️  **Load Testing**: Yük testleri ayrı bir araçla yapılmalı

## Bilinen Sınırlamalar

1. **Admin Endpoints**: Admin rolleri için ayrı test kullanıcısı gerekli
2. **Push Notifications**: Gerçek push notification testleri manuel yapılmalı
3. **Payment Integration**: Premium özellikler için ödeme entegrasyonu test edilmeli
4. **Load Testing**: Yüksek yük testleri için Apache JMeter veya k6 kullanılmalı

## Sorun Giderme

### Test Başarısız Olursa

1. **Database Bağlantısı**: PostgreSQL'in çalıştığından emin olun
2. **API Server**: Backend API'nin çalıştığından emin olun
3. **Environment Variables**: `.env` dosyasının doğru yapılandırıldığından emin olun
4. **Database Migration**: Prisma migration'ların güncel olduğundan emin olun

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### Test Veritabanını Temizleme

```bash
cd apps/api
npx prisma migrate reset
```

## Sonraki Adımlar

1. ✅ Backend E2E testleri tamamlandı
2. ⏳ Mobile E2E testleri için Detox veya Maestro kurulumu
3. ⏳ CI/CD pipeline'a test entegrasyonu
4. ⏳ Performance monitoring ve alerting
5. ⏳ Load testing senaryoları

## İletişim

Test ile ilgili sorularınız için:
- Backend: `apps/api/src/qna/qna.e2e.spec.ts`
- Mobile: Bu doküman
- Dokümantasyon: `.kiro/specs/qna-community/`
