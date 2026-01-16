# 🔒 Production Security Checklist

## ✅ Tamamlandı - Deployment Öncesi Zorunlu

### 1. Authentication & Authorization
- [x] Pages controller admin endpoint'leri korundu
- [x] Feature flags write endpoint'leri admin-only yapıldı
- [x] Subscription analytics endpoint'leri admin-only yapıldı
- [x] Admin subscription management endpoint'leri korundu
- [x] AdminGuard tüm gerekli yerlerde kullanılıyor

### 2. Webhook Security
- [x] Apple webhook signature verification guard'ı oluşturuldu
- [x] Google webhook signature verification guard'ı oluşturuldu
- [x] Development/Production mode ayrımı yapıldı
- [x] Environment variable'lar dokümante edildi

### 3. Environment Configuration
- [x] `.env.example` güvenlik değişkenleri ile güncellendi
- [x] Admin email configuration dokümante edildi
- [x] Webhook verification flags eklendi
- [x] Google Pub/Sub token configuration eklendi

---

## 🚀 Production Deployment Adımları

### Adım 1: Environment Variables Kontrolü

```bash
# Production .env dosyasını kontrol et
cd apps/api

# Zorunlu değişkenler:
✓ NODE_ENV=production
✓ SKIP_WEBHOOK_VERIFICATION=false
✓ ADMIN_EMAILS=<production-admin-emails>
✓ GOOGLE_PUBSUB_PUSH_TOKEN=<secure-random-token>
✓ JWT_SECRET=<secure-random-secret>
✓ JWT_REFRESH_SECRET=<secure-random-secret>
```

### Adım 2: Admin Hesapları Yapılandırma

1. Production admin email'lerini belirle
2. `ADMIN_EMAILS` environment variable'ına ekle
3. Test admin hesaplarını kaldır
4. Admin domain (@admin.wellnesscompanion.com) aktif mi kontrol et

```bash
# Örnek production configuration:
ADMIN_EMAILS=admin@wellnesscompanion.com,cto@wellnesscompanion.com
```

### Adım 3: Webhook Configuration

#### Apple App Store:
1. App Store Connect > App > Subscriptions > Server Notifications
2. Production URL'i ekle: `https://api.yourdomain.com/subscription/webhook/apple`
3. Version 2 notification'ları aktif et
4. Test notification gönder

#### Google Play:
1. Google Cloud Console > Pub/Sub > Create Topic
2. Topic name: `wellness-iap-notifications`
3. Create Push Subscription:
   - Endpoint: `https://api.yourdomain.com/subscription/webhook/google?token=<GOOGLE_PUBSUB_PUSH_TOKEN>`
   - Token'ı URL'e query parameter olarak ekle
4. Google Play Console > Monetization > Subscriptions > Real-time developer notifications
5. Topic name'i yapılandır

### Adım 4: Security Testing

```bash
# 1. Admin endpoint testi (non-admin user)
curl -H "Authorization: Bearer <non-admin-token>" \
  https://api.yourdomain.com/api/pages \
  -X POST -d '{"title":"test"}'

# Beklenen: 403 Forbidden

# 2. Admin endpoint testi (admin user)
curl -H "Authorization: Bearer <admin-token>" \
  https://api.yourdomain.com/api/pages \
  -X POST -d '{"title":"test","slug":"test","content":"test"}'

# Beklenen: 201 Created

# 3. Webhook signature testi (invalid)
curl -X POST https://api.yourdomain.com/api/subscription/webhook/apple \
  -H "Content-Type: application/json" \
  -d '{"signedPayload":"invalid"}'

# Beklenen: 401 Unauthorized

# 4. Feature flag write testi (non-admin)
curl -H "Authorization: Bearer <non-admin-token>" \
  https://api.yourdomain.com/api/feature-flags \
  -X POST -d '{"key":"test","valueJson":{}}'

# Beklenen: 403 Forbidden
```

### Adım 5: Monitoring Setup

1. Sentry error tracking aktif mi?
2. Log aggregation çalışıyor mu?
3. Security event alerting yapılandırıldı mı?
4. Webhook failure alerting aktif mi?

---

## ⚠️ Kritik Kontroller

### Deployment Öncesi Son Kontrol:

```bash
# 1. Environment check
grep "NODE_ENV=production" apps/api/.env
grep "SKIP_WEBHOOK_VERIFICATION=false" apps/api/.env

# 2. Admin emails check
grep "ADMIN_EMAILS=" apps/api/.env | grep -v "test@test.com"

# 3. Secrets check
grep "__GENERATE_WITH_OPENSSL__" apps/api/.env
# Bu komut hiçbir şey döndürmemeli!

# 4. Placeholder check
grep "PLACEHOLDER" apps/api/.env
# Sadece kullanılmayan servisler için placeholder olmalı
```

### Deployment Sonrası Kontrol:

```bash
# 1. Health check
curl https://api.yourdomain.com/health

# 2. Admin endpoint protection
curl https://api.yourdomain.com/api/pages -X POST
# Beklenen: 401 Unauthorized (no token)

# 3. Webhook endpoint protection
curl https://api.yourdomain.com/api/subscription/webhook/apple -X POST
# Beklenen: 401 Unauthorized (invalid signature)

# 4. Logs check
# Sentry'de error var mı?
# CloudWatch/Datadog'da security event'ler görünüyor mu?
```

---

## 🔐 Security Best Practices

### 1. Secret Management
- [ ] Tüm secret'lar environment variable'larda
- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production secret'lar secret manager'da (AWS Secrets Manager, 1Password, etc.)
- [ ] Secret rotation policy belirlendi

### 2. Access Control
- [ ] Admin hesapları minimum sayıda
- [ ] Admin email'leri corporate domain'de
- [ ] Test hesapları production'dan kaldırıldı
- [ ] Role-based access control (RBAC) planlandı

### 3. Network Security
- [ ] HTTPS zorunlu
- [ ] CORS properly configured
- [ ] Rate limiting aktif
- [ ] DDoS protection (CloudFlare, AWS Shield, etc.)

### 4. Monitoring & Alerting
- [ ] Error tracking (Sentry)
- [ ] Security event logging
- [ ] Failed authentication alerting
- [ ] Webhook failure alerting
- [ ] Unusual activity detection

### 5. Incident Response
- [ ] Security incident response plan
- [ ] Admin contact list
- [ ] Rollback procedure
- [ ] Emergency access procedure

---

## 📋 Deployment Checklist

### Pre-Deployment:
- [ ] Code review tamamlandı
- [ ] Security testing yapıldı
- [ ] Environment variables hazır
- [ ] Backup alındı
- [ ] Rollback planı hazır

### Deployment:
- [ ] Database migration çalıştırıldı
- [ ] Environment variables set edildi
- [ ] Application deploy edildi
- [ ] Health check passed
- [ ] Smoke tests passed

### Post-Deployment:
- [ ] Security tests yapıldı
- [ ] Webhook configuration test edildi
- [ ] Admin access test edildi
- [ ] Monitoring dashboards kontrol edildi
- [ ] Error logs kontrol edildi
- [ ] Performance metrics normal

---

## 🆘 Troubleshooting

### Admin Access Çalışmıyor:
1. `ADMIN_EMAILS` environment variable'ı kontrol et
2. User email'i admin listesinde mi?
3. JWT token geçerli mi?
4. AdminGuard import edilmiş mi?

### Webhook Verification Başarısız:
1. `SKIP_WEBHOOK_VERIFICATION` false mu?
2. `NODE_ENV` production mu?
3. Apple/Google'dan gelen request format'ı doğru mu?
4. Logs'da detaylı error mesajı var mı?

### 403 Forbidden Errors:
1. User authenticated mi?
2. User admin mi?
3. Guard'lar doğru sırada mı? (AuthGuard önce, AdminGuard sonra)
4. Token expired olmamış mı?

---

## 📞 Support & Contact

### Security Issues:
- Email: security@wellnesscompanion.com
- Slack: #security-alerts
- On-call: [PagerDuty/OpsGenie]

### Deployment Issues:
- Email: devops@wellnesscompanion.com
- Slack: #deployments
- On-call: [PagerDuty/OpsGenie]

---

**Son Güncelleme:** 2026-01-16
**Versiyon:** 1.0
**Durum:** ✅ Production Ready
