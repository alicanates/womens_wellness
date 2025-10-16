# Expo Go IAP Hatası Çözümü

## Sorun
`react-native-iap` kütüphanesi native modüller gerektirdiği için Expo Go'da çalışmaz.

**Hata:**
```
NitroModules are not supported in Expo Go! Use EAS ('expo prebuild') or eject to a bare workflow instead.
```

## Çözüm

### 1. Mock IAP Servisi (Geliştirme için - ✅ Uygulandı)

Expo Go'da test edebilmek için mock bir IAP servisi oluşturduk:

**Oluşturulan Dosyalar:**
- `src/services/iap.mock.ts` - Mock IAP implementasyonu
- `src/services/iap.wrapper.ts` - Otomatik seçim yapan wrapper

**Nasıl Çalışır:**
- Expo Go'da: Mock IAP kullanılır (gerçek satın alma yapılmaz)
- Development Build'de: Gerçek IAP kullanılır

**Güncellenen Dosyalar:**
- `app/_layout.tsx`
- `app/premium.tsx`
- `src/utils/errorHandling.ts`

### 2. Development Build (Production için - Gerekli)

Gerçek IAP test etmek için development build oluşturmanız gerekiyor:

#### iOS için:
```bash
cd apps/mobile
npx expo run:ios
```

#### Android için:
```bash
cd apps/mobile
npx expo run:android
```

### 3. Production Build

Production için EAS Build kullanın:

```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

## Test Etme

### Expo Go'da (Mock)
```bash
npm run dev
```
- Premium ekranı açılır
- Ürünler gösterilir (mock data)
- Satın alma simüle edilir
- Console'da "MOCK MODE" uyarısı görünür

### Development Build'de (Gerçek)
```bash
npx expo run:ios
# veya
npx expo run:android
```
- Gerçek App Store/Play Store bağlantısı
- Gerçek ürünler yüklenir
- Gerçek satın alma yapılabilir
- Sandbox hesapları kullanılabilir

## Önemli Notlar

1. **Mock Mode Uyarısı**: Expo Go'da çalışırken console'da mock mode uyarıları göreceksiniz. Bu normaldir.

2. **Production Test**: Production'a göndermeden önce mutlaka development build ile test edin.

3. **Sandbox Hesapları**: 
   - iOS: App Store Connect'te sandbox test kullanıcıları oluşturun
   - Android: Play Console'da test kullanıcıları ekleyin

4. **Receipt Validation**: Backend'de receipt validation çalışıyor, mock mode'da simüle edilir.

## Sonraki Adımlar

1. ✅ Mock IAP implementasyonu tamamlandı
2. ⏳ Development build ile test edin
3. ⏳ Sandbox hesapları ile gerçek satın alma test edin
4. ⏳ Production build oluşturun

## Yardım

Sorun yaşarsanız:
- Console loglarını kontrol edin
- `[IAP Wrapper]` ve `[MOCK IAP]` loglarına bakın
- Development build kullanıyorsanız `[IAP]` loglarına bakın
