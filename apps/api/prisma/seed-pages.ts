import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPages() {
    console.log('🌱 Seeding pages...');

    // Privacy Policy
    await prisma.page.upsert({
        where: { slug: 'privacy-policy' },
        update: {},
        create: {
            slug: 'privacy-policy',
            titleTr: 'Gizlilik Politikası',
            titleEn: 'Privacy Policy',
            contentTr: `# Gizlilik Politikası

Son Güncelleme: ${new Date().toLocaleDateString('tr-TR')}

Women's Wellness Companion olarak, kullanıcılarımızın gizliliğini korumayı en önemli önceliğimiz olarak görüyoruz.

## Topladığımız Bilgiler

### Kişisel Bilgiler
- Ad, soyad ve e-posta adresi
- Doğum tarihi
- Sağlık verileri (regl döngüsü, hamilelik takibi, vb.)

### Otomatik Toplanan Bilgiler
- Cihaz bilgileri
- Uygulama kullanım istatistikleri
- IP adresi

## Bilgilerin Kullanımı

Topladığımız bilgileri şu amaçlarla kullanırız:
- Hizmetlerimizi sağlamak ve geliştirmek
- Kişiselleştirilmiş öneriler sunmak
- Kullanıcı desteği sağlamak
- Güvenlik ve dolandırıcılık önleme

## Veri Güvenliği

Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz:
- Şifreleme (AES-256)
- Güvenli veri aktarımı (TLS/SSL)
- Düzenli güvenlik denetimleri

## Veri Paylaşımı

Kişisel bilgilerinizi üçüncü taraflarla paylaşmıyoruz. Sadece şu durumlarda veri paylaşımı yapabiliriz:
- Yasal zorunluluklar
- Kullanıcı onayı ile
- Hizmet sağlayıcılar (anonim veriler)

## Haklarınız

- Verilerinize erişim hakkı
- Verilerin düzeltilmesi hakkı
- Verilerin silinmesi hakkı
- Veri taşınabilirliği hakkı

## İletişim

Gizlilik politikamız hakkında sorularınız için:
- E-posta: privacy@wellnesscompanion.com
- Adres: [Şirket Adresi]`,
            contentEn: `# Privacy Policy

Last Updated: ${new Date().toLocaleDateString('en-US')}

At Women's Wellness Companion, we consider protecting our users' privacy as our top priority.

## Information We Collect

### Personal Information
- Name, surname, and email address
- Date of birth
- Health data (menstrual cycle, pregnancy tracking, etc.)

### Automatically Collected Information
- Device information
- App usage statistics
- IP address

## Use of Information

We use the collected information for:
- Providing and improving our services
- Offering personalized recommendations
- Providing user support
- Security and fraud prevention

## Data Security

We use industry-standard security measures to protect your data:
- Encryption (AES-256)
- Secure data transfer (TLS/SSL)
- Regular security audits

## Data Sharing

We do not share your personal information with third parties. We may share data only in the following cases:
- Legal obligations
- With user consent
- Service providers (anonymous data)

## Your Rights

- Right to access your data
- Right to correct data
- Right to delete data
- Right to data portability

## Contact

For questions about our privacy policy:
- Email: privacy@wellnesscompanion.com
- Address: [Company Address]`,
            isActive: true,
            sortOrder: 1,
        },
    });

    // Terms of Use
    await prisma.page.upsert({
        where: { slug: 'terms-of-use' },
        update: {},
        create: {
            slug: 'terms-of-use',
            titleTr: 'Kullanım Koşulları',
            titleEn: 'Terms of Use',
            contentTr: `# Kullanım Koşulları

Son Güncelleme: ${new Date().toLocaleDateString('tr-TR')}

Women's Wellness Companion uygulamasını kullanarak aşağıdaki koşulları kabul etmiş olursunuz.

## Hizmet Kullanımı

### Kabul Edilen Kullanım
- Kişisel sağlık takibi
- Eğitim amaçlı içerik okuma
- Topluluk ile etkileşim

### Yasak Kullanım
- Yanıltıcı bilgi paylaşımı
- Spam veya taciz
- Telif hakkı ihlali
- Sistemi manipüle etme girişimleri

## Kullanıcı Hesapları

- Hesap bilgilerinizin güvenliğinden siz sorumlusunuz
- Hesabınızı başkalarıyla paylaşmayın
- Şüpheli aktivite durumunda bizi bilgilendirin

## İçerik ve Fikri Mülkiyet

- Uygulama içeriği telif hakkı ile korunmaktadır
- Kullanıcı içeriği paylaşırken telif haklarına saygı gösterin
- Paylaştığınız içerik için siz sorumlusunuz

## Sağlık Bilgileri

- Uygulama tıbbi tavsiye sağlamaz
- Acil durumlarda sağlık profesyoneline başvurun
- Veriler bilgilendirme amaçlıdır

## Abonelik ve Ödemeler

### Premium Abonelik
- Aylık veya yıllık abonelik seçenekleri
- Otomatik yenileme
- İptal politikası

### İade Politikası
- App Store ve Google Play politikalarına tabidir
- İade talepleri ilgili mağaza üzerinden yapılır

## Sorumluluk Sınırlaması

Uygulama "olduğu gibi" sunulmaktadır. Şunlardan sorumlu değiliz:
- Hizmet kesintileri
- Veri kaybı
- Üçüncü taraf içerikleri

## Değişiklikler

Bu koşulları dilediğimiz zaman güncelleyebiliriz. Önemli değişiklikler için bildirim göndeririz.

## İletişim

Kullanım koşulları hakkında sorularınız için:
- E-posta: support@wellnesscompanion.com
- Adres: [Şirket Adresi]`,
            contentEn: `# Terms of Use

Last Updated: ${new Date().toLocaleDateString('en-US')}

By using the Women's Wellness Companion app, you agree to the following terms.

## Service Usage

### Acceptable Use
- Personal health tracking
- Reading educational content
- Community interaction

### Prohibited Use
- Sharing misleading information
- Spam or harassment
- Copyright infringement
- Attempts to manipulate the system

## User Accounts

- You are responsible for the security of your account information
- Do not share your account with others
- Inform us of suspicious activity

## Content and Intellectual Property

- App content is protected by copyright
- Respect copyrights when sharing user content
- You are responsible for the content you share

## Health Information

- The app does not provide medical advice
- Consult a healthcare professional in emergencies
- Data is for informational purposes

## Subscription and Payments

### Premium Subscription
- Monthly or annual subscription options
- Automatic renewal
- Cancellation policy

### Refund Policy
- Subject to App Store and Google Play policies
- Refund requests are made through the respective store

## Limitation of Liability

The app is provided "as is". We are not responsible for:
- Service interruptions
- Data loss
- Third-party content

## Changes

We may update these terms at any time. We will send notifications for significant changes.

## Contact

For questions about terms of use:
- Email: support@wellnesscompanion.com
- Address: [Company Address]`,
            isActive: true,
            sortOrder: 2,
        },
    });

    console.log('✅ Pages seeded successfully');
}

seedPages()
    .catch((e) => {
        console.error('❌ Error seeding pages:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
