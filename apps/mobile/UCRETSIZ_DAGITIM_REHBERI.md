# 🆓 Ücretsiz Demo Dağıtım Rehberi

Apple Developer ve Google Play Console'a para ödemeden arkadaşlarınızla test etmenin yolları.

## 🎯 Ücretsiz Seçenekler

### ✅ 1. Expo Go (EN KOLAY - ÖNERİLEN)

**Avantajlar:**
- ✅ Tamamen ücretsiz
- ✅ Hem iOS hem Android
- ✅ Saniyeler içinde paylaşım
- ✅ QR kod ile kurulum
- ✅ Otomatik güncelleme
- ✅ Hiçbir hesap gerekmez

**Dezavantajlar:**
- ❌ Expo Go uygulaması gerekli
- ❌ Native modüller sınırlı (IAP çalışmaz)
- ❌ Bildirimler sınırlı

**Nasıl Yapılır:**

```bash
cd apps/mobile

# Development server başlat
npm run dev

# QR kod ekranda görünecek
```

**Test Kullanıcıları İçin:**
1. App Store/Play Store'dan "Expo Go" uygulamasını indirin
2. QR kodu tarayın
3. Uygulama açılır!

**Link ile Paylaşım:**
```bash
# Tunnel modu (internet üzerinden erişim)
npx expo start --tunnel

# Link paylaşın: exp://xxx.xxx.xxx.xxx:8081
```

---

### ✅ 2. Expo Development Build (ÖNERİLEN - TAM ÖZELLİKLİ)

**Avantajlar:**
- ✅ Tamamen ücretsiz
- ✅ Tüm native özellikler çalışır
- ✅ Bildirimler, IAP, vb. çalışır
- ✅ QR kod ile güncelleme
- ✅ Production benzeri

**Dezavantajlar:**
- ❌ İlk kurulum için APK/IPA gerekli
- ❌ iOS için Mac gerekli (ya da EAS Build)

**Nasıl Yapılır:**

```bash
cd apps/mobile

# Development build oluştur (ücretsiz)
eas build --profile development --platform android

# Build tamamlandığında APK'yı indir
eas build:download

# APK'yı Google Drive'a yükle ve paylaş
```

**Sonra:**
```bash
# Development server başlat
npm run dev

# Test kullanıcıları APK'yı kurduktan sonra QR kod ile bağlanır
```

---

### ✅ 3. Android APK Direkt Dağıtım (SADECE ANDROID)

**Avantajlar:**
- ✅ Tamamen ücretsiz
- ✅ Tüm özellikler çalışır
- ✅ Standalone uygulama
- ✅ Internet gerekmez

**Dezavantajlar:**
- ❌ Sadece Android
- ❌ Her güncelleme için yeni APK
- ❌ "Bilinmeyen kaynaklar" izni

**Nasıl Yapılır:**

```bash
cd apps/mobile

# Preview build (ücretsiz)
eas build --profile preview --platform android

# APK'yı indir
eas build:download

# Google Drive/Dropbox'a yükle
```

---

### ✅ 4. Firebase App Distribution (ÖNERİLEN - PROFESYONEL)

**Avantajlar:**
- ✅ Tamamen ücretsiz
- ✅ Hem iOS hem Android
- ✅ Email ile davet
- ✅ Otomatik güncelleme bildirimi
- ✅ Kullanıcı yönetimi
- ✅ Crash raporları

**Dezavantajlar:**
- ❌ Firebase hesabı gerekli (ücretsiz)
- ❌ İlk kurulum biraz karmaşık

**Nasıl Yapılır:**

1. **Firebase Projesi Oluştur:**
   - https://console.firebase.google.com
   - "Add project" > Proje adı girin
   - Google Analytics opsiyonel

2. **Firebase CLI Kur:**
```bash
npm install -g firebase-tools
firebase login
```

3. **Build Oluştur:**
```bash
cd apps/mobile

# Android
eas build --profile preview --platform android

# iOS (Mac'te local build)
eas build --profile preview --platform ios --local
```

4. **Firebase'e Yükle:**
```bash
# Android
firebase appdistribution:distribute \
  path/to/app.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "testers" \
  --release-notes "Test sürümü v1.0"

# iOS
firebase appdistribution:distribute \
  path/to/app.ipa \
  --app YOUR_FIREBASE_APP_ID \
  --groups "testers" \
  --release-notes "Test sürümü v1.0"
```

5. **Test Kullanıcıları Ekle:**
   - Firebase Console > App Distribution
   - "Testers & Groups" > Email adresleri ekle
   - Otomatik davet emaili gönderilir

---

### ✅ 5. Expo EAS Update (GÜNCELLEME İÇİN)

**Avantajlar:**
- ✅ Ücretsiz (25 update/ay)
- ✅ Anında güncelleme
- ✅ Build gerekmez
- ✅ JavaScript değişiklikleri

**Dezavantajlar:**
- ❌ Native kod değişiklikleri için çalışmaz
- ❌ İlk kurulum için build gerekli

**Nasıl Yapılır:**

```bash
# İlk build (bir kez)
eas build --profile preview --platform all

# Sonra sadece update gönderin
eas update --branch preview --message "Bug fixes"
```

---

## 🎯 Hangi Yöntemi Seçmeliyim?

### Hızlı Test İçin (1-2 gün)
→ **Expo Go** kullanın
```bash
npm run dev
# QR kodu paylaşın
```

### Tam Özellikli Test İçin (1 hafta+)
→ **Development Build + EAS Update**
```bash
# İlk kurulum
eas build --profile development --platform android
# APK'yı paylaşın

# Güncellemeler
npm run dev  # QR kod ile
```

### Profesyonel Test İçin
→ **Firebase App Distribution**
- Email ile davet
- Otomatik güncelleme
- Kullanıcı yönetimi

### Sadece Android
→ **APK Direkt Dağıtım**
```bash
eas build --profile preview --platform android
# Google Drive'a yükle
```

---

## 📱 Detaylı Kurulum: Expo Go (EN KOLAY)

### 1. Projeyi Hazırlayın

```bash
cd apps/mobile

# .env dosyasını kontrol edin
cat .env

# API URL'in doğru olduğundan emin olun
# EXPO_PUBLIC_API_BASE_URL=https://api.kadinatlasi.com
```

### 2. Development Server Başlatın

```bash
# Local network (aynı WiFi'de)
npm run dev

# Ya da tunnel modu (internet üzerinden)
npx expo start --tunnel
```

### 3. QR Kodu Paylaşın

Terminal'de görünen QR kodu:
- Screenshot alın
- WhatsApp/Telegram'da paylaşın
- Ya da linki kopyalayın

### 4. Test Kullanıcıları İçin Talimatlar

**iOS:**
1. App Store'dan "Expo Go" indirin
2. Expo Go'yu açın
3. "Scan QR Code" butonuna basın
4. QR kodu tarayın

**Android:**
1. Play Store'dan "Expo Go" indirin
2. Expo Go'yu açın
3. "Scan QR Code" butonuna basın
4. QR kodu tarayın

---

## 📱 Detaylı Kurulum: Development Build

### 1. Development Build Oluşturun

```bash
cd apps/mobile

# Android için
eas build --profile development --platform android

# Build tamamlanınca (15-20 dakika)
eas build:download
```

### 2. APK'yı Paylaşın

**Google Drive ile:**
1. APK'yı Google Drive'a yükleyin
2. Sağ tık > "Paylaş" > "Linki olan herkes"
3. Linki kopyalayın

**QR Kod ile:**
1. https://qr-code-generator.com
2. Google Drive linkini yapıştırın
3. QR kodu indirin ve paylaşın

### 3. Test Kullanıcıları APK'yı Kursun

1. Linke tıklayın
2. APK'yı indirin
3. "Bilinmeyen kaynaklar" iznini verin
4. Kurun

### 4. Development Server Başlatın

```bash
npm run dev
```

### 5. Test Kullanıcıları Bağlansın

1. Kurulu uygulamayı açın
2. QR kodu tarayın
3. Uygulama yüklenir!

**Güncelleme için:**
- Kod değiştirin
- Otomatik yenilenir
- Ya da uygulamada "Reload" yapın

---

## 📱 Detaylı Kurulum: Firebase App Distribution

### 1. Firebase Projesi Oluşturun

```bash
# Firebase Console'a gidin
open https://console.firebase.google.com

# "Add project" > "kadinatlasi-test"
# Google Analytics: Skip
```

### 2. Android App Ekleyin

1. Project Overview > "Add app" > Android
2. Package name: `com.kadinatlasi.wellness`
3. "Register app"
4. `google-services.json` indirin (şimdilik gerekli değil)

### 3. iOS App Ekleyin (Opsiyonel)

1. Project Overview > "Add app" > iOS
2. Bundle ID: `com.wellness.companion`
3. "Register app"
4. `GoogleService-Info.plist` indirin (şimdilik gerekli değil)

### 4. Firebase CLI Kurulumu

```bash
# Firebase CLI kur
npm install -g firebase-tools

# Giriş yap
firebase login

# Proje ID'yi alın
firebase projects:list
```

### 5. Build Oluşturun

```bash
cd apps/mobile

# Android
eas build --profile preview --platform android

# Build tamamlanınca
eas build:download
```

### 6. Firebase'e Yükleyin

```bash
# Firebase App ID'yi alın
# Firebase Console > Project Settings > Your apps

# Android APK yükle
firebase appdistribution:distribute \
  app-release.apk \
  --app 1:1234567890:android:abcdef \
  --groups "testers" \
  --release-notes "İlk test sürümü"
```

### 7. Test Kullanıcıları Ekleyin

```bash
# Firebase Console'da
# App Distribution > Testers & Groups > Add testers

# Email adresleri ekleyin:
# - arkadas1@gmail.com
# - arkadas2@gmail.com
# - arkadas3@gmail.com
```

### 8. Test Kullanıcıları İçin

1. Davet emaili gelir
2. "Get started" linkine tıklayın
3. Firebase App Tester uygulamasını indirin
4. Uygulamayı yükleyin
5. Otomatik güncelleme bildirimleri alırsınız

---

## 💰 Maliyet Karşılaştırması

| Yöntem | Maliyet | iOS | Android | Güncelleme |
|--------|---------|-----|---------|------------|
| Expo Go | Ücretsiz | ✅ | ✅ | Otomatik |
| Development Build | Ücretsiz | ✅ | ✅ | QR kod |
| APK Direkt | Ücretsiz | ❌ | ✅ | Manuel |
| Firebase | Ücretsiz | ✅ | ✅ | Bildirim |
| TestFlight | $99/yıl | ✅ | ❌ | Otomatik |
| Play Console | $25 (tek) | ❌ | ✅ | Otomatik |

---

## 🚀 Hızlı Başlangıç Komutları

### Expo Go (Hemen Test)
```bash
cd apps/mobile
npm run dev
# QR kodu paylaş
```

### Development Build (Tam Özellikli)
```bash
cd apps/mobile
eas build --profile development --platform android
eas build:download
# APK'yı paylaş
npm run dev
# QR kodu paylaş
```

### APK Direkt (Standalone)
```bash
cd apps/mobile
eas build --profile preview --platform android
eas build:download
# APK'yı Google Drive'a yükle
```

### Firebase (Profesyonel)
```bash
cd apps/mobile
eas build --profile preview --platform android
firebase appdistribution:distribute app-release.apk \
  --app YOUR_APP_ID \
  --groups "testers"
```

---

## 📝 Test Kullanıcıları İçin Basit Talimatlar

### Expo Go İçin
```
1. App Store/Play Store'dan "Expo Go" indirin
2. Size gönderilen QR kodu tarayın
3. Uygulama açılır!
```

### APK İçin (Android)
```
1. Size gönderilen linke tıklayın
2. APK'yı indirin
3. "Bilinmeyen kaynaklar" iznini verin
4. Kurun ve açın
```

### Firebase İçin
```
1. Davet emailindeki linke tıklayın
2. "Firebase App Tester" uygulamasını indirin
3. Uygulamayı yükleyin
4. Güncellemeler otomatik gelir
```

---

## ❓ Sık Sorulan Sorular

### "Expo Go ile tüm özellikler çalışır mı?"
Hayır. IAP, push notifications gibi native özellikler sınırlıdır. Bunlar için Development Build kullanın.

### "Development Build ile her değişiklikte yeni APK gerekir mi?"
Hayır! JavaScript değişiklikleri için sadece `npm run dev` yapın. Native kod değişiklikleri için yeni build gerekir.

### "Firebase ücretsiz mi?"
Evet! Spark (ücretsiz) plan test için yeterli. Sınırlar:
- 150 tester
- Sınırsız app
- Sınırsız dağıtım

### "iOS için Mac gerekli mi?"
Expo Go ve EAS Build için hayır. Local build için evet.

### "Kaç kişiyle test edebilirim?"
- Expo Go: Sınırsız
- Development Build: Sınırsız
- Firebase: 150 tester (ücretsiz)
- TestFlight: 100 tester ($99/yıl)

---

## 🎯 Önerilen Yöntem

**Hızlı test için (bugün):**
```bash
npm run dev
# Expo Go ile QR kod
```

**Ciddi test için (bu hafta):**
```bash
eas build --profile development --platform android
# Development Build + QR kod güncellemeleri
```

**Profesyonel test için (uzun vadeli):**
```bash
# Firebase App Distribution
# Email davetleri + otomatik güncelleme
```

---

## 📞 Yardım

- Expo Go: https://docs.expo.dev/get-started/expo-go/
- Development Build: https://docs.expo.dev/develop/development-builds/introduction/
- Firebase: https://firebase.google.com/docs/app-distribution
- EAS Build: https://docs.expo.dev/build/introduction/

**Kolay gelsin! 🚀**
