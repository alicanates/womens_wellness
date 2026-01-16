import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function TermsOfServiceScreen() {
    const router = useRouter();
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kullanım Koşulları</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.lastUpdated}>Son Güncelleme: 16 Ocak 2025</Text>

                <Section title="1. Hizmet Tanımı">
                    <Text style={styles.text}>
                        Women's Wellness Companion ("Uygulama"), kadınların sağlık ve wellness yolculuğunda destek olmak amacıyla geliştirilmiş bir mobil uygulamadır. Uygulama, regl takibi, hamilelik modu, meditasyon, AI destekli sohbet ve diğer wellness özelliklerini içerir.
                    </Text>
                </Section>

                <Section title="2. Kullanım Koşullarının Kabulü">
                    <Text style={styles.text}>
                        Uygulamayı kullanarak, bu Kullanım Koşullarını kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.
                    </Text>
                </Section>

                <Section title="3. Hesap Oluşturma ve Güvenlik">
                    <SubSection title="3.1. Hesap Bilgileri">
                        <Text style={styles.text}>
                            • Hesap oluştururken doğru ve güncel bilgiler vermelisiniz
                        </Text>
                        <Text style={styles.text}>
                            • Hesap güvenliğinden siz sorumlusunuz
                        </Text>
                        <Text style={styles.text}>
                            • Şifrenizi kimseyle paylaşmamalısınız
                        </Text>
                        <Text style={styles.text}>
                            • Hesabınızda yetkisiz kullanım fark ederseniz derhal bize bildirmelisiniz
                        </Text>
                    </SubSection>

                    <SubSection title="3.2. Yaş Sınırı">
                        <Text style={styles.text}>
                            Uygulamamızı kullanmak için en az 18 yaşında olmalısınız.
                        </Text>
                    </SubSection>
                </Section>

                <Section title="4. Hizmet Kullanımı">
                    <SubSection title="4.1. İzin Verilen Kullanım">
                        <Text style={styles.text}>
                            Uygulamayı yalnızca kişisel, ticari olmayan amaçlarla kullanabilirsiniz.
                        </Text>
                    </SubSection>

                    <SubSection title="4.2. Yasak Faaliyetler">
                        <Text style={styles.text}>
                            Aşağıdaki faaliyetler kesinlikle yasaktır:
                        </Text>
                        <Text style={styles.text}>
                            • Uygulamayı yasadışı amaçlarla kullanmak
                        </Text>
                        <Text style={styles.text}>
                            • Başkalarının hesaplarına yetkisiz erişim sağlamak
                        </Text>
                        <Text style={styles.text}>
                            • Zararlı yazılım veya virüs yaymak
                        </Text>
                        <Text style={styles.text}>
                            • Uygulamanın güvenlik özelliklerini atlatmaya çalışmak
                        </Text>
                        <Text style={styles.text}>
                            • Uygulamayı tersine mühendislik yapmak
                        </Text>
                        <Text style={styles.text}>
                            • Spam veya istenmeyen içerik göndermek
                        </Text>
                        <Text style={styles.text}>
                            • Diğer kullanıcıları taciz etmek veya rahatsız etmek
                        </Text>
                    </SubSection>
                </Section>

                <Section title="5. Tıbbi Sorumluluk Reddi">
                    <Text style={styles.text}>
                        ÖNEMLİ: Bu uygulama tıbbi tavsiye, teşhis veya tedavi sağlamaz. Uygulama yalnızca bilgilendirme ve wellness desteği amaçlıdır.
                    </Text>
                    <Text style={styles.text}>
                        • Sağlık sorunlarınız için mutlaka bir sağlık profesyoneline danışın
                    </Text>
                    <Text style={styles.text}>
                        • Uygulama, profesyonel tıbbi tavsiyenin yerini tutmaz
                    </Text>
                    <Text style={styles.text}>
                        • Acil durumlarda 112'yi arayın
                    </Text>
                    <Text style={styles.text}>
                        • Hamilelik takibi özelliği, düzenli doktor kontrollerinin yerini tutmaz
                    </Text>
                </Section>

                <Section title="6. İçerik ve Fikri Mülkiyet">
                    <SubSection title="6.1. Uygulama İçeriği">
                        <Text style={styles.text}>
                            Uygulamadaki tüm içerik, tasarım, logo, metin, grafik ve yazılım bizim mülkiyetimizdir ve telif hakkı yasalarıyla korunmaktadır.
                        </Text>
                    </SubSection>

                    <SubSection title="6.2. Kullanıcı İçeriği">
                        <Text style={styles.text}>
                            Uygulamaya yüklediğiniz içerikten (notlar, kayıtlar vb.) siz sorumlusunuz. Yüklediğiniz içeriğin yasal olduğunu ve başkalarının haklarını ihlal etmediğini garanti edersiniz.
                        </Text>
                    </SubSection>
                </Section>

                <Section title="7. Premium Abonelik">
                    <SubSection title="7.1. Ücretlendirme">
                        <Text style={styles.text}>
                            • Premium özelliklere erişim için ücretli abonelik gereklidir
                        </Text>
                        <Text style={styles.text}>
                            • Fiyatlar uygulama içinde belirtilmiştir
                        </Text>
                        <Text style={styles.text}>
                            • Abonelik otomatik olarak yenilenir
                        </Text>
                    </SubSection>

                    <SubSection title="7.2. İptal ve İade">
                        <Text style={styles.text}>
                            • Aboneliğinizi istediğiniz zaman iptal edebilirsiniz
                        </Text>
                        <Text style={styles.text}>
                            • İptal, mevcut dönem sonunda geçerli olur
                        </Text>
                        <Text style={styles.text}>
                            • İade politikası, uygulama mağazasının (App Store/Google Play) politikalarına tabidir
                        </Text>
                    </SubSection>
                </Section>

                <Section title="8. Hizmet Değişiklikleri ve Sonlandırma">
                    <Text style={styles.text}>
                        • Uygulamayı istediğimiz zaman değiştirme, askıya alma veya sonlandırma hakkını saklı tutarız
                    </Text>
                    <Text style={styles.text}>
                        • Kullanım koşullarını ihlal ederseniz hesabınızı askıya alabilir veya sonlandırabiliriz
                    </Text>
                    <Text style={styles.text}>
                        • Önemli değişiklikler hakkında sizi bilgilendireceğiz
                    </Text>
                </Section>

                <Section title="9. Sorumluluk Sınırlaması">
                    <Text style={styles.text}>
                        Uygulama "olduğu gibi" sunulmaktadır. Aşağıdaki durumlardan sorumlu değiliz:
                    </Text>
                    <Text style={styles.text}>
                        • Hizmet kesintileri veya hatalar
                    </Text>
                    <Text style={styles.text}>
                        • Veri kaybı
                    </Text>
                    <Text style={styles.text}>
                        • Üçüncü taraf hizmetlerinden kaynaklanan sorunlar
                    </Text>
                    <Text style={styles.text}>
                        • Uygulamanın kullanımından kaynaklanan dolaylı zararlar
                    </Text>
                </Section>

                <Section title="10. Gizlilik">
                    <Text style={styles.text}>
                        Kişisel verilerinizin işlenmesi, Gizlilik Politikamızda detaylı olarak açıklanmıştır. Uygulamayı kullanarak Gizlilik Politikamızı da kabul etmiş olursunuz.
                    </Text>
                </Section>

                <Section title="11. Uygulanacak Hukuk">
                    <Text style={styles.text}>
                        Bu Kullanım Koşulları, Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar İstanbul mahkemelerinde çözülecektir.
                    </Text>
                </Section>

                <Section title="12. Değişiklikler">
                    <Text style={styles.text}>
                        Bu Kullanım Koşullarını istediğimiz zaman değiştirme hakkını saklı tutarız. Değişiklikler, uygulama üzerinden yayınlandığında yürürlüğe girer. Değişikliklerden sonra uygulamayı kullanmaya devam ederseniz, yeni koşulları kabul etmiş sayılırsınız.
                    </Text>
                </Section>

                <Section title="13. İletişim">
                    <Text style={styles.text}>
                        Kullanım koşulları hakkında sorularınız için:
                    </Text>
                    <Text style={styles.text}>
                        E-posta: support@womenswellness.app
                    </Text>
                    <Text style={styles.text}>
                        Adres: [Şirket Adresi]
                    </Text>
                </Section>

                <View style={styles.acceptanceBox}>
                    <Text style={styles.acceptanceText}>
                        Bu uygulamayı kullanarak, yukarıdaki Kullanım Koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const theme = useTheme();
    return (
        <View style={{ marginBottom: theme.spacing.xl }}>
            <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
            }}>
                {title}
            </Text>
            {children}
        </View>
    );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
    const theme = useTheme();
    return (
        <View style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
            }}>
                {title}
            </Text>
            {children}
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        backButton: {
            padding: theme.spacing.xs,
        },
        backButtonText: {
            fontSize: 24,
            color: theme.colors.primary,
            fontWeight: '600',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
        },
        headerRight: {
            width: 40,
        },
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: theme.spacing.lg,
            paddingBottom: 40,
        },
        lastUpdated: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            marginBottom: theme.spacing.xl,
            textAlign: 'center',
        },
        text: {
            fontSize: 15,
            color: theme.colors.textSecondary,
            lineHeight: 22,
            marginBottom: theme.spacing.sm,
        },
        acceptanceBox: {
            backgroundColor: theme.colors.primary + '15',
            borderRadius: 12,
            padding: theme.spacing.lg,
            marginTop: theme.spacing.xl,
            borderWidth: 1,
            borderColor: theme.colors.primary + '30',
        },
        acceptanceText: {
            fontSize: 14,
            color: theme.colors.text,
            lineHeight: 20,
            textAlign: 'center',
            fontWeight: '600',
        },
    });
