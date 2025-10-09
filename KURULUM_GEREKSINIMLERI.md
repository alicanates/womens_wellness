# Women's Wellness Companion - Kurulum Gereksinimleri

Bu doküman, Women's Wellness Companion projesinin **tamamen yeni bir M3 çipli Mac bilgisayarda** geliştirilmesi, test edilmesi ve çalıştırılması için gerekli tüm yazılım ve araçları listeler.

Son güncelleme: 9 Ekim 2025
Proje versiyonu: 1.0.0

---

## 📋 İçindekiler

1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Geliştirme Araçları](#geliştirme-araçları)
3. [Runtime Bağımlılıkları](#runtime-bağımlılıkları)
4. [Mobil Geliştirme Araçları](#mobil-geliştirme-araçları)
5. [Opsiyonel Araçlar](#opsiyonel-araçlar)
6. [Kurulum Sırası](#kurulum-sırası)
7. [Doğrulama](#doğrulama)
8. [Mevcut Çalışan Sürümler](#mevcut-çalışan-sürümler)
9. [Sürüm Yönetimi ve Çakışma Çözümleri](#sürüm-yönetimi-ve-çakışma-çözümleri) ⭐ **YENİ**
10. [Sorun Giderme](#sorun-giderme)
11. [Hızlı Referans Kartı](#hızlı-referans-kartı) ⭐ **YENİ**

---

## 🖥️ Sistem Gereksinimleri

### Donanım
- **İşlemci**: Apple Silicon (M1/M2/M3/M4) veya Intel
- **RAM**: Minimum 8GB (16GB+ önerilir)
- **Disk Alanı**: Minimum 20GB boş alan

### İşletim Sistemi
- **macOS**: 13.0 (Ventura) veya üzeri
- **Önerilen**: macOS 14.0+ (Sonoma) veya macOS 15.0+ (Sequoia)

---

## 🛠️ Geliştirme Araçları

### 1. Homebrew (Paket Yöneticisi)
**Versiyon**: 4.6.16+
**Açıklama**: macOS paket yöneticisi - diğer tüm araçları kurmak için gerekli

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Git (Versiyon Kontrolü)
**Versiyon**: 2.50.1+
**Mevcut**: Apple Git-155 (macOS ile gelir)

```bash
git --version
```

### 3. Xcode Command Line Tools
**Versiyon**: 2412+
**Açıklama**: iOS simülatör ve native modül derleme için gerekli

```bash
xcode-select --install
```

Kurulu olduğunu doğrulamak için:
```bash
xcode-select --version
```

### 4. Node.js
**Versiyon**: 20.19.5+ (20.x LTS)
**Açıklama**: JavaScript runtime - API ve build süreçleri için gerekli

```bash
brew install node@20
```

**Önemli**: Node 20.x sürümü gereklidir (package.json'da belirtilmiştir).

### 5. pnpm (Paket Yöneticisi)
**Versiyon**: 10.14.0 (package.json'da sabitlenmiştir)
**Açıklama**: Hızlı ve disk alanı tasarruflu paket yöneticisi - monorepo için gerekli

```bash
brew install pnpm
```

Veya npm ile:
```bash
npm install -g pnpm@10.14.0
```

### 6. Watchman
**Versiyon**: 2025.09.15.00+
**Açıklama**: Dosya değişikliklerini izlemek için (React Native/Expo geliştirme için gerekli)

```bash
brew install watchman
```

---

## 💾 Runtime Bağımlılıkları

### 1. PostgreSQL
**Versiyon**: 16.10+ (PostgreSQL 16.x)
**Açıklama**: Ana veritabanı - kullanıcı verileri, konuşmalar, sağlık metrikleri için

```bash
brew install postgresql@16
```

**Başlatma**:
```bash
brew services start postgresql@16
```

**Veritabanı oluşturma**:
```bash
createdb wellness
```

**Bağlantı bilgileri** (varsayılan):
- Host: `localhost`
- Port: `5432`
- Database: `wellness`
- User: Sistem kullanıcı adınız

### 2. Redis
**Versiyon**: 8.2.2+
**Açıklama**: Cache ve queue (BullMQ) için gerekli - job scheduling, rate limiting

```bash
brew install redis
```

**Başlatma**:
```bash
brew services start redis
```

**Bağlantı**:
- URL: `redis://localhost:6379`

### 3. Mailpit (Email Testing)
**Versiyon**: 1.27.9+
**Açıklama**: Geliştirme ortamında email testi için SMTP sunucusu

```bash
brew install mailpit
```

**Başlatma**:
```bash
brew services start mailpit
```

**Erişim**:
- Web UI: http://localhost:8025
- SMTP: `localhost:1025`

---

## 📱 Mobil Geliştirme Araçları

### 1. CocoaPods
**Versiyon**: 1.16.2+
**Açıklama**: iOS native bağımlılık yöneticisi

```bash
sudo gem install cocoapods
```

### 2. iOS Simulators
**Açıklama**: iOS uygulamasını test etmek için gerekli
**Gereksinim**: Xcode Command Line Tools (yukarıda kuruldu)

**Mevcut simulatörleri görüntüle**:
```bash
xcrun simctl list devices available
```

### 3. EAS CLI (Expo Application Services)
**Versiyon**: 16.20.4+
**Açıklama**: Production buildleri oluşturmak için (dev builds ve app store yayınlama)

```bash
npm install -g eas-cli
```

Veya proje içinden:
```bash
npx eas-cli
```

### 4. Expo Go (Opsiyonel)
**Platform**: iOS/Android
**Açıklama**: Hızlı test için mobil uygulama (dev builds için gerekmez)

- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🔧 Opsiyonel Araçlar

### 1. Xcode (Full IDE)
**Versiyon**: 15.0+
**Boyut**: ~15GB
**Açıklama**: iOS production builds ve App Store yayınlama için gerekli

```bash
# Mac App Store'dan indir
# veya
xcode-select --install
```

### 2. Android Studio
**Versiyon**: Latest
**Açıklama**: Android development ve emulator için

[İndirme linki](https://developer.android.com/studio)

### 3. Visual Studio Code
**Açıklama**: Önerilen kod editörü

```bash
brew install --cask visual-studio-code
```

**Önerilen Extensions**:
- Prisma
- ESLint
- Prettier
- React Native Tools
- GitLens
- Thunder Client (API testi için)

### 4. Postman / Insomnia
**Açıklama**: API endpoint testi için

```bash
brew install --cask postman
# veya
brew install --cask insomnia
```

### 5. TablePlus / Postico
**Açıklama**: PostgreSQL veritabanı GUI

```bash
brew install --cask tableplus
```

### 6. RedisInsight
**Açıklama**: Redis veritabanı GUI

```bash
brew install --cask redisinsight
```

---

## 📦 Proje Bağımlılıkları

Aşağıdaki bağımlılıklar `pnpm install` komutuyla otomatik yüklenir:

### Backend (API - NestJS)
- **Framework**: NestJS 10.3.0
- **Database ORM**: Prisma 5.22.0
- **Web Server**: Fastify 5.6.1
- **Queue**: BullMQ 5.1.1
- **AI SDKs**:
  - Vercel AI SDK 3.4.33
  - OpenAI SDK 1.0.0
  - Anthropic SDK 1.0.0
  - Google AI SDK 1.0.0
- **Authentication**: Passport, JWT
- **Validation**: Zod 3.22.4

### Frontend (Mobile - React Native/Expo)
- **Framework**: Expo SDK 52.0.47
- **React**: 18.3.1
- **React Native**: 0.76.9
- **Routing**: Expo Router 4.0.21
- **State Management**: Zustand 4.4.7
- **Data Fetching**: TanStack Query 5.17.9
- **Forms**: React Hook Form 7.64.0
- **Database**: Expo SQLite 15.1.4
- **Notifications**: Expo Notifications 0.29.0

### Admin Panel
- **Framework**: Next.js 14.0.4
- **React**: 18.2.0
- **UI Library**: Refine + Ant Design 5.12.2
- **Data Provider**: @refinedev/simple-rest

### Shared Packages
- **Monorepo Tool**: Turborepo 2.5.8
- **TypeScript**: 5.3.3

---

## 🚀 Kurulum Sırası

Aşağıdaki adımları sırasıyla takip edin:

### 1. Temel Araçları Kurun
```bash
# Homebrew (eğer yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Xcode Command Line Tools
xcode-select --install

# Temel geliştirme araçları
brew install git node@20 pnpm watchman
```

### 2. Veritabanı ve Servis Bağımlılıklarını Kurun
```bash
# PostgreSQL, Redis, Mailpit
brew install postgresql@16 redis mailpit

# Servisleri başlat
brew services start postgresql@16
brew services start redis
brew services start mailpit

# Wellness veritabanını oluştur
createdb wellness
```

### 3. Mobil Geliştirme Araçlarını Kurun
```bash
# CocoaPods (iOS için)
sudo gem install cocoapods

# EAS CLI (production builds için)
npm install -g eas-cli
```

### 4. Proje Kurulumu
```bash
# Projeyi klonla (eğer henüz yapmadıysanız)
git clone <repository-url>
cd womens_wellness

# Otomatik setup scripti (önerilir)
bash scripts/dev-setup.sh

# VEYA Manuel setup:

# Environment dosyalarını oluştur
cp apps/api/.env.example apps/api/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# JWT secrets oluştur
# apps/api/.env.local dosyasında __GENERATE_WITH_OPENSSL__
# placeholderlarını openssl rand -hex 32 çıktısıyla değiştir

# Bağımlılıkları yükle
pnpm install

# Veritabanı migrasyonları ve seed
pnpm db:prep
pnpm db:seed

# Geliştirme sunucularını başlat
pnpm dev
```

### 5. Environment Variables Yapılandırma

**Minimum Gerekli Değişkenler**:

`apps/api/.env.local`:
```env
DATABASE_URL=postgresql://localhost:5432/wellness
REDIS_URL=redis://localhost:6379
JWT_SECRET=<openssl rand -hex 32 ile oluştur>
JWT_REFRESH_SECRET=<openssl rand -hex 32 ile oluştur>

# En az bir AI provider API key'i
OPENAI_API_KEY=sk-...
# veya
ANTHROPIC_API_KEY=sk-ant-...
# veya
GOOGLE_GENERATIVE_AI_API_KEY=...
```

`apps/mobile/.env.local`:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

`apps/admin/.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## ✅ Doğrulama

Kurulumun başarılı olduğunu doğrulamak için:

### 1. Versiyon Kontrolleri
```bash
# Temel araçlar
node --version          # v20.19.5+
pnpm --version          # 10.14.0
git --version           # 2.50.1+
watchman --version      # 2025.09.15.00+

# Veritabanı servisleri
psql --version          # 16.10+
redis-cli --version     # 8.2.2+
mailpit version         # 1.27.9+

# Mobil araçlar
pod --version           # 1.16.2+
xcode-select --version  # 2412+
xcrun simctl list       # iOS simulatörler listesi
```

### 2. Servis Durumları
```bash
# Servislerin çalıştığını kontrol et
brew services list

# Şunlar "started" olmalı:
# - postgresql@16
# - redis
# - mailpit
```

### 3. Port Kontrolü
```bash
# PostgreSQL (5432)
lsof -i :5432

# Redis (6379)
lsof -i :6379

# Mailpit SMTP (1025) ve Web (8025)
lsof -i :1025
lsof -i :8025
```

### 4. Proje Build Testi
```bash
cd womens_wellness

# Environment validation
pnpm validate:env

# TypeScript build test
pnpm build

# Veritabanı bağlantısı test
cd apps/api && pnpm prisma studio
# http://localhost:5555 açılmalı
```

### 5. Geliştirme Sunucuları
```bash
# Tüm servisleri başlat
pnpm dev

# Veya ayrı ayrı:
pnpm dev:api      # http://localhost:4000
pnpm dev:mobile   # http://localhost:8081 (Expo)
pnpm dev:admin    # http://localhost:3001
```

**Beklenen Çıktılar**:
- API: `http://localhost:4000/api/docs` (Swagger UI)
- Mobile: Expo DevTools terminalde açılır
- Admin: `http://localhost:3001`

---

## 📊 Mevcut Çalışan Sürümler

Bu projede şu anda kullanılan ve test edilmiş sürümler:

| Araç | Versiyon | Kurulum Yöntemi |
|------|----------|-----------------|
| **macOS** | 15.0+ (Sequoia) | - |
| **Homebrew** | 4.6.16 | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| **Node.js** | 20.19.5 | `brew install node@20` |
| **pnpm** | 10.14.0 | `brew install pnpm` |
| **Git** | 2.50.1 (Apple Git-155) | macOS ile gelir |
| **Watchman** | 2025.09.15.00 | `brew install watchman` |
| **PostgreSQL** | 16.10 (Homebrew) | `brew install postgresql@16` |
| **Redis** | 8.2.2 | `brew install redis` |
| **Mailpit** | 1.27.9 | `brew install mailpit` |
| **CocoaPods** | 1.16.2 | `sudo gem install cocoapods` |
| **Xcode Command Line Tools** | 2412 | `xcode-select --install` |
| **EAS CLI** | 16.20.4+ | `npm install -g eas-cli` |
| **TypeScript** | 5.3.3 | `pnpm install` (proje bağımlılığı) |
| **Turbo** | 2.5.8 | `pnpm install` (proje bağımlılığı) |

### Framework Versiyonları (package.json'dan)

| Framework/Library | Versiyon | Kullanıldığı Yer |
|-------------------|----------|------------------|
| **NestJS** | 10.3.0 | API Backend |
| **Fastify** | 5.6.1 | API HTTP Server |
| **Prisma** | 5.22.0 | Database ORM |
| **Expo SDK** | 52.0.47 | Mobile Framework |
| **React** | 18.3.1 | Mobile UI |
| **React Native** | 0.76.9 | Mobile Platform |
| **Next.js** | 14.0.4 | Admin Panel |
| **Ant Design** | 5.12.2 | Admin UI |
| **Refine** | 5.37.4+ | Admin Framework |
| **TanStack Query** | 5.17.9 | Data Fetching (Mobile) |
| **Zustand** | 4.4.7 | State Management (Mobile) |
| **BullMQ** | 5.1.1 | Queue/Jobs |
| **Vercel AI SDK** | 3.4.33 | AI Integration |

---

## 🔐 API Keys ve Secrets

Aşağıdaki API key'leri edinmeniz gerekir:

### Gerekli (En az biri)
- **OpenAI API Key**: https://platform.openai.com/api-keys
- **Anthropic API Key**: https://console.anthropic.com/
- **Google Generative AI Key**: https://makersuite.google.com/app/apikey

### Google OAuth (Opsiyonel, Google Sign-In için)
- Google Cloud Console'dan OAuth 2.0 Client IDs:
  - iOS Client ID
  - Android Client ID
  - Web Client ID
- Redirect URIs: `wellness:/oauthredirect` (mobile)

### Expo Push Notifications (Opsiyonel)
- **Expo Access Token**: https://expo.dev/accounts/[account]/settings/access-tokens

### Observability (Opsiyonel)
- **Sentry DSN**: https://sentry.io/
- **PostHog API Key**: https://posthog.com/

---

## 🧪 Testing Araçları (Opsiyonel)

### Jest (Dahili)
```bash
pnpm test           # Tüm testler
pnpm test:watch     # Watch mode
pnpm test:cov       # Coverage report
```

### E2E Testing (Detox)
```bash
# Kurulum
bash scripts/dev-setup.sh --with-detox

# Test çalıştırma
pnpm test:e2e
```

---

## 📚 Ek Kaynaklar

### Dokümantasyon
- [Expo Docs](https://docs.expo.dev/)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Refine Docs](https://refine.dev/docs/)
- [Turbo Docs](https://turbo.build/repo/docs)

### Proje İçi Dökümanlar
- `CLAUDE.md`: Proje build spec ve mimarisi
- `apps/api/README.md`: API dokümantasyonu
- `apps/mobile/README.md`: Mobile app dökümanı
- `scripts/dev-setup.sh`: Otomatik kurulum scripti

---

## 🔄 Sürüm Yönetimi ve Çakışma Çözümleri

Bu bölüm, bilgisayarınızda zaten kurulu olan araçların farklı sürümlerinin olması durumunda nasıl hareket edeceğinizi açıklar.

### Node.js Sürüm Yönetimi

**Durum**: Node 18, 19 veya 21+ kurulu, ama projeye Node 20 gerekiyor.

**Çözüm 1: Homebrew ile sürüm değiştirme**
```bash
# Mevcut Node versiyonunu kontrol et
node --version

# Node 20'yi kur
brew install node@20

# Yeni kurduğunuz Node'u önceliklendir
brew unlink node
brew link --force --overwrite node@20

# PATH'e ekle (gerekiyorsa)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Doğrula
node --version  # v20.19.5+ olmalı
```

**Çözüm 2: nvm (Node Version Manager) kullanımı (Önerilen)**
```bash
# nvm kur
brew install nvm

# Shell config'e ekle
mkdir ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# Node 20 kur ve kullan
nvm install 20
nvm use 20
nvm alias default 20

# Proje klasöründe .nvmrc oluştur
echo "20" > .nvmrc

# Doğrula
node --version  # v20.x.x olmalı
```

**Çözüm 3: Proje bazlı nvm otomatiği**
Proje klasörüne her girdiğinizde otomatik sürüm değişimi:
```bash
# ~/.zshrc dosyasına ekle
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

### PostgreSQL Sürüm Yönetimi

**Durum**: PostgreSQL 14, 15 veya 17+ kurulu, ama projeye PostgreSQL 16 gerekiyor.

**Senaryo 1: Eski sürüm kurulu (14 veya 15)**
```bash
# Mevcut versiyonu kontrol et
psql --version

# PostgreSQL 16 kur
brew install postgresql@16

# Eski servisi durdur (örnek: postgresql@15)
brew services stop postgresql@15

# PostgreSQL 16'yı başlat
brew services start postgresql@16

# PATH'i güncelle (16'yı önceliklendir)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Doğrula
psql --version  # PostgreSQL 16.x olmalı

# Eski veritabanını migrate et (gerekiyorsa)
# 1. Eski versiyondan backup al
pg_dump -U $USER wellness > wellness_backup.sql

# 2. Yeni versiyonda veritabanını oluştur
createdb wellness

# 3. Backup'ı restore et
psql -U $USER wellness < wellness_backup.sql
```

**Senaryo 2: Yeni sürüm kurulu (17+)**
```bash
# PostgreSQL 17 genellikle 16 ile uyumludur, ancak sorun yaşarsanız:

# Option 1: Her iki versiyonu da tut (farklı portlarda)
brew services stop postgresql@17
brew services start postgresql@16

# Option 2: 17'yi kullanmaya devam et (riskli değil ama test edilmemiş)
# .env.local dosyasında DATABASE_URL'i kontrol edin

# Bağlantı testi
psql -U $USER -d wellness -c "SELECT version();"
```

**Her iki versiyonu da çalıştırma (Development vs Production gibi)**
```bash
# PostgreSQL 16'yı port 5432'de çalıştır (varsayılan)
brew services start postgresql@16

# PostgreSQL 15'i port 5433'te çalıştır
echo "port = 5433" >> /opt/homebrew/var/postgresql@15/postgresql.conf
brew services start postgresql@15

# .env.local'de ilgili portu kullan
# DATABASE_URL=postgresql://localhost:5432/wellness (pg16)
# DATABASE_URL=postgresql://localhost:5433/wellness_old (pg15)
```

### pnpm Sürüm Yönetimi

**Durum**: pnpm farklı bir sürüm kurulu (örneğin 9.x veya 11.x), ama projeye 10.14.0 gerekiyor.

```bash
# Mevcut versiyonu kontrol et
pnpm --version

# Homebrew ile güncelleme/downgrade (otomatik)
brew uninstall pnpm
brew install pnpm

# Eğer hala yanlış versiyonsa, npm ile spesifik versiyon kur
npm uninstall -g pnpm
npm install -g pnpm@10.14.0

# Corepack kullanımı (Node 16.13+ ile gelir - önerilen)
corepack enable
corepack prepare pnpm@10.14.0 --activate

# Proje bazlı pnpm versiyonu (packageManager field)
# package.json'da zaten belirtilmiş:
# "packageManager": "pnpm@10.14.0"

# Doğrula
pnpm --version  # 10.14.0 olmalı
```

### Redis Sürüm Yönetimi

**Durum**: Redis 6.x veya 7.x kurulu, ama projeye 8.x+ önerilir.

```bash
# Mevcut versiyonu kontrol et
redis-cli --version

# Güncelleme
brew upgrade redis

# Servisi yeniden başlat
brew services restart redis

# Redis 6.x veya 7.x genellikle sorun çıkarmaz, ancak yeni özellikler için 8.x önerilir
# Proje Redis 6+ ile çalışır, 8.x sadece performance iyileştirmeleri için
```

### CocoaPods Sürüm Yönetimi

**Durum**: Eski veya yeni CocoaPods versiyonu kurulu.

```bash
# Mevcut versiyonu kontrol et
pod --version

# Güncelleme
sudo gem update cocoapods

# Spesifik versiyon kurulumu (gerekiyorsa)
sudo gem uninstall cocoapods
sudo gem install cocoapods -v 1.16.2

# CocoaPods cache temizliği (sorun yaşarsanız)
pod cache clean --all
pod repo update

# Proje Pods'larını yeniden yükle
cd apps/mobile/ios
rm -rf Pods Podfile.lock
pod install
```

### Xcode Command Line Tools Güncellemesi

**Durum**: Eski Xcode Command Line Tools versiyonu.

```bash
# Mevcut versiyonu kontrol et
xcode-select --version
pkgutil --pkg-info=com.apple.pkg.CLTools_Executables

# Güncelleme
sudo rm -rf /Library/Developer/CommandLineTools
xcode-select --install

# Xcode yolu doğrulama
sudo xcode-select --switch /Library/Developer/CommandLineTools

# macOS update'i kontrol et (genellikle otomatik güncellenir)
softwareupdate --list
```

### Çoklu Proje Sürüm Yönetimi

**Durum**: Farklı projeler farklı versiyonlar gerektiriyor.

**Node.js için nvm (Önerilen)**
```bash
# Her proje için .nvmrc dosyası oluştur
cd ~/projects/womens_wellness
echo "20" > .nvmrc

cd ~/projects/other-project
echo "18" > .nvmrc

# Proje klasörüne girince otomatik değişim (yukarıdaki shell hook ile)
cd ~/projects/womens_wellness
# Automatically using Node v20.x.x

cd ~/projects/other-project
# Automatically using Node v18.x.x
```

**PostgreSQL için multiple instances**
```bash
# Homebrew ile birden fazla PostgreSQL kurulumu
brew install postgresql@14 postgresql@15 postgresql@16

# Her versiyonu farklı portlarda çalıştır
# PG14: port 5434
echo "port = 5434" >> /opt/homebrew/var/postgresql@14/postgresql.conf
brew services start postgresql@14

# PG15: port 5433
echo "port = 5433" >> /opt/homebrew/var/postgresql@15/postgresql.conf
brew services start postgresql@15

# PG16: port 5432 (default)
brew services start postgresql@16

# Her projede ilgili portu kullan
# womens_wellness/.env.local
DATABASE_URL=postgresql://localhost:5432/wellness

# other-project/.env
DATABASE_URL=postgresql://localhost:5433/other_db
```

### Homebrew Kendi Kendini Güncelleme

**Durum**: Homebrew otomatik güncellendi ve yeni paket versiyonları kurdu.

```bash
# Homebrew versiyonunu kontrol et
brew --version

# Tüm kurulu paketleri listele
brew list --versions

# Spesifik bir paketi eski versiyona döndür
brew unlink node
brew install node@20
brew link --force node@20

# Homebrew otomatik güncellemeyi geçici kapatma
export HOMEBREW_NO_AUTO_UPDATE=1

# Kalıcı olarak kapatma (.zshrc'ye ekle)
echo 'export HOMEBREW_NO_AUTO_UPDATE=1' >> ~/.zshrc
```

### M1/M2/M3 (Apple Silicon) vs Intel Uyumluluk

**Durum**: Intel Mac'ten M3 Mac'e geçiş veya Rosetta sorunları.

```bash
# Homebrew ARM64 (Apple Silicon) mi Intel (x86_64) mi kontrol et
which brew
# /opt/homebrew/bin/brew (ARM64)
# /usr/local/bin/brew (Intel/Rosetta)

# Rosetta ile Intel paketlerini çalıştırma (gerekiyorsa)
softwareupdate --install-rosetta

# Intel Homebrew kur (çok nadiren gerekir)
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ARM64 (önerilen) ve Intel Homebrew aynı anda
/opt/homebrew/bin/brew install <package>  # ARM64
/usr/local/bin/brew install <package>     # Intel

# Node/npm paketlerinin native rebuild'i (Apple Silicon için)
cd womens_wellness
rm -rf node_modules pnpm-lock.yaml
pnpm install

# CocoaPods için (Apple Silicon)
cd apps/mobile/ios
pod install --repo-update

# Eğer hala sorun varsa:
sudo arch -x86_64 gem install ffi
arch -x86_64 pod install
```

### Global vs Local Paket Çakışmaları

**Durum**: Global kurulu paketler ile proje local paketleri çakışıyor.

```bash
# Global pnpm paketlerini listele
pnpm list -g

# Problematic global paketleri kaldır
pnpm uninstall -g typescript eslint prettier

# npx kullanarak proje local paketleri çalıştır
npx tsc --version  # Proje içindeki TypeScript
pnpm exec tsc --version  # Aynı şey, pnpm ile

# Proje scriptlerini her zaman pnpm ile çalıştır
pnpm dev  # package.json scriptlerini çalıştırır
```

### Sürüm Kontrol Komut Özeti

```bash
# Tüm önemli versiyonları kontrol et
echo "=== Development Environment Versions ==="
echo "macOS: $(sw_vers -productVersion)"
echo "Homebrew: $(brew --version | head -n1)"
echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "Git: $(git --version)"
echo "Watchman: $(watchman --version)"
echo "PostgreSQL: $(psql --version)"
echo "Redis: $(redis-cli --version)"
echo "CocoaPods: $(pod --version)"
echo "Xcode CLT: $(xcode-select --version)"
echo "=================================="

# Bu çıktıyı proje README veya issue'larda paylaşabilirsiniz
```

---

## 🆘 Sorun Giderme

### Port çakışmaları
```bash
# Kullanılan portları kontrol et
lsof -i :4000  # API
lsof -i :8081  # Expo
lsof -i :3001  # Admin
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### PostgreSQL bağlantı sorunları
```bash
# Servisi yeniden başlat
brew services restart postgresql@16

# Veritabanını yeniden oluştur
dropdb wellness
createdb wellness
pnpm db:prep
```

### Node modülleri sorunları
```bash
# Tüm node_modules ve lock dosyalarını temizle
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
rm -rf pnpm-lock.yaml
pnpm install
```

### iOS build sorunları
```bash
# Pods'u temizle ve yeniden yükle
cd apps/mobile/ios
pod deintegrate
pod install
cd ../../..
```

### Watchman sorunları
```bash
# Watchman cache'ini temizle
watchman watch-del-all
```

---

## 📋 Hızlı Referans Kartı

### Tek Komutla Kurulum (Yeni Mac)
```bash
# 1. Homebrew'i kur
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Tüm dependency'leri kur
brew install node@20 pnpm git watchman postgresql@16 redis mailpit cocoapods
xcode-select --install

# 3. Servisleri başlat
brew services start postgresql@16 redis mailpit
createdb wellness

# 4. Projeyi kur
cd womens_wellness
bash scripts/dev-setup.sh
pnpm install
pnpm db:prep
pnpm dev
```

### En Sık Kullanılan Komutlar

| Görev | Komut |
|-------|-------|
| **Versiyonları Kontrol Et** | `node --version && pnpm --version && psql --version` |
| **Servisleri Başlat** | `brew services start postgresql@16 redis mailpit` |
| **Servisleri Durdur** | `brew services stop postgresql@16 redis mailpit` |
| **Servis Durumunu Gör** | `brew services list` |
| **Veritabanını Sıfırla** | `dropdb wellness && createdb wellness && pnpm db:prep` |
| **Bağımlılıkları Yenile** | `pnpm install` |
| **Build Testini Çalıştır** | `pnpm build` |
| **Dev Sunucuları Başlat** | `pnpm dev` |
| **Sadece API Başlat** | `pnpm dev:api` |
| **Sadece Mobile Başlat** | `pnpm dev:mobile` |
| **Cache Temizle** | `watchman watch-del-all && rm -rf node_modules` |
| **iOS Pods Temizle** | `cd apps/mobile/ios && rm -rf Pods && pod install` |
| **Port Kullanımını Kontrol Et** | `lsof -i :4000 -i :5432 -i :6379 -i :8081` |

### Sık Karşılaşılan Sorunlar ve Hızlı Çözümler

| Sorun | Hızlı Çözüm |
|-------|-------------|
| **Node versiyon uyumsuzluğu** | `brew unlink node && brew link --force node@20` |
| **pnpm bulunamıyor** | `npm install -g pnpm@10.14.0` |
| **PostgreSQL bağlanamıyor** | `brew services restart postgresql@16` |
| **Redis bağlanamıyor** | `redis-cli ping` (PONG almalı), yoksa `brew services restart redis` |
| **Port 4000 kullanımda** | `lsof -ti:4000 | xargs kill -9` |
| **Prisma migrate hatası** | `pnpm db:prep` veya `cd apps/api && pnpm prisma migrate reset` |
| **iOS build hatası** | `cd apps/mobile/ios && pod install` |
| **Watchman hatası** | `watchman watch-del-all` |
| **node_modules hataları** | `rm -rf node_modules pnpm-lock.yaml && pnpm install` |

### Kritik Environment Variables

**apps/api/.env.local** (minimum):
```env
DATABASE_URL=postgresql://localhost:5432/wellness
REDIS_URL=redis://localhost:6379
JWT_SECRET=<32 karakter hex>
JWT_REFRESH_SECRET=<32 karakter hex>
OPENAI_API_KEY=sk-...  # veya ANTHROPIC_API_KEY veya GOOGLE_GENERATIVE_AI_API_KEY
```

**apps/mobile/.env.local**:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Versiyon Uyumluluk Matrisi

| Araç | Minimum | Önerilen | Maksimum Test Edilmiş |
|------|---------|----------|----------------------|
| **Node.js** | 20.0.0 | 20.19.5 | 20.x (son) |
| **pnpm** | 10.14.0 | 10.14.0 | 10.14.x |
| **PostgreSQL** | 16.0 | 16.10 | 16.x |
| **Redis** | 6.0 | 8.2.2 | 8.x |
| **macOS** | 13.0 | 15.0+ | - |

---

## 📝 Notlar

1. **M3 Silicon Uyumluluğu**: Tüm araçlar Apple Silicon (ARM64) için optimize edilmiştir.

2. **Rosetta**: Çoğu araç native ARM64 desteğine sahip olduğundan Rosetta gerekmez, ancak bazı eski toollar için faydalı olabilir.

3. **Disk Alanı**: Full setup (~20GB) şunları içerir:
   - Node modules: ~2GB
   - PostgreSQL data: ~500MB
   - iOS Simulators: ~5GB (Xcode varsa)
   - Build artifacts: ~2GB

4. **İlk Kurulum Süresi**: Tüm araçları sıfırdan kurmak 30-60 dakika sürebilir (internet hızına bağlı).

5. **Güncellemeler**: Araçları güncel tutmak için:
   ```bash
   brew update && brew upgrade
   pnpm update -r
   ```

6. **Proje İçi .nvmrc**: Otomatik Node versiyon yönetimi için proje kök dizinine `.nvmrc` dosyası eklenmiştir (içeriği: `20`).

7. **Homebrew Otomatik Güncelleme**: Homebrew otomatik güncellemeyi kapatmak isterseniz `~/.zshrc` dosyanıza `export HOMEBREW_NO_AUTO_UPDATE=1` ekleyin.

---

**Son Kontrol Tarihi**: 9 Ekim 2025
**Proje Versiyonu**: 1.0.0
**Doküman Versiyonu**: 2.0 (Sürüm yönetimi eklendi)
**Proje Durumu**: Aktif Geliştirme
**Platform**: macOS (M3 Silicon optimized, Intel compatible)
