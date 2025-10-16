# Feature Gate Guards

Bu dizin, premium özelliklere erişim kontrolü için guard'ları içerir.

## Guards

### PremiumGuard

Endpoint'in premium abonelik gerektirdiğini kontrol eder.

**Kullanım:**
```typescript
import { UseGuards } from '@nestjs/common';
import { PremiumGuard } from '../subscription/guards/premium.guard';

@Get('insights')
@UseGuards(AuthGuard('jwt'), PremiumGuard)
async getInsights(@Request() req) {
  // Bu endpoint sadece premium kullanıcılar tarafından erişilebilir
  // req.subscription ile abonelik bilgisine erişebilirsiniz
}
```

### FeatureGuard

Belirli bir özelliğe erişim kontrolü yapar. `@RequireFeature()` decorator'ı ile birlikte kullanılır.

**Kullanım:**
```typescript
import { UseGuards } from '@nestjs/common';
import { FeatureGuard } from '../subscription/guards/feature.guard';
import { RequireFeature } from '../subscription/decorators/feature.decorator';

@Get('advanced-analytics')
@UseGuards(AuthGuard('jwt'), FeatureGuard)
@RequireFeature('advanced_analytics')
async getAdvancedAnalytics(@Request() req) {
  // Bu endpoint sadece 'advanced_analytics' özelliğine sahip kullanıcılar tarafından erişilebilir
}
```

## Decorators

### @RequirePremium()

Endpoint'in premium gerektirdiğini işaretler. `PremiumGuard` ile birlikte kullanılır.

```typescript
import { RequirePremium } from '../subscription/decorators/premium.decorator';

@Get('premium-feature')
@UseGuards(AuthGuard('jwt'), PremiumGuard)
@RequirePremium()
async premiumFeature() {
  // Premium özellik
}
```

### @RequireFeature(feature: string)

Endpoint'in belirli bir özellik gerektirdiğini işaretler. `FeatureGuard` ile birlikte kullanılır.

```typescript
import { RequireFeature } from '../subscription/decorators/feature.decorator';

@Get('insights')
@UseGuards(AuthGuard('jwt'), FeatureGuard)
@RequireFeature('insights')
async getInsights() {
  // İçgörüler özelliği
}
```

## Özellik Listesi

### Ücretsiz Özellikler
- `basic_chat` - Temel AI sohbet
- `cycle_tracking` - Döngü takibi
- `water_tracking` - Su takibi
- `basic_reminders` - Temel hatırlatıcılar
- `pregnancy_tracking` - Hamilelik takibi
- `wellness_tracking` - Sağlık takibi

### Premium Özellikler
- `advanced_ai` - Gelişmiş AI modeli
- `priority_response` - Öncelikli yanıt
- `insights` - Kişisel içgörüler
- `advanced_analytics` - Gelişmiş analizler
- `customization` - Özelleştirme seçenekleri
- `unlimited_messages` - Sınırsız mesaj

## Hata Yanıtları

### Premium Gerekli
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

### Özellik Kilitli
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

## Quota Guard Entegrasyonu

`QuotaGuard` artık subscription sistemi ile entegre edilmiştir. Premium kullanıcılar için daha yüksek limitler otomatik olarak uygulanır.

**Kullanım:**
```typescript
import { QuotaGuard } from '../quota/quota.guard';

@Sse(':conversationId/stream')
@UseGuards(AuthGuard('jwt'), QuotaGuard)
async stream(@CurrentUser() user: any) {
  // Quota kontrolü otomatik olarak yapılır
  // Premium kullanıcılar: 1000 mesaj/ay
  // Ücretsiz kullanıcılar: 100 mesaj/ay
}
```

## Requirements Coverage

Bu implementasyon aşağıdaki requirement'ları karşılar:

- **5.1-5.6**: Premium özellik erişim kontrolü
- **6.1-6.7**: AI mesaj quota kontrolü
- **17.1-17.5**: Premium özelliklere gate ekleme

## Örnek Senaryolar

### Senaryo 1: Premium Endpoint
```typescript
@Controller('analytics')
export class AnalyticsController {
  @Get('advanced')
  @UseGuards(AuthGuard('jwt'), PremiumGuard)
  async getAdvancedAnalytics(@Request() req) {
    const subscription = req.subscription;
    // Premium kullanıcı için gelişmiş analizler
    return this.analyticsService.getAdvanced(req.user.id);
  }
}
```

### Senaryo 2: Özellik Bazlı Kontrol
```typescript
@Controller('insights')
export class InsightsController {
  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @RequireFeature('insights')
  async getInsights(@Request() req) {
    // Sadece insights özelliğine sahip kullanıcılar erişebilir
    return this.insightsService.generate(req.user.id);
  }
}
```

### Senaryo 3: Quota ile Birlikte
```typescript
@Controller('chat')
export class ChatController {
  @Sse(':conversationId/stream')
  @UseGuards(AuthGuard('jwt'), QuotaGuard)
  async stream(@CurrentUser() user: any) {
    // Quota kontrolü yapılır
    // Premium: 1000 mesaj/ay
    // Free: 100 mesaj/ay
    return this.chatService.stream(user.id);
  }
}
```
