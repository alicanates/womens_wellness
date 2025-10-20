# DeepSeek AI Integration

DeepSeek, OpenAI API ile uyumlu bir AI provider'dır ve yüksek performanslı, maliyet-etkin modeller sunar.

## Desteklenen Modeller

- `deepseek-chat` - Genel amaçlı chat modeli
- `deepseek-coder` - Kod yazma ve analiz için optimize edilmiş
- `deepseek-reasoner` - Mantıksal düşünme ve problem çözme için

## API Key Alma

1. [DeepSeek Platform](https://platform.deepseek.com/) adresine gidin
2. Hesap oluşturun veya giriş yapın
3. API Keys bölümünden yeni bir key oluşturun
4. Key'i güvenli bir yerde saklayın

## Admin Panelinden Ekleme

1. Admin paneline gidin: `/settings/ai-providers`
2. "Yeni Provider Ekle" butonuna tıklayın
3. Formu doldurun:
   - **Provider**: DeepSeek
   - **API Key**: DeepSeek API key'iniz
   - **Model Adı**: `deepseek-chat` (veya başka bir model)
   - **Görünen Ad**: DeepSeek Chat
   - **Açıklama**: Maliyet-etkin AI modeli
   - **Öncelik**: İstediğiniz öncelik değeri
4. "Kaydet" butonuna tıklayın

## Örnek Kullanım

```typescript
// DeepSeek otomatik olarak en yüksek öncelikli aktif provider olarak seçilir
// Veya manuel olarak:
const provider = await aiProviderService.getByProvider('deepseek');
```

## Özellikler

- ✅ OpenAI API uyumlu
- ✅ Düşük maliyet
- ✅ Yüksek performans
- ✅ Türkçe desteği
- ✅ Streaming desteği

## Fiyatlandırma

DeepSeek, OpenAI'ye göre daha uygun fiyatlıdır:
- Input: ~$0.14 / 1M tokens
- Output: ~$0.28 / 1M tokens

Güncel fiyatlar için: https://platform.deepseek.com/pricing

## Notlar

- DeepSeek API'si OpenAI SDK ile uyumludur
- Base URL: `https://api.deepseek.com`
- Rate limiting: Hesap tipinize göre değişir
- Maksimum context: 32K tokens (model'e göre değişir)
