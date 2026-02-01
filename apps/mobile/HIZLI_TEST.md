# ⚡ Hızlı Test - Ücretsiz Yöntemler

Para ödemeden arkadaşlarınızla test etmenin en hızlı yolları.

## 🎯 3 Ücretsiz Seçenek

### 1️⃣ Expo Go (EN HIZLI - 2 DAKİKA)

**Ne zaman kullanılır:** Hemen test etmek istiyorsanız

```bash
cd apps/mobile
npm run test:expo-go
```

**Test kullanıcıları için:**
1. "Expo Go" uygulamasını indirin (App Store/Play Store)
2. QR kodu tarayın
3. Bitti! 🎉

**Sınırlamalar:**
- ❌ IAP (satın alma) çalışmaz
- ❌ Push notifications sınırlı
- ✅ Diğer her şey çalışır

---

### 2️⃣ Development Build (TAM ÖZELLİKLİ)

**Ne zaman kullanılır:** Tüm özellikleri test etmek istiyorsanız

```bash
cd apps/mobile
npm run build:dev-apk
```

**İlk kurulum (bir kez):**
1. Build tamamlanınca (15-20 dakika)
2. APK'yı indirin: `npm run build:download`
3. Google Drive'a yükleyin
4. Linki paylaşın

**Sonra güncellemeler için:**
```bash
npm run dev
# QR kodu paylaşın
```

**Avantajlar:**
- ✅ Tüm özellikler çalışır
- ✅ QR kod ile güncelleme
- ✅ Production benzeri

---

### 3️⃣ APK Direkt (STANDALONE)

**Ne zaman kullanılır:** Standalone uygulama istiyorsanız

```bash
cd apps/mobile
npm run build:demo:android
```

**Dağıtım:**
1. Build tamamlanınca
2. APK'yı indirin: `npm run build:download`
3. Google Drive'a yükleyin
4. Linki paylaşın

**Özellikler:**
- ✅ Tüm özellikler çalışır
- ✅ Internet gerekmez
- ❌ Her güncelleme için yeni APK

---

## 🚀 Hemen Başla

### Seçenek 1: Expo Go (Önerilen - Hızlı Test)

```bash
cd apps/mobile
npm run test:expo-go
```

**Ekranda QR kod görünecek:**
1. Screenshot alın
2. WhatsApp/Telegram'da paylaşın
3. Test kullanıcıları "Expo Go" ile tarasın

**Test kullanıcılarına gönderin:**
```
Merhaba! 👋

Kadın Atlası uygulamasını test etmek için:

1. App Store/Play Store'dan "Expo Go" indirin
2. Ekteki QR kodu tarayın
3. Uygulama açılır!

[QR kod resmi]

Sorularınız için: [telefon/email]
```

---

### Seçenek 2: Development Build (Tam Özellikli)

```bash
# 1. Build oluştur (ilk kez)
cd apps/mobile
npm run build:dev-apk

# 2. Build tamamlanınca (15-20 dakika)
npm run build:download

# 3. APK'yı Google Drive'a yükle

# 4. Development server başlat
npm run dev
```

**Test kullanıcılarına gönderin:**
```
Merhaba! 👋

Kadın Atlası uygulamasını test etmek için:

📱 Android Kurulum:
1. Bu linke tıklayın: [Google Drive APK linki]
2. APK'yı indirin
3. "Bilinmeyen kaynaklar" iznini verin
4. Kurun

🔄 Güncellemeler:
Uygulama içinde QR kod tarayıcı var.
Size QR kod göndereceğim, tarayın ve güncellemeler otomatik gelir!

[İlk QR kod]

Sorularınız için: [telefon/email]
```

---

## 📱 Test Kullanıcıları İçin Basit Talimatlar

### Expo Go İçin

**iOS:**
1. App Store'dan "Expo Go" indirin
2. Expo Go'yu açın
3. "Scan QR Code" butonuna basın
4. Size gönderilen QR kodu tarayın

**Android:**
1. Play Store'dan "Expo Go" indirin
2. Expo Go'yu açın
3. "Scan QR Code" butonuna basın
4. Size gönderilen QR kodu tarayın

---

### Development Build İçin (Android)

**İlk Kurulum:**
1. Size gönderilen linke tıklayın
2. APK dosyasını indirin
3. İndirilen dosyaya tıklayın
4. "Bilinmeyen kaynaklardan yükleme" iznini verin
5. "Yükle" butonuna basın

**Güncelleme:**
1. Uygulamayı açın
2. Size gönderilen QR kodu tarayın
3. Güncelleme otomatik yüklenir

---

## 💡 Hangi Yöntemi Seçmeliyim?

### Hızlı test için (bugün)
→ **Expo Go** kullanın
- 2 dakikada hazır
- QR kod paylaş
- Hemen test et

### Ciddi test için (bu hafta)
→ **Development Build** kullanın
- Tüm özellikler çalışır
- QR kod ile güncelleme
- Production benzeri

### Standalone uygulama için
→ **APK Direkt** kullanın
- Tam uygulama
- Internet gerekmez
- Her güncelleme için yeni APK

---

## 🔧 Sorun Giderme

### "Expo Go bulamıyorum"
- App Store/Play Store'da "Expo Go" arayın
- Resmi Expo uygulaması (mavi logo)

### "QR kod çalışmıyor"
- Aynı WiFi ağında mısınız?
- Tunnel modu kullanın: `npm run test:tunnel`

### "Uygulama açılmıyor"
- Internet bağlantınızı kontrol edin
- Expo Go'yu güncelleyin
- Telefonu yeniden başlatın

### "APK kurulamıyor"
- "Bilinmeyen kaynaklar" iznini verin
- Ayarlar > Güvenlik > Bilinmeyen kaynaklar
- Ya da kurulum sırasında izin verin

---

## 📊 Karşılaştırma

| Özellik | Expo Go | Dev Build | APK Direkt |
|---------|---------|-----------|------------|
| Kurulum Süresi | 2 dakika | 20 dakika | 20 dakika |
| Tüm Özellikler | ❌ | ✅ | ✅ |
| Güncelleme | Otomatik | QR kod | Manuel |
| Internet | Gerekli | İlk yükleme | Gerekmez |
| Maliyet | Ücretsiz | Ücretsiz | Ücretsiz |

---

## 🎉 Başarı Hikayeleri

**Expo Go ile:**
- ✅ 2 dakikada test başladı
- ✅ 5 arkadaş aynı anda test etti
- ✅ Anında feedback aldık

**Development Build ile:**
- ✅ Tüm özellikler çalıştı
- ✅ QR kod ile 10+ güncelleme yaptık
- ✅ Production benzeri test

---

## 📞 Yardım

**Detaylı rehber:**
- [UCRETSIZ_DAGITIM_REHBERI.md](./UCRETSIZ_DAGITIM_REHBERI.md)

**Expo Docs:**
- https://docs.expo.dev/get-started/expo-go/
- https://docs.expo.dev/develop/development-builds/introduction/

**Sorularınız için:**
- Expo Discord: https://chat.expo.dev/

---

## 🚀 Hemen Başla!

```bash
cd apps/mobile
npm run test:expo-go
```

**QR kodu paylaş ve test et! 🎊**
