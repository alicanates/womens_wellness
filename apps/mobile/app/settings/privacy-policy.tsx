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

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text style={styles.lastUpdated}>Son Güncelleme: 16 Ocak 2025</Text>

                <Section title="1. Giriş">
                    <Text style={styles.text}>
                        Women's Wellness Companion ("Uygulama", "biz", "bizim") olarak, kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklamaktadır.
                    </Text>
                    <Text style={styles.text}>
                        Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuata uygun olarak hazırlanmıştır.
                    </Text>
                </Section>

                <Section title="2. Toplanan Veriler">
                    <SubSection title="2.1. Hesap Bilgileri">
                        <Text style={styles.text}>• E-posta adresi</Text>
                        <Text style={styles.text}>• Kullanıcı adı</Text>
                        <Text style={styles.text}>• Ad ve soyad</Text>
                        <Text style={styles.text}>• Şifre (şifrelenmiş)</Text>
                    </SubSection>

                    <SubSection title="2.2. Sağlık ve Wellness Verileri">
                        <Text style={styles.text}>• Regl döngüsü bilgileri</Text>
                        <Text style={styles.text}>• Hamilelik takip verileri</Text>
                        <Text style={styles.text}>• Ruh hali ve enerji seviyeleri</Text>
                        <Text style={styles.text}>• Semptom kayıtları</Text>
                        <Text style={styles.text}>• Meditasyon ve aktivite geçmişi</Text>
                    </SubSection>

                    <SubSection title="2.3. Kullanım Verileri">
                        <Text style={styles.text}>• Uygulama kullanım istatistikleri</Text>
                        <Text style={styles.text}>• Cihaz bilgileri (model, işletim sistemi)</Text>
                        <Text style={styles.text}>• IP adresi</Text>
                        <Text style={styles.text}>• Hata raporları</Text>
                    </SubSection>
                </Section>

                <Section title="3. Verilerin Kullanım Amaçları">
                    <Text style={styles.text}>
                        Topladığımız veriler aşağıdaki amaçlarla kullanılır:
                    </Text>
                    <Text style={styles.text}>• Uygulama hizmetlerinin sağlanması</Text>
                    <Text style={styles.text}>• Kişiselleştirilmiş öneriler sunulması</Text>
                    <Text style={styles.text}>• Sağlık takibi ve analizleri</Text>
                    <Text style={styles.text}>• Uygulama performansının iyileştirilmesi</Text>
                    <Text style={styles.text}>• Kullanıcı desteği sağlanması</Text>
                    <Text style={styles.text}>• Yasal yükümlülüklerin yerine getirilmesi</Text>
                </Section>

                <Section title="4. Veri Güvenliği">
                    <Text style={styles.text}>
                        Verilerinizin güvenliği bizim için önceliktir. Aşağıdaki güvenlik önlemlerini alıyoruz:
                    </Text>
                    <Text style={styles.text}>• SSL/TLS şifreleme ile veri iletimi</Text>
                    <Text style={styles.text}>• Şifrelerin hash'lenerek saklanması</Text>
                    <Text style={styles.text}>• Düzenli güvenlik denetimleri</Text>
                    <Text style={styles.text}>• Erişim kontrolü ve yetkilendirme</Text>
                    <Text style={styles.text}>• Güvenli sunucu altyapısı</Text>
                </Section>

                <Section title="5. Veri Saklama Süresi">
                    <Text style={styles.text}>
                        Kişisel verileriniz, toplama amacının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerine uygun olarak saklanır. Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemlerimizden kalıcı olarak silinir.
                    </Text>
                </Section>

                <Section title="6. Veri Paylaşımı">
                    <Text style={styles.text}>
                        Kişisel verileriniz, açık rızanız olmadan üçüncü taraflarla paylaşılmaz. Aşağıdaki durumlarda veri paylaşımı yapılabilir:
                    </Text>
                    <Text style={styles.text}>• Yasal zorunluluklar</Text>
                    <Text style={styles.text}>• Hizmet sağlayıcılar (sunucu, analitik)</Text>
                    <Text style={styles.text}>• Açık rızanızın bulunması</Text>
                </Section>

                <Section title="7. KVKK Hakları">
                    <Text style={styles.text}>
                        6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:
                    </Text>
                    <Text style={styles.text}>• Kişisel verilerinizin işlenip işlenmediğini öğrenme</Text>
                    <Text style={styles.text}>• İşlenmişse buna ilişkin bilgi talep etme</Text>
                    <Text style={styles.text}>• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</Text>
                    <Text style={styles.text}>• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</Text>
                    <Text style={styles.text}>• Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</Text>
                    <Text style={styles.text}>• Verilerin silinmesini veya yok edilmesini isteme</Text>
                    <Text style={styles.text}>• Düzeltme, silme ve yok edilme işlemlerinin üçüncü kişilere bildirilmesini isteme</Text>
                    <Text style={styles.text}>• İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</Text>
                    <Text style={styles.text}>• Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</Text>
                </Section>

                <Section title="8. Çocukların Gizliliği">
                    <Text style={styles.text}>
                        Uygulamamız 18 yaş altı kullanıcılara yönelik değildir. 18 yaş altı kullanıcılardan bilerek veri toplamıyoruz.
                    </Text>
                </Section>

                <Section title="9. Değişiklikler">
                    <Text style={styles.text}>
                        Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda sizi bilgilendireceğiz.
                    </Text>
                </Section>

                <Section title="10. İletişim">
                    <Text style={styles.text}>
                        Gizlilik politikamız veya kişisel verileriniz hakkında sorularınız için:
                    </Text>
                    <Text style={styles.text}>
                        E-posta: privacy@womenswellness.app
                    </Text>
                    <Text style={styles.text}>
                        Adres: [Şirket Adresi]
                    </Text>
                </Section>
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
    });
