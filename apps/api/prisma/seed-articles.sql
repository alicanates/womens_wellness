-- Seed educational articles
INSERT INTO "EducationalArticle" (
  id, "titleTr", "titleEn", "contentTr", "contentEn", excerpt, category, tags, "readTimeMin", priority, "isActive", "publishedAt", "createdAt", "updatedAt"
) VALUES
(
  'article_001',
  'Regl Döngüsünü Anlamak: Kapsamlı Rehber',
  'Understanding Your Menstrual Cycle: A Comprehensive Guide',
  '# Regl Döngüsünü Anlamak

Regl döngüsü, kadın vücudunun doğal bir sürecidir ve genellikle 21-35 gün arasında değişir. Ortalama döngü 28 gündür.

## Döngünün Fazları

### 1. Menstrüasyon Fazı (1-5. günler)
Döngünün ilk günü, regl kanamasının başladığı gündür. Bu fazda rahim iç tabakası dökülür.

**Yaygın Belirtiler:**
- Kramplar ve karın ağrısı
- Yorgunluk
- Baş ağrısı
- Ruh hali değişiklikleri

### 2. Foliküler Faz (6-14. günler)
Östrojen seviyeleri yükselir ve yumurtalıkta yumurta gelişmeye başlar.

**Bu Dönemde:**
- Enerji seviyeleri artar
- Cilt daha parlak görünür
- Ruh hali genellikle iyidir

### 3. Ovulasyon (14. gün civarı)
Olgun yumurta yumurtalıktan salınır. Bu, hamile kalma şansının en yüksek olduğu dönemdir.

**Belirtiler:**
- Hafif karın ağrısı
- Servikal mukus artışı
- Libido artışı

### 4. Luteal Faz (15-28. günler)
Progesteron seviyeleri yükselir. Hamilelik gerçekleşmezse, hormon seviyeleri düşer ve yeni döngü başlar.

**PMS Belirtileri:**
- Şişkinlik
- Göğüs hassasiyeti
- Ruh hali değişiklikleri
- İştah artışı

## Sağlıklı Döngü İçin İpuçları

1. **Düzenli Egzersiz:** Haftada en az 150 dakika orta şiddette egzersiz
2. **Dengeli Beslenme:** Demir, kalsiyum ve B vitaminleri açısından zengin
3. **Stres Yönetimi:** Meditasyon, yoga veya nefes egzersizleri
4. **Yeterli Uyku:** Günde 7-9 saat kaliteli uyku
5. **Hidrasyon:** Günde en az 8 bardak su

## Ne Zaman Doktora Gitmeli?

- Aşırı ağrılı regl
- Çok ağır kanama (saatte bir ped değiştirme)
- Düzensiz döngüler (3 aydan uzun)
- Regl arası kanama

Döngünüzü takip etmek, vücudunuzu daha iyi anlamanıza yardımcı olur.',
  'Understanding Your Menstrual Cycle content...',
  'Regl döngüsünün fazlarını, belirtilerini ve sağlıklı bir döngü için ipuçlarını öğrenin.',
  'menstrual_health',
  ARRAY['regl', 'döngü', 'hormonlar', 'sağlık'],
  8,
  10,
  true,
  NOW(),
  NOW(),
  NOW()
);
