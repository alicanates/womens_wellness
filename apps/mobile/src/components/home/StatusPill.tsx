import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface StatusPillProps {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  onPress?: () => void;
}

export function StatusPill({ icon, title, value, subtitle, onPress }: StatusPillProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.backgroundCard,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 140,
      marginRight: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    icon: {
      fontSize: 16,
      marginRight: 6,
    },
    title: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    value: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
  });
