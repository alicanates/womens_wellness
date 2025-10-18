# Sayfa Yönetimi Sistemi - Uygulama Özeti

## Genel Bakış

Admin panelinden yönetilebilen dinamik sayfa sistemi başarıyla uygulandı. Gizlilik Politikası ve Kullanım Koşulları gibi sayfalar artık admin panelinden düzenlenebilir ve mobil uygulamada görüntülenebilir.

## Yapılan Değişiklikler

### 1. Database (Prisma Schema)

**Dosya:** `apps/api/prisma/schema.prisma`

Yeni `Page` modeli eklendi:
```prisma
model Page {
  id          String   @id @default(cuid())
  slug        String   @unique
  titleTr     String
  titleEn     String?
  contentTr   String   @db.Text
  contentEn   String?  @db.Text
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Migration:** `20251018215417_add_pages_model`

### 2. Backend API

#### Yeni Modül: Pages

**Dosyalar:**
- `apps/api/src/pages/pages.controller.ts` - REST API endpoints
- `apps/api/src/pages/pages.service.ts` - Business logic
- `apps/api/src/pages/pages.module.ts` - Module definition

**Endpoints:**
- `GET /pages` - Tüm sayfaları listele (public)
- `GET /pages/slug/:slug` - Slug ile sayfa getir (public)
- `GET /pages/:id` - ID ile sayfa getir (admin)
- `POST /pages` - Yeni sayfa oluştur (admin)
- `PUT /pages/:id` - Sayfa güncelle (admin)
- `DELETE /pages/:id` - Sayfa sil (admin)

**Güvenlik:**
- Public endpoint'ler: Kimlik doğrulama gerektirmez
- Admin endpoint'leri: `JwtAuthGuard` ve `AdminGuard` ile korunur

#### Seed Data

**Dosya:** `apps/api/prisma/seed-pages.ts`

Varsayılan sayfalar:
- `privacy-policy` - Gizlilik Politikası (TR/EN)
- `terms-of-use` - Kullanım Koşulları (TR/EN)

### 3. Admin Panel

#### Yeni Sayfa: Sayfa Yönetimi

**Dosya:** `apps/admin/src/app/pages/page.tsx`

**Özellikler:**
- Sayfa listesi görüntüleme
- Yeni sayfa oluşturma
- Sayfa düzenleme
- Sayfa silme
- Aktif/Pasif durumu yönetimi
- Sıralama yönetimi
- Çoklu dil desteği (TR/EN)

**API Proxy Routes:**
- `apps/admin/src/app/api/pages/route.ts`
- `apps/admin/src/app/api/pages/[id]/route.ts`

**Navigation:**
İçerik Yönetimi > Sayfalar menüsüne eklendi

### 4. Mobil Uygulama

#### Yeni Ekran: Sayfa Görüntüleme

**Dosya:** `apps/mobile/app/page-view.tsx`

**Özellikler:**
- Dinamik sayfa içeriği görüntüleme
- Slug parametresi ile sayfa yükleme
- Hata yönetimi
- Yükleme durumu gösterimi
- Responsive tasarım

#### API Service

**Dosya:** `apps/mobile/src/services/api.ts`

Yeni `pagesService` eklendi:
```typescript
export const pagesService = {
  getPages: (isActive?: boolean) => {...},
  getPageBySlug: (slug: string) => {...},
};
```

#### Ayarlar Entegrasyonu

**Dosya:** `apps/mobile/app/settings.tsx`

Gizlilik Politikası ve Kullanım Koşulları linkleri güncellendi:
- Artık harici URL yerine uygulama içi sayfa görüntüleme kullanılıyor
- `router.push('/page-view?slug=privacy-policy')`
- `router.push('/page-view?slug=terms-of-use')`

## Kullanım

### Admin Panelinde Sayfa Yönetimi

1. Admin paneline giriş yapın
2. Sol menüden "İçerik Yönetimi > Sayfalar" seçin
3. "Yeni Sayfa" butonuna tıklayın
4. Formu doldurun:
   - **Slug:** URL için benzersiz tanımlayıcı (örn: `privacy-policy`)
   - **Başlık (TR):** Türkçe başlık
   - **Başlık (EN):** İngilizce başlık (opsiyonel)
   - **İçerik (TR):** Türkçe içerik (Markdown destekler)
   - **İçerik (EN):** İngilizce içerik (opsiyonel)
   - **Sıra:** Listeleme sırası
   - **Aktif:** Sayfanın görünür olup olmadığı
5. "Oluştur" butonuna tıklayın

### Mobil Uygulamada Görüntüleme

1. Ayarlar ekranına gidin
2. "Gizlilik Politikası" veya "Kullanım Koşulları" linkine tıklayın
3. Sayfa içeriği uygulama içinde açılır

### Programatik Kullanım

```typescript
// Mobil uygulamada
import { pagesService } from '@/services/api';

// Tüm sayfaları getir
const pages = await pagesService.getPages(true); // Sadece aktif sayfalar

// Belirli bir sayfayı getir
const page = await pagesService.getPageBySlug('privacy-policy');

// Sayfaya yönlendir
router.push('/page-view?slug=privacy-policy');
```

## Güvenlik

### Admin Yetkilendirme

Admin endpoint'leri için yetkilendirme:
- Email domain: `@admin.wellnesscompanion.com`
- Veya `ADMIN_EMAILS` environment variable'ında tanımlı emailler

### Public Endpoint'ler

Sayfa görüntüleme endpoint'leri public'tir:
- Kullanıcılar kimlik doğrulama olmadan sayfaları görüntüleyebilir
- Sadece aktif sayfalar görüntülenebilir

## Çoklu Dil Desteği

Her sayfa için:
- `titleTr` ve `contentTr` (zorunlu)
- `titleEn` ve `contentEn` (opsiyonel)

Gelecekte dil seçimine göre uygun içerik gösterilebilir.

## Markdown Desteği

İçerik alanları Markdown formatını destekler:
- Başlıklar: `# Başlık`
- Listeler: `- Madde`
- Kalın: `**kalın**`
- İtalik: `*italik*`
- Linkler: `[metin](url)`

## Test

### API Test

```bash
# Tüm sayfaları listele
curl http://localhost:4000/pages

# Belirli bir sayfayı getir
curl http://localhost:4000/pages/slug/privacy-policy

# Yeni sayfa oluştur (admin token gerekli)
curl -X POST http://localhost:4000/pages \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "about-us",
    "titleTr": "Hakkımızda",
    "contentTr": "# Hakkımızda\n\nBiz kimiz...",
    "isActive": true
  }'
```

### Admin Panel Test

1. http://localhost:3001/pages adresine gidin
2. Sayfa listesini görüntüleyin
3. Yeni sayfa oluşturun
4. Sayfayı düzenleyin
5. Sayfayı silin

### Mobil Uygulama Test

1. Ayarlar ekranına gidin
2. "Gizlilik Politikası" linkine tıklayın
3. Sayfa içeriğinin doğru göründüğünü kontrol edin
4. Geri butonunun çalıştığını kontrol edin

## Gelecek Geliştirmeler

1. **Markdown Renderer:** Mobil uygulamada Markdown içeriği düzgün render etmek için markdown renderer eklenebilir
2. **Dil Seçimi:** Kullanıcının dil tercihine göre otomatik içerik gösterimi
3. **Versiyon Kontrolü:** Sayfa değişikliklerinin geçmişini tutma
4. **Önizleme:** Admin panelinde sayfa önizleme özelliği
5. **Arama:** Sayfa içeriğinde arama özelliği
6. **Kategoriler:** Sayfaları kategorilere ayırma
7. **SEO:** Meta description, keywords gibi SEO alanları
8. **Analytics:** Sayfa görüntüleme istatistikleri

## Sorun Giderme

### API Başlamıyor

```bash
# API'yi yeniden başlat
cd apps/api
pnpm dev
```

### Migration Hatası

```bash
# Migration'ı manuel çalıştır
cd apps/api
npx prisma migrate dev
```

### Seed Data Yüklenmedi

```bash
# Seed script'ini çalıştır
cd apps/api
npx tsx prisma/seed-pages.ts
```

### Admin Panel Sayfa Bulunamadı

- Admin panelinin çalıştığından emin olun: http://localhost:3001
- API'nin çalıştığından emin olun: http://localhost:4000
- Browser console'da hata kontrolü yapın

### Mobil Uygulamada Sayfa Açılmıyor

- API URL'in doğru olduğundan emin olun
- Network bağlantısını kontrol edin
- Console log'larını kontrol edin

## Dosya Yapısı

```
apps/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma (Page modeli)
│   │   ├── seed-pages.ts (Seed data)
│   │   └── migrations/
│   │       └── 20251018215417_add_pages_model/
│   └── src/
│       ├── pages/
│       │   ├── pages.controller.ts
│       │   ├── pages.service.ts
│       │   └── pages.module.ts
│       ├── auth/strategies/
│       │   └── jwt-auth.guard.ts
│       ├── common/guards/
│       │   └── admin.guard.ts
│       └── app.module.ts (PagesModule import)
├── admin/
│   └── src/
│       └── app/
│           ├── pages/
│           │   └── page.tsx (Sayfa yönetimi UI)
│           ├── api/pages/
│           │   ├── route.ts (Proxy)
│           │   └── [id]/route.ts (Proxy)
│           └── providers.tsx (Navigation)
└── mobile/
    ├── app/
    │   ├── page-view.tsx (Sayfa görüntüleme)
    │   └── settings.tsx (Link güncellemeleri)
    └── src/
        └── services/
            └── api.ts (pagesService)
```

## Sonuç

Sayfa yönetimi sistemi başarıyla uygulandı. Admin panelinden kolayca yönetilebilen, mobil uygulamada görüntülenebilen dinamik sayfa sistemi artık kullanıma hazır.
