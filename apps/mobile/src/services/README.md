# Services Documentation

Bu klasör, uygulamanın tüm servis katmanı kodlarını içerir.

## 📁 Dosyalar

### `api.ts`
Ana API client ve tüm backend endpoint'leri içerir.

**Servisler:**
- `authService` - Kimlik doğrulama
- `userService` - Kullanıcı profili yönetimi
- `metricsService` - Sağlık metrikleri
- `waterService` - Su takibi
- `chatService` - AI sohbet
- `quotaService` - Mesaj kotası
- `cyclesService` - Adet döngüsü takibi
- `pregnancyService` - Hamilelik takibi
- `remindersService` - Hatırlatıcılar
- `homeService` - Ana sayfa verileri
- `wellnessService` - Wellness özellikleri
- `discoverService` - İçerik keşfi
- `subscriptionService` - Premium abonelik

### `iap.ts`
In-App Purchase (IAP) yönetimi için servis.

**Özellikler:**
- Store bağlantısı yönetimi
- Ürün yükleme
- Satın alma işlemleri
- Satın alma geri yükleme
- Makbuz doğrulama
- Event listener'lar

**Kullanım:**
```typescript
import { iapManager } from '@/services/iap';

// Initialize (app başlangıcında)
await iapManager.initialize();

// Get products
const products = iapManager.getProducts();

// Purchase
const purchase = await iapManager.purchase('monthly');

// Restore
const purchases = await iapManager.restorePurchases();

// Cleanup (app kapanışında)
await iapManager.cleanup();
```

## 🔧 Yapılandırma

### Environment Variables

```bash
# .env.local
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

### IAP Configuration

IAP yapılandırması için:
- Product ID'ler: `src/config/iap.config.ts`
- Setup guide: `docs/IAP_SETUP_GUIDE.md`

## 📚 Örnekler

IAP kullanım örnekleri için:
- `__tests__/iap.example.ts` dosyasına bakın

## 🔐 Güvenlik

- Tüm API istekleri JWT token ile korunur
- IAP makbuzları backend'de doğrulanır
- Hassas veriler SecureStore'da saklanır
- HTTPS zorunludur (production)

## 🐛 Debugging

API isteklerini debug etmek için:
```typescript
// Console'da [IAP] prefix'li logları arayın
console.log('[IAP] ...');
```

## 📖 Daha Fazla Bilgi

- [IAP Setup Guide](../../docs/IAP_SETUP_GUIDE.md)
- [API Documentation](../../../api/README.md)
