# Premium Components

Premium abonelik sistemi için kullanılan UI component'leri.

## PremiumBadge

Premium kullanıcıları görsel olarak ayırt etmek için kullanılan badge component'i.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Badge boyutu |
| `variant` | `'icon' \| 'text' \| 'full'` | `'full'` | Badge görünüm tipi |

### Variants

#### `icon` - Sadece İkon
Sadece ✨ ikonu gösterir. Profil resimleri gibi küçük alanlarda kullanım için idealdir.

```tsx
<PremiumBadge size="small" variant="icon" />
```

#### `text` - Sadece Metin
Sadece "PREMIUM" yazısını gösterir. Kompakt görünüm için kullanılır.

```tsx
<PremiumBadge size="medium" variant="text" />
```

#### `full` - İkon + Metin
Hem ikon hem de "Premium" yazısını gösterir. En görünür ve açıklayıcı varyant.

```tsx
<PremiumBadge size="large" variant="full" />
```

### Size Options

- **small**: Profil resimleri, liste öğeleri için
- **medium**: Genel kullanım, header'lar için (varsayılan)
- **large**: Vurgulu alanlar, premium sayfası için

### Kullanım Örnekleri

#### Profil Resmi Yanında
```tsx
<View style={{ position: 'relative' }}>
  <Image source={profilePicture} style={styles.avatar} />
  <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
    <PremiumBadge size="small" variant="icon" />
  </View>
</View>
```

#### Settings Header'da
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <Text style={styles.userName}>{user.name}</Text>
  <PremiumBadge size="medium" variant="full" />
</View>
```

#### Feature Lock'ta
```tsx
<View style={styles.featureHeader}>
  <Text style={styles.featureTitle}>Gelişmiş İçgörüler</Text>
  <PremiumBadge size="small" variant="text" />
</View>
```

#### Liste Öğesinde
```tsx
<View style={styles.listItem}>
  <Text style={styles.itemTitle}>Premium Özellik</Text>
  <PremiumBadge size="small" variant="icon" />
</View>
```

### Tema Entegrasyonu

Component otomatik olarak `useTheme` hook'u kullanarak tema renklerini alır:
- Light mode: Vibrant pink (#FF69B4) arka plan
- Dark mode: Aynı vibrant pink, dark background ile kontrast
- Text: Her zaman beyaz (textOnPrimary)

### Styling

Component kendi içinde styled olduğu için ek stil gerektirmez. Ancak container'a stil vermek isterseniz:

```tsx
<View style={{ marginLeft: 8 }}>
  <PremiumBadge />
</View>
```

### Accessibility

- Badge görsel bir gösterge olduğu için önemli bilgileri sadece badge ile iletmeyin
- Ekran okuyucular için ek açıklama metni ekleyin:

```tsx
<View accessible accessibilityLabel="Premium üye">
  <PremiumBadge />
</View>
```

### Requirements Coverage

Bu component aşağıdaki requirement'ları karşılar:

- **7.1**: Premium kullanıcılar için profil resmi yanında badge gösterimi
- **7.2**: Settings sayfasında premium badge gösterimi
- **7.3**: Badge'in görsel olarak ayırt edici olması
- **7.4**: Badge'in "Premium" yazısı içermesi
- **7.5**: Ücretsiz kullanıcılar için badge gösterilmemesi (conditional rendering ile)

### Performance

- Minimal re-render: Sadece theme değiştiğinde yeniden render olur
- Lightweight: Basit View ve Text component'leri kullanır
- No external dependencies: Sadece React Native core component'leri

### Testing

Örnek kullanımlar için `PremiumBadge.example.tsx` dosyasına bakın.

---

## UpgradePrompt

Kullanıcılar premium özelliklere erişmeye çalıştığında gösterilen modal component'i. Premium'a yükseltme için teşvik eder.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | ✅ | Modal'ın görünür olup olmadığı |
| `onClose` | `() => void` | ✅ | Modal kapatıldığında çağrılan callback |
| `feature` | `string` | ✅ | Premium özelliğin adı |
| `description` | `string` | ✅ | Özelliğin açıklaması |

### Özellikler

#### Modal Yapısı
- **Overlay**: Yarı saydam arka plan
- **Bottom Sheet**: Ekranın altından yukarı açılan modal
- **Scrollable**: İçerik uzunsa scroll edilebilir
- **Responsive**: Ekran boyutuna göre maksimum %85 yükseklik

#### İçerik Bölümleri
1. **Icon Container**: Premium ikonu (✨) ile vurgulu alan
2. **Title**: "Premium Özellik" başlığı
3. **Feature Name**: Erişilmeye çalışılan özelliğin adı
4. **Description**: Özelliğin detaylı açıklaması
5. **Benefits List**: Premium'un sunduğu faydalar
6. **CTA Button**: "Premium'a Geç" butonu
7. **Close Button**: "Belki Sonra" butonu

#### Premium Benefits
Modal otomatik olarak şu faydaları gösterir:
- 🤖 Gelişmiş AI Modeli
- 💬 1000 mesaj/ay
- ⚡ Öncelikli Yanıt
- 🎯 Kişisel İçgörüler

### Kullanım Örnekleri

#### Temel Kullanım
```tsx
import { useState } from 'react';
import { UpgradePrompt } from '@/components/premium';
import { usePremium } from '@/hooks/usePremium';

function MyFeature() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { canUseFeature } = usePremium();

  const handleAccessFeature = () => {
    if (!canUseFeature('insights')) {
      setShowPrompt(true);
      return;
    }
    // Feature'a erişim sağla
  };

  return (
    <>
      <Button onPress={handleAccessFeature}>
        View Insights
      </Button>

      <UpgradePrompt
        visible={showPrompt}
        onClose={() => setShowPrompt(false)}
        feature="Kişisel İçgörüler"
        description="Sağlık verilerinize dayalı kişiselleştirilmiş içgörüler ve öneriler alın."
      />
    </>
  );
}
```

#### Quota Kontrolü ile
```tsx
function ChatScreen() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { checkQuota } = usePremium();

  const handleSendMessage = async () => {
    const hasQuota = await checkQuota();
    
    if (!hasQuota) {
      setShowPrompt(true);
      return;
    }
    
    // Mesajı gönder
  };

  return (
    <>
      <Button onPress={handleSendMessage}>Send</Button>

      <UpgradePrompt
        visible={showPrompt}
        onClose={() => setShowPrompt(false)}
        feature="Sınırsız AI Mesajları"
        description="Aylık mesaj limitiniz doldu. Premium ile 1000 mesaj/ay kullanın."
      />
    </>
  );
}
```

#### Gelişmiş Özellik Kontrolü
```tsx
function AdvancedAnalytics() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { canUseFeature } = usePremium();

  const handleViewAnalytics = () => {
    if (!canUseFeature('advanced_analytics')) {
      setShowPrompt(true);
      return;
    }
    router.push('/analytics');
  };

  return (
    <>
      <Button onPress={handleViewAnalytics}>
        View Analytics
      </Button>

      <UpgradePrompt
        visible={showPrompt}
        onClose={() => setShowPrompt(false)}
        feature="Gelişmiş Analizler"
        description="Detaylı grafikler ve trendlerle sağlık verilerinizi daha iyi anlayın."
      />
    </>
  );
}
```

### Davranış

#### Modal Açılma
- Animasyon: Slide from bottom
- Overlay: Fade in
- Backdrop: Tıklanabilir (modal'ı kapatır)

#### CTA Button
- "Premium'a Geç" butonuna tıklandığında:
  1. Modal kapanır
  2. Premium sayfasına yönlendirilir (`/premium`)
  3. Kullanıcı satın alma akışına başlar

#### Close Button
- "Belki Sonra" butonuna tıklandığında:
  1. Modal kapanır
  2. Kullanıcı önceki ekrana döner
  3. Hiçbir aksiyon alınmaz

#### Back Button (Android)
- Android back button'a basıldığında modal kapanır
- `onRequestClose` prop'u ile yönetilir

### Tema Entegrasyonu

Component otomatik olarak `useTheme` hook'u kullanarak tema renklerini alır:
- **Background**: Tema background rengi
- **Text**: Tema text renkleri (primary, secondary)
- **Primary**: CTA button için tema primary rengi
- **Surface**: Benefits listesi için tema surface rengi

### Accessibility

```tsx
<UpgradePrompt
  visible={showPrompt}
  onClose={() => setShowPrompt(false)}
  feature="Kişisel İçgörüler"
  description="Sağlık verilerinize dayalı kişiselleştirilmiş içgörüler ve öneriler alın."
/>
```

- Modal otomatik olarak focus yönetimi yapar
- Ekran okuyucular için tüm metinler erişilebilir
- Butonlar touch target boyutlarına uygun (minimum 44x44)
- Kontrast oranları WCAG AA standartlarına uygun

### Requirements Coverage

Bu component aşağıdaki requirement'ları karşılar:

- **5.1**: Ücretsiz kullanıcı premium özelliğe erişmeye çalıştığında yükseltme prompt'u gösterimi
- **5.2**: Yükseltme prompt'unun özelliğin premium olduğunu açıklaması
- **5.3**: Yükseltme prompt'unun premium planın faydalarını listelemesi
- **5.4**: Yükseltme prompt'unun "Premium'a Geç" butonu içermesi
- **5.5**: "Premium'a Geç" butonuna tıklandığında premium sayfasına yönlendirme
- **5.6**: Kullanıcının iptal etme seçeneği sunması

### Performance

- **Lazy Loading**: Modal sadece `visible={true}` olduğunda render edilir
- **Memoization**: Stil hesaplamaları optimize edilmiş
- **Smooth Animations**: Native driver kullanımı ile 60fps animasyon
- **Minimal Re-renders**: Sadece gerekli prop değişikliklerinde re-render

### Best Practices

#### Ne Zaman Kullanmalı
✅ Kullanıcı premium özelliğe erişmeye çalıştığında
✅ AI mesaj kotası dolduğunda
✅ Gelişmiş analitiklere erişim istendiğinde
✅ Özel temalar gibi premium özelliklerde

#### Ne Zaman Kullanmamalı
❌ Her ekran açılışında (spam olur)
❌ Kullanıcı zaten premium ise
❌ Kritik işlemler sırasında (örn: acil durum)
❌ Onboarding sırasında (çok erken)

#### UX İpuçları
- Feature ve description'ı net ve anlaşılır tutun
- Kullanıcıya değer önerisi sunun
- Agresif olmayın, kullanıcıya seçenek bırakın
- Prompt'u göstermeden önce feature gate kontrolü yapın

### Testing

Detaylı örnek kullanımlar için `UpgradePrompt.example.tsx` dosyasına bakın.

### Troubleshooting

#### Modal görünmüyor
- `visible` prop'unun `true` olduğundan emin olun
- Parent component'in render edildiğini kontrol edin

#### Navigation çalışmıyor
- `expo-router` kurulu olduğundan emin olun
- `/premium` route'unun tanımlı olduğunu kontrol edin

#### Tema renkleri yanlış
- `useTheme` hook'unun doğru çalıştığından emin olun
- Theme provider'ın app root'ta tanımlı olduğunu kontrol edin
