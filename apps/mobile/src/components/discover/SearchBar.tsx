import { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    autoFocus?: boolean;
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Makale ara...',
    debounceMs = 300,
    autoFocus = false,
}: SearchBarProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const [localValue, setLocalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const focusAnim = useRef(new Animated.Value(0)).current;

    // Sync external value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounced onChange
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [localValue, debounceMs]);

    // Focus animation
    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.border, theme.colors.primary],
    });

    return (
        <Animated.View style={[styles.container, { borderColor }]}>
            <Ionicons
                name="search"
                size={20}
                color={isFocused ? theme.colors.primary : theme.colors.textLight}
                style={styles.searchIcon}
            />
            <TextInput
                style={styles.input}
                value={localValue}
                onChangeText={setLocalValue}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textLight}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus={autoFocus}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
            {localValue.length > 0 && (
                <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name="close-circle"
                        size={20}
                        color={theme.colors.textLight}
                    />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderWidth: 2,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        searchIcon: {
            marginRight: theme.spacing.sm,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.text,
            paddingVertical: 4,
        },
        clearButton: {
            marginLeft: theme.spacing.sm,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
