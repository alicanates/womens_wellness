# 🔧 Network Request Failed - Çözüm

## 🐛 Sorun
Mobil uygulamada "Network request failed" hatası alıyorsunuz.

## 🎯 Neden?
API sunucusu çalışmıyor veya mobil uygulama API'ye bağlanamıyor.

## ✅ Hızlı Çözüm

### 1. API Sunucusunu Başlatın

Yeni bir terminal açın ve:

```bash
cd apps/api
npm run dev
```

API başlayana kadar bekleyin (30-60 saniye). Şu mesajı görmelisiniz:
```
[Nest] Application is running on: http://[::]:3000
```

### 2. Mobil Uygulamayı Yenileyin

Expo Go'da:
- Uygulamayı kapatın
- QR kodu tekrar tarayın

Ya da terminal'de `r` tuşuna basın (reload).

## 🔍 Detaylı Kontrol

### API Çalışıyor mu?

Yeni terminal'de:
```bash
curl http://localhost:3000/health
```

Çıktı:
```json
{"status":"ok"}
```

### Mobil Uygulama Doğru URL'i Kullanıyor mu?

`apps/mobile/.env.local` dosyasını kontrol edin:
```bash
cat apps/mobile/.env.local
```

Şu satırı görmelisiniz:
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.103:3000
```

IP adresi bilgisayarınızın local IP'si olmalı.

### Local IP'nizi Bulun

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

## 🚀 Tam Kurulum

### 1. API Sunucusu

Terminal 1:
```bash
cd apps/api

# Prisma client oluştur (ilk kez)
npx prisma generate

# API'yi başlat
npm run dev
```

### 2. Mobil Uygulama

Terminal 2:
```bash
cd apps/mobile

# .env.local dosyasını düzenleyin
# EXPO_PUBLIC_API_BASE_URL=http://[LOCAL_IP]:3000

# Expo'yu başlatın
npm run dev
```

### 3. Test Edin

- Expo Go'da QR kodu tarayın
- Uygulama açılmalı
- API'ye bağlanmalı

## 🔧 Sorun Giderme

### "Connection refused" hatası

API sunucusu çalışmıyor. Terminal 1'de API'yi başlatın:
```bash
cd apps/api
npm run dev
```

### "Timeout" hatası

Firewall engelliyor olabilir:
- macOS: System Preferences > Security & Privacy > Firewall
- Port 3000'i açın

### "Cannot find module" hatası

Dependencies eksik:
```bash
# Root'tan
pnpm install

# API için Prisma
cd apps/api
npx prisma generate
```

### Telefon ve bilgisayar farklı WiFi'de

Aynı WiFi ağına bağlanın veya tunnel modu kullanın:
```bash
cd apps/mobile
npm run test:tunnel
```

## 📝 Özet

1. ✅ API sunucusunu başlatın (`cd apps/api && npm run dev`)
2. ✅ `.env.local` dosyasında doğru IP'yi kullanın
3. ✅ Aynı WiFi ağında olun
4. ✅ Mobil uygulamayı yenileyin

## 🎉 Başarılar!

API çalıştığında mobil uygulama bağlanacak ve "Network request failed" hatası kaybolacak!
