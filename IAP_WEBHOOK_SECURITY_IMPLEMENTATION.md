# IAP Webhook Güvenlik İyileştirmeleri

## 🔒 Yapılan Değişiklikler

### 1. Apple Webhook Guard - Tam JWT Doğrulama

**Önceki Durum:**
- ❌ JWT sadece decode ediliyordu
- ❌ Apple'ın public key'leri ile signature doğrulaması yapılmıyordu
- ❌ JWT claims doğrulaması eksikti

**Yeni Durum:**
- ✅ Apple'ın public key'leri otomatik olarak fetch ediliyor
- ✅ JWT signature RSA-SHA256 ile doğrulanıyor
- ✅ JWT claims (iss, exp, nbf) validate ediliyor
- ✅ Public key'ler 1 saat cache'leniyor (performans)

**Eklenen Özellikler:**
```typescript
- verifySignature(): JWT imzasını Apple public key ile doğrular
- getApplePublicKeys(): Apple'dan public key'leri çeker ve cache'ler
- jwkToPem(): JWK formatını PEM formatına çevirir
- validateClaims(): JWT claims'lerini doğrular
```

### 2. Google Webhook Guard - Tam JWT Doğrulama

**Önceki Durum:**
- ❌ JWT sadece format kontrolü yapılıyordu
- ❌ Google'ın public key'leri ile signature doğrulaması yapılmıyordu
- ❌ JWT claims doğrulaması eksikti

**Yeni Durum:**
- ✅ Google'ın public key'leri otomatik olarak fetch ediliyor
- ✅ JWT signature RSA-SHA256 ile doğrulanıyor
- ✅ JWT claims (iss, aud, exp, iat) validate ediliyor
- ✅ Public key'ler 1 saat cache'leniyor (performans)
- ✅ Clock skew toleransı (5 dakika)

**Eklenen Özellikler:**
```typescript
- verifyGoogleJWT(): JWT'yi Google public key ile doğrular
- getGooglePublicKeys(): Google'dan public key'leri çeker ve cache'ler
- jwkToPem(): JWK formatını PEM formatına çevirir
- validateGoogleClaims(): JWT claims'lerini doğrular
```

### 3. Pages Controller - Authentication ve Rate Limiting

**Önceki Durum:**
- ❌ Public endpoint'lerde rate limiting yoktu
- ❌ ID ile sayfa getirme gereksiz yere admin korumalıydı

**Yeni Durum:**
- ✅ Public endpoint'lere rate limiting eklendi (100 req/min)
- ✅ Admin endpoint'ler ayrı route'lara taşındı (`/admin/list`, `/admin/:id`)
- ✅ Public ve admin endpoint'ler net bir şekilde ayrıldı

## 🔐 Güvenlik Özellikleri

### Apple Webhook Doğrulama
1. **JWT Format Kontrolü**: 3 parçalı JWT formatı
2. **Signature Verification**: RSA-SHA256 ile imza doğrulama
3. **Public Key Fetching**: Apple'dan otomatik key çekme
4. **Claims Validation**:
   - `iss`: https://appleid.apple.com olmalı
   - `exp`: Token süresi dolmamış olmalı
   - `nbf`: Token henüz geçerli olmalı

### Google Webhook Doğrulama
1. **JWT Format Kontrolü**: 3 parçalı JWT formatı
2. **Signature Verification**: RSA-SHA256 ile imza doğrulama
3. **Public Key Fetching**: Google'dan otomatik key çekme
4. **Claims Validation**:
   - `iss`: accounts.google.com olmalı
   - `aud`: Google Cloud Project ID ile eşleşmeli
   - `exp`: Token süresi dolmamış olmalı
   - `iat`: Token geçmişte oluşturulmuş olmalı (5 dk tolerans)
5. **Fallback Token**: Push endpoint token desteği

### Pages Controller
1. **Rate Limiting**: Public endpoint'lerde 100 req/min limit
2. **Authentication**: Admin endpoint'ler JWT + AdminGuard ile korumalı
3. **Route Separation**: Public ve admin route'ları ayrı

## 📋 Gerekli Environment Variables

```bash
# Google Webhook için
GOOGLE_PUBSUB_PUSH_TOKEN=your-secret-token-here
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Development modunda webhook doğrulamayı atlamak için
NODE_ENV=development
SKIP_WEBHOOK_VERIFICATION=true
```

## 🚀 Production Önerileri

### 1. JWK to PEM Conversion İyileştirmesi
Şu anda basitleştirilmiş bir JWK to PEM conversion kullanılıyor. Production için:

```bash
npm install jwk-to-pem
```

Sonra guard'larda:
```typescript
import jwkToPem from 'jwk-to-pem';

private jwkToPem(jwk: any): string {
    return jwkToPem(jwk);
}
```

### 2. Monitoring ve Alerting
Webhook doğrulama hatalarını izleyin:
- Failed verification attempts
- Invalid signatures
- Expired tokens
- Missing keys

### 3. Rate Limiting
Webhook endpoint'lerine de rate limiting ekleyin:
```typescript
@Post('webhook/apple')
@Throttle({ default: { limit: 1000, ttl: 60000 } })
@UseGuards(AppleWebhookGuard)
async handleAppleWebhook(...) { ... }
```

### 4. Webhook Replay Protection
Aynı webhook'un birden fazla işlenmesini önlemek için:
- Transaction ID'leri cache'leyin
- Duplicate notification'ları reddedin

## 🧪 Test Etme

### Development Modunda Test
```bash
# .env dosyasında
NODE_ENV=development
SKIP_WEBHOOK_VERIFICATION=true
```

### Production Modunda Test
```bash
# Gerçek Apple/Google webhook'larını test edin
# Signature verification aktif olacak
NODE_ENV=production
```

### Manuel Test
```bash
# Apple webhook test
curl -X POST http://localhost:3000/subscription/webhook/apple \
  -H "Content-Type: application/json" \
  -d '{"signedPayload": "eyJ..."}'

# Google webhook test
curl -X POST http://localhost:3000/subscription/webhook/google \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"message": {"data": "eyJ..."}}'
```

## ✅ Checklist

- [x] Apple JWT signature verification
- [x] Google JWT signature verification
- [x] Public key caching
- [x] JWT claims validation
- [x] Pages controller rate limiting
- [x] Admin route separation
- [ ] jwk-to-pem library integration (önerilir)
- [ ] Webhook replay protection (önerilir)
- [ ] Monitoring ve alerting (önerilir)

## 📚 Referanslar

- [Apple App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications)
- [Google Play Real-time Developer Notifications](https://developer.android.com/google/play/billing/rtdn-reference)
- [Google Pub/Sub Authentication](https://cloud.google.com/pubsub/docs/push#authentication_and_authorization)
