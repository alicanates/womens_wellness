# 🏠 Self-Hosted Setup - Kendi Sunucunda Çalıştır

Kendi sunucunda Women's Wellness App'i tamamen self-hosted olarak çalıştırmak için rehber.

## 🎯 Avantajlar

- ✅ **Tam kontrol** - Tüm data kendi sunucunda
- ✅ **Maliyet** - Sadece sunucu maliyeti
- ✅ **Privacy** - Üçüncü parti servislere bağımlılık yok
- ✅ **Özelleştirme** - İstediğin gibi yapılandır

## 📋 Gereksinimler

### Minimum Sunucu Özellikleri
```
CPU:     2 core
RAM:     4GB
Disk:    20GB SSD
OS:      Ubuntu 22.04 LTS (önerilen)
Network: Statik IP veya domain
```

### Yazılım Gereksinimleri
```
- Docker & Docker Compose
- Nginx (reverse proxy için)
- Certbot (SSL için)
```

---

## 🚀 Hızlı Kurulum (Docker ile)

### 1. Sunucuya Bağlan

```bash
ssh user@your-server-ip
```

### 2. Docker Kur

```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Projeyi Klonla

```bash
cd /opt
sudo git clone <your-repo-url> wellness
cd wellness
sudo chown -R $USER:$USER .
```

### 4. Environment Variables Ayarla

```bash
# .env dosyası oluştur
cat > .env << 'EOF'
# ═══════════════════════════════════════════════════════════
# Self-Hosted Production Environment
# ═══════════════════════════════════════════════════════════

# Node Environment
NODE_ENV=production

# PostgreSQL (Docker içinde)
POSTGRES_USER=wellness
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
POSTGRES_DB=wellness_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://wellness:CHANGE_THIS_STRONG_PASSWORD@postgres:5432/wellness_db

# Redis (Docker içinde)
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD
REDIS_URL=redis://:CHANGE_THIS_REDIS_PASSWORD@redis:6379

# API
API_PORT=3000
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# JWT Secrets (MUTLAKA DEĞİŞTİR!)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# AI Provider (EN AZ BİRİ GEREKLİ)
# Seçenek 1: Google Gemini (Ücretsiz kota yüksek)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Seçenek 2: OpenAI (Ücretli ama güçlü)
# OPENAI_API_KEY=sk-your-openai-key

# Seçenek 3: Anthropic Claude (Ücretli)
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Seçenek 4: Ollama (Tamamen self-hosted, ücretsiz!)
# OLLAMA_BASE_URL=http://ollama:11434
# OLLAMA_MODEL=llama3.1:8b

# Google OAuth (Opsiyonel - Google login için)
GOOGLE_OAUTH_CLIENT_ID_IOS=your-ios-client-id
GOOGLE_OAUTH_CLIENT_ID_ANDROID=your-android-client-id
GOOGLE_OAUTH_CLIENT_ID_WEB=your-web-client-id

# Push Notifications (Opsiyonel)
EXPO_ACCESS_TOKEN=your-expo-token

# Email (Self-hosted SMTP)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com
SMTP_TLS=false

# File Storage (Local filesystem)
STORAGE_DRIVER=filesystem
FILES_BASE_PATH=/var/wellness/files

# Security
SKIP_WEBHOOK_VERIFICATION=false
COOKIE_SECURE=true
COOKIE_DOMAIN=yourdomain.com

# Admin
ADMIN_PORT=3001
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
ADMIN_EMAILS=admin@yourdomain.com

# Monitoring (Opsiyonel)
SENTRY_DSN=
POSTHOG_API_KEY=
EOF

# Şifreleri değiştir
nano .env
```

### 5. Docker Compose ile Başlat

```bash
# Production compose file kullan
docker-compose -f docker-compose.prod.yml up -d

# Logları kontrol et
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. Database Migration

```bash
# Migration'ları çalıştır
docker-compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy

# Seed data (opsiyonel)
docker-compose -f docker-compose.prod.yml exec api pnpm prisma db seed
```

### 7. Health Check

```bash
# API health check
curl http://localhost:3000/health

# Beklenen: {"status":"ok"}
```

---

## 🔐 SSL & Domain Setup

### 1. Nginx Kur

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Nginx Konfigürasyonu

```bash
# API için
sudo nano /etc/nginx/sites-available/wellness-api

# Aşağıdaki içeriği yapıştır:
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SSE için gerekli
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

```bash
# Admin için
sudo nano /etc/nginx/sites-available/wellness-admin
```

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Siteleri aktif et
sudo ln -s /etc/nginx/sites-available/wellness-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/wellness-admin /etc/nginx/sites-enabled/

# Nginx test et
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx -y

# SSL certificate al
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com

# Otomatik renewal test et
sudo certbot renew --dry-run
```

---

## 🤖 AI Provider Seçenekleri

### Seçenek 1: Google Gemini (Önerilen - Ücretsiz)

**Avantajlar:**
- ✅ Yüksek ücretsiz kota (15 req/min)
- ✅ Kolay setup
- ✅ Türkçe desteği iyi

**Setup:**
```bash
# 1. https://aistudio.google.com/app/apikey
# 2. API key al
# 3. .env'e ekle
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyC...
```

### Seçenek 2: Ollama (Tamamen Self-Hosted!)

**Avantajlar:**
- ✅ Tamamen ücretsiz
- ✅ Tam privacy (data sunucudan çıkmaz)
- ✅ API limiti yok

**Dezavantajlar:**
- ⚠️ Daha fazla RAM gerekir (8GB+)
- ⚠️ Daha yavaş (GPU yoksa)

**Setup:**

```bash
# 1. docker-compose.prod.yml'e Ollama ekle
nano docker-compose.prod.yml
```

```yaml
services:
  # ... mevcut servisler ...
  
  ollama:
    image: ollama/ollama:latest
    container_name: wellness-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    # GPU varsa (opsiyonel)
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]

volumes:
  ollama_data:
```

```bash
# 2. Ollama'yı başlat
docker-compose -f docker-compose.prod.yml up -d ollama

# 3. Model indir (llama3.1 önerilen)
docker-compose -f docker-compose.prod.yml exec ollama ollama pull llama3.1:8b

# Veya daha küçük model (4GB RAM için)
docker-compose -f docker-compose.prod.yml exec ollama ollama pull llama3.1:3b

# 4. .env'i güncelle
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1:8b

# 5. API'yi restart et
docker-compose -f docker-compose.prod.yml restart api
```

**Test:**
```bash
# Ollama test
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Merhaba, nasılsın?",
  "stream": false
}'
```

### Seçenek 3: OpenAI (Ücretli)

```bash
# .env
OPENAI_API_KEY=sk-...
```

**Maliyet:** ~$0.002/request (GPT-4o-mini)

### Seçenek 4: Anthropic Claude (Ücretli)

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
```

**Maliyet:** ~$0.003/request (Claude 3.5 Haiku)

---

## 📧 Email Setup (Self-Hosted)

### Seçenek 1: Mailpit (Development/Testing)

Zaten docker-compose'da var, hiçbir şey yapma gerek yok!

```bash
# Email UI: http://your-server-ip:8025
```

### Seçenek 2: Postfix (Production)

```bash
# Postfix kur
sudo apt install postfix -y

# Konfigürasyon sırasında:
# - General type: Internet Site
# - System mail name: yourdomain.com

# .env'i güncelle
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_FROM=noreply@yourdomain.com
```

### Seçenek 3: External SMTP (Gmail, Outlook)

```bash
# Gmail örneği
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_TLS=true
```

---

## 💾 Backup Stratejisi

### 1. Otomatik Database Backup

```bash
# Backup script oluştur
sudo nano /opt/wellness/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/wellness"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker exec wellness-postgres pg_dump -U wellness wellness_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/wellness/files

# 30 günden eski backup'ları sil
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Executable yap
sudo chmod +x /opt/wellness/backup.sh

# Cron job ekle (her gün 02:00)
sudo crontab -e

# Ekle:
0 2 * * * /opt/wellness/backup.sh >> /var/log/wellness-backup.log 2>&1
```

### 2. Manuel Backup

```bash
# Database backup
make backup-db

# Veya
docker exec wellness-postgres pg_dump -U wellness wellness_db > backup.sql

# Files backup
tar -czf files-backup.tar.gz /var/wellness/files
```

### 3. Restore

```bash
# Database restore
docker exec -i wellness-postgres psql -U wellness wellness_db < backup.sql

# Files restore
tar -xzf files-backup.tar.gz -C /
```

---

## 📊 Monitoring (Self-Hosted)

### Seçenek 1: Prometheus + Grafana

```bash
# docker-compose.prod.yml'e ekle
nano docker-compose.prod.yml
```

```yaml
  prometheus:
    image: prom/prometheus:latest
    container_name: wellness-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: wellness-grafana
    ports:
      - "3002:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
```

```bash
# Prometheus config
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'wellness-api'
    static_configs:
      - targets: ['api:3000']
EOF

# Başlat
docker-compose -f docker-compose.prod.yml up -d prometheus grafana

# Grafana: http://your-server-ip:3002
# Username: admin, Password: admin
```

### Seçenek 2: Uptime Kuma

```bash
# docker-compose.prod.yml'e ekle
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    container_name: wellness-uptime
    ports:
      - "3003:3001"
    volumes:
      - uptime_data:/app/data
    restart: unless-stopped

volumes:
  uptime_data:
```

```bash
# Başlat
docker-compose -f docker-compose.prod.yml up -d uptime-kuma

# UI: http://your-server-ip:3003
```

---

## 🔒 Güvenlik

### 1. Firewall (UFW)

```bash
# UFW kur ve aktif et
sudo apt install ufw -y

# SSH izin ver
sudo ufw allow 22/tcp

# HTTP/HTTPS izin ver
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# UFW aktif et
sudo ufw enable

# Status kontrol
sudo ufw status
```

### 2. Fail2Ban (Brute force koruması)

```bash
# Fail2Ban kur
sudo apt install fail2ban -y

# Nginx için jail oluştur
sudo nano /etc/fail2ban/jail.local
```

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
```

```bash
# Fail2Ban restart
sudo systemctl restart fail2ban

# Status kontrol
sudo fail2ban-client status
```

### 3. Docker Security

```bash
# Docker daemon güvenlik ayarları
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "userns-remap": "default"
}
```

```bash
# Docker restart
sudo systemctl restart docker
```

---

## 🚀 Production Deployment

### 1. Systemd Service (Otomatik başlatma)

```bash
# Service file oluştur
sudo nano /etc/systemd/system/wellness.service
```

```ini
[Unit]
Description=Women's Wellness App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/wellness
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Service'i aktif et
sudo systemctl enable wellness
sudo systemctl start wellness

# Status kontrol
sudo systemctl status wellness
```

### 2. Log Rotation

```bash
# Logrotate config
sudo nano /etc/logrotate.d/wellness
```

```
/var/log/wellness/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
```

### 3. Health Check Script

```bash
# Health check script
sudo nano /opt/wellness/healthcheck.sh
```

```bash
#!/bin/bash

API_URL="http://localhost:3000/health"
ADMIN_EMAIL="admin@yourdomain.com"

if ! curl -f $API_URL > /dev/null 2>&1; then
    echo "API is down!" | mail -s "Wellness App Alert" $ADMIN_EMAIL
    
    # Restart services
    cd /opt/wellness
    docker-compose -f docker-compose.prod.yml restart
fi
```

```bash
# Executable yap
sudo chmod +x /opt/wellness/healthcheck.sh

# Cron job (her 5 dakikada)
sudo crontab -e

# Ekle:
*/5 * * * * /opt/wellness/healthcheck.sh
```

---

## 💰 Maliyet Karşılaştırması

### Self-Hosted (Kendi Sunucu)
```
Sunucu (4GB RAM):  $5-20/ay (Hetzner, DigitalOcean)
Domain:            $10/yıl
SSL:               $0 (Let's Encrypt)
AI (Ollama):       $0 (self-hosted)
Email (Postfix):   $0 (self-hosted)
Monitoring:        $0 (self-hosted)
─────────────────────────────────────
Total:             $5-20/ay
```

### Cloud Services (Önceki Rehber)
```
Railway:           $20/ay
Supabase:          $25/ay
Upstash:           $10/ay
Gemini API:        $20/ay
SendGrid:          $15/ay
─────────────────────────────────────
Total:             $90/ay
```

**Tasarruf:** ~$70-85/ay

---

## 🆘 Troubleshooting

### Container çalışmıyor

```bash
# Logları kontrol et
docker-compose -f docker-compose.prod.yml logs api

# Container'ı restart et
docker-compose -f docker-compose.prod.yml restart api

# Tüm servisleri restart et
docker-compose -f docker-compose.prod.yml restart
```

### Database bağlantı hatası

```bash
# PostgreSQL logları
docker-compose -f docker-compose.prod.yml logs postgres

# Database'e bağlan
docker exec -it wellness-postgres psql -U wellness wellness_db

# Connection test
docker exec wellness-postgres pg_isready -U wellness
```

### Disk dolu

```bash
# Docker temizliği
docker system prune -a --volumes

# Log temizliği
sudo journalctl --vacuum-time=7d

# Eski backup'ları sil
find /var/backups/wellness -mtime +30 -delete
```

### SSL certificate hatası

```bash
# Certificate yenile
sudo certbot renew --force-renewal

# Nginx restart
sudo systemctl restart nginx
```

---

## 📚 Kaynaklar

### Sunucu Sağlayıcıları (Ucuz)
- **Hetzner** - €4.51/ay (2 vCPU, 4GB RAM) - Almanya
- **DigitalOcean** - $6/ay (1 vCPU, 1GB RAM)
- **Vultr** - $6/ay (1 vCPU, 1GB RAM)
- **Contabo** - €5/ay (4 vCPU, 8GB RAM) - Almanya

### Dokümantasyon
- [Docker Docs](https://docs.docker.com)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org)
- [Ollama Docs](https://ollama.ai/docs)

---

## ✅ Checklist

### Kurulum
- [ ] Sunucu hazır (4GB+ RAM)
- [ ] Docker kurulu
- [ ] Proje klonlandı
- [ ] .env dosyası yapılandırıldı
- [ ] JWT secrets oluşturuldu
- [ ] AI provider seçildi
- [ ] Docker Compose başlatıldı
- [ ] Migration'lar çalıştırıldı
- [ ] Health check başarılı

### Domain & SSL
- [ ] Domain DNS ayarlandı
- [ ] Nginx kurulu ve yapılandırıldı
- [ ] SSL certificate alındı
- [ ] HTTPS çalışıyor

### Güvenlik
- [ ] Firewall (UFW) aktif
- [ ] Fail2Ban kurulu
- [ ] Strong passwords kullanıldı
- [ ] Backup stratejisi kuruldu

### Production
- [ ] Systemd service aktif
- [ ] Log rotation yapılandırıldı
- [ ] Health check script çalışıyor
- [ ] Monitoring kuruldu (opsiyonel)

---

**Hazırsın! 🏠**

Kendi sunucunda tamamen self-hosted olarak çalışıyor. Hiçbir üçüncü parti servise bağımlı değilsin!

**Sorular için:** Bu rehberi takip et veya GitHub Issues'da sor.
