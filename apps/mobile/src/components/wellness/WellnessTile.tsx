import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface WellnessTileProps {
  icon: string;
  title: string;
  subtitle?: string;
  value: string;
  target?: string;
  percentage?: number;
  onPress?: () => void;
  actions?: React.ReactNode;
  emptyState?: string;
  isEmpty?: boolean;
}

export const WellnessTile: React.FC<WellnessTileProps> = ({
  icon,
  title,
  subtitle,
  value,
  target,
  percentage,
  onPress,
  actions,
  emptyState,
  isEmpty = false,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyState}</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Progress Bar */}
          {percentage !== undefined && percentage >= 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor:
                        percentage >= 100
                          ? theme.colors.success
                          : percentage >= 50
                          ? theme.colors.primary
                          : theme.colors.warning,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Value Display */}
          <View style={styles.valueRow}>
            <Text style={styles.value}>{value}</Text>
            {target && <Text style={styles.target}>{target}</Text>}
          </View>

          {/* Actions */}
          {actions && <View style={styles.actions}>{actions}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    tile: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 16,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 160,
      flex: 1,
    },
    header: {
      marginBottom: theme.spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
    },
    progressContainer: {
      marginBottom: theme.spacing.sm,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    valueRow: {
      marginBottom: theme.spacing.xs,
    },
    value: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    target: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    actions: {
      marginTop: theme.spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    emptyText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
