# Sağlık Metrikleri Hesaplayıcıları - Uygulama Özeti

## 📊 Genel Bakış

Anasayfanın alt kısmındaki "Metrikler" butonu artık modern ve kapsamlı bir hesaplayıcılar hub'ına yönlendiriyor.

## ✅ Oluşturulan Ekranlar

### 1. Ana Metrikler Ekranı (`/metrics`)
- **Dosya**: `apps/mobile/app/metrics.tsx`
- **Özellikler**:
  - 7 farklı hesaplayıcıya erişim kartları
  - Modern grid layout
  - Renkli kategorilendirme
  - Her kart için özel ikon ve açıklama

### 2. VKİ Hesaplayıcı (`/metrics/bmi`)
- **Dosya**: `apps/mobile/app/metrics/bmi.tsx`
- **Özellikler**:
  - Boy ve kilo girişi
  - BMI hesaplama
  - Kategori belirleme (Zayıf, Normal, Fazla Kilolu, Obez)
  - İdeal kilo aralığı gösterimi
  - BMI aralıkları tablosu
  - Renkli kategori göstergeleri

### 3. Kalori Hesaplayıcı (`/metrics/calorie`)
- **Dosya**: `apps/mobile/app/metrics/calorie.tsx`
- **Özellikler**:
  - Boy, kilo, yaş girişi
  - Cinsiyet seçimi
  - 5 farklı aktivite seviyesi
  - BMR (Bazal Metabolizma) hesaplama
  - TDEE (Günlük Enerji Harcaması) hesaplama
  - Hedef bazlı kalori önerileri (kilo kaybı, koruma, alma)

### 4. Su İhtiyacı Hesaplayıcı (`/metrics/water`)
- **Dosya**: `apps/mobile/app/metrics/water.tsx`
- **Özellikler**:
  - Kilo bazlı hesaplama
  - Aktivite seviyesi faktörü
  - İklim faktörü
  - Bardak, şişe ve litre eşdeğerleri
  - Su içme ipuçları

### 5. Ovulasyon Hesaplayıcı (`/metrics/ovulation`)
- **Dosya**: `apps/mobile/app/metrics/ovulation.tsx`
- **Özellikler**:
  - Son adet tarihi seçimi
  - Döngü uzunluğu seçimi (21-35 gün)
  - Ovulasyon günü tahmini
  - Verimli dönem başlangıç ve bitiş tarihleri
  - Sonraki adet tarihi
  - Tarih seçici (DateTimePicker)

### 6. İdeal Kilo Hesaplayıcı (`/metrics/ideal-weight`)
- **Dosya**: `apps/mobile/app/metrics/ideal-weight.tsx`
- **Özellikler**:
  - Boy bazlı hesaplama
  - BMI tabanlı ideal kilo aralığı
  - 4 farklı formül ile hesaplama:
    - Devine Formülü
    - Robinson Formülü
    - Miller Formülü
    - Hamwi Formülü
  - Her formül için açıklama

### 7. Vücut Yağ Oranı Hesaplayıcı (`/metrics/body-fat`)
- **Dosya**: `apps/mobile/app/metrics/body-fat.tsx`
- **Özellikler**:
  - Boy, kilo, yaş girişi
  - Boyun, bel ve kalça çevresi ölçümleri
  - US Navy metodu ile hesaplama
  - Yağ kütlesi ve yağsız kütle gösterimi
  - Kategori belirleme (Atletik, Fit, Ortalama, vb.)
  - Kadınlar için yağ oranı aralıkları

### 8. Doğurganlık Hesaplayıcı (`/metrics/fertility`)
- **Dosya**: `apps/mobile/app/metrics/fertility.tsx`
- **Özellikler**:
  - Son adet tarihi seçimi
  - Döngü uzunluğu seçimi
  - En verimli günler (peak fertility)
  - Verimli dönem aralığı
  - Ovulasyon günü
  - Sonraki 3 döngü için tahminler
  - Doğurganlık ipuçları

## 🎨 Tasarım Özellikleri

### Renk Kodları
- **VKİ**: `#10B981` (Yeşil)
- **Kalori**: `#F59E0B` (Turuncu)
- **Su**: `#3B82F6` (Mavi)
- **Ovulasyon**: `#EC4899` (Pembe)
- **İdeal Kilo**: `#8B5CF6` (Mor)
- **Vücut Yağı**: `#EF4444` (Kırmızı)
- **Doğurganlık**: `#F97316` (Turuncu)

### UI Bileşenleri
- Modern kart tasarımları
- Renkli kategori göstergeleri
- Segmented control (cinsiyet seçimi)
- Radio button grupları (aktivite, iklim seçimi)
- Tarih seçici entegrasyonu
- Responsive grid layout
- Gölge ve elevation efektleri

## 🔗 Navigasyon

### Anasayfa Entegrasyonu
- **Dosya**: `apps/mobile/app/(tabs)/home.tsx`
- **Değişiklik**: Metrikler butonu artık `/metrics` rotasına yönlendiriyor
- **Eski**: `/bmi-calculator` (silindi)
- **Yeni**: `/metrics` (hub ekranı)

## 📱 Kullanıcı Akışı

```
Anasayfa
  └─> Metrikler Butonu
      └─> Metrikler Hub (/metrics)
          ├─> VKİ Hesaplama (/metrics/bmi)
          ├─> Kalori Hesaplama (/metrics/calorie)
          ├─> Su İhtiyacı (/metrics/water)
          ├─> Ovulasyon Hesaplayıcı (/metrics/ovulation)
          ├─> İdeal Kilo (/metrics/ideal-weight)
          ├─> Vücut Yağ Oranı (/metrics/body-fat)
          └─> Doğurganlık Hesaplayıcı (/metrics/fertility)
```

## 🔧 Teknik Detaylar

### Kullanılan Teknolojiler
- React Native
- Expo Router (navigasyon)
- React Query (API çağrıları için hazır)
- TypeScript
- Custom hooks (useTheme)
- DateTimePicker (@react-native-community/datetimepicker)

### API Entegrasyonu
- `metricsService.calculateBMI()` - VKİ hesaplama
- `metricsService.calculateBMR()` - Kalori hesaplama
- `metricsService.calculateWater()` - Su ihtiyacı hesaplama
- Diğer hesaplamalar client-side (formül bazlı)

### Formüller

#### BMI
```
BMI = kilo (kg) / (boy (m))²
```

#### BMR (Mifflin-St Jeor - Kadınlar)
```
BMR = (10 × kilo) + (6.25 × boy) - (5 × yaş) - 161
```

#### Vücut Yağ Oranı (US Navy - Kadınlar)
```
Body Fat % = 495 / (1.29579 - 0.35004 × log10(bel + kalça - boyun) + 0.22100 × log10(boy)) - 450
```

#### Ovulasyon
```
Ovulasyon Günü = Döngü Uzunluğu - 14
Verimli Dönem = Ovulasyon - 5 gün ile Ovulasyon + 1 gün arası
```

## ✨ Özellikler

### Tüm Hesaplayıcılarda Ortak
- ✅ Modern ve temiz UI
- ✅ Responsive tasarım
- ✅ Geri dönüş butonu
- ✅ Hata yönetimi
- ✅ Loading states
- ✅ Bilgilendirici notlar
- ✅ Renkli kategori göstergeleri
- ✅ Kolay okunabilir sonuçlar

### Ekstra Özellikler
- 📊 Detaylı sonuç kartları
- 💡 İpuçları ve öneriler
- 📈 Çoklu formül karşılaştırmaları
- 📅 Gelecek döngü tahminleri
- 🎯 Hedef bazlı öneriler

## 🚀 Sonraki Adımlar

### Potansiyel İyileştirmeler
1. Sonuçları kaydetme özelliği
2. Geçmiş hesaplamalar görüntüleme
3. Grafik ve trend analizi
4. Hatırlatıcı entegrasyonu
5. Paylaşma özellikleri
6. PDF export
7. Daha fazla hesaplayıcı ekleme:
   - Hamilelik haftası hesaplayıcı
   - Doğum tarihi tahmini
   - Menopoz hesaplayıcı
   - Kemik yoğunluğu tahmini

## 📝 Notlar

- Tüm hesaplamalar kadınlar için optimize edilmiştir
- Formüller bilimsel kaynaklara dayanmaktadır
- Sonuçlar tahmini olup, profesyonel tıbbi tavsiye yerine geçmez
- Her hesaplayıcıda kullanıcı bilgilendirme notları bulunmaktadır
