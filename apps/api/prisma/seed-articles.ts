import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const articles = [
        {
                titleTr: 'Regl Döngüsünü Anlamak: Kapsamlı Rehber',
                titleEn: 'Understanding Your Menstrual Cycle: A Comprehensive Guide',
                contentTr: `# Regl Döngüsünü Anlamak

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

Döngünüzü takip etmek, vücudunuzu daha iyi anlamanıza yardımcı olur.`,
                contentEn: `# Understanding Your Menstrual Cycle

The menstrual cycle is a natural process of the female body, typically ranging from 21-35 days. The average cycle is 28 days.

## Phases of the Cycle

### 1. Menstruation Phase (Days 1-5)
The first day of your cycle is when menstrual bleeding begins. During this phase, the uterine lining sheds.

**Common Symptoms:**
- Cramps and abdominal pain
- Fatigue
- Headaches
- Mood changes

### 2. Follicular Phase (Days 6-14)
Estrogen levels rise and an egg begins to develop in the ovary.

**During This Time:**
- Energy levels increase
- Skin appears brighter
- Mood is generally good

### 3. Ovulation (Around Day 14)
A mature egg is released from the ovary. This is when chances of pregnancy are highest.

**Signs:**
- Mild abdominal pain
- Increased cervical mucus
- Increased libido

### 4. Luteal Phase (Days 15-28)
Progesterone levels rise. If pregnancy doesn't occur, hormone levels drop and a new cycle begins.

**PMS Symptoms:**
- Bloating
- Breast tenderness
- Mood changes
- Increased appetite

## Tips for a Healthy Cycle

1. **Regular Exercise:** At least 150 minutes of moderate exercise per week
2. **Balanced Diet:** Rich in iron, calcium, and B vitamins
3. **Stress Management:** Meditation, yoga, or breathing exercises
4. **Adequate Sleep:** 7-9 hours of quality sleep per day
5. **Hydration:** At least 8 glasses of water daily

## When to See a Doctor?

- Extremely painful periods
- Very heavy bleeding (changing pad every hour)
- Irregular cycles (longer than 3 months)
- Bleeding between periods

Tracking your cycle helps you understand your body better.`,
                excerpt: 'Regl döngüsünün fazlarını, belirtilerini ve sağlıklı bir döngü için ipuçlarını öğrenin.',
                category: 'menstrual_health',
                tags: ['regl', 'döngü', 'hormonlar', 'sağlık'],
                readTimeMin: 8,
                priority: 10,
        },
        {
                titleTr: 'Hamilelikte Beslenme: İlk Trimester Rehberi',
                titleEn: 'Nutrition During Pregnancy: First Trimester Guide',
                contentTr: `# Hamilelikte Beslenme: İlk Trimester

İlk trimester, bebeğinizin gelişimi için kritik bir dönemdir. Doğru beslenme, hem sizin hem de bebeğinizin sağlığı için önemlidir.

## Önemli Besinler

### Folik Asit
**Günlük İhtiyaç:** 400-800 mcg
**Kaynaklar:** Yeşil yapraklı sebzeler, mercimek, turunçgiller, tahıllar

Folik asit, bebeğin sinir tüpü gelişimi için kritiktir ve nöral tüp defektlerini önlemeye yardımcı olur.

### Demir
**Günlük İhtiyaç:** 27 mg
**Kaynaklar:** Kırmızı et, tavuk, balık, kuru fasulye, ıspanak

Demir, kan hacminin artması ve bebeğe oksijen taşınması için gereklidir.

### Kalsiyum
**Günlük İhtiyaç:** 1000 mg
**Kaynaklar:** Süt, yoğurt, peynir, yeşil yapraklı sebzeler, tahini

Bebeğin kemik ve diş gelişimi için esastır.

### Protein
**Günlük İhtiyaç:** 70-100 g
**Kaynaklar:** Et, tavuk, balık, yumurta, baklagiller, kuruyemişler

Bebeğin hücre gelişimi ve büyümesi için gereklidir.

### Omega-3 Yağ Asitleri
**Kaynaklar:** Somon, sardalya, ceviz, keten tohumu

Bebeğin beyin ve göz gelişimi için önemlidir.

## İlk Trimesterde Yaygın Sorunlar

### Bulantı ve Kusma
**Çözümler:**
- Küçük, sık öğünler tüketin
- Zencefil çayı için
- Kuru bisküvi veya kraker yiyin
- Bol sıvı tüketin
- Güçlü kokulardan kaçının

### İştah Kaybı
**İpuçları:**
- Sevdiğiniz yiyecekleri yiyin
- Soğuk yiyecekler daha kolay gidebilir
- Smoothie veya çorba deneyin
- Vitamin takviyelerinizi aksatmayın

### Yorgunluk
**Öneriler:**
- Bol dinlenin
- Demir açısından zengin besinler tüketin
- Hafif egzersiz yapın
- Erken yatın

## Kaçınılması Gerekenler

❌ **Çiğ veya az pişmiş et, balık, yumurta**
❌ **Yüksek cıvalı balıklar** (kılıç balığı, köpekbalığı)
❌ **Pastörize edilmemiş süt ürünleri**
❌ **Alkol**
❌ **Aşırı kafein** (günde 200 mg'dan fazla)
❌ **İşlenmiş et ürünleri** (salam, sosis)

## Örnek Günlük Menü

**Kahvaltı:**
- Tam tahıllı ekmek + peynir + domates
- 1 bardak süt
- Portakal

**Ara Öğün:**
- Yoğurt + meyve

**Öğle:**
- Izgara tavuk + bulgur pilavı + salata
- Ayran

**Ara Öğün:**
- Kuruyemiş karışımı

**Akşam:**
- Fırında somon + sebze + patates
- Cacık

**Gece:**
- Süt + hurma

## Önemli Notlar

- Vitamin takviyelerinizi düzenli alın
- Doktorunuzun önerdiği kilo alımını takip edin
- Bol su için (günde 8-10 bardak)
- Düzenli kontrollere gidin

Sağlıklı beslenme, sağlıklı hamileliğin temelidir!`,
                contentEn: `# Nutrition During Pregnancy: First Trimester

The first trimester is a critical period for your baby's development. Proper nutrition is important for both your and your baby's health.

## Essential Nutrients

### Folic Acid
**Daily Need:** 400-800 mcg
**Sources:** Leafy greens, lentils, citrus fruits, fortified cereals

Folic acid is critical for baby's neural tube development and helps prevent neural tube defects.

### Iron
**Daily Need:** 27 mg
**Sources:** Red meat, chicken, fish, beans, spinach

Iron is necessary for increased blood volume and oxygen transport to baby.

### Calcium
**Daily Need:** 1000 mg
**Sources:** Milk, yogurt, cheese, leafy greens, tahini

Essential for baby's bone and tooth development.

### Protein
**Daily Need:** 70-100 g
**Sources:** Meat, chicken, fish, eggs, legumes, nuts

Necessary for baby's cell development and growth.

### Omega-3 Fatty Acids
**Sources:** Salmon, sardines, walnuts, flaxseed

Important for baby's brain and eye development.

## Common First Trimester Issues

### Nausea and Vomiting
**Solutions:**
- Eat small, frequent meals
- Drink ginger tea
- Eat dry crackers or biscuits
- Stay hydrated
- Avoid strong smells

### Loss of Appetite
**Tips:**
- Eat foods you enjoy
- Cold foods may be easier
- Try smoothies or soups
- Don't skip vitamin supplements

### Fatigue
**Recommendations:**
- Get plenty of rest
- Eat iron-rich foods
- Do light exercise
- Go to bed early

## Foods to Avoid

❌ **Raw or undercooked meat, fish, eggs**
❌ **High-mercury fish** (swordfish, shark)
❌ **Unpasteurized dairy products**
❌ **Alcohol**
❌ **Excessive caffeine** (more than 200mg daily)
❌ **Processed meats** (salami, sausage)

## Sample Daily Menu

**Breakfast:**
- Whole grain bread + cheese + tomato
- 1 glass of milk
- Orange

**Snack:**
- Yogurt + fruit

**Lunch:**
- Grilled chicken + bulgur pilaf + salad
- Buttermilk

**Snack:**
- Mixed nuts

**Dinner:**
- Baked salmon + vegetables + potato
- Tzatziki

**Evening:**
- Milk + dates

## Important Notes

- Take your vitamin supplements regularly
- Follow your doctor's recommended weight gain
- Drink plenty of water (8-10 glasses daily)
- Attend regular check-ups

Healthy eating is the foundation of a healthy pregnancy!`,
                excerpt: 'Hamileliğin ilk trimesterinde hangi besinlere ihtiyacınız var? Kapsamlı beslenme rehberi.',
                category: 'pregnancy',
                tags: ['hamilelik', 'beslenme', 'trimester', 'vitaminler'],
                readTimeMin: 10,
                priority: 9,
        },
        {
                titleTr: 'Doğurganlığı Artıran 10 Doğal Yöntem',
                titleEn: '10 Natural Ways to Boost Fertility',
                contentTr: `# Doğurganlığı Artıran 10 Doğal Yöntem

Doğurganlığınızı artırmak için yapabileceğiniz doğal ve bilimsel olarak desteklenen yöntemler.

## 1. Sağlıklı Kilo Yönetimi

Hem düşük hem de yüksek kilo, ovulasyonu etkileyebilir. İdeal vücut kitle indeksi (VKİ) 18.5-24.9 arasındadır.

**İpuçları:**
- Dengeli beslenin
- Düzenli egzersiz yapın
- Aşırı diyet yapmayın

## 2. Antioksidan Açısından Zengin Beslenme

Antioksidanlar, yumurta ve sperm hücrelerini hasardan korur.

**En İyi Kaynaklar:**
- Çilek, böğürtlen, yaban mersini
- Yeşil çay
- Koyu yeşil yapraklı sebzeler
- Ceviz ve badem
- Domates

## 3. Sağlıklı Kahvaltı

Düzenli ve besleyici kahvaltı, hormonal dengeyi destekler.

**Öneriler:**
- Yumurta (protein)
- Tam tahıllı ekmek
- Avokado (sağlıklı yağlar)
- Meyve (vitaminler)

## 4. Trans Yağlardan Kaçının

Trans yağlar, insülin duyarlılığını azaltır ve ovulasyonu olumsuz etkiler.

**Kaçınılacaklar:**
- Margarin
- Kızartılmış yiyecekler
- İşlenmiş atıştırmalıklar
- Hazır kek ve kurabiyeler

## 5. Düşük Karbonhidrat Diyeti (PKOS için)

Polikistik over sendromu (PKOS) olan kadınlar için düşük karbonhidrat diyeti faydalı olabilir.

**Öneriler:**
- Rafine karbonhidratları azaltın
- Kompleks karbonhidratları tercih edin
- Protein ve sebze tüketimini artırın

## 6. Aktif Yaşam Tarzı

Düzenli egzersiz, hormonal dengeyi iyileştirir ve stresi azaltır.

**İdeal Egzersizler:**
- Yürüyüş (günde 30 dakika)
- Yüzme
- Yoga
- Pilates

⚠️ **Dikkat:** Aşırı egzersiz ovulasyonu engelleyebilir.

## 7. Stres Yönetimi

Yüksek stres seviyeleri, ovulasyonu ve sperm kalitesini olumsuz etkiler.

**Stres Azaltma Teknikleri:**
- Meditasyon (günde 10-15 dakika)
- Derin nefes egzersizleri
- Yoga
- Hobiler ve sosyal aktiviteler
- Yeterli uyku

## 8. Kafein Tüketimini Sınırlayın

Yüksek kafein tüketimi, doğurganlığı azaltabilir.

**Öneriler:**
- Günde maksimum 200 mg kafein (1-2 fincan kahve)
- Yeşil çay tercih edin
- Bitki çaylarını deneyin

## 9. Demir Takviyesi

Demir eksikliği, ovulasyonu olumsuz etkileyebilir.

**Demir Kaynakları:**
- Kırmızı et
- Ispanak ve pazı
- Mercimek ve nohut
- Kuru kayısı
- Demir takviyesi (doktor önerisiyle)

## 10. Doğal Takviyeler

Bazı takviyeler doğurganlığı destekleyebilir:

**Kadınlar için:**
- Folik asit (400-800 mcg)
- Koenzim Q10
- Omega-3
- Vitamin D

**Erkekler için:**
- Çinko
- Selenyum
- Vitamin C ve E
- Koenzim Q10

## Ovulasyon Takibi

Doğurganlık pencerenizi bilmek önemlidir:

- Bazal vücut ısısını ölçün
- Ovulasyon testleri kullanın
- Servikal mukusu gözlemleyin
- Döngünüzü takip edin

## Ne Zaman Doktora Gitmeli?

- 35 yaş altı: 1 yıl denemeden sonra
- 35 yaş üstü: 6 ay denemeden sonra
- Düzensiz döngüler
- Bilinen sağlık sorunları

Doğal yöntemler, doğurganlığınızı desteklemek için harika bir başlangıçtır!`,
                contentEn: `# 10 Natural Ways to Boost Fertility

Natural and scientifically-backed methods to enhance your fertility.

## 1. Healthy Weight Management

Both low and high weight can affect ovulation. Ideal body mass index (BMI) is 18.5-24.9.

**Tips:**
- Eat balanced meals
- Exercise regularly
- Avoid extreme dieting

## 2. Antioxidant-Rich Diet

Antioxidants protect egg and sperm cells from damage.

**Best Sources:**
- Strawberries, blackberries, blueberries
- Green tea
- Dark leafy greens
- Walnuts and almonds
- Tomatoes

## 3. Healthy Breakfast

Regular, nutritious breakfast supports hormonal balance.

**Recommendations:**
- Eggs (protein)
- Whole grain bread
- Avocado (healthy fats)
- Fruit (vitamins)

## 4. Avoid Trans Fats

Trans fats reduce insulin sensitivity and negatively affect ovulation.

**Avoid:**
- Margarine
- Fried foods
- Processed snacks
- Ready-made cakes and cookies

## 5. Low-Carb Diet (for PCOS)

For women with polycystic ovary syndrome (PCOS), a low-carb diet can be beneficial.

**Recommendations:**
- Reduce refined carbs
- Choose complex carbs
- Increase protein and vegetable intake

## 6. Active Lifestyle

Regular exercise improves hormonal balance and reduces stress.

**Ideal Exercises:**
- Walking (30 minutes daily)
- Swimming
- Yoga
- Pilates

⚠️ **Caution:** Excessive exercise can prevent ovulation.

## 7. Stress Management

High stress levels negatively affect ovulation and sperm quality.

**Stress Reduction Techniques:**
- Meditation (10-15 minutes daily)
- Deep breathing exercises
- Yoga
- Hobbies and social activities
- Adequate sleep

## 8. Limit Caffeine Intake

High caffeine consumption can reduce fertility.

**Recommendations:**
- Maximum 200mg caffeine daily (1-2 cups of coffee)
- Prefer green tea
- Try herbal teas

## 9. Iron Supplementation

Iron deficiency can negatively affect ovulation.

**Iron Sources:**
- Red meat
- Spinach and chard
- Lentils and chickpeas
- Dried apricots
- Iron supplements (with doctor's advice)

## 10. Natural Supplements

Some supplements can support fertility:

**For Women:**
- Folic acid (400-800 mcg)
- Coenzyme Q10
- Omega-3
- Vitamin D

**For Men:**
- Zinc
- Selenium
- Vitamin C and E
- Coenzyme Q10

## Ovulation Tracking

Knowing your fertility window is important:

- Measure basal body temperature
- Use ovulation tests
- Observe cervical mucus
- Track your cycle

## When to See a Doctor?

- Under 35: After 1 year of trying
- Over 35: After 6 months of trying
- Irregular cycles
- Known health issues

Natural methods are a great start to support your fertility!`,
                excerpt: 'Doğurganlığınızı artırmak için bilimsel olarak desteklenen 10 doğal yöntem.',
                category: 'fertility',
                tags: ['doğurganlık', 'ovulasyon', 'beslenme', 'yaşam tarzı'],
                readTimeMin: 12,
                priority: 8,
        },
        {
                titleTr: 'Dengeli Beslenme: Kadın Sağlığı İçin Temel Rehber',
                titleEn: 'Balanced Nutrition: Essential Guide for Women\'s Health',
                contentTr: `# Dengeli Beslenme Rehberi

Kadın sağlığı için özel beslenme ihtiyaçları ve öneriler.

## Temel Besin Grupları

### Protein
- Günlük: 46-56g
- Kaynaklar: Et, tavuk, balık, yumurta, baklagiller

### Karbonhidrat
- Kompleks karbonhidratları tercih edin
- Tam tahıllar, sebzeler, meyveler

### Sağlıklı Yağlar
- Omega-3, zeytinyağı, avokado, kuruyemişler

### Vitamin ve Mineraller
- Demir, kalsiyum, D vitamini, B12

## Örnek Günlük Menü

**Kahvaltı:** Yumurta + tam tahıllı ekmek + avokado
**Öğle:** Izgara tavuk + kinoa + salata
**Akşam:** Fırında somon + sebze + patates

Dengeli beslenme, sağlıklı yaşamın temelidir!`,
                contentEn: `# Balanced Nutrition Guide

Special nutritional needs and recommendations for women's health.

## Essential Food Groups

### Protein
- Daily: 46-56g
- Sources: Meat, chicken, fish, eggs, legumes

### Carbohydrates
- Choose complex carbs
- Whole grains, vegetables, fruits

### Healthy Fats
- Omega-3, olive oil, avocado, nuts

### Vitamins and Minerals
- Iron, calcium, vitamin D, B12

## Sample Daily Menu

**Breakfast:** Eggs + whole grain bread + avocado
**Lunch:** Grilled chicken + quinoa + salad
**Dinner:** Baked salmon + vegetables + potato

Balanced nutrition is the foundation of healthy living!`,
                excerpt: 'Kadın sağlığı için dengeli beslenme rehberi ve günlük menü önerileri.',
                category: 'nutrition',
                tags: ['beslenme', 'sağlık', 'vitaminler', 'diyet'],
                readTimeMin: 6,
                priority: 7,
        },
        {
                titleTr: 'Kadınlar İçin Egzersiz Programı',
                titleEn: 'Exercise Program for Women',
                contentTr: `# Kadınlar İçin Egzersiz

Sağlıklı yaşam için haftada 150 dakika orta şiddette egzersiz önerilir.

## Egzersiz Türleri

### Kardio
- Yürüyüş, koşu, yüzme, bisiklet
- Haftada 3-5 gün, 30-45 dakika

### Kuvvet Antrenmanı
- Ağırlık çalışması, direnç bantları
- Haftada 2-3 gün

### Esneklik
- Yoga, pilates, germe
- Her gün 10-15 dakika

## Regl Döngüsüne Göre Egzersiz

**Foliküler Faz:** Yüksek yoğunluklu egzersizler
**Ovulasyon:** Kuvvet antrenmanı
**Luteal Faz:** Orta şiddette kardio
**Menstrüasyon:** Hafif yoga, yürüyüş

Düzenli egzersiz, hem fiziksel hem mental sağlığınızı iyileştirir!`,
                contentEn: `# Exercise for Women

150 minutes of moderate exercise per week is recommended for healthy living.

## Types of Exercise

### Cardio
- Walking, running, swimming, cycling
- 3-5 days per week, 30-45 minutes

### Strength Training
- Weight training, resistance bands
- 2-3 days per week

### Flexibility
- Yoga, pilates, stretching
- 10-15 minutes daily

## Exercise by Menstrual Cycle

**Follicular Phase:** High-intensity workouts
**Ovulation:** Strength training
**Luteal Phase:** Moderate cardio
**Menstruation:** Light yoga, walking

Regular exercise improves both physical and mental health!`,
                excerpt: 'Kadınlar için kapsamlı egzersiz programı ve regl döngüsüne göre öneriler.',
                category: 'exercise',
                tags: ['egzersiz', 'fitness', 'sağlık', 'spor'],
                readTimeMin: 7,
                priority: 6,
        },
];

async function seedArticles() {
        console.log('🌱 Seeding articles...');

        for (const article of articles) {
                await prisma.educationalArticle.create({
                        data: article,
                });
                console.log(`✅ Created: ${article.titleTr}`);
        }

        console.log('✨ Articles seeded successfully!');
}

seedArticles()
        .catch((e) => {
                console.error('❌ Error seeding articles:', e);
                process.exit(1);
        })
        .finally(async () => {
                await prisma.$disconnect();
        });
