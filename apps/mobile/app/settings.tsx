import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Switch,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { userService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 50;

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { isDarkMode, setDarkMode } = useThemeStore();
  const theme = useTheme();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [heightCm, setHeightCm] = useState(165);
  const [weightKg, setWeightKg] = useState(60);
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userService.getMe(),
  });

  // Sync local state with query data
  useEffect(() => {
    if (userData) {
      const data = userData as any;
      setDisplayName(data?.profile?.displayName || '');
      if (data?.profile?.birthYear) {
        // If we have birthYear, create a date from it (January 1st of that year)
        setBirthDate(new Date(data.profile.birthYear, 0, 1));
      }
      setHeightCm(data?.profile?.heightCm || 165);
      setWeightKg(data?.profile?.weightKg || 60);
      if (data?.profile?.profilePictureUrl) {
        setProfilePictureUri(data.profile.profilePictureUrl);
      }
    }
  }, [userData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => userService.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditingProfile(false);
      Alert.alert('Başarılı', 'Profil güncellendi');
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
        // Upload image to server
        const response = await userService.uploadProfilePicture(localUri);
        setProfilePictureUri(response.profilePictureUrl);
        queryClient.invalidateQueries({ queryKey: ['me'] });
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
        // Upload image to server
        const response = await userService.uploadProfilePicture(localUri);
        setProfilePictureUri(response.profilePictureUrl);
        queryClient.invalidateQueries({ queryKey: ['me'] });
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
              // Delete from server by setting to null
              await userService.updateMe({ profilePictureUrl: null });
              setProfilePictureUri(null);
              queryClient.invalidateQueries({ queryKey: ['me'] });
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

  const handleSaveProfile = () => {
    const profileData: any = {
      displayName: displayName || undefined,
      birthYear: birthDate ? birthDate.getFullYear() : undefined,
      heightCm: heightCm,
      weightKg: weightKg,
    };

    updateProfileMutation.mutate(profileData);
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/signin');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Bilgi', 'Hesap silme özelliği yakında eklenecek');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentDisplayName = (userData as any)?.profile?.displayName || user?.email?.split('@')[0] || 'Misafir';

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil</Text>

          {/* Profile Picture */}
          <View style={styles.profilePictureSection}>
            <TouchableOpacity onPress={handleProfilePicturePress}>
              {profilePictureUri ? (
                <Image source={{ uri: profilePictureUri }} style={styles.profileImageLarge} />
              ) : (
                <View style={styles.profilePlaceholderLarge}>
                  <Text style={styles.profilePlaceholderTextLarge}>
                    {currentDisplayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProfilePicturePress} style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={isEditingProfile ? displayName : currentDisplayName}
              onChangeText={setDisplayName}
              placeholder="Ad Soyad"
              placeholderTextColor={theme.colors.textLight}
              editable={isEditingProfile}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email || ''}
              placeholderTextColor={theme.colors.textLight}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Doğum Tarihi</Text>
            {isEditingProfile ? (
              <DatePickerButton value={birthDate} onChange={setBirthDate} theme={theme} />
            ) : (
              <TextInput
                style={styles.input}
                value={birthDate ? birthDate.toLocaleDateString('tr-TR') : ''}
                placeholderTextColor={theme.colors.textLight}
                editable={false}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Boy (cm)</Text>
            {isEditingProfile ? (
              <NumberPickerButton
                value={heightCm}
                onChange={setHeightCm}
                min={100}
                max={250}
                label="Boy Seçin"
                theme={theme}
              />
            ) : (
              <TextInput
                style={styles.input}
                value={`${heightCm} cm`}
                placeholderTextColor={theme.colors.textLight}
                editable={false}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kilo (kg)</Text>
            {isEditingProfile ? (
              <NumberPickerButton
                value={weightKg}
                onChange={setWeightKg}
                min={30}
                max={200}
                label="Kilo Seçin"
                theme={theme}
              />
            ) : (
              <TextInput
                style={styles.input}
                value={`${weightKg} kg`}
                placeholderTextColor={theme.colors.textLight}
                editable={false}
              />
            )}
          </View>

          {isEditingProfile ? (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setIsEditingProfile(false);
                  // Reset values
                  setDisplayName((userData as any)?.profile?.displayName || '');
                  if ((userData as any)?.profile?.birthYear) {
                    setBirthDate(new Date((userData as any).profile.birthYear, 0, 1));
                  }
                  setHeightCm((userData as any)?.profile?.heightCm || 165);
                  setWeightKg((userData as any)?.profile?.weightKg || 60);
                }}
              >
                <Text style={styles.secondaryButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                <Text style={styles.primaryButtonText}>
                  {updateProfileMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setIsEditingProfile(true)}
            >
              <Text style={styles.primaryButtonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Koyu Tema</Text>
              <Text style={styles.settingDescription}>Karanlık modu etkinleştir</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
            />
          </View>
        </View>

        {/* Privacy & Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gizlilik ve Veri</Text>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Gizlilik Politikası</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Kullanım Koşulları</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Verilerimi İndir</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Women's Wellness Companion</Text>
          <Text style={styles.appInfoText}>Versiyon 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Date Picker Component
function DatePickerButton({ value, onChange, theme }: { value: Date | null; onChange: (date: Date) => void; theme: any }) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(value?.getDate() || 1);
  const [selectedMonth, setSelectedMonth] = useState(value?.getMonth() || 0);
  const [selectedYear, setSelectedYear] = useState(value?.getFullYear() || new Date().getFullYear() - 25);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 0, label: 'Ocak' },
    { value: 1, label: 'Şubat' },
    { value: 2, label: 'Mart' },
    { value: 3, label: 'Nisan' },
    { value: 4, label: 'Mayıs' },
    { value: 5, label: 'Haziran' },
    { value: 6, label: 'Temmuz' },
    { value: 7, label: 'Ağustos' },
    { value: 8, label: 'Eylül' },
    { value: 9, label: 'Ekim' },
    { value: 10, label: 'Kasım' },
    { value: 11, label: 'Aralık' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (showPicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [showPicker]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowPicker(false));
  };

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
    handleClose();
  };

  const displayText = value
    ? value.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Doğum tarihi seçin';

  const styles = createPickerStyles(theme);

  return (
    <>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.pickerButtonText}>{displayText}</Text>
        <Text style={styles.pickerButtonIcon}>📅</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
          <Animated.View style={[styles.pickerContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Doğum Tarihi</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmText}>Tamam</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.wheelContainer}>
              <ScrollPicker
                items={days}
                selectedValue={selectedDay}
                onValueChange={setSelectedDay}
                formatter={(val) => String(val)}
                theme={theme}
              />
              <ScrollPicker
                items={months.map(m => m.value)}
                selectedValue={selectedMonth}
                onValueChange={setSelectedMonth}
                formatter={(val) => months[val].label.substring(0, 3)}
                theme={theme}
              />
              <ScrollPicker
                items={years}
                selectedValue={selectedYear}
                onValueChange={setSelectedYear}
                formatter={(val) => String(val)}
                theme={theme}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
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

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    if (showPicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [showPicker]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowPicker(false));
  };

  const handleConfirm = () => {
    onChange(selectedValue);
    handleClose();
  };

  const styles = createPickerStyles(theme);

  return (
    <>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.pickerButtonText}>{value}</Text>
        <Text style={styles.pickerButtonIcon}>▼</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
          <Animated.View style={[styles.pickerContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>{label}</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.confirmText}>Tamam</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.wheelContainerSingle}>
              <ScrollPicker
                items={numbers}
                selectedValue={selectedValue}
                onValueChange={setSelectedValue}
                formatter={(val) => String(val)}
                theme={theme}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// Reusable Scroll Picker
function ScrollPicker({
  items,
  selectedValue,
  onValueChange,
  formatter = (val) => String(val),
  theme,
}: {
  items: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  formatter?: (value: number) => string;
  theme: any;
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && scrollViewRef.current) {
      setTimeout(() => {
        const index = items.indexOf(selectedValue);
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
        setInitialized(true);
      }, 100);
    }
  }, [initialized, selectedValue, items]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < items.length && items[index] !== selectedValue) {
      onValueChange(items[index]);
    }
  };

  const styles = createScrollPickerStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.highlight} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item) => (
          <View key={item} style={styles.item}>
            <Text style={[styles.itemText, item === selectedValue && styles.itemTextSelected]}>
              {formatter(item)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createScrollPickerStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      height: ITEM_HEIGHT * 5,
      width: 80,
      position: 'relative',
    },
    highlight: {
      position: 'absolute',
      top: ITEM_HEIGHT * 2,
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      backgroundColor: theme.colors.overlay,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary + '50',
    },
    item: {
      height: ITEM_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemText: {
      fontSize: 20,
      color: theme.colors.textSecondary,
    },
    itemTextSelected: {
      fontSize: 24,
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });

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
    wheelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: ITEM_HEIGHT * 5,
      paddingVertical: 20,
      gap: 10,
    },
    wheelContainerSingle: {
      alignItems: 'center',
      justifyContent: 'center',
      height: ITEM_HEIGHT * 5,
      paddingVertical: 20,
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
    headerRight: {
      width: 40,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 40,
    },
    section: {
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    profilePictureSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    profileImageLarge: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    profilePlaceholderLarge: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    profilePlaceholderTextLarge: {
      color: theme.colors.textOnPrimary,
      fontSize: 48,
      fontWeight: '700',
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
    inputDisabled: {
      opacity: 0.6,
      color: theme.colors.textSecondary,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    button: {
      borderRadius: 12,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    settingButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    settingButtonValue: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    settingButtonIcon: {
      fontSize: 24,
      color: theme.colors.textSecondary,
    },
    logoutButton: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    logoutButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    deleteButton: {
      backgroundColor: '#fee',
      borderWidth: 1,
      borderColor: '#fcc',
    },
    deleteButtonText: {
      color: '#c00',
      fontSize: 16,
      fontWeight: '700',
    },
    appInfo: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    appInfoText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginVertical: 2,
    },
  });
