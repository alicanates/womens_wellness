# Bildirim İzni - Hızlı Başlangıç 🚀

## Problem: "Bildirim izni reddedildi. Ayarlardan izin verin"

Bu mesajı görüyorsanız, uygulamanın bildirim göndermesi için cihaz ayarlarından izin vermeniz gerekiyor.

## Çözüm: 3 Kolay Adım

### 📱 iOS için:

1. **Ayarlar** uygulamasını açın
2. Aşağı kaydırın ve **uygulamanızı** bulun
3. **"Bildirimler"** seçeneğine dokunun
4. **"Bildirimlere İzin Ver"** anahtarını açın ✅

### 🤖 Android için:

1. **Ayarlar** uygulamasını açın
2. **"Uygulamalar"** veya **"Bildirimler"** bölümüne gidin
3. **Uygulamanızı** bulun ve seçin
4. **"Bildirimlere izin ver"** seçeneğini açın ✅

## Uygulama İçinden Açma

Ayarlar sayfasında **"Ayarları Aç"** butonuna tıklayarak direkt cihaz ayarlarına gidebilirsiniz!

```
Ayarlar Ekranı
    ↓
Mizahi Bildirimler Bölümü
    ↓
"Ayarları Aç" Butonu
    ↓
Cihaz Ayarları (Otomatik Açılır)
```

## Neden İzin Gerekli?

Bildirim izni sayesinde:

- 🔥 **Streak hatırlatmaları** alırsınız
- 💪 **Motivasyon mesajları** görürsünüz
- 💕 **Regl dönemi desteği** alırsınız
- 🎮 **Başarı bildirimleri** görürsünüz
- ✨ **Eğlenceli mesajlar** alırsınız

## Sorun Devam Ediyorsa

1. **Uygulamayı Yeniden Başlatın**
   - Uygulamayı tamamen kapatın
   - Tekrar açın
   - İzin kontrolü otomatik yapılacak

2. **Cihazı Yeniden Başlatın**
   - Bazen cihaz yeniden başlatma gerekir
   - İzinler yenilenir

3. **Uygulamayı Güncelleyin**
   - App Store / Play Store'dan güncelleme kontrolü yapın
   - En son sürümü yükleyin

## Teknik Detaylar (Geliştiriciler için)

### İzin Durumları

```typescript
// undetermined: Henüz sorulmadı
// granted: İzin verildi ✅
// denied: İzin reddedildi ❌
```

### Kod Örneği

```tsx
import { NotificationPermissionPrompt } from '@/components/notifications';

<NotificationPermissionPrompt
  onPermissionGranted={() => console.log('İzin verildi!')}
  onPermissionDenied={() => console.log('İzin reddedildi')}
/>
```

### Ayarları Açma

```typescript
import { Linking, Platform } from 'react-native';

// iOS
Linking.openURL('app-settings:');

// Android
Linking.openSettings();
```

## SSS (Sık Sorulan Sorular)

### S: İzin verdim ama bildirim gelmiyor?
**C:** Uygulamayı yeniden başlatın. İzin kontrolü otomatik yapılacak.

### S: Yanlışlıkla reddettim, nasıl açarım?
**C:** Ayarlar > Mizahi Bildirimler > "Ayarları Aç" butonuna tıklayın.

### S: Sadece bazı bildirimleri almak istiyorum?
**C:** Ayarlar sayfasından bildirim türlerini özelleştirebilirsiniz.

### S: Bildirimleri tamamen kapatabilir miyim?
**C:** Evet! Ayarlar > Mizahi Bildirimler > Ana anahtarı kapatın.

### S: Günde kaç bildirim geliyor?
**C:** Sıklık ayarından seçebilirsiniz: Az (1), Orta (2-3), Çok (4-5)

## Destek

Sorun devam ediyorsa:
- 📧 Destek ekibine ulaşın
- 💬 Uygulama içi chat kullanın
- 🐛 Bug raporu gönderin

---

**Not:** Bildirim izni vermek tamamen isteğe bağlıdır. İzin vermeden de uygulamayı kullanabilirsiniz, ancak mizahi bildirimler ve hatırlatmalar alamazsınız.
