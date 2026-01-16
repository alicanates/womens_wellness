import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { userService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { usePremium } from '@/hooks/usePremium';

export default function ProfileScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const theme = useTheme();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [heightCm, setHeightCm] = useState(165);
    const [weightKg, setWeightKg] = useState(60);
    const [profilePictureUri, setProfilePictureUri] = useState<string | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    const { isPremium } = usePremium();

    const { data: userData, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => userService.getMe(),
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (userData) {
            const data = userData as any;
            setFirstName(data?.profile?.firstName || '');
            setLastName(data?.profile?.lastName || '');
            setUsername(data?.username || '');
            setEmail(data?.email || '');
            if (data?.profile?.dateOfBirth) {
                setBirthDate(new Date(data.profile.dateOfBirth));
            }
            setHeightCm(data?.profile?.heightCm || 165);
            setWeightKg(data?.profile?.weightKg || 60);
            setProfilePictureUri(data?.profile?.profilePictureUrl || null);
        }
    }, [userData]);

    useEffect(() => {
        const currentUsername = (userData as any)?.username;
        if (!username || username.toLowerCase() === currentUsername?.toLowerCase() || username.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setCheckingUsername(true);
            try {
                const response = await userService.checkUsernameAvailability(username.toLowerCase());
                setUsernameAvailable((response as any).available);
            } catch (error) {
                setUsernameAvailable(null);
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username, userData]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => userService.updateMe(data),
        onSuccess: async (updatedData) => {
            queryClient.setQueryData(['me'], updatedData);
            await queryClient.invalidateQueries({ queryKey: ['me'] });
            await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });

            if (user && updatedData) {
                const updatedUser = {
                    ...user,
                    email: (updatedData as any).email,
                    username: (updatedData as any).username,
                    profile: (updatedData as any).profile,
                };
                useAuthStore.setState({ user: updatedUser });
                await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
            }
            Alert.alert('Başarılı', 'Profil güncellendi');
            router.back();
        },
        onError: (error: any) => {
            Alert.alert('Hata', error.message || 'Profil güncellenemedi');
        },
    });

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('İzin Gerekli', 'Profil fotoğrafı eklemek için galeriye erişim izni gerekiyor');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const localUri = result.assets[0].uri;
            setProfilePictureUri(localUri);

            try {
                const response = await userService.uploadProfilePicture(localUri);
                setProfilePictureUri(response.profilePictureUrl);
                await queryClient.invalidateQueries({ queryKey: ['me'] });
                await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });

                if (user && user.profile) {
                    const updatedUser = {
                        ...user,
                        profile: { ...user.profile, profilePictureUrl: response.profilePictureUrl },
                    };
                    useAuthStore.setState({ user: updatedUser });
                    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
                }
                Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi');
            } catch (error: any) {
                Alert.alert('Hata', error.message || 'Fotoğraf yüklenemedi');
                setProfilePictureUri((userData as any)?.profile?.profilePictureUrl || null);
            }
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekiyor');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const localUri = result.assets[0].uri;
            setProfilePictureUri(localUri);

            try {
                const response = await userService.uploadProfilePicture(localUri);
                setProfilePictureUri(response.profilePictureUrl);
                await queryClient.invalidateQueries({ queryKey: ['me'] });
                await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });

                if (user && user.profile) {
                    const updatedUser = {
                        ...user,
                        profile: { ...user.profile, profilePictureUrl: response.profilePictureUrl },
                    };
                    useAuthStore.setState({ user: updatedUser });
                    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
                }
                Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi');
            } catch (error: any) {
                Alert.alert('Hata', error.message || 'Fotoğraf yüklenemedi');
                setProfilePictureUri((userData as any)?.profile?.profilePictureUrl || null);
            }
        }
    };

    const deleteProfilePicture = () => {
        Alert.alert(
            'Profil Fotoğrafını Sil',
            'Profil fotoğrafınızı silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.updateMe({ profilePictureUrl: null });
                            setProfilePictureUri(null);
                            await queryClient.invalidateQueries({ queryKey: ['me'] });
                            await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });

                            if (user && user.profile) {
                                const updatedUser = {
                                    ...user,
                                    profile: { ...user.profile, profilePictureUrl: undefined },
                                };
                                useAuthStore.setState({ user: updatedUser });
                                await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
                            }
                            Alert.alert('Başarılı', 'Profil fotoğrafı silindi');
                        } catch (error: any) {
                            Alert.alert('Hata', error.message || 'Fotoğraf silinemedi');
                        }
                    },
                },
            ]
        );
    };

    const handleProfilePicturePress = () => {
        Alert.alert(
            'Profil Fotoğrafı',
            'Profil fotoğrafınızı nasıl güncellemek istersiniz?',
            [
                { text: 'Galeriden Seç', onPress: pickImage },
                { text: 'Fotoğraf Çek', onPress: takePhoto },
                ...(profilePictureUri
                    ? [{ text: 'Fotoğrafı Sil', onPress: deleteProfilePicture, style: 'destructive' as const }]
                    : []),
                { text: 'İptal', style: 'cancel' },
            ]
        );
    };

    const handleSaveProfile = async () => {
        try {
            const currentUsername = (userData as any)?.username;
            if (username && username.toLowerCase() !== currentUsername?.toLowerCase()) {
                if (usernameAvailable === false) {
                    Alert.alert('Hata', 'Bu kullanıcı adı zaten kullanılıyor');
                    return;
                }

                const normalizedUsername = username.toLowerCase();
                if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
                    Alert.alert('Hata', 'Kullanıcı adı sadece küçük harf, rakam, nokta ve alt çizgi içerebilir');
                    return;
                }
                if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
                    Alert.alert('Hata', 'Kullanıcı adı 3-24 karakter arasında olmalıdır');
                    return;
                }

                const usernameResponse = await userService.updateUsername(normalizedUsername);
                queryClient.setQueryData(['me'], usernameResponse);
                await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });

                if (user) {
                    const updatedUser = {
                        ...user,
                        username: (usernameResponse as any).username,
                        profile: (usernameResponse as any).profile,
                    };
                    useAuthStore.setState({ user: updatedUser });
                    await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
                }
            }

            const profileData: any = {
                firstName,
                lastName,
                email,
                dateOfBirth: birthDate ? birthDate.toISOString() : null,
                heightCm,
                weightKg,
            };

            updateProfileMutation.mutate(profileData);
        } catch (error: any) {
            Alert.alert('Hata', error.message || 'Profil güncellenemedi');
        }
    };

    const currentDisplayName = (userData as any)?.profile?.displayName || user?.email?.split('@')[0] || 'Misafir';
    const styles = createStyles(theme);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profil Düzenle</Text>
                <TouchableOpacity
                    onPress={handleSaveProfile}
                    disabled={updateProfileMutation.isPending || usernameAvailable === false || checkingUsername}
                >
                    <Text style={[styles.saveText, (updateProfileMutation.isPending || usernameAvailable === false || checkingUsername) && styles.saveTextDisabled]}>
                        {updateProfileMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Profile Picture */}
                <View style={styles.profilePictureSection}>
                    <TouchableOpacity onPress={handleProfilePicturePress}>
                        <View style={styles.profileImageContainer}>
                            {profilePictureUri ? (
                                <Image source={{ uri: profilePictureUri }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.profilePlaceholder}>
                                    <Text style={styles.profilePlaceholderText}>
                                        {currentDisplayName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            {isPremium && (
                                <View style={styles.premiumBadgeOverlay}>
                                    <PremiumBadge size="small" variant="icon" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleProfilePicturePress} style={styles.changePhotoButton}>
                        <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Form */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Ad</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Adınız"
                        placeholderTextColor={theme.colors.textLight}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Soyad</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Soyadınız"
                        placeholderTextColor={theme.colors.textLight}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Kullanıcı Adı</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="kullaniciadi"
                        placeholderTextColor={theme.colors.textLight}
                        autoCapitalize="none"
                    />
                    {username && username.toLowerCase() !== (userData as any)?.username?.toLowerCase() && (
                        <>
                            {checkingUsername && <Text style={styles.helperText}>Kontrol ediliyor...</Text>}
                            {!checkingUsername && usernameAvailable === true && <Text style={styles.successText}>✓ Kullanılabilir</Text>}
                            {!checkingUsername && usernameAvailable === false && <Text style={styles.errorText}>✗ Bu kullanıcı adı alınmış</Text>}
                        </>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>E-posta</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="E-posta adresiniz"
                        placeholderTextColor={theme.colors.textLight}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Doğum Tarihi</Text>
                    <DatePickerButton value={birthDate} onChange={setBirthDate} theme={theme} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Boy (cm)</Text>
                    <NumberPickerButton
                        value={heightCm}
                        onChange={setHeightCm}
                        min={100}
                        max={250}
                        label="Boy Seçin"
                        theme={theme}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Kilo (kg)</Text>
                    <NumberPickerButton
                        value={weightKg}
                        onChange={setWeightKg}
                        min={30}
                        max={200}
                        label="Kilo Seçin"
                        theme={theme}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Date Picker Component
function DatePickerButton({ value, onChange, theme }: { value: Date | null; onChange: (date: Date) => void; theme: any }) {
    const { isDarkMode } = useThemeStore();
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState(value || new Date(2000, 0, 1));

    useEffect(() => {
        if (value) setTempDate(value);
    }, [value]);

    const displayText = value
        ? value.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Doğum tarihi seçin';

    const styles = createPickerStyles(theme);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            if (event.type === 'set' && selectedDate) onChange(selectedDate);
        } else {
            if (selectedDate) setTempDate(selectedDate);
        }
    };

    const handleIOSConfirm = () => {
        onChange(tempDate);
        setShowPicker(false);
    };

    return (
        <>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker(true)}>
                <Text style={styles.pickerButtonText}>{displayText}</Text>
                <Text style={styles.pickerButtonIcon}>📅</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && showPicker && (
                <Modal visible={showPicker} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowPicker(false)} />
                        <View style={styles.pickerContainer}>
                            <View style={styles.pickerHeader}>
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text style={styles.cancelText}>İptal</Text>
                                </TouchableOpacity>
                                <Text style={styles.pickerTitle}>Doğum Tarihi</Text>
                                <TouchableOpacity onPress={handleIOSConfirm}>
                                    <Text style={styles.confirmText}>Tamam</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.datePickerWrapper}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="inline"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    minimumDate={new Date(1900, 0, 1)}
                                    locale="tr-TR"
                                    themeVariant={isDarkMode ? 'dark' : 'light'}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="calendar"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                />
            )}
        </>
    );
}

// Number Picker Component
function NumberPickerButton({ value, onChange, min, max, label, theme }: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    label: string;
    theme: any;
}) {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);

    const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    const handleConfirm = () => {
        onChange(selectedValue);
        setShowPicker(false);
    };

    const styles = createPickerStyles(theme);

    return (
        <>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker(true)}>
                <Text style={styles.pickerButtonText}>{value}</Text>
                <Text style={styles.pickerButtonIcon}>▼</Text>
            </TouchableOpacity>

            <Modal visible={showPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowPicker(false)} />
                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Text style={styles.cancelText}>İptal</Text>
                            </TouchableOpacity>
                            <Text style={styles.pickerTitle}>{label}</Text>
                            <TouchableOpacity onPress={handleConfirm}>
                                <Text style={styles.confirmText}>Tamam</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.numberPickerScroll} contentContainerStyle={styles.numberPickerContent}>
                            {numbers.map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[styles.numberItem, selectedValue === num && styles.numberItemSelected]}
                                    onPress={() => setSelectedValue(num)}
                                >
                                    <Text style={[styles.numberText, selectedValue === num && styles.numberTextSelected]}>
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const createPickerStyles = (theme: any) =>
    StyleSheet.create({
        pickerButton: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            padding: 14,
        },
        pickerButtonText: {
            fontSize: 16,
            color: theme.colors.text,
        },
        pickerButtonIcon: {
            fontSize: 18,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        backdrop: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
        pickerContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        },
        pickerHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        pickerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
        },
        cancelText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        confirmText: {
            fontSize: 16,
            color: theme.colors.primary,
            fontWeight: '700',
        },
        datePickerWrapper: {
            alignItems: 'center',
            paddingVertical: 10,
        },
        numberPickerScroll: {
            maxHeight: 300,
        },
        numberPickerContent: {
            paddingVertical: 10,
        },
        numberItem: {
            paddingVertical: 12,
            paddingHorizontal: 20,
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        numberItemSelected: {
            backgroundColor: theme.colors.overlay,
        },
        numberText: {
            fontSize: 18,
            color: theme.colors.text,
        },
        numberTextSelected: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.primary,
        },
    });

const createStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
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
        saveText: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.primary,
        },
        saveTextDisabled: {
            opacity: 0.5,
        },
        container: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: 40,
        },
        profilePictureSection: {
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
        },
        profileImageContainer: {
            position: 'relative',
        },
        profileImage: {
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 3,
            borderColor: theme.colors.primary,
        },
        profilePlaceholder: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: theme.colors.primary,
        },
        profilePlaceholderText: {
            color: theme.colors.textOnPrimary,
            fontSize: 48,
            fontWeight: '700',
        },
        premiumBadgeOverlay: {
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        },
        changePhotoButton: {
            marginTop: theme.spacing.md,
        },
        changePhotoText: {
            color: theme.colors.primary,
            fontSize: 16,
            fontWeight: '600',
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
        helperText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        successText: {
            fontSize: 12,
            color: theme.colors.success || '#10b981',
            marginTop: 4,
        },
        errorText: {
            fontSize: 12,
            color: theme.colors.error || '#ef4444',
            marginTop: 4,
        },
    });
