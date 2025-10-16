# Subscription Analytics & Monitoring Guide

Bu dokümantasyon, premium subscription sistemi için analytics ve monitoring özelliklerini açıklar.

## Genel Bakış

Analytics sistemi, abonelik işletme metriklerini takip eder ve raporlar. Sistem şu temel metrikleri sağlar:

- **MRR (Monthly Recurring Revenue)**: Aylık tekrarlayan gelir
- **ARPU (Average Revenue Per User)**: Kullanıcı başına ortalama gelir
- **Churn Rate**: Müşteri kaybı oranı
- **Conversion Rate**: Dönüşüm oranı
- **LTV (Lifetime Value)**: Müşteri yaşam boyu değeri

## Özellikler

### 1. Event Logging

Tüm abonelik olayları otomatik olarak loglanır:

```typescript
// Örnek: Abonelik başlatma eventi
await analyticsService.logSubscriptionEvent(
  userId,
  'subscription_started',
  {
    tier: 'YEARLY',
    provider: 'APPLE',
    startDate: '2025-10-16T00:00:00Z',
    endDate: '2026-10-16T00:00:00Z',
  }
);
```

**Loglanan Event Tipleri:**
- `subscription_started`: Yeni abonelik başladı
- `subscription_renewed`: Abonelik yenilendi
- `subscription_cancelled`: Abonelik iptal edildi
- `subscription_expired`: Abonelik süresi doldu
- `subscription_grace_period`: Grace period başladı
- `subscription_conversion`: Free'den premium'a geçiş
- `subscription_churn`: Müşteri kaybı

### 2. Conversion Tracking

Free kullanıcıların premium'a geçişini takip eder:

```typescript
await analyticsService.trackConversion(
  userId,
  SubscriptionTier.YEARLY,
  999,
  'mobile_app'
);
```

**Conversion Metrikleri:**
- Toplam kullanıcı sayısı
- Trial başlangıçları
- Dönüşüm sayısı
- Dönüşüm oranı (%)
- Ortalama dönüşüm süresi (gün)

### 3. Churn Tracking

Müşteri kaybını ve nedenlerini takip eder:

```typescript
await analyticsService.trackChurn(
  userId,
  'cancelled',
  {
    tier: 'MONTHLY',
    cancelledAt: new Date().toISOString(),
  }
);
```

**Churn Nedenleri:**
- `cancelled`: Kullanıcı iptal etti
- `expired`: Süre doldu
- `payment_failed`: Ödeme başarısız

### 4. MRR (Monthly Recurring Revenue)

Aylık tekrarlayan geliri hesaplar:

```typescript
const mrr = await analyticsService.calculateMRR();
// {
//   totalMRR: 8325.00,
//   monthlyMRR: 4950.00,
//   yearlyMRR: 3375.00,
//   activeSubscriptions: 100
// }
```

**Hesaplama:**
- Aylık plan: ₺99/ay
- Yıllık plan: ₺999/yıl = ₺83.25/ay
- Toplam MRR = Tüm aktif aboneliklerin aylık değeri

### 5. ARPU (Average Revenue Per User)

Kullanıcı başına ortalama geliri hesaplar:

```typescript
const arpu = await analyticsService.calculateARPU();
// {
//   overallARPU: 8.33,
//   payingARPU: 83.25,
//   totalUsers: 1000,
//   payingUsers: 100
// }
```

**Metrikler:**
- Overall ARPU: Tüm kullanıcılar için ortalama
- Paying ARPU: Sadece ödeme yapan kullanıcılar için

### 6. Churn Rate

Belirli bir dönem için müşteri kaybı oranını hesaplar:

```typescript
const churnRate = await analyticsService.calculateChurnRate(
  new Date('2025-09-01'),
  new Date('2025-09-30')
);
// {
//   churnRate: 5.5,
//   churnedUsers: 11,
//   activeUsersAtStart: 200,
//   churnReasons: {
//     cancelled: 7,
//     expired: 3,
//     payment_failed: 1
//   }
// }
```

### 7. LTV (Lifetime Value)

Müşteri yaşam boyu değerini hesaplar:

```typescript
const ltv = await analyticsService.calculateLTV();
// {
//   averageLTV: 450.00,
//   averageLifetimeMonths: 5.4,
//   totalRevenue: 45000.00,
//   totalChurnedUsers: 100
// }
```

## API Endpoints

### Dashboard Metrikleri

Tüm metrikleri tek seferde getirir:

```http
GET /subscription/analytics/dashboard?startDate=2025-09-01&endDate=2025-09-30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "mrr": { ... },
  "arpu": { ... },
  "churn": { ... },
  "conversion": { ... },
  "revenue": { ... },
  "distribution": { ... }
}
```

### MRR Endpoint

```http
GET /subscription/analytics/mrr
Authorization: Bearer <token>
```

### ARPU Endpoint

```http
GET /subscription/analytics/arpu
Authorization: Bearer <token>
```

### Churn Rate Endpoint

```http
GET /subscription/analytics/churn?startDate=2025-09-01&endDate=2025-09-30
Authorization: Bearer <token>
```

### Conversion Metrics Endpoint

```http
GET /subscription/analytics/conversion?startDate=2025-09-01&endDate=2025-09-30
Authorization: Bearer <token>
```

### Revenue Metrics Endpoint

```http
GET /subscription/analytics/revenue?startDate=2025-09-01&endDate=2025-09-30
Authorization: Bearer <token>
```

### Distribution Endpoint

```http
GET /subscription/analytics/distribution
Authorization: Bearer <token>
```

### LTV Endpoint

```http
GET /subscription/analytics/ltv
Authorization: Bearer <token>
```

## Otomatik Event Logging

Analytics sistemi, subscription service'deki tüm önemli olayları otomatik olarak loglar:

### Abonelik Başlatma
```typescript
// subscription.service.ts - processPurchase()
await this.analyticsService.trackConversion(userId, tier, amount, 'mobile_app');
await this.analyticsService.logSubscriptionEvent(userId, 'subscription_started', {...});
```

### Abonelik İptali
```typescript
// subscription.service.ts - cancelSubscription()
await this.analyticsService.trackChurn(userId, 'cancelled', {...});
await this.analyticsService.logSubscriptionEvent(userId, 'subscription_cancelled', {...});
```

### Abonelik Süresi Dolması
```typescript
// subscription.service.ts - handleExpiration()
await this.analyticsService.trackChurn(userId, 'expired', {...});
await this.analyticsService.logSubscriptionEvent(userId, 'subscription_expired', {...});
```

### Abonelik Yenileme
```typescript
// subscription.service.ts - handleRenewal()
await this.analyticsService.logSubscriptionEvent(userId, 'subscription_renewed', {...});
```

### Grace Period
```typescript
// subscription.service.ts - handleGracePeriod()
await this.analyticsService.trackChurn(userId, 'payment_failed', {...});
await this.analyticsService.logSubscriptionEvent(userId, 'subscription_grace_period', {...});
```

## Veritabanı Yapısı

Analytics verileri `AuditLog` tablosunda saklanır:

```prisma
model AuditLog {
  id           String   @id @default(cuid())
  userId       String?
  action       String   // Event tipi
  entity       String   // 'subscription'
  entityId     String?  // userId
  metadataJson Json?    // Event detayları
  createdAt    DateTime @default(now())
}
```

## Monitoring Best Practices

### 1. Günlük Kontroller
- MRR trendini takip edin
- Churn rate'i izleyin (hedef: <5%)
- Conversion rate'i optimize edin

### 2. Haftalık Raporlar
- Revenue breakdown analizi
- Churn nedenleri analizi
- Tier distribution analizi

### 3. Aylık Değerlendirme
- LTV hesaplaması
- ARPU trendi
- Cohort analizi

### 4. Alertler
- Churn rate %10'u geçerse
- MRR %20'den fazla düşerse
- Conversion rate %50'den fazla düşerse

## Örnek Kullanım Senaryoları

### Senaryo 1: Aylık Performans Raporu

```typescript
const lastMonth = {
  start: new Date('2025-09-01'),
  end: new Date('2025-09-30')
};

const dashboard = await analyticsService.getDashboardMetrics(
  lastMonth.start,
  lastMonth.end
);

console.log('Aylık Rapor:');
console.log('MRR:', dashboard.mrr.totalMRR);
console.log('Churn Rate:', dashboard.churn.churnRate + '%');
console.log('Conversion Rate:', dashboard.conversion.conversionRate + '%');
console.log('Revenue:', dashboard.revenue.totalRevenue);
```

### Senaryo 2: Churn Analizi

```typescript
const churn = await analyticsService.calculateChurnRate(
  new Date('2025-09-01'),
  new Date('2025-09-30')
);

console.log('Churn Analizi:');
console.log('Toplam Churn:', churn.churnedUsers);
console.log('Churn Rate:', churn.churnRate + '%');
console.log('Nedenler:', churn.churnReasons);

// En çok churn nedeni
const topReason = Object.entries(churn.churnReasons)
  .sort(([,a], [,b]) => b - a)[0];
console.log('En çok churn nedeni:', topReason[0]);
```

### Senaryo 3: Revenue Tracking

```typescript
const revenue = await analyticsService.getRevenueMetrics(
  new Date('2025-09-01'),
  new Date('2025-09-30')
);

console.log('Revenue Metrikleri:');
console.log('Toplam:', revenue.totalRevenue);
console.log('Yeni Müşteri:', revenue.newRevenue);
console.log('Yenileme:', revenue.renewalRevenue);
console.log('İade:', revenue.refundedRevenue);
console.log('Ortalama İşlem:', revenue.averageTransactionValue);
```

## Performans Optimizasyonu

### 1. Indexler
Analytics sorguları için gerekli indexler:
```prisma
@@index([userId, createdAt])
@@index([entity, entityId])
@@index([status, endDate])
```

### 2. Caching
Sık kullanılan metrikleri cache'leyin:
- MRR: 1 saat
- ARPU: 1 saat
- Distribution: 30 dakika

### 3. Batch Processing
Büyük veri setleri için batch processing kullanın:
```typescript
// Örnek: Tüm kullanıcılar için LTV hesaplama
const batchSize = 100;
for (let i = 0; i < totalUsers; i += batchSize) {
  const batch = await prisma.user.findMany({
    skip: i,
    take: batchSize
  });
  // Process batch
}
```

## Troubleshooting

### Problem: Yavaş Analytics Sorguları
**Çözüm:** 
- Index'leri kontrol edin
- Query'leri optimize edin
- Cache kullanın

### Problem: Yanlış MRR Hesaplaması
**Çözüm:**
- Aktif abonelik durumlarını kontrol edin
- Grace period aboneliklerini dahil edin
- Fiyatlandırma sabitlerini doğrulayın

### Problem: Eksik Event Logları
**Çözüm:**
- Subscription service'deki tüm event noktalarını kontrol edin
- Error handling'i gözden geçirin
- Async işlemlerin tamamlandığından emin olun

## İlgili Dosyalar

- `subscription-analytics.service.ts`: Ana analytics servisi
- `subscription.service.ts`: Event logging entegrasyonu
- `subscription.controller.ts`: Analytics endpoints
- `subscription.module.ts`: Module yapılandırması

## Requirements Coverage

Bu implementasyon şu requirement'ları karşılar:
- **20.1**: Subscription event logging
- **20.2**: Conversion tracking
- **20.3**: Churn rate hesaplama
- **20.4**: MRR ve ARPU metrikleri
- **20.5**: LTV hesaplama
- **20.6**: Usage statistics
