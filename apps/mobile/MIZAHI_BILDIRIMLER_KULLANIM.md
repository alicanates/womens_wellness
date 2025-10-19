# Mizahi Bildirimler Sistemi 😊

## Özellikler

### 1. Streak Bildirimleri 🔥
- 3 gün: "Artık profesyonelsin! 😎"
- 7 gün: "Netflix dizisi bitirme hızınla aynı! 🎬"
- 14 gün: "Artık bir alışkanlık haline geldi! 🌟"
- 30 gün: "Bir ay! Artık efsanesin! 👑"
- 50 gün: "Artık durdurulamaz bir güçsün! 💫"
- 100 gün: "İnanılmaz! Artık bir efsanesin! 🌈"

### 2. Motivasyon Bildirimleri 💪
- "Bugün de harika gidiyorsun! Streak'in seni bekliyor! 🔥"
- "Dün harika gitmişti! Bugün de devam edelim mi? 😊"
- "Streak'in 1 gün daha uzasın mı? Sadece birkaç saniye sürüyor! 💫"
- "Kendine iyi bak! Bugün nasıl hissediyorsun? 💭"
- "Su içmeyi unutma! Bitkiler gibi sen de suya ihtiyacın var! 🌱"

### 3. Başarı Bildirimleri 🎮
- 7 gün: "İlk hafta tamamlandı! Artık bir uzman sayılırsın! 🎓"
- 50 veri: "Veri bilimci olma yolunda ilerliyorsun! 📊"
- 100 veri: "Level 5! Artık oyunun kurallarını biliyorsun! 🎮"
- 200 veri: "Artık bir efsanesin! Devam et! 🌟"

### 4. Rastgele Eğlenceli Mesajlar ✨
- "Bugün nasıl hissediyorsun? Bize de anlat! 💭"
- "Su içmeyi unutma! 💧"
- "Kendine zaman ayırdın mı? 🧘‍♀️"
- "Bugün de muhteşemsin! ✨"

### 5. Regl Dönemi Destek Bildirimleri 💕
- "Yanındayız! Regl dönemindesin. Kendine ekstra iyi bak! 🌸"
- "Güçlüsün! Bu dönem de geçecek. Sen harikasın! 🌺"
- "Dinlen! Bugün kendine bol bol dinlenme zamanı ayır! 😴"
- "Sıcak içecek zamanı! Bir fincan sıcak çay seni rahatlatabilir! ☕"
- "Kendine nazik ol! Bu dönemde kendine karşı daha anlayışlı ol! 💖"
- "Yanındayız! Zor bir gün mü? Biz buradayız! 🤗"
- "Hareket et! Hafif bir yürüyüş seni iyi hissettirebilir! 🚶‍♀️"
- "Sıcak duş! Sıcak bir duş krampları azaltabilir! 🚿"

## Kurulum

Dosyalar zaten oluşturuldu:
- ✅ `src/types/funNotifications.ts`
- ✅ `src/constants/funNotifications.ts`
- ✅ `src/store/funNotificationStore.ts`
- ✅ `src/services/funNotificationService.ts`
- ✅ `src/components/notifications/FunNotificationCard.tsx`
- ✅ `src/components/settings/FunNotificationSettings.tsx`
- ✅ `src/hooks/useFunNotifications.ts`

## Kullanım

### 1. Home Screen'de Otomatik Gösterme

```tsx
import { FunNotificationExample } from '@/components/notifications';
import { useGamification } from '@/hooks/useGamification';

function HomeScreen() {
  const { stats } = useGamification();
  const isPeriodWeek = checkIfPeriodWeek(); // Regl takip sisteminden
  
  return (
    <ScrollView>
      <FunNotificationExample
        streakDay={stats.currentStreak}
        dataEntryCount={stats.totalDataEntries}
        isPeriodWeek={isPeriodWeek}
        autoShow={true}
      />
      {/* Diğer componentler */}
    </ScrollView>
  );
}
```

### 2. Veri Girişinden Sonra Manuel Gösterme

```tsx
import { useFunNotifications } from '@/hooks/useFunNotifications';

function DataEntryScreen() {
  const { showNotification, getAchievementNotification } = useFunNotifications();
  
  const handleDataEntry = async () => {
    const result = await saveData();
    
    // Başarı bildirimi göster
    const notification = getAchievementNotification(result.totalEntries);
    if (notification) {
      showNotification(notification);
    }
  };
  
  return (
    <View>
      {/* Form */}
    </View>
  );
}
```

### 3. Streak Milestone'da Gösterme

```tsx
import { useFunNotifications } from '@/hooks/useFunNotifications';

function StreakComponent() {
  const { showNotification, getStreakNotification } = useFunNotifications();
  const { stats } = useGamification();
  
  useEffect(() => {
    // Streak milestone kontrolü
    const notification = getStreakNotification(stats.currentStreak);
    if (notification) {
      showNotification(notification);
    }
  }, [stats.currentStreak]);
  
  return <StreakDisplay />;
}
```

### 4. Regl Dönemi Desteği

```tsx
import { useFunNotifications } from '@/hooks/useFunNotifications';

function PeriodTrackingScreen() {
  const { showNotification, getPeriodSupportNotification } = useFunNotifications();
  const isPeriodWeek = true; // Regl takip sisteminden
  
  useEffect(() => {
    if (isPeriodWeek) {
      // Günde bir kez rastgele destek mesajı göster
      const notification = getPeriodSupportNotification();
      if (notification) {
        showNotification(notification);
      }
    }
  }, [isPeriodWeek]);
  
  return <PeriodCalendar />;
}
```

### 5. Ayarlar Sayfası

```tsx
import { FunNotificationSettings } from '@/components/settings';

function SettingsScreen() {
  return (
    <ScrollView>
      <Text style={styles.title}>Ayarlar</Text>
      
      {/* Diğer ayarlar */}
      
      <FunNotificationSettings />
    </ScrollView>
  );
}
```

## Ayarlar

Kullanıcılar şu ayarları yapabilir:

1. **Ana Anahtar**: Tüm mizahi bildirimleri aç/kapat
2. **Bildirim Türleri**:
   - Streak bildirimleri
   - Motivasyon mesajları
   - Başarı bildirimleri
   - Rastgele mesajlar
   - Regl dönemi desteği
3. **Sıklık**: Az (1/gün), Orta (2-3/gün), Çok (4-5/gün)

## Teknik Detaylar

### Cooldown Sistemi
- Streak bildirimleri: Her milestone için bir kez
- Motivasyon: 24 saat cooldown
- Regl desteği: 12 saat cooldown
- Rastgele mesajlar: 48 saat cooldown

### Günlük Limit
- Az: 1 bildirim/gün
- Orta: 2-3 bildirim/gün
- Çok: 4-5 bildirim/gün

### Öncelik Sırası
1. Streak milestone
2. Achievement milestone
3. Regl dönemi desteği
4. Motivasyon (uzun süredir veri girişi yoksa)
5. Rastgele eğlenceli mesaj

## Özelleştirme

Yeni bildirim eklemek için `src/constants/funNotifications.ts` dosyasını düzenleyin:

```typescript
export const CUSTOM_NOTIFICATIONS: FunNotification[] = [
  {
    id: 'custom_1',
    type: 'MOTIVATION',
    titleTr: 'Özel Başlık',
    titleEn: 'Custom Title',
    messageTr: 'Özel mesaj',
    messageEn: 'Custom message',
    emoji: '🎉',
    triggerCondition: { random: true }
  }
];
```

## Test Etme

```tsx
import { FunNotificationService } from '@/services/funNotificationService';

// Streak bildirimi test et
const streakNotif = FunNotificationService.getStreakNotification(7);
console.log(streakNotif);

// Regl desteği test et
const periodNotif = FunNotificationService.getPeriodSupportNotification();
console.log(periodNotif);

// En uygun bildirimi seç
const bestNotif = FunNotificationService.selectBestNotification({
  streakDay: 7,
  isPeriodWeek: true,
  dataEntryCount: 50
});
console.log(bestNotif);
```

## Notlar

- Tüm bildirimler hem Türkçe hem İngilizce destekler
- AsyncStorage ile kalıcı olarak saklanır
- Kullanıcı tercihleri cihazda saklanır
- Bildirimler zarif animasyonlarla gösterilir
- Kullanıcı istediği zaman kapatabilir

## Sonraki Adımlar

1. Home screen'e entegre edin
2. Ayarlar sayfasına ekleyin
3. Veri girişi sonrası gösterin
4. Regl takip sistemiyle entegre edin
5. Push notification ile entegre edin (opsiyonel)
