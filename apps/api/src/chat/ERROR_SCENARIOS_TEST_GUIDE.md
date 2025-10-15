# Error Scenarios Test Guide

Bu dokümant, chat sisteminin hata senaryolarını test etmek için kapsamlı bir rehber sağlar.

## Test Senaryoları

### 1. Timeout Senaryosu ⏱️

**Amaç**: Sistem, zaman aşımı hatalarını doğru şekilde algılamalı ve kullanıcıya Türkçe, anlaşılır bir mesaj göstermelidir.

**Test Adımları**:

#### Otomatik Test
```bash
# Backend test çalıştır
bash apps/api/src/chat/run-error-tests.sh
```

Test, çok kısa bir timeout (100ms) ile istek gönderir ve timeout hatasını doğrular.

#### Manuel Test
1. API'yi başlat: `pnpm dev`
2. Mobile app'i başlat
3. Chat ekranına git
4. Çok uzun bir mesaj gönder (örn: "Bana hamilelik hakkında çok detaylı bilgi ver")
5. Network'ü yavaşlat (Chrome DevTools > Network > Slow 3G)
6. Timeout hatası alınmalı

**Beklenen Sonuç**:
- Hata mesajı: "İstek zaman aşımına uğradı, lütfen tekrar deneyin"
- Kullanıcıya "Tekrar Dene" seçeneği sunulmalı
- Hata log'lanmalı (backend console'da görünmeli)

**Hata Sınıflandırması**:
```typescript
ErrorType.TIMEOUT
- error.code === 'ETIMEDOUT'
- error.code === 'ECONNABORTED'
- error.message.includes('timeout')
```

---

### 2. Rate Limit Senaryosu 🚦

**Amaç**: Kullanıcı mesaj kotasını doldurduğunda, sistem bunu engellemeli ve kullanıcıya bilgi vermelidir.

**Test Adımları**:

#### Otomatik Test
```bash
bash apps/api/src/chat/run-error-tests.sh
```

Test, kullanıcının kotasını 99/100'e ayarlar ve 2 istek gönderir. İkinci istek reddedilmelidir.

#### Manuel Test
1. Database'de test kullanıcısının kotasını limite yakın ayarla:
```sql
UPDATE "UsageQuota" 
SET "aiRequests" = 99, "limit" = 100 
WHERE "userId" = 'your-user-id';
```

2. Mobile app'te 2 mesaj gönder
3. İkinci mesaj reddedilmeli

**Beklenen Sonuç**:
- HTTP 403 Forbidden
- Hata mesajı: "Aylık mesaj kotanız doldu (100/100). Yeni ay: [tarih]"
- "Premium'a Geç" seçeneği sunulmalı
- Quota bilgisi header'da güncellenmiş olmalı

**QuotaGuard Kontrolü**:
```typescript
if (quota.used >= quota.limit) {
  throw new ForbiddenException(
    `Aylık mesaj kotanız doldu (${quota.limit}/${quota.limit}). Yeni ay: ${quota.resetsAt}`
  );
}
```

---

### 3. Network Kesintisi Senaryosu 🌐

**Amaç**: Network bağlantısı kesildiğinde veya API'ye ulaşılamadığında, kullanıcıya anlaşılır bir mesaj gösterilmelidir.

**Test Adımları**:

#### Otomatik Test
```bash
bash apps/api/src/chat/run-error-tests.sh
```

Test, geçersiz bir host'a istek gönderir ve network hatasını doğrular.

#### Manuel Test - Mobil
1. Mobile app'i başlat
2. Chat ekranına git
3. Bir mesaj yaz
4. Cihazın Wi-Fi/mobil verisini kapat
5. Mesajı gönder

**Beklenen Sonuç**:
- Hata mesajı: "Bağlantı hatası, internet bağlantınızı kontrol edin"
- "Tekrar Dene" seçeneği sunulmalı
- Mesaj gönderilmemeli (database'e kaydedilmemeli)

**Hata Sınıflandırması**:
```typescript
ErrorType.NETWORK
- error.code === 'ECONNREFUSED'
- error.code === 'ENOTFOUND'
- error.code === 'ECONNRESET'
- error.statusCode === 503
```

---

### 4. "Durdur" Butonu Senaryosu ⏹️

**Amaç**: Kullanıcı streaming sırasında "Durdur" butonuna bastığında, stream kesilmeli ve yarım kalan mesaj kaydedilmemelidir.

**Test Adımları**:

#### Otomatik Test
```bash
bash apps/api/src/chat/run-error-tests.sh
```

Test, streaming başlatır ve 500ms sonra abort eder.

#### Manuel Test - Mobil
1. Mobile app'i başlat
2. Chat ekranına git
3. Uzun bir yanıt gerektiren mesaj gönder (örn: "Hamileliğin tüm evrelerini detaylı anlat")
4. Streaming başladığında "⏹ Durdur" butonuna bas
5. Stream durmalı

**Beklenen Sonuç**:
- Stream anında kesilmeli
- Yarım kalan mesaj UI'dan kaldırılmalı
- Database'e assistant mesajı kaydedilmemeli
- Quota artırılmamalı
- "Durdur" butonu kaybolup normal input alanı geri gelmeli

**Kod Kontrolü**:
```typescript
// Mobile - chat.tsx
const handleStop = () => {
  sseClient.current.stop();
  setIsStreaming(false);
  setStreamingContent('');
  setMessages((prev) =>
    prev.filter((msg) => !msg.isStreaming)
  );
};

// Backend - chat.controller.ts
const abort = new AbortController();
req.on('close', () => abort.abort());

if (abort.signal.aborted) {
  break; // Stop streaming
}
```

**Doğrulama**:
```sql
-- Conversation'daki mesaj sayısını kontrol et
SELECT COUNT(*) FROM "Message" 
WHERE "conversationId" = 'your-conversation-id';

-- Quota'nın artmadığını kontrol et
SELECT "aiRequests" FROM "UsageQuota" 
WHERE "userId" = 'your-user-id';
```

---

### 5. API Key Hatası Senaryosu 🔑

**Amaç**: API key eksik veya geçersiz olduğunda, sistem bunu algılamalı ve admin'e bildirilmelidir.

**Test Adımları**:

#### Otomatik Test
```bash
bash apps/api/src/chat/run-error-tests.sh
```

Test, environment variable'ın varlığını kontrol eder.

#### Manuel Test
1. `.env.local` dosyasında `GOOGLE_GENERATIVE_AI_API_KEY` değerini geçersiz yap:
```bash
GOOGLE_GENERATIVE_AI_API_KEY=invalid-key-12345
```

2. API'yi yeniden başlat
3. Bir mesaj gönder

**Beklenen Sonuç**:
- Kullanıcıya: "Sistem yapılandırma hatası oluştu"
- Backend log'da: Critical error - API configuration issue
- Production'da: Sentry'ye gönderilmeli
- HTTP 500 veya 401

**Hata Sınıflandırması**:
```typescript
ErrorType.API_KEY
- error.message.includes('api key')
- error.message.includes('authentication')
- error.statusCode === 401
```

---

### 6. Geçersiz İstek Senaryosu ❌

**Amaç**: Kullanıcı geçersiz bir istek gönderdiğinde (örn: boş mesaj, çok uzun mesaj), sistem bunu reddetmelidir.

**Test Adımları**:

#### Manuel Test
1. Mobile app'te boş mesaj göndermeyi dene
   - Beklenen: "Gönder" butonu disabled olmalı

2. 500 karakterden uzun mesaj göndermeyi dene
   - Beklenen: TextInput maxLength ile engellenmiş olmalı

3. API'ye doğrudan geçersiz istek gönder:
```bash
curl -X POST http://localhost:3001/chat/invalid-id/message \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"content": ""}'
```

**Beklenen Sonuç**:
- HTTP 400 Bad Request
- Hata mesajı: "Geçersiz istek"

---

## Test Sonuçları Doğrulama

### Başarılı Test Kriterleri

Her test senaryosu için:

✅ **Hata Doğru Algılanmalı**
- Error type doğru sınıflandırılmalı
- Error code/message doğru parse edilmeli

✅ **Kullanıcı Dostu Mesaj**
- Türkçe olmalı
- Teknik terimler içermemeli
- Çözüm önerisi sunmalı

✅ **Hata Loglanmalı**
- Backend console'da görünmeli
- User ID ve conversation ID içermeli
- Error stack trace olmalı

✅ **Graceful Degradation**
- Uygulama crash olmamalı
- Kullanıcı retry edebilmeli
- State tutarlı kalmalı

✅ **Data Integrity**
- Yarım mesajlar kaydedilmemeli
- Quota yanlış artırılmamalı
- Database tutarlı kalmalı

### Test Çıktısı Örneği

```
🚀 Starting Error Scenarios Test Suite
============================================================

✅ Create Test User: User created with ID: clx123...
✅ Generate Auth Token: Token generated successfully

🔴 Test 1: Timeout Scenario

✅ Timeout Test: Timeout error correctly detected
   Data: {
     "errorCode": "ECONNABORTED",
     "message": "timeout of 100ms exceeded"
   }

🔴 Test 2: Rate Limit Scenario

✅ Setup Rate Limit: Quota set to 99/100
✅ Rate Limit Test - Request 1: First request succeeded as expected
✅ Rate Limit Test - Request 2: Rate limit correctly enforced
   Data: {
     "status": 403,
     "message": "Aylık mesaj kotanız doldu (100/100)..."
   }

🔴 Test 3: Network Interruption Scenario

✅ Network Interruption Test: Network error correctly detected
   Data: {
     "errorCode": "ENOTFOUND",
     "message": "getaddrinfo ENOTFOUND invalid-host..."
   }

🔴 Test 4: Abort/Stop Button Scenario

✅ Abort Signal Sent: Abort signal sent after 500ms
✅ Abort Test: Request correctly aborted
   Data: {
     "errorCode": "ERR_CANCELED"
   }
✅ Abort Test - No Message Saved: Assistant message correctly not saved

🔴 Test 5: Invalid API Key Scenario

✅ API Key Check: API key is configured
✅ Invalid API Key Test: API key validation logic verified

🔴 Test 6: Error Message Localization

✅ Error Message Localization: All error messages are properly localized
✅ User-Friendly Messages: Error messages are user-friendly

✅ Cleanup: Test user cleaned up

============================================================

📊 Test Summary

Total Tests: 15
Passed: 15
Failed: 0
Success Rate: 100.0%

🎉 All error scenario tests passed!
```

---

## Troubleshooting

### Test Başarısız Olursa

**Problem**: Timeout testi başarısız
- **Çözüm**: API'nin çalıştığından emin ol, timeout değerini ayarla

**Problem**: Rate limit testi başarısız
- **Çözüm**: Database'de quota'nın doğru ayarlandığını kontrol et

**Problem**: Network testi başarısız
- **Çözüm**: Geçersiz host'un gerçekten ulaşılamaz olduğunu doğrula

**Problem**: Abort testi başarısız
- **Çözüm**: Backend'in abort signal'ı doğru handle ettiğini kontrol et

---

## Continuous Integration

Bu testler CI/CD pipeline'ına eklenebilir:

```yaml
# .github/workflows/test.yml
- name: Run Error Scenario Tests
  run: |
    pnpm install
    pnpm --filter api build
    bash apps/api/src/chat/run-error-tests.sh
```

---

## Sonuç

Bu test suite, chat sisteminin tüm hata senaryolarını kapsamlı şekilde test eder. Her test:

1. ✅ Hatayı doğru algılar
2. ✅ Kullanıcıya Türkçe, anlaşılır mesaj gösterir
3. ✅ Hatayı loglar
4. ✅ Data integrity'yi korur
5. ✅ Graceful degradation sağlar

**Requirements Karşılama**:
- ✅ 1.5: Hata yönetimi ve kullanıcı dostu mesajlar
- ✅ 1.8: Mobile UI hata gösterimi ve retry mekanizması
