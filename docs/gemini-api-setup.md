# 🤖 Google Gemini API Kurulum Rehberi

Bu rehber, NOVA AI asistanı için Google Gemini API'yi nasıl kuracağınızı adım adım açıklar.

## 📋 İçindekiler

1. [Gemini API Key Alma](#gemini-api-key-alma)
2. [Environment Variables Yapılandırması](#environment-variables-yapılandırması)
3. [API Bağlantısını Test Etme](#api-bağlantısını-test-etme)
4. [Ücretsiz Kota ve Limitler](#ücretsiz-kota-ve-limitler)
5. [Production Deployment](#production-deployment)
6. [Sorun Giderme](#sorun-giderme)

---

## 🔑 Gemini API Key Alma

### Adım 1: Google AI Studio'ya Git

1. Tarayıcınızda şu adresi açın: https://aistudio.google.com/app/apikey
2. Google hesabınızla giriş yapın

### Adım 2: API Key Oluştur

1. **"Create API Key"** butonuna tıklayın
2. Bir Google Cloud projesi seçin veya **"Create API key in new project"** seçeneğini kullanın
3. API key otomatik olarak oluşturulacak (örnek: `AIzaSyC...`)
4. **Önemli**: API key'i güvenli bir yere kopyalayın (bir daha gösterilmeyecek)

### Adım 3: API Key'i Doğrula

API key'in çalıştığını test etmek için:

```bash
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Merhaba"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
```

Başarılı yanıt alırsanız, API key çalışıyor demektir! ✅

---

## ⚙️ Environment Variables Yapılandırması

### Development (Local)

1. `apps/api/.env.local` dosyasını açın (yoksa `.env.example`'dan kopyalayın):

```bash
cd apps/api
cp .env.example .env.local
```

2. `GOOGLE_GENERATIVE_AI_API_KEY` değişkenini ekleyin:

```ini
# AI Providers
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...  # Buraya kendi key'inizi yapıştırın
```

3. Diğer gerekli değişkenlerin de ayarlandığından emin olun:

```ini
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellness

# JWT
JWT_SECRET=<openssl rand -hex 32 ile oluştur>
JWT_REFRESH_SECRET=<openssl rand -hex 32 ile oluştur>

# Redis
REDIS_URL=redis://localhost:6379
```

### Production

Production ortamında API key'i **asla** kod içine yazmayın. Bunun yerine:

#### Option 1: Environment Variables (Önerilen)

```bash
# Server'da environment variable olarak set edin
export GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyC..."
```

#### Option 2: Secret Manager Kullanın

- **AWS**: AWS Secrets Manager
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault
- **Doppler**: https://doppler.com
- **1Password**: https://1password.com/secrets

Örnek (AWS Secrets Manager):

```typescript
// apps/api/src/config/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export async function getGeminiApiKey() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'wellness/gemini-api-key' })
  );
  return response.SecretString;
}
```

---

## 🧪 API Bağlantısını Test Etme

### Test 1: Basit Bağlantı Testi

```bash
cd apps/api
pnpm test:gemini
```

Bu komut şunları test eder:
- ✅ API key geçerli mi?
- ✅ Gemini API'ye bağlanabiliyor muyuz?
- ✅ Streaming çalışıyor mu?
- ✅ Token sayımı doğru mu?

Beklenen çıktı:
```
✓ Gemini API connection successful
✓ Streaming response received
✓ Token count: 42
```

### Test 2: Context Builder Testi

```bash
cd apps/api
pnpm test context-builder.service.spec.ts --run
```

Bu test, kullanıcı bağlamının doğru oluşturulduğunu doğrular.

### Test 3: End-to-End Chat Flow

```bash
cd apps/api
pnpm test:chat-flow
```

Bu test, tam chat akışını test eder:
1. Yeni conversation oluştur
2. Mesaj gönder
3. Streaming yanıt al
4. Veritabanına kaydet
5. Quota'yı artır

---

## 📊 Ücretsiz Kota ve Limitler

### Gemini 1.5 Flash (Ücretsiz Tier)

| Metrik | Limit |
|--------|-------|
| **İstek/Dakika** | 15 |
| **İstek/Gün** | 1,500 |
| **Token/Dakika** | 1,000,000 |
| **Token/Gün** | 1,500,000 |

### Uygulama Kotaları

Uygulamamızda kullanıcı başına kotalar:

| Plan | Aylık Mesaj Limiti |
|------|-------------------|
| **Free** | 100 mesaj |
| **Premium** | 1,000 mesaj |

### Kota Aşımı Durumunda

Gemini API kotası aşılırsa:
1. Kullanıcıya Türkçe hata mesajı gösterilir: *"Sistem yoğun, lütfen birkaç saniye bekleyin"*
2. Retry logic otomatik devreye girer (exponential backoff)
3. Admin panel'den alternatif provider'a geçilebilir (OpenAI/Anthropic)

---

## 🚀 Production Deployment

### Deployment Checklist

- [ ] API key production ortamında environment variable olarak set edildi
- [ ] API key development key'inden farklı (güvenlik için)
- [ ] Secret manager kullanılıyor (AWS/GCP/Azure)
- [ ] API key rotation planı var (3-6 ayda bir)
- [ ] Monitoring ve alerting kuruldu
- [ ] Backup provider yapılandırıldı (OpenAI veya Anthropic)
- [ ] Rate limiting aktif
- [ ] Error tracking aktif (Sentry)

### Monitoring

Production'da şu metrikleri izleyin:

```typescript
// Örnek monitoring kodu
import { Counter, Histogram } from 'prom-client';

const geminiRequestsTotal = new Counter({
  name: 'gemini_requests_total',
  help: 'Total Gemini API requests',
  labelNames: ['status'],
});

const geminiResponseTime = new Histogram({
  name: 'gemini_response_time_seconds',
  help: 'Gemini API response time',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});
```

İzlenecek metrikler:
- ✅ İstek sayısı (başarılı/başarısız)
- ✅ Yanıt süresi (first token, total)
- ✅ Token kullanımı (günlük/aylık)
- ✅ Hata oranı (timeout, rate limit, vb.)
- ✅ Maliyet (token başına)

### Cost Optimization

Maliyeti düşürmek için:

1. **Conversation history limitini ayarlayın**:
   ```typescript
   // apps/api/src/chat/chat.service.ts
   const history = await this.getConversationHistory(conversationId, 10); // 10 mesaj
   ```

2. **Max tokens limitini ayarlayın**:
   ```typescript
   const result = streamText({
     model,
     messages,
     maxTokens: 2048, // Daha düşük = daha ucuz
   });
   ```

3. **Caching kullanın** (gelecek özellik):
   ```typescript
   // User context'i 5 dakika cache'le
   const context = await cache.get(`user-context:${userId}`);
   ```

---

## 🔧 Sorun Giderme

### Problem 1: "API key not valid"

**Çözüm**:
1. API key'in doğru kopyalandığından emin olun (boşluk yok)
2. Google AI Studio'da key'in aktif olduğunu kontrol edin
3. Yeni bir key oluşturup deneyin

```bash
# Test komutu
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

### Problem 2: "Rate limit exceeded"

**Çözüm**:
1. Ücretsiz tier limitlerini kontrol edin (15 req/min)
2. Retry logic'in çalıştığından emin olun
3. Gerekirse paid tier'a geçin
4. Alternatif provider kullanın (OpenAI/Anthropic)

### Problem 3: "Timeout"

**Çözüm**:
1. Timeout süresini artırın:
   ```typescript
   // apps/api/src/chat/chat.service.ts
   const result = streamText({
     model,
     messages,
     abortSignal: AbortSignal.timeout(30000), // 30 saniye
   });
   ```

2. Network bağlantısını kontrol edin
3. Gemini API status sayfasını kontrol edin: https://status.cloud.google.com

### Problem 4: "Context too long"

**Çözüm**:
1. Conversation history limitini düşürün (10 → 5)
2. System prompt'u kısaltın
3. User context'i sadeleştirin

### Problem 5: Environment variable okunmuyor

**Çözüm**:
1. `.env.local` dosyasının doğru yerde olduğundan emin olun
2. Server'ı yeniden başlatın
3. Environment variable'ın export edildiğini kontrol edin:
   ```bash
   echo $GOOGLE_GENERATIVE_AI_API_KEY
   ```

---

## 📚 Ek Kaynaklar

- **Gemini API Docs**: https://ai.google.dev/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Google AI Studio**: https://aistudio.google.com
- **Pricing**: https://ai.google.dev/pricing
- **Status Page**: https://status.cloud.google.com

---

## 🆘 Destek

Sorun yaşıyorsanız:

1. **Logs'u kontrol edin**:
   ```bash
   cd apps/api
   pnpm dev  # Console'da hata mesajlarını görün
   ```

2. **Test komutlarını çalıştırın**:
   ```bash
   pnpm test:gemini
   pnpm test:chat-flow
   ```

3. **Troubleshooting guide'a bakın**: [docs/troubleshooting.md](./troubleshooting.md)

4. **Issue açın**: GitHub repository'de issue açarak yardım isteyin

---

**Başarılar! 🚀**
