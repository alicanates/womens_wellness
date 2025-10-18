# Sayfa Yönetimi - Güvenlik Notu

## ⚠️ ÖNEMLİ: Production Güvenlik Uyarısı

Şu anda Pages API endpoint'leri **authentication olmadan** çalışmaktadır. Bu sadece development amaçlıdır.

## Mevcut Durum

**apps/api/src/pages/pages.controller.ts**

```typescript
// Admin endpoints
// TODO: Add proper authentication in production
@Get(':id')
async findById(@Param('id') id: string) {
  return this.pagesService.findById(id);
}

@Post()
async create(@Body() data: CreatePageDto) {
  return this.pagesService.create(data);
}

@Put(':id')
async update(@Param('id') id: string, @Body() data: UpdatePageDto) {
  return this.pagesService.update(id, data);
}

@Delete(':id')
async delete(@Param('id') id: string) {
  return this.pagesService.delete(id);
}
```

## Production İçin Gerekli Değişiklikler

### Seçenek 1: Admin Panel Authentication (Önerilen)

Admin paneline authentication ekleyin ve token'ı API çağrılarında kullanın.

**1. Admin Panel Login Sistemi**
```typescript
// apps/admin/src/app/login/page.tsx
export default function LoginPage() {
  const handleLogin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { accessToken } = await response.json();
    localStorage.setItem('adminToken', accessToken);
  };
}
```

**2. API Route'larında Token Kullanımı**
```typescript
// apps/admin/src/app/api/pages/[id]/route.ts
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('adminToken')?.value;
  
  const response = await fetch(`${API_BASE_URL}/pages/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(await request.json()),
  });
  
  return NextResponse.json(await response.json());
}
```

**3. Backend'de Guard'ları Geri Ekleyin**
```typescript
// apps/api/src/pages/pages.controller.ts
@Put(':id')
@UseGuards(JwtAuthGuard, AdminGuard)
async update(@Param('id') id: string, @Body() data: UpdatePageDto) {
  return this.pagesService.update(id, data);
}
```

### Seçenek 2: API Key Authentication

Basit bir API key sistemi kullanın.

**1. Environment Variable**
```bash
# .env
ADMIN_API_KEY=your-secret-key-here
```

**2. Backend Guard**
```typescript
// apps/api/src/common/guards/api-key.guard.ts
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    return apiKey === process.env.ADMIN_API_KEY;
  }
}

// Controller'da kullanım
@Put(':id')
@UseGuards(ApiKeyGuard)
async update(@Param('id') id: string, @Body() data: UpdatePageDto) {
  return this.pagesService.update(id, data);
}
```

**3. Admin Panel'de API Key Kullanımı**
```typescript
// apps/admin/src/app/api/pages/[id]/route.ts
const response = await fetch(`${API_BASE_URL}/pages/${params.id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.ADMIN_API_KEY,
  },
  body: JSON.stringify(body),
});
```

### Seçenek 3: IP Whitelist

Sadece belirli IP'lerden erişime izin verin.

```typescript
// apps/api/src/common/guards/ip-whitelist.guard.ts
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly allowedIps = process.env.ALLOWED_IPS?.split(',') || [];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = request.ip || request.connection.remoteAddress;
    return this.allowedIps.includes(clientIp);
  }
}
```

## Güvenlik Best Practices

1. **HTTPS Kullanın**: Production'da her zaman HTTPS kullanın
2. **Rate Limiting**: API endpoint'lerine rate limiting ekleyin
3. **Input Validation**: Tüm input'ları validate edin
4. **CORS**: Sadece admin panel domain'ine izin verin
5. **Audit Logging**: Tüm admin işlemlerini loglayın
6. **Role-Based Access**: Farklı admin seviyeleri oluşturun

## Hızlı Production Fix

En hızlı çözüm için API Key kullanın:

```bash
# 1. .env dosyasına ekleyin
echo "ADMIN_API_KEY=$(openssl rand -hex 32)" >> .env

# 2. Backend'de guard ekleyin
# 3. Admin panel'de header ekleyin
```

## Test

Production'a geçmeden önce:

```bash
# 1. Authentication olmadan erişimi test edin (başarısız olmalı)
curl -X PUT http://your-api.com/pages/123 -d '{"titleTr":"Test"}'

# 2. Authentication ile erişimi test edin (başarılı olmalı)
curl -X PUT http://your-api.com/pages/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"titleTr":"Test"}'
```

## Checklist

- [ ] Admin panel authentication eklendi
- [ ] API token/key sistemi kuruldu
- [ ] Backend guard'lar aktif
- [ ] HTTPS kullanılıyor
- [ ] Rate limiting aktif
- [ ] CORS yapılandırıldı
- [ ] Audit logging eklendi
- [ ] Production'da test edildi

## Sonuç

**ŞU ANDA:** Development için authentication kapalı
**PRODUCTION:** Mutlaka yukarıdaki seçeneklerden birini uygulayın

Güvenlik açığı riski: **YÜKSEK** ⚠️
