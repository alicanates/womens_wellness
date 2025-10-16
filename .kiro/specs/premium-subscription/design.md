# Design Document

## Overview

Premium Subscription sistemi, kullanıcılara gelişmiş AI özellikleri ve kişiselleştirilmiş deneyimler sunan ücretli abonelik modelidir. Sistem, mobil uygulama içi satın alma (IAP), backend abonelik yönetimi ve gerçek zamanlı özellik kontrollerini içerir.

**Ana Bileşenler:**
1. **Backend Subscription Service**: Abonelik durumu yönetimi, makbuz doğrulama, webhook işleme
2. **Mobile Premium UI**: Premium sayfası, satın alma akışı, abonelik yönetimi
3. **Feature Gate System**: Premium özelliklerin kontrolü ve erişim yönetimi
4. **IAP Integration**: Apple App Store ve Google Play Store entegrasyonu
5. **Analytics & Tracking**: Kullanım istatistikleri ve dönüşüm takibi

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Mobile App (React Native)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Premium Page  │  │Settings Page │  │Feature Gates │      │
│  │              │  │(Enhanced)    │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  IAP Manager    │                        │
│                   │  (RN IAP)       │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   REST API      │
                    │   (NestJS)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Subscription   │  │  Receipt        │  │   Webhook      │
│ Controller     │  │  Validator      │  │   Handler      │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┴────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   (Prisma)      │
                    └─────────────────┘
```

## Components and Interfaces

### 1. Database Schema (Prisma)


#### Subscription Model
```prisma
model Subscription {
  id                String              @id @default(cuid())
  userId            String              @unique
  
  // Subscription Status
  status            SubscriptionStatus  @default(FREE)
  tier              SubscriptionTier?   // MONTHLY, YEARLY
  
  // Dates
  startDate         DateTime?
  endDate           DateTime?
  cancelledAt       DateTime?
  trialEndDate      DateTime?
  
  // Payment Provider
  provider          PaymentProvider?    // APPLE, GOOGLE
  originalTransactionId String?         @unique
  latestReceiptData String?            @db.Text
  
  // Quota Management
  aiMessagesUsed    Int                @default(0)
  aiMessagesLimit   Int                @default(100)
  quotaResetDate    DateTime           @default(now())
  
  // Grace Period
  isInGracePeriod   Boolean            @default(false)
  gracePeriodEndDate DateTime?
  
  // Relations
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions      SubscriptionTransaction[]
  
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  
  @@index([status, endDate])
  @@index([userId, status])
}

enum SubscriptionStatus {
  FREE
  TRIAL
  ACTIVE
  EXPIRED
  CANCELLED
  GRACE_PERIOD
}

enum SubscriptionTier {
  MONTHLY
  YEARLY
}

enum PaymentProvider {
  APPLE
  GOOGLE
}
```

#### SubscriptionTransaction Model
```prisma
model SubscriptionTransaction {
  id                String              @id @default(cuid())
  subscriptionId    String
  
  // Transaction Details
  transactionId     String              @unique
  originalTransactionId String?
  productId         String
  
  // Amount
  amount            Float
  currency          String              @default("TRY")
  
  // Status
  status            TransactionStatus   @default(PENDING)
  type              TransactionType
  
  // Receipt
  receiptData       String?             @db.Text
  validatedAt       DateTime?
  
  // Provider
  provider          PaymentProvider
  
  // Relations
  subscription      Subscription        @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  @@index([subscriptionId])
  @@index([transactionId])
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

enum TransactionType {
  INITIAL_PURCHASE
  RENEWAL
  UPGRADE
  DOWNGRADE
  REFUND
}
```

#### PremiumFeatureUsage Model
```prisma
model PremiumFeatureUsage {
  id          String   @id @default(cuid())
  userId      String
  
  // Feature Tracking
  feature     String   // 'advanced_ai', 'priority_response', 'insights'
  usageCount  Int      @default(0)
  lastUsedAt  DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, feature])
  @@index([userId])
}
```

### 2. Backend API


#### Subscription Controller
```typescript
@Controller('subscription')
@UseGuards(AuthGuard('jwt'))
export class SubscriptionController {
  
  // Get current subscription status
  @Get('status')
  async getStatus(@Request() req): Promise<SubscriptionStatusDto> {
    // Returns: status, tier, dates, quota, features
  }
  
  // Get available products
  @Get('products')
  async getProducts(
    @Query('platform') platform: 'ios' | 'android'
  ): Promise<ProductDto[]> {
    // Returns: product IDs, prices, descriptions
  }
  
  // Validate and process purchase
  @Post('purchase')
  async processPurchase(
    @Request() req,
    @Body() body: PurchaseDto
  ): Promise<SubscriptionStatusDto> {
    // Validates receipt, creates subscription, returns status
  }
  
  // Restore purchases
  @Post('restore')
  async restorePurchases(
    @Request() req,
    @Body() body: RestoreDto
  ): Promise<SubscriptionStatusDto> {
    // Validates existing receipts, restores subscription
  }
  
  // Cancel subscription
  @Post('cancel')
  async cancelSubscription(@Request() req): Promise<{ success: boolean }> {
    // Marks subscription as cancelled, maintains access until end date
  }
  
  // Get transaction history
  @Get('transactions')
  async getTransactions(@Request() req): Promise<TransactionDto[]> {
    // Returns: all user transactions with details
  }
  
  // Check AI message quota
  @Get('quota')
  async getQuota(@Request() req): Promise<QuotaDto> {
    // Returns: used, limit, resetDate
  }
  
  // Increment AI message usage
  @Post('quota/increment')
  async incrementQuota(@Request() req): Promise<QuotaDto> {
    // Increments usage counter, returns updated quota
  }
  
  // Get usage statistics
  @Get('usage-stats')
  async getUsageStats(@Request() req): Promise<UsageStatsDto> {
    // Returns: feature usage, savings, benefits
  }
  
  // Webhook endpoint for App Store
  @Post('webhook/apple')
  async handleAppleWebhook(@Body() body: any): Promise<void> {
    // Processes App Store Server Notifications
  }
  
  // Webhook endpoint for Google Play
  @Post('webhook/google')
  async handleGoogleWebhook(@Body() body: any): Promise<void> {
    // Processes Google Play Real-time Developer Notifications
  }
}
```

#### Subscription Service
```typescript
@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private receiptValidator: ReceiptValidatorService,
    private notificationService: NotificationService
  ) {}
  
  // Get user subscription
  async getSubscription(userId: string): Promise<Subscription> {
    // Fetches subscription with status check
    // Updates expired subscriptions
  }
  
  // Process new purchase
  async processPurchase(
    userId: string,
    receipt: string,
    provider: PaymentProvider,
    productId: string
  ): Promise<Subscription> {
    // 1. Validate receipt with provider
    // 2. Extract transaction details
    // 3. Create or update subscription
    // 4. Create transaction record
    // 5. Update user quota
    // 6. Send confirmation notification
    // 7. Return updated subscription
  }
  
  // Restore purchases
  async restorePurchases(
    userId: string,
    receipts: string[],
    provider: PaymentProvider
  ): Promise<Subscription> {
    // 1. Validate all receipts
    // 2. Find most recent active subscription
    // 3. Restore subscription status
    // 4. Sync transaction history
  }
  
  // Cancel subscription
  async cancelSubscription(userId: string): Promise<void> {
    // 1. Mark as cancelled
    // 2. Keep access until end date
    // 3. Send cancellation confirmation
    // 4. Update auto-renewal status
  }
  
  // Check and update quota
  async checkQuota(userId: string): Promise<QuotaStatus> {
    // 1. Get subscription
    // 2. Check if quota reset needed
    // 3. Return current quota status
  }
  
  // Increment message usage
  async incrementMessageUsage(userId: string): Promise<void> {
    // 1. Get subscription
    // 2. Check if under limit
    // 3. Increment counter
    // 4. Send warning if near limit
  }
  
  // Reset monthly quota
  async resetQuota(userId: string): Promise<void> {
    // 1. Reset usage counter
    // 2. Update reset date
  }
  
  // Handle subscription expiration
  async handleExpiration(subscriptionId: string): Promise<void> {
    // 1. Update status to EXPIRED
    // 2. Reset to free tier limits
    // 3. Send expiration notification
  }
  
  // Handle renewal
  async handleRenewal(
    subscriptionId: string,
    transactionId: string,
    receipt: string
  ): Promise<void> {
    // 1. Validate receipt
    // 2. Extend end date
    // 3. Create transaction record
    // 4. Send renewal confirmation
  }
  
  // Handle grace period
  async handleGracePeriod(subscriptionId: string): Promise<void> {
    // 1. Set grace period status
    // 2. Set grace period end date (7 days)
    // 3. Send payment failure notification
    // 4. Maintain premium access
  }
}
```


#### Receipt Validator Service
```typescript
@Injectable()
export class ReceiptValidatorService {
  
  // Validate Apple receipt
  async validateAppleReceipt(receiptData: string): Promise<AppleReceiptData> {
    // 1. Send to Apple verification endpoint
    // 2. Try production first, then sandbox
    // 3. Parse response
    // 4. Extract transaction details
    // 5. Return validated data
  }
  
  // Validate Google receipt
  async validateGoogleReceipt(
    packageName: string,
    productId: string,
    purchaseToken: string
  ): Promise<GoogleReceiptData> {
    // 1. Use Google Play Developer API
    // 2. Verify purchase token
    // 3. Check subscription status
    // 4. Extract transaction details
    // 5. Return validated data
  }
  
  // Check if receipt is valid and active
  isReceiptActive(receiptData: any): boolean {
    // Check expiration date
    // Check cancellation status
    // Check refund status
  }
}
```

#### Webhook Handler Service
```typescript
@Injectable()
export class WebhookHandlerService {
  
  // Handle Apple Server Notifications
  async handleAppleNotification(notification: any): Promise<void> {
    // Notification types:
    // - INITIAL_BUY: New subscription
    // - DID_RENEW: Successful renewal
    // - DID_FAIL_TO_RENEW: Failed renewal
    // - DID_CHANGE_RENEWAL_STATUS: User changed auto-renewal
    // - CANCEL: Subscription cancelled
    // - REFUND: Purchase refunded
    
    // 1. Verify notification signature
    // 2. Extract transaction data
    // 3. Update subscription status
    // 4. Send user notification
  }
  
  // Handle Google Play Notifications
  async handleGoogleNotification(notification: any): Promise<void> {
    // Notification types:
    // - SUBSCRIPTION_PURCHASED: New subscription
    // - SUBSCRIPTION_RENEWED: Successful renewal
    // - SUBSCRIPTION_CANCELED: User cancelled
    // - SUBSCRIPTION_EXPIRED: Subscription expired
    // - SUBSCRIPTION_IN_GRACE_PERIOD: Payment failed, grace period
    // - SUBSCRIPTION_RECOVERED: Payment recovered after grace period
    
    // 1. Verify notification authenticity
    // 2. Extract subscription data
    // 3. Update subscription status
    // 4. Send user notification
  }
}
```

### 3. Mobile Components

#### Premium Page
```typescript
// apps/mobile/app/premium.tsx

export default function PremiumScreen() {
  const { user } = useAuthStore();
  const [selectedTier, setSelectedTier] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getStatus(),
  });
  
  const { data: products } = useQuery({
    queryKey: ['products', Platform.OS],
    queryFn: () => subscriptionService.getProducts(Platform.OS),
  });
  
  const purchaseMutation = useMutation({
    mutationFn: (productId: string) => handlePurchase(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      router.push('/premium/success');
    },
  });
  
  const handlePurchase = async (productId: string) => {
    // 1. Request purchase from IAP
    // 2. Get receipt
    // 3. Send to backend for validation
    // 4. Update local state
  };
  
  return (
    <SafeAreaView>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Premium'a Geç ✨</Text>
          <Text style={styles.subtitle}>
            Gelişmiş AI ve özel özelliklerle deneyiminizi geliştirin
          </Text>
        </View>
        
        {/* Current Status (if premium) */}
        {subscription?.status === 'ACTIVE' && (
          <PremiumStatusCard subscription={subscription} />
        )}
        
        {/* Tier Selector */}
        <View style={styles.tierSelector}>
          <TierOption
            tier="monthly"
            price="₺99"
            period="ay"
            selected={selectedTier === 'monthly'}
            onSelect={() => setSelectedTier('monthly')}
          />
          <TierOption
            tier="yearly"
            price="₺999"
            period="yıl"
            savings="17% tasarruf"
            badge="En Popüler"
            selected={selectedTier === 'yearly'}
            onSelect={() => setSelectedTier('yearly')}
          />
        </View>
        
        {/* Features Comparison */}
        <View style={styles.comparison}>
          <Text style={styles.comparisonTitle}>Özellikler</Text>
          
          <FeatureRow
            icon="🤖"
            title="AI Modeli"
            free="Temel"
            premium="Gelişmiş"
          />
          <FeatureRow
            icon="💬"
            title="Aylık Mesaj"
            free="100"
            premium="1000"
          />
          <FeatureRow
            icon="⚡"
            title="Yanıt Hızı"
            free="Normal"
            premium="Öncelikli"
          />
          <FeatureRow
            icon="🎯"
            title="Kişisel İçgörüler"
            free={false}
            premium={true}
          />
          <FeatureRow
            icon="📈"
            title="Gelişmiş Analizler"
            free={false}
            premium={true}
          />
        </View>
        
        {/* Benefits */}
        <View style={styles.benefits}>
          <BenefitCard
            icon="🧠"
            title="Gelişmiş Hafıza"
            description="AI asistanınız sizi daha iyi hatırlıyor ve kişiselleştirilmiş yanıtlar veriyor"
          />
          <BenefitCard
            icon="⚡"
            title="Öncelikli Yanıt"
            description="Sorularınıza daha hızlı ve detaylı yanıtlar alın"
          />
          <BenefitCard
            icon="✨"
            title="Özel Özellikler"
            description="Sadece premium kullanıcılara özel içgörüler ve öneriler"
          />
        </View>
        
        {/* Trial Info */}
        {!subscription?.hasHadTrial && (
          <View style={styles.trialInfo}>
            <Text style={styles.trialText}>
              🎁 7 gün ücretsiz deneyin, istediğiniz zaman iptal edin
            </Text>
          </View>
        )}
        
        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => purchaseMutation.mutate(selectedTier)}
          disabled={isLoading}
        >
          <Text style={styles.ctaButtonText}>
            {subscription?.status === 'ACTIVE'
              ? 'Planı Değiştir'
              : 'Premium'a Başla'}
          </Text>
        </TouchableOpacity>
        
        {/* Terms */}
        <View style={styles.terms}>
          <Text style={styles.termsText}>
            Abonelik otomatik olarak yenilenir. İstediğiniz zaman iptal edebilirsiniz.
          </Text>
          <View style={styles.termsLinks}>
            <TouchableOpacity onPress={handleTerms}>
              <Text style={styles.link}>Kullanım Koşulları</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>•</Text>
            <TouchableOpacity onPress={handlePrivacy}>
              <Text style={styles.link}>Gizlilik Politikası</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* FAQ */}
        <View style={styles.faq}>
          <Text style={styles.faqTitle}>Sıkça Sorulan Sorular</Text>
          <FAQItem
            question="Premium'u nasıl iptal edebilirim?"
            answer="Ayarlar > Abonelik Yönetimi'nden istediğiniz zaman iptal edebilirsiniz."
          />
          <FAQItem
            question="Farklı cihazlarda kullanabilir miyim?"
            answer="Evet, aynı hesapla giriş yaptığınız tüm cihazlarda premium özellikler aktif olur."
          />
          <FAQItem
            question="İade alabilir miyim?"
            answer="İlk 7 gün içinde tam iade alabilirsiniz."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```


#### Enhanced Settings Page
```typescript
// apps/mobile/app/settings.tsx (additions)

// Add Subscription Section
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Abonelik</Text>
  
  {subscription?.status === 'ACTIVE' ? (
    <>
      {/* Premium Status Card */}
      <View style={styles.premiumCard}>
        <View style={styles.premiumHeader}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.premiumTitle}>Premium Üye</Text>
        </View>
        
        <View style={styles.premiumDetails}>
          <DetailRow
            label="Plan"
            value={subscription.tier === 'YEARLY' ? 'Yıllık' : 'Aylık'}
          />
          <DetailRow
            label="Başlangıç"
            value={formatDate(subscription.startDate)}
          />
          <DetailRow
            label="Yenileme"
            value={formatDate(subscription.endDate)}
          />
        </View>
        
        {/* AI Quota */}
        <View style={styles.quotaCard}>
          <Text style={styles.quotaLabel}>AI Mesaj Kotası</Text>
          <View style={styles.quotaBar}>
            <View
              style={[
                styles.quotaFill,
                {
                  width: `${(subscription.aiMessagesUsed / subscription.aiMessagesLimit) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.quotaText}>
            {subscription.aiMessagesUsed} / {subscription.aiMessagesLimit} kullanıldı
          </Text>
          <Text style={styles.quotaReset}>
            {formatDate(subscription.quotaResetDate)} tarihinde sıfırlanır
          </Text>
        </View>
      </View>
      
      {/* Manage Subscription */}
      <TouchableOpacity
        style={styles.settingButton}
        onPress={handleManageSubscription}
      >
        <Text style={styles.settingButtonText}>Aboneliği Yönet</Text>
        <Text style={styles.settingButtonIcon}>›</Text>
      </TouchableOpacity>
      
      {/* Usage Stats */}
      <TouchableOpacity
        style={styles.settingButton}
        onPress={() => router.push('/premium/stats')}
      >
        <Text style={styles.settingButtonText}>Kullanım İstatistikleri</Text>
        <Text style={styles.settingButtonIcon}>›</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      {/* Free Plan Info */}
      <View style={styles.freePlanCard}>
        <Text style={styles.freePlanTitle}>Ücretsiz Plan</Text>
        <Text style={styles.freePlanText}>
          Temel özelliklere erişiminiz var
        </Text>
        
        {/* AI Quota for Free */}
        <View style={styles.quotaCard}>
          <Text style={styles.quotaLabel}>AI Mesaj Kotası</Text>
          <View style={styles.quotaBar}>
            <View
              style={[
                styles.quotaFill,
                {
                  width: `${(subscription?.aiMessagesUsed || 0) / 100 * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.quotaText}>
            {subscription?.aiMessagesUsed || 0} / 100 kullanıldı
          </Text>
        </View>
      </View>
      
      {/* Upgrade CTA */}
      <TouchableOpacity
        style={[styles.button, styles.premiumButton]}
        onPress={() => router.push('/premium')}
      >
        <Text style={styles.premiumButtonText}>✨ Premium'a Geç</Text>
      </TouchableOpacity>
    </>
  )}
</View>
```

#### Premium Badge Component
```typescript
// apps/mobile/src/components/premium/PremiumBadge.tsx

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'text' | 'full';
}

export function PremiumBadge({ size = 'medium', variant = 'full' }: PremiumBadgeProps) {
  const theme = useTheme();
  
  if (variant === 'icon') {
    return (
      <View style={[styles.badge, styles[size]]}>
        <Text style={styles.icon}>✨</Text>
      </View>
    );
  }
  
  if (variant === 'text') {
    return (
      <View style={[styles.badge, styles.textBadge, styles[size]]}>
        <Text style={styles.text}>PREMIUM</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.badge, styles.fullBadge, styles[size]]}>
      <Text style={styles.icon}>✨</Text>
      <Text style={styles.text}>Premium</Text>
    </View>
  );
}
```

#### Upgrade Prompt Component
```typescript
// apps/mobile/src/components/premium/UpgradePrompt.tsx

interface UpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  description: string;
}

export function UpgradePrompt({
  visible,
  onClose,
  feature,
  description,
}: UpgradePromptProps) {
  const router = useRouter();
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✨</Text>
          </View>
          
          {/* Title */}
          <Text style={styles.title}>Premium Özellik</Text>
          
          {/* Feature Name */}
          <Text style={styles.feature}>{feature}</Text>
          
          {/* Description */}
          <Text style={styles.description}>{description}</Text>
          
          {/* Benefits */}
          <View style={styles.benefits}>
            <BenefitItem icon="🤖" text="Gelişmiş AI" />
            <BenefitItem icon="💬" text="1000 mesaj/ay" />
            <BenefitItem icon="⚡" text="Öncelikli yanıt" />
          </View>
          
          {/* CTA */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              onClose();
              router.push('/premium');
            }}
          >
            <Text style={styles.upgradeButtonText}>Premium'a Geç</Text>
          </TouchableOpacity>
          
          {/* Close */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Belki Sonra</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

#### usePremium Hook
```typescript
// apps/mobile/src/hooks/usePremium.ts

export function usePremium() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const isPremium = useMemo(() => {
    return subscription?.status === 'ACTIVE' || subscription?.status === 'TRIAL';
  }, [subscription]);
  
  const canUseFeature = useCallback((feature: string) => {
    if (isPremium) return true;
    
    // Check specific feature gates
    const freeFeatures = ['basic_chat', 'cycle_tracking', 'water_tracking'];
    return freeFeatures.includes(feature);
  }, [isPremium]);
  
  const checkQuota = useCallback(async () => {
    const quota = await subscriptionService.getQuota();
    return quota.used < quota.limit;
  }, []);
  
  const incrementQuota = useCallback(async () => {
    await subscriptionService.incrementQuota();
  }, []);
  
  return {
    subscription,
    isPremium,
    isLoading,
    canUseFeature,
    checkQuota,
    incrementQuota,
  };
}
```

### 4. IAP Integration

#### IAP Manager
```typescript
// apps/mobile/src/services/iap.ts

import * as RNIap from 'react-native-iap';

const PRODUCT_IDS = {
  ios: {
    monthly: 'com.wellness.premium.monthly',
    yearly: 'com.wellness.premium.yearly',
  },
  android: {
    monthly: 'premium_monthly',
    yearly: 'premium_yearly',
  },
};

class IAPManager {
  private products: RNIap.Product[] = [];
  
  async initialize() {
    try {
      await RNIap.initConnection();
      await this.loadProducts();
      this.setupListeners();
    } catch (error) {
      console.error('IAP initialization failed:', error);
    }
  }
  
  async loadProducts() {
    const platform = Platform.OS as 'ios' | 'android';
    const productIds = Object.values(PRODUCT_IDS[platform]);
    
    if (platform === 'ios') {
      this.products = await RNIap.getSubscriptions({ skus: productIds });
    } else {
      this.products = await RNIap.getSubscriptions({ skus: productIds });
    }
  }
  
  getProduct(tier: 'monthly' | 'yearly') {
    const platform = Platform.OS as 'ios' | 'android';
    const productId = PRODUCT_IDS[platform][tier];
    return this.products.find(p => p.productId === productId);
  }
  
  async purchase(tier: 'monthly' | 'yearly') {
    const product = this.getProduct(tier);
    if (!product) throw new Error('Product not found');
    
    try {
      const purchase = await RNIap.requestSubscription({
        sku: product.productId,
      });
      
      return purchase;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }
  
  async restorePurchases() {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      return purchases;
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }
  
  setupListeners() {
    // Listen for purchase updates
    RNIap.purchaseUpdatedListener((purchase) => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        // Send to backend for validation
        this.validatePurchase(purchase);
      }
    });
    
    // Listen for purchase errors
    RNIap.purchaseErrorListener((error) => {
      console.error('Purchase error:', error);
    });
  }
  
  async validatePurchase(purchase: RNIap.Purchase) {
    try {
      const platform = Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE';
      const receipt = Platform.OS === 'ios'
        ? purchase.transactionReceipt
        : purchase.purchaseToken;
      
      await subscriptionService.processPurchase({
        receipt,
        provider: platform,
        productId: purchase.productId,
        transactionId: purchase.transactionId,
      });
      
      // Finish transaction
      await RNIap.finishTransaction({ purchase });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }
  
  async cleanup() {
    await RNIap.endConnection();
  }
}

export const iapManager = new IAPManager();
```


### 5. API Service Client

```typescript
// apps/mobile/src/services/api.ts (additions)

export const subscriptionService = {
  // Get subscription status
  getStatus: () =>
    api.get<SubscriptionStatusDto>('/subscription/status'),
  
  // Get available products
  getProducts: (platform: 'ios' | 'android') =>
    api.get<ProductDto[]>(`/subscription/products?platform=${platform}`),
  
  // Process purchase
  processPurchase: (data: {
    receipt: string;
    provider: 'APPLE' | 'GOOGLE';
    productId: string;
    transactionId: string;
  }) =>
    api.post<SubscriptionStatusDto>('/subscription/purchase', data),
  
  // Restore purchases
  restorePurchases: (data: {
    receipts: string[];
    provider: 'APPLE' | 'GOOGLE';
  }) =>
    api.post<SubscriptionStatusDto>('/subscription/restore', data),
  
  // Cancel subscription
  cancelSubscription: () =>
    api.post<{ success: boolean }>('/subscription/cancel'),
  
  // Get transactions
  getTransactions: () =>
    api.get<TransactionDto[]>('/subscription/transactions'),
  
  // Get quota
  getQuota: () =>
    api.get<QuotaDto>('/subscription/quota'),
  
  // Increment quota
  incrementQuota: () =>
    api.post<QuotaDto>('/subscription/quota/increment'),
  
  // Get usage stats
  getUsageStats: () =>
    api.get<UsageStatsDto>('/subscription/usage-stats'),
};
```

## Data Models

### DTOs

```typescript
// Subscription Status DTO
interface SubscriptionStatusDto {
  status: 'FREE' | 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'GRACE_PERIOD';
  tier?: 'MONTHLY' | 'YEARLY';
  startDate?: string;
  endDate?: string;
  trialEndDate?: string;
  cancelledAt?: string;
  isInGracePeriod: boolean;
  gracePeriodEndDate?: string;
  aiMessagesUsed: number;
  aiMessagesLimit: number;
  quotaResetDate: string;
  hasHadTrial: boolean;
  features: {
    advancedAI: boolean;
    priorityResponse: boolean;
    insights: boolean;
    advancedAnalytics: boolean;
    customization: boolean;
  };
}

// Product DTO
interface ProductDto {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  localizedPrice: string;
  tier: 'MONTHLY' | 'YEARLY';
  trialPeriod?: string;
}

// Transaction DTO
interface TransactionDto {
  id: string;
  transactionId: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  type: 'INITIAL_PURCHASE' | 'RENEWAL' | 'UPGRADE' | 'DOWNGRADE' | 'REFUND';
  createdAt: string;
}

// Quota DTO
interface QuotaDto {
  used: number;
  limit: number;
  remaining: number;
  resetDate: string;
  percentage: number;
}

// Usage Stats DTO
interface UsageStatsDto {
  totalMessages: number;
  premiumFeaturesUsed: {
    feature: string;
    count: number;
  }[];
  timeSaved: number; // in minutes
  insightsGenerated: number;
  memberSince: string;
  currentStreak: number;
}
```

### Feature Gates

```typescript
// Feature definitions
const FEATURES = {
  // Free features
  BASIC_CHAT: 'basic_chat',
  CYCLE_TRACKING: 'cycle_tracking',
  WATER_TRACKING: 'water_tracking',
  BASIC_REMINDERS: 'basic_reminders',
  
  // Premium features
  ADVANCED_AI: 'advanced_ai',
  PRIORITY_RESPONSE: 'priority_response',
  INSIGHTS: 'insights',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOMIZATION: 'customization',
  UNLIMITED_MESSAGES: 'unlimited_messages',
} as const;

// Feature gate helper
function canAccessFeature(
  feature: string,
  subscription: SubscriptionStatusDto
): boolean {
  const premiumFeatures = [
    FEATURES.ADVANCED_AI,
    FEATURES.PRIORITY_RESPONSE,
    FEATURES.INSIGHTS,
    FEATURES.ADVANCED_ANALYTICS,
    FEATURES.CUSTOMIZATION,
  ];
  
  if (!premiumFeatures.includes(feature)) {
    return true; // Free feature
  }
  
  return subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';
}
```

## Error Handling

### API Errors
```typescript
// Subscription-specific errors
enum SubscriptionError {
  RECEIPT_INVALID = 'RECEIPT_INVALID',
  RECEIPT_EXPIRED = 'RECEIPT_EXPIRED',
  ALREADY_SUBSCRIBED = 'ALREADY_SUBSCRIBED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
}

// Error responses
{
  statusCode: 400,
  message: 'Receipt validation failed',
  error: 'RECEIPT_INVALID'
}
```

### Mobile Error Handling
```typescript
// Purchase error handling
try {
  await iapManager.purchase('monthly');
} catch (error) {
  if (error.code === 'E_USER_CANCELLED') {
    // User cancelled, no action needed
  } else if (error.code === 'E_ALREADY_OWNED') {
    // Restore purchases
    await handleRestore();
  } else {
    Alert.alert('Hata', 'Satın alma başarısız. Lütfen tekrar deneyin.');
  }
}

// Quota exceeded handling
const { isPremium, checkQuota } = usePremium();

async function sendMessage(message: string) {
  if (!isPremium) {
    const hasQuota = await checkQuota();
    if (!hasQuota) {
      setShowUpgradePrompt(true);
      return;
    }
  }
  
  // Send message
  await chatService.sendMessage(message);
  
  // Increment quota
  if (!isPremium) {
    await subscriptionService.incrementQuota();
  }
}
```

## Testing Strategy

### Unit Tests

#### Backend
```typescript
describe('SubscriptionService', () => {
  describe('processPurchase', () => {
    it('should validate and create subscription for valid receipt');
    it('should reject invalid receipt');
    it('should handle duplicate transactions');
    it('should update existing subscription on renewal');
  });
  
  describe('checkQuota', () => {
    it('should return correct quota for free users');
    it('should return correct quota for premium users');
    it('should reset quota monthly');
  });
  
  describe('handleExpiration', () => {
    it('should downgrade to free tier on expiration');
    it('should send expiration notification');
  });
});

describe('ReceiptValidatorService', () => {
  it('should validate Apple receipt correctly');
  it('should validate Google receipt correctly');
  it('should detect expired receipts');
  it('should detect refunded purchases');
});
```

#### Frontend
```typescript
describe('usePremium', () => {
  it('should return correct premium status');
  it('should check feature access correctly');
  it('should handle quota checks');
});

describe('PremiumScreen', () => {
  it('should display pricing correctly');
  it('should handle purchase flow');
  it('should show current subscription status');
});

describe('UpgradePrompt', () => {
  it('should show when accessing premium feature');
  it('should navigate to premium page on upgrade');
  it('should close on dismiss');
});
```

### Integration Tests

```typescript
describe('Subscription Flow', () => {
  it('should complete purchase flow end-to-end');
  it('should restore purchases correctly');
  it('should handle subscription cancellation');
  it('should enforce quota limits');
  it('should upgrade features immediately after purchase');
});
```

### E2E Tests

```typescript
describe('Premium Journey', () => {
  it('user can view premium features');
  it('user can purchase premium subscription');
  it('user can access premium features after purchase');
  it('user can manage subscription in settings');
  it('user sees quota warnings when approaching limit');
});
```

## Performance Considerations

### Backend Optimization
- **Caching**: Cache subscription status with Redis (1 min TTL)
- **Indexing**: Database indexes on userId, status, endDate
- **Batch Processing**: Process webhook notifications in batches
- **Async Validation**: Validate receipts asynchronously

### Frontend Optimization
- **Caching**: React Query caching with 5 min stale time
- **Optimistic Updates**: Update UI immediately, sync in background
- **Lazy Loading**: Load IAP products only when needed
- **Prefetching**: Prefetch subscription status on app launch

### Database Optimization
```sql
-- Indexes for common queries
CREATE INDEX idx_subscription_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_subscription_end_date ON subscriptions(end_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_transaction_subscription ON subscription_transactions(subscription_id);
```

## Security Considerations

- **Receipt Validation**: Always validate receipts server-side
- **Signature Verification**: Verify webhook signatures
- **Rate Limiting**: Limit API calls to prevent abuse
- **Secure Storage**: Store receipts encrypted
- **Token Validation**: Validate JWT tokens on all endpoints
- **Audit Logging**: Log all subscription changes
- **Fraud Detection**: Monitor for suspicious patterns

## Accessibility

- **Screen Reader**: Proper labels for all premium features
- **Color Contrast**: WCAG AA compliant colors for badges
- **Font Scaling**: Support system font scaling
- **Keyboard Navigation**: Full keyboard support
- **Alternative Text**: Descriptive text for all icons

## Localization

- **Multi-currency**: Support TRY, USD, EUR
- **Price Formatting**: Locale-aware price formatting
- **Date Formatting**: Locale-aware date formatting
- **Translations**: TR and EN for all premium content

## Monitoring & Analytics

### Metrics to Track
- Conversion rate (free to premium)
- Trial conversion rate
- Churn rate
- Monthly recurring revenue (MRR)
- Average revenue per user (ARPU)
- Quota usage patterns
- Feature adoption rates
- Cancellation reasons

### Events to Log
- Premium page viewed
- Purchase initiated
- Purchase completed
- Purchase failed
- Subscription cancelled
- Quota exceeded
- Feature gate triggered
- Trial started
- Trial ended

## Future Enhancements

1. **Family Sharing**: Share premium with family members
2. **Lifetime Plan**: One-time purchase option
3. **Gift Subscriptions**: Gift premium to others
4. **Referral Program**: Earn free premium by referring friends
5. **Tiered Premium**: Multiple premium tiers (Plus, Pro, Ultimate)
6. **Add-ons**: Purchase individual features
7. **Corporate Plans**: Business/team subscriptions
8. **Student Discount**: Discounted pricing for students
9. **Loyalty Rewards**: Rewards for long-term subscribers
10. **Premium Content**: Exclusive articles and courses

