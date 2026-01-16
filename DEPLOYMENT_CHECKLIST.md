# 🚀 Production Deployment Checklist

Comprehensive checklist for deploying Women's Wellness App to production.

## 📋 Pre-Deployment

### Environment Setup
- [ ] Run `./scripts/setup-production-env.sh` or manually configure all env vars
- [ ] Validate environment: `./scripts/validate-production-env.sh`
- [ ] All critical variables set (JWT, Database, Redis, AI API)
- [ ] All secrets are secure (not default/placeholder values)
- [ ] SSL/TLS enabled for Database and Redis
- [ ] CORS origins updated to production domains
- [ ] Admin emails updated (no test emails)

### Infrastructure
- [ ] PostgreSQL database provisioned
- [ ] Database backups configured
- [ ] Redis instance provisioned
- [ ] File storage configured (S3/MinIO)
- [ ] Email service configured (SendGrid/SES)
- [ ] Domain names registered
- [ ] DNS records configured
- [ ] SSL certificates obtained (Let's Encrypt)

### Security
- [ ] JWT secrets generated with `openssl rand -hex 32`
- [ ] Webhook verification enabled (`SKIP_WEBHOOK_VERIFICATION=false`)
- [ ] Cookie secure flag enabled (`COOKIE_SECURE=true`)
- [ ] Rate limiting configured
- [ ] Security headers enabled (Helmet.js)
- [ ] Input validation active
- [ ] SQL injection protection verified
- [ ] XSS protection verified

### Database
- [ ] Migrations tested locally
- [ ] Migrations run on production DB
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Backup strategy tested
- [ ] Restore procedure documented

### Monitoring
- [ ] Sentry configured for error tracking
- [ ] PostHog configured for analytics
- [ ] Alert rules configured
- [ ] Slack/Email notifications set up
- [ ] Health check endpoint working
- [ ] Uptime monitoring configured (optional)

---

## 🔐 Authentication & OAuth

### Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] iOS client ID created
- [ ] Android client ID created
- [ ] Web client ID created
- [ ] Redirect URIs registered
- [ ] Client IDs added to .env files
- [ ] OAuth flow tested

### JWT
- [ ] JWT_SECRET is secure (32+ chars)
- [ ] JWT_REFRESH_SECRET is secure (32+ chars)
- [ ] Token TTL configured appropriately
- [ ] Token refresh flow tested

---

## 📱 Mobile App

### Expo Configuration
- [ ] Expo account created
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Logged in to Expo (`eas login`)
- [ ] Project configured (`eas build:configure`)
- [ ] Access token generated
- [ ] Access token added to API .env

### iOS Setup
- [ ] Apple Developer account ($99/year)
- [ ] Bundle ID registered
- [ ] App ID created
- [ ] Provisioning profiles created
- [ ] Push notification certificates configured
- [ ] App Store Connect app created
- [ ] App Store screenshots prepared (6.7", 6.5", 5.5")
- [ ] App Store description written (Turkish + English)
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] App Review information filled

### Android Setup
- [ ] Google Play Console account ($25 one-time)
- [ ] Package name registered
- [ ] Signing key generated
- [ ] App created in Play Console
- [ ] Play Store screenshots prepared
- [ ] Play Store description written (Turkish + English)
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] Content rating completed

### Build & Submit
- [ ] iOS production build: `eas build --platform ios --profile production`
- [ ] Android production build: `eas build --platform android --profile production`
- [ ] iOS TestFlight beta test completed
- [ ] Android internal testing completed
- [ ] iOS submitted: `eas submit --platform ios`
- [ ] Android submitted: `eas submit --platform android`

---

## 💳 In-App Purchase

### Apple IAP
- [ ] Subscriptions created in App Store Connect
- [ ] Pricing configured
- [ ] Shared secret generated
- [ ] Shared secret added to .env
- [ ] Sandbox testing completed
- [ ] Production testing plan ready

### Google IAP
- [ ] Subscriptions created in Play Console
- [ ] Pricing configured
- [ ] Service account created
- [ ] Service account JSON downloaded
- [ ] Service account JSON added to .env
- [ ] Pub/Sub topic created
- [ ] Pub/Sub push subscription configured
- [ ] Push token added to .env
- [ ] Sandbox testing completed

---

## 📧 Email & Notifications

### Email Service
- [ ] SMTP credentials configured
- [ ] From email verified
- [ ] SPF record added to DNS
- [ ] DKIM configured
- [ ] DMARC configured
- [ ] Test email sent successfully
- [ ] Password reset email tested
- [ ] Welcome email tested (if applicable)

### Push Notifications
- [ ] Expo push token configured
- [ ] iOS push certificates configured
- [ ] Android FCM configured
- [ ] Test notification sent
- [ ] Notification permissions flow tested
- [ ] Deep linking tested

---

## 📄 Legal & Compliance

### Required Documents
- [ ] Privacy Policy created (Turkish + English)
- [ ] Terms of Service created (Turkish + English)
- [ ] KVKK Aydınlatma Metni created
- [ ] Cookie Policy created (for web admin)
- [ ] Documents hosted on public URLs
- [ ] URLs added to app stores
- [ ] URLs added to app settings

### KVKK Compliance
- [ ] Data controller information added
- [ ] Data processing purposes documented
- [ ] User rights (Article 11) documented
- [ ] Consent flows implemented
- [ ] Data retention policy defined
- [ ] Data deletion procedure implemented

### Consent Flows
- [ ] KVKK consent on first launch
- [ ] Push notification permission request
- [ ] Location permission request (if used)
- [ ] Analytics consent (optional)
- [ ] Consent storage implemented
- [ ] Consent withdrawal option available

---

## 🧪 Testing

### API Testing
- [ ] Health check endpoint: `GET /health`
- [ ] Authentication flow tested
- [ ] Google OAuth tested
- [ ] AI chat tested
- [ ] Period tracking tested
- [ ] Push notifications tested
- [ ] IAP webhook tested
- [ ] File upload tested
- [ ] Rate limiting tested

### Mobile Testing
- [ ] Login flow tested
- [ ] Registration flow tested
- [ ] Google OAuth tested
- [ ] AI chat tested
- [ ] Period calendar tested
- [ ] Reminders tested
- [ ] Push notifications tested
- [ ] IAP flow tested
- [ ] Offline mode tested
- [ ] Deep linking tested

### Admin Panel Testing
- [ ] Login tested
- [ ] User management tested
- [ ] Content management tested
- [ ] Feature flags tested
- [ ] Analytics dashboard tested
- [ ] Audit logs tested

### Load Testing (Optional)
- [ ] API load test completed
- [ ] Database performance tested
- [ ] Redis performance tested
- [ ] Concurrent users tested

---

## 🚀 Deployment

### API Deployment
- [ ] Docker image built
- [ ] Image pushed to registry
- [ ] Environment variables configured on host
- [ ] Database migrations run
- [ ] Health check passing
- [ ] Logs accessible
- [ ] Monitoring active

### Admin Panel Deployment
- [ ] Next.js app built
- [ ] Static files deployed
- [ ] Environment variables configured
- [ ] API connection tested
- [ ] Authentication working

### Database
- [ ] Final backup taken
- [ ] Connection string updated
- [ ] Migrations applied
- [ ] Indexes verified
- [ ] Performance baseline recorded

### DNS & SSL
- [ ] A records configured
- [ ] CNAME records configured (if needed)
- [ ] SSL certificates installed
- [ ] HTTPS redirect enabled
- [ ] Certificate auto-renewal configured

---

## ✅ Post-Deployment

### Smoke Tests
- [ ] API health check: `curl https://api.yourdomain.com/health`
- [ ] Admin panel accessible
- [ ] Mobile app connects to API
- [ ] User registration works
- [ ] Login works
- [ ] AI chat works
- [ ] Push notification sent
- [ ] Error tracking receiving events
- [ ] Analytics receiving events

### Monitoring Setup
- [ ] Sentry receiving errors
- [ ] PostHog receiving events
- [ ] Alert rules triggered correctly
- [ ] Notification channels working
- [ ] Dashboard accessible

### Documentation
- [ ] API documentation updated
- [ ] Admin guide created
- [ ] User guide created (optional)
- [ ] Troubleshooting guide created
- [ ] Runbook created for on-call

### Backup & Recovery
- [ ] Database backup verified
- [ ] Backup restoration tested
- [ ] Recovery time objective (RTO) documented
- [ ] Recovery point objective (RPO) documented

---

## 📊 Launch

### Soft Launch
- [ ] Internal team testing (1-2 days)
- [ ] Beta testers invited (1 week)
- [ ] Feedback collected
- [ ] Critical bugs fixed
- [ ] Performance optimized

### Public Launch
- [ ] App Store review approved
- [ ] Play Store review approved
- [ ] Apps published
- [ ] Landing page live
- [ ] Social media announcement
- [ ] Press release (optional)
- [ ] Blog post (optional)

### Post-Launch Monitoring
- [ ] Monitor error rates (first 24h)
- [ ] Monitor API response times
- [ ] Monitor user registrations
- [ ] Monitor crash rates
- [ ] Monitor IAP conversions
- [ ] Collect user feedback

---

## 🔧 Maintenance

### Daily
- [ ] Check error tracking dashboard
- [ ] Review critical alerts
- [ ] Monitor API health
- [ ] Check database performance

### Weekly
- [ ] Review analytics
- [ ] Check user feedback
- [ ] Review security logs
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Database backup verification
- [ ] Security audit
- [ ] Performance review
- [ ] Cost optimization review
- [ ] User retention analysis

---

## 🆘 Rollback Plan

### If Critical Issues Occur
1. **Immediate Actions**
   - [ ] Notify team
   - [ ] Assess severity
   - [ ] Check monitoring dashboards

2. **Rollback Steps**
   - [ ] Revert to previous Docker image
   - [ ] Rollback database migrations (if needed)
   - [ ] Update DNS (if needed)
   - [ ] Clear CDN cache (if applicable)

3. **Communication**
   - [ ] Notify users (if needed)
   - [ ] Update status page
   - [ ] Post-mortem document

---

## 📞 Emergency Contacts

```
On-Call Engineer: [phone]
DevOps Lead: [phone]
Database Admin: [phone]
Security Team: [email]

Hosting Provider Support: [link]
DNS Provider Support: [link]
Email Service Support: [link]
```

---

## 🎯 Success Metrics

### Technical Metrics
- API uptime: > 99.9%
- API response time (p95): < 200ms
- Error rate: < 0.1%
- Crash-free rate: > 99.5%

### Business Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention rate (Day 1, Day 7, Day 30)
- Conversion rate (Free → Premium)
- AI chat engagement
- Push notification engagement

---

## 📚 Resources

### Documentation
- [PRODUCTION_ENV_GUIDE.md](./PRODUCTION_ENV_GUIDE.md) - Environment setup
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker guide
- [DEVOPS_COMPLETE.md](./DEVOPS_COMPLETE.md) - DevOps features
- [README.md](./README.md) - Project overview

### External Links
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)
- [Sentry Documentation](https://docs.sentry.io)
- [PostHog Documentation](https://posthog.com/docs)

---

## ✅ Final Checklist

Before going live, ensure:

- [ ] All environment variables validated
- [ ] All tests passing
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Legal documents published
- [ ] App stores approved
- [ ] Team trained
- [ ] Rollback plan ready
- [ ] Emergency contacts updated
- [ ] Success metrics defined

---

**Ready to launch? 🚀**

Run final validation:
```bash
./scripts/validate-production-env.sh
```

If all checks pass, you're good to go!
