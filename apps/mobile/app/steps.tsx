import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { stepsService, type StepsTodayResponse, type StepsStatsResponse } from '../src/services/api';
import { usePedometer } from '../src/hooks/usePedometer';

export default function StepsScreen() {
    const queryClient = useQueryClient();
    const [manualSteps, setManualSteps] = useState('');
    const { isPedometerAvailable, totalSteps } = usePedometer();

    // Get today's total
    const { data: todayData } = useQuery<StepsTodayResponse>({
        queryKey: ['stepsToday'],
        queryFn: () => stepsService.getTodayTotal(),
    });

    // Get stats
    const { data: statsData } = useQuery<StepsStatsResponse>({
        queryKey: ['stepsStats'],
        queryFn: () => stepsService.getStats(7),
    });

    // Add steps mutation
    const addStepsMutation = useMutation({
        mutationFn: (data: { steps: number; source: 'manual' | 'pedometer' }) =>
            stepsService.logSteps(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stepsToday'] });
            queryClient.invalidateQueries({ queryKey: ['stepsStats'] });
            queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
            setManualSteps('');
            Alert.alert('Başarılı', 'Adımlar eklendi!');
        },
        onError: () => {
            Alert.alert('Hata', 'Adımlar eklenirken bir hata oluştu');
        },
    });

    const handleManualAdd = () => {
        const steps = parseInt(manualSteps);
        if (isNaN(steps) || steps <= 0) {
            Alert.alert('Hata', 'Geçerli bir adım sayısı girin');
            return;
        }
        addStepsMutation.mutate({ steps, source: 'manual' });
    };

    const handleSyncPedometer = () => {
        if (!isPedometerAvailable) {
            Alert.alert('Uyarı', 'Pedometer bu cihazda kullanılamıyor');
            return;
        }
        if (totalSteps > 0) {
            addStepsMutation.mutate({ steps: totalSteps, source: 'pedometer' });
        }
    };

    const goalSteps = 10000;
    const currentTotal = todayData?.totalSteps || 0;
    const progress = Math.min((currentTotal / goalSteps) * 100, 100);

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Adım Sayacı',
                    headerShown: true,
                }}
            />
            <ScrollView style={styles.container}>
                {/* Today's Progress */}
                <View style={styles.card}>
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressNumber}>{currentTotal}</Text>
                        <Text style={styles.progressLabel}>adım</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.goalText}>
                        Hedef: {goalSteps} adım ({Math.round(progress)}%)
                    </Text>
                </View>

                {/* Pedometer Section */}
                {isPedometerAvailable && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="walk" size={24} color="#007AFF" />
                            <Text style={styles.cardTitle}>Otomatik Sayım</Text>
                        </View>
                        <Text style={styles.pedometerSteps}>
                            Bugün: {totalSteps} adım
                        </Text>
                        <TouchableOpacity
                            style={styles.syncButton}
                            onPress={handleSyncPedometer}
                            disabled={addStepsMutation.isPending || totalSteps === 0}
                        >
                            <Ionicons name="sync" size={20} color="#fff" />
                            <Text style={styles.syncButtonText}>Senkronize Et</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Manual Entry */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="create" size={24} color="#007AFF" />
                        <Text style={styles.cardTitle}>Manuel Ekle</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Adım sayısı girin"
                        keyboardType="number-pad"
                        value={manualSteps}
                        onChangeText={setManualSteps}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleManualAdd}
                        disabled={addStepsMutation.isPending || !manualSteps}
                    >
                        <Text style={styles.addButtonText}>Ekle</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                {statsData && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Son 7 Gün İstatistikleri</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Toplam:</Text>
                            <Text style={styles.statValue}>{statsData.totalSteps} adım</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Ortalama:</Text>
                            <Text style={styles.statValue}>{statsData.avgSteps} adım/gün</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    progressCircle: {
        alignItems: 'center',
        marginVertical: 20,
    },
    progressNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    progressLabel: {
        fontSize: 16,
        color: '#666',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
    },
    goalText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },
    pedometerSteps: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginVertical: 12,
    },
    syncButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#34C759',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statLabel: {
        fontSize: 16,
        color: '#666',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
