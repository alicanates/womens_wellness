import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function CommunityLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Topluluk',
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: 'Soru Detayı',
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name="ask"
                options={{
                    title: 'Soru Sor',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="my-questions"
                options={{
                    title: 'Sorularım',
                }}
            />
            <Stack.Screen
                name="my-answers"
                options={{
                    title: 'Cevaplarım',
                }}
            />
            <Stack.Screen
                name="favorites"
                options={{
                    title: 'Favorilerim',
                }}
            />
            <Stack.Screen
                name="following"
                options={{
                    title: 'Takip Ettiklerim',
                }}
            />
        </Stack>
    );
}
