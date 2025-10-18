# Sayfa Yönetimi - Mobil Uygulama Düzeltmesi

## Sorun
Mobil uygulamada Ayarlar > Gizlilik Politikası / Kullanım Koşulları linkleri uygulama içinde açılmıyordu.

## Çözüm

### 1. Dosya Adı Değişikliği
Expo Router'da dinamik route'lar için dosya adı önemlidir.

**Önceki:** `apps/mobile/app/page-view.tsx`
**Yeni:** `apps/mobile/app/[slug].tsx`

Bu değişiklik ile `/privacy-policy` ve `/terms-of-use` gibi route'lar otomatik olarak çalışır.

### 2. Navigation Güncellemesi

**apps/mobile/app/settings.tsx**

```typescript
// Önceki (çalışmıyordu)
const handlePrivacyPolicy = () => {
  router.push('/page-view?slug=privacy-policy' as any);
};

// Yeni (çalışıyor)
const handlePrivacyPolicy = () => {
  console.log('Navigating to privacy policy page');
  router.push('/privacy-policy');
};

const handleTermsOfUse = () => {
  console.log('Navigating to terms of use page');
  router.push('/terms-of-use');
};
```

### 3. Debug Logları Eklendi

**apps/mobile/app/[slug].tsx**

```typescript
useEffect(() => {
  console.log('PageViewScreen mounted with slug:', slug);
  if (slug) {
    fetchPage();
  }
}, [slug]);

const fetchPage = async () => {
  try {
    setLoading(true);
    setError(null);
    console.log('Fetching page from:', `${API_URL}/pages/slug/${slug}`);
    const response = await fetch(`${API_URL}/pages/slug/${slug}`);
    // ...
  }
};
```

## Expo Router Dinamik Route Yapısı

Expo Router'da dinamik route'lar şu şekilde çalışır:

```
app/
  [slug].tsx          → /:slug (örn: /privacy-policy, /terms-of-use)
  [id]/
    edit.tsx          → /:id/edit
  [...rest].tsx       → Catch-all route
```

## Test

### Mobil Uygulamada Test
1. Uygulamayı başlatın: `pnpm --filter @wellness/mobile ios`
2. Ayarlar ekranına gidin
3. "Gizlilik Politikası" linkine tıklayın
4. Sayfa uygulama içinde açılmalı
5. "Kullanım Koşulları" linkine tıklayın
6. Sayfa uygulama içinde açılmalı

### Console Logları
Başarılı navigation için şu logları görmelisiniz:
```
Navigating to privacy policy page
PageViewScreen mounted with slug: privacy-policy
Fetching page from: http://localhost:4000/pages/slug/privacy-policy
```

## Dosya Değişiklikleri

1. **Yeniden adlandırıldı:**
   - `apps/mobile/app/page-view.tsx` → `apps/mobile/app/[slug].tsx`

2. **Güncellendi:**
   - `apps/mobile/app/settings.tsx` - Navigation metodları
   - `apps/mobile/app/[slug].tsx` - Debug logları

## Alternatif Yaklaşımlar

Eğer dinamik route çalışmazsa, alternatif olarak:

### 1. Query Parametreleri ile
```typescript
router.push({
  pathname: '/page-view',
  params: { slug: 'privacy-policy' }
});
```

### 2. Ayrı Route'lar
```
app/
  privacy-policy.tsx
  terms-of-use.tsx
```

### 3. Stack Navigator
React Navigation kullanarak:
```typescript
navigation.navigate('PageView', { slug: 'privacy-policy' });
```

## Notlar

- Expo Router dosya tabanlı routing kullanır
- Dinamik parametreler `[paramName]` formatında tanımlanır
- `useLocalSearchParams()` hook'u ile parametrelere erişilir
- Route değişiklikleri hot reload ile otomatik güncellenir

## Sorun Giderme

### Sayfa Açılmıyor
1. Console loglarını kontrol edin
2. API'nin çalıştığından emin olun: `curl http://localhost:4000/pages/slug/privacy-policy`
3. Mobil uygulamayı yeniden başlatın: `r` tuşuna basın

### 404 Hatası
1. Dosya adının doğru olduğundan emin olun: `[slug].tsx`
2. Route'un doğru olduğundan emin olun: `/privacy-policy` (query parametresi yok)

### API Bağlantı Hatası
1. API URL'i kontrol edin: `process.env.EXPO_PUBLIC_API_BASE_URL`
2. Network bağlantısını kontrol edin
3. CORS ayarlarını kontrol edin (gerekirse)
