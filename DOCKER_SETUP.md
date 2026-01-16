# Docker & CI/CD Setup Guide

## 🐳 Docker Kurulumu

### Gereksinimler
- Docker Desktop (Mac/Windows) veya Docker Engine (Linux)
- Docker Compose v2+
- Make (opsiyonel, kolaylık için)

### Hızlı Başlangıç

```bash
# 1. Docker kurulumunu kontrol et
docker --version
docker-compose --version

# 2. Otomatik kurulum scripti çalıştır
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh

# 3. Servisleri başlat
make dev
# veya
docker-compose up -d
```

### Manuel Kurulum

```bash
# 1. Environment dosyasını oluştur
cp .env.docker .env
# .env dosyasını düzenle

# 2. Docker image'larını build et
docker-compose build

# 3. Servisleri başlat
docker-compose up -d

# 4. Database migration'ları çalıştır
docker-compose exec api pnpm prisma migrate deploy

# 5. Database'i seed et (opsiyonel)
docker-compose exec api pnpm prisma db seed
```

## 📦 Servisler

### API (NestJS) - Port 3000
- REST API
- WebSocket
- Prisma ORM
- Bull Queue

### Admin Panel (Next.js) - Port 3001
- Admin dashboard
- Refine framework

### Astrology Service (Python/Flask) - Port 5000
- Astroloji hesaplamaları
- Cache sistemi

### PostgreSQL - Port 5432
- Ana veritabanı
- Persistent volume

### Redis - Port 6379
- Cache
- Queue backend

## 🛠️ Make Komutları

```bash
make help          # Tüm komutları göster
make dev           # Development ortamını başlat
make down          # Servisleri durdur
make logs          # Tüm logları göster
make logs-api      # Sadece API loglarını göster
make restart       # Servisleri yeniden başlat
make build         # Image'ları yeniden build et
make clean         # Tüm container, volume ve image'ları sil

# Database
make db-migrate    # Migration'ları çalıştır
make db-seed       # Database'i seed et
make db-studio     # Prisma Studio'yu aç
make db-reset      # Database'i sıfırla (DİKKAT!)

# Testing
make test          # Testleri çalıştır
make test-e2e      # E2E testleri çalıştır
make lint          # Linting yap

# Utility
make shell-api     # API container'ına shell aç
make shell-db      # PostgreSQL shell aç
make shell-redis   # Redis CLI aç
make ps            # Çalışan container'ları göster
make health        # Servis sağlığını kontrol et
```

## 🚀 Production Deployment

### Docker Compose ile Production

```bash
# 1. Production environment dosyasını hazırla
cp .env.docker .env.production
# Güvenli değerlerle doldur

# 2. Production image'larını build et
docker-compose -f docker-compose.prod.yml build

# 3. Production'ı başlat
docker-compose -f docker-compose.prod.yml up -d

# 4. Migration'ları çalıştır
docker-compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
```

### Makefile ile Production

```bash
make prod-up       # Production'ı başlat
make prod-down     # Production'ı durdur
make prod-logs     # Production loglarını göster
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### CI Pipeline (`.github/workflows/ci.yml`)
Her push ve PR'da çalışır:
- ✅ Linting ve type checking
- ✅ Unit testler
- ✅ E2E testler
- ✅ Docker image build
- ✅ Security scan (Trivy)

#### CD Pipeline (`.github/workflows/cd.yml`)
Main branch'e push veya tag'de çalışır:
- ✅ Docker image'ları build ve push
- ✅ GitHub Container Registry'ye yükle
- ✅ Production'a deploy
- ✅ Health check
- ✅ Slack bildirimi

### GitHub Secrets Ayarları

Repository Settings > Secrets and variables > Actions'a ekle:

```
PRODUCTION_HOST          # Production sunucu IP/domain
PRODUCTION_USER          # SSH kullanıcı adı
PRODUCTION_SSH_KEY       # SSH private key
PRODUCTION_URL           # Production URL (health check için)
SLACK_WEBHOOK           # Slack webhook URL (opsiyonel)
```

### Deployment Süreci

```bash
# 1. Yeni versiyon tag'i oluştur
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 2. GitHub Actions otomatik olarak:
#    - Testleri çalıştırır
#    - Docker image'ları build eder
#    - Container Registry'ye push eder
#    - Production'a deploy eder
#    - Health check yapar
```

## 🔍 Monitoring & Debugging

### Logları İzleme

```bash
# Tüm servisler
docker-compose logs -f

# Belirli bir servis
docker-compose logs -f api

# Son 100 satır
docker-compose logs --tail=100 api

# Timestamp ile
docker-compose logs -f -t api
```

### Container'a Bağlanma

```bash
# API container
docker-compose exec api sh

# Database
docker-compose exec postgres psql -U wellness -d wellness_db

# Redis
docker-compose exec redis redis-cli
```

### Resource Kullanımı

```bash
# Container stats
docker stats

# Disk kullanımı
docker system df

# Temizlik
docker system prune -a
```

## 🐛 Troubleshooting

### Port Çakışması
```bash
# Çakışan portu bul
lsof -i :3000

# Veya Docker'ı farklı portlarda başlat
API_PORT=3001 docker-compose up -d
```

### Database Bağlantı Hatası
```bash
# PostgreSQL'in hazır olup olmadığını kontrol et
docker-compose exec postgres pg_isready -U wellness

# Logları kontrol et
docker-compose logs postgres
```

### Build Hataları
```bash
# Cache'siz yeniden build et
docker-compose build --no-cache

# Tüm image'ları sil ve yeniden başla
make clean
make build
```

### Volume Sorunları
```bash
# Volume'ları listele
docker volume ls

# Volume'u sil (DİKKAT: Veri kaybı!)
docker volume rm wellness_postgres_data

# Tüm volume'ları sil
docker-compose down -v
```

## 📊 Best Practices

### Development
- ✅ `.env` dosyasını git'e ekleme
- ✅ Volume'ları kullan (hot reload için)
- ✅ Logları düzenli kontrol et
- ✅ `make health` ile servisleri kontrol et

### Production
- ✅ Güçlü şifreler kullan
- ✅ SSL/TLS aktif et
- ✅ Log rotation ayarla
- ✅ Backup stratejisi oluştur
- ✅ Health check'leri aktif et
- ✅ Resource limit'leri belirle

### Security
- ✅ Non-root user kullan (Dockerfile'larda mevcut)
- ✅ Multi-stage build kullan
- ✅ Minimal base image'lar kullan (alpine)
- ✅ Security scan'leri düzenli çalıştır
- ✅ Secrets'ları environment variable'larda sakla

## 🔗 Faydalı Linkler

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)

## 📝 Notlar

- Mobile app (Expo) Docker'da çalışmaz, local development gerektirir
- Production'da Nginx reverse proxy kullanılması önerilir
- Database backup'ları düzenli alınmalı
- Log rotation production'da kritik
