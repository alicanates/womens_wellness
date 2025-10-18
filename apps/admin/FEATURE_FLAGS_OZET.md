# Özellik Bayrakları - Hızlı Özet

## 🎯 Ne İşe Yarar?

Özellik bayrakları, **kod değiştirmeden** uygulamanın özelliklerini açıp kapatmanızı sağlar.

## 💡 Temel Kullanım Alanları

### 1. **Yeni Özellikleri Test Etme**
```
Yeni özellik → Önce kapalı → Test kullanıcılarına aç → Herkese aç
```

### 2. **Acil Durum Anahtarı**
```
Sorun çıktı → Admin panelden kapat → Sorun çözüldü → Tekrar aç
```

### 3. **Bölgesel Özellikler**
```
Türkiye'de iyzico → ABD'de Stripe → İngiltere'de PayPal
```

## 📱 Wellness Uygulamasında Örnekler

| Bayrak | Açıklama | Örnek Değer |
|--------|----------|-------------|
| `ai_chat_enabled` | AI sohbet özelliği | `true` / `false` |
| `qna_enabled` | Soru-Cevap bölümü | `true` / `false` |
| `pregnancy_tracking_enabled` | Hamilelik takibi | `true` / `false` |
| `subscription_trial_enabled` | Deneme sürümü | `true` / `false` |
| `push_notifications_enabled` | Bildirimler | `true` / `false` |

## 🎛️ Admin Panelden Nasıl Kullanılır?

### Basit Bayrak (Açma/Kapama)
```json
true
```
veya
```json
false
```

### Gelişmiş Bayrak (Yapılandırma)
```json
{
  "enabled": true,
  "max_items": 10,
  "show_premium": true
}
```

## ⚡ Hızlı Başlangıç

1. **Admin Panele Giriş Yap**
2. **Sistem** > **Özellik Bayrakları**
3. Bayrağı bul ve düzenle
4. Değeri değiştir
5. Kaydet

**Sonuç**: Mobil uygulama sonraki API çağrısında yeni değeri alır!

## 🚨 Önemli Notlar

✅ **Yapılması Gerekenler**:
- Anlamlı isimler kullan (`ai_chat_enabled`)
- Varsayılan değer belirle
- Kullanılmayan bayrakları sil

❌ **Yapılmaması Gerekenler**:
- Hassas bilgi saklama (şifre, API key)
- Çok fazla bayrak oluşturma
- Kritik güvenlik kontrollerini bayraklara bağlama

## 🎯 Gerçek Dünya Örneği

**Senaryo**: AI sohbet özelliğinde sorun var

**Çözüm**:
1. Admin panel aç
2. `ai_chat_enabled` → `false` yap
3. Kaydet
4. ✅ Özellik anında kapandı!
5. Sorunu çöz
6. `ai_chat_enabled` → `true` yap
7. ✅ Özellik tekrar açıldı!

**Süre**: 30 saniye ⚡

## 📊 Avantajlar

- 🚀 Hızlı deployment
- 🔄 Anında geri alma
- 🧪 A/B testing
- 🌍 Bölgesel özelleştirme
- 🛡️ Risk yönetimi
- 📱 Kod güncellemesi gerektirmez

---

**Özet**: Özellik bayrakları, uygulamanızı dinamik ve esnek hale getirir. Admin panelinden kolayca yönetebilir, özellikleri anında açıp kapatabilirsiniz!
