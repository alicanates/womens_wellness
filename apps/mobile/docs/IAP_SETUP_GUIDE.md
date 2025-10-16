# In-App Purchase (IAP) Setup Guide

Bu dokümantasyon, Wellness Companion uygulamasında premium abonelik özelliğini aktif hale getirmek için gerekli IAP yapılandırma adımlarını içerir.

## 📋 İçindekiler

1. [iOS App Store Connect Yapılandırması](#ios-app-store-connect-yapılandırması)
2. [Android Google Play Console Yapılandırması](#android-google-play-console-yapılandırması)
3. [Product ID'lerin Tanımlanması](#product-idlerin-tanımlanması)
4. [Test Ortamı Kurulumu](#test-ortamı-kurulumu)
5. [Production Deployment](#production-deployment)

---

## iOS App Store Connect Yapılandırması

### 1. App Store Connect'e Giriş

1. [App Store Connect](https://appstoreconnect.apple.com) adresine gidin
2. Apple Developer hesabınızla giriş yapın
3. "My Apps" bölümüne gidin
4. "Wellness Companion" uygulamasını seçin

### 2. In-App Purchases Oluşturma

#### Aylık Abonelik

1. **Features** > **In-App Purchases** > **+** butonuna tıklayın
2. **Auto-Renewable Subscription** seçin
3. Aşağıdaki bilgileri girin:

```
Reference Name: Premium Monthly Subscription
Product ID: com.wellness.companion.premium.monthly
Subscription Group: Premium Subscriptions (yeni grup oluşturun)
```

4. **Subscription Duration**: 1 Month
5. **Subscription Prices**:
   - Turkey (TRY): ₺99.00
   - United States (USD): $9.99
   - (Diğer ülkeler için otomatik fiyatlandırma)

6. **Localizations** ekleyin:
   - **Turkish**:
     - Display Name: Premium Aylık
     - Description: Tüm premium özelliklere aylık erişim. Gelişmiş AI, sınırsız mesaj, öncelikli destek ve daha fazlası.
   - **English**:
     - Display Name: Premium Monthly
     - Description: Monthly access to all premium features. Advanced AI, unlimited messages, priority support and more.

7. **Review Information**:
   - Screenshot: Premium özellikleri gösteren ekran görüntüsü
   - Review Notes: "Premium subscription for advanced features"

#### Yıllık Abonelik

1. Aynı Subscription Group içinde yeni bir subscription oluşturun
2. Aşağıdaki bilgileri girin:

```
Reference Name: Premium Yearly Subscription
Product ID: com.wellness.companion.premium.yearly
Subscription Group: Premium Subscriptions (aynı grup)
```

3. **Subscription Duration**: 1 Year
4. **Subscription Prices**:
   - Turkey (TRY): ₺999.00
   - United States (USD): $99.99

5. **Localizations** ekleyin (yukarıdaki gibi)

### 3. Free Trial Yapılandırması

1. Her iki subscription için:
   - **Introductory Offer** > **Add**
   - **Type**: Free Trial
   - **Duration**: 7 days
   - **Eligibility**: New Subscribers Only

### 4. Subscription Group Ayarları

1. **Subscription Group** > **Premium Subscriptions**
2. **Subscription Group Display Name**:
   - Turkish: Premium Üyelik
   - English: Premium Membership
3. **Save** butonuna tıklayın

### 5. App Store Server Notifications

1. **App Information** > **App Store Server Notifications**
2. **Production Server URL**: `https://api.wellness-companion.app/subscription/webhook/apple`
3. **Sandbox Server URL**: `https://api-staging.wellness-companion.app/subscription/webhook/apple`
4. **Version**: Version 2
5. **Save** butonuna tıklayın

### 6. Shared Secret

1. **Features** > **In-App Purchases** > **App-Specific Shared Secret**
2. **Generate** butonuna tıklayın
3. Oluşturulan secret'ı kopyalayın
4. Backend `.env` dosyasına ekleyin:
   ```
   APPLE_SHARED_SECRET=your_shared_secret_here
   ```

---

## Android Google Play Console Yapılandırması

### 1. Google Play Console'a Giriş

1. [Google Play Console](https://play.google.com/console) adresine gidin
2. Google Developer hesabınızla giriş yapın
3. "Wellness Companion" uygulamasını seçin

### 2. Subscription Products Oluşturma

#### Aylık Abonelik

1. **Monetize** > **Subscriptions** > **Create subscription**
2. Aşağıdaki bilgileri girin:

```
Product ID: premium_monthly
Name: Premium Monthly
Description: Monthly access to all premium features
```

3. **Base plans and offers** > **Add base plan**:
   - **Billing period**: Monthly
   - **Price**: 
     - Turkey: ₺99.00
     - United States: $9.99
   - **Free trial**: 7 days
   - **Grace period**: 7 days

4. **Save** butonuna tıklayın

#### Yıllık Abonelik

1. **Create subscription** butonuna tekrar tıklayın
2. Aşağıdaki bilgileri girin:

```
Product ID: premium_yearly
Name: Premium Yearly
Description: Yearly access to all premium features - Save 17%
```

3. **Base plans and offers** > **Add base plan**:
   - **Billing period**: Yearly
   - **Price**: 
     - Turkey: ₺999.00
     - United States: $99.99
   - **Free trial**: 7 days
   - **Grace period**: 7 days

4. **Save** butonuna tıklayın

### 3. Real-time Developer Notifications

1. **Monetize** > **Monetization setup**
2. **Real-time developer notifications** bölümüne gidin
3. **Topic name**: `wellness-subscription-events`
4. **Enable notifications** seçeneğini aktif edin

### 4. Google Cloud Pub/Sub Kurulumu

1. [Google Cloud Console](https://console.cloud.google.com) adresine gidin
2. Projenizi seçin
3. **Pub/Sub** > **Topics** > **Create Topic**
4. Topic name: `wellness-subscription-events`
5. **Create Subscription**:
   - Subscription ID: `wellness-subscription-webhook`
   - Delivery type: Push
   - Endpoint URL: `https://api.wellness-companion.app/subscription/webhook/google`

### 5. Service Account Oluşturma

1. **IAM & Admin** > **Service Accounts** > **Create Service Account**
2. Service account details:
   ```
   Name: wellness-iap-validator
   Description: Service account for validating IAP receipts
   ```
3. **Grant this service account access to project**:
   - Role: **Pub/Sub Subscriber**
   - Role: **Service Account Token Creator**
4. **Create Key** > **JSON**
5. İndirilen JSON dosyasını güvenli bir yere kaydedin
6. Backend'e ekleyin:
   ```bash
   # .env dosyasına
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```

### 6. Google Play Developer API

1. **Google Cloud Console** > **APIs & Services** > **Library**
2. "Google Play Developer API" aratın
3. **Enable** butonuna tıklayın
4. Service account'a API erişimi verin:
   - **Google Play Console** > **Users and permissions**
   - **Invite new users** > Service account email'ini ekleyin
   - **App permissions** > "Wellness Companion" seçin
   - **Account permissions** > "View financial data" seçin

---

## Product ID'lerin Tanımlanması

Product ID'ler zaten kod içinde tanımlanmıştır:

### iOS Product IDs
```typescript
// apps/mobile/src/config/iap.config.ts
ios: {
  monthly: 'com.wellness.companion.premium.monthly',
  yearly: 'com.wellness.companion.premium.yearly',
}
```

### Android Product IDs
```typescript
// apps/mobile/src/config/iap.config.ts
android: {
  monthly: 'premium_monthly',
  yearly: 'premium_yearly',
}
```

Bu ID'ler App Store Connect ve Google Play Console'da oluşturduğunuz product ID'lerle **tam olarak eşleşmelidir**.

---

## Test Ortamı Kurulumu

### iOS Sandbox Testing

1. **Settings** > **App Store** > **Sandbox Account**
2. Test kullanıcısı oluşturun:
   - [App Store Connect](https://appstoreconnect.apple.com) > **Users and Access** > **Sandbox Testers**
   - **+** butonuna tıklayın
   - Test email ve şifre oluşturun

3. Test cihazında:
   - Settings > App Store > Sign Out (production hesabından)
   - Uygulamayı açın ve satın alma yapın
   - Sandbox hesabıyla giriş yapın

### Android Testing

1. **Google Play Console** > **Testing** > **License testing**
2. Test email adreslerini ekleyin
3. **Internal testing** track'i oluşturun:
   - **Release** > **Testing** > **Internal testing**
   - **Create new release**
   - APK/AAB yükleyin
   - Test kullanıcılarını ekleyin

4. Test cihazında:
   - Test email'i ile Google Play'e giriş yapın
   - Internal testing linkinden uygulamayı indirin
   - Satın alma yapın (gerçek ücret alınmaz)

---

## Production Deployment

### Checklist

#### Backend
- [ ] Environment variables yapılandırıldı:
  ```bash
  # Apple
  APPLE_SHARED_SECRET=xxx
  APPLE_BUNDLE_ID=com.wellness.companion
  
  # Google
  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
  GOOGLE_PACKAGE_NAME=com.wellness.companion
  ```
- [ ] Webhook endpoints test edildi
- [ ] Receipt validation test edildi
- [ ] Database migrations çalıştırıldı

#### iOS
- [ ] App Store Connect'te subscriptions aktif
- [ ] Server notifications yapılandırıldı
- [ ] Sandbox'ta test edildi
- [ ] Production build oluşturuldu
- [ ] App Review'a gönderildi

#### Android
- [ ] Google Play Console'da subscriptions aktif
- [ ] Real-time notifications yapılandırıldı
- [ ] Internal testing tamamlandı
- [ ] Production build oluşturuldu
- [ ] Play Store'a gönderildi

### Monitoring

Production'da izlenmesi gereken metrikler:

1. **Subscription Events**:
   - Yeni abonelikler
   - Yenilemeler
   - İptaller
   - Başarısız ödemeler

2. **Receipt Validation**:
   - Başarılı validasyonlar
   - Başarısız validasyonlar
   - Validation süreleri

3. **Webhook Delivery**:
   - Webhook success rate
   - Webhook latency
   - Failed webhooks

### Troubleshooting

#### iOS Issues

**Problem**: "Cannot connect to iTunes Store"
- **Çözüm**: Sandbox hesabıyla giriş yapıldığından emin olun

**Problem**: "This In-App Purchase has already been bought"
- **Çözüm**: Sandbox hesabını sıfırlayın veya yeni hesap oluşturun

**Problem**: Receipt validation fails
- **Çözüm**: Shared secret'ın doğru olduğundan emin olun

#### Android Issues

**Problem**: "Item not available for purchase"
- **Çözüm**: Product ID'lerin eşleştiğinden emin olun

**Problem**: "You already own this item"
- **Çözüm**: Subscription'ı iptal edin ve tekrar deneyin

**Problem**: Receipt validation fails
- **Çözüm**: Service account permissions'ı kontrol edin

---

## Ek Kaynaklar

### Apple Documentation
- [In-App Purchase Programming Guide](https://developer.apple.com/in-app-purchase/)
- [App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications)
- [Receipt Validation](https://developer.apple.com/documentation/appstorereceipts)

### Google Documentation
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [Real-time Developer Notifications](https://developer.android.com/google/play/billing/rtdn-reference)
- [Google Play Developer API](https://developers.google.com/android-publisher)

### react-native-iap Documentation
- [GitHub Repository](https://github.com/dooboolab/react-native-iap)
- [API Reference](https://github.com/dooboolab/react-native-iap/blob/main/docs/README.md)

---

## Destek

Sorunlarla karşılaşırsanız:

1. Önce [Troubleshooting](#troubleshooting) bölümüne bakın
2. Backend loglarını kontrol edin
3. IAP Manager loglarını kontrol edin (`[IAP]` prefix'li)
4. Gerekirse Apple/Google support'a başvurun
