/**
 * PremiumBadge Component Usage Examples
 * 
 * Bu dosya PremiumBadge component'inin farklı kullanım örneklerini gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PremiumBadge } from './PremiumBadge';

export function PremiumBadgeExamples() {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Size Variants</Text>

            {/* Small Size */}
            <View style={styles.row}>
                <Text style={styles.label}>Small:</Text>
                <PremiumBadge size="small" variant="full" />
                <PremiumBadge size="small" variant="icon" />
                <PremiumBadge size="small" variant="text" />
            </View>

            {/* Medium Size */}
            <View style={styles.row}>
                <Text style={styles.label}>Medium:</Text>
                <PremiumBadge size="medium" variant="full" />
                <PremiumBadge size="medium" variant="icon" />
                <PremiumBadge size="medium" variant="text" />
            </View>

            {/* Large Size */}
            <View style={styles.row}>
                <Text style={styles.label}>Large:</Text>
                <PremiumBadge size="large" variant="full" />
                <PremiumBadge size="large" variant="icon" />
                <PremiumBadge size="large" variant="text" />
            </View>

            <Text style={styles.sectionTitle}>Usage Examples</Text>

            {/* Profile Picture Example */}
            <View style={styles.example}>
                <Text style={styles.exampleTitle}>Profile Picture Badge:</Text>
                <View style={styles.profileContainer}>
                    <View style={styles.profilePicture} />
                    <View style={styles.profileBadge}>
                        <PremiumBadge size="small" variant="icon" />
                    </View>
                </View>
            </View>

            {/* Settings Page Example */}
            <View style={styles.example}>
                <Text style={styles.exampleTitle}>Settings Header:</Text>
                <View style={styles.settingsHeader}>
                    <Text style={styles.userName}>Kullanıcı Adı</Text>
                    <PremiumBadge size="medium" variant="full" />
                </View>
            </View>

            {/* Feature Lock Example */}
            <View style={styles.example}>
                <Text style={styles.exampleTitle}>Feature Lock:</Text>
                <View style={styles.featureCard}>
                    <View style={styles.featureHeader}>
                        <Text style={styles.featureTitle}>Gelişmiş İçgörüler</Text>
                        <PremiumBadge size="small" variant="text" />
                    </View>
                    <Text style={styles.featureDescription}>
                        Premium özellik - Kişiselleştirilmiş analizler
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#FAFAFA',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 12,
        color: '#1A1A1A',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        width: 80,
        color: '#525252',
    },
    example: {
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
    },
    exampleTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        color: '#525252',
    },
    profileContainer: {
        position: 'relative',
        width: 80,
        height: 80,
    },
    profilePicture: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFB6D9',
    },
    profileBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    settingsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    featureCard: {
        padding: 12,
        backgroundColor: '#FFF0F5',
        borderRadius: 12,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    featureDescription: {
        fontSize: 14,
        color: '#525252',
    },
});
