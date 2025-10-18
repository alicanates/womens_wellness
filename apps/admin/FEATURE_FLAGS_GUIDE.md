# Özellik Bayrakları (Feature Flags) Rehberi

## 🎯 Özellik Bayrakları Nedir?

Özellik bayrakları (Feature Flags), uygulamanın davranışını kod değişikliği yapmadan dinamik olarak kontrol etmenizi sağlayan yapılandırma anahtarlarıdır.

## 💡 Ne İşe Yarar?

### 1. **Yeni Özellikleri Kontrollü Açma**
Yeni bir özelliği önce test kullanıcılarına, sonra tüm kullanıcılara açabilirsiniz.

```typescript
// Örnek: Premium özellikleri kontrol etme
{
  "key": "premium_features_enabled",
  "valueJson": true
}
```

### 2. **A/B Testleri**
Farklı kullanıcı gruplarına farklı özellikler sunabilirsiniz.

```typescript
{
  "key": "new_ui_experiment",
  "valueJson": {
    "enabled": true,
    "percentage": 50  // %50 kullanıcıya göster
  }
}
```

### 3. **Acil Durum Anahtarları (Kill Switch)**
Sorunlu bir özelliği anında kapatabilirsiniz.

```typescript
{
  "key": "ai_chat_enabled",
  "valueJson": false  // Sorun varsa hemen kapat
}
```

### 4. **Bölgesel Özellikler**
Belirli ülkelerde farklı özellikler sunabilirsiniz.

```typescript
{
  "key": "payment_providers",
  "valueJson": {
    "turkey": ["iyzico", "stripe"],
    "usa": ["stripe", "paypal"]
  }
}
```

## 🔧 Wellness Uygulamasında Kullanım Örnekleri

### 1. **AI Sohbet Özellikleri**
```typescript
{
  "key": "ai_chat_enabled",
  "valueJson": true
}

{
  "key": "ai_advanced_models",
  "valueJson": {
    "enabled": true,
    "models": ["gpt-4", "claude-3-opus"]
  }
}
```

### 2. **Q&A Topluluk Özellikleri**
```typescript
{
  "key": "qna_enabled",
  "valueJson": true
}

{
  "key": "qna_moderation_auto",
  "valueJson": {
    "enabled": true,
    "spam_detection": true,
    "profanity_filter": true
  }
}
```

### 3. **Abonelik Özellikleri**
```typescript
{
  "key": "subscription_trial_enabled",
  "valueJson": true
}

{
  "key": "subscription_plans",
  "valueJson": {
    "monthly": {
      "enabled": true,
      "price": 99
    },
    "yearly": {
      "enabled": true,
      "price": 999,
      "discount": 17
    }
  }
}
```

### 4. **Hamilelik Takibi**
```typescript
{
  "key": "pregnancy_tracking_enabled",
  "valueJson": true
}

{
  "key": "pregnancy_features",
  "valueJson": {
    "kick_counter": true,
    "contraction_timer": true,
    "birth_plan": true,
    "hospital_bag": true
  }
}
```

### 5. **Wellness Özellikleri**
```typescript
{
  "key": "wellness_tracking",
  "valueJson": {
    "steps": true,
    "meditation": true,
    "sleep": true,
    "water": true
  }
}
```

### 6. **Bildirimler**
```typescript
{
  "key": "push_notifications_enabled",
  "valueJson": true
}

{
  "key": "notification_types",
  "valueJson": {
    "period_reminder": true,
    "medication_reminder": true,
    "appointment_reminder": true,
    "water_reminder": true
  }
}
```

### 7. **İçerik Özellikleri**
```typescript
{
  "key": "discover_section_enabled",
  "valueJson": true
}

{
  "key": "content_personalization",
  "valueJson": {
    "enabled": true,
    "algorithm": "collaborative_filtering"
  }
}
```

## 📱 Mobil Uygulamada Kullanım

Mobil uygulama, feature flag'leri API'den çeker ve davranışını buna göre ayarlar:

```typescript
// Mobile app örnek kullanım
const featureFlags = await api.getFeatureFlags();

if (featureFlags.ai_chat_enabled) {
  // AI sohbet özelliğini göster
  showAIChatTab();
}

if (featureFlags.qna_enabled) {
  // Q&A bölümünü göster
  showQnASection();
}
```

## 🎛️ Admin Panelinden Yönetim

### Özellik Bayrağı Ekleme
1. Admin paneline giriş yapın
2. **Sistem** > **Özellik Bayrakları** menüsüne gidin
3. Yeni bayrak ekleyin:
   - **Key**: Benzersiz anahtar (örn: `new_feature_enabled`)
   - **Value**: Boolean veya JSON değer

### Özellik Bayrağını Güncelleme
1. Listeden bayrağı bulun
2. **Düzenle** butonuna tıklayın
3. Değeri güncelleyin
4. Kaydedin

### Değer Türleri

#### Boolean (Basit Açma/Kapama)
```json
true
```
veya
```json
false
```

#### JSON Object (Karmaşık Yapılandırma)
```json
{
  "enabled": true,
  "config": {
    "max_items": 10,
    "show_premium": true
  }
}
```

## 🔒 Güvenlik ve En İyi Uygulamalar

### ✅ Yapılması Gerekenler

1. **Anlamlı İsimler Kullanın**
   - ✅ `ai_chat_enabled`
   - ❌ `flag1`, `test`

2. **Dokümante Edin**
   - Her bayrağın ne işe yaradığını açıklayın
   - Varsayılan değerleri belirtin

3. **Varsayılan Değerler Belirleyin**
   ```typescript
   const isEnabled = await featureFlagService.getValue(
     'new_feature',
     false  // Varsayılan: kapalı
   );
   ```

4. **Kullanılmayan Bayrakları Temizleyin**
   - Eski bayrakları düzenli olarak silin
   - Kod tabanından referansları kaldırın

### ❌ Yapılmaması Gerekenler

1. **Hassas Bilgileri Saklamayın**
   - API anahtarları
   - Şifreler
   - Kişisel veriler

2. **Çok Fazla Bayrak Oluşturmayın**
   - Karmaşıklığı artırır
   - Yönetimi zorlaştırır

3. **Kritik İş Mantığını Bayraklara Bağlamayın**
   - Güvenlik kontrolleri
   - Ödeme işlemleri
   - Veri bütünlüğü

## 📊 Örnek Senaryolar

### Senaryo 1: Yeni AI Modeli Test Etme

**Durum**: GPT-4 modelini test etmek istiyorsunuz.

**Adımlar**:
1. Feature flag oluşturun:
```json
{
  "key": "ai_model_gpt4_enabled",
  "valueJson": false
}
```

2. Kodu güncelleyin:
```typescript
const useGPT4 = await featureFlagService.isEnabled('ai_model_gpt4_enabled');
const model = useGPT4 ? 'gpt-4' : 'gpt-3.5-turbo';
```

3. Admin panelden `true` yapın
4. Test edin
5. Sorun yoksa kalıcı hale getirin

### Senaryo 2: Bölgesel Özellik Açma

**Durum**: Türkiye'de iyzico ödeme sistemini aktif etmek istiyorsunuz.

**Feature Flag**:
```json
{
  "key": "payment_providers_by_country",
  "valueJson": {
    "TR": ["iyzico", "stripe"],
    "US": ["stripe"],
    "UK": ["stripe", "paypal"]
  }
}
```

**Kullanım**:
```typescript
const providers = await featureFlagService.getValue(
  'payment_providers_by_country',
  { TR: ['stripe'] }
);
const userCountry = user.profile.country;
const availableProviders = providers[userCountry] || ['stripe'];
```

### Senaryo 3: Acil Durum - Özelliği Kapatma

**Durum**: AI sohbet özelliğinde sorun var, hemen kapatmanız gerekiyor.

**Adımlar**:
1. Admin panele giriş yapın
2. `ai_chat_enabled` bayrağını bulun
3. Değeri `false` yapın
4. Kaydedin
5. Mobil uygulama sonraki API çağrısında güncellenmiş değeri alır
6. AI sohbet özelliği kullanıcılara gösterilmez

## 🔄 Yaşam Döngüsü

```
1. Oluşturma
   ↓
2. Test Etme (false/limited)
   ↓
3. Kademeli Açma (percentage rollout)
   ↓
4. Tam Açma (true)
   ↓
5. Kalıcı Hale Getirme (kodu güncelle)
   ↓
6. Bayrağı Silme
```

## 📈 İzleme ve Analitik

Feature flag kullanımını izlemek için:

1. **Audit Logs**: Hangi admin hangi bayrağı değiştirdi?
2. **Usage Metrics**: Hangi bayraklar aktif kullanılıyor?
3. **Performance**: Bayraklar performansı etkiliyor mu?

## 🎓 Sonuç

Özellik bayrakları, modern yazılım geliştirmede kritik bir araçtır:

- ✅ Risksiz deployment
- ✅ Hızlı geri alma
- ✅ A/B testing
- ✅ Kademeli açılış
- ✅ Bölgesel özelleştirme
- ✅ Acil durum kontrolü

Admin panelinden kolayca yönetilebilir ve uygulamanın davranışını anında değiştirebilirsiniz!
