import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Share as RNShare,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/hooks/useTheme';

interface ShareSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    shareUrl: string;
    onShareComplete?: () => void;
}

export function ShareSheet({ visible, onClose, title, shareUrl, onShareComplete }: ShareSheetProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const handleCopyLink = async () => {
        try {
            await Clipboard.setStringAsync(shareUrl);
            Alert.alert('Başarılı', 'Link kopyalandı');
            onClose();
            onShareComplete?.();
        } catch (error) {
            Alert.alert('Hata', 'Link kopyalanamadı');
        }
    };

    const handleNativeShare = async () => {
        try {
            const result = await RNShare.share({
                message: `${title}\n\n${shareUrl}`,
                url: Platform.OS === 'ios' ? shareUrl : undefined,
            });

            if (result.action === RNShare.sharedAction) {
                onClose();
                onShareComplete?.();
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleWhatsApp = async () => {
        try {
            const message = encodeURIComponent(`${title}\n\n${shareUrl}`);
            const whatsappUrl = `whatsapp://send?text=${message}`;

            // Note: In a real app, you'd use Linking.canOpenURL first
            await RNShare.share({
                message: `${title}\n\n${shareUrl}`,
            });

            onClose();
            onShareComplete?.();
        } catch (error) {
            Alert.alert('Hata', 'WhatsApp ile paylaşılamadı');
        }
    };

    const handleTwitter = async () => {
        try {
            const text = encodeURIComponent(title);
            const url = encodeURIComponent(shareUrl);
            const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

            // Use native share as fallback
            await RNShare.share({
                message: `${title}\n\n${shareUrl}`,
            });

            onClose();
            onShareComplete?.();
        } catch (error) {
            Alert.alert('Hata', 'Twitter ile paylaşılamadı');
        }
    };

    const handleFacebook = async () => {
        try {
            // Use native share as fallback
            await RNShare.share({
                message: `${title}\n\n${shareUrl}`,
                url: shareUrl,
            });

            onClose();
            onShareComplete?.();
        } catch (error) {
            Alert.alert('Hata', 'Facebook ile paylaşılamadı');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.container}>
                    <TouchableOpacity activeOpacity={1}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Paylaş</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Share Options */}
                        <View style={styles.optionsContainer}>
                            {/* Copy Link */}
                            <TouchableOpacity style={styles.option} onPress={handleCopyLink}>
                                <View style={[styles.optionIcon, { backgroundColor: '#8B5CF6' }]}>
                                    <Ionicons name="link" size={24} color="#fff" />
                                </View>
                                <Text style={styles.optionText}>Linki Kopyala</Text>
                            </TouchableOpacity>

                            {/* Native Share */}
                            <TouchableOpacity style={styles.option} onPress={handleNativeShare}>
                                <View style={[styles.optionIcon, { backgroundColor: '#3B82F6' }]}>
                                    <Ionicons name="share-social" size={24} color="#fff" />
                                </View>
                                <Text style={styles.optionText}>Paylaş</Text>
                            </TouchableOpacity>

                            {/* WhatsApp */}
                            <TouchableOpacity style={styles.option} onPress={handleWhatsApp}>
                                <View style={[styles.optionIcon, { backgroundColor: '#25D366' }]}>
                                    <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                                </View>
                                <Text style={styles.optionText}>WhatsApp</Text>
                            </TouchableOpacity>

                            {/* Twitter */}
                            <TouchableOpacity style={styles.option} onPress={handleTwitter}>
                                <View style={[styles.optionIcon, { backgroundColor: '#1DA1F2' }]}>
                                    <Ionicons name="logo-twitter" size={24} color="#fff" />
                                </View>
                                <Text style={styles.optionText}>Twitter</Text>
                            </TouchableOpacity>

                            {/* Facebook */}
                            <TouchableOpacity style={styles.option} onPress={handleFacebook}>
                                <View style={[styles.optionIcon, { backgroundColor: '#1877F2' }]}>
                                    <Ionicons name="logo-facebook" size={24} color="#fff" />
                                </View>
                                <Text style={styles.optionText}>Facebook</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Preview */}
                        <View style={styles.preview}>
                            <Text style={styles.previewTitle} numberOfLines={2}>
                                {title}
                            </Text>
                            <Text style={styles.previewUrl} numberOfLines={1}>
                                {shareUrl}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: theme.colors.backgroundCard,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
        },
        closeButton: {
            padding: theme.spacing.xs,
        },
        optionsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: theme.spacing.xl,
            paddingBottom: theme.spacing.lg,
        },
        option: {
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        optionIcon: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
        },
        optionText: {
            fontSize: 12,
            fontWeight: '500',
            color: theme.colors.text,
            textAlign: 'center',
        },
        preview: {
            padding: theme.spacing.lg,
            paddingTop: 0,
        },
        previewTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        previewUrl: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
    });
