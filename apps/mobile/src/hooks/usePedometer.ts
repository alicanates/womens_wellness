import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

interface UsePedometerReturn {
    isPedometerAvailable: boolean;
    currentStepCount: number;
    pastStepCount: number;
    totalSteps: number;
}

export function usePedometer(): UsePedometerReturn {
    const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [pastStepCount, setPastStepCount] = useState(0);

    useEffect(() => {
        // Check if pedometer is available
        const checkAvailability = async () => {
            const available = await Pedometer.isAvailableAsync();
            setIsPedometerAvailable(available);
        };

        checkAvailability();
    }, []);

    useEffect(() => {
        if (!isPedometerAvailable) return;

        // Subscribe to pedometer updates
        const subscription = Pedometer.watchStepCount((result) => {
            setCurrentStepCount(result.steps);
        });

        // Get today's step count
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        Pedometer.getStepCountAsync(start, end).then(
            (result) => {
                setPastStepCount(result.steps);
            },
            (error) => {
                console.error('Could not get step count:', error);
            }
        );

        return () => {
            subscription && subscription.remove();
        };
    }, [isPedometerAvailable]);

    return {
        isPedometerAvailable,
        currentStepCount,
        pastStepCount,
        totalSteps: pastStepCount + currentStepCount,
    };
}
