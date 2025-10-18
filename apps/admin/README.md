# Wellness Admin Panel

Modern, kapsamlı admin paneli - Refine.dev ve Ant Design ile geliştirilmiştir.

## Özellikler

### 📊 Dashboard
- Genel istatistikler (kullanıcılar, abonelikler, sorular, makaleler)
- Hızlı erişim linkleri

### 👥 Kullanıcı Yönetimi
- Kullanıcı listesi ve detayları
- Profil bilgileri
- Abonelik durumu
- Sağlık verileri özeti
- Aktivite istatistikleri

### 💳 Abonelik Yönetimi
- Tüm abonelikleri görüntüleme
- Abonelik detayları ve işlem geçmişi
- Durum filtreleme
- AI mesaj kotası takibi

### ❓ Q&A Moderasyonu
- Soru listesi ve detayları
- Cevap yönetimi
- Rapor inceleme ve moderasyon
- İçerik durumu güncelleme

### 📚 İçerik Yönetimi
- Eğitim makalesi oluşturma/düzenleme
- Çoklu dil desteği (TR/EN)
- Kategori ve etiket yönetimi
- Yayın ve öncelik ayarları

### 🏥 Sağlık Takibi
- Regl döngüleri
- Hamilelik takibi
- Wellness verileri (adım, meditasyon, uyku, su)

### 🔔 Hatırlatıcılar
- Tüm hatırlatıcıları görüntüleme
- Aktif/pasif durumu değiştirme

### 🤖 AI Yapılandırması
- Model politikaları (Free/Premium)
- AI sağlayıcı ayarları (OpenAI, Anthropic, Google)
- Kullanım kotaları

### ⚙️ Sistem
- Feature flag yönetimi
- Audit log görüntüleme

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
cd apps/admin
pnpm install
```

2. Environment değişkenlerini ayarlayın:
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

3. Development sunucusunu başlatın:
```bash
pnpm dev
```

Admin panel http://localhost:3001 adresinde çalışacaktır.

## Giriş

Admin paneline giriş yapmak için API'de kayıtlı bir kullanıcı hesabı kullanın:

```
Email: admin@example.com
Password: your-password
```

## Teknolojiler

- **Next.js 14** - React framework
- **Refine.dev** - Admin panel framework
- **Ant Design** - UI component library
- **TypeScript** - Type safety
- **Axios** - HTTP client

## Klasör Yapısı

```
apps/admin/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── users/             # Kullanıcı yönetimi
│   │   ├── subscriptions/     # Abonelik yönetimi
│   │   ├── qna/               # Q&A moderasyonu
│   │   ├── content/           # İçerik yönetimi
│   │   ├── health/            # Sağlık takibi
│   │   ├── reminders/         # Hatırlatıcılar
│   │   ├── ai/                # AI yapılandırması
│   │   └── system/            # Sistem ayarları
│   └── providers/
│       ├── authProvider.ts    # Authentication logic
│       └── dataProvider.ts    # API integration
├── .env.example
├── .env.local
├── package.json
└── README.md
```

## API Entegrasyonu

Admin panel aşağıdaki API endpoint'lerini kullanır:

### Kullanıcılar
- `GET /users` - Kullanıcı listesi
- `GET /users/:id` - Kullanıcı detayı

### Abonelikler
- `GET /subscription/admin/all` - Tüm abonelikler
- `GET /subscription/admin/:id` - Abonelik detayı

### Q&A
- `GET /qna/questions` - Sorular
- `GET /qna/moderation/reports` - Raporlar
- `PATCH /qna/questions/:id` - Soru güncelleme
- `PATCH /qna/moderation/reports/:id` - Rapor inceleme

### İçerik
- `GET /discover/articles` - Makaleler
- `POST /discover/articles` - Makale oluşturma
- `PATCH /discover/articles/:id` - Makale güncelleme
- `POST /discover/articles/:id/delete` - Makale silme

### Sağlık
- `GET /cycles` - Regl döngüleri
- `GET /pregnancy/admin/all` - Hamilelikler
- `GET /wellness/v1/admin/stats` - Wellness istatistikleri

### AI & Sistem
- `GET /model-policies` - Model politikaları
- `GET /quotas` - Kullanım kotaları
- `GET /feature-flags` - Feature flag'ler
- `GET /audit-logs` - Audit loglar
- `GET /reminders/admin/all` - Hatırlatıcılar

## Geliştirme

### Yeni Sayfa Ekleme

1. `src/app` altında yeni klasör oluşturun
2. `page.tsx` dosyası ekleyin
3. `src/app/providers.tsx` içinde resource tanımlayın

Örnek:
```typescript
{
  name: 'my-resource',
  list: '/my-resource',
  create: '/my-resource/create',
  edit: '/my-resource/edit/:id',
  meta: {
    label: 'My Resource',
    icon: <IconComponent />,
  },
}
```

### Yeni API Endpoint Ekleme

`src/providers/dataProvider.ts` dosyasında resource mapping'i güncelleyin.

## Production Build

```bash
pnpm build
pnpm start
```

## Lisans

MIT
