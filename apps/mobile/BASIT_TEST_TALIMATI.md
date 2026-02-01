# 🚀 En Basit Test Yöntemi

## Seçenek 1: Normal Dev Komutu (ÖNERİLEN)

Terminal'de şunu çalıştırın:

```bash
cd apps/mobile
npm run dev
```

**Ne olur:**
1. Development server başlar
2. Terminal'de QR kod görünür
3. QR kodu screenshot alıp paylaşın
4. Test kullanıcıları "Expo Go" ile tarar

**Test kullanıcıları için:**
1. App Store/Play Store'dan "Expo Go" indirin
2. QR kodu tarayın
3. Bitti!

**Not:** Aynı WiFi ağında olmanız gerekiyor.

---

## Seçenek 2: Farklı WiFi Ağındaysanız

Terminal'de şunu çalıştırın:

```bash
cd apps/mobile
npm run test:tunnel
```

Bu internet üzerinden erişim sağlar (biraz daha yavaş).

---

## Seçenek 3: Build ile Test (Tüm Özellikler)

Eğer IAP, bildirimler gibi özellikleri test etmek istiyorsanız:

### 1. EAS CLI Kurun (İlk Kez)
```bash
npm install -g eas-cli
eas login
```

### 2. Development Build Oluşturun
```bash
cd apps/mobile
npm run build:dev-apk
```

Bu 15-20 dakika sürer.

### 3. APK'yı İndirin
```bash
npm run build:download
```

### 4. APK'yı Paylaşın
- Google Drive'a yükleyin
- Linki arkadaşlarınızla paylaşın

### 5. Güncellemeler İçin
```bash
npm run dev
```
QR kodu paylaşın, test kullanıcıları uygulama içinden tarar.

---

## 🆓 Hepsi Ücretsiz!

- ✅ Expo Go - Ücretsiz
- ✅ Development Build - Ücretsiz
- ✅ EAS Build - Ücretsiz (ayda 30 build)

---

## ❓ Sorun mu Yaşıyorsunuz?

### "metro-runtime bulunamadı" hatası
```bash
cd apps/mobile
pnpm install
```

### "Expo Go'da uygulama açılmıyor"
- Aynı WiFi ağında mısınız?
- `npm run test:tunnel` deneyin

### "QR kod çalışmıyor"
- Expo Go uygulamasını güncelleyin
- Telefonu yeniden başlatın

---

## 📞 Detaylı Rehberler

- [HIZLI_TEST.md](./HIZLI_TEST.md) - Tüm yöntemler
- [UCRETSIZ_DAGITIM_REHBERI.md](./UCRETSIZ_DAGITIM_REHBERI.md) - Detaylı rehber

---

## 🎯 Özet

**En hızlı yöntem:**
```bash
cd apps/mobile
npm run dev
```

QR kodu paylaş ve test et! 🎉
