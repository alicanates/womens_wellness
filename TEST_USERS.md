# 🔐 Test Kullanıcıları

## ✅ Sorun Çözüldü!

Şifre sorunu **bcrypt** ve **bcryptjs** uyumsuzluğundan kaynaklanıyordu. Seed dosyası `bcrypt` kullanırken, auth service `bcryptjs` kullanıyordu. Bu iki kütüphane farklı hash'ler üretir ve uyumsuz!

### Çözüm
- Seed dosyası `bcryptjs` kullanacak şekilde güncellendi
- Veritabanı yeniden seed edildi
- Tüm şifreler artık doğru hash'leniyor

---

## 👥 Kullanılabilir Test Kullanıcıları

### 1. Admin Kullanıcı
- **Email:** `admin@wellness.local`
- **Şifre:** `admin123`
- **Abonelik:** YEARLY (Premium)
- **AI Mesaj Limiti:** 1000

### 2. Free Kullanıcı
- **Email:** `free@wellness.local`
- **Şifre:** `free123`
- **Abonelik:** FREE
- **AI Mesaj Limiti:** 100

### 3. Premium Kullanıcı
- **Email:** `premium@wellness.local`
- **Şifre:** `premium123`
- **Abonelik:** MONTHLY (Premium)
- **AI Mesaj Limiti:** 1000

---

## 🧪 Test Etme

### Mobile App'de Login
1. iOS simülatörünü aç
2. Login ekranına git
3. Yukarıdaki email ve şifrelerden birini kullan
4. ✅ Başarıyla giriş yapmalısın!

### API'de Test
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "free@wellness.local",
    "password": "free123"
  }'
```

---

## 📝 Notlar

- Tüm şifreler `bcryptjs` ile hash'leniyor (10 rounds)
- Email ve username ile giriş yapılabilir
- Şifreler case-sensitive
- Email'ler otomatik lowercase'e çevriliyor

---

## 🔧 Teknik Detaylar

### Önceki Sorun
```typescript
// seed.ts (YANLIŞ)
import * as bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 10);

// auth.service.ts (DOĞRU)
import { hash } from 'bcryptjs';
const hashedPassword = await hash(password, 10);
```

### Çözüm
```typescript
// seed.ts (DOĞRU)
import { hash } from 'bcryptjs';
const hashedPassword = await hash(password, 10);
```

Her iki dosya da artık aynı kütüphaneyi kullanıyor! ✅
