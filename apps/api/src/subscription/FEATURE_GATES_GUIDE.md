# Feature Gates Implementation Guide

Bu döküman, premium subscription feature gate sisteminin nasıl kullanılacağını açıklar.

## Genel Bakış

Feature gate sistemi, premium özelliklere erişimi kontrol etmek için kullanılır. Sistem üç ana bileşenden oluşur:

1. **Guards**: Endpoint'lere erişim kontrolü
2. **Decorators**: Endpoint'leri işaretleme
3. **Service Integration**: Subscription servisi ile entegrasyon

## Kurulum

### 1. Module Import

Feature gate'leri kullanmak istediğiniz module'e `SubscriptionModule`'ü import edin:

```typescript
import { Module } from '@nestjs/common';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [SubscriptionModule],
  // ...
})
export class YourModule {}
```

### 2. Guard ve Decorator Import

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  PremiumGuard, 
  FeatureGuard, 
  RequirePremium, 
  RequireFeature 
} from '../subscription/guards';
```

## Kullanım Senaryoları

### Senaryo 1: Tüm Endpoint Premium

Bir controller'ın tüm endpoint'lerini premium yapmak için:

```typescript
@Controller('insights')
@UseGuards(AuthGuard('jwt'), PremiumGuard)
export class InsightsController {
  @Get()
  async getInsights(@Request() req) {
    // Sadece premium kullanıcılar erişebilir
    const subscription = req.subscription;
    return this.insightsService.generate(req.user.id);
  }

  @Get('detailed')
  async getDetailedInsights(@Request() req) {
    // Bu da premium gerektirir
    return this.insightsService.getDetailed(req.user.id);
  }
}
```

### Senaryo 2: Belirli Endpoint'ler Premium

Sadece belirli endpoint'leri premium yapmak için:

```typescript
@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  @Get('basic')
  async getBasicAnalytics(@Request() req) {
    // Herkes erişebilir
    return this.analyticsService.getBasic(req.user.id);
  }

  @Get('advanced')
  @UseGuards(PremiumGuard)
  async getAdvancedAnalytics(@Request() req) {
    // Sadece premium kullanıcılar erişebilir
    return this.analyticsService.getAdvanced(req.user.id);
  }
}
```

### Senaryo 3: Özellik Bazlı Kontrol

Farklı premium özellikler için farklı endpoint'ler:

```typescript
@Controller('premium')
@UseGuards(AuthGuard('jwt'), FeatureGuard)
export class PremiumFeaturesController {
  @Get('insights')
  @RequireFeature('insights')
  async getInsights(@Request() req) {
    // 'insights' özelliği gerekli
    return this.insightsService.generate(req.user.id);
  }

  @Get('analytics')
  @RequireFeature('advanced_analytics')
  async getAnalytics(@Request() req) {
    // 'advanced_analytics' özelliği gerekli
    return this.analyticsService.getAdvanced(req.user.id);
  }

  @Get('customize')
  @RequireFeature('customization')
  async getCustomization(@Request() req) {
    // 'customization' özelliği gerekli
    return this.customizationService.getOptions(req.user.id);
  }
}
```

### Senaryo 4: AI Endpoint'leri (Quota ile)

AI endpoint'leri için quota kontrolü ile birlikte:

```typescript
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  @Sse(':conversationId/stream')
  @UseGuards(QuotaGuard) // Quota kontrolü yapar
  async stream(@CurrentUser() user: any, @Param('conversationId') conversationId: string) {
    // QuotaGuard otomatik olarak subscription'a göre limit kontrol eder
    // Premium: 1000 mesaj/ay
    // Free: 100 mesaj/ay
    return this.chatService.stream(user.id, conversationId);
  }
}
```

### Senaryo 5: Koşullu Premium Özellikler

Service içinde subscription durumuna göre farklı davranış:

```typescript
@Controller('recommendations')
@UseGuards(AuthGuard('jwt'))
export class RecommendationsController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get()
  async getRecommendations(@Request() req) {
    const subscription = await this.subscriptionService.getSubscription(req.user.id);
    const isPremium = ['ACTIVE', 'TRIAL', 'GRACE_PERIOD'].includes(subscription.status);

    if (isPremium) {
      // Premium kullanıcılar için gelişmiş öneriler
      return this.recommendationService.getAdvanced(req.user.id);
    } else {
      // Ücretsiz kullanıcılar için temel öneriler
      return this.recommendationService.getBasic(req.user.id);
    }
  }
}
```

## Özellik Listesi

### Ücretsiz Özellikler
```typescript
const FREE_FEATURES = [
  'basic_chat',           // Temel AI sohbet
  'cycle_tracking',       // Döngü takibi
  'water_tracking',       // Su takibi
  'basic_reminders',      // Temel hatırlatıcılar
  'pregnancy_tracking',   // Hamilelik takibi
  'wellness_tracking',    // Sağlık takibi
];
```

### Premium Özellikler
```typescript
const PREMIUM_FEATURES = [
  'advanced_ai',          // Gelişmiş AI modeli
  'priority_response',    // Öncelikli yanıt
  'insights',             // Kişisel içgörüler
  'advanced_analytics',   // Gelişmiş analizler
  'customization',        // Özelleştirme
  'unlimited_messages',   // Sınırsız mesaj
];
```

## Hata Yönetimi

### Premium Gerekli Hatası

```json
{
  "statusCode": 403,
  "message": "Bu özellik premium kullanıcılar içindir. Premium'a geçerek erişim sağlayabilirsiniz.",
  "error": "Forbidden",
  "code": "PREMIUM_REQUIRED",
  "subscription": {
    "status": "FREE",
    "tier": null
  }
}
```

### Özellik Kilitli Hatası

```json
{
  "statusCode": 403,
  "message": "\"Gelişmiş AI\" özelliği premium kullanıcılar içindir. Premium'a geçerek erişim sağlayabilirsiniz.",
  "error": "Forbidden",
  "code": "FEATURE_LOCKED",
  "feature": "advanced_ai",
  "subscription": {
    "status": "FREE",
    "tier": null
  }
}
```

### Quota Aşıldı Hatası

```json
{
  "statusCode": 403,
  "message": "Aylık mesaj kotanız doldu (100/100). Premium'a geçerek sınırsız mesaj gönderin. Yeni ay: 1 Kasım 2025",
  "error": "Forbidden",
  "code": "QUOTA_EXCEEDED",
  "quota": {
    "used": 100,
    "limit": 100,
    "remaining": 0,
    "resetsAt": "2025-11-01T00:00:00.000Z",
    "percentage": 100
  },
  "upgradeRequired": true
}
```

## Frontend Entegrasyonu

### Hata Yakalama

```typescript
try {
  const response = await api.get('/insights');
  return response.data;
} catch (error) {
  if (error.response?.data?.code === 'PREMIUM_REQUIRED') {
    // Premium upgrade prompt göster
    showUpgradePrompt({
      title: 'Premium Özellik',
      message: error.response.data.message,
    });
  } else if (error.response?.data?.code === 'FEATURE_LOCKED') {
    // Özellik kilitli prompt göster
    showFeatureLockedPrompt({
      feature: error.response.data.feature,
      message: error.response.data.message,
    });
  } else if (error.response?.data?.code === 'QUOTA_EXCEEDED') {
    // Quota aşıldı prompt göster
    showQuotaExceededPrompt({
      quota: error.response.data.quota,
      upgradeRequired: error.response.data.upgradeRequired,
    });
  }
}
```

### React Hook Örneği

```typescript
export function usePremiumFeature(feature: string) {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getStatus(),
  });

  const canAccess = useMemo(() => {
    if (!subscription) return false;
    
    const freeFeatures = ['basic_chat', 'cycle_tracking', 'water_tracking'];
    if (freeFeatures.includes(feature)) return true;
    
    return ['ACTIVE', 'TRIAL', 'GRACE_PERIOD'].includes(subscription.status);
  }, [subscription, feature]);

  return {
    canAccess,
    subscription,
    isPremium: ['ACTIVE', 'TRIAL', 'GRACE_PERIOD'].includes(subscription?.status),
  };
}
```

## Test Örnekleri

### Guard Testi

```typescript
describe('FeatureGuard', () => {
  it('should allow premium users to access premium features', async () => {
    const context = createMockContext({ id: 'user-1' });
    
    subscriptionService.getSubscription.mockResolvedValue({
      status: 'ACTIVE',
      tier: 'MONTHLY',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny free users from premium features', async () => {
    const context = createMockContext({ id: 'user-1' });
    
    subscriptionService.getSubscription.mockResolvedValue({
      status: 'FREE',
      tier: null,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
```

## Best Practices

### 1. Guard Sırası

Guard'ları doğru sırada kullanın:

```typescript
// ✅ Doğru
@UseGuards(AuthGuard('jwt'), PremiumGuard)

// ❌ Yanlış
@UseGuards(PremiumGuard, AuthGuard('jwt'))
```

### 2. Subscription Bilgisine Erişim

Guard'lar subscription bilgisini request'e ekler:

```typescript
@Get('insights')
@UseGuards(AuthGuard('jwt'), PremiumGuard)
async getInsights(@Request() req) {
  const subscription = req.subscription; // Guard tarafından eklenir
  const userId = req.user.id;
  
  // Subscription bilgisini kullan
  console.log(`User ${userId} has ${subscription.tier} subscription`);
}
```

### 3. Özellik İsimlendirme

Özellik isimlerini snake_case formatında kullanın:

```typescript
// ✅ Doğru
@RequireFeature('advanced_analytics')

// ❌ Yanlış
@RequireFeature('advancedAnalytics')
@RequireFeature('Advanced Analytics')
```

### 4. Hata Mesajları

Kullanıcı dostu hata mesajları kullanın:

```typescript
throw new ForbiddenException({
  code: 'FEATURE_LOCKED',
  message: 'Bu özellik premium kullanıcılar içindir.',
  messageEn: 'This feature requires premium subscription.',
  feature: 'insights',
});
```

## Performans Optimizasyonu

### 1. Subscription Cache

Subscription bilgisi guard'larda cache'lenir:

```typescript
// Guard içinde
const subscription = await this.subscriptionService.getSubscription(userId);
request.subscription = subscription; // Cache için request'e ekle
```

### 2. Batch Kontrolü

Birden fazla özellik kontrolü için:

```typescript
const features = ['insights', 'advanced_analytics', 'customization'];
const subscription = await this.subscriptionService.getSubscription(userId);

const accessMap = features.reduce((acc, feature) => {
  acc[feature] = this.canAccessFeature(feature, subscription.status);
  return acc;
}, {});
```

## Troubleshooting

### Problem: Guard çalışmıyor

**Çözüm**: Module'e SubscriptionModule'ü import ettiğinizden emin olun:

```typescript
@Module({
  imports: [SubscriptionModule], // Bunu ekleyin
  // ...
})
```

### Problem: Subscription bilgisi undefined

**Çözüm**: Guard'ı kullandığınızdan emin olun:

```typescript
@UseGuards(AuthGuard('jwt'), PremiumGuard) // Guard ekleyin
async getInsights(@Request() req) {
  const subscription = req.subscription; // Artık tanımlı
}
```

### Problem: Test'ler başarısız

**Çözüm**: Mock'ları doğru şekilde yapılandırın:

```typescript
const mockSubscriptionService = {
  getSubscription: jest.fn().mockResolvedValue({
    status: 'ACTIVE',
    tier: 'MONTHLY',
  }),
};
```

## Requirements Coverage

Bu implementasyon aşağıdaki requirement'ları karşılar:

- ✅ **5.1**: Premium özellik erişim kontrolü
- ✅ **5.2**: Yükseltme prompt gösterimi
- ✅ **5.3**: Premium plan faydaları açıklaması
- ✅ **5.4**: Premium'a yönlendirme
- ✅ **5.5**: İptal seçeneği
- ✅ **5.6**: Kullanıcı dostu hata mesajları
- ✅ **6.1-6.7**: AI mesaj quota kontrolü
- ✅ **17.1-17.5**: Premium özelliklere gate ekleme

## Sonuç

Feature gate sistemi, premium özelliklere erişimi kontrol etmek için güçlü ve esnek bir yol sağlar. Guard'lar, decorator'lar ve service entegrasyonu ile kolayca kullanılabilir ve test edilebilir.

Daha fazla bilgi için:
- [Guards README](./guards/README.md)
- [Subscription Service](./subscription.service.ts)
- [Test Examples](./guards/*.spec.ts)
