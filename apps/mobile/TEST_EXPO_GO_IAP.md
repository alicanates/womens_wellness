# Expo Go IAP Test Rehberi

## ✅ Yapılan Değişiklikler

1. **Mock IAP Servisi Oluşturuldu**
   - `src/services/iap.mock.ts` - Expo Go için mock implementasyon
   - Tüm IAP fonksiyonlarını simüle eder
   - Gerçek satın alma yapmaz, sadece UI test için

2. **Otomatik Wrapper Eklendi**
   - `src/services/iap.wrapper.ts` - Otomatik seçim yapan wrapper
   - Expo Go'da: Mock IAP kullanır
   - Development Build'de: Gerçek IAP kullanır

3. **Import'lar Güncellendi**
   - `app/_layout.tsx` ✅
   - `app/premium.tsx` ✅
   - `src/utils/errorHandling.ts` ✅

## 🧪 Test Adımları

### 1. Uygulamayı Başlatın

```bash
cd apps/mobile
npm run dev
```

### 2. Expo Go'da Açın

- QR kodu tarayın
- Uygulama açılmalı (hata olmamalı)

### 3. Premium Ekranını Test Edin

1. Settings'e gidin
2. "Premium'a Geç" butonuna tıklayın
3. Premium ekranı açılmalı
4. İki ürün görünmeli:
   - Premium Aylık (₺49,99)
   - Premium Yıllık (₺359,99)

### 4. Mock Satın Alma Test Edin

1. Bir tier seçin (Aylık veya Yıllık)
2. "Satın Al" butonuna tıklayın
3. Console'da şu logları görmelisiniz:
   ```
   [IAP Wrapper] Using mock IAP
   [MOCK IAP] Simulating purchase for: MONTHLY
   [MOCK IAP] Purchase successful (mock)
   ⚠️ MOCK MODE: Gerçek satın alma yapılmadı
   ```

### 5. Mock Restore Test Edin

1. "Satın Alımları Geri Yükle" butonuna tıklayın
2. Console'da şu logları görmelisiniz:
   ```
   [MOCK IAP] Simulating restore purchases...
   [MOCK IAP] No purchases to restore (mock)
   ⚠️ MOCK MODE: Gerçek geri yükleme yapılmadı
   ```

## 📱 Console Logları

### Expo Go'da (Mock Mode)
```
[IAP Wrapper] react-native-iap not available, using mock IAP
[IAP Wrapper] To use real IAP, create a development build
[MOCK IAP] Initializing...
[MOCK IAP] Initialized successfully
[MOCK IAP] Loading products...
[MOCK IAP] Products loaded: 2
```

### Development Build'de (Real IAP)
```
[IAP Wrapper] Using real IAP
[IAP] Initializing connection...
[IAP] Connection established
[IAP] Loading products...
[IAP] Products loaded: 2
```

## ⚠️ Beklenen Davranış

### Expo Go'da
- ✅ Uygulama açılır
- ✅ Premium ekranı çalışır
- ✅ Ürünler gösterilir (mock data)
- ✅ Satın alma simüle edilir
- ❌ Gerçek satın alma yapılmaz
- ⚠️ Console'da "MOCK MODE" uyarısı

### Development Build'de
- ✅ Gerçek IAP çalışır
- ✅ App Store/Play Store'dan ürünler yüklenir
- ✅ Gerçek satın alma yapılabilir
- ✅ Receipt validation çalışır

## 🚀 Gerçek IAP Test İçin

Development build oluşturun:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 🐛 Sorun Giderme

### Hata: "Module not found: iap.wrapper"
```bash
# Metro bundler'ı temizleyin
npx expo start --clear
```

### Hata: "Cannot read property 'initialize'"
- Uygulamayı yeniden başlatın
- Cache'i temizleyin: `npx expo start --clear`

### Console'da hala "NitroModules" hatası
- Dosyaları kaydedin
- Metro bundler'ı yeniden başlatın
- Uygulamayı yeniden yükleyin (Expo Go'da shake > Reload)

## ✅ Başarı Kriterleri

- [ ] Uygulama Expo Go'da açılıyor
- [ ] Premium ekranı görünüyor
- [ ] Ürünler listeleniyor
- [ ] Satın alma butonu çalışıyor
- [ ] Console'da mock logları görünüyor
- [ ] Hata yok

## 📝 Notlar

1. **Mock Mode Sınırlamaları:**
   - Gerçek satın alma yapılmaz
   - Backend'e istek gönderilmez
   - Receipt validation simüle edilir

2. **Production Hazırlık:**
   - Development build ile test edin
   - Sandbox hesapları kullanın
   - Receipt validation test edin
   - EAS Build ile production build oluşturun

3. **Geliştirme Akışı:**
   - UI geliştirme: Expo Go (mock)
   - IAP test: Development build (real)
   - Production: EAS Build
