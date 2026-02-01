# ✅ Demo Build Checklist

Arkadaşlarınızla test için uygulama dağıtımı checklist'i.

## 📋 Hazırlık (Bir Kez)

### Hesaplar
- [ ] Expo hesabı oluşturuldu (https://expo.dev)
- [ ] EAS CLI kuruldu (`npm install -g eas-cli`)
- [ ] Expo'ya giriş yapıldı (`eas login`)
- [ ] Apple Developer hesabı var (iOS için - $99/yıl)
- [ ] Google Play Console hesabı var (Android için - opsiyonel)

### Proje Yapılandırması
- [ ] `apps/mobile/eas.json` kontrol edildi
- [ ] `apps/mobile/app.json` kontrol edildi
- [ ] Bundle identifier/package name benzersiz
- [ ] Version number güncellendi (app.json)
- [ ] API URL production'a ayarlandı

## 🏗️ Build Süreci

### iOS Build
```bash
cd apps/mobile
eas build --platform ios --profile demo
```

- [ ] Build başlatıldı
- [ ] Apple credentials girildi
- [ ] Build tamamlandı (15-30 dakika)
- [ ] Build başarılı oldu

### Android Build
```bash
cd apps/mobile
eas build --platform android --profile demo
```

- [ ] Build başlatıldı
- [ ] Build tamamlandı (15-30 dakika)
- [ ] Build başarılı oldu
- [ ] APK indirildi

## 📤 Dağıtım

### iOS (TestFlight)
- [ ] App Store Connect'e giriş yapıldı
- [ ] TestFlight sekmesi açıldı
- [ ] Build otomatik yüklendi (veya manuel yüklendi)
- [ ] Test kullanıcıları eklendi (email adresleri)
- [ ] Davet emaili gönderildi
- [ ] Test kullanıcıları daveti kabul etti

### Android (APK)
- [ ] APK dosyası indirildi
- [ ] APK Google Drive/Dropbox'a yüklendi
- [ ] Link herkese açık yapıldı
- [ ] Link test kullanıcılarıyla paylaşıldı
- [ ] (Opsiyonel) QR kod oluşturuldu

## 📱 Test Kullanıcıları

### Talimatlar Paylaşıldı
- [ ] `TEST_KULLANICI_TALIMATLARI.md` gönderildi
- [ ] iOS kullanıcıları için TestFlight talimatları
- [ ] Android kullanıcıları için APK kurulum talimatları
- [ ] Test senaryoları paylaşıldı

### Feedback Sistemi
- [ ] Google Forms feedback formu oluşturuldu
- [ ] Form linki paylaşıldı
- [ ] Test süresi belirlendi (örn: 1 hafta)
- [ ] İletişim kanalı belirlendi (WhatsApp, Telegram, vb.)

## 🧪 Test Senaryoları

Test kullanıcılarının test etmesi gerekenler:

### Temel
- [ ] Kayıt olma
- [ ] Giriş yapma
- [ ] Profil oluşturma
- [ ] Navigasyon

### Özellikler
- [ ] Regl takibi
- [ ] Hamilelik modu
- [ ] AI asistan
- [ ] Bildirimler
- [ ] Premium ekranı

### Performans
- [ ] Uygulama açılış hızı
- [ ] Sayfa geçişleri
- [ ] API yanıt süreleri
- [ ] Offline çalışma

## 📊 Takip

### Build Durumu
```bash
# Build listesi
eas build:list

# Belirli build detayı
eas build:view <BUILD_ID>

# Build logları
eas build:view <BUILD_ID> --logs
```

### Feedback Toplama
- [ ] Günlük feedback kontrolü
- [ ] Kritik buglar için hızlı düzeltme
- [ ] Test kullanıcılarıyla düzenli iletişim
- [ ] Feedback özeti hazırlandı

## 🔄 Güncelleme (Gerekirse)

### Yeni Sürüm Yayınlama
- [ ] Version number artırıldı (app.json)
- [ ] Değişiklikler yapıldı
- [ ] Yeni build başlatıldı
- [ ] Test kullanıcılarına bildirildi

```bash
# Version güncelleme
# app.json: "version": "1.0.1"

# Yeni build
eas build --platform all --profile demo
```

## 🎉 Tamamlandı

### Son Kontroller
- [ ] Tüm test kullanıcıları uygulamayı yükledi
- [ ] En az 3 kişi feedback verdi
- [ ] Kritik buglar tespit edildi
- [ ] İyileştirme önerileri toplandı
- [ ] Sonraki adımlar belirlendi

## 📝 Notlar

### Build Bilgileri
- iOS Build ID: _______________
- Android Build ID: _______________
- Build Tarihi: _______________
- Version: _______________

### Test Kullanıcıları
1. _______________
2. _______________
3. _______________
4. _______________
5. _______________

### Önemli Linkler
- EAS Dashboard: https://expo.dev/accounts/meoacar/projects/kadinatlasi
- App Store Connect: https://appstoreconnect.apple.com
- Google Drive APK: _______________
- Feedback Form: _______________

## 🚨 Sorun Giderme

### Build Başarısız
```bash
# Logları kontrol et
eas build:view <BUILD_ID> --logs

# Cache temizle
cd apps/mobile
rm -rf node_modules
npm install

# Tekrar dene
eas build --platform <PLATFORM> --profile demo --clear-cache
```

### TestFlight'a Yüklenmiyor
- App Store Connect'te app kaydı yapıldı mı?
- Bundle identifier eşleşiyor mu?
- Apple Developer hesabı aktif mi?

### APK Kurulmuyor
- Android sürümü 8+ mı?
- Bilinmeyen kaynaklar izni verildi mi?
- APK dosyası bozuk değil mi? (tekrar indir)

## 📞 Yardım

- Expo Docs: https://docs.expo.dev/build/introduction/
- EAS Build: https://docs.expo.dev/build/setup/
- TestFlight: https://developer.apple.com/testflight/
- Expo Discord: https://chat.expo.dev/

---

**Hızlı Başlangıç:**
```bash
cd apps/mobile
./scripts/build-demo.sh
```

**Detaylı Rehber:**
`DEMO_BUILD_GUIDE.md` dosyasına bakın.
