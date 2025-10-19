# Bildirim İzni Yönetimi 🔔

## Özellikler

### Otomatik İzin Kontrolü
- Ayarlar sayfası açıldığında otomatik izin kontrolü
- İzin yoksa kullanıcıya prompt gösterilir
- İzin verildiğinde otomatik güncelleme

### Kullanıcı Dostu Arayüz
- Açık ve anlaşılır mesajlar
- Emoji ile görsel zenginlik
- "Ayarları Aç" butonu ile direkt yönlendirme
- Adım adım talimatlar

### Platform Desteği
- iOS ve Android için özel talimatlar
- Platform bazlı ayarlar açma
- Native izin isteme

## Kullanım

### 1. Ayarlar Sayfasında

```tsx
import { FunNotificationSettings } from '@/components/settings';

function SettingsScreen() {
  return (
    <ScrollView>
      {/* Otomatik izin kontrolü ve prompt */}
      <FunNotificationSettings />
    </ScrollView>
  );
}
```

### 2. Standalone İzin Prompt

```tsx
import { NotificationPermissionPrompt } from '@/components/notifications';

function OnboardingScreen() {
  return (
    <View>
      <NotificationPermissionPrompt
        onPermissionGranted={() => {
          console.log('İzin verildi!');
          // Bildirimleri aktif et
        }}
        onPermissionDenied={() => {
          console.log('İzin reddedildi');
          // Kullanıcıya bilgi ver
        }}
      />
    </View>
  );
}
```

### 3. Hook ile İzin Kontrolü

```tsx
import { useFunNotifications } from '@/hooks/useFunNotifications';

function MyComponent() {
  const { hasPermission, checkPermission } = useFunNotifications();

  useEffect(() => {
    if (!hasPermission) {
      // İzin yok, kullanıcıyı bilgilendir
      Alert.alert('Bildirim izni gerekli');
    }
  }, [hasPermission]);

  return (
    <View>
      {hasPermission ? (
        <Text>Bildirimler aktif ✅</Text>
      ) : (
        <Text>Bildirim izni gerekli ⚠️</Text>
      )}
    </View>
  );
}
```

## İzin Durumları

### 1. Undetermined (Belirsiz)
- İlk kez uygulama açıldığında
- Henüz izin istenmemiş
- **Aksiyon**: İzin iste butonu göster

### 2. Granted (Verildi)
- Kullanıcı izin verdi
- Bildirimler gönderilebilir
- **Aksiyon**: Normal bildirim ayarlarını göster

### 3. Denied (Reddedildi)
- Kullanıcı izni reddetti
- Sistem ayarlarından açılmalı
- **Aksiyon**: Ayarları aç butonu ve talimatlar göster

## Ayarları Açma

### iOS
```
1. Ayarlar uygulamasını aç
2. Aşağı kaydır ve uygulamayı bul
3. "Bildirimler" seçeneğine dokun
4. "Bildirimlere İzin Ver" anahtarını aç
```

### Android
```
1. Ayarlar uygulamasını aç
2. "Uygulamalar" veya "Bildirimler" bölümüne git
3. Uygulamayı bul ve seç
4. "Bildirimlere izin ver" seçeneğini aç
```

## Component API

### NotificationPermissionPrompt

```tsx
interface NotificationPermissionPromptProps {
  onPermissionGranted?: () => void;  // İzin verildiğinde
  onPermissionDenied?: () => void;   // İzin reddedildiğinde
}
```

**Özellikler:**
- Otomatik izin durumu kontrolü
- Platform bazlı ayarlar açma
- Adım adım talimatlar
- Zarif animasyonlar

### FunNotificationSettings

```tsx
// Otomatik izin kontrolü içerir
<FunNotificationSettings />
```

**Özellikler:**
- İzin yoksa prompt gösterir
- İzin verildiğinde ayarları gösterir
- Otomatik güncelleme
- Tam entegrasyon

## Akış Diyagramı

```
Uygulama Açılır
    ↓
İzin Kontrolü
    ↓
    ├─→ İzin Var (granted)
    │       ↓
    │   Bildirimleri Göster
    │
    ├─→ İzin Yok (undetermined)
    │       ↓
    │   İzin İste Butonu
    │       ↓
    │   Kullanıcı Tıklar
    │       ↓
    │   Sistem İzin Dialog
    │       ↓
    │       ├─→ İzin Verir → Bildirimler Aktif
    │       └─→ Reddeder → Ayarlar Prompt
    │
    └─→ İzin Reddedilmiş (denied)
            ↓
        Ayarları Aç Butonu
            ↓
        Adım Adım Talimatlar
            ↓
        Sistem Ayarları Açılır
```

## Test Senaryoları

### 1. İlk Kullanım
```tsx
// İzin durumu: undetermined
// Beklenen: İzin iste butonu gösterilmeli
```

### 2. İzin Verildi
```tsx
// İzin durumu: granted
// Beklenen: Normal ayarlar gösterilmeli
```

### 3. İzin Reddedildi
```tsx
// İzin durumu: denied
// Beklenen: Ayarları aç butonu ve talimatlar gösterilmeli
```

### 4. Ayarlardan İzin Verme
```tsx
// 1. İzin reddedilmiş durumda
// 2. "Ayarları Aç" butonuna tıkla
// 3. Sistem ayarları açılır
// 4. İzni aç
// 5. Uygulamaya dön
// 6. Otomatik güncelleme olmalı
```

## Hata Yönetimi

```tsx
try {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    // Başarılı
  } else {
    // Reddedildi
    showSettingsAlert();
  }
} catch (error) {
  console.error('İzin hatası:', error);
  Alert.alert('Hata', 'Bir sorun oluştu');
}
```

## Best Practices

1. **İlk Kullanımda İzin İsteme**
   - Onboarding sırasında izin iste
   - Neden gerekli olduğunu açıkla
   - Kullanıcıya değer sun

2. **Açık İletişim**
   - Bildirimlerin ne için kullanılacağını söyle
   - Faydasını vurgula
   - Zorlama yapma

3. **Kolay Erişim**
   - Ayarlar sayfasında her zaman göster
   - Reddedilirse tekrar açma yolu sun
   - Talimatları net ver

4. **Otomatik Güncelleme**
   - İzin durumu değiştiğinde otomatik güncelle
   - Kullanıcıyı bilgilendir
   - Sorunsuz geçiş sağla

## Entegrasyon Checklist

- [x] NotificationPermissionPrompt component'i oluşturuldu
- [x] FunNotificationSettings'e entegre edildi
- [x] useFunNotifications hook'una eklendi
- [x] Platform bazlı ayarlar açma eklendi
- [x] Adım adım talimatlar eklendi
- [x] Otomatik izin kontrolü eklendi
- [x] Hata yönetimi eklendi
- [x] TypeScript desteği eklendi

## Sonraki Adımlar

1. **Onboarding Entegrasyonu**
   - İlk kullanımda izin iste
   - Değer önerisini göster

2. **Push Notification**
   - Backend entegrasyonu
   - Token yönetimi
   - Uzak bildirimler

3. **Analytics**
   - İzin verme oranı
   - Reddedilme oranı
   - Ayarlardan açma oranı

4. **A/B Testing**
   - Farklı mesajlar test et
   - En iyi timing'i bul
   - Conversion optimize et
