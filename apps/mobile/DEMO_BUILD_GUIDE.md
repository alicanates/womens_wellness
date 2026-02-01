# 📱 Demo Build Rehberi - iOS & Android

Bu rehber, Kadın Atlası uygulamasını arkadaşlarınızla test etmek için iOS ve Android demo build'lerini nasıl oluşturacağınızı gösterir.

## 🎯 Genel Bakış

- **iOS**: TestFlight üzerinden dağıtım (100 test kullanıcısı)
- **Android**: APK dosyası ile direkt kurulum (sınırsız)

## 📋 Ön Gereksinimler

### 1. EAS CLI Kurulumu
```bash
npm install -g eas-cli
```

### 2. Expo Hesabına Giriş
```bash
eas login
```

### 3. Apple Developer Hesabı (iOS için)
- Apple Developer Program üyeliği ($99/yıl)
- https://developer.apple.com

### 4. Google Play Console Hesabı (Android için - Opsiyonel)
- Play Console hesabı ($25 tek seferlik)
- https://play.google.com/console

## 🍎 iOS Demo Build (TestFlight)

### Adım 1: iOS Build Başlat
```bash
cd apps/mobile
eas build --platform ios --profile demo
```

### Adım 2: Apple Developer Credentials
Build sırasında EAS sizden şunları isteyecek:
- Apple ID
- App-specific password (2FA için)
- Bundle identifier onayı

EAS otomatik olarak:
- Provisioning profile oluşturur
- Signing certificate'leri yönetir
- App Store Connect'e yükler

### Adım 3: TestFlight'a Yükleme
Build tamamlandıktan sonra:

```bash
eas submit --platform ios --profile demo
```

Ya da manuel olarak:
1. EAS Dashboard'dan IPA dosyasını indirin
2. App Store Connect > TestFlight'a gidin
3. IPA'yı yükleyin

### Adım 4: Test Kullanıcıları Ekleme

**App Store Connect'te:**
1. TestFlight sekmesine gidin
2. "Internal Testing" veya "External Testing" seçin
3. Test kullanıcılarının email adreslerini ekleyin
4. Kullanıcılar davet emaili alacak

**Test kullanıcıları için:**
1. TestFlight uygulamasını App Store'dan indirin
2. Davet emailindeki linke tıklayın
3. TestFlight'ta uygulamayı yükleyin

## 🤖 Android Demo Build (APK)

### Adım 1: Android Build Başlat
```bash
cd apps/mobile
eas build --platform android --profile demo
```

### Adım 2: APK İndirme
Build tamamlandığında:

**Seçenek A - EAS CLI ile:**
```bash
# Build ID'yi alın
eas build:list

# APK'yı indirin
eas build:download --id <BUILD_ID>
```

**Seçenek B - Dashboard'dan:**
1. https://expo.dev/accounts/meoacar/projects/kadinatlasi/builds
2. Son build'i bulun
3. "Download" butonuna tıklayın

### Adım 3: APK Dağıtımı

**Seçenek 1 - Direkt Paylaşım:**
- APK dosyasını Google Drive, Dropbox veya WeTransfer ile paylaşın
- Test kullanıcıları APK'yı indirip kuracak

**Seçenek 2 - Firebase App Distribution (Önerilen):**
```bash
# Firebase CLI kurulumu
npm install -g firebase-tools

# Firebase'e giriş
firebase login

# APK'yı yükle
firebase appdistribution:distribute app-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "testers" \
  --release-notes "Demo sürümü - Test için"
```

**Seçenek 3 - Google Drive + QR Kod:**
1. APK'yı Google Drive'a yükleyin
2. Linki herkese açık yapın
3. QR kod oluşturun (https://qr-code-generator.com)
4. QR kodu paylaşın

### Adım 4: Android'de Kurulum (Test Kullanıcıları İçin)

1. **Bilinmeyen Kaynaklara İzin:**
   - Ayarlar > Güvenlik > Bilinmeyen Kaynaklar
   - Ya da kurulum sırasında izin verin

2. **APK'yı İndirin ve Kurun:**
   - Paylaşılan linkten APK'yı indirin
   - İndirilen dosyaya tıklayın
   - "Yükle" butonuna basın

## 🚀 Hızlı Başlangıç Komutları

### Her İki Platform İçin Aynı Anda Build
```bash
cd apps/mobile
eas build --platform all --profile demo
```

### Build Durumunu Kontrol Etme
```bash
eas build:list
```

### Build Loglarını Görüntüleme
```bash
eas build:view <BUILD_ID>
```

## 📝 Test Kullanıcıları İçin Talimatlar

### iOS (TestFlight)
```
1. TestFlight uygulamasını App Store'dan indirin
2. Size gelen davet emailindeki linke tıklayın
3. TestFlight'ta "Kadın Atlası" uygulamasını bulun
4. "Yükle" butonuna basın
5. Uygulamayı açın ve test edin
```

### Android (APK)
```
1. Paylaşılan linkten APK dosyasını indirin
2. İndirilen dosyaya tıklayın
3. "Bilinmeyen kaynaklardan yükleme" iznini verin
4. "Yükle" butonuna basın
5. Uygulamayı açın ve test edin
```

## 🔧 Sorun Giderme

### iOS Build Hataları

**"No valid code signing identity found"**
```bash
# Credentials'ları sıfırlayın
eas credentials --platform ios
```

**"Bundle identifier already exists"**
- app.json'da bundleIdentifier'ı değiştirin
- Örnek: `com.wellness.companion.demo`

### Android Build Hataları

**"Build failed with Gradle error"**
```bash
# Cache'i temizleyin
cd apps/mobile
rm -rf node_modules
npm install
```

**"APK too large"**
- eas.json'da `android.buildType: "apk"` yerine `"aab"` kullanın
- Ancak AAB dosyaları Play Store gerektirir

### Genel Sorunlar

**"Build queue is full"**
- Expo'nun ücretsiz planında build sırası olabilir
- Birkaç dakika bekleyin veya ücretli plana geçin

**"Environment variables not found"**
```bash
# .env dosyasını kontrol edin
cd apps/mobile
cat .env

# Gerekirse eas.json'da env değişkenlerini ekleyin
```

## 📊 Build Profilleri

### Demo Profile (Önerilen)
- Internal distribution
- Production API kullanır
- Test için optimize edilmiş
- Hızlı build süresi

### Preview Profile
- Internal distribution
- Staging API kullanabilir
- Daha fazla debug bilgisi

### Production Profile
- Store submission için
- Tam optimize edilmiş
- Production API

## 🔐 Güvenlik Notları

1. **API Keys**: Demo build'lerde production API kullanıyorsanız, rate limiting ekleyin
2. **Test Kullanıcıları**: Güvenilir kişilerle paylaşın
3. **Sürüm Kontrolü**: Her demo build için version number'ı artırın
4. **Geri Bildirim**: Test kullanıcılarından feedback toplamak için form hazırlayın

## 📱 Test Senaryoları

Test kullanıcılarınıza şu senaryoları test etmelerini söyleyin:

### Temel Özellikler
- [ ] Kayıt olma ve giriş yapma
- [ ] Profil oluşturma
- [ ] Ana sayfa navigasyonu
- [ ] Bildirimler

### Regl Takibi
- [ ] Regl başlangıç tarihi ekleme
- [ ] Takvim görünümü
- [ ] Tahmin doğruluğu

### Hamilelik Modu
- [ ] Hamilelik modu aktivasyonu
- [ ] Haftalık takip
- [ ] Kontraksiyon sayacı

### Chat & AI
- [ ] AI asistan ile sohbet
- [ ] Soru sorma
- [ ] Cevap kalitesi

### Premium Özellikler
- [ ] Premium ekranı görüntüleme
- [ ] Abonelik paketleri
- [ ] Satın alma akışı (test modu)

## 📈 Feedback Toplama

### Google Forms Şablonu
```
1. Hangi cihazı kullanıyorsunuz? (iOS/Android, model)
2. Uygulama açılış hızı nasıl? (1-5)
3. Hangi özelliği test ettiniz?
4. Karşılaştığınız sorunlar?
5. Beğendiğiniz özellikler?
6. İyileştirme önerileri?
7. Genel puan (1-10)?
```

### TestFlight Feedback (iOS)
- TestFlight uygulaması içinden screenshot ile feedback gönderilebilir
- App Store Connect'te görüntülenebilir

## 🎉 Başarılı Dağıtım Checklist

- [ ] iOS build tamamlandı
- [ ] Android build tamamlandı
- [ ] TestFlight'a yüklendi (iOS)
- [ ] APK indirildi (Android)
- [ ] Test kullanıcıları eklendi
- [ ] Davet emaili gönderildi
- [ ] Test talimatları paylaşıldı
- [ ] Feedback formu hazırlandı
- [ ] Test süresi belirlendi (örn: 1 hafta)

## 📞 Destek

Sorun yaşarsanız:
1. Build loglarını kontrol edin: `eas build:view <BUILD_ID>`
2. Expo documentation: https://docs.expo.dev/build/introduction/
3. Expo Discord: https://chat.expo.dev/

## 🔄 Güncelleme Yayınlama

Yeni bir demo sürümü için:

```bash
# Version number'ı artırın (app.json)
# Örnek: 1.0.0 -> 1.0.1

# Yeni build başlatın
eas build --platform all --profile demo

# TestFlight otomatik günceller
# Android için yeni APK paylaşın
```

---

**Not**: İlk build 20-30 dakika sürebilir. Sonraki build'ler daha hızlı olacaktır.
