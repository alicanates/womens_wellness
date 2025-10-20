# Astroloji Servisi Kurulum

## Gerçek Astronomik Hesaplamalar

Python Kerykeion kütüphanesi kullanarak **gerçek, doğru** yükselen burç hesaplaması.

## Kurulum

### 1. Python Servisini Başlatın

```bash
cd apps/astrology-service
./start.sh
```

Veya manuel:

```bash
cd apps/astrology-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Servis `http://localhost:5001` adresinde çalışacak.

### 2. Backend .env Ayarı

`apps/api/.env` dosyasına ekleyin:

```bash
ASTROLOGY_SERVICE_URL=http://localhost:5001
```

### 3. Backend'i Başlatın

```bash
pnpm --filter @wellness/api dev
```

### 4. Mobile'ı Başlatın

```bash
pnpm --filter @wellness/mobile start
```

## Test

1. Uygulamada Astroloji > Doğum Haritası'na gidin
2. Bilgileri girin:
   - Doğum Tarihi: 15.03.1990
   - Doğum Saati: 14:30
   - Şehir: Istanbul
3. "Haritayı Oluştur" butonuna basın

## Nasıl Çalışır?

1. Mobile app → NestJS API'ye istek atar
2. NestJS → Python mikroservisine istek atar
3. Python Kerykeion → Gerçek astronomik hesaplamalar yapar
4. Sonuç geri döner

## Kerykeion Nedir?

Profesyonel astrologların kullandığı Swiss Ephemeris tabanlı Python kütüphanesi. 
**Gerçek astronomik verilerle** doğru hesaplama yapar.

## Desteklenen Şehirler

- Istanbul
- Ankara  
- Izmir
- Antalya
- Bursa
- Adana
- Gaziantep
- Konya

Diğer şehirler için varsayılan olarak Istanbul kullanılır.
