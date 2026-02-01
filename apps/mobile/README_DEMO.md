# 🚀 Kadın Atlası - Demo Dağıtım Rehberi

Arkadaşlarınızla iOS ve Android'de test etmek için hazır!

## 📚 Dokümantasyon

Bu klasörde demo build ve test için ihtiyacınız olan tüm dökümanlar var:

### 🎯 Sizin İçin (Geliştirici)

1. **[DEMO_BUILD_GUIDE.md](./DEMO_BUILD_GUIDE.md)** ⭐ EN ÖNEMLİ
   - iOS ve Android build adımları
   - TestFlight kurulumu
   - APK dağıtımı
   - Sorun giderme
   - **Buradan başlayın!**

2. **[DEMO_CHECKLIST.md](./DEMO_CHECKLIST.md)**
   - Adım adım checklist
   - Hiçbir şeyi atlamayın
   - Build durumu takibi

3. **[FEEDBACK_FORM_TEMPLATE.md](./FEEDBACK_FORM_TEMPLATE.md)**
   - Google Forms şablonu
   - Feedback toplama stratejisi
   - Analiz önerileri

### 👥 Test Kullanıcıları İçin

4. **[TEST_KULLANICI_TALIMATLARI.md](./TEST_KULLANICI_TALIMATLARI.md)**
   - iOS kurulum (TestFlight)
   - Android kurulum (APK)
   - Test senaryoları
   - SSS
   - **Bunu test kullanıcılarınıza gönderin!**

## ⚡ Hızlı Başlangıç

### 1. Hazırlık (5 dakika)

```bash
# EAS CLI kur
npm install -g eas-cli

# Expo'ya giriş yap
eas login

# Proje klasörüne git
cd apps/mobile
```

### 2. Build Başlat (1 komut!)

```bash
# Otomatik script (önerilen)
npm run build:demo

# Ya da manuel
npm run build:demo:ios      # Sadece iOS
npm run build:demo:android  # Sadece Android
npm run build:demo:all      # Her ikisi
```

### 3. Bekle (15-30 dakika)

Build sırasında:
- ☕ Kahve molası verin
- 📋 Feedback formu hazırlayın
- 📝 Test kullanıcı listesi yapın

### 4. Dağıt

**iOS:**
- TestFlight'a otomatik yüklenir
- App Store Connect'ten test kullanıcıları ekleyin

**Android:**
```bash
# APK'yı indir
npm run build:download

# Google Drive'a yükle ve paylaş
```

### 5. Test Kullanıcılarına Gönder

```
Konu: Kadın Atlası Uygulaması Test Daveti 🎉

Merhaba!

Kadın Atlası uygulamasını test etmek için davet edildiniz!

📱 iOS Kullanıcıları:
- TestFlight davet linki: [LINK]
- Talimatlar: [TEST_KULLANICI_TALIMATLARI.md linki]

🤖 Android Kullanıcıları:
- APK indirme linki: [LINK]
- Talimatlar: [TEST_KULLANICI_TALIMATLARI.md linki]

📝 Feedback Formu: [Google Forms linki]

Test süresi: 1 hafta
Sorularınız için: [İletişim bilginiz]

Teşekkürler! 🙏
```

## 📱 Platform Özellikleri

### iOS (TestFlight)
✅ Profesyonel görünüm
✅ Kolay güncelleme
✅ Otomatik bildirimler
✅ 100 test kullanıcısı
✅ 90 gün test süresi
❌ Apple Developer hesabı gerekli ($99/yıl)
❌ İlk build 30 dakika sürebilir

### Android (APK)
✅ Hızlı dağıtım
✅ Sınırsız kullanıcı
✅ Ücretsiz
✅ Direkt kurulum
❌ "Bilinmeyen kaynaklar" izni gerekli
❌ Manuel güncelleme

## 🎯 Test Hedefleri

Test kullanıcılarınızdan şunları test etmelerini isteyin:

### Kritik Özellikler
- [ ] Kayıt olma ve giriş
- [ ] Profil oluşturma
- [ ] Regl takibi
- [ ] AI asistan

### İkincil Özellikler
- [ ] Hamilelik modu
- [ ] Bildirimler
- [ ] Keşfet bölümü
- [ ] Premium ekranı

### Teknik
- [ ] Uygulama açılış hızı
- [ ] Sayfa geçişleri
- [ ] Çökme/donma
- [ ] Offline çalışma

## 📊 Başarı Kriterleri

İyi bir test için:
- ✅ En az 5 test kullanıcısı
- ✅ Her platform için en az 2 kullanıcı
- ✅ En az 3 gün test süresi
- ✅ Her kullanıcıdan feedback
- ✅ Kritik buglar tespit edildi
- ✅ İyileştirme önerileri toplandı

## 🔧 Yararlı Komutlar

```bash
# Build durumu
npm run build:list

# Build detayları
eas build:view <BUILD_ID>

# APK indir
npm run build:download

# Yeni build (güncelleme)
npm run build:demo:all

# Build iptal et
eas build:cancel
```

## 📞 Yardım

### Dokümantasyon
- [DEMO_BUILD_GUIDE.md](./DEMO_BUILD_GUIDE.md) - Detaylı rehber
- [DEMO_CHECKLIST.md](./DEMO_CHECKLIST.md) - Adım adım checklist
- [Expo Docs](https://docs.expo.dev/build/introduction/)

### Sorun Giderme
- Build başarısız: `DEMO_BUILD_GUIDE.md` > Sorun Giderme
- TestFlight sorunları: Apple Developer Support
- APK kurulmuyor: `TEST_KULLANICI_TALIMATLARI.md` > SSS

### Topluluk
- [Expo Discord](https://chat.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

## 🎉 Başarı Hikayeleri

Build tamamlandığında:
1. ✅ iOS ve Android build'leri hazır
2. ✅ Test kullanıcıları uygulamayı kullanıyor
3. ✅ Feedback geliyor
4. ✅ Buglar tespit ediliyor
5. ✅ Uygulama gelişiyor!

## 📈 Sonraki Adımlar

Test tamamlandıktan sonra:
1. Feedback'leri analiz edin
2. Kritik bugları düzeltin
3. İyileştirmeleri yapın
4. Yeni test turu başlatın
5. Production'a hazırlanın!

---

## 🚀 Hemen Başla!

```bash
cd apps/mobile
npm run build:demo
```

**Kolay gelsin! 🎊**

---

## 📝 Notlar

- İlk build 20-30 dakika sürebilir
- Sonraki build'ler daha hızlı olur
- TestFlight otomatik günceller
- Android için yeni APK paylaşmanız gerekir
- Version number'ı her build'de artırın

## 🔒 Güvenlik

- Test build'lerde production API kullanıyorsanız rate limiting ekleyin
- Test kullanıcılarını güvenilir kişilerle sınırlayın
- Hassas verileri test ortamında kullanmayın
- Test sonunda test verilerini temizleyin

---

**Sorularınız mı var?** `DEMO_BUILD_GUIDE.md` dosyasına bakın veya Expo Discord'a katılın!
