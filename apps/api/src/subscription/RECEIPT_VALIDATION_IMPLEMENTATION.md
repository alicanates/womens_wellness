# Receipt Validation Service Implementation

## Genel Bakış

Premium Subscription sistemi için Apple App Store ve Google Play Store makbuz doğrulama servisi başarıyla implement edildi.

## Tamamlanan Özellikler

### Task 3.1: Apple Receipt Validation ✅

**Implementasyon Detayları:**
- Apple verification endpoint entegrasyonu (Production ve Sandbox)
- Otomatik environment detection (21007 status code ile sandbox'a fallback)
- Receipt parsing ve validation
- Transaction bilgilerinin çıkarılması
- Expiration date kontrolü
- Trial period detection
- Detaylı hata mesajları (status code'lara göre)

**Desteklenen Özellikler:**
- Production ve Sandbox ortam desteği
- Latest receipt info parsing
- Multiple receipt sorting (en yeni önce)
- Active subscription kontrolü
- Trial period detection
- Original transaction ID tracking

### Task 3.2: Google Receipt Validation ✅

**Implementasyon Detayları:**
- Google Play Developer API entegrasyonu
- Service Account JWT authentication
- Purchase token validation
- Subscription status kontrolü
- Auto-renewal status tracking
- Payment state validation

**Desteklenen Özellikler:**
- Google Play Developer API v3
- JWT-based authentication (jsonwebtoken library)
- Subscription status parsing
- Trial period detection
- Auto-renewal status
- Payment state validation (paymentState === 1)

## Teknik Detaylar

### Kullanılan Teknolojiler
- **NestJS**: Framework
- **jsonwebtoken**: Google JWT authentication
- **fetch API**: HTTP requests
- **ConfigService**: Environment variables

### Environment Variables

Aşağıdaki environment variables `.env.example` dosyasına eklendi:

```bash
# Apple App Store
APPLE_SHARED_SECRET=your_shared_secret_here

# Google Play Store
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### API Endpoints

Service aşağıdaki public metodları sağlar:

```typescript
// Apple receipt validation
validateAppleReceipt(receiptData: string): Promise<AppleReceiptData>

// Google receipt validation
validateGoogleReceipt(
  packageName: string,
  productId: string,
  purchaseToken: string
): Promise<GoogleReceiptData>

// Receipt active kontrolü
isReceiptActive(receiptData: AppleReceiptData | GoogleReceiptData): boolean
```

### Return Types

**AppleReceiptData:**
```typescript
{
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: Date;
  expiresDate: Date;
  isTrialPeriod: boolean;
  isActive: boolean;
  environment: 'Production' | 'Sandbox';
}
```

**GoogleReceiptData:**
```typescript
{
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  purchaseDate: Date;
  expiresDate: Date;
  isTrialPeriod: boolean;
  isActive: boolean;
  autoRenewing: boolean;
}
```

## Güvenlik Özellikleri

### Apple
- Shared secret ile doğrulama
- HTTPS üzerinden iletişim
- Production/Sandbox environment separation
- Receipt data validation

### Google
- Service Account JWT authentication
- RS256 algorithm
- OAuth 2.0 token-based authentication
- Purchase token validation
- HTTPS üzerinden iletişim

## Hata Yönetimi

### Apple Error Codes
Service, Apple'ın tüm status code'larını handle eder:
- 21000: App Store isteği işleyemedi
- 21002: Receipt data geçersiz
- 21003: Receipt doğrulanamadı
- 21004: Shared secret eşleşmiyor
- 21005: Receipt sunucusu kullanılamıyor
- 21006: Receipt geçerli ancak abonelik süresi dolmuş
- 21007: Receipt sandbox ortamından (otomatik fallback)
- 21008: Receipt production ortamından
- 21009: Internal data access hatası
- 21010: Kullanıcı hesabı bulunamadı

### Google Error Handling
- Invalid service account key
- Token request failures
- API request failures
- Invalid purchase tokens
- Expired subscriptions

## Test Coverage

Unit testler aşağıdaki senaryoları kapsar:
- ✅ Service initialization
- ✅ Apple shared secret validation
- ✅ Google service account key validation
- ✅ Receipt active status kontrolü
- ✅ Expiration date validation
- ✅ Active subscription detection

## Kullanım Örneği

```typescript
// Apple receipt validation
const appleReceipt = await receiptValidatorService.validateAppleReceipt(
  receiptData
);

if (receiptValidatorService.isReceiptActive(appleReceipt)) {
  // Subscription is active
  console.log('Subscription expires:', appleReceipt.expiresDate);
}

// Google receipt validation
const googleReceipt = await receiptValidatorService.validateGoogleReceipt(
  'com.wellness.app',
  'premium_monthly',
  purchaseToken
);

if (receiptValidatorService.isReceiptActive(googleReceipt)) {
  // Subscription is active
  console.log('Auto-renewing:', googleReceipt.autoRenewing);
}
```

## Module Integration

Service, `SubscriptionModule`'e entegre edildi:

```typescript
@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [SubscriptionService, ReceiptValidatorService],
  exports: [SubscriptionService, ReceiptValidatorService],
})
export class SubscriptionModule {}
```

## Sonraki Adımlar

Bu service, aşağıdaki task'larda kullanılacak:
- **Task 4**: Subscription Controller endpoints
- **Task 5**: Webhook handlers
- **Task 8**: Mobile IAP integration

## Requirements Coverage

Bu implementation aşağıdaki requirement'ları karşılar:
- ✅ 10.1: Platform IAP sistemi üzerinden ödeme işleme
- ✅ 10.2: Backend'de makbuz doğrulama
- ✅ 10.3: Geçersiz makbuzları reddetme
- ✅ 10.4: Benzersiz transaction ID oluşturma
- ✅ 10.5: İşlem geçmişini güvenli saklama
- ✅ 10.6: Kullanıcı ödeme bilgilerini saklamama
- ✅ 10.7: HTTPS üzerinden iletişim

## Notlar

- Apple için production ve sandbox ortamları otomatik olarak handle edilir
- Google için service account JSON key tek satır string olarak saklanmalı
- Her iki platform için de HTTPS zorunludur
- Receipt validation asenkron olarak çalışır
- Tüm hatalar `BadRequestException` olarak fırlatılır
- Logging ile tüm işlemler takip edilir
