# DevOps Quick Start 🚀

## Hızlı Başlangıç (5 dakika)

```bash
# 1. Docker kurulumunu kontrol et
docker --version
docker-compose --version

# 2. Otomatik kurulum
./scripts/docker-setup.sh

# 3. Servisleri başlat
make dev

# 4. Tarayıcıda aç
# API: http://localhost:3000
# Admin: http://localhost:3001
```

## Temel Komutlar

```bash
make dev      # Başlat
make down     # Durdur
make logs     # Logları göster
make restart  # Yeniden başlat
make help     # Tüm komutları göster
```

## Detaylı Dokümantasyon

- **DOCKER_SETUP.md** - Tam kurulum rehberi
- **DEVOPS_COMPLETE.md** - Tüm özellikler ve kullanım

## Sorun mu var?

```bash
# Servislerin durumunu kontrol et
make health

# Logları kontrol et
make logs

# Temizle ve yeniden başla
make clean
make dev
```

## CI/CD

Her commit'te otomatik:
- ✅ Testler çalışır
- ✅ Docker build test edilir
- ✅ Security scan yapılır

Tag ile production'a deploy:
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

**Daha fazla bilgi:** DOCKER_SETUP.md ve DEVOPS_COMPLETE.md dosyalarına bakın.
