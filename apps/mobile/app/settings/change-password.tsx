import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const theme = useTheme();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const changePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            userService.changePassword(data.currentPassword, data.newPassword),
        onSuccess: () => {
            Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi', [
                { text: 'Tamam', onPress: () => router.back() },
            ]);
        },
        onError: (error: any) => {
            Alert.alert('Hata', error.message || 'Şifre değiştirilemedi');
        },
    });

    const handleChangePassword = () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Hata', 'Yeni şifre mevcut şifre ile aynı olamaz');
            return;
        }

        changePasswordMutation.mutate({
            currentPassword,
            newPassword,
        });
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Şifre Değiştir</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>🔒</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Güvenlik İpucu</Text>
                        <Text style={styles.infoText}>
                            Güçlü bir şifre oluşturun: En az 6 karakter, büyük-küçük harf, rakam ve özel karakter içermeli.
                        </Text>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mevcut Şifre</Text>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Mevcut şifreniz"
                        placeholderTextColor={theme.colors.textLight}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Yeni Şifre</Text>
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Yeni şifreniz (en az 6 karakter)"
                        placeholderTextColor={theme.colors.textLight}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Yeni şifrenizi tekrar girin"
                        placeholderTextColor={theme.colors.textLight}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, changePasswordMutation.isPending && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={changePasswordMutation.isPending}
                >
                    <Text style={styles.buttonText}>
                        {changePasswordMutation.isPending ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
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
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: 40,
        },
        infoCard: {
            flexDirection: 'row',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        infoIcon: {
            fontSize: 24,
            marginRight: theme.spacing.md,
        },
        infoContent: {
            flex: 1,
        },
        infoTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        infoText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },
        formGroup: {
            marginBottom: theme.spacing.md,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        input: {
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            padding: theme.spacing.md,
            fontSize: 16,
            color: theme.colors.text,
        },
        button: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: theme.spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: theme.spacing.lg,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: theme.colors.textOnPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
    });
