# Deep Linking Yapılandırması Tamamlandı ✅

## Yapılan İşlemler

### 1. Paket Kurulumu
- ✅ `expo-linking` paketi kuruldu

### 2. Deep Link Yardımcı Fonksiyonlar
**Dosya:** `apps/mobile/src/utils/deepLinkHelpers.ts`

Oluşturulan fonksiyonlar:
- `createDeepLink()` - URL scheme linki oluşturur (wellness://)
- `createUniversalLink()` - Universal link oluşturur (https://wellness-companion.app)
- `createShareableLink()` - Paylaşım için uygun link oluşturur
- `createQuestionShareLink()` - Soru paylaşım linki
- `createArticleShareLink()` - Makale paylaşım linki
- `createPremiumShareLink()` - Premium paylaşım linki
- `createInviteLink()` - Davet linki (referral code ile)

### 3. Deep Linking Hook
**Dosya:** `apps/mobile/src/hooks/useDeepLinking.ts`

Özellikler:
- ✅ URL scheme handling (wellness://)
- ✅ Universal links handling (https://wellness-companion.app)
- ✅ Uygulama açıkken ve kapalıyken çalışır
- ✅ Tüm ana ekranlar için routing
- ✅ Dinamik parametreler (soru ID, makale slug, vb.)
- ✅ Bilinmeyen URL'ler için fallback

Desteklenen route'lar:
```
wellness://home
wellness://calendar
wellness://chat
wellness://community
wellness://profile
wellness://premium
wellness://pregnancy
wellness://pregnancy/week
wellness://pregnancy/appointments
wellness://pregnancy/birth-plan
wellness://pregnancy/hospital-bag
wellness://pregnancy/contraction-timer
wellness://wellness
wellness://wellness/steps
wellness://wellness/meditation
wellness://wellness/sleep
wellness://water
wellness://astrology
wellness://discover
wellness://fun-notifications
wellness://gamification
wellness://metrics
wellness://settings
wellness://settings/profile
wellness://settings/notifications
wellness://settings/privacy
wellness://settings/about
wellness://settings/help
wellness://community/question?id=123
wellness://community/my-questions
wellness://community/ask
wellness://[slug] (dinamik makaleler)
```

### 4. App.json Yapılandırması
**Dosya:** `apps/mobile/app.json`

iOS için:
```json
"scheme": "wellness",
"associatedDomains": [
  "applinks:wellness-companion.app"
]
```

Android için:
```json
"intentFilters": [
  {
    "action": "VIEW",
    "autoVerify": true,
    "data": [
      {
        "scheme": "https",
        "host": "wellness-companion.app",
        "pathPrefix": "/"
      }
    ],
    "category": ["BROWSABLE", "DEFAULT"]
  }
]
```

### 5. Root Layout Entegrasyonu
**Dosya:** `apps/mobile/app/_layout.tsx`

- ✅ `useDeepLinking()` hook'u eklendi
- ✅ Uygulama başlangıcında otomatik çalışır
- ✅ Bildirim deep linking ile uyumlu çalışır

### 6. QnA Paylaşım Entegrasyonu
**Dosya:** `apps/mobile/app/(tabs)/community/[id].tsx`

- ✅ Soru paylaşımı deep link kullanıyor
- ✅ Cevap paylaşımı deep link kullanıyor
- ✅ `createQuestionShareLink()` fonksiyonu entegre edildi

## Test Senaryoları

### 1. URL Scheme Test (Terminal'den)
```bash
# iOS Simulator
xcrun simctl openurl booted "wellness://premium"
xcrun simctl openurl booted "wellness://community/question?id=123"
xcrun simctl openurl booted "wellness://pregnancy/week"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "wellness://premium"
adb shell am start -W -a android.intent.action.VIEW -d "wellness://community/question?id=123"
```

### 2. Universal Links Test
```bash
# iOS Simulator
xcrun simctl openurl booted "https://wellness-companion.app/premium"
xcrun simctl openurl booted "https://wellness-companion.app/community/question?id=123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "https://wellness-companion.app/premium"
```

### 3. Uygulama İçi Test
```typescript
// Herhangi bir component'te
import { createQuestionShareLink, createPremiumShareLink } from '@/utils/deepLinkHelpers';

// Soru linki oluştur
const questionLink = createQuestionShareLink('question-id-123');
console.log(questionLink); // https://wellness-companion.app/community/question?id=question-id-123

// Premium linki oluştur
const premiumLink = createPremiumShareLink();
console.log(premiumLink); // https://wellness-companion.app/premium
```

### 4. Paylaşım Test
1. Bir soruya git
2. Paylaş butonuna tıkla
3. "Linki Kopyala" seç
4. Linki başka bir uygulamaya yapıştır
5. Link'e tıkla
6. Uygulama açılmalı ve doğru soruya gitmeli

## Universal Links için Ek Yapılandırma

### iOS - Apple App Site Association (AASA)
Domain'inizde (wellness-companion.app) şu dosyayı oluşturun:

**Dosya:** `https://wellness-companion.app/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.wellness.companion",
        "paths": ["*"]
      }
    ]
  }
}
```

Not: `TEAM_ID` yerine Apple Developer Team ID'nizi yazın.

### Android - Digital Asset Links
Domain'inizde şu dosyayı oluşturun:

**Dosya:** `https://wellness-companion.app/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.wellness.companion",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

SHA256 fingerprint almak için:
```bash
keytool -list -v -keystore your-keystore.jks -alias your-key-alias
```

## Kullanım Örnekleri

### 1. Bildirimden Deep Link
```typescript
// Backend'den gönderilen bildirim
{
  "title": "Yeni Cevap",
  "body": "Sorunuza yeni bir cevap geldi",
  "data": {
    "type": "qna",
    "notificationType": "NEW_ANSWER",
    "questionId": "123"
  }
}

// useQnaNotificationHandler otomatik olarak handle eder
// Kullanıcı bildirimi tıkladığında -> wellness://community/question?id=123
```

### 2. Paylaşım Linki
```typescript
import { createQuestionShareLink } from '@/utils/deepLinkHelpers';

const shareQuestion = async (questionId: string, title: string) => {
  const link = createQuestionShareLink(questionId);
  
  await Share.share({
    message: `${title}\n\n${link}`,
    url: link, // iOS için
  });
};
```

### 3. Davet Linki
```typescript
import { createInviteLink } from '@/utils/deepLinkHelpers';

const shareInvite = async (referralCode: string) => {
  const link = createInviteLink(referralCode);
  
  await Share.share({
    message: `Wellness Companion'a katıl!\n\n${link}`,
    url: link,
  });
};
```

## Önemli Notlar

1. **Universal Links için domain gerekli**: Production'da gerçek bir domain olmalı
2. **HTTPS zorunlu**: Universal links sadece HTTPS ile çalışır
3. **AASA dosyası**: iOS için `.well-known/apple-app-site-association` dosyası gerekli
4. **Asset Links**: Android için `.well-known/assetlinks.json` dosyası gerekli
5. **Test**: Development'ta URL scheme (wellness://) kullanın
6. **Production**: Universal links (https://wellness-companion.app) kullanın

## Sonraki Adımlar

1. ✅ Deep linking yapılandırması tamamlandı
2. ⏳ Domain'de AASA ve Asset Links dosyalarını oluşturun
3. ⏳ Production build'de test edin
4. ⏳ Analytics'e deep link tracking ekleyin
5. ⏳ Deferred deep linking ekleyin (yeni kullanıcılar için)

## Deferred Deep Linking (Opsiyonel)

Yeni kullanıcılar için (uygulama yüklü değilse):
1. Kullanıcı link'e tıklar
2. App Store/Play Store'a yönlendirilir
3. Uygulama yüklenir
4. İlk açılışta orijinal link'e yönlendirilir

Bu özellik için Firebase Dynamic Links veya Branch.io kullanılabilir.

## Sorun Giderme

### iOS'ta Universal Links Çalışmıyor
1. AASA dosyasını kontrol edin: `https://wellness-companion.app/.well-known/apple-app-site-association`
2. Team ID'nin doğru olduğundan emin olun
3. Associated Domains'in Xcode'da eklendiğinden emin olun
4. Cihazı yeniden başlatın

### Android'de Deep Links Çalışmıyor
1. Asset Links dosyasını kontrol edin
2. SHA256 fingerprint'in doğru olduğundan emin olun
3. `autoVerify: true` olduğundan emin olun
4. `adb shell pm get-app-links com.wellness.companion` ile doğrulayın

### URL Scheme Çalışmıyor
1. `app.json`'da `scheme: "wellness"` olduğundan emin olun
2. Uygulamayı yeniden build edin
3. Simulator/Emulator'ü yeniden başlatın

## Başarıyla Tamamlandı! 🎉

Deep linking yapılandırması tamamlandı. Artık kullanıcılar:
- Bildirimlere tıklayarak ilgili içeriğe gidebilir
- Paylaşılan linklere tıklayarak uygulamayı açabilir
- Davet linklerini kullanabilir
- Web'den uygulamaya geçiş yapabilir
