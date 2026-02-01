# 🎉 Deployment Başarılı!

## Sunucu Bilgileri
- **IP**: 31.97.34.163
- **Domain**: kadinatlasi.com
- **İşletim Sistemi**: Ubuntu 24.04 LTS
- **Proje Dizini**: /opt/kadinatlasi

## Çalışan Servisler

### ✅ PostgreSQL Database
- **Container**: wellness-postgres-prod
- **Status**: Healthy
- **Port**: 5432 (internal)

### ✅ Redis Cache
- **Container**: wellness-redis-prod
- **Status**: Healthy
- **Port**: 6379 (internal)

### ✅ API Service (NestJS)
- **Container**: wellness-api-prod
- **Status**: Running
- **Port**: 3000 (mapped to host)
- **URL**: http://api.kadinatlasi.com
- **Test**: `curl http://api.kadinatlasi.com/`
- **Response**: "Wellness API v1.0 - Women's Wellness Companion"

### ✅ Admin Panel (Next.js)
- **Container**: wellness-admin-prod
- **Status**: Running
- **Port**: 3001 (mapped to host)
- **URL**: http://admin.kadinatlasi.com
- **Test**: `curl -I http://admin.kadinatlasi.com/`
- **Response**: 200 OK

### ✅ Astrology Service (Python/Flask)
- **Container**: wellness-astrology-prod
- **Status**: Running
- **Port**: 5000 (mapped to host)

### ✅ Nginx Reverse Proxy
- **Container**: wellness-nginx
- **Status**: Running
- **Ports**: 80 (HTTP), 443 (HTTPS - hazır değil)
- **Config**: nginx-http.conf (HTTP-only)

## Yapılan Düzeltmeler

1. **Redis Authentication**: BullMQ bağlantısına Redis şifresi eklendi
2. **Network Aliases**: Docker network'te servis isimleri için alias'lar eklendi
3. **Port Configuration**: API container'ında PORT=3000 environment variable'ı ayarlandı
4. **Nginx Configuration**: HTTP-only config oluşturuldu (SSL henüz yok)
5. **Database Migration**: Prisma db push ile tüm tablolar oluşturuldu

## Erişim URL'leri

- **API**: http://api.kadinatlasi.com
- **Admin Panel**: http://admin.kadinatlasi.com
- **Ana Domain**: http://kadinatlasi.com (admin'e yönlendiriyor)
- **www**: http://www.kadinatlasi.com (admin'e yönlendiriyor)

## 📱 Android APK Build

Android APK build işlemi GitHub Actions ile otomatik olarak yapılıyor:
- **Workflow Dosyası**: `.github/workflows/build-android.yml`
- **Build Durumu**: https://github.com/alicanates/womens_wellness/actions
- **APK İndirme**: Actions → Build Android APK → Artifacts → app-release
- **Detaylı Bilgi**: `ANDROID_BUILD_STATUS.md` ve `ANDROID_BUILD_GUIDE.md` dosyalarına bakın

### APK İndirme Adımları:
1. GitHub Actions sayfasına git
2. "Build Android APK" workflow'una tıkla
3. En son başarılı build'i seç
4. Artifacts bölümünden "app-release" ZIP'ini indir
5. ZIP'i aç ve `app-release.apk` dosyasını Android cihazına yükle

## Sıradaki Adımlar

### 1. ✅ SSL Sertifikası Kurulumu (TAMAMLANDI!)
```bash
# Let's Encrypt ile SSL sertifikası al
ssh root@31.97.34.163
cd /opt/kadinatlasi

# Certbot kur
apt install certbot python3-certbot-nginx -y

# Sertifika al
certbot certonly --standalone -d kadinatlasi.com -d www.kadinatlasi.com -d api.kadinatlasi.com -d admin.kadinatlasi.com

# Sertifikaları nginx dizinine kopyala
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/kadinatlasi.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/kadinatlasi.com/privkey.pem nginx/ssl/

# nginx.conf'u kullan (HTTPS'li versiyon)
# docker-compose.prod.yml'de nginx-http.conf yerine nginx.conf kullan
docker compose -f docker-compose.prod.yml restart nginx
```

### 2. Gemini API Key Ekleme
```bash
# .env dosyasını düzenle
nano /opt/kadinatlasi/.env

# GOOGLE_GENERATIVE_AI_API_KEY değerini gerçek key ile değiştir
# Şu anda: dummy-key-for-now

# API'yi yeniden başlat
docker compose -f docker-compose.prod.yml restart api
```

### 3. Admin Kullanıcısı Oluşturma
```bash
# API container'ına gir
docker exec -it wellness-api-prod sh

# Seed script'i çalıştır (eğer varsa)
cd /app/apps/api
npx prisma db seed
```

### 4. Monitoring ve Logging
- Sentry kurulumu (opsiyonel)
- Log rotation ayarları
- Backup stratejisi

### 5. Güvenlik
- Firewall kuralları (UFW)
- Fail2ban kurulumu
- SSH key-based authentication
- Root login devre dışı bırakma

## Faydalı Komutlar

### Servisleri Yönetme
```bash
# Tüm servisleri başlat
docker compose -f docker-compose.prod.yml up -d

# Tüm servisleri durdur
docker compose -f docker-compose.prod.yml down

# Belirli bir servisi yeniden başlat
docker compose -f docker-compose.prod.yml restart api

# Logları görüntüle
docker logs wellness-api-prod --tail 50 -f
```

### Database Yönetimi
```bash
# Prisma Studio (local'den)
ssh -L 5555:localhost:5432 root@31.97.34.163
# Sonra local'de: npx prisma studio

# Database backup
docker exec wellness-postgres-prod pg_dump -U wellness_user wellness_db > backup.sql

# Database restore
cat backup.sql | docker exec -i wellness-postgres-prod psql -U wellness_user wellness_db
```

### Güncelleme
```bash
# Kod güncellemesi
cd /opt/kadinatlasi
git pull origin chatbot

# Servisleri yeniden build et ve başlat
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Sorun Giderme

### API çalışmıyor
```bash
docker logs wellness-api-prod --tail 100
docker compose -f docker-compose.prod.yml restart api
```

### Database bağlantı hatası
```bash
docker logs wellness-postgres-prod
docker compose -f docker-compose.prod.yml restart postgres
```

### Nginx 502 hatası
```bash
docker logs wellness-nginx
# Upstream servislerin çalıştığını kontrol et
docker compose -f docker-compose.prod.yml ps
```

## Notlar

- Şu anda HTTP üzerinden çalışıyor (SSL yok)
- Gemini API key dummy değerde
- Production ortamı için SSL mutlaka kurulmalı
- Admin kullanıcısı oluşturulmalı
- Backup stratejisi belirlenmeli
